---
title: '「Dynamia 密瓜智能」主导 HAMi-core 接入 KAI Scheduler，补齐 GPU 共享生产级硬隔离'
linktitle: HAMi-core 接入 KAI Scheduler
date: '2026-06-17'
excerpt: >-
  KAI Scheduler 源自 Run:ai 核心调度引擎，由 NVIDIA 开源，并已进入 CNCF Sandbox。此次由「Dynamia 密瓜智能」主导发起的 HAMi-core 相关集成进入 KAI Scheduler 主干，为其 GPU sharing 能力补上运行时显存硬隔离。
author: 密瓜智能
tags:
  - HAMi
  - KAI Scheduler
  - GPU 共享
  - GPU 虚拟化
  - AI 基础设施
  - 云原生
category: Integration & Ecosystem
language: zh
coverImage: /images/blog/hami-core-adopted-by-kai-scheduler/timeline.jpg
---

> **导语：**
>
> KAI Scheduler 源自 Run:ai 核心调度引擎，由 NVIDIA 开源，并已进入 CNCF Sandbox。此次由「Dynamia 密瓜智能」主导发起的 HAMi-core 相关集成进入 KAI Scheduler 主干，为其 GPU sharing 能力补上运行时显存硬隔离。

过去一年，企业对 AI 基础设施的压力正在从"训练大模型"转向"持续运行 AI 应用"。当 Agent、知识库问答、多模态应用和推理服务进入企业生产系统，GPU 的问题已经不只是"够不够"，而是"能不能被安全地共享"。GPU sharing 可以提高利用率，但如果调度器分配了显存额度，容器运行时却仍然能看到完整 GPU 显存，共享就还停留在"协作式约束"，而不是生产级隔离。

正是围绕这一生产问题，HAMi-core 接入 KAI Scheduler 并补上运行时显存硬隔离能力。这远不是一次单点的技术适配，而是「Dynamia 密瓜智能」、HAMi 开源社区与 KAI Scheduler 社区长期技术协同的结果。早在 2025 年 4 月 KubeCon + CloudNativeCon Europe 2025 期间，**「Dynamia 密瓜智能」创始人兼 CEO 张潇、联合创始人兼 CTO 李孟轩**便带领其主要发起的 HAMi 项目，与 Run:ai / KAI Scheduler 社区围绕 AI 工作负载调度、GPU 共享和资源隔离展开交流。随后，相关合作脉络沉淀在 KAI Scheduler 社区 PR #60「Resource isolation design」中，并围绕资源隔离架构、组件边界、部署模型、API 设计、用户文档和端到端验证持续推进。

![「Dynamia 密瓜智能」创始人兼 CEO 张潇（左）与 Run:ai CTO Ronen Dar（右）于 KubeCon Europe 2025 交流合影](/images/blog/hami-core-adopted-by-kai-scheduler/kubecon-eu-2025-zhangxiao-ronen-dar.png)

![Run:ai Senior Software Engineer（左）、「Dynamia 密瓜智能」联合创始人 CTO 李孟轩（中）、「Dynamia 密瓜智能」创始人兼 CEO 张潇（右）于 KubeCon Europe 2026 交流合影](/images/blog/hami-core-adopted-by-kai-scheduler/kubecon-eu-2026-team.png)

![Github Kai Scheduler 项目 PR](/images/blog/hami-core-adopted-by-kai-scheduler/kai-scheduler-pr.png)

从 Run:ai 被收购、KAI Scheduler 开源并进入 CNCF，到 HAMi-core 集成进入主干，这条时间线也解释了此次合作为什么不是一次孤立适配。这次集成的价值，不只在于 HAMi-core 被 KAI Scheduler 采用，更在于它把"资源隔离"落到了生产链路中：调度完成之后，如何确保每个工作负载在容器运行时真正遵守显存边界。

![关键时间线](/images/blog/hami-core-adopted-by-kai-scheduler/timeline.jpg)

## 补齐生产级 GPU 共享的关键短板：显存硬隔离

KAI Scheduler 是 CNCF Sandbox 项目，也是 Kubernetes 原生 AI 工作负载调度器。它面向大规模 AI 集群中的训练、推理和多团队资源共享场景，支持 Gang Scheduling、层级队列、公平调度、GPU 分片共享、拓扑感知和弹性工作负载等能力。

简单说，KAI Scheduler 解决的是企业 AI 平台如何在有限 GPU 资源下，把任务排得更公平、更稳定、更少浪费。

但在 GPU sharing 场景中，调度能力解决的是"任务放在哪里、分多少资源"。KAI Scheduler 的 GPU 分片共享（Fractional GPU）可以让多个工作负载按比例或按显存大小共享同一张 GPU；如果缺少运行时隔离，任务真正跑起来后仍可能越界。

也就是说，调度器可以把账算清楚，却不一定能在容器运行时拦住超额使用。这个差别在测试环境里不明显，但到了多团队、多租户的生产平台，就会变成稳定性和责任边界问题。

常见风险包括：

- 工作负载可能超额使用显存，引发 OOM 或影响同卡其他任务。
- 租户之间缺乏真正的资源边界，平台难以形成稳定的服务承诺。
- GPU 共享虽然提高了利用率，但也增加了故障定位和责任划分难度。

HAMi-core 的价值就在这里。它通过 CUDA 拦截库，在容器级别实现 GPU 显存和算力隔离。接入后，KAI Scheduler 负责完成 AI 工作负载调度，HAMi-core 在运行时对显存使用边界进行强制约束。此次集成对象严格来说是 HAMi-core，而不是完整 HAMi 平台。KAI Scheduler 保留自身调度能力，引入 HAMi-core 提供 GPU Memory Isolation 能力。双方形成的是一种清晰、松耦合、可持续演进的技术协作关系。

![KAI 负责调度秩序，HAMi-core 负责资源边界，「Dynamia 密瓜智能」推动企业化落地](/images/blog/hami-core-adopted-by-kai-scheduler/kai-hami-core-dynamia.png)

![从调度到隔离，GPU 共享形成生产闭环](/images/blog/hami-core-adopted-by-kai-scheduler/gpu-sharing-production-loop.png)

这种分工对企业客户尤为重要。KAI Scheduler 不需要放弃自身调度体系，HAMi-core 也不需要替代调度器角色。双方围绕各自最擅长的能力形成闭环，使企业在使用 GPU sharing 时既能获得更高资源利用率，也能获得更清晰的隔离边界。

这使 GPU sharing 从"调度层面的资源分配"，进一步进入"运行时层面的硬隔离"。对企业 AI 平台来说，GPU 共享才更接近可以稳定上线、持续运营的能力。

对 KAI Scheduler 社区而言，HAMi-core 补足了 GPU sharing 在资源隔离上的关键能力。对 HAMi 生态而言，进入 KAI Scheduler 主干使其 GPU 显存硬隔离能力进入更主流的云原生 AI 调度链路，后续可在更复杂的多租户场景中接受验证。

## 对企业市场的价值：降低 GPU 共享进入生产环境的风险

随着训练、推理、微调和 Agent 应用进入企业生产系统，GPU 集群正在变成多团队、多租户、多类型任务共同使用的基础设施。平台团队关心的不只是"还有多少 GPU"，而是"这些 GPU 能不能被稳定、公平、可追责地共享"。

GPU sharing 是提升资源利用率的重要方向，但企业是否敢于在生产环境中大规模启用 GPU sharing，取决于平台能否回答三个问题。

第一，平台能否限制单个任务的真实显存使用，而不是只记录申请值？

第二，某个租户或任务越界时，是否会影响同卡其他任务？

第三，平台团队能否基于这些边界形成可解释、可追责的服务承诺？

这次集成直接回应的是这三个问题。KAI Scheduler 解决"任务如何被公平放到合适的 GPU 上"，HAMi-core 解决"任务运行后是否真的守住显存边界"。两者结合后，GPU 共享不只是节省成本，也更接近企业平台可长期运营的能力。

对「Dynamia 密瓜智能」而言，这个位置也更清楚：HAMi 提供开源 GPU 虚拟化与异构算力治理底座，公司围绕企业级部署、兼容适配、可观测、运维支持和商业交付，推动这些能力进入真实 AI 基础设施场景。

## 对 HAMi 生态和「Dynamia 密瓜智能」的意义

从 HAMi 生态角度看，HAMi-core 被 KAI Scheduler 采用，是一次明确的技术路线验证。它说明 CUDA 拦截与 GPU 显存硬隔离这类底层能力，已经被纳入生产级 GPU sharing 的关键链路。

它带来的变化可以概括为两点。

### 第一，验证 HAMi 技术路线的生产价值

GPU 显存隔离是底层能力，但它直接影响企业能否安全启用 GPU sharing。KAI Scheduler 社区引入 HAMi-core 补足资源隔离能力，说明 HAMi-core 在这一问题上的技术路径具备现实生产价值。

### 第二，增强「Dynamia 密瓜智能」面向企业市场的商业信任

HAMi 是开源技术底座，「Dynamia 密瓜智能」是企业级产品化、生产落地、生态适配与商业服务主体。此次合作把 HAMi 的开源技术影响力，与「Dynamia 密瓜智能」的企业级交付价值连接起来，也为企业客户评估 GPU 共享方案提供了更清晰的参考。

## 结语：GPU 共享的下一步，是从"能分配"走向"可治理"

当 AI 工作负载进入生产系统，GPU 共享的核心问题已经不只是"能不能分"，而是"分出去之后能不能守住边界"。HAMi-core 接入 KAI Scheduler，把调度、共享和运行时隔离放进同一条生产链路中，也释放出一个更清晰的行业信号：AI 基础设施的竞争，正在从单点资源效率，走向面向多租户、多任务和异构算力的系统化治理能力。

> 本文侧重介绍此次生态合作的行业背景、企业价值与战略意义。完整技术实现、安装方式、参数配置和使用方法，可前往 HAMi 社区阅读技术版文档：<https://project-hami.io/zh/blog/hami-core-adopted-by-nvidia-kai-scheduler>
