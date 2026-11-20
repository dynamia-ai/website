---
title: "HAMi v2.11.0 Released: Expanding Heterogeneous Compute Sharing for Enterprise AI"
date: "2026-11-20"
excerpt: "HAMi v2.11.0 expands Remote GPU, AMD GPU sharing, Ascend ENPU, NUMA Refit and Flexible MIG while improving scheduling security, platform compatibility and observability. This article also introduces Dynamia's Enterprise and Platform editions built on HAMi."
author: "Dynamia"
category: "Technical Deep Dive"
coverDisplay: "text"
tags: ["HAMi", "v2.11.0", "Heterogeneous compute", "GPU sharing"]
---

**HAMi v2.11.0 has been released.** The CNCF Incubating open-source project was initiated and continues to be maintained by the Dynamia team.

This update advances Remote GPU, AMD GPU sharing, Ascend ENPU, NUMA topology-aware scheduling and Flexible MIG. It improves heterogeneous compute sharing, fine-grained management and scheduling, while strengthening scheduling security, platform compatibility and runtime support.

From technical progress in open source to enterprise capabilities for production, Dynamia has one central goal: **help heterogeneous compute resources support enterprise AI workloads more flexibly, efficiently and reliably.**

## HAMi v2.11.0

As enterprise AI workloads become more complex, GPU management must meet a wider range of needs. Compute resources may be on different nodes from workloads, accelerators from different vendors need unified scheduling, and complicated hardware topologies place higher demands on allocation.

HAMi v2.11.0 extends heterogeneous compute virtualization and scheduling for these practical scenarios.

### Remote GPU

Traditionally, GPU applications run on nodes that have the GPU hardware and required drivers. Compute workloads are therefore closely bound to the nodes that hold their GPU resources.

This release introduces Remote GPU based on **Lupine**. Client nodes without a local GPU or NVIDIA driver can access resources on a separate GPU server over the network and run CUDA and vLLM workloads.

HAMi's scheduler selects a client node and corresponding Lupine GPU server. A client component then enables remote GPU access. GPU servers can be grouped into resource pools with node labels, and workloads can select remote compute resources by specifying a pool.

Remote GPU currently has limitations: client and server nodes must be deployed separately, and workloads reserve an entire GPU server. The capability will continue to evolve.

![Remote GPU architecture based on Lupine](/images/blog/hami-v2-11-0-release/remote-gpu-architecture.png)

### AMD GPU Sharing

GPUs from different vendors have different resource management interfaces and runtime mechanisms. Fine-grained sharing within one scheduling framework is an important prerequisite for improving utilization in heterogeneous clusters.

After v2.10.0 introduced basic AMD GPU VRAM, compute and device selection capabilities, v2.11.0 further improves **native sharing and scheduling for AMD Instinct GPUs (ROCm)**.

For isolation, workloads can request a fixed amount or percentage of GPU VRAM. `amd-hami-core` enforces container-level VRAM limits, while compute-unit masks control the share of computing capacity.

Scheduling improvements include:

- **Topology-aware scheduling:** Recognizes NUMA binding and XGMI interconnects, preferring GPU combinations that meet workload topology requirements.
- **Multiple scheduling policies:** Supports Binpack, Spread, Mutex and Topology-aware policies for different allocation needs.
- **Device selection and task priority:** Supports selecting or excluding GPU types and UUIDs, plus Pod queue priority control.
- **DRA ecosystem integration:** AMD DRA Driver and HAMi-DRA work together to bring VRAM and compute limits to the Kubernetes Dynamic Resource Allocation path.

These changes give AMD GPUs more complete sharing and scheduling mechanisms in HAMi and broaden the possibilities for managing NVIDIA, AMD and other GPUs together through a unified scheduling layer.

### Ascend ENPU

This release adds **ENPU partitioning mode** for Ascend NPUs. Alongside the existing template and HAMi-core modes, it provides a more flexible device-sharing approach.

ENPU supports three isolation policies:

- **fixed-share:** Isolates a fixed share of resources.
- **elastic:** Provides an elastic resource use policy.
- **best-effort:** Provides a best-effort sharing policy.

ENPU can also allocate VRAM and compute quotas directly without rounding to fixed hardware templates, and uses physical DIE isolation to handle incompatible tenant policies.

Beyond the new isolation mode, v2.11.0 optimizes `hami-vnpu-core` by reducing lock contention during initialization, improving space calculations and refining resource limits per NPU.

### NUMA Refit

In multi-GPU servers, CPU, memory and GPUs have a complex NUMA topology. Placing CPU and GPU resources on different NUMA nodes can add cross-node data access costs and reduce workload performance.

Previously, HAMi's scheduler and Kubernetes kubelet could disagree during topology allocation: the scheduler chose a GPU, but kubelet later assigned CPU affinity that did not match the GPU placement.

The new **NUMA Refit** mechanism lets HAMi match GPU resources again under kubelet's topology constraints, keeping CPU affinity and GPU placement on the same NUMA node where possible.

It provides `strict` and `best-effort` alignment modes for workloads that require strict topology constraints or permit fallback.

For workloads that depend on efficient CPU–GPU coordination, this change **can improve hardware topology matching and reduce potential performance losses caused by mismatched placement.**

![HAMi NUMA Refit scheduling flow](/images/blog/hami-v2-11-0-release/numa-refit-en.png)

### Flexible MIG

NVIDIA MIG (Multi-Instance GPU) divides supported physical GPUs into several hardware-isolated GPU instances, assigning resources to different workloads.

HAMi introduced Flexible MIG in v2.10.0 to explore dynamic creation and release of MIG instances. Version 2.11.0 further improves runtime compatibility, resource placement and lifecycle management for dynamic MIG.

Key updates include:

- **CDI support:** Dynamically created MIG devices now support Container Device Interface (CDI), improving integration with container runtimes that support CDI.
- **Placement scoring and fallback:** Scores MIG placements and retries if the initial choice is unsuitable.
- **Pod-level Profile preference:** Lets workloads specify a preferred MIG Profile for more flexible instance sizing.
- **Lifecycle and health management:** Improves MIG instance reclamation, monitoring and marking of abnormal devices to make resource management more reliable.

These changes strengthen Flexible MIG's allocation capabilities for dynamic workloads and offer a more adaptable GPU partitioning and scheduling option for AI applications that use NVIDIA MIG.

### Continued Improvements to Security, Compatibility and Observability

The release also makes several improvements for security, compatibility and operations in production:

- **Scheduling security and performance:** Hardens the scheduler Extender and Webhook after a security audit, improves Pod identity checks and allocation-annotation protection, and optimizes scheduling filters, resource snapshots and node scoring.
- **Platform compatibility:** Adds OpenShift and SELinux adaptations, reports GPU VRAM and compute resources in node Capacity / Allocatable, and improves cooperation with components such as Cluster Autoscaler.
- **Device ecosystem and observability:** Continues to improve multi-vendor device support, GPU health metrics, MIG monitoring and resource-usage metrics for better visibility into heterogeneous clusters.

### Building With the Community

HAMi v2.11.0 merged **more than 220 Pull Requests from over 50 contributors, 29 of whom contributed for the first time**. Collaboration across the global open-source community continues to improve everything from core scheduling to hardware support.

As HAMi's initiator and a core maintainer, **Dynamia's engineering team was deeply involved in developing and maintaining the release's main features**, including Remote GPU, Flexible MIG, platform compatibility and engineering improvements:

- **Release and core components:** @archlitchi helped coordinate the release, worked on the Remote GPU client utility and monitoring fixes, and supported integration and publication.
- **GPU virtualization and management:** @FouoF improved Flexible MIG, hardened Remote GPU mode and worked on automatic NVIDIA driver-path detection.
- **Platform compatibility and engineering:** @spencercjh adapted HAMi for OpenShift and SELinux, reworked the Helm Chart configuration architecture and improved installation documentation.

These contributions cover GPU virtualization, scheduling, platform integration and engineering delivery, reflecting Dynamia's continuing investment in open-source core technology.

![Contributors to HAMi v2.11.0](/images/blog/hami-v2-11-0-release/contributors.png)

> This is an overview of the main updates in this release. For implementation details, configuration examples, limitations, and upgrade and compatibility notes, read the official HAMi community blog.
>
> [https://project-hami.io/blog/hami-v2-11-0-release](https://project-hami.io/blog/hami-v2-11-0-release)

## From Open-Source Innovation to Enterprise Deployment

HAMi's continued development offers a broader technical foundation for sharing and scheduling heterogeneous compute resources.

In production, however, enterprises must solve more than the question of how to run multiple tasks on a GPU. They also need to keep critical applications stable, manage devices from different vendors together and operate continuously across clusters and teams.

**Moving from resource sharing to production safeguards and then to unified operations for compute and model services is a step-by-step challenge in building enterprise AI infrastructure.**

Dynamia, HAMi's initiator and a core maintainer, builds enterprise products on the same open-source technology. **Dynamia Enterprise for HAMi and Dynamia AI Platform for HAMi** extend those capabilities into enterprise delivery, resource governance and platform operations.

![Relationship between open-source HAMi, Dynamia Enterprise and Dynamia AI Platform](/images/blog/hami-v2-11-0-release/product-capabilities-en.png)

### Dynamia Enterprise for HAMi

Dynamia Enterprise for HAMi builds on open-source HAMi with stronger GPU virtualization, resource isolation and scheduling, providing a more efficient, stable and controllable foundation for heterogeneous compute.

To meet production requirements for resource efficiency and business continuity, it adds several capabilities:

#### **Finer-Grained Resource Management and Isolation**

Building on VRAM and compute sharing, the Enterprise edition provides stronger isolation, VRAM and compute oversubscription, HAMi Turbo mode and seamless automatic application scaling for more flexible allocation.

#### **Scheduling Optimized for Business Workloads**

It supports parallel scheduling-engine optimizations, idle-capacity statistics and VRAM occupancy analysis, and integrates deeply with Volcano to improve scheduling and resource coordination in complex scenarios.

#### **Production Delivery Assurance**

The Enterprise edition remains source-compatible with upstream HAMi. Dynamia provides product hardening, technical support, long-term maintenance and SLA service to reduce the complexity of production deployment and operation.

For enterprises building large-model token factories, MaaS platforms or multi-tenant GPU clusters, Dynamia Enterprise for HAMi aims to turn scattered, exclusively allocated compute into shareable, adjustable capacity for more elastic model services.

### Dynamia AI Platform for HAMi

When enterprise AI infrastructure expands from one cluster to multiple teams and workloads, low-level compute sharing and scheduling alone are insufficient.

Dynamia AI Platform for HAMi includes all Enterprise edition capabilities and adds multi-cluster management, visual operations and resource operations. It helps enterprises build unified, observable and manageable AI infrastructure.

#### **Unified Multi-Cluster Management and Observability**

A unified GUI and Dashboard centralize cross-cluster resources, workloads and GPU status. Hardware monitoring, alert policies and operational observation help improve efficiency in complex environments.

#### **Resource Quotas and Multi-Tenant Operations**

Enterprise multi-tenancy, resource quotas, metering and billing, and OpenAPI capabilities help organizations understand compute allocation, use and costs more clearly.

#### **Model Services and Business Application Support**

The platform combines model deployment, inference services and runtime management to help enterprises extend from underlying compute supply to model-service delivery for business applications.

## Open Source Keeps Evolving, Enterprise Capabilities Keep Deepening

HAMi v2.11.0 is another important open-source iteration in remote GPU use, heterogeneous device support and scheduling.

For Dynamia, continued open-source progress provides a solid foundation for enterprise products and further validates the value of heterogeneous compute sharing and unified scheduling.

At the same time, production reliability, deep resource governance, multi-cluster operations, visual management and model-service delivery require dedicated enterprise product capabilities.

Dynamia will continue to help build the HAMi open-source ecosystem and improve its Enterprise and Platform editions around real business needs—moving heterogeneous compute from sharing to efficient supply and from infrastructure management to ongoing AI service operations.

**Connecting open-source innovation with enterprise production to keep unlocking the value of heterogeneous compute.**
