---
title: "How Sangfor built an enterprise AI compute platform with Kubernetes, Volcano and HAMi"
company: "sangfor"
companyName: "Sangfor"
logo: "/redesign/assets/8d37763f47722bb132cf.svg"
date: "2026-09-08"
dateLabel: "2026.09.08"
sourceKind: "CNCF case study · Localized edition"
sourceUrl: "https://www.cncf.io/case-studies/sangfor/"
sourceLinkLabel: "Read the CNCF original ↗"
outcomeSourceUrl: ""
outcomeSourceLabel: "Key data source: Dynamia Network of Officials"
outcomes:
  - value: "3×+"
    label: "Improvement in GPU utilization"
    detail: ""
  - value: "8×+"
    label: "Models served per GPU (1 → 8+)"
    detail: ""
  - value: "50%"
    label: "Lower external model API costs"
    detail: "RMB 400,000 → 200,000/month, including gains from platform-level intelligent routing"
---

Sangfor is a leading Chinese business, cloud computing and network safety manufacturer. As AI applications develop rapidly, Sangfor is building a unified AI platform for internal research and development teams and corporate clients to support the AI programming, digital staff, smart-based guest clothes, and sales of Agent.

As the platform expands, the utilization of GPUs, resource mobilization and scheduling is a key bottleneck. Sangfor builds production-level GPU shared platforms based on Kubernetes, Volcano and Hami to make Kubernetes a unified AI resource control plane.

| Metric | Before | After |
| --- | --- | --- |
| GPU utilization | Baseline | Up more than 3× |
| Number of GPU load models per unit | 1 | 8 or more |
| External model call costs | ¥400K/month | ¥200K/month |
| Model failure recovery time | ~1 hour | Less than 10 minutes |
| 3 Success rate under peak flow | Unstable | Over 95% |
| R&D team size supported | Limited | Over 2,000 engineers |

## Challenges

### Underutilization of GPU

In the traditional model, one reference service occupies a single GPU. Many loads use only a small amount of GPU memoory and compute resources, but they have long occupied whole cards, creating severe resource debris. The GPU expands at even faster rates than business growth.

### Resource governance complex in multi-tenant environment

The platform also serves AI programming, digital staff, intelligent passenger service, sales Agent, business knowledge assistants, etc. The demand for different loads of GPUs varies widely: some require a long-term presence in GPU memory and others have an obvious peak valley. Unified pool management and equitable distribution are key issues.

### Inference with batch load

The platform runs online access, bulk infoence, distributed training and Agent workflows. Original Kubernetes GPU Scheduling does not meet these complex AI load requirements.

## Solution: HAMi

> "Hami raw integrated Kubernetes, which means zero migration costs. Transparent equipment virtualization allows the task load to run without modification."
>
> — Jia Haojie, Chief Architect, Sangfor Cloud AI
>

Kubernetes provides a unified control plane for the AI platform, but original GPU Scheduling allocates resources by whole card to meet environmental needs of reference, multi-tenant and heterogeneous GPU. Sangfor introduced Volcano and Hami, respectively, to senior scheduling and GPU resource virtualization.

The core reasons for choosing HAMi include:

- **GPU share:** The GPU memory can be as low as 256 MB, the computer resources can be as low as 1%, and multiple Pods can share the same GPU under the Strong Association.
- **Heterogeneous GPU support:** The integration of resources in abstraction, and the generation of GPUs getting a consistent Scheduling experience.
- **Open source ecology:** The Kubernetes field is one of the most active open-source vGPU projects and is continuously integrated with Volcano Queuues, vLLM.

### Platform Architecture

The platform is divided into two layers. Data plane is the requested path: AI, following a route, governance and security check at the AIC gateway, enters the model service level, including OpenAI, Claude, DeepSeek and local inference. Component structure is the base of the Compute Resourcees: Volcano is responsible for operations scheduling, Hami is responsible for GPU virtualization, sharing and association, Kubernetes management nodes and equipment plugins that eventually end up with NVIDIA, Ascend and others heterogenous GPU.

Two layers connect to Volcano and complete the end-to-end link from request to company resources.

![Sangfor AI platform data plane and component structure of the Compute Resources, source: CNCF original.](/redesign/assets/1e1ccd5f43f3ad06da45.jpg)
*Sangfor AI platform data plane and component structure of the Compute Resources, source: CNCF original.*

### GPU pool: Before and after improvements

Before improvement, a specific model is used, one card only runs a model. Large models fill the GPU memory with small models that use only 15-20% of the rest of the resources. Size models cannot coexist and resource debris is severe.

The vGPU cut brings two core benefits:

- **A hybrid deployment of a size model:** Large models occupy the main share of single cards, e.g. 70 per cent, and the remaining slices are distributed to multiple small models, using otherwise idle compute resources.
- **Increase the density of small models deployment:** A single card can carry a small model example eight times or more, significantly reducing the need for new GPUs.

The overall result was a more than threefold increase in GPU utilization and an eightfold increase in single-card model density.

![Comparison of deployment patterns before and after GPU pool, source: CNCF original.](/redesign/assets/80cd9ed10ba3520b4d97.jpg)
*Comparison of deployment patterns before and after GPU pool, source: CNCF original.*

### Volcano + HAMi: Coordinated Scheduling

Volcano combines with HAMi to achieve unified management of equipment resources and operations:

- **Maintenance of equipment:** GPU Health Monitoring, Automatic Fragmentation and Auto-Recovery.
- **Resource statement governance:** Automatically complete resource fields, uniform calculation of quotas, early rejection of invalid requests.
- **Screduling services** The resource is tested and decompositioned to the actual occupancy, ensuring that it is in a state of conformity.
- **Gang and LWS support:** Volcano Organization, HAMi allocates GPU, and the whole group works with Scheduling.

Volcano decides when and where the load will run, and Hami decides how to share and distribute GPU resources.

![Workload collaborative process with Scheduling component, source: CNCF original.](/redesign/assets/80cd9ed10ba3520b4d97.jpg)
*Workload collaborative process with Scheduling component, source: CNCF original.*

## Implementation effectiveness

### GPU utilization rate increased more than 3 times

The vGPU split allows multiple inference services to share a GPU, which is distributed as needed. Shared GPU pool removes resource debris and enables the same hardware to run more loads.

### Single card model density increase more than 8 times

This is the lowest part of the set 1% and the smallest part of the GPU memory 1 MB, which gives the models precise resource quotas.

### Reduction in external model call costs 50%

Combining smart paths, simple questions are referred to low-cost models, complex issues are referred to high-end models where the cost of external model calls is reduced from $400,000 per month to $200,000; and security columns maintain a balance between costs and quality.

### Platform stability is significantly enhanced

Model failure recovery time is reduced from one hour to less than 10 minutes. The success rate remains above 95 per cent under three multiple flow pressure tests. Device health monitoring and automatic malfunctioning exclude the malfunction GPU from the Scheduling path.

### Supporting the development team of over 2,000 people.

The platform has supported multiple production scenarios such as AI programming, enterprise Agent, intelligent passenger service, digital staff and so on, covering the daily use of more than 2,000 R&D engineers.

## Practical experience

### GPU sharing is more important than simply adding GPU

Most of the inference loads cannot be fully covered by GPU. Prior to purchasing more hardware, priority is given to sharing the GPU, which will yield higher and faster returns on investment.

### Scheduling and resource mobilization should be de-linked

Hami is responsible for abstract resources, Volcano is responsible for scheduling strategies. When the coup is broken, the layers can evolve independently. Job placement cannot be optimal unless it is shared and without intelligence; only steduling, without GPU protection, lacks the resources to scheming.

### Kubernetes is becoming an AI resource control plane

AI infrastructure is developing along the cloud-native path, rather than creating an isolated resource management system. The combination of Kubernetes, Volcano and Hami allows enterprises to acquire a GPU management capability at the enterprise level without introducing a new management paradigm.

## Follow-up plan

Sangfor will continue to work with the Hami community to promote Kubernetes as a unified control plane on AI load:

- Add HAMi DRA ecology, advance Kubernetes native GPU resource management.
- Expands the Heterogeneous GPU support through the uniform abstraction of HAMi.
- The project is aimed at bringing production-level scheduling strategies and best practices back to the Volcano and HAMi communities.

Increased understanding of:[HAMi GitHub](https://github.com/Project-HAMi/HAMi) · [Volcano GitHub](https://github.com/volcano-sh/volcano)。

<div class="case-source-note">
<p>Original:<a href="https://www.cncf.io/case-studies/sangfor/" target="_blank" rel="noopener">How Sangfor Built an Enterprise AI Compute Platform with Kubernetes, Volcano, and HAMi ↗</a><br>Publisher: Cloud Native Computing Foundation (CNCF) · 2026-09-08</p><p>This localized edition preserves the source article’s technical information and measurement scope. It is not an official CNCF translation. Architecture diagrams retain their original text. Project status and product information reflect the original publication date.</p><p>The original is used under the  <a href="https://www.linuxfoundation.org/legal/terms" target="_blank" rel="noopener">Linux Foundation content terms</a> and  <a href="https://creativecommons.org/licenses/by/3.0/" target="_blank" rel="noopener">CC BY 3.0</a>. This edition has been localized and reformatted. All brand marks belong to their respective owners.</p><p class="fact-note">Translation: The original text lists 256 MB GPU memory particles in the selected paragraph, and 1 MB in the operative paragraph; the translation retains a different expression of the original.</p>
</div>
