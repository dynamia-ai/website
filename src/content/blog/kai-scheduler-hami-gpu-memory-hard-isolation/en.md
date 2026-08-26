---
title: >-
  HAMi 2.10 Deep Dive (Part 1): Tested — KAI Scheduler + HAMi GPU Memory Hard Isolation, Not a Single MiB Extra
linktitle: KAI + HAMi Memory Isolation Tested
date: '2026-08-25'
excerpt: >-
  The biggest anxiety around GPU sharing is "we agreed to split it fifty-fifty — so how can you
  oversubscribe?" This is the first article in our HAMi 2.10 deep-dive series: with a reproducible
  test on GKE, we answer whether HAMi-core can truly pin each Pod's GPU memory to its quota after
  KAI Scheduler co-schedules two Pods onto the same NVIDIA T4. Requesting 3 GiB succeeds;
  accumulating 5 GiB fails with an immediate out-of-memory.
author: Jimmy Song
tags:
  - HAMi
  - KAI Scheduler
  - GPU Sharing
  - GPU Virtualization
  - HAMi-core
  - Kubernetes
category: Technical Deep Dive
language: en
coverTitle: HAMi 2.10 Deep Dive (Part 1)
---

> The biggest anxiety around GPU sharing is "we agreed to split it fifty-fifty — so how can you oversubscribe?" This is the first article in our HAMi 2.10 deep-dive series: with a reproducible test on GKE, we answer whether HAMi-core can truly pin each Pod's GPU memory to its quota after KAI Scheduler co-schedules two Pods onto the same NVIDIA T4. Requesting 3 GiB succeeds; accumulating 5 GiB fails with an immediate out-of-memory.

GPUs are expensive. Dedicating an entire card to a single task is a luxury; sharing is a necessity — but the biggest anxiety about sharing is: we agreed to split it fifty-fifty, so how can you oversubscribe?

Placing two Pods on the same card is only the first step of sharing. What really lets you sleep at night is every Pod's memory usage being forcibly capped at its quota — out-of-bound allocation requests fail outright, rather than relying on applications to "behave."

HAMi v2.10 was released recently, and the **KAI Scheduler + HAMi-core integration** is one of the headline features of this release. As the first article in our HAMi 2.10 deep-dive series, we first set up the background, then answer one question with a hands-on test:

**After KAI Scheduler schedules two Pods onto the same GPU, can HAMi-core really limit each Pod's memory usage?**

The short answer: **yes**. On GKE, we let two Pods share one NVIDIA T4, each seeing a 4147 MiB memory ceiling; a single Pod successfully allocated 3 GiB, while a cumulative 5 GiB request failed with `out of memory`. While one Pod held 3 GiB, the other could still allocate its own 3 GiB — neither can steal the other's quota.

## Background: Why GPU Sharing Needs "Hard Isolation"

### KAI Scheduler: NVIDIA's Open-Source AI Scheduler

[KAI Scheduler](https://github.com/kai-scheduler/KAI-Scheduler) is NVIDIA's open-source, Kubernetes-native scheduler for AI workloads. It originated as the Run:ai scheduling engine — after NVIDIA acquired Run:ai at the end of 2024, it was open-sourced under Apache 2.0 in April 2025 and is now a CNCF Sandbox project.

The default Kubernetes scheduler was designed for stateless services and treats GPUs like CPU cores: every Pod occupies a whole GPU, with no gang scheduling, no team fairness, and no topology awareness. KAI Scheduler was built for AI scenarios:

- **PodGroup (Gang Scheduling)**: the Pods of a distributed training job must start together, avoiding the embarrassment of 7 GPUs held hostage while nothing can run;
- **Queue (Hierarchical Fair Scheduling)**: allocate GPU quotas by department/team, with borrowing and preemption;
- **Fractional GPU (GPU Sharing)**: multiple workloads share one GPU, allocated by fraction or memory size;
- **Topology-Aware Placement**: respects GPU interconnect topology, placing tightly coupled tasks on the same node or within an NVLink domain;
- **Elastic Workloads**: jobs scale elastically between minimum and maximum Pod counts.

### The Last-Mile Problem of "Soft Sharing"

KAI Scheduler's fractional GPU sharing is powerful, but with one key limitation: it is **cooperative**. The scheduler ensures the sum of all requested memory shares fits the card, but it does **not physically prevent** a workload from using more — a container that requests 2000 MiB can still see and use the full GPU memory through `nvidia-smi` and the CUDA API.

![Soft sharing vs. hard isolation: under soft sharing, nvidia-smi still shows the full memory and oversubscription is possible; under hard isolation, only the allocated quota is visible and oversubscription fails](/images/blog/kai-scheduler-hami-gpu-memory-hard-isolation/soft-vs-hard-sharing-en.png)

This is usually acceptable in dev/test environments, but in multi-tenant production it is a fatal weakness:

- Nothing prevents workloads from oversubscribing memory, leading to OOM or mutual interference;
- Tenants have no genuine resource isolation guarantees;
- There is no precise per-container GPU memory cap.

### HAMi and HAMi-core

HAMi is a CNCF sandbox project focused on middleware for heterogeneous AI compute virtualization. It supports NVIDIA GPUs, Huawei Ascend NPUs, Cambricon MLUs, Hygon DCUs, Moore Threads, Iluvatar CoreX, Enflame, Kunlunxin, MetaX, AMD, Biren, and many more accelerators — the broadest coverage among open-source cloud-native GPU virtualization solutions. Its core component, **HAMi-core** (`libvgpu.so`), enforces GPU memory and compute limits at the CUDA API layer through CUDA interception.

A simple way to see the division of labor:

- **KAI Scheduler** = decides "who uses which GPU, and when" (**scheduling layer**)
- **HAMi-core** = ensures "you can only use what you were allotted" (**isolation layer**)

Only together do they deliver genuinely production-grade GPU sharing.

### From Proposal to Built-In: An Open-Source Collaboration Spanning More Than a Year

This integration is a model of open-source community collaboration. Over more than a year, the HAMi team and NVIDIA's KAI Scheduler team worked closely together:

| Date | Milestone |
| ---- | --------- |
| April 2025 | HAMi maintainer [@archlitchi](https://github.com/archlitchi) opens PR #60 "Resource isolation design," proposing the resource isolation design; the community settles the split — KAI handles environment variable injection, HAMi provides the isolation component |
| April 2026 | [@FouoF](https://github.com/FouoF) opens PR #1504, implementing the GPU_MEMORY_LIMIT binder plugin |
| May 28, 2026 | PR #1504 merges into the KAI Scheduler mainline |
| June 9, 2026 | PR #60 passes full review and merges, with user docs and e2e tests in place |
| June 2026 | HAMi-core isolation ships built into KAI Scheduler **v0.16.4** |
| August 2026 | **HAMi v2.10.0** releases, the KAI Resource Isolator debuts, and the whole chain is packaged as an out-of-the-box Helm Chart |

NVIDIA's official scheduler choosing HAMi-core over building its own is strong validation of HAMi's technical direction. Even before this, HAMi-core had already been integrated with several mainstream schedulers:

![HAMi-core integration landscape across mainstream schedulers: the Kubernetes default scheduler, Volcano, KAI Scheduler, Kueue, and Koordinator](/images/blog/kai-scheduler-hami-gpu-memory-hard-isolation/ecosystem-en.png)

## The Isolation Chain: Three Components, One Contract

The whole chain has exactly three responsibilities:

- **KAI Scheduler**: decides which GPU a Pod uses, and injects the computed memory quota into the container via the `CUDA_DEVICE_MEMORY_LIMIT` environment variable;
- **kai-resource-isolator**: a DaemonSet distributes `libvgpu.so` to every GPU node; its webhook mounts the library into workload Pods and configures `ld.so.preload`; an optional monitor component exposes real-time `hami_*` metrics on port `:9394`;
- **HAMi-core (`libvgpu.so`)**: intercepts `cudaMalloc` and other CUDA calls, rejecting memory allocations beyond the quota.

![The KAI Scheduler + HAMi-core isolation chain: quota computation, environment variable injection, webhook mounting, CUDA interception, and metrics exposure](/images/blog/kai-scheduler-hami-gpu-memory-hard-isolation/isolation-chain-en.png)

The elegance of this design is the `CUDA_DEVICE_MEMORY_LIMIT` **contract**: KAI doesn't need to know how CUDA calls are intercepted, and HAMi-core doesn't need to know how the quota was computed. The two are fully decoupled — KAI keeps its own scheduling logic; what it integrates is the HAMi-core isolation component, not a wholesale replacement of its scheduler by the full HAMi platform.

When the container starts, the dynamic linker loads `libvgpu.so` before the CUDA libraries. HAMi-core reads the injected quota, tracks the container's memory usage, and rewrites device query results — tools like `nvidia-smi` only see the memory within the quota; any new allocation beyond the limit fails immediately.

**This is enforced at the CUDA API layer — not an honor-system value that applications are trusted to respect.**

## Get the Integration Running in Four Steps

The following steps work on any Kubernetes cluster with NVIDIA GPUs already set up (nodes report `nvidia.com/gpu`, and ordinary whole-GPU Pods can run `nvidia-smi`).

### Step 1: Install KAI Scheduler

Enable GPU sharing and the `hamicore` binder plugin:

```bash
helm install kai-scheduler \
  oci://ghcr.io/kai-scheduler/kai-scheduler/kai-scheduler \
  --namespace kai-scheduler --create-namespace \
  --version v0.17.0 \
  --set global.gpuSharing=true \
  --set binder.plugins.hamicore.enabled=true

kubectl -n kai-scheduler wait --for=condition=available \
  --timeout=180s deploy --all
```

Under normal circumstances, all KAI components (admission, binder, operator, scheduler, etc.) enter the Running state, and the default parent/child queues are created.

### Step 2: Install kai-resource-isolator

Install the HAMi-core library distribution component, the injection webhook, and the optional monitor:

```bash
helm install kai-resource-isolator \
  oci://docker.io/projecthami/kai-resource-isolator \
  --namespace kai-resource-isolator --create-namespace \
  --version 1.1.0-chart \
  --set monitor.enabled=true
```

Once deployed, every GPU node runs a ready libsync Pod (which distributes `libvgpu.so`) and a monitor Pod, and the webhook is ready as well.

### Step 3: Submit a GPU-Sharing Pod

Only two things matter: add the `gpu-memory` annotation (an integer in MiB, no unit suffix) and select KAI as the scheduler:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: kai-hami-check
  labels:
    kai.scheduler/queue: default-queue
  annotations:
    gpu-memory: "4096"   # unit: MiB
spec:
  schedulerName: kai-scheduler
  containers:
    - name: cuda
      image: nvidia/cuda:12.4.1-base-ubuntu22.04
      command: ["sleep", "infinity"]
```

The Pod gets scheduled onto a GPU node and enters the Running state.

### Step 4: Verify the Scheduler-to-Runtime Handoff

One command checks three things: the quota KAI injected, the preload file the isolator injected, and the memory HAMi-core exposes to the container:

```bash
kubectl exec kai-hami-check -- sh -lc '
  printf "limit=%s\n" "$CUDA_DEVICE_MEMORY_LIMIT"
  cat /etc/ld.so.preload
  nvidia-smi --query-gpu=uuid,memory.total --format=csv,noheader
'
```

Requesting 4096 MiB on a 15360 MiB T4 produced this output in our test:

```text
limit=4147m
/usr/local/vgpu/libvgpu.so
GPU-9acc8878-3967-5fb4-c534-43d6fd820fa6, 4147 MiB
```

These three lines prove respectively: KAI granted the quota, HAMi-core was injected, and the container sees the isolated ceiling rather than the full card's memory. At this point, the integration chain is live.

Why 4147 instead of exactly 4096 is explained below.

## The GKE Test: Is Hard Isolation Actually Hard?

Test environment: a GKE 1.35/COS/CDI cluster with three `n1-standard-2` nodes, each with one NVIDIA T4 (15360 MiB). KAI Scheduler v0.17.0 handles shared scheduling; kai-resource-isolator 1.1.0-chart injects HAMi-core.

| Check | Observed Result | What It Proves |
| ----- | --------------- | -------------- |
| Node & GPU UUID | Both Pods sit on the same single-GPU node and return the same `GPU-9acc8878-...` | They share the same physical T4 |
| Visible memory | Both Pods report 4147 MiB; the full card has 15360 MiB | HAMi-core exposes only the quota KAI granted each Pod |
| CUDA allocation | Requesting 3 GiB succeeds; accumulating 5 GiB returns `out of memory` | The ceiling is enforced, not just the displayed value |
| Concurrent isolation | While Pod A holds 3 GiB, Pod B can still allocate its own 3 GiB | One Pod cannot consume another Pod's quota |
| Monitor metrics | `:9394/metrics` on the same node reports both Pods' 4.348 GB ceilings and 3.328 GB live usage | Real-time per-Pod memory usage is observable |

When memory was oversubscribed, HAMi-core logged this inside the container:

```text
Device 0 OOM 5475663872 / 4348444672
allocate another 2 GiB: out of memory
```

The meaning is blunt: the container tried to cumulatively hold about 5 GiB (5475663872 bytes) of memory, while its ceiling was 4147 MiB (4348444672 bytes) — the CUDA allocation simply failed.

Together, these results form a complete chain of evidence: **the Pods really did land on the same card → each container sees only its own quota → CUDA allocations truly cannot exceed the ceiling → live usage is observable.**

Two notes:

- The monitor is deployed one per node and only reads that node's local cache. When querying, hit the monitor instance on the node where your workload Pod runs — don't let the Service forward you elsewhere.
- If you want to reproduce this on GKE, beyond the four steps above you will also need to adapt for the read-only root filesystem, RuntimeClass, NVML library paths, CDI device injection, and PriorityClass. For the full walkthrough and troubleshooting, see the "Lab 12" tutorial linked at the end.

## Why 4147 MiB Instead of the Requested 4096?

Because KAI internally converts the MiB request into a **GPU fraction with two decimal places**, then multiplies it by the full card's memory to derive the enforced ceiling: on a 15360 MiB T4, 4096 MiB ≈ 0.27 of a card, and 0.27 × 15360 ≈ 4147 MiB.

So seeing a number slightly higher than what you requested inside the container is normal, not a bug — the actual enforced limit is whatever `CUDA_DEVICE_MEMORY_LIMIT` says.

## Honestly: This Is CUDA-Layer Isolation, Not Hardware Isolation

The boundary must be stated clearly:

What this article verified is **memory limiting at the CUDA API layer**, not a hardware security boundary like MIG. Our GKE compatibility path also used privileged workload containers, so it **should not be treated as a security solution for untrusted multi-tenancy**. For GPU sharing among trusted internal teams, dev/test environments, and mixed inference serving, this combination is hard enough; for untrusted tenants, evaluate hardware-level options such as MIG.

## Summary

- **Background**: KAI Scheduler's fractional GPU sharing was originally "cooperative" — it could share but not isolate; HAMi-core enforces memory quotas at the CUDA API layer, closing the "last mile" of GPU sharing;
- **Integration**: an open-source collaboration spanning more than a year landed two core PRs into the KAI Scheduler mainline, shipped built-in with v0.16.4; HAMi v2.10's KAI Resource Isolator packages the whole chain as an out-of-the-box Helm Chart;
- **Hands-on test**: two Pods shared one T4, each seeing only a 4147 MiB ceiling; allocations within the quota succeeded, excess allocations failed with OOM, and neither Pod could encroach on the other — memory hard isolation, verified.

The "last mile" of GPU sharing is now genuinely open.

## Continue Reading

- Next in the series: [HAMi 2.10 Deep Dive (Part 2): One Ascend Card, Two Pods — Testing Volcano + HAMi-core vNPU Soft Slicing](/blog/volcano-ascend-vnpu-soft-slicing/)
- Part 3: [HAMi 2.10 Deep Dive (Part 3): Exclusive, Binpacked, and NUMA-Aligned — Scheduling Policies Are Now Composable](/blog/hami-composable-scheduler-policies/)
- [HAMi 2.10 Deep Dive: Flexible MIG, AMD vGPU, and a Full Scheduling Ecosystem Upgrade](/blog/hami-v210-deep-dive/)
- Previous: [Dynamia Leads HAMi-core Integration into KAI Scheduler, Closing the Hard Isolation Gap for Production-Grade GPU Sharing](/blog/hami-core-adopted-by-kai-scheduler/)
- Reproduce the test: [Lab 12: Verifying KAI Scheduler and HAMi Memory Isolation on GKE](https://project-hami.io/zh/tutorials/labs/kai-scheduler-hami-gke)

## References

- HAMi v2.10.0 release announcement: <https://project-hami.io/zh/blog/hami-v2-10-0-release>
- User guide, "How to use HAMi with KAI Scheduler": <https://project-hami.io/zh/docs/next/userguide/kai-scheduler/how-to-use-kai-scheduler>
- Related repositories:
  - HAMi: <https://github.com/Project-HAMi/HAMi>
  - HAMi-core: <https://github.com/Project-HAMi/HAMi-core>
  - KAI-resource-isolator: <https://github.com/Project-HAMi/KAI-resource-isolator>
  - KAI Scheduler: <https://github.com/kai-scheduler/KAI-Scheduler>

Author: Jimmy Song (Dynamia AI).
