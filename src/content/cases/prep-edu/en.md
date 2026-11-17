---
title: "PREP EDU enables efficient GPU orchestration for AI inference"
company: "prep-edu"
companyName: "PREP EDU"
logo: "/redesign/assets/c53a000a30233660d2d0.svg"
date: "2025-08-20"
dateLabel: "2025.08.20"
sourceKind: "CNCF case study · Localized edition"
sourceUrl: "https://www.cncf.io/case-studies/prep-edu/"
sourceLinkLabel: "Read the CNCF original ↗"
outcomeSourceUrl: ""
outcomeSourceLabel: "Key data source: Dynamia Network of Officials"
outcomes:
  - value: "1+ year"
    label: "Stable production use"
    detail: "As of the case study publication"
  - value: "90%"
    label: "GPU infrastructure optimization coverage"
    detail: "Share managed and optimized by HAMi"
  - value: "50%"
    label: "Fewer GPU management and operations pain points"
    detail: ""
---

## Challenges

PREP EDU operates the Kubernetes-based AI reference platform, Heterogeneous GPU clusters consisting mainly of RTX 4070 and RTX 4090 nodes. Different loads often require specific types of GPU to optimize performance and compatibility, which complicates resource allocation.

The static distribution has led to a chronic low utilization of GPU, often only 10-20 per cent, with large amounts of information available for idle use.

Prior to the introduction of HAMi, teams tried other GPU shared programmes, but they lacked effective coverage and competed for multiple tasks, frequently leading to resource conflicts, problems with GPU distribution and collapse in application, making it difficult to ensure fair and efficient sharing and affecting overall service stability.

The team is also concerned about compatibility: the new programme must be seamlessly integrated into established production environments, including GPU Operator and RKE2 Kubernetes. The team needs smart organization of heterogeneous GPUs, reliable organization to prevent mission disruption, significantly increase overall utilization, while at the same time compatible with current infrastructure.

## Solution

The team uses HAMi as a GPU program. When the case is published, HAMi is a CNCF Sandbox project. In GitHub 's search for GPU sharing, the team notes the influence of Hami in the GPU scheme; its documentation is clear and suitable for their Kubernetes (RKE2) environment. The maturity of HAMi, its pre-advanced advantage in the GPU Scheduling area, and the compatibility of various NVIDIA GPUs have led to choice.

HAMi's vGPU learning capacity allows PREP EDU to:

- **Virtualization and GPU split:** For multiple inference services, specific restrictions are placed on loads by NLP Token length and service demand.
- **Heterogeneous GPU Management:** Increase compatibility and efficiency by assigning tasks to specific card types, for example, by allowing certain items to run only on RTX 4070 or 4090, based on a resource selection based on annotation.
- **A seamless integration application:** Use transparency equipment to share and distribute GPU without modification.
- **Specified GPU:** Press UUID to apply to a specific device, for example by running multiple processes on a 24GB 4090.
- **Compatibility:** HAMi co-existes with NVIDIA GPU Operator in their environment, and is configured to use consainerd; and uses Prometheus for surveillance and alarms, which are seamlessly integrated with Kubernetes (RKE2), containerd.

On this basis, the PREP EDU team DevOps has done a great deal of work flow optimization and has been used in the production environment:

- The creation of new nodes to join clusters is automatically managed by HAMi-natured workflows, bringing the whole cluster together.
- Explore the self-deployment of Hami in the Docker environment for GPU programming for specific operations.
- Finding best practices in collaboration with NVIDIA GPU Superactor makes cluster expansion easier.

These efforts reduced the pain point of GPU cluster management by 50 per cent and optimized 90 per cent of the GPU infrastructure.

## Implementation effectiveness

With the combined effect of HAMi and DevOps team optimizing their work, the results are clear:

- **Depth integration:** HAMi now efficiently manages 90 per cent of the GPU infrastructure, providing a unified configuration of clusters.
- **Transport efficiency:** The collapse of the application caused by the GPU memoory conflict was eliminated, which addressed 50% of the previous pains in the management of GPU resources.
- **Extension:** The team can seamlessly add a new GPU node, and HAMi automatically organises heterogeneous hardware resources.
- **Flexibility:** The precise distribution of loads by GPU type or UUID is also prepared for future extension training and large language model loads.

The DevOps team continues to fine-tune scheduling parameters and algorithms to provide a stable, high performance and efficient GPU service as business changes.

| Key indicators | Result |
| --- | --- |
| HAMi Production Time | 1 year |
| Use an optimized GPU infrastructure for HAMi | 90% |
| GPU Management Pain | 50% reduction |

## Team feedback

> "Hami is a good choice for vGPU learning to help us optimize the use of AI microservice GPUs. Surveillance and alarm capabilities are also helpful in long-term tracking. The document is clear, assigning tasks to specific types of GPUs, which is an advantage to us."
>
> — Xues Nguyen, PREP EDU DevOps Engineer
>
> “Hami can accurately allocate GPU GPU memoory and company resources to each project, optimizing the use of overall resources. Thus, on equally limited GPU GPU memoory, we can deploy more AI services to increase efficiency and scalability.”
>
> _Nhan Phan, PREP EDU AI Engineer
>
> “Hami helps us address local AI microservice GPU management challenges by automatically allocating loads and reducing maintenance costs. Teams can significantly increase resource efficiency with little input.”
>
> — Phong Nguyen, PREP EDU AI Engineer
>
> “Hami has changed our AI workstream. By rationalizing GPU resources at the Pod level, we can deploy lightweight infoference services and large batch operations on the same hardware without any adjacent mission interference. Deployment is almost immediately plugged into: a Helm Cart with several labels. So we keep the existing list unchanged.”
>
> _Vu Hoang Tran, PREP EDU AI Engineer
>

<div class="case-source-note">
<p>Original:<a href="https://www.cncf.io/case-studies/prep-edu/" target="_blank" rel="noopener">Enabling Efficient GPU Orchestration for AI Inference at PREP EDU ↗</a><br>Publisher: Cloud Native Computing Foundation (CNCF) · 2025-08-20</p><p>This localized edition preserves the source article’s technical information and measurement scope. It is not an official CNCF translation. Architecture diagrams retain their original text. Project status and product information reflect the original publication date.</p><p>The original is used under the  <a href="https://www.linuxfoundation.org/legal/terms" target="_blank" rel="noopener">Linux Foundation content terms</a> and  <a href="https://creativecommons.org/licenses/by/3.0/" target="_blank" rel="noopener">CC BY 3.0</a>. This edition has been localized and reformatted. All brand marks belong to their respective owners.</p>
</div>
