---
title: "Dynamia Partners with Biren Technology to Advance BR166M GPU Adaptation for llm-d"
date: "2026-11-11"
excerpt: "Completing a distributed inference deployment path for Chinese compute"
author: "Dynamia"
category: "Integration & Ecosystem"
coverDisplay: "text"
tags:
  - llm-d
  - Biren Technology
  - BR166M
  - Distributed Inference
  - Prefill/Decode Disaggregation
---

Dynamia recently partnered with Biren Technology to contribute a Biren™ 166M (BR166M) adaptation to the open-source distributed inference project llm-d, covering both standard inference and Prefill/Decode (PD) disaggregated deployment configurations. The collaboration focuses on inference instance deployment, request coordination, and cross-node cache transfer—connecting Biren general-purpose GPUs with cloud-native inference frameworks and providing a deployment reference for enterprises building distributed model serving on Chinese compute.

This work is one practice in Dynamia’s ongoing multi-hardware adaptation for llm-d. By jointly adapting with chip vendors and contributing deployment configs and documentation upstream, Dynamia continues to help more hardware platforms join open inference infrastructure.

## Adapting Standard Inference and PD Disaggregation

When enterprises deploy large models as continuously running services, the inference engine, request routing, and cluster resources need to work together. Facing different chips’ software stacks and communication conditions, platform teams also need to define how inference instances start, how requests are handed off, and how computation-produced cache moves between nodes.

[llm-d](https://github.com/llm-d/llm-d) is a Kubernetes-based open-source distributed inference project that provides request routing and distributed service orchestration on top of inference engines such as vLLM. PD disaggregation deploys the Prefill phase (processing input) and the Decode phase (generating output step by step) separately, so platforms can configure resources independently for each load type.

This contribution provides both standard inference and PD disaggregation configs for the BR166M GPU. The PD path targets the INT8 quantized version of Qwen2.5-72B in a “1 Prefill + 1 Decode” layout: the two instances run on different nodes, each using four BR166M GPUs with tensor parallelism (TP=4), for eight GPUs in total.

Along this path, the Prefill instance handles input computation and produces the KV cache used for subsequent output; the Decode instance receives the cache and continues generation. The setup reuses llm-d’s routing sidecar for request coordination and transfers KV cache via vLLM NixlConnector, so the two nodes handle input processing and output generation respectively.

Cross-node communication uses InfiniBand RDMA through UCX, with a CPU buffer for KV data transfer. These configs document the communication path used in the current adaptation and provide a basis for later performance validation and optimization around target models, concurrency, and network environments.

## Bringing Adaptation Work into Community Collaboration

This collaboration connects Biren BR166M GPUs, the BIRENSUPA™ software stack, and the adapted vLLM inference environment with llm-d’s deployment flow. Dynamia contributed on the llm-d side—team members submitted changes covering inference image configuration, deployment parameters, accelerator documentation, and a PD disaggregation deployment guide.

For platform teams planning to adopt Biren general-purpose GPUs, this material offers a concrete starting point: what runtime is required, how to organize inference instances, and how to transfer cache are all documented in configs and guides. Moving the adaptation into upstream collaboration also lets hardware vendors, framework maintainers, and users iterate on the same implementation with shared feedback.

The changes were submitted as [llm-d PR #2505](https://github.com/llm-d/llm-d/pull/2505), with maintainer information for the adaptation path added in the PR. The PR has since been merged by the community.

## Expanding Compute Choices Through Open Neutrality

Around llm-d, Dynamia will continue expanding adaptation partnerships with more chip vendors and helping different hardware platforms join the open-source distributed inference ecosystem. Connecting each platform’s runtime, deployment configs, and communication paths to existing community workflows gives enterprises more concrete implementation references when evaluating compute options, and a foundation for software and hardware partners to maintain and optimize together.

Dynamia remains technically neutral and works openly with chip vendors, open-source communities, and platform partners around real enterprise deployment needs. Going forward, Dynamia will keep advancing joint adaptation, deployment validation, and upstream contribution with upstream and downstream partners, follow compatibility and maintenance needs as versions evolve, and help more compute platforms work with mainstream open-source infrastructure—so enterprises can choose compute based on business needs and actual adaptation conditions.

Full adaptation configs and further progress are available in [this adaptation PR](https://github.com/llm-d/llm-d/pull/2505).
