---
title: "HAMi 2.10 发布解读：Flexible MIG、AMD vGPU 与调度生态全面升级"
coverTitle: HAMi 2.10 发布解读
date: '2026-08-21'
excerpt: >-
  HAMi v2.10.0 正式发布！Flexible MIG 基于 NVML 实现按需动态创建与回收 MIG 实例，AMD Instinct MI300X 获得软件 vGPU 支持，mutex 互斥策略与可组合调度策略链补齐真实集群诉求，KAI Resource Isolator 与 Volcano vNPU 集成让 HAMi-core 的隔离能力进入更广的调度生态。
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
language: zh
linktitle: HAMi v2.10.0 版本深度解读
---

近日，CNCF 孵化项目 HAMi 正式发布 **v2.10.0**。这个版本围绕三条主线展开：**调度更灵活**（动态 Flexible MIG、可组合调度策略链、成组调度）、**加速器版图更广**（AMD Instinct MI 系列、壁仞、更完善的昇腾管理）、**生态扩大**（KAI Scheduler + HAMi-core 集成、Volcano vNPU）。

本文梳理 v2.10.0 的重要特性，并给出可直接上手的配置示例。

## 亮点速览

![HAMi v2.10.0 亮点总览](/images/blog/hami-v210-deep-dive/highlights-tree.png)

**调度更灵活**：Flexible MIG 基于 NVML 按工作负载动态创建与回收 MIG 实例，无需排空节点；`mutex` 互斥策略与可组合策略链（如 `mutex,binpack,numa`）覆盖独占、紧凑与 NUMA 亲和的组合诉求；NUMA 排序缺陷修复让 `binpack` 与 `spread` 在多 NUMA 拓扑下符合预期。此外，PodGroup 成员绑定不再互相挤垮，init-container 资源记账对齐 Kubernetes 标准语义。

**加速器版图扩张**：AMD Instinct MI300X 获得软件 vGPU 支持，显存与算力双重隔离；壁仞加速器支持整卡与 SVI 分区两种模式；昇腾集群可在同一集群内混布 vNPU 硬切分与 HAMi-core 软切分节点，软切分资源新增容器级 Prometheus 监控。

**生态集成**：全新伴生项目 KAI Resource Isolator 把 HAMi-core 的运行时硬隔离能力接入 KAI Scheduler；Volcano 可直接调度昇腾软切分资源，让批量调度语义与容器级隔离协同工作。

**工程改进**：DRA 组件独立成 chart，主 chart 更精简；面向昇腾 NPU 的 Ascend-DRA 支持也即将推出，将随 HAMi-DRA chart 独立发布；编译链路迁移到 ubi8 镜像，同一份构建产物可运行在更多目标发行版上。

## 调度：更灵活、更可组合

### Flexible MIG：彻底告别 mig-parted 的动态 MIG

这可能是 v2.10.0 调度侧最值得关注的变化，由 [@FouoF](https://github.com/FouoF) 主导实现（[HAMi #2378](https://github.com/Project-HAMi/HAMi/pull/2378)）。

NVIDIA MIG（Multi-Instance GPU）是 A100 及更新架构上的硬件级隔离方案，但它"怎么切"一直是个麻烦事：

| 方案 | 切分依据 | 感知工作负载 | 主要问题 |
|-|-|-|-|
| NVIDIA 原始 MIG manager | 节点维度预切分，依赖 mig-parted | 否 | 换模板要重配节点，不感知负载，不支持 CDI |
| HAMi 旧版动态 MIG（v2.5.0+） | 第一个工作负载提交时触发，仍依赖 mig-parted | 部分 | 切分由"第一个负载"决定：如果第一个负载只要 1g.5gb，整卡就按小模板切死，后续大规格任务无法运行 |
| **v2.10.0 Flexible MIG** | **每个工作负载按需创建与回收，基于 NVML 原生 API** | **是** | 暂不支持 CDI，多设备 MIG 场景待进一步验证 |

#### 新实现：用 NVML 完整接管 MIG 生命周期

新实现不再依赖 mig-parted，**通过 NVML 直接控制 MIG 实例信息的获取、上报、创建和回收**。调度器不仅决定"切多大"，还决定"切在哪里"（placement），MIG 实例的完整生命周期如下：

![Flexible MIG 实例的完整生命周期](/images/blog/hami-v210-deep-dive/flexible-mig-lifecycle.png)

实现围绕一组 NVML 原生 API 展开：

- **发现与放置规划**：`GetGpuInstanceProfileInfo`（查询 Profile 的显存与 SM 能力）、`GetGpuInstancePossiblePlacements`（查询可放置位置）
- **创建与回收**：`CreateGpuInstanceWithPlacement`（在调度器指定位置创建 GI）、`CreateComputeInstance`；`GetGpuInstanceById` / `GpuInstance.Destroy()` 等负责查找与销毁
- **状态恢复**：GI/CI 状态通过 Pod 注解记录，`GetGpuInstances` 让 device-plugin 重启后寻找已有 GI、对账校验、清理空闲 GPU 上的残留实例
- **安全护栏**：`Device.GetComputeRunningProcesses` 检查设备上是否还有计算进程，避免重置有活跃负载的 GPU

另外，节点上报的 annotation 做了字段裁剪，避免超长注解。

#### 配置示例

为 MIG 节点开启 `mig` 模式（`hami-device-plugin` 的 ConfigMap）：

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

可选：通过 `knownMigGeometries` 约束"这张卡允许被切成什么"：

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

然后用与其他 HAMi 负载完全一致的 API 提交任务，不需要学新的资源名：

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: mig-pod
  annotations:
    nvidia.com/vgpu-mode: "mig" # 可选；不填则可在 MIG 节点与 hami-core 节点间通用调度
spec:
  containers:
    - name: cuda-container
      image: nvidia/cuda:12.4.1-base-ubuntu22.04
      command: ["bash", "-c", "sleep 86400"]
      resources:
        limits:
          nvidia.com/gpu: 2 # 2 个 MIG 实例
          nvidia.com/gpumem: 8000 # 每个实例至少 8GiB 显存
```

#### 一次真实的调度实验

A100 上的一组实测（1g 模板可放任何位置，2g 模板仅允许 0、2、4 位置）可以直观感受"按需"行为：先提交的 1g 和 2g 任务正常创建并运行；此时再提交 3g 任务，因剩余可放置位置不足而 Pending；删除 1g 的 Pod 后，腾出的空间恰好容纳 3g，任务成功调度；随后重建 1g 也能在剩余空位上运行。

同样的规格，旧版在第三步会永久 Pending，整卡几何在第一个负载到达时就被锁死；新版通过动态创建与回收让集群自己消化负载变化，**全程无需排空（drain）节点、无需 cordon**。监控上，DCGM 风格指标会暴露 MIG UUID、Profile、实例 ID 和放置坐标。已知限制：CDI 模式暂不支持与 MIG 同时使用；多设备 MIG 场景待验证，建议先在自己的拓扑上测试。

### mutex 互斥策略与可组合调度策略链

新的 `mutex` 策略（[HAMi #2011](https://github.com/Project-HAMi/HAMi/pull/2011)，[@mesutoezdil](https://github.com/mesutoezdil)）要求带该注解的 Pod **只能调度到当前没有任何负载占用的 GPU 卡上**，卡上已有的 Pod 无论是否带 `mutex` 注解，都会让该卡被排除；且该约束只在放置时刻单向生效，之后调度的非 `mutex` Pod 仍可能加入同一张卡。

```yaml
metadata:
  annotations:
    hami.io/gpu-scheduler-policy: "mutex"
```

如果需要全程独占整卡直到任务退出，直接按整卡申请资源即可。

`hami.io/gpu-scheduler-policy` 现在接受**有序逗号分隔的策略链**（[HAMi #2621](https://github.com/Project-HAMi/HAMi/pull/2621)，关闭 [#2010](https://github.com/Project-HAMi/HAMi/issues/2010)）。真实集群要的往往不是单一策略，而是"独占 + 紧凑 + NUMA 亲和"的组合：

```yaml
# 先用 mutex 过滤出空闲 GPU，再按 binpack 排序，NUMA 作平级裁决
metadata:
  annotations:
    hami.io/gpu-scheduler-policy: "mutex,binpack,numa"
```

规则要点：`binpack`、`spread`、`numa` 是排序键，按书写顺序生效；`mutex` 和 NVIDIA 的 `topology-aware` 是过滤器，在排序前剔除候选；纯过滤器组合会回退为 `spread`；单个策略值的行为与旧版完全一致。

### PodGroup 成组调度

v2.10.0 在 **Kubernetes v1.35 及以上**版本支持 PodGroup 成组调度能力。带有 `scheduling.x-k8s.io/pod-group` 标签的 Pod 会作为一组统一调度和绑定，适合分布式训练等"全有或全无"负载。

### init-container 资源记账修正

用 init 容器下载权重/准备数据的 Pod 此前被过量计数：调度器把所有容器的请求加总，等于假设 init 容器与应用容器并行运行。v2.10.0 对齐 Kubernetes 标准语义，有效请求变为 `max(Σ app containers, max(init containers))`（[HAMi #1773](https://github.com/Project-HAMi/HAMi/pull/1773)，[@maishivamhoo123](https://github.com/maishivamhoo123)），消除了"节点明明够却报满"的误判：

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
# 有效请求 = max(16000, 8000) = 16000 MiB，旧版本会误算成 24000 MiB
```

## 加速器版图：AMD、壁仞加入，昇腾走向异构

### AMD Instinct MI300X：AMD 也有软 vGPU 了

AMD Instinct 系列此前在 Kubernetes 里基本只能整卡分配。v2.10.0 中，[@FouoF](https://github.com/FouoF) 与 [@kenji-mido](https://github.com/kenji-mido) 合作带来了**软件 vGPU 支持**（[HAMi #2290](https://github.com/Project-HAMi/HAMi/pull/2290)），并在 **MI300X + ROCm 7.0.2** 上完成验证。

实现不依赖硬件 SR-IOV：由 [amd-device-plugin](https://github.com/Project-HAMi/amd-device-plugin)（0.0.1）通过 `postStart` hook 在节点上安装 `libamvgpu.so`，经 glibc `LD_AUDIT` 注入工作负载，再通过 `HIP_DEVICE_MEMORY_LIMIT` 施加硬限制，显存和算力都做到"分多少、用多少"：

![AMD 软 vGPU 实现架构](/images/blog/hami-v210-deep-dive/amd-vgpu-architecture.png)

资源请求方式与 NVIDIA 侧保持一致的体验：

| 维度 | 资源名 | 语义 |
|-|-|-|
| 显存隔离 | `amd.com/gpumem`（MiB） | 单卡硬限制，用量不会超过分配值 |
| 算力隔离 | `amd.com/gpucores`（0-100，CU%） | 限制计算单元百分比（如 `25` 约等于 304 CU 设备上的 76 CU） |
| 设备数量 | `amd.com/gpu` | GPU 个数 |

```yaml
resources:
  limits:
    amd.com/gpu: "1" # 1 块 GPU
    amd.com/gpumem: "49152" # 48 GiB 显存
    amd.com/gpucores: "30" # 30% 计算单元
```

部署方式：先确认 HAMi scheduler 管理三个 AMD 资源名，再安装专用插件（**不要**与上游 ROCm `k8s-device-plugin` 混用；如果用 AMD GPU Operator 管驱动，需先关闭其内置 device-plugin）：

```bash
helm upgrade --install amd-gpu \
  https://github.com/Project-HAMi/amd-device-plugin/releases/download/amd-gpu-helm-0.0.1/amd-gpu-0.0.1.tgz \
  --namespace kube-system \
  --create-namespace
```

使用限制：工作负载镜像必须是 **glibc 基础且 GLIBC 2.34 及以上**（较新的 `rocm/pytorch` 标签即可），Alpine/musl、Ubuntu 20.04、RHEL 8 暂不支持；RDNA/WGP 架构设备暂不支持；单 Pod 多 GPU 场景因缺少硬件尚未验证。

### 壁仞设备支持

v2.10.0 新增壁仞（Biren）加速器管理支持（[HAMi #1711](https://github.com/Project-HAMi/HAMi/pull/1711)，[@DSFans2014](https://github.com/DSFans2014)，验证型号 `Biren166M`），提供整卡和 SVI 固定 2/4 分区两种模式，节点打标后即可使用；注意 Biren 不按显存/算力细分，Pod 拿到的是整卡或一个 SVI 分区：

```bash
kubectl label node <node-name> biren=on
```

```yaml
resources:
  limits:
    birentech.com/gpu: "1"
```

至此，HAMi 覆盖的加速器已包括 NVIDIA、AMD、华为昇腾、寒武纪、海光、壁仞、燧原、沐曦、摩尔线程、昆仑芯、天数智芯、AWS Neuron 和瀚博半导体等。

### 昇腾异构模式：vNPU 与 HAMi-core 同集群共存

v2.9.0 的 HAMi-core 模式要求 Pod 显式声明，运维得维护两套负载清单。v2.10.0 让昇腾负载**对模式无感**：不带 `huawei.com/vnpu-mode` 注解的 Pod 落到模板节点就走 vNPU 硬切分，落到 hami-core 节点就走软切分（[HAMi #2035](https://github.com/Project-HAMi/HAMi/pull/2035)、[ascend-device-plugin #106](https://github.com/Project-HAMi/ascend-device-plugin/pull/106)，[@ouyangluwei163](https://github.com/ouyangluwei163)）；带显式注解的 Pod 仍固定模式，只有节点确实不支持 hami-core 时才会拒绝：

```yaml
# 显式指定软切分（可选）
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
          huawei.com/Ascend910B3-core: "40" # 40% 算力核
```

### 昇腾 vNPU HAMi-core：从"可分配"到"可观测"

HAMi v2.9.0 引入了昇腾软切分（hami-core 模式），但软切分的资源长期"看得见分配、看不见使用"。v2.10.0 中，[@maverick123123](https://github.com/maverick123123) 为 vNPU HAMi-core 模式内置了 Prometheus 指标服务（[ascend-device-plugin #93](https://github.com/Project-HAMi/ascend-device-plugin/pull/93)），把软切分资源变成可观测、可运维的对象：

- **内置 metrics server（端口 9395）**：仅在 `hami-vnpu-core` 模式启用时启动，无额外部署成本。
- **容器级 AICore 利用率**：`hami_container_device_utilization_ratio` 按设备 UUID 正确映射，不再回退到第一块设备。
- **设备级显存**：`hami_host_gpu_memory_used_bytes` 从容器级用量聚合而来，共享场景下数值更准。
- **进程级 HBM 追踪**：通过 DCMI 采集，支持多卡张量并行（如 vLLM TP=2）推理的按容器共享内存核算（[ascend-device-plugin #87](https://github.com/Project-HAMi/ascend-device-plugin/pull/87)、[hami-vnpu-core #10](https://github.com/Project-HAMi/hami-vnpu-core/pull/10)）。

```promql
# 每个容器的 AICore 利用率
hami_container_device_utilization_ratio

# 每块 vNPU 的已用显存（按容器聚合）
hami_host_gpu_memory_used_bytes
```

监控栈可以用 [ascend-device-plugin 的 Helm chart](https://github.com/Project-HAMi/ascend-device-plugin) 直接部署（[#108](https://github.com/Project-HAMi/ascend-device-plugin/pull/108)），接入现有 Prometheus + Grafana 即可出图。

## 生态集成：KAI Scheduler 与 Volcano

### KAI Scheduler + HAMi-core: KAI Resource Isolator

NVIDIA 开源的 [KAI Scheduler](https://github.com/kai-scheduler/KAI-Scheduler) 在 GPU 共享调度上很强，但调度器只能保证"请求之和不超过一张卡"，无法在运行时物理阻止超用。v2.10.0 发布了由 [@archlitchi](https://github.com/archlitchi) 开发的伴生项目 [KAI Resource Isolator](https://github.com/Project-HAMi/KAI-resource-isolator)（v1.1.0，监控部分由 [@dttung2905](https://github.com/dttung2905) 贡献），把 HAMi-core 的运行时隔离能力接入 KAI 体系，让 KAI 的共享 GPU 从"协作式"升级为"硬隔离"。

职责划分非常干净：**KAI Scheduler 决定"谁分多少"，Isolator 保证"分到多少就只能用多少"**。

![KAI Resource Isolator 架构](/images/blog/hami-v210-deep-dive/kai-resource-isolator.png)

安装两步（要求 KAI Scheduler v0.17.0 及以上）：

```bash
# 1. 安装 KAI Scheduler，开启 GPU 共享与 hamicore 插件
helm install kai-scheduler oci://ghcr.io/nvidia/kai-scheduler \
  --version v0.17.0 \
  --set global.gpuSharing=true \
  --set binder.plugins.hamicore.enabled=true \
  --namespace kai-scheduler --create-namespace

# 2. 安装节点侧隔离器（chart 版本带 -chart 后缀）
helm install kai-resource-isolator oci://docker.io/projecthami/kai-resource-isolator \
  --namespace kai-resource-isolator --create-namespace \
  --version 1.1.0-chart
```

之后，任何被 KAI 调度、带 `gpu-memory` 注解的 Pod 都会自动获得显存硬隔离：

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: gpu-sharing-with-isolation
  labels:
    kai.scheduler/queue: default-queue
  annotations:
    gpu-memory: "4096" # 单位 MiB
spec:
  schedulerName: kai-scheduler
  containers:
    - name: gpu-workload
      image: nvidia/cuda:12.9.2-base-ubuntu24.04
      command: ["sleep", "infinity"]
```

验证方式很直接：进容器执行 `nvidia-smi`，看到的显存是分配额度而非整卡显存，且无法超额分配：

```bash
kubectl exec -it gpu-sharing-with-isolation -- nvidia-smi
```

需要说明的是，这套架构已经落地、隔离器已发布，但两个加固 PR 还在推进中：基于 fraction 的显存强制（[KAI-resource-isolator #6](https://github.com/Project-HAMi/KAI-resource-isolator/pull/6)）和非 root 容器目录权限（[#22](https://github.com/Project-HAMi/KAI-resource-isolator/pull/22)）。生产上硬隔离场景建议先验证内存限制确实生效。更多背景可以阅读此前的深度解析：[KAI Scheduler + HAMi 的 GPU 显存硬隔离](https://project-hami.io/zh/blog/kai-scheduler-hami-gpu-memory-hard-isolation)。

### Volcano vNPU：批量调度器也能调度昇腾软切分

Volcano 是很多 AI 集群的批量调度器首选。v2.10.0 的集成没有重新发明软切分，而是把**"分配者"从 HAMi Scheduler 换成 Volcano**，下面两层原样复用：

| 层次 | HAMi 2.9 路径 | Volcano 集成路径 |
|-|-|-|
| 调度器 | HAMi Scheduler | Volcano Scheduler |
| 设备发现/挂载 | ascend-device-plugin | 同一个 ascend-device-plugin |
| 软切分执行 | hami-vnpu-core（libvnpu.so） | 同一个 hami-vnpu-core |
| 队列、Gang、binpack | 非重点 | Volcano 提供 |

注意 Volcano 调度昇腾 vNPU 有两种模式：Volcano 原生昇腾插件的 **MindCluster 模式**（`AscendMindClusterVNPUEnable`，走驱动模板硬切分）和基于 ascend-device-plugin 的 **HAMi 模式**（`AscendHAMiVNPUEnable`，支持 hami-core 软切分）。v2.10.0 补全的是后者中的软切分路径，也是两种模式里唯一在运行时强制显存/算力上限的一种：

![Volcano 调度昇腾 vNPU 的 HAMi 模式](/images/blog/hami-v210-deep-dive/volcano-vnpu-flow.png)

#### 配置示例

Volcano 侧，在 `volcano-scheduler-configmap` 中为 `deviceshare` 插件打开 HAMi 模式：

```yaml
AscendHAMiVNPUEnable: "true" # 启用 HAMi 模式昇腾 vNPU
SchedulePolicy: binpack # 多个切片尽量装箱到同一张物理卡
KnownGeometriesCMName: hami-scheduler-device # vNPU 规格来源
```

节点侧以软切分模式部署 ascend-device-plugin（`hamiVnpuCore: true`）。Pod 侧的契约很简洁：`schedulerName: volcano`、`runtimeClassName: ascend`、`huawei.com/vnpu-mode: hami-core` 注解，加两个扩展资源：

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: ascend-vnpu-check
  annotations:
    huawei.com/vnpu-mode: "hami-core" # 缺少该注解会退回模板路径，纯软切分节点上可能一直 Pending
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
          huawei.com/Ascend310P-memory: "8192" # 8 GiB 切片
```

#### 真机验证结果

社区在一台昇腾 310P3（aarch64、npu-smi 25.5.1、Kubernetes 1.28）单节点集群上验证了完整链路；该路径支持 910A/910B2/910B3/310P 等异构昇腾集群：

- **切片隔离生效**：申请 8192 MiB 的容器内 `npu-smi info` 显示 `0 / 8192 MB`，而宿主机同一张卡是 `1848 / 21525 MB`，`libvnpu.so` 把设备查询改写成了容器配额
- **binpack 共卡**：第二个同规格 Pod 落到同一张物理卡（相同 Bus-Id），各自拥有独立的 8192 MiB 窗口；节点已分配 2 个 vNPU、16384 MiB
- **监控如实上报**：插件在 `:9395` 端点为每个 Pod 导出 `hami_vgpu_memory_limit_bytes`，数值恰好等于 8192 MiB（约 8.59e9 字节）

#### 注意事项

- **版本**：Volcano 1.14 及以上即可使用 HAMi 模式，软切分要求 1.16+ 且仅支持 ARM
- **libvnpu.so 必须与 NPU 驱动匹配**：不匹配不会报错，容器内 `npu-smi` 会一直卡在初始化
- **指标在插件 Pod 上**：`:9395` 端点由 DaemonSet 提供，业务 Pod 内访问无效
- **隔离定性**：软切分是运行时 API 层拦截，不是 SR-IOV 式硬件边界

完整原理与每条命令的真实输出见社区博客[《用 Volcano + HAMi-core 软切分昇腾 vNPU：原理与真机验证》](https://project-hami.io/zh/blog/volcano-ascend-vnpu-soft-slicing)和 [ascend-device-plugin Volcano 指南](https://github.com/Project-HAMi/ascend-device-plugin/blob/main/docs/volcano.md)。

## 工程与构建改进

这类改动不显眼，但直接决定上生产是否省心：

**DRA 独立 chart**（[HAMi #2038](https://github.com/Project-HAMi/HAMi/pull/2038)，[@archlitchi](https://github.com/archlitchi)）：DRA（动态资源分配）组件从 HAMi 主 chart 中拆出，迁入独立的 [HAMi-dra](https://github.com/Project-HAMi/HAMi-dra) 仓库。不用 DRA 的集群不再拉取相关组件，主 chart 更干净，DRA 演进也不再受主版本节奏约束。

**握手注解优化**（[HAMi #2052](https://github.com/Project-HAMi/HAMi/pull/2052)，[@archlitchi](https://github.com/archlitchi)）：节点清理时彻底移除握手注解的 key，不再写入带时间戳的 `Deleted_*` 标记，节点健康与重置上报保持一致。

**ubi8 编译镜像**（[HAMi #1958](https://github.com/Project-HAMi/HAMi/pull/1958)，[@spencercjh](https://github.com/spencercjh)）：HAMi 与 HAMi-core 的构建阶段迁移到 `nvidia/cuda:13.3.0-cudnn-devel-ubi8`，拓宽了产物的 GLIBC 兼容面，让同一份构建产物能跑在更多目标发行版上。这对 HAMi-core 这种以 `.so` 形态注入用户进程的组件尤其重要。

**mock-device-plugin NPU 模板**（[mock-device-plugin #18](https://github.com/Project-HAMi/mock-device-plugin/pull/18)，[@Wangmin362](https://github.com/Wangmin362)）：mock 插件同时支持新版嵌套与旧版扁平 `vnpus` 配置格式，并注册昇腾 AI-core 与海光 DCU 核心资源，无硬件环境也能测试 NPU vNPU 调度。

## 贡献者

v2.10.0 由 HAMi 主仓库及 Project-HAMi 组织下的多个仓库（ascend-device-plugin、KAI-resource-isolator、mock-device-plugin、hami-vnpu-core、amd-device-plugin）的社区成员共同完成。本版本的特性负责人包括：

- [@archlitchi](https://github.com/archlitchi)：发版协调、KAI Resource Isolator、DRA chart 分离、握手注解优化
- [@mesutoezdil](https://github.com/mesutoezdil)：mutex 调度策略、NUMA 排序修复、可组合策略链
- [@maverick123123](https://github.com/maverick123123)：昇腾 vNPU HAMi-core 监控
- [@ouyangluwei163](https://github.com/ouyangluwei163)：昇腾异构模式（vNPU + HAMi-core 共存）
- [@FouoF](https://github.com/FouoF)、[@kenji-mido](https://github.com/kenji-mido)：AMD MI300X vGPU、Flexible MIG
- [@DSFans2014](https://github.com/DSFans2014)：壁仞设备支持、vNPU 监控 Helm chart
- [@lin121291](https://github.com/lin121291)：PodGroup 成组调度
- [@maishivamhoo123](https://github.com/maishivamhoo123)：init-container 资源记账
- [@Wangmin362](https://github.com/Wangmin362)：mock-device-plugin NPU 模板
- [@spencercjh](https://github.com/spencercjh)：ubi8 编译镜像
- [@dttung2905](https://github.com/dttung2905)：KAI vGPU 监控与非 root 负载修复

其中 [@archlitchi](https://github.com/archlitchi)（发版协调与 KAI 集成）、[@FouoF](https://github.com/FouoF)（Flexible MIG 与 AMD 支持）、[@maverick123123](https://github.com/maverick123123)（昇腾监控）、[@spencercjh](https://github.com/spencercjh)（构建链路）来自密瓜智能团队。感谢每一位贡献者，也感谢所有提交 issue、测试 RC、分享生产反馈的用户。完整贡献者名单见 [v2.10.0 Release Notes](https://github.com/Project-HAMi/HAMi/releases/tag/v2.10.0)。

## 升级指南

```bash
helm repo add hami-charts https://project-hami.github.io/HAMi/
helm repo update
helm upgrade hami hami-charts/hami -n kube-system
```

| 用户类型 | 升级注意事项 |
|-|-|
| DRA 用户 | DRA 不再随主 chart 安装，请改用 [HAMi-dra](https://github.com/Project-HAMi/HAMi-dra) chart |
| AMD 用户 | 部署专用 [amd-device-plugin](https://github.com/Project-HAMi/amd-device-plugin)，确认镜像满足 GLIBC 2.34+ |
| 昇腾用户 | vNPU 监控需启用 `hami-core` 模式；Volcano 软切分核对版本（1.16+，仅 ARM） |
| 所有用户 | 建议先在测试环境验证兼容性 |

## 社区动态：自 v2.9.0 以来

v2.9.0（2026 年 5 月）发布以来的三个多月，是 HAMi 社区非常活跃的一段时期：项目里程碑、生态合作、用户案例与社区活动密集落地：

![自 v2.9.0 以来的社区动态时间线](/images/blog/hami-v210-deep-dive/community-timeline.png)

**重大里程碑**

- **进入 CNCF Incubating**（7 月）：HAMi 从 CNCF Sandbox 毕业进入孵化阶段，成为云原生异构计算版图的重要一环。[阅读公告](https://project-hami.io/zh/blog/hami-cncf-incubating)
- **HAMi-core 被 KAI Scheduler 采纳**（6 月）：KAI Scheduler 内置 HAMi-core 实现 GPU 显存硬隔离，GPU 共享进入硬隔离时代，本文介绍的 KAI Resource Isolator 正是这条合作线的延伸。[阅读公告](https://project-hami.io/zh/blog/hami-core-adopted-by-nvidia-kai-scheduler)

**用户案例**

- **招商银行**（7 月）：基于 Kubernetes 与 HAMi 构建统一的异构 AI 算力调度平台，实现拓扑感知调度与加速器细粒度共享；通过超节点模块感知的成对分配，硬件资源池利用率达到 100%，分布式训练跨机调度下降 30%，细粒度切分最小至单卡 1 GB 显存、1% 算力。[查看案例](https://www.cncf.io/case-studies/china-merchants-bank/)
- **SNOW**（5 月）：通过 HAMi GPU 共享与 KEDA 自动伸缩，编排 1000+ A100 GPU 为全球 2 亿多用户提供 GenAI 服务；训练与推理流水线所需 GPU 减少一半，从容应对 700% 流量洪峰，相比等量按需云 GPU 预估节省 1740 万美元，MTTR 从约 2 小时缩短至约 10 分钟。[查看案例](https://www.cncf.io/case-studies/snow-corp/)

**社区活动**

- **KubeCon + CloudNativeCon India 2026**（6 月）：HAMi 亮相印度站，把 GPU 共享带给当地社区。[活动回顾](https://project-hami.io/zh/blog/kubecon-india-2026-recap)
- **KCD Vietnam 2026**（7 月，河内）：分享《从项目到生产：HAMi 与 Viettel Cloud》，覆盖 GPU 共享机制与 Viettel Cloud 的电信级生产部署实践。[活动详情](https://project-hami.io/zh/landing/kcd-vietnam)
- **vLLM Meetup 上海站**（7 月）：李孟轩（密瓜智能联合创始人兼 CTO、HAMi Maintainer）带来《你的算力用的好么？——vLLM 推理集群优化的三个阶段》。[活动回顾](https://project-hami.io/zh/blog/vllm-meetup-shanghai-2026-recap)
- **KubeCon + CloudNativeCon Japan 2026**（7 月底，横滨）：HAMi 设展位并带来演讲《共享 GPU 调度与主动自动伸缩》，SNOW 也在现场分享了基于 HAMi 的落地经验。[活动回顾](https://project-hami.io/zh/blog/kubecon-japan-2026-recap)
- **COSCUP 2026**（8 月，台北）：演讲《用 HAMi 在一块 GPU 上运行多个 AI 工作负载：架构与注意事项》，介绍无需改动应用代码的 CUDA 接管、显存隔离，以及 GPU 成本降低 40-60% 的生产用例。[活动详情](https://project-hami.io/zh/landing/coscup-2026)
- **Open Source Summit Korea 2026**（8 月，首尔）：演讲《使用 HAMi 简化边缘计算中的 AI》，分享 Jetson 级设备上的显存切片与多智能体并发运行等边缘 AI 实践。[活动详情](https://project-hami.io/zh/landing/opensource-summit-korea)

**人才计划**

- **LFX Mentorship 2026 Term 3**（8 月开放申请）：四个 GPU 共享方向的开源课题面向全球开发者开放。[申请指南](https://project-hami.io/zh/blog/lfx-mentorship-2026-term-3)

## 社区活动预告：HAMi Meetup 上海站

**「不卷算力，卷效率｜HAMi Meetup 上海站 · Incubating 特别活动」** 将于 9 月 6 日举行，这是 HAMi 进入 CNCF Incubating 后的首次社区聚会：

- 时间：2026 年 9 月 6 日（周日）14:00-21:20（13:30 开始签到）
- 地点：上海杨浦区大学路 322 号上海五角场创新创业学院
- 主办：密瓜智能（Dynamia）、HAMi 社区
- 协办：上海五角场创新创业学院

活动分下午与晚间两场：下午场是 5 场技术演讲 + 社区圆桌，晚间场以 HAMi 进入 CNCF Incubating 为里程碑，安排贡献者故事（My HAMi Story）、社区致谢与自由交流。

## 结语

v2.10.0 是一个围绕"调度灵活性、加速器广度、生态深度"的版本：Flexible MIG 让 MIG 真正按需伸缩，可组合策略链和成组调度补齐了真实集群的调度诉求，AMD 与壁仞扩大了加速器版图，昇腾的异构管理与可观测性走向成熟，KAI Scheduler 集成则让 HAMi-core 的隔离能力进入更广的调度生态。

后续 Flexible MIG 的多设备验证、KAI 隔离器的 fraction 显存强制等工作仍在推进。Ascend-DRA 支持也已在路上，将在近期随 HAMi-DRA chart 正式发布，敬请期待。如果你在 GPU 虚拟化、异构调度方向有想法，欢迎参与 HAMi 社区。

**相关链接：**

- GitHub Release：[HAMi v2.10.0](https://github.com/Project-HAMi/HAMi/releases/tag/v2.10.0)
- 官网发布说明：[英文](https://project-hami.io/blog/hami-v2-10-0-release) / [中文](https://project-hami.io/zh/blog/hami-v2-10-0-release)
- KAI Resource Isolator：[https://github.com/Project-HAMi/KAI-resource-isolator](https://github.com/Project-HAMi/KAI-resource-isolator)
- Ascend Device Plugin：[https://github.com/Project-HAMi/ascend-device-plugin](https://github.com/Project-HAMi/ascend-device-plugin)
- AMD Device Plugin：[https://github.com/Project-HAMi/amd-device-plugin](https://github.com/Project-HAMi/amd-device-plugin)
- 社区 Discord（推荐）：[https://discord.gg/Amhy7XmbNq](https://discord.gg/Amhy7XmbNq)
- CNCF Slack：[https://cloud-native.slack.com/archives/C07T10BU4R2](https://cloud-native.slack.com/archives/C07T10BU4R2)
- 微信交流群：添加微信号 `HAMi_community` 加入微信群
