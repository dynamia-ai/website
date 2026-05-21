---
title: "告别 GPU 独占时代：用 HAMi 实现训练推理一体化——博维智慧 GPU 虚拟化实战"
date: '2026-05-21'
excerpt: >-
  科研实验室的 GPU 一直是个老大难问题。博维智慧科技用三年时间，从虚拟机独占一路演进到 Kubernetes + HAMi 的云原生方案，最终在 12 张卡的集群上实现了 Agent RL 训练与推理的物理隔离。本文为 HAMi 社区 Meetup 深圳站回顾系列第七篇。
author: 欧彬凯（博维智慧科技）
tags:
  - HAMi
  - GPU 虚拟化
  - Kubernetes
  - Agent RL
  - 训练推理一体化
  - 云原生
category: Community & Events
coverImage: /images/blog/boardware-hami-gpu-virtualization/speaker-photo.webp
language: zh
linktitle: "博维智慧 GPU 虚拟化实战"
---

> 科研实验室里的 GPU 一直是个"老大难"问题：模型种类多、团队共享资源、训练推理混杂运行，硬件成本居高不下。博维智慧科技（Boardware）用三年时间，从虚拟机独占一路演进到 Kubernetes + HAMi 的云原生方案，最终在 12 张卡的集群上实现了 Agent RL 训练与推理的物理隔离。
>
> 本文为「不卷算力卷效率 | HAMi 社区 Meetup」深圳站回顾系列第七篇。2026 年 4 月 25 日，博维智慧科技研究员欧彬凯分享了这一完整演进历程。

**核心亮点：**

- 从虚拟机独占到 K8s + HAMi，70% 科研 GPU 从闲置变高效利用
- 12 张卡实现 Agent RL 训练与推理物理隔离
- HAMi Core 细粒度切分支持显存超卖 1.2-1.3 倍
- Infiniband + RDMA 优化，200 并发推理 RPS 显著提升
- 「算力管理粒度越来越细，使用门槛越来越低」

**演讲嘉宾：** 欧彬凯（博维智慧科技 / Boardware 研究员）

![欧彬凯](/images/blog/boardware-hami-gpu-virtualization/speaker-photo.webp)

欧彬凯，理学硕士，现任博维智慧科技研究员，专注于大语言模型、多模态大模型研究与工程化应用，同时担任广东省智能科技研究院脑机数字融合实验室主管，并作为 PI 主持多项澳门科学技术发展基金创新研发资助项目。在人工智能、物联网和无线通信领域具有丰富的产学研经验与多项论文及专利成果，并持有百度首席 AI 架构师及飞桨技术专家，及多家云厂商专家级认证。

## 视频回放及 PPT 下载

- **B 站：** [Boardware x HAMi：GPU 虚拟化与集群管理研发经历分享 - 欧彬凯](https://www.bilibili.com/video/BV1J7o6BpEZJ/)
- **下载 PPT：** [boardware-gpu-virtualization-oubinkai.pdf](https://github.com/Project-HAMi/community/blob/main/hami-meetup/03-shenzhen-20260425/boardware-gpu-virtualization-oubinkai.pdf)

## 一、科研实验室的 GPU 管理之痛

科研实验室的 GPU 使用场景与企业生产环境有显著差异：

- 模型种类繁多、参数规模不一
- 多个研究团队共享有限的 GPU 资源
- 训练、推理、调试任务混杂运行
- 既要保证研究效率，又要控制硬件成本

博维智慧科技（Boardware）深耕科研与高校场景，积累了丰富的 AI 算力管理经验。在实际调研中，他们发现超过 **70% 的科研 GPU 资源处于闲置或低效使用状态**——不是没有任务在跑，而是资源分配粒度太粗，导致大量显存被浪费。

![科研实验室 GPU 管理核心痛点](/images/blog/boardware-hami-gpu-virtualization/gpu-pain-points.webp)

## 二、架构演进：从虚拟机到容器化

### 早期方案：虚拟机独占 + VPC 切分

团队早期使用虚拟机独占或 VPC 切分来管理 GPU 资源，但存在多个痛点：

- **显存无法动态调整：** 分配后即固定，无法按需弹性伸缩
- **跨卡调度受限：** 虚拟化层的限制导致多卡任务调度不灵活
- **环境割裂：** CPU 与 GPU 环境分离，运维复杂

### 演进方案：全面拥抱 K8s + HAMi

后全面拥抱 Kubernetes，通过容器化实现算力轻量化与灵活调度，引入 HAMi 作为 GPU 虚拟化与调度层。HAMi（Heterogeneous AI Computing Virtualization Middleware）是 CNCF 孵化项目，提供细粒度的 GPU 显存隔离和算力切分能力，让多个容器可以安全地共享同一张物理 GPU。

![K8s + HAMi 架构演进](/images/blog/boardware-hami-gpu-virtualization/k8s-hami-architecture.webp)

## 三、自研调度平台：One Click Deployment Platform

为解决客户"开箱即用"的本地化部署需求，博维自研了 **"One Click Deployment Platform"**——一套面向科研和高校场景的 AI 算力管理平台。它屏蔽了底层 K8s 和 HAMi 的复杂性，让研究人员无需运维知识即可快速启动训练任务。具备以下核心能力：

- **多集群管理：** 统一管理多个 K8s 集群的 GPU 资源
- **多地区异地部署：** 支持跨地域的算力资源调度
- **RDMA 网络优化：** 深度优化 Infiniband 网络，提升分布式训练效率
- **极简部署：** 一键部署算法环境，降低使用门槛

### 性能验证：Infiniband vs 以太网

在千问 3 模型推理场景下，团队进行了 Infiniband 网络与传统以太网的对比测试：

- **测试条件：** 200 并发用户
- **结果：** 使用 Infiniband + RDMA 技术后，总请求量及 RPS（每秒请求数）相比传统以太网有**显著提升**

## 四、Agent RL 实践：训练与推理的物理隔离

这是本次分享中最具技术深度的部分。随着 Agent 范式的兴起，**强化学习（RL）**已成为提升大模型推理能力的关键路径。但在实际工程中，Agent RL 工作流对 GPU 资源提出了前所未有的挑战。

### 核心挑战

在 Agent RL（强化学习）工作流中，训练和推理是两个紧密耦合但又资源需求差异巨大的环节。如何在有限 GPU 资源下同时支持两者？

### HAMi 解决方案

在 OpenRL 框架下，利用 HAMi 将 12 张卡集群划分为：

- **Node A（训练节点）：** 承担模型训练任务
- **Node B（推理节点）：** 承担环境交互与推理评估任务

实现了训练、评估与推理的**物理隔离**，互不干扰。这意味着训练过程中的梯度更新不会影响推理服务的响应延迟，推理侧的环境交互结果也能实时反馈给训练侧，形成高效的 RL 循环。

### 关键技术指标

- 支持**显存超卖 1.2-1.3 倍**，进一步提升资源利用
- 已完成 9B 模型的小规模验证
- 通过 HAMi Core 实现细粒度的 GPU 切分

![Agent RL 结合 HAMi 部署](/images/blog/boardware-hami-gpu-virtualization/agent-rl-hami-deployment.webp)

## 五、高校多场景算力支持

在高校场景中，同一集群需要承载多种负载类型：

- **Jupyter Lab：** 教学与科研的交互式开发环境
- **ML 应用：** 机器学习训练与推理任务
- **语音数字人：** AI 多模态应用

通过 HAMi Core 实现多种负载在同一集群的**混合运行**，解决了 CPU 与 GPU 环境割裂的问题，为高校提供了一站式的 AI 算力平台。这一方案已在多所高校和科研机构落地，显著降低了 AI 基础设施的运维门槛。

![高校多场景混合负载](/images/blog/boardware-hami-gpu-virtualization/multi-scenario-workload.webp)

## 总结

从虚拟机独占到 Kubernetes 容器化，再到基于 HAMi 的 GPU 虚拟化调度，博维智慧的演进路径折射出科研计算基础设施的一个普遍趋势：**算力管理的粒度正在越来越细，而使用门槛正在越来越低**。

这场分享中，最有价值的不是某一个技术细节，而是整个方案的**系统思维**。博维并没有停留在"把 GPU 分给容器"这一步，而是向上构建了完整的调度平台，向下深入到 Infiniband 网络优化，并在横向上打通了 Agent RL 训练与推理的隔离。这套组合拳让 12 张卡的集群能够承载训练、推理、教学等多种负载，GPU 资源利用率大幅提升。

对于同样面临 GPU 利用率低的团队，有几点可以直接参考：HAMi 的显存超卖能力已在生产环境验证到 1.2-1.3 倍；Infiniband + RDMA 对大模型推理的加成是实实在在的；而训练 - 推理物理隔离的思路，对于正在探索 Agent RL 的团队来说，值得优先考虑。
