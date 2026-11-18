---
title: 'HAMi 2.7.0 — Of Silicon & Scheduling | Stärker, intelligenter, breiter.'
coverTitle: 'HAMi 2.7.0 — Of Silicon & Scheduling | Stärker, intelligenter, breiter'
date: '2025-10-09'
excerpt: >-
  HAMi v2.7.0 ist da! Volle Unterstützung für Kunlun XPU, Enflame GCU, AWS
  Neuron und MetaX, verbesserte Scheduler-Optimierungen, erweiterte
  Anwendungs-Ökosystem-Integration, verbesserte WebUI sowie wachsende Community.
author: Dynamia AI Team
tags:
  - HAMi
  - GPU-Sharing
  - vGPU
  - Kubernetes
  - Heterogenes Computing
  - XPU
  - GCU
  - MetaX
  - Neuron
  - Release
category: Product Release
coverImage: /images/blog/hami-v2.7.0/cover-en.png
linktitle: HAMi v2.7.0 Release
---
**GPU-**Ökosystem und Scheduling-Effizienz — Upgrade

> Eine Hommage an Kubernetes 1.34 ***Of Wind & Will***: Dort benennt Wind und Wille den Kurs; hier lauten unsere Koordinaten ***Silicon & Scheduling***.
>
> *Silicon — die vielen Facetten von Compute.*
> *Scheduling — der Rhythmus, der Wege durch Komplexität findet.*
>
> Wir versprechen nicht den Wind; wir versprechen eine **Ordnung**, nach der Sie segeln können.
> Ein Release entsteht nicht, weil alles perfekt ist, sondern weil ***Ordnung Unvollkommenheit parallel laufen lässt***.

## Release-Highlights

* **Breitere Hardware-Abdeckung:** Backends für mehrere heterogene Beschleuniger in Ganzgerät-, Virtualisierungs- und topologiebewussten Modi (Details in der Doku). **NVIDIA** topologiebewusstes Scheduling ist ausgebaut; **AWS Neuron** von Geräte- bis Core-Sharing mit Topologie-Bewusstsein integriert.
* **Scheduler-Kern:** Aggregation von Fehler-Events, Quarantäne abnormer NVIDIA-Karten und **erweiterte ResourceQuota**, die Multi-GPU-Speicher-/Compute-Requests korrekt abbildet — bessere Observability und Robustheit.
* **Anwendungs-Ökosystem:** Verbesserte **vLLM**-Kompatibilität (Production-Stack PR #579 gemerged), **Xinference**-Helm-Integration mit HAMi vGPU und **Volcano Dynamic MIG**.
* **Community:** Neue Maintainer/Reviewer; CNCF-Fallstudien und Ökosystem-Talks zeigen reale Adoption.
* **WebUI:** Klarere heterogene GPU-Telemetrie für schnellere Triage und Kapazitätseinblicke.

## Community-Updates

### CNCF-Fallstudien

HAMi sieht weiterhin reale Adoption in der Cloud-Native-Community. Beispiele:

* **SF Technology (Effective GPU):** Groß angelegtes Pooling und Scheduling heterogener Compute-Ressourcen mit HAMi. Details in der [CNCF-Fallstudie](https://www.cncf.io/case-studies/sf-technology/).
* **PREP-EDU:** Bessere Ressourcenauslastung für Trainings-Workloads mit HAMi. [CNCF-Fallstudie](https://www.cncf.io/case-studies/prep-edu/).

### Anerkennung im vCluster-Workshop

In einem vCluster-Workshop hoben Experten HAMi als innovativen Ansatz hervor: ein Proxy-Layer, der **CUDA**-API-Aufrufe abfängt für feingranulare Ressourcenkontrolle und Isolation. Aufzeichnung auf [YouTube](https://youtu.be/eBbjSfxwL30?si=PcPBonbQJfN7maeh&t=1811).

### The Linux Foundation AI_dev

Auf dem AI_dev-Summit zeigten wir, wie HAMis flexibles GPU-Slicing und softwaredefinierte Isolation Compute-Verschwendung in Cloud-Native-Umgebungen mindern. Aufzeichnung auf [YouTube](https://youtu.be/pjHA0JfPNfw?si=djB-R71tswDn9JAq&t=875).

### Vietnam Telecom: GPUs auf Kubernetes mit eBPF

In der Produktion von Vietnam Telecom bewies HAMi robustes GPU-Ressourcenmanagement und Observability auf Kubernetes. [CNCF Cloud Native Hanoi Meetup](https://community.cncf.io/events/details/cncf-cloud-native-hanoi-presents-may-meetup-gpu-and-ebpf-on-kubernetes/) und [YouTube](https://youtu.be/UtPv8P7v0YU?si=UH1uwe07IV4bT5kL).

## Deep Dive: Kernfunktionen

### AWS Neuron — Geräte- und **Core-Level**-Sharing mit Topologie-Bewusstsein

AWS-**Inferentia** und **Trainium** sollen effizientere, kostenkontrollierte KI-Infrastruktur auf AWS liefern. **Inferentia** für Inferenz, **Trainium** für Training — optimiert für KI-Workloads, nicht nur Rohleistung, sondern **Performance pro Watt** und Kosteneffizienz. **Inferentia2** bringt deutliche Perf/Watt-Gewinne; **Trainium2** soll Kosten um **30–40 %** gegenüber vergleichbaren GPU-Instanzen senken. HAMi integriert **Scheduling**, **Virtualisierung** und **Observability** für diese AWS-Beschleuniger.

**Was HAMi für AWS Neuron ergänzt**
 HAMi ermöglicht **feingranulares Scheduling und Sharing** von AWS-**Trainium**- und **Inferentia**-Beschleunigern in Kubernetes.

**Schlüsselfähigkeiten**

1. **Core-Level-Sharing.** Ein Neuron-Gerät exponiert typisch mehrere **NeuronCores**. HAMi erlaubt Anfragen auf **einzelner NeuronCore**-Granularität statt ganzer Geräte — deutlich bessere Auslastung hochwertiger Beschleuniger.
2. **Topologiebewusste Platzierung.** Bei mehreren NeuronCores platziert der Scheduler auf **latenzarmen Core-Gruppen** — maximale Intra-Node-Kommunikationseffizienz.
3. **Vereinfachte UX.** Neuron-Ressourcen im Pod-YAML wie CPU/Speicher: `aws.amazon.com/neuron` (Gerät) oder `aws.amazon.com/neuroncore` (Core). HAMi übernimmt das Mapping.

**Funktionsweise Topologie-Bewusstsein**
HAMis topologiebewusstes AWS-Neuron-Scheduling basiert auf **aus Vorwissen kodierten Policies** zu EC2-Neuron-Plattformen, nicht auf Laufzeit-Topologie-Discovery. Erkenntnisse aus AWS’ nativem Scheduling für **EC2-Neuron-Instanztypen** sind in HAMis Regeln **kodifiziert**.

**Implementierungsprinzipien**

1. **Instanztyp-Erkennung.** Der Scheduler liest den **EC2-Instanztyp** des Knotens (z. B. **trn1**, **inf2**) als maßgeblichen Topologie-Hinweis.
2. **Lineare Abstraktion.** Alle Neuron-Ressourcen eines Knotens als **zusammenhängende, nullbasierte Liste** `[0, 1, 2, …]`, kein komplexer Graph.
3. **Zusammenhängende Block-Allokation (harte Regel).** Fordert ein Workload **N** Geräte/Cores, muss ein **vollständig freier, zusammenhängender Block der Länge N** gefunden werden. Genug freie, aber **nicht benachbarte** Einheiten → Platzierung **scheitert**.

![Neuron device contiguous allocation visualization](/images/blog/hami-v2.7.0/1760022669789.png)

Bei Trainium-Instanzen ist die Allokation auf bestimmte zusammenhängende Gruppengrößen (z. B. 4/8/16) beschränkt — passend zur High-Bandwidth-Interconnect-Topologie.

![Trainium contiguous block allocation diagram showing specific group sizes](/images/blog/hami-v2.7.0/1760022681536.png)

**Beispiele**

```YAML
apiVersion: v1
kind: Pod
metadata:
  name: neuron-devices
spec:
  restartPolicy: Never
  containers:
    - name: app
      image: public.ecr.aws/neuron/pytorch-inference-neuron:1.13.1-neuron-py310-sdk2.20.2-ubuntu20.04
      command: ["sleep","infinity"]
      resources:
        requests:
          cpu: "1"
          memory: 1Gi
        limits:
          cpu: "4"
          memory: 4Gi
          aws.amazon.com/neuron: 4
```

```YAML
apiVersion: v1
kind: Pod
metadata:
  name: neuron-cores
spec:
  restartPolicy: Never
  containers:
    - name: app
      image: public.ecr.aws/neuron/pytorch-inference-neuron:1.13.1-neuron-py310-sdk2.20.2-ubuntu20.04
      command: ["sleep","infinity"]
      resources:
        requests:
          cpu: "1"
          memory: 1Gi
        limits:
          cpu: "4"
          memory: 4Gi
          aws.amazon.com/neuroncore: 1
```

**Doku & PRs**
*Benutzerhandbuch: AWS **Neuron** Device* (<https://project-hami.io/docs/userguide/AWSNeuron-device/enable-awsneuron-managing>)
Zugehöriger PR: [https://github.com/Project-HAMi/HAMi/pull/1238](https://github.com/Project-HAMi/HAMi/pull/1238)
*Danke an @archlitchi und das AWS-Neuron-Team.*

### NVIDIA GPU — **Topologiebewusstes Scheduling** (NVLink zuerst, fragmentierungsbewusst)

Diese Funktion adressiert Multi-GPU-Engpässe in **HPC** und **groß angelegtem KI-Training**. Braucht ein Job 2, 4, 8 oder mehr GPUs, wird reine **PCIe**-Kommunikation zum Flaschenhals und senkt den Trainingsdurchsatz. Auf **NVLink-verbundenen** Sets steigt die Bandbreite dramatisch — deutlich höhere Gesamtleistung.

#### Topologie-Optimierung: Design-Rationale

Ein Kernprinzip: bestmögliche Passung für den aktuellen Job, während große, intakte ***Topologie***-Gruppen für künftige Jobs erhalten bleiben.

Zwei Phasen: **Topologie-Registrierung** und **Scheduling-Entscheidung**.

##### Phase 1: Topologie-Registrierung — Physisches Layout sichtbar machen

Ziel: unsichtbare GPU-Interconnects pro Knoten in standardisierte Daten für den Cluster-Scheduler übersetzen.

1. **Discovery.** Auf jedem GPU-Knoten ermittelt das **Device Plugin** per **NVML** den physischen Link-Typ zwischen allen GPU-Paaren — **NVLink** vs. **PCIe**.
2. **Modellierung.** Ergebnis als **Konnektivitätsmatrix** (Adjazenztabelle): für je zwei GPUs NVLink oder PCIe — digitale Blaupause der GPU-Topologie.
3. **Publikation.** Matrix als **JSON** in der Knoten-**Annotation** — global sichtbar und abfragbar.

##### Phase 2: Scheduling-Entscheidung — Optimale Platzierung

Bei GPU-Workloads rekonstruiert der Scheduler die Matrix aus Annotations und entscheidet zweistufig.

1. **Filter (Zulassung).** Prüft, ob **freie GPUs** Kombinationen für die Anfrage enthalten — z. B. **4 NVLink-GPUs** erfordern mindestens ein freies **4-GPU-NVLink-Set**. Unpassende Knoten fallen weg.
2. **Score (beste Wahl).** Verbleibende Knoten werden bewertet — beste aktuelle Passung, minimale künftige **Fragmentierung** hochbandbreitiger Gruppen.

##### **Nutzung**

##### Konkrete Policies

* **Multi-GPU-Jobs — „Best-Fit“-Prinzip.**

Bevorzugt **exakt passende** NVLink-Gruppen. Braucht ein Job 4 GPUs, punktet ein freies **4-GPU-NVLink-Set** höher als **4 aus einer 8-GPU-NVLink-Gruppe zu schneiden** — schützt wertvolle Topologie-Blöcke, reduziert Fragmentierung.

![Multi-GPU best-fit scheduling diagram showing exact-size NVLink group preference](/images/blog/hami-v2.7.0/1760023921307.png)

* **Single-GPU-Jobs — „Least-Disruption“-Prinzip.**

Bevorzugt **Standalone**-GPUs außerhalb von NVLink-Gruppen. NVLink-Gruppen nur nutzen, wenn keine Standalone-Option bleibt — intakte Hochbandbreiten-Gruppen für Jobs, die sie wirklich brauchen.

![Single-GPU least-disruption scheduling diagram showing preference for standalone GPUs](/images/blog/hami-v2.7.0/1760023911556.png)

```YAML
apiVersion: v1
kind: Pod
metadata:
  name: gpu-topology-aware-job
  annotations:
    hami.io/gpu-scheduler-policy: "topology-aware"
spec:
  containers:
  - name: cuda
    image: nvidia/cuda:11.6.2-base-ubuntu20.04
    command: ["sleep", "infinity"]
    resources:
      limits:
        nvidia.com/gpu: "4"
```

##### **Design & Anleitung**

Design: [https://github.com/Project-HAMi/HAMi/blob/master/docs/proposals/gpu-topo-policy.md](https://github.com/Project-HAMi/HAMi/blob/master/docs/proposals/gpu-topo-policy.md)
Guide: [https://github.com/Project-HAMi/HAMi/blob/master/docs/proposals/nvidia-gpu-topology-scheduler_cn.md](https://github.com/Project-HAMi/HAMi/blob/master/docs/proposals/nvidia-gpu-topology-scheduler_cn.md)
Zugehörige PRs:

* [https://github.com/Project-HAMi/HAMi/pull/1018](https://github.com/Project-HAMi/HAMi/pull/1018)
* [https://github.com/Project-HAMi/HAMi/pull/1276](https://github.com/Project-HAMi/HAMi/pull/1276)

*Danke an @lengrongfu und @fyp711.*

## Scheduler-Kern: Erweiterungen

### Erweiterte **ResourceQuota** (Multi-GPU-Speicher/Compute, das wirklich addiert)

**Lücken im Standard-Kubernetes**

1. **Keine Querverknüpfung:** Bei `nvidia.com/gpu: 2` und `nvidia.com/gpumem: 2000` (MB **pro** **GPU**) zählt Standard-ResourceQuota **2000 MB** statt **2×2000 MB**.
2. **Keine dynamischen Werte:** Prozentbasierte Requests (z. B. `gpumem-percentage: 50`) erst **nach** Platzierung auflösbar.

**HAMis Ansatz**

* **Verknüpfte Abrechnung:** Per-GPU-Semantik, **echte Summe** für Quota.
* **Dynamischer Abzug:** Prozent/unbestimmte Werte **zum Scheduling-Zeitpunkt** nach gewähltem Gerät.

![Extended ResourceQuota accounting diagram showing multi-GPU memory and compute calculation](/images/blog/hami-v2.7.0/1760023762746.png)

**Beispiel**

```YAML
apiVersion: v1
kind: ResourceQuota
metadata:
  name: gpu-quota
  namespace: default
spec:
  hard:
    limits.nvidia.com/gpu: "2"
    limits.nvidia.com/gpumem: "3000"
```

Guide: [https://project-hami.io/zh/docs/userguide/nvidia-device/using-resourcequota/](https://project-hami.io/zh/docs/userguide/nvidia-device/using-resourcequota/)
 Related PR: [https://github.com/Project-HAMi/HAMi/pull/1359](https://github.com/Project-HAMi/HAMi/pull/1359)
*Thanks to @FouoF.*

### Scheduling-**Event-Aggregation** (klare Gründe, schnellere Root-Cause)

* Filter-Fehler als standardisierte Tags (z. B. `CardInsufficientMemory`, `NumaNotFit`) mit **Zählern** in `FilteringFailed`-Events.
* Bei Erfolg **Normal**-Events mit Knoten und Scores; bei Misserfolg **Warning**-Events, warum kein Knoten passte.
* Mit v4/v5-Logs; siehe `docs/scheduler-event-log.md`.

Doku: [https://github.com/Project-HAMi/HAMi/blob/master/docs/scheduler-event-log.md](https://github.com/Project-HAMi/HAMi/blob/master/docs/scheduler-event-log.md)
 PR: [https://github.com/Project-HAMi/HAMi/pull/1333](https://github.com/Project-HAMi/HAMi/pull/1333)
*Danke an @Wangmin362.*

## Anwendungs-Ökosystem

HAMi treibt Low-Level-Hardware voran und integriert eng mit dem oberen KI-Anwendungs-Stack — bessere Developer Experience und operative Effizienz.

### vLLM — Kompatibilitätsverbesserungen

Bei Tensor Parallelism (TP) nutzt vLLM **NCCL** für Hochleistungs-Kommunikation. Das neueste HAMi-core bringt u. a.:

1. **Stabilisierung asynchroner Speicheranfragen:** Bugfix — async-Allokationen überschritten gelegentlich **MemPool**-Obergrenze.
2. **Genauere Speicherbuchführung:** **`cuMemCreate`**-Teilallokationen vollständig zugeordnet.
3. **Symbolauflösung:** Intermittierende Symbolprobleme, die **Hänger** verursachten.
4. **Kontextverwaltung:** Kontextgröße bei Neuerstellung korrekt verbucht.

Die vLLM-Community merged [[PR #579: Feat - Add Support HAMi Resources Variables]](https://github.com/vllm-project/production-stack/pull/579) — **native HAMi-Unterstützung** in vLLM, Ressourcen direkt über HAMis Virtualisierungs- und Scheduling-Schicht.

![vLLM production stack PR showing HAMi resource variables integration](/images/blog/hami-v2.7.0/1760022750966.png)

![vLLM HAMi compatibility diagram showing enhanced integration features](/images/blog/hami-v2.7.0/1760022756700.png)

**Zugehörige PRs**

* [https://github.com/vllm-project/production-stack/pull/579](https://github.com/vllm-project/production-stack/pull/579)
  *Herzlichen Dank an @andresd95.*

### Xinference

**Xinference** ist ein Open-Source-Multi-Modell-Inferenz-Framework von Xorbits mit **Supervisor/Worker**-Architektur für Multi-Modell-Dienste auf Kubernetes.

In der Praxis: (a) **kleine Modelle monopolisieren volle GPUs** — Verschwendung; (b) **begrenzte Quota/Observability** im Multi-Tenant-Betrieb.

Die Community merged **[PR #6]** mit **nativem HAMi-vGPU-Support** im Helm-Chart — per Flag HAMi aktivieren und `gpucores`, `gpumem-percentage` an Supervisor und Worker durchreichen.

![Xinference Helm chart integration with HAMi vGPU support](/images/blog/hami-v2.7.0/1760022774131.png)

**Ergebnisse**

* Kleine Modelle **teilen GPUs sicher** — **deutlich höhere Gesamtauslastung**.
* **Einfacheres Deployment:** kein Custom-Glue — HAMi out-of-the-box.
* **Quota & Observability** für Multi-User-/Multi-Job-Produktion.

**Zugehörige PRs**

* [https://github.com/xorbitsai/xinference-helm-charts/pull/6](https://github.com/xorbitsai/xinference-helm-charts/pull/6)
  *Vielen Dank an @calvin0327.*

### Volcano Dynamic MIG

Volcanos GPU-Virtualisierung erlaubt **teilweise GPU-Ressourcen** (Speicher/Compute); mit Device Plugin **Hardware-Isolation** — bessere Auslastung. Klassische Virtualisierung interceptet CUDA. Bei Ampere erlaubt **MIG** (**Multi-Instance GPU**) mehrere isolierte Instanzen; viele Schemas nutzen **fest vorgegebene Größen** — Verschwendung, weniger Flexibilität.

**Volcano v1.12:** **dynamische MIG-Erzeugung und -Scheduling**. Instanzgrößen **zur Laufzeit** nach angefragter Nutzung, **Best-Fit** gegen Verschwendung, **binpack**/**spread** gegen Fragmentierung. Einheitliche API (`volcano.sh/vgpu-number`, `…/vgpu-cores`, `…/vgpu-memory`).

![Volcano Dynamic MIG architecture showing runtime instance creation and best-fit allocation](/images/blog/hami-v2.7.0/1760022781830.png)

**Beispiel**

```YAML
apiVersion: v1
kind: Pod
metadata:
  name: gpu-pod1
  annotations:
    volcano.sh/vgpu-mode: "mig"
spec:
  containers:
    - name: ubuntu-container1
      image: ubuntu:20.04
      command: ["bash", "-c", "sleep 86400"]
      resources:
        limits:
          volcano.sh/vgpu-number: 1
          volcano.sh/vgpu-memory: 8000
```

**Design-Dokument:** [https://github.com/volcano-sh/volcano/blob/master/docs/design/dynamic-mig.md](https://github.com/volcano-sh/volcano/blob/master/docs/design/dynamic-mig.md)
**Benutzerhandbuch:** [https://volcano.sh/zh/docs/gpu_virtualization/](https://volcano.sh/zh/docs/gpu_virtualization/)
**PRs:** [https://github.com/volcano-sh/volcano/pull/4290](https://github.com/volcano-sh/volcano/pull/4290), [https://github.com/volcano-sh/volcano/pull/3953](https://github.com/volcano-sh/volcano/pull/3953)
*Danke an @sailorvii und @archlitchi.*

## Engineering-Verbesserungen & Fixes

### HAMi

**Kern-Scheduling:**

* Aggregierte Fehler-Events
* Quarantäne abnormer NVIDIA-Karten
* Einheitliches Device-Interface; weniger Annotations
* Aktualisierte Ascend-910-Strategie
* Erweiterte ResourceQuota (Multi-GPU-Korrektheit)

**Stabilität & Qualität:**

* Sicherere Typkonvertierungen; CI-Build-Fixes (inkl. 910B4-1-Template)
* vGPU-Metrik-Korrekturen; Allokations-Fixes
* Linting & Refactoring

### HAMi-core

* **Erweiterungen:** `cuMemcpy2D`-Hook; schlankere Dockerfiles; CI/CD + `cpplint`; Contributor-Guidelines
* **Stabilität:** NVML-Null-Pointer-Guards; genaue Prozess-Auslastung unter Parallelität; Fix seltener leerer Records
* **Codequalität:** Magic Numbers entfernt (`CUDA_DEVICE_MAX_COUNT`); Statistik accumulate→summarize-assign

### WebUI

* **Heterogene Telemetrie:** klarere Auslastung für Kapazitätsplanung und Incident-Triage.

---

## Contributors & neue Rollen

![HAMi contributors and team roles organizational chart](/images/blog/hami-v2.7.0/1760022871607.png)

* **HAMi Member:** @fyp711
* **HAMi Reviewers:** @lengrongfu, @chaunceyjiang, @Shouren, @ouyangluwei163
* **volcano-vgpu-device-plugin Reviewer & Approver:** @SataQiu
* **HAMi Website Owner:** @windsonsea

*Danke an alle Contributors, die HAMi voranbringen.*

---

## Ausblick

* **Kubernetes DRA:** First-Class **Dynamic Resource Allocation** für feingranulareres, policy-gesteuertes heterogenes Scheduling.
* **WebUI:** Mehr Analytics, Custom Alerts, historische Einblicke.
* **Ökosystem:** Tiefere Integration mit Hardware und KI-Frameworks für breitere reale Abdeckung.
