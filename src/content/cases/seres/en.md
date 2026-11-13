---
title: "How SeresCloud scaled AI inference to 10 billion daily tokens with Kubernetes and HAMi"
company: "seres"
companyName: "Seres"
logo: "/redesign/assets/seres-logo.svg"
date: "2026-11-02"
dateLabel: "2026.11.02"
sourceKind: "CNCF case study · Localized edition"
sourceUrl: "https://www.cncf.io/case-studies/seres/"
sourceLinkLabel: "Read the CNCF original ↗"
outcomeSourceUrl: "https://www.cncf.io/case-studies/seres/"
outcomeSourceLabel: "Key data source: CNCF Original language"
outcomes:
  - value: "10B+"
    label: "Daily tokens on SeresCloud"
    detail: "Up from approximately 300 million to over 10 billion"
  - value: "≈90%"
    label: "Small-model inference GPU utilization"
    detail: "HAMi plus platform autoscaling, up from 15–25%"
  - value: "3,000%+"
    label: "Growth in platform daily token volume"
    detail: "SeresCloud platform-wide growth"
---

## About Seres and SeresCloud

Seres is a technology-driven automaker focused on new energy vehicles. As AI adoption expanded across its business, the company built SeresCloud to provide unified model services for internal applications and AI agents, with Kubernetes managing the underlying GPU resources.

During 2026, the number of models in service grew from around 10 to more than 42, while daily token volume increased from approximately 300 million to over 10 billion. This platform-wide growth made GPU efficiency, especially for small-model inference, a priority.

![Growth in SeresCloud model count and daily token volume](/redesign/assets/seres/business-growth.jpg)
*Growth in SeresCloud model count and daily token volume*

## Why whole-GPU allocation fell short

The existing environment used GPU-Operator for device management and MIG on supported A100 and H100 GPUs. As hardware and models diversified, whole-GPU allocation was too coarse for embedding, reranking, voice and OCR workloads. Individual inference workloads often needed only 1–4 GB of GPU memory and followed strong day–night traffic patterns. GPU utilization in these small-model scenarios was typically just 15–25% under exclusive allocation.

Time-slicing enabled sharing, but without clear memory and compute boundaries it introduced contention, out-of-memory failures and latency jitter. Seres needed better utilization with more predictable resource limits for multi-tenant inference.

![Comparison of GPU resource allocation approaches](/redesign/assets/seres/gpu-comparison.jpg)
*Comparison of GPU resource allocation approaches*

## Combining HAMi with platform autoscaling

SeresCloud already provided a model registry, inference gateway, autoscaling and monitoring. The registry managed images, configurations and versions. The gateway handled routing, load balancing, rate limiting and circuit breaking. Autoscaling adjusted service replicas using QPS, GPU utilization and queue depth.

With HAMi, the platform determines when to scale and how many replicas are needed. HAMi places those replicas on suitable GPUs and applies per-task GPU memory and compute limits. Shared monitoring signals connect service elasticity with fine-grained resource allocation.

![How the SeresCloud inference platform integrates HAMi](/redesign/assets/seres/platform-architecture.jpg)
*How the SeresCloud inference platform integrates HAMi*

## Sharing one GPU across inference workloads

With HAMi, a Kubernetes Pod can request a vGPU count, GPU memory and a share of compute. The example below requests one vGPU, 3,000 MiB of GPU memory and 30% compute, allowing a small model to use the resources it needs without reserving a whole GPU.

```
resources:
  limits:
    nvidia.com/gpu: 1
    nvidia.com/gpumem: 3000
    nvidia.com/gpucores: 30
```

![From exclusive GPUs to sharing with resource boundaries](/redesign/assets/seres/sharing-approaches.png)
*From exclusive GPUs to sharing with resource boundaries*

## Scheduling and production configuration

Seres uses both Binpack and Spread strategies in production, selecting placement according to workload requirements. Load testing led to a limit of 10 vGPU tasks per physical GPU, with no memory or compute oversubscription. More task slots do not create additional physical resources: scheduling still checks the resources available on each device.

```
devicePlugin:
  deviceSplitCount: 10
  deviceMemoryScaling: 1
  deviceCoreScaling: 1
  migStrategy: none
  disablecorelimit: "false"

scheduler:
  defaultMem: 5000
  defaultCores: 0
```

## Small-model inference GPU utilization reaches around 90%

Together, HAMi and SeresCloud autoscaling increased GPU utilization in small-model inference scenarios from 15–25% to around 90%. Across the platform, daily token volume grew by more than 3,000% to over 10 billion, with more than 42 models in service. Better resource efficiency supported the platform as its AI workloads expanded.

![GPU utilization in small-model inference scenarios](/redesign/assets/seres/utilization.png)
*GPU utilization in small-model inference scenarios*

## Lessons from production

During rollout, the team configured webhook bypass rules for privileged debugging Pods and diagnosed scheduling failures using reasons such as NodeInsufficientDevice, CardTypeMismatch and CardInsufficientMemory. Prometheus and Grafana brought HAMi and platform metrics together so troubleshooting, placement and autoscaling could use consistent signals.

The number of device slices must be validated against real models, concurrency and service quality; a larger number is not automatically better. Clear responsibilities between platform autoscaling and HAMi scheduling, supported by shared monitoring, are central to stable operation.

## Next steps: broader hardware and scheduling support

Seres plans to bring Ascend and Hygon DCU devices into its resource pools, evaluate HAMi-DRA and explore priority-based preemption and topology-aware scheduling for larger models. The team also plans to continue sharing production experience with the open-source community.

<div class="case-source-note">
<p>Original:<a href="https://www.cncf.io/case-studies/seres/" target="_blank" rel="noopener">How SeresCloud Scaled AI Inference to 10 Billion Daily Tokens with Kubernetes and HAMi ↗</a><br>Publisher: Cloud Native Computing Foundation (CNCF) · 2026-11-02</p><p>This localized edition preserves the source article’s technical information and measurement scope. It is not an official CNCF translation. Architecture diagrams retain their original text. Project status and product information reflect the original publication date.</p><p>The original is used under the  <a href="https://www.linuxfoundation.org/legal/terms" target="_blank" rel="noopener">Linux Foundation content terms</a> and  <a href="https://creativecommons.org/licenses/by/3.0/" target="_blank" rel="noopener">CC BY 3.0</a>. This edition has been localized and reformatted. All brand marks belong to their respective owners.</p>
</div>
