---
title: "HAMi 晋升 CNCF Incubating：密瓜智能站上 AI 算力效率的关键赛道"
linktitle: "密瓜智能站上 AI 算力效率的关键赛道"
date: '2026-07-07'
excerpt: >-
  2026 年 7 月 2 日，由密瓜智能发起并长期主导的开源项目 HAMi 正式晋升为 CNCF Incubating 项目。
  作为目前行业内唯一专注于异构 GPU 资源虚拟化与高效调度、并进入 CNCF Incubating 阶段的开源项目，
  HAMi 的这一里程碑释放出一个清晰信号：AI 基础设施的竞争，正在从“谁拥有更多算力”，走向“谁能更高效地管理算力”。
author: 密瓜智能
tags:
  - HAMi
  - CNCF
  - GPU 虚拟化
  - AI 基础设施
  - 云原生
  - 密瓜智能
category: Company News
language: zh
coverImage: /images/blog/dynamia-ai-compute-efficiency/cncf-incubating-status.png
---

2026 年 7 月 2 日，由密瓜智能（Dynamia）发起并长期主导推动的开源项目 HAMi 正式晋升为 CNCF Incubating 项目。作为目前行业内唯一专注于异构 GPU 资源虚拟化与高效调度，并进入 CNCF Incubating 阶段的开源项目，HAMi 的这一里程碑，释放出一个清晰信号：AI 基础设施的竞争，正在从“谁拥有更多算力”，走向“谁能更高效地管理算力”。

![HAMi 晋升 CNCF Incubating 项目](/images/blog/dynamia-ai-compute-efficiency/cncf-incubating-status.png)

过去两年，企业对 AI 的投入不断增加，GPU 成为最昂贵、也最紧缺的生产资源之一。但进入真实生产环境后，很多企业会发现，问题并不只在于 GPU 不够，而在于已有 GPU 很难被充分利用。

一个任务独占一张卡，一个团队长期占用一批资源，训练、推理、测试任务互相排队，不同 AI 芯片资源又分散在不同系统里。看起来买了很多算力，真正能被高效使用的部分却打了折扣。

这有点像一座城市的道路系统。修更多路很重要，但如果没有红绿灯、车道调度和交通规则，道路越多，管理反而越复杂。AI 算力也是一样。当资源越来越贵、场景越来越复杂，企业真正需要的，是一套能够把 GPU 和多种 AI 芯片资源管起来、调起来、用好的基础设施。

HAMi 要解决的，正是这个问题。

## 一、从问题出发

HAMi 的起点，可以追溯到 2021 年。

2021 年 7 月 12 日，张潇和李孟轩首次开源了这一项目的早期版本。彼时，张潇在 DaoCloud，李孟轩在第四范式，两人虽身处不同公司，却已经围绕同一个开源项目持续协作。他们很早就判断，未来 AI 基础设施的关键，不只是提供更多算力，而是让算力被更高效地使用，并在更开放的生态中持续演进。

随着 AI Infra 行业快速发展，HAMi 所代表的方向开始从工程问题变成产业机会。张潇和李孟轩意识到，异构算力管理需要一个更开放、中立、能够与上下游生态充分协作的开源内核，而不是被限制在单一厂商或单一场景里。基于这一判断，他们后来共同创立密瓜智能，希望以 HAMi 为起点，打造 AI 基础设施的开源内核，让异构算力因开源而更好用。

密瓜智能成立后，也获得了资本与产业资源的关注和支持，投资方包括陆奇、复星创富、拙朴投资、DaoCloud 道客等。公司从成立之初就围绕 GPU 虚拟化与异构算力调度展开，把 HAMi 的开源能力带入真实企业场景，转化为企业能够部署、运维和持续使用的基础设施方案。

## 二、走向全球生态

一个开源基础设施项目是否真正重要，不只看代码，也看它能否被全球社区、企业用户和产业生态共同验证。

过去几年，HAMi 持续出现在全球云原生生态的核心场景中。从法国、日本、香港、伦敦、荷兰等地的 KubeCon / KubeDay，到国内多个云原生、开源和 AI 基础设施技术大会，HAMi 的核心发起者与维护者持续围绕 GPU 虚拟化、异构算力调度和 AI 基础设施生产化进行交流。

![张潇和李孟轩在 2025 KubeCon 伦敦](/images/blog/dynamia-ai-compute-efficiency/kubecon-london-2025.jpg)

![张潇和李孟轩在 2024 KubeCon 法国](/images/blog/dynamia-ai-compute-efficiency/kubecon-france-2024.jpg)

![李孟轩在 2025 KubeCon 香港与 CNCF CTO 交流](/images/blog/dynamia-ai-compute-efficiency/kubecon-hongkong-2025.png)

2026 年，这些长期积累迎来了一个标志性时刻。在 KubeCon + CloudNativeCon Europe 2026 阿姆斯特丹现场，HAMi 登上主论坛 Keynote 舞台，向全球云原生社区展示 Kubernetes 场景下 GPU 共享与调度的实践价值。对于一个源自中国、面向全球社区建设的开源项目而言，这不仅是一次技术展示，更意味着 HAMi 所代表的 AI 算力调度方向，已经进入国际云原生生态的核心视野。

![李孟轩与 Reza Jelveh 在 KubeCon EU 主论坛 Live Demo](/images/blog/dynamia-ai-compute-efficiency/kubecon-eu-keynote-demo.png)

这也让 HAMi 成为近年来唯一一个登上 KubeCon EU 主论坛 Keynote 的中国开源项目。它所获得的关注，背后对应的是一个正在变得越来越明确的行业变化：当 AI 从实验走向生产，GPU 不再只是硬件资源，而正在成为需要被统一管理、灵活调度和持续优化的基础设施资源。

目前，HAMi 已集结来自 17 个国家的 500 余位贡献者，最终用户超过 300 家企业，覆盖云厂商、互联网、金融、汽车、物流、教育等多个行业，并已拓展至东南亚、欧洲等海外地区。

这些进展说明，HAMi 已经不只是一个技术社区里的项目，而是在真实产业场景和全球开源生态中被持续验证的基础设施能力。

## 三、进入生产现场

对企业客户来说，HAMi 的价值可以归结为一句话：让昂贵的 GPU 资源从“被占用”变成“被调度”。

在大模型训练、推理服务、多团队共用资源池的场景里，平台团队最关心的往往不是某一个技术参数，而是几个更实际的问题：GPU 利用率能不能提升，不同团队能不能公平共享资源，任务高峰期能不能减少排队，多种 AI 芯片资源能不能统一管理，方案能不能接入现有云原生环境。

这些问题，正在真实生产环境中被验证。HAMi 已经进入金融、汽车、消费科技、物流、教育科技、云服务等行业，被用于 GPU 利用率提升、异构算力池化、大模型推理流量调度、自动驾驶训练与仿真、企业 AI 平台资源治理等场景。

在金融场景中，招商银行将昆仑芯、昇腾、NVIDIA 等多类 AI 芯片资源统一纳入一个调度平台，提升资源池化和拓扑感知调度能力；在消费科技场景中，SNOW Corp. 使用 HAMi 编排 1000+ 张 A100，支撑 GenAI 业务服务全球 2 亿 + 用户，并应对 700% 的流量峰值；在自动驾驶场景中，蔚来汽车使用 HAMi 提升 CI 流水线 GPU 利用率，并减少仿真 GPU 时间。

此外，贝壳找房、DaoCloud、顺丰科技、PREP EDU 等案例也显示，HAMi 正在帮助不同类型的企业提升 GPU 利用率、降低运营成本，并优化测试与生产集群的资源效率。

这些案例说明，企业 AI 基础设施的竞争已经进入资源治理阶段。随着模型、应用和业务流量持续增长，平台团队需要的不只是更多资源，而是一套能够支撑多团队、多集群、多芯片、多负载的算力治理能力。

这也正是密瓜智能围绕 HAMi 持续投入的方向。相比只提供开源代码，公司更关注企业生产环境里的完整链路：部署、适配、稳定性、运维支持、生态兼容，以及与现有 Kubernetes 体系和 AI 工程平台的协同。

HAMi 是开放社区中的基础项目，密瓜智能则是在这一基础上，持续推动技术产品化、企业化和规模化落地的核心力量之一。密瓜智能要做的，是把 GPU 共享、异构调度和资源隔离，变成企业可采用、可交付、可持续演进的基础设施能力。

## 四、面向未来

HAMi 晋升 CNCF Incubating，无疑是一个更大市场阶段的开始。

随着 AI 应用从试点走向生产，企业会越来越重视算力效率、资源治理和多芯片生态兼容。过去，企业愿意为“买到算力”付费；未来，企业也会越来越愿意为“用好算力”付费。

这正是密瓜智能所处的机会窗口。

AI 时代不只需要更强的模型，也需要更高效的基础设施。HAMi 的晋升，证明了 GPU 虚拟化与异构算力调度已经不再是边缘问题，而是正在进入全球云原生生态认可的主流议题。

面向未来，密瓜智能将继续与 HAMi 社区、生态伙伴和企业客户共同推动这一能力在更多生产场景中落地，让企业能够以更开放、更灵活、更可持续的方式管理 AI 时代最关键的生产资源。

从 2021 年的早期判断，到 2026 年进入 CNCF Incubating，HAMi 的成长证明了一件事：真正重要的基础设施，往往不是在概念最热的时候出现，而是在真实问题中不断被需要、被验证、被采用。

密瓜智能要做的，就是继续把这条路走深。

## 相关链接

- HAMi 官网：[https://project-hami.io](https://project-hami.io/zh/)
- HAMi 社区页：[https://project-hami.io/zh/community](https://project-hami.io/zh/community)
- CNCF HAMi 项目页：[https://www.cncf.io/projects/hami/](https://www.cncf.io/projects/hami/)
- CNCF HAMi 公开案例：[https://www.cncf.io/case-studies/?\_sft\_lf-project=hami](https://www.cncf.io/case-studies/?_sft_lf-project=hami)
- CNCF TOC Incubation 投票：[https://github.com/cncf/toc/issues/1775](https://github.com/cncf/toc/issues/1775)
- HAMi GitHub：[https://github.com/Project-HAMi/HAMi](https://github.com/Project-HAMi/HAMi)
