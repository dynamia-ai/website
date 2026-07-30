---
title: 'Making NPU Easier to Share: HAMi vNPU Technical Evolution and China Merchants Bank Production Practice'
date: '2026-07-30'
excerpt: >-
  On July 25, the CMB Digital Intelligence Innovation Meetup landed in Hangzhou.
  HAMi community Approver and Dynamia engineer Wang Jifei delivered a talk on
  "Making NPU Easier to Share." This article reviews the full evolution of HAMi
  vNPU from hard to soft partitioning, and its joint validation in production
  with China Merchants Bank.
author: Dynamia AI Team
tags:
  - HAMi
  - Meetup
  - vNPU
  - Ascend
  - heterogeneous scheduling
  - cloud native
category: Community & Events
language: en
coverImage: /images/blog/hami-vnpu-cmb-meetup-hangzhou-recap/slide-cover.png
linktitle: HAMi vNPU Evolution & CMB Practice
---

On July 25, the **CMB Digital Intelligence Innovation Meetup, Hangzhou** brought together technical guests from financial institutions, cloud vendors, open-source communities, and AI infrastructure to discuss domestic compute power, cloud-native inference, and resource scheduling. The **HAMi community** was invited to attend, and community Approver and Dynamia (密瓜智能) R&D engineer **Wang Jifei** delivered a talk titled *"Making NPU Easier to Share: HAMi vNPU Technical Evolution and China Merchants Bank Production Practice."*

![Wang Jifei sharing HAMi vNPU at the CMB Digital Intelligence Innovation Meetup in Hangzhou](/images/blog/hami-vnpu-cmb-meetup-hangzhou-recap/wang-jifei-speaking.png)

The heart of this talk was not any single isolated feature, but a coherent thread: how HAMi vNPU moved from "fixed-spec hard partitioning" to "on-demand soft partitioning," and how, along that path, it advanced into financial production environments together with China Merchants Bank (CMB). This article combines the live talk and slides into a more complete technical retrospective.

Full slide deck (PDF): [hami-vnpu-cmb-practice-wangjifei-20260725.pdf](https://github.com/Project-HAMi/community/blob/main/talks/03-cmb-meetup-hangzhou-20260725/hami-vnpu-cmb-practice-wangjifei-20260725.pdf)

> NPU sharing is moving from "works" to "works well" — soft partitioning lets a partitioned NPU be uniformly discovered, scheduled, and governed inside Kubernetes.

## 1. From "Owning Compute" to "Using Compute Well"

As training, inference, and R&D testing workloads keep growing, GPUs and NPUs from different vendors and models are managed in silos, and the waste of small tasks hogging whole cards becomes increasingly painful. The focus of enterprise AI infrastructure is shifting from "owning compute" to "using compute well." Compute must not only be onboarded, but also partitioned, shared, scheduled, and governed — exactly the problem HAMi vNPU set out to solve.

## 2. The Community–CMB Collaboration: A Closed Loop of Needs, Tech, and Validation

![The HAMi community–China Merchants Bank collaboration loop: establish contact → project collaboration → joint validation](/images/blog/hami-vnpu-cmb-meetup-hangzhou-recap/community-cmb-collaboration.png)

The first part of the talk reviewed the collaboration between the HAMi community and China Merchants Bank. Their partnership was not a one-off solution delivery, but a continuous closed loop: a long-term relationship established through community-driven outreach, real projects entered (CMB's Muxi, Kunlunxin, Ascend) to understand the actual needs of heterogeneous compute, and finally the community implementation brought into real environments for joint validation.

Within this loop, China Merchants Bank is both a HAMi user and a key input to the community's iteration — feeding back the real constraints, priorities, and user experience from heterogeneous-compute scenarios, helping the community judge which capabilities truly affect production, avoiding building in a vacuum, and providing devices and environments to validate compatibility, stability, and usability.

> Real production needs are the most precious input an open-source community can receive; China Merchants Bank has gradually grown from a user into a co-builder of the community.

## 3. The Evolution of vNPU: From Hard to Soft Partitioning

### Hard Partitioning: Works, but Far from Flexible Sharing

![The three limitations of hard partitioning: inconsistent specs, hardcoded templates, tightly bound resources](/images/blog/hami-vnpu-cmb-meetup-hangzhou-recap/hard-partition-limitations.png)

Early NPU sharing relied on vendor-predefined hard partitioning. Different models supported different fixed partition types (some split into four, others into seven); resource allocation looked precise but was still bound by hardcoded edges. Wang Jifei distilled the limitations of hard partitioning into three points:

- **Inconsistent specs**: Cross-model experience is hard to keep uniform; ops and scheduling must adapt separately for every device.
- **Hardcoded templates**: Only preset combinations can be chosen; workloads cannot elastically adjust to real demand.
- **Tightly bound resources**: Compute limits and memory limits are bound together, aligned only by memory, capping utilization.

### Why Soft Partitioning Was Once Blocked: Differences in Low-Level APIs

![Soft partitioning blocked by low-level APIs: the GPU path could be intercepted, the NPU path was not controllable at the time](/images/blog/hami-vnpu-cmb-meetup-hangzhou-recap/soft-partition-api-blocked.png)

If hard partitioning was too inflexible, why not just do soft partitioning? Wang Jifei explained that the root cause lay in the low-level APIs. On the GPU path, key runtime APIs can be intercepted and redirected, letting the community enforce resource control between a process and a device; at the time, however, the critical low-level NPU APIs were not open, so the same level of hijacking and control was impossible.

> Without a controllable execution entry point, the upper-layer Device Plugin could only "assign devices" and could not deliver true fine-grained sharing.

### Three Key Changes in Technical Conditions

![The three key changes that made soft partitioning possible: CANN open-sourced, experimental validation, driver upgrade](/images/blog/hami-vnpu-cmb-meetup-hangzhou-recap/three-key-changes.png)

Soft partitioning became viable only as the underlying technology evolved. The community went through three key changes: first, CANN was open-sourced, and once the low-level software stack opened up, the community began preparing to support Ascend sharing; during experimental validation, however, it turned out the device did not yet support the expected multi-process concurrent calls; only after a driver upgrade enabled multi-process did the foundation for sharing truly mature.

There was also a "detour" worth recording along the way — Huawei's open-source Flex:AI. Its goal was to share Ascend NPUs, but its implementation still followed the device limits of the time: requests were gathered via remote calls, and the NPU side effectively ran single-process. It proved that "sharing" could be achieved at the entry layer, but the device side was still constrained by the multi-process limit, and the deployment chain was more complex. The real breakthrough had to wait until the device itself supported multi-process concurrency.

### Soft Partitioning Lands: Multi-Process + hami-core → Kubernetes

![The four-step chain for landing soft partitioning in Kubernetes: discovery & registration, allocation & injection, runtime control, closed-loop validation](/images/blog/hami-vnpu-cmb-meetup-hangzhou-recap/soft-partition-k8s-pipeline.png)

Once the driver upgrade let devices run concurrently, Huawei's Canada lab built the low-level sharing control library (providing hami-core-like capabilities), and this low-level control could then be taken up by the Device Plugin and the Kubernetes scheduling system. Wang Jifei broke production landing into four steps:

1. **Discovery & registration**: The Device Plugin identifies Ascend devices and exposes schedulable resources to Kubernetes.
2. **Allocation & injection**: Scheduling results are translated into devices and sharing configs visible to the container.
3. **Runtime control**: The low-level library enforces resource sharing and limits under multi-process conditions.
4. **Closed-loop validation**: Usability, stability, and experience issues are fed back to the community for continuous iteration.

> GPU scheduling has entered the runtime orchestration layer; it is no longer just simple resource allocation.

### From Lab to Production: Real Feedback Feeds the Community

Between "it runs" and "it's actually good" lies a great deal of engineering detail. Wang Jifei was candid: the real feedback the HAMi community received during landing was that users faced complex driver configuration, inconsistent APIs, and idiosyncratic behavior — a heavy cognitive burden. For example, partition results are invisible inside the container (dsmi is not intercepted, so `npu-smi info` inside the container still shows the whole card), and a newly allocated vNPU device is automatically reclaimed after sitting idle for a while — all areas the community must keep polishing.

It is precisely this "bring production problems back to the community" collaboration that precipitates reusable open-source capabilities. In the joint validation with China Merchants Bank, the onboarding rate of the relevant super-node hardware reached **100%**, the cross-machine scheduling probability dropped by **30%**, and the resource partition granularity reached **1 GB of memory and 1% of compute**.

## 4. Performance Data: The Inflection Point of 2 / 4 / 8 / 16-Way Partitioning

![Performance inflection data for 2 / 4 / 8 / 16-way partitioning](/images/blog/hami-vnpu-cmb-meetup-hangzhou-recap/performance-inflection-table.png)

How fine should soft partitioning go? Wang Jifei offered a set of measured data. Test environment: a single 910C card, a 7B-class model, 200 input / 128 output tokens, one request per vNPU, P50:

| Partition | TTFT (ms) | TPOT (ms/token) | Instances per card | Scenario |
|-|-|-|-|-|
| 1 / 2 | 78 | 24.0 | 2 | Tight latency SLA |
| 1 / 4 | 92 | 29.7 | 4 | Recommended online balance |
| 1 / 8 | 134 | 43.9 | 8 | Density-first / relaxed SLA |
| 1 / 16 | 248 | 76.4 | 16 | Dev & test / offline |

![A 4-way split is the recommended balance point for online services](/images/blog/hami-vnpu-cmb-meetup-hangzhou-recap/performance-balance-card.png)

The key observation is the "inflection point," not "the finer the better." Compared with a 2-way split, a 4-way split adds only about 18% TTFT and 24% TPOT — latency stays controllable — while raising instance density per card to 4; 8-way and 16-way splits trade noticeably more latency for instance density, suited to lightweight models, async requests, or more relaxed SLAs, and even dev/test and offline workloads. So for online services, **a 4-way split is the recommended balance point**.

> Partition granularity is not "the finer the better" — finding the finest tier that still meets your SLA is the real optimization goal.

## 5. Future Outlook: Experience Improvements and Dynamic Governance

![Future outlook: from static partitioning to dynamic governance — Profiling, compute preemption, resource oversubscription](/images/blog/hami-vnpu-cmb-meetup-hangzhou-recap/future-outlook.png)

At the end of the talk, Wang Jifei touched on two directions. In the short term, experience improvements: unify management of hard and soft partitioning; allocate tasks on demand, transparently to upper layers; make partition results visible inside containers and fill in container-level compute/memory monitoring; keep the Volcano Ascend device-plugin updated to strengthen the compatibility matrix; and refine values config and error logs so users can self-diagnose common issues. In one sentence — let users remember fewer rules, let the platform see state clearly, let upgrades stay bounded, and let anomalies recover.

Going further, advanced capabilities move from static partitioning to dynamic governance: through Profiling, collect operator, memory, compute, and latency characteristics to understand load and identify inter-task interference; once resource boundaries are controllable and state is visible, do compute preemption (dynamically reclaim or compress lower-priority compute when a high-priority task arrives, while controlling recovery cost and tail latency) and resource oversubscription (share spare capacity based on real usage rather than static requests, with risk watermarks, rate limiting, and fallback mechanisms to avoid losing control) — thereby understanding load, adjusting dynamically, and raising overall utilization.

## Conclusion

As we move from cloud-native to AI-native, enterprises need not just more compute, but an infrastructure foundation that can uniformly manage, flexibly share, and continuously govern compute power. The evolution of HAMi vNPU from hard to soft partitioning, and its production landing with China Merchants Bank, is a solid step on this path — and the fact that real needs keep feeding back into the open-source community, letting CMB grow from user to co-builder, is the longer-term value of this work.

> Advancing AI infrastructure through community collaboration rather than closed systems — that is the way HAMi has always insisted on.

HAMi project: [github.com/project-hami/hami](https://github.com/project-hami/hami). If you are interested in NPU sharing or heterogeneous compute scheduling, welcome to join the HAMi community and help push forward AI compute management on Kubernetes.
