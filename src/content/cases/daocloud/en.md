---
title: "DaoCloud builds a flexible GPU cloud with HAMi"
company: "daocloud"
companyName: "DaoCloud"
logo: "/logos/company7.png"
date: "2025-12-02"
dateLabel: "2025.12.02"
sourceKind: "CNCF case study · Localized edition"
sourceUrl: "https://www.cncf.io/case-studies/daocloud/"
sourceLinkLabel: "Read the CNCF original ↗"
outcomeSourceUrl: ""
outcomeSourceLabel: "Key data source: Dynamia Network of Officials"
outcomes:
  - value: "10,000+"
    label: "GPUs across platforms"
    detail: "D.run and DCE across 10+ data centers"
  - value: ">80%"
    label: "Average GPU utilization"
    detail: "Per-GPU average after deploying HAMi"
  - value: "20–30%"
    label: "Lower GPU operating costs"
    detail: ""
---

## Challenges

DaoClaud operates two major AI-loaded cloud-native platforms: D.run Compute Resourcees, which provides publicly owned GPU clouds to individual developers and small teams; DaoClaud Enterprise (DCE), which is a private Kubernetes platform for business clients, while carrying training and access.

Several challenges have emerged as demand for GPUs from both platforms has grown rapidly:

1. **The whole card allocation causes capacity to be idle.** Many references and light loads use only a portion of the GPU resource, but the GPU is usually distributed by whole card, leaving behind a large number of underutilized compute resources and GPU memory, which also limits the design of GPU SKU.
2. **Heterogeneous hardware management difficulties.** DaoClaud needs to support both the mainstream NVIDIA GPU and integrated multiple domestic accelerators. The proprietary vGPU program increases licensing costs and makes it difficult for the national production GPU to receive equal support.
3. **Firms need stronger multi-tenant governance.** DCE clients want to share GPU pools with sector-level quotas, line-based resource allocation and clear team support.
4. **It is important to maintain consistency in the claud-native.** DaoClaud's core strategy is centred on Kubernetes and open source technologies. The GPU sharing programme must be fully cloud-native, producer neutral and compatible with existing CNCF tools.

| Key Results | Data |
| --- | --- |
| Override Data Centre | China Mainland and Hong Kong have more than 10 |
| Average GPU utilization after using vGPU | More than 80% |
| GPU Related Operating Costs | 20-30% reduction |

## Solution

DaoClaud uses HAMi as the unified GPU level for D.run and DCE. At the time of case release, HAMi provided CNCF Sandbox projects with equipment for the Heterogeneous accelerator in Kubernetes cluster, virtualization, vGPU cut and scheduling.

### Scope of deployment

HAMi is deployed in the production environment of D. Run and DCE, which covers DaoClaud's own GPU and corporate customer-owned GPUs. Together, HAMi has a GPU capacity of more than 10,000 cards distributed across more than 10 data centres in mainland China and Hong Kong. The GPS belongs to different parties depending on the region and the tenant, but Hami provides unified virtualization and scheduling layers for all equipment.

### D. Run company resources: vGPU SKU for common cloud users

DaoClaud integrates Hami into the D.run regional Kubernetes cluster, achieving fine particle size sharing and higher utilization.

- **vGPU cut and controlled oversubscription:** Splits the physical GPU into multiple slices that clearly define the compute resourcees and GPU memoory. Lightweight use of GPU for a mission, controlled oversubscription further increases overall cluster utilization.
- **GPU-based market:** Places the vGPU slice as a standardized SKU in the unified market, with users choosing by load size without having to pay for the whole card.
- **Multi-regional deployment:** HAMi supports seven active D.run regions in China and Hong Kong, covering more than 10 data centres. Depending on customer deployment and hardware availability, individual areas in production can be expanded to about 3,000 GPU clusters.
- **Support for national accelerators:** DaoClaud Extension HAMi support for national production GPU manufacturers, managing NVIDIA and the national production card in a uniform abstraction.

![D.run Product Layout, Source: CNCF Original.](/redesign/assets/524623d1953a5063ead0.png)
*D.run Product Layout, Source: CNCF Original.*

### DaoClaud Enterprise: Shared GPU pool for large enterprises

On DCE, DaoClaud builds a centralized GPU pool based on Hami to harmonize the capacity of multiple business tenants.

- **Unified pool:** Enterprise users contribute to the pool and use GPU, while providing training and access.
- **Quota, RBAC and vGPU integration:** The HAMi ' s vGPU resources are integrated with the existing quota and role privileges system, bringing the sector-level and queue-level GPU limits to the vGPU level.
- **Simplify AI Engineer experience:** Algorithmic engineers apply for GPUs through the platform, without concern about bottom hardware differences; and Hami processes vGPU maps to provide smooth development experience.

### Building with communities

DaoClaud is one of the earliest and most active contributors to HAMi. Engineers continue to feed back to communities D. Run ' s true experience with DCE, work upstream to improve GPU oversubscription, nodal configuration management and heterogeneous hardware processing, and maintain documentation and deployment guides to help other cloud manufacturers adopt Hami in their production environments.

> “D.run can manage NVIDIA and GPU on a large scale, seamlessly, through the abstract of HAMi's unified vGPU. Hami has not only increased the use of GPU but also accelerated regional expansion and delivery.”
>
> - Captain, DaoClaud AI/LLM Head of Infrastructure Products
>

## Implementation effectiveness

By integrating Hami, DaoCloud integrates previously fragmented GPU resources into a more integrated, efficient and scalable GPU layer covering both public and private clouds.

D.run has significantly increased the utilization of GPUs after moving from whole-card distribution to vGPU splitting.

In DCE, enterprises view GPU as a public resource pool that is subject to quotas and RBAC management. The model streamlines GPU management, enhances transparency and speeds up access to new teams and projects.

Across two platforms, HAMi ' s open structure reduces plant dependence and allows NVIDIA to operate with the national accelerator under unified control.

> “Hami’s relationship with DaoClaud is not just business compatibility, but joint construction. As one of the first contributors to Hami, we have witnessed its evolution from scratch.
>
> Hami shares the same open-source gene as DaoClaud, and we will continue to contribute to bringing real vGPU technology to the world."
>
> - Captain, DaoClaud AI/LLM Head of Infrastructure Products
>

### Key Results

- With the deployment of HAMi, average single card GPU utilization exceeded 80 per cent.
- GPU-related operating costs decreased by 20-30 per cent through efficient splitting and oversubscription.
- NVIDIA uses uniform abstract layers with the national production GPU to diversify hardware without increasing the complexity of transport.
- Quotas and role privileges are integrated into the vGPU layer, making governance simpler.
- HAMi ' s modular design reduces the deployment and delivery cycle of clusters and accelerates regional expansion.
- DaoCloud continued co-development of HAMi, contributing to upstream improvements and enhancing open source collaboration.

<div class="case-source-note">
<p>Original:<a href="https://www.cncf.io/case-studies/daocloud/" target="_blank" rel="noopener">Building flexible GPU clouds with HAMi at DaoCloud ↗</a><br>Publisher: Cloud Native Computing Foundation (CNCF) · 2025-12-02</p><p>This localized edition preserves the source article’s technical information and measurement scope. It is not an official CNCF translation. Architecture diagrams retain their original text. Project status and product information reflect the original publication date.</p><p>The original is used under the  <a href="https://www.linuxfoundation.org/legal/terms" target="_blank" rel="noopener">Linux Foundation content terms</a> and  <a href="https://creativecommons.org/licenses/by/3.0/" target="_blank" rel="noopener">CC BY 3.0</a>. This edition has been localized and reformatted. All brand marks belong to their respective owners.</p>
</div>
