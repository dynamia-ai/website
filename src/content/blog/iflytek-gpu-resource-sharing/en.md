---
title: "Dynamia Case Study｜How iFLYTEK Lets R&D and Online Workloads Share Compute"
date: "2026-11-11"
excerpt: "iFLYTEK kept existing workflows such as Airflow and Spark, and used Kubernetes, Volcano, and HAMi-Core to manage shared GPUs—giving critical services resource guarantees while letting R&D jobs use temporarily idle compute on demand."
author: "Dynamia"
category: "Case Study"
coverDisplay: "text"
tags:
  - "iFLYTEK"
  - "HAMi"
  - "Volcano"
  - "Kubernetes"
  - "GPU Sharing"
---

As a technology company centered on intelligent speech and artificial intelligence, iFLYTEK’s business spans education, healthcare, smart cities, and more. The AI platform behind these businesses must run user-facing inference services as well as data processing, model training, R&D experiments, and other workloads.

Different workloads have different compute needs: online services require stable resource guarantees, while R&D teams want GPUs quickly so they can start experiments and validate models. When these workloads share the same pool of compute, **how to keep critical services stable while making fuller use of temporarily idle GPUs** becomes a core platform challenge.

To address this, iFLYTEK kept existing workflows such as Airflow and Spark, and combined Kubernetes, Volcano, and HAMi-Core to build a GPU resource management system that balances guarantees with elastic sharing.

In this system built by iFLYTEK, **HAMi—initiated and continuously maintained by Dynamia’s core team—provides fine-grained control over GPU memory and compute**, so existing GPUs can be allocated by workload demand and form one of the foundations for multi-workload sharing on the platform.

## Where Multi-Workload GPU Sharing Gets Hard

For iFLYTEK, sharing GPUs across workloads is not only about flexibility—it also means solving three practical problems.

- **Different resource needs.** Online inference needs stable compute guarantees; R&D experiments want to use idle capacity flexibly. Fixed GPU partitioning tends to leave some resources idle, while fully open sharing can put critical services at risk.
- **Existing processes must stay.** Airflow, Spark, and similar tools already carry large amounts of business workflow. Rebuilding task entry points or migrating orchestration just to introduce GPU sharing would raise platform change cost and business risk.
- **Sharing makes management more complex.** How resources are borrowed and reclaimed, whether jobs interfere with each other, and how to trace issues after failures all require clear management rules and runtime records.

So iFLYTEK chose to keep its existing business stack and **use task scheduling plus fine-grained GPU resource control to make underlying compute more flexible to allocate, while still covering critical-service guarantees and elastic demand from R&D.**

## Keep the Workflows; Allocate GPUs On Demand

On the business side, iFLYTEK kept its existing workflow orchestration and connected underlying jobs to a unified Kubernetes runtime. Engineers can also start validation from designated nodes in a workflow, using a subset of data to check model or code changes—without re-running the full pipeline every time.

On the resource side, the platform uses a layered collaborative architecture: **Kubernetes manages the base runtime, Volcano handles queues and job scheduling, and HAMi-Core controls how much GPU memory and compute each job may use.**

Volcano decides how jobs obtain resources; HAMi-Core further limits usage on a shared GPU. Together, they move GPU allocation beyond whole-card occupancy to **fine-grained quota management based on each job’s needs**.

With this collaboration, GPU resource management is no longer limited to whole-card allocation. Within business runtime constraints, the platform can set finer resource quotas by workload.

In practice, iFLYTEK brought existing GPUs such as T4 and A30 into research scenarios and used HAMi-Core’s fine-grained controls so different jobs could use those devices more flexibly.

**In this way, iFLYTEK kept its original business workflows, folded GPU sharing into the existing scheduling stack, reduced business-side changes, and provided technical support for flexible use of existing compute.**

![Layered architecture that keeps existing workflows and adds GPU sharing](/images/blog/iflytek-gpu-resource-sharing/image-01.png)

## Guarantees for Critical Workloads, Elastic Access for R&D

Once GPUs can be shared, enterprises still face a key question: **how to use idle capacity flexibly without compromising the stability of important workloads?**

Online inference needs continuous, stable resource supply, while some R&D experiments can tolerate interruption or re-execution. Based on these differences, iFLYTEK used dedicated and shared queues to set minimum guarantees, maximum quotas, and usage weights for different workloads.

Critical workloads receive resource guarantees under established rules; interruptible, re-runnable R&D jobs can borrow temporarily idle capacity. When resources must be reclaimed, the platform adjusts according to queue rules, **so sharing rests on clear business priorities—protecting critical jobs while improving flexibility for existing compute.**

That said, **elastic sharing has bounds.** Reclamation may trigger eviction and rebuild, so resource rules must reflect whether a job can be interrupted and whether re-computation is allowed. HAMi-Core’s userspace limits are also not the same as hardware-level fault isolation; when jobs share one GPU, teams still need to assess interference and the impact of failures.

![Dedicated queues protect critical workloads; shared queues support elastic borrowing for R&D](/images/blog/iflytek-gpu-resource-sharing/image-02.png)

To keep sharing rules effective over time, iFLYTEK also improved GPU observability and traceability.

The platform integrates monitoring collection interfaces such as DCGM and DCMI, adds GPU-to-Pod mapping, and records key lifecycle events such as job creation and exit. This runtime information helps the platform team understand resource usage, locate where anomalies occur, analyze the impact of preemption and reclamation, and support troubleshooting, quota adjustments, and cost allocation.

Through queue management, fine-grained resource control, and runtime monitoring, iFLYTEK extended GPU sharing from simple allocation into resource governance shaped around different business needs.

## Fold Sharing into the Enterprise’s Existing Stack

iFLYTEK’s practice offers a useful pattern: for enterprises that already have mature business workflows and compute infrastructure, building GPU sharing does not have to mean tearing everything down. A layered architecture can gradually connect job scheduling and fine-grained resource control with existing management systems.

In that process, original workflows stay in place; existing GPUs such as T4 and A30 can serve research jobs at finer granularity; and critical versus elastic workloads can use resources according to their own guarantee requirements. At the same time, solid runtime records support later troubleshooting, quota changes, and management-policy improvements.

**This also reflects HAMi’s value in real enterprise use: fine-grained GPU sharing can work with existing schedulers, business workflows, and resource management rules to meet diverse needs.** In iFLYTEK’s practice, HAMi-Core and Volcano divide responsibilities so in-GPU resource control can fit into the platform’s job scheduling system.

Looking ahead, Dynamia will continue building around HAMi’s GPU sharing and resource governance capabilities, stay open and neutral, and collaborate with hardware, scheduling, and application ecosystems—helping more enterprises explore more flexible, manageable ways to use compute based on their own business needs and existing technology stacks.
