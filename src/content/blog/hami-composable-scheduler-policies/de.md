---
title: >-
  HAMi 2.10 Deep Dive (Teil 3): Exklusiv, Binpack und NUMA-Aligned — Scheduling-Policies sind jetzt kombinierbar
linktitle: HAMi kombinierbare Scheduling-Policies
date: '2026-08-26'
excerpt: >-
  Inferenz-Replikas wollen enges Binpacking, Multi-GPU-Pods dieselbe NUMA-Node für Bandbreite,
  latenzsensitive Workloads eine ganze GPU — drei Policies in einem Satz, früher musste man nur
  eine wählen. Im dritten Artikel unserer HAMi-2.10-Serie erklären wir das Filter-then-Sort-Modell
  und verifizieren jeden Schritt mit einem realen Auswahlpfad über vier T4s.
author: Jimmy Song
tags:
  - HAMi
  - GPU-Sharing
  - Scheduling
  - Kubernetes
  - binpack
  - NUMA
category: Technical Deep Dive
coverTitle: HAMi 2.10 Deep Dive (Teil 3)
---

> Inferenz-Replikas wollen enges Binpacking, Multi-GPU-Pods dieselbe NUMA-Node für Bandbreite, latenzsensitive Workloads eine ganze GPU — drei Policies in einem Satz, früher musste man nur eine wählen. Im dritten Artikel unserer HAMi-2.10-Serie erklären wir das Filter-then-Sort-Modell und verifizieren jeden Schritt mit einem realen Auswahlpfad über vier T4s.

Die [ersten beiden Artikel](/blog/kai-scheduler-hami-gpu-memory-hard-isolation) dieser Serie behandeln HAMis Integration externer Scheduler: KAI Scheduler für NVIDIA-GPUs ([Teil 1](/blog/kai-scheduler-hami-gpu-memory-hard-isolation)) und Volcano für Ascend NPUs ([Teil 2](/blog/volcano-ascend-vnpu-soft-slicing)). Dieser Artikel kehrt zum eigenen HAMi-Scheduler zurück für ein leicht übersehenes, aber sehr praktisches v2.10.0-Feature: **kombinierbare Scheduling-Policies**.

HAMi bietet seit Langem pro-Pod-GPU-Scheduling-Policies über die Annotation `hami.io/gpu-scheduler-policy`: `binpack` stapelt Workloads auf weniger Karten, `spread` verteilt sie, und neu in v2.10.0 verlangt `mutex` eine Karte für sich allein. Vor v2.10.0 akzeptierte die Annotation nur **einen** Wert.

Reale Cluster brauchen selten nur ein Verhalten. Eine typische Produktions-Wunschliste: Inferenz-Replikas sollen eng binpacken, um ganze Karten frei zu lassen; alle GPUs eines Pods sollen auf derselben NUMA-Node für Bandbreite landen; die latenzsensitive Batch will einige Karten ganz für sich. Drei Policies in einem Satz. Vor v2.10.0 wählte man eine und verzichtete auf den Rest.

v2.10.0 vervollständigt das Puzzle: `hami.io/gpu-scheduler-policy` akzeptiert jetzt eine **geordnete, kommagetrennte Liste**, und Filter- und Scoring-Policies können kombiniert werden (PR #2621 von @mesutoezdil, schließt Issue #2010):

```yaml
# Zuerst exklusive GPU, dann binpack, NUMA als Tiebreaker
metadata:
  annotations:
    hami.io/gpu-scheduler-policy: "mutex,binpack,numa"
```

## Zwei Policy-Arten: Filter und Sort Keys

Der Schlüssel zum Verständnis: HAMis GPU-Policies waren nie dieselbe Art — sie spielen zwei Rollen:

| Policy | Rolle | Wirkung |
|-|-|-|
| `mutex` | **Filter** | Nur Karten ohne Workloads sind Kandidaten; jede belegte Karte wird entfernt |
| `topology-aware` | **Filter** (nur NVIDIA) | Behält nur Karten, deren NVLink/NVSwitch-Topologie der Multi-GPU-Anfrage genügt; erfordert topology-aware Scheduling |
| `binpack` | **Sort key** | Bevorzugt die am stärksten ausgelastete qualifizierte Karte, konzentriert Workloads |
| `spread` | **Sort key** | Bevorzugt die am wenigsten ausgelastete Karte, verteilt Workloads |
| `numa` | **Sort key** | Bevorzugt Karten auf niedriger nummerierten NUMA-Nodes, verbessert Locality |

Ein Filter beantwortet Ja/Nein pro Karte: darf diese Karte überhaupt mitmachen? Ein Sort Key beantwortet Rang: wer kommt unter den Qualifizierten zuerst? Die Rollen widersprechen sich nicht — daher komponieren sie: **Filter zuerst, Kandidatenmenge verkleinern; Sort Keys ranken die Überlebenden.**

## Wie der Scheduler eine Policy-Kette auswertet

Beim Filtern und Scoren der GPUs eines Knotens wertet der HAMi-Scheduler die Policy-Kette als feste Pipeline aus:

![Policy-Ketten-Pipeline: Annotation parsen, filtern mit mutex/topology-aware, sortieren in Schreibreihenfolge binpack→spread→numa, volle Gleichstände per Device-Index brechen, Fallback spread wenn nur Filter](/images/blog/hami-composable-scheduler-policies/policy-pipeline-en.png)

Die Regeln in Reihenfolge:

1. **Parsen.** Die Annotation wird an Kommas geteilt, Whitespace pro Item ignoriert, Duplikate entfernt, nur bekannte Policy-Namen wirken.
2. **Zuerst filtern.** `mutex` und `topology-aware` gelten vor jedem Sortieren. Bei einem Pod mit `mutex` entscheidet eine Frage: hat diese Karte aktuell null Mandanten? Selbst eine Karte mit einem kleinen Workload und viel freiem Speicher wird komplett ausgeschlossen. Wenn jede Karte einen Mandanten hat, bleibt der Pod Pending mit Grund `ExclusiveDeviceAllocateConflict`.
3. **In Schreibreihenfolge sortieren.** `binpack`, `spread` und `numa` bilden eine geordnete Liste von Sort Keys. Der erste Key dominiert: `binpack,numa` sortiert nach binpack, nur bei Gleichstand bricht die NUMA-Nummer; `numa,binpack` kehrt die Priorität um. **Die Listenreihenfolge ist die Key-Reihenfolge.**
4. **Deterministischer Tiebreak.** Vergleichen zwei Karten unter allen Keys gleich, gewinnt der kleinere Device-Index. Auf einem idle Cluster liefern identische Anfragen identische, reproduzierbare Platzierungen.
5. **Nur-Filter-Fallback.** Eine Kette ohne Sort Keys (z. B. `"mutex,topology-aware"`) fällt nach dem Filtern auf `spread`-Reihenfolge zurück.
6. **Einzelwert unverändert.** Ein nacktes `"binpack"`, `"spread"` oder `"mutex"` verhält sich wie vor v2.10.0; bestehende Workloads brauchen beim Upgrade keine Änderung.

## Was Sort Keys wirklich vergleichen

Für `binpack` und `spread` ist „voll/leer“ keine Schätzung: Der Scheduler berechnet pro Karte einen Utilization-Score aus zugewiesenem Compute und Speicher, mit Gewichten über Slot, Core und Memory (pro Pod anpassbar via `hami.io/device-scoring-weights`). `binpack` wählt die **höchste** Score-Karte, `spread` die **niedrigste**. Der `numa`-Key vergleicht die NUMA-Nummer, die jede Karte via NVML meldet.

Hinweis: v2.10.0 behob auch ein langjähriges Problem (PR #2012): Früher war selbst bei reinem `binpack`/`spread` NUMA der *primäre* Sort Key und pinnte Workloads auf einen NUMA-Node unabhängig von Auslastung. Nach dem Fix ist Utilization-Score primär, NUMA bricht nur Gleichstände — genau die Tiebreaker-Rolle von `numa` in einer Policy-Kette.

## Beispiel: Auswahlpfad eines Pods über vier Karten

Ein reals Szenario: ein Knoten, vier Tesla T4s, ein Pod mit `mutex,binpack`, der 1 vGPU (1000-MiB-Slice) anfordert. Jede Karte mit Mandantenzahl und Utilization-Score; die Pfeile sind der Auswahlpfad:

![Auswahlpfad: mutex verwirft GPU 0 und GPU 1 mit Mandanten; binpack rankt zwei idle Überlebende; Scores gleich 0.00, Device-Index-Tiebreak wählt GPU 2](/images/blog/hami-composable-scheduler-policies/selection-path-en.png)

Zwei Lesarten:

- Die geschäftigste GPU 0 erreicht Sortierung nie: der `mutex`-Filter entfernte sie zuerst, obwohl reines `binpack` sie mit Top-Score 3.30 gewählt hätte. **Filtern geht vor Sortieren; die komponierte Kette berücksichtigt nie die Karte, die reines `binpack` wählen würde.**
- Die zwei Überlebenden scoren gleich (beide 0.00), `binpack` trennt nicht, die Kette fällt durch auf Device-Index-Tiebreak und wählt deterministisch GPU 2.

Die Zahlen stammen aus einem echten Test: eine Karte mit einem 1000-MiB-Mandanten scored `1.651042`, eine idle `0.000000`, direkt aus Scheduler-Scoring-Logs.

## Gängige Rezepte

| Annotation | Bedeutung |
|-|-|
| `"binpack"` | Diesen Pod auf die geschäftigste passende Karte stapeln, ganze Karten idle maximieren |
| `"spread"` (Default) | Auf die leerste Karte, Nachbar-Kontention minimieren |
| `"mutex"` | Karte mit null aktuellen Nutzern verlangen |
| `"binpack,numa"` | Binpack; bei Binpack-Gleichstand niedrigere NUMA-Node bevorzugen |
| `"mutex,binpack"` | Exklusiv und kompakt: unter idle Karten die geschäftigste, Fragmentierung reduzieren |
| `"mutex,binpack,numa"` | „Latency tier“-Rezept: exklusive Karte, binpack unter idle, NUMA als Tiebreaker |

Wichtig zu `mutex`: Es garantiert null Nutzer **zum Platzierungszeitpunkt**; später schedulbare normale Pods können der Karte noch beitreten. Um eine Karte für die gesamte Laufzeit exklusiv zu halten, alle Ressourcen der Karte anfordern (Memory und Compute) oder mit `nvidia.com/use-gpuuuid` pinnen.

## In drei Schritten starten

**1. Upgrade auf HAMi v2.10.0 oder neuer:**

```bash
helm repo add hami-charts https://project-hami.github.io/HAMi/
helm repo update
helm upgrade hami hami-charts/hami -n kube-system --version 2.10.0
```

Cluster-Defaults bleiben `binpack` für Node-Auswahl und `spread` für Karten-Auswahl; Upgrade ändert keine Defaults.

**2. Pods annotieren, die kombiniertes Verhalten brauchen:**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: inference-latency-tier
  annotations:
    hami.io/gpu-scheduler-policy: "mutex,binpack,numa"
spec:
  containers:
    - name: app
      image: ubuntu:22.04
      command: ["bash", "-c", "sleep 86400"]
      resources:
        limits:
          nvidia.com/gpu: 1      # 1 vGPU
          nvidia.com/gpumem: 8000 # 8000 MiB Speicherquota
```

**3. Entscheidung verifizieren.** Der Scheduler schreibt die gewählte Karte auf den Pod:

```bash
# Device-UUID, Vendor, Speicher-Slice, Compute-Prozent der gewählten Karte
kubectl get pod inference-latency-tier \
  -o jsonpath='{.metadata.annotations.hami\.io/vgpu-devices-allocated}'; echo
```

Für einen `mutex`-Pod, der Pending bleibt, zeigt `kubectl describe pod` Grund `ExclusiveDeviceAllocateConflict`; der Scheduler emittiert pro Kandidatenkarte eine Utilization-Scoring-Logzeile (`computer score is`):

```bash
kubectl -n kube-system logs deploy/hami-scheduler -c vgpu-scheduler-extender \
  --tail=-1 | grep 'computer score' | tail
```

## Auf einem echten Cluster ausprobieren

Lesen ist eines; zusehen, wie ein `mutex`-Pod Pending bleibt, bis eine Karte frei wird, und wie `mutex,binpack` die Karte verweigert, die reines `binpack` gewählt hätte, ist ein anderes. [Lab 14](https://project-hami.io/tutorials/labs/composable-scheduler-policies-gke) führt die volle Feature-Matrix auf einem GKE-Knoten mit vier Tesla T4s durch: Default `spread`, `binpack`-Stapeln, `mutex`-Blockieren und -Freigabe, kombiniertes `mutex,binpack` — verifiziert via Allocation-Annotations, Events und Scheduler-Logs.

## Zusammenfassung

- HAMis GPU-Scheduling-Policies gibt es in zwei Arten: `mutex`/`topology-aware` sind **Filter** (wer darf mitmachen), `binpack`/`spread`/`numa` sind **Sort keys** (wer rankt zuerst); beide Arten komponieren natürlich;
- v2.10.0 erlaubt eine geordnete kommagetrennte Liste, ausgewertet als „zuerst filtern, dann in Schreibreihenfolge sortieren, Device-Index bricht Gleichstände“, Einzelwert wie vor dem Upgrade;
- Ein verwandtes altes NUMA-als-Primärkey-Problem wurde mitbehoben, `numa` zurück zur Tiebreaker-Rolle — Utilization-Score ist primär.

In einem Satz: **HAMis Scheduling-Policies wurden von einer Multiple-Choice-Frage zu einem Rezept.**

Autor: Jimmy Song (宋净超), Dynamia AI.

## Serien-Lektüre

- Vorheriger: [HAMi 2.10 Deep Dive (Teil 2): Eine Ascend-Karte, zwei Pods — Volcano + HAMi-core vNPU Soft Slicing im Test](/blog/volcano-ascend-vnpu-soft-slicing)
- Teil 1: [HAMi 2.10 Deep Dive (Teil 1): Getestet — KAI Scheduler + HAMi GPU-Speicher-Hard-Isolation](/blog/kai-scheduler-hami-gpu-memory-hard-isolation)
- [HAMi v2.10.0 Release: Flexible MIG, kombinierbare Scheduling-Policies und breiteres Accelerator-Ökosystem](https://project-hami.io/blog/hami-v2-10-0-release)
- Hands-on-Lab: [Lab 14: Composable Scheduling Policies auf GKE validieren](https://project-hami.io/tutorials/labs/composable-scheduler-policies-gke)

## Referenzen

- Original auf der HAMi-Website: <https://project-hami.io/blog/composable-scheduler-policies>
- HAMi v2.10.0 Release: <https://project-hami.io/blog/hami-v2-10-0-release>
- Lab 14 (vollständige Reproduktion auf GKE): <https://project-hami.io/tutorials/labs/composable-scheduler-policies-gke>
- PR #2621 (kommagetrennte gpu-scheduler-policy): <https://github.com/Project-HAMi/HAMi/pull/2621>
- Issue #2010 (Composable scheduling policies): <https://github.com/Project-HAMi/HAMi/issues/2010>
- Scheduling-Design-Dokument: <https://project-hami.io/docs/developers/scheduling>
- Konfigurationsreferenz: <https://project-hami.io/docs/userguide/configure>