---
title: "Scaling machine learning infrastructure with Kubernetes and HAMi GPU virtualization"
company: "ke-holdings-inc"
companyName: "KE Holdings"
logo: "/redesign/assets/8045f1c8d69940e96b22.png"
date: "2026-02-05"
dateLabel: "2026.02.05"
sourceKind: "CNCF case study · Localized edition"
sourceUrl: "https://www.cncf.io/case-studies/ke-holdings-inc/"
sourceLinkLabel: "Read the CNCF original ↗"
outcomeSourceUrl: ""
outcomeSourceLabel: "Key data source: Dynamia Network of Officials"
outcomes:
  - value: "≈3×"
    label: "Improvement in GPU utilization"
    detail: "13% → 37%"
  - value: "10,000+"
    label: "Concurrent running Pods"
    detail: "AIStudio platform scale"
  - value: "10M+"
    label: "Requests processed per day"
    detail: "AIStudio platform scale"
---

## Background

KE Holdings is a platform for real estate transactions and related services located in China, on the integration line. To support fast-growing AI operations, centralized infrastructure teams operate machine learning platforms shared by business sectors.

The team provides end-to-endcomput resources for model development, training and large-scale inference, while supporting internal research loads and production-oriented AI services. As models are used and requests grow, GPU efficiency and loadization become key platform requirements.

| Key Results | Data |
| --- | --- |
| Platform GPU utilization | Almost 3 times higher |
| Run-in Pod together | More than 10,000 |
| Daily processing of requests | More than 10 million |

## Challenges

As machine learning expands, infrastructure teams face multiple challenges in managing GPU resources.

**Size and complexity:** The platform has five clusters of trans-public and private clouds, thousands of different types of GPUs, including H200, H20, V100, 4090, H100 and A100; it carries millions of business requests per day while operating more than 10,000 Pods, requiring reliable and scalable infrastructure.

**Mixed cloud environment:** Public clouds cover volcanic engines, telecommunication clouds and Ali Yun. Private clouds comprise about 1,000 NVIDIA GPU self-constructed clusters that require cross-environmental management of GPU resources.

**Different load requirements:** Large models train GPU memoory in high demand and long running hours, requiring a complete GPU; small models provide lighter services, usually only 1-2GB GPU memoory but require high levels of vomiting.

Initially, the cloud complexity and load differences had resulted in only 13 per cent utilization of the GPU as a whole and the team was therefore looking for options to increase the utilization of cluster resources.

## Solution

The KE Holdings infrastructure team designs and implements the AIStudio Chile platform as a base for organizational machine learning infrastructure based on the CNCF projects HAMi and Kubernetes. The platform provides the following capabilities through Kubernetes and Hami to achieve GPU virtualization, connecting the upper levels of SaaS services and lower level Compute resources:

- **Many scenes support:** It also supports inference services, A/B testing and training missions that allow different loads to coexist efficiently on the same infrastructure.
- **Optimization and acceleration:** Provide acceleration for reference frameworks, data sets, mirrors, checkpoints and models, and support hardware failure tolerance, including bad card processing.
- **Multi-framework support:** Support for PyTorch, DeepSpeed, Megatron, vLLM, RLHF and SGLang to adapt to different uses.
- **AI Asset Management:** Centralized management of resource pools, model warehouses, mirror stores, queues, CubeFS rolls and control components to provide a single portal for AI-related assets.

![AIStudio Solutions Architecture, Source: CNCF Original.](/redesign/assets/9f76521e23bad458d9b0.png)
*AIStudio Solutions Architecture, Source: CNCF Original.*

To this end, the team builds a GPU resource management platform based on Kubernetes and uses HAMi to achieve GPU virtualization. Kubernetes has excellent stability and clustering skills that can significantly reduce the complexity of large clusters and maintenance costs; it integrates with CNCF open ecology, and facilitates the introduction of alternative start-up scenarios such as Hami. The team selects HAMi because its GPU reuse and heterogeneous computing capabilities are best suited to AIStudio’s needs.

The team uses a two-cluster approach, separating the load according to resource requirements:

- **GPU cluster:** Managed by native NVIDIA device plugin, using high performance GPUs such as H200 and H100, special operations require complete GPUs and an expected exclusive allocation of large LLMs and training tasks.
- **vGPU cluster:** The GPS memoryvirtualization is managed by Hami, using GPUs such as H20, V100, A100, 4090, to distribute the GPU memory for small models of fine particle size, usually 1-2GB per service.

![Split GPU and vGPU clusters according to resource needs, source: CNCF original.](/redesign/assets/2edab704ce7215b5774d.png)
*Split GPU and vGPU clusters according to resource needs, source: CNCF original.*

This structure provides training operations with unique and predictable resources, while the inference service is used to achieve high-density deployment through GPU memory sharing, eliminate resource competition between different load types and improve overall infrastructure efficiency.

## Implementation effectiveness

With open-source technologies such as HAMi and Kubernetes, AIStudio, developed by the infrastructure team, achieved:

**Large-scale steady operation**

- More than 10,000 Pods running simultaneously.
- Zero stoppage during relocation and operation.
- 5 Clusters functioning steadily.
- The public cloud is seamlessly integrated with private clouds.
- Unified support training with reference loads.

**More cost-effective resource management in cloud-intensive environments**

- Design efficient GPU memory distribution policy for different loads.
- GPU utilization increased from 13% to 37%, almost three times.

**Production stage reliability of critical operational loads**

- Consistency performance at high load.
- Provide high availability and reliability for critical loads.
- Tens of millions of business requests are processed smoothly every day.

The successful integration of HAMi into the base component shows how open-source technologies help organizations to improve infrastructure efficiency. Kubernetes, as a bottom platform, supports the steady operation of tens of millions of business requests and tens of thousands of Pods per day with scheduling and management capabilities; the re-use of HAMi and heterogeneous Scheduling optimized capacity, resulting in nearly three times higher utilization of GPUs.

## Follow-up plan

KE Holdings infrastructure team continues to innovate and expand platforms on HAMi and Kubernetes:

- **Use of heterogeneous equipment:** The plan is to introduce China to Ascend and other non-NVIDIA accelerators.
- **Cloud environment extension:** Access to Aliyun, supplementing existing volcanic engines and telecommunication cloud deployment.
- **The advanced Scheduling policy for mixing loads:** This includes web awareness, card-based designations and UUID-based distribution.

<div class="case-source-note">
<p>Original:<a href="https://www.cncf.io/case-studies/ke-holdings-inc/" target="_blank" rel="noopener">Scaling machine learning infrastructure with GPU virtualization using Kubernetes and HAMi ↗</a><br>Publisher: Cloud Native Computing Foundation (CNCF) · 2026-02-05</p><p>This localized edition preserves the source article’s technical information and measurement scope. It is not an official CNCF translation. Architecture diagrams retain their original text. Project status and product information reflect the original publication date.</p><p>The original is used under the  <a href="https://www.linuxfoundation.org/legal/terms" target="_blank" rel="noopener">Linux Foundation content terms</a> and  <a href="https://creativecommons.org/licenses/by/3.0/" target="_blank" rel="noopener">CC BY 3.0</a>. This edition has been localized and reformatted. All brand marks belong to their respective owners.</p>
</div>
