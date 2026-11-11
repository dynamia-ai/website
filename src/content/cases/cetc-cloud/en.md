---
title: "CETC Cloud uses HAMi to build shared heterogeneous GPU infrastructure for a portable knowledge base"
company: "cetc-cloud"
companyName: "CETC Cloud"
logo: "/redesign/assets/dd41408a06cb10c4a43e.png"
date: "2026-09-08"
dateLabel: "2026.09.08"
sourceKind: "CNCF case study · Localized edition"
sourceUrl: "https://www.cncf.io/case-studies/cetc-cloud/"
sourceLinkLabel: "Read the CNCF original ↗"
outcomeSourceUrl: ""
outcomeSourceLabel: "Key data source: Dynamia Network of Officials"
outcomes:
  - value: "15×"
    label: "Higher concurrent development Pod capacity"
    detail: "Same eight-GPU device: 2 → 30"
  - value: "87.5%"
    label: "GPU memory reclaimed per device"
    detail: "56 GB freed out of 64 GB GPU memory"
  - value: "80%"
    label: "Compute capacity reclaimed per GPU"
    detail: "20% allocated to embeddings; the rest remains schedulable"
---

The team uses Kubernetes and Hami to convert the limited Heterogeneous GPU, which previously bound individual services for a long period, into production models and Kubernetes development environments that can be applied for, shared and scheduled on demand.

On the bottom of this resource, text generation, vectors Embeding and Rerank models form a complete knowledge-base link; multiple Kubernetes development Pod/containers can also be shared with the same heterogeneous GPU through HAMi ' s virtualization capability.

| Key indicators | Outcome |
| --- | --- |
| Development capacity increased 15 times | Same 8 GPU portable equipment and development of Pod from 2 to 30 |
| Recovery 87.5% GPU memory | Embeding from monopolizing 64GB cards to allocating 8GB, leaving 56GB reusable |
| 80% recycling resources | Embeding Distribution 20% GPU general resources, remaining 80% available for other loads |

## Case information and scope of practice

| Item | Detail |
| --- | --- |
| User | CETC Cloud technical team |
| Business scenario | A one-stop smart knowledge base that can be carried to the project site and run independently |
| Deployment environment | Kubernetes and local heterogeneous GPU |
| Projects used | Kubernetes、HAMi |
| Core challenges | Multi-model synergies, production and development of shared resources |

| Knowledge base production pipeline | Kubernetes dev environment |
| --- | --- |
| Text generation, embedding, rerank | Multiple development Pod/container sharing single heterogeneous GPU |

This practice consists of two GPU use paths: the knowledge base production model uses mainly local stabilization resources, and Kubernetes develops Pod/containers sharing local Heterogeneous GPUs through Hami.

![The production model and Kubernetes development environment are using local Heterogeneous GPUs via Hami.](/redesign/assets/9b31ba0ce32ef27df2de.png)
*The production model and Kubernetes development environment are using local Heterogeneous GPUs via Hami.*

## One portable equipment, with services for production and research and development

The knowledge base relies on text generation, vector retrieval and rerank; data entry also requires the completion of resolution, cutting, quantification, learning extraction and indexing. Research and development engineers are required to develop Pod/container internal debugging models, validate dependence, and experiment in Kubernetes.

- Text generation models are permanently online, and the GPU baseline is high and sensitive to response delays.
- Embeding creates periodic peaks at the time of import of a volume document, with more focus on swallowing.
- Rerank is located in the online search chain, with a short single count but frequent call.
- Knowledge processing and indexing reconstruction are bulk tasks that need to be linked to online services.
- The development of Pod/container is cyclical and interactive, suitable for sharing GPU within a clear resource boundary.

If each service or development environment remains permanently bound to a consolidation card, the limited equipment will be logically depleted; but if only as thin a cut as possible, it will magnify GPU memory deficiencies, scheduling shakes and malfunction spread. The team needs to allow different loads to describe its needs and then place resources by platform according to the state of the equipment and service level.

![Business documents are analyzed, Embedding and indexed to enter the knowledge base; online questions are retrieved, Rerank and text is generated, and answers, references or reports are obtained.](/redesign/assets/ca4b9febe7be5ceb583c.png)
*Business documents are analyzed, Embedding and indexed to enter the knowledge base; online questions are retrieved, Rerank and text is generated, and answers, references or reports are obtained.*

## Why HAMi

The electromechanical cloud wishes to retain the Kubernetes application delivery, while allowing the platform to further determine whether heterogeneous GPU meets the load request and re-uses the same physical GPU for a suitable shared development environment. The Kubernetes raw resource statement, equipment sensory placement, equipment sharing and operating observations provided by Hami directly respond to these requirements.

The value of HAMi is not just to present a physical card as a multi-component resource, but more importantly to create a common resource engagement:

- Model services and development of Pod/container description of equipment resources are no longer dependent on long-term artificial binding cards.
- Scheduling not only checks whether the node has GPU, but also selects according to the state of availability of the equipment.
- Within the context of back-end support for physical equipment, multiple development Pod/containers can share a heterogeneous GPU and each maintains its own resource boundary.
- Pod, packagings, equipment and scheduling results can be linked to provide a basis for volume observations and resource allocation modifications.

## From resource painting to shared heterogeneous GPU

The team constructs a resource image around the load characteristics, focusing on model loading, peak usage, and distribution, delay and long-term performance, then converts validated demand to Kubernetes resource requests. Production models and development environments use different strategies:

1. **Stable boundaries for the online path.** Priority is given to securing a stable resource for text generation, online vector search and rerank.
2. **Periodical tasks allow queues and wrong peaks.** Document vectorization, knowledge extraction, and index rebuilds run when online load is low.
3. **Development of a single environment shared heterogeneous GPU.** Several Kubernetes developed Pod/containers to reuse GPUs through HAMi virtualization, thus avoiding their long-term exclusive ownership.
4. **Modifys the configuration with a real load.** The particle size is derived from baseline validation and operational observations, rather than assuming that a preset ratio is suitable for all models.

The resource governance package forms four product capacities:

- Text generation, Embeding and Rerank include a common Kubernetes GPU resource governance process.
- Knowledge banks, retrievals, questions and answers and reports generation form a complete operational link.
- Online services, bulk assignments and research and development debugging follow different resource rules.
- A single heterogeneous GPU can also serve multiple Kubernetes development Pod/containers.

## Quantified results: increase in single equipment development environment from 2 to 30

On a portable device equipped with 8 heterogeneous GPUs, teams introduced the pre- and post-Hami resource capacity by consistent calibre:

| Item | No HAMi | Include Hami |
| --- | --- | --- |
| Text generation models | Monarch 4 Heterogeneous GPU | Still holding 4 heterogeneous GPUs |
| Embeding and Rerank | One heterogeneous GPU each | 8 GB GPU memory quota each |
| Development of environmental availability | 2 remaining GPUs, carrying only 2 development Pods | Validation of 30 developments running side by side |
| Development of environmental capacity | Baseline | 15× the original |

The GPU memory quota for the development of Pod is requested by users according to their tasks, and the platform does not have a uniform fixed value. Under the current model quota and development load, the team completed 30 development Pod simultaneous validations.

### Single-Card Resource Comparison for the Embedding Model

On a 64GB heterogeneous GPU, the Embeding model actually requires about 8GB GPU memory. When the whole card is monopolized, the model uses only about 12.5% GPU memory, but other loads cannot apply for surplus resources. After introducing Hami, teams distribute 8GB GPU memory with 20% of the model as needed and re-incorporate the remaining resources into Scheduling. Compare the same mirror image, request integration and co-programming to compare the whole card with HAMi cut.

| Metric | No HAMi | Include Hami |
| --- | --- | --- |
| Embedding memory allocation | Monochrome 64GB cards | 8 GB on demand |
| Actual model memory need | ~8 GB | ~8 GB |
| VRAM reusable by other tasks | 0GB | 56GB, 87.5% of total card |
| Embedding compute allocation | Whole card dedicated | 20% allocated, remaining 80% schedulable |
| Token Bumping (tokens/s) | Baseline | Compared to the whole card, the change is within 5%. |
| Model loading time | Baseline | In general, consistent with the monopoly of the whole card, no significant changes were observed |
| P95 Delay in request | Baseline | In general, consistent with the monopoly of the whole card, no significant changes were observed |

This card, compared to the model, shows that Hami transformed Embeding from whole cards into a needs-based distribution, releasing GPU memory and Compute Resources, while keeping Token ' s swallowing changes within 5 per cent, with the model loading time and P95 being substantially stabilized so that the same heterogeneous GPU could also carry development environments or other suitable shared tasks.

![With the introduction of HAMi, Embedding allocated resources according to needs, a single card released 56GB GPU memory and 80% of the equipment; the development of Pod that can be carried by the equipment increased from 2 to 30.](/redesign/assets/3e9f561e5b390211887f.png)
*With the introduction of HAMi, Embedding allocated resources according to needs, a single card released 56GB GPU memory and 80% of the equipment; the development of Pod that can be carried by the equipment increased from 2 to 30.*

## Practical experience and next steps

First, heterogeneous GPU sharing should be based on load images rather than pre-set flat-spectrum ratios. Production models, mass assignments and development environments are not the same for delays, GPU memory, swallowing and so forth, and resource strategies are different from what is required by regulation.

Second, the R & D environment is an important user of shared GPUs. The development environment will operate in Kubernetes Pod/containers and can be reused with the production services resource declaration and scheduling approach while avoiding the long-term monopolization of equipment in each development environment.

In the next phase, electron clouds will continue to refine the capacity and health view of production and development loads and to complement experimental data that can be replicated under different models, networks and call modes.

## About HAMi

HAMi is a Heterogeneouscompute resource integration and unification project, co-sponsored by Mengxuan Li and Zhang Zhou. It is now the CNCF Incubation Project. The project aims to increase the utilization of heterogeneous computes by providing a single reuse interface for heterogeneous GPU.

At the time of publication, HAMi had supported projects such as NVIDIA, Ascend, Cambricon, Hygon, Iluvatar CoreX, Moore Threads, MetaX, Enflame, Kunlen core, AWS Neuron, Vastai and others, which were widely integrated into Volcano, Kuue, Koordinator, VLM, KAI Scheduler, and attracted more than 500 contributors from over 20 countries and regions, and produced environmental operations in hundreds of businesses.

## About the CETC Cloud Technical Team

The electron cloud technical team in this case is responsible for the development and engineering of products from a portable intellectual knowledge base, building product capacity around local on-site operations, knowledge processing, modelling services and environmental development.

The practical issues of sharing GPU and portable AI through the HAMi community are welcome.

<div class="case-source-note">
<p>Original:<a href="https://www.cncf.io/case-studies/cetc-cloud/" target="_blank" rel="noopener">CETC Cloud Builds a Heterogeneous GPU Shared Resource Foundation for a Portable Knowledge Base with HAMi ↗</a><br>Publisher: Cloud Native Computing Foundation (CNCF) · 2026-09-08</p><p>This localized edition preserves the source article’s technical information and measurement scope. It is not an official CNCF translation. Architecture diagrams retain their original text. Project status and product information reflect the original publication date.</p><p>The original is used under the  <a href="https://www.linuxfoundation.org/legal/terms" target="_blank" rel="noopener">Linux Foundation content terms</a> and  <a href="https://creativecommons.org/licenses/by/3.0/" target="_blank" rel="noopener">CC BY 3.0</a>. This edition has been localized and reformatted. All brand marks belong to their respective owners.</p>
</div>
