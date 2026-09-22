---
title: 'HAMi Meetup Shanghai Deep Dive (4): Turning GPU Performance into Inference Service Capability — Lessons from Iluvatar CoreX'
linktitle: Iluvatar CoreX GPU Inference in Practice
date: '2026-09-22'
excerpt: >-
  The GPU benchmarks well, yet users still wait for the first token or feel stalls mid-generation.
  Ye Chenglin, Infra R&D Director at Iluvatar CoreX (天数智芯), shared a full engineering path for domestic-GPU
  inference at HAMi Meetup Shanghai: execution optimization, topology-aware scheduling, and inference
  orchestration — accepted against end-to-end SLOs, with HAMi covering the small-model GPU-sharing branch.
author: Dynamia
tags:
  - HAMi
  - HAMi Meetup
  - Iluvatar CoreX
  - GPU Inference
  - PD Disaggregation
  - SLO
  - llm-d
  - Domestic GPU
category: Community & Events
language: en
coverImage: /images/blog/hami-meetup-shanghai-2026-iluvatar-gpu-inference/slide-03-ecosystem-to-slo-metrics.png
---

The GPU's compute performance is good, yet users still wait for the first token or feel stutters during generation. When enterprises deploy LLMs, problems like these don't necessarily come from the chip. Where resources are placed, how requests are routed, how cache moves, when a new replica is truly ready — all of it shapes the final experience.

This is the fourth deep-dive in our [HAMi Meetup Shanghai](/blog/hami-meetup-shanghai-2026/) series. **Ye Chenglin**, Infra R&D Director at Iluvatar CoreX, presented "High-Performance Inference Deployment on Iluvatar GPUs," showing the division of labor among execution optimization, topology scheduling, and inference orchestration — plus the path of using HAMi for GPU sharing in small-model scenarios. For enterprise platforms, the point of borrowing this practice is to choose resource shapes per workload, then use end-to-end metrics to check whether the layers actually work together.

## Key Takeaways

- Acceptance for inference services must look at first-token, inter-token, and tail-request performance — not single-card benchmarks.
- Resource placement, request routing, and execution communication each have their own job; HAMi covers the on-demand small-model GPU-sharing branch.
- PD disaggregation must earn back its added cache-transfer costs; a new replica counts as ready only when it serves qualifying traffic.

**Speaker:** Ye Chenglin | Infra R&D Director, Iluvatar CoreX (天数智芯)

## Compatible Interfaces Are the Entry Point; End-to-End SLO Is the Acceptance Bar

The technical route Ye described: stay compatible with mainstream ecosystems upstream — OpenAI API, vLLM — while optimizing performance downstream through Iluvatar's in-house execution and communication components: IxFormer, IXInfer, ixDNN, ixBLAS, and IXCCL.

Upstream compatibility lets applications keep the interfaces they know; downstream optimization targets the actual GPU's compute and communication characteristics. Both must land on metrics users can feel.

The talk focused on TTFT (time to first token), TPOT (time per output token) — especially their P99 — plus cluster throughput and effective token output. Beyond average speed, whether tail requests still meet the bar is part of service acceptance.

![From ecosystem compatibility and the in-house execution stack to end-to-end experience metrics (slide 3)](/images/blog/hami-meetup-shanghai-2026-iluvatar-gpu-inference/slide-03-ecosystem-to-slo-metrics.png)

Evaluating a domestic GPU inference solution therefore means tracing one application request all the way to final output. A fast operator proves local capability; a model that starts proves local capability; what users need is the whole service chain holding its SLO — its service level objective.

## Resource Placement, Request Routing, and Small-Model Sharing — Which Solves What

Idle GPUs in a cluster don't mean arbitrary combinations work. Once Prefill and Decode are placed separately, GPU–NIC connectivity, PCIe and NUMA topology, and cross-node paths all affect cache movement and overall latency.

The control plane in the talk organizes resource information, monitoring metrics, and topology discovery; ix-gpu-scheduler makes topology-aware placement decisions, used together with Volcano. The goal: pick suitable GPU and RDMA resources for inference instances and avoid needless cross-device, cross-node transfer.

![Topology-aware joint placement of GPU and RDMA (slide 7)](/images/blog/hami-meetup-shanghai-2026-iluvatar-gpu-inference/slide-07-gpu-rdma-topology-placement.png)

Once requests enter the service, llm-d's Proxy and EPP pick endpoints by combining KV Cache affinity and live load; model compute and in-pool parallel communication go to the Iluvatar execution stack and IXCCL.

Don't conflate the two scheduling layers. Resource placement decides which set of devices an instance deploys on; request routing decides which instance handles the current request. Even with sound routing, a poor underlying topology still taxes results through communication cost.

HAMi has a clear position in this practice. Ye explained that the team uses HAMi when small models need to share GPUs, and the architecture lists it as an on-demand branch. HAMi handles small-model resource sharing, llm-d handles endpoint selection and inference-phase coordination, and Iluvatar's execution stack and IXCCL handle compute and communication. When enterprises compose these capabilities by workload, they must validate sharing configuration, inference orchestration, and underlying execution separately.

![Control-plane division and the HAMi small-model sharing branch (slide 6)](/images/blog/hami-meetup-shanghai-2026-iluvatar-gpu-inference/slide-06-control-plane-hami-sharing.png)

## Is PD Disaggregation Worth It? Count the Added Costs In

Prefill is compute-heavy; Decode is more sensitive to memory bandwidth, KV capacity, and concurrent queues. Split into dedicated pools, the two phases can each get their own batching and resource configuration, reducing mutual interference.

But Ye stressed: different bottlenecks don't automatically mean disaggregation is faster. PD separation adds KV Cache transfer, extra routing, remote queueing, and failure-recovery costs. It pays off only when the gains cover the added overhead — and the SLO still holds.

The talk drew a clear boundary: short-prefix, low-concurrency, or congested-link scenarios should prefer co-location. For workloads that do suit disaggregation, there is no universal P/D instance ratio. In the Q&A, Ye described load-testing before launch to find the ratio, then adjusting for topology at deployment; online scale-out policy is still being explored.

![PD disaggregation: gains, added costs, and when to enable it (slide 11)](/images/blog/hami-meetup-shanghai-2026-iluvatar-gpu-inference/slide-11-pd-disaggregation-tradeoffs.png)

Cache affinity needs similar trade-offs. A high hit rate on one instance doesn't mean every request should keep going there. When queues run deep, endpoint selection must re-weight queue depth against cache hits. This was presented as a tuning approach, not a validated universal parameter set.

## Scale-Out Is Done When the First Qualifying Token Arrives

After devices are allocated, a new replica still goes through model loading, kernel and graph warmup, and routing readiness. A running container is not added business capacity.

The talk traced the chain from device allocation and topology binding all the way to the first SLO-compliant token. Half-loaded or half-recovered instances must not count toward available capacity — otherwise scale-out looks successful while requests still wait or fail.

![The readiness chain from device allocation to the first qualifying token (slide 8)](/images/blog/hami-meetup-shanghai-2026-iluvatar-gpu-inference/slide-08-device-allocation-to-first-token.png)

To shorten that path, Ye introduced directions under exploration at the time: ModelExpress, Snapshot, and KVCR — covering weight reuse, process and GPU state restoration, and KV Cache lifecycle management. These were presented as attempts or validation work, not delivered performance results.

![Ongoing explorations in weight, process-state, and KV Cache reuse (slide 12)](/images/blog/hami-meetup-shanghai-2026-iluvatar-gpu-inference/slide-12-reuse-explorations.png)

For enterprise platforms, keep two judgments separate at adoption time: whether a large model suits PD disaggregation — check the benefit-cost of compute, cache transfer, and queueing; and whether a small model suits GPU sharing — check post-sharing contention and service behavior. Around HAMi's enterprise application, Dynamia focuses on bringing share-friendly workloads into exactly this validation: stress-test with real inputs, concurrency, and hardware, watch first-token, sustained generation, and replica-ready times together, so that resource-efficiency gains survive scrutiny by business experience.

## Video and Slides

- **Bilibili replay:** [Keynote | High-Performance Inference Deployment on Iluvatar GPUs — Ye Chenglin](https://www.bilibili.com/video/BV1toYN6LEuc/)
- **Download slides:** [iluvatar-gpu-inference-deployment-yechenglin.pdf](https://github.com/Project-HAMi/community/blob/main/hami-meetup/04-shanghai-20260906/iluvatar-gpu-inference-deployment-yechenglin.pdf)

## Series

- [Overview: HAMi Meetup Shanghai Recap](/blog/hami-meetup-shanghai-2026/)
- [(1) Where Does HAMi Fit in the CNCF × PyTorch Cloud Native AI Foundation?](/blog/hami-meetup-shanghai-2026-cncf-pytorch-ai-foundation/)
- [(2) After GPU Sharing: How HAMi 2.10 Improves Isolation, Scheduling, and Observability](/blog/hami-meetup-shanghai-2026-hami-2-10-remote-gpu/)
- [(3) Inference Control vs. GPU Resource Management: How llm-d and HAMi Can Work Together](/blog/hami-meetup-shanghai-2026-llm-d-inference-plane/)
- **(4) Turning GPU Performance into Inference Service Capability: Lessons from Iluvatar** (this post)
- [(5) How iFLYTEK Manages Multi-Business GPU Sharing with Volcano + HAMi-core](/blog/hami-meetup-shanghai-2026-volcano-hami-core/)
- [(6) How UCloud Turns HAMi Sharing into Ready-to-Use Development Environments](/blog/hami-meetup-shanghai-2026-ucloud-ai-platform/)
- [(7) From User to Co-Builder: Why Enterprises Need a Sustainable HAMi Community](/blog/hami-meetup-shanghai-2026-community-panel/)
