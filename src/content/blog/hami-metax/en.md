---
title: '[Deep Dive] HAMi × MetaX | sGPU Sharing, Three-Tier QoS, Topology-Aware Scheduling, and Full WebUI Support'
coverTitle: sGPU Sharing, Three-Tier QoS, Topology-Aware Scheduling, and Full WebUI Support
date: '2025-10-13'
excerpt: >-
  HAMi v2.7.0 deeply integrates with MetaX to deliver a unified scheduling
  solution with sGPU sharing, three-tier QoS, topology-aware scheduling, and
  WebUI support. This article examines the core implementation from features
  through to code.
author: Dynamia
tags:
  - HAMi
  - MetaX
  - sGPU
  - GPU Sharing
  - QoS
  - Topology-Aware Scheduling
  - WebUI
  - MetaXLink
  - DevicePlugin
  - binpack
  - spread
  - GPU Virtualization
category: Integration & Ecosystem
coverImage: /images/blog/hami-MetaX/coverpage-Hami-MetaX.png
language: en
linktitle: HAMi Support for MetaX GPU
---


Recently, the Dynamia team and the MetaX team worked closely together and, based on the XiCloud C-series products, jointly shipped a unified scheduling solution in HAMi v2.7.0. Through deep integration, the solution delivers sGPU sharing, three-tier QoS, topology-aware scheduling, and full WebUI support. It aims to significantly improve resource utilization and job execution efficiency for large-scale AI training and inference, and provides solid support for building a domestically controllable AI compute foundation.

HAMi v2.7.0 provides a unified scheduling solution for MetaX GPUs. Building on a feature overview, this article digs into the code and examines HAMi’s concrete design and implementation for MetaX sGPU sharing, topology-aware scheduling, QoS policies, and related capabilities.

## 1. Core Capabilities Overview

HAMi provides a complete virtualization and scheduling optimization stack for MetaX GPUs. Core capabilities include:

1. **GPU sharing (sGPU) and resource isolation**: Multiple container jobs can share one physical GPU, with precise limits on each job’s memory (for example 4G) and compute core ratio (vcore, for example 60%) for isolation — significantly improving utilization.
2. **sGPU topology-aware scheduling**: (New in v2.7.0) For multi-GPU servers, the scheduler understands interconnect topology among GPUs (such as MetaXLink and PCIe Switch) and preferentially selects the highest-bandwidth GPU combination for multi-GPU sGPU jobs, improving training performance.
3. **Quality of Service (QoS) policies**: (New in v2.7.0) sGPU jobs can be assigned different service levels — BestEffort, FixedShare, and BurstShare — to meet different business needs.
4. **Health checks and monitoring**: (New in v2.7.0) Device health checks are provided, and MetaX monitoring is wired end-to-end into HAMi-WebUI so heterogeneous metrics appear more intuitively and the cluster’s resource allocation and usage can be visualized.
5. **GPU topology-aware scheduling**: Based on precomputed scores from the DevicePlugin, multi-GPU jobs preferentially receive the highest-bandwidth GPU combinations, with support for `binpack` and `spread` policies for finer resource placement.

## 2. sGPU Topology-Aware Scheduling: Intelligent Selection

When a server hosts multiple GPUs, pairs of cards have near/far (high/low bandwidth) relationships depending on whether they sit under the same PCIe Switch or MetaXLink. All cards on the server form a topology accordingly, as shown below:
![MetaX GPU topology relationship diagram](/images/blog/hami-MetaX/im1.png)

HAMi’s topology selection for MetaX GPUs is designed specifically for exclusive multi-GPU jobs. It is triggered by requesting the `metax-tech.com/sgpu` resource while leaving `vcore` unspecified (so it defaults to 100). The core goal is to keep the job inside a high-speed interconnect GPU “group,” maximizing communication efficiency.

The core idea is: **a two-stage decision mechanism that combines intra-node “priority” with inter-node “quantitative scoring.”**

First, inside each node, a set of **deterministic priority rules** directly picks the best GPU combination, preferably allocating from a single high-speed interconnect domain (linkZone).

Then, among candidate nodes, a **scoring formula that combines “allocation quality” and “topology loss”** quantitatively evaluates which node is best not only for the current job, but also for the cluster’s future resource layout.

### Stage 1: Intra-Node Device Selection — Deterministic, Rule-First Decisions

This stage’s goal is to find a topologically optimal GPU combination inside the node. It is not a scoring contest, but a deterministic decision tree with strict priorities.

#### Workflow Details

1. Input: the list of all candidate GPUs on the node that satisfy the Pod’s resource requests (memory, compute, and so on).
2. Grouping: the algorithm first groups those candidates by linkZone ID (high-speed interconnect domain identifier).
3. Decision tree: the algorithm then decides in the following priority order:
   - First priority (best: satisfied within one domain): Check whether any linkZone group contains enough GPUs to satisfy the entire job.
   - Second priority (next-best: cross-domain combination): Create a new empty list, then walk linkZone groups one by one, appending all GPUs from each until the list meets the job’s GPU count.
   - Third priority (fallback: fill with devices lacking interconnect info): If, after walking all linkZone groups, the list still does not have enough GPUs, fill the remainder with GPUs that have no linkZone information.

**Essence of Stage 1**: Through forced priority rules, lock in the theoretically highest-communication-performance GPU combination inside the node as efficiently as possible.

This stage is implemented by `prioritizeExclusiveDevices` in `pkg/device/metax/sdevice.go`.
Its core is to preferentially select device combinations that can be satisfied by a single `linkZone`.

```go
// File: pkg/device/metax/sdevice.go

func prioritizeExclusiveDevices(candidateDevices device.ContainerDevices, require int) device.ContainerDevices {
        // ... (code groups all candidate GPUs by linkZone) ...
        // linkDevices: stores all device groups that have a linkZone
        // otherDevices: stores all devices without a linkZone

        // 1. pickup devices within MetaLink (first priority)
        for _, devices := range linkDevices {
                if len(devices) >= require {
                        klog.V(5).Infof("prioritize exclusive devices: best result, within metalink")
                        return devices[0:require] // One linkZone satisfies the full request — return immediately as the best result
                }
        }

        prioritizeDevices := device.ContainerDevices{}

        // 2. pickup devices cross MetaLink (second priority)
        // ... (if a single linkZone is not enough, gather devices across linkZones) ...

        // 3. if not satisfied, pick up devices no MetaLink (third priority)
        // ... (fill remaining slots from otherDevices) ...

        return ... 
}
```

**Design rationale**: This rule-first design avoids the huge cost of brute-force scoring all `C(n, k)` combinations. It rests on a core consensus: intra-domain communication performs far better than cross-domain communication. Therefore, once a qualifying “best” result (first priority) is found, no other combination needs to be considered — greatly improving scheduling efficiency.
![MetaX device priority selection flowchart](/images/blog/hami-MetaX/im2.png)

### Stage 2: Inter-Node Scoring — Forward-Looking Quantitative Evaluation

When multiple nodes pass Stage 1 (each can provide a valid GPU combination), the scheduler must make a final choice among those candidates. This stage uses quantitative scoring.

 **Scoring mechanism details**

This stage is implemented by `scoreExclusiveDevices` in `pkg/device/metax/sdevice.go`:

```go
// File: pkg/device/metax/sdevice.go

func scoreExclusiveDevices(podDevices device.PodSingleDevice, previous []*device.DeviceUsage) int {
        // ... (code builds allocatedDevices, availableDevices, restDevices lists) ...

        // Compute three core scores
        availableScore := availableDevices.Score() // Total score before allocation
        allocatedScore := allocatedDevices.Score() // Score of the allocated combination
        restScore := restDevices.Score()         // Score of remaining devices

        // Compute topology loss score
        lossScore := availableScore - allocatedScore - restScore

        // Compute final score, amplifying the weight of allocatedScore
        result := 10*allocatedScore - lossScore
        klog.V(5).Infof("calcScore result[%d] >>> availableScore[%d], allocatedScore[%d], restScore[%d], lossScore[%d]",
                result, availableScore, allocatedScore, restScore, lossScore)

        return result
}
```

Each candidate node receives a final score; the highest wins. The final score formula is:

Final Score = (10 * allocatedScore) - lossScore

Breaking the formula down:

1. allocatedScore (allocation quality): Measures how tightly interconnected the GPU combination chosen in Stage 1 is. The more device pairs inside the combination that share the same linkZone, the higher this score. `10 * allocatedScore` shows that the scheduler heavily prioritizes a high-quality combination for the current job. Multiplying by 10 makes this term dominant in the final score.
2. lossScore (topology loss / fragmentation penalty): A critical “foresight” metric. It measures: “To complete this allocation, how much did we damage the topological integrity of the remaining, unallocated GPUs on the node?”

- Calculation: lossScore = (total score before allocation) − (allocated combination score) − (remaining devices score)
- This means the scheduler penalizes allocations that fragment the node’s topology resources. When allocation quality scores are equal, this term matters, protecting the cluster’s ability to keep high-quality, intact topology resources for future large jobs.

**Bottom line**: This two-stage design first uses rigid priority rules to pick the best combination inside each node, then uses a scoring formula that balances “current benefit” and “long-term planning” to make a globally better choice among all candidates.
![MetaX two-stage topology scheduling architecture](/images/blog/hami-MetaX/im3.png)

## 3. Quality of Service (QoS): Isolation via “Same-Type Aggregation”

HAMi v2.7.0 provides three QoS policies for MetaX sGPU:

1. BestEffort: The default. Resources are allocated on a best-effort basis to maximize utilization.
2. FixedShare: Strictly guarantees the compute (vcore) and memory (vmemory) allocated to the job, with stable performance unaffected by other jobs.
3. BurstShare: Has a resource share, but allows use of idle GPU capacity when available — suitable for workloads with bursty load.

### Design Considerations

In a shared environment, the hardest challenge is isolating workloads of different service levels. Rather than implementing complex dynamic preemption in the lower-level driver, the designers chose a simpler, more efficient approach: **physical grouping at the scheduling entry point**. A simple rule ensures that jobs of different QoS types are never co-located on the same physical card from the start, achieving isolation at the root.

### Core Principle and Code Implementation

The core of this logic is `checkDeviceQos`, which can be summarized in one sentence:

**Once the first job lands on a physical GPU, that card will only accept subsequent jobs of the same QoS type.**

In other words, a GPU’s “identity” is decided when the first Pod occupies it.

- If the first Pod is FixedShare, the card becomes a FixedShare-only card.
- If the first Pod is BestEffort, the card becomes a BestEffort-only card.

Any Pod that tries to enter a card with a mismatched identity is rejected at scheduling time. The core logic is:

1. **Check whether the GPU is idle**: If fully idle, any QoS job may land, and that job sets the card’s QoS mode.
2. **Check whether QoS matches**: If the GPU is already occupied, the new job’s QoS annotation **must exactly equal** the QoS mode of existing jobs on the card; otherwise scheduling is rejected.
3. **Exclusive-job exception**: Jobs requesting 100% compute do not share, so they are not constrained by this rule.
![MetaX QoS same-type aggregation isolation flowchart](/images/blog/hami-MetaX/p3.png)

```go
// file: pkg/device/metax/sdevice.go
// func: checkDeviceQos (simplified logic)

func (sdev *MetaxSDevices) checkDeviceQos(reqQos string, usage device.DeviceUsage, request device.ContainerDeviceRequest) bool {
        if usage.Used == 0 { // Idle card
                return true
        }

        if request.Coresreq == 100 { // Exclusive card
                return true
        }

    // ... obtain devQos ...
        if devQos == "" || reqQos == devQos { // Core matching rule
                return true
        } else {
                return false
        }
}
```

This simple “same-type aggregation” rule naturally forms logical “QoS resource pools” in the cluster — for example, some cards become FixedShare-only while others become BestEffort-only — achieving elegant, efficient isolation.

![MetaX QoS resource pool auto-grouping diagram](/images/blog/hami-MetaX/p4.png)

## 4. WebUI Support

The WebUI now fully supports MetaX GPU monitoring metrics, providing an intuitive overview of resource usage.
![HAMi WebUI MetaX GPU monitoring dashboard](/images/blog/hami-MetaX/p5.png)

## 5. Node Scheduling Policies: Binpack and Spread

When users request the traditional `metax-tech.com/gpu` resource, HAMi’s binpack and spread policies influence scheduling by passively reading static scores.

This mechanism depends on scores that the MetaX DevicePlugin precomputes and annotates on the node. The scheduler reads those scores at decision time and does not perform any real-time topology computation.

- **`spread` mode**: The scheduler reads the `metax-tech.com/gpu.topology.scores` (`MetaxAnnotationScore`) annotation. To align with HAMi’s `spread` logic that “lower score ranks first,” the value is inverted (`score = 2000 - score`). That means a node with a higher precomputed `score` ends up with a lower HAMi final score, ranks earlier, and is more likely to be scheduled — selecting the best topology.
- **`binpack` mode**: The scheduler reads the node’s `metax-tech.com/gpu.topology.losses` (`MetaxAnnotationLoss`) annotation. The lower this `loss`, the smaller the resource “loss,” and the higher the node score (`score = 2000 - loss`), so the node is preferred — keeping the remaining resources’ topology as intact as possible.

The core code is in `pkg/device/metax/device.go`:

```go
// File: pkg/device/metax/device.go

func (dev *MetaxDevices) ScoreNode(...) float32 {
        res := float32(0)
        if policy == string(util.NodeSchedulerPolicyBinpack) {
                lossAnno, ok := node.Annotations[MetaxAnnotationLoss]
                if ok {
                        loss := parseMetaxAnnos(lossAnno, sum)
                        res = 2000 - loss
                }
        } else if policy == string(util.NodeSchedulerPolicySpread) {
                scoreAnno, ok := node.Annotations[MetaxAnnotationScore]
                if ok {
                        score := parseMetaxAnnos(scoreAnno, sum)
                        res = 2000 - score
                }
        }
        return res
}
```

>MetaXLink takes priority over PCIe Switch, with two meanings:
>
>1. If two cards have both a MetaXLink connection and a PCIe Switch connection, they are treated as MetaXLink-connected;
>2. When both MetaXLink-connected remaining GPU resources and PCIe Switch-connected remaining GPU resources on the server can satisfy a job, MetaXLink-connected resources are allocated.
>
- When a job uses `node-scheduler-policy=spread`, allocated GPU resources are placed under the same MetaXLink or PCIe Switch as much as possible, as shown below:

![MetaX topology-aware scheduling Spread policy diagram](/images/blog/hami-MetaX/p1.png)

- When using `node-scheduler-policy=binpack`, after allocation the remaining resources stay as intact as possible, as shown below:

![MetaX topology-aware scheduling Binpack policy diagram](/images/blog/hami-MetaX/p2.png)

## 6. How to Use

### Topology-Aware Scheduling

Control `binpack` or `spread` behavior with the `hami.io/node-scheduler-policy` annotation.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: gpu-pod2
  annotations: 
    # binpack policy: for 'gpu' resources, the scheduler reads the node annotation 'metax-tech.com/gpu.topology.losses'.
    # Scoring uses `2000 - loss`, so nodes with lower loss score higher and are preferred, keeping remaining topology as intact as possible.
    hami.io/node-scheduler-policy: "binpack" 
spec:
  containers:
    - name: ubuntu-container
      resources:
        limits:
          metax-tech.com/gpu: 2

apiVersion: v1
kind: Pod
metadata:
  name: gpu-pod3
  annotations: 
    # spread policy: for 'gpu' resources, the scheduler reads the node annotation 'metax-tech.com/gpu.topology.scores'.
    # Scoring uses `2000 - score`. Combined with HAMi's spread logic, this prefers nodes with lower final scores (i.e., higher score annotation values) — the best topology nodes.
    hami.io/node-scheduler-policy: "spread"
spec:
# ...
```

#### sGPU Topology-Aware Scheduling

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: gpu-pod1
  annotations:
    metax-tech.com/sgpu-topology-aware: "true" # Enable topology-aware scheduling
spec:
  containers:
    - name: ubuntu-container
      resources:
        limits:
          # Request 4 full GPUs. Because vcore is unspecified, it defaults to 100, triggering exclusive mode and topology awareness
          metax-tech.com/sgpu: 4
# ...
```

#### sGPU Sharing and QoS Policies

Specify QoS with the `metax-tech.com/sgpu-qos-policy` annotation.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: gpu-pod
  annotations:
    metax-tech.com/sgpu-qos-policy: "fixed-share" # or "best-effort", "burst-share"
spec:
  containers:
    - name: ubuntu-container
      resources:
        limits:
          metax-tech.com/sgpu: 1
          metax-tech.com/vcore: 60
          metax-tech.com/vmemory: 4
```

## 7. Summary

HAMi’s deep support for MetaX GPUs reflects a clear engineering philosophy: pursue peak performance on critical paths, while simplifying non-critical paths to keep the system stable and efficient. Its two-stage topology selection balances the current job with long-term cluster health, and the “same-type aggregation” QoS policy achieves effective service isolation at very low complexity. Together, these designs form a mature, efficient GPU scheduling and sharing solution.

This deep collaboration between HAMi and MetaX sets a model for co-innovation between community-driven open source and hardware vendors. The jointly designed and developed features not only constitute a mature, efficient GPU scheduling and sharing solution, but also inject new momentum into the domestic AI ecosystem.

---

## References

- **Documentation**: [MetaX GPU support notes](https://github.com/Project-HAMi/HAMi/blob/master/docs/metax-support_cn.md)
- **Examples**: [MetaX GPU examples](https://github.com/Project-HAMi/HAMi/tree/master/examples/metax)
  - [https://github.com/Project-HAMi/HAMi/pull/1123](https://github.com/Project-HAMi/HAMi/pull/1123)
  - [https://github.com/Project-HAMi/HAMi/pull/1193](https://github.com/Project-HAMi/HAMi/pull/1193)
  - [https://github.com/Project-HAMi/HAMi/pull/1295](https://github.com/Project-HAMi/HAMi/pull/1295)
  - [https://github.com/Project-HAMi/HAMi-WebUI/pull/46](https://github.com/Project-HAMi/HAMi-WebUI/pull/46)

Our sincere thanks again to community developers @Kyrie336 and @darker-thanBlack for contributing these features! Special thanks also to the **MetaX team** for deep involvement throughout feature design and implementation, and for seamless collaboration with the Dynamia team (for community reprints: the HAMi maintainer team), providing solid support for successfully landing this series of features.

---

## About MetaX

MetaX focuses on independently developing full-stack high-performance GPU chips and computing platforms, delivering high-efficiency, highly general-purpose compute for intelligent computing, general computing, cloud rendering, and other frontier fields — supporting digital economy growth.

## About Dynamia

Dynamia builds global solutions for heterogeneous compute scheduling and unified management. The CNCF open-source project it initiated, HAMi, is the only open-source project focused on heterogeneous compute virtualization. Through flexible, reliable, on-demand, elastic GPU virtualization, it improves resource utilization and helps raise compute efficiency in the AI era.
