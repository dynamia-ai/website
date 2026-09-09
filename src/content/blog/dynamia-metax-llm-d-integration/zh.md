---
title: 密瓜智能携手沐曦率先完成 llm-d 适配，国产 GPU 首次进入 CNCF 分布式推理生态
linktitle: 密瓜智能 × 沐曦 llm-d 适配
date: '2026-09-09'
excerpt: >-
  密瓜智能与沐曦股份合作，率先完成曦云 C 系列 GPU 在 llm-d 社区的完整适配，实现单卡、多卡及 Prefill/Decode
  分离推理部署验证，这是 llm-d 官方支持的加速器名单中首次纳入国产 GPU。
author: Dynamia
tags:
  - llm-d
  - 沐曦
  - MetaX
  - 曦云 C 系列
  - 国产 GPU
  - 分布式推理
  - Prefill/Decode 分离
  - CNCF
  - vLLM
category: Integration & Ecosystem
language: zh
---

近日，密瓜智能（Dynamia）与沐曦股份合作，率先完成曦云 C 系列 GPU 在 [llm-d](https://github.com/llm-d/llm-d) 社区的完整适配，实现了基于曦云 C 系列 GPU 硬件环境下的单卡、多卡及 Prefill/Decode 分离推理部署验证。云原生分布式推理开源项目 llm-d 由此正式纳入沐曦曦云 C 系列 GPU 支持，这也是 llm-d 官方支持的加速器名单中首次纳入国产 GPU。

在本次 llm-d 适配中，密瓜智能承担了 llm-d 侧的功能实现、端到端验证及与上游社区的持续沟通协作；沐曦股份提供了完整的测试运行环境、vLLM-MetaX 推理镜像及 MXMACA 软件栈层面的技术支持。双方共同推动方案通过国际社区技术评审。在 llm-d 社区加速器维护者名单中，已同步登记了分别来自双方的两位维护者，后续将共同负责该路径的长期维护与迭代。

## 从可运行到可规模化服务

大模型从可运行到可规模化服务，算力芯片本身只是起点，芯片能否顺畅接入云原生推理调度体系才是决定落地效率的关键。此前，此类国际开源项目的默认配置多以国外芯片为假设前提，国产 GPU 即便已能运行主流推理引擎，用户若要复用社区成熟部署方案，仍需自行摸索大量隐性适配细节。

llm-d 是由 Red Hat 发起，构建在 vLLM、SGLang 等推理引擎与 Kubernetes 之上的云原生分布式推理框架，目前已交由 CNCF（Cloud Native Computing Foundation，Linux 旗下的云原生计算基金会）托管。项目聚焦大模型服务化落地中的前缀缓存感知路由、负载感知调度与 Prefill/Decode 分离等关键能力，将单服务器节点的推理引擎转换为多节点协同的"生产级分布式推理系统"。诞生至今，llm-d 已获得超过 4400 个 GitHub Star，英伟达 GPU、谷歌 TPU、AMD GPU、英特尔 XPU 等主流算力平台均已在该社区中形成各自的部署指南。

本次适配打通的正是这一环节，为曦云 C 系列 GPU 提供了三条开箱即用的部署路径。

## 三条开箱即用的部署路径

- **优化基线单卡路径：** 以 Qwen3-14B、张量并行 TP=1 为配置，验证曦云 C 系列在 llm-d 标准模型服务栈下的基础推理能力。
- **优化基线八卡路径：** 以 DeepSeek-R1-Distill-Llama-70B、张量并行 TP=8 为配置，验证单机八卡下的大参数量模型服务能力。
- **Prefill/Decode 分离路径：** 以 1 Prefill + 1 Decode 拓扑运行 Qwen3-14B，基于 vLLM NixlConnector 与 llm-d 路由 Sidecar 打通 KV 缓存跨实例传输链路。P/D 分离将推理过程中计算特征迥异的两个阶段拆分至不同实例分别优化，是当前提升大模型推理资源利用率的关键技术方向之一。该路径在实现上通过基于 NIXL 适配并优化的 MIXL 传输库，大幅提升传输效率，并降低用户落地门槛。

## 用实测数据建立性能基线

同时，团队在曦云 C 系列 GPU 上完成了 llm-d 推理路由器的实测性能标定：Qwen3-14B 单卡配置下测得峰值 Prefill 吞吐 5773 tokens/s，DeepSeek-R1-Distill-Llama-70B 八卡配置下测得 5468 tokens/s。两组数据已并入 llm-d 社区公开标定矩阵，国内用户在沐曦平台部署时可直接引用来自真实硬件的性能基线。

适配所需的 vLLM-MetaX 推理镜像已通过公开镜像仓库发布，用户可直接获取使用。

## 从联合适配走向长期维护

以此次合作为起点，密瓜智能将继续与沐曦股份共同维护和迭代曦云 C 系列 GPU 的 llm-d 适配路径，并通过与上游社区的持续协作，推动国产算力更深入地参与国际主流开源基础设施建设。密瓜智能也将携手更多芯片与生态伙伴，持续完善"国产芯片—云原生底座—产业落地"的技术链条，为人工智能技术在各行各业的规模化落地提供坚实支撑。

## 相关链接

- llm-d 项目主页：<https://github.com/llm-d/llm-d>
- 本次适配 PR：<https://github.com/llm-d/llm-d/pull/2308>
- 加速器支持说明：<https://github.com/llm-d/llm-d/blob/main/docs/getting-started/accelerators.md>
- P/D 分离部署指南：<https://github.com/llm-d/llm-d/blob/main/guides/pd-disaggregation/README.md>
