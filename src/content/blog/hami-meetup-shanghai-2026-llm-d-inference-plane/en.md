---
title: 'HAMi Meetup Shanghai Deep Dive (3): Inference Control vs. GPU Resource Management — How llm-d and HAMi Can Work Together'
linktitle: 'llm-d and HAMi: Dividing the Work'
date: '2026-09-22'
excerpt: >-
  You deployed multiple replicas of the same model and round-robined requests, yet responses didn't
  get faster. Red Hat Greater China CTO Zhang Jiaju presented llm-d's distributed inference plane at HAMi
  Meetup Shanghai: how prefix-aware routing, PD disaggregation, and cache offloading cooperate — and, in the Q&A,
  the collaboration direction with HAMi. Request routing and GPU slicing are two layers that must connect, yet cannot replace each other.
author: Dynamia
tags:
  - HAMi
  - HAMi Meetup
  - llm-d
  - Distributed Inference
  - KV Cache
  - PD Disaggregation
  - vLLM
category: Community & Events
language: en
coverImage: /images/blog/hami-meetup-shanghai-2026-llm-d-inference-plane/slide-05-routing-inference-pool.png
---

You deployed multiple replicas of the same model, spread requests evenly across them, and responses didn't necessarily get faster. Whether multi-turn conversations can reuse cache, whether instances are already queue-saturated — these determine how long users wait for an answer. For enterprise AI platforms, how requests are routed and how GPU resources are allocated are two layers of work that must connect, yet cannot substitute for each other.

This is the third deep-dive in our [HAMi Meetup Shanghai](/blog/hami-meetup-shanghai-2026/) series. **Zhang Jiaju**, Red Hat Greater China CTO, presented "llm-d: Building a Distributed Inference Plane Across Workloads, Modalities, Hardware, and Platforms," offering a concrete architecture for understanding this division. He explained how llm-d coordinates routing, caching, and the different inference phases, and addressed the collaboration direction with HAMi in the Q&A. This post sorts it out from a platform-building perspective: which problems the inference control plane solves, and which still require resource management.

## Key Takeaways

- llm-d picks endpoints by combining cache location and instance load, avoiding cache-hit-chasing that ignores queueing.
- PD disaggregation and cache offloading must be evaluated together with network, storage, and transfer overhead.
- HAMi and Red Hat discussed resource-layer collaboration during the talk; P/D-phase compute partitioning still needs validation per deployment.

**Speaker:** Zhang Jiaju | Red Hat Greater China CTO

## Same Request Count, Very Different Processing Cost

Traditional stateless services round-robin requests, but LLM requests differ sharply from each other. Different input lengths mean different processing cost; multi-turn conversations repeatedly carry history context and produce large reusable prefixes.

llm-d folds these differences into endpoint selection. Requests pass through a Proxy; the EPP (Endpoint Picker) chooses based on metrics reported by inference instances; requests then flow to the corresponding model service. An InferencePool organizes the set of endpoints that can accept requests into a scheduling scope, while the underlying inference engine does the actual compute.

![llm-d's routing, inference pool, and model service division (slide 5)](/images/blog/hami-meetup-shanghai-2026-llm-d-inference-plane/slide-05-routing-inference-pool.png)

Prefix-aware routing considers where KV Cache already lives and sends matching requests to instances that can reuse it, avoiding repeated prefill compute. But cache hits aren't the only goal. If requests keep funneling to one instance, queuing can cancel out the compute saved.

Endpoint selection therefore combines cache affinity, live load, and instance saturation. Zhang also described latency prediction based on historical request sampling. When enterprises evaluate such policies, they must watch cache reuse and response latency together — a high hit rate alone is not a finished optimization.

![Prefix-awareness and load-awareness in endpoint selection (slide 11)](/images/blog/hami-meetup-shanghai-2026-llm-d-inference-plane/slide-11-prefix-load-aware-picking.png)

## After PD Disaggregation: Where Does the Cache Go?

One LLM inference call contains a Prefill phase and a Decode phase. Prefill processes input and is compute-heavy; Decode generates tokens step by step and leans on memory bandwidth. Placing the two phases separately lets each get better-fitted resources.

Once separated, new coordination problems appear. Which instances take Prefill, which take Decode? How does the KV Cache produced in the first phase reach the second? These roles, endpoints, and transfer paths must be organized together with the inference engine and cache components.

![Request routing and KV Cache transfer in PD disaggregation (slide 14)](/images/blog/hami-meetup-shanghai-2026-llm-d-inference-plane/slide-14-pd-disaggregation-kv-transfer.png)

Cache management can't stare only at GPU memory either. Memory is finite; once a cache is evicted, later requests may need to recompute. The talk covered paths for offloading KV Cache to host memory and further to storage, and directions for cooperating with components like LMCache and Mooncake.

There is no hardware-independent optimum here. Reading local storage, transferring cache from another node, or recomputing the prefix — costs shift with network and storage conditions. Caching more does not automatically mean faster inference; transfer overhead belongs in the request's full processing cost.

## The Control Plane Coordinates; the Inference Engine Executes

For an enterprise platform, the boundary between control plane and inference engine must be drawn first. In the llm-d architecture Zhang presented, routing, endpoint selection, cache coordination, and elasticity live in the control plane, while actual model execution stays with inference engines like vLLM. Adopting llm-d solves the cluster-level inference coordination problem; it does not replace the model execution stack.

This division also lets enterprises compose capabilities by problem. Multi-tenant scenarios need priority differentiation — online interaction and batch jobs have different latency requirements; multi-model serving needs to decide which model a request belongs to; cross-node MoE inference must be aware of expert-parallelism groups. These are cluster-level coordination problems that faster single instances cannot solve alone.

Load diversity also shows up in agent multi-turn interaction, multimodal workloads, and batch jobs. Zhang listed them as distinct serving scenarios, with batch processing handled via lower-priority asynchronous execution sharing the cluster with online requests. Cross-hardware support depends on the inference engine, device adaptation, and deployment paths — a unified control plane doesn't let accelerators skip compatibility verification. The talk went into these scenarios at different depths; actual availability should be confirmed per version and environment.

Elastic scaling also needs to understand inference-serving state. After a new replica gets its devices, it still has to load the model and prepare. The talk covered Workload Autoscaling and vLLM Sleep/Wake Up directions aimed at shortening time-to-service. When platforms evaluate scale-out, they should check when new instances can actually accept requests — not merely whether the Pod was created.

Inference also appears in the rollout phase of reinforcement learning, generating large volumes of samples. Training teams may keep using Slurm, Ray, or bare metal; adopting routing shouldn't force the whole platform into Kubernetes. The EndpointDiscovery mechanism Zhang described records and updates service endpoints via files, giving non-Kubernetes environments access to cache-aware and load-aware routing. What's extended here is where inference coordination can be used — llm-d does not replace training frameworks.

These directions correspond to different versions and deployment conditions. Enterprises should validate feature combinations and maturity against their own scenarios; a roadmap is not a statement that everything already works on your cluster.

## After Routing Requests Well, Match Resources to Load

When an enterprise evaluates llm-d and HAMi together, a concrete question arises: how do request scheduling and GPU slicing cooperate, and can PD disaggregation run on virtual GPUs? Zhang answered this directly in the Q&A.

He stated that HAMi and Red Hat are pushing forward a collaboration, planning to bring parts of HAMi into llm-d scenarios; he used the division of GPU compute between Prefill and Decode phases as an example of the further direction. In platform terms: llm-d coordinates inference requests and roles, while HAMi provides resource sharing and heterogeneous device management. Enterprises need to decide, separately, which instance a request should go to, and what devices and how much resource that instance should get.

What was discussed is a collaboration direction as of the talk — not a finished, general-purpose deployment. Specific hardware, models, and slicing configurations still need verification; it cannot be inferred that any virtual GPU can carry PD disaggregation. Hardware used in overseas best practices may also differ from domestic clusters; parameters need retesting in your own environment.

The enterprise-adoption question Dynamia cares about is bringing resource configuration and inference-service requirements into one validation process. To evaluate llm-d + HAMi cooperation, run the same business workload set, check resource allocation, request queuing, cache reuse, and communication overhead separately, then see whether overall response meets target. That is how you distinguish resource shortage from poor request scheduling — and know which layer to optimize next.

## Video and Slides

- **Bilibili replay:** [Keynote | llm-d: Building a Distributed Inference Plane Across Workloads, Modalities, Hardware, and Platforms — Zhang Jiaju](https://www.bilibili.com/video/BV14ZYN6yEg5/)
- **Download slides:** [llm-d-distributed-inference-plane-zhangjiaju.pdf](https://github.com/Project-HAMi/community/blob/main/hami-meetup/04-shanghai-20260906/llm-d-distributed-inference-plane-zhangjiaju.pdf)

## Series

- [Overview: HAMi Meetup Shanghai Recap](/blog/hami-meetup-shanghai-2026/)
- [(1) Where Does HAMi Fit in the CNCF × PyTorch Cloud Native AI Foundation?](/blog/hami-meetup-shanghai-2026-cncf-pytorch-ai-foundation/)
- [(2) After GPU Sharing: How HAMi 2.10 Improves Isolation, Scheduling, and Observability](/blog/hami-meetup-shanghai-2026-hami-2-10-remote-gpu/)
- **(3) Inference Control vs. GPU Resource Management: How llm-d and HAMi Can Work Together** (this post)
- [(4) Turning GPU Performance into Inference Service Capability: Lessons from Iluvatar](/blog/hami-meetup-shanghai-2026-iluvatar-gpu-inference/)
- [(5) How iFLYTEK Manages Multi-Business GPU Sharing with Volcano + HAMi-core](/blog/hami-meetup-shanghai-2026-volcano-hami-core/)
- [(6) How UCloud Turns HAMi Sharing into Ready-to-Use Development Environments](/blog/hami-meetup-shanghai-2026-ucloud-ai-platform/)
- [(7) From User to Co-Builder: Why Enterprises Need a Sustainable HAMi Community](/blog/hami-meetup-shanghai-2026-community-panel/)
