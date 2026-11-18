---
title: "How Domestic GPUs Fit Smoothly into Kubernetes: Enflame’s Full-Stack Cloud-Native Practice"
date: '2026-05-09'
excerpt: >-
  Enflame’s Ma Da unpacks a cloud-native integration path for domestic GPUs in
  the Kubernetes ecosystem—from GPU Operator lifecycle management and CDI-based
  device injection to an Inference Gateway architecture aligned with the CNCF
  four-layer stack—covering the full chain of device discovery, resource
  scheduling, container access, observability, and inference optimization.
author: "Dynamia"
tags:
  - HAMi
  - Meetup
  - Enflame
  - GPU Operator
  - DRA
  - CDI
  - Cloud Native
  - Domestic GPU
category: Community & Events
language: en
coverImage: /images/blog/enflame-k8s-cloud-native-practice/speaker-mada.webp
linktitle: "Enflame GPU Cloud-Native Practice"
---

![Speaker: Ma Da (Enflame)](/images/blog/enflame-k8s-cloud-native-practice/speaker-mada.webp)

> “Compete on Efficiency, Not Compute | HAMi Community Meetup” Shenzhen was initiated by the HAMi Community and hosted by Dynamia. It concluded successfully in Shenzhen on April 25, 2026. This article is the fifth in the HAMi Community Meetup Shenzhen recap series. Enflame’s Ma Da unpacked a cloud-native integration path for domestic GPUs in the Kubernetes ecosystem—from GPU Operator lifecycle management and CDI-based device injection to an Inference Gateway architecture aligned with the CNCF four-layer stack—covering device discovery, resource scheduling, container access, observability, and inference optimization end to end.

**Key highlights:**

- **1 CR manages 7+ core components**; GPU Operator delivers declarative full-lifecycle management
- Device Plugin + DRA **dual-track scheduling**, covering a smooth path from K8s 1.9 through 1.34+
- Adopts CNCF-standard **CDI** instead of vendor-private environment variables, ending fragmented device injection
- Three-layer Exporter full-stack observability; collection every 15s with CPU overhead < 1%
- Developing a GPU **EPP plugin** that scores queue depth and KV hit rate for intelligent inference routing

## Video Replay and PPT Download

- **Bilibili:** [Kubernetes Ecosystem and Enflame GPU Integration Practice — Ma Da](https://www.bilibili.com/video/BV1MfozBvEab/)
- **Download PPT:** [kubernetes-gpu-operator-dra-cdi-enflame-mada.pdf](https://github.com/Project-HAMi/community/blob/main/hami-meetup/03-shenzhen-20260425/kubernetes-gpu-operator-dra-cdi-enflame-mada.pdf)

## 1. Core Challenges of Domestic GPU Cloud-Native Integration

Enflame GPUs are an important force among domestic AI accelerators. Large-model training and inference are pushing accelerator clusters from tens of cards to thousands, and Kubernetes has become the de facto standard for AI infrastructure. In Kubernetes environments, however, domestic GPUs face even tougher challenges than NVIDIA:

- **Devices are invisible** — Schedulers cannot see GPU model, memory size, chip series, and other hardware attributes, so precise scheduling is hard
- **Resources are hard to manage** — Without standardized discovery, registration, allocation, and reclamation, mixing heterogeneous cards is difficult
- **Operations are complex** — Drivers, runtimes, monitoring, and 7+ other components need heavy manual work; problems multiply as clusters grow
- **Ecosystem is fragmented** — Vendor approaches differ (environment variables, injection methods, partitioning strategies), with no unified cloud-native integration path

**Enflame’s goal:** Build a standardized cloud-native integration approach so managing domestic GPUs on Kubernetes feels as smooth as managing NVIDIA GPUs.

## 2. GPU Operator: Unified Full-Lifecycle Management

### Overall Architecture

![GPU Operator overall architecture](/images/blog/enflame-k8s-cloud-native-practice/gpu-operator-architecture.webp)

Enflame uses GPU Operator to unify management of **7+ core components**, covering the full lifecycle from hardware to cluster:

- **GFD** (GPU Feature Discovery) — Automatically discovers GPU devices and exposes hardware features as node labels
- **NFD** (Node Feature Discovery) — Discovers node-level hardware features (CPU, memory, network, and more)
- **Device Plugin / DRA Driver** — Reports GPU resources to the Kubernetes scheduler and supports dual-track scheduling
- **GPU Exporter** — Collects utilization, memory, temperature, power, and related metrics
- **NPD** (Node Problem Detector) — Detects kernel errors, hardware anomalies, and driver failures
- **Node Exporter** — System-level CPU/memory/disk/network monitoring
- **Container Toolkit** — OCI runtime wrapper that transparently injects GPU devices and driver libraries

### Declarative CRD Management

Declarative management uses a CRD (`apiVersion: enflame.com/v1, kind: GpuResource`). Operators define one CR to manage 7+ components. Results:

- **One-click deployment** — All components deploy automatically via the CR
- **Rolling upgrades** — Drivers, runtimes, and related components upgrade smoothly
- **Automatic reconcile** — Configuration drift is repaired automatically; operational complexity drops significantly

### Automated Device Discovery

A **fully automatic pipeline** from hardware attributes to Kubernetes node labels:

`GPU hardware → efsmi / libefml → GFD → label file → NFD → Node Labels`

Uses **three-level backend fallback** for different driver versions:

1. `efsmi -q --json-format` — JSON output (recommended)
2. `efsmi -q` — Text parsing (compatible with older versions)
3. `libefml.so` — CGO bindings (final fallback)

Labels refresh automatically every **60 seconds**; driver upgrades are transparent to upper workflows. Operators can schedule precisely with `nodeSelector`, for example `enflame.com/gpu.model: S60` or filtering by memory size.

## 3. Scheduling Evolution: Device Plugin to DRA

Enflame implements Device Plugin and DRA Driver **dual-track scheduling**, covering Kubernetes 1.9 through 1.34+ for a smooth transition.

| Dimension | Device Plugin | DRA Driver |
|-|-|-|
| **Resource declaration** | `resources.limits` by count | ResourceClaim + CEL |
| **Device selection** | Count only | By attributes (model/memory/profile) |
| **Device partitioning** | Whole card | DRS static slices |
| **Multi-device composition** | Not supported | Supported |
| **Device injection** | Environment variables | CDI |

### Three-Step DRA Usage Flow

1. **Define DeviceClass** (auto-deployed by Operator): `kind: DeviceClass, metadata.name: enflame.com`
2. **Create ResourceClaim + CEL** for precise selection: use CEL expressions for model, memory, and other attributes
3. **Pod references the Claim**: scheduler + DRA Driver allocate automatically + CDI injection

### DRS Static Slicing

When an S60 whole card has enough memory, DRS can split it into multiple logical slices for shared inference jobs:

- **1g.11gb** — 4 slices, 1/4 memory; for small-model inference (development/debug)
- **2g.22gb** — 2 slices, 1/2 memory; for medium-model inference (medium load)
- **full** — 1 slice, full memory; for training / large-model inference (heavy load)

Slices are created at node startup; the scheduler allocates at slice granularity; runtime isolation is guaranteed by the driver and Container Toolkit together.

## 4. CDI + Container Toolkit: Transparent Container Access

### How Container Toolkit Works

As an OCI runtime wrapper, Container Toolkit intercepts container startup and completes device injection in **four steps**:

1. Parse container environment variables / CDI Spec
2. Modify the OCI runtime spec
3. Inject `/dev/gpu*`, `libefml.so`, and driver libraries
4. Call underlying runc to start the container

Two access modes:

- **Legacy mode** — Inject via `ENFLAME_VISIBLE_DEVICES`; Device Plugin path; compatible with older approaches
- **CDI mode** (recommended) — Inject via CDI Spec + devices field; DRA path; standardized approach

Compatible with Docker / containerd / CRI-O and decoupled from the runtime.

### CDI: Moving Beyond Vendor-Private Environment Variables

Traditional GPU containerization depends on vendor-private environment variables (such as `NVIDIA_VISIBLE_DEVICES`). Injection methods differ by vendor and lack standardization.

Enflame adopts **CDI (Container Device Interface)**—the CNCF standard for device injection—instead of vendor-private approaches. The CDI Spec (`/etc/cdi/enflame.com-gpu.yaml`) declares deviceNodes, mounts, env, and hooks.

**Four CDI advantages:**

- **Standardized** — Native support in Kubernetes DRA, Podman, and CRI-O
- **Declarative** — Spec describes what to inject; the runtime executes it
- **Composable** — Multi-device injection (GPU + RDMA)
- **Dynamically generated** — `enflame-ctk generate` produces Specs from hardware

## 5. Full-Stack Observability

Enflame built a **three-layer Exporter** for end-to-end observability from chip to cluster:

- **Accelerator layer** (GPU Exporter) — Utilization, memory, temperature, power, ECC, PCIe, and more
- **System layer** (Node Exporter) — CPU, memory, disk, network, and other system metrics
- **Health layer** (NPD) — Kernel errors, hardware anomalies, and driver failures

Integration path: `GPU hardware → libefml → GPU Exporter → Prometheus → Grafana`, with AlertManager for alerting. Collection every **15 seconds**, CPU overhead **< 1%**, with Pod-level usage correlated to workload labels.

## 6. End-to-End Workflow

From Pod submission to GPU inference, the full automated chain means, **from the user’s view: submit a Pod; everything else is automatic.**

1. User submits a Pod (declares GPU resource needs)
2. Kubernetes Scheduler reads GFD node labels → matches → picks the best node
3. Kubelet + Device Plugin / DRA Driver allocate devices + generate configuration
4. Container Toolkit injects `/dev/gpu*` + driver libraries
5. Container starts; the application uses the GPU for inference/training
6. Ongoing: GPU Exporter → Prometheus / NPD → Kubernetes API / GFD → label refresh

## 7. Inference Gateway: Inference-Specific Optimization

### Full-Stack Architecture from GPU Management to LLM Inference

![Inference Gateway full-stack architecture](/images/blog/enflame-k8s-cloud-native-practice/inference-gateway-stack.webp)

Large-model inference is moving from monolithic deployment to distributed cloud-native inference, facing high concurrency, long context, KV cache management, SLO guarantees, and more. Enflame aligns with the **CNCF four-layer standard inference stack**, aiming for GPUs as a native backend across all four layers:

| Layer | Standard component | Responsibility |
|-|-|-|
| **Ingress/routing** | Envoy + GIE | Model-aware routing, KV scoring, multi-tenancy (Ingress for the LLM era) |
| **Serving** | KServe | InferenceService CRD; unified multi-framework serving (Deployment for inference) |
| **Orchestration** | llm-d | Prefill/Decode separation; cross-Pod KV sharing (distributed scheduling for vLLM) |
| **Engine** | vLLM / SGLang | PagedAttention, continuous batching (compute core) |

**How GIE and llm-d divide work (complementary, not replacements):**

- **GIE** sits **before** Pods and decides which backend Pod receives a request
- **llm-d** sits **inside / between** Pods and decides how requests collaborate across Pods

### GIE: CNCF Standard Routing Layer for LLM Inference

GIE (Gateway API Inference Extension) is the CNCF standard routing layer for LLM inference. It centers on three CRDs:

- **InferencePool** — Inference backend group; allocates GPUs via DRA
- **InferenceModel** — Defines model, version, canary, and multi-tenant policies
- **EPP** (Endpoint Picker) — gRPC plugin; Gateway calls it to pick a Pod

Enflame is developing a **GPU EPP plugin** that scores queue depth, KV hit rate, remaining memory, and related metrics for intelligent routing, while also supporting:

- **Prefix Cache routing** — Same prefixes land on the same node to improve KV hit rate
- **PD-separated routing** — Independent InferencePools for Prefill/Decode; dispatch by stage
- **SLO and fairness** — Tenant priority/fairness + DRS slice isolation for multi-tenant SLO guarantees
- **Canary & A/B** — Multi-version routing via InferenceModel + GPU Exporter canary metrics for safer rollouts

### SLO-Driven Autoscaling

Drive HPA from inference-critical metrics for intelligent elasticity:

- **TTFT** (Time To First Token): latency to first token
- **TPOT** (Time Per Output Token): time per generated token
- **Queue Depth**: request queuing
- **KV Cache hit rate**: three-tier cache (HBM → host → NVMe)

Independent Prefill / Decode scaling + DRS slice reassembly. End state: **declare model + SLO; scheduling/routing/scaling/monitoring automate end to end.**

## Enflame GPU × HAMi: Collaborating on Heterogeneous Compute Scheduling

This Meetup was initiated by the **HAMi Community** and hosted by **Dynamia**. HAMi is a CNCF-hosted open-source project and, today, the only open-source solution in the industry that delivers flexible, on-demand, elastic, and reliable GPU virtualization. It already supports mainstream AI chips at home and abroad—including NVIDIA, Ascend, and Enflame—with more than 200 enterprise end users.

The full-stack cloud-native approach Enflame presented—from GPU Operator to DRA scheduling, CDI device injection, and Inference Gateway—complements HAMi’s heterogeneous compute scheduling capabilities:

**Key Enflame × HAMi touchpoints:**

- **GPU sharing and virtualization** — Enflame uses DRS for static slicing; on that base, HAMi provides finer-grained **on-demand, elastic GPU sharing** with memory isolation and compute partitioning, so multiple inference jobs can share one Enflame GPU and utilization can rise from ~30% on a single card to 80%+
- **Heterogeneous mixed scheduling** — As a device type already supported by HAMi, Enflame GPUs can be **co-deployed** with NVIDIA, Ascend, and other heterogeneous cards through HAMi’s unified scheduling layer, managing multi-vendor GPU clusters with one scheduling strategy
- **DRA standard collaboration** — Enflame is advancing a DRA Driver while HAMi actively integrates with the DRA ecosystem; the two collaborate deeply on standards such as **ResourceClaim, CEL attribute selection, and DeviceClass**, jointly pushing standardized domestic GPU access in Kubernetes DRA
- **Full-stack observability linkage** — Enflame’s three-layer Exporter stack can work with HAMi monitoring to provide a **unified GPU utilization view** for heterogeneous clusters and support finer scheduling decisions

Enflame GPUs are already on HAMi’s supported list. Going forward, both sides will keep collaborating on deeper DRA integration, elastic scheduling strategies, and heterogeneous inference routing—so domestic GPUs can deliver more value in cloud-native environments.

## 8. Looking Ahead

Enflame’s key plans on the standardization path:

- **DRA GA and capability expansion** — Richer CEL attributes, cross-node ResourceClaims, Partitionable Devices
- **Inference Gateway standardization** — GIE beta → GA; standardize multi-tenant and SLO behavior
- **CDI ecosystem convergence** — Push native CDI support in containerd / CRI-O to GA
- **Open ecosystem collaboration** — Long-term work with CNCF, upstream communities, and framework vendors; deep DRA integration with HAMi

## 9. Core Value Summary

Enflame has built a complete solution matrix for domestic GPU cloud-native management:

- **GPU Operator** (shipped) — Fixes fragmented device management; 1 CR manages 7+ components
- **Device Plugin + DRA** (shipped) — Unifies resource scheduling; dual-track coverage for K8s 1.9 ~ 1.34+
- **CDI** (shipped) — Replaces vendor-private approaches with standardized device injection
- **Full-stack observability** (shipped) — Ends black-box GPU ops; three-layer Exporter with second-level collection
- **Inference Gateway** (in progress) — Addresses inference efficiency and SLOs with intelligent routing + autoscaling
- **HAMi DRA integration** (planned) — Unifies heterogeneous scheduling with the HAMi ecosystem

Four core capabilities are already in production; Inference Gateway is under development; HAMi integration is planned—overall maturity is high.

## Summary

In this talk, Enflame presented a complete domestic GPU cloud-native integration approach spanning full-stack capability from low-level device management to upper-layer inference optimization. The core idea is to **fully embrace CNCF standards**—declarative management via GPU Operator, CDI instead of vendor-private approaches, fine-grained scheduling via DRA, and GIE aligned with industry inference-gateway standards.

For domestic GPU vendors, Enflame’s practice offers an important lesson: **cloud-native competition is not only about features—it is also about standards**. Completing CNCF alignment early means stronger interoperability and ecosystem advantage in hybrid and multi-cloud scenarios. For users, choosing a GPU management approach already deeply integrated with the Kubernetes ecosystem can significantly lower the cost and operational complexity of bringing heterogeneous compute online.

As DRA moves toward GA, GIE standardization advances, and the CDI ecosystem continues to converge, domestic GPUs and the cloud-native ecosystem will fit together ever more smoothly. Deep DRA integration between Enflame and the HAMi Community is also worth watching.
