---
title: "Toward Global Open-Source Infrastructure: A Complete Introduction to CNCF Incubating Project HAMi"
linktitle: "Complete Introduction to HAMi"
date: '2026-07-02'
excerpt: >-
  HAMi is open-source heterogeneous compute virtualization and scheduling middleware for Kubernetes. It provides resource sharing, fine-grained allocation, runtime isolation, and device-aware scheduling for accelerators such as GPUs and NPUs. This article gives a complete introduction across five dimensions—R&D background, history, technical architecture, community governance, and ecosystem applications—for the project that became CNCF Incubating in July 2026.
author: HAMi Community
tags:
  - HAMi
  - CNCF
  - GPU Virtualization
  - Heterogeneous Compute
  - AI Infrastructure
  - Cloud Native
category: Open Source
language: en
coverImage: /images/blog/hami-cncf-incubating/cncf-incubating-badge.png
---

![HAMi becomes a CNCF Incubating project](/images/blog/hami-cncf-incubating/cncf-incubating-badge.png)

HAMi (Heterogeneous AI Computing Virtualization Middleware) is open-source, cloud-native heterogeneous compute virtualization and scheduling middleware for Kubernetes. It provides resource sharing, fine-grained allocation, runtime isolation, and device-aware scheduling for accelerators such as GPUs and NPUs. HAMi supports allocating accelerator resources by memory, compute cores, or device count, and adapts multiple hardware devices through a unified Kubernetes usage model.

HAMi was initiated by Zhang Xiao and Li Mengxuan, and is built with participation from developers and organizations worldwide. The project entered the Cloud Native Computing Foundation (CNCF) Sandbox on August 21, 2024, and became a CNCF Incubating project on July 2, 2026. Community governance follows CNCF vendor-neutral principles.

This article gives a complete introduction to HAMi across five dimensions: R&D background, history, technical architecture, community governance, and ecosystem and applications.

## 1. R&D Background

As machine learning and AI workloads moved into Kubernetes environments, traditional whole-card allocation often led to accelerator fragmentation and underutilization. HAMi focuses on fine-grained sharing, runtime isolation, and device-aware scheduling for heterogeneous accelerators such as GPUs, so multiple workloads can share accelerators without changing application code or existing Kubernetes resource manifests.

Driven by initiators and maintainers including Zhang Xiao and Li Mengxuan, together with developers worldwide, HAMi has continued as an open-source project—evolving from a GPU sharing and scheduling technical approach into cloud-native virtualization and scheduling middleware that supports multiple heterogeneous accelerators.

## 2. History

In March 2020, the HAMi project first committed code. Early work explored GPU sharing and scheduling in Kubernetes environments, then gradually formed virtualization and scheduling capabilities for heterogeneous accelerators.

On August 21, 2024, HAMi was accepted by CNCF as a Sandbox project and began advancing open governance, technical evolution, and ecosystem building under the CNCF framework.

On July 2, 2026, the CNCF Technical Oversight Committee passed the incubation vote for HAMi, and HAMi became a CNCF Incubating project. CNCF announcements indicate the project has met Incubating-stage requirements in technology, security, community governance, production adoption, and ecosystem integration, and has established a multi-organization contributor base.

## 3. Technical Architecture

HAMi’s technical architecture consists of modules for admission, scheduling, device management, runtime isolation, and observability:

- **Mutating Webhook** identifies and handles heterogeneous device resource requests;
- **Scheduler Extender** performs device-aware scheduling based on node and device state;
- Hardware-specific **Device Plugins** register and allocate device resources to Kubernetes;
- **HAMi-Core** enforces memory and compute isolation at container runtime;
- **WebUI and monitoring capabilities** present device status, resource allocation, and usage.

HAMi supports requesting accelerator resources by memory, compute cores, and device count, and provides scheduling strategies such as concentrated, spread, and topology-aware. Through a unified Kubernetes interface, the project adapts multiple heterogeneous accelerators and reduces differences in how different hardware is managed and how workloads are scheduled.

## 4. Community Governance

HAMi uses an open-source community collaboration model, is hosted by CNCF, and is governed under vendor-neutral principles. The project conducts code contribution, issue tracking, releases, and technical collaboration through public repositories. Community participants can contribute via Issues, Pull Requests, and community meetings.

HAMi is jointly maintained by multiple organizations and independent developers. Project governance documents show that current core maintainers (Committers) come from Dynamia, NVIDIA, 4Paradigm, and independent developers; among them, project initiators Zhang Xiao and Li Mengxuan are both currently at Dynamia. This multi-organization maintainer structure reflects HAMi’s vendor-neutral governance under the CNCF framework.

## 5. Ecosystem and Applications

HAMi provides heterogeneous compute resource management for the Kubernetes ecosystem and integrates or works alongside scheduling and queue projects such as Volcano, Koordinator, and Kueue, so users can apply heterogeneous device sharing, isolation, and scheduling across different cluster scheduling systems.

HAMi has been used in finance, internet, and cloud-native infrastructure scenarios. Related practices cover AI training and inference, GPU resource pooling, improved cluster utilization, multi-tenant isolation, and more.

---

Entering the CNCF Incubating stage is a new starting point for HAMi as global open-source infrastructure. To learn more about using HAMi, contributing, or exploring real production cases, visit the [HAMi website](https://project-hami.io) and the [GitHub repository](https://github.com/Project-HAMi/HAMi).
