---
title: Core-Level Sharing and Policy-Based Topology Scheduling for AWS Trainium and Inferentia with HAMi
coverTitle: Core-Level Sharing and Policy-Based Topology Scheduling for AWS Trainium and Inferentia with HAMi
date: '2025-11-11'
excerpt: >-
  A deep dive into how HAMi v2.7.0 delivers core-level sharing and policy-based
  topology scheduling for AWS Trainium and Inferentia, using a prior-knowledge
  scheduling algorithm that keeps performance stable while significantly
  reducing management cost.
author: Dynamia
tags:
  - HAMi
  - AWS Neuron
  - Trainium
  - Inferentia
  - Topology Scheduling
  - Core-Level Sharing
  - Heterogeneous Compute
  - Kubernetes
  - Deep Dive
category: Technical Deep Dive
coverImage: /images/blog/hami-aws-neuron-topology/cover-en.png
language: en
linktitle: AWS Neuron Topology-Aware Scheduling
---
AWS’s custom **AWS Trainium** and **Inferentia** chips offer clear advantages for building more efficient, cost-controllable AI acceleration infrastructure. The goal is not only higher compute, but also better power and cost efficiency. **Inferentia2** makes significant gains on performance per watt (perf/W), and **Trainium2** can save roughly 30–40% cost versus comparable GPU instances, so their adoption continues to grow in large-scale inference and training with strong price/performance.

However, as enterprises deploy more kinds of heterogeneous compute (GPUs, NPUs, and more), different chip types are typically managed by separate drivers and scheduling components, making unified scheduling and monitoring hard at a single layer. That fragments resource utilization, job orchestration, and observability, and increases the management complexity of multi-accelerator clusters.

**HAMi** is designed to address these pain points. It is a heterogeneous device management middleware for Kubernetes, supporting accelerators including GPUs, NPUs, and AWS Neuron chips. Through **GPU virtualization, core-level sharing, topology-aware scheduling, and unified observability**, HAMi can pool heterogeneous compute and schedule it finely in the same cluster — significantly improving device utilization and reducing operational complexity. For organizations that must manage multiple accelerator types together, HAMi provides a unified, efficient, and observable compute foundation.

In **HAMi v2.7.0**, deep integration for **AWS Trainium and Inferentia** is complete, delivering **core-level sharing, policy-based topology scheduling, and unified observability**. This preserves AWS’s native performance optimization strategies while giving enterprises a consistent heterogeneous resource management experience in Kubernetes — **keeping performance stable while significantly reducing scheduling and management cost**.

This article starts from the code and examines HAMi’s concrete design and implementation for AWS Neuron core-level sharing, topology-aware scheduling, and related capabilities.

### 1. Core Capabilities Overview

1. **Dual-granularity sharing**: HAMi supports both **device-level (`aws.amazon.com/neuron`)** and **core-level (`aws.amazon.com/neuroncore`)** resource allocation. Users can request an entire Neuron device or individual NeuronCores on demand, greatly improving utilization of expensive chips.
2. **Policy-based topology scheduling**: For multi-device jobs that need multiple Neuron devices, the HAMi scheduler uses an efficient policy-based algorithm keyed to EC2 instance type to place jobs on the device combinations with the highest communication efficiency.
3. **Unified monitoring view**: Neuron devices are integrated seamlessly into HAMi’s vGPU monitoring system. Users can use Prometheus and other standard tools to see allocation for each Neuron device or core, matching the monitoring experience of GPUs and other heterogeneous hardware.

### 2. Core Principle: Policy-Based Topology Scheduling from Prior Knowledge

Unlike approaches that require real-time scanning of hardware topology, HAMi’s topology-aware scheduling for AWS Neuron is fundamentally **policy-based scheduling driven by prior knowledge**. This design philosophy aligns with AWS’s official Neuron Scheduler Extension: identify the instance type and apply preset topology allocation rules that guarantee performance, rather than performing complex real-time computation. Deep understanding of AWS’s standardized hardware deployments (EC2 instances) is encoded directly as internal scheduling rules.

The implementation can be summarized in three points:

1. **Identify instance type**: The scheduler first reads the node’s EC2 instance type (for example, Trainium-series trn1 and Inferentia-series inf1/inf2) as the **sole basis** for judging hardware topology.
2. **Linear abstraction**: All Neuron devices on a node are treated as a **contiguous numbered list** starting from `0` (for example `[0, 1, 2, ...]`), not as a complex topology graph.
3. **Enforce contiguous allocation**: This is the core rule. When a job requests `N` devices, the scheduler must find a **fully free contiguous block of length `N`** in that numbered list. If the node has enough free devices but they are not adjacent, scheduling still fails.

### 3. Implementation: Code Deep Dive

Below we dig into the code to see how these principles are implemented.

#### **1. Foundation of Topology Awareness: Identifying Instance Type**

HAMi does not scan hardware directly; it perceives topology through a simpler indirect approach:

* **Identify instance type**: When the Device Plugin starts, it reads `node.kubernetes.io/instance-type` from the node’s `label` and stores it in each virtual device object’s `CustomInfo[AWSNodeType]` field. This is the data source for all subsequent topology decisions.
* **Linear abstraction**: The code creates a flattened, contiguously indexed list `[]*device.DeviceInfo` for all Neuron devices on the node. That index is what the “enforce contiguous allocation” algorithm operates on.

```Go
// File: pkg/device/awsneuron/device.go
func (dev *AWSNeuronDevices) GetNodeDevices(n corev1.Node) ([]*device.DeviceInfo, error) {
        // ...
        counts, ok := n.Status.Capacity.Name(corev1.ResourceName(dev.resourceCountName), resource.DecimalSI).AsInt64()
        // ...
        customInfo := map[string]any{}
        // 1. Read instance type from node labels as the basis for topology decisions
        customInfo[AWSNodeType] = n.Labels["node.kubernetes.io/instance-type"]
        // 2. Create a linear, contiguously numbered device list
        for int64(i) < counts {
                nodedevices = append(nodedevices, &device.DeviceInfo{
                        Index:      uint(i), // Index increments contiguously from 0
                        ID:         n.Name + "-" + AWSNeuronDevice + "-" + fmt.Sprint(i),
                        Type:       AWSNeuronDevice,
                        Numa:       0, // NUMA is ignored; topology focuses on device adjacency
                        Health:     true,
                        CustomInfo: customInfo,
                })
                i++
        }
        return nodedevices, nil
}
```

#### **2. Core of the Scheduling Algorithm: Dual-Strategy Topology Selection**

When a Pod requesting multiple Neuron devices arrives, the scheduler’s `Fit` function calls `graphSelect` to perform the core topology match. The function reads the previously stored instance type and applies one of two scheduling strategies to ensure the allocated device group has the lowest communication latency.

##### **Strategy 1: Ring Topology on Inferentia Instances**

On `Inf1` and `Inf2` instances, Neuron devices are connected in a **ring topology**. In that topology, physically adjacent devices communicate most efficiently. Therefore, to preserve performance, the scheduler **must** allocate a set of **contiguous** devices to the job.

HAMi’s scheduling algorithm implements this rule precisely. When `graphSelect` recognizes an `inf` instance type, it calls `continuousDeviceAvailable` without a quantity limit to find a fully free contiguous index segment whose length matches the request in the node’s device list (for example `[0, 1, ..., 11]`).

As shown below, for a Pod requesting 2 devices, contiguous allocations such as `[0, 1]` or `[11, 12]` are valid; a non-contiguous allocation such as `[0, 2]` is invalid, and the scheduler will never produce it. That guarantee comes from the loop checks in `continuousDeviceAvailable`.

![Inferentia ring topology scheduling strategy](/images/blog/hami-aws-neuron-topology/inferentia-ring-topology.png)

##### **Strategy 2: 2D Torus Topology on Trainium Instances**

On `Trn1` instances, devices are connected through a more complex **2D torus topology**. To fit that topology and ensure best performance, AWS requires containers to request only **1, 4, 8, or 16** devices.

HAMi strictly follows this constraint. Through a `switch` statement, `graphSelect` handles only those four request sizes. Any other count (for example 2 or 7 devices) is rejected immediately, and the Pod cannot be scheduled.

For valid request sizes, HAMi again uses `continuousDeviceAvailable` to find contiguous device blocks. This apparently simple linear search actually matches the predefined valid device groups on `Trn1` instances. For example, on a 16-device node requesting 4 devices, `continuousDeviceAvailable` finds combinations such as `[0,1,2,3]`, `[4,5,6,7]`, `[8,9,10,11]`, or `[12,13,14,15]`.

![Trainium 2D torus topology — 4-device scheduling](/images/blog/hami-aws-neuron-topology/trainium-torus-4cards.png)

Likewise, when requesting 8 devices, it finds combinations such as `[0,1,2,3,4,5,6,7]` or `[8,9,10,11,12,13,14,15]`. These allocations ensure the job’s devices sit in the same high-speed interconnect domain.

![Trainium 2D torus topology — 8-device scheduling](/images/blog/hami-aws-neuron-topology/trainium-torus-8cards.png)

**Code implementation**

```Go
// File: pkg/device/awsneuron/device.go
func graphSelect(devices []*device.DeviceUsage, count int) []int {
        // ...
        // 1. Read the previously stored instance type from device info
        if nodeType, ok := devices[0].CustomInfo[AWSNodeType].(string); ok {
                AWSNodetype = nodeType
        }
        // 2. Strategy 1: for Inferentia instances, find a contiguous block of any length
        if strings.Contains(AWSNodetype, "inf") || strings.Contains(AWSNodetype, "Inf") {
                // ...
                // The core logic is to call continuousDeviceAvailable
                res := continuousDeviceAvailable(devices, start, count)
                if len(res) > 0 { return res }
                // ...
        }
        // 3. Strategy 2: for Trainium instances, only accept specific request counts
        switch count {
        case 1, 4, 8, 16:
                {
                        // ...
                        // The core logic is also to call continuousDeviceAvailable
                        res := continuousDeviceAvailable(devices, start, count)
                        if len(res) > 0 { return res }
                        // ...
                }
        }
        return []int{} // For Trainium, requests with other counts fail here
}

// continuousDeviceAvailable checks whether count devices starting at start are all available
func continuousDeviceAvailable(devices []*device.DeviceUsage, start int, count int) []int {
        // ...
        for iterator < start+count {
                // Core check: is the device already in use?
                if devices[iterator].Used > 0 {
                        return []int{}
                }
                // ...
        }
        return res
}
```

#### **3. Core-Level Sharing: Translating Resource Requests**

HAMi can support both device-level and core-level sharing because of its internal resource-request translation. That logic “translates” the different resources users define in YAML (`/neuron` or `/neuroncore`) into a unified format the scheduler understands.

* **For device-level requests (`aws.amazon.com/neuron`)**: Translation is direct. Requesting `N` devices produces an internal scheduling request that needs `N` full physical devices.
* **For core-level requests (`aws.amazon.com/neuroncore`)**: The core of the translation strategy is **aggregate packing**. To map scattered core requests onto physical devices efficiently, HAMi uses a bundling strategy based on a “2 cores/device” model, with these rules:

  * **Request 1 core**: Convert to finding **1** physical device that can provide **1** free core.
  * **Request 2 cores**: Convert to finding **1** physical device that can provide **2** free cores.
  * **Request N > 2 cores**: Convert to finding **`N/2`** physical devices, each of which must provide **2** free cores.

In essence, this strategy tries to pack core requests onto as few physical devices as possible. Note, however: for odd requests greater than 2 (such as 3 or 5), integer division `N/2` **floors** the request — for example, requesting 3 cores becomes finding 1 device that can provide 2 cores.

This design finishes the complex resource conversion before scheduling, giving users flexible core-level sharing while simplifying later scheduling decisions.

### 4. How to Use

#### **Example 1: Request 4 Neuron Devices (Triggers Topology Awareness)**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: neuron-device-demo
spec:
  restartPolicy: Never
  containers:
    - name: neuropod
      command: ["sleep","infinity"]
      image: public.ecr.aws/neuron/pytorch-inference-neuron:1.13.1-neuron-py310-sdk2.20.2-ubuntu20.04
      resources:
        limits:
          cpu: "4"
          memory: 4Gi
          # Request 4 Neuron devices; this triggers graphSelect topology optimization
          aws.amazon.com/neuron: 4
```

#### **Example 2: Request 1 NeuronCore (Core-Level Sharing)**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: neuron-core-demo
spec:
  restartPolicy: Never
  containers:
    - name: neuropod
      command: ["sleep","infinity"]
      image: public.ecr.aws/neuron/pytorch-inference-neuron:1.13.1-neuron-py310-sdk2.20.2-ubuntu20.04
      resources:
        limits:
          cpu: "4"
          memory: 4Gi
          # Request 1 NeuronCore for fine-grained sharing
          aws.amazon.com/neuroncore: 1
```

### 5. Summary

HAMi’s support for AWS Neuron reflects a clear engineering philosophy: **prefer policy over scanning, and achieve efficiency through simplicity**. Its topology selection algorithm identifies instance type and reduces the topology problem to finding contiguous device indexes, matching AWS official scheduler behavior for high-performance scheduling at very low complexity. This pragmatic design not only ensures multi-device jobs can fully use Neuron’s high-speed interconnect advantages, but also gives users a flexible, easy cloud-native AI compute scheduling experience.

---

### References

* **HAMi v2.7.0 Release Log**
  [https://github.com/Project-HAMi/HAMi/releases/tag/v2.7.0](https://github.com/Project-HAMi/HAMi/releases/tag/v2.7.0)
* **User guide: AWS Neuron examples and operations**
  [https://project-hami.io/docs/userguide/AWSNeuron-device/enable-awsneuron-managing](https://project-hami.io/docs/userguide/AWSNeuron-device/enable-awsneuron-managing)
* **Related PR: HAMi × AWS Neuron integration**
  [https://github.com/Project-HAMi/HAMi/pull/1238](https://github.com/Project-HAMi/HAMi/pull/1238)
