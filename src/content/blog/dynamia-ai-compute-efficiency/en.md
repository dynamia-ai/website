---
title: "HAMi Becomes a CNCF Incubating Project: Dynamia Stakes Its Position on the Critical Track of AI Compute Efficiency"
linktitle: "Dynamia Stakes Its Position on AI Compute Efficiency"
date: '2026-07-07'
excerpt: >-
  On July 2, 2026, HAMi, the open-source project founded and long led by Dynamia, officially became
  a CNCF Incubating project. As the only open-source project today focused on heterogeneous GPU
  virtualization and efficient scheduling that has reached the CNCF Incubating stage, HAMi's milestone
  sends a clear signal: the AI infrastructure race is shifting from "who has more compute" to
  "who can manage compute more efficiently."
author: Dynamia
tags:
  - HAMi
  - CNCF
  - GPU Virtualization
  - AI Infrastructure
  - Cloud Native
  - Dynamia
category: Company News
language: en
coverImage: /images/blog/dynamia-ai-compute-efficiency/cncf-incubating-status.png
---

On July 2, 2026, HAMi, the open-source project initiated and long driven by Dynamia, officially graduated to a CNCF Incubating project. As the only open-source project in the industry today focused on heterogeneous GPU resource virtualization and efficient scheduling that has reached the CNCF Incubating stage, HAMi's milestone sends a clear signal: the AI infrastructure race is shifting from "who has more compute" to "who can manage compute more efficiently."

![HAMi becomes a CNCF Incubating project](/images/blog/dynamia-ai-compute-efficiency/cncf-incubating-status.png)

Over the past two years, enterprises have poured more and more investment into AI, and GPUs have become one of the most expensive—and scarcest—production resources. But once they enter real production environments, many enterprises discover that the problem is not simply a shortage of GPUs; it is that the GPUs they already own are hard to fully utilize.

A single task monopolizes an entire card. A single team holds onto a batch of resources for the long term. Training, inference, and testing jobs queue against one another. Different AI accelerator resources sit scattered across separate systems. It looks like a lot of compute was purchased, yet the share that can actually be used efficiently falls short.

It is a bit like a city's road system. Building more roads matters, but without traffic lights, lane management, and rules of the road, more roads only make management more complex. AI compute is no different. As resources grow more expensive and scenarios more complex, what enterprises truly need is a layer of infrastructure that can manage, schedule, and make good use of GPUs and diverse AI accelerators.

That is exactly the problem HAMi set out to solve.

## 1. Starting From the Problem

HAMi's origins trace back to 2021.

On July 12, 2021, Xiao Zhang and Mengxuan Li open-sourced the project's earliest version. At the time, Zhang was at DaoCloud and Li was at 4Paradigm; though at different companies, they were already collaborating around the same open-source effort. They had an early conviction that the key to future AI infrastructure would not be merely providing more compute, but enabling compute to be used more efficiently—and continuing to evolve within a more open ecosystem.

As the AI Infra industry grew rapidly, the direction HAMi represented began shifting from an engineering problem into an industry opportunity. Zhang and Li realized that heterogeneous compute management needed an open, neutral open-source core that could collaborate deeply with upstream and downstream ecosystems—not one locked into a single vendor or scenario. On that conviction, they later co-founded Dynamia, aiming to use HAMi as a starting point to build an open-source core for AI infrastructure and make heterogeneous compute easier to use through openness.

Since its founding, Dynamia has drawn attention and support from capital and industry resources, with backers including Lu Qi, Fosun Capital, Zhuopu Investment, and DaoCloud. From day one, the company has focused on GPU virtualization and heterogeneous compute scheduling, carrying HAMi's open-source capabilities into real enterprise scenarios and turning them into infrastructure that enterprises can deploy, operate, and sustain over time.

## 2. Reaching the Global Ecosystem

Whether an open-source infrastructure project truly matters is judged not only by its code, but by whether it is validated jointly by the global community, enterprise users, and the broader industry ecosystem.

Over the past few years, HAMi has shown up consistently at the center of the global cloud native ecosystem. From KubeCon and KubeDay in France, Japan, Hong Kong, London, and the Netherlands, to numerous cloud native, open-source, and AI infrastructure conferences in China, HAMi's core initiators and maintainers have kept the conversation going around GPU virtualization, heterogeneous compute scheduling, and the productionization of AI infrastructure.

![Xiao Zhang and Mengxuan Li at KubeCon London 2025](/images/blog/dynamia-ai-compute-efficiency/kubecon-london-2025.jpg)

![Xiao Zhang and Mengxuan Li at KubeCon France 2024](/images/blog/dynamia-ai-compute-efficiency/kubecon-france-2024.jpg)

![Mengxuan Li with the CNCF CTO at KubeCon Hong Kong 2025](/images/blog/dynamia-ai-compute-efficiency/kubecon-hongkong-2025.png)

In 2026, these years of accumulated effort reached a landmark moment. At KubeCon + CloudNativeCon Europe 2026 in Amsterdam, HAMi took the main-stage Keynote to demonstrate the practical value of GPU sharing and scheduling on Kubernetes to the global cloud native community. For an open-source project that originated in China and is built for a global community, this was more than a technical showcase—it signaled that the AI compute scheduling direction HAMi represents has entered the core field of vision of the international cloud native ecosystem.

![Mengxuan Li and Reza Jelveh in the KubeCon EU Keynote Live Demo](/images/blog/dynamia-ai-compute-efficiency/kubecon-eu-keynote-demo.png)

This also makes HAMi the only Chinese open-source project in recent years to reach the KubeCon EU main-stage Keynote. The attention it has earned reflects an increasingly clear industry shift: as AI moves from experiment to production, the GPU is no longer just a piece of hardware—it is becoming an infrastructure resource that must be unified, flexibly scheduled, and continuously optimized.

Today, HAMi has gathered more than 500 contributors from 17 countries, with over 300 enterprise end users spanning cloud providers, internet, finance, automotive, logistics, and education, and has expanded into overseas regions such as Southeast Asia and Europe.

These strides show that HAMi is no longer just a project within a technical community—it is infrastructure capability being continuously validated across real industry scenarios and the global open-source ecosystem.

## 3. Entering the Production Floor

For enterprise customers, HAMi's value can be summed up in one line: turning expensive GPU resources from "occupied" into "scheduled."

In scenarios like large-model training, inference services, and multi-team shared resource pools, what platform teams care about most is rarely any single technical spec—it is a set of more practical questions: Can GPU utilization be raised? Can different teams share resources fairly? Can queuing be reduced during traffic peaks? Can diverse AI accelerators be managed uniformly? Can the solution plug into the existing cloud native environment?

These questions are being answered in real production environments. HAMi has entered finance, automotive, consumer tech, logistics, edtech, and cloud services, applied to raising GPU utilization, pooling heterogeneous compute, scheduling large-model inference traffic, training and simulating autonomous driving, and governing resources on enterprise AI platforms.

In finance, China Merchants Bank brought diverse AI accelerators—Kunlunxin, Ascend, and NVIDIA—into a single scheduling platform, improving resource pooling and topology-aware scheduling. In consumer tech, SNOW Corp. uses HAMi to orchestrate 1,000+ A100 GPUs, powering GenAI services for more than 200 million users worldwide and absorbing 700% traffic spikes. In autonomous driving, NIO uses HAMi to lift GPU utilization on CI pipelines and cut simulation GPU hours.

Beyond these, cases such as Beike, DaoCloud, SF Technology, and PREP EDU show HAMi helping enterprises of different kinds raise GPU utilization, lower operating costs, and improve resource efficiency across test and production clusters.

These cases show that the competition in enterprise AI infrastructure has entered the resource-governance phase. As models, applications, and business traffic keep growing, platform teams need more than additional resources—they need a compute governance capability that can support multiple teams, clusters, chip types, and workloads.

This is also where Dynamia keeps investing around HAMi. Rather than offering only open-source code, the company focuses on the complete chain within enterprise production environments: deployment, adaptation, stability, operational support, ecosystem compatibility, and alignment with existing Kubernetes systems and AI engineering platforms.

HAMi is the foundational project in the open community; Dynamia is one of the core forces building on top of it, continually driving productization, enterprise-readiness, and scaled adoption. What Dynamia set out to do is turn GPU sharing, heterogeneous scheduling, and resource isolation into infrastructure capability that enterprises can adopt, deliver, and evolve sustainably.

## 4. Looking Ahead

HAMi's graduation to CNCF Incubating is, without doubt, the start of a larger market phase.

As AI applications move from pilot to production, enterprises will place ever more weight on compute efficiency, resource governance, and multi-chip ecosystem compatibility. In the past, enterprises were willing to pay to "acquire compute"; in the future, they will be increasingly willing to pay to "use compute well."

That is exactly the window of opportunity Dynamia occupies.

The AI era needs not only stronger models but also more efficient infrastructure. HAMi's graduation proves that GPU virtualization and heterogeneous compute scheduling are no longer a fringe concern—they are entering the mainstream, recognized by the global cloud native ecosystem.

Going forward, Dynamia will continue working alongside the HAMi community, ecosystem partners, and enterprise customers to bring this capability into more production scenarios, enabling enterprises to manage the AI era's most critical production resource in a more open, flexible, and sustainable way.

From an early conviction in 2021 to entering CNCF Incubating in 2026, HAMi's growth proves one thing: the infrastructure that truly matters often appears not when a concept is hottest, but when it is continually needed, validated, and adopted amid real problems.

What Dynamia set out to do is keep deepening that path.

## Related Links

- HAMi official site: [https://project-hami.io](https://project-hami.io/)
- HAMi community: [https://project-hami.io/community](https://project-hami.io/community)
- CNCF HAMi project page: [https://www.cncf.io/projects/hami/](https://www.cncf.io/projects/hami/)
- CNCF HAMi case studies: [https://www.cncf.io/case-studies/?\_sft\_lf-project=hami](https://www.cncf.io/case-studies/?_sft_lf-project=hami)
- CNCF TOC Incubation vote: [https://github.com/cncf/toc/issues/1775](https://github.com/cncf/toc/issues/1775)
- HAMi GitHub: [https://github.com/Project-HAMi/HAMi](https://github.com/Project-HAMi/HAMi)
