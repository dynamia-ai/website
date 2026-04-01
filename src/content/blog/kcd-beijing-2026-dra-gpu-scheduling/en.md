---
title: "From Device Plugin to DRA: GPU Scheduling Paradigm Shift and HAMi-DRA in Practice"
linktitle: HAMi-DRA Talk Recap at KCD Beijing 2026
date: '2026-03-23'
excerpt: >-
  At KCD Beijing 2026, HAMi core contributors presented the GPU scheduling paradigm shift from
  Device Plugin to DRA. This post reviews the key insights — DRA's capabilities and challenges,
  HAMi-DRA's automated Webhook approach to lowering migration barriers, and real-world
  performance and observability results.
author: Dynamia
tags:
  - KCD
  - HAMi
  - DRA
  - GPU Scheduling
  - Kubernetes
  - AI Infrastructure
category: Technical Deep Dive
language: en
coverImage: /images/blog/kubecon-eu-2026-hami-recap/keynote-stage.jpg
---

KCD Beijing 2026 was one of the largest Kubernetes community events in recent years, with **over 1,000 registrations, setting a new record for KCD Beijing.**

The HAMi community was invited to deliver a technical talk and also maintained a booth, engaging deeply with developers and enterprise users from the cloud-native and AI infrastructure space.

The talk was delivered by two core HAMi community contributors:

* **Wang Jifei** (Dynamia, HAMi Approver, lead HAMi-DRA contributor)
* **James Deng** (4Paradigm, HAMi Reviewer)

The topic: **From Device Plugin to DRA: GPU Scheduling Paradigm Shift and HAMi-DRA in Practice.**

This article provides a more complete technical review combining the on-site presentation and slides. Slides available for download: [GitHub - HAMi-DRA KCD Beijing 2026](https://github.com/Project-HAMi/community/blob/main/talks/01-kcd-beijing-20260323/KCD-Beijing-2026-GPU-Scheduling-DRA-HAMi-Wang-Jifei-James-Deng.pdf).

## Event Recap

![Main conference hall](https://project-hami.io/assets/images/keynote-e1e2e24717769197253345671946a0ca.jpg)

![Attendee registration](https://project-hami.io/assets/images/register-6acd8011d259ee73f08e2b03d15ec150.jpg)

![Attendees visiting the HAMi booth](https://project-hami.io/assets/images/booth-26950eea7308b589c96c5512c15a93a8.jpg)

![Volunteers stamping for attendees](https://project-hami.io/assets/images/booth2-c13fb6231a4a43ac0367a35befd2a193.jpg)

![Wang Jifei presenting](https://project-hami.io/assets/images/wangjifei-096625d277476d4d56c6b730c97a80de.jpg)

![James Deng presenting](https://project-hami.io/assets/images/james-d46e3f1098e0ea75ff7351fd7e3a2886.jpg)

## The GPU Scheduling Paradigm Is Shifting

The core of this talk goes beyond DRA itself — it addresses a larger transformation:

> **GPUs are evolving from "devices" into "resource objects."**

Behind this shift is a fundamental change in how AI workloads consume GPUs. GPUs are no longer suited to simple whole-card exclusive allocation — they need to be shared, partitioned, scheduled, and governed.

## The Ceiling of Device Plugin

The traditional Device Plugin model suffers from limited expressiveness:

* Can only describe "quantity" (`nvidia.com/gpu: 1`)
* Cannot express multi-dimensional resources (memory / cores / slices)
* Cannot express multi-card combinations
* Cannot express topology (NUMA / NVLink)

These limitations directly lead to:

* Scheduling logic leakage (extender / sidecar)
* Increased system complexity
* Constrained scheduling concurrency

As AI workloads enter inference serving and multi-tenant mixed scenarios, these problems are rapidly magnified.

## DRA: A Leap in Resource Modeling

DRA (Dynamic Resource Allocation) is a significant upgrade to the Kubernetes resource model, with core advantages including:

* **Multi-dimensional resource modeling** — going beyond quantity to express fine-grained dimensions like memory and compute
* **Complete device lifecycle management** — a full closed loop from resource discovery through allocation to reclamation
* **Fine-grained resource allocation** — more flexible resource composition

The key structural change:

> **Resource requests move from embedded Pod fields to independent ResourceClaim objects.**

This gives GPU resources the same "first-class citizen" status as Pods and PVCs, allowing the scheduler to manage GPU resources the same way it manages storage volumes.

## The Reality: DRA Is Too Complex

DRA's capabilities are undeniable, but there's an often-overlooked practical issue: **the user experience has clearly regressed.**

### Device Plugin syntax

```yaml
resources:
  limits:
    nvidia.com/gpu: 1
```

### DRA syntax

```yaml
spec:
  devices:
    requests:
    - exactly:
        allocationMode: ExactCount
        capacity:
          requests:
            memory: 4194304k
            count: 1
```

Plus you need to write a CEL selector:

```
device.attributes["gpu.hami.io"].type == "hami-gpu"
```

The comparison is stark:

> **DRA is an upgrade in capability, but a clear downgrade in user experience.**

For enterprises already using Device Plugin, the migration cost isn't just rewriting YAML — the entire team needs to learn an entirely new resource declaration paradigm.

## HAMi-DRA's Key Breakthrough: Automated Migration

This was one of the most valuable parts of the talk.

HAMi's approach doesn't ask users to "use DRA directly." Instead, it takes a more pragmatic strategy:

> **Let users keep using Device Plugin syntax, and have the system automatically convert to DRA.**

### How It Works

Through a **Mutating Webhook**, HAMi-DRA automatically performs the conversion during Pod creation:

**Input** (user side, keeping Device Plugin syntax):

```yaml
nvidia.com/gpu: 1
nvidia.com/gpumemory: 4000
```

**Webhook auto-conversion:**

* Generates ResourceClaim objects
* Constructs CEL selectors
* Injects device constraints (UUID / GPU type)

**Output** (system internal):

* Standard DRA resource objects
* Scheduler-recognizable resource expressions

The core value of this design:

> **Transforming DRA from an "expert interface" into an interface ordinary users can work with.**

Users don't need to understand new concepts like ResourceClaim or CEL selectors. They simply write `nvidia.com/gpu` as before, and the system handles the underlying complexity.

## DRA Driver: More Than Just "Registering Resources"

The implementation complexity of a DRA Driver goes far beyond simply "registering resources with the scheduler." It assumes full device lifecycle management:

### Three Core Interfaces

* **Publish Resources** — publishing available resources to the scheduler
* **Prepare Resources** — resource preparation before Pod creation (injecting libvgpu.so, configuring ld.so.preload, managing environment variables and temporary directories)
* **Unprepare Resources** — resource reclamation after Pod deletion

This means:

> **GPU scheduling has entered the runtime orchestration layer — it's no longer just simple resource allocation.**

From the user's perspective, the Pod creation timeline is extended — after the scheduler matches resources, the Driver still needs to complete device initialization, runtime injection, and a series of other operations before the Pod can run normally.

## Performance Gains: More Than Just "More Elegant"

HAMi-DRA doesn't just offer a cleaner architecture — it delivers tangible performance improvements.

### Pod Creation Time Comparison

* HAMi (traditional mode): peak approximately 42,000
* HAMi-DRA: significantly reduced (~30%+ improvement)

This improvement comes from DRA's **resource pre-binding mechanism**: resource allocation is determined during the scheduling phase, reducing scheduling conflicts and retries.

For large-scale AI clusters, Pod creation speed directly impacts task startup latency and cluster throughput. A 30%+ improvement has significant implications in production environments.

## Observability Paradigm Shift

A subtle but important change lies in observability.

### Traditional Model

* Resource information comes from Node
* Usage information comes from Pod
* Requires aggregation and inference to build a complete resource view

### DRA Model

* ResourceSlice describes device inventory
* ResourceClaim describes resource allocation
* **Resource perspective is first-class**

This means:

> **Observability shifts from "inference" to "direct modeling."**

Operations teams can directly see through ResourceClaims which GPU is occupied by whom, how much memory is allocated, and how much remains — without having to reverse-engineer this from Node status and Pod configurations.

## Unified Modeling: The Future of Heterogeneous Devices

If device attributes can be standardized, a **vendor-agnostic scheduling model** becomes possible.

For example, through standardized attribute fields describing:

* PCIe root complex
* PCI bus ID
* GPU core attributes

This points to a larger narrative:

> **DRA is the starting point for heterogeneous compute abstraction.**

When accelerators from different vendors — Huawei Ascend, Cambricon, AMD, and others — all connect to Kubernetes through a unified attribute model, the scheduler can achieve truly cross-vendor resource management, without needing to maintain separate scheduling logic for each hardware vendor.

## The Bigger Trend: Kubernetes Is Becoming the AI Control Plane

Connecting these changes reveals a clear trend:

* **From scheduling "machines" to scheduling "resource objects"** — Node is no longer the minimum scheduling unit
* **From "device" to "virtual resource"** — GPU is no longer a physical card, but a divisible, composable resource
* **From "imperative" to "declarative"** — scheduling logic is replaced by resource declarations

Fundamentally:

> **Kubernetes is evolving into the control plane for AI infrastructure.**

## HAMi's Positioning

Within this trend, HAMi's positioning is becoming increasingly clear:

> **The GPU resource layer for Kubernetes.**

* **Downward**: adapting to heterogeneous GPUs (NVIDIA / Huawei Ascend / Cambricon, etc.)
* **Upward**: supporting AI workloads (training / inference / Agent)
* **In between**: scheduling + virtualization + resource abstraction

And HAMi-DRA is the key step that aligns this resource layer with Kubernetes' native model.

## Closing

The real value of this KCD Beijing 2026 talk wasn't just introducing DRA — it was answering a more practical question:

> **How do you turn a "correct but hard to use" model into a system people can use today?**

HAMi-DRA's answer:

* **Don't change user habits** — keep using Device Plugin syntax
* **Absorb DRA capabilities** — automatically convert to DRA resource model underneath
* **Handle complexity internally** — Webhooks, Drivers, and lifecycle management are all handled by the system

This reflects the approach the HAMi community has always championed: **advancing AI infrastructure through community collaboration, not closed systems.** Contributors from different companies validate solutions in real production environments and share experiences through the community, benefiting more people.

If you're interested in HAMi-DRA or GPU scheduling, we invite you to join the HAMi community and help us advance AI compute resource management on Kubernetes.
