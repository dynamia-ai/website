---
title: 'CNCF 视角下的 AI 基础设施：从"堆算力"到"用算力"'
date: '2026-04-25'
excerpt: >-
  本文为 HAMi 社区 Meetup 深圳站回顾系列第一篇，CNCF 亚太区副总裁 Keith
  Chan 从全球视角解读 AI 基础设施的云原生演进趋势，并预告 9 月 KubeCon 上海站的
  AI 议题盛况。
author: Dynamia
tags:
  - CNCF
  - KubeCon
  - AI 基础设施
  - 云原生
  - Kubernetes
  - NVIDIA
category: Community & Events
language: zh
coverImage: /images/blog/keith-chan-ai-infrastructure-cloud-native/keith-chan-portrait.jpg
linktitle: "CNCF 视角下的 AI 基础设施"
---

「不卷算力卷效率 | HAMi 社区 Meetup」深圳站由 HAMi 社区发起，密瓜智能主办，2026 年 4 月 25 日在深圳圆满结束。本文为 HAMi 社区 Meetup 深圳站回顾系列第一篇，CNCF 亚太区副总裁 Keith Chan 从全球视角解读 AI 基础设施的云原生演进趋势，并预告 9 月 KubeCon 上海站的 AI 议题盛况。

**演讲嘉宾：** Keith Chan（CNCF China Director, Linux Foundation 亚太区副总裁 / VP, Linux Foundation APAC）

![Keith Chan 演讲现场](/images/blog/keith-chan-ai-infrastructure-cloud-native/keith-chan-portrait.jpg)

## 核心亮点

- 66% 企业已将 AI 跑在云原生上，K8s 成为 AI 基础设施统一编排层
- NVIDIA 正式加入 CNCF 白金会员，GPU 与 K8s 深度融合加速
- KubeCon AI 议题占比达 60%-80%，成为绝对主流
- HAMi 是首个登上 KubeCon Europe Keynote 的 Sandbox 项目
- OpenAI 通过 FluentBit 等技术将 GPU 利用率提升超过 50%

## 视频回放及 PPT 下载

- **B 站：** [The infrastructure of AI's future - Keith Chan(CNCF)](https://www.bilibili.com/video/BV1Sqo6BBE2h/)
- **下载 PPT：** [opening-cncf-keith-chan.pdf](https://github.com/Project-HAMi/community/blob/main/hami-meetup/03-shenzhen-20260425/opening-cncf-keith-chan.pdf)

## 一、66% 的企业已将 AI 跑在云原生上

Keith Chan 首先分享了 CNCF 2025 年底调研数据：**全球范围内已有 66% 的企业将其 AI 负载运行在云原生环境上**，国内调研数据也显示超过 90% 使用 AI 的企业已采用云原生 AI 技术。

![图：66% 的企业将 AI 工作负载运行在云原生环境上](/images/blog/keith-chan-ai-infrastructure-cloud-native/cncf-survey-66-percent.png)

这一数据背后的核心趋势是：**Kubernetes 已成为 AI 基础设施的统一编排层**。K8s 的自动扩缩容、CI/CD 流水线及高可用性等特性，恰好满足了生成式 AI 对实时性与弹性的严苛需求。

## 二、竞争焦点的转移：从"堆算力"到"用算力"

当前 AI 领域的竞争已从单纯堆砌算力，转向"**如何以最低成本、最高效率利用算力**"。Keith 指出，企业不再单纯依赖现成模型，而是通过优化基础设施来构建核心竞争力。

头部企业已率先践行"Infrastructure First"策略：

- **OpenAI** 通过 Kubernetes 管理数千节点，并利用 FluentBit 等技术将 GPU 利用率提升超过 50%
- **Hugging Face** 同样采用云原生优先的架构策略

## 三、生态格局的三大变化

### NVIDIA 深度拥抱 CNCF 生态

Keith 带来了一个重磅消息：**NVIDIA 已正式加入 CNCF 成为白金会员**。这标志着 GPU 领域的绝对领导者深度拥抱云原生生态，将进一步推动 GPU 与 K8s 的融合。

### PyTorch 社区与云原生社区深度融合

鉴于 **90% 的 LLM 基于 PyTorch 开发**，PyTorch 社区与云原生社区的配合度极高，两个社区正在快速融合，推动 AI 技术栈的标准化。

### KubeCon 议题全面转向 AI

Keith 透露了一个令人瞩目的数据：今年 KubeCon 的议题投稿中，**AI 相关议题占比高达 60%-80%**，已成为绝对主流。这不仅是议题趋势的变化，更是整个云原生社区方向的重大转折。

## 四、HAMi：CNCF GPU 调度领域的关键拼图

![HAMi 的 CNCF Case Studies](/images/blog/keith-chan-ai-infrastructure-cloud-native/hami-cncf-case-studies.png)

Keith 特别介绍了 HAMi 项目在 CNCF 生态中的独特价值：

**打破常规的 Sandbox 项目。** HAMi 以 Sandbox 级别加入 CNCF，但近期在 **KubeCon Europe 上作为首个 Sandbox 项目登上 Keynote 演讲**，打破了常规——通常只有 Graduated 或 Incubating 级别的项目才有此殊荣。

**全球社区参与度持续提升。** 除国内企业外，大量国外企业开始参与 HAMi 的周会并贡献代码，项目正从 Sandbox 向 Incubating 阶段迈进。

**填补生态空白。** HAMi 项目填补了 CNCF 在 GPU 调度领域的空白，解决了 AI Infrastructure 中 GPU 资源高效调度的核心痛点。与 K8s、Volcano、KubeFlow 及分布式存储等技术协同，共同构建完整的 AI 基础设施技术栈。

## 五、KubeCon 上海站预告

![KubeCon China 2026 年 9 月 8 日至 9 日在上海举行](/images/blog/keith-chan-ai-infrastructure-cloud-native/kubecon-shanghai-2026.png)

Keith 最后预告了今年 9 月的 KubeCon 上海站：

- 预计将有大量海外专家参与
- **首次将 PyTorch 和 MCP 等 AI 议题纳入大会分论坛**
- AI 相关内容将成为大会的核心主题

## 六、对开发者的启示

Keith 在演讲中特别提到了开发者面临的**文化转变挑战**：AI 的快速发展要求开发者调整技能以适应 AI 时代的开发模式，掌握如何将 AI 应用以最低成本、最高效率的方式落地。

这不是一个技术工具的选择题，而是整个开发范式的转型。
