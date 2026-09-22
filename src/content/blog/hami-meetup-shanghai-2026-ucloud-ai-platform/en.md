---
title: 'HAMi Meetup Shanghai Deep Dive (6): How UCloud Turns HAMi Sharing into Ready-to-Use Development Environments'
linktitle: UCloud's AI Platform Engineering
date: '2026-09-22'
excerpt: >-
  The GPUs arrived; the algorithm team is still waiting for environments. Peng Peng, Senior R&D Engineer
  at UCloud, shared "Engineering Challenges and Practices of AI Computing Platforms" at HAMi Meetup Shanghai:
  unified instance specs, multi-cluster access, tool injection, and image acceleration shorten the environment
  delivery chain — with HAMi vGPU for private deployments, and separate kernel-level vGPU and QEMU passthrough
  paths for public cloud.
author: Dynamia
tags:
  - HAMi
  - HAMi Meetup
  - UCloud
  - AI Computing Platform
  - GPU Sharing
  - vGPU
  - Image Acceleration
  - Multi-Cluster
category: Community & Events
language: en
coverImage: /images/blog/hami-meetup-shanghai-2026-ucloud-ai-platform/slide-09-instance-spec-abstraction.png
---

The GPUs are in place; the algorithm team is still waiting for environments. Drivers, images, networking, storage — configured one by one, and re-adapted for every new cluster. Even with GPU sharing in place at the bottom, the platform still has to connect resource specs, scheduling configuration, and development tools so users get an environment they can start working in immediately.

This is the sixth deep-dive in our [HAMi Meetup Shanghai](/blog/hami-meetup-shanghai-2026/) series. **Peng Peng**, Senior R&D Engineer at UCloud, placed HAMi inside this environment delivery chain in "Engineering Challenges and Practices of AI Computing Platforms." The team adopted HAMi vGPU for private AI computing scenarios while lowering the usage barrier through resource abstraction, multi-cluster access, tool injection, and image acceleration. For platform teams, the reference value of this practice is how to organize low-level resource capability into a service users can use and ops can manage.

## Key Takeaways

- UCloud adopted HAMi vGPU for private AI computing scenarios, covering sharing needs like mixed large/small model deployment.
- Unified instance specs, multi-cluster access, tool injection, and image acceleration together shorten the dev-environment delivery chain.
- HAMi user-space sharing, public-cloud kernel-level vGPU, and QEMU passthrough correspond to different deployment conditions — not one interchangeable solution.

**Speaker:** Peng Peng | Senior R&D Engineer, UCloud

## Whole Cards and vGPUs Under One Instance Spec

UCloud's platform-building needs came from three directions: internal algorithm teams needing fast environment provisioning, self-built inference clusters needing unified management, and some GPU-owning customers wanting lightweight management.

What users submit is usually clear: image, CPU and memory, GPU model and count, and whole-card or vGPU allocation. But those fields can't directly become executable Kubernetes configuration — different hardware brings resource keys, allocation annotations, node constraints, and runtime parameters.

The team uses Instance Specs to define stable instance specifications, expressing whole-card or vGPU allocation uniformly, with an adaptation layer translating to the underlying configuration. Resource claims, vendor annotations, scheduling constraints, and runtime parameters are handled centrally, so each workload doesn't rewrite hardware adaptation logic. HAMi-provided shared resources enter the platform's unified environment creation flow the same way.

![Stable instance specs and an adaptation layer for underlying differences (slide 9)](/images/blog/hami-meetup-shanghai-2026-ucloud-ai-platform/slide-09-instance-spec-abstraction.png)

Users still choose the right model, count, and image. What the platform unifies is spec expression and translation — not the assumption that all GPUs are interchangeable. When new devices arrive, adaptation work can also start and validate around this layer early.

## Multi-Cluster Management: Trade-Offs Along Real Business Boundaries

Clusters sit in different regions, with different storage, network, and registry conditions. Managing multiple clusters means continuously handling access credentials, capacity and health, job lifecycle, and log/metric aggregation.

The team evaluated full multi-cluster orchestrators like Karmada, and ultimately chose to access each cluster's Kubernetes API via kubeconfig. The reason: their scenario is bounded — a task picks one target cluster at creation and needs no cross-cluster distribution, migration, or disaster recovery afterward.

Under that premise, lightweight access avoids the maintenance burden of an extra control plane and resource model. Logs and metrics still need separate adaptation; credentials must be managed as sensitive information with access control enforced.

![The lightweight-access trade-off for single-task, single-cluster scenarios (slide 11)](/images/blog/hami-meetup-shanghai-2026-ucloud-ai-platform/slide-11-lightweight-multi-cluster.png)

The choice has a clear applicability range. When business truly needs cross-cluster migration and disaster recovery, the orchestration solution and data conditions must be re-evaluated — lightweight access is not a substitute for full multi-cluster capability.

## Tool Decoupling and On-Demand Loading Cut Environment Wait

Algorithm frameworks and project dependencies want stability; dev tools like SSH and VSCode update constantly. Baking everything into one image means every tool upgrade drags along image rebuilds and environment revalidation.

The team moved to assembling tools at environment creation — injecting development capability via sidecars and supplementing configuration through rules. The algorithm container and platform tools can be maintained separately, while shared files, network interfaces, and configuration boundaries still need defining.

![Assembling dev tools at runtime, decoupling algorithm images from tool updates (slide 13)](/images/blog/hami-meetup-shanghai-2026-ucloud-ai-platform/slide-13-runtime-tool-injection.png)

Image size itself slows startup. The traditional flow downloads and decompresses every layer before assembling the filesystem. The acceleration approach in the talk scans the original image's compressed layers and generates independent file indexes. At runtime, the system fetches metadata and indexes first, mounts remote layers, and reads needed chunks — writing them to local cache — only when files are actually accessed.

Downloading hasn't disappeared; some reads have just moved after container start. If the application immediately reads large files, the wait is still there; layers without usable indexes or unsuited to lazy loading fall back to regular pulling.

![Image indexing, on-demand reads, and the fallback path to regular pulling (slide 14)](/images/blog/hami-meetup-shanghai-2026-ucloud-ai-platform/slide-14-on-demand-image-loading.png)

So judging whether environments got faster should follow through to the application actually being usable — not stop at "container started."

## HAMi for Private Deployments; Separate Isolation Paths for Public Cloud

Peng recounted that the team tried MIG early on, but under their device and business conditions ran into inflexible slice profiles and hardware that was hard to adapt; they then chose HAMi for private AI computing scenarios. He also shared practice improving GPU utilization with HAMi in mixed large/small model deployment. Concretely: private AI computing uses HAMi vGPU — GPU sharing plus memory and compute quotas in Kubernetes; public-cloud consumer-GPU scenarios use kernel-level vGPU, mapping logical devices to QEMU via VFIO; public-cloud enterprise-GPU scenarios involve passing different GPUs of a whole machine through to different VMs.

The selection logic is clear: HAMi carries user-space resource sharing and quota control in private scenarios, fitting Kubernetes resource usage; kernel-level vGPU and QEMU per-card passthrough are UCloud's engineering solutions for the other two deployment environments. The three paths face different hardware and tenant-isolation conditions, and each needs its own design and validation.

![Different deployment scenarios map to different GPU management approaches (slide 16)](/images/blog/hami-meetup-shanghai-2026-ucloud-ai-platform/slide-16-gpu-isolation-scenarios.png)

Enterprise-card passthrough must also consider multi-card communication. Keeping NVLink requires a trusted Fabric service managing the shared NVSwitch, coordinated with VM lifecycle; the alternative disables NVLink and passes GPUs through as independent PCIe devices — simpler engineering, but losing that high-speed interconnect.

Which path to take depends on hardware conditions, deployment form, isolation requirements, and communication needs. Getting a GPU allocated is only one link in the delivery chain.

Peng also listed model weight loading, inference resource coordination, idle CPU reuse, and heterogeneous compute selection as future exploration directions, extending the platform's focus toward model runtime and resource operations.

For enterprises evaluating HAMi, UCloud's practice offers a clear order of checks: can sharing specs enter the environment-creation flow; can images and tools be delivered smoothly; can quotas and lifecycle be managed continuously at runtime. The enterprise value Dynamia emphasizes lives in this complete chain: making HAMi's resource sharing work together with platform integration, compatibility validation, and operational management — cutting the wait from "got a GPU" to "can start working."

## Video and Slides

- **Bilibili replay:** [Keynote | Engineering Challenges and Practices of AI Computing Platforms — Peng Peng](https://www.bilibili.com/video/BV1GFY56LERB/)
- **Download slides:** [ucloud-ai-platform-engineering-pengpeng.pdf](https://github.com/Project-HAMi/community/blob/main/hami-meetup/04-shanghai-20260906/ucloud-ai-platform-engineering-pengpeng.pdf)

## Series

- [Overview: HAMi Meetup Shanghai Recap](/blog/hami-meetup-shanghai-2026/)
- [(1) Where Does HAMi Fit in the CNCF × PyTorch Cloud Native AI Foundation?](/blog/hami-meetup-shanghai-2026-cncf-pytorch-ai-foundation/)
- [(2) After GPU Sharing: How HAMi 2.10 Improves Isolation, Scheduling, and Observability](/blog/hami-meetup-shanghai-2026-hami-2-10-remote-gpu/)
- [(3) Inference Control vs. GPU Resource Management: How llm-d and HAMi Can Work Together](/blog/hami-meetup-shanghai-2026-llm-d-inference-plane/)
- [(4) Turning GPU Performance into Inference Service Capability: Lessons from Iluvatar](/blog/hami-meetup-shanghai-2026-iluvatar-gpu-inference/)
- [(5) How iFLYTEK Manages Multi-Business GPU Sharing with Volcano + HAMi-core](/blog/hami-meetup-shanghai-2026-volcano-hami-core/)
- **(6) How UCloud Turns HAMi Sharing into Ready-to-Use Development Environments** (this post)
- [(7) From User to Co-Builder: Why Enterprises Need a Sustainable HAMi Community](/blog/hami-meetup-shanghai-2026-community-panel/)
