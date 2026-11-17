---
title: "China Merchants Bank improves AI compute scheduling on Kubernetes with HAMi"
company: "china-merchants-bank"
companyName: "China Merchants Bank"
logo: "/redesign/assets/b597756761457e50d747.svg"
date: "2026-07-02"
dateLabel: "2026.07.02"
sourceKind: "CNCF case study · Localized edition"
sourceUrl: "https://www.cncf.io/case-studies/china-merchants-bank/"
sourceLinkLabel: "Read the CNCF original ↗"
outcomeSourceUrl: ""
outcomeSourceLabel: "Key data source: Dynamia Network of Officials"
outcomes:
  - value: "100%"
    label: "Hardware resource pool utilization"
    detail: "Topology-aware scheduling; does not mean compute is always fully utilized"
  - value: "30%"
    label: "Less cross-machine scheduling"
    detail: "Reduced cross-machine communication in distributed training"
  - value: "1 GB / 1%"
    label: "Finest GPU memory / compute partitioning"
    detail: ""
---

## Summary

As AI loads are spread across model training, inference services, research and development, and internal AI applications, China Mercants Bank needs a more efficient way to manage diversified accelerator resources on a large scale. Through Kubernetes and Hami, the Bank built a unified AI network platform that has enabled heterogeneous resource pooling, popping-inspection scheduling, and fine grain acceleration cards to be shared.

Original key indicators: 100 per cent utilization of hardware pools; 30 per cent reduction in distributed training across the board; 1 GB GPU particle/ 1 per cent complete resources.

## About China Merchants Bank

China Mercantants Bank is one of China’s leading commercial banks, which invests heavily in claud-native, AI and digital infrastructure. As AI becomes central to the growing financial landscape, it requires a wide range of training, inference and internal AI workloads that place real pressure on the bottom-floor Compute Resources platform.

## Challenge

Large model training, inference services and various AI applications are expanding rapidly. For most large institutions, the real bottleneck is not a lack of access resources, but rather how to make existing resources work efficiently.

China Merchants Bank has been confronted with this problem. The Bank previously built a Heterogeneous Contact Resources platform using multiple AI Accelerators to support model training, online inference, R & D and internal AI tools. As usage grew, the original resource management approach was lost, and the Bank re-established its unified Scheduling platform on Kubernetes based on Hami, which integrated heterogeneous resource management, Toppaste awareness sharing and fine particle size.

In the final analysis, there are three questions:

### Fragmented Resource Management

Different AI accelerator manufacturers deliver their own software stacks and management tools. As a result, the pool is fragmented, there are inconsistencies in the Scheduling strategy, and transportation costs continue to climb.

### Training Hardware Not Fully Utilized

Some of the training nodes are connected at high speed with multiple chips, and mission placements are extremely sensitive to the physical expansion of the chip. If Scheduler does not understand this extension, the task is placed on the wrong chip, where light features are impaired and the weight fails directly.

### Wasted Capacity on Small Tasks

A large number of references, fine-tuning and testing tasks do not require a full accelerator.

## Why HAMi

The line chooses HAMi for several reasons:

- **Kubernetes native.** There is no need to reconstruct the existing claud-native technology warehouse.
- **(c) Harmonizing heterogeneous resources.** Multi-accelerator types share a scheduling framework.
- **Supports the sharing of fine particles.** GPU memoory and compute resources can be split with quotas and make fuller use of each card.
- **Open source and scalable.** The structure is open and adjusts to real business needs.

## Solution

China Merchants Bank built its unified AI compute platform on Kubernetes and HAMi, then iterated on resource onboarding, shared scheduling, and training efficiency.

### Platform Architecture

![Platform Architecture](/redesign/assets/92d5f99667b7b8bc6802.png)
*Figure 1: Platform architecture*

The platform is divided into three layers:

- **Operational service level:** Large-scale model training, AI access service, model fine-tuning and internal AI applications.
- **HAMi SCHEDULING:** Heterogeneous resource pooling, tele-scheming, GPU/NPU sharing, multi-manufacturing equipment abstract.
- **Infrastructure level:** Multi-producer AI Acce, multi-point cluster, high-speed Internet.

### Unified Heterogeneous Resource Management

HAMi allows the Bank to recycle different types of accelerators into a single Kubernetes pool. This is particularly critical in the context of China Mercants Bank, where the platform contains a wide variety of heterogeneous community resources, including Kunlen cores, multiple Ascend models, NVIDIA GPU, PPU, Moore Threads, MetaX and other acceleration devices. Without HAMi, each delivery of hardware will normally be accompanied by an independent KuberNetes cluster, which may allow the line to maintain more than eight separate clusters, each with its own set of device plugin, Scheduling strategies, monitoring systems, and movement processes and barrier models.

With the help of HAMi, these heterogeneous devices can be managed through a single Scheduling framework and consistent platform strategy. The application team continues to apply for resources through standard Kubernetes workflows, while the platform team abstracts the differences between equipment types, manufacturers' estates and resource allocation models. The value of HAMi goes beyond equipment slices and controls. The project also provides a manufacturer-specific best practices and illustrative workload that allows the bank to quickly validate new tube equipment through the HAMi example and then put it into production.

### Skilling: Fit for Supercalculative Nodes

Partially trained node adoption**Hypernominal nodes (two chip modules) structure**So, multiple chips form a logical unit by connecting at high speed. Kubernetes default Scheduler does not understand this layout, and then it raises the real question:

- **There's a problem with the odd-digit card allocation.** An odd number of card allocations may cross two modules and trigger a driver ' s error reporting.
- **Cross-mode group slow communication.** Communications between modules are significantly more delayed than within the module.
- **The cluster segment is idle.** Wrong placement decisions make some hardware physically unusable.

The bank enhanced the HAMi’s Device Plugin and Scheduler to identify physical module groups and force pair distribution. Scheduler now understands model group scaling up, keeps cards within the same module, and avoids a drive crash caused by odd number card cross-module placements.**The hardware pool utilization rate was 100 per cent.**

In the ResNet50 reference test (batch size = 32), HAMi's fine particle size subdivisions increased the total percard throughput from 64.6 images/s to 94.8 images/s. As the subdural size increases, overall throughput increases by a maximum of 46.7%, indicating higher load density and fuller use of accelerator.

![Supernode module paired allocation](/redesign/assets/c05bb342fdc7e885a671.png)
*Figure 2: Distribution of excess nodal model composition*

The Bank has also improved the system's handling of multiple chips with high-speed interconnection nodes. The system now understands the connection between chips and prioritizes training tasks at the shortest point in the communication path, making training more stable and faster.

### Fine particle size sharing: vNPU-Core software partition

The whole card is usually not needed for reference, small model fine-tuning and research and development testing tasks.

This line is done using the VMPO Core component of Hami**User-state partition of computer resources**The two main mechanisms are:

- **Your buckets.** The task ahead of the quota is waiting.
- **User-state GPU memory administration.** GPU GPU memory distribution is completed in user state, making it possible to partition the fine particle size.

![vNPU-Core user statecompute resources partition](/redesign/assets/3b277d0423fbf29281b6.png)
*Figure 3: VNPU-Core user state*

Partition particle size is the most subtle. **1 GB GPU memory / 1%**And it's very important in the banking sector. Wind control models and customer service models are often small, do not require a whole card, and fine particle size zones allow the bank to run much more of these models on the same batch of hardware.

For reference, small model training and R & D testing, the Bank also opens card sharing so that multiple tasks can be shared with a single accelerator. This allows multiple loads to be shared with a single accelerator, reducing the idle capacity of smaller inference and test loads.

### Networking: Three Layers of Abstracted and Dispersive

For distributed training, the bank designed a set**Multi-scale Screduling algorithm**The physical network is considered to be three layers:

- **First tier: the same node.** The least delayed and the highest priority for scheduling.
- **Second floor: the same LEAF switch.** Medium delay, medium priority.
- **Level three: Cross-LEAF switches.** The highest delays and lowest priorities.

![Three-tier network building](/redesign/assets/5f225e20cd352a480ef5.png)
*Figure 4: Three-tier network scale-up*

Scheduler is now in a phased position to add an increased score, giving priority to high-level communications tasks at the same node or exchange area.**Cross-boarding is down 30%.**A major communication bottleneck in distributed training was removed.

The bank also noted that scheduler sometimes scattered Pod from the same job to different nodes. It was introduced for this purpose.**deterministic hashing based on controller UIDs**Mechanism, keep Pod from the same batch at the same node.

## Key Results

These changes resulted in the following gains for the Bank:

| Metric | Outcome |
| --- | --- |
| Hardware resource pool utilization | **100%** |
| Crossing Scheduling Probability | Down **30%** |
| The most detailed particle size | **1 GB GPU memory / 1%** |
| Platform Architecture | Heterogeneous AI common resource planning |

These changes let the bank handle growing AI workloads without constantly buying more hardware.

> Through HAMi, we built a unified heterogeneous AI compute scheduling platform on Kubernetes, achieving significant improvements in resource utilization, training efficiency, and platform stability.
>

## What's the point?

The story of China Merchants Bank shows that the real competitive advantage of AI infrastructure is not to buy more hardware, but to use software to add value to existing hardware.

For the world of claud-native, this is a meaningful advance for Kubernetes. It is no longer just about packagings, but it is becoming the control side of an AI infrastructure.

Open-source projects such as HAMi allow enterprises to acquire a Heterogeneous Scheduling, sharing and organization capability over Kubernetes, thereby building the AI platform more quickly without repeating wheels.

## Follow-up planning

The focus areas include: further optimization of the Ascend hami-vnpu-core software zoning mechanism to reduce performance fluctuations in a multi-tasking environment; building full surveillance capabilities for virtualization NPU, providing real-time visibility on GPU memoory and utility access. China Mercants Bank also plans to continue as an active contributor to the HAMi Open Source community, sharing experience with transport and promoting the development of heterogeneous AI infrastructure technology.

## Summary

The practice of China Mercantants Bank shows that Kubernetes and Hami can provide a common base for the management of the enterprise-scale heterogeneous AI infrastructure. By increasing resource utilization, optimizing loads and enabling the sharing of fine grain resources, the Bank has created a more efficient and expanded platform to support growing AI projects within the organization.

>

<div class="case-source-note">
<p>Original:<a href="https://www.cncf.io/case-studies/china-merchants-bank/" target="_blank" rel="noopener">China Merchants Bank Improves AI Compute Scheduling on Kubernetes with HAMi ↗</a><br>Publisher: Cloud Native Computing Foundation (CNCF) · 2026-07-02</p><p>This localized edition preserves the source article’s technical information and measurement scope. It is not an official CNCF translation. Architecture diagrams retain their original text. Project status and product information reflect the original publication date.</p><p>The original is used under the  <a href="https://www.linuxfoundation.org/legal/terms" target="_blank" rel="noopener">Linux Foundation content terms</a> and  <a href="https://creativecommons.org/licenses/by/3.0/" target="_blank" rel="noopener">CC BY 3.0</a>. This edition has been localized and reformatted. All brand marks belong to their respective owners.</p>
</div>
