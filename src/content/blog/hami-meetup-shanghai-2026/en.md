---
title: 'Efficiency over Raw Compute | HAMi Meetup Shanghai Recap: From Heterogeneous Compute Management to AI Production Practice'
linktitle: HAMi Meetup Shanghai 2026 Recap
date: '2026-09-09'
excerpt: >-
  Five production talks unpacking AI compute efficiency. Recap of the HAMi Meetup Shanghai Incubating
  special event: remote GPUs and HAMi 2.10, the llm-d distributed inference control plane, SLO-driven
  inference on Chinese GPUs, Volcano + HAMi-core scheduling and isolation, and UCloud's AI platform
  engineering.
author: Dynamia
tags:
  - HAMi
  - HAMi Meetup
  - llm-d
  - Remote GPU
  - Distributed Inference
  - Iluvatar CoreX
  - Volcano
  - UCloud
  - CNCF
  - Heterogeneous Computing
category: Community & Events
coverImage: /images/blog/hami-meetup-shanghai-2026/image1.png
language: en
---

As large models move into production, the real question enterprises face is no longer "do we have GPUs," but how to turn scattered, heterogeneous, scarce compute into infrastructure that is schedulable, isolated, observable, and continuously deliverable.

Remote GPUs, distributed inference, Chinese GPU adaptation, Kubernetes heterogeneous compute foundations, and AI platform engineering are converging from isolated technical topics into a single industry question: **how does compute efficiency actually reach the production side?**

On September 6, the "Efficiency over Raw Compute | HAMi Meetup Shanghai · Incubating Special Event," co-hosted by Dynamia and the HAMi community with support from the Shanghai Wujiaochang Innovation & Entrepreneurship Institute, came to a successful close. It was the fourth meetup in the series — and the first in-person technical event since HAMi entered CNCF Incubating.

![HAMi Meetup Shanghai venue](/images/blog/hami-meetup-shanghai-2026/image1.png)

One opening keynote, five technical talks, and a community panel examined, from the perspectives of open-source frameworks, GPU vendors, end users, cloud providers, and community governance, the key problems AI infrastructure must solve on the road from "resources available" to "production ready."

## Opening: HAMi Enters CNCF Incubating

In July 2026, HAMi was officially promoted to CNCF Incubating status. As of September, only six projects worldwide had reached this stage in 2026. Incubating means the project has passed CNCF's systematic evaluation of real-world adoption, technical maturity, and community governance — marking a more mature stage of community development.

For this milestone, **Keith Chan, CNCF China Director and Linux Foundation APAC VP**, delivered the opening speech once again. From joining earlier HAMi community events to opening the first offline event after the promotion, Keith's continued participation reflects CNCF's attention to HAMi's growth and to cloud-native AI infrastructure more broadly.

In his talk, "CNCF × PyTorch: Building a Cloud-Native AI R&D Foundation for Industry," Keith started from the three challenges enterprises commonly face — cost overrun, efficiency bottlenecks, and limited scale — and walked through the layered architecture in which PyTorch models and runtimes, CNCF orchestration services, and resource management components together support AI from development through training to deployment.

Within that architecture, HAMi provides heterogeneous AI compute virtualization and resource management, supporting sharing, isolation, and intelligent scheduling for GPUs, NPUs, and other accelerators — setting fuller industry context for the talks on GPU scheduling, inference efficiency, and production practice that followed.

![Keith Chan, CNCF China Director and Linux Foundation APAC VP](/images/blog/hami-meetup-shanghai-2026/image2.png)

## 01 | From Local GPUs to Remote Compute Pools

Li Mengxuan, Co-founder and CTO of Dynamia, HAMi author and maintainer, presented "From Local Devices to Remote Compute Pools: Remote GPU Solutions and What's New in HAMi 2.10."

When GPUs are scattered across nodes, data centers, or clusters, the traditional assumption that "devices must live where the task runs" limits the scheduling scope. The core value of remote GPUs is to further release devices from the physical boundaries of local nodes, so compute can be accessed and scheduled as a pool.

For heterogeneous resource governance in production, HAMi v2.10 brings a set of updates: KAI Scheduler adaptation, vNPU partitioning and monitoring upgrades, the mutex scheduling policy and policy combinations, more flexible dynamic MIG, and continued progress in HAMi-DRA around device allocation, resource reuse, and Ascend support.

The talk also stressed an easily overlooked point: **compute efficiency does not end at "allocation succeeded."** The platform still needs to know which tasks occupy each card, how much compute and VRAM were allocated, and how much the application actually uses. Only when scheduling, allocation, and real usage can be observed together does a GPU truly become a governable production resource.

![Li Mengxuan, Co-founder and CTO of Dynamia, HAMi author](/images/blog/hami-meetup-shanghai-2026/image3.png)

## 02 | Distributed Inference Grows a Control Plane

Zhang Jiaju, Red Hat Greater China CTO, presented "llm-d: Building a Distributed Inference Plane across Workloads, Modalities, Hardware, and Platforms."

As model sizes, request types, and hardware environments grow more complex, no single inference engine can independently solve every production problem. llm-d focuses on the inference control plane: intelligent routing, KV cache management, Prefill/Decode disaggregation, flow control, autoscaling, and batching, so that different inference endpoints can coordinate around real-time load and service objectives.

From the v0.8 roadmap, llm-d's positioning is now explicit: not a fork of any inference engine, but an independent control layer built around routing, endpoint selection, cache management, and elasticity — with mechanisms like EndpointDiscovery extending scheduling beyond Kubernetes into Slurm, bare metal, and RL training scenarios.

For multi-tenant, agentic AI, multimodal, and large-scale batch workloads, the key capability of an inference platform is shifting from "getting the model to run" to **holding latency, throughput, and service stability under complex traffic — continuously.**

![Zhang Jiaju, Red Hat Greater China CTO](/images/blog/hami-meetup-shanghai-2026/image4.png)

## 03 | Inference on Chinese GPUs: Accepted by SLO, Not by Allocation

Ye Chenglin, Infra R&D Director at Iluvatar CoreX (Iluvatar), shared "High-Performance Inference Deployment on Iluvatar CoreX GPUs" — the full engineering path of a Chinese GPU entering the mainstream inference ecosystem.

At the upper layer, OpenAI-compatible APIs, vLLM, and Hugging Face interfaces keep migration costs down; underneath, the in-house software stack — IxFormer, IXInfer, ixDNN, ixBLAS, IXCCL, and IXLink — delivers operator, runtime, and multi-card communication performance. GPUClusterPolicy, Device Plugin, DRA, topology-aware scheduling, and HAMi small-model GPU sharing all feed into a unified resource control plane.

One judgment from the talk deserves special attention: **a completed device allocation does not mean the service is ready — the first token that meets SLO is what counts as delivered.** From device allocation and GPU-NIC topology binding to weight loading, warm-up, routing leases, and first token, every step needs to be observable and acceptance-testable.

For Prefill/Decode disaggregation, the criterion is likewise not "can it be split architecturally," but whether the prefill compute savings and decode queueing gains cover the costs of KV transfer, extra routing, remote queueing, and failure recovery. TTFT, TPOT, scale-to-first-token, KV transfer, and effective tokens are the final yardstick for cluster performance.

![Ye Chenglin, Infra R&D Director at Iluvatar CoreX](/images/blog/hami-meetup-shanghai-2026/image5.png)

## 04 | Volcano + HAMi-core: Scheduling and Isolation

Dong Jiang, Senior Architect at iFLYTEK and member of the Volcano and HAMi communities, shared the practice of "Building a K8s Heterogeneous AI Compute Foundation with Volcano + HAMi-core."

In large-scale training and inference clusters, resource fragmentation, diverse job types, distributed training, legacy task migration, multi-tenant quotas, and complex workflows all appear at once. Solving any single scheduling problem in isolation rarely produces a stable AI compute foundation.

This practice uses Volcano to uniformly carry multi-engine orchestration, queue management, DAG workflows, gang scheduling, binpack scheduling, real-load awareness, and resource fairness, while HAMi-core provides GPU VRAM and compute isolation, fine-grained partitioning, and multi-architecture compatibility.

Binpack scheduling alone raised resource utilization by 40%. More importantly, the practice reveals a dual objective in production: reduce fragmentation and improve sharing efficiency, while containing the stability risks of task failures, OOM, and fault propagation across shared GPUs. **Scheduling puts resources in the right place; isolation keeps the business reliable after sharing.**

![Dong Jiang, Senior Architect at iFLYTEK, Volcano and HAMi community member](/images/blog/hami-meetup-shanghai-2026/image6.png)

## 05 | Making GPUs a Ready-to-Use Dev Environment

Peng Peng, Senior R&D Engineer at UCloud, moved the discussion from resource management to environment delivery in "Engineering Challenges and Practices of AI Compute Platforms."

For internal algorithm teams, self-built inference clusters, and enterprise customers with their own GPUs, the common need is not another hardware inventory, but turning owned GPUs into manageable, deliverable, directly usable compute services. The more heterogeneous the bottom layer, the simpler developers expect things to be — the complexity must be absorbed inside the platform.

Around a single dev-environment delivery, the talk broke down five consecutive engineering gaps: how resources are uniformly expressed, how multiple clusters are connected, how dev tools are flexibly assembled, how images become ready quickly, and how GPUs are used efficiently. The corresponding practices include Instance Spec resource abstraction, lightweight multi-cluster access, runtime tool injection, on-demand image loading, and scenario-specific GPU isolation.

On GPU isolation, different deployment shapes need different paths: private AI platforms can adopt HAMi vGPU for sharing efficiency; public-cloud consumer scenarios need kernel-level vGPU to complete the isolation boundary; public-cloud B2B must make engineering trade-offs among QEMU passthrough, shared NVSwitch fabric, and PCIe-only.

Once dev environments can be delivered quickly, new bottlenecks move on to model weight loading, Prefill/Decode coordination, KV cache, idle CPU reuse, and heterogeneous compute selection and migration. The end state of an AI compute platform is not "managing clusters" — it is letting developers get stable environments faster, and letting models run on the compute that fits them best.

![Peng Peng, Senior R&D Engineer at UCloud](/images/blog/hami-meetup-shanghai-2026/image7.png)

## Panel | Setting Off Again from Incubating

After the talks, the event moved to a community panel. Starting from the panelists' real experiences using and contributing to HAMi, the discussion extended to open-source collaboration in the age of AI coding, and HAMi's next stage of technical evolution.

![Community panel](/images/blog/hami-meetup-shanghai-2026/image8.png)

Three themes dominated:

- **From user to contributor.** Panelists shared the real scenarios in which they chose HAMi inside enterprises, and discussed how newcomers can start participating from real issues, docs, tests, or a first PR.
- **How AI coding enters open-source collaboration.** AI-generated code is not the problem itself; what matters is whether contributors genuinely understand the code, proactively disclose AI involvement, and take responsibility for the result. Code review likewise needs to extend from checking implementation to whether the requirement is real, the design sound, and the boundaries clear.
- **How HAMi faces AI next.** The panel discussed MCP and automated diagnostics tooling, project knowledge base building, and trends such as large and small models coexisting and Chinese heterogeneous compute continuing to grow. For HAMi, partitioning, sharing, isolation, and scheduling remain a broad and lasting application space.

Entering Incubating marks a new stage in HAMi's technical maturity and community growth. Next, the community needs both to lower the barriers for newcomers and user troubleshooting, and to keep answering real production compute-management needs, so that more enterprises, developers, and ecosystem partners can co-build the project.

## Five Talks, One Common Answer

From HAMi's remote GPU and DRA evolution, to llm-d's distributed inference control plane; from end-to-end SLO on Chinese GPUs, to Volcano + HAMi-core scheduling and isolation, to environment delivery on AI compute platforms — five talks covered different layers of the stack, yet all pointed to the same thing:

> **Compute efficiency is not a single component's capability. It is a systems engineering effort spanning resource access, scheduling, isolation, routing, observability, delivery, and community collaboration.**

For enterprises building AI platforms, three points are worth taking home:

1. **Allocatable resources do not mean operable compute.** Real utilization, topology, tenant boundaries, and task lifecycles must all enter unified governance.
2. **A model that starts is not a delivered inference service.** First token, tail latency, throughput, cache, and failure recovery must all pass SLO verification together.
3. **Technology that lands is not a sustainable ecosystem.** Only by distilling enterprise problems into open, reusable community capabilities can a project serve more hardware, platforms, and real scenarios.

![Event venue](/images/blog/hami-meetup-shanghai-2026/image9.png)

![Event venue](/images/blog/hami-meetup-shanghai-2026/image10.png)

![Event highlights](/images/blog/hami-meetup-shanghai-2026/image11.png)
