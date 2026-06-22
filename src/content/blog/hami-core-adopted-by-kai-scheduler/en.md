---
title: >-
  Dynamia Leads HAMi-core Integration into KAI Scheduler, Closing the Hard Isolation Gap for Production-Grade GPU Sharing
linktitle: HAMi-core joins KAI Scheduler
date: '2026-06-17'
excerpt: >-
  KAI Scheduler originates from the core scheduling engine of Run:ai, was open-sourced by NVIDIA, and has entered the CNCF Sandbox. Led by Dynamia, the HAMi-core integration has now landed in the KAI Scheduler mainline, giving its GPU sharing capability hard runtime memory isolation.
author: Dynamia AI
tags:
  - HAMi
  - KAI Scheduler
  - GPU Sharing
  - GPU Virtualization
  - AI Infrastructure
  - Cloud Native
category: Integration & Ecosystem
language: en
coverImage: /images/blog/hami-core-adopted-by-kai-scheduler/timeline-en.png
---

> **Editor's note:**
>
> KAI Scheduler originates from the core scheduling engine of Run:ai, was open-sourced by NVIDIA, and has entered the CNCF Sandbox. Led by **Dynamia**, the HAMi-core integration has now landed in the KAI Scheduler mainline, giving its GPU sharing capability hard runtime memory isolation.

Over the past year, the pressure on enterprise AI infrastructure has been shifting from "training large models" to "continuously running AI applications." As agents, knowledge-base Q&A, multimodal applications, and inference services enter enterprise production systems, the GPU question is no longer just "do we have enough?" but "can it be safely shared?" GPU sharing can improve utilization, but if the scheduler allocates a memory quota while the container runtime can still see the full GPU memory, sharing remains a "cooperative constraint" rather than production-grade isolation.

This is exactly the production problem that HAMi-core addresses by integrating into KAI Scheduler and adding hard runtime memory isolation. This is far from a one-off technical adaptation — it is the result of long-term technical collaboration between Dynamia, the HAMi open-source community, and the KAI Scheduler community. Back during KubeCon + CloudNativeCon Europe 2025 in April 2025, **Xiao Zhang (Founder & CEO of Dynamia)** and **Mengxuan Li (Co-founder & CTO of Dynamia)** led the HAMi project they primarily founded in exchanges with the Run:ai / KAI Scheduler community around AI workload scheduling, GPU sharing, and resource isolation. This thread of collaboration then settled into KAI Scheduler community PR #60 "Resource isolation design," with ongoing work across resource-isolation architecture, component boundaries, deployment models, API design, user documentation, and end-to-end validation.

![Xiao Zhang, Founder & CEO of Dynamia (left), and Ronen Dar, CTO of Run:ai (right), at KubeCon Europe 2025](/images/blog/hami-core-adopted-by-kai-scheduler/kubecon-eu-2025-zhangxiao-ronen-dar.png)

![Run:ai Senior Software Engineer (left), Mengxuan Li, Co-founder & CTO of Dynamia (center), and Xiao Zhang, Founder & CEO of Dynamia (right), at KubeCon Europe 2026](/images/blog/hami-core-adopted-by-kai-scheduler/kubecon-eu-2026-team.png)

![KAI Scheduler project PR on GitHub](/images/blog/hami-core-adopted-by-kai-scheduler/kai-scheduler-pr.png)

From the acquisition of Run:ai, to KAI Scheduler being open-sourced and entering the CNCF, to HAMi-core landing in the mainline, this timeline also explains why this collaboration is not an isolated adaptation. The value of this integration lies not only in HAMi-core being adopted by KAI Scheduler, but in pushing "resource isolation" into the production path: after scheduling completes, how do we ensure every workload truly respects memory boundaries at the container runtime?

![Key timeline](/images/blog/hami-core-adopted-by-kai-scheduler/timeline-en.png)

## Closing the Key Gap in Production-Grade GPU Sharing: Hard Memory Isolation

KAI Scheduler is a CNCF Sandbox project and a Kubernetes-native AI workload scheduler. It targets training, inference, and multi-team resource-sharing scenarios in large-scale AI clusters, supporting Gang Scheduling, hierarchical queues, fair scheduling, fractional GPU sharing, topology awareness, and elastic workloads.

In short, KAI Scheduler answers how an enterprise AI platform can schedule tasks more fairly, more stably, and with less waste under limited GPU resources.

But in GPU sharing scenarios, scheduling solves "where a task runs and how much resource it gets." KAI Scheduler's Fractional GPU lets multiple workloads share the same GPU by proportion or by memory size; without runtime isolation, tasks can still cross boundaries once they actually run.

In other words, the scheduler can keep the books straight, but it can't always stop over-usage at the container runtime. This difference is negligible in a test environment, but in a multi-team, multi-tenant production platform it becomes a stability and accountability issue.

Common risks include:

- Workloads may over-use memory, triggering OOM or affecting other tasks on the same card.
- Tenants lack real resource boundaries, making it hard for the platform to form stable service commitments.
- While GPU sharing improves utilization, it also makes fault localization and accountability harder.

This is where HAMi-core comes in. Through a CUDA interception library, it enforces GPU memory and compute isolation at the container level. Once integrated, KAI Scheduler handles AI workload scheduling while HAMi-core enforces memory-usage boundaries at runtime. Strictly speaking, the integration target is HAMi-core, not the full HAMi platform. KAI Scheduler keeps its own scheduling capability and brings in HAMi-core for GPU Memory Isolation. The two form a clean, loosely coupled, and sustainably evolving technical collaboration.

![KAI handles scheduling order, HAMi-core handles resource boundaries, and Dynamia drives enterprise adoption](/images/blog/hami-core-adopted-by-kai-scheduler/kai-hami-core-dynamia-en.png)

![From scheduling to isolation, GPU sharing forms a closed production loop](/images/blog/hami-core-adopted-by-kai-scheduler/gpu-sharing-production-loop-en.png)

This division of labor is especially important for enterprise customers. KAI Scheduler doesn't have to give up its own scheduling system, and HAMi-core doesn't need to replace the scheduler. Each focuses on what it does best, forming a closed loop that lets enterprises gain both higher resource utilization and clearer isolation boundaries when using GPU sharing.

This moves GPU sharing from "resource allocation at the scheduling layer" into "hard isolation at the runtime layer." For an enterprise AI platform, GPU sharing becomes much closer to a capability that can be reliably launched and continuously operated.

For the KAI Scheduler community, HAMi-core fills a key gap in GPU sharing for resource isolation. For the HAMi ecosystem, entering the KAI Scheduler mainline brings its hard GPU memory isolation into a more mainstream cloud-native AI scheduling path, where it can be validated in more complex multi-tenant scenarios going forward.

## Value for the Enterprise Market: Lowering the Risk of Bringing GPU Sharing into Production

As training, inference, fine-tuning, and agent applications enter enterprise production systems, GPU clusters are becoming shared infrastructure used jointly by multiple teams, tenants, and task types. Platform teams care about more than "how many GPUs are left" — they care about "whether these GPUs can be shared stably, fairly, and accountably."

GPU sharing is an important direction for improving utilization, but whether an enterprise dares to enable it at scale in production depends on whether the platform can answer three questions.

First, can the platform cap the real memory usage of a single task, rather than only recording the requested value?

Second, when a tenant or task crosses the line, will it affect other tasks on the same card?

Third, can the platform team form explainable and accountable service commitments based on these boundaries?

This integration answers these three questions directly. KAI Scheduler handles "how tasks are fairly placed onto the right GPUs," and HAMi-core handles "whether tasks truly hold their memory boundaries once running." Combined, GPU sharing is no longer just about saving cost — it becomes much closer to a capability an enterprise platform can operate long-term.

For Dynamia, the positioning is also clearer: HAMi provides the open-source foundation for GPU virtualization and heterogeneous compute governance, while the company drives these capabilities into real AI infrastructure scenarios through enterprise-grade deployment, compatibility adaptation, observability, operational support, and commercial delivery.

## Significance for the HAMi Ecosystem and Dynamia

From the HAMi ecosystem's perspective, HAMi-core being adopted by KAI Scheduler is a clear validation of the technical direction. It shows that low-level capabilities like CUDA interception and hard GPU memory isolation are being incorporated into the critical path of production-grade GPU sharing.

The change it brings can be summarized in two points.

### First, it validates the production value of HAMi's technical path

GPU memory isolation is a low-level capability, but it directly affects whether an enterprise can safely enable GPU sharing. The KAI Scheduler community bringing in HAMi-core to fill the resource-isolation gap shows that HAMi-core's technical approach to this problem has real production value.

### Second, it strengthens Dynamia's commercial credibility with the enterprise market

HAMi is the open-source technical foundation; Dynamia is the entity responsible for enterprise-grade productization, production rollout, ecosystem adaptation, and commercial services. This collaboration connects HAMi's open-source technical influence with Dynamia's enterprise-delivery value, and gives enterprise customers a clearer reference when evaluating GPU sharing solutions.

## Conclusion: The Next Step for GPU Sharing Is Moving from "Allocatable" to "Governable"

As AI workloads enter production systems, the core question of GPU sharing is no longer just "can it be allocated," but "can the boundary be held once allocated." HAMi-core integrating into KAI Scheduler puts scheduling, sharing, and runtime isolation into the same production path, and sends a clearer industry signal: AI infrastructure competition is moving from point-solution resource efficiency toward systemic governance over multi-tenant, multi-workload, and heterogeneous compute.

> This article focuses on the industry context, enterprise value, and strategic significance of this ecosystem collaboration. For the full technical implementation, installation, configuration, and usage, see the technical version in the HAMi community docs: <https://project-hami.io/blog/hami-core-adopted-by-nvidia-kai-scheduler>
