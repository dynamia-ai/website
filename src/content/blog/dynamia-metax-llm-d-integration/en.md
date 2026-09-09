---
title: 'Dynamia and MetaX Complete llm-d Integration: The First Chinese GPU in CNCF''s Distributed Inference Ecosystem'
linktitle: Dynamia × MetaX llm-d Integration
date: '2026-09-09'
excerpt: >-
  Dynamia has partnered with MetaX to complete full adaptation of MetaX C-series GPUs for the llm-d
  community, validating single-GPU, multi-GPU, and Prefill/Decode disaggregated inference
  deployments — the first Chinese GPU ever added to llm-d's officially supported accelerator list.
author: Dynamia
tags:
  - llm-d
  - MetaX
  - Chinese GPU
  - Distributed Inference
  - Prefill/Decode Disaggregation
  - CNCF
  - vLLM
  - Kubernetes
category: Integration & Ecosystem
language: en
---

Dynamia recently partnered with MetaX to complete the full adaptation of MetaX C-series GPUs for the [llm-d](https://github.com/llm-d/llm-d) community, validating single-GPU, multi-GPU, and Prefill/Decode disaggregated inference deployments on C-series hardware. With this work, the cloud-native distributed inference project llm-d now officially supports MetaX C-series GPUs — the first Chinese GPU ever added to llm-d's officially supported accelerator list.

In this effort, Dynamia owned the llm-d-side feature implementation, end-to-end validation, and ongoing engagement with the upstream community, while MetaX provided the complete test environment, the vLLM-MetaX inference image, and technical support at the MXMACA software-stack level. Together, the two teams carried the proposal through the international community's technical review. The llm-d accelerator maintainer list now registers two maintainers — one from each company — who will jointly own the long-term maintenance and evolution of this integration path.

## From Runnable to Production-Grade

Getting a large model to run is only the starting point; delivering it as a scalable service is what determines real-world efficiency, and that hinges on whether the chip integrates smoothly with a cloud-native inference scheduling stack. Historically, default configurations in international open-source projects of this kind assumed foreign silicon. Even when a Chinese GPU could already run mainstream inference engines, users who wanted to reuse the community's mature deployment recipes still had to work through countless hidden adaptation details on their own.

llm-d is a cloud-native distributed inference framework initiated by Red Hat, built on top of inference engines such as vLLM and SGLang and on Kubernetes, and now hosted by the CNCF (Cloud Native Computing Foundation). The project focuses on the capabilities that matter for production LLM serving — prefix-cache-aware routing, load-aware scheduling, and Prefill/Decode disaggregation — turning single-node inference engines into multi-node, coordinated, production-grade distributed inference systems. Since its inception, llm-d has earned more than 4,400 GitHub stars, and major compute platforms including NVIDIA GPUs, Google TPUs, AMD GPUs, and Intel XPUs have each established deployment guides in the community.

This adaptation closes exactly that gap for the MetaX C-series, providing three out-of-the-box deployment paths.

## Three Out-of-the-Box Deployment Paths

- **Optimized baseline, single GPU:** Qwen3-14B with tensor parallelism TP=1, validating the C-series' basic inference capability on the standard llm-d model-serving stack.
- **Optimized baseline, eight GPUs:** DeepSeek-R1-Distill-Llama-70B with tensor parallelism TP=8, validating large-model serving on a single eight-GPU node.
- **Prefill/Decode disaggregation:** Qwen3-14B on a 1-Prefill + 1-Decode topology, using the vLLM NixlConnector together with the llm-d routing sidecar to enable cross-instance KV-cache transfer. P/D disaggregation splits the two computationally distinct phases of inference onto separate instances optimized independently — one of the key techniques for raising LLM inference resource utilization today. This path is built on MIXL, a transport library adapted from and optimized for NIXL, which substantially improves transfer efficiency and lowers the adoption barrier for users.

## Establishing a Performance Baseline with Real Measurements

The team also completed measured performance calibration of the llm-d inference router on C-series GPUs: peak prefill throughput of 5,773 tokens/s for the single-GPU Qwen3-14B configuration, and 5,468 tokens/s for the eight-GPU DeepSeek-R1-Distill-Llama-70B configuration. Both results have been contributed to the llm-d community's public benchmark matrix, so users deploying on the MetaX platform can cite a performance baseline drawn from real hardware.

The vLLM-MetaX inference image required for the adaptation has been published to a public image registry and is available for direct use.

## From Joint Adaptation to Long-Term Stewardship

This collaboration marks a starting point. Dynamia will continue to maintain and iterate the llm-d integration path for MetaX C-series GPUs together with MetaX, and — through sustained upstream collaboration — help Chinese compute silicon participate more deeply in the world's mainstream open-source infrastructure. Dynamia will also partner with more chip and ecosystem players to keep strengthening the full chain from domestic silicon to cloud-native foundation to industry deployment, providing solid support for scaling AI across industries.

## Related Links

- llm-d project: <https://github.com/llm-d/llm-d>
- Adaptation PR: <https://github.com/llm-d/llm-d/pull/2308>
- Accelerator support docs: <https://github.com/llm-d/llm-d/blob/main/docs/getting-started/accelerators.md>
- P/D disaggregation guide: <https://github.com/llm-d/llm-d/blob/main/guides/pd-disaggregation/README.md>
