---
title: 'HAMi-DRA 架构演进：Kubernetes原生调度与昇腾 NPU 实践'
date: '2026-11-20'
excerpt: 'HAMi-DRA 将设备资源声明、调度与容量记账交给 Kubernetes DRA，同时保留 HAMi-core 的运行时隔离能力。本文介绍其架构、兼容模式、昇腾 NPU 实验与落地约束。'
author: '密瓜智能'
category: 'Technical Deep Dive'
coverDisplay: 'text'
tags: ['HAMi', 'DRA', 'Kubernetes', 'NPU']
---

2026 年 9 月 15 日，HAMi 社区发布了 HAMi DRA 0.2.3。

这一版本延续了 HAMi 向 Kubernetes 原生资源管理模型演进的方向：**将设备资源声明、调度和容量记账交给 Kubernetes DRA ，同时保留 HAMi-core 在容器内执行显存和算力配额的能力。**

在此之前，HAMi 2.9 版本直播已宣布 HAMi-DRA 进入生产可用阶段。随着 Kubernetes 1.34 将 DRA 核心 API 推进至 GA，HAMi-DRA 也成为社区评估异构加速器资源管理方案时的一项选择。

对于已经部署 HAMi 的用户，更重要的是：HAMi-DRA 提供了兼容模式，能够把现有的 HAMi 资源请求转换成原生 ResourceClaim，减少业务迁移时对 YAML 配置的修改。

那么，HAMi 为什么需要 DRA？迁移后哪些能力交给了 Kubernetes，哪些仍由 HAMi 负责？本文将从 HAMi 原有架构出发，介绍 DRA 带来的变化、HAMi-DRA 的设计思路、使用方式与当前进展。

## 为什么需要 HAMi-DRA

HAMi 解决的核心问题，是让多个工作负载能够共享同一块 GPU 或其他加速器，并按需分配显存与算力。在传统 Kubernetes Device Plugin 模型下，Extended Resource 通常以整数形式声明设备数量。例如：

```YAML
resources:
  limits:
    nvidia.com/gpu: 1
```

这一请求表示申请一块 GPU，但无法通过该资源条目表达对部分显存、部分算力的需求。

为实现细粒度共享，HAMi 在原有资源模型上扩展了资源声明方式。例如，使用昇腾 Ascend 310P 时，可以这样申请资源：

```YAML
resources:
  limits:
    huawei.com/Ascend310P: 1
    huawei.com/Ascend310P-memory: "8192"
    huawei.com/Ascend310P-core: "50"
```

这里的 `8192` 表示申请 8192 MiB（8 GiB）显存，`50` 表示申请 50% 算力。

为了让这类资源请求正常工作，传统 HAMi 架构需要多个组件协同：

- **Mutating Webhook**：修改 Pod 的资源配置。
- **Scheduler Extender**：处理加速器共享调度。
- **Device Plugin**：负责设备资源上报和挂载。
- **HAMi-core**：通过 `libvgpu`、`libvnpu` 等组件，在容器内执行显存和算力限制。

这套架构已经在实际生产场景中得到应用，但它建立在传统 Device Plugin 和 Extended Resource 模型之上，也因此存在一些限制。

### 现有架构面临的挑战

#### **配额管不住**

原生 ResourceQuota 能统计 `huawei.com/*` 这类 Extended Resource 的请求量，但只能按命名空间记总账，看不到 HAMi 在每块卡上做的内存加算力切分，想按团队限制真实用量，就得自己再造一套配额系统

#### **抢占用不上**

抢占（Preemption）等调度功能不认识树外调度器替它做的决定，高优先级任务来了，也没法让低优先级任务让位

#### **节点锁机制影响**

多个 Pod 同时调度到同一台节点时只能排队一个个来，节点锁可能使部分分配流程串行执行，增加调度等待时间，集群越忙，创建 Pod 越慢。一次失败的请求可能让整台节点被锁 5 分钟，期间这台节点上的新 Pod 全部干等。

这些问题与传统资源模型和 Scheduler Extender 的实现方式密切相关。要改变资源分配和调度过程，就需要新的资源管理机制。

![HAMi 在 Device Plugin 之上卡住的位置](/images/blog/hami-dra-architecture-ascend-npu/figure-1.png)

> 上图左侧是 HAMi 为实现共享而自建的整条链路：从 Pod 到加速器之间的每一层都由 HAMi 自己实现。
>
> 四个瓶颈的位置如图中虚线所示：第 1 个出在资源声明本身（Extended Resource 进原生配额的只有整卡计数，没有 HAMi 的精细切分），第 2、3、4 个都出在 Scheduler Extender 这一环。
>
> 抢占受限是因为 HAMi 未实现 Extender API 中的可选抢占接口（preempt verb）、节点锁把并发退化为串行、失败请求可能锁住节点 5 分钟。

## Kubernetes DRA 带来了什么

Kubernetes 1.34 将 DRA（Dynamic Resource Allocation，动态资源分配）核心 API 推进至 GA，集群设备资源管理从以节点为中心的分配模型，演进为以资源对象为核心的声明式模型。其资源模型包含四类主要对象：

- **ResourceSlice**：描述设备清单，包括设备属性和容量
- **ResourceClaim**：Pod 的设备需求声明，在 Pod 创建之前完成表达与约束。
- **DeviceClass**：设备过滤与配置模板。
- **ResourceClaimTemplate**：为 StatefulSet 等控制器批量生成 ResourceClaim

### Consumable Capacity

对于 HAMi，最关键的变化来自 **Consumable Capacity（KEP-5075）**。

这一机制允许设备发布多个维度的可消费容量，例如显存和算力。配合 `allowMultipleAllocations`，多个 ResourceClaim 可以分别申请同一设备的部分资源。

kube-scheduler 会根据 ResourceSlice 中声明的容量，对不同维度进行分配和记账。

需要注意，Consumable Capacity 在 Kubernetes 1.34 和 1.35 中需要手动启用对应的 feature gate，1.36 起默认开启。

以昇腾 310P3 设备为例，ResourceSlice 中可以包含以下信息：

```Plain Text
# ResourceSlice：每块 310P3 一个 device，发布两个维度的容量
devices:
  - name: npu-0-0
    attributes:
      productName: { string: 310P3 }
      uuid: { string: 68496E64-20E05477-92C31323-6E78030A-BD003019 }
    capacity:
      cores: { value: "100" }
      memory: { value: 21525Mi }
    allowMultipleAllocations: true

# ResourceClaim：申请其中一部分
capacity:
  requests:
    cores: "50"
    memory: "8589934592"
```

![DRA 对象模型与多维度容量分配](/images/blog/hami-dra-architecture-ascend-npu/figure-2.png)

> 图中 Claim A 与 Claim B 各自申请同一块设备（npu-0-0）的一部分容量，kube-scheduler 对照 ResourceSlice 逐维度记账；容量记满后，Claim C 只能停在 pending，直到有 Pod 释放容量。
>
> 传统 Device Plugin 接口只能暴露简单容量信息，调度器“调度到节点后才发现资源不够”；DRA 让设备属性在调度阶段就可精确匹配。

## HAMi-DRA 的架构设计

HAMi-DRA 并没有推翻原有架构，而是重新划分了 Kubernetes 与 HAMi 各自承担的工作：**将资源调度与容量记账交给 Kubernetes 原生 DRA 机制，保留 HAMi-core 的运行时资源隔离能力。**

这意味着，HAMi 不再需要自行维护完整的共享调度链路，而是可以在 Kubernetes 原生设备资源管理体系之上，继续实现 GPU、NPU 等异构加速设备的细粒度共享。

![HAMi DRA 请求路径：从 YAML 到加速器](/images/blog/hami-dra-architecture-ascend-npu/figure-3.png)

### 从资源请求到容器运行

如上图所示，HAMi-DRA 的资源管理流程从用户提交 YAML 开始。

在兼容模式下，用户可以继续使用 `huawei.com/Ascend310P` 等已有资源名称。HAMi-DRA 的 Mutating Webhook 会在 Pod 准入阶段识别这些资源请求，并将其转换为 Kubernetes 原生的 ResourceClaim。

对于直接使用 DRA 的用户，则可以提交 ResourceClaim，无需经过这一转换步骤。

随后，`kube-scheduler` 根据 ResourceSlice 中发布的设备属性与容量信息，完成资源匹配、分配和记账，并将 Pod 绑定至相应节点。

Pod 进入节点后，`kubelet` 调用 DRA Driver 的资源准备接口，由 Driver 生成 CDI spec（Container Device Interface 设备注入规范）。`containerd` 根据 CDI 配置创建容器，同时将 HAMi-core 的 `libvgpu` 或 `libvnpu` 注入容器。

最终，工作负载运行在 GPU、NPU、DCU 等异构加速设备上，而 HAMi-core 负责在容器内部执行显存与算力配额限制。

整个流程中，三个核心组件承担不同职责：

- **HAMi-DRA Webhook**：负责资源声明转换与 ResourceClaim 生命周期管理。
- **DRA Driver**：负责设备发现、资源信息发布及节点侧设备准备与清理。
- **HAMi-core**：负责容器运行时的资源共享、配额限制与隔离。

### Webhook：将传统 HAMi 资源请求转换为 DRA 声明

#### **多维度资源请求的自动转换**

传统 HAMi 通过多个 ResourceName 表达设备数量、显存和算力需求。例如，昇腾设备使用 `huawei.com/Ascend310P`、`huawei.com/Ascend310P-memory` 和 `huawei.com/Ascend310P-core`；NVIDIA 设备则使用 `nvidia.com/gpu`，配合 `gpumem`、`gpucores` 等资源名称表达细粒度需求。

Webhook 会将这些请求映射到 ResourceClaim 的 `count` 和 `capacity.requests` 字段，使原有 HAMi 资源语义能够通过 DRA 原生对象表达。

对于设备选择条件，Webhook 也会将 HAMi 已有的 `use-*-uuid` 等选卡注解转换为 CEL（Common Expression Language）选择器，使 Kubernetes 能够依据 ResourceSlice 中发布的设备属性进行匹配。

#### **ResourceClaim 的生命周期管理**

Webhook 负责创建相应的 ResourceClaim，并建立其与 Pod 的关联。当 Pod 删除时，对应的 Claim 也会自动清理，避免遗留不再使用的资源声明。

需要注意的是，HAMi-DRA 自身不再包含独立的调度器组件。资源调度由 Kubernetes 原生机制承担，也为其与 Volcano 等调度生态协同提供了基础。

### DRA Driver：管理设备信息与资源生命周期

DRA Driver 承担设备发现和节点侧资源管理工作，它负责发现加速设备，并通过 ResourceSlice 向 Kubernetes 发布设备属性与可用容量，使调度器能够在分配前获得必要的设备信息。

当资源分配完成后，`kubelet` 会调用 Driver 的 `NodePrepareResources` 接口，完成设备准备工作，包括注入环境变量、创建共享目录，以及生成容器运行所需的 CDI 配置。

当工作负载不再使用相应资源时，Driver 则负责执行清理流程，包括通过 `UnprepareResourceClaims` 清理 HAMi-core 引入的临时文件。

相比传统 Device Plugin 机制，这种方式将设备准备与释放纳入更明确的资源生命周期管理流程。

设备注入则通过标准 CDI 接口与 `containerd` 等容器运行时衔接。

### HAMi-core：继续负责容器内的资源隔离

虽然资源声明和调度方式发生了变化，但 HAMi-core 的核心职责并没有改变。DRA 能够确定一个工作负载应该使用哪块设备、分配多少显存和算力，却不直接负责在容器内部强制执行这些限制。

因此，HAMi-core 仍然通过 `libvgpu`、`libvnpu` 等组件，对容器内的显存使用与算力时间片进行控制。

换句话说，**DRA 负责分配资源，HAMi-core 负责确保工作负载按照分配结果使用资源。**

这也是 HAMi 社区此前在[《Kubernetes DRA 会取代 HAMi 吗？》](https://project-hami.io/zh/blog/does-kubernetes-dra-replace-hami)中讨论的核心观点：DRA 与 HAMi 并不是简单的替代关系，而是在资源管理的不同层面发挥作用。

### 调度性能与资源可观测性的变化

过去传统 HAMi 依赖 Scheduler Extender 与节点锁协调共享资源分配。在多个 Pod 并发申请同一节点资源时，节点锁可能导致调度流程串行化，使 Pod 创建时间随并发数量增加而近似线性增长。

HAMi-DRA 利用 Kubernetes 原生 DRA 资源分配机制，避免了原有节点锁带来的部分性能开销。

在社区内部的同节点并发调度测试中，HAMi-DRA 的 Pod 创建耗时明显低于传统方案。这一改善主要来自 DRA 的资源预分配机制：设备资源在调度阶段便完成分配与记账，从而减少后续资源冲突与重试。

需要说明的是，这一结果来自特定内部测试，并不意味着所有集群或工作负载都能获得相同比例的性能提升。

从架构上看，这次调整主要体现在四个方面：

| 传统 HAMi | HAMi-DRA | 主要变化 |
| --- | --- | --- |
| NodeLock | No Locks | 不再依赖原有节点锁协调共享资源分配 |
| ResourceName | ResourceClaim | 使用原生资源对象表达设备需求 |
| Device Plugin | DRA Driver | 通过 DRA 机制管理设备准备与生命周期 |
| Annotation | Attributes | 利用设备属性与选择器表达设备约束 |

除调度机制外，资源可观测性也得到了改善。

在传统模型下，设备资源信息主要来自 Node，工作负载使用情况则需要结合 Pod 配置与运行状态分析。要得到完整的设备分配视图，往往需要关联多个对象进行推断。

DRA 则通过 ResourceSlice 描述设备清单与容量，通过 ResourceClaim 记录资源需求及分配结果。

运维人员可以直接查询这些对象，了解设备被分配给哪些工作负载、分配了多少资源，并结合设备容量信息计算剩余可分配容量。

**资源分配关系由此成为 Kubernetes 原生资源模型的一部分，而不再完全依赖外部组件进行关联分析。**

## 两种使用模式：兼顾原生能力与迁移成本

DRA 为 Kubernetes 带来了更丰富的设备资源表达能力，与此同时也提高了资源声明的复杂度。

传统 Device Plugin 模式下，用户只需要在 Pod 中声明设备数量：

```YAML
resources:
  limits:
    nvidia.com/gpu: 1
```

而在 DRA 原生模式下，设备需求通常需要通过独立的 ResourceClaim 对象表达，并使用 `count`、`capacity.requests` 等字段描述具体资源需求。

例如，以下是 ResourceClaim 中的设备请求配置节选：

```YAML
spec:
  devices:
    requests:
      - exactly:
          allocationMode: ExactCount
          count: 1
          capacity:
            requests:
              memory: 4194304k
```

如果还需要指定设备属性，则可以进一步使用 CEL 选择器添加约束。

对于已经大规模使用 Device Plugin 或 HAMi 的企业而言，迁移成本不仅来自 YAML 的调整，还包括团队对 ResourceClaim、设备选择与资源生命周期等新概念的学习。

为此，HAMi-DRA 提供了 **DRA 原生模式与 Device Plugin 兼容模式** 两种使用方式，让不同阶段的用户能够根据实际需求选择。

### DRA 原生模式：直接使用 Kubernetes 资源声明

在原生模式下，用户直接创建 ResourceClaim，声明设备数量、显存和算力等资源需求，再由 Pod 通过 `resourceClaims` 引用。这种方式能够直接利用 DRA 的设备属性匹配能力。

例如，通过 CEL 选择器，用户可以依据设备型号、拓扑属性及 NUMA 亲和等信息表达设备选择条件。相关资源声明机制也可以用于网卡等其他设备类型。

结合 `firstAvailable` 等 DRA 特性，还可以在支持的 Kubernetes 版本中表达多种候选资源分配方案。

原生模式更适合新建工作负载，以及希望充分利用 DRA 设备属性匹配与声明式资源管理能力的集群。

### Device Plugin 兼容模式：保留原有 HAMi 资源声明

对于已有业务，HAMi-DRA 提供了兼容模式，用户仍然可以沿用传统 `nvidia.com/gpu` 或 `huawei.com/Ascend310P` 等资源申请语法，由 Webhook 在准入阶段自动完成资源转换。

这样一来，业务侧无需将原有工作负载逐一改写为 DRA 原生声明，就能够使用新的资源调度路径。

![兼容模式：Webhook 在准入阶段完成资源转换](/images/blog/hami-dra-architecture-ascend-npu/figure-4.png)

以昇腾 310P 为例，假设用户提交的 Pod 包含以下资源请求：

```YAML
resources:
  limits:
    huawei.com/Ascend310P: 1
    huawei.com/Ascend310P-memory: "8192"
    huawei.com/Ascend310P-core: "50"
```

Webhook 会识别 `resources.limits` 中的三个 `huawei.com/*` 资源条目，将其转换为 DRA 资源声明，并在 Pod 中建立对应的 Claim 引用。

其中，设备数量映射为 ResourceClaim 的 `count`，显存和算力需求映射至 `capacity.requests`，设备选择注解则转换为 CEL 选择器。

具体转换规则如下：

| ResourceClaim 字段 | 原始 HAMi 请求 | 转换规则 |
| --- | --- | --- |
| `count: 1` | `Ascend310P: 1` | 设备数量直接传递 |
| `capacity.requests.memory: 8589934592` | `-memory: 8192`（MiB） | MiB 转换为字节：8192 × 1024 × 1024 |
| `capacity.requests.cores: "50"` | `-core: 50` | 算力百分比直接传递 |
| CEL 选择器 | `use-Ascend310P-uuid` 注解 | 转换为 `uuid in ["..."]`，匹配 ResourceSlice 中的设备 UUID |

转换完成后，ResourceClaim 与 Pod 建立关联，并随 Pod 删除自动回收。

**通过这一兼容机制，HAMi-DRA 将底层资源管理模型的变化尽可能留在基础设施层，减少对上层业务配置的影响。**

不过，兼容模式并不意味着集群完全无需改造。实际使用仍需满足 Kubernetes 版本、DRA Driver、HAMi-core 及相关组件的部署要求。

### 昇腾 310P 实验：验证资源分配与运行时隔离

在 HAMi 社区的昇腾 310P 实验中，两个 Pod 分别申请 8192 MiB 显存与 50% 算力，并指定使用同一块 NPU。

经过 Webhook 转换后，两个 ResourceClaim 被分配到同一个 device，各自具有独立的 shareID。

分配第一个 Claim 后，kube-scheduler 会记录其显存和算力消耗；在处理第二个 Claim 时，调度器已经能够获得更新后的设备容量信息。

当两个 Claim 分别消耗 50% 算力后，该设备的算力容量达到 100/100。

此时，即使显存仍有剩余，第三个同样申请 50% 算力的工作负载也无法获得所需容量，其 Claim 将保持 Pending 状态。

当已有 Pod 删除后，对应 ResourceClaim 被回收，资源记账随之更新，释放的容量便可以重新参与分配。

#### **资源分配不等于运行时隔离**

在容器内部，HAMi-core 仍然通过 `libvnpu.so` 执行显存配额限制。当工作负载申请超过允许范围的显存时，相关申请会被拦截，并可能表现为容器内 OOM。

在该实验中，容器看到的是分配给自身的 8 GiB 显存，而不是整张约 21 GiB 的 NPU 显存。

这一过程验证了 DRA 原生资源记账与 HAMi-core 运行时隔离的协同能力。

> 完整的配置命令、资源分配过程与实际输出，可参考社区教程：[实验 21：用 HAMi DRA 共享昇腾 NPU](https://project-hami.io/zh/tutorials/labs/ascend-hami-dra)。

## HAMi-DRA 的异构设备支持进展

HAMi DRA 的能力边界很大程度上取决于各厂商 DRA driver 的适配进度：

- 2025.09：NVIDIA DRA Driver，Consumable Capacity 就绪
- 2026.03：海光 DCU DRA Driver 完成与 HAMi DRA 的集成
- 2026.04：Enflame（燧原）DRA Driver 集成推进中

这些进展为 HAMi-DRA 扩展至更多异构设备提供了基础，但不同设备的支持程度仍需分别判断，不能将已集成、测试验证和生产就绪视为同一状态。

### 昇腾 NPU

昇腾 DRA Driver 的适配，是 HAMi-DRA 向 NPU 场景扩展的重要实践。

HAMi 社区在此前的[实验 21](https://project-hami.io/zh/tutorials/labs/ascend-hami-dra)中，使用一台搭载昇腾 310P3 的服务器，结合官方维护的 [Project-HAMi/ascend-dra-driver](https://github.com/Project-HAMi/ascend-dra-driver)，完成了从 HAMi 资源请求转换、DRA 原生分配到 NPU 共享运行的端到端验证。实验使用的 Driver Chart 版本为 `0.1.1`。

需要特别说明的是，实验所用镜像为修复 UUID 生成问题的开发构建，相关实现及行为在正式发布前仍可能调整。

2026 年 8 月发布的 HAMi v2.10.0，已在 Release Notes 中将昇腾 DRA 支持指向该 Driver 仓库，Driver 本身仍处于预发布阶段。

## 落地前的现实约束

尽管 HAMi-DRA 在架构上减少了对传统调度扩展的依赖，并为异构设备资源管理提供了新的实现路径，但实际部署仍存在一些限制。

### Kubernetes 版本与特性依赖

HAMi-DRA 所依赖的 Consumable Capacity 能力要求 Kubernetes 1.34 或更高版本，其他 DRA 特性则可能需要更新的 Kubernetes 版本。

不同版本中的 Feature Gate 默认状态并不完全一致，需要根据实际部署环境进行配置。

对于运行在较早 Kubernetes 版本上的生产集群，升级意味着不仅要验证 DRA 本身，还要考虑现有调度器、设备驱动、网络及其他集群组件的兼容性。

### 厂商 DRA Driver 支持有限

目前，能够直接用于特定设备场景的 DRA Driver 数量仍然有限，不同厂商的实现成熟度也存在差异。

即使某类设备已经支持 DRA 资源声明与分配，也不意味着相应的细粒度共享、设备隔离及全部生命周期管理能力都已具备完整的生产验证。

因此，实际选型时需要同时评估设备驱动、DRA 特性和 HAMi-core 的支持情况。

### 复杂设备调度能力仍需完善

DRA 已经能够在调度阶段完成设备属性匹配与容量分配，但设备级 Scoring 等更复杂的调度优化能力仍存在不足。

### 学习与维护成本

DRA 引入了 ResourceSlice、ResourceClaim、DeviceClass 等新的资源对象，以及设备属性选择、资源准备与回收等机制。对于集群运维和平台开发人员而言，这意味着需要理解新的资源声明方式、设备生命周期及故障排查路径。

HAMi-DRA 的 Webhook 兼容模式能够降低业务侧迁移门槛，但并不能完全消除底层部署和维护所需的学习成本。

## 如何选型

传统 HAMi 与 HAMi-DRA 各有适用场景，具体选择需要结合集群架构、调度需求和设备支持情况。

### 标准化 Kubernetes 集群

尤其是对拓扑感知等调度优化能力有较高要求的场景，建议优先考虑传统 HAMi，以利用其现有的成熟调度能力。

### 高度定制化的集群

例如已经部署自有调度器，或希望通过 Kubernetes 原生 DRA 机制实现设备资源共享的场景，则可以优先评估 HAMi-DRA。

实际部署时，还需要注意两点：

- **避免资源分配路径冲突：**传统 HAMi 与 HAMi-DRA 采用不同的资源分配路径，同一资源请求不能同时经过两套机制。
- **支持两种模式共存：**在同一集群中，可以参考[实验 21](https://project-hami.io/zh/tutorials/labs/ascend-hami-dra?utm_source=chatgpt.com)的 Webhook 豁免配置，让传统 HAMi 与 HAMi-DRA 共存，避免资源请求被重复处理。

需要强调的是，DRA 负责资源声明、调度与分配，容器内的显存和算力配额限制仍由 HAMi-core 执行。两种方案并非简单的替代关系，是面向不同集群需求提供的资源管理路径。

## 未来展望

未来，HAMi-DRA 将继续围绕异构设备支持、DRA 特性适配与调度生态集成等方向推进。

- 设备支持方面，社区计划进一步扩展 MetaX（沐曦）、天数智芯（Iluvatar CoreX）等异构加速设备的适配；
- 在资源管理能力方面，持续探索 List Attributes、Partitionable Devices 等 DRA 特性，推进对 Kubernetes 标准设备属性（如 `resource.kubernetes.io/pcieRoot`）的兼容。
- 计划加强与 Volcano、Kueue 等项目的集成，进一步完善在不同调度场景下的适用能力。

作为面向 Kubernetes 的异构加速器资源管理项目，HAMi 向下适配 GPU、NPU 等不同类型的加速设备，向上支撑 AI 训练、推理及 Agent 等工作负载，并通过资源抽象、调度与虚拟化能力连接底层硬件与上层应用。

**HAMi-DRA 是这一架构演进的重要一步。** 通过将资源声明、分配与调度交由 Kubernetes 原生 DRA 机制承担，HAMi 可以进一步聚焦运行时资源隔离与异构设备生态适配，在保留细粒度共享能力的同时，减少对额外调度扩展的依赖。

如果你正在评估从 Device Plugin 模式迁移到 DRA，或在为异构集群寻找统一的资源管理层，欢迎试用 HAMi DRA 并向社区反馈。
