---
title: >-
  HAMi 2.10 Deep Dive (Part 3): Exclusive, Binpacked, and NUMA-Aligned — Scheduling Policies Are
  Now Composable
linktitle: HAMi Composable Scheduling Policies
date: '2026-08-26'
excerpt: >-
  Inference replicas want tight binpacking, multi-GPU Pods want the same NUMA node for bandwidth,
  and latency-sensitive workloads want whole GPUs to themselves — three policies in one sentence,
  and you used to have to pick just one. In the third article of our HAMi 2.10 deep-dive series, we
  explain the filter-then-sort evaluation model and verify each step with a real selection path
  across four T4s.
author: Jimmy Song
tags:
  - HAMi
  - GPU Sharing
  - Scheduling
  - Kubernetes
  - binpack
  - NUMA
category: Technical Deep Dive
language: en
coverTitle: HAMi 2.10 Deep Dive (Part 3)
---

> Inference replicas want tight binpacking, multi-GPU Pods want the same NUMA node for bandwidth, and latency-sensitive workloads want whole GPUs to themselves — three policies in one sentence, and you used to have to pick just one. In the third article of our HAMi 2.10 deep-dive series, we explain the filter-then-sort evaluation model and verify each step with a real selection path across four T4s.

The [first two articles](/blog/kai-scheduler-hami-gpu-memory-hard-isolation/) in this series covered HAMi's integration with external schedulers: KAI Scheduler for NVIDIA GPUs ([Part 1](/blog/kai-scheduler-hami-gpu-memory-hard-isolation/)) and Volcano for Ascend NPUs ([Part 2](/blog/volcano-ascend-vnpu-soft-slicing/)). This article returns to HAMi's own scheduler for another easily overlooked but very practical v2.10.0 feature: **composable scheduling policies**.

HAMi has long offered per-Pod GPU scheduling policies via the `hami.io/gpu-scheduler-policy` annotation: `binpack` stacks workloads onto fewer cards, `spread` scatters them, and the new-in-v2.10.0 `mutex` demands a card of its own. But before v2.10.0, the annotation accepted only **one** value.

Real clusters rarely need just one behavior. A typical production wish list: inference replicas should binpack tightly to leave whole cards free; each Pod's multiple GPUs should land on the same NUMA node for bandwidth; and the latency-sensitive batch should have a few cards entirely to itself. Three policies in a single sentence. Before v2.10.0, you picked one and gave up the rest.

v2.10.0 completes the puzzle: `hami.io/gpu-scheduler-policy` now accepts an **ordered, comma-separated list**, and filter-type and scoring-type policies can be combined (PR #2621 by @mesutoezdil, closing issue #2010):

```yaml
# Exclusive GPU first, then binpack, with NUMA as the tiebreaker
metadata:
  annotations:
    hami.io/gpu-scheduler-policy: "mutex,binpack,numa"
```

## Two Kinds of Policies: Filters and Sort Keys

The key to understanding this feature is recognizing that HAMi's GPU policies were never the same kind of thing — they play two different roles:

| Policy | Role | What it does |
|-|-|-|
| `mutex` | **Filter** | Only cards with zero workloads are candidates; every occupied card is removed |
| `topology-aware` | **Filter** (NVIDIA only) | Keeps only cards whose NVLink/NVSwitch topology satisfies the multi-GPU request; requires topology-aware scheduling to be enabled |
| `binpack` | **Sort key** | Prefers the most-utilized qualified card, concentrating workloads |
| `spread` | **Sort key** | Prefers the least-utilized qualified card, scattering workloads |
| `numa` | **Sort key** | Prefers cards on lower-numbered NUMA nodes, improving locality |

A filter answers a yes/no question per card: can this card participate at all? A sort key answers a ranking question: among qualified cards, who comes first? The two roles don't conflict, which is exactly why they compose: **filters run first and shrink the candidate set; sort keys then rank the survivors.**

## How the Scheduler Evaluates a Policy Chain

When filtering and scoring a node's GPUs, the HAMi scheduler evaluates the policy chain as a fixed pipeline:

![Policy chain pipeline: parse the annotation, filter with mutex/topology-aware, sort by written order binpack→spread→numa, break full ties by device index, and fall back to spread when only filters are present](/images/blog/hami-composable-scheduler-policies/policy-pipeline-en.png)

The rules, in order:

1. **Parse.** The annotation is split on commas, surrounding whitespace per item is ignored, duplicates are dropped, and only known policy names take effect.
2. **Filter first.** `mutex` and `topology-aware` apply before any sorting. For a Pod with `mutex`, exactly one question decides whether a card qualifies: does this card currently have zero tenants? Even a card running one tiny workload with plenty of free memory is excluded entirely. When every card has a tenant, the Pod stays Pending with reason `ExclusiveDeviceAllocateConflict`.
3. **Sort in written order.** `binpack`, `spread`, and `numa` form an ordered list of sort keys. The first key dominates: `binpack,numa` sorts by binpack, and only when binpack scores two cards equally does the NUMA node number break the tie; `numa,binpack` reverses the precedence. **The order of the list is the order of the keys.**
4. **Deterministic tiebreak.** If two cards compare equal under every key in the chain, the smaller device index wins. So on an idle cluster, identical requests produce identical, reproducible placements.
5. **Filters-only fallback.** A chain containing no sort keys at all (e.g. `"mutex,topology-aware"`) falls back to `spread` ordering after filtering.
6. **Single-value behavior unchanged.** A bare `"binpack"`, `"spread"`, or `"mutex"` behaves exactly as before v2.10.0; existing workloads need no changes on upgrade.

## What the Sort Keys Actually Compare

For `binpack` and `spread`, "fullest/emptiest" is not a guess: the scheduler computes a utilization score per card from its allocated compute and memory, with weights across slot, core, and memory (adjustable per Pod via the `hami.io/device-scoring-weights` annotation). `binpack` picks the **highest-scoring** card, `spread` the **lowest**. The `numa` key compares the NUMA node number each card reports via NVML.

Worth noting: v2.10.0 also fixed a related long-standing issue (PR #2012): previously, even with pure `binpack`/`spread`, NUMA was the *primary* sort key, pinning workloads to one NUMA node regardless of actual utilization. After the fix, utilization score is the primary key and NUMA only breaks ties — which is precisely the tiebreaker role `numa` plays in a policy chain.

## Worked Example: One Pod's Selection Path Across Four Cards

Put the flow into a real scenario: one node, four Tesla T4s, and a Pod annotated `mutex,binpack` requesting 1 vGPU (a 1000 MiB slice). Each card is labeled with its tenant count and utilization score; the arrows are the selection path:

![Selection path: mutex drops GPU 0 and GPU 1 which have tenants; binpack ranks the two idle survivors; scores tie at 0.00 and the device-index tiebreak picks GPU 2](/images/blog/hami-composable-scheduler-policies/selection-path-en.png)

Two things to read from the diagram:

- The busiest GPU 0 never reaches the sorting step: the `mutex` filter removed it first, even though pure `binpack` would have chosen it with the top score of 3.30. **Filtering precedes sorting; the composed chain never considers the card pure `binpack` would pick.**
- The two survivors score the same (both 0.00), `binpack` can't distinguish them, and the chain falls through to the device-index tiebreak, deterministically choosing GPU 2.

These numbers come from a real test: a card with one 1000 MiB tenant scored `1.651042` and an idle card scored `0.000000`, both straight from the scheduler's scoring logs.

## Common Recipes

| Annotation | Meaning |
|-|-|
| `"binpack"` | Stack this Pod onto the busiest card that fits, maximizing whole-card idle |
| `"spread"` (default) | Place on the emptiest card, minimizing neighbor contention |
| `"mutex"` | Demand a card with zero current users |
| `"binpack,numa"` | Binpack; on a binpack tie, prefer the lower NUMA node |
| `"mutex,binpack"` | Exclusive and compact: among idle cards pick the busiest, reducing fragmentation |
| `"mutex,binpack,numa"` | The "latency tier" recipe: exclusive card, binpack among idle cards, NUMA as tiebreaker |

An important note on `mutex` semantics: it guarantees the card has zero users **at placement time**; ordinary Pods scheduled later may still join the card. To keep a card exclusive for a workload's entire lifetime, request all of its resources (memory and compute), or pin it explicitly with `nvidia.com/use-gpuuuid`.

## Getting Started in Three Steps

**1. Upgrade to HAMi v2.10.0 or later:**

```bash
helm repo add hami-charts https://project-hami.github.io/HAMi/
helm repo update
helm upgrade hami hami-charts/hami -n kube-system --version 2.10.0
```

Cluster-level defaults remain `binpack` for node selection and `spread` for card selection; upgrading changes no defaults.

**2. Annotate the Pods that need combined behavior:**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: inference-latency-tier
  annotations:
    hami.io/gpu-scheduler-policy: "mutex,binpack,numa"
spec:
  containers:
    - name: app
      image: ubuntu:22.04
      command: ["bash", "-c", "sleep 86400"]
      resources:
        limits:
          nvidia.com/gpu: 1      # 1 vGPU
          nvidia.com/gpumem: 8000 # 8000 MiB memory quota
```

**3. Verify the decision.** The scheduler writes the chosen card onto the Pod, so you can verify placement without entering the container:

```bash
# Chosen card's device UUID, vendor, memory slice, and compute percentage
kubectl get pod inference-latency-tier \
  -o jsonpath='{.metadata.annotations.hami\.io/vgpu-devices-allocated}'; echo
```

For a `mutex` Pod stuck Pending, `kubectl describe pod` shows reason `ExclusiveDeviceAllocateConflict`; the scheduler also emits one utilization-scoring log line per candidate card while filtering (`computer score is`), letting you observe exactly how `binpack` and `spread` rank:

```bash
kubectl -n kube-system logs deploy/hami-scheduler -c vgpu-scheduler-extender \
  --tail=-1 | grep 'computer score' | tail
```

## Try It on a Real Cluster

Reading about filters and sort keys is one thing; watching a `mutex` Pod stay Pending until you free a card, and watching `mutex,binpack` refuse the card pure `binpack` would have picked, is another. [Lab 14](https://project-hami.io/tutorials/labs/composable-scheduler-policies-gke) runs the full feature matrix on a GKE node with four Tesla T4s: default `spread`, `binpack` stacking, `mutex` blocking and release, and combined `mutex,binpack` behavior — all verified via allocation annotations, events, and scheduler logs.

## Summary

- HAMi's GPU scheduling policies come in two kinds: `mutex`/`topology-aware` are **filters** (who gets to compete), and `binpack`/`spread`/`numa` are **sort keys** (who ranks first); the two kinds compose naturally;
- v2.10.0 lets the annotation accept an ordered comma-separated list, evaluated as "filter first, then sort in written order, device index breaks ties," with single-value behavior identical to before the upgrade;
- A related old NUMA-as-primary-key issue was fixed along the way, returning `numa` to its tiebreaker role — utilization score is the primary key.

In one sentence: **HAMi's scheduling policies went from a multiple-choice question to a recipe.**

Author: Jimmy Song (宋净超), Dynamia AI.

## Series Reading

- Previous: [HAMi 2.10 Deep Dive (Part 2): One Ascend Card, Two Pods — Testing Volcano + HAMi-core vNPU Soft Slicing](/blog/volcano-ascend-vnpu-soft-slicing/)
- Part 1: [HAMi 2.10 Deep Dive (Part 1): Tested — KAI Scheduler + HAMi GPU Memory Hard Isolation](/blog/kai-scheduler-hami-gpu-memory-hard-isolation/)
- [HAMi v2.10.0 Release: Flexible MIG, Composable Scheduling Policies, and a Broader Accelerator Ecosystem](https://project-hami.io/blog/hami-v2-10-0-release)
- Hands-on lab: [Lab 14: Validating Composable Scheduling Policies on GKE](https://project-hami.io/tutorials/labs/composable-scheduler-policies-gke)

## References

- Original post on the HAMi website: <https://project-hami.io/blog/composable-scheduler-policies>
- HAMi v2.10.0 release announcement: <https://project-hami.io/blog/hami-v2-10-0-release>
- Lab 14 tutorial (full reproduction steps on GKE): <https://project-hami.io/tutorials/labs/composable-scheduler-policies-gke>
- PR #2621 (comma-separated gpu-scheduler-policy): <https://github.com/Project-HAMi/HAMi/pull/2621>
- Issue #2010 (Composable scheduling policies): <https://github.com/Project-HAMi/HAMi/issues/2010>
- Scheduling design document: <https://project-hami.io/docs/developers/scheduling>
- Configuration reference: <https://project-hami.io/docs/userguide/configure>
