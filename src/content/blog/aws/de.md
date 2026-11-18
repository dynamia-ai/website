---
title: 'Beliebige GPUs auf AWS mit HAMi virtualisieren: kostenlose Speicher-Isolation'
coverTitle: 'Beliebige GPUs auf AWS mit HAMi virtualisieren'
date: '2025-09-16'
excerpt: >-
  Von Deployment bis Verifikation: ein HAMi × vLLM-Pfad für Multi-Modell-Deployment
  und Ressourcen-Wiederverwendung in Kubernetes.
author: Dynamia
tags:
  - HAMi
  - GPU Virtualization
  - AWS
  - Kubernetes
  - vLLM
  - GPU Memory Isolation
  - Multi-Model Inference
  - Cloud AI
  - GPU Binpacking
  - EKS
  - Terraform
  - AI Infrastructure
category: Integration & Ecosystem
coverImage: /images/blog/Demystifying-the-Reservation-Pod/cover.jpg
linktitle: AWS-Integration
---

**TL;DR:** Diese Anleitung startet einen AWS-EKS-Cluster mit zwei GPU-Node-Groups (T4 und A10G), installiert HAMi automatisch und deployt drei vLLM-Services, die pro Knoten eine physische GPU per Speicher-Isolation teilen. GPU-Binpack live: mehrere Pods auf derselben GPU, wenn die Limits es erlauben.

---

## Warum HAMi auf AWS?

HAMi bringt GPU-modellunabhängige Virtualisierung nach Kubernetes — von Consumer- bis Rechenzentrum-GPUs. Auf AWS nutzen Sie gängige NVIDIA-Instanzen (z. B. **g4dn.12xlarge** mit T4, **g5.12xlarge** mit A10G) und **schneiden GPU-Speicher**, um mehrere Pods sicher auf einer Karte zu packen — ohne App-Änderungen.

**In dieser Demo:**

- **Zwei Knotentypen:** ein T4-Knoten, ein A10G-Knoten (je 4 GPUs).
- **HAMi** wird per Helm im Terraform-Apply installiert.
- **vLLM**-Workloads fordern GPU-Speicheranteile an, sodass zwei Pods auf einer GPU laufen können.

---

## Setup mit einem Klick

**Repo:** [github.com/dynamia-ai/hami-ecosystem-demo](https://github.com/dynamia-ai/hami-ecosystem-demo)

### 0) Voraussetzungen

- Terraform or OpenTofu
- AWS CLI v2 (and `aws sts get-caller-identity` succeeds)
- kubectl, jq

### 1) AWS bereitstellen + HAMi installieren

```bash
git clone https://github.com/dynamia-ai/hami-ecosystem-demo.git
cd infra/aws
terraform init
terraform apply -auto-approve
```

Anschließend kubectl mit dem Output konfigurieren:

```bash
terraform output -raw kubectl_config_command
# Example:
# aws eks update-kubeconfig --region us-west-2 --name hami-demo-aws
```

### 2) Cluster & HAMi prüfen

HAMi-Komponenten laufen:

```bash
kubectl get pods -n kube-system | grep -i hami
```

Beispielausgabe:

```text
hami-device-plugin-mtkmg             2/2     Running   0          3h6m
hami-device-plugin-sg5wl             2/2     Running   0          3h6m
hami-scheduler-574cb577b9-p4xd9      2/2     Running   0          3h6m
```

Registrierte GPUs pro Knoten (HAMi annotiert Inventar):

```bash
kubectl get nodes -o jsonpath='{range .items[*]}{.metadata.name}\t{.metadata.annotations.hami\\.io/node-nvidia-register}\n{end}'
```

Beispielausgabe:

```text
ip-10-0-38-240.us-west-2.compute.internal GPU-f8e75627-86ed-f202-cf2b-6363fb18d516,10,15360,100,NVIDIA-Tesla T4,0,true,0,hami-core:GPU-7f2003cf-a542-71cf-121f-0e489699bbcf,10,15360,100,NVIDIA-Tesla T4,0,true,1,hami-core:GPU-90e2e938-7ac3-3b5e-e9d2-94b0bd279cf2,10,15360,100,NVIDIA-Tesla T4,0,true,2,hami-core:GPU-2facdfa8-853c-e117-ed59-f0f55a4d536f,10,15360,100,NVIDIA-Tesla T4,0,true,3,hami-core:
ip-10-0-53-156.us-west-2.compute.internal GPU-bd5e2639-a535-7cba-f018-d41309048f4e,10,23028,100,NVIDIA-NVIDIA A10G,0,true,0,hami-core:GPU-06f444bc-af98-189a-09b1-d283556db9ef,10,23028,100,NVIDIA-NVIDIA A10G,0,true,1,hami-core:GPU-6385a85d-0ce2-34ea-040d-23c94299db3c,10,23028,100,NVIDIA-NVIDIA A10G,0,true,2,hami-core:GPU-d4acf062-3ba9-8454-2660-aae402f7a679,10,23028,100,NVIDIA-NVIDIA A10G,0,true,3,hami-core:
```

## Demo-Workloads deployen

Manifeste anwenden (zwei A10G-Services, ein T4-Service):

```bash
kubectl apply -f demo/workloads/a10g.yaml
kubectl apply -f demo/workloads/t4.yaml
kubectl get pods -o wide
```

Beispielausgabe:

```text
NAME                                       READY   STATUS    RESTARTS   AGE    IP            NODE                                        NOMINATED NODE   READINESS GATES
vllm-a10g-mistral7b-awq-5f78b4c6b4-q84k7   1/1     Running   0          172m   10.0.50.145   ip-10-0-53-156.us-west-2.compute.internal   <none>           <none>
vllm-a10g-qwen25-7b-awq-6d5b5d94b-nxrbj    1/1     Running   0          172m   10.0.49.180   ip-10-0-53-156.us-west-2.compute.internal   <none>           <none>
vllm-t4-qwen25-1-5b-55f98dbcf4-mgw8d       1/1     Running   0          117m   10.0.44.2     ip-10-0-38-240.us-west-2.compute.internal   <none>           <none>
vllm-t4-qwen25-1-5b-55f98dbcf4-rn5m4       1/1     Running   0          117m   10.0.37.202   ip-10-0-38-240.us-west-2.compute.internal   <none>           <none>
```

## Was die zwei zentralen Annotations bewirken

In den Pod-Templates:

```yaml
metadata:
  annotations:
    nvidia.com/use-gputype: "A10G"   # or "T4" on the T4 demo
    hami.io/gpu-scheduler-policy: "binpack"
```

- `nvidia.com/use-gputype` beschränkt Scheduling auf das GPU-Modell (z. B. A10G, T4).
- `hami.io/gpu-scheduler-policy: binpack` lässt HAMi Pods auf **dieselbe physische GPU** packen, wenn Speicher-/Kern-Limits es erlauben (GPU-Binpack).

---

## Speicher-Isolation anfordern

Jeder Container setzt GPU-Speicherlimits über HAMi-Ressourcennamen — mehrere Pods teilen sicher eine Karte:

- T4: `nvidia.com/gpumem: "7500"` (MiB) mit 2 Replikas ⇒ beide auf 16-GB-T4.
- A10G: `nvidia.com/gpumem-percentage: "45"` pro Deployment ⇒ zwei Pods auf 24-GB-A10G.

HAMi erzwingt die Limits im Container und auf dem Host — kein Überschreiten der zugewiesenen GPU-Speicher.

---

## Erwartete Ergebnisse: GPU-Binpack

- **T4-Deployment** (`vllm-t4-qwen25-1-5b`, replicas: 2): beide Replikas auf derselben T4 des T4-Knotens.
- **A10G-Deployments** (`vllm-a10g-mistral7b-awq` und `vllm-a10g-qwen25-7b-awq`): beide auf derselben A10G (45% + 45% < 100%).

## Co-Location und Speicher-Caps verifizieren

### Im Pod (`nvidia-smi`)

```bash
#A10G pair
for p in $(kubectl get pods -l app=vllm-a10g-mistral7b-awq -o name; \
           kubectl get pods -l app=vllm-a10g-qwen25-7b-awq -o name); do
  echo "== $p =="
  # Show the GPU UUID (co‑location check)
  kubectl exec ${p#pod/} -- nvidia-smi --query-gpu=uuid --format=csv,noheader
  # Show memory cap (total) and current usage inside the container view
  kubectl exec ${p#pod/} -- nvidia-smi --query-gpu=name,memory.total,memory.used --format=csv,noheader
  echo
done
```

**Erwartung:**

- Beide A10G-Pods dieselbe **GPU-UUID** → **Co-Location auf derselben A10G**.
- `memory.total` im Container **≈ 45 % A10G-VRAM** (etwas weniger durch Treiber/Overhead; z. B. **~10.3xx MiB**), `memory.used` unter dem Cap.

Beispielausgabe:

```text
== pod/vllm-a10g-mistral7b-awq-5f78b4c6b4-q84k7 ==
GPU-d4acf062-3ba9-8454-2660-aae402f7a679
NVIDIA A10G, 10362 MiB, 7241 MiB

== pod/vllm-a10g-qwen25-7b-awq-6d5b5d94b-nxrbj ==
GPU-d4acf062-3ba9-8454-2660-aae402f7a679
NVIDIA A10G, 10362 MiB, 7355 MiB
```

```bash
# T4 pair (2 replicas of the same Deployment)
for p in $(kubectl get pods -l app=vllm-t4-qwen25-1-5b -o name); do
  echo "== $p =="
    kubectl exec ${p#pod/} -- nvidia-smi --query-gpu=uuid --format=csv,noheader
    kubectl exec ${p#pod/} -- nvidia-smi --query-gpu=name,memory.total,memory.used --format=csv,noheader
  echo
done
```

**Erwartung:**

- Beide Replikas dieselbe **T4-GPU-UUID** → **Co-Location auf derselben T4**.
- `memory.total = 7500 MiB` (`nvidia.com/gpumem: "7500"`), `memory.used` darunter.

Beispielausgabe:

```text
== pod/vllm-t4-qwen25-1-5b-55f98dbcf4-mgw8d ==
GPU-f8e75627-86ed-f202-cf2b-6363fb18d516
Tesla T4, 7500 MiB, 5111 MiB

== pod/vllm-t4-qwen25-1-5b-55f98dbcf4-rn5m4 ==
GPU-f8e75627-86ed-f202-cf2b-6363fb18d516
Tesla T4, 7500 MiB, 5045 MiB
```

---

## Kurze Inferenz-Checks

Services lokal port-forwarden und kleine Requests senden.

### T4 / Qwen2.5‑1.5B

```bash
kubectl port-forward svc/vllm-t4-qwen25-1-5b 8001:8000
```

```bash
curl -s http://127.0.0.1:8001/v1/chat/completions \
  -H 'Content-Type: application/json' \
  --data-binary @- <<'JSON' | jq -r '.choices[0].message.content'
{
  "model": "Qwen/Qwen2.5-1.5B-Instruct",
  "temperature": 0.2,
  "messages": [
    {
      "role": "user",
      "content": "Summarize this email in 2 bullets and draft a one-sentence reply:\n\nSubject: Renewal quote & SSO\n\nHi team, we want a renewal quote, prefer monthly billing, and we need SSO by the end of the month. Can you confirm timeline?\n\n— Alex"
    }
  ]
}
JSON
```

Beispielausgabe:

```text
Summary:
- Request for renewal quote with preference for monthly billing.
- Need Single Sign-On (SSO) by the end of the month.

Reply:
Thank you, Alex. I will ensure that both the renewal quote and SSO request are addressed promptly. We aim to have everything ready before the end of the month.
```

### A10G / Mistral‑7B‑AWQ

```bash
kubectl port-forward svc/vllm-a10g-mistral7b-awq 8002:8000
curl -s http://127.0.0.1:8002/v1/chat/completions \
  -H 'Content-Type: application/json' \
  --data-binary @- <<'JSON' | jq -r '.choices[0].message.content'
{
  "model": "solidrust/Mistral-7B-Instruct-v0.3-AWQ",
  "temperature": 0.3,
  "messages": [
    {
      "role": "user",
      "content": "Write a 3-sentence weekly update about improving GPU sharing on EKS with memory capping. Audience: non-technical executives."
    }
  ]
}
JSON
```

Beispielausgabe:

```text
In our ongoing efforts to optimize cloud resources, we're pleased to announce significant progress in enhancing GPU sharing on Amazon Elastic Kubernetes Service (EKS). By implementing memory capping, we're ensuring that each GPU-enabled pod on EKS is allocated a defined amount of memory, preventing overuse and improving overall system efficiency. This update will lead to reduced costs and improved performance for our GPU-intensive applications, ultimately boosting our competitive edge in the market.
```

### A10G / Qwen2.5‑7B‑AWQ

```bash
kubectl port-forward svc/vllm-a10g-qwen25-7b-awq 8003:8000
```

```bash
curl -s http://127.0.0.1:8012/v1/chat/completions \
  -H 'Content-Type: application/json' \
  --data-binary @- <<'JSON' | jq -r '.choices[0].message.content'
{
  "model": "Qwen/Qwen2.5-7B-Instruct-AWQ",
  "temperature": 0.2,
  "messages": [
    {
      "role": "user",
      "content": "You are a customer support assistant for an e-commerce store.\n\nTask:\n1) Read the ticket.\n2) Return ONLY valid JSON with fields: intent, sentiment, order_id, item, eligibility, next_steps, customer_reply.\n3) Keep the reply friendly, concise, and action-oriented.\n\nTicket:\n\"Order #A1234 — Hi, I bought running shoes 26 days ago. They’re too small. Can I exchange for size 10? I need them before next weekend. Happy to pay the price difference if needed. — Jamie\""
    }
  ]
}
JSON
```

Beispielausgabe:

```json
{
  "intent": "Request for exchange",
  "sentiment": "Neutral",
  "order_id": "A1234",
  "item": "Running shoes",
  "eligibility": "Eligible for exchange within 30 days",
  "next_steps": "We can exchange your shoes for size 10. Please ship back the current pair and we'll send the new ones.",
  "customer_reply": "Thank you! Can you please confirm the shipping details?"
}
```

## Aufräumen

```bash
cd infra/aws
terraform destroy -auto-approve
```

## Demnächst (Mini-Serie)

- **Tieferes Scheduling: GPU & Knoten** — binpack/spread, Anti-Affinity, **NUMA-aware** und **NVLink-aware** Placement, UUID-Pinning.
- **Monitoring auf Container-Ebene:** einfache, reproduzierbare Checks für Zuweisung und Nutzung; teilbare Dashboards.
- **Under the hood:** HAMi-Scheduling-Flow & HAMi-core Speicher-/Rechen-Capping (kompakter Deep Dive).
- **DRA:** Community-Feature in aktiver Entwicklung; **Fortschritt & Plan**.
- **Ökosystem-Demos:** Kubeflow, vLLM Production Stack, Volcano, Xinference, JupyterHub (**vLLM Production Stack, Volcano** und **Xinference** haben native Integrationen).

---

HAMi (Heterogeneous AI Computing Virtualization Middleware) ist eine „One-Stop“-Architektur zur Verwaltung heterogener KI-Compute-Geräte in Kubernetes — mit Sharing und task-level Ressourcen-Isolation. HAMi verbessert die Auslastung heterogener Compute-Ressourcen und bietet ein einheitliches Reuse-Interface. CNCF-Sandbox-Projekt, im CNCF-CNAI-Technology-Landscape verzeichnet.

![HAMi heterogeneous computing support architecture diagram](/images/blog/PREP-EDU-HAMi/p5.png)

Dynamia baut auf CNCF HAMi als Kern und liefert flexible, zuverlässige, bedarfs- und elastische GPU-Virtualisierung, heterogenes Scheduling und einheitliches Management — plug-in, leichtgewichtig, nicht-intrusiv in Public, Private und Hybrid Cloud. Unterstützt u. a. NVIDIA, Ascend, Muxi, Cambricon, Hygon, Moore Threads und Biren.

> Website: [https://dynamia.ai](https://dynamia.ai)
> Email: [info@dynamia.ai](mailto:info@dynamia.ai)
