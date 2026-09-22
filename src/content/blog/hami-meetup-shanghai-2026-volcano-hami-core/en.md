---
title: 'HAMi Meetup Shanghai Deep Dive (5): How iFLYTEK Manages Multi-Business GPU Sharing with Volcano + HAMi-core'
linktitle: iFLYTEK's Volcano + HAMi-core Practice
date: '2026-09-22'
excerpt: >-
  Research jobs want GPUs now; online business needs guaranteed resources. Dong Jiang, Senior Architect
  at iFLYTEK, shared "Building a K8s Heterogeneous AI Compute Base with Volcano + HAMi-core" at HAMi
  Meetup Shanghai: queue management and orchestration layered with in-card resource control, letting different
  businesses keep their own execution paths while shared resources get clear usage rules.
author: Dynamia
tags:
  - HAMi
  - HAMi Meetup
  - iFLYTEK
  - Volcano
  - HAMi-core
  - GPU Sharing
  - Heterogeneous Computing
category: Community & Events
language: en
coverImage: /images/blog/hami-meetup-shanghai-2026-volcano-hami-core/slide-07-k8s-volcano-hami-core-roles.png
---

Research jobs want GPUs as soon as possible; online business needs stable resource guarantees; data processing and model training each come with their own orchestration tools. For an enterprise AI platform to let these workloads share compute, it must answer three questions at once: who may use which resources, when idle capacity can be borrowed, and how interference is located and recovered. HAMi-core's fine-grained resource control has to work together with cluster scheduling, business processes, and runtime records.

This is the fifth deep-dive in our [HAMi Meetup Shanghai](/blog/hami-meetup-shanghai-2026/) series. **Dong Jiang**, Senior Architect at iFLYTEK, presented "Building a K8s Heterogeneous AI Acceleration Compute Base with Volcano + HAMi-core" — a real, combined practice. The team pairs Volcano's queueing and orchestration with HAMi-core's GPU resource control, letting different businesses keep their own execution paths while shared resources get clear usage rules. Following this practice shows how HAMi enters an enterprise's existing platform system.

## Key Takeaways

- iFLYTEK combines Volcano's queueing and job orchestration with HAMi-core's in-card resource control.
- Online services and research jobs get resources by guarantee tier; existing business workflows are preserved.
- Legacy GPU sharing must be designed alongside monitoring and fault handling — user-space resource limits are not hardware-level fault isolation.

**Speaker:** Dong Jiang | Senior Architect, iFLYTEK

## Volcano Owns Allocation Rules; HAMi-core Owns In-Card Resources

iFLYTEK's AI infrastructure supports education, healthcare, and smart-city businesses, with workloads spanning data processing, model training, inference, and R&D. Different jobs want different things. Recomputable, deferrable research jobs and must-stay-stable online services cannot share one allocation rule.

The practice runs Kubernetes for nodes and the base runtime, Volcano for multi-workload scheduling and orchestration, and HAMi-core for fine-grained GPU memory and compute quota control. Volcano organizes how jobs obtain resources; HAMi-core controls resource usage within a shared GPU. With that division clear, in-card sharing can plug into the platform's job scheduling and tenant management rules.

![Responsibility split among Kubernetes, Volcano, and HAMi-core (slide 7)](/images/blog/hami-meetup-shanghai-2026-volcano-hami-core/slide-07-k8s-volcano-hami-core-roles.png)

At the organization level, the platform maps business needs onto dedicated and shared queues, with minimum guarantees, maximum quotas, and weights. Idle capacity can be borrowed by other queues and reclaimed by rule when needed — guarantee and elastic sharing coexist.

![Resource allocation between dedicated and shared queues (slide 8)](/images/blog/hami-meetup-shanghai-2026-volcano-hami-core/slide-08-dedicated-shared-queues.png)

Borrowing has a price, though. Reclamation can trigger job eviction and rebuilds, so whether a job is recomputable and interruptible must enter queue design up front. Only when sharing rules correspond to business priorities does the pressure to raise utilization stay off critical services.

## Keep Business Entry Points; Unify Execution Underneath

Tools enterprises already run — Airflow, Spark — often carry years of accumulated business process. Forcing every team onto a brand-new orchestration entry point adds migration cost.

Dong described the alternative: abstract a job's atomic operations into JobTemplates, organize job dependencies into JobFlows, and reuse common flows via workflow templates. When execution parameters like images or datasets change, patch the specific instance.

Legacy tools keep their orchestration logic and invoke underlying jobs through the corresponding Kubernetes operators; when the jobs run as Pods, Volcano and HAMi-core together handle allocation and control. Enterprises keep the workflows they already use, bring the underlying compute under unified management, and avoid redoing business entry points just to introduce GPU sharing.

Upstream and downstream data connect through persistent volumes and similar means, reducing duplicate copies. Concurrency, consistency, and storage performance still need handling — adopting shared storage doesn't waive those constraints. For dev and debugging, an instance can start from a specific workflow node using partial data to validate changes, instead of rerunning the entire pipeline every time.

## HAMi-core's Selection Value Comes with Its Usage Boundary

At the scheduling layer: gang scheduling coordinates resource needs of distributed jobs; binpack packing reduces fragmentation; real-load awareness watches the gap between requested and actually used resources to inform placement.

The combination solves different-level problems. A cluster having leftover resources doesn't mean the distribution can start a large job; a job's declared request doesn't always reflect its runtime load.

Dong explained that the team organized legacy T4 and A30 resources for research scenarios, and a key reason for choosing HAMi-core was finer-grained memory and compute control for jobs on heterogeneous devices. He also drew the line between resource limits and strong isolation: HAMi-core controls resource usage through user-space mechanisms; when jobs share a card, interference and fault impact between businesses still need assessment — it is not hardware-level fault isolation.

The oversubscription experiments in the research environment had explicit preconditions too. Experiment resources are marked apart from production, and research jobs must accept possible interruption or recomputation. That approach cannot be copied to online services requiring continuous stability — nor taken to mean memory can be oversold without constraint.

## Traceable Resource Behavior Is What Makes Scheduling Rules Improvable

After multi-tenant sharing, the platform still has to answer: who used the resources, when did jobs fail, at which stage did reclamation and rebuild happen?

The team's GPU observability work integrates DCGM, DCMI, and other collection interfaces, and adds device-to-Pod mapping plus creation and exit events. Actively collecting at key lifecycle points reduces the missing context of periodic-only monitoring, supporting troubleshooting and cost attribution.

Job history feeds back into policy adjustment. Whether a job is frequently preempted, whether its memory request is appropriate, whether it belongs in a dedicated or shared queue — all are judged from actual runtime records.

iFLYTEK's practice shows GPU sharing needs a complete set of operating rules. HAMi-core provides fine-grained resource control; Volcano wires that capability into queueing and job orchestration; observability then helps the team correct quotas and placement policy. When enterprises accept shared-GPU results, they should also check critical-job guarantees, reclamation impact, and failure traceability.

What Dynamia values in HAMi's enterprise adoption is exactly this junction between sharing capability and production management. For teams with existing schedulers and business pipelines, platform building should first clarify workload tiering, resource quotas, and fault boundaries — then design integration and validation. iFLYTEK's self-built practice gives enterprises a concrete reference for evaluating how HAMi fits their existing system.

## Video and Slides

- **Bilibili replay:** [Keynote | Building a K8s Heterogeneous AI Compute Base with Volcano + HAMi-core — Dong Jiang](https://www.bilibili.com/video/BV1gKY563Eqd/)
- **Download slides:** [volcano-hami-core-k8s-ai-base-dongjiang.pdf](https://github.com/Project-HAMi/community/blob/main/hami-meetup/04-shanghai-20260906/volcano-hami-core-k8s-ai-base-dongjiang.pdf)

## Series

- [Overview: HAMi Meetup Shanghai Recap](/blog/hami-meetup-shanghai-2026/)
- [(1) Where Does HAMi Fit in the CNCF × PyTorch Cloud Native AI Foundation?](/blog/hami-meetup-shanghai-2026-cncf-pytorch-ai-foundation/)
- [(2) After GPU Sharing: How HAMi 2.10 Improves Isolation, Scheduling, and Observability](/blog/hami-meetup-shanghai-2026-hami-2-10-remote-gpu/)
- [(3) Inference Control vs. GPU Resource Management: How llm-d and HAMi Can Work Together](/blog/hami-meetup-shanghai-2026-llm-d-inference-plane/)
- [(4) Turning GPU Performance into Inference Service Capability: Lessons from Iluvatar](/blog/hami-meetup-shanghai-2026-iluvatar-gpu-inference/)
- **(5) How iFLYTEK Manages Multi-Business GPU Sharing with Volcano + HAMi-core** (this post)
- [(6) How UCloud Turns HAMi Sharing into Ready-to-Use Development Environments](/blog/hami-meetup-shanghai-2026-ucloud-ai-platform/)
- [(7) From User to Co-Builder: Why Enterprises Need a Sustainable HAMi Community](/blog/hami-meetup-shanghai-2026-community-panel/)
