---
title: "HAMi v2.8 重磅发布详解：标准化与生态完整性的双重演进"
coverTitle: "HAMi v2.8 重磅发布详解：标准化与生态完整性的双重演进"
slug: "hami-2.8-deep-dive"
date: "2026-02-04"
excerpt: "HAMi v2.8 深度解析：新增 Kubernetes DRA 支持、Leader 选举机制、CDI 模式支持，异构 GPU 生态扩展（天数智芯、沐曦 GPU、华为昇腾），上下游生态集成（Kueue、vLLM），关键问题修复与稳定性提升。"
author: "Dynamia AI Team"
tags: ["HAMi", "GPU Sharing", "vGPU", "Kubernetes", "DRA", "Leader Election", "CDI", "Heterogeneous Computing", "Release"]
category: "Product Release"
coverImage: "/images/blog/hami-2.8-deep-dive/cover-zh.png"
language: "zh"
---

> **根深叶茂，生生不息。**
>
> 向 Kubernetes 1.35 的 *Timbernetes* 致意：彼处以世界树年轮为喻，见证一圈圈成长的印记；此处，我们以 **根** 与 **枝** 为喻。
>
> **根** ，是标准化带来的稳固基础：接口统一，深扎土壤；
> **枝** ，是异构生态的繁茂枝叶：多样之芯，向上生长。
>
> 自 v2.7 发布以来，HAMi 在标准化能力与异构 GPU 生态建设方面持续演进。当 DRA 的标准化之根遇上异构 GPU 的生态之枝，HAMi 正从单一调度器项目发展为完整的异构算力调度生态体系——**根深方能叶茂，本固始得枝荣**。

## 自 v2.7 到 v2.8：标准化与生态完整性的双重演进

自 HAMi v2.7 发布以来，项目在 **架构完整性、调度可靠性以及生态对齐** 层面取得重要进展。v2.8 在 Kubernetes 原生标准对齐、异构设备支持、生产可用性与可观测性等方面进行了系统性增强，使 HAMi 更加适合在长期运行、对稳定性和演进路径敏感的 AI 生产集群中使用。

![HAMi v2.8 关键词云](/images/blog/hami-2.8-deep-dive/keyword-cloud.png)

本文将梳理 v2.8 版本的主要特性进展，以及 HAMi 社区在异构算力调度生态建设方面的探索与实践。

### v2.8 版本进展概览

* **标准化能力建设**：新增对 **Kubernetes DRA（Dynamic Resource Allocation）** 的支持，提供独立实现项目 [HAMi-DRA](https://github.com/Project-HAMi/HAMi-DRA)，推动 HAMi 从"自定义设备调度逻辑"向 **Kubernetes 原生标准接口** 演进。

* **异构 GPU 生态扩展**：天数智芯、沐曦 GPU、华为昇腾等国产芯片支持更新与增强，vLLM 兼容性问题修复，Kueue 集成完善。

* **高可用与可靠性提升**：引入 **Leader 选举机制** 支持 Scheduler 高可用部署；新增 **CDI 模式支持** 提升设备管理标准化；对齐 NVIDIA k8s-device-plugin v0.18.0 保持生态兼容。

* **HAMi 生态体系成型**：HAMi 从单一 repo 发展为包含 HAMi-DRA、mock-device-plugin、ascend-device-plugin、HAMi-WebUI 等子项目的完整生态体系。

## HAMi 生态全景图

HAMi 已从一个单一调度器项目发展为一个完整的开源生态组织。以下是 HAMi 开源生态的项目结构图：

![HAMi 生态全景图](/images/blog/hami-2.8-deep-dive/ecosystem-overview.png)

## 核心特性展开

### DRA（Dynamic Resource Allocation）- 迈向 Kubernetes 原生标准

DRA 是 Kubernetes 社区正在推进的下一代设备资源声明与分配机制，旨在为 GPU/AI 加速器等设备提供 **更标准化、可组合、可扩展** 的资源管理模型。

#### 为什么 DRA 重要

传统的 Kubernetes 设备管理存在以下局限：

1. **资源声明不灵活**：设备资源通过 `limits[nvidia.com/gpu]` 硬编码声明，无法表达复杂的资源需求（如显存、算力分离）

2. **调度逻辑分散**：每个设备插件需要实现自己的调度逻辑，难以统一管理

3. **资源组合困难**：无法表达"需要特定拓扑的多个 GPU"等复杂需求

DRA 通过引入 **ResourceClaim** 和 **DeviceClass** 等新 API，将设备资源的声明、分配和管理标准化，使设备资源管理更加灵活和可扩展。

#### HAMi-DRA 架构设计

HAMi-DRA 是 HAMi 社区提供的 DRA 独立实现项目，采用 **Mutating Webhook** 架构，自动将传统 GPU 资源请求转换为 DRA ResourceClaim。

下图展示的是 DRA 的请求流程。

![DRA 的请求流程图](/images/blog/hami-2.8-deep-dive/dra-request-flow.png)

#### HAMi-DRA 核心特性

1. **自动资源转换**：自动将 `nvidia.com/gpu`、`nvidia.com/gpumem`、`nvidia.com/gpucores` 等资源请求转换为 DRA ResourceClaim

2. **设备选择支持**：通过 Pod Annotation 支持按 UUID、设备类型等选择特定设备

3. **指标监控**：可选的 Monitor 组件，通过 Prometheus 暴露 GPU 资源使用指标

4. **CDI 支持**：与 Container Device Interface 集成，提供标准化的设备注入方式

#### DRA 使用示例

**前提条件：**

* Kubernetes 版本 >= 1.34

* 启用 DRA Consumable Capacity feature gate

* 容器运行时（containerd 或 CRI-O）启用 CDI 支持

* 安装 cert-manager

**安装 HAMi-DRA：**

```bash
# 使用 GPU Operator 提供的 containerd 驱动
helm install hami-dra ./charts/hami-dra

# 不使用 GPU Operator 的驱动
helm install hami-dra ./charts/hami-dra \--set drivers.nvidia.containerDriver=false
```

**配置设备资源：**

编辑 `charts/hami-dra/values.yaml`：

```yaml
resourceName: "nvidia.com/gpu"
resourceMem: "nvidia.com/gpumem"
resourceCores: "nvidia.com/gpucores"
```

**使用 DRA 提交 Pod：**

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

HAMi-DRA Webhook 会自动将上述 Pod 转换为使用 DRA ResourceClaim 的形式。

**查看 ResourceClaim：**

```bash
kubectl get resourceclaim
kubectl describe resourceclaim <claim-name>
```

**Monitor 指标访问：**

```yaml
monitor:
  enabled: true
  service:
    type: NodePort
    nodePort:
      metrics: 31995
```

```bash
# 访问指标
curl http://<node-ip>:31995/metrics
```

#### DRA 与传统模式对比

> **关于 DRA 的深度技术解读**：DRA 的设计理念、实现细节及与现有模式的对比，将在后续单独的技术文章中展开。

### Leader 选举机制 - Scheduler 高可用能力

在大规模集群或高可用部署场景下，HAMi v2.8.0 引入了 **多 Scheduler 实例的 Leader 选举机制**，通过 Kubernetes 的 Lease 机制实现 Leader 选举，确保同一时刻只有一个 Scheduler 实例处于 Active 状态进行调度决策。

Leader 选举架构图如下所示：

![Leader 选举架构图](/images/blog/hami-2.8-deep-dive/leader-election-architecture.png)

**核心优势：**

1. **避免调度冲突**：多 Scheduler 实例并发调度可能导致资源冲突，Leader 选举确保只有一个实例进行调度

2. **故障自动切换**：Leader 实例故障时，Standby 实例自动接管，提升系统可用性

3. **平滑升级**：滚动升级 Scheduler 时，新 Pod 自动成为 Leader，无需人工干预

**使用方式：**

Helm Chart 默认启用 Leader 选举，可通过 `values.yaml` 配置：

```yaml
scheduler:
  replicaCount: 3  # 部署 3 个 Scheduler 实例
  leaderElection:
    enabled: true
    leaseDuration: 15s
    renewDeadline: 10s
    retryPeriod: 2s
```

### CDI（Container Device Interface）模式支持

HAMi v2.8.0 新增对 **NVIDIA CDI 模式** 的支持，CDI 是 [CNCF TAG](https://github.com/cncf-tags) 维护的容器设备接口标准，提供更标准化的设备注入方式。

**CDI vs 传统环境变量模式对比：**

**配置方式：**

编辑 `values.yaml`：

```yaml
global:
  deviceListStrategy: cdi-annotations  # 或 envvar
```

**CDI 模式下的设备注入：**

```yaml
# Pod Spec 示例
spec:
  containers:
  - name: gpu-container
    image: nvidia/cuda:11.8.0-base-ubuntu22.04
    resources:
      limits:
        nvidia.com/gpu: 1
    # CDI 模式下，设备通过 CDI 注入，无需环境变量
```

### 对齐 NVIDIA k8s-device-plugin v0.18.0

HAMi v2.8.0 同步升级并对齐 **NVIDIA 官方 k8s-device-plugin v0.18.0**，确保与 NVIDIA 最新设备管理模型的兼容性。

**对齐的核心价值：**

1. **保持兼容性**：支持 NVIDIA 最新 GPU 硬件和驱动特性

2. **降低适配成本**：用户可以在现有 NVIDIA GPU 生态中平滑引入 HAMi

3. **生态协同**：HAMi 作为设备管理的"增强层"，而非"分叉实现"

**同步的主要特性：**

* 支持 NVIDIA GPU Driver 最新版本

* 兼容 MIG（Multi-Instance GPU）最新特性

* 支持新的设备监控指标和健康检查机制

### Mock Device Plugin - 开发测试利器

HAMi v2.8.0 新增 [**Mock Device Plugin**](https://github.com/Project-HAMi/mock-device-plugin) 能力，为开发者和 CI/测试环境提供更低门槛的设备模拟方式。

Mock Device Plugin 工作流程如下图所示：

![Mock Device Plugin 工作流程图](/images/blog/hami-2.8-deep-dive/mock-device-plugin-workflow.png)

**核心功能：**

1. **虚拟设备注册**：将虚拟设备（如 gpu-memory、gpu-cores）注册到节点，使其在 `node.status.allocatable` 和 `node.status.capacity` 中可见

2. **资源类型支持**：

   * NVIDIA GPU：`nvidia.com/gpumem`、`nvidia.com/gpumem-percentage`、`nvidia.com/gpucores`

   * Hygon DCU：`hygon.com/dcumem`

   * Ascend：`huawei.com/Ascend{chip-name}-memory`

3. **开发测试便利**：无需真实 GPU 硬件即可进行功能验证和开发调试

**部署方式：**

```bash
# 部署 RBAC
kubectl apply -f k8s-mock-rbac.yaml

# 部署 ConfigMap（如未部署）
kubectl apply -f device-configmap.yaml

# 部署 Mock Device Plugin
kubectl apply -f k8s-mock-plugin.yaml
```

**节点资源效果示例：**

```yaml
Allocatable:
  memory:                    769189866507
  nvidia.com/gpu:            20
  nvidia.com/gpucores:       200
  nvidia.com/gpumem:         65536
  nvidia.com/gpumem-percentage: 200
  pods:                      110
```

**注意事项：**

* 如果显存统计值过大（如超过 120GB），会显示为 0。此时可调整 `hami-scheduler-device` ConfigMap 中的 `memoryFactor` 参数（默认值为 1）

### 构建信息与 Metrics 体系更新

HAMi v2.8.0 在可观测性方面进行了系统性增强：

**新增指标：**

* `hami_build_info`：包含版本号、构建时间、Git 提交等信息

* 启动时输出完整版本信息

**移除的废弃指标：**

* `vGPUPodsDeviceAllocated`：请使用 `vGPUMemoryAllocated` 和 `vGPUCoreAllocated` 替代

* `vGPUMemoryPercentage`：请使用 `vGPUMemoryAllocated` 替代

* `vGPUCorePercentage`：请使用 `vGPUCoreAllocated` 替代

**Metrics 示例：**

```plain&#x20;text
# 新增的构建信息指标
hami_build_info{version="v2.8.0",git_commit="abc123",build_date="2026-01-29"} 1

# GPU 资源分配指标
hami_vgpu_memory_allocated{node="gpu-node-1"} 16384
hami_vgpu_core_allocated{node="gpu-node-1"} 150
```

**启动日志示例：**

```plain&#x20;text
I0129 10:00:00.000000       1 version.go:42] HAMi Scheduler Version: v2.8.0
I0129 10:00:00.000001       1 version.go:43] Git Commit: abc123def
I0129 10:00:00.000002       1 version.go:44] Build Date: 2026-01-29T10:00:00Z
I0129 10:00:00.000003       1 version.go:45] Go Version: go1.25.5
```

## 异构 GPU 生态建设进展

HAMi 持续扩展对国产 GPU/AI 芯片的支持，v2.8 版本在以下方向取得进展：

![HAMi 支持的异构 GPU 生态全景图](/images/blog/hami-2.8-deep-dive/heterogeneous-gpu-ecosystem.png)

### 天数智芯支持更新

HAMi v2.8 对天数智芯（Iluvatar）GPU 的支持进行了多项增强：

**相关 PR：**

* [PR #1547](https://github.com/Project-HAMi/HAMi/pull/1547)：天数芯片支持更新

* [PR #1399](https://github.com/Project-HAMi/HAMi/pull/1399)：vXPU 特性优化

**核心改进：**

1. **多卡调度优化**：修复 P800 节片上 vXPU 特性的潜在问题（[PR #1569](https://github.com/Project-HAMi/HAMi/pull/1569)）

2. **调度失败事件优化**：增强调度器事件输出，便于排查天数芯片调度问题（[PR #1444](https://github.com/Project-HAMi/HAMi/pull/1444)）

3. **设备信息增强**：在 DeviceUsage 中添加 podInfos，提升调度决策质量（[PR #1362](https://github.com/Project-HAMi/HAMi/pull/1362)）

**天数智芯配置示例：**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: iluvatar-gpu-pod
spec:
  containers:
  - name: gpu-container
    image: iluvatar-gpu-app:latest
    resources:
      limits:
        iluvatar.ai/vgpu: 1
        iluvatar.ai/vgpu-memory: 4096
```

### 沐曦 GPU 支持更新

HAMi v2.8 对沐曦（MetaX）GPU 的支持持续增强：

**相关 PR：**

* [PR #1436](https://github.com/Project-HAMi/HAMi/pull/1436)：沐曦新特性支持

* [PR #1444](https://github.com/Project-HAMi/HAMi/pull/1444)：沐曦调度失败事件优化

**核心能力：**

1. **sGPU 算力/显存共享**：支持虚拟 GPU 共享，提升资源利用率

2. **三种 QoS 模式**：BestEffort、FixedShare、BurstShare

3. **拓扑感知调度**：基于 MetaXLink 的智能调度

4. **WebUI 全面支持**：异构指标可视化展示

**沐曦配置示例（QoS）：**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: metax-gpu-pod
  annotations:
    metax-tech.com/sgpu-qos-policy: "fixed-share"  # best-effort / fixed-share / burst-share
spec:
  containers:
  - name: gpu-container
    image: metax-gpu-app:latest
    resources:
      limits:
        metax-tech.com/sgpu: 1
        metax-tech.com/vcore: 60      # 60% 算力
        metax-tech.com/vmemory: 4     # 4GiB 显存
```

### 华为昇腾 vNPU 支持

HAMi 社区的 [ascend-device-plugin](https://github.com/Project-HAMi/ascend-device-plugin) 项目现已支持 **vNPU（虚拟 NPU）特性**，同时支持 HAMi 和 Volcano 调度器。

**核心特性：**

1. **vNPU 虚拟化**：支持华为昇腾 910 系列芯片的虚拟切分

2. **双调度器支持**：同时兼容 HAMi 和 Volcano 调度器

3. **显存隔离**：精确控制每个 vNPU 的显存使用

**昇腾配置示例：**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: ascend-npu-pod
spec:
  containers:
  - name: npu-container
    image: ascend-npu-app:latest
    resources:
      limits:
        huawei.com/Ascend910: 1
        huawei.com/Ascend910-memory: 8192
```

## 上下游生态集成进展

HAMi 持续与 Kubernetes AI 生态中的关键组件进行协同演进，v2.8 在以下方向取得进展：

### Kueue 集成增强

Kueue 是 Kubernetes SIG Scheduling 维护的批量作业队列管理项目，HAMi 社区向 Kueue 贡献了增强能力，使其原生支持 HAMi 的设备资源管理与调度模型。

Kueue + HAMi 集成架构如下图所示：

![Kueue + HAMi 集成架构图](/images/blog/hami-2.8-deep-dive/kueue-hami-integration.png)

**Kueue 集成配置示例：**

**1. 启用 Kueue Deployment 支持：**

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

**2. 配置 ResourceTransformation：**

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

**3. 创建 ResourceFlavor：**

```yaml
apiVersion: kueue.x-k8s.io/v1beta2
kind: ResourceFlavor
metadata:
  name: hami-flavor
spec:
  nodeLabels:
    gpu: "on"
```

**4. 创建 ClusterQueue：**

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

**5. 创建 LocalQueue：**

```yaml
apiVersion: kueue.x-k8s.io/v1beta2
kind: LocalQueue
metadata:
  name: hami-local-queue
  namespace: default
spec:
  clusterQueue: hami-queue
```

**6. 提交使用 vGPU 的 Deployment：**

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

**资源转换说明：**

Kueue 的 ResourceTransformation 会自动转换 HAMi vGPU 资源请求：

* `nvidia.com/gpu` × `nvidia.com/gpucores` → `nvidia.com/total-gpucores`

* `nvidia.com/gpu` × `nvidia.com/gpumem` → `nvidia.com/total-gpumem`

例如：

* 2 个副本的 Deployment，每个请求 `nvidia.com/gpu: 1`、`nvidia.com/gpucores: 50`、`nvidia.com/gpumem: 1024`

* 实际消耗：`nvidia.com/total-gpucores: 100`（2 × 1 × 50）和 `nvidia.com/total-gpumem: 2048`（2 × 1 × 1024）

### vLLM 兼容性修复

vLLM 是流行的 LLM 推理框架，HAMi v2.8 修复了多项 vLLM 相关的兼容性问题。

**修复的问题：**

1. **多卡场景崩溃**：修复使用 vLLM 时多卡会 crash 的问题（[Issue #1461](https://github.com/Project-HAMi/HAMi/issues/1461)）

2. **CUDA\_VISIBLE\_DEVICES 兼容**：修复手动指定设备时初始化失败的问题（[Issue #1381](https://github.com/Project-HAMi/HAMi/issues/1381)）

**vLLM 使用 HAMi 示例：**

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

## 关键问题修复与稳定性提升

v2.8 版本集中修复了一批来自真实生产环境的问题，提升了系统稳定性。

**核心修复：**

1. **GPU / MIG 实例分配错误**（[PR #1518](https://github.com/Project-HAMi/HAMi/pull/1518)）

   * 修复调度器错误分配 MIG 实例的问题

2. **并发 map 读写崩溃**

   * 修复并发场景下的 map 迭代和写入致命错误（[PR #1452](https://github.com/Project-HAMi/HAMi/pull/1452), [PR #1476](https://github.com/Project-HAMi/HAMi/pull/1476)）

3. **配额（quota）计算错误**（[PR #1400](https://github.com/Project-HAMi/HAMi/pull/1400)）

   * 修复 ResourceQuota 计算错误

4. **设备插件卸载残留**（[PR #1456](https://github.com/Project-HAMi/HAMi/pull/1456)）

   * 修复设备插件卸载后节点仍有残留状态的问题

5. **vLLM 相关调度问题**（[PR #1478](https://github.com/Project-HAMi/HAMi/pull/1478)）

   * 修复 vLLM 相关的调度和资源计算问题

6. **多种异构设备边界异常**

   * 修复 kunlunxin vXPU 在分配多卡时会错误 pending 的问题（[PR #1569](https://github.com/Project-HAMi/HAMi/pull/1569)）

   * 修复沐曦 P800 节片上 vXPU 特性问题

7. **调度失败事件优化**（[PR #1444](https://github.com/Project-HAMi/HAMi/pull/1444)）

   * 优化调度失败事件输出，提升故障排查效率

## 版本优化与工程改进

### 节点注册逻辑优化（[PR #1499](https://github.com/Project-HAMi/HAMi/pull/1499)）

重构节点注册逻辑，提升节点管理的稳定性和可维护性。

### Golang 升级至 v1.25.5

HAMi v2.8 将 Golang 版本升级至 v1.25.5，获得最新的语言特性和安全修复。

### 证书热更新支持

HAMi 现在支持 **监听并热加载证书变更**，避免因证书更新导致的组件重启或服务中断问题。

**配置方式：**

```yaml
scheduler:
  certWatchEnabled: true
  certDir: /etc/hami/certs
```

### 项目瘦身

删除了多个项目初期的二进制文件，REPO 大小从 132M 缩小到 20M，提升克隆和构建速度。

## 社区动态

HAMi 社区持续活跃，在 v2.8 开发期间，社区在以下方面取得进展：

### CNCF 用户案例发布

**DaoCloud 使用 HAMi 构建 GPU 云** 的用户案例已发布在 CNCF 官网：

<https://www.cncf.io/case-studies/daocloud/>

DaoCloud 基于 HAMi 构建了 GPU 云平台，实现异构算力的池化与调度，显著提升资源利用率。

### HAMi Meetup 社区活动

HAMi 社区以 **"不卷算力卷效率"** 为主题，开展了两次线下 Meetup 活动，汇集了来自云厂商、互联网公司、AI 企业的近百位技术专家，分享 HAMi 在异构算力调度领域的实践与经验。

#### 第一届 HAMi Meetup 上海站（2025 年 11 月 30 日）

![第一届 HAMi Meetup 上海站](/images/blog/hami-2.8-deep-dive/meetup-shanghai.png)

**主题**：云原生 AI 基础设施与异构算力调度实践

Linux 基金会副总裁、CNCF 亚太区中国主席 Keith Chan 在开场演讲中指出：GPU 成本高、资源利用率不足已成为全球共性问题，70%–80% 的推理与训练工作负载已运行在 Kubernetes 上，超过 80% 的企业认为"开源是 AI 成熟的关键驱动力"。

**技术分享**：来自沐曦（郭磊）、蔚来（李鹏）、DaoCloud（卢传佳）、星环科技（侯雨希）等企业的技术专家，分享了 HAMi 在 MetaX sGPU、vGPU 性能优化、GPU 虚拟化实践、国产算力适配等方面的经验。李孟轩（HAMi 核心 Maintainer，密瓜智能联合创始人兼 CTO）介绍了从 2.7.0 到 2.8.0 的版本演进与 DRA 规划。

#### 第二届 HAMi Meetup 北京站（2025 年 12 月 27 日）

![第二届 HAMi Meetup 北京站](/images/blog/hami-2.8-deep-dive/meetup-beijing.png)

**主题**：国产算力的生产实践与异构调度工程落地

Keith Chan 再次强调：AI 的发展正在从模型本身转向对底层基础设施与资源效率的考验，如何通过云原生与开源技术构建更弹性的 AI 基础设施，是整个行业面临的共同课题。

**技术分享**：来自海光信息（王忠勤）、贝壳（王妮）、第四范式（杨守仁、James）、睿思智联（欧阳陆伟）等企业的工程师，分享了 DCU 软件虚拟化、vGPU 推理集群实践（**GPU 利用率提升约 3 倍**）、HAMi-Core x DRA、国产算力适配等实战经验。李孟轩介绍了 HAMi 新特性与能力矩阵标准化规划。

**PPT 资源**：

* HAMi Meetup 上海站：<https://project-hami.io/zh/blog/hami-meetup-shanghai-2025>

* HAMi Meetup 北京站：<https://project-hami.io/zh/blog/hami-meetup-beijing-2025>

### 社区贡献者

HAMi v2.8 的进展，离不开社区中多位贡献者的持续投入与反馈。特别感谢以下社区成员在本阶段的重要贡献：

* [**@archlitchi**](https://github.com/archlitchi)：核心调度与多项关键修复、版本发布与 CI 稳定性

* [**@luohua13**](https://github.com/luohua13)：配额计算、设备生命周期与调度稳定性改进

* [**@Shouren**](https://github.com/Shouren)：NVIDIA / MIG 相关修复、安全与工程质量提升

* [**@FouoF**](https://github.com/FouoF)：Scheduler 稳定性、测试与 Helm 相关改进

* [**@Kyrie336**](https://github.com/Kyrie336)：调度决策增强与多设备支持

* [**@litaixun**](https://github.com/litaixun)：并发安全、节点与设备管理相关修复

* [**@DSFans2014**](https://github.com/DSFans2014)：Ascend 设备与异构场景支持改进

同时也感谢所有通过 Issue、Pull Request、测试反馈等形式参与 HAMi v2.8 阶段开发的社区贡献者。

### 社区成长

HAMi v2.8 期间，社区在成员角色上也取得了重要进展：

* [**@Shouren**](https://github.com/Shouren) （杨守仁）晋升升为 HAMi **Maintainer**（\[[issue #33](https://github.com/Project-HAMi/community/issues/33)]）。Shouren 在调度健壮性、设备管理、发布流程、安全更新等方面贡献显著，更是 HAMi-DRA 驱动的核心开发者，已审查数百个 Issue 与 PR。

* [**@FouoF**](https://github.com/FouoF)（王纪飞）晋升为 HAMi **Approver**（\[[issue #31](https://github.com/Project-HAMi/community/issues/31)]）。FouoF 在调度器稳定性、HAMi-DRA、测试完善与 Charts 改进等方面持续投入，已成为项目的重要审查者。

* [**@DSFans2014**](https://github.com/DSFans2014) （James）晋升为 HAMi **Reviewer**（\[[issue #29](https://github.com/Project-HAMi/community/issues/29)]）。DSFans2014 在 Ascend 设备与异构场景支持方面贡献显著，积极参与代码审查与问题修复。

* [**@Shenhan11**](https://github.com/Shenhan11) （申涵）晋升为 HAMi **Reviewer**（\[[issue #30](https://github.com/Project-HAMi/community/issues/30)]）。Shenhan11 在多个功能模块的开发与测试中持续投入，为项目质量提升提供保障。

同时也感谢所有通过 Issue、Pull Request、测试反馈等形式参与 HAMi v2.8 阶段开发的社区贡献者。

## 未来展望：v2.9 路线图

HAMi v2.9.0 将在以下方向持续演进：

**核心特性**

* **调度增强**：MPS 集成、资源抢占、PodGroup 支持（Kueue/Volcano）

* **异构芯片**：AMD Mi300X、寒武纪 5x0 系列、燧原 DRX 模式

* **DRA 扩展**：华为昇腾 DRA 适配

**Volcano-vGPU**

* **灵活切分**：Dynamic MIG、拓扑感知调度

* **生态集成**：CDI 支持、LWS 集成、NVIDIA DP 0.18.0 适配

v2.8 → v2.9 演进路线图如下所示。

![v2.8 → v2.9 演进路线图](/images/blog/hami-2.8-deep-dive/roadmap-v2.8-to-v2.9.png)

HAMi 社区欢迎更多开发者、用户和生态伙伴加入，共同推动异构算力调度在云原生体系中的长期演进。在"序"与"调度"的坐标中，绘制更远的开源航图。

感谢所有在 HAMi v2.8 阶段做出贡献的社区成员、用户和生态伙伴。你们的持续投入，是 HAMi 能够不断走向**生产可用与生态友好**的关键力量。

## 下载与安装

**Helm Chart:**

```bash
helm repo add hami https://project-hami.io/hami-helm
helm repo update
helm install hami hami/hami --version 2.8.0
```

**源代码：**

<https://github.com/Project-HAMi/HAMi/releases/tag/v2.8.0>

**文档：**

<https://project-hami.io/docs/>
