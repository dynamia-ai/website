---
title: "DRA 还不够：HAMi v2.9 为什么要做生态联盟？"
date: '2026-04-29'
excerpt: >-
  HAMi Maintainer 李孟轩在深圳 Meetup 上首次公开 v2.9 版本核心特性，深度解析 DRA
  技术演进路径，并展望异构算力统一管理的社区愿景。
author: Dynamia
tags:
  - HAMi
  - Meetup
  - DRA
  - GPU 虚拟化
  - 异构算力
  - v2.9
category: Community & Events
language: zh
coverImage: /images/blog/hami-v29-dra-ecosystem-limengxuan/speaker-portrait.jpg
linktitle: "HAMi DRA 生态联盟与 v2.9 版本前瞻"
---

> 「不卷算力卷效率 | HAMi 社区 Meetup」深圳站由 HAMi 社区发起，密瓜智能主办，2026 年 4 月 25 日在深圳圆满结束。本文为 HAMi 社区 Meetup 深圳站回顾系列第二篇。HAMi Maintainer 李孟轩首次公开 v2.9 版本核心特性，深度解析 DRA 技术演进路径，并展望异构算力统一管理的社区愿景。

**演讲嘉宾：** 李孟轩（密瓜智能联合创始人兼 CTO / HAMi Maintainer）

![李孟轩正在分享](/images/blog/hami-v29-dra-ecosystem-limengxuan/speaker-portrait.jpg)

## 视频回放及 PPT 下载

- **B 站：** [HAMi DRA 生态联盟与 v2.9 版本前瞻 - 李孟轩](https://www.bilibili.com/video/BV1Gho6BCESu/)
- **下载 PPT：** [hami-v2.9-dra-ecosystem-limengxuan.pdf](https://github.com/Project-HAMi/community/blob/main/hami-meetup/03-shenzhen-20260425/hami-v2.9-dra-ecosystem-limengxuan.pdf)

## 一、HAMi 的核心命题：让每一分算力都被充分利用

作为 HAMi 项目的 Maintainer，李孟轩对 GPU 资源浪费这个话题有着最直接的体感。他一上来就抛出了一个问题：在 Kubernetes 里，GPU 是怎么分配的？答案很残酷——一整张卡绑给一个 Pod，用不完也不能给别人。这种"大锅饭"式的独占分配，在 AI 算力本来就紧张的当下，浪费尤为刺眼。

![异构算力必然成为未来的主流](/images/blog/hami-v29-dra-ecosystem-limengxuan/heterogeneous-compute-mainstream.png)

HAMi 作为一个 CNCF Sandbox 项目，本质上就是在做一件事：把 GPU 从"独占"变成"共享"。具体来说，它带来了几个关键改变：

- **多任务复用**：通过 GPU 虚拟化技术，一张物理卡可以同时服务多个任务，彻底打破独占模式
- **利用率跃升**：集群平均 GPU 利用率从 20% 提升到 **70%**，可用资源翻了两倍以上
- **异构统一**：不管底下是英伟达、昇腾还是寒武纪，上层统一调度、统一监控，屏蔽硬件差异
- **拓扑感知**：自动识别卡间的物理拓扑（比如哪些卡是直连的），让多卡任务的通信效率最优

这四个能力组合在一起，就是 HAMi 给异构算力管理交出的核心答卷。

## 二、v2.9 版本核心特性

聊完项目定位，李孟轩把话题转向了即将发布的 HAMi 2.9 版本。这个版本在生态兼容和国产芯片支持上动作不小。

### 1. 支持 KAI-scheduler 资源隔离

在 GPU 共享场景里，"能共享"和"安全共享"是两回事。如果两个租户的任务跑在同一张卡上，彼此之间没有隔离，就会出现互相抢占资源的问题。v2.9 新增了 `kai-resource-isolator` 组件，专门解决 KAI-Scheduler 场景下的底层资源隔离。从"能共享"到"安全共享"，这是 HAMi 在多租户方向上迈出的关键一步。

![KAI-scheduler 资源隔离方案](/images/blog/hami-v29-dra-ecosystem-limengxuan/kai-scheduler-isolation.png)

### 2. Volcano vGPU 版本升级

底层 Device Plugin 升级到了 0.19 版本，支持 CDI 模式，同时适配了最新的英伟达驱动和设备。对于已经在生产环境使用 Volcano vGPU 的团队来说，这次升级意味着更好的稳定性和兼容性。

![Volcano vGPU Device Plugin 全面升级](/images/blog/hami-v29-dra-ecosystem-limengxuan/volcano-vgpu-upgrade.png)

### 3. 昇腾 910C 用户态切分

这是 v2.9 里最值得关注的国产芯片支持进展。昇腾 910C 不支持类似英伟达 MIG 的硬件级隔离，但 HAMi 在软件层面找到了方案——通过环境变量来控制算力和显存的分配上限，用纯软件的方式实现了类似 MIG 的虚拟化效果。对于大量使用国产芯片的用户来说，这个功能很实用。

![昇腾 910C 用户态切分方案](/images/blog/hami-v29-dra-ecosystem-limengxuan/ascend-910c-partitioning.png)

## 三、DRA：异构算力管理的下一站

DRA（Dynamic Resource Allocation）是 Kubernetes 社区在资源管理方向上的下一代技术。李孟轩没有回避 DRA 当前的问题，而是做了非常坦诚的分析。

### DRA 当前的三大挑战

DRA 当前有以下三大挑战：

- **API 稳定性问题**：DRA 仍处于快速演进阶段，接口频繁变动，芯片厂商在开发和维护驱动时面临较高的不确定性与成本压力
- **运维能力缺失**：缺乏集群级监控与调度事件观测等关键能力，难以支撑生产环境运维需求
- **拓扑表达受限**：难以表达复杂的物理拓扑结构（例如特定加速卡之间的直连关系），限制了调度优化空间

![DRA API 变动频繁](/images/blog/hami-v29-dra-ecosystem-limengxuan/dra-api-challenges.png)

### HAMi DRA 解决方案：轻量版 HAMi

面对这些挑战，HAMi 的思路是做一个"**轻量版 HAMi**"：

- **向上**：屏蔽 DRA API 的复杂性和不稳定性，给用户一个简洁的接口
- **向下**：提供统一的资源申请入口，对接各种异构硬件驱动
- **补齐**：原生 DRA 目前缺少集群监控和调度事件等运维能力，HAMi 来补上

![HAMi DRA 解决方案：轻量版 DRA](/images/blog/hami-v29-dra-ecosystem-limengxuan/hami-dra-lightweight.png)

此外，HAMi 正在联合英伟达、燧原（Enflame）、华为昇腾等芯片厂商，共同验证 DRA 驱动的适配情况，推动 DRA 在异构算力场景下尽快落地。

## 四、现场问答精选

![现场提问](/images/blog/hami-v29-dra-ecosystem-limengxuan/qa-session.jpg)

演讲结束后，现场观众踊跃提问。以下是几个比较有代表性的问题和李孟轩的回应：

### Q1：HAMi 是否支持动态扩缩容？

> 显存扩缩容功能已经在开发中了，预计会在 **2.10 版本**合入主干。但 GPU 卡数的热扩增（Hot Plug）目前还做不到——这个能力依赖容器运行时的支持，Kubernetes 层面暂时无法直接实现。

### Q2：HAMi 如何与 Volcano 等调度器配合？

> 完全兼容。HAMi DRA 可以作为轻量级中间件，和 Volcano 等调度器协同工作——**Volcano 负责队列管理和批处理调度，HAMi 负责 GPU 的资源切分和复用**，各司其职。

### Q3：GPU 利用率瓶颈在数据传输，虚拟化意义何在？

> 这个问题的前提是对的——训练场景下，瓶颈确实在数据传输。但推理场景不一样，很多推理服务存在明显的波峰波谷，没请求的时候 GPU 就在空转。虚拟化的价值在于让多个推理任务错峰共享同一张卡，把原本空跑的算力利用起来。这是典型的性能和利用率的 Trade-off。

## 五、总结

李孟轩这次演讲清晰地勾勒出了 HAMi 项目的发展全景：从 GPU 共享的核心价值，到 v2.9 在资源隔离和国产芯片支持上的实用进展，再到面向 Kubernetes DRA 的前瞻布局。

几个核心要点值得记住：

- **GPU 共享不是噱头，是刚需。** 集群利用率从 20% 提升到 70%，这不是理论数字，而是已经在生产环境中得到验证的成果。
- **多租户安全共享是下一个关键课题。** v2.9 引入的 kai-resource-isolator 正在把 HAMi 从"能共享"推向"安全共享"。
- **国产芯片适配需要软件层面的创新。** 昇腾 910C 的用户态切分方案证明，即使没有硬件级隔离，也能通过软件手段实现 GPU 虚拟化。
- **DRA 是方向，但路还很长。** HAMi 选择以"轻量版"的思路参与 DRA 生态，既降低了用户的接入门槛，也为异构算力统一管理提供了可落地的路径。

HAMi 正在从一个 GPU 共享工具，逐步演进为一个覆盖多芯片、多云环境的异构算力管理平台。如果你对 HAMi 感兴趣，欢迎关注项目 GitHub 仓库，加入社区一起参与建设。
