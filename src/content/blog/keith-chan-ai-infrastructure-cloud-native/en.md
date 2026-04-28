---
title: "The Infrastructure of AI's Future: Keith Chan on AI Infrastructure and Cloud-Native Ecosystem Trends"
date: '2026-04-25'
excerpt: >-
  In this HAMi Community Meetup Shenzhen recap, CNCF VP of APAC Keith Chan shares
  global perspectives on cloud-native evolution trends for AI infrastructure and
  previews the AI session lineup at KubeCon Shanghai this September.
author: Dynamia
tags:
  - CNCF
  - KubeCon
  - AI infrastructure
  - cloud native
  - Kubernetes
  - NVIDIA
category: Community & Events
language: en
coverImage: /images/blog/keith-chan-ai-infrastructure-cloud-native/keith-chan-speaking.jpg
linktitle: "Keith Chan: AI Infrastructure Trends"
---

![Keith Chan Speaking](/images/blog/keith-chan-ai-infrastructure-cloud-native/keith-chan-speaking.jpg)

**Speaker:** Keith Chan (CNCF China Director, VP of APAC at Linux Foundation)

## Video Replay & Slide Downloads

- **Bilibili:** [The infrastructure of AI's future - Keith Chan (CNCF)](https://www.bilibili.com/video/BV1Sqo6BBE2h/)

- **Download Slides:** https://github.com/Project-HAMi/community/blob/main/hami-meetup/03-shenzhen-20260425/opening-cncf-keith-chan.pdf

## 1. 66% of Enterprises Already Run AI on Cloud-Native

Keith Chan opened with CNCF end-of-2025 survey data: **66% of enterprises globally are already running AI workloads on cloud-native environments**. Domestic survey data shows that over 90% of enterprises using AI have adopted cloud-native AI technologies.

The core trend behind this data is clear: **Kubernetes has become the unified orchestration layer for AI infrastructure**. K8s features like auto-scaling, CI/CD pipelines, and high availability precisely meet the stringent real-time and elasticity requirements of generative AI.

## 2. Shifting Competitive Focus: From "Stacking Compute" to "Optimizing Compute"

The competitive landscape in AI has shifted from simply accumulating compute power to **"how to leverage compute at the lowest cost and highest efficiency."** Keith noted that enterprises are no longer relying solely on off-the-shelf models, but building core competitiveness through infrastructure optimization.

Leading companies have 率先 embraced the "Infrastructure First" strategy:

- **OpenAI** manages thousands of nodes through Kubernetes and leverages technologies like FluentBit to improve GPU utilization by over 50%

- **Hugging Face** similarly adopts a cloud-native-first architecture strategy

## 3. Three Major Ecosystem Shifts

### NVIDIA Deeply Embraces the CNCF Ecosystem

Keith brought a significant announcement: **NVIDIA has officially joined CNCF as a Platinum member**. This marks the absolute leader in GPU technology deeply embracing the cloud-native ecosystem, which will further accelerate the fusion of GPU and K8s.

### PyTorch Community Deeply Integrates with Cloud-Native

Given that **90% of LLMs are built on PyTorch**, the PyTorch community and the cloud-native community are highly cooperative. The two communities are rapidly converging, driving standardization of the AI technology stack.

### KubeCon Sessions Pivot Entirely to AI

Keith revealed a striking statistic: at this year's KubeCon, **AI-related session proposals account for 60%-80%** of all submissions, making it the absolute mainstream. This isn't just a shift in session trends — it represents a major turning point for the entire cloud-native community's direction.

## 4. HAMi: The Key Missing Piece in CNCF GPU Scheduling

Keith specifically highlighted HAMi's unique value in the CNCF ecosystem:

**Breaking convention as a Sandbox project.** HAMi joined CNCF at the Sandbox level, but recently **appeared in a KubeCon Europe Keynote as the first Sandbox project to do so** — breaking convention, as typically only Graduated or Incubating projects receive this honor.

**Continuously growing global community participation.** Beyond domestic enterprises, a growing number of international companies are participating in HAMi's weekly meetings and contributing code. The project is advancing from Sandbox toward the Incubating stage.

**Filling an ecosystem gap.** HAMi fills the gap in CNCF's GPU scheduling domain, addressing the core pain point of efficient GPU resource scheduling in AI infrastructure. It works in synergy with K8s, Volcano, KubeFlow, and distributed storage technologies to build a complete AI infrastructure stack.

## 5. KubeCon Shanghai Preview

Keith closed with a preview of KubeCon Shanghai this September:

- Expected strong participation from international experts

- **First time integrating PyTorch and MCP AI sessions into conference tracks**

- AI-related content will be the core theme of the conference

## 6. Implications for Developers

Keith specifically addressed the **cultural transformation challenge** facing developers: the rapid development of AI requires developers to adapt their skills to AI-era development paradigms, mastering how to deploy AI applications at the lowest cost and highest efficiency.

This is not a choice of technology tools — it's a paradigm shift in how we develop.
