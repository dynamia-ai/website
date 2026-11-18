---
title: "Technical Progress and Hands-on Practice: HAMi at KubeCon NA 2026"
date: "2026-11-17"
author: "Dynamia"
excerpt: "At KubeCon + CloudNativeCon North America 2026, the HAMi community joined Red Hat to discuss GPU sharing and inference architecture, covered scheduling policies and Kubernetes DRA progress, and led developers through GPU virtualization in ContribFest."
category: "Community & Events"
coverDisplay: "text"
tags:
  - KubeCon
  - HAMi
  - Kubernetes DRA
  - GPU Sharing
  - vLLM
---

From November 9 to 12, 2026, KubeCon + CloudNativeCon North America 2026 took place in Salt Lake City, USA.

During the conference, the HAMi community took part in multiple technical sessions and developer hands-on activities, and delivered a joint talk with Red Hat engineers on Kubernetes DRA, GPU sharing, and AI inference architecture.

In addition, community Manager Jimmy Song received the 2026 CNCF Lorem Ipsum Award at this year’s conference.

From the evolution of GPU scheduling policies and heterogeneous hardware support, to exploring Kubernetes DRA integration, to developers building environments and understanding GPU virtualization firsthand, the HAMi community both showed technical progress and met developers face to face at this KubeCon.

## With Red Hat: Exploring GPU Sharing and Inference Architecture in Production

**Talk title:**

DRA + Kueue + HAMi + vLLM: A Production Architecture for Scheduler-Agnostic GPU Sharing

**Speakers:**

- Mengxuan Li (HAMi core author; co-founder and CTO, Dynamia)
- Yuchen Fama (Senior Principal Product Manager, Red Hat)

**Time:** November 9, 15:20–15:45

**Location:** Salt Palace · Level 2 · 251 D-F

In the joint talk with Red Hat, Mengxuan Li and Yuchen Fama focused on a practical question: **as AI inference services grow more complex, how can enterprises allocate GPUs more flexibly in Kubernetes while balancing utilization and inference performance?**

The talk covered DRA, Kueue, HAMi, and vLLM/llm-d, and described how GPU allocation, workload scheduling, and inference request routing can work together.

### **From GPU Slicing to Resource Scheduling**

In real inference clusters, not every workload needs a full GPU.

Besides large-model inference, embedding, reranker, classifier, and speech-model workloads also consume GPU resources continuously. For these jobs, allocating memory and compute on demand is often more flexible than assigning a whole device.

The talk described how HAMi works with Kubernetes DRA: DRA describes and allocates device resources, while HAMi-related components handle GPU slicing and in-container isolation.

Kueue can also provide workload quota management and admission control, helping teams manage how different jobs use compute.

![Architecture sketch of HAMi DRA for production inference](/images/blog/hami-kubecon-na-2026-recap/image-01.png)

### **Inference Requests Need Smarter Routing**

Another topic worth noting: **GPU slicing does not by itself solve inference performance problems.**

In multi-instance inference serving, each vLLM instance typically manages its own KV cache. If load balancing ignores cache state across instances, requests with the same prefix may land on different instances, making existing KV cache hard to reuse and increasing cache footprint and memory pressure.

When GPUs are sliced into smaller resource units, available KV cache space shrinks, and the problem becomes more visible.

The talk then introduced llm-d’s EPP (Endpoint Picker), which is aware of cache state and preferentially routes requests to inference instances that already hold the relevant prefix cache.

![Prefix-aware routing versus load-aware routing](/images/blog/hami-kubecon-na-2026-recap/image-02.png)

In an MI355X experiment shown in the talk, three vLLM instances each used 30% of HBM. At QPS 8, enabling EPP raised prefix cache hit rate from 45.2% to 92.4%, and TTFT P90 fell from 251 ms to 157 ms.

The experiment showed the link between GPU sharing and inference request routing: resource slicing makes GPU use more flexible, while cache-aware routing helps reduce cache duplication and improve response behavior.

This joint talk connected GPU resource management with how inference services actually run, and showed one concrete direction for HAMi collaborating with Kubernetes, Kueue, vLLM, llm-d, and other ecosystem projects.

## Maintainer Track: HAMi Capability Upgrades and Technical Evolution

**Talk title:**

**HAMi Levels up: Smarter Scheduling, Wider Hardware Reach and a DRA-Native Lightweight Future**

**Speaker:**

Mengxuan Li (HAMi core author; co-founder and CTO, Dynamia)

**Time:** November 10, 14:50–15:20

**Location:** Salt Palace · Level 2 · 251 D-F

As HAMi’s first Maintainer Track talk after becoming a CNCF Incubating project, this session focused on recent progress in scheduling policies, heterogeneous hardware support, and Kubernetes DRA.

Enterprise AI workloads are increasingly diverse, and GPU resource management is no longer just assigning devices. Different jobs need different memory, compute, device topology, and scheduling policies. Balancing utilization, job performance, and cluster management efficiency has become a central challenge for AI infrastructure.

Against those needs, the talk covered several of HAMi’s technical directions.

### **More Flexible Scheduling Policies**

On scheduling, HAMi continues to improve composable policies, supporting combinations such as Mutex, Spread, and NUMA.

- Mutex: constrains sharing so a Pod can exclusively use a sliced resource.
- Spread: spreads jobs across devices to reduce contention.
- NUMA: places resources with CPU NUMA nodes and GPU topology in mind, reducing performance loss from cross-NUMA access.

![Composable Mutex, Spread, and NUMA scheduling policies](/images/blog/hami-kubecon-na-2026-recap/image-03.png)

### **Flexible-MIG**

Traditional MIG usually requires preconfiguring fixed GPU partition profiles, which can lead to profile mismatches in real deployments.

Flexible-MIG tries a different flow: find a suitable partition template from the Pod’s resource request, then complete device allocation with the scheduling result.

For example, if a job needs 18 GB of memory, the system can search available templates for a matching partition instead of requiring users to carve the GPU into a fixed profile in advance.

![Flexible-MIG matching partition templates by memory request](/images/blog/hami-kubecon-na-2026-recap/image-04.png)

### **Remote-GPU**

Remote-GPU was another capability introduced in the talk.

With remote GPU access, applications running on CPU nodes without local GPUs can reach GPUs on other nodes over the network.

For scenarios that want to decouple compute from where applications are deployed, this offers another way to use resources.

### **AMD**

For AMD devices, HAMi v2.10 has full support, covering GPU partitioning, compute isolation, AMD-DRA, and actual usage monitoring.

That means users can manage different accelerators with a relatively unified request and scheduling model, reducing complexity from onboarding heterogeneous hardware.

![AMD GPU support in HAMi v2.10](/images/blog/hami-kubecon-na-2026-recap/image-05.png)

### **HAMi-DRA**

Kubernetes DRA (Dynamic Resource Allocation) provides a native mechanism for device resource management.

The talk described HAMi-DRA’s approach: a DRA Driver plugs into Kubernetes’ native allocation flow so the Kubernetes scheduler takes part in device assignment, while HAMi keeps its GPU slicing and in-container isolation capabilities.

HAMi-DRA is not a separate device-management standard; it implements device resource management on top of the Kubernetes DRA standard.

From scheduling policies and remote GPU to DRA, HAMi is expanding the scope of GPU resource management so users can choose allocation methods that fit their workloads.

![How HAMi DRA relates to Kubernetes native resource allocation](/images/blog/hami-kubecon-na-2026-recap/image-06.png)

## ContribFest: Understanding GPU Virtualization from Scratch

**Talk title:**

**GPU Virtualization: First Setup and Understanding the Device Plugin / DRA**

**Speakers:**

Reza Jelveh (HAMi Community Contributor), Mengxuan Li (HAMi core author), and Han Shen (HAMi-WebUI Reviewer)—all from Dynamia

**Time:** November 10, 16:40–18:00

**Location:** Salt Palace · Level 2 · 255 D

In this 80-minute hands-on session, the community team shifted focus to developers, guiding participants from setting up a lab environment through HAMi’s core components and how they work with Kubernetes device management.

The entire lab ran on participants’ laptops with simulated GPUs—no physical GPU required.

### Setting Up the Lab Environment

The session first walked participants through deploying a kind-based Kubernetes cluster and installing HAMi.

The lab used mock-device-plugin to simulate GPU device resources and hami-mock-monitor to expose GPU usage metrics, so participants could observe scheduling and usage even without real GPUs.

That design lowered the barrier to practice and let developers focus on HAMi’s resource-management mechanisms.

### Understanding GPU Sharing and Resource Allocation

After the basic deploy, participants created Pods with different resource requests and watched how HAMi allocated GPU resources.

For example, three Pods each requested 15 GB of memory and 30% GPU compute, sharing two simulated A100 GPUs. Another Pod requested 45 GB of memory.

Although the two GPUs on the node had more total memory than that request, the Pod still could not be scheduled because no single GPU could satisfy it.

The exercise highlighted an easy-to-miss point in GPU sharing: **enough aggregate capacity does not mean any single device can meet the job.** Real scheduling must also consider per-device capacity and current allocation.

![Pod scheduling experiment on simulated GPUs](/images/blog/hami-kubecon-na-2026-recap/image-07.png)

Participants then compared Binpack and Spread GPU scheduling policies, observing how the same requests were placed under each policy and when concentrating versus spreading resources fits better.

### Understanding How HAMi Components Work Together

The lab also walked through the full path of a Pod from submitting a resource request to using a GPU:

1. **Admission Webhook:** Updates the Pod’s scheduling configuration so the job is handled by the HAMi Scheduler.
2. **HAMi Scheduler:** Checks remaining GPU memory and compute from node device information and selects a suitable physical device.
3. **Resource allocation:** The scheduler writes GPU allocation information into the Pod’s related configuration.
4. **Device Plugin and HAMi-Core:** The HAMi Device Plugin injects devices and related files during Allocate; HAMi-Core then enforces resource limits while the container runs.

Through this flow, participants could see more clearly what the HAMi Scheduler, Device Plugin, and HAMi-Core each do, and how they work together for GPU virtualization.

### **From Device Plugin to DRA**

After covering traditional GPU resource management, the session introduced Kubernetes DRA’s model.

Through core objects such as ResourceSlice, DeviceClass, ResourceClaim, and ResourceClaimTemplate, participants learned how DRA describes devices, declares resource needs, and completes allocation.

![Four core objects in Kubernetes DRA](/images/blog/hami-kubecon-na-2026-recap/image-08.png)

The talk then covered HAMi-DRA’s path: the HAMi-DRA Webhook converts existing HAMi GPU requests into DRA ResourceClaims, Kubernetes’ native scheduling flow completes allocation, and HAMi-Core keeps in-container isolation.

### **From Learning to Contributing**

Beyond principles and hands-on practice, ContribFest also pointed to directions for further exploration:

- HAMi: start with scheduling logic, device management, and testing.
- HAMi-DRA: learn how the Webhook converts GPU requests into ResourceClaims.
- Mock Device Plugin: improve the simulated-device allocation flow.
- HAMi-WebUI: contribute to monitoring and visualization features

Developers can start from concrete tasks in testing, scheduling logic, device adaptation, and monitoring, find a Good First Issue that fits, and try submitting a Draft PR.

From installing the project and watching scheduling results, to understanding the underlying mechanisms, to finding a first contribution entry point, this ContribFest aimed to help developers not only use HAMi but also understand the project and find a way into community contribution.

![HAMi community contribution entry points shared at ContribFest](/images/blog/hami-kubecon-na-2026-recap/image-09.png)

## HAMi Booth: Meeting Developers Face to Face

Besides technical talks and hands-on sessions, HAMi also ran a community booth in the CNCF Project Pavilion.

During the conference, HAMi community members talked face to face with developers, users, and ecosystem partners from different regions about GPU sharing, heterogeneous compute scheduling, Kubernetes resource management, and related topics.

Many developers also visited the booth to learn about HAMi’s capabilities and use cases, and to discuss real-world issues and needs with community members.

These conversations helped the community hear more directly about challenges users face in GPU resource management, and created openings for later technical exchange and ecosystem collaboration.

![HAMi booth conversations at KubeCon North America](/images/blog/hami-kubecon-na-2026-recap/image-10.jpg)

![Group photo at the HAMi booth](/images/blog/hami-kubecon-na-2026-recap/image-11.jpg)

## Community Recognition

At this KubeCon, HAMi community Manager Jimmy Song received the **2026 CNCF Lorem Ipsum Award**.

From sharing cloud-native knowledge, to technical exchange in AI infrastructure, to HAMi community building and ecosystem collaboration, Jimmy has long invested in technical communication, developer engagement, and open-source ecosystem building—helping more developers and industry partners learn about and take part in these practices.

The award recognizes Jimmy’s individual work and also shows the value of sustained commitment. Whether through technical talks, community maintenance, or collaboration with developers and partners, open-source communities grow through everyone’s contributions.

Congratulations to Jimmy, and thanks to all maintainers, contributors, and ecosystem partners for their ongoing support and shared effort.

## Keep Exploring: Making Heterogeneous Compute Management More Flexible

Looking back on this KubeCon, HAMi showed not only current GPU sharing and virtualization capabilities, but also ongoing work on resource scheduling, heterogeneous hardware support, and Kubernetes-native device management.

On one side, Binpack, Spread, and topology-aware scheduling help GPUs better match different workload needs. On the other, HAMi-DRA is exploring paths to work with Kubernetes’ native resource management and different schedulers.

Progress on these fronts depends on maintainers, contributors, users, and ecosystem partners working together.

HAMi will continue exploring GPU virtualization and unified scheduling for heterogeneous compute, advancing project capabilities, hardware support, and ecosystem collaboration.

We look forward to meeting more developers at the next community event—and welcome you to join the HAMi community to share ideas, feedback, and contributions!
