---
title: 'HAMi Meetup Shanghai Deep Dive (2): After GPU Sharing — Isolation, Scheduling, and Observability in HAMi 2.10'
linktitle: HAMi 2.10 — Isolation, Scheduling, Observability
date: '2026-09-22'
excerpt: >-
  Slicing one GPU across multiple jobs is only the beginning of sharing. Dynamia co-founder and CTO
  and HAMi Maintainer Li Mengxuan walked through HAMi v2.10 progress, DRA ecosystem adaptation, and the v2.11
  roadmap announced on stage (Remote GPU, CPU NUMA alignment). The through-line: after sharing, compute
  must be allocated on demand and constrained, observable, and diagnosable while it runs.
author: Dynamia
tags:
  - HAMi
  - HAMi Meetup
  - GPU Virtualization
  - Heterogeneous Scheduling
  - DRA
  - Remote GPU
  - KAI Scheduler
category: Community & Events
language: en
coverImage: /images/blog/hami-meetup-shanghai-2026-hami-2-10-remote-gpu/slide-07-kai-scheduler-hami-core.png
---

Giving one GPU to multiple jobs is only the start of resource sharing. For enterprise platform teams, the questions that follow are harder: does every job honor its quota, can allocations be observed, and how should different devices and jobs be scheduled? Otherwise the books say "shared," while runtime usage remains a black box.

This is the second deep-dive in our [HAMi Meetup Shanghai](/blog/hami-meetup-shanghai-2026/) series. **Li Mengxuan**, co-founder and CTO of Dynamia and HAMi Maintainer, presented "From Local Devices to Remote Compute Pools: Remote GPU and HAMi 2.10 New Capabilities," covering v2.10 progress, DRA ecosystem adaptation, and the v2.11 roadmap announced during the talk. The thread connecting them: shared compute must not only be allocated on demand, but also constrained, observable, and diagnosable while it runs.

## Key Takeaways

- HAMi-core with KAI Scheduler connects scheduling-time allocation to runtime resource limits.
- Composable scheduling policies, mutex, and dynamic MIG address job placement, mutual exclusion, and allocation flexibility respectively.
- HAMi-DRA adds resource request translation, cluster monitoring, and scheduling events; Remote GPU and CPU NUMA alignment were presented as roadmap items, not shipped features.

**Speaker:** Li Mengxuan | Co-founder & CTO of Dynamia, HAMi Maintainer

## How Much Was Allocated — and How Much Is Actually Used

Li opened with two familiar scenes: small jobs requesting whole cards leave resources idle; devices from different vendors and of different models are managed separately, so some clusters queue while others sit empty.

As a heterogeneous compute virtualization middleware, HAMi provides device sharing and unified management in Kubernetes. Jobs can declare the device model and resources they need, and the platform can view jobs, devices, allocated quota, and actual usage in a single picture.

The KAI Scheduler adaptation shows the division of labor between HAMi-core and the scheduling ecosystem. As presented, the scheduler arranges jobs based on resource claims, while HAMi-core enters containers through its injection components and enforces memory and compute limits based on the allocation. The former decides how resources are distributed; the latter constrains how they are actually used. Enterprises with an existing scheduling system can consider integrating sharing capability along this interface — but deployment still requires matching components and versions. Installing the scheduler alone does not give you runtime control.

![KAI Scheduler and HAMi-core: division of sharing control (slide 7)](/images/blog/hami-meetup-shanghai-2026-hami-2-10-remote-gpu/slide-07-kai-scheduler-hami-core.png)

The Ascend soft-slicing update targets another problem: limits may be in effect while device query tools still report full-card memory. New monitoring metrics expose container-level memory usage and limits, letting platforms distinguish device totals from job quotas and confirm slicing behaves as intended.

## Scheduling Policies Compose — and Sharing Needs Boundaries

With multiple jobs sharing GPUs, business requirements can point in opposite directions. Some teams want tasks packed tightly to free whole devices; others are contention-sensitive and prefer spreading. With multi-card communication in play, device topology affects data transfer.

Li explained that v2.10 makes scheduling policies composable. A job can choose a spread strategy, for example, or combine spreading with NUMA considerations so scheduling behavior maps explicitly to business requirements.

The new mutex policy provides GPU-level job mutual exclusion. Jobs that specify mutex will not share a card with other mutex-specified jobs — useful when specific jobs or replicas must avoid landing on the same device. It is not a blanket ban on other jobs using the card; the policy's boundary needs to be understood precisely.

Heterogeneous job support in Ascend scenarios also lets jobs get scheduled across nodes with qualifying template-sliced and soft-sliced configurations, loosening the restriction of pre-committing to a single slicing mode. The precondition for unified scheduling remains that job requirements match device capability.

## Dynamic MIG and DRA: Allocation Flexibility vs. Usage Experience

The dynamic MIG update addresses the inflexibility of preset slicing templates.

If you first cut a whole card into small pieces for small jobs, later larger jobs may not fit the remaining partitions. The new approach presented tracks device slot distribution and matches available MIG profiles and positions against job requests, rather than slicing the whole card up front on a fixed template.

This improves allocation flexibility, but remains bounded by supported MIG profiles and available slots. Remaining aggregate capacity looking sufficient does not guarantee a qualifying placement exists.

The DRA progress solves a different layer of the problem. Once devices can be allocated via DRA, users still need a familiar way to request them, a complete resource view, and an explanation when a job can't be scheduled.

HAMi-DRA addresses these usage touchpoints: it translates resource requests into DRA allocation logic and adds cluster monitoring and scheduling events. Platform engineers can see remaining resources directly and determine whether a job is constrained by device type, memory, or something else. The talk also covered Ascend DRA adaptation progress; actual deployment requires checking Kubernetes versions and driver support.

![HAMi-DRA: division of labor and usage experience (slide 13)](/images/blog/hami-meetup-shanghai-2026-hami-2-10-remote-gpu/slide-13-hami-dra.png)

## Remote GPU and CPU NUMA Alignment: The Next Steps

Li placed Remote GPU on the v2.11 roadmap as announced in the talk. It targets a new usage pattern: a job's node has no GPU, yet the job can still request and access remote compute over the network. The following describes the design direction shared on stage; treat it separately from the v2.10 capabilities above.

The planned design leverages the open source Lupine project to connect jobs running on other nodes to remote GPUs. HAMi senses remote resources, participates in scheduling, and handles connection configuration automatically. As designed, device nodes designated for remote GPU mode will receive the corresponding remote resource requests.

This expands how compute pools can be used, but cross-node access still traverses the network. Network conditions, transfer overhead, and the specific workload determine its applicability — it cannot be assumed to match local GPU performance.

![Remote GPU architecture (v2.11 roadmap, slide 16)](/images/blog/hami-meetup-shanghai-2026-hami-2-10-remote-gpu/slide-16-remote-gpu-architecture.png)

The other planned item is CPU–GPU NUMA alignment. Li was explicit that existing GPU-to-GPU NUMA awareness does not mean the CPU and GPU sit on the same NUMA node. The plan is to take both allocation relationships into account together, reducing the extra overhead of cross-NUMA data exchange.

![CPU–GPU NUMA alignment (v2.11 roadmap, slide 17)](/images/blog/hami-meetup-shanghai-2026-hami-2-10-remote-gpu/slide-17-cpu-gpu-numa-alignment.png)

At Dynamia, we see HAMi's enterprise value in the quality of operations after sharing. Platforms should check requested quota and actual usage together, choose scheduling policies per business constraint, and get explainable reasons when a job cannot be placed. The talk also proposed exploring collaboration with inference frameworks such as llm-d, pairing resource-layer capabilities like GPU topology awareness with upper-layer inference orchestration — another direction that needs validation in concrete scenarios. For enterprise teams, evaluating HAMi should come down to these checkable behaviors, not just how many pieces a card can be cut into.

## Video and Slides

- **Bilibili replay:** [Keynote | From Local Devices to Remote Compute Pools: Remote GPU and HAMi 2.10 New Capabilities — Li Mengxuan](https://www.bilibili.com/video/BV1ZjYK6hEAT/)
- **Download slides:** [remote-gpu-hami-2.10-limengxuan.pdf](https://github.com/Project-HAMi/community/blob/main/hami-meetup/04-shanghai-20260906/remote-gpu-hami-2.10-limengxuan.pdf)

## Series

- [Overview: HAMi Meetup Shanghai Recap](/blog/hami-meetup-shanghai-2026/)
- [(1) Where Does HAMi Fit in the CNCF × PyTorch Cloud Native AI Foundation?](/blog/hami-meetup-shanghai-2026-cncf-pytorch-ai-foundation/)
- **(2) After GPU Sharing: How HAMi 2.10 Improves Isolation, Scheduling, and Observability** (this post)
- [(3) Inference Control vs. GPU Resource Management: How llm-d and HAMi Can Work Together](/blog/hami-meetup-shanghai-2026-llm-d-inference-plane/)
- [(4) Turning GPU Performance into Inference Service Capability: Lessons from Iluvatar](/blog/hami-meetup-shanghai-2026-iluvatar-gpu-inference/)
- [(5) How iFLYTEK Manages Multi-Business GPU Sharing with Volcano + HAMi-core](/blog/hami-meetup-shanghai-2026-volcano-hami-core/)
- [(6) How UCloud Turns HAMi Sharing into Ready-to-Use Development Environments](/blog/hami-meetup-shanghai-2026-ucloud-ai-platform/)
- [(7) From User to Co-Builder: Why Enterprises Need a Sustainable HAMi Community](/blog/hami-meetup-shanghai-2026-community-panel/)
