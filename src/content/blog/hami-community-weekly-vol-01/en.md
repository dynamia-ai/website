---
title: "Community Weekly Vol. 01: KubeCon, a CNCF Community Award and Open Source Ecosystem Updates"
date: "2026-11-20"
excerpt: "The first HAMi Community Weekly recaps KubeCon NA 2026, the open-source release of gpu-descheduler, HAMi-DRA v0.2.4, a CNCF community award and the Vultr Open Source Alliance. It also previews upcoming community events."
author: "Dynamia"
category: "Community & Events"
coverDisplay: "text"
tags: ["HAMi", "Community Weekly", "KubeCon", "Open source community"]
---

**This week's report | November 9–13, 2026**

Starting this week, **Community Weekly will meet you here every week!**

In this series, we hope to regularly bring together HAMi's **technical progress, community meetings, contributor updates, ecosystem collaborations and events**. We want to make it easier for developers and community partners to follow the project and provide an entry point for anyone who would like to take part.

Let's look back at this week's HAMi community news.

## This Week at a Glance

- **Technical exchange:** HAMi at KubeCon NA 2026
- **Community recognition:** Jimmy Song receives the 2026 CNCF Lorem Ipsum Award
- **Ecosystem collaboration:** HAMi joins the Vultr Open Source Alliance as one of its six founding members.
- **Upcoming events:** GOTC 2026 and COSCon'26
- **GitHub activity:** 109 commits, 62 merged PRs, more than 30 contributors and over 5,000 stars!

![Highlights and GitHub metrics from the first HAMi Community Weekly](/images/blog/hami-community-weekly-vol-01/weekly-summary-en.png)

## 01 | HAMi Community Updates

### gpu-descheduler

The HAMi ecosystem has a new project: **gpu-descheduler**. Intended for HAMi GPU virtualization clusters, it explores rescheduling GPU workloads to reduce resource fragmentation and improve cluster utilization.

The project is publicly available as open source, and both Chinese and English user guides are online. Developers who are interested are welcome to follow and contribute.

Project repository: [https://github.com/Project-HAMi/gpu-descheduler](https://github.com/Project-HAMi/gpu-descheduler)

### HAMi-DRA v0.2.4 Released

HAMi-DRA v0.2.4 was released on November 12. It continues to improve the approach to moving from Device Plugin to Kubernetes DRA.

The community also worked on NUMA scheduling optimization, Remote GPU monitoring and recovery from failures, and fixes for HAMi-WebUI.

### HAMi at KubeCon NA 2026

From November 9 to 12, [**the HAMi community attended KubeCon NA 2026 in Salt Lake City**](https://mp.weixin.qq.com/s/Z7eFnB2FzU0umpSMzGqGWg). It joined technical events including the Maintainer Track and ContribFest, and spoke with developers from around the world at the CNCF Project Pavilion.

![Developers visiting the HAMi project area at KubeCon NA 2026](/images/blog/hami-community-weekly-vol-01/kubecon-pavilion.jpg)

![CNCF incubating projects displayed at KubeCon NA 2026](/images/blog/hami-community-weekly-vol-01/kubecon-incubated-projects.jpg)

### Community Manager Receives CNCF Community Award

At KubeCon NA, [**HAMi Community Manager Jimmy Song (Song Jingchao) of Dynamia received the 2026 CNCF Lorem Ipsum Award**](https://mp.weixin.qq.com/s/NFjabD75sV2GF-x12mGULQ).

The award recognizes community members who have made outstanding contributions to documentation for CNCF and its hosted projects.

Over the past year, Jimmy has supported the HAMi community ecosystem through technical content and documentation, events, developer exchanges and ecosystem partnerships.

Congratulations to Jimmy, and thanks to every maintainer, contributor, user and ecosystem partner who helps build HAMi!

![Jimmy Song receiving a CNCF community award at KubeCon NA 2026](/images/blog/hami-community-weekly-vol-01/cncf-award-ceremony.jpg)

### HAMi Joins the Vultr Open Source Alliance

On November 11, HAMi announced that it had joined the **Vultr Open Source Alliance** as one of six founding members.

The alliance creates more opportunities for HAMi to explore how GPU sharing technology works with cloud GPU infrastructure and Kubernetes environments.

Going forward, the community looks forward to exploring deployment guides, reference architectures and GPU sharing resources so more developers can evaluate and use HAMi in real environments.

**Related reading:** [HAMi Joins the Vultr Open Source Alliance](https://discover.vultr.com/open-source)

![HAMi joins the Vultr Open Source Alliance](/images/blog/hami-community-weekly-vol-01/vultr-alliance.png)

## 02 | Community Meeting Highlights

### Chinese Community Meeting | November 6

- **v2.11.0 documentation maintenance:** The group discussed updates to the official documentation, PR merges and additions to the Metrics documentation. Work on these documentation updates continued the following week.
- **Device documentation:** The plan is to organize documentation navigation by device vendor so users can find instructions for their devices more easily.
- **Upstream collaboration:** The community explored the feasibility of contributing GPU VRAM limiting capabilities to upstream Kubernetes device drivers; further assessment depends on discussions with upstream maintainers.

### Global Community Meeting | November 11

- **v2.12 planning:** Contributors discussed initial ideas for the next release. A more detailed roadmap will be shared after KubeCon.
- **Device configuration validation:** Contributor Sankalp proposed a command to check relevant settings before users configure Kubernetes device access. The proposal will be discussed further in a GitHub Issue.
- **LFX Mentorship:** Preparation began for the next round of mentorship proposals. Topics will be chosen with reference to the HAMi roadmap.

![HAMi community meeting visual with a participation QR code](/images/blog/hami-community-weekly-vol-01/community-meeting-qr.png)

## 03 | Upcoming Community Events

### Event Preview | GOTC 2026

- Date: November 14
- Venue: Tongminghu Convention and Exhibition Center, Beijing
- Booth: C31

HAMi will be at GOTC 2026 to talk with developers about GPU sharing and heterogeneous compute scheduling.

The conference will also have interactive activities such as the “Garden Agent” and “Booth NPC.” Visitors can collect Token points by checking in and redeem gifts.

Come to booth C31 to meet the community and pick up HAMi merchandise!

![GOTC 2026 event poster with an event information QR code](/images/blog/hami-community-weekly-vol-01/gotc-poster-qr.png)

### **Event Preview | COSCon'26**

- Date: November 14–15
- Venue: Yungu Center, Hangzhou
- Booth: D6

HAMi will attend the COSCon'26 open-source conference to meet open-source developers and community partners and discuss technology and ecosystem development.

![COSCon'26 event poster with an event information QR code](/images/blog/hami-community-weekly-vol-01/coscon-poster-qr.png)

### Open Source Visits Universities: First Stop, Fudan

- **Date:** November 13, 2026
- **Venue:** Xianghui Hall, Fudan University, Shanghai

The first event in the “Open Source Visits Universities” series took place at Fudan University. The HAMi community joined the exchange and shared its work on GPU sharing and heterogeneous compute management.

**Related reading:** https://mp.weixin.qq.com/s/zKenZmIfGLvHnERfaQ1sJw

![Fudan University open-source forum poster with an event information QR code](/images/blog/hami-community-weekly-vol-01/fudan-forum-poster-qr.png)

**Making heterogeneous compute easier to use through open source. See you next week!**
