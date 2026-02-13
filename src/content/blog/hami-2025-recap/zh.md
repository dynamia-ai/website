---
title: 2025 年 HAMi 年度回顾 | 从 GPU 调度器到云原生 AI 基础设施的中流砥柱
coverTitle: 2025 年 HAMi 年度回顾 | 从 GPU 调度器到云原生 AI 基础设施的中流砥柱
date: '2026-02-12'
excerpt: >-
  回顾过去一年，HAMi 项目如何从单一 GPU 虚拟化方案成长为支持 11+ 厂商异构 AI 加速器的统一平台。
author: Dynamia AI Team
tags:
  - HAMi
  - GPU Sharing
  - vGPU
  - Kubernetes
  - Heterogeneous Computing
  - Year in Review
  - CNCF
category: Year in Review
coverImage: /images/blog/hami-2025-recap/cover-zh.png
language: zh
slug: hami-2025-recap
---

![2025 年 HAMi 从 GPU 调度器到云原生 AI 基础设施的中流砥柱](/images/blog/hami-2025-recap/hami-2025.png)

> 回顾过去一年，HAMi 项目如何从单一 GPU 虚拟化方案成长为支持 11+ 厂商异构 AI 加速器的统一平台。

## 成长的一年：从 CNCF Sandbox 到生产级验证

如果说 2024 年 8 月 HAMi 进入[CNCF 沙箱](https://www.cncf.io/projects/hami/)标志着项目获得了云原生社区的认可，那么 2025 年就是 HAMi 用实际成果证明自己价值的一年。

这一年，HAMi 不仅是一个 GPU 虚拟化调度器，更发展成为完整的**异构 AI 计算虚拟化中间件**，支持从 NVIDIA GPU 到华为昇腾、寒武纪 MLU、沐曦、天数智芯、燧原科技等 11+ 种 AI 加速器的统一管理与调度。

更重要的是，HAMi 在生产环境中得到了大规模验证——贝壳找房、DaoCloud、顺丰科技、Prep EDU、SNOW 等多家企业基于 HAMi 构建的 AI 平台稳定运行，处理着千万级的日常业务请求，企业用户数百家。

从数据来看，HAMi 社区在 2025 年保持了强劲的发展势头：97 位贡献者参与开发，代码提交 433 次，发布从 **v2.5.0** 到 **v2.8.0** 多个主要版本。

更值得注意的是，社区活跃度在下半年显著提升，7 月、11 月、12 月和 2026 年 1 月分别达到 45 次、44 次、54 次和 56 次提交。

这种活跃度的提升主要得益于重要版本的开发发布以及社区贡献者队伍的壮大。

## 技术演进：从单一 GPU 到异构统一

2025 年，HAMi 在技术层面最显著的特征就是从单一 NVIDIA GPU 支持扩展到多厂商异构 AI 加速器的统一管理。

这一转变不仅拓宽了 HAMi 的适用场景，更重要的是为中国 AI 基础设施的自主可控提供了切实可行的技术路径。

在多厂商支持方面，HAMi 在 2025 年实现了一系列重要功能开发，将异构 AI 加速器支持推向新高度。

![HAMi 支持的异构 GPU 生态全景图](/images/blog/hami-2025-recap/ecosystem.png)

华为昇腾 910C 设备的 SuperPod 模块对分配机制得以实现，使得华为昇腾设备在 SuperPod 环境下能够精确分配资源。燧原科技的 GCU 设备插件完成了开发，实现了对燧原 GCU 的完整支持，为燧原 AI 加速器用户提供企业级虚拟化方案。HAMi 还增加了对 XPU 设备的基于拓扑调度与复用（vXPU）能力，提升了多任务共享场景下的资源利用效率。

沐曦 MetaX sGPU 应用类支持得以实现，支持应用级别的 GPU 隔离，为推理场景提供了更灵活的资源管理方式，支持三种 QoS 模式（BestEffort、FixedShare、BurstShare）和基于 MetaXlink 的拓扑感知调度，WebUI 也实现了异构指标的可视化展示。昆仑芯 XPU 设备完成了 vGPU 模式支持，使得国产 AI 芯片用户能够享受与 NVIDIA GPU 同等的虚拟化体验，HAMi 在 v2.8 中优化了 P800 芯片上的 vXPU 特性并增强了调度失败事件输出。

在海光 DCU 场景中，HAMi 社区与清程极智达成了深度合作。清程极智的 Bagualu 智能软件栈已深度集成 HAMi 的 vGPU 虚拟化调度系统，依托对海光等国产芯片的深度适配能力，实现了多架构算力池的统一管理，有效打破了"硬件割裂导致的调度壁垒"。这一合作解决了设备 ID 唯一性问题，确保了指标与调度的一致性，为企业级大模型应用提供了"调度 + 构建"一体化解决方案。

华为昇腾 vNPU 支持方面，HAMi 社区的 ascend-device-plugin 项目现已支持 **vNPU（虚拟 NPU）特性**，支持华为昇腾 910 系列芯片的虚拟切分，实现了与 Volcano 调度器的正式打通（Volcano v1.14.0 版本发布），支持 Ascend 310 和 910 系列异构集群的 vNPU 调度，通过内存虚拟化实现自动对齐，为华为昇腾芯片用户提供与 NVIDIA GPU 同等的虚拟化调度体验。

HAMi 社区在官网维护了[完整的设备支持列表](https://project-hami.io/docs/userguide/Device-supported)，包括 NVIDIA GPU、华为昇腾、沐曦、天数智芯、燧原、昆仑芯、海光、寒武纪、AMD、AWS Neuron、摩尔线程等 11+ 种 AI 加速器的统一管理与调度。

这些进展使得 HAMi 形成了业界最广泛的异构 AI 加速器支持，不绑定单一硬件供应商，避免了供应商锁定，为中国 AI 基础设施的自主可控提供了切实可行的技术方案。

### 生产级可靠性

生产环境的可靠性在 2025 年得到了显著增强。为了避免单点故障，HAMi 实现了基于 leader-election 的高可用架构，支持 scheduler 的 leader-follower 模式，确保调度器在故障时能够自动切换，保障集群的持续运行能力。

资源配额检查机制被加入 webhook，有效防止了超额申请资源的问题，从准入阶段即对不合理的资源请求进行拦截，避免调度压力和资源浪费。

针对生产环境中可能出现的 DoS 攻击，HAMi 在 scheduler 路由中增加了 io.LimitReader 防护，解决了长期悬而未决的问题，提升了系统安全性。

为了提升运维效率，HAMi 实现了调度原因感知功能。当 Pod 调度失败时，系统会提供详细的失败原因和标准化错误码（如 NodeInsufficientDevice、CardTypeMismatch、CardInsufficientMemory 等），并采用两级日志系统（v4 级节点摘要、v5 级设备详情），帮助用户快速定位调度问题的根本原因，显著降低了故障排查难度。

HAMi 还引入了容器设备接口（CDI）模式支持，通过 `deviceListStrategy` 配置项提供 "envvar"（环境变量）和 "cdi-annotations"（CDI 注解）两种设备暴露策略。CDI 模式符合 Kubernetes 容器设备接口标准，提供了更规范、更可移植的设备管理方式，为与 Kubernetes 生态的深度集成奠定了基础。

### 监控与可观测性

监控与可观测性是运维效率的关键，HAMi 在这方面也投入了大量开发资源。

HAMi 分别为 scheduler 和 device-plugin 新增了 ServiceMonitor 支持，便于接入 Prometheus 监控生态，实现了与主流监控系统的标准化对接。

设备类型标签被加入监控指标，这使得多厂商异构集群的监控分析成为可能，运维人员可以按设备类型进行资源使用分析。

版本信息指标`hami_build_info`被实现，方便了运维管理，让版本信息一目了然。

当节点被删除时，HAMi 确保相关监控数据能够被自动清理，避免内存泄漏，保持监控系统的长期稳定运行。

针对监控指标可能出现的基数爆炸问题，HAMi 对 Device\_memory\_desc\_of\_container 指标进行了优化，防止因标签组合过多导致的监控系统负载过高。

### 性能优化与开发者体验

性能优化方面，HAMi 将节点锁从全局锁优化为每个节点的细粒度锁，显著提升了大规模集群下的并发性能，减少了锁竞争等待时间。

空指针检查在多个关键路径中被加入，防止 panic 发生，提升了系统稳定性。

开发者体验改进也是 2025 年的重要主题。HAMi 在 Helm Chart 中新增了 DRA（Dynamic Resource Allocation）安装选项，支持 Kubernetes 动态资源分配标准，简化了部署流程。

Mock 设备插件被集成，解决了设备内存资源名（如 `nvidia.com/gpumem`、`nvidia.com/gpucores`）无法上报到 Node 的 `capacity` 和 `allocatable` 字段的问题。Mock device plugin 通过模拟设备插件的方式，使得 Kubernetes 调度器能够正确识别和调度使用这些扩展资源的 Pod，同时支持 MemoryFactor 配置，为开发和测试环境提供了完整的设备模拟能力。

证书文件变更的监控和热加载功能被支持，无需重启服务即可应用新的证书配置，提升了运维灵活性。

HAMi 引入了 staticcheck 等代码质量检查工具，持续改进代码质量，在 CI/CD 流程中自动进行代码静态分析，提前发现潜在问题。

### 生态建设项目

HAMi 项目在 2025 年逐渐发展成为一个完整的生态系统，多个周边项目协同工作，为用户提供全方位的异构计算虚拟化解决方案。

**HAMi-DRA**（Dynamic Resource Allocation）实现了 Kubernetes 原生的 GPU 资源动态分配标准，支持 v1.34+ 版本。作为项目的重要组成部分，HAMi-DRA 在 2025 年持续迭代，已支持 NVIDIA GPU。通过 DRA 参数驱动分配机制，HAMi 能够更灵活地管理 GPU 资源，提升调度效率。

**volcano-vgpu-device-plugin** 项目将 HAMi 的 vGPU 能力集成到 Volcano 批量调度器中，为 AI 训练、大数据处理等批处理场景提供 GPU 虚拟化支持。该项目在 2025 年持续更新，确保与 Volcano 调度器的兼容性。

**ascend-device-plugin** 在 2025 年实现了与 Volcano 调度器的正式打通，支持 **volcano+vNPU 模式**。这一功能在 Volcano v1.14.0 版本中正式发布，支持 Ascend 310 和 910 系列（包括 910A、910B2、910B3、310P 等异构集群）的 vNPU 调度，通过内存虚拟化实现自动对齐，为华为昇腾芯片用户提供与 NVIDIA GPU 同等的虚拟化调度体验。

**HAMi-WebUI** 为 HAMi 提供了可视化管理界面，让用户能够通过 Web 页面查看 GPU 资源使用情况、监控 Pod 运行状态、管理资源分配策略。该项目在 2025 年进行了多次功能迭代，提升了用户体验。

**mock-device-plugin** 解决了设备内存资源名（如 `nvidia.com/gpumem`、`nvidia.com/gpucores`）无法上报到 Node 的 `capacity` 和 `allocatable` 字段的问题。Mock device plugin 通过模拟设备插件的方式，使得 Kubernetes 调度器能够正确识别和调度使用这些扩展资源的 Pod，同时支持 MemoryFactor 配置，为开发和测试环境提供了完整的设备模拟能力。

这些生态项目协同工作，共同构成了 HAMi 的完整技术版图，为云原生 AI 基础设施提供了端到端的解决方案。

### 上游生态集成

HAMi 在 2025 年积极与云原生 AI 生态的上游开源项目进行深度集成，从单一的虚拟化方案演进为完整的异构计算调度平台。

**Kubernetes 标准集成方面**，HAMi 实现了 Kubernetes DRA（Dynamic Resource Allocation）标准的 Helm Chart 安装选项，支持 Kubernetes v1.34+ 原生动态资源分配机制，与 Kubernetes 生态深度对齐。

**调度器生态集成方面**，HAMi 积极与主流调度器和推理框架深度集成，为不同场景提供最优调度方案：

* **Volcano 调度器**方面，HAMi 除了持续增强与 Volcano 调度器的兼容性外，HAMi 在 [Volcano v1.14.0](https://github.com/volcano-sh/volcano/releases/tag/v1.14.0) 版本中实现了与 ascend-device-plugin 的正式打通，支持 **volcano+vNPU 模式**，为华为昇腾 310 和 910 系列异构集群的 vNPU 调度提供了完整的调度能力。

* **Kueue 批调度系统**方面，HAMi 积极适配 Kueue 等批调度系统，为大规模批处理任务提供统一的资源管理和调度能力。

* **Xinference 推理框架**方面，HAMi 通过 Helm Chart 实现了原生支持，Supervisor/Worker 能够传入 `nvidia.com/gpucores`、`nvidia.com/gpumem-percentage` 等 GPU 资源参数，为多模型推理场景提供安全共享 GPU、提升利用率的解决方案，支持多种 QoS 模式（BestEffort、FixedShare、BurstShare）。

* **vLLM 大语言模型框架**方面，HAMi 被 vLLM Production Stack 原生接纳，修复了 vLLM（大语言模型）虚拟化框架的兼容性问题，确保在 vLLM 场景下 GPU 资源的合理分配与隔离，提升了 LLM 推理和训练任务的资源利用率。该 PR 由社区贡献者 Andrés Doncel 来自西班牙 Empathy.co 电商搜索与商品发现平台提供商主导，源于真实的业务需求。

* **Koordinator 调度器**方面，HAMi 被 Koordinator 纳入官方 GPU 共享方案，作为其节点侧 GPU 隔离能力的实现基础，形成从调度到运行时再到监控的端到端 GPU Sharing 方案。

**可观测性集成方面**，HAMi 完善了与 Prometheus 生态的集成，新增 ServiceMonitor 支持和 `hami_build_info` 版本指标，便于接入 Grafana 等可视化监控平台，提升了运维效率。

这些上游生态集成工作使得 HAMi 不仅是一个 GPU 虚拟化调度器，更成为云原生 AI 基础设施中的关键调度组件，与 Kubernetes、Volcano、Kueue、Koordinator 等项目协同工作，为用户提供完整的异构计算资源管理方案。

## 社区繁荣：开放治理与多元贡献

HAMi 社区在 2025 年保持了活跃的开发节奏和开放协作氛围。

从贡献者数据来看，[@archlitchi](https://github.com/archlitchi) 以 95 次提交位居榜首，主要贡献集中在版本发布和 Helm Chart 维护以及众多核心功能开发与迭代。

[@Shouren](https://github.com/Shouren) 和 [@FouoF](https://github.com/FouoF) 分别以 26 次和 21 次提交位列第二和第三，他们的主要贡献集中在核心调度逻辑优化和设备管理。

HAMi 维护者团队采用开放治理模式。项目最初由密瓜智能与 NVIDIA 工程师共同推动，完成了关键架构设计与早期能力建设。随着生态不断扩大，第四范式等企业开发者加入维护者行列，逐步形成多核心协作的治理体系。多方参与、持续共建，使 HAMi 在保持技术连续性的同时，也具备了更强的生态包容性与可持续性。

社区通过[GitHub](https://github.com/Project-HAMi/HAMi)、[Slack](https://cloud-native.slack.com/archives/C07T10BU4R2)、[Discord](https://discord.gg/Amhy7XmbNq)、[官方网站](http://project-hami.io/)等渠道保持开放协作。

2025 年底，HAMi Meetup 在上海和北京站相继成功举行，活动主题为"不卷算力卷效率"，吸引了众多开发者和用户参与。

* **上海站**活动汇聚了 CNCF、密瓜智能、蔚来、沐曦股份、DaoCloud、星环科技等企业的实战派专家。星环科技分享了 LLMOps 平台在寒武纪、海光等国产加速器上的适配实践，展示了如何借助 HAMi 统一管理多型号、多架构的国产 GPU，并结合 DRA 构建可扩展的算力抽象，解决了设备 ID 唯一性、exporter 指标暴露等实际问题。
* **北京站**活动中，来自海光信息、贝壳、第四范式、睿思智联等企业的工程师分享了 DCU 软件虚拟化、vGPU 推理集群实践（GPU 利用率提升约 3 倍）、HAMi-Core x DRA、国产算力适配等实战经验，为社区提供了宝贵的技术参考。

在成员角色方面，社区治理进一步完善：

* @Shouren 晋升为 HAMi Maintainer，在调度健壮性、设备管理、发布流程、安全更新等方面贡献显著，更是 HAMi-DRA 的核心开发者。

* @FouoF 晋升为 HAMi Approver，在调度器稳定性、HAMi-DRA、测试完善与 Charts 改进等方面持续投入，已成为项目的重要审查者。

* [@DSFans2014](https://github.com/DSFans2014) 晋升为 HAMi Reviewer，在 Ascend 设备与异构场景支持方面贡献显著，积极参与代码审查与问题修复。

* [@Shenhan11](https://github.com/shenhan11) 晋升为 HAMi Web UI Reviewer，在多个功能模块的开发与测试中持续投入，为项目质量提升提供保障。

* [@windsonsea](https://github.com/windsonsea) 晋升成为 HAMi Website Approver，长期参与 HAMi 官方网站的架构设计与功能开发，持续完善内容结构与发布流程，为项目对外形象与信息透明度建设提供了重要支撑。

* [@chaunceyjiang](https://github.com/chaunceyjiang) 晋升成为 HAMi core Reviewer，从早期核心功能开发到代码评审与质量把关，持续推动 HAMi 在 GPU 资源管理与稳定性方面的成熟与完善。

HAMi 在 2025 年保持了规律的发布节奏，从 v2.5 系列到 v2.8.0，每个版本都经过充分的测试验证，确保生产级稳定性。

## 生产验证：CNCF 案例研究

2025 年，多家企业分享了他们使用 HAMi 的真实经验，这些 CNCF 官方案例研究为 HAMi 的生产级价值提供了最有力的证明。

* [贝壳找房](https://www.cncf.io/case-studies/ke-holdings-inc/)的 AI Platform 实现了 GPU 利用率从 13% 到 37% 的近 3 倍提升，超过 10,000 个 Pod 同时运行，每日处理千万级业务请求。

* [DaoCloud](https://www.cncf.io/case-studies/daocloud/)在超过 10 个数据中心部署了 10,000+ 张 GPU 卡，实现 GPU 平均利用率超过 80%，运营成本降低 20-30%。

* [顺丰科技](https://www.cncf.io/case-studies/sf-technology/)基于 HAMi 构建 EffectiveGPU 解决方案，通过 GPU 虚拟化和资源优化技术，实现了 57% 的 GPU 资源节省率，大幅降低硬件采购成本和运营开销。

* [Prep EDU](https://www.cncf.io/case-studies/prep-edu/) 使用 HAMi 高效管理 90% 的 GPU 基础设施，因内存冲突导致的应用程序崩溃已被消除，解决了团队 50% 的 GPU 资源管理先前痛点。

## 经验与展望

2025 年 HAMi 的成功可以归结为几个关键因素：

* 生产级可靠性设计是其中最重要的，Leader 选举、资源配额检查、监控数据清理等机制在实际生产环境中经受了考验，贝壳找房 10,000+ Pod 零停机运行就是最好的证明。
* 监控与可观测性优先是另一个成功要素，ServiceMonitor 集成、设备类型标签、版本指标等改进降低了运维复杂度，提升了问题排查效率。
* 开放生态策略使得 HAMi 支持 11+ 种 AI 加速器，不绑定单一硬件供应商，避免了供应商锁定。
* 社区驱动的开发模式通过开放的 PR 讨论、代码审查、Slack/Discord 沟通，2025 年底[上海](https://project-hami.io/zh/blog/hami-meetup-shanghai-2025)、[北京](https://project-hami.io/zh/blog/hami-meetup-beijing-2025)的 『不卷算力卷效率』系列 HAMi Meetup 相继成功举行，促进了社区交流。

当然，HAMi 也面临着快速发展中的常见挑战。文档与示例方面，新用户在配置和调试时面临挑战，复杂场景的配置示例不够充分，故障排查文档需要更加结构化，多语言文档需要持续同步更新。测试覆盖率方面，虽然 HAMi 已引入 E2E 测试和 CI 流程，但多厂商硬件的测试环境搭建复杂，集成测试案例需要更全面，性能回归测试机制需要加强。响应时间优化方面，从 GitHub Issues 分析显示，部分 Issues 的响应时间较长，新贡献者的 PR 需要更快的反馈，需要更多的维护者参与 Review。

展望 2026 年，HAMi 社区将围绕以下几个战略方向持续演进：

* **核心特性增强**方面，HAMi 将继续完善 MPS/MPS 集成（MLU PodGroup 支持）、资源抢占、PodGroup 等调度增强特性，提供更强大的调度能力。
* **多厂商异构支持**将深化对 AMD Mi300X、寒武纪 5x0 系列、燧原 DRX 等国产 AI 芯片的适配，同时保持对 NVIDIA、华为昇腾等主流芯片的全面支持。
* **DRA 标准扩展**方面，HAMi 将实现完整的 DRA（Dynamic Resource Allocation）标准适配，与 Kubernetes 资源分配生态深度集成，提供更灵活的 GPU 资源管理方式。
* **灵活切分**技术上，支持 Dynamic MIG、拓扑感知调度等高级 GPU 虚拟化特性，让用户能够根据实际需求动态调整 GPU 资源分配策略。
* **云原生集成**将推进与 Volcano、Kueue 等调度器的深度集成，同时支持 CDI、多云部署等企业级特性，适应更复杂的云环境。
* **可观测性**上，HAMi 将增强监控指标、Grafana 仪表盘、分布式追踪等能力，提供更完善的运维工具链。

HAMi 欢迎更多贡献者参与，适合新贡献者的任务包括文档改进和翻译、示例代码编写、Bug 修复和测试、用户支持和 Issues 分类。

HAMi 作为 CNCF 沙箱项目，将继续秉持开放、协作、创新的精神，为云原生 AI 基础设施提供最强大的异构计算虚拟化解决方案。

感谢所有在 2025-2026 年度做出贡献的组织和个人，特别感谢 CNCF 社区的支持和指导，以及 Kubernetes、Volcano 等上流社区的协作。

## 迈向 CNCF Incubation：生态共识正在形成

2025 年，HAMi 正式启动向 CNCF Incubating 阶段推进的进程。相关讨论已在 CNCF TOC 中展开：

👉 <https://github.com/cncf/toc/issues/1775>

从 Sandbox 到 Incubating，并不仅仅是功能完善，更是生态成熟度、治理透明度、社区活跃度与生产验证能力的综合体现。

过去一年中，HAMi 在全球范围内的分享、实践与技术影响力不断扩大，也为这一阶段性目标奠定了基础。

## 2025：全球社区对 HAMi 的技术分享与认可

### 国际技术大会与社区分享

HAMi 在 2025 年持续参与全球云原生与 AI 基础设施相关会议。

* **KubeCon Europe 2025（London）**

  * [Unlocking How To Efficiently, Flexibly, Manage and Schedule Seven AI Chips in Kubernetes](https://kccnceu2025.sched.com/event/1txAf/unlocking-how-to-efficiently-flexibly-manage-and-schedule-seven-ai-chips-in-kubernetes-xiao-zhang-daocloud-mengxuan-li-the-4th-paradigm-ltd)
    介绍如何在 Kubernetes 中统一调度与虚拟化七种异构 AI 加速器，实现高效、拓扑感知的算力管理与批任务协同调度。

* **KubeCon China 2025（Hong Kong）**

  * [Smart GPU Management: Dynamic Pooling, Sharing, and Scheduling for AI Workloads](https://kccncchn2025.sched.com/event/1x5iF/smart-gpu-management-dynamic-pooling-sharing-and-scheduling-for-ai-workloads-in-kubernetes-wei-chen-china-unicom-cloud-data-mengxuan-li-dynamia)

  * [Project Lightning Talk: K8s issue #52757: Sharing GPUs Among Multiple Containers](https://kccncchn2025.sched.com/event/1xjzB/project-lightning-talk-k8s-issue-#52757-sharing-gpus-among-multiple-containers-xiao-zhang-maintainer)
    展示了 HAMi 与 Volcano 集成、DRA 适配、非 NVIDIA 芯片支持等技术方向。

* **OSIM AI Paris 2025**
  HAMi 入选 [OSIM](https://mp.weixin.qq.com/s/7Jzplm7ur325mNqIYk3aLQ) AI Spotlight 重点开源项目之一，在全球 AI 开源技术交流中分享异构算力调度实践。

* **AI\_dev (Linux Foundation)**
  分享 GPU 切分与软件定义隔离在云原生环境中的工程实践。会议回放可在 [YouTube 视频](https://youtu.be/pjHA0JfPNfw?si=djB-R71tswDn9JAq\&t=875) 查看。

* **CNCF Cloud Native Hanoi Meetup**
  越南电信实践案例，展示 GPU 管理与可观测能力。更多详情可参阅 [CNCF Cloud Native Hanoi Meetup](https://community.cncf.io/events/details/cncf-cloud-native-hanoi-presents-may-meetup-gpu-and-ebpf-on-kubernetes/) 以及 [YouTube 视频](https://youtu.be/UtPv8P7v0YU?si=UH1uwe07IV4bT5kL)。

* **vCluster 技术研讨会**
  被专家推荐为"通过代理层拦截 CUDA API 实现细粒度治理"的创新方案。会议回放可在 [YouTube 视频](https://youtu.be/eBbjSfxwL30?si=PcPBonbQJfN7maeh\&t=1811) 查看。

### 国内技术生态影响力

2025 年，HAMi 深度参与国内 AI 与开源技术生态：

* [COSCon'25 中国开源年会](https://mp.weixin.qq.com/s/rU66wV7JB8w5hnUl5zC0xQ)

* [GDPS 全球开发者先锋大会](https://mp.weixin.qq.com/s/--AjMUpPxnO3XlojlC_I-w)

* [KCD 帧州站 x OpenInfra Days China](https://mp.weixin.qq.com/s/9mi57Ue_uiRMDP4mx8kHkA)

* [vLLM 推理优化 Meetup 上海站](https://mp.weixin.qq.com/s/fIoDw95bMtFug9JZi_MS6Q)

* [蚂蚁开源技术沙龙](https://mp.weixin.qq.com/s/GBoB_VEgmw6_bGX4WZS_Gg)

* 多场开源社与企业技术交流活动

这些分享覆盖 GPU 虚拟化、vLLM 分布式推理、国产芯片适配、Serverless 推理系统等主题，推动异构算力治理理念的传播。

## 企业级落地与白皮书发布

顺丰科技发布《[EffectiveGPU 技术白皮书](https://mp.weixin.qq.com/s/zZKJfJJOzBhpcq1FMttqsA)》，其架构深度集成 HAMi 在异构算力虚拟化与统一调度领域的能力。

这一实践标志着 HAMi 不仅是开源项目，更已成为企业生产环境中的关键组件。

在 2025 年的生态拓展过程中，HAMi 也与多家国产算力与数据基础设施厂商展开了深入协作。包括海光（Hygon）在内的国产 GPU / CPU 生态伙伴，在异构算力调度与资源治理方向与 HAMi 进行了技术对接与适配验证，共同推动国产算力在云原生环境中的标准化接入与统一调度。同时，星环科技（Transwarp）等大数据与 AI 平台厂商，也围绕多租户算力管理与推理资源共享等场景展开交流与合作探索。

我们欢迎更多国产芯片厂商与平台伙伴加入 HAMi 生态，共同推动中国 AI 基础设施在开放标准下的协同创新。

## 2026: KubeCon Europe · Project Pavilion

HAMi 已确认参加 [**KubeCon + CloudNativeCon Europe 2026**](https://events.linuxfoundation.org/kubecon-cloudnativecon-europe/)。

Project Pavilion · Booth P-13B

📅 Mar 24 · 15:10–19:00

📅 Mar 26 · 12:30–14:00

我们将在现场分享：

* GPU 虚拟化与动态切分实践

* DRA 与 Kubernetes 深度集成进展

欢迎全球开发者与我们现场交流。

![欢迎前来 KubeCon EU 2026 HAMi 展台](/images/blog/hami-2025-recap/kubecon-eu-2026.png)

**相关资源**：

* HAMi GitHub: <https://github.com/Project-HAMi/HAMi>

* HAMi 文档：<http://project-hami.io/docs/>

* CNCF 项目页：<https://www.cncf.io/projects/hami/>

* Slack 社区：<https://cloud-native.slack.com/archives/C07T10BU4R2>

* Discord: <https://discord.gg/Amhy7XmbNq>

**报告撰写：** HAMi 社区 **发布日期：** 2026 年 2 月 12 日

*本文档代表 HAMi 社区的年度总结，反映 2025 年 1 月 1 日至 2026 年 2 月 12 日期间的项目进展。所有数据均来自 Git 提交记录、GitHub Issues/PR、CNCF 案例研究等公开渠道。*
