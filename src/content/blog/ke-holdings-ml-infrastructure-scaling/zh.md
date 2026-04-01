---
title: '贝壳：基于 GPU 虚拟化扩展机器学习基础设施'
date: '2026-03-09'
excerpt: >-
  贝壳通过实施基于 Kubernetes 和 HAMi 的 AIStudio 智能计算平台，在多云环境中实现
  GPU 利用率近 3 倍提升（13% → 37%）。
author: Dynamia
tags:
  - 贝壳
  - HAMi
  - 案例研究
  - GPU 虚拟化
  - Kubernetes
  - CNCF
category: Case Study
language: zh
coverImage: /images/blog/ke-holdings-ml-infrastructure-scaling/solution-diagram.png
linktitle: 贝壳 GPU 基础设施实践
source: 'https://www.cncf.io/case-studies/ke-holdings-inc/'
---

## 背景

贝壳找房是中国领先的线上线下房产交易和服务平台。为支持公司快速增长的 AI 计划，集中式基础设施团队运营着跨所有业务部门共享的机器学习平台。

该团队为模型开发、训练和大规模推理提供端到端的计算服务，支持内部研究工作负载和面向生产的 AI 服务。随着模型采用率和请求量在整个组织中的增长，GPU 效率和工作负载隔离成为平台的关键要求。

![贝壳公司](/images/blog/ke-holdings-ml-infrastructure-scaling/ke.png)

## 挑战

随着贝壳机器学习计划的扩展，基础设施团队在 GPU 资源管理方面面临重大挑战：

最初，由于多云环境的复杂性和多样化的工作负载需求，整体 GPU 利用率仅为 13%，这促使基础设施团队寻求提高集群资源利用率的解决方案。

## 解决方案

![解决方案架构图](/images/blog/ke-holdings-ml-infrastructure-scaling/solution-diagram-zh.svg)

贝壳基础设施团队以 CNCF 项目 [HAMi](https://github.com/project-hami/hami) 和 [Kubernetes](https://kubernetes.io/) 为基础，设计并实施了 **AIStudio**，这是一个作为组织机器学习基础设施基础的智能计算平台。

Kubernetes 因其卓越的稳定性和强大的集群调度与管理能力而被选中，显著降低了大规模集群的运营复杂性和维护开销。此外，Kubernetes 与 CNCF 开源生态系统的集成使得能够无缝采用针对不同用例的各种开源解决方案，例如 HAMi。

HAMi 被选中是因为它是 AI Studio 需求最合适的 GPU 多路复用和异构计算解决方案。

![架构图](/images/blog/ke-holdings-ml-infrastructure-scaling/architecture-diagram-zh.svg)

团队实施了双集群方法，根据资源需求分离工作负载。

这种架构分离确保训练作业获得专用、可预测的资源，而推理服务通过内存共享实现高密度，消除了不同工作负载类型之间的资源争用，并最大化了整体基础设施效率。

## 成效

通过利用包括 HAMi 和 Kubernetes 在内的开源技术，基础设施团队开发的 AI Studio 取得了以下成果：

- **大规模稳定运行**
  - 每天平稳处理数千万个业务请求
  - 关键工作负载的高可用性和可靠性
  - 高负载下的一致性能

- **多云环境中的成本效益资源管理**
  - GPU 利用率近 3 倍提升（13% → 37%）
  - 为不同工作负载类型设计高效的内存分配策略

- **关键业务工作负载的生产级可靠性**
  - 强大的调度和管理能力
  - 降低运营复杂性和维护开销

HAMi 作为基础组件的成功集成展示了开源技术如何使组织实现卓越的基础设施效率。

Kubernetes 作为底层平台基础，通过其强大的调度和管理能力，实现了每天数千万业务请求和数万个 Pod 的稳定运行。通过利用 HAMi 的 GPU 多路复用和异构调度优化功能，集群的 GPU 利用率提高了近 3 倍。

## 未来计划

贝壳基础设施团队继续在 HAMi 和 Kubernetes 之上创新和扩展其平台，包括：

- **采用异构设备**：计划纳入华为昇腾和其他非 NVIDIA 加速器
- **云扩展**：与阿里云集成，补充现有的火山引擎和腾讯云部署
- **混合工作负载的高级调度策略**：网络拓扑感知、卡类型规范和基于 UUID 的分配
