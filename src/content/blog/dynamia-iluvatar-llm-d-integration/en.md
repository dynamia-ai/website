---
title: "Dynamia Expands Its GPU Ecosystem with Iluvatar CoreX llm-d Integration"
date: "2026-10-20"
excerpt: "Dynamia and Iluvatar CoreX have completed integration and end-to-end validation of disaggregated Prefill/Decode deployment for llm-d on products including Tiangai 300, covering model loading, distributed scheduling, and inference output, with the changes submitted upstream."
author: "Dynamia"
tags:
  - "llm-d"
  - "Iluvatar CoreX"
  - "Tiangai 300"
  - "Chinese GPU"
  - "Prefill/Decode Disaggregation"
  - "Distributed Inference"
  - "CNCF"
category: "Integration & Ecosystem"
coverDisplay: "text"
---

Deploying large language models on Chinese GPU platforms requires coordination between hardware, inference engines, and cluster management frameworks. Successful model loading, request distribution across inference instances, and data exchange between instances are concrete challenges in building distributed inference services.

To address these deployment requirements, **Dynamia and Iluvatar CoreX have completed integration and end-to-end validation of disaggregated Prefill/Decode deployment for llm-d on products including Tiangai 300**. The work covers the full process from model loading and distributed scheduling to inference output, with the integration changes submitted to the upstream llm-d community.

## Connecting the Deployment Workflow for Disaggregated Prefill/Decode Inference

llm-d is an open-source distributed inference framework built on Kubernetes and is a CNCF Sandbox project. It provides request routing, inference scheduling, and Prefill/Decode disaggregation around inference engines, helping platform teams organize multiple inference instances into a coordinated model-serving system.

Prefill/Decode disaggregation separates LLM inference into two stages: Prefill processes the input, while Decode generates the output incrementally. Deploying the stages separately allows their resources to be configured independently, but also requires request coordination and KV-cache transfer between instances. Supporting a new hardware platform means connecting these components with the inference engine and its underlying runtime.

The collaboration covered joint debugging and validation across this workflow, using Qwen3.8-27B and DeepSeek V4 Flash as examples to test model loading, distributed scheduling, and inference output. It brings Iluvatar CoreX hardware and software into the llm-d deployment workflow and establishes an integration foundation for distributed model services on Chinese GPUs.

## Joint Framework Implementation, Validation, and Upstream Integration

**Dynamia handled llm-d-side implementation, end-to-end validation, and ongoing communication with the upstream community.** The team worked on inference-instance deployment, routing configuration, and Prefill/Decode coordination, collaborating with upstream contributors to review and merge the changes into the main branch.

Iluvatar CoreX provided the hardware runtime environment, inference images, and full-stack software support, helping connect hardware drivers, communication libraries, and the inference framework. The two teams worked respectively on the framework and the hardware/software platform to validate the complete deployment workflow.

The code and configuration were merged into the main branch through [llm-d PR #2381](https://github.com/llm-d/llm-d/pull/2381). They include accelerator documentation, disaggregated Prefill/Decode deployment configurations, and maintainer information. Developers can review the implementation, refer to the deployment configurations, and follow ongoing maintenance.

## An Open, Neutral Approach to Ecosystem Collaboration

Inference frameworks, models, and hardware/software stacks continue to evolve, and integrations require maintenance as versions change. Both companies have assigned technical specialists to maintain this integration, follow community feedback, and support feature development and future iterations.

From the earlier collaboration with MetaX to this joint validation with Iluvatar CoreX, Dynamia continues connecting Chinese compute platforms with cloud-native inference frameworks. In line with the open and neutral positioning of Dynamia and HAMi, we will keep working with chip vendors, inference frameworks, and platform partners on integration, deployment validation, and long-term maintenance. This cooperation supports interoperability across hardware and software, giving enterprises more flexibility to choose and combine compute resources around their business needs.

For the integration changes and subsequent progress, see [the integration pull request](https://github.com/llm-d/llm-d/pull/2381). Framework information and deployment documentation are available in [the llm-d project repository](https://github.com/llm-d/llm-d).
