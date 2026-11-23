---
title: Compete on Efficiency, Not Raw Compute — Full Technical Recap of HAMi Meetup Shanghai
date: '2025-12-16'
excerpt: >-
  The HAMi Meetup was successfully held in Shanghai on November 30 around the
  theme “Compete on Efficiency, Not Raw Compute,” focusing on GPU virtualization
  and heterogeneous compute scheduling practice. Experts from CNCF and multiple
  companies shared the latest progress and production experience with HAMi in
  scheduling observability, GPU sharing, domestic accelerator enablement, and
  cloud-native AI infrastructure.
author: Dynamia
tags:
  - HAMi
  - Heterogeneous Compute Scheduling
  - GPU Virtualization
  - Cloud-Native AI
  - Kubernetes
  - Domestic Accelerators
  - AI Training and Inference Optimization
  - Open Source Ecosystem
  - HAMi Meetup
category: Community & Events
coverImage: /images/events/hami-meetup-shanghai/cover-en.png
language: en
linktitle: HAMi Shanghai Meetup Recap
---

![HAMi Meetup Shanghai](/images/events/hami-meetup-shanghai/cover-en.png)

On November 30, the first HAMi Meetup wrapped up successfully at Shanghai ModelSpeed Space. Under the theme “Compete on Efficiency, Not Raw Compute,” nearly a hundred AI developers, ops engineers, and enterprise IT architects joined on site, while more than 700 viewers followed the livestream. The event centered on the core challenges of heterogeneous compute scheduling. Practitioners from CNCF, Dynamia, NIO, MetaX, DaoCloud, and Transwarp took the stage in turn, covering accelerator enablement, utilization improvement, AI training optimization, and domestic compute rollout. They not only unpacked reusable technical approaches, but also shared collaboration experience and pitfalls from real deployments — dense with practical takeaways.

![HAMi Meetup Shanghai event floor](/images/events/hami-meetup-shanghai/image1.png)

## Opening Keynote

![CNCF Keith Chan opening keynote](/images/events/hami-meetup-shanghai/image2.png)

Keith Chan, Vice President of the Linux Foundation and CNCF Chair for China in the Asia-Pacific region, delivered the opening keynote. He noted that HAMi’s breakthroughs in GPU virtualization have made it an important force for enterprises at home and abroad advancing cloud-native AI infrastructure, and have helped the project enter CNCF incubation while continuing to accelerate. As demand for compute grows explosively, enterprises care not only about “how many GPUs they own,” but about “how efficiently they use those GPUs.” With generative AI on the rise, more large-model applications are migrating fully to cloud-native environments, and 70%–80% of inference and training workloads already run on Kubernetes. He also noted that in global surveys, more than 80% of enterprises see open source as a key driver of AI maturity, while multi-cloud deployment has become an industry consensus in the large-model era. On that basis, CNCF is working with vendors worldwide on the Certified AI Platform for Kubernetes standardization initiative, covering accelerators, storage, networking, scheduling, observability, and security through 100+ conformance tests to ensure AI workload compatibility, portability, and observability across multi-cloud environments. As cloud-native expands across AI, edge, quantum computing, and distributed systems, infrastructure competition in the large-model era will shift from “stacking more cards” to “winning on efficiency.” HAMi’s continued progress in GPU virtualization and heterogeneous scheduling will provide critical capabilities for global AI infrastructure, and will help CNCF grow the next generation of cloud-native AI ecosystems.

## Full Recap of Five Talks

### “HAMi 2.7.0 Deep Dive and 2.8.0 Roadmap: Full Heterogeneous Chip Coverage and a Leap in Scheduling Capabilities”

![HAMi core maintainer Li Mengxuan presenting](/images/events/hami-meetup-shanghai/image3.png)

HAMi core maintainer Li Mengxuan walked through HAMi’s evolution from 2.7.0 to 2.8.0. On usability, 2.7.0 added scheduling-reason visibility and resource-quota monitoring improvements: users can see at a glance why a Pod is Pending, and can more accurately track memory-quota usage, addressing quota distortion introduced by virtualization. On ecosystem and hardware, HAMi already supports GPUs from nine vendors and extends to Kunlunxin XPU, AWS Trainium / Inferentia, and other heterogeneous devices, presenting these capabilities through a more friendly Web UI. Looking ahead, 2.8.0 focuses on scheduling performance and Web UI support for heterogeneous devices, and plans to converge existing scheduler and device-plugin capabilities into a new DRA driver via DRA — delivering more standardized dynamic partitioning, hard isolation, and multi-dimensional resource requests without changing users’ habits, and laying the groundwork for large-scale cluster deployments.

### “MetaX sGPU on HAMi”

![MetaX Guo Lei sharing MetaX sGPU](/images/events/hami-meetup-shanghai/image4.png)

Guo Lei, cloud-native infrastructure expert at MetaX and a core contributor to MetaX sGPU, shared the full journey of bringing sGPU into the HAMi community. sGPU partitions memory and compute at fine granularity (memory at 1 MB granularity, compute at 1% granularity). Working with the HAMi scheduler and the MetaX device plugin, Pods can request virtual GPU resources such as “60% compute + 4 GB memory” on demand. At the scheduling layer, HAMi natively provides node-level and GPU-level binpack/spread policies that can be combined to balance utilization and workload isolation. At the QoS layer, sGPU offers best effort, fixed share, and burst share policies, covering needs from full preemption to elastic quotas, and pairs with online/offline co-location so that under resource pressure, lower-priority offline jobs can be paused automatically to make room for online inference. With topology-aware scheduling, full-card jobs can also preferentially receive GPU combinations with better interconnects. Guo concluded that deep integration of sGPU and HAMi lets MetaX expose “shareable, schedulable, finely controllable” GPU services to upper-layer workloads through standard interfaces within the Kubernetes stack.

### “mlperf on vGPU”

![NIO Li Peng sharing mlperf on vGPU](/images/events/hami-meetup-shanghai/image5.png)

In real production scenarios, virtualization is not a question of “whether to use it,” but of “which approach has the least side effects.” Li Peng, head of training acceleration in NIO’s cloud engineering team, shared a training performance optimization framework based on HAMi vGPU, focusing on a complete path to high-precision performance diagnosis in virtualized environments. Li noted that HAMi’s perf-based virtualization mechanism provides a natural entry point for analysis: by intercepting core GPU libraries such as CUDA/cuBLAS/NVML, it can capture full-path GPU function calls without changing application code. This non-intrusive data collection enables teams to comprehensively record GPU execution logic, kernel scheduling, memory usage, and communication behavior, and to complement that with external perf sampling to build dual CPU/GPU timelines. By fusing timelines, teams can precisely reconstruct execution state at any point in time and identify key bottlenecks such as low parallelism, communication stalls, or anomalous API parameters. At the productization layer, the framework closes the loop from “low-level bottleneck localization” to “upper-layer code attribution”: it can both quantify compute and memory efficiency and correlate across processes to specific business modules. The system has been successfully applied to NIO’s autonomous-driving training scenarios, offering a reference for large-model inference-path optimization and multimodal workload acceleration, and significantly reducing GPU waste.

### “HAMi: Open-Source GPU Scheduling Empowering AI Developers on d.run”

![DaoCloud Lu Chuanjia sharing the d.run platform](/images/events/hami-meetup-shanghai/image6.png)

Lu Chuanjia, product lead at DaoCloud, shared deep practice combining the d.run intelligent-compute scheduling platform’s SaaS GPU rental scenarios with HAMi virtualization. d.run pools diverse GPU resources in a cloud-native way and exposes them to users for training, inference, data processing, and more. In its compute-cloud business, HAMi serves as the underlying virtualization core, providing unified access for domestic GPUs and flexible slicing of memory and compute. Lu noted that self-built enterprise setups are often constrained by whole-card usage, making utilization hard to break through; while SaaS rental can improve elasticity via pay-as-you-go, it is easily affected by supply-demand swings, leaving GPU pools both fragmented and unstable. HAMi’s dynamic slicing and overcommit capabilities are critical here — they not only reduce fragmentation so a single card can offer more SKUs (such as 3G / 6G / 12G / 24G), but also avoid container restarts triggered by OOM through dynamic memory expansion, improving resource stability and inventory granularity. Today, d.run has built a GPU slicing rental platform on HAMi, with multi-cluster pooled management, unified scheduling for domestic cards, tenant-level priority and preemption policies, and deployments across inference MaaS, enterprise large-model hosting, and consumer GPU cloud. Lu said that as new HAMi capabilities such as DRA and Quota improvements mature, compute clouds will further maximize resource reuse — slicing GPU assets finer and filling them more completely.

### “Transwarp × Domestic Compute Ecosystem: Enablement Practice”

![Transwarp Hou Yuxi sharing the domestic compute ecosystem](/images/events/hami-meetup-shanghai/image7.png)

Hou Yuxi from Transwarp’s AI tools platform R&D team shared enablement practice for an LLMOps platform on Cambricon, Hygon, and other domestic accelerators, focusing on how HAMi unifies management of multi-model, multi-architecture domestic GPUs and combines with DRA to build an extensible compute abstraction. Hou explained that Transwarp’s LLMOps platform handles enterprise large-model lifecycle management and must support multi-tenant isolation, resource-group management, job queuing policies, custom memory/compute slicing templates, and end-to-end observability. HAMi therefore became the key substrate connecting different AI accelerators. For Cambricon enablement, the team addressed sMLU dynamic-slicing granularity limits, resource-name isolation across models, and total-capacity calculation failures caused by hard-coded memory units, and achieved multi-model management parity with Ascend/NVIDIA via node labels, model recognition, and resource-object array configuration. For Hygon DCU, the team further fixed non-unique device IDs, border metrics that could not be exposed correctly, and Pod–device mapping errors — obtaining hardware serial numbers via the driver SDK, rebuilding unique device IDs, and rewriting exporter logic to match HAMi device-plugin recording so metrics and scheduling stay consistent. Looking ahead, Hou noted that DRA will become the unified abstraction direction for heterogeneous GPUs: with DRA’s new APIs and features for consumable capacity and partitionable devices, compute partitioning can upgrade from custom approaches to Kubernetes-native ones. Transwarp will continue collaborating with the HAMi community to advance unified scheduling for domestic AI compute and a more standardized compute modeling system.

## Lively Discussion and Q&A

The on-site discussion was energetic, with attendees actively joining the conversation. Questions spanned GPU virtualization practice, inference efficiency optimization, and domestic accelerator enablement experience — practical angles that sparked deep discussion among speakers and enterprise engineering teams. Seats stayed full throughout, and many attendees continued technical conversations with speakers after the sessions. The exchange overall reflected strong industry attention to compute efficiency and cloud-native AI infrastructure, and a clear willingness to explore in practice.

![HAMi Meetup discussion session](/images/events/hami-meetup-shanghai/image8.png)

## Closing

This HAMi Meetup focused on improving compute efficiency. It not only produced enterprise-grade practical takeaways and shared industry consensus, but also created deep idea exchange among on-site and online developers — from technical details to business scenario fit, from open-source ecosystem building to domestic compute innovation, with discussion heat staying high. Going forward, the HAMi community will continue using open source as a bridge to connect more industry partners and developers, deepen work on heterogeneous compute scheduling, and bring lightweight, highly adaptable efficiency solutions to more enterprises — jointly advancing high-quality growth of the digital economy.

**Looking ahead to the next Meetup — we will meet again in Beijing in December**, continuing the conversation on chips and scheduling: focusing on utilization breakthroughs in heterogeneous compute virtualization, and unpacking core pain points such as idle compute resources and low utilization caused by difficult heterogeneous hardware enablement.

We also warmly invite **community users and practitioners to contribute posts**: whether your experience optimizing utilization for heterogeneous compute virtualization, or production case studies from your organization — let strong practices circulate in the community as we explore practical paths to better efficiency.
