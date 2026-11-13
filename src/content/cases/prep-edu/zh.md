---
title: "PREP EDU 为 AI 推理实现高效 GPU 编排"
company: "prep-edu"
companyName: "PREP EDU"
logo: "/redesign/assets/c53a000a30233660d2d0.svg"
date: "2025-08-20"
dateLabel: "2025.08.20"
sourceKind: "CNCF 案例 · 中文译文"
sourceUrl: "https://www.cncf.io/case-studies/prep-edu/"
sourceLinkLabel: "查看 CNCF 原文 ↗"
outcomeSourceUrl: ""
outcomeSourceLabel: "关键数据来源：密瓜智能官网 ↗"
outcomes:
  - value: "1+ 年"
    label: "生产环境稳定使用"
    detail: "截至案例发布时"
  - value: "90%"
    label: "GPU 基础设施优化覆盖"
    detail: "由 HAMi 管理与优化的比例"
  - value: "50%"
    label: "GPU 管理运维痛点减少"
    detail: ""
---

## 面临的挑战

PREP EDU 运营基于 Kubernetes 的 AI 推理平台，异构 GPU 集群主要由 RTX 4070 和 RTX 4090 节点组成。不同工作负载为了获得最佳性能与兼容性，往往需要特定 GPU 类型，这使资源编排变得复杂。

静态分配使 GPU 利用率长期低迷，经常只有 10%—20%，大量可用算力闲置。

采用 HAMi 之前，团队尝试过其他 GPU 共享方案，但这些方案缺乏有效隔离，多个任务互相竞争 GPU，频繁导致资源冲突、显存分配问题和应用崩溃，难以保证公平、高效的共享，也影响整体服务稳定性。

团队还十分关注兼容性：新方案必须无缝集成既有生产环境，包括 GPU Operator 和 RKE2 Kubernetes 发行版。团队需要智能编排异构 GPU、提供可靠隔离防止任务干扰、显著提升整体利用率，同时兼容当前基础设施。

## 解决方案

团队采用 HAMi 作为 GPU 编排方案。案例发布时，HAMi 是 CNCF Sandbox 项目。团队在 GitHub 搜索 GPU 共享方案时，注意到 HAMi 在 GPU 调度领域的影响力；其文档清晰，也适合他们的 Kubernetes（RKE2）环境。HAMi 的成熟度、在 GPU 调度领域的先发优势，以及对多种 NVIDIA GPU 的兼容性，促成了选择。

HAMi 的 vGPU 调度能力让 PREP EDU 可以：

- **虚拟化与 GPU 切分：** 针对多个推理服务，按 NLP Token 长度和服务需求，为各负载设置具体限制。
- **异构 GPU 管理：** 通过基于注解的资源选择，将任务分配给特定卡型，例如让某些项目只运行在 RTX 4070 或 4090 上，提升兼容性和效率。
- **无缝集成应用：** 依靠透明设备虚拟化，无需修改应用即可共享和隔离 GPU。
- **指定 GPU：** 按 UUID 将应用放到特定设备，例如在某张 24GB 4090 上运行多个进程。
- **保持兼容：** HAMi 与 NVIDIA GPU Operator 在其环境中无冲突共存，均配置使用 containerd；同时使用 Prometheus 监控和告警，并与 Kubernetes（RKE2）、containerd 无缝集成。

在此基础上，PREP EDU 的 DevOps 团队对工作流进行了大量优化，并已用于生产环境：

- 建立新节点加入集群后自动由 HAMi 纳管的工作流，使整个集群保持一致编排。
- 探索在 Docker 环境中自行部署 HAMi，为特定作业进行 GPU 编排。
- 寻找与 NVIDIA GPU Operator 协作的最佳实践，让集群更容易扩展。

这些工作使 GPU 集群管理痛点减少 50%，并优化了 90% 的 GPU 基础设施。

## 实施效果

在 HAMi 与 DevOps 团队优化工作的共同作用下，成效十分明显：

- **深度集成：** HAMi 现在高效管理 90% 的 GPU 基础设施，为集群提供统一编排。
- **运维效率：** 消除了显存冲突造成的应用崩溃，解决了此前 GPU 资源管理中 50% 的痛点。
- **可扩展性：** 团队可以无缝加入新 GPU 节点，HAMi 自动编排异构硬件资源。
- **灵活性：** 精确按 GPU 类型或 UUID 分配负载，也为未来扩展训练与大语言模型负载做好准备。

DevOps 团队继续微调调度参数和算法，随着业务变化提供稳定、高性能且高效的 GPU 服务。

| 关键指标 | 结果 |
| --- | --- |
| HAMi 生产使用时间 | 1 年 |
| 使用 HAMi 优化的 GPU 基础设施 | 90% |
| GPU 管理痛点 | 减少 50% |

## 团队反馈

> “HAMi 是 vGPU 调度的好选择，帮助我们优化 AI 微服务的 GPU 使用。监控和告警能力对长期跟踪也很有帮助。文档清晰，能将任务分配到特定 GPU 类型，对我们是一大优势。”
>
> —— Xeus Nguyen，PREP EDU DevOps 工程师
>
> “HAMi 能为每个项目精确分配 GPU 显存和算力，优化整体资源使用。这样，在同样有限的 GPU 显存上，我们可以部署更多 AI 服务，提高效率和可扩展性。”
>
> —— Nhan Phan，PREP EDU AI 工程师
>
> “HAMi 通过自动分配负载、减少维护开销，帮助我们解决了本地 AI 微服务的 GPU 管理挑战。团队只需很少投入，就显著提高了资源效率。”
>
> —— Phong Nguyen，PREP EDU AI 工程师
>
> “HAMi 改变了我们的 AI 工程工作流。通过在 Pod 层面虚拟化并合理调整 GPU 资源，我们能在同一硬件上混合部署轻量推理服务和大型批处理作业，而不出现相邻任务干扰。部署几乎即插即用：一份 Helm Chart 加几个标签。因此，我们保持了既有清单不变。”
>
> —— Vu Hoang Tran，PREP EDU AI 工程师
>

<div class="case-source-note">
<p>原文：<a href="https://www.cncf.io/case-studies/prep-edu/" target="_blank" rel="noopener">Enabling Efficient GPU Orchestration for AI Inference at PREP EDU ↗</a><br>发布方：Cloud Native Computing Foundation（CNCF） · 2025-08-20</p><p>本页为 CNCF 案例的中文翻译，保留原文技术信息与数据口径；并非 CNCF 官方中文版本。架构图沿用原文，图内英文保留。项目阶段及产品信息以文章发布时为准。</p><p>原文依 <a href="https://www.linuxfoundation.org/legal/terms" target="_blank" rel="noopener">Linux Foundation 内容条款</a>使用，适用 <a href="https://creativecommons.org/licenses/by/3.0/" target="_blank" rel="noopener">CC BY 3.0</a>；本页进行了中文翻译和版式调整，品牌标识归各权利人所有。</p>
</div>
