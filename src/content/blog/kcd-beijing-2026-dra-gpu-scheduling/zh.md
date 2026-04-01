---
title: "从 Device Plugin 到 DRA：GPU 调度范式升级与 HAMi-DRA 实践"
linktitle: HAMi-DRA 在 KCD Beijing 2026 的技术分享回顾
date: '2026-03-23'
excerpt: >-
  KCD Beijing 2026 上，HAMi 社区核心贡献者分享了从 Device Plugin 到 DRA 的 GPU 调度范式升级。
  本文回顾了这次技术分享的核心内容，包括 DRA 的能力与挑战、HAMi-DRA 通过 Webhook 自动化
  降低用户迁移成本的关键设计，以及性能与可观测性方面的实践成果。
author: Dynamia
tags:
  - KCD
  - HAMi
  - DRA
  - GPU 调度
  - Kubernetes
  - AI 基础设施
category: 技术深度
language: zh
coverImage: /images/blog/kubecon-eu-2026-hami-recap/keynote-stage.jpg
---

KCD Beijing 2026 是近年来规模最大的 Kubernetes 社区大会之一，**超过 1000 人报名参与，刷新了历届 KCD 北京的记录。**

HAMi 社区不仅受邀进行了技术分享，也在现场设立了展台，与来自云原生与 AI 基础设施领域的开发者和企业用户进行了深入交流。

本次分享由两位 HAMi 社区核心贡献者完成：

* **王纪飞**（「Dynamia 密瓜智能」，HAMi Approver，HAMi-DRA 主要贡献者）
* **James Deng**（第四范式，HAMi Reviewer）

分享主题为：**从 Device Plugin 到 DRA：GPU 调度范式升级与 HAMi-DRA 实践**。

本文结合现场分享内容与幻灯片，做一次更完整的技术回顾。附幻灯片下载：[GitHub - HAMi-DRA KCD Beijing 2026](https://github.com/Project-HAMi/community/blob/main/talks/01-kcd-beijing-20260323/KCD-Beijing-2026-GPU-Scheduling-DRA-HAMi-Wang-Jifei-James-Deng.pdf)。

## 现场回顾

![大会主会场](https://project-hami.io/zh/assets/images/keynote-e1e2e24717769197253345671946a0ca.jpg)

![观众注册中](https://project-hami.io/zh/assets/images/register-6acd8011d259ee73f08e2b03d15ec150.jpg)

![HAMi 展台前参会者前来交流打卡](https://project-hami.io/zh/assets/images/booth-26950eea7308b589c96c5512c15a93a8.jpg)

![志愿者在为观众盖章](https://project-hami.io/zh/assets/images/booth2-c13fb6231a4a43ac0367a35befd2a193.jpg)

![王纪飞正在分享中](https://project-hami.io/zh/assets/images/wangjifei-096625d277476d4d56c6b730c97a80de.jpg)

![James Deng 正在分享](https://project-hami.io/zh/assets/images/james-d46e3f1098e0ea75ff7351fd7e3a2886.jpg)

## GPU 调度范式正在发生变化

这次分享的核心，其实不只是 DRA 本身，而是一个更大的转变：

> **GPU 正在从"设备"变成"资源对象"。**

这个转变背后，是 AI workload 对 GPU 使用方式的根本性改变——GPU 不再适合以"整卡独占"的方式被简单分配，而是需要被共享、切分、调度和治理。

## Device Plugin 的天花板

传统 Device Plugin 模型的问题，本质上在于表达能力不足：

* 只能描述"数量"（`nvidia.com/gpu: 1`）
* 无法表达多维资源（显存 / 核数 / 切片）
* 无法表达多卡组合
* 无法表达拓扑关系（NUMA / NVLink）

这些限制直接导致：

* 调度逻辑外溢（extender / sidecar）
* 系统复杂度上升
* 并发调度能力受限

当 AI workload 进入推理服务、多租户混合场景后，这些问题的严重性被迅速放大。

## DRA：资源建模能力的跃迁

DRA（Dynamic Resource Allocation）是 Kubernetes 社区在资源模型层面的一次重要升级，其核心优势包括：

* **多维资源建模能力**——不再局限于数量，可以表达显存、算力等细粒度维度
* **完整设备生命周期管理**——从资源发现、分配到回收的完整闭环
* **细粒度资源分配**——支持更灵活的资源组合方式

关键的结构性变化在于：

> **资源申请从 Pod 内嵌字段，变成独立的 ResourceClaim 对象。**

这意味着 GPU 资源获得了与 Pod、PVC 同等的"一等公民"地位，调度器可以像管理存储卷一样管理 GPU 资源。

## 现实问题：DRA 太复杂了

DRA 的能力毋庸置疑，但有一个经常被忽视的现实问题：**UX 明显退化。**

### Device Plugin 的写法

```yaml
resources:
  limits:
    nvidia.com/gpu: 1
```

### DRA 的写法

```yaml
spec:
  devices:
    requests:
    - exactly:
        allocationMode: ExactCount
        capacity:
          requests:
            memory: 4194304k
            count: 1
```

同时还需要编写 CEL selector：

```yaml
device.attributes["gpu.hami.io"].type == "hami-gpu"
```

对比之下，结论非常明确：

> **DRA 是能力升级，但用户体验明显退化。**

对于已经在使用 Device Plugin 的企业来说，迁移成本不只是改写 YAML 这么简单，而是整个团队需要学习一套全新的资源声明范式。

## HAMi-DRA 的关键突破：自动化迁移

这是这次分享最有价值的部分之一。

HAMi 的做法不是让用户"直接用 DRA"，而是采用了一个更务实的策略：

> **让用户继续使用 Device Plugin 的写法，由系统自动转换成 DRA。**

### 工作机制

通过 **Mutating Webhook**，HAMi-DRA 在 Pod 创建阶段自动完成转换：

**输入**（用户侧，保持 Device Plugin 语法）：

```yaml
nvidia.com/gpu: 1
nvidia.com/gpumemory: 4000
```

**Webhook 自动转换**：

* 生成 ResourceClaim 对象
* 构造 CEL selector
* 注入设备约束（UUID / GPU 类型）

**输出**（系统内部）：

* 标准的 DRA 资源对象
* 可被调度器识别的资源表达

这个设计的核心价值在于：

> **将 DRA 从"专家接口"变成了"普通用户接口"。**

用户不需要理解 ResourceClaim、CEL selector 这些新概念，只需要像以前一样写 `nvidia.com/gpu`，系统会自动处理底层复杂性。

## DRA Driver：不只是"注册资源"

DRA Driver 的实现复杂度远超想象。它不只是"把资源注册到调度器"，而是承担了完整的设备生命周期管理：

### 三个核心接口

* **Publish Resources**——向调度器发布可用资源
* **Prepare Resources**——Pod 创建前的资源准备（注入 libvgpu.so、配置 ld.so.preload、管理环境变量和临时目录）
* **Unprepare Resources**——Pod 删除后的资源回收

这意味着：

> **GPU 调度已经进入运行时编排层，不再只是简单的资源分配。**

从用户角度看，Pod 创建的时间线被拉长了——调度器匹配资源后，Driver 还需要完成设备初始化、运行时注入等一系列操作，才能让 Pod 正常运行。

## 性能提升：不只是"更优雅"

HAMi-DRA 不只是架构更优雅，在性能方面也有实质性的提升。

### Pod 创建时间对比

* HAMi（传统模式）：峰值约 42,000
* HAMi-DRA：显著降低（提升约 30%+）

这一提升来自 DRA 的**资源预绑定机制**：在调度阶段就已经确定了资源分配，减少了调度冲突和重试次数。

对于大规模 AI 集群来说，Pod 创建速度直接影响任务启动延迟和集群吞吐量，30%+ 的提升在生产环境中意义重大。

## 可观测性范式的转变

一个容易被低估但非常重要的变化是可观测性。

### 传统模型

* 资源信息来自 Node
* 使用情况来自 Pod
* 需要聚合和推断才能获得完整的资源视图

### DRA 模型

* ResourceSlice 描述设备清单
* ResourceClaim 描述资源分配
* **资源视角是一等公民**

这意味着：

> **可观测性从"推断"变成了"直接建模"。**

运维团队可以直接通过 ResourceClaim 了解每张 GPU 被谁占用、分配了多少显存、还有多少余量，而不需要从 Node 状态和 Pod 配置中反推。

## 统一建模：异构设备的未来方向

如果设备属性可以被标准化，那么一个**与厂商无关的调度模型**就成为可能。

例如，通过标准化的属性字段描述：

* PCIe root complex
* PCI bus ID
* GPU 核心属性

这指向了一个更大的叙事：

> **DRA 是异构算力抽象的起点。**

当华为昇腾、寒武纪、AMD 等不同厂商的加速器都通过统一的属性模型接入 Kubernetes，调度器就能真正实现跨厂商的资源管理，而不再需要为每个硬件厂商维护独立的调度逻辑。

## 更大的趋势：Kubernetes 正在成为 AI 控制平面

将这些变化串联起来，可以看到一个清晰的趋势：

* **从调度"机器"到调度"资源对象"**——Node 不再是最小调度单元
* **从"设备"到"虚拟资源"**——GPU 不再是一张物理卡，而是可切分、可组合的资源
* **从"命令式"到"声明式"**——调度逻辑被资源声明所替代

本质上：

> **Kubernetes 正在演进为 AI 基础设施的控制平面。**

## HAMi 的定位

在这一趋势下，HAMi 的定位正在变得越来越清晰：

> **面向 Kubernetes 的 GPU 资源层。**

* **向下**：适配异构 GPU（NVIDIA / 华为昇腾 / 寒武纪等）
* **向上**：支持 AI workload（训练 / 推理 / Agent）
* **中间**：调度 + 虚拟化 + 资源抽象

而 HAMi-DRA，正是将这层资源能力与 Kubernetes 原生模型对齐的关键一步。

## 结语

这次 KCD Beijing 2026 分享的真正价值，不只是介绍了 DRA，而是回答了一个更实际的问题：

> **如何把一个"正确但难用"的模型，变成一个今天就能用的系统？**

HAMi-DRA 的答案是：

* **不改变用户习惯**——继续使用 Device Plugin 语法
* **吸收 DRA 能力**——底层自动转换为 DRA 资源模型
* **内部消化复杂性**——Webhook、Driver、生命周期管理全部由系统处理

这也是 HAMi 社区一直坚持的方式：**通过社区协作推动 AI 基础设施进步，而不是封闭系统。** 来自不同公司的贡献者在真实生产环境中验证方案，通过社区共享经验，让更多人受益。

如果你对 HAMi-DRA 或 GPU 调度感兴趣，欢迎加入 HAMi 社区，与我们一起推动 Kubernetes 上的 AI 算力资源管理。
