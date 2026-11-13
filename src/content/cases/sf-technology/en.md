---
title: "EffectiveGPU: SF Technology’s heterogeneous AI virtualization and pooling solution built on HAMi"
company: "sf-technology"
companyName: "SF Technology"
logo: "/redesign/assets/e2e5754a2a04fd08a050.svg"
date: "2025-09-18"
dateLabel: "2025.09.18"
sourceKind: "CNCF case study · Localized edition"
sourceUrl: "https://www.cncf.io/case-studies/sf-technology/"
sourceLinkLabel: "Read the CNCF original ↗"
outcomeSourceUrl: ""
outcomeSourceLabel: "Key data source: Dynamia Network of Officials"
outcomes:
  - value: "37 GPUs"
    label: "GPUs saved in production model serving"
    detail: "65 services deployed on 28 GPUs"
  - value: "13 GPUs"
    label: "GPUs saved for test services"
    detail: "19 services deployed on 6 GPUs"
  - value: "0.5%"
    label: "Lowest observed performance overhead after pooling"
    detail: "Lowest reported value; not representative of all workloads"
---

## About SF Technology

SF Technology is one of China’s leading integrated logistics service providers, who are able to move at a rapid pace, serving one of the largest and most advanced logistics networks worldwide. Around digital transformation and intelligent logistics, SF Technology optimizes operations, improves client experience, and promotes business innovation by using Front Line AI and claud-native technology.

## Challenges

As AI ' s load size and diversity grow, SF Technology and similar organizations face significant challenges in increasing the utilization of histerogeneous computing resources such as GPU, NPU:

- **Low resource utilization:** The static distribution has left large numbers of compute resources and GPU memory idle for long periods of time and unable to provide other load-efficient reuses.
- **High operating costs:** Sustained payments for underutilized resources have significantly increased the total cost of ownership of infrastructure.
- **@Scheduling is inflexible:** After static distribution, Scheduler was unable to adjust to real-time business demand dynamics and limited cluster elasticity and scalability.

Enterprises need a unified, flexible and efficient approach to managing and sharing heterogeneous AI resources across clusters and loads, while supporting mainstream and domestic hardware platforms.

## Solution

The team developed a self-study programme for the provision of GPU pool technology based on the CNCF Sandbox project, Hami.

| Priority indicators in original language | Description |
| --- | --- |
| Zero Changes | Do not modify NVIDIA driver, Linux kernel, task mirror and source code |
| Highest 57% | GPU Savings Ratio for Production and Testing Clusters listed in the original focus indicator |
| Highest 100% | Increased use of GPU through GPU virtualization |

![Effictive GPU structure, source: CNCF original.](/redesign/assets/3270a140c963dd260a9d.png)
*Effictive GPU structure, source: CNCF original.*

### HAMi provides critical capabilities

- **Device virtualization:** The fine particle splitting equipment, Compute resources and GPU memory, is shared by Pod.
- **Resource hardwork:** (c) Limit the specifications of containers GPU memoory and compute resources to ensure that tasks do not exceed assigned quotas.
- **Heterogeneous AI calculates support for fit:** The computing framework supports a Heterogeneous platform such as Ascend, Begum and Shinway Smart Cards, which adapts to mainstream and heterogeneous calculation AI frameworks.
- **A priority-based GPU company grabs:** Tasks can be defined as priorities, with high-priority tasks seizing the resources to calculate lower-priority tasks. When a request for higher-priority tasks is made by a copute resourcees, the lower-priority task automatically suspends; if no request is made, the lower-priority task resumes.
- **Unified Scheduling:** Provides Kubernetes with scheduler extener and mutating webhook, while supporting kube-scheduler and Volcano to achieve increased awareness, tactically driven resource allocation.
- **Application of zero changes:** Users can use equipment sharing and association without changing existing applications.

### Extension of Effective GPU on Hami

- **Cross-Node Compute resources** To study the AI Compute Resourcees methodology for synergizing and making full use of lowcompute resources, to mitigate highcompute resourcees competition, achieve cross-node Scheduling, improve efficiency, usability and reduce resource competition.
- **ICV has been able to adapt itself to scheduling:** Precise delivery is achieved by determining the type and share of a distribution through predictive algorithms, based on mission types and resource-relationship; consideration of heterogeneous resource expansion between nodes, using least conflicting allocation options to support elasticity, is supported by the Scheduling strategy.
- **GPU memoryoversubscription:** Optimizing the GPU memoory distribution strategy and management mechanisms without changing physics, supporting more simultaneous assignments, mitigating the need for multi-tasking high-GPU memoory requirements, increasing the utilization of GPU memoory and parallel processing capabilities.
- **Resource allocation and the Scheduling Mechanism:** The dynamic allocation of appropriate GPS and other computing resources is based on mission priorities and resource requirements.
- **Resource capture and recovery:** Allows high-priority tasks to divert some of the resources from low-priority tasks on a needs basis; and enables timely recovery when mandates are completed or resources are exhausted, allowing other missions to be reused and improving resource turnover.
- **Optimization of performance and load balance:** Reduce delays and congestion in waiting for resources and increase efficiency of implementation; avoid the loss of performance due to over-absorption of local resources by combining the overall load of the system, guaranteeing stability and efficiency of multi-tasking parallel operations.

These technologies allow teams to deploy more services with fewer GPUs, adjust allocations to real-time demand dynamics and support the heterogeneous computing environment.

## Implementation effectiveness

### Large Model Inference Services

AI production model services tend to be low-utilized and costly when they are allocated in traditional GPUs. The introduction of Effictive GPUs can significantly improve resource utilization and reduce operating costs. For example, the production model services that have been switched to Effictive GPUs have been deployed with only 28 GPUs for 65 services, saving 37 GPUs.

### Testing Service Cluster

The flexible allocation and efficient use of resources is essential to test efficiency and cost control. The Effective GPU allocates GPUs by cutting points to different testing tasks. For example, the Testing Service using Effective GPUs deploys 19 services on 6 GPUs, saving 13 GPUs, both for testing efficiency and lower testing costs, making the use of resources more rational.

### Voice recognition

Voice recognition relies on efficient command resources to ensure real-time and accuracy. Effictive GPU provides flexible support by prioritizing scheduling and over-allocation of resources, assigning GPUs according to mission urgency and resource needs dynamically, allowing high-priority tasks to be adequately resourced in a timely manner to improve service quality.

### Nationally produced AI hardware fit

Effictive GPU supports not only mainstream GPU, but also China's AI computing platform for countries such as Ascend and Bermuda, which provides support for heterogeneous AI applications to achieve efficient management and resource use in a domesticized environment. For example, when using the Heterogeneous AI chip, Effective GPU's Scheduling and managing can leverage the advantage of heterogeneous equipment to promote related technological development and application.

<div class="case-source-note">
<p>Original:<a href="https://www.cncf.io/case-studies/sf-technology/" target="_blank" rel="noopener">Effective GPU: A Heterogeneous AI Virtualization Pooling solution by SF technology built on top of HAMi ↗</a><br>Publisher: Cloud Native Computing Foundation (CNCF) · 2025-09-18</p><p>This localized edition preserves the source article’s technical information and measurement scope. It is not an official CNCF translation. Architecture diagrams retain their original text. Project status and product information reflect the original publication date.</p><p>The original is used under the  <a href="https://www.linuxfoundation.org/legal/terms" target="_blank" rel="noopener">Linux Foundation content terms</a> and  <a href="https://creativecommons.org/licenses/by/3.0/" target="_blank" rel="noopener">CC BY 3.0</a>. This edition has been localized and reformatted. All brand marks belong to their respective owners.</p>
</div>
