---
title: 'Dynamia × Qingcheng Jizhi: An Integrated "Scheduling + Infrastructure" Solution for Enterprise Large-Model Applications'
linktitle: Dynamia × Qingcheng Jizhi Partnership
date: '2026-01-13'
excerpt: Recently, Dynamia and Qingcheng Jizhi announced a strategic partnership in Beijing, addressing the efficiency challenges of heterogeneous compute scheduling in the AI industry and providing an integrated "scheduling + infrastructure" solution for enterprise large-model applications.
author: Dynamia
tags:
  - Strategic Partnership
  - Qingcheng Jizhi
  - Bagualu
  - Heterogeneous Compute
  - HAMi
category: Company News
language: en
coverImage: >-
  /images/blog/dynamia-qingcheng-partnership/dynamia-qingcheng-signing-ceremony.webp
---

> As an active open-source project, HAMi is maintained by 350+ contributors from 15+ countries, has been adopted by 200+ enterprises and institutions in real production environments, and offers strong extensibility and support assurance.

Recently, Dynamia and Qingcheng Jizhi announced a strategic partnership in Beijing and released their first joint results.

Their deep collaboration targets the difficult efficiency challenges of heterogeneous compute scheduling in today's AI industry, providing an integrated **"scheduling + infrastructure"** solution for enterprise large-model applications. The CNCF HAMi project, initiated and led by Dynamia, serves as a core scheduling-layer component, delivering heterogeneous GPU virtualization and resource governance.

![Strategic partnership signing ceremony](/images/blog/dynamia-qingcheng-partnership/dynamia-qingcheng-signing-ceremony.webp)

Strategic partnership signing ceremony held by both parties in Beijing

## Addressing an Industry Pain Point: Wasted Compute Resources

Driven by both the post-Moore era and the AI boom, heterogeneous compute such as GPUs and NPUs has become the core fuel for AI development. In practice, however, compute problems often show up not as "whether compute is available," but in how it is used: inference load fluctuates sharply; **GPU resources are unevenly utilized and highly fragmented**; allocation is uneven; and service stability is hard to balance with operational control. These issues directly reduce compute efficiency and raise the overall cost of large-model applications.

![Compute resource waste](/images/blog/dynamia-qingcheng-partnership/compute-resource-waste-problem.webp)

"The compute problem is no longer 'whether you have it,' but 'whether you use it well,'" said He Wanqing, VP of Technical Ecology at Qingcheng Jizhi. "When enterprises face complex deployment scenarios of k business types × m models × n AI accelerator cards, end-to-end optimization alone is not enough to break the efficiency deadlock."

## First Results Delivered: Multiplying Compute Efficiency

Based on a deep understanding of these industry pain points, the two parties have completed their first round of technical integration. **Qingcheng's Bagualu intelligent software stack has integrated Dynamia HAMi's vGPU virtualization and scheduling system**, with clear synergistic effects:

**A leap in resource utilization** (HAMi's core capability): Through HAMi's hard GPU-memory isolation and proportional compute allocation, a single physical GPU can be flexibly sliced into multiple virtual resources. Combined with Bagualu's multi-workload management, this enables fine-grained configuration and addresses previous uneven resource allocation.

**Full-link operations visibility**: Users can manage the full workflow of training, inference, and quantization from a unified platform, while monitoring in real time detailed metrics such as workload, kernel scheduling, and GPU-memory usage.

**A breakthrough in domestic compute adaptation**: Drawing on Qingcheng Jizhi's deep adaptation for domestic chips such as Ascend and Hygon, and combined with HAMi's cross-hardware scheduling, the parties enable unified management of multi-architecture compute pools, breaking the "scheduling barriers caused by hardware fragmentation."

![HAMi vGPU virtualization and scheduling in the Bagualu intelligent software stack](/images/blog/dynamia-qingcheng-partnership/bagualu-stack-hami-vgpu-integration.webp)

HAMi vGPU virtualization and scheduling shown within the Bagualu intelligent software stack

Beyond the ongoing collaboration on GPU virtualization and large-model training and inference infrastructure, the two parties will deepen cooperation across product collaboration, platform integration, and scenario expansion, building a tightly coordinated "Bagualu application layer + scheduling layer + infrastructure layer" system:

Dynamia will work with Qingcheng Jizhi's Bagualu intelligent computing software stack—its large-model parallel training system, Chitu inference engine, and AI Ping—to help Dynamia's users use large-model compute more efficiently under a unified scheduling platform. Qingcheng Jizhi will integrate Bagualu platform services with Dynamia's compute scheduling and GPU virtualization capabilities, providing AI infrastructure support and expanding its service boundary in large-model training scenarios. At the GPU monitoring and management layer, the fine-grained monitoring data provided by Dynamia will complement Qingcheng Jizhi's platform capabilities, offering a clearer data foundation for subsequent compute-cluster operations and large-scale operations.

Both parties believe that as compute scale continues to grow, capabilities at a single layer can no longer independently support complex AI application scenarios. Closer collaboration between the compute scheduling layer and the AI infrastructure layer helps build a more sustainable compute usage model and provides solid compute support for the long-term development of large-model applications. Qingcheng Jizhi and Dynamia are jointly committed to advancing compute resources from "static allocation" to "dynamic scheduling" without significantly increasing user complexity, so that large-model capabilities can serve real business needs more stably and flexibly. **Going forward, Dynamia will also advance collaboration between HAMi and more AI platforms, infrastructure vendors, and compute ecosystem partners, driving heterogeneous compute scheduling into more real production scenarios.**

---

### About Dynamia

Dynamia focuses on providing global solutions for heterogeneous compute scheduling and unified management, helping improve compute efficiency in the AI era. It initiated and leads the CNCF project HAMi—currently the industry's only open-source project focused on heterogeneous GPU resource sharing. Through flexible, reliable, on-demand, and elastic GPU virtualization, HAMi improves resource utilization and can be deployed in a pluggable, lightweight, and non-intrusive way across any public, private, or hybrid cloud environment. It supports heterogeneous chips including NVIDIA, Ascend, MetaX, Cambricon, Hygon, Moore Threads, Iluvatar CoreX, Enflame, Kunlunxin, and AWS. To date, HAMi has 350 contributors from 16 countries worldwide and has been adopted by more than 200+ OS vendors, compute cloud providers, and vertical-industry customers, successfully achieving 0-to-1 adoption in industries such as finance, logistics, intelligent driving, robotics, and biotech.

### About Qingcheng Jizhi

Qingcheng Jizhi is a Tsinghua-affiliated AI Infra standout focused on intelligent compute system software. It has built a product lineup covering large-model training, inference, and service evaluation: the "Bagualu" training system targets large-model parallel training and improves training efficiency on heterogeneous clusters; the Chitu inference engine delivers high-performance, low-cost inference through optimizations such as FP8/FP4, lowering deployment cost and helping improve the domestic compute ecosystem. AI Ping provides large-model API evaluation and one-stop invocation, helping users select and integrate models efficiently.
