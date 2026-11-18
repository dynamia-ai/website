---
title: "HAMi v2.10.0 Deep Dive: Flexibles MIG, AMD vGPU und umfassendes Scheduling-Ökosystem-Upgrade"
coverTitle: HAMi v2.10.0 Deep Dive
date: '2026-08-21'
excerpt: >-
  HAMi v2.10.0 ist offiziell erschienen! Flexible MIG erstellt und gibt MIG-Instanzen on-demand
  per NVML frei, AMD Instinct MI300X erhält Software-vGPU-Support, die mutex-Policy und
  zusammensetzbare Scheduling-Policy-Ketten decken reale Cluster-Bedürfnisse ab, und KAI Resource
  Isolator plus Volcano-vNPU-Integration tragen HAMi-cores Isolation in ein breiteres
  Scheduling-Ökosystem.
author: Dynamia AI Team
tags:
  - HAMi
  - GPU-Sharing
  - vGPU
  - Kubernetes
  - MIG
  - AMD
  - Ascend
  - Volcano
  - Release
category: Product Release
linktitle: HAMi v2.10.0 Release Deep Dive
---

Das CNCF-Incubating-Projekt HAMi hat **v2.10.0** offiziell veröffentlicht. Drei Hauptlinien: **flexibleres Scheduling** (dynamisches Flexible MIG, zusammensetzbare Policy-Ketten, Gruppen-Scheduling), **breiteres Beschleuniger-Landscape** (AMD Instinct MI-Serie, Biren, vollständigeres Ascend-Management) und **größeres Ökosystem** (KAI Scheduler + HAMi-core, Volcano vNPU).

Dieser Artikel führt durch die Schlüsselfunktionen von v2.10.0 mit einsatzbereiten Konfigurationsbeispielen.

## Highlights auf einen Blick

![HAMi v2.10.0 highlights overview](/images/blog/hami-v210-deep-dive/highlights-tree-en.png)

**Flexibleres Scheduling:** Flexible MIG erstellt und gibt MIG-Instanzen dynamisch pro Workload per NVML frei — ohne Node-Drain; die `mutex`-Exklusiv-Policy und Policy-Ketten (z. B. `mutex,binpack,numa`) decken Exklusivität, Kompaktheit und NUMA-Affinität; ein NUMA-Sortier-Fix korrigiert `binpack` und `spread` auf Multi-NUMA-Topologien. PodGroup-Mitglieder vertreiben sich beim Binding nicht mehr gegenseitig; Init-Container-Ressourcenbuchführung entspricht Kubernetes-Standard.

**Breiteres Beschleuniger-Spektrum:** AMD Instinct MI300X mit Software-vGPU und Dual-Isolation (Speicher/Compute); Biren im Ganzkarten- und SVI-Partitionierungsmodus; Ascend-Cluster mischen vNPU-Hard-Partition und HAMi-core-Soft-Partition; Soft-Partition-Ressourcen mit Container-Level-Prometheus-Monitoring.

**Ökosystem-Integration:** KAI Resource Isolator bringt HAMi-cores Runtime-Hard-Isolation in den KAI Scheduler; Volcano schedult Ascend-Soft-Partition direkt — Batch-Semantik mit Container-Isolation.

**Engineering:** DRA-Komponenten in eigenständigem Chart; Ascend-DRA folgt mit HAMi-DRA-Chart; Build-Pipeline auf ubi8-Images für breitere GLIBC-Kompatibilität.

## Scheduling: flexibler und modularer

### Flexible MIG: Dynamisches MIG — Abschied von mig-parted

Wohl die auffälligste Scheduling-Änderung in v2.10.0, von [@FouoF](https://github.com/FouoF) ([HAMi #2378](https://github.com/Project-HAMi/HAMi/pull/2378)).

NVIDIA MIG (Multi-Instance GPU) ist die Hardware-Isolation auf A100 und neuer, aber „wie schneiden“ war immer schwierig:

| Ansatz | Schneidebasis | Workload-bewusst | Hauptproblem |
|-|-|-|-|
| NVIDIAs Original-MIG-Manager | Node-Vorzerlegung, mig-parted | Nein | Template-Wechsel = Node-Reconfig; workload-blind; kein CDI |
| HAMi Legacy Dynamic MIG (v2.5.0+) | Erster Workload, noch mig-parted | Teilweise | Erster Job fixiert Geometrie — z. B. 1g.5gb sperrt Karte auf kleine Templates |
| **v2.10.0 Flexible MIG** | **On-demand Erstellung/Freigabe per native NVML-APIs** | **Ja** | CDI noch nicht; Multi-Device-MIG in Validierung |

#### Neue Implementierung: NVML übernimmt den vollen MIG-Lebenszyklus

Ohne mig-parted **steuert NVML Discovery, Reporting, Erstellung und Freigabe von MIG-Instanzen direkt**. Der Scheduler entscheidet „wie groß“ und „wo“ (Placement). Lebenszyklus:

![Vollständiger Lebenszyklus einer Flexible-MIG-Instanz](/images/blog/hami-v210-deep-dive/flexible-mig-lifecycle-en.png)

Um native NVML-APIs:

- **Discovery und Placement-Planung:** `GetGpuInstanceProfileInfo`, `GetGpuInstancePossiblePlacements`
- **Erstellung und Freigabe:** `CreateGpuInstanceWithPlacement`, `CreateComputeInstance`; `GetGpuInstanceById` / `GpuInstance.Destroy()`
- **State Recovery:** GI/CI-Status in Pod-Annotations; nach Plugin-Restart `GetGpuInstances` zum Abgleichen und Aufräumen
- **Safety:** `Device.GetComputeRunningProcesses` verhindert Reset bei aktiven Workloads

Knoten-Annotations werden gekürzt, um zu lange Werte zu vermeiden.

#### Konfigurationsbeispiel

`mig`-Modus für MIG-Knoten (ConfigMap `hami-device-plugin`):

```json
{
  "nodeconfig": [
    {
      "name": "MIG-NODE-A",
      "operatingmode": "mig",
      "filterdevices": { "uuid": [], "index": [] }
    }
  ]
}
```

Optional per `knownMigGeometries` festlegen, „in was diese Karte geschnitten werden darf“:

```yaml
nvidia:
  knownMigGeometries:
    - models: ["A100-SXM4-40GB", "A100-40GB-PCIe", "A100-PCIE-40GB"]
      allowedGeometries:
        - name: 1g.5gb
          memory: 5120
          count: 7
        - name: 3g.20gb
          memory: 20480
          count: 2
        - name: 7g.40gb
          memory: 40960
          count: 1
```

Workloads wie bei jedem anderen HAMi-Workload einreichen — keine neuen Ressourcennamen:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: mig-pod
  annotations:
    nvidia.com/vgpu-mode: "mig" # optional; omit for flexible scheduling across MIG and hami-core nodes
spec:
  containers:
    - name: cuda-container
      image: nvidia/cuda:12.4.1-base-ubuntu22.04
      command: ["bash", "-c", "sleep 86400"]
      resources:
        limits:
          nvidia.com/gpu: 2 # 2 MIG instances
          nvidia.com/gpumem: 8000 # at least 8GiB memory per instance
```

#### Ein reales Scheduling-Experiment

A100-Test (1g überall platzierbar; 2g nur Positionen 0, 2, 4): 1g/2g-Jobs laufen; 3g-J Job bleibt Pending mangels Platz; nach Löschen des 1g-Pods passt 3g; 1g-Neuanlage in Restslots.

Legacy: Schritt drei dauerhaft Pending — Geometrie beim ersten Workload fixiert. Neu: dynamische Erstellung/Freigabe — **kein Drain, kein Cordon**. DCGM-Metriken: MIG-UUID, Profil, Instance-ID, Placement. Grenzen: CDI+MIG noch nicht; Multi-Device-MIG validieren — eigene Topologie testen.

### mutex-Policy und zusammensetzbare Scheduling-Policy-Ketten

Neue `mutex`-Policy ([HAMi #2011](https://github.com/Project-HAMi/HAMi/pull/2011), [@mesutoezdil](https://github.com/mesutoezdil)): annotierte Pods **exklusiv nur gegen andere `mutex`-Pods** — nie zwei `mutex`-Pods auf derselben GPU; volle Karte = ganze Karte anfordern:

```yaml
metadata:
  annotations:
    hami.io/gpu-scheduler-policy: "mutex"
```

`hami.io/gpu-scheduler-policy` akzeptiert eine **geordnete, kommagetrennte Policy-Kette** ([HAMi #2621](https://github.com/Project-HAMi/HAMi/pull/2621), [#2010](https://github.com/Project-HAMi/HAMi/issues/2010)). Reale Cluster wollen oft „exklusiv + kompakt + NUMA“ kombiniert:

```yaml
# Erst mutex filtern, dann binpack, NUMA als Tiebreaker
metadata:
  annotations:
    hami.io/gpu-scheduler-policy: "mutex,binpack,numa"
```

Kurz: `binpack`, `spread`, `numa` = Sortierschlüssel in Schreibreihenfolge; `mutex` und NVIDIA `topology-aware` = Filter vor Sortierung; reine Filter → Fallback `spread`; einzelne Policy wie bisher.

### PodGroup-Gruppen-Scheduling

v2.10.0: PodGroup-Gang-Scheduling ab **Kubernetes v1.35**. Pods mit Label `scheduling.x-k8s.io/pod-group` werden als Gruppe gebunden — passend für All-or-Nothing wie Distributed Training.

### Fix: Init-Container-Ressourcenbuchführung

Init-Container für Weights/Daten wurden überzählt (Summe aller Container). v2.10.0: `max(Σ App-Container, max(Init-Container))` ([HAMi #1773](https://github.com/Project-HAMi/HAMi/pull/1773), [@maishivamhoo123](https://github.com/maishivamhoo123)) — kein falsches „Knoten voll“:

```yaml
initContainers:
  - name: download-weights
    resources:
      limits:
        nvidia.com/gpu: 1
        nvidia.com/gpumem: 8000
containers:
  - name: inference
    resources:
      limits:
        nvidia.com/gpu: 1
        nvidia.com/gpumem: 16000
# Effektiv = max(16000, 8000) = 16000 MiB; ältere Versionen zählten 24000 MiB
```

## Beschleuniger-Landscape: AMD und Biren, heterogenes Ascend

### AMD Instinct MI300X: Software-vGPU für AMD

Bisher in Kubernetes bei AMD Instinct praktisch nur Ganzkarte. v2.10.0: [@FouoF](https://github.com/FouoF) und [@kenji-mido](https://github.com/kenji-mido) — **Software-vGPU** ([HAMi #2290](https://github.com/Project-HAMi/HAMi/pull/2290)), validiert **MI300X + ROCm 7.0.2**.

Ohne SR-IOV: [amd-device-plugin](https://github.com/Project-HAMi/amd-device-plugin) (0.0.1) installiert `libamvgpu.so` per `postStart`, injiziert via glibc `LD_AUDIT`, Limits per `HIP_DEVICE_MEMORY_LIMIT` — Speicher und Compute exakt nach Zuteilung:

![AMD software vGPU implementation architecture](/images/blog/hami-v210-deep-dive/amd-vgpu-architecture-en.png)

Ressourcen-Requests wie auf der NVIDIA-Seite:

| Dimension | Ressourcenname | Semantik |
|-|-|-|
| Speicherisolation | `amd.com/gpumem` (MiB) | Hartes Limit pro Karte; Nutzung überschreitet Zuteilung nicht |
| Compute-Isolation | `amd.com/gpucores` (0–100, CU %) | Obergrenze Compute-Units (z. B. `25` = 76 CUs bei 304 CUs) |
| Geräteanzahl | `amd.com/gpu` | Anzahl GPUs |

```yaml
resources:
  limits:
    amd.com/gpu: "1" # 1 GPU
    amd.com/gpumem: "49152" # 48 GiB memory
    amd.com/gpucores: "30" # 30% of compute units
```

Deployment: HAMi-Scheduler muss die drei AMD-Ressourcennamen verwalten, dann dediziertes Plugin installieren (**nicht** mit upstream ROCm `k8s-device-plugin` mischen; bei AMD GPU Operator erst eingebautes device-plugin deaktivieren):

```bash
helm upgrade --install amd-gpu \
  https://github.com/Project-HAMi/amd-device-plugin/releases/download/amd-gpu-helm-0.0.1/amd-gpu-0.0.1.tgz \
  --namespace kube-system \
  --create-namespace
```

Einschränkungen: Workload-Images **glibc-basiert, GLIBC ≥ 2.34** (aktuelle `rocm/pytorch`-Tags); Alpine/musl, Ubuntu 20.04, RHEL 8 noch nicht; RDNA/WGP nicht; Single-Pod-Multi-GPU unvalidiert.

### Biren-Geräteunterstützung

v2.10.0: Management für Biren ([HAMi #1711](https://github.com/Project-HAMi/HAMi/pull/1711), [@DSFans2014](https://github.com/DSFans2014), `Biren166M`) — Ganzkarte oder feste SVI-2/4-Partition. Knoten labeln; Biren ohne Speicher-/Compute-Unterteilung — Pod erhält Ganzkarte oder eine SVI-Partition:

```bash
kubectl label node <node-name> biren=on
```

```yaml
resources:
  limits:
    birentech.com/gpu: "1"
```

HAMi deckt u. a. NVIDIA, AMD, Huawei Ascend, Cambricon, Hygon, Biren, Enflame, MetaX, Moore Threads, Kunlunxin, Iluvatar CoreX, AWS Neuron, Vastai ab.

### Ascend-Heterogen-Modus: vNPU und HAMi-core im selben Cluster

v2.9.0: HAMi-core nur mit expliziten Annotations — zwei Manifeste. v2.10.0: Ascend-Workloads **modusagnostisch** — ohne `huawei.com/vnpu-mode` auf Template-Knoten vNPU-Hard-Partition, auf hami-core-Knoten Soft-Partition ([HAMi #2035](https://github.com/Project-HAMi/HAMi/pull/2035), [ascend-device-plugin #106](https://github.com/Project-HAMi/ascend-device-plugin/pull/106), [@ouyangluwei163](https://github.com/ouyangluwei163)); mit Annotation am Modus festgepinnt, Ablehnung nur wenn Knoten kein hami-core hat:

```yaml
# Explizit Soft-Partition anfordern (optional)
metadata:
  annotations:
    huawei.com/vnpu-mode: "hami-core"
spec:
  containers:
    - name: npu-container
      resources:
        limits:
          huawei.com/Ascend910B3: "1"
          huawei.com/Ascend910B3-memory: "28672"
          huawei.com/Ascend910B3-core: "40" # 40% compute cores
```

### Ascend vNPU HAMi-core: von „zuteilbar“ zu „beobachtbar“

v2.9.0 brachte Ascend-Soft-Partition (hami-core), lange „Zuteilung sichtbar, Nutzung unsichtbar“. v2.10.0: [@maverick123123](https://github.com/maverick123123) integriert Prometheus in vNPU-HAMi-core ([ascend-device-plugin #93](https://github.com/Project-HAMi/ascend-device-plugin/pull/93)):

- **Metrics-Server (Port 9395):** nur bei `hami-vnpu-core`, ohne Extra-Deployment.
- **Container-AICore:** `hami_container_device_utilization_ratio` korrekt per UUID.
- **Gerätespeicher:** `hami_host_gpu_memory_used_bytes` aus Container-Nutzung — genauer beim Sharing.
- **Prozess-HBM:** DCMI, Shared-Memory-Buchführung z. B. vLLM TP=2 ([ascend-device-plugin #87](https://github.com/Project-HAMi/ascend-device-plugin/pull/87), [hami-vnpu-core #10](https://github.com/Project-HAMi/hami-vnpu-core/pull/10)).

```promql
# AICore-Auslastung pro Container
hami_container_device_utilization_ratio

# Genutzter Speicher pro vNPU (nach Container aggregiert)
hami_host_gpu_memory_used_bytes
```

Monitoring per [ascend-device-plugin Helm chart](https://github.com/Project-HAMi/ascend-device-plugin) ([#108](https://github.com/Project-HAMi/ascend-device-plugin/pull/108)) in bestehendes Prometheus + Grafana.

## Ökosystem-Integration: KAI Scheduler und Volcano

### KAI Scheduler + HAMi-core: KAI Resource Isolator

[NVIDIA KAI Scheduler](https://github.com/kai-scheduler/KAI-Scheduler) ist stark beim GPU-Sharing, garantiert aber nur „Summe der Requests passt auf eine Karte“ — keine physische Oversubscription-Verhinderung zur Laufzeit. v2.10.0 liefert [KAI Resource Isolator](https://github.com/Project-HAMi/KAI-resource-isolator) (v1.1.0) von [@archlitchi](https://github.com/archlitchi), Monitoring [@dttung2905](https://github.com/dttung2905) — HAMi-core-Runtime-Isolation im KAI-Stack, von „kooperativ“ zu „harter Isolation“.

Klare Arbeitsteilung: **KAI Scheduler entscheidet „wer wie viel bekommt“; der Isolator garantiert „was Sie bekommen, ist alles, was Sie nutzen können“**.

![KAI Resource Isolator architecture](/images/blog/hami-v210-deep-dive/kai-resource-isolator-en.png)

Installation in zwei Schritten (KAI Scheduler v0.17.0 oder neuer):

```bash
# 1. Install KAI Scheduler with GPU sharing and the hamicore plugin enabled
helm install kai-scheduler oci://ghcr.io/nvidia/kai-scheduler \
  --version v0.17.0 \
  --set global.gpuSharing=true \
  --set binder.plugins.hamicore.enabled=true \
  --namespace kai-scheduler --create-namespace

# 2. Install the node-side isolator (chart versions carry a -chart suffix)
helm install kai-resource-isolator oci://docker.io/projecthami/kai-resource-isolator \
  --namespace kai-resource-isolator --create-namespace \
  --version 1.1.0-chart
```

Ab dann erhält jeder von KAI schedulerte Pod mit `gpu-memory`-Annotation automatisch harte Speicherisolation:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: gpu-sharing-with-isolation
  labels:
    kai.scheduler/queue: default-queue
  annotations:
    gpu-memory: "4096" # in MiB
spec:
  schedulerName: kai-scheduler
  containers:
    - name: gpu-workload
      image: nvidia/cuda:12.9.2-base-ubuntu24.04
      command: ["sleep", "infinity"]
```

Verifikation: `nvidia-smi` im Container zeigt die Zuteilung, nicht den gesamten Kartenspeicher — kein Over-Allocate:

```bash
kubectl exec -it gpu-sharing-with-isolation -- nvidia-smi
```

Architektur und Isolator sind da; zwei Hardening-PRs laufen: fraktionsbasierte Speicher-Durchsetzung ([KAI-resource-isolator #6](https://github.com/Project-HAMi/KAI-resource-isolator/pull/6)) und Non-Root-Verzeichnisrechte ([#22](https://github.com/Project-HAMi/KAI-resource-isolator/pull/22)). In Produktion mit harter Isolation zuerst prüfen, ob Limits greifen. Hintergrund: [KAI Scheduler + HAMi GPU Memory Hard Isolation](https://project-hami.io/blog/kai-scheduler-hami-gpu-memory-hard-isolation).

### Volcano vNPU: Batch-Scheduler planen Ascend-Soft-Partitionen

Volcano ist in vielen KI-Clustern der Batch-Scheduler. v2.10.0 erfindet Soft-Partition nicht neu, sondern **tauscht den „Allocator“ von HAMi Scheduler zu Volcano** und nutzt die unteren Schichten unverändert:

| Schicht | HAMi-2.9-Pfad | Volcano-Integrationspfad |
|-|-|-|
| Scheduler | HAMi Scheduler | Volcano Scheduler |
| Device Discovery/Mount | ascend-device-plugin | dasselbe ascend-device-plugin |
| Soft-Partition-Ausführung | hami-vnpu-core (libvnpu.so) | dasselbe hami-vnpu-core |
| Queues, Gang, Binpack | nicht Fokus | von Volcano |

Volcano plant Ascend-vNPU in zwei Modi: natives Ascend-Plugin **MindCluster** (`AscendMindClusterVNPUEnable`, Treiber-Template-Hard-Partition) und **HAMi-Modus** (`AscendHAMiVNPUEnable`, hami-core Soft-Partition). v2.10.0 vervollständigt den Soft-Partition-Pfad im HAMi-Modus — der einzige der beiden Modi mit Runtime-Speicher-/Compute-Limits:

![Volcano scheduling Ascend vNPU in HAMi mode](/images/blog/hami-v210-deep-dive/volcano-vnpu-flow-en.png)

#### Konfigurationsbeispiel

Volcano: HAMi-Modus für `deviceshare` in `volcano-scheduler-configmap`:

```yaml
AscendHAMiVNPUEnable: "true" # enable HAMi-mode Ascend vNPU
SchedulePolicy: binpack # pack slices onto the same physical card where possible
KnownGeometriesCMName: hami-scheduler-device # source of vNPU geometries
```

Knoten: ascend-device-plugin im Soft-Partition-Modus (`hamiVnpuCore: true`). Pod: `schedulerName: volcano`, `runtimeClassName: ascend`, Annotation `huawei.com/vnpu-mode: hami-core`, zwei Extended Resources:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: ascend-vnpu-check
  annotations:
    huawei.com/vnpu-mode: "hami-core" # without this annotation the template path is used; on pure soft-partition nodes the Pod may stay Pending forever
spec:
  schedulerName: volcano
  runtimeClassName: ascend
  containers:
    - name: npu
      image: ascendhub.huawei.com/public-ascendhub/ascend-mindspore:23.0.RC3-centos7
      command: ["bash", "-c", "sleep 86400"]
      resources:
        limits:
          huawei.com/Ascend310P: "1"
          huawei.com/Ascend310P-memory: "8192" # 8 GiB slice
```

#### Validierung auf Real-Hardware

Community validierte die Kette auf Single-Node Ascend 310P3 (aarch64, npu-smi 25.5.1, Kubernetes 1.28); Pfad für heterogene Ascend-Cluster 910A/910B2/910B3/310P:

- **Slice-Isolation:** Container mit 8192 MiB: `npu-smi info` zeigt `0 / 8192 MB`, Host `1848 / 21525 MB` — `libvnpu.so` schreibt Abfrage auf Container-Quota um
- **Binpack-Co-Location:** zweiter Pod gleicher Spec auf dieselbe Karte (gleiche Bus-Id), je 8192 MiB; Knoten 2 vNPUs, 16384 MiB
- **Monitoring:** `hami_vgpu_memory_limit_bytes` pro Pod auf `:9395`, exakt 8192 MiB

#### Hinweise

- **Versionen:** Volcano 1.14+ für HAMi-Modus; Soft-Partition 1.16+, nur ARM
- **libvnpu.so muss zum NPU-Treiber passen** — sonst hängt `npu-smi` im Container
- **Metriken am Plugin-Pod:** `:9395` vom DaemonSet, nicht aus Workload-Pods
- **Isolation:** Runtime-API-Interception, keine SR-IOV-Hardwaregrenze

Theorie und Befehlsausgaben: [Volcano + HAMi-core soft-partitioned Ascend vNPU](https://project-hami.io/blog/volcano-ascend-vnpu-soft-slicing), [ascend-device-plugin Volcano guide](https://github.com/Project-HAMi/ascend-device-plugin/blob/main/docs/volcano.md).

## Engineering- und Build-Verbesserungen

Unauffällig, aber entscheidend für produktionsfreundlichen Betrieb:

**Eigenständiges DRA-Chart** ([HAMi #2038](https://github.com/Project-HAMi/HAMi/pull/2038), [@archlitchi](https://github.com/archlitchi)): DRA-Komponenten aus Haupt-Chart in [HAMi-dra](https://github.com/Project-HAMi/HAMi-dra). Ohne DRA kein Mitpull; Haupt-Chart schlanker; DRA eigenes Release-Tempo.

**Handshake-Annotation-Cleanup** ([HAMi #2052](https://github.com/Project-HAMi/HAMi/pull/2052), [@archlitchi](https://github.com/archlitchi)): Keys werden entfernt statt `Deleted_*`-Marker — konsistente Node-Health-Berichte.

**ubi8-Build-Images** ([HAMi #1958](https://github.com/Project-HAMi/HAMi/pull/1958), [@spencercjh](https://github.com/spencercjh)): Build auf `nvidia/cuda:13.3.0-cudnn-devel-ubi8` — breitere GLIBC-Kompatibilität, wichtig für HAMi-core als injizierte `.so`.

**mock-device-plugin NPU-Templates** ([mock-device-plugin #18](https://github.com/Project-HAMi/mock-device-plugin/pull/18), [@Wangmin362](https://github.com/Wangmin362)): nested und flat `vnpus`, Ascend AI-Core und Hygon DCU — vNPU-Scheduling-Tests ohne Hardware.

## Contributors

v2.10.0 entstand in HAMi-Hauptrepo und Project-HAMi-Repos (ascend-device-plugin, KAI-resource-isolator, mock-device-plugin, hami-vnpu-core, amd-device-plugin). Feature-Leads:

- [@archlitchi](https://github.com/archlitchi): release coordination, KAI Resource Isolator, DRA chart split, handshake annotation cleanup
- [@mesutoezdil](https://github.com/mesutoezdil): mutex scheduling policy, NUMA sorting fix, composable policy chains
- [@maverick123123](https://github.com/maverick123123): Ascend vNPU HAMi-core monitoring
- [@ouyangluwei163](https://github.com/ouyangluwei163): Ascend heterogeneous mode (vNPU + HAMi-core coexistence)
- [@FouoF](https://github.com/FouoF), [@kenji-mido](https://github.com/kenji-mido): AMD MI300X vGPU, Flexible MIG
- [@DSFans2014](https://github.com/DSFans2014): Biren device support, vNPU monitoring Helm chart
- [@lin121291](https://github.com/lin121291): PodGroup gang scheduling
- [@maishivamhoo123](https://github.com/maishivamhoo123): init-container resource accounting
- [@Wangmin362](https://github.com/Wangmin362): mock-device-plugin NPU templates
- [@spencercjh](https://github.com/spencercjh): ubi8 build images
- [@dttung2905](https://github.com/dttung2905): KAI vGPU monitoring and non-root workload fixes

Davon [@archlitchi](https://github.com/archlitchi) (Release-Koordination, KAI), [@FouoF](https://github.com/FouoF) (Flexible MIG, AMD), [@maverick123123](https://github.com/maverick123123) (Ascend-Monitoring), [@spencercjh](https://github.com/spencercjh) (Build) vom Dynamia-Team. Danke an alle Contributors, Issue-Melder, RC-Tester und Produktions-Feedback. Vollständige Liste: [v2.10.0 Release Notes](https://github.com/Project-HAMi/HAMi/releases/tag/v2.10.0).

## Upgrade-Anleitung

```bash
helm repo add hami-charts https://project-hami.github.io/HAMi/
helm repo update
helm upgrade hami hami-charts/hami -n kube-system
```

| Nutzertyp | Upgrade-Hinweise |
|-|-|
| DRA-Nutzer | DRA nicht mehr im Haupt-Chart; [HAMi-dra](https://github.com/Project-HAMi/HAMi-dra) verwenden |
| AMD-Nutzer | [amd-device-plugin](https://github.com/Project-HAMi/amd-device-plugin); Images GLIBC 2.34+ |
| Ascend-Nutzer | vNPU-Monitoring braucht `hami-core`; Volcano Soft-Partition 1.16+, nur ARM |
| Alle | Zuerst in Testumgebung kompatibilität prüfen |

## Community-Update seit v2.9.0

Die über drei Monate seit v2.9.0 (Mai 2026) waren außergewöhnlich aktiv: Meilensteine, Partnerschaften, Fallstudien, Events:

![Community highlights timeline since v2.9.0](/images/blog/hami-v210-deep-dive/community-timeline-en.png)

**Wichtige Meilensteine**

- **CNCF Incubating** (Juli): HAMi von Sandbox zu Incubating — Schlüsselstück cloud-nativer heterogener Compute-Landschaft. [Ankündigung](https://project-hami.io/blog/hami-cncf-incubating)
- **HAMi-core im KAI Scheduler** (Juni): GPU-Speicher-Hard-Isolation — KAI Resource Isolator in diesem Artikel als Erweiterung. [Ankündigung](https://project-hami.io/blog/hami-core-adopted-by-nvidia-kai-scheduler)

**Anwender-Fallstudien**

- **China Merchants Bank** (Juli): einheitliche heterogene KI-Compute-Plattform mit Topologie-Scheduling und Fein-Sharing; Pool-Auslastung 100 %, Cross-Node-Training -30 %, Slicing bis 1 GB Speicher und 1 % Compute pro Karte. [Fallstudie](https://www.cncf.io/case-studies/china-merchants-bank/)
- **SNOW** (Mai): 1000+ A100 mit HAMi und KEDA für 200 Mio.+ Nutzer; halbierte GPU-Bedarf Train+Inferenz, 700 %-Spitzen, ~17,4 Mio. USD Einsparung, MTTR ~2 h → ~10 min. [Fallstudie](https://www.cncf.io/case-studies/snow-corp/)

**Community-Events**

- **KubeCon + CloudNativeCon India 2026** (Juni): [Recap](https://project-hami.io/blog/kubecon-india-2026-recap)
- **KCD Vietnam 2026** (Juli, Hanoi): „From Project to Production: HAMi and Viettel Cloud“. [Details](https://project-hami.io/landing/kcd-vietnam)
- **vLLM Meetup Shanghai** (Juli): Li Mengxuan — vLLM-Inferenzcluster-Optimierung. [Recap](https://project-hami.io/blog/vllm-meetup-shanghai-2026-recap)
- **KubeCon + CloudNativeCon Japan 2026** (Yokohama): Stand und Talk; SNOW vor Ort. [Recap](https://project-hami.io/blog/kubecon-japan-2026-recap)
- **COSCUP 2026** (Taipei): Multi-Workload auf einer GPU, 40–60 % Kostenreduktion. [Details](https://project-hami.io/landing/coscup-2026)
- **Open Source Summit Korea 2026** (Seoul): Edge-AI mit HAMi. [Details](https://project-hami.io/landing/opensource-summit-korea)

**Mentorship**

- **LFX Mentorship 2026 Term 3** (Bewerbung ab August): vier GPU-Sharing-Projekte. [Leitfaden](https://project-hami.io/blog/lfx-mentorship-2026-term-3)

## Kommendes Event: HAMi Meetup Shanghai

**„Compute Efficiency over Compute Arms Race | HAMi Meetup Shanghai · Incubating Special“** am 6. September — erste Community-Versammlung seit CNCF Incubating:

- Zeit: 6. September 2026 (So.), 14:00–21:20 (Check-in ab 13:30)
- Ort: Daxue Road 322, Yangpu, Shanghai (Wujiaochang Innovation & Entrepreneurship College)
- Gastgeber: Dynamia, HAMi Community
- Co-Organisator: Shanghai Wujiaochang Innovation & Entrepreneurship College

Nachmittag: 5 Tech-Talks und Panel; Abend: Incubating-Feier mit My HAMi Story, Dank und Networking.

## Fazit

v2.10.0 um „Scheduling-Flexibilität, Beschleuniger-Breite, Ökosystem-Tiefe“: Flexible MIG macht MIG elastisch, Policy-Ketten und Gang-Scheduling schließen Cluster-Lücken, AMD und Biren erweitern das Landscape, Ascend-Heterogenität und Observability reifen, KAI trägt HAMi-core-Isolation weiter.

Weiterarbeit: Multi-Device-Validierung Flexible MIG, fraktionsbasierte KAI-Isolator-Limits; Ascend-DRA folgt mit HAMi-DRA-Chart. Ideen zu GPU-Virtualisierung oder heterogenem Scheduling? Join the HAMi community.

**Verwandte Links:**

- GitHub Release: [HAMi v2.10.0](https://github.com/Project-HAMi/HAMi/releases/tag/v2.10.0)
- Offizielle Release Notes: [Englisch](https://project-hami.io/blog/hami-v2-10-0-release) / [Chinesisch](https://project-hami.io/zh/blog/hami-v2-10-0-release)
- KAI Resource Isolator: [https://github.com/Project-HAMi/KAI-resource-isolator](https://github.com/Project-HAMi/KAI-resource-isolator)
- Ascend Device Plugin: [https://github.com/Project-HAMi/ascend-device-plugin](https://github.com/Project-HAMi/ascend-device-plugin)
- AMD Device Plugin: [https://github.com/Project-HAMi/amd-device-plugin](https://github.com/Project-HAMi/amd-device-plugin)
- Community Discord (empfohlen): [https://discord.gg/Amhy7XmbNq](https://discord.gg/Amhy7XmbNq)
- CNCF Slack: [https://cloud-native.slack.com/archives/C07T10BU4R2](https://cloud-native.slack.com/archives/C07T10BU4R2)
