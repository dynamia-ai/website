---
title: "8 Models per GPU, ¥200K Saved Monthly: How Sangfor Squeezes Every GPU with K8s + Volcano + HAMi"
coverTitle: "Sangfor CNCF Case Study"
date: '2026-09-20'
excerpt: >-
  The AI platform of a 2,000-engineer team kept buying GPUs while most of them
  sat idle. After rebuilding its compute platform on Kubernetes + Volcano +
  HAMi, Sangfor raised GPU utilization more than 3×, packed 8+ models onto a
  single GPU, and cut external model invocation costs by ¥200K per month.
author: Dynamia
tags:
  - HAMi
  - CNCF
  - Sangfor
  - GPU Sharing
  - vGPU
  - Volcano
  - Kubernetes
  - Case Study
  - AI Infrastructure
category: Case Study
language: en
linktitle: Sangfor CNCF Case Study
coverImage: "/images/blog/sangfor-cncf-case-study/architecture.png"
---

> An AI platform serving 2,000 engineers kept buying GPUs at full speed — while large amounts of compute sat idle. After rebuilding its compute platform on Kubernetes + Volcano + HAMi, Sangfor raised GPU utilization more than 3×, packed 8+ models onto a single GPU, and cut external model invocation costs by ¥200K per month. How did they do it?

## 01 Sangfor's GPU Problem: More Cards, Worse Utilization

Sangfor is a leading enterprise cloud computing and cybersecurity vendor in China. With AI applications growing fast, the company is building a unified AI compute platform for its internal R&D teams and enterprise customers, supporting AI coding, digital employees, intelligent customer service, sales Agents, and enterprise knowledge assistants.

As the platform scaled, three problems surfaced.

**Inference services occupied whole GPUs, leaving most hardware idle.** In the traditional model, an inference service exclusively holds an entire GPU. Many workloads use only a fraction of the memory and compute yet keep the full card — small model services are the typical case, occupying just 15–20% of VRAM while more than 80% sits idle. Resource fragmentation kept worsening, to the point that GPU capacity grew faster than the business itself: the more cards they bought, the more they wasted.

**Complex resource governance in multi-tenant environments.** The platform serves multiple business teams with clearly different GPU demands: some workloads need long-resident memory, others show pronounced peak-and-valley traffic. How to manage the unified resource pool and allocate quotas became unavoidable questions.

**Inference and batch workloads coexist.** Online inference, batch inference, distributed training, and Agent workflows all run on one platform — more than what native Kubernetes GPU scheduling can handle.

## 02 The Scoreboard First

Sangfor ultimately built a production-grade shared GPU platform on Kubernetes, Volcano, and HAMi, turning Kubernetes into a unified AI resource control plane. The key metrics:

| Metric | Before | After |
|-|-|-|
| GPU utilization | Baseline | Up more than 3× |
| Models per GPU | 1 | 8+ |
| External model invocation cost | ¥400K/month | ¥200K/month |
| Model failure recovery time | ~1 hour | <10 minutes |
| 3× peak traffic success rate | Unstable | 95%+ |
| R&D team size supported | Limited | 2,000+ engineers |

Here is how they got there.

## 03 Why HAMi

> "HAMi's Kubernetes-native integration means zero migration cost. Transparent device virtualization lets workloads run without any modification."
>
> — Jia Haojie, Chief Architect of Cloud AI at Sangfor

Kubernetes provides a unified control plane for the AI platform, but native GPU scheduling allocates whole cards, which cannot serve inference services, multi-tenancy, and heterogeneous GPU environments. Sangfor's approach: let Volcano and HAMi each own their layer — Volcano for advanced scheduling, HAMi for GPU resource virtualization.

Three core reasons for choosing HAMi:

- **GPU sharing** — memory quotas accurate to the MiB and compute slicing down to 1%, with multiple Pods sharing a single GPU under strong isolation;
- **Heterogeneous GPU support** — a unified resource abstraction that keeps the scheduling experience consistent across GPU generations;
- **An active open-source ecosystem** — one of the most active open-source vGPU projects in the Kubernetes space, continuously integrated with Volcano queues and vLLM.

## 04 Platform Architecture: One Request Path + One Compute Foundation

![Sangfor platform architecture: the Data Plane request path and the Component Architecture compute foundation](/images/blog/sangfor-cncf-case-study/architecture.png)

The platform has two layers. The **Data Plane** is the request path: AI applications first pass through the AI Computing Gateway for routing, governance, and security checks, then reach the model service layer. The **Component Architecture** is the compute foundation: Volcano handles job scheduling, HAMi handles GPU virtualization and sharing/isolation, and Kubernetes manages nodes and device plugins, finally landing on heterogeneous GPUs such as NVIDIA and Ascend. The two layers connect between model services and Volcano, completing the end-to-end chain from request to compute.

## 05 GPU Pooling: From One-Model-One-Card to Large/Small Model Co-Location

This is the most visible step of the transformation. Before, the platform ran in dedicated mode — one card, one model:

![GPU pooling before and after: from dedicated mode to vGPU sharing](/images/blog/sangfor-cncf-case-study/gpu-pooling.png)

Introducing vGPU slicing brought two core benefits:

- **Large/small model co-location**: on a single card, the large model takes the lion's share (say 70%), and the remaining slices go to multiple small models, soaking up compute that would otherwise sit idle;
- **Small-model deployment density**: a single card can host 8× or more small-model instances, significantly reducing the need to add cards.

Overall: GPU utilization improved by more than 3×, and per-card model density improved by more than 8×.

## 06 Volcano × HAMi: A Golden Pair, Each Owns Its Layer

GPU sharing alone is not enough for production — device management, quota governance, and job orchestration all have to be there. Combining Volcano with HAMi enables unified management of device resources and job scheduling:

- **Device state maintenance** — GPU health monitoring, automatic fault isolation, automatic resource reclamation;
- **Resource declaration governance** — automatically fills in resource fields, computes quotas uniformly, rejects invalid requests early;
- **Scheduling transaction isolation** — decouples resource trial computation from actual occupancy, ensuring state consistency;
- **Gang and LWS support** — Volcano orchestrates the job, HAMi allocates GPUs, and the whole group is scheduled together.

One sentence to summarize the division of labor: **Volcano decides when and where a workload runs; HAMi decides how GPU resources are shared and allocated.** Once decoupled, each evolves independently.

## 07 Behind the Numbers: What Changed on the Platform

**Fewer cards needed.** With vGPU slicing, multiple inference services share a single GPU with memory and compute allocated on demand; the shared GPU pool eliminates resource fragmentation — inference workloads that previously needed 3 GPUs now fit on 1–2.

**Lower cost.** Combined with smart routing — simple questions to low-cost models, complex questions to premium models — external model invocation costs dropped from ¥400K to ¥200K per month, with safety guardrails keeping cost and quality in balance.

**More stable.** Model failure recovery time dropped from about 1 hour to under 10 minutes; under 3× traffic stress testing, the success rate stayed above 95%; device health monitoring and automatic fault isolation keep faulty GPUs out of the scheduling path.

**Larger scale.** The platform already supports multiple production scenarios including AI coding, enterprise Agents, intelligent customer service, and digital employees, covering the daily work of 2,000+ R&D engineers.

## 08 Three Replicable Lessons

**Share before you scale out.** Most inference workloads cannot fill an entire GPU. Before buying more hardware, prioritize GPU sharing — higher ROI, faster payoff.

**Decouple scheduling from resource virtualization.** GPU sharing without smart scheduling leads to suboptimal placement; scheduling without GPU virtualization leaves nothing to schedule. HAMi owns resource abstraction, Volcano owns scheduling policy — decoupled, each layer evolves independently.

**Kubernetes is becoming the AI resource control plane.** AI infrastructure is evolving along the cloud-native path, not as a standalone resource management system. The Kubernetes + Volcano + HAMi combination gives enterprises enterprise-grade GPU management without introducing a new management paradigm.

## 09 Next Steps: Moving Forward with the Community

Sangfor will continue working with the HAMi community to push Kubernetes toward becoming the unified control plane for AI workloads:

- Join the HAMi DRA ecosystem to advance Kubernetes-native GPU resource management;
- Extend support for heterogeneous GPUs such as Ascend through HAMi's unified abstraction;
- Contribute production-grade scheduling policies and operational best practices back to the Volcano and HAMi communities.

## 10 About HAMi

HAMi is a CNCF Incubating project and an open-source cloud-native GPU virtualization middleware that provides sharing, isolation, and scheduling for heterogeneous accelerators in AI workloads. It supports mainstream accelerators including NVIDIA, AMD, Ascend, Cambricon, Hygon, Moore Threads, Iluvatar, Enflame, Kunlunxin, MetaX, and AWS Neuron.

- **Website**: https://project-hami.io
- **HAMi GitHub**: https://github.com/Project-HAMi/HAMi (Star ⭐ welcome)
- **Volcano GitHub**: https://github.com/volcano-sh/volcano
- **Community**: Discord (recommended), Slack #hami-dev, and community bi-weekly meetings — see https://project-hami.io/community

If GPU utilization and multi-tenant scheduling are hurting your team too, share this post with colleagues building AI infrastructure, and bring your scenarios and requirements to GitHub Issues and the community channels.

---

**This case was co-produced by Dynamia AI and Sangfor, and published as the CNCF case study "[Sangfor Builds an Enterprise AI Compute Platform on Kubernetes, Volcano, and HAMi](https://www.cncf.io/case-studies/sangfor/)".**
