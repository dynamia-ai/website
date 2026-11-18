---
title: "Making the Most of Every GPU: Dynamia Shares Practices at ContainerDays Singapore"
date: "2026-11-11"
excerpt: "At ContainerDays & AI Context Singapore 2026, Dynamia shared HAMi GPU sharing and scheduling practices in Kubernetes through hands-on labs and production cases, plus GPU utilization optimization for Neocloud scenarios."
author: "Dynamia"
category: "Community & Events"
coverDisplay: "text"
tags:
  - "ContainerDays Singapore"
  - "HAMi"
  - "Kubernetes"
  - "GPU Sharing"
  - "Neocloud"
---

On October 27, ContainerDays & AI Context Singapore 2026 opened at Suntec Singapore. The conference focused on cloud native, AI infrastructure, and platform engineering, drawing developers and practitioners from around the world.

At the event, **Dynamia Open Source Ecosystem VP Jimmy Song and Global Marketing & Solutions Engineering Lead Reza Jelveh** delivered two HAMi-focused talks—one on GPU sharing and scheduling practice in Kubernetes, and one on GPU utilization optimization for Neocloud scenarios.

One session started from hands-on labs; the other drew on production cases. Together, the speakers showed HAMi’s capabilities and how they apply in AI infrastructure from different angles.

![ContainerDays Singapore 2026 conference poster](/images/blog/containerdays-singapore-2026-gpu-sharing/image-01.png)

## From Scratch: Hands-on GPU Sharing and Scheduling

**Talk title:** From Zero to Shared GPUs: Hands-on GPU Scheduling in Kubernetes with HAMi

**Speakers:** Reza Jelveh, Jimmy Song

**Time:** October 27, 12:30–13:15

**Location:** Workshop Room

In Kubernetes, GPUs are often assigned to jobs as whole devices. But workloads differ: some need only a little memory; others need a full GPU. If every job gets a whole device, GPUs can be occupied while capacity goes underused.

How can multiple jobs share a GPU while each gets the memory and compute it needs?

In this 45-minute workshop, the speakers guided participants through deploying HAMi from scratch and learning GPU sharing and scheduling in Kubernetes by doing.

To lower the barrier, the workshop used a local kind cluster and simulated GPUs. **Even without a GPU-equipped laptop, participants could run a real HAMi scheduler and watch GPU request and allocation.**

The lab started with installing HAMi, then showed how multiple Pods share GPUs and how the scheduler behaves when a job asks for more than one GPU can provide.

The speakers then compared Binpack and Spread and the different allocation outcomes under each policy.

- Binpack tends to pack jobs onto fewer GPUs, leaving more intact capacity for later large jobs;
- Spread tends to place jobs across different GPUs. The two policies fit different workloads and should be chosen based on real needs.

Through these labs, participants could see how GPU resources are allocated and how scheduling policy affects where jobs run.

![Workshop live demo](/images/blog/containerdays-singapore-2026-gpu-sharing/image-02.jpg)

Beyond basic sharing and scheduling labs, the workshop also covered how HAMi works with projects such as KAI Scheduler and Volcano, and the direction of integrating HAMi-DRA with Kubernetes Dynamic Resource Allocation. In these architectures, the scheduler handles workload placement and queue management, while HAMi-core enforces GPU limits at container runtime.

![Jimmy Song and Reza Jelveh at ContainerDays](/images/blog/containerdays-singapore-2026-gpu-sharing/image-03.jpg)

From resource requests and job scheduling to runtime isolation, the workshop gave participants a more concrete view of HAMi’s GPU resource management.

## Optimizing Neocloud Compute Utilization

**Talk title:** 10X Your Neocloud's GPU Utilization with HAMi

**Speaker:** Reza Jelveh

**Time:** October 27, 15:05–15:40

**Location:** CDS Theatre

The first workshop covered how GPU sharing and scheduling work. The second talk shifted to Neocloud and asked **how GPU sharing turns into higher utilization in real AI infrastructure.**

In Neocloud scenarios, GPUs must support not only training and inference, but also developer environments, notebooks, multi-tenant allocation, and usage metering. These workloads use GPUs very differently. Large training jobs may need a full GPU; small-model inference and development testing often use only part of the memory and compute.

Take an NVIDIA H200 with 141 GB of memory: if a job uses only about 1 GB and still gets a whole device, a large share of capacity can sit idle.

The talk described how HAMi uses fine-grained GPU allocation, runtime limits, and scheduling policies so different workloads can share devices while respecting resource constraints.

**Higher GPU utilization does not mean any single job runs faster—it means previously idle capacity can take on more suitable work.**

![H200 memory allocation diagram](/images/blog/containerdays-singapore-2026-gpu-sharing/image-04.png)

## One GPU, More Inference Workloads

In inference serving, a single model instance may not fully use a whole GPU. Rather than always enlarging one instance’s allocation, memory-aware placement and multi-replica deployment can sometimes use leftover capacity more effectively.

Reza shared related test and case data showing how device utilization and service behavior change when different numbers of inference replicas share a GPU.

One test showed that, at the same p95 latency level, GPU compute utilization rose as the number of inference replicas on one GPU increased. That suggests that for smaller workloads suited to concurrent execution, sensible GPU sharing and scheduling can raise overall device capacity.

GPU sharing is not right for every scenario, though.

The talk noted that large-scale model training and large LLM serving may still be better on a full GPU; for multi-tenant environments with strict isolation needs, MIG or exclusive devices may be required for stronger isolation.

In real deployments, understand each workload’s resource needs first, then choose sharing or exclusive use—rather than always chasing finer GPU slicing.

![Inference replica count and GPU utilization](/images/blog/containerdays-singapore-2026-gpu-sharing/image-05.png)

### From a Single GPU to Heterogeneous Compute Management

As AI infrastructure adds more GPU, NPU, and other device types, managing heterogeneous resources on one platform becomes a key operations concern.

The talk covered HAMi’s support for NVIDIA, AMD, Ascend, and other heterogeneous accelerators, and how a unified resource-request model—paired with each hardware’s own limiting mechanisms—enables more flexible device management.

On that foundation, HAMi can also work with Volcano, Kueue, KAI Scheduler, and similar projects to meet batch processing, queue scheduling, and multi-tenant resource management needs.

For enterprises, that means **keeping the existing Kubernetes stack while composing GPU sharing, scheduling, and resource management for each business scenario**—without binding every requirement to a single component.

### From Allocation to Finer-Grained Operations

Another key part of GPU resource management is distinguishing **allocated resources** from **actual usage**.

For example, a tenant may request a high GPU quota but use only part of it at runtime. If you only measure allocated capacity, it is hard to judge real device load.

The talk covered monitoring allocation and actual usage separately, and using that data for tenant quotas, metering, and capacity planning—along with production cases of GPU sharing, scheduling optimization, and autoscaling outcomes.

That also shows GPU optimization cannot be judged from a single job’s test results alone; it needs to be evaluated with the platform’s overall workload mix, scheduling approach, and runtime management.

![Different workloads versus overall platform optimization outcomes](/images/blog/containerdays-singapore-2026-gpu-sharing/image-06.png)

## From Pilots to Scale: Real Value for Enterprise AI

On October 28, Reza Jelveh also moderated a panel titled **“Building Enterprise AI at Scale: From Pilots to Measurable Value.”**

The discussion focused on key challenges as enterprise AI moves from pilots to scaled use—including how early technical exploration becomes sustainable production deployment, and how to measure the business value AI applications deliver.

Compared with the two technical talks on GPU sharing, scheduling, and utilization, this panel extended the lens to business needs and value assessment in enterprise AI rollout.

![ContainerDays Singapore panel discussion](/images/blog/containerdays-singapore-2026-gpu-sharing/image-07.jpg)

The two talks started from hands-on practice and production use, covering how HAMi enables GPU sharing and scheduling in Kubernetes, and how those capabilities apply to inference serving, heterogeneous hardware management, and multi-tenant resource operations.

During the event, the Dynamia team exchanged notes with developers and industry peers on real needs and practices in GPU resource management.

As the initiator and ongoing driver of the HAMi open-source project, Dynamia will continue contributing to the cloud-native and AI infrastructure ecosystem—advancing R&D and open-source collaboration on GPU sharing, heterogeneous compute scheduling, and runtime management so more enterprises can use existing compute flexibly and efficiently.
