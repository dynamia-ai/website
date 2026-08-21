---
title: "HAMi v2.10.0 Deep Dive: Flexible MIG, AMD vGPU, and a Full Scheduling Ecosystem Upgrade"
coverTitle: HAMi v2.10.0 Deep Dive
date: '2026-08-21'
excerpt: >-
  HAMi v2.10.0 is officially released! Flexible MIG creates and reclaims MIG instances on demand
  via NVML, AMD Instinct MI300X gains software vGPU support, the mutex policy and composable
  scheduling policy chains cover real-cluster needs, and the KAI Resource Isolator plus Volcano
  vNPU integration carry HAMi-core's isolation into a broader scheduling ecosystem.
author: Dynamia AI Team
tags:
  - HAMi
  - GPU Sharing
  - vGPU
  - Kubernetes
  - MIG
  - AMD
  - Ascend
  - Volcano
  - Release
category: Product Release
language: en
linktitle: HAMi v2.10.0 Release Deep Dive
---

The CNCF Incubating project HAMi has officially released **v2.10.0**. This version unfolds along three main lines: **more flexible scheduling** (dynamic Flexible MIG, composable scheduling policy chains, group scheduling), **a broader accelerator landscape** (AMD Instinct MI series, Biren, and more complete Ascend management), and **a larger ecosystem** (KAI Scheduler + HAMi-core integration, Volcano vNPU).

This article walks through the key features of v2.10.0 with ready-to-use configuration examples.

## Highlights at a Glance

![HAMi v2.10.0 highlights overview](/images/blog/hami-v210-deep-dive/highlights-tree-en.png)

**More flexible scheduling**: Flexible MIG creates and reclaims MIG instances dynamically per workload based on NVML, with no node draining required; the `mutex` exclusive policy and composable policy chains (such as `mutex,binpack,numa`) cover combined demands for exclusivity, compactness, and NUMA affinity; a NUMA sorting fix makes `binpack` and `spread` behave correctly on multi-NUMA topologies. In addition, PodGroup members no longer evict each other during binding, and init-container resource accounting now aligns with standard Kubernetes semantics.

**A broader accelerator landscape**: The AMD Instinct MI300X gains software vGPU support with dual memory and compute isolation; Biren accelerators are supported in both whole-card and SVI partition modes; Ascend clusters can now mix vNPU hard-partition nodes and HAMi-core soft-partition nodes in the same cluster, and soft-partitioned resources gain container-level Prometheus monitoring.

**Ecosystem integration**: The new companion project KAI Resource Isolator brings HAMi-core's runtime hard isolation into KAI Scheduler; Volcano can now directly schedule Ascend soft-partitioned resources, letting batch scheduling semantics work together with container-level isolation.

**Engineering improvements**: DRA components are split into a standalone chart, making the main chart leaner; Ascend-DRA support for Ascend NPUs is coming soon and will ship with the HAMi-DRA chart independently; the build pipeline moves to ubi8 images so the same build artifacts run on more target distributions.

## Scheduling: More Flexible, More Composable

### Flexible MIG: Dynamic MIG That Finally Retires mig-parted

This is arguably the most notable scheduling-side change in v2.10.0, implemented by [@FouoF](https://github.com/FouoF) ([HAMi #2378](https://github.com/Project-HAMi/HAMi/pull/2378)).

NVIDIA MIG (Multi-Instance GPU) is the hardware-level isolation scheme on A100 and newer architectures, but "how to slice" has always been a pain:

| Approach | Slicing basis | Workload-aware | Main problem |
|-|-|-|-|
| NVIDIA's original MIG manager | Node-level pre-slicing, depends on mig-parted | No | Switching templates requires node reconfiguration; unaware of workloads; no CDI support |
| HAMi's legacy dynamic MIG (v2.5.0+) | Triggered by the first workload, still depends on mig-parted | Partially | The first workload decides the slicing: if it only asks for 1g.5gb, the whole card is locked into small templates and later large jobs cannot run |
| **v2.10.0 Flexible MIG** | **Created and reclaimed on demand per workload, based on native NVML APIs** | **Yes** | No CDI support yet; multi-device MIG scenarios pending further validation |

#### The new implementation: NVML takes over the full MIG lifecycle

The new implementation no longer depends on mig-parted; it **controls the discovery, reporting, creation, and reclamation of MIG instances directly through NVML**. The scheduler decides not only "how big to slice" but also "where to slice" (placement). The full lifecycle of a MIG instance looks like this:

![The full lifecycle of a Flexible MIG instance](/images/blog/hami-v210-deep-dive/flexible-mig-lifecycle-en.png)

The implementation is built around a set of native NVML APIs:

- **Discovery and placement planning**: `GetGpuInstanceProfileInfo` (queries a profile's memory and SM capability), `GetGpuInstancePossiblePlacements` (queries available placements)
- **Creation and reclamation**: `CreateGpuInstanceWithPlacement` (creates a GI at the scheduler-chosen location), `CreateComputeInstance`; `GetGpuInstanceById` / `GpuInstance.Destroy()` handle lookup and destruction
- **State recovery**: GI/CI state is recorded in Pod annotations; `GetGpuInstances` lets the device-plugin, after a restart, find existing GIs, reconcile and verify them, and clean up leftover instances on idle GPUs
- **Safety guardrails**: `Device.GetComputeRunningProcesses` checks whether compute processes are still running on the device, avoiding resets of GPUs with active workloads

Additionally, node-reported annotations are trimmed to avoid overly long annotation values.

#### Configuration example

Enable `mig` mode for MIG nodes (ConfigMap of `hami-device-plugin`):

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

Optionally, constrain "what this card is allowed to be sliced into" via `knownMigGeometries`:

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

Then submit workloads with exactly the same API as every other HAMi workload — no new resource names to learn:

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

#### A real scheduling experiment

A real test on A100 (1g templates can be placed anywhere; 2g templates only allow positions 0, 2, 4) shows the on-demand behavior intuitively: 1g and 2g jobs submitted first are created and run normally; a 3g job submitted next stays Pending because remaining placements are insufficient; after the 1g Pod is deleted, the freed space happens to fit the 3g job and it schedules successfully; recreating the 1g job then also runs in the remaining slots.

Under the legacy implementation, the same sequence would be permanently Pending at step three, because the card's geometry was locked in when the first workload arrived. The new version digests workload changes through dynamic creation and reclamation — **no node draining, no cordon, ever**. For monitoring, DCGM-style metrics expose the MIG UUID, profile, instance ID, and placement coordinates. Known limitations: CDI mode is not yet supported together with MIG; multi-device MIG scenarios are pending validation — test on your own topology first.

### The mutex Policy and Composable Scheduling Policy Chains

The new `mutex` policy ([HAMi #2011](https://github.com/Project-HAMi/HAMi/pull/2011), [@mesutoezdil](https://github.com/mesutoezdil)) makes annotated Pods **mutually exclusive only with other `mutex` Pods** — two `mutex` Pods will never land on the same GPU; for full whole-card exclusivity, just request the whole card:

```yaml
metadata:
  annotations:
    hami.io/gpu-scheduler-policy: "mutex"
```

`hami.io/gpu-scheduler-policy` now accepts an **ordered, comma-separated policy chain** ([HAMi #2621](https://github.com/Project-HAMi/HAMi/pull/2621), closing [#2010](https://github.com/Project-HAMi/HAMi/issues/2010)). Real clusters rarely want a single policy — they want "exclusive + compact + NUMA affinity" combined:

```yaml
# First filter idle GPUs with mutex, then sort by binpack, with NUMA as the tiebreaker
metadata:
  annotations:
    hami.io/gpu-scheduler-policy: "mutex,binpack,numa"
```

Rules in brief: `binpack`, `spread`, and `numa` are sorting keys applied in written order; `mutex` and NVIDIA's `topology-aware` are filters that remove candidates before sorting; a pure-filter combination falls back to `spread`; a single policy value behaves exactly as before.

### PodGroup Group Scheduling

v2.10.0 supports PodGroup gang scheduling on **Kubernetes v1.35 and above**. Pods carrying the `scheduling.x-k8s.io/pod-group` label are scheduled and bound as one group — a good fit for all-or-nothing workloads such as distributed training.

### init-container Resource Accounting Fix

Pods that use init containers to download weights or prepare data were previously over-counted: the scheduler summed all containers' requests, implicitly assuming init containers run in parallel with app containers. v2.10.0 aligns with standard Kubernetes semantics — the effective request becomes `max(Σ app containers, max(init containers))` ([HAMi #1773](https://github.com/Project-HAMi/HAMi/pull/1773), [@maishivamhoo123](https://github.com/maishivamhoo123)), eliminating the false "node is full when it clearly isn't":

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
# Effective request = max(16000, 8000) = 16000 MiB; older versions miscounted it as 24000 MiB
```

## Accelerator Landscape: AMD and Biren Join, Ascend Goes Heterogeneous

### AMD Instinct MI300X: AMD Gets Software vGPU Too

Until now, AMD Instinct series GPUs in Kubernetes were basically whole-card only. In v2.10.0, [@FouoF](https://github.com/FouoF) and [@kenji-mido](https://github.com/kenji-mido) partnered to deliver **software vGPU support** ([HAMi #2290](https://github.com/Project-HAMi/HAMi/pull/2290)), validated on **MI300X + ROCm 7.0.2**.

The implementation does not rely on hardware SR-IOV: the [amd-device-plugin](https://github.com/Project-HAMi/amd-device-plugin) (0.0.1) installs `libamvgpu.so` on the node via a `postStart` hook, injects it into workloads through glibc `LD_AUDIT`, and then enforces hard limits via `HIP_DEVICE_MEMORY_LIMIT` — for both memory and compute, you use exactly what you are allocated:

![AMD software vGPU implementation architecture](/images/blog/hami-v210-deep-dive/amd-vgpu-architecture-en.png)

Resource requests keep the same experience as the NVIDIA side:

| Dimension | Resource name | Semantics |
|-|-|-|
| Memory isolation | `amd.com/gpumem` (MiB) | Hard per-card limit; usage never exceeds the allocated value |
| Compute isolation | `amd.com/gpucores` (0-100, CU%) | Caps the compute-unit percentage (e.g. `25` equals 76 CUs on a 304-CU device) |
| Device count | `amd.com/gpu` | Number of GPUs |

```yaml
resources:
  limits:
    amd.com/gpu: "1" # 1 GPU
    amd.com/gpumem: "49152" # 48 GiB memory
    amd.com/gpucores: "30" # 30% of compute units
```

Deployment: make sure the HAMi scheduler manages the three AMD resource names, then install the dedicated plugin (**do not** mix it with the upstream ROCm `k8s-device-plugin`; if the AMD GPU Operator manages drivers, disable its built-in device-plugin first):

```bash
helm upgrade --install amd-gpu \
  https://github.com/Project-HAMi/amd-device-plugin/releases/download/amd-gpu-helm-0.0.1/amd-gpu-0.0.1.tgz \
  --namespace kube-system \
  --create-namespace
```

Limitations: workload images must be **glibc-based with GLIBC 2.34 or newer** (recent `rocm/pytorch` tags qualify); Alpine/musl, Ubuntu 20.04, and RHEL 8 are not supported yet; RDNA/WGP-architecture devices are not supported; single-Pod multi-GPU scenarios are unvalidated due to lack of hardware.

### Biren Device Support

v2.10.0 adds management support for Biren accelerators ([HAMi #1711](https://github.com/Project-HAMi/HAMi/pull/1711), [@DSFans2014](https://github.com/DSFans2014), validated on `Biren166M`), in two modes — whole card and fixed SVI 2/4 partitions. Label the node and go; note that Biren is not subdivided by memory or compute — a Pod gets the whole card or one SVI partition:

```bash
kubectl label node <node-name> biren=on
```

```yaml
resources:
  limits:
    birentech.com/gpu: "1"
```

With this release, HAMi's accelerator coverage includes NVIDIA, AMD, Huawei Ascend, Cambricon, Hygon, Biren, Enflame, MetaX, Moore Threads, Kunlunxin, Iluvatar CoreX, AWS Neuron, Vastai, and more.

### Ascend Heterogeneous Mode: vNPU and HAMi-core Coexist in One Cluster

In v2.9.0, HAMi-core mode required explicit Pod annotations, so operators maintained two workload manifests. v2.10.0 makes Ascend workloads **mode-agnostic**: a Pod without the `huawei.com/vnpu-mode` annotation takes vNPU hard partitioning on template nodes and soft partitioning on hami-core nodes ([HAMi #2035](https://github.com/Project-HAMi/HAMi/pull/2035), [ascend-device-plugin #106](https://github.com/Project-HAMi/ascend-device-plugin/pull/106), [@ouyangluwei163](https://github.com/ouyangluwei163)); Pods with an explicit annotation stay pinned to that mode and are rejected only when the node genuinely lacks hami-core support:

```yaml
# Explicitly request soft partitioning (optional)
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

### Ascend vNPU HAMi-core: From "Allocatable" to "Observable"

HAMi v2.9.0 introduced Ascend soft partitioning (hami-core mode), but soft-partitioned resources remained "allocation visible, usage invisible" for a long time. In v2.10.0, [@maverick123123](https://github.com/maverick123123) built a Prometheus metrics service into vNPU HAMi-core mode ([ascend-device-plugin #93](https://github.com/Project-HAMi/ascend-device-plugin/pull/93)), turning soft-partitioned resources into observable, operable objects:

- **Built-in metrics server (port 9395)**: starts only when `hami-vnpu-core` mode is enabled, at zero extra deployment cost.
- **Container-level AICore utilization**: `hami_container_device_utilization_ratio` maps correctly by device UUID instead of falling back to the first device.
- **Device-level memory**: `hami_host_gpu_memory_used_bytes` is aggregated from container-level usage, more accurate in sharing scenarios.
- **Process-level HBM tracking**: collected via DCMI, supporting per-container shared-memory accounting for multi-card tensor parallel inference such as vLLM TP=2 ([ascend-device-plugin #87](https://github.com/Project-HAMi/ascend-device-plugin/pull/87), [hami-vnpu-core #10](https://github.com/Project-HAMi/hami-vnpu-core/pull/10)).

```promql
# AICore utilization per container
hami_container_device_utilization_ratio

# Used memory per vNPU (aggregated by container)
hami_host_gpu_memory_used_bytes
```

The monitoring stack can be deployed directly with the [ascend-device-plugin Helm chart](https://github.com/Project-HAMi/ascend-device-plugin) ([#108](https://github.com/Project-HAMi/ascend-device-plugin/pull/108)) and plugged into your existing Prometheus + Grafana.

## Ecosystem Integration: KAI Scheduler and Volcano

### KAI Scheduler + HAMi-core: KAI Resource Isolator

NVIDIA's open-source [KAI Scheduler](https://github.com/kai-scheduler/KAI-Scheduler) is strong at GPU sharing and scheduling, but a scheduler can only guarantee that "the sum of requests fits on one card" — it cannot physically stop oversubscription at runtime. v2.10.0 ships the companion project [KAI Resource Isolator](https://github.com/Project-HAMi/KAI-resource-isolator) (v1.1.0), developed by [@archlitchi](https://github.com/archlitchi) with monitoring contributed by [@dttung2905](https://github.com/dttung2905), which brings HAMi-core's runtime isolation into the KAI stack — upgrading KAI's shared GPUs from "cooperative" to "hard isolation".

The division of labor is clean: **KAI Scheduler decides "who gets how much"; the Isolator guarantees "what you get is all you can use"**.

![KAI Resource Isolator architecture](/images/blog/hami-v210-deep-dive/kai-resource-isolator-en.png)

Installation is two steps (KAI Scheduler v0.17.0 or newer required):

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

From then on, any Pod scheduled by KAI with the `gpu-memory` annotation automatically gets hard memory isolation:

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

Verification is straightforward: run `nvidia-smi` inside the container and you will see the allocated quota rather than the whole card's memory, with no way to over-allocate:

```bash
kubectl exec -it gpu-sharing-with-isolation -- nvidia-smi
```

To be clear, the architecture has landed and the isolator is released, but two hardening PRs are still in progress: fraction-based memory enforcement ([KAI-resource-isolator #6](https://github.com/Project-HAMi/KAI-resource-isolator/pull/6)) and non-root container directory permissions ([#22](https://github.com/Project-HAMi/KAI-resource-isolator/pull/22)). For hard-isolation production scenarios, verify that memory limits actually take effect first. For more background, read the earlier deep dive: [KAI Scheduler + HAMi GPU Memory Hard Isolation](https://project-hami.io/blog/kai-scheduler-hami-gpu-memory-hard-isolation).

### Volcano vNPU: Batch Schedulers Can Now Schedule Ascend Soft Partitions Too

Volcano is the batch scheduler of choice for many AI clusters. The v2.10.0 integration does not reinvent soft partitioning; it simply **swaps the "allocator" from HAMi Scheduler to Volcano**, reusing the two layers below as-is:

| Layer | HAMi 2.9 path | Volcano integration path |
|-|-|-|
| Scheduler | HAMi Scheduler | Volcano Scheduler |
| Device discovery/mount | ascend-device-plugin | The same ascend-device-plugin |
| Soft partition execution | hami-vnpu-core (libvnpu.so) | The same hami-vnpu-core |
| Queues, gang, binpack | Not the focus | Provided by Volcano |

Note that Volcano schedules Ascend vNPU in two modes: Volcano's native Ascend plugin **MindCluster mode** (`AscendMindClusterVNPUEnable`, driver-template hard partitioning) and the ascend-device-plugin-based **HAMi mode** (`AscendHAMiVNPUEnable`, supporting hami-core soft partitioning). What v2.10.0 completes is the soft-partition path in the latter — also the only one of the two modes that enforces memory/compute caps at runtime:

![Volcano scheduling Ascend vNPU in HAMi mode](/images/blog/hami-v210-deep-dive/volcano-vnpu-flow-en.png)

#### Configuration example

On the Volcano side, enable HAMi mode for the `deviceshare` plugin in the `volcano-scheduler-configmap`:

```yaml
AscendHAMiVNPUEnable: "true" # enable HAMi-mode Ascend vNPU
SchedulePolicy: binpack # pack slices onto the same physical card where possible
KnownGeometriesCMName: hami-scheduler-device # source of vNPU geometries
```

On the node side, deploy ascend-device-plugin in soft-partition mode (`hamiVnpuCore: true`). The Pod-side contract is concise: `schedulerName: volcano`, `runtimeClassName: ascend`, the `huawei.com/vnpu-mode: hami-core` annotation, plus two extended resources:

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

#### Real-machine validation results

The community validated the full chain on a single-node Ascend 310P3 cluster (aarch64, npu-smi 25.5.1, Kubernetes 1.28); the path supports heterogeneous Ascend clusters with 910A/910B2/910B3/310P:

- **Slice isolation works**: inside a container requesting 8192 MiB, `npu-smi info` shows `0 / 8192 MB`, while the host shows `1848 / 21525 MB` on the same card — `libvnpu.so` rewrites the device query into the container quota
- **binpack co-location**: a second Pod of the same spec lands on the same physical card (same Bus-Id), each with its own independent 8192 MiB window; the node shows 2 vNPUs and 16384 MiB allocated
- **Monitoring reports honestly**: the plugin exports `hami_vgpu_memory_limit_bytes` per Pod on the `:9395` endpoint, exactly 8192 MiB (~8.59e9 bytes)

#### Caveats

- **Versions**: Volcano 1.14+ suffices for HAMi mode; soft partitioning requires 1.16+ and ARM only
- **libvnpu.so must match the NPU driver**: mismatches fail silently — `npu-smi` inside the container hangs at initialization
- **Metrics live on the plugin Pod**: the `:9395` endpoint is served by the DaemonSet; accessing it from workload Pods does nothing
- **Isolation nature**: soft partitioning is runtime API interception, not an SR-IOV-style hardware boundary

The full theory and real outputs of every command are in the community blog post [Volcano + HAMi-core soft-partitioned Ascend vNPU: theory and real-machine validation](https://project-hami.io/blog/volcano-ascend-vnpu-soft-slicing) and the [ascend-device-plugin Volcano guide](https://github.com/Project-HAMi/ascend-device-plugin/blob/main/docs/volcano.md).

## Engineering and Build Improvements

These changes are low-profile but directly determine how painless production is:

**Standalone DRA chart** ([HAMi #2038](https://github.com/Project-HAMi/HAMi/pull/2038), [@archlitchi](https://github.com/archlitchi)): the DRA (Dynamic Resource Allocation) components are split out of the HAMi main chart into the standalone [HAMi-dra](https://github.com/Project-HAMi/HAMi-dra) repository. Clusters not using DRA no longer pull the related components, the main chart stays cleaner, and DRA evolves free of the main release cadence.

**Handshake annotation cleanup** ([HAMi #2052](https://github.com/Project-HAMi/HAMi/pull/2052), [@archlitchi](https://github.com/archlitchi)): node cleanup now removes handshake annotation keys entirely instead of writing timestamped `Deleted_*` markers, keeping node health and reset reporting consistent.

**ubi8 build images** ([HAMi #1958](https://github.com/Project-HAMi/HAMi/pull/1958), [@spencercjh](https://github.com/spencercjh)): build stages of HAMi and HAMi-core move to `nvidia/cuda:13.3.0-cudnn-devel-ubi8`, widening the artifacts' GLIBC compatibility so the same build runs on more target distributions. This matters especially for HAMi-core, which injects into user processes as a `.so`.

**mock-device-plugin NPU templates** ([mock-device-plugin #18](https://github.com/Project-HAMi/mock-device-plugin/pull/18), [@Wangmin362](https://github.com/Wangmin362)): the mock plugin supports both the new nested and legacy flat `vnpus` configuration formats and registers Ascend AI-core and Hygon DCU core resources, enabling NPU vNPU scheduling tests without hardware.

## Contributors

v2.10.0 was built by community members across the HAMi main repository and multiple repositories under the Project-HAMi organization (ascend-device-plugin, KAI-resource-isolator, mock-device-plugin, hami-vnpu-core, amd-device-plugin). Feature leads for this release include:

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

Among them, [@archlitchi](https://github.com/archlitchi) (release coordination and KAI integration), [@FouoF](https://github.com/FouoF) (Flexible MIG and AMD support), [@maverick123123](https://github.com/maverick123123) (Ascend monitoring), and [@spencercjh](https://github.com/spencercjh) (build pipeline) are from the Dynamia team. Thanks to every contributor, and to everyone who filed issues, tested RCs, and shared production feedback. The full contributor list is in the [v2.10.0 Release Notes](https://github.com/Project-HAMi/HAMi/releases/tag/v2.10.0).

## Upgrade Guide

```bash
helm repo add hami-charts https://project-hami.github.io/HAMi/
helm repo update
helm upgrade hami hami-charts/hami -n kube-system
```

| User type | Upgrade notes |
|-|-|
| DRA users | DRA no longer ships with the main chart; use the [HAMi-dra](https://github.com/Project-HAMi/HAMi-dra) chart instead |
| AMD users | Deploy the dedicated [amd-device-plugin](https://github.com/Project-HAMi/amd-device-plugin); make sure images meet GLIBC 2.34+ |
| Ascend users | vNPU monitoring requires `hami-core` mode; check Volcano soft-partition versions (1.16+, ARM only) |
| All users | Validate compatibility in a test environment first |

## Community Update: Since v2.9.0

The three-plus months since v2.9.0 (May 2026) have been an exceptionally active period for the HAMi community: project milestones, ecosystem partnerships, user case studies, and community events landed in quick succession:

![Community highlights timeline since v2.9.0](/images/blog/hami-v210-deep-dive/community-timeline-en.png)

**Major milestones**

- **CNCF Incubating** (July): HAMi graduated from CNCF Sandbox into the incubating stage, becoming a key piece of the cloud-native heterogeneous computing landscape. [Read the announcement](https://project-hami.io/blog/hami-cncf-incubating)
- **HAMi-core adopted by KAI Scheduler** (June): KAI Scheduler built in HAMi-core for GPU memory hard isolation, ushering GPU sharing into the hard-isolation era — the KAI Resource Isolator introduced in this post is an extension of that partnership. [Read the announcement](https://project-hami.io/blog/hami-core-adopted-by-nvidia-kai-scheduler)

**User case studies**

- **China Merchants Bank** (July): built a unified heterogeneous AI compute scheduling platform on Kubernetes and HAMi with topology-aware scheduling and fine-grained accelerator sharing; via supernode-module-aware pairwise allocation, hardware pool utilization reached 100%, cross-node scheduling for distributed training dropped 30%, and fine-grained slicing goes down to 1 GB of memory and 1% of compute per card. [Read the case study](https://www.cncf.io/case-studies/china-merchants-bank/)
- **SNOW** (May): orchestrates 1000+ A100 GPUs with HAMi GPU sharing and KEDA autoscaling to serve 200M+ global users with GenAI services; GPUs needed for training and inference pipelines were halved, 700% traffic spikes absorbed comfortably, an estimated USD 17.4 million saved versus equivalent on-demand cloud GPUs, and MTTR cut from ~2 hours to ~10 minutes. [Read the case study](https://www.cncf.io/case-studies/snow-corp/)

**Community events**

- **KubeCon + CloudNativeCon India 2026** (June): HAMi appeared in India, bringing GPU sharing to the local community. [Event recap](https://project-hami.io/blog/kubecon-india-2026-recap)
- **KCD Vietnam 2026** (July, Hanoi): the talk "From Project to Production: HAMi and Viettel Cloud" covered GPU sharing mechanics and Viettel Cloud's carrier-grade production deployment. [Event details](https://project-hami.io/landing/kcd-vietnam)
- **vLLM Meetup Shanghai** (July): Li Mengxuan (Dynamia co-founder and CTO, HAMi maintainer) presented "Is Your Compute Well Spent? — Three Stages of vLLM Inference Cluster Optimization". [Event recap](https://project-hami.io/blog/vllm-meetup-shanghai-2026-recap)
- **KubeCon + CloudNativeCon Japan 2026** (late July, Yokohama): HAMi hosted a booth and the talk "Shared GPU Scheduling and Proactive Autoscaling"; SNOW also shared its HAMi-based production experience on site. [Event recap](https://project-hami.io/blog/kubecon-japan-2026-recap)
- **COSCUP 2026** (August, Taipei): the talk "Running Multiple AI Workloads on One GPU with HAMi: Architecture and Caveats" covered zero-code-change CUDA takeover, memory isolation, and production cases with 40-60% GPU cost reduction. [Event details](https://project-hami.io/landing/coscup-2026)
- **Open Source Summit Korea 2026** (August, Seoul): the talk "Simplifying AI at the Edge with HAMi" shared edge AI practices such as memory slicing on Jetson-class devices and multi-agent concurrency. [Event details](https://project-hami.io/landing/opensource-summit-korea)

**Mentorship**

- **LFX Mentorship 2026 Term 3** (applications open in August): four open-source projects on GPU sharing topics are open to developers worldwide. [Application guide](https://project-hami.io/blog/lfx-mentorship-2026-term-3)

## Upcoming Event: HAMi Meetup Shanghai

**"Compute Efficiency over Compute Arms Race | HAMi Meetup Shanghai · Incubating Special"** takes place on September 6 — the first community gathering since HAMi entered CNCF Incubating:

- Time: September 6, 2026 (Sunday), 14:00-21:20 (check-in from 13:30)
- Venue: No. 322 Daxue Road, Yangpu District, Shanghai (Wujiaochang Innovation & Entrepreneurship College)
- Hosts: Dynamia, HAMi Community
- Co-organizer: Shanghai Wujiaochang Innovation & Entrepreneurship College

The event splits into afternoon and evening sessions: the afternoon features 5 technical talks plus a community panel; the evening session marks HAMi entering CNCF Incubating with contributor stories (My HAMi Story), community appreciation, and open networking.

## Conclusion

v2.10.0 is a release built around "scheduling flexibility, accelerator breadth, and ecosystem depth": Flexible MIG finally makes MIG elastic on demand, composable policy chains and gang scheduling fill real-cluster scheduling gaps, AMD and Biren expand the accelerator landscape, Ascend heterogeneous management and observability mature, and the KAI Scheduler integration carries HAMi-core's isolation into a wider scheduling ecosystem.

Work continues on multi-device validation for Flexible MIG and the KAI isolator's fraction-based memory enforcement. Ascend-DRA support is on the way and will ship soon with the HAMi-DRA chart — stay tuned. If you have ideas about GPU virtualization or heterogeneous scheduling, come join the HAMi community.

**Related links:**

- GitHub Release: [HAMi v2.10.0](https://github.com/Project-HAMi/HAMi/releases/tag/v2.10.0)
- Official release notes: [English](https://project-hami.io/blog/hami-v2-10-0-release) / [Chinese](https://project-hami.io/zh/blog/hami-v2-10-0-release)
- KAI Resource Isolator: [https://github.com/Project-HAMi/KAI-resource-isolator](https://github.com/Project-HAMi/KAI-resource-isolator)
- Ascend Device Plugin: [https://github.com/Project-HAMi/ascend-device-plugin](https://github.com/Project-HAMi/ascend-device-plugin)
- AMD Device Plugin: [https://github.com/Project-HAMi/amd-device-plugin](https://github.com/Project-HAMi/amd-device-plugin)
- Community Discord (recommended): [https://discord.gg/Amhy7XmbNq](https://discord.gg/Amhy7XmbNq)
- CNCF Slack: [https://cloud-native.slack.com/archives/C07T10BU4R2](https://cloud-native.slack.com/archives/C07T10BU4R2)
