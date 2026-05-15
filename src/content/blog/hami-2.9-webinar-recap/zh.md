---
title: "直播回顾 | HAMi 2.9 昇腾软切分与 DRA 实战详解，附完整 QA"
linktitle: "HAMi 2.9 直播回顾：昇腾软切分与 DRA"
date: '2026-05-15'
excerpt: >-
  HAMi Maintainer 李孟轩详解 HAMi 2.9 核心特性——昇腾 NPU 用户态软切分、HAMi-DRA
  生产级能力，及异构调度增强。结合 Live Demo 和完整 QA，带你一文掌握 v2.9 全部亮点。
author: Dynamia AI Team
tags:
  - HAMi
  - v2.9
  - Ascend
  - DRA
  - GPU Sharing
  - NPU
  - Kubernetes
category: Community & Events
language: zh
coverImage: /images/blog/hami-2.9-webinar-recap/cover.png
---

![直播封面](/images/blog/hami-2.9-webinar-recap/cover.png)

**主题：** HAMi 2.9 版本发布解读 —— 《HAMi 2.9 如何重构 Kubernetes AI 算力调度》

**时间：** 2026 年 5 月 14 日（周三）晚

**直播渠道：** 微信视频号（HAMi 社区）

**主讲人：** 李孟轩 —— HAMi Maintainer、密瓜智能联合创始人兼 CTO

**主持人：** Jimmy Song —— 密瓜智能，负责 HAMi 社区与生态

## 直播内容简介

本次分享会李孟轩详细解析了 HAMi 2.9 版本的核心特性，重点演示了华为昇腾 Ascend NPU 软切分方案及 HAMi DRA 架构，并针对异构算力调度、监控及国产卡适配等热点问题进行了深度答疑。直播全程结合 Live Demo，让观众直观感受各项新能力的实际效果。

HAMi 这两年一直在做一件事：**让 Kubernetes 能更好地管理 AI 算力资源。** 无论是 GPU 共享、异构调度，还是 DRA 这样的 Kubernetes 原生资源模型，HAMi 都在持续推进这些方向。

## HAMi v2.9 核心更新

HAMi v2.9 版本带来了三个核心能力升级：

- **HAMi-Core 模式** —— 昇腾 910C 用户态软切分，无需厂商私有驱动
- **HAMi-DRA** —— 基于 Kubernetes DRA 的原生资源模型，正式进入生产可用
- **异构调度增强** —— 更多异构 GPU 和 AI 加速卡生态支持

### 版本差异与升级策略

版本功能区别：HAMi 2.9.0 包含多项功能升级，而 2.8.3 主要聚焦于 HAMi Core 层面的 Bugfix，其功能列表仍对标 2.8.0。

**灰度升级兼容性：** HAMi 自 2.5.0 版本起支持灰度升级，新版本发布后，旧版本提交的任务仍能被识别，旧任务沿用旧版能力，新任务自动启用新版能力。

> **部署与更新规范**
>
> - 强烈建议使用 Helm 进行更新，**必须同时更新 Chart 和镜像**
> - 严禁仅替换镜像而不更新 Chart，否则可能导致集群部署失败

**性能优化成果：** 新版本对 HAMi Core 进行了深度优化，通过减少锁竞争和使用原子操作替代部分锁机制，性能 Overhead 降低至原来的 1/3，接近原生性能极限。

## HAMi-Core：昇腾 NPU 用户态软切分

HAMi-Core 是 HAMi v2.9 最重要的特性之一。为解决硬切分（MIG）的局限性，HAMi 引入了用户态软切分方案，通过用户态方式实现算力切分，无需依赖厂商私有驱动，具备更好的通用性和可维护性。

![HAMi-Core 优化](/images/blog/hami-2.9-webinar-recap/hami-core-optimization.png)

### 方案优势与原理

- **突破硬切分限制：** 针对 Ascend 910B/C 等不支持硬切分或切分粒度受限（如 910B 最小 16GB）的场景，软切分支持自定义切片大小，实现算力弹性伸缩
- **架构实现机制：** 通过在每个容器内启动 Limiter 守护进程，与全局协调层通讯获取算力规格令牌，利用 libvnpu.so 拦截显存申请和 Kernel Launch 操作，实现资源限制

![昇腾软切分方案步骤](/images/blog/hami-2.9-webinar-recap/ascend-soft-partition-steps.png)

![昇腾软切分方案流程](/images/blog/hami-2.9-webinar-recap/ascend-soft-partition-flow.png)

### 配置与使用

- **配置方式：** 支持全局配置和节点级配置，节点级配置优先级高于全局配置
- **强制注解要求：** 当前版本需在 Pod 注解中显式添加 `huawei.com/vnpu-mode: 'hami-core'`，否则任务无法调度到软切分节点

![昇腾软切分方案配置方式](/images/blog/hami-2.9-webinar-recap/ascend-config.png)

![昇腾软切分方案使用方式](/images/blog/hami-2.9-webinar-recap/ascend-usage.png)

> **Live Demo 效果**
>
> 现场演示了在 910B 上成功将 VLM 任务的显存限制从 64GB 调整为 40GB（硬切分无法实现该粒度），验证了软切分的可用性。该方案完全开源，支持 25.05 以上驱动的 910B、910C、310 等型号。

## HAMi-DRA：Kubernetes 原生资源模型

HAMi-DRA 是基于 Kubernetes Dynamic Resource Allocation (DRA) 的实现，让 GPU/NPU 等加速器资源管理走 Kubernetes 原生路径。目前 HAMi-DRA 已正式进入生产可用阶段。

![如何部署 HAMi DRA](/images/blog/hami-2.9-webinar-recap/hami-dra-deploy.png)

### 架构优势与兼容性

- **解耦调度器依赖：** HAMi DRA 不再包含调度器组件，而是作为 Webhook 和监控组件存在，完美兼容 Kubernetes 原生调度器及 Volcano、Kube-batch 等第三方调度器
- **无感迁移体验：** 用户无需感知 DRA 底层机制，仍可使用类似 Device Plugin 的资源申请方式（如 limits.nvidia.com/gpu），HAMi DRA 自动将其转换为 ResourceClaim

### 生产级能力增强

- **监控与排障：** 提供了完整的集群监控视图，支持查看设备复用情况、资源分配详情及调度事件，解决了原生 DRA 方案排障困难的问题

> **选型建议**
>
> - 标准化集群追求最优调度（如拓扑感知）→ 推荐使用原生 HAMi
> - 高度定制化集群（已有调度器）或需即插即用设备复用 → 推荐使用 HAMi DRA

HAMi-DRA 文档地址：[https://github.com/Project-HAMi/HAMi-dra](https://github.com/Project-HAMi/HAMi-dra)

> **注意事项：**
>
> - Kubernetes 版本要求 1.35+
> - DRA Consumable Capacity feature gate 将在 K8s 1.36 默认开启
> - 使用 DRA 模式仍然会经过 hami-core
> - NPU 的 DRA 支持正在开发中，预计 2.10 版本发布，在此之前会先放出测试版本供社区试用

## 视频回放

直播完整回放已发布至 HAMi 社区视频号，欢迎观看。

B 站回放链接：[HAMi 2.9 如何重构 Kubernetes AI 算力调度](https://www.bilibili.com/video/BV13m5Y6nEv3/)

## 讲师 PPT 下载

讲师 PPT 已整理完毕，可在 HAMi Community GitHub 下载：[hami-2.9-kubernetes-ai-scheduling-limengxuan-20260514.pdf](https://github.com/Project-HAMi/community/blob/main/webinar/01-hami-2.9-kubernetes-ai-scheduling-limengxuan-20260514.pdf)

## Q&A 整理

以下是本次直播过程中收集到的观众问答整理：

### GPU 与 NPU 切分

**Q：使用 HAMi 能支持容器里面热挂载 GPU 吗？场景是由 CPU 容器切换至 GPU 容器，不需要重启 Pod。**

目前不支持，需依赖底层容器运行时（如 Containerd/CRI-O）支持热挂载 Device 的能力，暂无适配计划。需要关注 CNCF 中是否有支持该功能的项目。

**Q：华为昇腾 NPU 910B/C 软切分 HAMi 也有，是完全开源的还是商业的？**

都有，软切分方案完全开源。华为 Ascend 因其 Apache 2.0 协议可直接开源支持。

**Q：软切分是支持了所有的 NPU 吗，910B、910C、310？**

是的，25.05 以上驱动都支持。

**Q：华为昇腾 NPU (910B) 切分后使用完毕后，Pod 资源删除掉，vNPU 块摧毁掉后，使用 8 卡整机推理大模型后 PTA call acl api failed 报错了，重启服务器能解决，是 HAMi 虚拟化 NPU 的问题吗？**

需要环境复现，建议联系厂商。

**Q：软切后监控指标有和容器限制的大小对应起来吗？比如利用率是否是基于切分的大小作为分母计算的。**

没有。目前监控显示的利用率是整卡的物理利用率，而非基于切分大小的逻辑利用率（如 20% 物理使用量除以 30% 配额）。与 NVIDIA 类似，都是整卡的利用率。

**Q：vNPU 监控有计划支持吗？**

昇腾软切分监控在 Roadmap 中。

**Q：hami-core 动态调整是啥意思？**

暂无动态调整功能。

**Q：Ascend 910B4-1 的 Pod 中执行 npu-smi info 出现 DrvMngGetConsoleLogLevel failed，dcmi model initialized failed, because the device is used，是否支持 Ascend 内部执行 npu-smi info？**

支持，这个问题很可能是因为这个卡不是一个干净的设备。

### DRA 相关

**Q：使用 DRA 模式还会走 hami-core 吗？**

是的。

**Q：NPU 支持 DRA 吗？**

正在开发中，预计下个版本（2.10）会 Release，在此之前会先放出测试版本供社区试用。

**Q：HAMi DRA 的文档在哪里？**

[https://github.com/Project-HAMi/HAMi-dra](https://github.com/Project-HAMi/HAMi-dra)

**Q：如果想在 Volcano 下使用显存切分，是推荐用 HAMi-DRA 还是 volcano-vgpu-device-plugin？**

建议使用 volcano-vgpu-device-plugin，HAMi DRA 也可以用，但是前者目前适配更好。

**Q：有最佳实践文档吗？**

目前刚发布，还未撰写最佳实践，欢迎贡献，Kubernetes 版本要 1.35+。

**Q：K8s 1.35 默认启用 DRA Consumable Capacity feature gate 了吗？**

不是，1.36 才默认开启。

### 异构调度与生态

**Q：HAMi 有适配阿里平头哥的 PPU 的计划吗？**

有适配意愿，但需厂商授权开源协议。目前华为 Ascend 因其 Apache 2.0 协议可直接开源支持，而阿里 PPU 暂无类似开源项目，需厂商配合。

**Q：异构能做到不同卡如 NVIDIA 卡和国产卡，或国产不同卡的混训混推吗？**

取决于国产卡本身是否具备与英伟达卡的混训能力。若硬件支持且网络配置正确，HAMi 作为调度组件可以支持，但性能可能受影响。需要参考厂商的文档。

**Q：拓扑调度 HAMi 有优化吗？**

针对许多 GPU 都有该优化。

**Q：拓扑调度能举个例子说下吗？**

昆仑芯和 AWS 的调度逻辑例子。

**Q：Volcano 调度器与 HAMi 配合使用，可以实现其他国产卡的切分调度吗？有计划吗？**

请等待适配的其他国产卡的调度器出来，需要厂商同意和配合。

**Q：远程调用后期会支持吗？**

有人提了 Proposal，见：[GitHub Gist](https://gist.github.com/ManishSharma1609/92775165012b9d67e2ea707d9c7aa44a)

### 运维与稳定性

**Q：训练和推理的可靠性和负载均衡弹性伸缩能力如何？**

有故障隔离，调度器也无状态可以重启，AWS Carpenter 可以实现弹性伸缩，可以跟 HAMi 一起使用。

**Q：升级 HAMi 那老 Pod 还在跑在老的 hami-core 上么？批量删除 Pod 导致 scheduler 挂掉问题现在支持多少并发了？**

是的，老 Pod 仍使用旧版 Core（灰度升级机制）。关于批量删除 Pod 导致 Scheduler 挂掉的问题，需进一步测试验证，若发现请提交 Issue。

**Q：HAMi 显存超卖可生产使用吗？**

HAMI 社区版仅支持逻辑超卖，若实际使用量超过物理显存会导致 OOM。生产级显存超卖能力需参考 HAMi 企业版。

## 总结

HAMi 2.9 是一次里程碑式的版本更新，HAMi-Core 用户态软切分让昇腾 NPU 算力共享不再受限于厂商硬切分能力，HAMi-DRA 则为异构算力管理提供了一条兼容 Kubernetes 原生生态的全新路径。从直播中观众提问的热度可以看出，社区对 GPU/NPU 共享调度、国产卡适配、DRA 生产化落地等话题有着强烈的需求和期待。HAMi 将继续在这些方向上深耕，也欢迎更多开发者和企业用户加入社区，共同推动 Kubernetes AI 算力调度的发展。

> **关注 HAMi 社区视频号直播间**
>
> 我们会持续举办社区直播，邀请更多来自 HAMi 社区及 AI Infra 领域的朋友来分享实践经验、技术方案和前沿探索。无论你是 HAMi 的使用者、贡献者，还是对 AI 算力管理感兴趣的开发者，都欢迎关注我们的直播间，一起交流、一起成长。
>
> 微信搜索视频号「**HAMi 社区**」并关注，精彩不错过！

通过公众号、视频号和小助手获取中文社区动态并加入微信群。

![欢迎加入 HAMi 社区](/images/blog/hami-2.9-webinar-recap/join-community.jpg)
