---
title: "One heterogeneous compute pool, two workloads: China Merchants Bank unifies training and inference on Kubernetes"
company: "china-merchants-bank-2"
companyName: "China Merchants Bank"
logo: "/redesign/assets/b597756761457e50d747.svg"
date: "2026-09-07"
dateLabel: "2026.09.07"
sourceKind: "CNCF case study · Localized edition"
sourceUrl: "https://www.cncf.io/case-studies/china-merchants-bank-2/"
sourceLinkLabel: "Read the CNCF original ↗"
outcomeSourceUrl: "https://www.cncf.io/case-studies/china-merchants-bank-2/"
outcomeSourceLabel: "Key data source: CNCF Original language"
outcomes:
  - value: "60%+"
    label: "Average accelerator utilization"
    detail: "Platform-wide average: 35% → 60%+"
  - value: ">60%"
    label: "Lower inference cost per million tokens"
    detail: "Input and output included, with equivalent models and service conditions"
  - value: "5×"
    label: "Higher multi-tenant training density"
    detail: "Five LoRA tenants share one base model by default"
---

China Merchants Bank is one of China’s leading commercial banks, investing continuously in claud-native technology, artificial intelligence, and digital infrastructure. As AI expands to more financial scenes, the platform needs to support large model training, fine-tuning, online access and other AI loads on nearly 10,000 heterogeneous accelerators.

On this scale, simply increasing the accelerometers will not solve the platform’s efficiency problems. Training requires stabilizing capacity and high levels of ingestion.

China Merchants Bank creates a unified control plane on Kubernetes while retaining two decorating paths. Both loads run in the Kubernetes Deproyment Pod, using Ray as a distributed running time: Twinkle is responsible for multi-tenant training, vLLM or SSLang provides online access.

In the load control layer, Kuue manages training queues, quotas and access; Prometheus and KEDA scale up inference services based on real-time demand signals; Hami Scheduling and allocate shared accelerator resources; Fluid expedites access to data sets, model weights and check points.

The average accelerator of the platform increased from 35% to more than 60%. In comparable model and service conditions, the cost of reference per million Token (total input and output) was reduced by more than 60%. In the default configuration, 5 LoRA tenants shared an example of a base model, which increased training density five times, and the base model was reduced from 5 to 1.

> “The real challenge is not to lack accelerator capacity, but to find ways of making more effective use of existing heterogeneous resources. Training and access share the same infrastructure, but require very different operational strategies.”
>
> — PeiXiang Tan, China Mercants Bank AI Infrastructure Architect
>

| Item | Detail |
| --- | --- |
| Industry / Region | Financial services / China |
| Platform | AI Training and Reference |
| Size | Nearly 10,000 heterogeneous accelerators. |
| Projects used | Kubernetes、Kueue、KEDA、Prometheus、HAMi、Fluid、Twinkle |

| Average accelerator utilization | Token cost per million | Multi-tenant training density |
| --- | --- | --- |
| 35% → 60%+ | Reduce 60% or more, total input and output | 5 times higher |

## Challenges

The problem is not just low utilization. The way in which training and access consumes the same resources is fundamentally different.

### Training requires stable and predictable resources

Distributive training is usually long-lived and based on insinuation, and only all work can start effectively if the Worker and accelerator cards are ready. In the absence of a sensory quota access mechanism, some Pod may be activated early enough to spare capacity while waiting for the remaining resources. At the same time, data sets and model weights need to be transferred between centralized storage and computation nodes; when data are not ready, assigned accelerators will have to wait.

### Inference has to follow the flow.

Online reference is the opposite. Requests fluctuate with business flows, and response delays are more important than batch-processing in case of stow-off. Accelerators are set at peak loads, leaving a large amount of idle resources in the valley. Indentations can reduce waste, but when traffic returns, new copies must reload model weights to service requests. If start-up is slow or unpredictable, the platform team must keep additional copies and push up unit Token costs.

### The fine-tuning requires solation without repeating the loading base model.

LoRA finely updates only a few parameters, but the traditional “one tenant deployment” will still load the complete base model as it runs. 5 of the same models will create five base models, although smaller Adapter is different. Tenant status is soolation, GPS memory is duplicated and initialization occurs when running.

Therefore, sharing the compute pools requires different load strategies and separate processing of physical accelerator sharing and model reuse.

## Solution

### Why select a combinationable cloud-native technology vault

China Merchants Bank uses a self-study platform strategy based on Kubernetes, which combines several CNCF projects into unified training and inference capabilities. Training and reference allow for the selection of engines and strategies that are best suited to one another, sharing control floors, resource layers, data paths and monitoring systems.

This decision is based on three principles:

- **Independent evolution:** Training frameworks, reference engines and models are different in speeds and should not be closely aligned.
- **Hardware flexibility:** Kubernetes and Hami provide a common management portal for sharing heterogeneous accelerators, reducing reliance on single-manufacturing technology lockdowns.
- **Open integration:** Kuue, KEDA, Prometheus, Hami and Fluid are connected through the Kubernetes primary interface without requiring a product to manage the entire model life cycle.

The shared base is composed mainly of CNCF hosting projects. Kubernetes, KEDA and Prometheus are graduation projects; Kueue is maintained by Kubernetes SIG Scheduling; Hami and Fluid are incubators.

### Implementation and collaboration

Working closely with the Bank ' s data centres and other internal teams, China Mercants Bank used this framework to integrate 99 per cent of the accelerator resources into the unified management and performance.

### Structure: shared infrastructure, decoupling time

![Kubernetes Native Unified Training and Reference Framework.](/redesign/assets/1df5d33a7b55d33f89f5.png)
*Kubernetes Native Unified Training and Reference Framework.*

The architecture shares resources at the infrastructure level, distinguishing between training and access at the operational time.

In the load layer, Traying API sends tasks to Pod, Twinkle, which is managed by Training Development, where training is based on Ray. Inference Gateway links online requests to Pod, managed by Access Development Management, with vLLM or SGLang providing access based on Ray.

The two paths depend on the same set of capabilities: Kueue and KEDA, respectively, for training access and inference elasticity; Kubernetes Scheduler and HAMi to place Pod, allocate accelerator capacity; Fluid to provide data and model access, Prometheus to collect performance indicators. The lower shared accelerator node is connected to the Fluid Cache Runtime object storage and model registration centre.

| Dimension | Trainable Path | Inference Path |
| --- | --- | --- |
| Demand pattern | Long time, batching and insensitive. | Sudden, delayed sensitive, request driven |
| Access. | Training API | Inference Gateway |
| Primary control | Keueué Access and Quota Management | Prometheus Indicators and KEDA Autoscaling |
| Run-time | Twinkle on Ray | vLM or SGLang on Ray |
| Shared Bottom | Kubernetes Scheduler, Hami, Fluid, accelerator nodes, storage and model registration centre | Same Left |
| Key findings | Higher multi-tenant training density | Lower unit cost |

The increase in the utilization of accelerators cannot be attributed to single components, but rather to the combined effects of access, scheduling, distribution, data access and running back.

### Training path: Twinkle multi-tenant training based on Ray

Training requests are made through access controls before computing and data resources are prepared:

**Training API → Kueue admission & quotas → Kubernetes Scheduler → HAMi accelerator allocation → Fluid dataset/checkpoint access → Twinkle on Ray → checkpoint & model registration.**

Kuuee first determines whether operations can enter clusters based on queues and quotas, avoiding some Pod waiting indefinitely for the rest of the resources. After access, Kubernetes Scheduler selects nodes and Hami distributes the required accelerator capacity. Fluid uses the abstract and computational side cache of Kubernetes raw data to reduce duplicate access to centralized storage and make the accelerators less waiting.

Twinkle operates in Training Pod, based on Ray conducting training to support Transformers or Megatron backends. In the multi-tenant LoRA scenario, tenants share examples of a model with an independent Adapter, training configuration and status. By default, five tenants share a base model. Compared to independent deployment, the base model is reduced from 5 to 1 copies, reducing the use of accelerator resources by 80 per cent.

The number of co-teaching tenants that can be supported by an example of a base model has increased fivefold. The platform has been validated as co-opted, and the production environment is used defaultly by 5 tenants.

After the training, Twinkle hands over the check points to the downstream model management process. Fluid Accelerating the flow of the check points between storage and calculation, and the Model Registration Centre records model versions, Adapter and Tokenizer for assessment and deployment.

### Inference path: KEDA, HAMi and Fluid synergetic service

The inference path starts with an online request:

**Inference Gateway → vLLM or SGLang on Ray → Prometheus service & demand metrics → KEDA scaling decision → Kubernetes Scheduler & HAMi allocation → Fluid model cache access.**

Key indicators such as QPS, requested queue depth, delay in access are exposed to Prometheus collection services. KEDA adds and subtracts copies based on these letters decisions. Kubernetes Scheduling new Pod, Hami allocates appropriate accelerator resources, and Fluid provides the cache model weight.

Each component eliminates costs from different sources:

- KEDA adjusts the number of copies to demand to reduce idle capacity in low valley hours.
- HAMi allocates accelerator capacity for the appropriate share of the load fine grain to avoid small or volatile services with exclusive ownership of the whole card.
- Fluid reduces the loading time for new copies by placing model weights near the calculation.
- Prometheus provides real-time indicators that allow scaling decisions to reflect actual demand and service objectives.

Demand-driven elasticity, fine particle accelerator distribution and faster model loading together reduce the cost of inference.

### Integrated model life cycle

Despite different operational strategies, training and reference are linked to the life cycle of the same model:

**Training → checkpoint → evaluation & registration → production deployment → online monitoring → iterative optimization.**

Training and inspection points are stored in object or dataset storage, and Fluid provides uniform access and caches. Twinkle Generation Models or Adapter Checkpoints are evaluated and registered at the Model Registration Centre; the Inference Service loads selected versions through Fluid. Prometheus collects production indicators on a continuous basis to provide a basis for volume adjustments and next round of model overlays.

Harmonization of training and inference is not just a combination of two loads in the same Kubernetes cluster, but shared resource management, data flow, model versions and online feedback.

## Implementation effectiveness

| Metric | Result |
| --- | --- |
| Average accelerator utilization | 35% → 60%+ |
| Inference unit cost | Token drops by more than 60% per million, total output |
| Multi-tenant training density | Increase 5 times; 5 reduction in the use of accelerator resources by tenants 80% |
| Copy of base model | Default 5 LoRA tenants, copy reduced from 5 to 1 |
| Compose Authentication | Valided 8 Tenants; Production Default 5 |

*Key results reported by the Platform team.*

### Average accelerator usage: 35%  60% +

Using the same internal measurement methods before and after retrofitting, the average usage rate of nearly 10,000 heterogeneous cards increased from 35% to over 60%. Kuue reduces training operations that are premature and debris-encumbering resources; Hami increases the distribution of particles; Fluid shortens data and model weights waiting. The results reflect improvements in the entire resource path.

### Token inference per million: by 60% or more

Under comparable model and service conditions, the cost of processing a million Token is reduced by more than 60 per cent by input and output. The unit cost is more relevant than total expenditure because it reflects efficiency in the growth of business volume.

### Accelerator resources: 80 per cent reduction

When using the DeepSeek base model, Twinkle by default allows five LoRA tenants to share a base model example. Copies are reduced from 5 to 1, reducing the amount of accelerator resources for this configuration by 80% and increasing training density by 5 times.

> “We use this framework to integrate 99% of the accelerator resources into integrated management through close collaboration with data centres and other internal teams. The effect can be quantified: average accelerator usage has increased from 35% to over 60%, and the cost of inference per million Token has been reduced by more than 60%.”
>
> — MeiQing Zhang, Head of the China Merchants Bank Architecture Management Team
>

## Practical experience

### Keep different running strategies under unified control plane

Training and access require harmonization of resource management, but should not use the same strategy. Kueue’s queue and quota access are suitable for training loads, and KEDA’s indicator-driven scaling is appropriate for online reference.

### Inference elasticity relies on the rapid completion of the model

Sends an expansion order, which does not mean that the capacity of reference is immediately available. A new copy can only receive a request if you load the model weight. Thus, the mode ' s loading speed is part of the flexibility of the model and not just its storage optimization. Fluid 's computational side cache shortens this time.

### Common resources sharing and model sharing to solve different problems

Hami decides how the physical accelerator capacity is distributed, and Twinkle decides how multiple LoRA tenants can re-use a base model. The former reduces the waste of compute resources, while the latter eliminates redundancy; the two cannot be replaced.

### Accurate measurement of gains using consistent indicators

The use of accelerators, unit Token costs and training density measures different problems. Clarifying the scope and methodology of each indicator makes it easier to validate results and to refer to other organizations.

## Meaning of this practice

In this architecture, Kubernetes not only runs AI containers but also connects to operational access, event-driven elasticity, accelerator distribution, data acceleration and observability.

The CNCF project provides a neutral, modular infrastructure interface. China Mercants Bank can upgrade the training framework or inference engine without replacing the resources and data layers below; it can also add or change the accelerator type without having to rewriting the whole training package and the inference process.

**Measurement description:** The result is a consistent internal comparison of the bank, with comparable models and conditions of service as described above.

## Follow-up plan

The next phase will focus on four directions:

- **Dynamic multi-tenant side:** Breaking the fixed 5 tenant default configuration based on a proven maximum 8 tenants, adjusting Twinkle to model size, LoRA configuration, GPU memoory pressure and service targets.
- **Capacity management based on unit cost:** The distribution of capacity between training and reference is guided by the combination of accelerator utilization, Kueu training queue status, Prometheus delayed signal and Token cost.
- **Servers AI load based on KEDA:** Expand the event-driven extension to Servers mode of operation. When service targets permit, access can be reduced to zero and restored to real time demand; model readiness is reduced by Fluid cache.
- **Broader hardware and running support:** Expansion of HAMi-based heterogeneous accelerator support, increased training and inference backends, maintenance of two path decoupling links and contribution of production experience upstream.

<div class="case-source-note">
<p>Original:<a href="https://www.cncf.io/case-studies/china-merchants-bank-2/" target="_blank" rel="noopener">One Heterogeneous Compute Pool, Two Workload Types: How China Merchants Bank Unified Training and Inference on Kubernetes ↗</a><br>Publisher: Cloud Native Computing Foundation (CNCF) · 2026-09-07</p><p>This localized edition preserves the source article’s technical information and measurement scope. It is not an official CNCF translation. Architecture diagrams retain their original text. Project status and product information reflect the original publication date.</p><p>The original is used under the  <a href="https://www.linuxfoundation.org/legal/terms" target="_blank" rel="noopener">Linux Foundation content terms</a> and  <a href="https://creativecommons.org/licenses/by/3.0/" target="_blank" rel="noopener">CC BY 3.0</a>. This edition has been localized and reformatted. All brand marks belong to their respective owners.</p>
</div>
