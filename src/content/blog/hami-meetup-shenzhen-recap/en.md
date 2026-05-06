---
title: "HAMi Community Meetup Shenzhen Recap: Seven Experts Discuss the Cloud-Native Future of AI Compute"
date: '2026-04-25'
excerpt: >-
  On April 25, 2026, the HAMi Community successfully held its third offline
  Meetup in Shenzhen. Seven technical experts from CNCF, SF Technology, China
  Merchants Bank, Enflame, Sangfor, BroadWare Technology, and Dynamia AI
  gathered to discuss AI infrastructure cloud-native evolution, GPU compute
  pooling, heterogeneous scheduling, and DRA technology outlook.
author: Dynamia
tags:
  - HAMi
  - Meetup
  - Shenzhen
  - GPU virtualization
  - heterogeneous scheduling
  - DRA
  - cloud native
  - AI infrastructure
category: Community & Events
language: en
coverImage: /images/blog/hami-meetup-shenzhen-recap/shenzhen-meetup-group-photo.webp
linktitle: HAMi Shenzhen Meetup Recap
---

![HAMi Meetup Shenzhen](/images/blog/hami-meetup-shenzhen-recap/shenzhen-meetup-group-photo.webp)

On April 25, 2026, the HAMi Community successfully hosted its third offline Meetup in Shenzhen. Themed "Compete on Efficiency, Not Compute," seven technical experts from CNCF, SF Technology, China Merchants Bank, Enflame, Sangfor, BroadWare Technology, and Dynamia AI delivered an in-depth technical feast, covering frontier topics including cloud-native evolution of AI infrastructure, GPU compute pooling, heterogeneous scheduling, and DRA technology outlook.

This event was organized by the HAMi Community, hosted by Dynamia AI, and co-organized by SF Technology, which provided the venue.

## Event Highlights

- **Keith Chan (CNCF China Director, Linux Foundation VP of APAC)** shared a global perspective on cloud-native trends in AI infrastructure, revealing that AI-related sessions account for 60%-80% of KubeCon Shanghai proposals
- **Li Mengxuan (Co-founder & CTO of Dynamia AI, HAMi Maintainer)** publicly unveiled core features of v2.9 for the first time, revealing the DRA ecosystem alliance strategy and the vision for unified heterogeneous compute management
- **Chen Junchao (Senior Backend Engineer, SF Technology)** shared real-world GPU pooling deployment across multi-cloud environments, raising average cluster utilization from 40% to 90%
- **Su Xi (R&D Engineer, China Merchants Bank)** revealed supernode hardware adaptation and network topology-aware scheduling, reducing cross-machine scheduling probability by 30%
- **Ma Da (Enflame)** demonstrated a full-stack cloud-native integration solution with GPU Operator + CDI + DRA
- **Jia Haojie (Chief Architect of Cloud AI, Sangfor)** shared AI compute gateway governance strategies, converting every bit of compute into measurable business value
- **Ou Binkai (Researcher, BroadWare Technology)** showcased a one-click deployment platform deeply integrated with HAMi for GPU virtualization

## Keynote: The Infrastructure of AI's Future

Keith Chan, CNCF China Director and Linux Foundation VP of APAC, delivered a keynote titled "The Infrastructure of AI's Future." He shared CNCF survey data showing:

- 66% of enterprises globally are already running AI workloads on cloud-native environments
- Kubernetes has become the unified orchestration layer for AI infrastructure
- NVIDIA has officially joined CNCF as a Platinum member, and the PyTorch community is deeply integrating with the cloud-native ecosystem
- AI-related sessions account for 60%-80% of KubeCon Shanghai proposals

Keith noted that the competitive focus in AI is shifting from "stacking compute" to "optimizing compute utilization." High GPU costs and insufficient resource utilization have become global challenges. How to leverage compute at the lowest cost and highest efficiency has become the core proposition. CNCF is actively promoting the Certified AI Platform for Kubernetes standardization initiative to provide direction for the cloud-native evolution of AI infrastructure.

## Technical Talk Recaps

### HAMi DRA Ecosystem Alliance & v2.9 Preview

Li Mengxuan, Co-founder & CTO of Dynamia AI and HAMi Maintainer, publicly unveiled the core features and future roadmap of HAMi v2.9 for the first time.

DRA (Dynamic Resource Allocation) is becoming the next-generation device management model for Kubernetes, but faces implementation uncertainty on the vendor side and high adoption barriers on the user side. To address this, the HAMi Community will launch the **DRA Ecosystem Alliance**, connecting device vendors with users to drive DRA adoption in real-world scenarios and standardized evolution.

**DRA Solution Deployment:**

- DRA solutions for NVIDIA / Ascend / Enflame platforms have been implemented
- Simplified scheduling chain through native Kubernetes capabilities, lowering user adoption barriers
- Unified scheduling layer shields underlying hardware differences, enabling unified heterogeneous compute management

**HAMi v2.9 Core Capabilities Preview:**

- Finer-grained Ascend partitioning to improve domestic compute resource utilization
- Support for kai-scheduler, expanding the scheduler ecosystem
- Dynamic MIG scheduling optimization for more flexible NVIDIA GPU partitioning

### SF Technology: HAMi in Multi-Cloud Deployment

Chen Junchao, Senior Backend Engineer at SF Technology, shared the complete practical experience of building a unified compute pooling solution based on HAMi.

SF Technology faced core challenges including low GPU utilization, fragmented multi-cluster resources, and high operational complexity — particularly across 5 private cloud clusters and multiple public clouds where the traditional "whole-card allocation" model led to significant compute waste.

**HAMi-based Solution:**

- Unified scheduling and fine-grained management of AI compute across multi-cloud Kubernetes clusters
- Breaking the GPU exclusive mode through fine-grained partitioning for multi-task multiplexing
- Raising average cluster GPU utilization from 40% to 90%, significantly reducing compute costs
- Unified operations plane, reducing multi-cluster management complexity

This solution has been running stably across multiple SF Technology production clusters, validating HAMi's reliability and scalability in large-scale enterprise scenarios.

### China Merchants Bank: Heterogeneous AI Compute Scheduling Optimization

Su Xi, R&D Engineer at China Merchants Bank, shared the in-depth practice of building a unified multi-source heterogeneous AI compute scheduling platform based on HAMi.

China Merchants Bank built a complete technical loop of "one pool, multiple chips, elastic sharing, and topology optimization" based on HAMi, successfully addressing core challenges of compute silos, low resource utilization, and high operational costs.

**Ascend 910C Supernode Adaptation:**

- Deep hardware adaptation for the Ascend 910C supernode architecture
- Achieved 100% compute resource pooling and high-performance communication for large models
- Fully leveraging the network advantages of supernodes in distributed training

**HAMi-vNPU-Core Soft Partitioning Solution:**

- Fine-grained sharing of memory and compute through user-space interception
- Virtualization capability without modifying business code
- Significantly increasing per-card task density, maximizing hardware utilization

**Network Topology-Aware Scheduling:**

- Proprietary network topology-aware scheduling algorithm, aware of inter-node and intra-node network topology
- Reducing cross-machine scheduling probability by 30%, effectively breaking through distributed training network bottlenecks
- This practice has been running stably in training, inference, and other core scenarios

### Enflame: Kubernetes Ecosystem & GPU Integration

Ma Da from Enflame demonstrated a full-stack cloud-native integration solution based on GPU Operator + CDI + DRA.

As a domestic GPU vendor, Enflame is actively embracing the cloud-native ecosystem, exploring standardized management paths from the device driver layer to the scheduling layer.

**Technical Solution:**

- Standardized device management via GPU Operator, automating GPU node deployment and operations
- Non-intrusive resource management through CDI (Container Device Interface), eliminating the need to pre-install drivers in business images
- Dynamic resource allocation via DRA technology, improving scheduling flexibility to adapt to varying workload resource demands

This solution demonstrates how domestic GPU vendors can deeply integrate with the Kubernetes ecosystem through standard cloud-native interfaces (Operator / CDI / DRA), providing users with a simpler and more standardized GPU management experience.

### Sangfor: AI Compute Gateway Optimization & Model Governance

Jia Haojie, Chief Architect of Cloud AI at Sangfor, shared practical experience from Sangfor's AI compute gateway product in compute optimization and model governance.

Jia Haojie pointed out that enterprise-grade AI compute governance must focus not only on resource scheduling itself, but also on how to convert every bit of compute into measurable business value for customers.

**Intelligent Routing Strategy:**

- Intelligent classification of user requests through semantic analysis
- Simple questions routed to low-cost small models, complex questions to high-performance large models
- Optimal compute cost control while maintaining effectiveness

**Model Governance:**

- Front-end and back-end safety guardrails to ensure compliance and safety of model outputs
- Visualized measurement of compute cost and effectiveness, helping customers quantify AI ROI
- Multi-model collaborative orchestration, forming a flexible and efficient model service matrix

This solution also includes HAMi deployment practices, demonstrating the value of compute virtualization technology in AI compute gateway scenarios.

### BroadWare Technology: GPU Virtualization & Cluster Management

Ou Binkai, Researcher at BroadWare Technology, shared the R&D journey of building the One-Click Deployment Platform (OCDP) by BroadWare's Innovation R&D Department.

During early model inference and training, the BroadWare team found existing platforms cumbersome and inflexible, unable to meet the elastic demands of internal R&D and customer inference deployment, leading to the decision to develop their own one-click deployment platform.

**Core Pain Points & Solutions:**

- **Memory Fragmentation**: Under the traditional whole-card allocation model, small model inference wasted significant memory. After deeply integrating HAMi virtualization technology, fine-grained GPU resource partitioning and elastic scheduling were achieved, significantly improving per-card utilization
- **Monitoring Blind Spots**: GPU monitoring in virtualized environments was not intuitive enough. Through HAMi's monitoring capabilities, comprehensive resource usage visibility was obtained

**Practice Results:**

- Through deep integration with HAMi, complex underlying compute is encapsulated as simple, efficient cloud-native services
- Maximizing the commercial value of GPU assets, lowering AI deployment barriers for users
- Forming a complete capability loop of "one-click deployment + elastic scheduling + unified management"

## Core Technology Trends

This Meetup brought together deep insights from multiple industry experts. Several technology trends stood out:

**GPU Virtualization and Compute Pooling Become Essential:** From SF Technology to China Merchants Bank, multiple enterprises shared real-world experience implementing GPU pooling and virtualization through HAMi. The core demand is consistent: break the GPU exclusive mode, enable multi-task multiplexing through fine-grained partitioning, and raise cluster GPU utilization from around 40% to 90%. Advanced features such as memory overcommit, soft compute partitioning, and topology-aware scheduling have become standard requirements in production environments.

**Accelerated Adoption of Unified Heterogeneous Compute Management:** Multiple chip vendors — NVIDIA, Ascend, Enflame, and Cambricon — are actively embracing the cloud-native ecosystem. HAMi shields underlying hardware differences through a unified scheduling layer. DRA (Dynamic Resource Allocation) technology has emerged as the new direction for heterogeneous compute management. Enflame demonstrated an integration solution based on standard cloud-native interfaces, while China Merchants Bank validated the complete technical loop for unified multi-source heterogeneous compute management.

**AI Compute Governance: From "Usable" to "Well-Used":** Sangfor's presentation revealed a new dimension in enterprise-grade AI compute governance — it's not just about resource scheduling, but also about intelligent routing and cost control. Through semantic analysis to achieve model-level compute optimization, every bit of compute is converted into measurable business value.

## Video Replay

- **Bilibili:** [HAMi Community Meetup Shenzhen](https://www.bilibili.com/video/BV1Sqo6BBE2h/)
- **WeChat Video Channel:** HAMi Community

![Video Replay](/images/blog/hami-meetup-shenzhen-recap/shenzhen-meetup-qrcode.png)

## Slide Downloads

Speaker slides from the HAMi Community Meetup Shenzhen have been archived on the [HAMi Community GitHub](https://github.com/Project-HAMi/community/tree/main/hami-meetup/03-shenzhen-20260425).

## Closing Remarks

Compute efficiency is not a single-point capability — it is the result of scheduling, virtualization, software stack, and business scenarios working together. From the cloud-native evolution of AI infrastructure, to GPU pooling and unified heterogeneous compute management, to the intelligent upgrade of compute governance, this HAMi Meetup Shenzhen fully demonstrated the community's technical depth and ecosystem vitality in heterogeneous compute scheduling.

We will publish in-depth recap articles for each speaker, delving into the core technical highlights and practical experience from their presentations. We welcome more HAMi users to share your practical stories and jointly drive community development!
