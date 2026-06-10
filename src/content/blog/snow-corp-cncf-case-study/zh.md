---
title: '支撑 2 亿用户 GenAI 服务：SNOW Corp 基于 HAMi 和 KEDA 编排 1,000+ 张 GPU'
date: '2026-05-08'
excerpt: >-
  CNCF 案例研究：韩国 NAVER 旗下子公司 SNOW Corp. 如何利用 HAMi 实现 GPU
  共享、KEDA 实现主动自动伸缩，应对 700% 病毒式流量峰值——实现 MTTR 缩短
  91%、峰值流量错误减少 85%、预估节省成本 1,740 万美元。
author: Dynamia AI 团队
tags:
  - HAMi
  - CNCF
  - GPU 共享
  - vGPU
  - Kubernetes
  - KEDA
  - SNOW Corp
  - NAVER
  - 案例研究
  - GenAI
category: Case Study
coverImage: /images/blog/snow-corp-cncf-case-study/snowcorp.jpg
language: zh
linktitle: SNOW Corp HAMi 使用案例研究
---

SNOW Corp. 是韩国 NAVER 集团旗下子公司，运营着 1,000+ 张 A100 GPU 的计算集群，为 SNOW、EPIK、B612 三款全球排名领先的 GenAI 应用提供 AI 功能服务，覆盖 2 亿 + 全球用户。基础设施承载 1,200+ AI 工作流和 400+ 模型。该组织经历了 **700% 的病毒式流量峰值**——流量模式不可预测且高度波动。

![SNOW Corp 概览](/images/blog/snow-corp-cncf-case-study/snowcorp.webp)

## 挑战

核心问题：Kubernetes 原生 GPU 调度将 GPU 视为原子资源。Pod 要么获得整张 GPU，要么什么都没有。这种模式在以下两种条件下会失效：

1. **异构工作负载需求**：训练流水线、推理服务和批处理具有截然不同的 GPU 利用率特征。训练任务可能消耗 80% 的 GPU 算力但仅用 20% 显存，而推理服务的利用率特征正好相反。
2. **流量不可预测性**：由于病毒式 AI 趋势和异构推理工作负载带来的极端流量波动，系统需要弹性伸缩。但缺乏 GPU 实际利用率的可观测性，扩缩容决策只能依赖人工（运维噩梦）或粗略的 CPU/内存指标，无法反映 GPU 真实饱和程度。

在采用 Kubernetes 之前，SNOW 运行着基于 Docker 的基础设施，手动分配 GPU：

- **调度盲区**：同一 Pod 中的 2-3 个容器在无协调的情况下竞争 GPU 资源
- **手动伸缩**：人工基于负载预测配置 GPU，而非基于实际需求
- **无 GPU 共享**：多个容器无法高效共享单张 GPU
- **成本爆炸**：为应对峰值负载，不得不超配约 **2 倍**（一张用于训练，一张用于推理，而理论上只需要一张）

![架构概览](/images/blog/snow-corp-cncf-case-study/architecture-overview.png)

## 解决方案

### 云原生计算基金会（CNCF）生态

SNOW 迁移至多区域本地化 Kubernetes 平台，采用解耦的 External ETCD 拓扑保障高可用。整个技术栈由 CNCF 生态支撑：Cilium 作为 CNI、Helm 实现 GitOps 部署、Traefik 作为 Ingress、Prometheus/Loki/Grafana 提供可观测性、**HAMi 实现 GPU 共享**、**KEDA 实现自动伸缩**。

### 基于 HAMi 的 GPU 共享

Kubernetes 默认调度器执行严格的 GPU 隔离，这阻断了 SNOW 顺序式训练 - 推理流水线的迁移——训练器和推理引擎必须共享同一张 GPU。HAMi 通过虚拟化 GPU 资源（vGPU）解决此问题，使同一 Pod 中的多个容器能够并发共享单张 GPU。它与 kube-scheduler 原生集成，无需修改任何应用代码，并与更广泛的自动伸缩生态完全兼容。

![训练到推理流程](/images/blog/snow-corp-cncf-case-study/train-to-inference-flow.png)

### 基于 KEDA 的主动 GPU 编排

标准指标（CPU/内存、DCGM 利用率）对 SNOW 的异构工作负载不可靠，KEDA 内置的 RabbitMQ 缩放器充当滞后指标——考虑到约 60 秒的模型预热时间，在队列积压形成后触发缩放总是太晚。

为此，SNOW 开发了轻量级自定义 Metric Server（Python/FastAPI），向 KEDA 的 Metrics API Scaler 暴露消费者饱和度指标：

`active_ratio = unacked_messages / active_consumers`

当 `active_ratio` 超过阈值（如 0.7）时，KEDA 在工作池饱和前预配新 GPU Pod，主动吸收预热窗口。缩容方面，更长的 `stabilizationWindowSeconds` 和 `cooldownPeriod` 防止在流量低谷期间过早释放资源。

![KEDA 自动伸缩架构](/images/blog/snow-corp-cncf-case-study/keda-autoscaling-arch.png)

## 影响与成果

### 通过混合云弹性扩展应对 700% 流量峰值

一个周六早晨，「吉卜力滤镜」突然爆火，3 小时内流量飙升至 3 倍，本地算力迅速耗尽。SNOW 立即通过统一的 GitOps 流水线将工作负载弹性扩展至云服务商，所有集群使用相同的 Helm Charts，云节点直接从中央 RabbitMQ 队列拉取任务——整个过程零中断。最终成功消化了峰值 7 倍的流量，完整把握了这次商业机会。

![吉卜力滤镜流量峰值](/images/blog/snow-corp-cncf-case-study/ghibli-filter-traffic.png)

### 运维效率

- **MTTR 改善**：MTTR 缩短 **91%**（从约 2 小时缩短至约 10 分钟）
- **峰值错误减少**：由于主动伸缩，峰值流量期间 GPU 涌涌相关用户错误下降 **85%**
- **消除手动伸缩**：从人工驱动的 GPU 配置转向自动化、指标驱动的伸缩，相当于节省 **10.8 人月**的运营成本

### 成本优化

- **主动自动伸缩**将平均 GPU 使用时间减少 **55%**
- 相比同等按需云 GPU 配置（每张 A100 约 45 美元/小时），预估节省成本 **1,740 万美元**
- **基于 HAMi 的 GPU 共享**消除了全面重构基础设施的需求，显著降低了迁移复杂性和工程开销
- **GPU 需求减少**：训练 + 推理流水线所需 GPU 减少 **2 倍**

![成本节省图表](/images/blog/snow-corp-cncf-case-study/cost-savings-chart.png)

## 结论

SNOW Corp. 的云原生转型展示了如何将 Kubernetes 与更广泛的 CNCF 生态相结合，在极端规模下克服 GPU 调度和可观测性的根本性限制。通过引入 HAMi 实现 GPU 共享，并利用主动式自定义指标增强 KEDA，SNOW 从被动的手工运营转向了预测性的自动化编排。这一架构不仅使平台能够吸收 700% 的流量峰值并无中断地跨混合环境扩展，还在成本效率、可靠性和运营速度方面取得了显著提升。

> 本文改编自云原生计算基金会（CNCF）发布的 [SNOW Corp. CNCF 案例研究](https://www.cncf.io/case-studies/snow-corp/)。

## 参考文献

- [a16z, "The Top 100 [Gen AI] Consumer Apps"](https://a16z.com/100-gen-ai-apps-5/)
- [HAMi](https://project-hami.io/)
- [KEDA](https://keda.sh/)
