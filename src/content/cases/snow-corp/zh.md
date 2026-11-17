---
title: "服务 2 亿用户的 GenAI：SNOW 如何编排千张 GPU 应对 700% 流量峰值"
company: "snow-corp"
companyName: "SNOW Corp."
logo: "/redesign/assets/83f5bec99abccb7f8843.jpg"
date: "2026-05-05"
dateLabel: "2026.05.05"
sourceKind: "CNCF 案例 · 中文译文"
sourceUrl: "https://www.cncf.io/case-studies/snow-corp/"
sourceLinkLabel: "查看 CNCF 原文 ↗"
outcomeSourceUrl: ""
outcomeSourceLabel: "关键数据来源：密瓜智能官网 ↗"
outcomes:
  - value: "1,000+"
    label: "张 A100 GPU 编排管理"
    detail: ""
  - value: "2 亿+"
    label: "全球用户覆盖"
    detail: "SNOW、EPIK、B612 三款应用"
  - value: "700%"
    label: "病毒式流量峰值应对能力"
    detail: "HAMi、KEDA 与整个平台协同"
---

SNOW Corp. 是韩国 NAVER 集团旗下子公司，运营着 1,000+ 张 A100 GPU 的计算集群，为 SNOW、EPIK、B612 三款全球排名领先的 GenAI 应用提供 AI 功能服务，覆盖 2 亿 + 全球用户。基础设施承载 1,200+ AI 工作流和 400+ 模型。该组织经历了 **700% 的病毒式流量峰值**——流量模式不可预测且高度波动。

## 挑战

核心问题：Kubernetes 原生 GPU 调度将 GPU 视为原子资源。Pod 要么获得整张 GPU，要么什么都没有。这种模式在以下两种条件下会失效：

1. **异构工作负载需求** ：训练流水线、推理服务和批处理具有截然不同的 GPU 利用率特征。训练任务可能消耗 80% 的 GPU 算力但仅用 20% 显存，而推理服务的利用率特征正好相反。
2. **流量不可预测性** ：由于病毒式 AI 趋势和异构推理工作负载带来的极端流量波动，系统需要弹性伸缩。但缺乏 GPU 实际利用率的可观测性，扩缩容决策只能依赖人工（运维噩梦）或粗略的 CPU/内存指标，无法反映 GPU 真实饱和程度。

在采用 Kubernetes 之前，SNOW 运行着基于 Docker 的基础设施，手动分配 GPU：

- **调度盲区** ：同一 Pod 中的 2-3 个容器在无协调的情况下竞争 GPU 资源
- **手动伸缩** ：人工基于负载预测配置 GPU，而非基于实际需求
- **无 GPU 共享** ：多个容器无法高效共享单张 GPU
- **成本爆炸** ：为应对峰值负载，不得不超配约 **2 倍** （一张用于训练，一张用于推理，而理论上只需要一张）

![架构概览](/redesign/assets/9f3517927ac5d3ae69ef.png)
*图2: 架构概览*

### 可观测性缺口

团队缺少 GPU 级可观测性。Kubernetes HPA 可依据 CPU 和内存伸缩，但这些指标并不能准确反映 GPU 饱和程度。

## 解决方案

### 云原生计算基金会（CNCF）生态

SNOW 迁移至多区域本地化 Kubernetes 平台，采用解耦的 External ETCD 拓扑保障高可用。整个技术栈由 CNCF 生态支撑：Cilium 作为 CNI、Helm 实现 GitOps 部署、Traefik 作为 Ingress、Prometheus/Loki/Grafana 提供可观测性、**HAMi 实现 GPU 共享**、**KEDA 实现自动伸缩**。

### 基于 HAMi 的 GPU 共享

Kubernetes 默认调度器执行严格的 GPU 隔离，这阻断了 SNOW 顺序式训练 - 推理流水线的迁移——训练器和推理引擎必须共享同一张 GPU。HAMi 通过虚拟化 GPU 资源（vGPU）解决此问题，使同一 Pod 中的多个容器能够并发共享单张 GPU。它与 kube-scheduler 原生集成，无需修改任何应用代码，并与更广泛的自动伸缩生态完全兼容。

![训练到推理流程](/redesign/assets/241cbda9533d1e659947.png)
*图3: 训练到推理流程*

### 基于 KEDA 的主动 GPU 编排

标准指标（CPU/内存、DCGM 利用率）对 SNOW 的异构工作负载不可靠，KEDA 内置的 RabbitMQ 缩放器充当滞后指标——考虑到约 60 秒的模型预热时间，在队列积压形成后触发缩放总是太晚。

为此，SNOW 开发了轻量级自定义 Metric Server（Python/FastAPI），向 KEDA 的 Metrics API Scaler 暴露消费者饱和度指标：

`active_ratio = unacked_messages / active_consumers`

当 `active_ratio` 超过阈值（如 0.7）时，KEDA 在工作池饱和前预配新 GPU Pod，主动吸收预热窗口。缩容方面，更长的 `stabilizationWindowSeconds` 和 `cooldownPeriod` 防止在流量低谷期间过早释放资源。

![KEDA 自动伸缩架构](/redesign/assets/33a977524696d46d2c90.png)
*图4: KEDA 自动伸缩架构*

## 影响与成果

### 通过混合云弹性扩展应对 700% 流量峰值

一个周六早晨，「吉卜力滤镜」突然爆火，3 小时内流量飙升至 3 倍，仅靠本地容量无法承接。自动伸缩起初支撑了流量，但 GPU 需求激增随后引发限流；团队必须赶在热度消退之前解决饱和问题。SNOW 随即通过统一的 GitOps 流水线将工作负载弹性扩展至云服务商，所有集群使用相同的 Helm Charts，云节点直接从中央 RabbitMQ 队列拉取任务——整个过程零中断。最终成功消化了峰值 7 倍的流量，完整把握了这次商业机会。

![吉卜力滤镜流量峰值](/redesign/assets/59d80da9e1d28faf91b2.png)
*图5: 吉卜力滤镜流量峰值*

### 运维效率

- **MTTR 改善** ：MTTR 缩短 **91%** （从约 2 小时缩短至约 10 分钟）
- **峰值错误减少** ：由于主动伸缩，峰值流量期间 GPU 需求激增相关用户错误下降 **85%**
- **消除手动伸缩** ：从人工驱动的 GPU 配置转向自动化、指标驱动的伸缩，相当于节省 **10.8 人月** 的运营成本

### 成本优化

- **主动自动伸缩** 将平均 GPU 使用时间减少 **55%**
- 相比同等按需云 GPU 配置（每张 A100 约 45 美元/小时），预估节省成本 **1,740 万美元**
- **基于 HAMi 的 GPU 共享** 消除了全面重构基础设施的需求，显著降低了迁移复杂性和工程开销
- **GPU 需求减少** ：训练 + 推理流水线所需 GPU 减少 **2 倍**

![成本节省图表](/redesign/assets/0630dc598a3750992b2b.png)
*图6: 成本节省图表*

## 结论

SNOW Corp. 的云原生转型展示了如何将 Kubernetes 与更广泛的 CNCF 生态相结合，在极端规模下克服 GPU 调度和可观测性的根本性限制。通过引入 HAMi 实现 GPU 共享，并利用主动式自定义指标增强 KEDA，SNOW 从被动的手工运营转向了预测性的自动化编排。这一架构不仅使平台能够吸收 700% 的流量峰值并无中断地跨混合环境扩展，还在成本效率、可靠性和运营速度方面取得了显著提升。

> 最终，这一方法提供了一套可复用的大规模 GenAI 负载运行方案：智能资源利用、精确自动伸缩与深入可观测性，共同把基础设施挑战转化为竞争优势。
>
> ## 参考文献与联系人 {#case-section-11}
>
> - [a16z：The Top 100 [Gen AI] Consumer Apps](https://a16z.com/100-gen-ai-apps-5/)
> - [HAMi](https://project-hami.io/)
> - [KEDA](https://keda.sh/)
>
> Jeonghyun Kim，AI 工程师：jeonghyun@snowcorp.com Jae Do Chung，工程高级副总裁：jaedo.chung@snowcorp.com
>

<div class="case-source-note">
<p>原文：<a href="https://www.cncf.io/case-studies/snow-corp/" target="_blank" rel="noopener">Scaling GenAI for 200M users: How SNOW Corp. orchestrates 1000+ GPUs to handle 700% viral traffic spikes ↗</a><br>发布方：Cloud Native Computing Foundation（CNCF） · 2026-05-05</p><p>本页为 CNCF 案例的中文翻译，保留原文技术信息与数据口径；并非 CNCF 官方中文版本。架构图沿用原文，图内英文保留。项目阶段及产品信息以文章发布时为准。</p><p>原文依 <a href="https://www.linuxfoundation.org/legal/terms" target="_blank" rel="noopener">Linux Foundation 内容条款</a>使用，适用 <a href="https://creativecommons.org/licenses/by/3.0/" target="_blank" rel="noopener">CC BY 3.0</a>；本页进行了中文翻译和版式调整，品牌标识归各权利人所有。</p>
</div>
