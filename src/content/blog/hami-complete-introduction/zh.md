---
title: "迈向全球开源基础设施：CNCF Incubating 项目 HAMi 完整介绍"
linktitle: "HAMi 完整介绍"
date: '2026-07-02'
excerpt: >-
  HAMi 是面向 Kubernetes 的开源异构算力虚拟化与调度中间件，为 GPU、NPU 等加速设备提供资源共享、细粒度分配、运行时隔离与设备感知调度能力。本文从研发背景、发展历程、技术架构、社区治理与生态应用五个维度，完整介绍这个已于 2026 年 7 月晋升为 CNCF Incubating 的项目。
author: HAMi 社区
tags:
  - HAMi
  - CNCF
  - GPU 虚拟化
  - 异构算力
  - AI 基础设施
  - 云原生
category: Open Source
language: zh
coverImage: /images/blog/hami-cncf-incubating/cncf-incubating-badge.png
---

![HAMi 晋升 CNCF Incubating 项目](/images/blog/hami-cncf-incubating/cncf-incubating-badge.png)

HAMi（Heterogeneous AI Computing Virtualization Middleware，异构 AI 计算虚拟化中间件）是面向 Kubernetes 的开源云原生异构算力虚拟化与调度中间件，为 GPU、NPU 等加速设备提供资源共享、细粒度分配、运行时隔离和设备感知调度能力。HAMi 支持按显存、计算核心或设备数量分配加速器资源，并通过统一的 Kubernetes 使用方式适配多种硬件设备。

HAMi 由张潇、李孟轩发起，在全球开发者及多家组织共同参与下建设。项目于 2024 年 8 月 21 日进入云原生计算基金会（CNCF）Sandbox，2026 年 7 月 2 日晋升为 CNCF Incubating 项目，按照 CNCF 厂商中立原则进行社区治理。

本文从研发背景、发展历程、技术架构、社区治理、生态与应用五个维度，对 HAMi 做一次完整介绍。

## 1. 研发背景

随着机器学习和人工智能工作负载进入 Kubernetes 环境，传统整卡分配方式容易造成加速器资源碎片和利用率不足。HAMi 围绕 GPU 等异构加速器的细粒度共享、运行时隔离和设备感知调度展开研发，使多个工作负载能够在不修改应用代码和现有 Kubernetes 资源清单的情况下共享加速设备。

HAMi 在张潇、李孟轩等发起人、维护者和全球开发者的共同推动下持续开源发展，逐步从面向 GPU 共享与调度的技术方案，演进为支持多种异构加速器的云原生虚拟化与调度中间件。

## 2. 发展历程

2020 年 3 月，HAMi 项目首次提交代码，早期围绕 Kubernetes 环境中的 GPU 共享和调度开展技术探索，之后逐步形成面向异构加速设备的虚拟化与调度能力。

2024 年 8 月 21 日，HAMi 被 CNCF 接纳为 Sandbox 项目，开始在 CNCF 框架下推进开放治理、技术演进和生态建设。

2026 年 7 月 2 日，CNCF 技术监督委员会通过 HAMi 的孵化投票，HAMi 晋升为 CNCF Incubating 项目。CNCF 公告显示，项目已在技术、安全、社区治理、生产采用和生态集成等方面达到 Incubating 阶段要求，并形成多组织贡献者基础。

## 3. 技术架构

HAMi 的技术架构由准入、调度、设备管理、运行时隔离和可观测性等模块组成：

- **Mutating Webhook** 负责识别并处理异构设备资源请求；
- **Scheduler Extender** 结合节点与设备状态完成设备感知调度；
- 面向不同硬件的 **Device Plugin** 负责向 Kubernetes 注册和分配设备资源；
- **HAMi-Core** 在容器运行时执行显存与计算资源隔离；
- **WebUI 及监控能力** 用于展示设备状态、资源分配和使用情况。

HAMi 支持按显存、计算核心和设备数量申请加速器资源，并提供集中、分散及拓扑感知等调度策略。项目通过统一的 Kubernetes 接口适配多种异构加速设备，减少不同硬件在资源管理和工作负载调度方式上的差异。

## 4. 社区治理

HAMi 采用开源社区协作模式，由 CNCF 托管并按照厂商中立原则治理。项目通过公开代码仓库开展代码贡献、问题追踪、版本发布和技术协作，社区参与者可以通过 Issue、Pull Request 和社区会议参与项目建设。

HAMi 由多家组织和独立开发者共同维护。项目治理文件显示，当前核心维护者（Committers）来自密瓜智能（Dynamia）、NVIDIA、第四范式及独立开发者；其中，项目发起人张潇、李孟轩目前均来自密瓜智能。多组织参与的维护者结构体现了 HAMi 在 CNCF 框架下的厂商中立治理原则。

## 5. 生态与应用

HAMi 面向 Kubernetes 生态提供异构算力资源管理能力，并与 Volcano、Koordinator、Kueue 等调度与队列管理项目形成集成或协同使用关系，使用户能够在不同集群调度体系中使用异构设备共享、隔离和调度能力。

HAMi 已被用于金融、互联网和云原生基础设施等场景，相关实践覆盖 AI 训练与推理、GPU 资源池化、集群资源利用率提升和多租户隔离等方向。

---

进入 CNCF Incubating 阶段，是 HAMi 走向全球开源基础设施的新起点。如果你想深入了解 HAMi 的使用方式、参与贡献或查看真实生产案例，欢迎访问 [HAMi 官网](https://project-hami.io) 与 [GitHub 仓库](https://github.com/Project-HAMi/HAMi)。
