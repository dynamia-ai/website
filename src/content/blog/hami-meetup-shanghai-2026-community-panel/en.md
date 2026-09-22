---
title: 'HAMi Meetup Shanghai Deep Dive (7): From User to Co-Builder — Why Enterprises Need a Sustainable HAMi Community'
linktitle: 'Community Panel: From User to Co-Builder'
date: '2026-09-22'
excerpt: >-
  Once open source enters production, enterprise attention extends beyond the code: will issues get
  answers, how do needs reach the public roadmap? The HAMi Meetup Shanghai panel covered real-world usage,
  contribution barriers, responsibility boundaries in AI-assisted development, and knowledge preservation —
  a second set of selection criteria beyond technology fit.
author: Dynamia
tags:
  - HAMi
  - HAMi Meetup
  - Open Source Community
  - CNCF
  - AI Coding
  - Open Source Contribution
category: Community & Events
language: en
coverImage: /images/blog/hami-meetup-shanghai-2026/image8.png
---

Once a company runs open source software in production, its concerns gradually extend past the code. Will issues get a response? How do new requirements enter the public roadmap? Can the adaptation and tuning a team invests in be maintained together with the community over the long term? These questions directly shape enterprise confidence in adopting open source infrastructure.

This is the seventh and final deep-dive in our [HAMi Meetup Shanghai](/blog/hami-meetup-shanghai-2026/) series, covering the community panel "Setting Off Again from Incubating: How Does HAMi Move Toward a More Open, More Sustainable Community?" They are also the questions HAMi must keep answering after entering CNCF Incubating. On stage: **Li Mengxuan**, co-founder and CTO of Dynamia and HAMi Maintainer; **Wang Jifei**, R&D engineer at Dynamia and HAMi Approver; **Hou Yuxi** of Transwarp's AI tool platform R&D; and **James**, R&D engineer at 4Paradigm and HAMi Approver. For enterprise platform teams, the conversation offers a second set of judgment criteria beyond technical selection.

## Key Takeaways

- Enterprises adopt HAMi for GPU sharing and heterogeneous adaptation; long-term maintenance quality also shapes selection.
- Clear contribution paths, timely feedback, and reusable design knowledge help users become co-builders.
- AI can assist coding and review; requirement judgment, code understanding, and real-environment validation remain the contributor's responsibility.

## Choosing Open Source Is Also Choosing How to Maintain It Together

James noted that his team's attention to HAMi started from a direct usage need. Different users and internal teams all needed GPUs, and scenarios like testing didn't necessarily require a whole card — sharing capability became a major selection factor.

Hou Yuxi's story involved choosing between an in-house solution and a community one. The team already had GPU management components; evaluating a new solution meant weighing existing investment against the coverage of domestic compute adaptation and the capacity to keep adding features. They chose HAMi for heterogeneous hardware adaptation and for the sustained evolution that multi-party contribution brings.

The entry point that attracts enterprises may be putting test jobs on shared GPUs, or cutting duplicated adaptation work for heterogeneous devices. After sustained adoption, enterprises must also judge whether these capabilities can be maintained long-term and whether problems can enter public discussion. The community value Dynamia cares about lives exactly there: bringing the common needs each company faces into a jointly maintained project, so no single team carries all adaptation and evolution alone.

## Start from the First Issue — and Catch What's Valuable

How does a newcomer join HAMi? The panelists' paths were concrete.

Wang Jifei suggested reading the contribution guidelines first, then finding a real need among existing issues. Understanding the environment where a problem occurs, discussing it with the reporting user and maintainers, and only then deciding the implementation reduces duplicate work and keeps contributions close to actual usage.

James added that HAMi's contribution entry points aren't limited to scheduler code. Whether docs are clear, whether usage steps match actual behavior — those are worth reporting too. Developers comfortable with C++ or CUDA can look at HAMi-core, or join other components per their background. Finding problems, adding reproduction details, fixing docs — all move the project forward.

The community also has to lower the barrier proactively. Hou Yuxi recalled a high-value issue about a low-level concurrency-lock optimization that went without adequate response for a long time; the reporter, daunted by cross-repo process and short on contribution experience, never submitted the PR. His view: giving timely feedback on a newcomer's first issue and first contribution helps valuable participation continue.

For enterprise teams joining HAMi, clear reproduction steps, environment info, and diagnosis process are effective inputs for improvement. For maintainers, promptly confirming issues, explaining design boundaries, and guiding contribution paths matter just as much. Whether the community catches the first attempt influences whether the next high-quality contribution ever arrives.

## AI Can Help Write Code; the Submitter Still Owns the Requirements and the Design

AI coding got the most airtime in this discussion. As code output accelerates, review pressure grows with it. The panelists' focus: how to confirm a change is actually necessary, and whether the submitter understands what they're submitting.

Wang Jifei described the community's contribution-guideline adjustments at the time — disclosing AI involvement in PRs, and having contributors personally respond to review discussion. In his reviews he probes further: what scenario does the requirement come from, why this implementation, should a switch targeting a special case be on by default?

James stressed that developers are responsible for the code they submit. AI-assisted review can help find problems, but it cannot replace the submitter's understanding of the implementation logic. Wang Jifei added from his own practice that end-to-end validation in a real environment helps verify whether a feature works as intended.

For enterprise infrastructure teams, these discussions map to a clear requirement: review must check not only code but requirement basis, behavior changes, and validation results. Especially for changes touching defaults and compatibility, the impact can extend well beyond the single scenario that prompted them.

## For the Next Phase: Understand the Knowledge and the Real Workloads First

On whether HAMi needs dedicated MCP tooling, the panelists weighted things differently.

Wang Jifei's view: in his experience using AI for troubleshooting, the hard part is more often judging where the problem might be — adding tools doesn't directly fix that. Hou Yuxi would rather accumulate design decisions and implementation context, giving AI more context when analyzing logs and code. James, from a new-user perspective, saw convenient log and runtime-state collection with initial analysis as a way to lower the troubleshooting barrier — the form doesn't have to be MCP.

The discussion reached no unified tooling conclusion, but surfaced a direction worth continued validation: helping users understand the system requires both accessible runtime information and knowledge explaining why the system is designed the way it is.

On HAMi's role amid the LLM trend, no one reduced the future to a single workload. Wang Jifei mentioned large/small model collaboration, routing models, and the small-model needs of speculative decoding. Hou Yuxi noted his company's GPU nodes are already concentrated on LLM inference, so fine-grained slicing demand isn't prominent today; he added small-model scenarios from his own use — embedding, speech recognition — and possible sharing needs from splitting inference stages. James emphasized domestic compute adaptation. HAMi's value should be judged against real workloads: sharing-suited tasks use fine-grained resources; whole-card or multi-card jobs keep their resource form — the sharing ratio must not override business requirements.

Dynamia's stance in co-building HAMi is to bring enterprise problems, validation experience, and design discussion into open collaboration — not to reduce community value to a count of new features. The panel also clearly named what needs improvement: newcomer feedback must be caught, design context must be easy to find, and AI-assisted development still requires contributors to explain requirements and own validation. For enterprise users, a sustainable community should let adopters gradually gain the ability to participate in improvement; for HAMi, these everyday collaborations determine whether sharing and heterogeneous adaptation keep pace with real usage.

Start with a real problem, a discussion, or a doc improvement — and join the HAMi community.

## Video

- **Bilibili replay:** [Panel | Setting Off Again from Incubating: How Does HAMi Move Toward a More Open, More Sustainable Community?](https://www.bilibili.com/video/BV1wkYV6ZEEo/)

## Series

- [Overview: HAMi Meetup Shanghai Recap](/blog/hami-meetup-shanghai-2026/)
- [(1) Where Does HAMi Fit in the CNCF × PyTorch Cloud Native AI Foundation?](/blog/hami-meetup-shanghai-2026-cncf-pytorch-ai-foundation/)
- [(2) After GPU Sharing: How HAMi 2.10 Improves Isolation, Scheduling, and Observability](/blog/hami-meetup-shanghai-2026-hami-2-10-remote-gpu/)
- [(3) Inference Control vs. GPU Resource Management: How llm-d and HAMi Can Work Together](/blog/hami-meetup-shanghai-2026-llm-d-inference-plane/)
- [(4) Turning GPU Performance into Inference Service Capability: Lessons from Iluvatar](/blog/hami-meetup-shanghai-2026-iluvatar-gpu-inference/)
- [(5) How iFLYTEK Manages Multi-Business GPU Sharing with Volcano + HAMi-core](/blog/hami-meetup-shanghai-2026-volcano-hami-core/)
- [(6) How UCloud Turns HAMi Sharing into Ready-to-Use Development Environments](/blog/hami-meetup-shanghai-2026-ucloud-ai-platform/)
- **(7) From User to Co-Builder: Why Enterprises Need a Sustainable HAMi Community** (this post)
