---
title: "EffectiveGPU：顺丰科技基于 HAMi 的异构 AI 虚拟化池化方案"
company: "sf-technology"
companyName: "顺丰科技"
logo: "/redesign/assets/e2e5754a2a04fd08a050.svg"
date: "2025-09-18"
dateLabel: "2025.09.18"
sourceKind: "CNCF 案例 · 中文译文"
sourceUrl: "https://www.cncf.io/case-studies/sf-technology/"
sourceLinkLabel: "查看 CNCF 原文 ↗"
outcomeSourceUrl: ""
outcomeSourceLabel: "关键数据来源：密瓜智能官网 ↗"
outcomes:
  - value: "37 张"
    label: "生产模型服务 GPU 节省"
    detail: "28 张 GPU 部署 65 个服务"
  - value: "13 张"
    label: "测试服务 GPU 节省"
    detail: "6 张 GPU 部署 19 个服务"
  - value: "0.5%"
    label: "池化后的最低性能降幅"
    detail: "官网披露的最低值，非所有负载表现"
---

## 关于顺丰科技

顺丰科技是中国领先的综合物流服务商顺丰速运的科技力量，服务于全球规模最大、最先进的物流网络之一。围绕数字化转型和智慧物流，顺丰科技运用前沿 AI 与云原生技术优化运营、改善客户体验并推动业务创新。

## 面临的挑战

随着 AI 负载规模和多样性增长，顺丰科技及类似组织在提升 GPU、NPU 等异构计算资源利用率方面面临显著挑战：

- **资源利用率低：** 静态分配使大量算力与显存长期闲置，无法供其他负载高效复用。
- **运营成本高：** 持续为未充分利用的资源付费，显著增加基础设施总拥有成本。
- **调度不灵活：** 静态分配后，调度器无法按实时业务需求动态调整，限制集群弹性和可扩展性。

企业需要一种统一、灵活、高效的方式，跨集群与负载管理和共享异构 AI 资源，同时支持主流与国产硬件平台。

## 解决方案

团队开发了自研方案 EffectiveGPU，基于 CNCF Sandbox 项目 HAMi 提供 GPU 池化技术。

| 原文重点指标 | 说明 |
| --- | --- |
| 零修改 | 不修改 NVIDIA 驱动、Linux 内核、任务镜像和源代码 |
| 最高 57% | 原文重点指标列出的生产和测试集群 GPU 节省比例 |
| 最高 100% | 通过 GPU 虚拟化带来的 GPU 利用率提升 |

![EffectiveGPU 架构，来源：CNCF 原文。](/redesign/assets/3270a140c963dd260a9d.png)
*EffectiveGPU 架构，来源：CNCF 原文。*

### HAMi 提供的关键能力

- **设备虚拟化：** 细粒度切分设备算力和显存，多个 Pod 共享同一物理设备。
- **资源硬隔离：** 限制容器显存与算力规格，确保任务不能超出分配配额。
- **异构 AI 计算支持与适配：** 计算框架支持华为昇腾、百度昆仑和申威智能卡等异构平台，同时适配主流及异构计算 AI 框架。
- **基于优先级的 GPU 算力抢占：** 任务可自定义优先级，高优先级任务抢占低优先级任务的计算资源。高优先级任务请求算力时，低优先级任务自动暂停；没有请求时，低优先级任务恢复执行。
- **统一调度：** 为 Kubernetes 提供 scheduler extender 和 mutating webhook，同时支持 kube-scheduler 和 Volcano，实现拓扑感知、策略驱动的资源分配。
- **应用零改动：** 用户无需修改现有应用，即可使用设备共享和隔离。

### EffectiveGPU 在 HAMi 之上的扩展

- **跨节点算力协同调度：** 研究 AI 算力协同调度方法，充分利用低算力节点资源，缓解高算力节点竞争，实现跨节点调度，提高云 AI 计算平台效率、可用性并减少资源竞争。
- **国产 AI 算力自适应调度：** 根据任务类别和资源亲和性，通过预测算法确定分配的算力类型和份额，实现精确调度；考虑节点间异构资源拓扑，采用冲突最小的分配方案，支持弹性调度策略。
- **显存超分：** 在不改变物理显存的前提下，优化显存分配策略和管理机制，支持更多并发任务，缓解多任务的高显存需求，提高显存利用率和并行处理能力。
- **资源分配与调度机制：** 根据任务优先级和资源需求，动态分配适当显存及其他计算资源。资源紧张时优先保障高优先级任务，合理调整低优先级任务用量，实现最优资源利用。
- **资源抢占与回收：** 允许高优先级任务按需抢占低优先级任务的部分资源；任务完成或资源耗尽时及时回收，让其他任务复用，提高资源周转效率。
- **性能优化与负载均衡：** 减少等待资源时的延迟和阻塞，提高执行效率；结合系统整体负载避免局部资源过度占用导致性能下降，保障多任务并行运行的稳定性和效率。

这些技术使团队可以用更少 GPU 部署更多服务，按实时需求动态调整分配，并支持异构计算环境。

## 实施效果

### 大模型推理服务

AI 生产模型服务采用传统 GPU 分配时，往往利用率低、成本高。采用 EffectiveGPU 后，可以显著改善资源利用、降低运营成本。例如，已经切换到 EffectiveGPU 的生产模型服务，仅用 28 张 GPU 部署了 65 个服务，节省 37 张 GPU。这既提高 GPU 利用率，也让部署更灵活，能够按实际需要动态分配资源，避免浪费。

### 测试服务集群

灵活分配和高效利用资源，对测试效率与成本控制至关重要。EffectiveGPU 通过切分，按不同测试任务要求分配 GPU。例如，使用 EffectiveGPU 的测试服务在 6 张测试 GPU 上部署了 19 个服务，节省 13 张 GPU，既提高测试效率，也降低测试成本，使资源使用更合理。

### 语音识别

语音识别依赖高效算力来保障实时性和准确率。EffectiveGPU 通过优先级调度和资源超配提供灵活支撑，依据任务紧急程度与资源需求动态分配 GPU，让高优先级任务及时得到足够资源，提升服务质量。

### 国产 AI 硬件适配

EffectiveGPU 不仅支持主流 GPU，也支持华为昇腾、百度昆仑等国产 AI 计算平台，为异构 AI 技术应用提供支撑，在国产化环境中实现高效管理与资源利用。例如，使用异构 AI 芯片时，EffectiveGPU 的调度和管理能够发挥异构设备优势，促进相关技术发展与应用。

<div class="case-source-note">
<p>原文：<a href="https://www.cncf.io/case-studies/sf-technology/" target="_blank" rel="noopener">Effective GPU: A Heterogeneous AI Virtualization Pooling solution by SF technology built on top of HAMi ↗</a><br>发布方：Cloud Native Computing Foundation（CNCF） · 2025-09-18</p><p>本页为 CNCF 案例的中文翻译，保留原文技术信息与数据口径；并非 CNCF 官方中文版本。架构图沿用原文，图内英文保留。项目阶段及产品信息以文章发布时为准。</p><p>原文依 <a href="https://www.linuxfoundation.org/legal/terms" target="_blank" rel="noopener">Linux Foundation 内容条款</a>使用，适用 <a href="https://creativecommons.org/licenses/by/3.0/" target="_blank" rel="noopener">CC BY 3.0</a>；本页进行了中文翻译和版式调整，品牌标识归各权利人所有。</p>
</div>
