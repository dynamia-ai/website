---
title: "密瓜智能（Dynamia）牵头组织 CNCF、PyTorch 基金会代表走访中国 AI 算力企业"
linktitle: "CNCF、PyTorch 基金会代表走访中国 AI 算力企业"
date: '2026-07-07'
excerpt: >-
  在 HAMi 晋升 CNCF Incubating 的行业窗口期，密瓜智能牵头组织并全程陪同 CNCF、PyTorch 基金会代表团走访壁仞科技、
  天数智芯、沐曦、寒武纪、超云等国内 AI 芯片与算力基础设施企业，围绕国产 AI 芯片与全球云原生 AI Infra
  开源生态的适配、生态共建与生产落地展开深入交流。
author: 密瓜智能
tags:
  - HAMi
  - CNCF
  - PyTorch
  - 开源生态
  - AI 算力
  - 国产芯片
category: Community & Events
language: zh
coverImage: /images/blog/dynamia-cncf-pytorch-china-tour/delegation-overview.jpg
---

近日，由密瓜智能（Dynamia）发起并长期推动的开源项目 HAMi 正式晋升为 CNCF Incubating 项目。作为目前行业内唯一专注于异构 GPU 资源虚拟化与高效调度，并进入 CNCF Incubating 阶段的开源项目，HAMi 的这一里程碑，标志着 AI 算力管理正在从工程探索走向全球云原生生态认可的基础设施方向。就在这一行业窗口期，密瓜智能牵头组织并全程陪同 CNCF、PyTorch 基金会代表团走访中国 AI 算力企业。**代表团成员包括 CNCF、Linux 基金会云计算，AI 与基础设施执行总监 Jonathan Bryce、CNCF/PyTorch 亚洲总监李昊阳、CNCF 中国区总监 Keith 等**，先后走进**壁仞科技、天数智芯、沐曦、寒武纪、超云等国内 AI 芯片与算力基础设施企业**，围绕国产 AI 芯片与全球云原生 AI Infra 开源生态的适配、生态共建与生产落地展开深入交流。

![CNCF、PyTorch 基金会代表团走访中国 AI 算力企业](/images/blog/dynamia-cncf-pytorch-china-tour/delegation-overview.jpg)

这次走访的背后，是全球开源生态对中国 AI 算力产业的持续关注。随着国产 GPU、NPU、MLU 等 AI 加速器进入更多模型厂商、云平台和企业客户的生产环境，CNCF、PyTorch 基金会希望更直接地了解中国 AI 算力生态，尤其是国内 AI 芯片与算力基础设施企业在云原生和 AI Infra 场景中的适配进展、生产实践与生态合作诉求。

## 为什么是 CNCF，为什么是密瓜智能与 HAMi

CNCF 是 Linux Foundation 旗下全球云原生生态的重要组织，围绕 Kubernetes、Prometheus、Envoy 等开源项目构建社区治理与技术协作体系。随着 AI 训练、推理、智能体和多模态应用持续增长，云原生技术正在进入 AI Infra 的核心场景。

在这一过程中，GPU、NPU、MLU 等异构加速器正在成为新的基础设施入口。算力如何被 Kubernetes 识别、调度、隔离、观测和计量，已经不只是硬件厂商需要解决的问题，也成为云平台、AI 框架、模型服务系统和企业 AI 平台共同关注的问题。

HAMi 正是在这一背景下成长起来的开源项目。**HAMi 由密瓜智能团队主导创立并核心维护，面向 Kubernetes 场景提供异构算力的共享、调度、隔离与虚拟化能力，并于 2026 年 7 月进入 CNCF Incubating，成为云原生生态中面向异构 AI 计算虚拟化的重要开源项目。**

对密瓜智能而言，HAMi 不只是一个开源项目，也是连接国产异构算力、Kubernetes 资源治理和全球 AI Infra 社区的重要技术底座。近年来，HAMi 与国内多家 GPU 厂商、云平台和企业客户持续展开技术适配与生产实践。从 GPU 共享、显存隔离、细粒度切分，到多卡异构调度、DRA 与 CDI 接入，再到监控、计量和平台化能力，HAMi 已经积累了一套连接上游开源生态与国产异构算力的工程经验。

依托这些实践积累，密瓜智能一方面帮助 CNCF、PyTorch 基金会更直接地了解中国 AI 算力生态的技术进展、生产实践与合作需求；另一方面，也帮助国内 AI 芯片与算力基础设施企业更系统地参与 CNCF、PyTorch、vLLM、HAMi 等全球开源生态。此次走访，正是密瓜智能以 HAMi 为桥梁，推动国产 AI 算力与全球开源社区建立更深入连接的一次实践。

## 面向国产算力生态的三个关键问题

本次走访中，不同企业的产品路线和落地场景各有侧重，但交流重点很快汇聚到一个共同命题：国产 AI 加速器如何从“可以运行”走向“可以被平台稳定治理、被生态持续采用”。

首先，是国产 AI 加速器如何进入云原生资源治理体系。在企业生产环境中，算力资源需要被统一管理、精细调度和持续观测。国产 GPU、NPU、MLU 等异构加速器只有进入 Kubernetes 等主流云原生资源体系，才能被云平台和企业 AI 平台更标准化地识别、分配和使用。

其次，是国产算力如何进入主流 AI 软件栈。从模型训练到大模型推理，PyTorch、vLLM 等开源框架正在成为开发者和企业平台的重要入口。国产 AI 加速器不仅需要“能跑模型”，还需要在框架适配、运行时支持、模型兼容性、性能优化和生产稳定性上持续验证。

第三，是国产算力如何通过开源社区形成可复用生态。对 AI 芯片与算力基础设施企业来说，参与全球开源生态不只是提交代码，也包括标准对齐、上游适配、兼容性验证、案例发布和开发者活动参与。这些动作共同决定了国产算力能否被更广泛的开发者、云平台和企业客户稳定识别和采用。

本次走访进一步形成共识：国产 AI 算力要走向更大的产业生态，需要在云原生和 AI 开源体系中持续验证、持续贡献、持续共建。

## 从产业共识到生态行动

共识之后，是更具体的生态行动。各方将围绕框架适配、社区贡献、案例共建、开发者活动和国际会议分享等方向，推动真实生产场景中的工程问题与适配经验进入 CNCF、PyTorch、vLLM、HAMi 等开源生态。

作为后续生态交流的一部分，**7 月 16 日，vLLM Meetup 上海站将在上海模速空间举行。本次活动将围绕“推理的边界，从芯片到应用的全栈进化”展开讨论。** 面向 AI 基础设施工程师、MLOps 团队、模型开发者、GPU 与加速卡厂商技术团队、云原生架构师等人群，继续探讨从芯片到模型推理、从框架到应用落地的全栈演进。

同时，**密瓜智能也将持续参与后续 KubeCon + CloudNativeCon、OpenInfra Summit、PyTorch Conference China 等开源生态活动，围绕 HAMi、异构算力调度、云原生 AI Infra 标准化和国产算力生态，带来更多实践分享与社区交流。**

国产 AI 算力的下一阶段，关键不只在芯片本身，也在芯片、框架、调度、平台、应用和社区之间能否形成开放协作。

密瓜智能将继续依托 HAMi，把国产异构算力在真实生产场景中的工程实践带入更开放的云原生与 AI 开源生态，推动相关能力在 Kubernetes、PyTorch、vLLM 等主流技术栈中持续验证、持续贡献、持续共建。

## 探访现场

从芯片厂商到服务器与算力基础设施企业，本次走访覆盖了国产 AI 算力生态中的多个关键环节，也为后续社区共建、活动协同和国际会议交流奠定了基础。

以下为本次代表团走访过程中的部分现场合影。

![代表团走访壁仞科技](/images/blog/dynamia-cncf-pytorch-china-tour/biren.jpg)

![代表团走访天数智芯](/images/blog/dynamia-cncf-pytorch-china-tour/iluvatar-corex.jpg)

![代表团走访沐曦](/images/blog/dynamia-cncf-pytorch-china-tour/metax.jpg)

![代表团走访寒武纪](/images/blog/dynamia-cncf-pytorch-china-tour/cambricon.jpg)

![代表团走访超云](/images/blog/dynamia-cncf-pytorch-china-tour/super-cloud.jpg)
