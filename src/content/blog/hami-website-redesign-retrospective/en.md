---
title: "A Community-Oriented Refactor: Why HAMi Docs and Website Underwent a Complete Redesign"
linktitle: "HAMi Website Redesign Overview"
date: "2026-03-17"
excerpt: >-
  A systematic upgrade to HAMi's website and docs, improving community visibility,
  content structure, search, and usability.
author: Jimmy Song
tags:
  - HAMi
  - Website
  - Documentation
  - Community
  - Open Source
category: Open Source
language: en
coverImage: /images/blog/hami-website-redesign-retrospective/banner.webp
---

> This redesign is more than a style update—it's a step toward clearer technical communication and better user experience. Try the new HAMi website at <https://project-hami.io> and submit issues [here](https://github.com/Project-HAMi/website/issues).

Author: Jimmy Song (Dynamia), GitHub: [@rootsongjc](https://github.com/rootsongjc)

Over the past two months, I conducted a thorough refactor of the documentation website (see [GitHub](https://github.com/Project-HAMi/website/pulls?q=is%3Apr+is%3Aclosed+author%3Arootsongjc)). Externally, it looks like a "visual redesign", but from the perspective of community maintainers and content builders, it's a comprehensive upgrade of information architecture, content system, and frontend experience.

This article aims to systematically explain three things: why we did this refactor, what exactly changed, and what these changes mean for the HAMi community.

## Why Refactor the Website and Documentation

[HAMi](https://github.com/project-hami/hami) is a CNCF-hosted open source project initiated and contributed by [Dynamia](https://dynamia.ai), with growing influence in GPU virtualization, heterogeneous compute scheduling, and AI infrastructure. The community content is expanding, and user types are becoming more diverse: from first-time visitors to engineers and enterprise users seeking deployment docs, architecture diagrams, case studies, and ecosystem information.

The original site was functional, but as content grew, several issues became apparent:

- The homepage lacked information density, making it hard to quickly grasp the project's overall value.
- Connections between docs, blogs, and community info were not smooth; content entry points were scattered.
- Search experience was unstable; external solutions were not ideal in practice.
- Mobile experience had many details needing improvement, especially navigation, card layouts, and footer areas.
- Visual style was inconsistent, making it hard to convey community influence and engineering maturity.

For a fast-evolving open source community, the website is not just a "place for docs", but the public interface of the community. It needs to serve as project introduction, knowledge gateway, adoption proof, community connector, and brand expression.

So the goal of this refactor was clear: not just superficial beautification, but to truly upgrade the website into HAMi's systematic community entry point.

## What Was Done in This Refactor

This update was not a single-point change, but a series of systematic improvements.

### Homepage Redesign and Complete Information Architecture Overhaul

The most obvious change is the homepage.

We redesigned the homepage structure, moving away from simply stacking content blocks, and instead organizing the page around the main narrative: "Project Positioning → Core Capabilities → Ecosystem Entry → Content Accumulation → Community Trust".

Specifically, the homepage received several key upgrades:

- Rebuilt the Hero section to strengthen first-screen information delivery and action entry.
- Optimized CTA design so users can quickly access docs, blogs, and resources.
- Added and enhanced multiple homepage sections to showcase project value and community reach in a more structured way.
- Adjusted visual hierarchy, background atmosphere, and scroll rhythm, transforming the homepage from a "content list" into a "narrative page".

These changes include Hero animations and atmosphere layers, research/story sections, new resource entry sections, refreshed CTAs, unified background design, and ongoing reduction of visual noise. Together, they solve a core problem: enabling visitors to understand what HAMi is and why it's worth exploring further within seconds.

### Architecture Diagrams

Key diagrams were redrawn for clearer technical communication. This helps users grasp HAMi's role in AI infrastructure.

![HAMi website homepage architecture diagram](https://assets.jimmysong.io/images/blog/hami-website-redesign/hami-hero-diagram.webp)

![Before and after using HAMi, highlighting HAMi's GPU virtualization and sharing capabilities](https://assets.jimmysong.io/images/blog/hami-website-redesign/before-and-after-using-hami-diagram.svg)

For HAMi, this change is critical. The community faces not just a single feature, but a set of system-level challenges involving Kubernetes, schedulers, GPU Operators, heterogeneous devices, and enterprise platforms. Improved diagrams make the website a better technical entry point.

### Added Case Studies, Community, and Ecosystem Sections to Make Impact Visible

Another important direction was strengthening the "community proof" layer.

Many open source project sites fall into the trap of having complete docs, but users can't tell if the project is truly adopted, if the community is active, or if the ecosystem is expanding. The HAMi website redesign consciously addresses this.

![HAMi ecosystem and device support](https://assets.jimmysong.io/images/blog/hami-website-redesign/ecosystem.webp)
![HAMi adopters](https://assets.jimmysong.io/images/blog/hami-website-redesign/adopters.webp)
![HAMi contributor organizations](https://assets.jimmysong.io/images/blog/hami-website-redesign/contributors.webp)

### Blog & Reading Experience

Blog cards, lists, and metadata were unified for easier reading and sharing. Blogs are now a core communication layer.

![HAMi website blog list page](https://assets.jimmysong.io/images/blog/hami-website-redesign/hami-blog.webp)

### Mobile Optimization

Navigation, card layouts, footer, and search were improved for smoother mobile browsing.

![HAMi website mobile view](https://assets.jimmysong.io/images/blog/hami-website-redesign/mobile.webp)

### Footer & Search

Footer layout was enhanced for better navigation and credibility. Built-in search replaced unreliable external solutions, improving content accessibility.

![HAMi website footer](https://assets.jimmysong.io/images/blog/hami-website-redesign/footer.webp)
![HAMi website built-in search](https://assets.jimmysong.io/images/blog/hami-website-redesign/search.webp)

## What This Redesign Means for the HAMi Community

From screenshots, it looks like "the website looks better". But from a community-building perspective, its significance is deeper.

First, HAMi's external expression is more systematic.

The website is no longer just a collection of scattered pages, but is forming a complete narrative chain: users can understand project value from the homepage, capability details from docs, practical paths from blogs, and community impact from ecosystem modules.

Second, community content assets are reorganized.

Previously, valuable articles, diagrams, and explanations existed but were hard to find. Now, through homepage sections, navigation, and search refactor, these contents are more effectively connected.

Third, HAMi's community image is more mature.

A mature open source project needs not just an active code repository, but clear, stable, and sustainable website expression. Structure, style, and usability are part of the community's engineering capability.

Fourth, this lays the foundation for expanding case studies, adopters, contributors, and ecosystem content.

With the framework sorted, adding more case studies, collaboration entry points, or showcasing more adopters and partners will be more natural and easier for users to understand.

## As a Community Contributor, My Top Three Takeaways from This Redesign

In summary, I believe this refactor got three things right:

- Upgraded the website from a "content dump" to a "community gateway".
- Combined visual optimization with information architecture adjustment, not just a skin change.
- Improved basic experiences like search, mobile, navigation, and footer.

These may not be as flashy as launching a new feature, but they directly impact content dissemination, user comprehension, and the project's long-term image.

For infrastructure projects like HAMi, technical capability is fundamental, but clearly communicating, organizing, and continuously presenting that capability is also a form of infrastructure.

## Summary

This HAMi documentation and website refactor is essentially an upgrade to the community's "expression layer" infrastructure.

It improves visual and reading experience, reorganizes content, homepage narrative, search paths, mobile access, and community signal display. Homepage redesign, architecture diagram redraw, unified blog style, mobile optimization, enhanced footer, and switching from external to built-in search together constitute a true "refactor".

Externally, it helps more people quickly understand HAMi; internally, it provides a stable platform for the community to accumulate case studies, expand the ecosystem, and serve adopters and contributors.

The website is not an accessory to the open source community, but part of its long-term influence. HAMi's redesign is about taking this seriously.
