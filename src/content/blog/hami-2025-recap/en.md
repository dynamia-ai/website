---
title: 'HAMi 2025 Year in Review | From GPU Scheduler to Cloud-Native AI Infrastructure Pillar'
coverTitle: 'HAMi 2025 Year in Review | From GPU Scheduler to Cloud-Native AI Infrastructure Pillar'
date: '2026-02-12'
excerpt: >-
  A look back at how HAMi evolved from a single GPU virtualization solution into a
  unified platform supporting 11+ AI accelerator vendors.
author: Dynamia AI Team
tags:
  - HAMi
  - GPU Sharing
  - vGPU
  - Kubernetes
  - Year in Review
  - CNCF
category: Year in Review
coverImage: /images/blog/hami-2025-recap/hami-2025.png
language: en
slug: hami-2025-recap
---

![HAMi 2025 From GPU Scheduler to Cloud-Native AI Infrastructure Pillar](/images/blog/hami-2025-recap/hami-2025.png)

> A look back at how HAMi evolved from a single GPU virtualization solution into a unified platform supporting multiple AI accelerator vendors.

## A Year of Growth: From CNCF Sandbox to Production Validation

If HAMi's acceptance into [CNCF Sandbox](https://www.cncf.io/projects/hami/) in August 2024 marked community recognition, then 2025 was the year HAMi proved its value with tangible results.

This year, HAMi evolved beyond a GPU virtualization scheduler into a comprehensive **AI computing virtualization middleware**, supporting unified management and scheduling for AI accelerators from NVIDIA GPU and other vendors.

More importantly, HAMi received large-scale production validation—enterprises like Beike, DaoCloud, SF Technology, Prep EDU, and others built stable AI platforms on HAMi, processing millions of daily business requests across hundreds of enterprise users.

By the numbers, the HAMi community maintained strong momentum in 2025: 97 contributors participated, 433 code commits, and releases from **v2.5.0** to **v2.8.0** with multiple major versions.

Notably, community activity increased significantly in the second half, with July, November, December and January 2026 reaching 45, 44, 54, and 56 commits respectively.

This momentum surge was primarily driven by important version developments and an expanding contributor base.

## Technical Evolution: From Single GPU to Unified Platform

The most significant technical feature of HAMi in 2025 was expansion from single NVIDIA GPU support to unified management across multiple AI accelerator vendors.

This shift not only broadened HAMi's applicability but also provided a practical technical path for autonomous and controllable AI infrastructure.

In multi-vendor support, HAMi implemented a series of important features in 2025, pushing accelerator support to new heights.

HAMi implemented advanced scheduling features including topology-aware scheduling and resource reuse capabilities, improving resource utilization efficiency in multi-task sharing scenarios.

HAMi added application-level GPU isolation support for inference scenarios with more flexible resource management, supporting multiple QoS modes and topology-aware scheduling. WebUI also achieved heterogeneous metric visualization.

The HAMi community maintains a [complete device support list](https://project-hami.io/docs/userguide/Device-supported) on the official website, including unified management and scheduling for multiple AI accelerators including NVIDIA GPU, AMD, AWS Neuron, and more.

These achievements enabled HAMi to form the industry's broadest AI accelerator support, avoiding single-vendor lock-in and providing a practical technical solution for autonomous, controllable AI infrastructure.

### Production-Grade Reliability

Production environment reliability was significantly enhanced in 2025. To avoid single points of failure, HAMi implemented a leader-election-based high-availability architecture supporting scheduler leader-follower mode, ensuring automatic failover during scheduler failures and guaranteeing continuous cluster operation.

Resource quota checking mechanisms were added to webhook, effectively preventing over-allocation by intercepting unreasonable resource requests at the admission stage, avoiding scheduling pressure and resource waste.

Addressing potential DoS attacks in production, HAMi added io.LimitReader protection in scheduler routes, resolving long-standing issues and improving system security.

To improve operational efficiency, HAMi implemented scheduling reason awareness. When Pod scheduling fails, the system provides detailed failure reasons with standardized error codes (like NodeInsufficientDevice, CardTypeMismatch, CardInsufficientMemory, etc.), using a two-tier logging system (v4-level node summary, v5-level device details), helping users quickly locate root causes of scheduling issues and significantly reducing troubleshooting difficulty.

HAMi also introduced Container Device Interface (CDI) mode support, providing "envvar" (environment variable) and "cdi-annotations" (CDI annotation) device exposure strategies through the `deviceListStrategy` configuration option. CDI mode follows the Kubernetes Container Device Interface standard, providing more standardized and portable device management, laying the foundation for deep integration with the Kubernetes ecosystem.

### Monitoring and Observability

Monitoring and observability are critical to operational efficiency, and HAMi invested significant development resources here.

HAMi added ServiceMonitor support for both scheduler and device-plugin, facilitating integration with the Prometheus monitoring ecosystem and achieving standard docking with mainstream monitoring systems.

Device type labels were added to monitoring metrics, making monitoring analysis possible for multi-vendor accelerator clusters, enabling operators to perform resource usage analysis by device type.

Version info metrics `hami_build_info` were implemented, facilitating operations management and making version information clear at a glance.

When nodes are deleted, HAMi ensures related monitoring data is automatically cleaned up, avoiding memory leaks and maintaining long-term stable monitoring system operation.

Addressing potential cardinality explosion in monitoring metrics, HAMi optimized the Device\_memory\_desc\_of\_container metric to prevent monitoring system overload from excessive label combinations.

### Performance Optimization and Developer Experience

For performance optimization, HAMi optimized node locks from global locks to fine-grained per-node locks, significantly improving concurrent performance in large-scale clusters and reducing lock contention wait times.

Null pointer checks were added in multiple critical paths, preventing panic occurrences and improving system stability.

Developer experience improvements were also an important theme in 2025. HAMi added DRA (Dynamic Resource Allocation) installation options in Helm Charts, supporting the Kubernetes dynamic resource allocation standard and simplifying deployment.

Mock device plugin was integrated, solving the problem that device memory resource names (like `nvidia.com/gpumem`, `nvidia.com/gpucores`) couldn't be reported to Node's `capacity` and `allocatable` fields. Mock device plugin enables the Kubernetes scheduler to correctly recognize and schedule pods using these extended resources by simulating device plugins, while supporting MemoryFactor configuration, providing complete device simulation capabilities for development and test environments.

Certificate file change monitoring and hot reload functionality was supported, enabling new certificate configurations to be applied without service restart, improving operational flexibility.

HAMi introduced code quality checking tools like staticcheck, continuously improving code quality with automatic static code analysis in CI/CD pipelines to identify potential issues early.

### Ecosystem Projects

The HAMi project gradually evolved into a complete ecosystem in 2025, with multiple surrounding projects working together to provide users with comprehensive accelerator virtualization solutions.

**HAMi-DRA** (Dynamic Resource Allocation) implemented Kubernetes-native GPU dynamic resource allocation standards, supporting v1.34+. As an important project component, HAMi-DRA continued iterating in 2025, now supporting NVIDIA GPU. Through DRA parameter-driven allocation mechanisms, HAMi can manage GPU resources more flexibly, improving scheduling efficiency.

**volcano-vgpu-device-plugin** project integrated HAMi's vGPU capabilities into the Volcano batch scheduler, providing GPU virtualization support for AI training, big data processing and other batch scenarios. This project continued updating in 2025, ensuring compatibility with the Volcano scheduler.

**ascend-device-plugin** achieved official integration with Volcano scheduler in 2025. This functionality was officially released in Volcano v1.14.0.

**HAMi-WebUI** provides a visual management interface for HAMi, enabling users to view GPU resource usage, monitor Pod running status, and manage resource allocation policies through web pages. This project underwent multiple feature iterations in 2025, improving user experience.

**mock-device-plugin** solved the problem that device memory resource names (like `nvidia.com/gpumem`, `nvidia.com/gpucores`) couldn't be reported to Node's `capacity` and `allocatable` fields. Mock device plugin enables the Kubernetes scheduler to correctly recognize and schedule pods using these extended resources by simulating device plugins, while supporting MemoryFactor configuration, providing complete device simulation capabilities for development and test environments.

These ecosystem projects work together to form HAMi's complete technical landscape, providing end-to-end solutions for cloud-native AI infrastructure.

### Upstream Ecosystem Integration

In 2025, HAMi actively pursued deep integration with upstream open-source projects in the cloud-native AI ecosystem, evolving from a single virtualization solution to a complete accelerator scheduling platform.

**For Kubernetes standard integration**, HAMi implemented Helm Chart installation options for Kubernetes DRA (Dynamic Resource Allocation) standards, supporting Kubernetes v1.34+ native dynamic resource allocation mechanisms and deep alignment with the Kubernetes ecosystem.

**For scheduler ecosystem integration**, HAMi actively pursued deep integration with mainstream schedulers and inference frameworks, providing optimal scheduling solutions for different scenarios:

* **Volcano scheduler**: Beyond continuously enhancing compatibility with Volcano scheduler, HAMi achieved official integration with ascend-device-plugin in [Volcano v1.14.0](https://github.com/volcano-sh/volcano/releases/tag/v1.14.0).

* **Kueue batch scheduling system**: HAMi is actively adapting to Kueue and other batch scheduling systems, providing unified resource management and scheduling capabilities for large-scale batch processing tasks.

* **Xinference inference framework**: Through Helm Chart, HAMi implemented native support, enabling Supervisor/Worker to pass GPU resource parameters like `nvidia.com/gpucores` and `nvidia.com/gpumem-percentage`, providing safe GPU sharing and improved utilization solutions for multi-model inference scenarios, supporting multiple QoS modes (BestEffort, FixedShare, BurstShare).

* **vLLM LLM framework**: HAMi was natively accepted into vLLM Production Stack, fixing compatibility issues with vLLM (Large Language Model) virtualization frameworks, ensuring reasonable GPU resource allocation and isolation in vLLM scenarios, improving LLM inference and training task resource utilization. This PR was led by community contributor Andrés Doncel from Spanish Empathy.co e-commerce search and product discovery platform provider, stemming from real business requirements.

* **Koordinator scheduler**: HAMi was included as Koordinator's official GPU sharing solution, serving as the implementation foundation for its node-side GPU isolation capabilities, forming an end-to-end GPU Sharing solution from scheduling to runtime to monitoring.

**For observability integration**, HAMi improved integration with the Prometheus ecosystem, adding ServiceMonitor support and `hami_build_info` version metrics, facilitating integration with visualization monitoring platforms like Grafana, improving operational efficiency.

These upstream ecosystem integration efforts make HAMi not just a GPU virtualization scheduler but a key scheduling component in cloud-native AI infrastructure, working collaboratively with projects like Kubernetes, Volcano, Kueue, and Koordinator to provide users with complete accelerator resource management solutions.

## Community Prosperity: Open Governance and Diverse Contributions

The HAMi community maintained active development rhythm and open collaboration atmosphere in 2025.

By contributor data, [@archlitchi](https://github.com/archlitchi) ranked first with 95 commits, primarily focusing on version releases, Helm Chart maintenance, and numerous core feature development and iteration.

[@Shouren](https://github.com/Shouren) and [@FouoF](https://github.com/FouoF) ranked second and third with 26 and 21 commits respectively, their primary contributions focusing on core scheduling logic optimization and device management.

The HAMi maintainer team adopts open governance. The project was initially jointly promoted by Dynamia AI and NVIDIA engineers, completing key architecture design and early capability building. As the ecosystem expanded, enterprise developers like 4Paradigm joined the maintainer ranks, gradually forming a multi-core collaborative governance system. Multi-party participation and continuous collaboration enable HAMi to maintain technical continuity while gaining stronger ecosystem inclusivity and sustainability.

The community maintains open collaboration through [GitHub](https://github.com/Project-HAMi/HAMi), [Slack](https://cloud-native.slack.com/archives/C07T10BU4R2), [Discord](https://discord.gg/Amhy7XmbNq), [official website](http://project-hami.io/) and other channels.

In late 2025, HAMi Meetups were successfully held in Shanghai and Beijing, themed "Efficiency over Raw Compute Power," attracting numerous developers and users.

In member roles, community governance was further improved:

* @Shouren was promoted to HAMi Maintainer, contributing significantly to scheduler robustness, device management, release processes, and security updates, and is a core developer of HAMi-DRA.
* @FouoF was promoted to HAMi Approver, continuously investing in scheduler stability, HAMi-DRA, testing improvements, and Chart enhancements, becoming an important project reviewer.
* [@DSFans2014](https://github.com/DSFans2014) was promoted to HAMi Reviewer, contributing significantly in Ascend device and accelerator scenario support, actively participating in code review and issue fixes.
* [@Shenhan11](https://github.com/shenhan11) was promoted to HAMi Web UI Reviewer, continuously investing in development and testing of multiple feature modules, providing guarantees for project quality improvement.
* [@windsonsea](https://github.com/windsonsea) was promoted to HAMi Website Approver, long-term participating in HAMi official website architecture design and feature development, continuously improving content structure and release processes, providing important support for project external image and information transparency construction.
* [@chaunceyjiang](https://github.com/chaunceyjiang) was promoted to HAMi core Reviewer, from early core feature development to code review and quality assurance, continuously promoting HAMi's maturity and perfection in GPU resource management and stability.

HAMi maintained regular release rhythm in 2025, from v2.5 series to v2.8.0, with each version undergoing sufficient testing and verification to ensure production-grade stability.

## Production Validation: CNCF Case Studies

In 2025, multiple enterprises shared their real experiences using HAMi. These CNCF case studies provide the most powerful proof of HAMi's production-grade value.

* [Beike](https://www.cncf.io/case-studies/ke-holdings-inc/)'s AI Platform achieved near 3x GPU utilization improvement from 13% to 37%, with over 10,000 Pods running simultaneously, processing tens of millions of daily business requests.

* [DaoCloud](https://www.cncf.io/case-studies/daocloud/) deployed 10,000+ GPU cards across more than 10 data centers, achieving over 80% average GPU utilization, reducing operating costs by 20-30%.

* [SF Technology](https://www.cncf.io/case-studies/sf-technology/) built an EffectiveGPU solution based on HAMi, achieving 57% GPU resource savings through GPU virtualization and resource optimization technologies, significantly reducing hardware procurement costs and operational overhead.

* [Prep EDU](https://www.cncf.io/case-studies/prep-edu/) uses HAMi to efficiently manage 90% of GPU infrastructure, eliminating application crashes caused by memory conflicts and resolving 50% of the team's previous GPU resource management pain points.

## Lessons and Outlook

HAMi's success in 2025 can be attributed to several key factors:

* Production-grade reliability design is most important, with Leader election, resource quota checking, monitoring data cleanup and other mechanisms withstanding testing in actual production environments—Beike's 10,000+ Pod zero-downtime operation is the best proof.
* Monitoring and observability priority is another success factor, with ServiceMonitor integration, device type labels, version metrics and other improvements reducing operational complexity and improving troubleshooting efficiency.
* Open ecosystem strategy enables HAMi to support 11+ AI accelerators without binding to single hardware vendors, avoiding vendor lock-in.
* Community-driven development through open PR discussions, code review, Slack/Discord communication, with successful [Shanghai](https://project-hami.io/blog/hami-meetup-shanghai-2025) and [Beijing](https://project-hami.io/blog/hami-meetup-beijing-2025) 'Efficiency over Raw Compute Power' series HAMi Meetups in late 2025, promoting community exchange.

Of course, HAMi also faces common challenges in rapid development. For documentation and examples, new users face challenges in configuration and debugging, with insufficient configuration examples for complex scenarios, troubleshooting documentation needing more structure, and multilingual documentation needing continuous synchronous updates. For test coverage, although HAMi has introduced E2E testing and CI workflows, multi-vendor hardware test environment setup is complex, integration test cases need to be more comprehensive, and performance regression testing mechanisms need strengthening. For response time optimization, GitHub Issues analysis shows some Issues have long response times, new contributor PRs need faster feedback, and more maintainer review participation is needed.

Looking ahead to 2026, the HAMi community will continue evolving around the following strategic directions:

* **Core feature enhancement**: HAMi will continue improving MPS/MPS integration (MLU PodGroup support), resource preemption, PodGroup and other scheduling enhancement features, providing more powerful scheduling capabilities.
* **Multi-vendor accelerator support** will deepen adaptation for AMD Mi300X, Cambricon 5x0 series, Swei Yuan DRX and other accelerator chips, while maintaining comprehensive support for mainstream chips like NVIDIA and Huawei Ascend.
* **DRA standard expansion**: HAMi will implement complete DRA (Dynamic Resource Allocation) standard adaptation, deeply integrating with Kubernetes resource allocation ecosystem, providing more flexible GPU resource management methods.
* **Flexible slicing** technology, supporting Dynamic MIG, topology-aware scheduling and other advanced GPU virtualization features, enabling users to dynamically adjust GPU resource allocation strategies based on actual needs.
* **Cloud-native integration** will advance deep integration with schedulers like Volcano and Kueue, while supporting CDI, multi-cloud deployment and other enterprise features to adapt to more complex cloud environments.
* **Observability** enhancements, adding monitoring metrics, Grafana dashboards, distributed tracing and other capabilities, providing more complete operational toolchains.

HAMi welcomes more contributor participation. Tasks suitable for new contributors include documentation improvement and translation, example code writing, bug fixes and testing, user support and issue triage.

As a CNCF Sandbox project, HAMi will continue upholding open, collaborative, innovative spirit, providing the most powerful accelerator virtualization solutions for cloud-native AI infrastructure.

Thanks to all organizations and individuals who contributed in 2025-2026, with special thanks to CNCF community support and guidance, and collaboration with upstream communities like Kubernetes and Volcano.

## Toward CNCF Incubation: Ecosystem Consensus Forming

In 2025, HAMi officially initiated the process toward CNCF Incubating stage. Related discussions have begun in CNCF TOC:

👉 <https://github.com/cncf/toc/issues/1775>

From Sandbox to Incubating is not just about feature completeness, but comprehensive reflection of ecosystem maturity, governance transparency, community activity, and production validation capabilities.

Over the past year, HAMi's global sharing, practice, and technical influence have continuously expanded, laying the foundation for this phased goal.

## 2025: Global Community Technical Sharing and Recognition of HAMi

### International Technical Conferences and Community Sharing

HAMi continued participating in global cloud-native and AI infrastructure-related conferences in 2025.

* **KubeCon Europe 2025 (London)**

  * [Unlocking How To Efficiently, Flexibly, Manage and Schedule Seven AI Chips in Kubernetes](https://kccnceu2025.sched.com/event/1txAf/unlocking-how-to-efficiently-flexibly-manage-and-schedule-seven-ai-chips-in-kubernetes-xiao-zhang-daocloud-mengxuan-li-the-4th-paradigm-ltd)
    Introducing how to achieve unified scheduling and virtualization of seven AI accelerators in Kubernetes, implementing efficient, topology-aware compute management and batch task collaborative scheduling.

* **KubeCon China 2025 (Hong Kong)**

  * [Smart GPU Management: Dynamic Pooling, Sharing, and Scheduling for AI Workloads](https://kccncchn2025.sched.com/event/1x5iF/smart-gpu-management-dynamic-pooling-sharing-and-scheduling-for-ai-workloads-in-kubernetes-wei-chen-china-unicom-cloud-data-mengxuan-li-dynamia)

  * [Project Lightning Talk: K8s issue #52757: Sharing GPUs Among Multiple Containers](https://kccncchn2025.sched.com/event/1xjzB/project-lightning-talk-k8s-issue-#52757-sharing-gpus-among-multiple-containers-xiao-zhang-maintainer)
    Showcasing HAMi and Volcano integration, DRA adaptation, and other technical directions.

* **OSIM AI Paris 2025**
  HAMi was selected as one of [OSIM](https://mp.weixin.qq.com/s/7Jzplm7ur325mNqIYk3aLQ) AI Spotlight key open-source projects, sharing accelerator scheduling practices in global AI open-source technical exchange.

* **AI\_dev (Linux Foundation)**
  Sharing GPU slicing and software-defined isolation engineering practices in cloud-native environments. Conference replay available at [YouTube video](https://youtu.be/pjHA0JfPNfw?si=djB-R71tswDn9JAq\&t=875).

* **CNCF Cloud Native Hanoi Meetup**
  Vietnam Telecom practice case, showcasing GPU management and observability capabilities. See [CNCF Cloud Native Hanoi Meetup](https://community.cncf.io/events/details/cncf-cloud-native-hanoi-presents-may-meetup-gpu-and-ebpf-on-kubernetes/) and [YouTube video](https://youtu.be/UtPv8P7v0YU?si=UH1uwe07IV4bT5kL) for more details.

* **vCluster Technical Workshop**
  Recommended by experts as an innovative solution for "fine-grained governance through proxy-layer CUDA API interception". Conference replay available at [YouTube video](https://youtu.be/eBbjSfxwL30?si=PcPBonbQJfN7maeh\&t=1811).

### Domestic Technical Ecosystem Influence

In 2025, HAMi deeply participated in domestic AI and open-source technical ecosystem:

* [COSCon'25 China Open-Source Annual Conference](https://mp.weixin.qq.com/s/rU66wV7JB8w5hnUl5zC0xQ)

* [GDPS Global Developer Pioneer Conference](https://mp.weixin.qq.com/s/--AjMUpPxnO3XlojlC_I-w)

* [KCD Hangzhou Station x OpenInfra Days China](https://mp.weixin.qq.com/s/9mi57Ue_uiRMDP4mx8kHkA)

* [vLLM Inference Optimization Meetup Shanghai Station](https://mp.weixin.qq.com/s/fIoDw95bMtFug9JZi_MS6Q)

* [Ant Group Open-Source Technical Salon](https://mp.weixin.qq.com/s/GBoB_VEgmw6_bGX4WZS_Gg)

* Multiple open-source community and enterprise technical exchange activities

These sharing sessions cover GPU virtualization, vLLM distributed inference, chip adaptation, serverless inference systems and other topics, promoting the spread of accelerator resource governance concepts.

### Enterprise-Grade Deployment and White Paper Release

SF Technology published the "[EffectiveGPU Technical White Paper](https://mp.weixin.qq.com/s/zZKJfJJOzBhpcq1FMttqsA)", with architecture deeply integrating HAMi's capabilities in accelerator virtualization and unified scheduling.

This practice marks that HAMi is not just an open-source project but has become a key component in enterprise production environments.

In 2025's ecosystem expansion, HAMi also conducted in-depth collaboration with multiple accelerator and data infrastructure vendors, jointly promoting accelerator standardized access and unified scheduling in cloud-native environments.

We welcome more chip vendors and platform partners to join the HAMi ecosystem, jointly promoting AI infrastructure collaborative innovation under open standards.

## 2026: KubeCon Europe · Project Pavilion

HAMi has confirmed participation in [**KubeCon + CloudNativeCon Europe 2026**](https://events.linuxfoundation.org/kubecon-cloudnativecon-europe/).

Project Pavilion · Booth P-13B

📅 Mar 24 · 15:10–19:00

📅 Mar 26 · 12:30–14:00

We will share on-site:

* GPU virtualization and dynamic slicing practices

* DRA and Kubernetes deep integration progress

Welcome global developers to exchange with us on-site.

![Welcome to KubeCon EU 2026 HAMi Booth](/images/blog/hami-2025-recap/kubecon-eu-2026.png)

**Related Resources**:

* HAMi GitHub: <https://github.com/Project-HAMi/HAMi>

* HAMi Documentation: <http://project-hami.io/docs/>

* CNCF Project Page: <https://www.cncf.io/projects/hami/>

* Slack Community: <https://cloud-native.slack.com/archives/C07T10BU4R2>

* Discord: <https://discord.gg/Amhy7XmbNq>

**Report Authors**: HAMi Community **Publication Date**: February 12, 2026

*This document represents the HAMi community's annual summary, reflecting project progress from January 1, 2025 to February 12, 2026. All data comes from Git commit records, GitHub Issues/PR, CNCF case studies and other public channels.*
