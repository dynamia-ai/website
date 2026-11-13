---
title: "How Zhuoyu Technology raised GPU allocation above 95% on Kubernetes with Koordinator"
company: "zhuoyu-technology"
companyName: "Zhuoyu Technology"
logo: "/redesign/assets/947e64289732bbc6003c.svg"
date: "2026-09-29"
dateLabel: "2026.09.29"
sourceKind: "CNCF case study · Localized edition"
sourceUrl: "https://www.cncf.io/case-studies/zhuoyu-technology/"
sourceLinkLabel: "Read the CNCF original ↗"
outcomeSourceUrl: "https://www.cncf.io/case-studies/zhuoyu-technology/"
outcomeSourceLabel: "Key data source: CNCF Original language"
outcomes:
  - value: ">95%"
    label: "GPU allocation rate"
    detail: "Scheduled / schedulable GPUs, excluding faulty devices"
  - value: ">55%"
    label: "Overall GPU utilization"
    detail: "Combined governance with Koordinator and HAMi"
  - value: "≈60%"
    label: "Fewer full GPUs needed for Codespaces"
    detail: "Algorithm and data engineering environments"
---

When using default Scheduler, multi-tenant flash submissions, GPU/CPU resource fragments, and the inability to allow all Pod simultaneously to start distributed operations limit resource allocation and utilization. The team introduced Elastic Quta, Reservation, Device Share, and Gang Scheduling Extension Schemer, which combines Device Share with Hami to reduce the total number of cards needed by about 60 per cent.

## About Zhuoyu Technology

Zhuoyu Technology provides autopilot systems and self-study core components. Around the data closed loop, companies build pilot clouds that link data production, model training, model assessment and model inference into continuous iterative “data flyers” for more than a dozen algorithms, data and platform teams to share. Koordinator has been operating as the Platform’s core Scheduling engine for two years, managing multi-tenant governance and increasing GPU deployment density.

## Challenges

There are four main problems in the production environment:

- **Multi-tenant competition is unfair.** Sudden submissions and rigid resourceQuota limits have resulted in mission start-up failure, low resource allocation; no weighting of quotas can be used between teams.
- **GPU resources are idle.** Pure CPU Pod uses the CPU and memory on GPU nodes, preventing expensive GPUs from being scheduling; at the same time, GPU operations often leave nearly half of the CPU and memory empty.
- **GPU utilization is low.** The Codespaces, which are routinely used by algorithms and data engineers, and small models use less than 15 per cent of the whole card when they occupy it alone. During debugging, GPU is idle for most of the time and requests for a single request are much smaller than the entire card.
- **Distributive death locks.** Distributive operations require multiple Pods to be ready; individually, this leads to some Pods holding resources while others with the same operation remain in Pending status.

## Why Kubernetes and Koordinator

The original Kubernetes provide hard-sourceQuota, Pod-by-Pod binding and whole card allocation, but do not provide inter-tenant weight loan quotas, a mechanism to retain CPU/RAM for GPUs, particle size sharing, or all or none of the distributed jobs. Koordinator expands these four capabilities through Scheduler without changing clusters API; and Hamei-Core limits on sharing GPS operations when they are run by Compute Resources and GPU memory.

The team also translated production experience into upstream repair. Since 2023, more than 10 PRs have been integrated into Koordinator, including the availability of HAMi-Core at the Scheduler Perception Node (#2577) and the provision of vGPU distribution and utilization indicators (#2578).

## Solution

### ElasticQuota: Equitable lending of resources with weights

The two-storey tree structure separates the quota group from the leaf business quota. Quota groups are divided by GPU type or level of operational criticality, and the different groups do not borrow resources between themselves by labeling a node. In the same group, the leaf quota can be borrowed in excess of Min's spare capacity; when competition takes place, Max decides on his share. If quota A is twice as much as B, A receives roughly twice as much loanable capacity as B.

Automatically label the task 's sudden need to use only free GPUs in this group, and not other training groups protected GPUs. Each GPU business quota is broken down to `.gpu` and `.cpu`This allows for the flow of free resources between operations within controlled pools, while protected pools maintain their presence.

![Quota group soolation pool; leaves quota is used to borrow resources within the group and to manage GPU and CPU needs separately.](/redesign/assets/86200a6bb31ec35324bb.png)
*Quota group soolation pool; leaves quota is used to borrow resources within the group and to manage GPU and CPU needs separately.*

### Reservation: Safety to increase resource utilization intensity of GPU nodes

At the 8 GPU / 224 CPU node, RESERVATION has reserved CPU and memory for GPU Pod so that the CPU load can use surplus capacity without preventing scheduling of subsequent GPU tasks. This is equivalent to a virtual CPU pool, approximately 112 cores, 500gi, adjusted to the resource pattern of the GPU operation, and does not require additional purchase of pure CPU machines.

![Reservation protects the CPU/RAM resources for GPU Pod, and the remaining capacity is used for the CPU workload.](/redesign/assets/bfcef6fc19fda6a4ae90.png)
*Reservation protects the CPU/RAM resources for GPU Pod, and the remaining capacity is used for the CPU workload.*

### Device Share + Hami: GPU splits and association

fine particle size GPU shared after four steps: Pod request `gpu-core` and `gpu-memory-ratio`; koord-scheduler Device Share plugin bound to a slice; Koordlet injects the device environment variable through NRI into CRI Runtime instead of directly into containers; Hami-Core (mounted by hami-daemon) `libvgpu.so`This can be seen in the context of the following:

Co-pilot missions can thus be maintained within their respective allocation limits, allowing Codespaces and small models to share GPUs without having to own the whole card.

![Device Share places GPU slices; Hami-Core stops CUDA API calls and runs time limits.](/redesign/assets/eb104bbae957778c4e32.png)
*Device Share places GPU slices; Hami-Core stops CUDA API calls and runs time limits.*

## Implementation effectiveness

### Gang Scheduling: Distributive operations start or release as a whole

The task load controller sets the same Gang name for Head and Worker Pod as the `min-available` Number. Koord-scheduler identifies these notes, selects nodes for each Pod and suspends binding at the Permit stage. `min-available` After the required number of valid placements, Scheduler released the whole group.

If the threshold is not reached before the time has elapsed, roll back all of the presumed distributions. A distributed operation either starts with sufficient resources or releases a temporary reservation to avoid some Pod holding the GPU while other members are waiting.

### Quantified results

| Metric | Result |
| --- | --- |
| ElasticQuota Object | More than 100 per cluster |
| Scheduling. | Between 300,000 and 800,000 Pods per day |
| GPU allocation rate | Over 95% |
| GPU utilization | More than 55 per cent overall; shared access approximately 60 per cent |
| Codes required GPU integer cards | Reduction of approximately 60 per cent |

**Measurement methods.** The GPU allocation rate is divided by the number of scheduling GPU cards and does not include malfunctioning equipment. The GPU utilization factor uses the average SM usage reported in nodes telemetry, counting all clusters and shared reference points separately. The Codespaces saves more than the entire card needs before and after Device Share was introduced.

## Follow-up plan

As business growth increases, scheduling and accuracy becomes increasingly bound to the whole stream of SLA. The team then focuses on four directions: complying with distributed atomic Quota recycling; flattening Pending peaks through a load-level line; breaking the string Scheduling ceiling through a Scheduler fraction; and multiclustering and mixing clouds to meet sudden AI needs. The team assesses Koordinator community capacity in relation to these production scenes and feeds back to communities.

<div class="case-source-note">
<p>Original:<a href="https://www.cncf.io/case-studies/zhuoyu-technology/" target="_blank" rel="noopener">How Zhuoyu Technology Pushed GPU Allocation Above 95% on Kubernetes with Koordinator ↗</a><br>Publisher: Cloud Native Computing Foundation (CNCF) · 2026-09-29</p><p>This localized edition preserves the source article’s technical information and measurement scope. It is not an official CNCF translation. Architecture diagrams retain their original text. Project status and product information reflect the original publication date.</p><p>The original is used under the  <a href="https://www.linuxfoundation.org/legal/terms" target="_blank" rel="noopener">Linux Foundation content terms</a> and  <a href="https://creativecommons.org/licenses/by/3.0/" target="_blank" rel="noopener">CC BY 3.0</a>. This edition has been localized and reformatted. All brand marks belong to their respective owners.</p>
</div>
