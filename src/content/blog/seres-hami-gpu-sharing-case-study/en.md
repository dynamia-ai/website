---
title: "From Dedicated GPUs to Fine-Grained Sharing: How SERES Uses HAMi for Over 10 Billion Daily Inference Tokens"
date: "2026-11-20"
excerpt: "SERES introduced HAMi into its SeresCloud inference platform to allocate GPU memory and compute to lightweight models as needed, alongside the platform's autoscaling. This case study describes resource management and GPU utilization as daily token volume grew beyond 10 billion."
author: "Dynamia"
category: "Case Study"
coverDisplay: "text"
tags: ["HAMi", "SERES", "GPU sharing", "AI inference"]
---

> ### About SERES
>
> Founded in 1986 and headquartered in Chongqing, SERES Group is a technology company focused on new-energy vehicles. Its AITO vehicle series, developed with Huawei, is well known in the market.
>
> SeresCloud is SERES's internally developed AI infrastructure platform. It provides unified model services to business systems and agent applications while connecting to Kubernetes clusters and GPU pools underneath. It carries inference workloads including Embedding, Rerank, speech synthesis, OCR and large language models.

![SERES and HAMi customer case: business scale and GPU utilization](/images/blog/seres-hami-gpu-sharing-case-study/seres-hami-case-en.png)

## Business Challenge: More Than 10 Billion Tokens a Day

As AI agents became more widely used inside the company, SERES's model inference business grew rapidly.

At the start of 2026, about 10 online models ran on SERES's internal SeresCloud platform, processing roughly 300 million tokens a day. A few months later, the number of online models exceeded 42 and daily token volume passed 10 billion, an increase of more than 3,000%.

![SeresCloud growth in daily token requests and online models from January to July 2026](/images/blog/seres-hami-gpu-sharing-case-study/serescloud-growth-en.png)

This growth brought new challenges for GPU resource management.

Initially, SERES primarily used NVIDIA GPU Operator to manage GPUs. A general GPU task could receive a whole GPU. For devices such as A100 and H100 that support MIG (Multi-Instance GPU), a physical GPU could be divided into independent hardware instances.

This met early needs, but problems emerged as the range of inference models and the GPU cluster grew.

Many lightweight inference tasks did not need a whole GPU. At the same time, different GPU models required different management approaches. The platform needed higher utilization without sacrificing workload isolation or stability.

SERES looked for a more flexible way to share GPUs and ultimately chose the **open-source HAMi project**.

HAMi supports fine-grained GPU memory and compute allocation, including percentage-based compute configuration. It also offers unified resource management for heterogeneous accelerators such as NVIDIA GPUs, Huawei Ascend, Hygon DCUs and Cambricon MLUs. As a CNCF Incubating project, its sharing, isolation and heterogeneous-device capabilities matched SERES's needs.

![GPU-Operator and HAMi scheduling capabilities compared](/images/blog/seres-hami-gpu-sharing-case-study/gpu-scheduling-comparison-en.png)

## Solution

Introducing HAMi did not require SERES to rebuild its entire AI inference platform.

SERES had already built SeresCloud as an in-house inference platform. It offered unified model services to internal business systems and Agent applications, while connecting to Kubernetes clusters and GPU pools below.

![SeresCloud inference platform architecture](/images/blog/seres-hami-gpu-sharing-case-study/serescloud-architecture-en.png)

The platform already had broad inference service management capabilities:

- **Model repository:** Manages versions, images and configuration for more than 40 model types and supports one-click deployment.
- **Inference gateway:** Provides a unified service entry point with traffic routing, load balancing, rate limiting and circuit breaking.
- **Autoscaling:** Adjusts inference Pod replicas using real-time QPS, GPU utilization, request queue depth and other metrics.
- **Real-time monitoring:** Monitors model services, GPU nodes, memory and compute use end to end.

SERES did not need another inference service platform. It needed more precise management of underlying GPUs that would work with its existing architecture. HAMi filled that role as the GPU virtualization and scheduling layer.

In the new architecture, **SeresCloud scales services according to business demand; HAMi allocates, schedules and isolates GPU resources at a fine granularity.**

SeresCloud decides when to scale up or down based on requests and service load. When a Pod is created, HAMi schedules it to a suitable device according to available GPU memory, compute capacity and other resources.

This layered cooperation preserves the existing platform's business management while making GPU allocation more flexible. A lightweight inference service no longer needs a whole GPU reserved for itself.

## Engineering Practice

### From Whole-GPU Exclusivity to Fine-Grained Sharing

SERES runs many lightweight inference services, including Embedding, Rerank, speech synthesis (Voice) and OCR. These services typically need only a few hundred MB to several GB of model storage, and a single inference instance generally needs about 1–4 GB of GPU memory.

Request volume also varies by time of day: **it concentrates during working hours and falls at night.**

Under whole-GPU allocation, a Pod occupying little memory and compute still held an entire GPU, leaving unused resources unavailable to other tasks. GPU utilization for these small-model inference workloads remained around 15%–25% in exclusive mode.

The team tried Time-Slicing to let multiple Pods reuse one GPU through time slices. That increased sharing but did not solve resource isolation.

A sudden increase in one Pod's memory use could affect other tasks on the same GPU or cause an OOM. When several heavy tasks competed for compute, inference latency could fluctuate. These risks mattered for production workloads with SLA requirements.

![Four GPU sharing approaches compared by utilization, isolation and flexibility](/images/blog/seres-hami-gpu-sharing-case-study/gpu-sharing-comparison-en.png)

SERES therefore adopted **HAMi vGPU soft-isolation sharing** for the relevant workloads.

HAMi intercepts CUDA calls through `libvgpu.so` inside containers and enforces GPU memory and compute limits, enabling finer-grained sharing and management.

For example, this configuration requests one vGPU share and sets memory and compute limits:

```text
resources:
  limits:
    nvidia.com/gpu: 1          # Request 1 vGPU share of a physical GPU
    nvidia.com/gpumem: 3000    # Limit memory to 3000 MiB
    nvidia.com/gpucores: 30    # Limit compute to 30%
```

Here:

- `nvidia.com/gpu: 1` requests one shared GPU resource instance, not exclusive use of a physical GPU.
- `nvidia.com/gpumem: 3000` limits the task to 3000 MiB of GPU memory.
- `nvidia.com/gpucores: 30` limits the task to 30% of GPU compute.

SERES can thus allocate GPUs to match each model's actual needs rather than treating a whole GPU as the smallest unit.

SeresCloud's autoscaling works alongside this allocation: it reduces inference instances and releases resources when demand is low, then adds Pod replicas when requests rise. HAMi assigns GPU resources to the new tasks.

**Together, these mechanisms raised GPU utilization for SERES's small-model inference workloads from 15%–25% to about 90%.**

![Small-model GPU utilization: GPU-Operator versus HAMi with autoscaling](/images/blog/seres-hami-gpu-sharing-case-study/gpu-utilization-en.png)

### Choosing Scheduling Policies for Each Workload

For an enterprise inference platform, utilization is not the only goal. Efficiency must be balanced with workload stability. HAMi provides different scheduling policies for different workloads:

- **Binpack:** Prefers GPUs already in use, increasing density and single-GPU utilization. It suits dense small-model deployment and workloads sensitive to resource fragmentation.
- **Spread:** Prefers distributing Pods across GPUs. It suits latency-sensitive, high-concurrency inference.

Choosing a suitable policy for each workload helped SERES improve utilization while meeting the SLA requirements of critical services.

### Key Production Configuration

The following is part of the core Helm configuration SERES uses to deploy HAMi in production:

```text
devicePlugin:
  deviceSplitCount: 10        # Max 10 shared tasks per physical GPU
  deviceMemoryScaling: 1      # Memory based on actual physical VRAM (no oversubscription)
  deviceCoreScaling: 1        # Compute based on actual physical compute
  migStrategy: none           # MIG disabled (handled by HAMi soft slicing)
  disablecorelimit: "false"   # Enable compute limiting

scheduler:
  defaultMem: 5000            # Default memory allocation 5000 MiB
  defaultCores: 0             # No compute reserved by default (dynamically allocated by the scheduler)
```

The settings mean:

- `deviceSplitCount: 10`: Up to 10 concurrent shared tasks per physical GPU.
- `deviceMemoryScaling: 1`: Allocate against actual physical memory, without memory oversubscription.
- `deviceCoreScaling: 1`: Allocate against actual physical compute capacity.
- `migStrategy: none`: Disable MIG; HAMi's software partitioning handles sharing.
- `disablecorelimit: "false"`: Enable compute limits.
- `defaultMem: 5000`: Allocate 5000 MiB of memory by default.
- `defaultCores: 0`: Do not reserve a fixed amount of compute by default; let the scheduler allocate it dynamically.

`deviceSplitCount=10` is an important concurrency ceiling. **It limits how many vGPU tasks can run on one GPU at once, but does not change its physical memory or compute capacity.** The scheduler still admits tasks according to actual remaining resources to avoid runtime OOM from oversubscription.

HAMi's scheduler continues to check the remaining physical resources on admission and avoids runtime OOM caused by over-allocation.

## Lessons from Production

Putting GPU sharing into production requires attention not only to deployment, but also scheduling compatibility, troubleshooting, resource configuration and monitoring. SERES identified several lessons while using HAMi.

### Webhook Compatibility with Privileged Pods

HAMi's Mutating Webhook automatically changes `schedulerName` to `hami-scheduler` for Pods requesting vGPU resources.

For debugging Pods with `privileged: true`, however, the Webhook skips this processing. This behavior is important when investigating scheduling problems.

### Making Scheduling Failures Observable

From HAMi v2.x onward, the project has substantially improved scheduling failure messages with more standardized error codes, including:

- `NodeInsufficientDevice`
- `CardTypeMismatch`
- `CardInsufficientMemory`

SERES recommends connecting HAMi metrics to Prometheus/Grafana to locate GPU scheduling issues quickly.

### Setting deviceSplitCount Appropriately

More concurrent tasks are not always better. Too many tasks on one GPU can increase resource contention, context-switching overhead and operational complexity.

After stress testing, SERES selected `deviceSplitCount=10` for its inference workloads, balancing deployment density and stability.

This value reflects SERES's current workload, not a universal recommendation. Other inference tasks need testing based on model size, concurrency and latency requirements.

### Coordinating with In-House Autoscaling

HAMi determines how GPU resources are allocated. The business platform still decides when inference services should scale up or down.

SERES combines HAMi's `vgpu_monitor` metrics with SeresCloud's QPS, inference latency and other metrics to inform autoscaling.

The key is **one coherent monitoring system** that combines business and resource data. GPU management can then respond to changing inference demand instead of remaining a static capacity allocation.

## Next Steps

As its AI infrastructure develops, SERES plans to extend its use of HAMi beyond the current implementation.

### Expanding the Heterogeneous Compute Pool

As heterogeneous AI accelerators mature, SERES plans to bring Huawei Ascend, Hygon DCU and other devices into HAMi's unified scheduling framework and build a heterogeneous compute pool.

### HAMi-DRA Integration

SERES is following HAMi's work on the Kubernetes DRA (Dynamic Resource Allocation) standard and hopes to use the native Kubernetes DRA interface for more flexible GPU allocation in the future.

### More Precise Scheduling Policies

The team will explore advanced capabilities such as priority-based resource preemption and GPU topology-aware scheduling to improve utilization for large-model inference.

### Continuing to Contribute Back

SERES will continue to bring problems and improvement ideas from production to the HAMi community and work with its developers to advance the project.

## Results: GPU Utilization Reaches About 90%

By combining Kubernetes, HAMi and its in-house inference platform, SERES supported rapid AI business growth while substantially improving GPU resource efficiency:

- Daily token processing grew from 300 million to more than 10 billion, an increase of over 3,000%.
- GPU utilization for small-model inference rose from 15%–25% to about 90%.

For SERES, HAMi's value goes beyond running more tasks on one GPU. It lets the platform allocate resources to the actual needs of each model, reducing waste from whole-GPU exclusivity while supporting stable inference services.

The experience offers a reference for other enterprises building AI inference platforms on Kubernetes. As model counts, inference requests and GPU types grow, fine-grained sharing and layered resource management are technical approaches worth exploring.
