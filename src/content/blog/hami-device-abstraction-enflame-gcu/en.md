---
title: '[Architecture Deep Dive] HAMi Device Abstraction Layer: Rapid Heterogeneous Compute Integration with Enflame GCU as an Example'
coverTitle: '[Architecture] HAMi Device Abstraction Layer | Rapid Heterogeneous Compute Integration with Enflame GCU'
date: '2025-10-22'
excerpt: >-
  HAMi’s carefully designed device abstraction layer provides an elegant solution
  for rapid heterogeneous compute integration. This article unpacks that core
  architecture and uses the Enflame GCU integrated in v2.7.0 as an example to
  show how vendors or community developers can quickly add support for new
  hardware on top of it.
author: Dynamia
tags:
  - HAMi
  - Device Abstraction
  - Enflame GCU
  - vGCU
  - Architecture
  - Heterogeneous Computing
  - Kubernetes
  - Integration
category: Technical Deep Dive
coverImage: /images/blog/hami-device-abstraction-gcu/cover-en.png
language: en
linktitle: HAMi Support for Enflame GCU
---

In the cloud-native era, hardware for AI and high-performance computing is proliferating. How efficiently and quickly a scheduling system can adapt to endless new heterogeneous accelerators has become a key measure of its extensibility.

HAMi addresses this challenge through its carefully designed **device abstraction layer**. This article unpacks that core architecture and uses the **Enflame GCU** integrated in v2.7.0 as a concrete example of how vendors or community developers can quickly enable a new piece of hardware at very low cost.

## 1. HAMi Device Abstraction and Core Interfaces

To handle hardware from different vendors and of different types uniformly, the HAMi scheduler defines a standard device interface (`Devices` interface). Any new hardware that implements this interface can be brought into HAMi’s scheduling system seamlessly, without changing any core scheduling logic.

This layered abstraction decouples generic scheduling logic from hardware-specific implementations. The relationship looks like this:

![HAMi device abstraction layer architecture](/images/blog/hami-device-abstraction-gcu/architecture-en.png)

The core idea of the interface is to “localize” hardware-specific complexity inside each device implementation, shielding the upper-level scheduler from underlying differences. The key interface functions are:

### Core Interface Details

#### `GetNodeDevices()`

- **Responsibility**: Parse resource information reported by the vendor `device-plugin` onto the node (`corev1.Node`) object, and convert it into HAMi’s unified internal device list (`[]*device.DeviceInfo`).
- **Role**: This is the entry point for HAMi to discover and initialize a node’s compute resources.

#### `GenerateResourceRequests()`

- **Responsibility**: Convert resource requests defined in the user’s Pod YAML (for example `enflame.com/vgcu-percentage: 25`) into a standardized `ContainerDeviceRequest` structure the scheduler understands.
- **Role**: Acts as a “translator,” unifying the internal representation of all heterogeneous resources.

#### `Fit()`

- **Responsibility**: On a single node, given a `ContainerDeviceRequest` and current device usage, decide whether the node can satisfy the Pod’s resource needs and find a concrete device allocation plan.
- **Role**: This is the core decision logic for **intra-node** scheduling, covering resource matching, topology selection, and all other device-related complex judgments.

![Core interface call flow](/images/blog/hami-device-abstraction-gcu/interface-flow-en.png)

#### `ScoreNode()`

- **Responsibility**: When multiple nodes pass `Fit()`, score those candidates so the scheduler can pick the best one.
- **Role**: This is key to **inter-node** scheduling, typically used for policies such as `binpack` (prefer nodes with higher resource utilization) or `spread` (prefer idle nodes).

## 2. Case Study: Integrating Enflame vGCU

Enflame vGCU integration is a standard implementation of the interfaces above. Because its scheduling logic is relatively direct and does not involve complex topology computation, the enablement work could be completed very efficiently.

### 1. Implementing `GenerateResourceRequests`: Translating User Requests

This step converts `enflame.com/vgcu-percentage` from the user’s YAML into the internal `Memreq` (memory request) field. Because vGCU abstracts one card as 100 percentage units, the conversion is a simple mapping.

```go
// File: pkg/device/enflame/device.go (logic simplified)

func (dev *EnflameDevices) GenerateResourceRequests(ctr *corev1.Container) ContainerDeviceRequest {
    // ...
    // Read the value of "enflame.com/vgcu-percentage" from Pod spec.containers.resources.limits
    percentage := ctr.Resources.Limits[EnflameResourceNameVGCUPercentage]

    return device.ContainerDeviceRequest{
        // ...
        Memreq: int32(percentage.Value()), // Use the percentage as the internal Memreq
        Coresreq: 0,
        // ...
    }
}
```

### 2. Implementing `Fit`: Intra-Node Resource Validation

This is the core of Enflame GCU enablement logic. It is implemented as a concise “pre-validator” that performs the following steps inside `Fit`:

1. **Filter devices**: Use the `use-gpuuuid` / `nouse-gpuuuid` annotations to select candidate physical devices.
2. **Iterate and check**: Loop over candidates and check whether remaining `Mem` (percentage units) meets the request.
3. **Return early**: As soon as the first qualifying device is found, return success.

```go
// File: pkg/device/enflame/device.go (logic simplified)

func (dev *EnflameDevices) Fit(nodeInfo *util.NodeInfo, pod *corev1.Pod) (bool, ...) {
        // ...
        request := dev.GenerateResourceRequests(&pod.Spec.Containers[0])

        // 1. Build candidate device list from Pod annotations (use-gpuuuid/nouse-gpuuuid)
        candidates := buildCandidateDevices(nodeInfo, pod)

        // 2. Iterate candidates and find the first device that satisfies the request
        for _, devID := range candidates {
                availableMem := nodeInfo.Devices[devID].Totalmem - nodeInfo.Devices[devID].Usedmem
                if availableMem >= request.Memreq {
                        // 3. Success as soon as one is found
                        return true, ...
                }
        }

        return false, ...
}
```

### 3. Implementing `ScoreNode`: Providing a Default Score

Because vGCU scheduling does not involve cross-node topology or affinity policies, `ScoreNode` is very simple: it only needs to return a neutral default score (`0`), without affecting the scheduler’s `binpack` or `spread` decisions.

### How to Use

Users can consume Enflame vGCU with the following YAML:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: gcu-shared-pod-with-uuid
  annotations:
    # Use the GCU device whose UUID is node1-enflame-0
    enflame.com/use-gpuuuid: "node1-enflame-0"
spec:
  containers:
    - name: my-shared-gcu-app
      image: ubuntu:20.04
      command: ["sleep", "3600"]
      resources:
        limits:
          enflame.com/vgcu: 1
          enflame.com/vgcu-percentage: 25
```

## 3. Summary

HAMi’s device abstraction layer is central to how quickly it can respond to hardware ecosystem changes while retaining strong heterogeneous compute management. By defining a clear, well-scoped interface set, it “pushes down” and “encapsulates” hardware enablement complexity inside each device implementation.

The Enflame GCU integration case strongly demonstrates the architecture’s strength: developers do not need to understand the HAMi scheduler’s internal loops and complex state. By focusing on a few clearly defined functions, they can quickly and reliably bring a new heterogeneous accelerator into the cloud-native scheduling system. That lowers vendor enablement cost and greatly encourages community contributions.

---

**References**

- **User documentation**: [Enflame GCU/GCUshare support](https://github.com/Project-HAMi/HAMi/blob/master/docs/enflame-vgcu-support_cn.md)
- **Related PRs**:
  - [https://github.com/Project-HAMi/HAMi/pull/1013](https://github.com/Project-HAMi/HAMi/pull/1013)
  - [https://github.com/Project-HAMi/HAMi/pull/1334](https://github.com/Project-HAMi/HAMi/pull/1334)

Our sincere thanks again to community developers @archlitchi and @zhaikangqi331 for their contributions to this feature!
