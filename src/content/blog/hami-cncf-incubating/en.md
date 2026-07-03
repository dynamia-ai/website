---
title: "HAMi Becomes a CNCF Incubating Project: Building Heterogeneous Compute Infrastructure for the AI Era Together with Developers Worldwide"
linktitle: "HAMi Becomes a CNCF Incubating Project"
date: '2026-07-03'
excerpt: >-
  On July 2, 2026, HAMi officially graduated to a CNCF Incubating project. Following its
  acceptance as a Sandbox project in August 2024, this milestone marks HAMi's growth from a
  promising newcomer into trusted infrastructure widely adopted in real production environments.
author: HAMi Community
tags:
  - HAMi
  - CNCF
  - GPU Virtualization
  - AI Infrastructure
  - Cloud Native
category: Open Source
language: en
coverImage: /images/blog/hami-cncf-incubating/cncf-incubating-badge.png
---

![HAMi becomes a CNCF Incubating project](/images/blog/hami-cncf-incubating/cncf-incubating-badge.png)

On July 2, 2026, HAMi officially graduated to a **CNCF Incubating** project, with the CNCF Technical Oversight Committee (TOC) passing [the incubation vote](https://github.com/cncf/toc/issues/1775) unanimously.

![CNCF TOC incubation vote passed unanimously](/images/blog/hami-cncf-incubating/toc-vote-en.png)

This is another major milestone for HAMi since joining the CNCF as a Sandbox project in August 2024. In the CNCF maturity model, Sandbox is a "proving ground" for early-stage exploratory projects, while Incubating requires projects to be rigorously validated across **technical maturity, security practices, community governance, production adoption, and ecosystem integration**. Reaching the incubation stage means HAMi has grown from "a project with potential" into "trusted infrastructure widely adopted in real production environments."

We sincerely thank CNCF TOC Chair [Karena Angell](https://www.linkedin.com/feed/update/urn:li:activity:7478594903292399616/), who led the due diligence, TOC member Kevin Wang, TAG-Runtime for completing the technical review, and all the adopters who provided feedback.

## What Is HAMi

HAMi stands for **H**eterogeneous **A**I Computing **Mi**ddleware, an open-source heterogeneous compute virtualization and scheduling middleware for Kubernetes. The core problem it solves is simple: **can multiple tasks safely share a single GPU without interfering with each other?**

Before HAMi, Kubernetes scheduled GPUs using a coarse-grained "one Pod per card" model. Expensive accelerators were often left idle because a single task monopolized them, keeping GPU utilization chronically low. HAMi uses container-level hard isolation to finely partition a GPU's memory and compute across different workloads, making it possible for multiple tenants and tasks to share the same accelerator, with **zero changes to existing workloads**: install HAMi, and your tasks automatically gain sharing and isolation capabilities.

The project was founded by [Zhang Xiao](https://github.com/wawa0210) and [Li Mengxuan](https://github.com/archlitchi), open-sourced for the first time on **July 12, 2021**, and has grown, under the CNCF's open governance framework, into a project built by developers worldwide.

## Production Adoption and Ecosystem

The strongest proof of HAMi's value comes from real production data. Today, HAMi is adopted by hundreds of organizations, covering more than ten accelerator types including NVIDIA, Huawei Ascend, Cambricon, Hygon DCU, Moore Threads, Enflame, Kunlunxin, MetaX, AWS Neuron, and Vastai (see the [supported devices list](https://project-hami.io/docs/userguide/device-supported)), making it one of the open-source solutions with the broadest hardware coverage in the cloud-native GPU virtualization space.

In the [CNCF case studies](https://project-hami.io/case-studies), you can read about landing practices from a set of representative users spanning finance, automotive, mobility, logistics, education, and cloud services:

- **China Merchants Bank**: unified Kunlunxin, Ascend, NVIDIA, and other accelerators onto a single scheduling platform, reaching a hardware pooling rate of **100%**, reducing cross-node scheduling probability by **30%**, and contributing topology-aware scheduling enhancements back to the community.
- **SNOW Corp.** (NAVER, South Korea): orchestrated 1000+ A100s with HAMi to serve 200M+ global users, halving the GPU count under 700% traffic peaks, saving an estimated **USD 17.4 million**, and reducing MTTR by 91%.
- **NIO**: for autonomous driving workloads, improved CI pipeline GPU utilization by roughly **10x** and reduced simulation GPU time by about 30%.
- **KE Holdings (Beike)**: boosted platform GPU utilization by roughly **3x** (from 13% to 37%).
- **DaoCloud**: after vGPU adoption, average GPU utilization exceeded **80%**, with GPU operating costs down about 50%.
- **SF Technology**: built a heterogeneous virtualization pool, saving up to **57%** of GPUs across production and test clusters.
- **PREP EDU**: optimized **90%** of its GPU infrastructure with HAMi.

On the scheduling ecosystem side, HAMi-core has been integrated with the Kubernetes default scheduler, [Volcano](https://github.com/volcano-sh/volcano/blob/master/docs/user-guide/how_to_use_gpu_sharing.md), [Kueue](https://github.com/kubernetes-sigs/kueue), [Koordinator](https://koordinator.sh/docs/user-manuals/device-scheduling-gpu-share-with-hami), and the [NVIDIA KAI Scheduler](https://project-hami.io/blog/hami-core-adopted-by-nvidia-kai-scheduler). Notably, in June 2026, the NVIDIA KAI Scheduler officially adopted HAMi-core as its built-in GPU memory hard-isolation capability, a strong endorsement of HAMi's technical direction.

## Chinese Open-Source Power on the Global Stage

Over the past two years, the two core maintainers of HAMi have spoken at KubeCon + CloudNativeCon, KubeDay, and related technology summits in Japan, Hong Kong, France, London, the Netherlands, and beyond, exchanging ideas with developers, user enterprises, and ecosystem partners on GPU sharing, heterogeneous compute scheduling, AI workload governance, and Kubernetes accelerator management. They have also stayed active in domestic open-source and AI infra communities, appearing at COSCon, the GDPS Global Developer Pioneer Conference, the vLLM Inference Optimization Meetup (Shanghai), the Ant Group Open Source Tech Salon, and HAMi Meetups in Shanghai and Beijing.

![Zhang Xiao at KubeDay Japan 2024](/images/blog/hami-cncf-incubating/zhangxiao-kubeday-japan-2024.jpg)

Zhang Xiao at KubeDay Japan 2024

![Zhang Xiao and Li Mengxuan at KubeCon Hong Kong 2024](/images/blog/hami-cncf-incubating/zhangxiao-limengxuan-kubecon-hk-2024.jpg)

Zhang Xiao and Li Mengxuan at KubeCon Hong Kong 2024

![Zhang Xiao and Li Mengxuan at KubeCon London 2025](/images/blog/hami-cncf-incubating/zhangxiao-limengxuan-kubecon-london-2025.jpg)

Zhang Xiao and Li Mengxuan at KubeCon London 2025

![Zhang Xiao and Li Mengxuan at KubeCon France 2025](/images/blog/hami-cncf-incubating/zhangxiao-limengxuan-kubecon-france-2025.jpg)

Zhang Xiao and Li Mengxuan at KubeCon France 2025

![Li Mengxuan with the CNCF CTO at KubeCon Hong Kong 2025](/images/blog/hami-cncf-incubating/limengxuan-kubecon-hk-2025-cncf-cto.png)

Li Mengxuan with the CNCF CTO at KubeCon Hong Kong 2025

In 2026, this long-term accumulation reached a highlight moment. At KubeCon + CloudNativeCon Europe 2026 (Amsterdam), HAMi took the main-stage Keynote. Li Mengxuan and community partner Reza Jelveh ran a YOLO inference service and a Qwen3-8B large model inference concurrently on a single GPU, decomposing the GPU into shareable "compute + memory" units; Zhang Xiao gave a dedicated talk around K8s issue #52757 (how multiple containers can share a single GPU), and Li Mengxuan delivered another technical session on "a dynamic, intelligent, and stable GPU sharing middleware." HAMi also became one of the Chinese open-source projects to grace the KubeCon EU main-stage Keynote.

![Li Mengxuan and Reza Jelveh at the KubeCon EU Keynote Live Demo (13000+ attendees on site)](/images/blog/hami-cncf-incubating/kubecon-eu-keynote-live-demo.png)

![The HAMi core maintainer team exchanging GPU sharing insights with the CNCF TOC, Red Hat, and the vLLM community](/images/blog/hami-cncf-incubating/kubecon-india-2026-team.jpg)

Just two months later, at [KubeCon + CloudNativeCon India 2026](https://project-hami.io/blog/kubecon-india-2026-recap) (Mumbai), HAMi appeared in the Keynote demo once again and ran production-grade large model services with dynamic GPU sharing at the Project Pavilion booth.

![HAMi community contributors at the KubeCon India Project Pavilion booth](/images/blog/hami-cncf-incubating/kubecon-india-2026-pavilion.png)

## Thank You to the Community That Walked With Us

HAMi's journey to this point is by no means the credit of any single person or company. This milestone would not have been possible without the co-building of contributors and communities worldwide: [Dynamia](https://www.dynamia.ai/), [DaoCloud](https://www.daocloud.io/), [4Paradigm](https://www.4paradigm.com/), [NVIDIA](https://www.nvidia.com/), [Huawei Cloud](https://www.huawei.com/), as well as individual developers, user enterprises, and ecosystem partners from around the world. All have made irreplaceable contributions.

We are especially grateful to every contributor who submitted code, filed issues, wrote documentation, organized Meetups, presented at KubeCon booths, and answered questions in community channels. The vitality of an open-source project ultimately comes from people.

## Join the HAMi Community

Entering the incubation stage is a new starting point for the HAMi community. Whether you are a developer, an operations engineer, an AI infrastructure lead, or someone evaluating heterogeneous compute solutions, you are welcome to join us:

- **Follow the HAMi official account** to get version releases, technical deep dives, and community event updates as soon as they happen.
- **Join the HAMi WeChat group** to exchange usage experience, troubleshooting tips, and best practices directly with maintainers and users across industries. See the [community page](https://project-hami.io/community) for how to join.
- **Take part in community meetings and in-person Meetups.** The HAMi community regularly hosts open tech talks and city Meetups, having held many in-person events in Beijing, Shanghai, Shenzhen, and other cities over the past year. As we enter the incubation stage, we will bring even more **online sessions and offline gatherings**:

  - July 16, vLLM Shanghai
  - [July 17 to 20, WAIC](https://www.worldaic.com.cn)
  - [July 28 to 30, KubeCon Japan](https://events.linuxfoundation.org/kubecon-cloudnativecon-japan/program/schedule/)
  - [September 7 to 9, KubeCon China](https://www.lfopensource.cn/kubecon-cloudnativecon-openinfra-summit-pytorch-conference-china/program/schedule/)

  No matter where you are, there is a way to take part.

- **Contribute code or report issues on [GitHub](https://github.com/Project-HAMi/HAMi)**: from documentation and tests to core features, every contribution counts.

If you are running HAMi in production, we also welcome you to share your practical experience with the community. Your real-world cases are a valuable asset that helps HAMi keep evolving and helps more teams avoid detours.

We look forward to walking the next leg of HAMi's journey with you.
