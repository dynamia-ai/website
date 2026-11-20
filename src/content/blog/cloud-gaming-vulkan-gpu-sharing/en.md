---
title: "How Can Dozens of Cloud Gaming Players Share One GPU?"
date: "2026-11-20"
excerpt: "HAMi extends GPU resource management from CUDA to Vulkan rendering workloads so cloud gaming, autonomous driving simulation and other applications can share and isolate GPUs in Kubernetes. In a CARLA stress test, the overall performance difference with isolation enabled stayed within 2%."
author: "Dynamia"
category: "Technical Deep Dive"
coverDisplay: "text"
tags: ["HAMi", "Vulkan", "GPU sharing", "Cloud gaming"]
---

## Introduction

Since its launch in 2020, miHoYo's open-world adventure game *Genshin Impact* has been running for six years. This July, the game announced the device performance requirements for version 7.0, which further improves character visuals and scene materials. For an open-world game with a large global player base, improving visual quality while maintaining performance across different devices remains an important technical challenge.

At the graphics rendering level, Vulkan has become one of the technical options for optimizing *Genshin Impact* because it offers finer control over GPU resources. During Gamescom 2025, miHoYo shared its Vulkan results at a gaming technology forum hosted by Samsung: in the high-load frame test scenario it demonstrated, FPS increased by 17.1% with Vulkan.

When rendering moves from a local device to the cloud, however, the question is no longer limited to the performance of one application. GPU allocation and sharing between multiple tasks also matter: how many sessions can one GPU support at once? How can a platform allocate VRAM, limit resource use and prevent tasks from interfering with one another?

The answer depends on both the GPU's computing capability and an effective mechanism for sharing and isolating resources.

HAMi, an open-source project initiated and continually operated by Dynamia's founding team, manages heterogeneous AI computing devices in Kubernetes clusters. It already supports resource allocation, usage limits and monitoring for CUDA compute workloads. The new **Vulkan rendering isolation** extends resource management to graphics rendering, allowing CUDA compute and Vulkan rendering to follow the same resource allocation, limit and observability mechanisms.

![HAMi manages CUDA and Vulkan workloads through a unified GPU resource mechanism](/images/blog/cloud-gaming-vulkan-gpu-sharing/hami-vulkan-mascot.png)

## Why GPU Resource Management Cannot Focus Only on CUDA

Both CUDA and Vulkan let applications use GPUs, but they have different roles and use cases.

CUDA is a parallel computing platform and programming model primarily intended for general-purpose computing. It is widely used in compute-intensive tasks such as AI training and inference. Vulkan is a cross-platform graphics and compute API that lets applications access GPUs at a lower level. It is more common in graphics-intensive scenarios such as game rendering, autonomous driving simulation and digital twins.

Although both use GPU resources, they have different runtime interfaces and call paths. Managing CUDA alone does not cover every GPU workload.

For a GPU management platform in a Kubernetes cluster, this difference creates a practical problem: **if resource limits and usage monitoring apply only to the CUDA call path, tasks that access the GPU through Vulkan cannot be managed directly by the same mechanism.**

For example, suppose one GPU runs both AI inference and three-dimensional scene rendering. If the platform limits only CUDA compute workloads, it is difficult to use that mechanism to accurately manage the resources occupied by Vulkan rendering tasks or to assess competition between the two kinds of work.

To let more kinds of GPU workloads share one infrastructure, resource management must therefore extend beyond CUDA to other runtime interfaces, including Vulkan.

HAMi's new Vulkan rendering isolation is an extension of its existing GPU resource management capabilities.

## Bringing Vulkan into Unified Resource Management

In Kubernetes, HAMi's GPU resource management mainly involves three steps:

1. **Scheduling and allocation:** Select a suitable GPU for each task and determine the resources available to it.
2. **Isolation and limits:** Constrain GPU usage according to the allocation and reduce the risk of competition when tasks share a GPU.
3. **Monitoring and observability:** Continuously record resource usage while tasks run to support management and operational analysis.

HAMi already has runtime resource controls for CUDA compute tasks. To manage Vulkan workloads in a similar way, it first needs to connect to their GPU call path.

### Connecting to Applications Through a Vulkan Implicit Layer

HAMi's Vulkan rendering isolation uses the **Implicit Layer** mechanism officially supported by Vulkan.

A Vulkan Layer is an extension mechanism that can intercept API calls between an application and the underlying Vulkan driver. Unlike a Layer that an application must enable explicitly, the Vulkan Loader can load an implicit layer automatically according to the runtime configuration.

This lets HAMi introduce resource management while an application uses Vulkan without requiring developers to change application code specifically to call HAMi. For existing Vulkan applications that meet the runtime and component configuration requirements, deploying and configuring the relevant components can introduce resource isolation with less application modification.

### Sharing the Resource Management Mechanism

CUDA and Vulkan enter through different paths, but HAMi's resource management goal is the same. It retains its existing resource controls for CUDA and uses an implicit layer to connect rendering tasks on the Vulkan path.

![CUDA and Vulkan processes use one VRAM quota through shared memory](/images/blog/cloud-gaming-vulkan-gpu-sharing/shared-memory-en.png)

**The two paths handle different kinds of GPU calls, but both must follow a consistent resource allocation and join the same resource limit and usage observation system.** The platform can then manage compute and rendering workloads from one perspective without building entirely separate management systems for the two interfaces.

For environments that run both CUDA and Vulkan workloads, HAMi also synchronizes the necessary resource state to coordinate their use of a shared GPU.

In practice, Vulkan rendering isolation provides the following capabilities:

- **Clear resource boundaries:** Allocate resources to rendering tasks and limit their use.
- **Support for multiple shared tasks:** Reduce the risk that one task consumes too much GPU capacity and affects others.
- **Unified observation:** Include compute and rendering tasks in the same resource management view to understand actual GPU use.
- **Room for better utilization:** Provide the management foundation for more workloads to share a GPU.

Resource isolation does not mean tasks can never affect one another's performance. GPU hardware, the degree of concurrency and workload characteristics still determine the practical results of sharing. Beyond functionality, the stability and performance overhead of the isolation mechanism must also be tested in real operation.

## Business Scenarios for Vulkan Rendering Isolation

In practice, Vulkan rendering isolation is most useful when multiple GPU workloads need to share hardware.

### Cloud Gaming

In cloud gaming, every player's session must continuously render scenes and consume GPU resources. If every session has exclusive use of a GPU, hardware efficiency and operating costs can become limiting factors.

Vulkan rendering isolation lets the platform set resource boundaries for different sessions so multiple rendering tasks can share one GPU under controlled conditions. This lays the groundwork for more concurrent sessions per GPU and better utilization. The number of sessions one GPU can ultimately support still needs to be evaluated against the game workload, frame-rate requirements and actual concurrent performance.

### Autonomous Driving Simulation

Autonomous driving research relies on extensive simulation to test vehicle behavior across roads, traffic conditions, lighting and weather. When several simulations run in parallel, rendering their three-dimensional environments occupies GPU resources continuously, and the tasks may compete for those resources.

Finer-grained allocation and limits for different simulations can reduce the effect of one task on another's resource use and distribute limited GPU resources more reasonably among tests. Provided performance requirements are met, more tasks may share existing GPUs, increasing parallel testing capacity and overall simulation throughput.

### Digital Twins and Cloud Workstations

GPU workloads in digital twin and cloud workstation environments are often more varied. The same infrastructure may need to perform data processing and model inference while also running real-time three-dimensional rendering applications.

If compute and rendering use the GPU through CUDA and Vulkan respectively, a platform that supports only one interface has an incomplete view of resource use. With HAMi's Vulkan rendering isolation, both kinds of workloads can follow a more consistent management approach, making it easier to allocate resources, limit usage and monitor operation from one platform.

Cloud gaming, autonomous driving simulation and digital twins differ as businesses, but they face a similar problem: **one GPU infrastructure must support multiple tasks with different resource requirements.**

Where AI computing and real-time graphics meet, such as an application that runs perception inference while updating a three-dimensional simulation, unified CUDA and Vulkan management helps the platform understand GPU use more fully and reduces gaps in workload management.

## CARLA Test: Vulkan Isolation Performance

In production, resource isolation must keep usage under control while minimizing its effect on application performance. This matters particularly for real-time rendering. Cloud gaming and autonomous driving simulations often run continuously for long periods and have demanding performance and stability requirements.

To test HAMi's Vulkan rendering isolation, the team used the **CARLA** autonomous driving simulation platform as its workload and ran a continuous two-hour stress test on an **NVIDIA GeForce RTX 4090**.

CARLA can continuously generate complex three-dimensional scenes with roads, vehicles, lighting and changing weather, making it suitable for observing rendering performance over extended runs.

The test recorded performance in two operating states:

- **Without HAMi Vulkan isolation:** The performance baseline.
- **With HAMi Vulkan isolation:** The result after introducing resource isolation.

### Results

In this RTX 4090 test environment and specified workload, **the overall performance difference between the runs with and without HAMi Vulkan isolation stayed within 2%, and both ran stably for two continuous hours.**

Under these test conditions, the result indicates that the Vulkan resource isolation mechanism can run continuously with a relatively small effect on rendering performance.

![CARLA benchmark shows less than two percent overhead from HAMi Vulkan isolation](/images/blog/cloud-gaming-vulkan-gpu-sharing/vulkan-benchmark-en.png)

Results must still be interpreted in context. GPU model, driver version, concurrent task count and actual rendering workload can all affect the performance of resource isolation. Enterprises planning to use Vulkan isolation in production should establish a performance baseline for their own workloads through a PoC, then evaluate the target concurrency, resource configuration and long-term operation.

## How to Try It

For existing Vulkan applications that meet the runtime requirements, HAMi rendering isolation does not require changes to business application code.

After preparing the environment and installing and configuring the relevant components according to the project documentation, users can run Vulkan workloads in containers and observe their GPU resource usage.

### Production Deployment

Organizations planning a production deployment should also pay attention to:

- **GPU and driver compatibility:** Confirm that the target hardware, drivers and Vulkan runtime meet the component requirements.
- **Cluster scheduling:** Configure GPU resource allocation for actual workloads and evaluate mixed workloads and concurrent tasks.
- **Monitoring and alerts:** Integrate GPU usage into existing monitoring and establish necessary health checks and alerts.
- **Performance baseline:** Compare performance before and after isolation to assess utilization and operational overhead for the workload.
- **Upgrades and maintenance:** Account for component versions, runtime changes and existing cluster operations.

These areas determine whether the isolation mechanism fits an enterprise's infrastructure and continues to meet its needs in operation. **As the leading team behind the HAMi project, Dynamia continues to develop its core technology and provides enterprises with solution assessment, PoC validation, production deployment, performance tuning and long-term technical support to help them apply these capabilities to real workloads.**

## Conclusion

From CUDA compute to Vulkan rendering, different runtime interfaces create the same need to share, isolate and observe GPU resources.

HAMi Vulkan rendering isolation connects to Vulkan applications through an implicit layer and brings graphics rendering tasks into its existing resource allocation, limit and observation system, further expanding the scope of GPU resource management.

**HAMi Vulkan rendering isolation was officially released in `hami-enterprise-v2.11.0`.**

If your organization faces low GPU utilization, competition between tasks or difficulty managing rendering workloads, contact Dynamia to discuss how HAMi Vulkan rendering isolation could apply to your business.
