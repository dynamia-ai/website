---
title: "Webinar Recap | HAMi 2.9 Ascend Soft Partitioning and DRA in Practice, with Full Q&A"
linktitle: "HAMi 2.9 Webinar Recap: Ascend Soft Partitioning and DRA"
date: '2026-05-15'
excerpt: >-
  HAMi Maintainer Li Mengxuan walks through HAMi 2.9 highlights—Ascend NPU
  userspace soft partitioning, production-ready HAMi-DRA, and heterogeneous
  scheduling enhancements. With a live demo and full Q&A, this recap covers
  everything new in v2.9.
author: Dynamia AI Team
tags:
  - HAMi
  - v2.9
  - Ascend
  - DRA
  - GPU Sharing
  - NPU
  - Kubernetes
category: Community & Events
language: en
coverImage: /images/events/hami-2.9-webinar-recap/cover-en.png
---

![Webinar cover](/images/events/hami-2.9-webinar-recap/cover-en.png)

**Topic:** HAMi 2.9 Release Deep Dive — *How HAMi 2.9 Reshapes Kubernetes AI Compute Scheduling*

**Time:** Evening of Wednesday, May 14, 2026

**Channel:** WeChat Channels (HAMi Community)

**Speaker:** Li Mengxuan — HAMi Maintainer; Co-founder & CTO, Dynamia

**Host:** Jimmy Song — Dynamia; HAMi community and ecosystem

## Session Overview

In this session, Li Mengxuan walked through the core features of HAMi 2.9, with a focus on Huawei Ascend NPU soft partitioning and the HAMi DRA architecture, and answered hot questions on heterogeneous compute scheduling, monitoring, and domestic accelerator support. The webinar included a live demo so viewers could see the new capabilities in action.

Over the past two years, HAMi has been focused on one thing: **helping Kubernetes manage AI compute resources more effectively.** From GPU sharing and heterogeneous scheduling to native Kubernetes resource models such as DRA, HAMi continues to push these directions forward.

## HAMi v2.9 Core Updates

HAMi v2.9 brings three major capability upgrades:

- **HAMi-Core mode** — Ascend 910C userspace soft partitioning, without vendor proprietary drivers
- **HAMi-DRA** — a native resource model based on Kubernetes DRA, now production-ready
- **Heterogeneous scheduling enhancements** — broader support for heterogeneous GPUs and AI accelerators

### Version Differences and Upgrade Strategy

Feature differences: HAMi 2.9.0 includes multiple feature upgrades, while 2.8.3 mainly focuses on HAMi Core bugfixes; its feature set still aligns with 2.8.0.

**Canary upgrade compatibility:** Since 2.5.0, HAMi has supported canary upgrades. After a new release, jobs submitted under older versions are still recognized; older jobs keep older capabilities, and new jobs automatically use the new ones.

> **Deployment and Update Guidelines**
>
> - Strongly recommend updating with Helm; **you must update both the Chart and the images**
> - Never replace only the images without updating the Chart—that can break cluster deployment

**Performance gains:** The new release deeply optimized HAMi Core by reducing lock contention and replacing some locks with atomic operations. Performance overhead dropped to about one-third of before, approaching native performance limits.

## HAMi-Core: Ascend NPU Userspace Soft Partitioning

HAMi-Core is one of the most important features in HAMi v2.9. To address the limits of hard partitioning (MIG), HAMi introduced userspace soft partitioning: it splits compute in userspace without depending on vendor proprietary drivers, with better generality and maintainability.

![HAMi-Core optimization](/images/events/hami-2.9-webinar-recap/hami-core-optimization-en.png)

### Advantages and How It Works

- **Beyond hard-partition limits:** For scenarios such as Ascend 910B/C that lack hard partitioning or have coarse granularity (for example, 910B’s minimum 16GB), soft partitioning supports custom slice sizes and elastic compute scaling
- **Architecture:** A Limiter daemon starts in each container, communicates with a global coordination layer to obtain compute-spec tokens, and uses libvnpu.so to intercept memory allocation and Kernel Launch operations for resource limiting

![Ascend soft partitioning steps](/images/events/hami-2.9-webinar-recap/ascend-soft-partition-steps-en.png)

![Ascend soft partitioning flow](/images/events/hami-2.9-webinar-recap/ascend-soft-partition-flow-en.png)

### Configuration and Usage

- **Configuration:** Supports global and node-level configuration; node-level takes precedence over global
- **Required annotation:** The current release requires an explicit Pod annotation `huawei.com/vnpu-mode: 'hami-core'`; otherwise jobs cannot be scheduled to soft-partition nodes

![Ascend soft partitioning configuration](/images/events/hami-2.9-webinar-recap/ascend-config-en.png)

![Ascend soft partitioning usage](/images/events/hami-2.9-webinar-recap/ascend-usage-en.png)

> **Live Demo Results**
>
> The live demo successfully adjusted a VLM job’s memory limit on 910B from 64GB to 40GB (a granularity hard partitioning cannot achieve), validating soft partitioning. The solution is fully open source and supports 910B, 910C, 310, and related models with driver 25.05 or later.

## HAMi-DRA: A Native Kubernetes Resource Model

HAMi-DRA is an implementation based on Kubernetes Dynamic Resource Allocation (DRA), bringing GPU/NPU and other accelerator resource management onto the native Kubernetes path. HAMi-DRA is now production-ready.

![How to deploy HAMi DRA](/images/events/hami-2.9-webinar-recap/hami-dra-deploy-en.png)

### Architecture Advantages and Compatibility

- **Decoupled from the scheduler:** HAMi DRA no longer includes a scheduler component; it acts as a webhook and monitoring component, and works cleanly with the Kubernetes native scheduler as well as third-party schedulers such as Volcano and Kube-batch
- **Transparent migration:** Users do not need to understand DRA internals; they can still request resources in a Device Plugin–like way (for example, `limits.nvidia.com/gpu`), and HAMi DRA automatically converts them into ResourceClaims

### Production Capability Enhancements

- **Monitoring and troubleshooting:** Provides a full cluster monitoring view for device reuse, resource allocation details, and scheduling events—addressing the difficulty of troubleshooting with native DRA alone

> **Selection Guidance**
>
> - Standardized clusters seeking best scheduling (for example, topology awareness) → recommend native HAMi
> - Highly customized clusters (with an existing scheduler) or plug-and-play device reuse → recommend HAMi DRA

HAMi-DRA docs: [https://github.com/Project-HAMi/HAMi-dra](https://github.com/Project-HAMi/HAMi-dra)

> **Notes:**
>
> - Kubernetes 1.35+ required
> - The DRA Consumable Capacity feature gate will be enabled by default in K8s 1.36
> - DRA mode still goes through hami-core
> - NPU DRA support is under development and expected in 2.10; a test build will be released for community trial before then

## Video Replay

The full webinar replay is available on the HAMi Community WeChat Channel.

Bilibili replay: [How HAMi 2.9 Reshapes Kubernetes AI Compute Scheduling](https://www.bilibili.com/video/BV13m5Y6nEv3/)

## Speaker Deck Download

The speaker deck is ready on HAMi Community GitHub: [hami-2.9-kubernetes-ai-scheduling-limengxuan-20260514.pdf](https://github.com/Project-HAMi/community/blob/main/webinar/01-hami-2.9-kubernetes-ai-scheduling-limengxuan-20260514.pdf)

## Q&A Notes

Audience questions collected during the webinar:

### GPU and NPU Partitioning

**Q: Can HAMi support hot-mounting a GPU into a container—switching from a CPU container to a GPU container without restarting the Pod?**

Not currently. It depends on the underlying container runtime (such as containerd/CRI-O) supporting hot-mounting devices. There is no adaptation plan for now. Watch for CNCF projects that may support this.

**Q: HAMi also has soft partitioning for Huawei Ascend NPU 910B/C—is it fully open source or commercial?**

Both exist; the soft partitioning solution is fully open source. Huawei Ascend can be supported openly because of its Apache 2.0 license.

**Q: Does soft partitioning cover all NPUs—910B, 910C, and 310?**

Yes—supported on driver 25.05 and later.

**Q: After soft-partitioning a Huawei Ascend NPU (910B), once the Pod is deleted and the vNPU blocks are destroyed, running 8-GPU full-machine large-model inference hits “PTA call acl api failed.” Rebooting the server fixes it. Is this an HAMi NPU virtualization issue?**

Needs reproduction in the environment; recommend contacting the vendor.

**Q: After soft partitioning, do monitoring metrics align with the container limit size—for example, is utilization calculated with the slice size as the denominator?**

No. Current monitoring shows physical whole-card utilization, not logical utilization based on slice size (for example, 20% physical usage divided by a 30% quota). Similar to NVIDIA, it is whole-card utilization.

**Q: Are there plans to support vNPU monitoring?**

Ascend soft-partition monitoring is on the roadmap.

**Q: What does hami-core dynamic adjustment mean?**

There is no dynamic adjustment feature at this time.

**Q: Running `npu-smi info` in a Pod on Ascend 910B4-1 fails with DrvMngGetConsoleLogLevel failed / dcmi model initialized failed because the device is used. Does Ascend support running `npu-smi info` inside the container?**

Yes. This is likely because the card is not a clean device.

### DRA

**Q: Does DRA mode still go through hami-core?**

Yes.

**Q: Does NPU support DRA?**

Under development; expected to release in the next version (2.10). A test build will be shared with the community before then.

**Q: Where are the HAMi DRA docs?**

[https://github.com/Project-HAMi/HAMi-dra](https://github.com/Project-HAMi/HAMi-dra)

**Q: For memory partitioning under Volcano, should we use HAMi-DRA or volcano-vgpu-device-plugin?**

Prefer volcano-vgpu-device-plugin. HAMi DRA can also work, but the former is better adapted today.

**Q: Is there a best-practice guide?**

Just released; best practices have not been written yet—contributions welcome. Kubernetes 1.35+ required.

**Q: Does K8s 1.35 enable the DRA Consumable Capacity feature gate by default?**

No—default enablement comes in 1.36.

### Heterogeneous Scheduling and Ecosystem

**Q: Does HAMi plan to support Alibaba T-Head PPU?**

There is interest, but vendor open-source license authorization is required. Huawei Ascend can be supported openly under Apache 2.0; Alibaba PPU currently has no comparable open-source project and needs vendor cooperation.

**Q: Can heterogeneous setups mix-train or mix-infer across cards such as NVIDIA and domestic accelerators, or across different domestic cards?**

It depends on whether the domestic card itself can mix-train with NVIDIA. If the hardware supports it and networking is configured correctly, HAMi as a scheduling component can support it, but performance may be affected. Refer to vendor documentation.

**Q: Has HAMi optimized topology-aware scheduling?**

Yes—for many GPUs.

**Q: Can you give an example of topology-aware scheduling?**

Examples include Kunlunxin and AWS scheduling logic.

**Q: Can Volcano with HAMi support partitioning and scheduling for other domestic cards? Any plans?**

Wait for schedulers adapted for those domestic cards; vendor agreement and cooperation are required.

**Q: Will remote invocation be supported later?**

Someone submitted a proposal: [GitHub Gist](https://gist.github.com/ManishSharma1609/92775165012b9d67e2ea707d9c7aa44a)

### Operations and Stability

**Q: How do reliability and load-balancing / elastic scaling work for training and inference?**

There is fault isolation; the scheduler is also stateless and can restart. AWS Karpenter can provide elastic scaling and can be used with HAMi.

**Q: After upgrading HAMi, do old Pods still run on the old hami-core? And for scheduler crashes caused by bulk Pod deletion, what concurrency is supported now?**

Yes—old Pods still use the old Core (canary upgrade). For scheduler crashes from bulk Pod deletion, more testing is needed; please file an Issue if you hit it.

**Q: Can HAMi memory oversubscription be used in production?**

The HAMi community edition supports only logical oversubscription; exceeding physical memory in actual use causes OOM. For production-grade memory oversubscription, see HAMi Enterprise Edition.

## Summary

HAMi 2.9 is a milestone release. HAMi-Core userspace soft partitioning frees Ascend NPU compute sharing from vendor hard-partition limits, and HAMi-DRA offers a new path for heterogeneous compute management that fits the native Kubernetes ecosystem. Audience questions showed strong demand for GPU/NPU shared scheduling, domestic accelerator support, and production DRA adoption. HAMi will keep investing in these directions, and welcomes more developers and enterprise users to join the community and advance Kubernetes AI compute scheduling together.

> **Follow the HAMi Community WeChat Channel**
>
> We will keep hosting community webinars and invite more friends from the HAMi community and AI Infra to share practices, technical approaches, and frontier exploration. Whether you use HAMi, contribute to it, or care about AI compute management, follow our channel to learn and grow together.
>
> Search WeChat Channels for **HAMi Community** and follow so you do not miss what is next!

Follow Chinese community updates and join the WeChat group via the official account, WeChat Channel, and community assistant.

![Welcome to the HAMi community](/images/events/hami-2.9-webinar-recap/join-community.jpg)
