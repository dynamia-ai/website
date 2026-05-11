---
title: HAMi v2.9.0 深度解读：昇腾用户态切分、DRA 生产就绪与调度生态扩展
coverTitle: HAMi v2.9.0 深度解读
date: '2026-05-11'
excerpt: >-
  HAMi v2.9.0 正式发布！昇腾 910C 用户态虚拟化（HAMi-core 模式）实现显存与算力细粒度共享，HAMi-DRA 基于 Kubernetes DRA 标准达到生产可用，新增 Vastai 设备支持，安全与可观测性全面增强。
author: Dynamia AI Team
tags:
  - HAMi
  - GPU Sharing
  - vGPU
  - Kubernetes
  - DRA
  - Ascend
  - HAMi-core
  - Heterogeneous Computing
  - Release
category: Product Release
language: zh
linktitle: HAMi v2.9.0 版本深度解读
---

**HAMi 的最新版本 v2.9.0** 正式发布！自 v2.8 以来，项目在**异构设备虚拟化深度、Kubernetes 原生标准落地与调度器生态扩展**层面取得重要进展。v2.9 在**昇腾用户态切分、DRA 生产就绪、调度器可插拔集成以及可观测性/安全性**等方面进行了系统性增强，使 HAMi 正式从"GPU 共享工具"演进为**异构算力统一管理与调度的基础设施平台**。

## 亮点速览

v2.9 版本的主要特性进展概览：

1. **昇腾 910C 用户态虚拟化：** 引入 HAMi-core 模式，实现基于 LD_PRELOAD 的用户态拦截，无需修改业务代码即可获得显存与算力的细粒度共享能力，已在招商银行生产环境得到验证。
2. **HAMi-DRA 生产就绪：** 基于 Kubernetes DRA 标准的独立实现项目 HAMi-DRA bump 至 v0.2.0，正式达到生产可用状态，面向 NVIDIA / Ascend / Enflame 三大平台完成方案落地。
3. **安全与稳定性增强：** Scheduler 路由新增 DoS 防护，NodeLock 优化为指数退避策略，Webhook 新增资源配额检查能力，修复多项影响生产稳定性的关键问题。
4. **异构设备覆盖扩展：** 新增 Vastai（瀚博半导体）设备支持，进一步丰富国产异构算力管理版图。

## 昇腾 910C 用户态切分 — HAMi-core 模式（重点特性）

华为昇腾 910C 是当前国产 AI 算力的主力芯片之一。在实际生产中，用户长期面临一个关键问题：**如何在多个推理/训练任务之间共享一块昇腾卡？**

传统的设备管理方案有两种极端：

- **独占模式**：一个 Pod 占用整卡，资源利用率极低
- **SR-IOV 硬件切分**：需要特定硬件支持，切分粒度固定，灵活性不足

HAMi v2.9.0 引入的 **HAMi-core 模式**，在用户态实现了显存与算力的软切分，无需修改业务代码，也无需特定硬件支持。这是本版本最重要的特性，下面进行详细介绍。

### 为什么需要用户态切分？

在 HAMi-core 之前，昇腾设备的共享方案主要依赖 SR-IOV 硬件虚拟化，存在几个根本性限制：

- **粒度粗**：SR-IOV 将一张物理卡切分为固定的虚拟功能（VF），通常只能按整卡的 1/2、1/4 等固定比例分配
- **不够灵活**：切分比例在硬件层面预设，无法根据实际工作负载动态调整
- **硬件依赖**：并非所有昇腾硬件版本都支持 SR-IOV，且需要固件配合

HAMi-core 从根本上改变了这个局面——通过纯软件方式在用户态拦截和管控 ACL 调用，实现了**显存 MB 级别、算力百分比级别**的细粒度切分，同一张昇腾 910C 可以同时服务多个不同规格的推理或训练任务。

### 技术架构

HAMi-core 的工作原理：

1. **LD_PRELOAD 拦截**：在容器启动时通过 `LD_PRELOAD` 注入拦截库，截获应用程序对 Ascend Computing Language（ACL）的调用
2. **显存隔离**：每个 Pod 的显存分配被严格限制在声明的配额内，粒度可达 **MB 级别**，防止一个任务耗尽整卡显存
3. **算力限流**：根据 Pod 声明的算力配额，对 ACL 计算调用进行时间片轮转调度，确保各任务公平获取算力资源
4. **透传执行**：未超配额的调用直接透传到硬件驱动，不引入额外延迟，保证性能接近原生

### 切分粒度对比

HAMi-core 与传统方案在切分粒度上的对比：

| 维度 | 独占模式 | SR-IOV | HAMi-core（v2.9） |
|-|-|-|-|
| 显存切分 | 不可切分 | 按 VF 固定分配 | **MB 级别精确控制** |
| 算力切分 | 不可切分 | 按 VF 比例分配 | **百分比级别灵活配置** |
| 切分数量 | 1 Pod/卡 | 通常 2-4 VF/卡 | **10+ Pod/卡** |
| 是否需要硬件支持 | 否 | 是 | **否** |
| 是否需要修改业务代码 | 否 | 否 | **否** |
| 动态调整 | 不支持 | 不支持 | **支持** |

例如，一张 64GB 显存的昇腾 910C，可以按如下方式分配给多个任务：

```yaml
# 任务 1：大模型推理，分配 32GB 显存 + 50% 算力
resources:
  limits:
    hami.io/vnpu-core: "50"
    hami.io/vnpu-core-memory: "32768"  # 32GB = 32768MB
```

```yaml
# 任务 2：模型微调，分配 16GB 显存 + 30% 算力
resources:
  limits:
    hami.io/vnpu-core: "30"
    hami.io/vnpu-core-memory: "16384"  # 16GB = 16384MB
```

```yaml
# 任务 3：轻量推理，分配 8GB 显存 + 20% 算力
resources:
  limits:
    hami.io/vnpu-core: "20"
    hami.io/vnpu-core-memory: "8192"  # 8GB = 8192MB
```

### 核心能力

**Ascend 910C 超节点支持**

针对 SuperPod 环境，HAMi 实现了 **module-pair 级别**的资源分配。在分布式训练场景中，多个昇腾芯片通过 HCCS/RoCE 互联形成超节点，HAMi 能够识别并管理这种拓扑结构，充分发挥超节点的硬件优势。

**vNPU-Core 虚拟化**

新增 `hami-vnpu-core` 资源类型，支持更灵活的算力切分策略：

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: ascend-inference
  annotations:
    hami.io/vnpu-core: "ascend910c"
spec:
  containers:
    - name: inference
      image: ascend-inference:latest
      resources:
        limits:
          hami.io/vnpu-core: "1"
          hami.io/vnpu-core-memory: "16384"
```

基于注解的节点过滤与多设备请求能力：

```yaml
# 节点过滤：只在具备特定注解的节点上调度
metadata:
  annotations:
    hami.io/vnpu-core-node-filter: "ascend910c-module-0"
```

### 开启方式

在 Helm values 中将 `ascend.hamiVnpuCore` 设置为 `true` 即可开启本特性：

```yaml
# values.yaml
ascend:
  hamiVnpuCore: true
```

也可以在 `ascend-device-plugin` 的节点配置中单独开启，支持同一集群中部分节点启用、部分节点关闭。

> **重要提示：** 在 v2.9 版本中，Pod 需要在注解中显式声明 `huawei.com/vnpu-mode: 'hami-core'` 才能使用 HAMi-core 模式：

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: ascend-inference
  annotations:
    huawei.com/vnpu-mode: "hami-core"
spec:
  containers:
    - name: inference
      image: ascend-inference:latest
      resources:
        limits:
          hami.io/vnpu-core: "1"
          hami.io/vnpu-core-memory: "16384"
```

未声明该注解的 Pod 仍会使用旧版的模板式 vNPU 切分方式，若无可用节点，任务将处于 pending 状态。

### 生产验证

该特性已在**招商银行**生产环境中得到验证。招商银行基于 HAMi-vNPU-Core 软切分方案，实现了昇腾 910C 算力资源 **100% 入池**与大模型高性能通信，显著提升了国产算力资源利用率。

感谢华为加拿大研究院 [ICI-Infra-RTV](https://github.com/ICI-Infra-RTV) 和招商银行 [@ashergaga](https://github.com/ashergaga) 对本功能的贡献。

本版本同时更新了 [HAMi-core 性能基准测试数据](https://github.com/Project-HAMi/HAMi/blob/master/docs/benchmark_cn.md)，详细的 benchmark 流程请参考[项目文档](https://github.com/Project-HAMi/HAMi/tree/master/benchmarks)。

## HAMi-DRA — 基于 Kubernetes 标准的轻量版 HAMi

HAMi v2.9.0 中，**HAMi-DRA** 正式达到生产可用状态。HAMi-DRA 是基于 Kubernetes **Dynamic Resource Assignment（DRA）** 标准的独立实现项目，定位为"轻量版 HAMi"。

### 从 Device Plugin 到 DRA

DRA 是 Kubernetes 社区正在推进的下一代设备资源声明与分配机制。传统的 Device Plugin 模型存在以下局限：

1. **资源声明不灵活：** 设备资源通过 `limits[nvidia.com/gpu]` 硬编码声明，无法表达显存/算力分离、拓扑约束等复杂需求
2. **调度逻辑分散：** 每个设备插件需要实现自己的调度逻辑，难以统一管理
3. **资源组合困难：** 无法表达"需要特定拓扑的多个 GPU"等复合需求

DRA 通过引入 `ResourceClaim` 和 `DeviceClass` 等新 API，将设备资源的声明、分配和管理标准化。

![Device Plugin vs DRA 模型对比](/images/blog/hami-v29-deep-dive/dra-device-plugin-comparison.png)

### HAMi-DRA 设计理念

HAMi-DRA 采用 Mutating Webhook 架构，核心理念可以用三句话概括：

1. **不改变用户习惯**：继续使用 Device Plugin 语法，底层自动转换为 DRA 资源模型
2. **内部消化复杂性**：Webhook、Driver、生命周期管理全部由系统处理
3. **通过社区协作推动演进**：来自不同公司的贡献者在真实生产环境中验证方案

![HAMi-DRA 请求流程](/images/blog/hami-v29-deep-dive/hami-dra-flow.png)

### 平台支持

HAMi-DRA 已 bump 至 **v0.2.0**，支持三大平台：

| 平台 | 虚拟化方式 | 状态 |
|-|-|-|
| NVIDIA | HAMi-core 时间片 + 显存软限制 | 生产可用 |
| Ascend | vNPU-Core 用户态切分 | 生产可用 |
| Enflame | 算力/显存切分 | 生产可用 |

安装 HAMi-DRA：

**前置条件：**

- Kubernetes >= 1.34，并启用 DRA Consumable Capacity featuregate
- 容器运行时已启用 CDI（Container Device Interface）
- NVIDIA GPU Driver 440+
- 已安装 cert-manager

```bash
# 克隆仓库并安装
git clone https://github.com/Project-HAMi/HAMi-DRA.git
cd HAMi-DRA
helm install hami-dra ./charts/hami-dra

# 如果不使用 gpu-operator 的 containerd 驱动：
helm install hami-dra ./charts/hami-dra --set drivers.nvidia.containerDriver=false

# 如果不需要监控组件：
helm install hami-dra ./charts/hami-dra --set monitor.enabled=false
```

安装完成后，使用方式与 HAMi 相同。

提交工作负载（自动从 Device Plugin 语法转换）：

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: gpu-inference
  annotations:
    hami.io/gpu-memory: "4096"
    hami.io/gpu-core: "50"
spec:
  containers:
    - name: inference
      image: pytorch:latest
      resources:
        limits:
          nvidia.com/gpu: "1"
```

**HAMi-DRA 项目地址**：[https://github.com/Project-HAMi/HAMi-DRA](https://github.com/Project-HAMi/HAMi-DRA)

## Volcano vGPU 升级至 v0.19 + CDI

HAMi v2.9.0 将内置的 Volcano vGPU Device Plugin 同步升级至 **v0.19 版本**，保持与 Volcano 上游的一致性。

**CDI 模式支持**

Container Device Interface（CDI）是 CNCF CDI 规范定义的容器运行时标准设备注入接口。相比传统方式：

| 维度 | 传统方式 | CDI 方式 |
|-|-|-|
| 设备注入 | 手动挂载 /dev、设置环境变量 | 声明式 CDI 设备列表 |
| 与运行时耦合 | 强耦合 | 松耦合 |
| 多设备支持 | 需要手动管理 | 自动聚合 |
| MIG 支持 | 复杂配置管理 | 标准化声明 |

启用 CDI 模式：

```yaml
# values.yaml
devicePlugin:
  cdIEnabled: true
  nvidia:
    cdIEnabled: true
```

本次升级还**修复了 MIG 在 CDI 模式下的分配问题**，进一步提升了 NVIDIA GPU 的灵活切分能力。

## 可观测性增强

v2.9.0 在可观测性方面进行了多项改进：

- vGPU Monitor 新增 `--metrics-bind-address` 参数，支持自定义指标暴露地址
- Helm Chart 中新增 Prometheus ServiceMonitor，覆盖调度器和设备插件
- Prometheus 指标与标签命名对齐社区最佳实践
- 新增设备类型标签（device type label）在指标中的支持
- 优化日志级别控制，新增相关单元测试

```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: hami-scheduler
  namespace: hami-system
spec:
  selector:
    matchLabels:
      app.kubernetes.io/name: hami-scheduler
  endpoints:
    - port: metrics
      interval: 15s
```

## 安全与稳定性

### 安全加固

**DoS 防护**

Scheduler 路由新增 `io.LimitReader`，限制 HTTP 请求体大小，防止恶意或异常的大请求体导致调度器 OOM。

**Webhook 资源配额检查**

v2.9.0 在 Webhook 中新增了**资源配额（Resource Quota）检查**能力，在 Pod 提交阶段即可校验 GPU 资源请求是否超出配额限制，避免调度失败后再回退，提升了整体调度效率。

![资源配额检查](/images/blog/hami-v29-deep-dive/webhook-quota.png)

### 关键问题修复

v2.9.0 修复了多个影响生产稳定性的关键问题：

| 问题 | 影响 | 修复方式 |
|-|-|-|
| NodeLock 竞争 | 大规模集群调度性能下降 | 指数退避策略 |
| Leader 选举空指针 | 高可用部署偶发崩溃 | 空值检查 |
| 调度器评分除零错误 | 评分异常 | 安全除法 |
| 多容器 Pod 设备分配 | init 容器设备分配冲突 | 生命周期感知分配 |
| 内核 6.17 NVIDIA 健康检查 | GPU 状态检查握手失败 | 边界条件处理 |
| 全局镜像标签覆盖 | 组件级镜像标签被忽略 | 标签优先级修复 |
| stale Deleted handshake | 节点调度中断 | 状态清理 |
| 设备过滤不生效 | filter device 配置无效 | 过滤逻辑修复 |
| Device Plugin 与 Scheduler 注解不一致 | 设备分配异常 | 注解对齐 |

## 异构设备生态扩展

### 新增 Vastai（瀚博半导体）设备支持

瀚博半导体（Vastai Technologies）是国内领先的通用 GPU 芯片设计企业，其芯片广泛应用于 AI 推理、图形渲染、视频处理等场景。HAMi v2.9.0 新增了对瀚博 Vastai 设备的支持，使 HAMi 的异构算力管理版图进一步扩展到国产 GPU 领域。

#### 两种分配模式

Vastai 设备支持两种资源分配模式：

| 模式 | 说明 | 适用场景 |
|-|-|-|
| **整卡模式（Full-Card）** | 每个 Pod 独占一整张 GPU | 大模型训练、性能敏感型推理 |
| **Die 模式** | 按芯片 Die 切分，支持拓扑感知调度 | 多任务共享、资源利用率优化 |

Die 模式下，调度器会感知 AIC（Accelerator Interface Card）拓扑结构，尽量将同一 Pod 申请的多个资源分配到同一个 AIC 上，减少跨 Die 通信开销。

#### 配置与使用

**节点标注：**

在安装 HAMi 之前，需要为拥有 Vastai 设备的节点打上标签：

```bash
kubectl label node <node-name> vastai=on
```

**Helm values 配置：**

```yaml
vastai:
  enabled: true
  customresources:
    - vastaitech.com/va
```

**整卡模式示例：**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: vastai-inference
spec:
  containers:
    - name: inference
      image: vastai-inference:latest
      resources:
        limits:
          vastaitech.com/va: "1"
```

**Die 模式示例：**

通过注解指定设备选择策略：

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: vastai-die-inference
  annotations:
    vastaitech.com/use-va: "0"
    vastaitech.com/nouse-va: "1"
spec:
  containers:
    - name: inference
      image: vastai-inference:latest
      resources:
        limits:
          vastaitech.com/va: "2"
```

Vastai 设备支持的加入，意味着 HAMi 目前已覆盖 **NVIDIA、华为昇腾、寒武纪、海光 DCU、壁仞、燧原、沐曦、昆仑芯、AMD、Iluvatar、Enflame、AWS Neuron** 以及 **瀚博半导体** 等十余种异构算力设备，是目前 Kubernetes 生态中覆盖最广泛的异构设备虚拟化与调度项目之一。

### DRA 生态联盟

DRA 正在成为 Kubernetes 新一代设备管理模型，但在厂商侧存在实现不确定性，在用户侧也面临较高的使用门槛。为此，HAMi 社区在第三届 HAMi Meetup 深圳站上宣布发起 **DRA 生态联盟**。

DRA 生态联盟的目标：

- **连接设备厂商与用户**，推动 DRA 在真实场景中的落地
- **推动 DRA 标准化演进**，降低异构设备接入的工程成本
- **统一调度层屏蔽底层硬件差异**，实现异构算力统一管理

## 升级指南

通过 Helm 升级至 v2.9.0：

```bash
helm repo add hami-charts https://project-hami.github.io/HAMi/
helm repo update
helm upgrade hami hami-charts/hami -n hami-system
```

完整安装文档请参考：[https://project-hami.io/docs/usage/install](https://project-hami.io/docs/usage/install)

> **升级注意事项：**
>
> - 如使用 Volcano vGPU 模式，请注意 CDI 相关配置变更
> - 如使用昇腾设备并希望启用 HAMi-core 模式，请参考最新文档中的 Ascend 配置章节
> - 建议在升级前在测试环境验证兼容性

## 社区动态

v2.9.0 发布周期内，HAMi 社区在技术布道、产品生态和用户实践等方面持续活跃，以下是值得关注的社区进展。

### 社区活动

- **KubeCon EU 2026**：HAMi 作为 CNCF Sandbox 项目亮相阿姆斯特丹，不仅设立了 Project Pavilion 展台，更登上主论坛 Keynote Demo 舞台，向全球开发者展示了 Kubernetes GPU 虚拟化的最新进展。[阅读回顾](https://project-hami.io/zh/blog/kubecon-eu-2026-recap)
- **KCD Beijing 2026**：超过 1000 人报名参与，刷新历届 KCD 北京记录。HAMi 社区受邀分享"从 Device Plugin 到 DRA：GPU 调度范式升级与 HAMi-DRA 实践"。[阅读回顾](https://project-hami.io/zh/blog/kcd-beijing-2026-dra-gpu-scheduling)
- **第三届 HAMi Meetup 深圳站**：来自 CNCF、顺丰科技、招商银行、燧原科技等七位专家围绕 AI 算力云原生未来展开深度分享。[阅读回顾](https://project-hami.io/zh/blog/hami-meetup-shenzhen-2026)
- **HAMi WebUI 正式发布**：HAMi 社区推出开源 GPU 监控仪表盘 [HAMi WebUI](https://github.com/Project-HAMi/HAMi-WebUI) v1.1.0，将整个 GPU 集群呈现在单一可视化界面中，实现从 GPU 调度到可视化可观测性的完整闭环。[阅读博文](https://project-hami.io/zh/blog/introducing-hami-webui)

![HAMi WebUI](/images/blog/hami-v29-deep-dive/hami-webui.png)

### 官网与文档全面升级

v2.8.0 发布以来，HAMi 官网与文档经历了有史以来最大规模的重构。期间共有约 195 个 PR 合入 website 仓库，涵盖以下主要方向：

- **官网重构**：首页重新设计、架构图重绘、博客样式统一、移动端优化、Footer 增强，从外部搜索回归内建搜索
- **文档新增**：GPU 虚拟化原理页面、HAMi 快速入门指南、GPU 实时监控指南、升级与卸载指南、HAMi WebUI 用户与开发者指南、Vastai 设备文档
- **i18n 同步**：中英文档持续对齐，侧边栏标签本地化，公告栏多语言支持
- **社区内容**：新增 KubeCon EU 2026 回顾、KCD Beijing 2026 DRA 分享、HAMi WebUI 发布、Meetup 深圳站回顾等多篇博客；贝壳、蔚来、SNOW Corp.、博维智慧等采用者信息更新
- **质量治理**：全站文案去营销化、语法修正、代码块语言标注、格式标准化、贡献者指南与治理文档完善

感谢 [@mesutoezdil](https://github.com/mesutoezdil) 对 HAMi 官方文档优化做出的贡献。

官网地址：[https://project-hami.io](https://project-hami.io)

### CNCF Case Study

越来越多的企业在生产环境中使用 HAMi 构建 GPU 虚拟化与异构算力调度能力。以下案例已发布在 CNCF 官网：

- **贝壳**：基于 Kubernetes + HAMi 构建 AIStudio 智算平台，GPU 利用率从 13% 提升至 37%（近 3 倍），支撑 10,000+ Pod 同时运行，日均处理千万级业务请求。[阅读全文](https://www.cncf.io/case-studies/ke-holdings-inc/)
- **蔚来**：在自动驾驶工作负载中采用 HAMi 混合 GPU 共享策略，CI 管道 GPU 利用率提升约 10 倍，仿真工作负载 GPU 时间减少约 30%，覆盖约 600 张 GPU 的生产集群。[阅读全文](https://www.cncf.io/case-studies/nio/)
- **SNOW Corp.**：韩国 NAVER 旗下 SNOW Corp. 管理 1000+ A100 GPU，通过 HAMi 实现 GPU 共享应对 700% 流量峰值，GPU 需求减半，预估节省 1740 万美元。[阅读全文](https://www.cncf.io/case-studies/snow-corp/)

### 新贡献者

v2.9.0 版本共有 **19 位新贡献者** 首次参与 HAMi 项目，他们来自不同国家和组织：

maishivamhoo123、hoteye、jsl9208、ashergaga、Atroxgod、MyoungHaSong、charford、jcustenborder、Nov11、ilia-medvedev、Yonsun-w、CFH2436、kenwoodjw、anandj91、ManishSharma1609、maverick123123、almazkhalikov、lin121291、mesutoezdil

感谢每一位贡献者的付出！

## 社区活动预告

### HAMi 2.9 社区技术直播：Live Demo + Maintainer Q&A

HAMi 社区将于 **2026 年 5 月 14 日（周四）20:00-21:00** 举办线上技术直播，由 HAMi Maintainer、密瓜智能联合创始人兼 CTO **李孟轩** 主讲。

**主题**：HAMi 2.9 如何重构 Kubernetes AI 算力调度

**直播内容：**

- Live Demo 演示 HAMi 2.9 核心特性
- Maintainer Q&A 现场答疑

扫描下方二维码，在微信视频号预约直播：

![直播预约二维码](/images/blog/hami-v29-deep-dive/livestream-qr-code.png)

你可以在 [腾讯文档](https://docs.qq.com/doc/DRWZVdmpNUkZKaEto) 中提前登记问题，也可以在直播过程中实时提问，李孟轩会在线解答。

---

**相关链接：**

- GitHub Release：[https://github.com/Project-HAMi/HAMi/releases/tag/v2.9.0](https://github.com/Project-HAMi/HAMi/releases/tag/v2.9.0)
- HAMi-DRA：[https://github.com/Project-HAMi/HAMi-DRA](https://github.com/Project-HAMi/HAMi-DRA)
- Volcano vGPU Device Plugin：[https://github.com/Project-HAMi/volcano-vgpu-device-plugin](https://github.com/Project-HAMi/volcano-vgpu-device-plugin)
- 项目文档：[https://project-hami.io](https://project-hami.io)
- 社区入口（加入社区和资料获取）：[https://project-hami.io/zh/community](https://project-hami.io/zh/community)
- 社区 Discord（推荐）：[https://discord.gg/Amhy7XmbNq](https://discord.gg/Amhy7XmbNq)
- 社区 CNCF Slack：[https://cloud-native.slack.com/archives/C08844T5WBQ](https://cloud-native.slack.com/archives/C08844T5WBQ)
