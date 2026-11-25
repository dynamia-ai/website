---
title: "As Models Grow Larger, Why Do Enterprises Still Need Fine-Grained Compute Scheduling?"
date: "2026-11-17"
author: "Dynamia"
excerpt: "In a shared resource pool, enterprises must support full-GPU and multi-GPU deployments for large models while also enabling on-demand sharing for lightweight inference, R&D, and batch jobs. Drawing on model usage data and production cluster research, this article discusses how to allocate GPUs by workload needs and manage heterogeneous compute shared across teams."
category: "Technical Deep Dive"
coverDisplay: "text"
tags:
  - GPU Scheduling
  - GPU Virtualization
  - Heterogeneous Compute
  - HAMi
---

**_From model trends and hyperscale production clusters to enterprise AI applications: the next stage of compute infrastructure_**

Over the past two years, model capability has been a central focus of the AI industry. From larger parameter counts and stronger reasoning to agents that execute complex tasks, AI applications have expanded from content generation into enterprise production workflows.

As models grow larger and a single GPU’s memory can no longer meet some models’ runtime needs, why do enterprises still need GPU virtualization? As full-GPU and multi-GPU deployments become more common, does the value of GPU sharing and resource slicing diminish?

For an individual large model, a full GPU—or multiple GPUs—is often the better fit. But production environments also run retrieval, ranking, lightweight inference, and R&D validation. These workloads differ in memory, compute, and latency requirements, and some need only a fraction of one GPU.

**The coexistence of full-GPU, multi-GPU, and on-demand sharing needs is exactly why enterprises need fine-grained compute scheduling.** To see how these needs shape resource allocation, start with which models and workloads enterprises actually run.

## Models Are Getting Larger, but Enterprises Do Not Run Only One Kind

There have long been two views of where AI models are headed.

One holds that capability will keep concentrating in ever-larger frontier models that gradually cover more tasks. The other holds that smaller models, with advantages in cost, deployment, and response speed, will see broader use in enterprise scenarios.

OpenRouter’s usage data offers one angle on this.

In December 2025, OpenRouter and a16z jointly published *[State of AI: An Empirical 100 Trillion Token Study](https://openrouter.ai/state-of-ai/)*, analyzing model usage, developer behavior, and AI application trends from more than 100 trillion tokens of real interaction data on the OpenRouter platform.

![Token usage share changes across open-weight models of different sizes](/images/blog/fine-grained-gpu-scheduling-for-ai-models/image-01-en.png)

The study grouped open-weight models into three size bands: small, medium, and large.

It found that the usage mix of open-source models shifted clearly over the past year: small models’ token share declined, while medium and large models’ shares grew.

The report offered a notable takeaway:

**Medium is the New Small—medium models are becoming the new small models.**

![Composition of open-weight models by size](/images/blog/fine-grained-gpu-scheduling-for-ai-models/image-02-en.png)

Medium models give developers a way to trade off capability against deployment cost.

OpenRouter’s call data shows how usage by model size is changing; [Menlo Ventures’ report](https://menlovc.com/perspective/2026-the-state-of-enterprise-ai/) shows that enterprises remain willing to choose stronger models for high-value tasks. In practice, enterprises pick models by task difficulty, accuracy, latency, and deployment cost.

For example, an enterprise AI system may handle the following tasks at once, with model choice varying by task:

- Large models: complex reasoning, planning, and decision-making;
- Medium models: domain-specific work and some production inference;
- Small models: relatively fixed tasks such as classification, information extraction, and intent recognition;
- Embedding and rerank models: retrieval and relevance ranking;
- Multimodal models: images, speech, video, and other data types.

Some of these services can be called via cloud APIs. For enterprises that build their own AI infrastructure, deploy privately, or operate GPU pools, the more direct question is: when tasks with different memory, compute, and latency needs enter the same pool, can existing GPUs be assigned to the workloads that need them?

## As AI Enters Production, Compute Efficiency Must Be Viewed at Cluster Scale

The previous section covered which models and workloads enterprises use. In a production cluster, whether those needs can be met also depends on how GPUs, CPUs, networking, and other resources are distributed across nodes. An Alibaba study of a production cluster observed this question in a real operating environment.

In July 2026, the USENIX OSDI 2026 paper *[Heterogeneity at Hyperscale: Characterization and Scheduling of Large Production AI Clusters at Alibaba](https://www.usenix.org/conference/osdi26/presentation/li-suyi)* presented a systematic study of Alibaba’s Serverless Infrastructure (ASI) production clusters.

![Overview of the Alibaba ASI production cluster study sample](/images/blog/fine-grained-gpu-scheduling-for-ai-models/image-03-en.png)

The research was based on six months of production data covering 155,410 GPUs from different vendors and generations, 81 business units, and workloads including short-lived R&D, model training, online inference, and offline inference.

**The study found that even when GPU demand is strong, some idle capacity in the cluster remains hard to allocate.** That relates to how resources are placed on nodes, what CPU and network tasks require, and reservation policies for production services. The issues fall into four categories.

**1. Node-level resource fragmentation**

Idle GPUs are scattered across nodes. Although the cluster as a whole has spare capacity, it cannot satisfy some jobs’ requirements for GPU count and node resource combinations.

**2. CPU–GPU mismatch**

Some nodes have idle GPUs but lack enough or matching CPU resources, so those GPUs cannot be used effectively by jobs.

**3. Network topology constraints**

For jobs that need multiple GPUs working together, interconnects and topology placement affect whether a job can be deployed effectively. Even if idle GPUs exist in the cluster, they may not meet the job’s communication requirements.

**4. Production capacity reservation**

To handle traffic peaks and keep services stable, enterprises typically reserve some compute capacity. That capacity may sit idle at times, but it cannot be unconditionally handed to other jobs.

To address these issues, the research team deployed two optimizations in production, improving efficiency at the levels of cluster resource organization and job scheduling.

**First, GPU Defragmentation: cluster-level consolidation of fragmented resources.**

This approach adjusts how GPUs are distributed across nodes to reduce allocation difficulty caused by scattered leftovers.

Results showed that after consolidation, the number of nodes with leftover resources fell by 20.2%.

**Second, let preemptible jobs use temporarily idle GPUs.**

Spot GPUs are lower-priced, reclaimable GPU capacity suited to jobs that can tolerate interruption. In the [OSDI 2026 paper](https://www.usenix.org/conference/osdi26/presentation/li-suyi), Alibaba named this scheduling approach **SpotGPU**: when a high-priority job temporarily releases GPUs, preemptible jobs can use that capacity; when the high-priority job needs to resume, the scheduler reclaims the resources and preferentially interrupts jobs whose compute loss would be smaller.

In the clusters observed in the paper, introducing this approach raised the GPU allocation rate from **68% to 93%**. To be clear: 93% is the GPU resource allocation rate, not GPU compute utilization. The two measure different things.

![SpotGPU scheduling and changes in GPU allocation rate](/images/blog/fine-grained-gpu-scheduling-for-ai-models/image-04-en.png)

These two practices show that for hyperscale heterogeneous GPU clusters, resource consolidation and job scheduling can free capacity that was hard to allocate effectively—without relying solely on buying more hardware.

**But the study has another finding worth attention: in this production cluster, because GPU sharing was uncommon, fine-grained resource fragmentation inside a single GPU was not the main efficiency bottleneck.**

That finding should be read in the context of the environment studied. Intra-GPU fragmentation means leftover capacity on one GPU that is hard to allocate further; cluster fragmentation means idle GPUs scattered across nodes that cannot form the resource combination a job needs. In this sample cluster, node placement, CPU pairing, network topology, and production reservations more directly determined whether resources could be allocated.

**Cluster allocation efficiency depends on whether devices, nodes, and supporting resources can form the combinations jobs need.** Looking only at whether a GPU is occupied says little about which additional workloads the existing capacity can still take on.

## Full GPU, Multi-GPU, or Sharing—How Should Enterprises Choose?

One large-model job may need several GPUs working together; several lightweight inference instances may share one GPU. In the first case, the question is whether the cluster can assemble a set of GPUs with suitable memory, compute, and communication. In the second, it is whether each instance on a shared GPU can get enough resources and still meet latency targets. Choosing full-GPU, multi-GPU, or sharing starts from these two kinds of demand, then depends on the specific workload.

**For large-scale model training and high-load inference, a full GPU—or multi-GPU coordination—may be the more reasonable choice.**

These jobs usually need sustained, stable compute and place high demands on inter-GPU communication, memory capacity, and overall throughput. Forcing sharing can add resource contention and hurt efficiency.

**For inference serving of multiple light-load models, sharing may yield better utilization.**

For example, an enterprise may run several classification, embedding, rerank, and domain-specific models at once. Their traffic, memory needs, and compute load are not the same.

If every model monopolizes a GPU, some capacity may sit idle for long periods while other jobs wait for a GPU.

**For R&D testing and offline batch work, flexible allocation is also valuable.**

Notebooks, model debugging, parameter experiments, and batch evaluation often do not need to monopolize a full GPU continuously. Sensible sharing, quotas, and scheduling can reduce unnecessary hold on capacity.

After choosing how to use GPUs, check whether that choice still works at peak: whether multi-GPU jobs can get grouped resources, and whether shared jobs meet throughput and latency targets. When multiple teams run on the same capacity over time, these allocation choices also need to be enforced day to day through quotas, priorities, and usage records.

## From GPU Virtualization to Heterogeneous Compute Governance

How a single job uses GPUs only solves one allocation. When multiple teams share compute over time, the platform must keep answering: where resources sit across clusters, how much each team can use, who is protected when capacity is tight, and how much of the allocated capacity is actually used.

Enterprises may face all of the following:

- AI models of different sizes and architectures;
- Training, inference, R&D, and batch workloads;
- Different types of compute, such as NVIDIA GPUs and Chinese GPUs;
- Multi-department, multi-tenant demand at different priorities;
- Production services with different requirements for throughput, latency, stability, and cost.

In that environment, simply adding more hardware does not solve every resource-management problem.

What enterprises need is resource-management capability that connects upper-layer AI workloads with underlying heterogeneous hardware.

It should cover at least these layers:

**1. Unified management of heterogeneous resources**

Provide as consistent a management and usage model as possible across accelerators from different vendors and of different models.

**2. Flexible resource allocation**

Choose among full-GPU use, GPU sharing, and different resource shares according to actual job needs.

**3. Isolation and performance guarantees**

Avoid uncontrolled contention between jobs, and provide performance guarantees that match business requirements.

**4. Multi-tenancy and resource governance**

Give departments, teams, and businesses clear quotas, priorities, and usage boundaries.

**5. Observability and cost management**

Know not only who was allocated GPUs, but also actual usage, job efficiency, and cost outcomes.

These capabilities do not all need to live in a single component. GPU virtualization, Kubernetes-native device resource management, and various job schedulers need to work together as an enterprise AI infrastructure resource-management system.

## From Compute Management to Infrastructure Efficiency: Dynamia’s Long-Term Practice

When multiple teams start sharing different types of GPUs, the quotas, isolation, and usage records discussed above need to land in the clusters and workflows enterprises already have.

**Dynamia was founded by the initiators and core maintainers of the CNCF project HAMi, and is dedicated to building an open-source kernel for AI infrastructure. We help AI teams make heterogeneous GPUs and AI chips easier to use, more efficient, and more governable—turning complex compute into cloud-native infrastructure that can be shared, isolated, and consumed on demand.**

![From GPU virtualization to heterogeneous compute governance](/images/blog/fine-grained-gpu-scheduling-for-ai-models/image-05-en.png)

Building on open-source HAMi, Dynamia offers compute-scheduling products and technical services for enterprise production, covering GPU allocation for individual jobs through multi-team, multi-cluster resource management. At the device layer, HAMi Enterprise lets shareable workloads use GPUs by memory and compute needs, and continuously supplies the compute that large-model token factories need for inference. At the platform layer, HAMi AI Platform helps teams see resource distribution and usage across connected clusters, set team quotas and access controls, and—on top of Enterprise capabilities—bring model deployment, inference serving, runtime observability, and resource operations onto one platform. Topology matching for multi-GPU jobs, cluster resource consolidation, and job scheduling still need to work with the corresponding cluster scheduling components.

As AI models and applications keep evolving, Dynamia will continue to deepen foundational AI infrastructure technology and, with the open-source community, hardware vendors, platform partners, and enterprise users, advance the heterogeneous compute ecosystem.

### References

1. OpenRouter & Andreessen Horowitz, *State of AI: An Empirical 100 Trillion Token Study*, December 2025.  
   [https://openrouter.ai/state-of-ai/](https://openrouter.ai/state-of-ai/)
2. Suyi Li et al., *Heterogeneity at Hyperscale: Characterization and Scheduling of Large Production AI Clusters at Alibaba*, USENIX OSDI 2026.  
   [https://www.usenix.org/conference/osdi26/presentation/li-suyi](https://www.usenix.org/conference/osdi26/presentation/li-suyi)
3. Menlo Ventures, *2026: The State of Enterprise AI*, November 2026.  
   [https://menlovc.com/perspective/2026-the-state-of-enterprise-ai/](https://menlovc.com/perspective/2026-the-state-of-enterprise-ai/)

*Note: Industry spend figures cited in this article are estimates from research organizations; model usage data comes from a specific platform sample; GPU cluster findings come from a specific production environment. Samples and statistical definitions differ across studies and should not be compared directly.*
