---
title: 不卷算力卷效率｜HAMi Meetup 北京站活动全回顾
date: '2025-12-27'
excerpt: >-
  12 月 27 日，「不卷算力卷效率｜HAMi Meetup 北京站」在北京海淀区圆满落幕。近百位技术伙伴齐聚，围绕异构算力虚拟化、调度策略演进、AI
  业务效率提升等关键议题展开深入交流。
author: Dynamia
tags:
  - HAMi
  - Meetup
  - 异构算力
  - GPU 虚拟化
  - 云原生
category: Community & Events
language: zh
coverImage: /images/blog/hami-meetup-beijing-recap/hami-meetup-beijing-banner.webp
---

![HAMi Meetup 北京站](/images/blog/hami-meetup-beijing-recap/hami-meetup-beijing-banner.webp)

12 月 27 日，「不卷算力卷效率｜HAMi Meetup 北京站」在北京海淀区圆满落幕，带来了许多高质量的交流和深刻的思想碰撞，留下许多精彩的瞬间！作为 HAMi Meetup 的第二站，北京站继续聚焦国产算力在实际生产场景中的落地探索与异构调度工程实践。

近百位来自各行各业、不同背景的技术伙伴齐聚一堂，围绕异构算力虚拟化、调度策略演进、AI 业务效率提升等关键议题展开深入交流。现场讨论热烈、互动频繁，众多一线实践经验在交流中被分享与沉淀。

## 活动亮点：从"可用"走向"高效"

在国产加速器类型丰富、AI 工作负载规模不断扩大的背景下，企业面临的核心挑战已不再是"是否具备算力资源"，而是"如何通过**调度、虚拟化与平台能力**，将有限算力稳定、高效地交付给业务"。

围绕这一现实问题，本次北京站为参会者提供了多项明确的工程价值：

- **明确优先级与边界**：通过来自社区、芯片厂商与业务方的实践对比，帮助参会者识别异构算力环境中真正影响稳定性与利用率的关键工程问题。

- **形成可复用范式**：系统呈现异构加速器在 Kubernetes 体系下的接入、虚拟化与调度的工程实现路径，沉淀可持续演进的落地范式。

- **评估虚拟化投入产出**：基于规模化推理与训推场景，验证 vGPU / vDCU 等虚拟化手段对资源效率与交付能力的实际提升效果。

- **建立长期调度抽象**：结合 HAMi-Core 与 DRA 的演进方向，帮助参会者建立面向多架构、多设备的统一调度与资源抽象视角。

- **输出可执行结论**：将"算力效率"转化为可观测、可评估、可持续演进的工程指标与平台能力目标。

## 活动开场：开源与效率，正在重塑 AI 基础设施

大会开场，Linux 基金会副总裁、CNCF 亚太区中国主席 **Keith Chan** 分享近期自己的思考：AI 的发展正在从模型本身，转向对底层基础设施与资源效率的考验。GPU 成本高、资源利用率不足，已经成为全球范围内的共性问题。如何通过云原生与开源技术，构建更弹性、更可持续的 AI 基础设施，是整个行业正在共同面对的课题，也正是这个项目的核心价值所在。

## 活动核心议题回顾

### 《HAMi 新特性与能力矩阵标准化》

![HAMi 新特性与能力矩阵标准化](/images/blog/hami-meetup-beijing-recap/hami-new-features-capability-matrix.webp)

![HAMi 社区](/images/blog/hami-meetup-beijing-recap/hami-community.webp)

密瓜智能联合创始人 **李孟轩** 围绕 HAMi 在异构算力调度领域的技术演进与社区规划展开。作为 CNCF Sandbox 项目，HAMi 已在多种 AI 加速器场景中验证了其应用无侵入、强隔离、易部署等核心能力。在新特性方面，社区介绍了**CDI 支持、Mock Device Plugin 以及 Ascend Device Plugin 与 Volcano 调度器的深度适配**，进一步完善了其在真实生产集群中的可用性与可观测性。

值得关注的是，**HAMi 社区计划于 1 月推出轻量化方案 HAMi-DRA**，通过引入 Kubernetes DRA 架构，简化原有 webhook + scheduler + device-plugin 的复杂链路，实现与 Volcano、kai-scheduler 等现有调度框架的无缝集成。同时，围绕设备复用和异构算力场景中逐渐显现的能力差异，HAMi 社区在内部梳理并形成了一套能力矩阵，用于评估不同设备在显存隔离、算力控制、调度协同等方面的成熟度与支持范围，为后续生态共建和技术演进提供参考。未来，HAMi 将持续加强与芯片厂商的协同共建，推动一个开放、透明、可持续演进的异构算力调度生态。

### 《DCU 软件虚拟化从基础到实践》

![DCU 软件虚拟化](/images/blog/hami-meetup-beijing-recap/dcu-virtualization-basics.webp)

![DCU 实践](/images/blog/hami-meetup-beijing-recap/dcu-practice-implementation.webp)

来自海光信息的研发工程师 **王忠勤** 系统回顾了 DCU 在云原生环境中的软件虚拟化能力及其在 Kubernetes 体系下的完整落地实践。从 DCU 驱动层虚拟化机制出发，讲解了如何基于 hy-smi 工具实现 vDCU 在算力单元与显存维度上的精细化切分与动态调整，并结合宿主机与容器环境的使用示例，展示了 vDCU 在资源隔离与运行时一致性方面的实现方式。

在 Kubernetes 场景中，他重点解析了以 DCU-Device-Plugin 为核心的资源注册机制，以及其与 **HAMi** 调度器协同实现 vDCU 动态切分与回收的整体架构。通过标准化设备插件框架与多种运行模式支持，用户可在不预先切卡的情况下，按需申请算力与显存资源，实现更高调度精度与资源利用率。最后，分享介绍了 DCU-Exporter 组件在物理 DCU 与 vDCU 监控中的能力，为构建异构算力的可观测体系提供了基础支撑。

在规划方向上，他也分享了与 HAMi 社区的下一步联动重点：包括支持"仅声明显存、算力共享"的共享模式、**探索多容器共用同一 vDCU**，以及在资源注册、监控指标与虚拟化形态（如 SR-IOV、Pass-through）等方面持续演进。

### 《bagualu 智能计算软件栈与性能交付》

![Bagualu 智能计算](/images/blog/hami-meetup-beijing-recap/bagualu-intelligent-computing-stack.webp)

![Bagualu 性能](/images/blog/hami-meetup-beijing-recap/bagualu-performance-delivery.webp)

清程极智技术生态 VP，合伙人 **何万青** 聚焦国产大模型训练与推理场景中普遍存在的 **k 种业务 × m 种模型 × n 种 AI 加速卡**组合复杂度问题，系统介绍了清程极智在训练与推理软件栈优化及规模化交付方面的工程实践。分享指出，在多模型、多芯片并存的环境下，仅依靠单点性能优化已难以支撑业务快速落地，亟需一套贯穿编译、并行、量化与推理的完整软件体系。

围绕 Bagualu 多层 AI 训推软件栈，他重点解析了其在 AI 编译、模型量化、并行训练框架及推理引擎层面的关键加速技术，并结合分布式多云管理平台，展示了 Bagualu 在训练与推理阶段的弹性部署能力。在此基础上，通过与 HAMi GPU 虚拟化与调度能力协同，**Bagualu Turnkey 智能算力软件栈产品实现了资源层 vGPU 弹性伸缩与业务 workload 层自动扩缩容的双层弹性模型**，在不改变业务形态的前提下显著提升算力利用率与交付效率，为国产算力环境下的大模型工程化落地提供了可复用的实践路径。

### 《贝壳找房 × HAMi：vGPU 推理集群的实践经验》

![贝壳找房 × HAMi](/images/blog/hami-meetup-beijing-recap/beike-hami-partnership.webp)

![贝壳实践](/images/blog/hami-meetup-beijing-recap/beike-vgpu-inference-cluster-practice.webp)

贝壳找房算力平台开发工程师 **王妮** 的分享围绕 HAMi 在贝壳找房算力平台中的落地实践，系统介绍了其在大规模 GPU 管理场景下的架构演进思路与关键工程经验。分享**从贝壳内部推理业务的实际需求出发，解析了在多型号 GPU 共存、多集群统一调度以及千万级日请求量压力下，算力平台所面临的资源碎片化与利用率瓶颈**。

在技术实现层面，贝壳找房基于 HAMi 构建了 vGPU 弹性池化能力，通过显存切片的方式，将 GPU 资源以更细粒度提供给推理任务，使 TensorFlow 推理、小模型服务及 32B 以下语言模型能够稳定运行在共享 GPU 之上。HAMi 提供的显存限制与调度能力，在不改造应用形态的前提下有效保障了多任务并发时的资源隔离与稳定性。实践结果表明，基于 HAMi 的推理集群 GPU 的利用率实现了约三倍提升，为企业级推理平台在规模化、低成本运行方面提供了可复制的参考路径。

### 《HAMi-Core x DRA：原生 DRA Driver 实践》

![HAMi-Core DRA](/images/blog/hami-meetup-beijing-recap/hami-core-dra-architecture.webp)

![DRA 实践](/images/blog/hami-meetup-beijing-recap/dra-driver-practice.webp)

第四范式研发工程师 & HAMi Approver **杨守仁** 的分享围绕 HAMi 在 Kubernetes 新一代 Dynamic Resource Allocation（DRA）框架下的工程实践，系统介绍了 HAMi-Core 从传统 Device Plugin 架构向原生 DRA Driver 演进的技术背景与实现路径。他指出，Device Plugin 在容器与设备信息表达、生命周期管理等方面存在天然限制，而 HAMi-Core 早期通过环境变量与节点注解实现的能力也逐渐暴露出可维护性与扩展性问题。

在具体实现上，分享深入解析了**HAMi-Core DRA Driver 为何选择 KEP-5075（DRA: Consumable Capacity），并如何结合 ResourceClaim、ResourceSlice 原生对象，将显存等可切分资源以标准化方式暴露给调度与运行时体系**。通过结合 CDI 机制与 libvgpu 注入能力，HAMi-Core 在不侵入业务容器的前提下，实现了显存限制、资源绑定与运行期清理的完整闭环。最后，分享展望了 HAMi-DRA 在配置统一、监控增强以及异构设备标准属性对齐方面的规划方向，为后续构建更通用的异构算力调度框架奠定了基础。

### 《HAMI 设备插件新功能介绍》

![设备插件](/images/blog/hami-meetup-beijing-recap/device-plugin-architecture.webp)

![新功能](/images/blog/hami-meetup-beijing-recap/device-plugin-new-features.webp)

第四范式平台工程师 **James** 围绕 HAMi 设备插件的最新功能演进，系统介绍了其在昇腾（Ascend）设备场景下与 Volcano 调度器的集成方案及关键工程改进。分享指出，传统 Kubernetes 调度模型以整卡独占为前提，资源抽象粒度较粗，导致昇腾等异构设备难以纳入统一、可复用的细粒度调度体系。

在具体实现层面，分享重点解析了 Ascend Device Plugin 在设备初始化、筛选与分配阶段的工作机制，通过在 device-share 中注册昇腾资源，实现 Volcano 对昇腾设备的统一调度与按需分配。同时，针对 device-plugin 仅注册卡数、缺乏显存等关键资源信息的问题，社区引入了 Mock Device Plugin 方案，通过解析节点 annotation 自动补齐资源维度，并将显存等信息标准化注册到 Kubernetes 资源模型中。该能力显著提升了资源可观测性与调度精度，为异构设备在多调度器环境下的统一管理与精细化使用提供了可落地的工程实践。

### 《HAMi v2.7.0 加速兼容国产算力》

![HAMi v2.7.0](/images/blog/hami-meetup-beijing-recap/hami-v2.7.0-domestic-compute.webp)

![昆仑芯适配](/images/blog/hami-meetup-beijing-recap/kunlunxin-xpu-adapter.webp)

在国产异构算力持续加速演进的背景下，睿思智联研发工程师 & HAMi Reviewer **欧阳陆伟** 系统回顾了睿思智联在昆仑芯 P800 vXPU 场景下的工程实践与调度能力演进。分享首先从 XPU-P800 的适配概要出发，介绍了在深度融合原厂能力的基础上，如何通过 HAMi 扩展虚拟化与调度能力，实现 vXPU 的动态切分与稳定交付。

在调度层面，分享重点解析了 HAMi-Scheduler 的拓扑感知能力，说明在多 XPU、多节点及异构资源并存的复杂环境中，如何基于拓扑信息做出更合理的调度决策，以确保最低的通信延迟和最高的应用性能。同时，针对细粒度资源切分与异构调度叠加后带来的问题定位难度，他进一步介绍了调度可观测性的改进思路，通过规范化日志、丰富事件信息以及可视化手段，还原完整调度过程，从而显著降低排障成本，为国产异构算力在生产环境中的规模化落地提供了重要参考。

## 深度交流：问题来自一线，答案也来自一线

在互动交流环节，现场围绕 GPU / DCU / XPU 虚拟化带来的影响、推理与训练混部策略，以及国产加速器适配成本等问题展开了多轮讨论。不少参会者在会后继续与讲者交流细节，讨论如何将分享中的经验迁移到自身业务环境中。

![交流环节](/images/blog/hami-meetup-beijing-recap/meetup-networking-session.webp)

## 结语

北京站的 HAMi Meetup 再次印证：**算力效率不是单点能力，而是调度、虚拟化、软件栈与业务场景共同作用的结果。**

未来，密瓜智能将继续推动更多 HAMi 的真实经验在实践中沉淀、流动、复用。

下一站，我们期待与你再次相见，也欢迎更多 HAMi 用户与从业者分享你的实践故事，共同推动"不卷算力卷效率"的理念落地生根。
