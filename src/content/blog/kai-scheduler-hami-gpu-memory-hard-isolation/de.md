---
title: >-
  HAMi 2.10 Deep Dive (Teil 1): Getestet — KAI Scheduler + HAMi GPU-Speicher-Hard-Isolation, kein einziges MiB mehr
linktitle: KAI + HAMi Speicher-Isolation getestet
date: '2026-08-25'
excerpt: >-
  Die größte Sorge beim GPU-Sharing: „Wir haben 50/50 vereinbart — wie kannst du überbuchen?“ Erster Artikel der HAMi-2.10-Deep-Dive-Reihe: Mit einem reproduzierbaren GKE-Test klären wir, ob HAMi-core nach KAI-Scheduler-Co-Scheduling zweier Pods auf derselben NVIDIA T4 die GPU-Speicher jedes Pods wirklich an der Quote fixiert. 3 GiB Anforderung gelingt; kumulierte 5 GiB schlagen mit sofortigem Out-of-Memory fehl.
author: Jimmy Song
tags:
  - HAMi
  - KAI Scheduler
  - GPU Sharing
  - GPU Virtualization
  - HAMi-core
  - Kubernetes
category: Technical Deep Dive
coverTitle: HAMi 2.10 Deep Dive (Teil 1)
---

> Die größte Sorge beim GPU-Sharing: „Wir haben 50/50 vereinbart — wie kannst du überbuchen?“ Erster Artikel der HAMi-2.10-Deep-Dive-Reihe: Mit einem reproduzierbaren GKE-Test klären wir, ob HAMi-core nach KAI-Scheduler-Co-Scheduling zweier Pods auf derselben NVIDIA T4 die GPU-Speicher jedes Pods wirklich an der Quote fixiert. 3 GiB Anforderung gelingt; kumulierte 5 GiB schlagen mit sofortigem Out-of-Memory fehl.

GPUs sind teuer. Eine ganze Karte nur für einen Task zu reservieren ist Luxus — Teilen ist Pflicht. Die größte Angst dabei: wir haben 50/50 vereinbart, wie kann trotzdem überbucht werden?

Zwei Pods auf dieselbe Karte zu legen, ist nur der erste Schritt. Ruhe gibt es, wenn der Speicherverbrauch jedes Pods hart an der Quote endet — überzogene Allokationen scheitern sofort, statt auf „braves“ Verhalten der Anwendung zu vertrauen.

HAMi v2.10 ist kürzlich erschienen; die **KAI-Scheduler- + HAMi-core-Integration** gehört zu den Leitfeatures. Als erster Deep-Dive-Artikel skizzieren wir den Hintergrund und beantworten mit einem Hands-on-Test eine Frage:

**Nachdem KAI Scheduler zwei Pods auf dieselbe GPU gelegt hat — begrenzt HAMi-core den Speicherverbrauch jedes Pods wirklich?**

Kurzantwort: **ja**. Auf GKE teilten zwei Pods eine NVIDIA T4, jeder mit 4147 MiB Speicherdeckel; ein Pod allokierte erfolgreich 3 GiB, kumulative 5 GiB scheiterten mit `out of memory`. Während ein Pod 3 GiB hielt, konnte der andere ebenfalls 3 GiB allokieren — niemand kann die Quote des anderen mitverbrauchen.

## Hintergrund: Warum GPU-Sharing „Hard Isolation“ braucht

### KAI Scheduler: NVIDIAs Open-Source-KI-Scheduler

[KAI Scheduler](https://github.com/kai-scheduler/KAI-Scheduler) ist NVIDIAs Open-Source-, Kubernetes-native Scheduler für KI-Workloads. Er stammt aus der Run:ai-Scheduling-Engine — nach NVIDIAs Run:ai-Übernahme Ende 2024 wurde er im April 2025 unter Apache 2.0 open-source und ist jetzt CNCF-Sandbox-Projekt.

Der Standard-Kubernetes-Scheduler wurde für stateless Services entworfen und behandelt GPUs wie CPU-Kerne: jeder Pod belegt eine ganze GPU, ohne Gang-Scheduling, Team-Fairness oder Topologiebewusstsein. KAI Scheduler wurde für KI-Szenarien gebaut:

- **PodGroup (Gang Scheduling)**: Pods eines verteilten Trainingsjobs starten gemeinsam;
- **Queue (hierarchische Fair Scheduling)**: GPU-Quoten nach Abteilung/Team, mit Ausleihe und Preemption;
- **Fractional GPU (GPU Sharing)**: mehrere Workloads teilen eine GPU, nach Fraction oder Speichergröße;
- **Topology-Aware Placement**: respektiert GPU-Interconnect-Topologie;
- **Elastic Workloads**: Jobs skalieren elastisch zwischen Minimum und Maximum Pod-Anzahl.

### Das Last-Mile-Problem von „Soft Sharing“

Fractional GPU Sharing von KAI Scheduler ist mächtig, mit einer zentralen Einschränkung: es ist **kooperativ**. Der Scheduler stellt sicher, dass die Summe der angefragten Speicheranteile auf die Karte passt, **verhindert physisch aber nicht**, dass ein Workload mehr nutzt — ein Container mit 2000 MiB Anfrage kann über `nvidia-smi` und CUDA-API den vollen GPUspeicher sehen und nutzen.

![Soft Sharing vs. Hard Isolation: bei Soft Sharing zeigt nvidia-smi weiterhin den vollen Speicher und Überbuchung ist möglich; bei Hard Isolation nur die zugewiesene Quote, Überbuchung schlägt fehl](/images/blog/kai-scheduler-hami-gpu-memory-hard-isolation/soft-vs-hard-sharing-en.png)

In Dev/Test oft akzeptabel, in Multi-Tenant-Produktion ein fataler Schwachpunkt:

- Workloads können Speicher überbuchen → OOM oder gegenseitige Störung;
- keine echte Ressourcen-Isolation für Mandanten;
- kein präzises GPU-Speicher-Cap pro Container.

### HAMi und HAMi-core

HAMi ist ein CNCF-Sandbox-Projekt für Middleware zur Virtualisierung heterogener KI-Compute-Ressourcen. Unterstützt u. a. NVIDIA GPUs, Huawei Ascend NPUs, Cambricon MLUs, Hygon DCUs, Moore Threads, Iluvatar CoreX, Enflame, Kunlunxin, MetaX, AMD, Biren — breiteste Abdeckung unter Open-Source Cloud-nativen GPU-Virtualisierungslösungen. **HAMi-core** (`libvgpu.so`) erzwingt GPU-Speicher- und Rechenlimits auf CUDA-API-Ebene durch CUDA-Interception.

Aufteilung der Zuständigkeiten:

- **KAI Scheduler** = entscheidet „wer welche GPU wann nutzt“ (**Scheduling-Ebene**)
- **HAMi-core** = stellt sicher „du darfst nur nutzen, was dir zugeteilt wurde“ (**Isolations-Ebene**)

Erst gemeinsam liefern sie produktionsreifes GPU-Sharing.

### Vom Vorschlag bis Built-in: Open-Source-Zusammenarbeit über mehr als ein Jahr

Diese Integration ist ein Musterbeispiel für Community-Kollaboration. Über mehr als ein Jahr arbeiteten HAMi-Team und NVIDIA KAI-Scheduler-Team eng zusammen:

| Datum | Meilenstein |
| ---- | --------- |
| April 2025 | HAMi-Maintainer [@archlitchi](https://github.com/archlitchi) öffnet PR #60 „Resource isolation design“; Community teilt Zuständigkeiten — KAI injiziert Umgebungsvariablen, HAMi liefert Isolationskomponente |
| April 2026 | [@FouoF](https://github.com/FouoF) öffnet PR #1504, GPU_MEMORY_LIMIT-Binder-Plugin |
| 28. Mai 2026 | PR #1504 in KAI-Scheduler-Mainline gemergt |
| 9. Juni 2026 | PR #60 nach Review gemergt, inkl. Doku und e2e-Tests |
| Juni 2026 | HAMi-core-Isolation in KAI Scheduler **v0.16.4** eingebaut |
| August 2026 | **HAMi v2.10.0**, KAI Resource Isolator, gesamte Kette als Helm Chart out-of-the-box |

Dass NVIDIAs offizieller Scheduler HAMi-core statt Eigenbau wählt, bestätigt HAMis technische Richtung. Zuvor war HAMi-core bereits mit mehreren Mainstream-Schedulern integriert:

![HAMi-core-Integrationslandschaft: Kubernetes-Default-Scheduler, Volcano, KAI Scheduler, Kueue, Koordinator](/images/blog/kai-scheduler-hami-gpu-memory-hard-isolation/ecosystem-en.png)

## Die Isolationskette: drei Komponenten, ein Vertrag

Die Kette hat genau drei Verantwortlichkeiten:

- **KAI Scheduler**: welche GPU ein Pod nutzt; injiziert berechnete Speicherquote per `CUDA_DEVICE_MEMORY_LIMIT`;
- **kai-resource-isolator**: DaemonSet verteilt `libvgpu.so`; Webhook mountet die Library in Workload-Pods und konfiguriert `ld.so.preload`; optional Monitor mit `hami_*`-Metriken auf `:9394`;
- **HAMi-core (`libvgpu.so`)**: intercepts `cudaMalloc` u. a., lehnt Allokationen über der Quote ab.

![KAI Scheduler + HAMi-core: Quotenberechnung, Env-Injection, Webhook-Mount, CUDA-Interception, Metriken](/images/blog/kai-scheduler-hami-gpu-memory-hard-isolation/isolation-chain-en.png)

Der Kern ist der **`CUDA_DEVICE_MEMORY_LIMIT`-Vertrag**: KAI muss nicht wissen, wie CUDA abgefangen wird; HAMi-core muss nicht wissen, wie die Quote berechnet wurde. Vollständig entkoppelt.

Beim Containerstart lädt der Dynamic Linker `libvgpu.so` vor den CUDA-Libraries. HAMi-core liest die Quote, trackt Speicherverbrauch und schreibt Geräteabfragen um — Tools wie `nvidia-smi` sehen nur Speicher innerhalb der Quote; Allokationen über dem Limit scheitern sofort.

**Erzwungen auf CUDA-API-Ebene — kein Honor-System.**

## Integration in vier Schritten

Die Schritte funktionieren auf jedem Kubernetes-Cluster mit eingerichteten NVIDIA-GPUs (Knoten melden `nvidia.com/gpu`, normale Ganzkarten-Pods können `nvidia-smi` ausführen).

### Schritt 1: KAI Scheduler installieren

GPU-Sharing und `hamicore`-Binder-Plugin aktivieren:

```bash
helm install kai-scheduler \
  oci://ghcr.io/kai-scheduler/kai-scheduler/kai-scheduler \
  --namespace kai-scheduler --create-namespace \
  --version v0.17.0 \
  --set global.gpuSharing=true \
  --set binder.plugins.hamicore.enabled=true

kubectl -n kai-scheduler wait --for=condition=available \
  --timeout=180s deploy --all
```

Normalerweise laufen alle KAI-Komponenten (admission, binder, operator, scheduler usw.), Default-Queues werden angelegt.

### Schritt 2: kai-resource-isolator installieren

```bash
helm install kai-resource-isolator \
  oci://docker.io/projecthami/kai-resource-isolator \
  --namespace kai-resource-isolator --create-namespace \
  --version 1.1.0-chart \
  --set monitor.enabled=true
```

Auf jedem GPU-Knoten laufen libsync- und Monitor-Pods, Webhook ist bereit.

### Schritt 3: GPU-Sharing-Pod einreichen

Zwei Punkte: Annotation `gpu-memory` (Integer in MiB, ohne Suffix) und KAI als Scheduler:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: kai-hami-check
  labels:
    kai.scheduler/queue: default-queue
  annotations:
    gpu-memory: "4096"   # unit: MiB
spec:
  schedulerName: kai-scheduler
  containers:
    - name: cuda
      image: nvidia/cuda:12.4.1-base-ubuntu22.04
      command: ["sleep", "infinity"]
```

Der Pod wird auf einen GPU-Knoten geschedult und läuft.

### Schritt 4: Scheduler-zu-Runtime-Übergabe prüfen

Ein Befehl prüft drei Dinge: injizierte Quote, Preload-Datei, von HAMi-core exponierten Speicher:

```bash
kubectl exec kai-hami-check -- sh -lc '
  printf "limit=%s\n" "$CUDA_DEVICE_MEMORY_LIMIT"
  cat /etc/ld.so.preload
  nvidia-smi --query-gpu=uuid,memory.total --format=csv,noheader
'
```

Bei 4096 MiB Anfrage auf 15360 MiB T4 im Test:

```text
limit=4147m
/usr/local/vgpu/libvgpu.so
GPU-9acc8878-3967-5fb4-c534-43d6fd820fa6, 4147 MiB
```

Drei Zeilen beweisen: KAI gewährte Quote, HAMi-core injiziert, Container sieht Isolationsdeckel statt voller Karte. Die Kette lebt.

Warum 4147 statt exakt 4096, siehe unten.

## Der GKE-Test: Ist Hard Isolation wirklich hart?

Testumgebung: GKE 1.35/COS/CDI, drei `n1-standard-2`-Knoten je eine NVIDIA T4 (15360 MiB). KAI Scheduler v0.17.0; kai-resource-isolator 1.1.0-chart.

| Prüfung | Beobachtung | Beweis |
| ----- | --------------- | -------------- |
| Knoten & GPU-UUID | Beide Pods auf demselben Ein-GPU-Knoten, gleiche `GPU-9acc8878-...` | Teilen dieselbe physische T4 |
| Sichtbarer Speicher | Beide melden 4147 MiB; volle Karte 15360 MiB | HAMi-core zeigt nur KAI-Quote |
| CUDA-Allokation | 3 GiB ok; kumulierte 5 GiB → `out of memory` | Deckel wird erzwungen |
| Parallele Isolation | Pod A hält 3 GiB, Pod B kann 3 GiB allokieren | Kein Verbrauch fremder Quote |
| Monitor-Metriken | `:9394/metrics` meldet 4,348 GB Deckel und 3,328 GB Live-Nutzung pro Pod | Beobachtbar pro Pod |

Bei Überbuchung loggte HAMi-core:

```text
Device 0 OOM 5475663872 / 4348444672
allocate another 2 GiB: out of memory
```

Der Container versuchte ~5 GiB zu halten, Deckel 4147 MiB — CUDA-Allokation scheiterte.

**Pods wirklich auf derselben Karte → jeder sieht nur eigene Quote → CUDA kann Deckel nicht überschreiten → Live-Nutzung beobachtbar.**

Hinweise:

- Monitor pro Knoten, nur lokaler Cache — auf dem Knoten des Workload-Pods abfragen.
- GKE-Reproduktion: zusätzlich read-only Root-FS, RuntimeClass, NVML-Pfade, CDI, PriorityClass. Vollständig: „Lab 12“ am Ende.

## Warum 4147 MiB statt 4096?

KAI wandelt intern MiB in eine **GPU-Fraction mit zwei Dezimalstellen** um und multipliziert mit Vollspeicher: 4096 MiB ≈ 0,27 auf 15360 MiB T4 → 0,27 × 15360 ≈ 4147 MiB.

Etwas mehr als angefragt im Container ist normal — maßgeblich ist `CUDA_DEVICE_MEMORY_LIMIT`.

## Ehrlich: CUDA-Ebene, keine Hardware-Isolation

Klarstellung: verifiziert wurde **Speicherbegrenzung auf CUDA-API-Ebene**, kein Hardware-Sicherheitsgrenze wie MIG. Der GKE-Pfad nutzte privilegierte Workload-Container — **keine Sicherheitslösung für untrusted Multi-Tenancy**. Für vertrauenswürdige interne Teams, Dev/Test und gemischtes Inferenz-Serving reicht diese Kombination; für untrusted Mandanten MIG o. Ä. prüfen.

## Zusammenfassung

- **Hintergrund**: KAI Fractional Sharing war kooperativ — teilen ohne isolieren; HAMi-core schließt die Last Mile;
- **Integration**: über ein Jahr, zwei Kern-PRs in KAI Mainline, v0.16.4 built-in; HAMi v2.10 KAI Resource Isolator als Helm Chart;
- **Test**: zwei Pods, eine T4, 4147 MiB Deckel; innerhalb der Quote ok, darüber OOM, kein gegenseitiges Übergreifen — Hard Isolation verifiziert.

Die Last Mile des GPU-Sharings ist wirklich offen.

## Weiterlesen

- Nächster Teil: [HAMi 2.10 Deep Dive (Teil 2): Eine Ascend-Karte, zwei Pods — Volcano + HAMi-core vNPU Soft Slicing](/blog/volcano-ascend-vnpu-soft-slicing)
- Teil 3: [HAMi 2.10 Deep Dive (Teil 3): Exclusive, Binpack und NUMA-Aligned — Scheduling-Policies sind jetzt komponierbar](/blog/hami-composable-scheduler-policies)
- [HAMi 2.10 Deep Dive: flexibles MIG, AMD vGPU, Scheduling-Ökosystem](/blog/hami-v210-deep-dive)
- Vorheriger: [Dynamia treibt HAMi-core-Integration in KAI Scheduler voran](/blog/hami-core-adopted-by-kai-scheduler)
- Test reproduzieren: [Lab 12: KAI Scheduler und HAMi Speicher-Isolation auf GKE](https://project-hami.io/zh/tutorials/labs/kai-scheduler-hami-gke)

## Referenzen

- HAMi v2.10.0 Release: <https://project-hami.io/zh/blog/hami-v2-10-0-release>
- User Guide „How to use HAMi with KAI Scheduler“: <https://project-hami.io/zh/docs/next/userguide/kai-scheduler/how-to-use-kai-scheduler>
- Repositories:
  - HAMi: <https://github.com/Project-HAMi/HAMi>
  - HAMi-core: <https://github.com/Project-HAMi/HAMi-core>
  - KAI-resource-isolator: <https://github.com/Project-HAMi/KAI-resource-isolator>
  - KAI Scheduler: <https://github.com/kai-scheduler/KAI-Scheduler>

Autor: Jimmy Song (Dynamia AI).