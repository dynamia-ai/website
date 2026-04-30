---
title: "让 GPU 像水电一样用：HAMi 驱动顺丰科技算力池化实战"
date: '2026-04-30'
excerpt: >-
  顺丰科技陈俊超分享了从物理机到多云混合架构的完整演进历程，深度解析基于
  HAMi 的 GPU 池化、显存超分与混部调度落地实践。
author: Dynamia
tags:
  - HAMi
  - Meetup
  - 顺丰科技
  - GPU 虚拟化
  - GPU 池化
  - Volcano
  - EffectiveGPU
category: Community & Events
language: zh
coverImage: /images/blog/hami-sf-tech-gpu-pooling-chenjunchao/speaker-portrait.jpg
linktitle: "HAMi 驱动顺丰科技算力池化实战"
---

「不卷算力卷效率 | HAMi 社区 Meetup」深圳站由 HAMi 社区发起，密瓜智能主办，2026 年 4 月 25 日在深圳圆满结束。本文为 HAMi 社区 Meetup 深圳站回顾系列第三篇。顺丰科技陈俊超分享了从物理机到多云混合架构的完整演进历程，深度解析基于 HAMi 的 GPU 池化、显存超分与混部调度落地实践。

感谢顺丰科技作为本次活动的联合主办方，为活动提供了场地支持。

**演讲嘉宾：** 陈俊超（顺丰科技后端开发高级工程师）

![陈俊超正在分享](/images/blog/hami-sf-tech-gpu-pooling-chenjunchao/speaker-portrait.jpg)

## 视频回放及 PPT 下载

- **B 站：** [HAMi 在顺丰科技的多云落地实践 - 陈俊超](https://www.bilibili.com/video/BV13RozBMEjm/)
- **下载 PPT：** [hami-multi-cloud-practice-sf-tech-chenjunchao.pdf](https://github.com/Project-HAMi/community/blob/main/hami-meetup/03-shenzhen-20260425/hami-multi-cloud-practice-sf-tech-chenjunchao.pdf)

***

## 一、AI 平台架构演进：从 Kubeflow 到多云混合

顺丰科技 AI 平台的演进路径，是许多企业 AI 基础设施建设的缩影。

### 起步：Kubeflow 时代

AI 平台最初基于 Kubeflow 构建，核心业务涵盖三大模块：

- **沙盒（Sandbox）：** 开发者日常实验环境
- **工作流（Workflow）：** 模型训练与数据处理流水线
- **模型服务（Model Serving）：** 在线推理服务

![顺丰科技的 GPU 算力演进历程](/images/blog/hami-sf-tech-gpu-pooling-chenjunchao/slide_02.png)

### 演进：调度器全面替换

随着业务规模增长，底层调度器已从 Kubernetes 默认调度器**全面替换为 Volcano**，以应对大规模 Pod 调度需求。这一选择为后续的 GPU 池化打下了坚实基础。

### 当前：多云混合架构

目前平台管理 **5 个私有云 K8s 集群**，并已对接火山云、阿里云、百度云及华为云四家公有云，利用公有云资源补充私有云算力缺口。

**为什么需要多云？** 本地机房主要部署 V100、A100 及部分 H20，但采购成本高、周期长。公有云资源多为包月或包年采购，用于应对算力紧张和灵活扩展需求。

![多云混合架构 — 5 个私有云集群对接四大公有云](/images/blog/hami-sf-tech-gpu-pooling-chenjunchao/slide_04.png)

## 二、GPU 资源管理：Device Plugin 深度定制

### 从通用到精细：GPU 型号级资源上报

原生 Device Plugin 将所有 GPU 统一上报为 `nvidia.com/gpu`，不同型号无法区分。顺丰团队通过改造 Device Plugin 配置，将资源上报类型细化为：

```
gpu-a100、gpu-v100、gpu-h20 ...
```

这让调度层面可以做到**精准的 GPU 型号匹配**。

![GPU 资源池抽象 + Volcano Queue 配额管理](/images/blog/hami-sf-tech-gpu-pooling-chenjunchao/slide_05.png)

### 简化运维：告别标签与污点

团队取消了对节点打标签和污点的依赖，简化了运维配置，实现了通过 Volcano 统一管理所有 GPU 资源。

### vGPU Device Plugin 适配

对 Volcano 的 vGPU Device Plugin 进行了代码修改，使其能够上报具体的 GPU 卡型号（如 `vgpu-number-l20`），在调度层面实现精准匹配。

## 三、HAMi 落地三大场景

### 场景一：GPU 切分（资源细粒度化）

针对显存和算力利用率较低的任务，通过 HAMi 实现 GPU 的细粒度切分（显存/算力级别），将一张物理 GPU 拆分为多个可独立调度的资源单元，从而提升资源利用率，降低碎片化浪费。

![使用 HAMi 进行显存切分](/images/blog/hami-sf-tech-gpu-pooling-chenjunchao/image.png)

这一能力的核心在于：将 GPU 从"整卡独占"转变为"可分配的细粒度资源"，使低负载任务能够共享同一张物理卡。

### 场景二：GPU 混部（基于优先级的任务共存）

在 GPU 切分能力之上，将开发态任务（沙盒 / Notebook）与高优先级推理任务混部在同一张物理 GPU 上，通过优先级调度与资源保障机制，确保高优任务的稳定性，同时提升整体资源利用率。

沙盒与推理任务存在天然的时间错峰——开发人员白天调参、推理服务按业务流量弹性变化，通过调度策略实现资源复用与动态让渡。

![使用 HAMi 进行混部和优先级调度](/images/blog/hami-sf-tech-gpu-pooling-chenjunchao/image-1.png)

### 场景三：显存超分

利用任务错峰特征（如客服场景白天高并发、夜间空闲），实现了**显存超分**，允许不同任务共享物理显存。通过错峰调度，多任务在不同时段使用同一块显存空间，资源利用率大幅提升。

![显存超分 — 利用错峰调度共享物理显存](/images/blog/hami-sf-tech-gpu-pooling-chenjunchao/image-2.png)

> 陈俊超透露：目前社区版本尚未支持显存超分特性，顺丰是在社区大佬的帮助下实现了该功能。

## 四、全链路监控闭环

不仅采集物理卡监控数据，还采集了 HAMi 虚拟卡的显存利用率等指标，通过 Prometheus 写入 BDP 平台，用于生成利用率报表。这为资源运营决策提供了数据支撑。

![全链路监控 — 物理卡 + 虚拟卡指标采集闭环](/images/blog/hami-sf-tech-gpu-pooling-chenjunchao/image-3.png)

## 五、现场问答精选

![现场观众提问](/images/blog/hami-sf-tech-gpu-pooling-chenjunchao/qa-session.jpg)

### Q1：低优先级任务如何优雅退出？

> 分两种策略。一是**定时监控沙盒利用率**，若持续空闲（如 6-12 小时）则自动 Commit 镜像后退出；二是**高优任务直接抢占**，低优任务会处于夯住（不可用）状态，目前没有降级方案。

### Q2：显存超分具体如何实现？

> 社区版本尚未支持，顺丰在社区开发者协助下自行实现，具体实现细节后续可进一步交流。

### Q3：本地集群与公有云如何配合？

> 本地机房主要运行常驻负载，算力缺口通过包月/包年的公有云资源补充。

## 六、总结

陈俊超的分享完整呈现了顺丰科技 AI 平台从 Kubeflow 到多云混合架构的演进路径，以及基于 HAMi 的 GPU 池化落地实践。核心要点可以归纳为以下几点：

- **架构层面：** 从单一 Kubeflow 平台演进为 5 个私有云集群 + 4 家公有云的多云混合架构，调度器全面切换至 Volcano，为 GPU 池化奠定了调度基础。
- **资源管理层面：** 通过深度定制 Device Plugin，实现 GPU 型号级资源上报，告别标签与污点的运维负担，并通过 vGPU Device Plugin 适配实现虚拟卡的精准调度。
- **HAMi 落地三大场景：** GPU 切分与混部（开发态 + 推理共享物理卡）、显存超分（错峰调度共享显存）、资源池抽象与统一调度（Volcano 队列隔离 + 网关流量分发）。
- **监控层面：** 构建物理卡 + HAMi 虚拟卡的全链路监控闭环，通过 Prometheus 写入 BDP 平台，为资源运营决策提供数据支撑。

顺丰科技的实践充分展示了 HAMi 在企业级 GPU 算力池化场景中的落地价值——从调度器改造、Device Plugin 定制到业务场景适配，形成了一套可复用的技术路径。

## 七、延伸阅读

陈俊超所在的顺丰科技团队此前还发布了 **EffectiveGPU 技术白皮书**，系统性地介绍了顺丰自研的 GPU 池化技术。该白皮书与本次 Meetup 分享的内容一脉相承，可以作为本次分享的深度补充阅读：

- **EffectiveGPU 白皮书：大模型时代，如何更好地提升算力效率？**
  白皮书详细介绍了 EffectiveGPU（简称 egpu）池化技术的整体架构与核心技术，包括异构设备统一管理、设备共享与资源隔离（性能损耗控制在 5% 以内）、弹性资源超配（最高 200% 显存超分能力）、优先级 QoS 保障等关键能力。在落地效果方面，顺丰 AI 生产模型服务使用 28 张 GPU 卡部署了 65 个服务，节省了 37 张卡；测试服务集群使用 6 张卡部署了 19 个服务，节省了 13 张卡。

  **阅读链接：** [EffectiveGPU 白皮书：大模型时代，如何更好地提升算力效率？](https://mp.weixin.qq.com/s/zZKJfJJOzBhpcq1FMttqsA)

- **CNCF Case Study: SF Technology — Effective GPU**
  这是顺丰科技在 CNCF 官方发布的案例研究，以英文面向全球云原生社区。案例系统介绍了 EffectiveGPU 如何基于 CNCF Sandbox 项目 HAMi 构建 GPU 池化方案，涵盖设备虚拟化、资源硬隔离、优先级抢占、跨节点协同调度、显存超分等核心技术，以及在推理服务、测试集群、语音识别、国产算力适配四大场景的落地成效。关键数据包括：生产与测试集群最高节省 57% GPU、GPU 虚拟化带来最高 100% 利用率提升、对 NVIDIA 驱动、Linux 内核、任务镜像和源代码零侵入。
