---
title: "电科云以 HAMi 为便携式知识库构建异构 GPU 共享资源底座"
company: "cetc-cloud"
companyName: "电科云"
logo: "/redesign/assets/dd41408a06cb10c4a43e.png"
date: "2026-09-08"
dateLabel: "2026.09.08"
sourceKind: "CNCF 案例 · 中文译文"
sourceUrl: "https://www.cncf.io/case-studies/cetc-cloud/"
sourceLinkLabel: "查看 CNCF 原文 ↗"
outcomeSourceUrl: ""
outcomeSourceLabel: "关键数据来源：密瓜智能官网 ↗"
outcomes:
  - value: "15×"
    label: "研发 Pod 并发容量提升"
    detail: "同一台 8 卡设备：2 → 30"
  - value: "87.5%"
    label: "单卡显存回收"
    detail: "64 GB 显存中释放 56 GB"
  - value: "80%"
    label: "单卡算力回收"
    detail: "Embedding 配额 20%，其余保持可调度"
---

电科云（北京）技术有限公司需要把智能知识库带到项目现场，在一套配备异构 GPU 的便携设备上，同时运行文本生成、Embedding、Rerank、知识处理与研发调试负载。团队采用 Kubernetes 和 HAMi，将原先长期绑定单个服务的有限异构 GPU，转化为生产模型和 Kubernetes 开发环境可以按需申请、共享和调度的资源。

在这一资源底座之上，文本生成、向量 Embedding 和 Rerank 模型组成完整知识库链路；多个 Kubernetes 开发 Pod/容器也可通过 HAMi 的虚拟化能力，共享同一张异构 GPU。

| 关键指标 | 成果 |
| --- | --- |
| 开发容量提高 15 倍 | 同一台 8 GPU 便携设备，并发开发 Pod 从 2 个增加到 30 个 |
| 回收 87.5% 显存 | Embedding 从独占 64GB 整卡，改为分配 8GB，留下 56GB 可复用 |
| 回收 80% 算力 | Embedding 分配 20% GPU 算力，其余 80% 可供其他负载调度 |

## 案例信息与实践范围

| 项目 | 内容 |
| --- | --- |
| 使用者 | 电科云技术团队 |
| 业务场景 | 可携带到项目现场并独立运行的智能知识库一体机 |
| 部署环境 | Kubernetes 与本地异构 GPU |
| 使用项目 | Kubernetes、HAMi |
| 核心挑战 | 多模型协同，生产与开发共享资源 |

| 知识库生产链路 | Kubernetes 开发环境 |
| --- | --- |
| 文本生成、Embedding、Rerank | 多个开发 Pod/容器共享单张异构 GPU |

本实践包含两条 GPU 使用路径：知识库生产模型主要使用本地稳定资源，Kubernetes 开发 Pod/容器则通过 HAMi 共享本地异构 GPU。

![生产模型与 Kubernetes 开发环境分别通过 HAMi 使用本地异构 GPU。](/redesign/assets/9b31ba0ce32ef27df2de.png)
*生产模型与 Kubernetes 开发环境分别通过 HAMi 使用本地异构 GPU。*

## 一台便携设备，同时服务生产与研发

知识库在线问答依赖文本生成、向量检索与 Rerank；数据进入系统后，还需完成解析、切分、向量化、知识抽取和索引构建。研发工程师也需要在 Kubernetes 开发 Pod/容器内调试模型、验证依赖、开展实验。这些负载使用 GPU 的方式很不相同：

- 文本生成模型长期在线，显存基线较高，对响应延迟敏感。
- Embedding 在批量文档导入时形成周期性峰值，更关注吞吐。
- Rerank 位于在线检索链路，单次计算短，但调用频繁。
- 知识处理和索引重建属于批量任务，需要与在线服务隔离。
- 开发 Pod/容器具有周期性、交互式特征，适合在清晰资源边界内共享 GPU。

如果每个服务或开发环境仍长期绑定整卡，有限设备很快就会在逻辑上被耗尽；但如果只追求尽可能细的切分，又会放大显存不足、调度抖动和故障传播。团队需要让不同负载描述自己的需求，再由平台依据设备状态与服务等级完成资源放置。

![业务文档经过解析、Embedding 和索引构建进入知识库；在线问题经过检索、Rerank 和文本生成，得到答案、引用或报告。](/redesign/assets/ca4b9febe7be5ceb583c.png)
*业务文档经过解析、Embedding 和索引构建进入知识库；在线问题经过检索、Rerank 和文本生成，得到答案、引用或报告。*

## 为什么选择 HAMi

电科云希望保留 Kubernetes 应用交付方式，同时让平台进一步判断异构 GPU 是否满足负载请求，并让适合共享的开发环境复用同一物理 GPU。HAMi 提供的 Kubernetes 原生资源声明、设备感知放置、设备共享和运行观测，直接对应这些要求。

HAMi 的价值不只是将一张物理卡表示成多份资源，更重要的是建立共同的资源约定：

- 模型服务与开发 Pod/容器描述所需设备资源，不再依赖长期人工绑卡。
- 调度不仅检查节点是否有 GPU，还依据设备可用状态选择。
- 在实际设备后端支持的范围内，多个开发 Pod/容器可以共享一张异构 GPU，并各自保有资源边界。
- Pod、容器、设备与调度结果可以关联，为容量观测和资源配置修正提供依据。

## 从资源画像到共享异构 GPU

团队围绕负载特点构建资源画像，关注模型加载、峰值用量、并发、延迟与长期运行表现，再把验证过的需求转为 Kubernetes 资源请求。生产模型与开发环境采用不同策略：

1. **在线链路保持稳定边界。** 优先保障文本生成、在线向量检索和 Rerank 的稳定资源。
2. **周期任务允许排队和错峰。** 文档向量化、知识抽取和索引重建在在线负载较低时运行。
3. **开发环境共享单张异构 GPU。** 多个 Kubernetes 开发 Pod/容器通过 HAMi 虚拟化复用 GPU，避免各自长期独占设备。
4. **用真实负载修正配置。** 切分粒度来自基线验证和运行观测，而不是假设某个预设比例适合所有模型。

这套资源治理方式形成四项产品能力：

- 文本生成、Embedding 与 Rerank 纳入统一的 Kubernetes GPU 资源治理流程。
- 知识入库、检索、问答与报告生成形成完整运行链路。
- 在线服务、批量任务与研发调试遵循不同资源规则。
- 单张异构 GPU 可同时服务多个 Kubernetes 开发 Pod/容器。

## 量化结果：单设备开发环境从 2 个增加到 30 个

在同一台配备 8 张异构 GPU 的便携设备上，团队按一致口径比较引入 HAMi 前后的资源容量：

| 对比项 | 无 HAMi | 引入 HAMi |
| --- | --- | --- |
| 文本生成模型 | 独占 4 张异构 GPU | 仍独占 4 张异构 GPU |
| Embedding 和 Rerank | 各独占 1 张异构 GPU | 各申请 8GB GPU 显存配额 |
| 开发环境可用容量 | 剩余 2 张 GPU，只承载 2 个开发 Pod | 验证可并发运行 30 个开发 Pod |
| 开发环境容量 | 基线 | 提升至原来的 15 倍 |

开发 Pod 的显存配额由用户按任务需要申请，平台不设统一固定值。在当前模型配额和开发负载下，团队完成了 30 个开发 Pod 同时运行的验证。

### Embedding 模型的单卡资源对比

在一张 64GB 异构 GPU 上，Embedding 模型实际需要约 8GB 显存。整卡独占时，模型仅使用约 12.5% 显存，但其他负载无法申请剩余资源。引入 HAMi 后，团队按需给模型分配 8GB 显存与 20% 算力，并将剩余资源重新纳入调度。对比使用相同模型镜像、请求集与并发配置，比较整卡独占和 HAMi 切分。

| 指标 | 无 HAMi | 引入 HAMi |
| --- | --- | --- |
| Embedding 显存分配 | 独占 64GB 整卡 | 按需分配 8GB |
| 模型实际显存需求 | 约 8GB | 约 8GB |
| 其他任务可复用显存 | 0GB | 56GB，占整卡 87.5% |
| Embedding 算力分配 | 独占整卡 | 分配 20%，其余 80% 可调度 |
| Token 吞吐量（tokens/s） | 基线 | 与整卡独占相比，变化在 5% 以内 |
| 模型加载时间 | 基线 | 与整卡独占基本一致，未观察到显著变化 |
| P95 请求延迟 | 基线 | 与整卡独占基本一致，未观察到显著变化 |

这一同卡、同模型对比表明，HAMi 将 Embedding 从整卡独占转为按需分配，释放显存与算力，同时把 Token 吞吐变化控制在 5% 内，模型加载时间与 P95 延迟基本稳定，使同一张异构 GPU 还可承载开发环境或其他适合共享的任务。

![引入 HAMi 后，Embedding 按需分配资源，单卡释放 56GB 显存与 80% 算力；设备可承载的开发 Pod 从 2 个增加到 30 个。](/redesign/assets/3e9f561e5b390211887f.png)
*引入 HAMi 后，Embedding 按需分配资源，单卡释放 56GB 显存与 80% 算力；设备可承载的开发 Pod 从 2 个增加到 30 个。*

## 实践经验与下一步

首先，异构 GPU 共享应从负载画像出发，而不是预设统一切分比例。生产模型、批量任务和开发环境对延迟、显存、吞吐与隔离的要求不同，资源策略也应不同。

其次，研发环境是共享 GPU 的重要使用方。将开发环境运行在 Kubernetes Pod/容器中，可以复用生产服务的资源声明与调度方式，同时避免每个开发环境长期独占设备。

下一阶段，电科云将继续完善生产与研发负载的容量和健康视图，并补充不同模型、网络和调用方式下可复现的实验数据。

## 关于 HAMi

HAMi 是由李孟轩和张潇共同发起的异构算力虚拟化与统一调度开源项目，现为 CNCF 孵化项目。项目以“让异构算力因开源而好用”为使命，致力于提升异构算力利用率，为异构 GPU 提供统一复用接口。

原文发布时，HAMi 已支持 NVIDIA、昇腾、寒武纪、海光、天数智芯、摩尔线程、沐曦、燧原、昆仑芯、AWS Neuron、瀚博等多种异构加速器，广泛集成 Volcano、Kueue、Koordinator、vLLM、KAI Scheduler 等项目，吸引来自 20 多个国家和地区的 500 多名贡献者，并在数百家企业生产环境运行。

## 关于电科云技术团队

本案例中的电科云技术团队负责便携式智能知识库的产品研发与工程交付，围绕现场本地运行、知识处理、模型服务和开发环境建设产品能力。

欢迎通过 HAMi 社区交流共享 GPU 和便携式 AI 的实践问题。

<div class="case-source-note">
<p>原文：<a href="https://www.cncf.io/case-studies/cetc-cloud/" target="_blank" rel="noopener">CETC Cloud Builds a Heterogeneous GPU Shared Resource Foundation for a Portable Knowledge Base with HAMi ↗</a><br>发布方：Cloud Native Computing Foundation（CNCF） · 2026-09-08</p><p>本页为 CNCF 案例的中文翻译，保留原文技术信息与数据口径；并非 CNCF 官方中文版本。架构图沿用原文，图内英文保留。项目阶段及产品信息以文章发布时为准。</p><p>原文依 <a href="https://www.linuxfoundation.org/legal/terms" target="_blank" rel="noopener">Linux Foundation 内容条款</a>使用，适用 <a href="https://creativecommons.org/licenses/by/3.0/" target="_blank" rel="noopener">CC BY 3.0</a>；本页进行了中文翻译和版式调整，品牌标识归各权利人所有。</p>
</div>
