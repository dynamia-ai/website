---
title: "HAMi 晋升 CNCF 孵化项目：与全球开发者共建 AI 时代的异构算力基础设施"
linktitle: "HAMi 晋升 CNCF 孵化项目"
date: '2026-07-03'
excerpt: >-
  2026 年 7 月 2 日，HAMi 正式晋升为 CNCF Incubating（孵化）项目。这是继 2024 年 8 月作为 Sandbox
  项目加入 CNCF 之后的又一重要里程碑，意味着 HAMi 已经从"有潜力的新项目"成长为"被真实生产环境广泛采用的可信基础设施"。
author: HAMi 社区
tags:
  - HAMi
  - CNCF
  - GPU 虚拟化
  - AI 基础设施
  - 云原生
category: Open Source
language: zh
coverImage: /images/blog/hami-cncf-incubating/cncf-incubating-badge.png
---

![HAMi 晋升 CNCF Incubating 项目](/images/blog/hami-cncf-incubating/cncf-incubating-badge.png)

2026 年 7 月 2 日，HAMi 正式晋升为 **CNCF Incubating（孵化）** 项目，CNCF 技术监督委员会（TOC）以全票赞成通过了[本次孵化投票](https://github.com/cncf/toc/issues/1775)。

![CNCF TOC 孵化投票全票通过](/images/blog/hami-cncf-incubating/toc-vote.png)

这是 HAMi 继 2024 年 8 月作为 Sandbox（沙箱）项目加入 CNCF 之后的又一重要里程碑。在 CNCF 的成熟度体系里，Sandbox 是面向早期探索项目的"试验田"，Incubating 则要求项目在**技术成熟度、安全实践、社区治理、生产采用和生态集成**上都经过严格验证。晋升孵化阶段，意味着 HAMi 已经从"有潜力的新项目"成长为"被真实生产环境广泛采用的可信基础设施"。

衷心感谢主导本次尽职调查的 CNCF TOC 主席 [Karena Angell](https://www.linkedin.com/feed/update/urn:li:activity:7478594903292399616/) 与 TOC 成员 Kevin Wang，为项目完成技术评审的 TAG-Runtime，以及所有提供反馈的采用者。

## HAMi 是什么

HAMi 的全称是 **H**eterogeneous **A**I Computing **Mi**ddleware（异构 AI 计算中间件），是一个面向 Kubernetes 的开源异构算力虚拟化与调度中间件。它要解决的核心问题很朴素：**能不能让多个任务安全地共享一张 GPU，并且互不干扰？**

在 HAMi 出现之前，Kubernetes 对 GPU 的调度方式停留在"一个 Pod 独占一张卡"的粗粒度模型上，昂贵的加速器常常因为某个任务独占而大量闲置，GPU 利用率长期偏低。HAMi 通过容器级的硬隔离能力，把 GPU 的显存与算力精细地切分给不同的工作负载，让多租户、多任务共享同一张加速器成为可能，并且**对已有工作负载零改动**：装上 HAMi，你的任务就能自动获得共享与隔离能力。

项目由 [张潇](https://github.com/wawa0210)、[李孟轩](https://github.com/archlitchi) 发起，于 **2021 年 7 月 12 日**首次开源，并在 CNCF 的开放治理框架下，逐步成长为全球开发者共同参与的项目。

## 生产采用与生态

最能说明 HAMi 价值的，是真实的生产数据。今天，HAMi 已被数百家组织采用，覆盖 NVIDIA、华为昇腾、寒武纪、海光 DCU、摩尔线程、燧原、昆仑芯、MetaX、AWS Neuron、Vastai 等十余种加速器（见[支持设备列表](https://project-hami.io/docs/userguide/device-supported)），是目前云原生 GPU 虚拟化领域覆盖硬件最广的开源方案之一。

在 [CNCF 案例研究](https://project-hami.io/case-studies) 中，可以读到一批代表性用户的落地实践，横跨金融、汽车、出行、物流、教育与云服务等多个行业：

- **招商银行**：将昆仑芯、昇腾、NVIDIA 等多类加速器统一到一个调度平台，硬件资源池化率达 **100%**，跨机调度概率下降 **30%**，并将拓扑感知调度等增强能力回馈给了社区。
- **SNOW Corp.**（NAVER，韩国）：用 HAMi 编排 1000+ 张 A100，服务全球 2 亿 + 用户，在 700% 流量峰值下 GPU 数量减半，估算节省约 **1740 万美元**，MTTR 下降 91%。
- **蔚来汽车（NIO）**：面向自动驾驶工作负载，CI 流水线 GPU 利用率提升约 **10 倍**，仿真 GPU 时间减少约 30%。
- **贝壳找房（KE Holdings）**：平台 GPU 利用率提升约 **3 倍**（从 13% 提升到 37%）。
- **DaoCloud**：vGPU 落地后平均 GPU 利用率超过 **80%**，GPU 运营成本下降约 50%。
- **顺丰科技**：构建异构虚拟化池，生产和测试集群 GPU 节省最高 **57%**。
- **PREP EDU**：用 HAMi 优化了 **90%** 的 GPU 基础设施。

在调度生态上，HAMi-core 已经与 Kubernetes 默认调度器、[Volcano](https://github.com/volcano-sh/volcano/blob/master/docs/user-guide/how_to_use_gpu_sharing.md)、[Kueue](https://github.com/kubernetes-sigs/kueue)、[Koordinator](https://koordinator.sh/docs/user-manuals/device-scheduling-gpu-share-with-hami) 以及 [NVIDIA KAI Scheduler](https://project-hami.io/zh/blog/hami-core-adopted-by-nvidia-kai-scheduler) 完成集成。其中 2026 年 6 月，NVIDIA KAI Scheduler 正式采纳 HAMi-core 作为其 GPU 显存硬隔离的内置能力，这是对 HAMi 技术方向的有力背书。

## 在全球舞台上的中文开源力量

过去两年里，HAMi 的两位核心维护者先后在日本、香港、法国、伦敦、荷兰等地的 KubeCon + CloudNativeCon、KubeDay 及相关技术峰会上，与全球开发者、用户企业和生态伙伴交流 GPU 共享、异构算力调度、AI 工作负载治理和 Kubernetes 加速器管理等议题；也持续参与国内开源与 AI Infra 社区建设，出现在 COSCon 中国开源年会、GDPS 全球开发者先锋大会、vLLM 推理优化 Meetup 上海站、蚂蚁开源技术沙龙，以及 HAMi Meetup 上海站、北京站等活动中。

![张潇在 2024 年 KubeDay Japan](/images/blog/hami-cncf-incubating/zhangxiao-kubeday-japan-2024.jpg)

张潇在 2024 年 KubeDay Japan

![张潇和李孟轩在 2024 年 KubeCon 香港](/images/blog/hami-cncf-incubating/zhangxiao-limengxuan-kubecon-hk-2024.jpg)

张潇和李孟轩在 2024 年 KubeCon 香港

![张潇和李孟轩在 2025 年 KubeCon 伦敦](/images/blog/hami-cncf-incubating/zhangxiao-limengxuan-kubecon-london-2025.jpg)

张潇和李孟轩在 2025 年 KubeCon 伦敦

![张潇和李孟轩在 2025 年 KubeCon 法国](/images/blog/hami-cncf-incubating/zhangxiao-limengxuan-kubecon-france-2025.jpg)

张潇和李孟轩在 2025 年 KubeCon 法国

![李孟轩在 2025 年 KubeCon 香港与 CNCF CTO 交流](/images/blog/hami-cncf-incubating/limengxuan-kubecon-hk-2025-cncf-cto.png)

李孟轩在 2025 年 KubeCon 香港与 CNCF CTO 交流

2026 年，这些长期积累迎来了高光时刻。在 KubeCon + CloudNativeCon Europe 2026（阿姆斯特丹）上，HAMi 登上主论坛 Keynote。李孟轩与社区伙伴 Reza Jelveh 在一块 GPU 上并发运行 YOLO 推理服务与 Qwen3-8B 大模型推理，把 GPU 分解成可共享的"算力 + 显存"单元；张潇围绕 K8s issue #52757（多容器如何共享一张 GPU）做了专题分享，李孟轩另有一场"动态、智能、稳定的 GPU 共享中间件"技术演讲。HAMi 也成为登上 KubeCon EU 主论坛 Keynote 的中国开源项目之一。

![李孟轩和 Reza Jelveh 在 KubeCon EU Keynote Live Demo（13000+ 参会人现场）](/images/blog/hami-cncf-incubating/kubecon-eu-keynote-live-demo.png)

![HAMi 核心维护团队与 CNCF TOC、Red Hat、vLLM 社区分享交流 GPU Sharing](/images/blog/hami-cncf-incubating/kubecon-india-2026-team.jpg)

仅仅两个月后，在 [KubeCon + CloudNativeCon India 2026](https://project-hami.io/zh/blog/kubecon-india-2026-recap)（孟买）上，HAMi 再次亮相 Keynote 演示，并在 Project Pavilion 展台跑起了生产级大模型服务与动态 GPU 共享。

![HAMi 社区贡献者在 KubeCon India Project Pavilion 展台](/images/blog/hami-cncf-incubating/kubecon-india-2026-pavilion.png)

## 感谢一路同行的社区

HAMi 能走到今天，绝不是任何一个人或一家公司的功劳。这一里程碑离不开全球贡献者与社区的共建：[密瓜智能（Dynamia）](https://www.dynamia.ai/)、[DaoCloud](https://www.daocloud.io/)、[第四范式](https://www.4paradigm.com/)、[NVIDIA](https://www.nvidia.com/)、[华为云](https://www.huawei.com/)，以及来自全球的个人开发者、用户企业和生态伙伴，都作出了不可替代的贡献。

我们也特别感谢每一位提交代码、报告 issue、撰写文档、组织 Meetup、在 KubeCon 展台讲解、在社区群里答疑的贡献者。开源项目的生命力，归根结底来自人。

## 一起加入 HAMi 社区

进入孵化阶段，是 HAMi 社区的新起点。无论你是开发者、运维工程师、AI 基础设施负责人，还是正在评估异构算力方案的同学，我们都欢迎你加入：

- **关注 HAMi 公众号**，第一时间获取版本发布、技术解读与社区活动资讯。
- **加入 HAMi 微信交流群**，与维护者和来自各行业的用户直接交流使用经验、排障与最佳实践。入群方式见[社区页面](https://project-hami.io/community)。
- **参与社区例会与线下 Meetup**。HAMi 社区定期举办公开的技术分享与城市 Meetup，过去一年已在北京、上海、深圳等地举办多场线下活动；进入孵化阶段后，我们将带来更多**线上分享与线下聚会**：

  - 7 月 16 日 vLLM 上海站
  - [7 月 17 日至 7 月 20 日 WAIC](https://www.worldaic.com.cn)
  - [7 月 28 日至 7 月 30 日 KubeCon Japan](https://events.linuxfoundation.org/kubecon-cloudnativecon-japan/program/schedule/)
  - [9 月 7 日至 9 月 9 日 KubeCon China](https://www.lfopensource.cn/kubecon-cloudnativecon-openinfra-summit-pytorch-conference-china/program/schedule/)

  无论你身在何处，都能找到参与的方式。

- **在 [GitHub](https://github.com/Project-HAMi/HAMi) 贡献代码或反馈问题**，从文档、测试到核心功能，每一份贡献都算数。

如果你正在生产环境使用 HAMi，也欢迎把你的实践经验分享给社区。你的真实案例，是帮助 HAMi 持续演进、也帮助更多团队少走弯路的宝贵财富。

HAMi 的下一程，期待有你同行。
