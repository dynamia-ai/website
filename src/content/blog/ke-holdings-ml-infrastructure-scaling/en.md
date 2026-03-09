---
title: 'Ke Holdings: Scaling Machine Learning Infrastructure with GPU Virtualization'
date: '2026-03-09'
excerpt: >-
  Ke Holdings Inc. achieves nearly 3x improvement in GPU utilization (13% → 37%)
  by implementing AIStudio, a smart computing platform built on Kubernetes and
  HAMi for GPU virtualization across multi-cloud environments.
author: Dynamia
tags:
  - Ke Holdings
  - HAMi
  - Case Study
  - GPU virtualization
  - Kubernetes
  - CNCF
category: Case Study
language: en
coverImage: /images/blog/ke-holdings-ml-infrastructure-scaling/solution-diagram.png
linktitle: Ke Holdings GPU Infrastructure
source: 'https://www.cncf.io/case-studies/ke-holdings-inc/'
---

## Background

Ke Holdings Inc. is an integrated online and offline platform for housing transactions and related services based in China. To support the company's rapidly growing AI initiatives, a centralized infrastructure team operates the shared machine learning platform used across all business units.

The team provides end-to-end compute services for model development, training, and large-scale inference, supporting both internal research workloads and production-facing AI services. As model adoption and request volume increased across the organization, GPU efficiency and workload isolation became critical platform requirements.

## Challenge

As Ke Holdings' machine learning initiatives scaled, the infrastructure team faced significant challenges in GPU resource management:

Initially, the overall GPU utilization was only 13% due to the complexity of the multi-cloud environment and diverse workload requirements, which prompted the infrastructure team to seek solutions for improving cluster resource utilization.

## Solution

![Solution diagram](/images/blog/ke-holdings-ml-infrastructure-scaling/solution-diagram-en.svg)

Using CNCF projects [HAMi](https://github.com/project-hami/hami) and [Kubernetes](https://kubernetes.io/) as its foundation, Ke Holdings' infrastructure team designed and implemented **AIStudio**, a smart computing platform that serves as the basis for the organization's machine learning infrastructure.

Kubernetes was selected for its exceptional stability and robust cluster scheduling and management capabilities, which significantly reduce the operational complexity and maintenance overhead of large-scale clusters. Additionally, Kubernetes' integration with the CNCF open ecosystem enables seamless adoption of various open-source solutions tailored to different use cases, such as HAMi.

HAMi was chosen as it represents the most suitable GPU multiplexing and heterogeneous computing solution for AI Studio's requirements.

![Architecture diagram](/images/blog/ke-holdings-ml-infrastructure-scaling/architecture-diagram-en.svg)

The team implemented a dual-cluster approach that separates workloads based on their resource requirements.

This architectural separation guarantees that training jobs receive dedicated, predictable resources while inference services achieve high density through memory sharing, eliminating resource contention between different workload types and maximizing overall infrastructure efficiency.

## Impact

By leveraging open-source technologies including HAMi and Kubernetes, AI Studio developed by the infrastructure team has achieved:

- **Stable operation at massive scale**
  - Tens of millions of business requests per day handled smoothly
  - High availability and reliability for critical workloads
  - Consistent performance under high load

- **Cost-effective resource management across multi-cloud environments**
  - Nearly 3x improvement in GPU utilization (13% → 37%)
  - Designed efficient memory allocation strategies for diverse workload types

- **Production-grade reliability for critical business workloads**
  - Robust scheduling and management capabilities
  - Reduced operational complexity and maintenance overhead

The successful integration of HAMi as a foundational component demonstrates how open-source technologies can enable organizations to achieve remarkable infrastructure efficiency.

Kubernetes serves as the underlying platform foundation, enabling stable operations of tens of millions of daily business requests and tens of thousands of pods through its robust scheduling and management capabilities. By leveraging HAMi's GPU multiplexing and heterogeneous scheduling optimization features, the cluster's GPU utilization has increased by nearly 3x.

## Future Plans

Ke Holdings' infrastructure team continues to innovate and expand their platform on top of HAMi and Kubernetes, including:

- **Adopting heterogeneous devices**: Plans to incorporate Huawei Ascend and other non-NVIDIA accelerators
- **Cloud expansion**: Integration with Alibaba Cloud to complement existing Volcano Engine and Tencent Cloud deployments
- **Advanced scheduling policies for mixed workloads**: Network topology-awareness, card type specification, and UUID-based allocation
