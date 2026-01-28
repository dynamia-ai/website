---
title: 'Dynamia AI × Qingcheng Jizhi: Providing Integrated "Scheduling + Infrastructure" Solutions for Enterprise Large Model Applications'
slug: "dynamia-qingcheng-partnership"
date: "2026-01-13"
excerpt: "Recently, Dynamia AI and Qingcheng Jizhi announced a strategic partnership in Beijing, addressing the heterogeneous compute scheduling efficiency challenges in the AI industry and providing integrated 'scheduling + infrastructure' solutions for enterprise large model applications."
author: "Dynamia"
tags: ["strategic partnership", "Qingcheng Jizhi", "Bagualu", "heterogeneous compute", "HAMi"]
language: "en"
coverImage: "/images/blog/dynamia-qingcheng-partnership/dynamia-qingcheng-signing-ceremony.webp"
---

> As an active open-source project, HAMi is jointly maintained by 350+ contributors from 15+ countries and has been adopted by 200+ enterprises and institutions in actual production environments, demonstrating good scalability and support guarantees.

Recently, Dynamia AI and Qingcheng Jizhi announced a strategic partnership in Beijing and released their first joint achievement.

The deep collaboration between the two parties directly addresses the current tricky heterogeneous compute scheduling efficiency challenges in the AI industry, providing an integrated "scheduling + infrastructure" solution for enterprise large model applications. Among them, the CNCF HAMi project initiated and led by Dynamia AI serves as the core component of the scheduling layer, undertaking heterogeneous GPU virtualization and resource governance capabilities.

![Strategic Partnership Signing Ceremony](/images/blog/dynamia-qingcheng-partnership/dynamia-qingcheng-signing-ceremony.webp)

Both parties conducted a strategic partnership signing ceremony in Beijing

## Addressing Industry Pain Points: Waste of Compute Resources

Driven by the dual forces of the post-Moore era and the AI explosion, heterogeneous compute such as GPUs and NPUs has become the core fuel for AI development. However, in specific usage scenarios, compute problems often do not manifest as "whether compute resources are available," but rather concentrate on the usage stage: obvious fluctuations in inference workload, **uneven GPU resource utilization, serious fragmentation**, uneven allocation, and difficulty balancing service stability and operational controllability. These problems directly affect compute usage efficiency and also increase the comprehensive cost of large model applications.

![Compute Resource Waste](/images/blog/dynamia-qingcheng-partnership/compute-resource-waste-problem.webp)

"The compute problem is no longer 'whether we have it,' but 'whether we use it well,'" says He Wanqing, VP of Technical Ecology at Qingcheng Jizhi. "When enterprises face complex deployment scenarios of k types of business × m types of models × n types of AI accelerators, single-point end-to-end optimization is insufficient to crack the efficiency dilemma."

## First Achievement Landing: Compute Efficiency Multiplication

Based on profound insight into industry pain points, both parties have completed the first round of technology integration, and **Qingcheng's Bagualu intelligent software stack has integrated Dynamia AI's HAMi vGPU virtualization scheduling system**, with significant synergistic effects:

**Resource Utilization Leap** (HAMi Core Capability): Through HAMi's hard video memory isolation and computing power ratio allocation technology, a single physical GPU can be flexibly divided into multiple virtual resources. Combined with Bagualu's multi-business management capability, fine-grained configuration is achieved, solving previous uneven resource allocation problems.

**Full-link Operational Visualization**: Users can complete the full process management of training, inference, and quantification through a unified platform, while monitoring detailed data such as business load, kernel scheduling, and video memory usage in real time.

**Domestic Compute Adaptation Breakthrough**: Relying on Qingcheng Jizhi's deep adaptation capabilities for domestic chips such as Ascend and Hygon, combined with HAMi's cross-hardware scheduling characteristics, unified management of multi-architecture compute pools is achieved, breaking the "scheduling barriers caused by hardware fragmentation."

![HAMi vGPU in Bagualu Stack](/images/blog/dynamia-qingcheng-partnership/bagualu-stack-hami-vgpu-integration.webp)

Display of Dynamia AI's HAMi vGPU virtualization scheduling in the Bagualu intelligent software stack

In addition to the ongoing collaboration on GPU virtualization and large model training and inference infrastructure, both parties will deepen cooperation in three dimensions: product collaboration, platform integration, and scenario expansion, building a close collaboration system of "Bagualu application layer + scheduling layer + infrastructure layer":

Dynamia AI will 面向 its user ecosystem, combining with Qingcheng Jizhi's Bagualu intelligent computing software stack's large model parallel training system, Chitu inference engine, and AI Ping, helping users use large model computing power more efficiently under a unified scheduling platform. Qingcheng Jizhi will integrate with Dynamia AI's computing power scheduling and GPU virtualization capabilities through the Bagualu platform service, providing AI infrastructure-level capability support and expanding its service boundaries in large model training scenarios. In terms of GPU monitoring and management, the fine-grained monitoring data provided by Dynamia AI will complement Qingcheng Jizhi's platform capabilities, providing a clearer data foundation for subsequent compute cluster operations and large-scale operations.

Both parties believe that as computing scale continues to expand, single-level technical capabilities are difficult to independently support complex AI application scenarios. Forming closer collaboration between the compute scheduling layer and the AI infrastructure layer helps build a more sustainable compute usage model, providing solid compute support for the long-term development of large model applications. Qingcheng Jizhi and Dynamia AI are jointly committed to promoting the evolution of compute resources from "static allocation" to "dynamic scheduling" without significantly increasing user usage complexity, making large model-related capabilities more stable and flexible in serving actual business needs. **In the future, Dynamia AI will also promote HAMi to collaborate with more AI platforms, infrastructure vendors, and compute ecosystem partners to promote the landing of heterogeneous compute scheduling capabilities in more real production scenarios.**

---

### About Dynamia AI

Dynamia AI focuses on providing global solutions for heterogeneous compute scheduling and unified management, helping improve compute efficiency in the AI intelligence era. The CNCF project HAMi initiated and led by Dynamia AI is currently the only open-source project in the industry focusing on heterogeneous GPU resource sharing. Through flexible, reliable, on-demand, and elastic GPU virtualization to improve resource utilization, it can be deployed in a plug-and-play, lightweight, and non-intrusive manner in any public cloud, private cloud, or hybrid cloud environment. It supports heterogeneous chips such as NVIDIA, Ascend, Maxxiri, Cambricon, Hygon, Moore Threads, Iluvatar, Kunlunxin, AWS, etc. As of now, HAMi has 350 contributors from 16 countries around the world participating and has been adopted by more than 200+ operating system vendors, compute cloud vendors, and vertical industry customers, successfully achieving 0-to-1 landing in finance, logistics, intelligent driving, robotics, biotechnology, and other industries.

### About Qingcheng Jizhi

Qingcheng Jizhi is a Tsinghua-affiliated AI Infra star enterprise focusing on intelligent compute system software R&D, creating a product system covering large model training, inference, and service evaluation: The "Bagualu" training system 面向 large model parallel training, improving heterogeneous cluster training efficiency. The Chitu inference engine achieves high-performance, low-cost inference through FP8/FP4 and other optimizations, reducing deployment costs and helping improve the domestic compute ecosystem. AI Ping provides large model API evaluation and one-stop calling capabilities, helping users efficiently select and access.
