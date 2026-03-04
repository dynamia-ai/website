---
title: 'Dynamia AI x OpenCSG Strategic Partnership: From Model Hosting to Compute-Native, Building Enterprise-Grade Heterogeneous Compute Scheduling Foundation'
date: '2026-03-03'
excerpt: >-
  OpenCSG and Dynamia AI announce a strategic partnership to build a compute-native foundation
  for enterprise AI workloads. By natively integrating HAMi's heterogeneous GPU virtualization
  and scheduling capabilities into CSGHub, both parties will advance model platforms from "model hosting"
  to "compute-native."
author: Dynamia
tags:
  - OpenCSG
  - HAMi
  - Strategic Partnership
  - Compute-Native
  - Enterprise AI
category: Partnership
language: en
coverImage: /images/blog/opencsg-dynamia-partnership/f1.png
---

As large model applications enter the scale-up stage, enterprise requirements for model platforms are undergoing structural changes—from model asset management to model runtime and service capabilities.

When inference, fine-tuning, and Agent workloads truly run in production environments, a long-overlooked issue is gradually becoming a bottleneck:

**Compute scheduling and heterogeneous resource governance capabilities.**

GPU resource exclusive card allocation, fragmented inference tasks, fragmented heterogeneous chips, enterprise privatization and compliance requirements... These issues all point to a trend:

> Model platforms must possess "Compute-Native" capabilities to truly support enterprise-grade AI production systems.

Against this backdrop, OpenCSG and Dynamia AI announce a strategic partnership to jointly build a compute-native foundation for enterprise AI workloads.

![From Model Hosting to Compute-Native](/images/blog/opencsg-dynamia-partnership/f1.png)

## OpenCSG: From Model Community Platform to "Runtime Era"

OpenCSG's core product CSGHub has long focused on the management and distribution of models, datasets, code, and collaboration processes, serving as an important platform for model asset management.

However, as enterprise requirements upgrade, the center of gravity for model platform capabilities is shifting downward:

* Need to support online inference and concurrent multi-model execution
* Need to improve GPU utilization and reduce compute costs
* Need to support unified management of heterogeneous chip environments
* Need to meet private deployment and enterprise-grade compliance governance requirements

CSGHub is evolving from a "model hosting platform" to a "compute-native platform." This partnership marks an important step in this underlying capability upgrade.

## Dynamia AI × HAMi: Heterogeneous Compute Virtualization and Scheduling Provider

Dynamia AI focuses on the AI infrastructure field, leading the open-source project **HAMi** (CNCF Sandbox project), dedicated to solving virtualization and scheduling challenges in heterogeneous GPU environments.

HAMi's core capabilities include:

* **VRAM hard isolation + compute power proportional allocation**, supporting fine-grained vGPU slicing
* Unified scheduling support for 9+ heterogeneous chips including NVIDIA, Ascend, Cambricon, Maxxiri, Moore Threads, and more
* Native compatibility with Kubernetes ecosystem, supporting enterprise-grade production environment deployment

As of early 2026, HAMi has attracted 360+ developers from 16 countries to contribute, and has been adopted by 300+ enterprises across finance, logistics, autonomous driving, biotechnology, and other industries. Its goal is to build the standard GPU virtualization capability layer for the AI era.

## Partnership Content: Introducing "Compute-Native" Scheduling Layer into CSGHub

This partnership advances along three main threads: "platform native integration + enterprise deployment capabilities + community ecosystem co-building."

![CSGHub x HAMi Native Integration Architecture](/images/blog/opencsg-dynamia-partnership/f2.png)

### Native Integration: CSGHub × HAMi

CSGHub will integrate HAMi's heterogeneous GPU virtualization and scheduling capabilities, enabling the platform with:

* GPU sharing and elastic scheduling capabilities
* Unified management of heterogeneous chips
* Support for private deployment scenarios

This integration is not merely component docking, but achieving "compute-nativization" at the architectural level.

### Enterprise Capability Enhancement

In enterprise scenarios, compute capabilities must not only "be shareable," but also:

* Governable
* Observable
* Deliverable
* Scalably evolvable

Both parties will jointly explore collaboration paths in enterprise production environments, driving GPU scheduling capabilities to truly become platform built-in capabilities rather than plug-in modules.

### Open Source Ecosystem Synergy

As a CNCF Sandbox project, HAMi will continue evolving its heterogeneous compute capabilities; as a model community platform, CSGHub will provide real workload scenario feedback. This synergy mechanism will accelerate the optimization and maturation of compute scheduling capabilities in actual scenarios.

## Partnership Outcomes: Native, Unified, Privately Deployable Compute Capabilities

Unlike common "plug-in" solutions, this partnership emphasizes **Native Integration** of compute capabilities:

* **Unified deployment and lifecycle management**: Compute capabilities and platform components deploy collaboratively in the same Kubernetes cluster, reducing additional systems and operational overhead
* **Unified governance and observability**: Sharing platform-side permissions, policies, and observability systems, transforming compute from "uncontrollable consumption item" to "governable production factor"
* **Complete privatization and compliance-friendly**: Meeting data security and offline deployment requirements for government, finance, healthcare, and other sectors, supporting enterprises in building stable AI production foundations in their own environments

## Partnership Significance: Building an Open AI Infrastructure Ecosystem Together

![Open Collaboration, Ecosystem Co-Building](/images/blog/opencsg-dynamia-partnership/f3.png)

Against the backdrop of diversified domestic computing power and enhanced enterprise privatization requirements, heterogeneous GPU scheduling capability is becoming a key capability at the infrastructure layer.

The partnership between OpenCSG and Dynamia AI marks the deep integration of model platforms and compute foundations. Both parties will continue advancing AI infrastructure from "resource assembly" to "compute-native" around:

* Unified heterogeneous compute scheduling
* Enterprise-grade privatization capabilities
* Production-grade governance and observability systems
* Open source ecosystem collaborative evolution

## Perspectives from Both Parties

**Chen Ran (Founder and CEO of OpenCSG):**

> "CSGHub's goal is not only to make models easier to manage, but also to make models easier to run and deploy at scale. Compute scheduling capability is the necessary path for platforms to become enterprise production systems. Our collaboration with Dynamia AI's HAMi will help us sink compute capabilities to the platform foundation, serving enterprise deployment in a more open and privatizable manner."

**Zhang Xiao (Founder and CEO of Dynamia AI):**

> "When model platforms enter the production stage, compute power is no longer about 'just buying cards,' but must be infrastructure capability that is finely governed. HAMi hopes to become the key piece for heterogeneous compute management and virtualization on Kubernetes, and our partnership with OpenCSG will deliver this capability to more enterprise users in a platform-native manner."

## Next Steps

* Advance the release of deeply integrated CSGHub × HAMi version
* Validate compute-native architecture capabilities in real enterprise scenarios
* Jointly participate in open source ecosystems and industry conferences to promote standardized capability development

## Get Started Today

### CSGHub Trial Application

* Official website: https://opencsg.com/
* Open source repository: https://github.com/OpenCSGs/csghub
* Official documentation: https://opencsg.com/docs

### HAMi Open Source Project

* Official website: https://project-hami.io
* Open source repository: https://github.com/project-hami/hami
* Official documentation: https://project-hami.io

## About OpenCSG

OpenCSG is a globally leading open-source large model community platform, dedicated to building an open, collaborative, and sustainable ecosystem. Its core product CSGHub provides one-stop hosting, collaboration, and sharing services for models, datasets, code, and AI applications, possessing industry-leading model asset management capabilities and supporting multi-role collaboration and efficient reuse.

## About Dynamia AI

Dynamia AI focuses on GPU virtualization and heterogeneous compute scheduling, improving compute utilization in AI scenarios. The company initiated and leads the CNCF open-source project HAMi, the industry's only open-source project achieving flexible, on-demand, elastic, and reliable GPU virtualization, supporting mainstream AI chip ecosystems.

## Contact Information

OpenCSG Business Cooperation: <business@opencsg.com>
Dynamia AI Partnership Inquiry: <info@dynamia.ai>
