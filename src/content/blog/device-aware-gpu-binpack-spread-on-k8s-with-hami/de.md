---
title: 'Zwei Achsen, vier Muster: Device-Aware GPU Binpack/Spread auf K8s mit HAMi'
coverTitle: Device-Aware GPU Binpack/Spread-Scheduling auf Kubernetes
date: '2025-09-19'
excerpt: >-
  Praktisches 2×2-Framework für GPU-Scheduling in Kubernetes: Kombination von
  Binpack/Spread auf Knoten- und GPU-Ebene. Wie HAMi device-aware Scheduling
  jenseits nativer K8s-Fähigkeiten ermöglicht – mit vier Mustern für Kosten,
  GPU-Verfügbarkeit und Performance bei KI-Workloads.
author: Dynamia
tags:
  - GPU-Scheduling
  - HAMi
  - Device-Aware
  - DRA
  - KI-Infra
  - Best Practices
category: Technical Deep Dive
coverImage: /images/blog/device-aware-gpu-binpack-spread-on-k8s-with-hami/cover-en.png
linktitle: Device-Aware GPU-Scheduling
---

Pods landen nicht nur auf **Knoten** – GPU-Pods landen auch auf **GPUs**. Kubernetes bietet solides **Binpacking/Spreading auf Knotenebene** (z. B. `MostAllocated`, Topology Spread). **GPU-level** Binpack/Spread braucht jedoch eine **device-aware Implementierung**. Kubernetes 1.34 **DRA** macht Gerätebeschreibung und -zuteilung erstklassig und überbrückt zu **Extended Resources** – aber **generisches Device-Scoring** für eingebautes GPU-Binpack/Spread ist noch in Arbeit.

## Warum „zwei Achsen“?

* **Knoten-Achse:**
  * **Binpack** (z. B. `MostAllocated`, `RequestedToCapacityRatio`) fördert Konsolidierung und erleichtert **Cluster Autoscaler**-Schrumpfen → Kostenkontrolle.
  * **Spread** (Pod Topology Spread) verbessert **Verfügbarkeit** und stabilisiert Tail-Latenz durch Vermeidung einzelner Ausfalldomänen.
* **GPU-Achse:**
  * **Binpack** auf Geräten drängt kleine Workloads auf weniger **physische GPUs** und hält **ganze GPUs** für Training oder Bursts frei.
  * **Spread** auf Geräten reduziert **Konkurrenz innerhalb der GPU** (HBM/SM/PCIe/NVLink) und glättet **P99** bei Online-Inferenz.

Bei der zweiten Achse sind native Regler begrenzt. **Knoten-Scoring** sieht nicht, **welche** GPU ein Pod bekäme. DRA strukturiert Zuteilung, aber **Device-/Knoten-Scoring für DRA** ist WIP, und **NodeResourcesFit** gilt nicht für *von DRA unterstützte Extended Resources* (Migrationsbrücke in 1.34).

## Was DRA löst (und was nicht)

* **Löst:** Standardmodell zum **Beschreiben** von Geräten (`ResourceSlice`), **Anfordern** (`ResourceClaim`) und **Klassifizieren** (`DeviceClass`). Kubernetes zuteilt passende Geräte und platziert Pods auf zugänglichen Knoten. In 1.34 erlaubt **KEP-5004**, DRA-Geräte auf **Extended-Resource-Namen** zu mappen – bestehende Manifeste können `vendor.com/gpu: N` behalten.
* **Noch nicht:** **Generischer Scheduler-Scorer** für „eingebautes“ GPU-Binpack/Spread. Issues für **`dynamicresources`-Scorer**; bis dahin Device-Strategien von Treibern oder device-aware Schedulern. **NodeResourcesFit** funktioniert nicht für DRA-gestützte Extended Resources.

## 2×2 zum Anfassen: Knoten × GPU = vier Muster

Ein minimales, reproduzierbares Setup zeigt alle vier Muster. Ziel: **Trade-offs** beobachten, die in Produktion typisch sind.

### One-Click-Setup

Manifeste und Terraform:

* Repo: `https://github.com/dynamia-ai/hami-ecosystem-demo`
* Demos: [`demo/binpack-spread`](https://github.com/dynamia-ai/hami-ecosystem-demo/tree/main/demo/binpack-spread) (vier YAMLs = vier Muster). Jedes YAML ist ein minimales `Deployment`; nur zwei Regler ändern sich:
  **Policies (zwei Achsen)** per Annotation:

  ```yaml
  template:
    metadata:
      annotations:
        hami.io/node-scheduler-policy: "binpack"  # or "spread"
        hami.io/gpu-scheduler-policy:  "binpack"  # or "spread"
  ```

  **GPU-Quotas** via [HAMi](https://github.com/Project-HAMi/HAMi):

  ```yaml
  resources:
    limits:
      nvidia.com/gpu: 1
      nvidia.com/gpumem: "7500"  # ≈7.5GB cap so two pods can co-locate on one GPU
  ```

  Alles andere (Image/Args) ist identisch.

EKS-Umgebung starten:

```bash
git clone <https://github.com/dynamia-ai/hami-ecosystem-demo>
cd hami-ecosystem-demo/infra/aws
terraform init
terraform apply -auto-approve
```

Zwei GPU-Knoten (**4×T4** und **4×A10G**). Schritt-für-Schritt: **„One-Click Setup“** in:

*Virtualizing Any GPU on AWS with HAMi: Free Memory Isolation* — auch auf: [Reddit](https://www.reddit.com/r/kubernetes/comments/1ncjzn0/virtualizing_any_gpu_on_aws_with_hami_free_memory/) | [Medium](https://medium.com/@nimbus-nimo/virtualizing-any-gpu-on-aws-with-hami-free-memory-isolation-bbd3c598b9fa)

### A) Knoten **binpack** × GPU **binpack** — *„Kosten sparen & ganze GPUs freihalten.“*

* **Wann:** Viele kleine Inferenz- oder Batch-Jobs; Autoscaler-Spielraum und intakte GPUs für späteres Training.
* **Vorteil:** Weniger aktive Knoten; höhere Chance auf **ganze GPUs**.
* **Kosten:** Konkurrenz innerhalb der GPU → **P99-Risiko** bei latenzkritischem Traffic.

![binpack-spread-1.png](/images/blog/device-aware-gpu-binpack-spread-on-k8s-with-hami/binpack-spread-1.png)

Ausführen:

```bash
kubectl apply -f demo/binpack-spread/a-node-binpack-gpu-binpack.yaml

{
  printf "POD\\tNODE\\tUUIDS\\n";
  kubectl get po -l app=demo-a -o json \\
  | jq -r '.items[] | select(.status.phase=="Running") | [.metadata.name,.spec.nodeName] | @tsv' \\
  | while IFS=$'\\t' read -r pod node; do
      uuids=$(kubectl exec "$pod" -c vllm -- nvidia-smi --query-gpu=uuid --format=csv,noheader | paste -sd, -);
      printf "%s\\t%s\\t%s\\n" "$pod" "$node" "$uuids";
    done;
} | column -t -s $'\\t'
```

Beobachtet (Beispiel):

```
POD                                               NODE                                       UUIDS
demo-a-node-binpack-gpu-binpack-6899f6dfdd-8z8rx  ip-10-0-52-161.us-west-2.compute.internal  GPU-b0e94721-ad7c-6034-4fc8-9f0d1ac7d60d
demo-a-node-binpack-gpu-binpack-6899f6dfdd-nfbz4  ip-10-0-52-161.us-west-2.compute.internal  GPU-b0e94721-ad7c-6034-4fc8-9f0d1ac7d60d
demo-a-node-binpack-gpu-binpack-6899f6dfdd-dtx7b  ip-10-0-52-161.us-west-2.compute.internal  GPU-85caf98e-de2d-1350-ed83-807af940c199
demo-a-node-binpack-gpu-binpack-6899f6dfdd-wtd47  ip-10-0-52-161.us-west-2.compute.internal  GPU-85caf98e-de2d-1350-ed83-807af940c199
```

> Ein **Knoten**; Pods auf der **minimalen GPU-Anzahl** für ihre Limits (hier 2 GPUs).

### B) Knoten **spread** × GPU **binpack** — *„HA über Knoten, ganze GPUs freihalten.“*

* **Wann:** Multi-Replica mit **Zonen-/Knoten-Diversität**, kleine Jobs trotzdem auf GPUs verdichten.
* **Vorteil:** HA + **ganze GPUs verfügbar**.
* **Kosten:** Cluster schwerer schrumpfbar.

![binpack-spread-2.png](/images/blog/device-aware-gpu-binpack-spread-on-k8s-with-hami/binpack-spread-2.png)

```bash
kubectl delete -f demo/binpack-spread/a-node-binpack-gpu-binpack.yaml
kubectl apply -f demo/binpack-spread/b-node-spread-gpu-binpack.yaml
# ... gleiches Print-Skript, Label app=demo-b
```

Beobachtet (Beispiel):

```
POD                                              NODE                                       UUIDS
demo-b-node-spread-gpu-binpack-548cb55c7d-8tg22  ip-10-0-52-161.us-west-2.compute.internal  GPU-dedbdfb2-408f-9ded-402f-e3dc22c08f66
demo-b-node-spread-gpu-binpack-548cb55c7d-h9ds6  ip-10-0-61-248.us-west-2.compute.internal  GPU-5f432a79-775e-db04-1e15-82307fdb5a1b
demo-b-node-spread-gpu-binpack-548cb55c7d-ncwdl  ip-10-0-61-248.us-west-2.compute.internal  GPU-5f432a79-775e-db04-1e15-82307fdb5a1b
demo-b-node-spread-gpu-binpack-548cb55c7d-stx67  ip-10-0-52-161.us-west-2.compute.internal  GPU-dedbdfb2-408f-9ded-402f-e3dc22c08f66
```

> **Über Knoten verteilt**, aber **pro Knoten auf dieselbe GPU gepackt**.

### C) Knoten **binpack** × GPU **spread** — *„Etwas Kosten sparen, Tail-Latenz schützen.“*

* **Wann:** Online-Inferenz; moderate Konsolidierung ohne Stapeln auf derselben GPU.
* **Vorteil:** Konsolidierung auf Knotenebene; **weniger Konkurrenz** zwischen GPUs.
* **Kosten:** Nicht so günstig wie (A).

![binpack-spread-3.png](/images/blog/device-aware-gpu-binpack-spread-on-k8s-with-hami/binpack-spread-3.png)

```bash
kubectl delete -f demo/binpack-spread/b-node-spread-gpu-binpack.yaml
kubectl apply -f demo/binpack-spread/c-node-binpack-gpu-spread.yaml
# ... Print-Skript, Label app=demo-c
```

Beobachtet (Beispiel):

```
POD                                             NODE                                       UUIDS
demo-c-node-binpack-gpu-spread-d5f686b67-8zbz9  ip-10-0-61-248.us-west-2.compute.internal  GPU-041286d5-ed3d-4823-096e-a4c80fe17fb9
demo-c-node-binpack-gpu-spread-d5f686b67-hn2md  ip-10-0-61-248.us-west-2.compute.internal  GPU-b639414c-f867-90c3-dd3b-a2bd094a703e
demo-c-node-binpack-gpu-spread-d5f686b67-rrpzb  ip-10-0-61-248.us-west-2.compute.internal  GPU-4bfe5899-5368-2e73-de03-d34894b6d75c
demo-c-node-binpack-gpu-spread-d5f686b67-sv8fg  ip-10-0-61-248.us-west-2.compute.internal  GPU-5f432a79-775e-db04-1e15-82307fdb5a1b
```

> **Ein Knoten**, **über mehrere GPUs verteilt**.

### D) Knoten **spread** × GPU **spread** — *„Tail-Latenz zuerst.“*

* **Wann:** Strenge SLA (Suche, Ads, Chat), **P99** dominiert.
* **Vorteil:** Geringe Störung auf beiden Achsen.
* **Kosten:** Höchste Kosten; maximale Fragmentierung.

![binpack-spread-4.png](/images/blog/device-aware-gpu-binpack-spread-on-k8s-with-hami/binpack-spread-4.png)

```bash
kubectl delete -f demo/binpack-spread/c-node-binpack-gpu-spread.yaml
kubectl apply -f demo/binpack-spread/d-node-spread-gpu-spread.yaml
# ... Print-Skript, Label app=demo-d
```

Beobachtet (Beispiel):

```
POD                                            NODE                                      UUIDS
demo-d-node-spread-gpu-spread-c4555d97c-5gqkf  ip-10-0-52-161.us-west-2.compute.internal  GPU-b0e94721-ad7c-6034-4fc8-9f0d1ac7d60d
demo-d-node-spread-gpu-spread-c4555d97c-666dc  ip-10-0-61-248.us-west-2.compute.internal  GPU-5f432a79-775e-db04-1e15-82307fdb5a1b
demo-d-node-spread-gpu-spread-c4555d97c-8xjbh  ip-10-0-61-248.us-west-2.compute.internal  GPU-4bfe5899-5368-2e73-de03-d34894b6d75c
demo-d-node-spread-gpu-spread-c4555d97c-k727x  ip-10-0-52-161.us-west-2.compute.internal  GPU-dedbdfb2-408f-9ded-402f-e3dc22c08f66
```

> **Über GPUs und Knoten verteilt**.

## Wo DRA heute (und morgen) steht

* **Heute:** DRA standardisiert *was* zuzuteilen ist und *wo es laufen kann*. Mit **KEP-5004** können Apps Extended Resources anfragen, während **Treiber + Slices** darunter arbeiten – Migration weg vom DevicePlugin. **Aber:** **NodeResourcesFit** gilt nicht für DRA-gestützte Extended Resources; **`dynamicresources`-Scorer** für korrektes Binpacking in Arbeit.
* **Morgen:** Mit DRA **Device-/Knoten-Scoring** kann mehr im Core passieren. Device-aware bleibt wichtig für **Karten-interne Topologie** (NUMA/NVLink) und Policy-Nuancen.

## Repro & Referenzen

* **Umgebung + vier Demos**
  `https://github.com/dynamia-ai/hami-ecosystem-demo`
  `https://github.com/dynamia-ai/hami-ecosystem-demo/tree/main/demo/binpack-spread`
* **Hintergrund**
  [*Virtualizing Any GPU on AWS with HAMi: Free Memory Isolation* (siehe **One-Click Setup**)](https://medium.com/@nimbus-nimo/virtualizing-any-gpu-on-aws-with-hami-free-memory-isolation-bbd3c598b9fa)
  [*A Quick Take on K8s 1.34 GA DRA: 7 Questions You Probably Have*](https://medium.com/@nimbus-nimo/a-quick-take-on-k8s-1-34-ga-dra-7-questions-you-probably-have-e981966f06c7)
* **DRA-Kontext (v1.34)**
  [Kubernetes PR **#130653**](https://github.com/kubernetes/kubernetes/pull/130653) (**Extended Resources via DRA**; **`NodeResourcesFit`** gilt nicht)
  [KEP **#5004**](https://github.com/kubernetes/enhancements/blob/3ffc27b7413e285d429025a422dd79473d3e9b50/keps/sig-scheduling/5004-dra-extended-resource/README.md)
  [Issue **#133669**](https://github.com/kubernetes/kubernetes/issues/133669) (**`dynamicresources`-Scorer**)

![HAMi-Architekturdiagramm heterogene Computing-Unterstützung](/images/blog/PREP-EDU-HAMi/p5.png)

Dynamia setzt auf CNCF HAMi als Kern und liefert flexible, zuverlässige, bedarfsgerechte und elastische GPU-Virtualisierung, heterogenes Compute-Scheduling und einheitliches Management global. Plug-in-, leichtgewichtig und nicht-invasiv in Public, Private oder Hybrid Cloud; heterogene Chips wie NVIDIA, Ascend, MetaX, Cambricon, Hygon, Moore Threads und Biren.

> Website: [https://dynamia.ai](https://dynamia.ai)
> E-Mail: [info@dynamia.ai](mailto:info@dynamia.ai)