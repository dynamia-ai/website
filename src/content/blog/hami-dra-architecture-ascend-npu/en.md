---
title: 'HAMi-DRA Architecture Evolution: Kubernetes-Native Scheduling and Ascend NPU Practice'
date: '2026-11-20'
excerpt: 'HAMi-DRA delegates device declarations, scheduling, and capacity accounting to Kubernetes DRA while retaining HAMi-core for runtime isolation. This article covers its architecture, compatibility mode, Ascend NPU experiment, and deployment constraints.'
author: 'Dynamia'
category: 'Technical Deep Dive'
coverDisplay: 'text'
tags: ['HAMi', 'DRA', 'Kubernetes', 'NPU']
---

On September 15, 2026, the HAMi community released HAMi DRA 0.2.3.

The release continues HAMi's move toward Kubernetes-native resource management: **device declarations, scheduling, and capacity accounting are handled by Kubernetes DRA, while HAMi-core continues to enforce memory and compute quotas inside containers.**

The HAMi 2.9 webinar had previously announced that HAMi-DRA was ready for production. With Kubernetes 1.34 bringing the core DRA API to GA, HAMi-DRA is another option for communities evaluating heterogeneous accelerator resource management.

For existing HAMi users, its compatibility mode is especially useful: it converts current HAMi resource requests into native ResourceClaims, reducing the YAML changes needed during migration.

Why does HAMi need DRA? Which responsibilities move to Kubernetes, and which remain with HAMi? Starting with the original HAMi architecture, this article explains the changes brought by DRA, the HAMi-DRA design, its usage modes, and current progress.

## Why HAMi-DRA Is Needed

HAMi's central purpose is to let multiple workloads share a GPU or other accelerator, allocating memory and compute capacity as needed. Under the traditional Kubernetes Device Plugin model, an Extended Resource usually declares an integer number of devices. For example:

```yaml
resources:
  limits:
    nvidia.com/gpu: 1
```

This requests one GPU, but the resource entry cannot express a request for only part of its memory or compute capacity.

For finer-grained sharing, HAMi extends the resource declaration. For an Ascend 310P, a request can look like this:

```yaml
resources:
  limits:
    huawei.com/Ascend310P: 1
    huawei.com/Ascend310P-memory: "8192"
    huawei.com/Ascend310P-core: "50"
```

Here, `8192` means 8192 MiB (8 GiB) of memory, and `50` means 50% of compute capacity.

Several components must cooperate in the traditional HAMi architecture:

- **Mutating Webhook** changes the Pod's resource configuration.
- **Scheduler Extender** handles shared-accelerator scheduling.
- **Device Plugin** reports and mounts device resources.
- **HAMi-core** enforces memory and compute limits inside the container through components such as `libvgpu` and `libvnpu`.

This architecture is used in production, but its reliance on the Device Plugin and Extended Resource model brings limitations.

### Challenges in the Existing Architecture

#### Quotas Cannot Track Fine-Grained Shares

Native ResourceQuota can count requests for Extended Resources such as `huawei.com/*`, but it only totals them by namespace. It cannot see how HAMi divides memory and compute on each device. Limiting actual usage by team therefore requires a separate quota system.

#### Preemption Is Unavailable

Scheduling features such as preemption do not know the decisions made by an external scheduler. A high-priority task cannot make a lower-priority one yield its place through this path.

#### Node Locks Affect Scheduling

When several Pods are scheduled onto one node concurrently, they may have to proceed one by one. Node locks can serialize parts of allocation and increase wait time. The busier the cluster, the slower Pod creation can become. A failed request can lock a node for five minutes, making new Pods on that node wait.

These problems are closely tied to the traditional resource model and Scheduler Extender implementation. Changing allocation and scheduling requires a new resource management mechanism.

![Where HAMi is constrained on top of Device Plugin](/images/blog/hami-dra-architecture-ascend-npu/figure-1-en.png)

> The left side shows the chain HAMi built for sharing, from Pod to accelerator. The dashed lines locate four bottlenecks: the first is the resource declaration, where native quotas see whole-device counts rather than HAMi's finer divisions; the other three arise at the Scheduler Extender. Preemption is limited because HAMi did not implement the optional `preempt` verb in the Extender API; node locks turn concurrency into serial work, and a failed request can lock a node for five minutes.

## What Kubernetes DRA Brings

Kubernetes 1.34 made the core Dynamic Resource Allocation (DRA) API generally available. Device management moves from a node-centered allocation model toward declarative resource objects. Four principal objects make up this model:

- **ResourceSlice** describes the device inventory, including attributes and capacity.
- **ResourceClaim** declares a Pod's device requirements and constraints before Pod creation.
- **DeviceClass** provides device filtering and configuration templates.
- **ResourceClaimTemplate** creates ResourceClaims in batches for controllers such as StatefulSet.

### Consumable Capacity

For HAMi, the most significant change is **Consumable Capacity (KEP-5075)**.

A device can publish several consumable capacity dimensions, such as memory and compute. Together with `allowMultipleAllocations`, separate ResourceClaims can request portions of the same device. `kube-scheduler` allocates and accounts for each dimension using the capacity in ResourceSlice.

Consumable Capacity requires manually enabling its feature gate in Kubernetes 1.34 and 1.35; it is enabled by default starting in 1.36.

For an Ascend 310P3 device, a ResourceSlice can contain:

```text
# ResourceSlice: one device per 310P3, publishing two capacity dimensions
devices:
  - name: npu-0-0
    attributes:
      productName: { string: 310P3 }
      uuid: { string: 68496E64-20E05477-92C31323-6E78030A-BD003019 }
    capacity:
      cores: { value: "100" }
      memory: { value: 21525Mi }
    allowMultipleAllocations: true

# ResourceClaim: request a portion
capacity:
  requests:
    cores: "50"
    memory: "8589934592"
```

![DRA objects and multidimensional capacity allocation](/images/blog/hami-dra-architecture-ascend-npu/figure-2-en.png)

> Claims A and B each request part of the same device (`npu-0-0`). `kube-scheduler` accounts for every dimension against the ResourceSlice. When capacity is exhausted, Claim C remains Pending until a Pod releases capacity. The traditional Device Plugin exposes only simple capacity information, so a scheduler may discover insufficient resources only after choosing a node; DRA can match device attributes during scheduling.

## HAMi-DRA Architecture

HAMi-DRA redistributes responsibilities between Kubernetes and HAMi: **Kubernetes-native DRA handles scheduling and capacity accounting; HAMi-core retains runtime resource isolation.**

HAMi therefore no longer needs to maintain the entire shared-scheduling chain itself. It can provide fine-grained sharing of GPUs, NPUs, and other accelerators on top of Kubernetes-native device management.

![HAMi DRA request path from YAML to accelerator](/images/blog/hami-dra-architecture-ascend-npu/figure-3-en.png)

### From Resource Request to Running Container

The process begins when a user submits YAML. In compatibility mode, users can retain resource names such as `huawei.com/Ascend310P`. The HAMi-DRA Mutating Webhook recognizes these requests at Pod admission and converts them to native ResourceClaims. Users of native DRA submit ResourceClaims directly, without conversion.

`kube-scheduler` then matches, allocates, and accounts for resources using the device attributes and capacity published in ResourceSlice, and binds the Pod to a node. On that node, `kubelet` calls the DRA Driver's resource preparation interface. The Driver generates a CDI spec (Container Device Interface) for device injection. `containerd` creates the container from that configuration and injects HAMi-core's `libvgpu` or `libvnpu`.

The workload runs on a GPU, NPU, DCU, or another accelerator. HAMi-core enforces its memory and compute quota in the container. The main components have distinct roles:

- **HAMi-DRA Webhook:** converts resource declarations and manages the ResourceClaim lifecycle.
- **DRA Driver:** discovers devices, publishes resource information, and prepares and cleans up devices on nodes.
- **HAMi-core:** provides runtime sharing, quota enforcement, and isolation.

### Webhook: Converting Traditional HAMi Requests to DRA

#### Automatic Conversion of Multidimensional Requests

Traditional HAMi uses multiple ResourceNames for device count, memory, and compute. Ascend uses `huawei.com/Ascend310P`, `huawei.com/Ascend310P-memory`, and `huawei.com/Ascend310P-core`. NVIDIA uses `nvidia.com/gpu` alongside names such as `gpumem` and `gpucores`.

The Webhook maps these requests to ResourceClaim `count` and `capacity.requests`, preserving HAMi's resource semantics in native DRA objects. It also converts device selection annotations such as `use-*-uuid` into CEL (Common Expression Language) selectors, allowing Kubernetes to match attributes published in ResourceSlice.

#### ResourceClaim Lifecycle

The Webhook creates the appropriate ResourceClaim and associates it with the Pod. Deleting the Pod automatically cleans up its Claim so unused declarations do not remain.

HAMi-DRA has no independent scheduler component: Kubernetes-native mechanisms perform scheduling, providing a basis for integration with ecosystems such as Volcano.

### DRA Driver: Device Information and Lifecycle

The DRA Driver discovers accelerators and publishes their attributes and available capacity through ResourceSlice. The scheduler therefore has device information before allocation.

After allocation, `kubelet` calls the Driver's `NodePrepareResources` interface. Preparation includes injecting environment variables, creating shared directories, and generating CDI configuration. When the workload releases a resource, the Driver cleans up, including temporary HAMi-core files through `UnprepareResourceClaims`.

Compared with Device Plugin, preparation and release follow a more explicit resource lifecycle. Standard CDI connects device injection to runtimes such as `containerd`.

### HAMi-core: Runtime Isolation Remains

DRA determines which device a workload should use and how much memory and compute it receives, but does not itself enforce those limits inside the container. HAMi-core still controls container memory usage and compute time slices through `libvgpu`, `libvnpu`, and related components.

**DRA allocates resources; HAMi-core makes workloads use them according to the allocation.** This division was discussed by the community in [Will Kubernetes DRA Replace HAMi?](https://project-hami.io/zh/blog/does-kubernetes-dra-replace-hami). DRA and HAMi operate at different layers rather than simply replacing one another.

### Scheduling Performance and Resource Observability

Traditional HAMi used Scheduler Extender and node locks to coordinate shared allocation. Under concurrent requests for the same node, locks could serialize scheduling, causing Pod creation time to grow approximately linearly with concurrency. HAMi-DRA uses Kubernetes-native DRA allocation and avoids part of that node-lock overhead.

In an internal community test of concurrent scheduling on the same node, Pod creation was substantially faster with HAMi-DRA. DRA preallocates and accounts for device resources during scheduling, reducing later conflicts and retries. The result came from a specific internal test and does not imply the same improvement for every cluster or workload.

Architecturally, four changes stand out:

| Traditional HAMi | HAMi-DRA | Main change |
| --- | --- | --- |
| NodeLock | No Locks | No longer relies on the original node lock for shared allocation |
| ResourceName | ResourceClaim | Expresses device demand through native resource objects |
| Device Plugin | DRA Driver | Manages device preparation and lifecycle through DRA |
| Annotation | Attributes | Uses device attributes and selectors to express constraints |

Observability also improves. In the traditional model, device information mainly came from Node, while workload usage required analysis of Pod configuration and runtime state. A complete allocation view often required joining several objects. DRA uses ResourceSlice for inventory and capacity, and ResourceClaim for demand and allocation results. Operators can query these objects to see which workloads received a device, how much was allocated, and what capacity remains. **Allocation relationships become part of the Kubernetes-native resource model instead of depending entirely on external correlation.**

## Two Usage Modes: Native Capabilities and Migration Cost

DRA offers richer device declarations, but makes them more complex. Under Device Plugin, a Pod only declares a device count:

```yaml
resources:
  limits:
    nvidia.com/gpu: 1
```

In native DRA mode, a separate ResourceClaim typically describes the device demand through fields such as `count` and `capacity.requests`. For example:

```yaml
spec:
  devices:
    requests:
      - exactly:
          allocationMode: ExactCount
          count: 1
          capacity:
            requests:
              memory: 4194304k
```

CEL selectors can add device attribute constraints. Enterprises using Device Plugin or HAMi at scale must adjust YAML and learn ResourceClaim, device selection, and lifecycle concepts. HAMi-DRA therefore offers **native DRA mode and Device Plugin compatibility mode**.

### Native DRA Mode

Users create ResourceClaims for device count, memory, and compute, then reference them from Pods through `resourceClaims`. CEL selectors can specify a device model, topology, NUMA affinity, or other attributes; the mechanism can also apply to devices such as NICs. Features such as `firstAvailable` can express alternative allocations on supported Kubernetes versions. Native mode suits new workloads and clusters that want declarative management and attribute matching.

### Device Plugin Compatibility Mode

Existing workloads can retain request syntax such as `nvidia.com/gpu` or `huawei.com/Ascend310P`. The Webhook converts the requests at admission, so applications need not all be rewritten as native DRA declarations.

![Compatibility mode converts requests at admission](/images/blog/hami-dra-architecture-ascend-npu/figure-4-en.png)

For an Ascend 310P Pod, the original request may be:

```yaml
resources:
  limits:
    huawei.com/Ascend310P: 1
    huawei.com/Ascend310P-memory: "8192"
    huawei.com/Ascend310P-core: "50"
```

The Webhook converts the three `huawei.com/*` entries into DRA declarations and establishes the Pod's Claim reference. Device count becomes ResourceClaim `count`; memory and compute become `capacity.requests`; device selection annotations become CEL selectors. The conversion rules are:

| ResourceClaim field | Original HAMi request | Conversion |
| --- | --- | --- |
| `count: 1` | `Ascend310P: 1` | Pass device count through |
| `capacity.requests.memory: 8589934592` | `-memory: 8192` (MiB) | Convert MiB to bytes: 8192 × 1024 × 1024 |
| `capacity.requests.cores: "50"` | `-core: 50` | Pass compute percentage through |
| CEL selector | `use-Ascend310P-uuid` annotation | Convert to `uuid in ["..."]` to match the device UUID in ResourceSlice |

The ResourceClaim is associated with the Pod and reclaimed when the Pod is deleted. This keeps the underlying model change largely in the infrastructure layer, but a cluster still needs compatible Kubernetes, a DRA Driver, HAMi-core, and other required components.

### Ascend 310P Experiment: Allocation and Isolation

In a HAMi community experiment, two Pods each requested 8192 MiB of memory and 50% compute on the same NPU. After Webhook conversion, their ResourceClaims were allocated to the same device with separate shareIDs. `kube-scheduler` accounted for the first Claim before evaluating the second. Once both consumed 50% compute, device compute capacity reached 100/100. A third workload asking for 50% compute stayed Pending even though memory remained. Deleting an existing Pod reclaimed its Claim and updated capacity accounting.

#### Allocation Is Not Runtime Isolation

Inside the container, HAMi-core uses `libvnpu.so` to enforce the memory quota. Requests above the permitted amount are intercepted and can appear as an OOM in the container. In this experiment, each container saw its assigned 8 GiB, not the NPU's full approximately 21 GiB. This demonstrates the cooperation of native DRA accounting and HAMi-core runtime isolation.

> Complete commands, allocations, and output are in the community tutorial [Lab 21: Sharing an Ascend NPU with HAMi DRA](https://project-hami.io/zh/tutorials/labs/ascend-hami-dra).

## Heterogeneous Device Support

HAMi-DRA's scope depends heavily on vendor DRA Driver adaptation:

- September 2025: NVIDIA DRA Driver, with Consumable Capacity ready.
- March 2026: Hygon DCU DRA Driver integration with HAMi DRA completed.
- April 2026: Enflame DRA Driver integration in progress.

These developments support more heterogeneous devices, but integration, experimental validation, and production readiness are distinct states and must be assessed for each device.

### Ascend NPU

The Ascend DRA Driver is an important NPU example. In [Lab 21](https://project-hami.io/zh/tutorials/labs/ascend-hami-dra), the community used a server with an Ascend 310P3 and the officially maintained [Project-HAMi/ascend-dra-driver](https://github.com/Project-HAMi/ascend-dra-driver) to validate end-to-end conversion, native allocation, and shared NPU operation. The Driver Chart version was `0.1.1`.

The experiment used a development image that fixed UUID generation; implementation and behavior may change before official release. HAMi v2.10.0 release notes in August 2026 pointed Ascend DRA support to this Driver repository, while the Driver itself remained prerelease.

## Practical Constraints Before Deployment

### Kubernetes Version and Features

Consumable Capacity requires Kubernetes 1.34 or later, and other DRA features may need newer releases. Feature-gate defaults differ between versions. Upgrading an older production cluster also requires checking compatibility with its schedulers, drivers, networking, and other components.

### Limited Vendor Driver Support

Few DRA Drivers are directly usable for particular devices, and vendor implementations differ in maturity. Supporting DRA declarations and allocation does not automatically mean fine-grained sharing, isolation, and the entire lifecycle have been validated for production. Evaluate the driver, DRA features, and HAMi-core together.

### Advanced Scheduling Still Needs Work

DRA can match device attributes and allocate capacity during scheduling, but more advanced optimization, including device-level scoring, remains limited.

### Learning and Maintenance Cost

ResourceSlice, ResourceClaim, DeviceClass, selectors, preparation, and reclamation add concepts for operators and platform developers to learn and troubleshoot. Compatibility mode reduces application-side migration effort, but does not remove deployment and maintenance work.

## Choosing an Approach

Traditional HAMi and HAMi-DRA fit different environments. Consider cluster architecture, scheduling requirements, and device support.

### Standardized Kubernetes Clusters

Where scheduling optimizations such as topology awareness are especially important, traditional HAMi is recommended for its established scheduling capabilities.

### Highly Customized Clusters

Where an in-house scheduler is already deployed, or native Kubernetes DRA is desired for device sharing, evaluate HAMi-DRA first.

In either case, avoid allocation-path conflicts: one request must not pass through both traditional HAMi and HAMi-DRA. Both modes can coexist in a cluster using the Webhook exemption configuration described in [Lab 21](https://project-hami.io/zh/tutorials/labs/ascend-hami-dra?utm_source=chatgpt.com), avoiding duplicate processing.

DRA declares, schedules, and allocates resources; HAMi-core still enforces memory and compute quotas inside containers. The two approaches serve different cluster needs.

## Outlook

HAMi-DRA plans to extend support to devices such as MetaX and Iluvatar CoreX, explore DRA features including List Attributes and Partitionable Devices, and improve compatibility with standard Kubernetes device attributes such as `resource.kubernetes.io/pcieRoot`. The community also plans closer integration with Volcano and Kueue.

HAMi manages heterogeneous GPU and NPU resources for AI training, inference, and agent workloads, connecting hardware and applications through resource abstraction, scheduling, and virtualization. **HAMi-DRA is a significant step in that evolution.** By handing declarations, allocation, and scheduling to Kubernetes DRA, HAMi can focus on runtime isolation and heterogeneous device adaptation, retain fine-grained sharing, and depend less on additional scheduling extensions.

If you are evaluating a migration from Device Plugin to DRA or seeking a unified resource management layer for a heterogeneous cluster, try HAMi DRA and share feedback with the community.
