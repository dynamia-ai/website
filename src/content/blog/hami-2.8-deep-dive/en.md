---
title: 'HAMi v2.8 Deep Dive: Standardization and Ecosystem Evolution'
coverTitle: 'HAMi v2.8 Deep Dive: Standardization and Ecosystem Evolution'
date: '2026-02-04'
excerpt: >-
  HAMi v2.8 deep dive: Kubernetes DRA support, Leader Election mechanism, CDI
  mode support, upstream ecosystem integration (Kueue, vLLM), critical bug
  fixes, and stability improvements.
author: Dynamia AI Team
tags:
  - HAMi
  - GPU Sharing
  - vGPU
  - Kubernetes
  - DRA
  - Leader Election
  - CDI
  - Release
category: Product Release
coverImage: /images/blog/hami-2.8-deep-dive/heterogeneous-gpu-ecosystem.png
language: en
---

> **Deep roots, lush leaves.**
>
> Paying tribute to Kubernetes 1.35's *Timbernetes*: where world tree rings mark the passage of growth; here, we use the metaphor of **roots** and **branches**.
>
> **Roots** represent the solid foundation of standardization: unified interfaces, deeply anchored;
> **Branches** represent the flourishing ecosystem of heterogeneous computing: diverse silicon, reaching upward.
>
> Since the v2.7 release, HAMi has continued to evolve in standardization capabilities and ecosystem building. When the standardized roots of DRA meet the diverse branches of the GPU ecosystem, HAMi is transforming from a single scheduler project into a complete heterogeneous computing scheduling ecosystem—**deep roots enable lush leaves, a solid foundation enables flourishing branches**.

## From v2.7 to v2.8: Dual Evolution in Standardization and Ecosystem

Since the HAMi v2.7 release, the project has made significant progress in **architectural completeness, scheduling reliability, and ecosystem alignment**. v2.8 brings systematic enhancements in Kubernetes native standard alignment, device support, production readiness, and observability, making HAMi more suitable for AI production clusters that require long-term stability and clear upgrade paths.

This article will outline the major feature advancements in v2.8, as well as HAMi community's exploration and practices in building the heterogeneous computing scheduling ecosystem.

### v2.8 Overview

* **Standardization**: Added support for **Kubernetes DRA (Dynamic Resource Allocation)** with the independent [HAMi-DRA](https://github.com/Project-HAMi/HAMi-DRA) project, driving HAMi's evolution from "custom device scheduling logic" to **Kubernetes native standard interfaces**.

* **High Availability & Reliability**: Introduced **Leader Election mechanism** for Scheduler HA deployment; added **CDI mode support** for standardized device management; aligned with NVIDIA k8s-device-plugin v0.18.0 for ecosystem compatibility.

* **HAMi Ecosystem**: HAMi has evolved from a single repo into a complete ecosystem including HAMi-DRA, mock-device-plugin, and HAMi-WebUI.

## HAMi Ecosystem Overview

HAMi has grown from a single scheduler project into a complete open-source ecosystem organization. Below is the structure of the HAMi open-source ecosystem:

![HAMi Ecosystem Overview](/images/blog/hami-2.8-deep-dive/f1.png)

## Core Features

### DRA (Dynamic Resource Allocation) - Towards Kubernetes Native Standards

DRA is the next-generation device resource declaration and allocation mechanism being promoted by the Kubernetes community, aiming to provide a **more standardized, composable, and extensible** resource management model for GPU/AI accelerators and other devices.

#### Why DRA Matters

Traditional Kubernetes device management has the following limitations:

1. **Inflexible resource declaration**: Device resources are hard-coded through `limits[nvidia.com/gpu]`, unable to express complex resource requirements (e.g., separating memory and compute)

2. **Scattered scheduling logic**: Each device plugin needs to implement its own scheduling logic, making unified management difficult

3. **Difficult resource composition**: Unable to express complex requirements like "multiple GPUs with specific topology"

DRA standardizes device resource declaration, allocation, and management by introducing new APIs like **ResourceClaim** and **DeviceClass**, making device resource management more flexible and extensible.

#### HAMi-DRA Architecture

HAMi-DRA is an independent DRA implementation project provided by the HAMi community, using a **Mutating Webhook** architecture to automatically convert traditional GPU resource requests to DRA ResourceClaim.

The diagram below shows the DRA request flow:

![DRA Request Flow](/images/blog/hami-2.8-deep-dive/f2.png)

#### HAMi-DRA Core Features

1. **Automatic resource conversion**: Automatically converts `nvidia.com/gpu`, `nvidia.com/gpumem`, `nvidia.com/gpucores`, and other resource requests to DRA ResourceClaim

2. **Device selection support**: Supports selecting specific devices through Pod Annotations by UUID, device type, etc.

3. **Metrics monitoring**: Optional Monitor component that exposes GPU resource usage metrics via Prometheus

4. **CDI support**: Integrates with Container Device Interface for standardized device injection

#### DRA Usage Example

**Prerequisites:**

* Kubernetes version >= 1.34
* Enable DRA Consumable Capacity feature gate
* Enable CDI support in container runtime (containerd or CRI-O)
* Install cert-manager

**Install HAMi-DRA:**

```bash
# Using GPU Operator's containerd driver
helm install hami-dra ./charts/hami-dra

# Without GPU Operator's driver
helm install hami-dra ./charts/hami-dra --set drivers.nvidia.containerDriver=false
```

**Configure device resources:**

Edit `charts/hami-dra/values.yaml`:

```yaml
resourceName: "nvidia.com/gpu"
resourceMem: "nvidia.com/gpumem"
resourceCores: "nvidia.com/gpucores"
```

**Submit Pod using DRA:**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: gpu-pod
spec:
  containers:
  - name: gpu-container
    image: nvidia/cuda:11.8.0-base-ubuntu22.04
    command: ["nvidia-smi"]
    resources:
      limits:
        nvidia.com/gpu: 2
        nvidia.com/gpumem: 4096
        nvidia.com/gpucores: 80
```

HAMi-DRA Webhook automatically converts the above Pod to use DRA ResourceClaim.

**View ResourceClaim:**

```bash
kubectl get resourceclaim
kubectl describe resourceclaim <claim-name>
```

**Monitor metrics access:**

```yaml
monitor:
  enabled: true
  service:
    type: NodePort
    nodePort:
      metrics: 31995
```

```bash
# Access metrics
curl http://<node-ip>:31995/metrics
```

> **Note**: A dedicated technical article on DRA's design philosophy, implementation details, and comparison with existing models will be published separately.

### Leader Election - Scheduler High Availability

For large-scale clusters or high-availability deployment scenarios, HAMi v2.8.0 introduces a **Leader Election mechanism for multiple Scheduler instances**, implementing leader election through Kubernetes' Lease mechanism to ensure only one Scheduler instance is in Active state making scheduling decisions at any time.

The Leader Election architecture is shown below:

![Leader Election Architecture](/images/blog/hami-2.8-deep-dive/f3.png)

**Key Benefits:**

1. **Avoid scheduling conflicts**: Multiple Scheduler instances scheduling concurrently may cause resource conflicts. Leader Election ensures only one instance performs scheduling.

2. **Automatic failover**: When the Leader instance fails, Standby instances automatically take over, improving system availability.

3. **Smooth upgrades**: During rolling upgrades of the Scheduler, new Pods automatically become Leaders without manual intervention.

**Usage:**

Leader Election is enabled by default in Helm Chart and can be configured via `values.yaml`:

```yaml
scheduler:
  replicaCount: 3  # Deploy 3 Scheduler instances
  leaderElection:
    enabled: true
    leaseDuration: 15s
    renewDeadline: 10s
    retryPeriod: 2s
```

### CDI (Container Device Interface) Mode Support

HAMi v2.8.0 adds support for **NVIDIA CDI mode**. CDI is a container device interface standard maintained by [CNCF TAG](https://github.com/cncf-tags), providing a more standardized device injection method.

**Configuration:**

Edit `values.yaml`:

```yaml
global:
  deviceListStrategy: cdi-annotations  # or envvar
```

**Device injection in CDI mode:**

```yaml
# Pod Spec example
spec:
  containers:
  - name: gpu-container
    image: nvidia/cuda:11.8.0-base-ubuntu22.04
    resources:
      limits:
        nvidia.com/gpu: 1
    # In CDI mode, devices are injected via CDI, no environment variables needed
```

### Alignment with NVIDIA k8s-device-plugin v0.18.0

HAMi v2.8.0 synchronizes upgrades and aligns with **NVIDIA official k8s-device-plugin v0.18.0**, ensuring compatibility with NVIDIA's latest device management model.

**Key Benefits of Alignment:**

1. **Maintain compatibility**: Support NVIDIA's latest GPU hardware and driver features

2. **Reduce adaptation costs**: Users can smoothly introduce HAMi into existing NVIDIA GPU ecosystems

3. **Ecosystem synergy**: HAMi acts as an "enhancement layer" for device management, not a "forked implementation"

**Synchronized Features:**

* Support for latest NVIDIA GPU Driver versions
* Compatible with latest MIG (Multi-Instance GPU) features
* Support for new device monitoring metrics and health check mechanisms

### Mock Device Plugin - Development & Testing Tool

HAMi v2.8.0 adds [**Mock Device Plugin**](https://github.com/Project-HAMi/mock-device-plugin) capabilities, providing a lower-barrier device simulation method for developers and CI/testing environments.

The Mock Device Plugin workflow is shown below:

![Mock Device Plugin Workflow](/images/blog/hami-2.8-deep-dive/f4.png)

**Core Features:**

1. **Virtual device registration**: Registers virtual devices (e.g., gpu-memory, gpu-cores) to nodes, making them visible in `node.status.allocatable` and `node.status.capacity`

2. **Resource type support**:
   * NVIDIA GPU: `nvidia.com/gpumem`, `nvidia.com/gpumem-percentage`, `nvidia.com/gpucores`

3. **Development convenience**: Enables functional verification and development debugging without real GPU hardware

**Deployment:**

```bash
# Deploy RBAC
kubectl apply -f k8s-mock-rbac.yaml

# Deploy ConfigMap (if not deployed)
kubectl apply -f device-configmap.yaml

# Deploy Mock Device Plugin
kubectl apply -f k8s-mock-plugin.yaml
```

**Node resource effect example:**

```yaml
Allocatable:
  memory:                    769189866507
  nvidia.com/gpu:            20
  nvidia.com/gpucores:       200
  nvidia.com/gpumem:         65536
  nvidia.com/gpumem-percentage: 200
  pods:                      110
```

**Note:**
If memory statistics are too large (e.g., exceeding 120GB), they will display as 0. In this case, adjust the `memoryFactor` parameter in the `hami-scheduler-device` ConfigMap (default value is 1).

### Build Info & Metrics Updates

HAMi v2.8.0 includes systematic enhancements in observability:

**New Metrics:**

* `hami_build_info`: Includes version number, build time, Git commit, etc.
* Outputs complete version information at startup

**Deprecated Metrics Removed:**

* `vGPUPodsDeviceAllocated`: Use `vGPUMemoryAllocated` and `vGPUCoreAllocated` instead
* `vGPUMemoryPercentage`: Use `vGPUMemoryAllocated` instead
* `vGPUCorePercentage`: Use `vGPUCoreAllocated` instead

**Metrics Example:**

```text
# New build info metric
hami_build_info{version="v2.8.0",git_commit="abc123",build_date="2026-01-29"} 1

# GPU resource allocation metrics
hami_vgpu_memory_allocated{node="gpu-node-1"} 16384
hami_vgpu_core_allocated{node="gpu-node-1"} 150
```

**Startup Log Example:**

```text
I0129 10:00:00.000000       1 version.go:42] HAMi Scheduler Version: v2.8.0
I0129 10:00:00.000001       1 version.go:43] Git Commit: abc123def
I0129 10:00:00.000002       1 version.go:44] Build Date: 2026-01-29T10:00:00Z
I0129 10:00:00.000003       1 version.go:45] Go Version: go1.25.5
```

## Ecosystem Integration

HAMi continues to co-evolve with key components in the Kubernetes AI ecosystem. v2.8 brings progress in the following areas:

### Enhanced Kueue Integration

Kueue is a batch job queue management project maintained by Kubernetes SIG Scheduling. The HAMi community has contributed enhancements to Kueue, adding native support for HAMi's device resource management and scheduling model.

The Kueue + HAMi integration architecture is shown below:

![Kueue + HAMi Integration](/images/blog/hami-2.8-deep-dive/f5.png)

**Kueue Integration Configuration Example:**

**1. Enable Kueue Deployment support:**

```bash
kubectl edit configmap kueue-manager-config -n kueue-system
```

```yaml
apiVersion: config.kueue.x-k8s.io/v1beta2
kind: Configuration
integrations:
  frameworks:
    - "deployment"
    - "pod"
```

**2. Configure ResourceTransformation:**

```yaml
apiVersion: config.kueue.x-k8s.io/v1beta2
kind: Configuration
integrations:
  frameworks:
    - "deployment"
    - "pod"
resources:
  transformations:
  - input: nvidia.com/gpucores
    strategy: Replace
    multiplyBy: nvidia.com/gpu
    outputs:
      nvidia.com/total-gpucores: "1"
  - input: nvidia.com/gpumem
    strategy: Replace
    multiplyBy: nvidia.com/gpu
    outputs:
      nvidia.com/total-gpumem: "1"
```

**3. Create ResourceFlavor:**

```yaml
apiVersion: kueue.x-k8s.io/v1beta2
kind: ResourceFlavor
metadata:
  name: hami-flavor
spec:
  nodeLabels:
    gpu: "on"
```

**4. Create ClusterQueue:**

```yaml
apiVersion: kueue.x-k8s.io/v1beta2
kind: ClusterQueue
metadata:
  name: hami-queue
spec:
  resourceGroups:
    - coveredResources: ["nvidia.com/gpu", "nvidia.com/total-gpucores", "nvidia.com/total-gpumem"]
      flavors:
        - name: hami-flavor
          resources:
            - name: "nvidia.com/gpu"
              nominalQuota: 80
            - name: "nvidia.com/total-gpucores"
              nominalQuota: 200
            - name: "nvidia.com/total-gpumem"
              nominalQuota: 10240
```

**5. Create LocalQueue:**

```yaml
apiVersion: kueue.x-k8s.io/v1beta2
kind: LocalQueue
metadata:
  name: hami-local-queue
  namespace: default
spec:
  clusterQueue: hami-queue
```

**6. Submit Deployment using vGPU:**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: vgpu-deployment
  labels:
    app: vgpu-app
    kueue.x-k8s.io/queue-name: hami-local-queue
spec:
  replicas: 2
  selector:
    matchLabels:
      app: vgpu-app
  template:
    metadata:
      labels:
        app: vgpu-app
    spec:
      containers:
        - name: vgpu-container
          image: nvidia/cuda:11.8.0-base-ubuntu22.04
          command: ["sleep", "infinity"]
          resources:
            limits:
              nvidia.com/gpu: 1
              nvidia.com/gpucores: 50
              nvidia.com/gpumem: 1024
```

**Resource Transformation Notes:**

Kueue's ResourceTransformation automatically transforms HAMi vGPU resource requests:

* `nvidia.com/gpu` × `nvidia.com/gpucores` → `nvidia.com/total-gpucores`
* `nvidia.com/gpu` × `nvidia.com/gpumem` → `nvidia.com/total-gpumem`

For example:
* A Deployment with 2 replicas, each requesting `nvidia.com/gpu: 1`, `nvidia.com/gpucores: 50`, `nvidia.com/gpumem: 1024`
* Actual consumption: `nvidia.com/total-gpucores: 100` (2 × 1 × 50) and `nvidia.com/total-gpumem: 2048` (2 × 1 × 1024)

### vLLM Compatibility Fixes

vLLM is a popular LLM inference framework. HAMi v2.8 fixes multiple vLLM-related compatibility issues.

**Fixed Issues:**

1. **Multi-GPU crash**: Fixed crashes when using vLLM with multiple GPUs ([Issue #1461](https://github.com/Project-HAMi/HAMi/issues/1461))

2. **CUDA_VISIBLE_DEVICES compatibility**: Fixed initialization failures when manually specifying devices ([Issue #1381](https://github.com/Project-HAMi/HAMi/issues/1381))

**Example: Using vLLM with HAMi**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: vllm-pod
spec:
  containers:
  - name: vllm
    image: vllm/vllm-openai:latest
    command: ["vllm", "serve", "--model", "meta-llama/Llama-2-7b-hf"]
    resources:
      limits:
        nvidia.com/gpu: 2
        nvidia.com/gpucores: 80
        nvidia.com/gpumem: 16384
    env:
    - name: CUDA_VISIBLE_DEVICES
      value: "0,1"
```

## Critical Bug Fixes & Stability Improvements

The v2.8 release focuses on fixing issues from real production environments, improving system stability.

**Core Fixes:**

1. **GPU / MIG instance allocation errors** ([PR #1518](https://github.com/Project-HAMi/HAMi/pull/1518))
   * Fixed scheduler incorrectly allocating MIG instances

2. **Concurrent map read/write crashes**
   * Fixed fatal errors in map iteration and writing under concurrent scenarios ([PR #1452](https://github.com/Project-HAMi/HAMi/pull/1452), [PR #1476](https://github.com/Project-HAMi/HAMi/pull/1476))

3. **Quota calculation errors** ([PR #1400](https://github.com/Project-HAMi/HAMi/pull/1400))
   * Fixed ResourceQuota calculation errors

4. **Device plugin unload residuals** ([PR #1456](https://github.com/Project-HAMi/HAMi/pull/1456))
   * Fixed residual node states after device plugin unload

5. **vLLM-related scheduling issues** ([PR #1478](https://github.com/Project-HAMi/HAMi/pull/1478))
   * Fixed vLLM-related scheduling and resource calculation issues

6. **Scheduling failure event optimization** ([PR #1444](https://github.com/Project-HAMi/HAMi/pull/1444))
   * Optimized scheduling failure event output to improve troubleshooting efficiency

## Engineering Improvements

### Node Registration Logic Optimization ([PR #1499](https://github.com/Project-HAMi/HAMi/pull/1499))

Refactored node registration logic to improve node management stability and maintainability.

### Golang Upgrade to v1.25.5

HAMi v2.8 upgrades Golang version to v1.25.5, gaining the latest language features and security fixes.

### Certificate Hot Reload Support

HAMi now supports **listening to and hot-reloading certificate changes**, avoiding component restarts or service interruptions due to certificate updates.

**Configuration:**

```yaml
scheduler:
  certWatchEnabled: true
  certDir: /etc/hami/certs
```

### Repository Optimization

Removed multiple initial project binary files, reducing repo size from 132M to 20M, improving clone and build speeds.

## Community Updates

The HAMi community remains active, with progress in the following areas during v2.8 development:

### CNCF Case Study Published

The **DaoCloud uses HAMi to build GPU cloud** case study has been published on the CNCF official website:

<https://www.cncf.io/case-studies/daocloud/>

DaoCloud built a GPU cloud platform based on HAMi, achieving pooling and scheduling of heterogeneous computing resources, significantly improving resource utilization.

### Community Contributors

HAMi v2.8's progress would not be possible without the continuous dedication and feedback from many community contributors. Special thanks to the following community members for their significant contributions during this phase:

* [**@archlitchi**](https://github.com/archlitchi): Core scheduling and multiple critical fixes, version releases, and CI stability

* [**@luohua13**](https://github.com/luohua13): Quota calculation, device lifecycle, and scheduling stability improvements

* [**@Shouren**](https://github.com/Shouren): NVIDIA/MIG-related fixes, security, and engineering quality improvements

* [**@FouoF**](https://github.com/FouoF): Scheduler stability, testing, and Helm-related improvements

* [**@Kyrie336**](https://github.com/Kyrie336): Scheduling decision enhancement and multi-device support

* [**@litaixun**](https://github.com/litaixun): Concurrency safety, node, and device management-related fixes

We also thank all community contributors who participated in HAMi v2.8 development through Issues, Pull Requests, testing feedback, and other forms.

### Community Growth

During HAMi v2.8, the community achieved significant progress in member roles:

* [**@Shouren**](https://github.com/Shouren) was promoted to HAMi **Maintainer** ([issue #33](https://github.com/Project-HAMi/community/issues/33)). Shouren has contributed significantly to scheduling robustness, device management, release processes, and security updates, and is the core developer of HAMi-DRA, having reviewed hundreds of Issues and PRs.

* [**@FouoF**](https://github.com/FouoF) was promoted to HAMi **Approver** ([issue #31](https://github.com/Project-HAMi/community/issues/31)). FouoF has continuously invested in scheduler stability, HAMi-DRA, testing improvements, and Chart enhancements, becoming an important project reviewer.

* [**@DSFans2014**](https://github.com/DSFans2014) (James) was promoted to HAMi **Reviewer** ([issue #29](https://github.com/Project-HAMi/community/issues/29)). DSFans2014 has contributed significantly in device support and heterogeneous scenarios, actively participating in code review and issue fixes.

* [**@Shenhan11**](https://github.com/Shenhan11) was promoted to HAMi **Reviewer** ([issue #30](https://github.com/Project-HAMi/community/issues/30)). Shenhan11 has continuously invested in the development and testing of multiple functional modules, providing guarantees for project quality improvement.

We also thank all community contributors who participated in HAMi v2.8 development through Issues, Pull Requests, testing feedback, and other forms.

## Future Roadmap: v2.9

HAMi v2.9.0 will continue to evolve in the following directions:

**Core Features**

* **Scheduling enhancements**: MPS integration, resource preemption, PodGroup support (Kueue/Volcano)

* **Heterogeneous chips**: AMD Mi300X support

* **DRA expansion**: Extended DRA support for more device types

**Volcano-vGPU**

* **Flexible partitioning**: Dynamic MIG, topology-aware scheduling

* **Ecosystem integration**: CDI support, LWS integration, NVIDIA DP 0.18.0 adaptation

The v2.8 → v2.9 evolution roadmap is shown below:

![v2.8 to v2.9 Roadmap](/images/blog/hami-2.8-deep-dive/f6.png)

The HAMi community welcomes more developers, users, and ecosystem partners to join us in driving the long-term evolution of heterogeneous computing scheduling in cloud-native systems. Together, let's chart a broader open-source horizon.

Thank you to all community members, users, and ecosystem partners who contributed during the HAMi v2.8 phase. Your continued dedication is the key force enabling HAMi to continuously move toward **production readiness and ecosystem friendliness**.

## Download & Installation

**Helm Chart:**

```bash
helm repo add hami https://project-hami.io/hami-helm
helm repo update
helm install hami hami/hami --version 2.8.0
```

**Source Code:**

<https://github.com/Project-HAMi/HAMi/releases/tag/v2.8.0>

**Documentation:**

<https://project-hami.io/docs/>
