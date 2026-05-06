---
title: "HAMi Community Meetup 深圳站圆满落幕：七位专家共话 AI 算力云原生未来"
date: '2026-04-25'
excerpt: >-
  2026 年 4 月 25 日，HAMi 社区在深圳成功举办第三场线下 Meetup，来自 CNCF、顺丰科技、招商银行、燧原科技、深信服、博维智慧科技及密瓜智能的七位技术专家，围绕
  AI 基础设施云原生演进、GPU 算力池化、异构调度、DRA 技术展望等前沿话题，为现场观众带来了一场深度技术盛宴。
author: Dynamia
tags:
  - HAMi
  - Meetup
  - 异构算力
  - GPU 虚拟化
  - 云原生
  - DRA
category: Community & Events
language: zh
coverImage: /images/blog/hami-meetup-shenzhen-recap/shenzhen-meetup-group-photo.webp
linktitle: "HAMi 深圳 Meetup 回顾"
---

2026 年 4 月 25 日，HAMi 社区在深圳成功举办第三场线下 Meetup，来自 CNCF、顺丰科技、招商银行、燧原科技、深信服、博维智慧科技及密瓜智能的七位技术专家，围绕 AI 基础设施云原生演进、GPU 算力池化、异构调度、DRA 技术展望等前沿话题，为现场观众带来了一场深度技术盛宴。

## 活动亮点速览

- **CNCF 亚太区副总裁 Keith Chan** 从全球视角解读 AI 基础设施的云原生趋势，透露 KubeCon 上海站 AI 相关议题占比高达 60%-80%

- **HAMi Maintainer 李孟轩** 首次公开 v2.9 版本核心特性，揭秘 DRA 生态布局与异构算力统一管理愿景

- **顺丰科技陈俊超** 分享 5 个私有云集群 + 多家公有云的 GPU 池化落地实战，集群平均利用率从 40% 提升至 90%

- **招商银行苏茜** 揭秘超节点硬件适配与网络拓扑感知调度，跨机调度概率降低 30%

- **燧原科技马达** 展示 GPU Operator + CDI + DRA 全栈云原生集成方案

- **深信服贾毫杰** 分享 AI 算力网关治理策略，智能路由实现成本与效果的最优平衡

- **博维智慧科技欧彬凯** 展示科研场景下的 GPU 虚拟化与 Agent RL 训练推理一体化实践

## 活动现场

下面是活动现场的合影。

![活动现场](/images/blog/hami-meetup-shenzhen-recap/shenzhen-meetup-group-photo.webp)

## 视频回放

- **B 站回放：** [HAMi Community Meetup 深圳站](https://www.bilibili.com/video/BV1Sqo6BBE2h/)

- **视频号回放：** HAMi 社区

![视频号](/images/blog/hami-meetup-shenzhen-recap/shenzhen-meetup-qrcode.png)

## PPT 下载

HAMi 社区 Meetup 深圳站讲师幻灯片已归档到 [HAMi Community GitHub](https://github.com/Project-HAMi/community/tree/main/hami-meetup/03-shenzhen-20260425)。

## 核心技术趋势

### 1. AI 基础设施全面云原生化

Keith Chan 分享的 CNCF 调研数据显示，全球已有 66% 的企业将 AI 负载运行在云原生环境上。Kubernetes 已成为 AI 基础设施的统一编排层，NVIDIA 正式加入 CNCF 成为白金会员，PyTorch 社区与云原生社区深度融合。AI 领域的竞争焦点正在从"堆算力"转向"用算力"，如何以最低成本、最高效率利用算力成为核心命题。

### 2. GPU 虚拟化与算力池化成为刚需

从顺丰科技到招商银行，多家企业分享了通过 HAMi 实现 GPU 池化与虚拟化的实战经验。核心诉求一致：打破 GPU 独占模式，通过细粒度切分实现多任务复用，将集群 GPU 利用率从 40% 左右提升至 90%。显存超分、算力软切分、拓扑感知调度等高级特性已成为生产环境的标配需求。

### 3. 异构算力统一管理加速落地

英伟达、昇腾、燧原、寒武纪等多家芯片厂商正在积极拥抱云原生生态。HAMi 通过统一调度层屏蔽底层硬件差异，燧原科技展示了基于 GPU Operator + CDI 的标准化管理方案，招商银行则实现了超节点架构下的硬件适配与拓扑感知优化。DRA（Dynamic Resource Allocation）技术成为异构算力管理的新方向。

### 4. AI 算力治理从"能用"走向"用好"

深信服的分享揭示了企业级 AI 算力治理的新维度——不仅要做资源调度，还要做智能路由与成本控制。通过语义分析将简单问题路由至低成本模型、复杂问题路由至高价模型，结合前后安全护栏机制，实现算力价值最大化。

## 系列回顾文章

后续我们将逐一发布每位讲师的深度回顾文章，深入解读各自分享的核心技术要点与实践经验。

---

*本文为 HAMi Community Meetup 深圳站回顾系列总览篇，更多精彩内容请关注系列文章。*
