---
title: "Dynamia Shares vLLM Cluster Optimization Practices to Help Compute Better Support Enterprise AI"
date: "2026-11-11"
excerpt: "At the 10th CSDI Summit, Dynamia co-founder and CTO Mengxuan Li shared vLLM inference cluster optimization practices—covering how request routing, cache management, and GPU sharing work together to balance inference experience, utilization, and cost."
author: "Dynamia"
category: "Events"
coverDisplay: "text"
tags:
  - "CSDI"
  - "vLLM"
  - "llm-d"
  - "HAMi"
  - "Distributed Inference"
---

From October 16–18, 2026, the **10th CSDI China Software R&D Intelligent Innovation Technology Summit & Agentic AI Empowering Digital R&D Practice Summit**, hosted by Bailinzhe, was held at the Sheraton Grand China Hotel in Shenzhen. Under the theme **“Digital Intelligence + Intelligent Management,”** the summit focused on Agentic AI and enterprise R&D practice. Dynamia co-founder and CTO Mengxuan Li served as producer for the “Clusters and Compute under Agentic AI” track and delivered a talk titled *Improving Enterprise Compute Utilization and Making Better Use of GPUs—vLLM Inference Cluster Optimization*.

![vLLM inference cluster optimization talk venue](/images/blog/csdi-2026-vllm-inference-optimization/image-01.jpg)

Topics at this year’s summit spanned enterprise AI platforms, agent products, R&D engineering, and distributed infrastructure. The “Clusters and Compute under Agentic AI” track brought together vLLM inference cluster optimization, heterogeneous compute scheduling for AI workloads, and building AI infrastructure on heterogeneous compute—linking inference serving with underlying resource management and giving enterprises a multi-layer view of how compute supports Agentic AI applications.

![Mengxuan Li speaking at the CSDI track](/images/blog/csdi-2026-vllm-inference-optimization/image-02.jpg)

![CSDI track audience and presentation screen](/images/blog/csdi-2026-vllm-inference-optimization/image-03.jpg)

## Optimizing Inference Clusters Around Experience and Cost

On stage, Mengxuan Li centered the talk on one question: how can enterprises organize existing GPUs into inference services that are stable in experience and well utilized? Starting from experience metrics such as time to first token (TTFT) and time per output token (TPOT), the talk connected inference optimization to token cost and explained how inference frameworks, caching, routing, and scheduling relate.

Following vLLM’s evolution from process to cluster workload to service, the talk mapped the problems that appear at each stage. Single-node runs help teams validate model inference quickly; once workloads move into a cluster, the stateful nature of inference and cache locality call for finer deployment and request placement. With llm-d, cache-aware request routing, KV cache management, and Prefill/Decode (PD) disaggregation let platforms organize resources around the needs of different compute phases and better coordinate request handling with inference execution.

On that foundation, the talk discussed the role of GPU virtualization. Even with an optimized inference architecture, giving each instance a full GPU can still leave utilization headroom for some models and loads. The slides showed an architecture combining HAMi for GPU slicing and sharing so resource allocation can better match what inference instances actually need.

That path mirrors ongoing trade-offs in enterprise production: **watch response speed and generation smoothness, and also judge whether resources are used effectively.** Architecture choices should advance step by step with model size, request patterns, and service goals, and be validated under real load for the balance among latency, throughput, and utilization. Considering these metrics together helps inference optimization serve cost control and stable operation.

![vLLM and Kubernetes diagram](/images/blog/csdi-2026-vllm-inference-optimization/image-04.png)

## Coordinating Request Routing and Compute Management

In the combined architecture presented, llm-d handles upper-layer request routing and coordination among inference instances, while HAMi provides GPU slicing, sharing, and scheduling underneath. The two optimize from the request and resource sides respectively, connecting inference demand with underlying compute supply.

This reflects a concrete direction for Dynamia’s work on open-source infrastructure: through HAMi engineering practice, make compute more flexibly support upper-layer workloads so enterprises can further manage and use existing GPUs while running inference engines. Inference engines, service orchestration, and resource scheduling each have their roles; how they work together is something enterprises need to consider together when building AI infrastructure.

Starting from this CSDI discussion, sustained Agentic AI operation needs inference frameworks, caching and transport, request routing, resource scheduling, and heterogeneous hardware working together. Going forward, Dynamia will keep advancing engineering collaboration with the open-source community and ecosystem partners around its positioning as “an open-source kernel for AI infrastructure,” making heterogeneous compute easier to use through open source and providing a firmer foundation for enterprise AI in production.

![10th CSDI Summit poster](/images/blog/csdi-2026-vllm-inference-optimization/image-05.jpg)
