---
title: "Dynamia at KubeCon EU 2026: From Booth Talks to Main Stage Demo — HAMi Enters the Core of AI Infrastructure"
linktitle: "HAMi Recap at KubeCon EU 2026"
date: '2026-03-31'
excerpt: >-
  KubeCon EU 2026 has concluded, and one signal was unmistakable: cloud native is rapidly evolving
  from an application platform into the foundational layer for AI infrastructure. As the initiator and
  core driver of the HAMi project, Dynamia made a landmark appearance — from Maintainer Summit and
  Lightning Talks to the KubeCon main stage Keynote Demo.
author: Dynamia
tags:
  - KubeCon
  - HAMi
  - GPU Virtualization
  - AI Infrastructure
  - Cloud Native
category: Events
language: en
coverImage: /images/blog/kubecon-eu-2026-hami-recap/keynote-live-demo.jpg
---

The recently concluded **KubeCon + CloudNativeCon Europe 2026** sent an increasingly clear signal across the industry:

**Cloud native is rapidly evolving from an "application runtime platform" into the foundational layer for AI infrastructure.**

In Amsterdam, discussions around Kubernetes, GPUs, inference serving, Agentic AI, and heterogeneous compute scheduling have moved beyond concepts and into concrete engineering practice, community collaboration, and infrastructure paradigm shifts.

![Mengxuan Li and Reza Jelveh during the KubeCon Keynote Live Demo (13,000+ attendees on-site)](/images/blog/kubecon-eu-2026-hami-recap/keynote-live-demo.jpg)

![KubeCon Keynote stage](/images/blog/kubecon-eu-2026-hami-recap/keynote-stage.jpg)

As the **initiator and core driver of the HAMi project**, **Dynamia** participated deeply in these developments alongside global developers, open source maintainers, the CNCF community, and industry partners.

From the Maintainer Summit and Lightning Talks to the Project Pavilion, and ultimately taking the stage for the **KubeCon Main Stage Keynote Demo**, HAMi delivered a landmark showcase at this year's conference.

## Kubernetes Is Entering the AI Infra Phase

If Kubernetes previously focused on:

* Container orchestration
* Microservices governance
* Cloud native application delivery

Then at this KubeCon, the questions generating the most interest were:

* How can AI workloads run more efficiently on Kubernetes?
* How can GPUs be shared, partitioned, scheduled, and isolated?
* How can LLM serving and underlying resource management work together?
* How can heterogeneous compute be unified within the cloud native scheduling framework?

Behind these questions lies a more fundamental shift:

> **Kubernetes is moving from "orchestrating applications" to "orchestrating compute."**

This is exactly where HAMi operates.

## Starting at the Maintainer Summit: HAMi Enters Core Community Discussions

At the pre-conference **Maintainer Summit**, Dynamia Co-founder and CTO **Mengxuan Li** shared HAMi's insights on AI workloads.

![Dynamia CTO Mengxuan Li sharing HAMi Insight on AI Workloads at the Maintainer Summit](/images/blog/kubecon-eu-2026-hami-recap/cto-maintainer-summit.png)

The team then participated in CNCF closed-door meetings, engaging in deep discussions with CNCF TOC Chair Karena Angell, Red Hat, and vLLM community members Brian Stevens and Robert Shaw.

![Dynamia team discussing GPU Sharing with CNCF TOC, Red Hat, and the vLLM community](/images/blog/kubecon-eu-2026-hami-recap/cncf-toc-redhat-vllm.png)

This discussion was particularly representative, as it didn't stay at "how to implement features for a single project" — it addressed a much larger question:

> **When LLM serving, GPU resource management, and Kubernetes converge in real production environments, what new abstractions does the infrastructure layer need?**

During the exchange, the direction HAMi is pushing drew noticeable attention. There's a growing recognition that GPUs can no longer be treated as simple devices — they're becoming an infrastructure resource layer that can be scheduled, shared, and governed.

This is why the synergy between HAMi and projects like vLLM is becoming increasingly natural.

During this event, both parties began exploring joint content collaboration and technical exchanges, signaling that the AI Infra ecosystem is accelerating from "standalone projects" to "composable collaboration."

Additionally, HAMi is currently in the CNCF incubation application process and participated as a representative project in the TAG workshop discussions.

![TAG Workshop discussing CNCF project governance](/images/blog/kubecon-eu-2026-hami-recap/tag-workshop.jpg)

## Two Technical Talks: From Community Issues to Engineering Solutions

During the main conference, the Dynamia team delivered two important presentations centered on HAMi.

### Xiao Zhang: K8s Issue #52757 — Sharing GPUs Among Multiple Containers

This issue (#52757) isn't new — it's a "long-unresolved problem" that has existed in the Kubernetes community for years.

With the explosion of AI workloads, this problem has been magnified:

* Inference services require finer-grained GPU usage
* Multi-tenant environments demand resource sharing
* AI workload patterns make GPU exclusive allocation unsuitable

This is why a seemingly low-level problem has become one of the core challenges in AI infrastructure.

![Xiao Zhang presenting HAMi at the KubeCon Cloud Native AI forum](/images/blog/kubecon-eu-2026-hami-recap/zhangxiao-gpu-sharing.png)

**Xiao Zhang**, Dynamia CEO, approached this from a classic long-standing issue in the Kubernetes community:

**How can multiple containers share a GPU?**

While the question seems specific, it actually points to a common challenge facing the entire AI infrastructure ecosystem. Once you enter inference, batch processing, online serving, and multi-tenant mixed scenarios, GPUs can no longer be simply allocated on an exclusive whole-card basis.

The significance of this talk lies in placing the problem HAMi solves back into the original context of the Kubernetes community:

Not building an isolated solution from scratch, but responding to a long-standing, not-yet-fully-resolved upstream problem.

### Mengxuan Li: Dynamic, Smart, Stable GPU-Sharing Middleware in Kubernetes

**Mengxuan Li**, Dynamia CTO, focused on HAMi's core architecture and capabilities, systematically introducing:

* GPU virtualization
* GPU sharing and scheduling mechanisms
* Stability and production readiness design
* The approach to AI workload resource management in Kubernetes

![Mengxuan Li presenting HAMi at KubeCon](/images/blog/kubecon-eu-2026-hami-recap/limengxuan-hami-talk.png)

This wasn't just a feature introduction — it was answering a more practical question:

> **With Kubernetes not yet natively solving GPU sharing, how can enterprises actually run AI workloads — and run them more stably and efficiently?**

## Project Pavilion: Bringing Technical Discussions to Face-to-Face Global Exchange

Beyond the formal sessions, HAMi also maintained a booth at KubeCon EU 2026's **Project Pavilion**.

![A steady stream of visitors at the HAMi booth](/images/blog/kubecon-eu-2026-hami-recap/booth-crowd.jpg)

Over several days, the booth became a hub for intensive exchanges. Visitors included:

* Overseas developers and contributors
* Enterprise users and platform teams
* University and research institution staff
* Cloud providers and GPU ecosystem professionals
* Community members interested in AI infra, heterogeneous compute, and Kubernetes GPU scheduling

We also connected with more community contributors on-site.

![Indian contributors Rudraksh Karpe (center) and Shivay Lamba (right)](/images/blog/kubecon-eu-2026-hami-recap/indian-contributors.png)

During the Poster Session, community contributors created a schematic of "Kubernetes as the universal GPU control plane."

![Kubernetes as the universal GPU control plane](/images/blog/kubecon-eu-2026-hami-recap/k8s-gpu-control-plane.jpg)

The value of these exchanges goes beyond "increasing visibility" — it helped the team directly validate something:

> **GPU scheduling, resource sharing, and heterogeneous compute management have become genuine global needs, not niche problems in specific markets.**

Many on-site discussions centered on the same core themes:

* How to improve GPU utilization
* How to reduce fragmentation
* How to support more complex AI workloads
* How to make Kubernetes a more natural host for AI infra

For HAMi, this means it's no longer just an "interesting open source project" — it's gradually entering the mainstream of global AI infrastructure discussions.

## Keynote Demo: HAMi Takes the KubeCon Main Stage

![KubeCon Keynote co-hosted by Linux Foundation CEO Jonathan and CNCF CTO Chris](/images/blog/kubecon-eu-2026-hami-recap/keynote-hosts.png)

If the talks and booth represented "recognition within professional circles," the most iconic moment at this KubeCon was undoubtedly:

> **HAMi became the first China-originated open source project to present on the KubeCon EU 2026 main stage Keynote, completing a live Demo.**

This was the most critical — and most worthy of emphasis — part of the conference.

During the main stage session, **Mengxuan Li and Reza Jelveh** (Head of Global Market & Solution Engineer) delivered a live demo showcasing HAMi's Kubernetes-based multi-workload GPU scheduling.

![Mengxuan Li and Reza during the live demo](/images/blog/kubecon-eu-2026-hami-recap/limengxuan-reza-demo.jpg)

The demo used two typical AI workloads: a YOLO inference service and a Qwen3-8B large model inference task. Under the traditional Kubernetes scheduling model, these tasks would typically require exclusive GPU allocation. Under HAMi's scheduling model, GPUs are decomposed into "compute + memory" resource units that can be shared on-demand by multiple Pods.

In the live demonstration, multiple YOLO instances were scheduled to run on the same GPU, while the Qwen3-8B model was co-located with other workloads on a single GPU through binpack strategy. Different types of AI workloads coexisted on the same GPU while maintaining resource isolation and schedulability.

What this demo presented wasn't merely improved GPU utilization — more importantly, it demonstrated a new infrastructure capability: GPUs transitioning from "devices" to "schedulable resources," with Kubernetes gaining the foundational ability to manage AI workloads.

This wasn't a regular booth demo or a breakout session talk — it was on a main stage watched by thousands, bringing HAMi into broader global visibility.

The significance of this moment has at least three layers:

### First: AI Infrastructure Has Entered KubeCon's Main Narrative

In the past, KubeCon main stage sessions focused primarily on Kubernetes itself, foundational platform capabilities, ecosystem collaboration, and typical use cases.

This time, a GPU resource management project like HAMi entering the main stage demo signals:

**How AI workloads run on Kubernetes has become a question the cloud native community must answer head-on.**

### Second: GPU Scheduling Is No Longer a "Niche Topic"

Issues like GPU sharing, virtualization, resource isolation, and heterogeneous scheduling were previously confined to specialized circles.

Now, they've evolved from "domain-specific problems" to "common infrastructure challenges." In TOC discussions and community exchanges, multiple projects (including vLLM-related practices) have begun to directly depend on underlying GPU scheduling capabilities. These issues are no longer confined to individual SIGs — they're entering broader ecosystem discussions.

HAMi being showcased on the main stage means this direction is gaining wider visibility.

### Third: This Is the Result of HAMi Community and Dynamia's Joint Accumulation

An open source project reaching the KubeCon main stage doesn't happen just because "there's a feature to demo."

Behind it must be:

* Technical alignment with industry trends
* Community value being recognized
* The project's position in the ecosystem becoming clearer

This keynote demo was not just a showcase — it was a positioning confirmation:

> **HAMi is evolving from a GPU sharing tool into a critical component of the AI compute resource layer on Kubernetes.**

### AI Native Summit

Additionally, following KubeCon, the co-located **AI Native Summit** was held.

Compared to the main KubeCon venue, the AI Native Summit discussions focused more directly on one question:

**AI workload runtime efficiency is becoming the new infrastructure bottleneck.**

In this context, GPU virtualization and scheduling are no longer internal Kubernetes optimizations — they're key factors directly impacting model serving costs, response times, and system throughput.

Reza presented "HAMi: Heterogeneous GPU Virtualization and Scheduling for AI-Native Infrastructure on Kubernetes."

![Reza presenting HAMi at the AI Native Summit](/images/blog/kubecon-eu-2026-hami-recap/reza-ai-native-summit.png)

Reza also represented Dynamia in a panel discussion titled "AI Native Technology."

![Reza participating in the AI Native Technology panel discussion](/images/blog/kubecon-eu-2026-hami-recap/reza-panel-discussion.png)

This AI Native Summit brought together technical experts from cloud native, AI infrastructure, and the telecom industry for in-depth discussions on the evolution of AI-native architectures. The conference focused on how infrastructure is evolving from traditional service-oriented, request-response models to a new generation of platforms designed for inference, conversational AI, and autonomous decision-making — covering AI gateways, inference scheduling, multi-model routing, and multi-tenant isolation, reflecting the industry's ongoing shift from cloud native to AI native.

## A Noteworthy Detail: HAMi Has Entered the Broader Cloud Native Context

Beyond the live demos and presentations, there was another important external signal from this conference:

During the main stage presentations, HAMi was mentioned as a **representative case in the expanded Cloud Native Landscape**.

![HAMi highlighted as an expanded Cloud Native Landscape project during the Keynote](/images/blog/kubecon-eu-2026-hami-recap/landscape-mention.jpg)

This indicates that HAMi's significance extends beyond "a project doing GPU scheduling" — within the broader cloud native evolution, it's being recognized as representative of a new generation of infrastructure challenges.

In other words, the cloud native community is realizing:

* The existing resource model built around CPU / memory / network / storage isn't enough
* The AI era demands new resource abstractions
* GPUs, inference, heterogeneous devices, and workload governance are becoming critical next-stage infrastructure topics

And HAMi, at this inflection point, provides a clear, pragmatic, and implementable engineering path.

## From Project to Ecosystem: What Did We Really Gain?

Looking back at this KubeCon, Dynamia's takeaways go beyond "delivering talks, setting up a booth, and completing a demo."

More importantly, the team clearly felt:

### 1. Global Community Focus on AI Infra Is Rapidly Intensifying

People are no longer satisfied with discussing models and applications themselves — they're asking:

* How does it run at the infrastructure level?
* How are resources scheduled?
* How do we improve efficiency?
* How do we maintain stability?

### 2. The Kubernetes-AI Convergence Is Entering Deep Waters

The question is no longer "can it run?" but:

* Can it run efficiently?
* Can it run at scale?
* Can it run stably in production?

### 3. HAMi's Positioning Is Becoming Increasingly Clear

HAMi is no longer just "a project doing GPU sharing" — it's gradually establishing its unique positioning:

> **The GPU resource layer and heterogeneous compute scheduling capability for Kubernetes.**

This is why Dynamia continues to invest in HAMi community building and productization capabilities. We believe that the key to future AI infrastructure competition isn't just model capability — it's also whether underlying compute resources can be organized more efficiently, flexibly, and systematically.

## Closing: In the AI Era, the Infrastructure Story Has Just Begun

KubeCon EU 2026 has strengthened our conviction:

**Cloud native won't be replaced by AI — it will be redefined by AI.**

From booth exchanges, to technical talks, to the main stage demo, HAMi's appearance at this conference wasn't just a conference record — it was a signal:

> **Cloud native infrastructure around GPUs, inference, and heterogeneous compute is entering a new phase.**

**Dynamia** will continue working with the HAMi community, global developers, and ecosystem partners to push Kubernetes to better support AI workloads, enabling compute resources to be more efficiently organized, scheduled, and unleashed.

![The Dynamia team with community members outside the KubeCon venue](/images/blog/kubecon-eu-2026-hami-recap/team-photo.jpg)

Amsterdam has concluded, but the next phase of AI infrastructure is just beginning. If you're equally passionate about AI infrastructure, GPU virtualization, and the evolution of Kubernetes in the AI era, we invite you to join Dynamia as we drive the next steps in this field.
