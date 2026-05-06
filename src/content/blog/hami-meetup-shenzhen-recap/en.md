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
  - heterogeneous compute
  - GPU virtualization
  - cloud native
  - DRA
category: Community & Events
language: en
coverImage: /images/blog/hami-meetup-shenzhen-recap/shenzhen-meetup-group-photo.webp
linktitle: HAMi Shenzhen Meetup Recap
---

On April 25, 2026, the HAMi Community successfully hosted its third offline Meetup in Shenzhen. Seven technical experts from CNCF, SF Technology, China Merchants Bank, Enflame, Sangfor, BroadWare Technology, and Dynamia AI delivered an in-depth technical feast, covering frontier topics including cloud-native evolution of AI infrastructure, GPU compute pooling, heterogeneous scheduling, and DRA technology outlook.

## Event Highlights

- **Keith Chan, CNCF VP of APAC** shared a global perspective on cloud-native trends in AI infrastructure, revealing that AI-related sessions account for 60%-80% of KubeCon Shanghai proposals

- **Li Mengxuan, HAMi Maintainer** publicly unveiled core features of v2.9 for the first time, revealing DRA ecosystem strategy and the vision for unified heterogeneous compute management

- **Chen Junchao, SF Technology** shared real-world GPU pooling deployment across 5 private cloud clusters and multiple public clouds, raising average cluster utilization from 40% to 90%

- **Su Xi, China Merchants Bank** revealed supernode hardware adaptation and network topology-aware scheduling, reducing cross-machine scheduling probability by 30%

- **Ma Da, Enflame** demonstrated a full-stack cloud-native integration solution with GPU Operator + CDI + DRA

- **Jia Haojie, Sangfor** shared AI compute gateway governance strategies, using intelligent routing to achieve optimal cost-effectiveness balance

- **Ou Binkai, BroadWare Technology** showcased GPU virtualization and Agent RL training-inference integration in research scenarios

## Event Scene

Below is a group photo from the event.

![Event Scene](/images/blog/hami-meetup-shenzhen-recap/shenzhen-meetup-group-photo.webp)

## Video Replay

- **Bilibili:** [HAMi Community Meetup Shenzhen](https://www.bilibili.com/video/BV1Sqo6BBE2h/)

- **WeChat Video Channel:** HAMi Community

![QR Code](/images/blog/hami-meetup-shenzhen-recap/shenzhen-meetup-qrcode.png)

## Slide Downloads

Speaker slides from the HAMi Community Meetup Shenzhen have been archived on the [HAMi Community GitHub](https://github.com/Project-HAMi/community/tree/main/hami-meetup/03-shenzhen-20260425).

## Core Technology Trends

### 1. AI Infrastructure Goes Fully Cloud-Native

Keith Chan shared CNCF survey data showing that 66% of enterprises globally are already running AI workloads on cloud-native environments. Kubernetes has become the unified orchestration layer for AI infrastructure. NVIDIA has officially joined CNCF as a Platinum member, and the PyTorch community is deeply integrating with the cloud-native ecosystem. The competitive focus in AI is shifting from "stacking compute" to "optimizing compute utilization" — how to leverage compute at the lowest cost and highest efficiency has become the core challenge.

### 2. GPU Virtualization and Compute Pooling Become Essential

From SF Technology to China Merchants Bank, multiple enterprises shared real-world experience implementing GPU pooling and virtualization through HAMi. The core demand is consistent: break the GPU exclusive mode, enable multi-task multiplexing through fine-grained partitioning, and raise cluster GPU utilization from around 40% to 90%. Advanced features such as memory overcommit, soft compute partitioning, and topology-aware scheduling have become standard requirements in production environments.

### 3. Accelerated Adoption of Unified Heterogeneous Compute Management

Multiple chip vendors — NVIDIA, Ascend, Enflame, and Cambricon — are actively embracing the cloud-native ecosystem. HAMi shields underlying hardware differences through a unified scheduling layer. Enflame demonstrated a standardized management solution based on GPU Operator + CDI, while China Merchants Bank achieved hardware adaptation and topology-aware optimization under a supernode architecture. DRA (Dynamic Resource Allocation) technology has emerged as the new direction for heterogeneous compute management.

### 4. AI Compute Governance: From "Usable" to "Well-Used"

Sangfor's presentation revealed a new dimension in enterprise-grade AI compute governance — it's not just about resource scheduling, but also about intelligent routing and cost control. By using semantic analysis to route simple questions to low-cost models and complex questions to premium models, combined with front-end and back-end safety guardrails, compute value is maximized.

## Series Recap Articles

We will publish in-depth recap articles for each speaker, delving into the core technical highlights and practical experience from their presentations.

---

*This article serves as the overview piece for the HAMi Community Meetup Shenzhen recap series. Stay tuned for more in-depth articles in the series.*
