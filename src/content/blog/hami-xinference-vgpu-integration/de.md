---
title: >-
  Xinference × HAMi | Native GPU-Sharing-Unterstützung für kosteneffiziente
  AI-Modelldienste
coverTitle: Xinference × HAMi | Kosteneffizientes vGPU-Sharing
date: '2025-11-06'
excerpt: >-
  Xinference unterstützt HAMi vGPU nativ über den Helm Chart — sicheres GPU-Sharing,
  feingranulare Quotas und einheitliche Governance für Multi-Modell-Inferenzplattformen.
  Dieser Artikel zeigt Ein-Klick-Aktivierung von HAMi vGPU und Best Practices zur
  Kostensenkung in Produktion.
author: Dynamia AI Team
tags:
  - HAMi
  - Xinference
  - vGPU
  - GPU Sharing
  - AI Inference
  - Multi-Model
  - Kubernetes
  - Cost Optimization
category: Integration & Ecosystem
coverImage: /images/blog/hami-xinference-vgpu/cover-en.png
linktitle: HAMi × Xinference Integration
---

## Highlights

* **Xinference** ist Xorbits’ Open-Source-Multi-Modell-Inferenzplattform (LLM/Embedding/Image/Audio/TTS/Rerank u. a.) mit **Supervisor/Worker**-Architektur und **OpenAI-kompatiblen APIs**.
* In Enterprise-Deployments fehlt bei Xinference **eigene Compute-Isolation** — „kleine Modelle monopolisieren ganze Karten“ und Multi-Tenant-Quota/Observability-Lücken.
* **Helm PR #6** bringt natives **HAMi-vGPU**-Support: mit Schaltern lassen sich `nvidia.com/gpucores` und `nvidia.com/gpumem-percentage` an **Supervisor/Worker** durchreichen — sicheres Sharing, höhere Auslastung, einheitliche Quotas und Monitoring.

![Xinference- und HAMi-Integrationsarchitektur](/images/blog/hami-xinference-vgpu/architecture.png)

## Was ist Xinference

* **Multi-Modell**: Chat/Generierung, Embedding, Vision, Bilder, Audio (ASR/TTS/Voice), Rerank; Engines wie vLLM, Transformers, llama.cpp, SGLang, MLX.
* **OpenAI-kompatible API** für nahtlosen Wechsel zu lokalen oder selbst gehosteten Clustern.
* **Supervisor/Worker**: Supervisor koordiniert, Worker rechnen mit CPU/GPU; mehrere Worker an einen Supervisor.
* **Performance**: Continuous Batching, **Xavier** für geteilten KV-Cache über vLLM-Instanzen.

## Warum HAMi: von „läuft“ zu „teilbar, messbar, steuerbar“

Zwei häufige Probleme in Produktion:

1. **Leichte Modelle belegen ganze Karten** → Verschwendung;
2. **Fehlende Multi-Tenant-Governance** → schwierige feine Quotas pro Team/Task.

**HAMi vGPU** adressiert das:

* **Prozent/Kapazität** für **GPU-Cores und Speicher** pro Task (`nvidia.com/gpucores`, `nvidia.com/gpumem-percentage`).
* Scheduling, Quota und Observability laufen über Kubernetes.

## Ein-Klick: natives HAMi vGPU im Helm Chart

PR #6 im offiziellen Chart. Beispiel: vGPU nur für Worker (üblich):

```yaml
# values.yaml (Auszug)
xinferenceWorker:
  worker:
    vgpu:
      enabled: true
    resources:
      limits:
        nvidia.com/gpu: 1
        nvidia.com/gpucores: 20            # 20 % GPU-Cores
        nvidia.com/gpumem-percentage: 10   # 10 % Speicher
      requests:
        cpu: "2"
        memory: "8Gi"

xinferenceSupervisor:
  supervisor:
    vgpu:
      enabled: false                       # meist ohne GPU
```

Installation:

```bash
helm repo add xinference https://xorbitsai.github.io/xinference-helm-charts
helm repo update

helm install xinference xinference/xinference -n xinference -f values.yaml
```

## Verifiziert: 5× Qwen3-0.6B auf einer L4

Im PR: getestetes Beispiel auf **NVIDIA L4 (24 GB)** — Speicher in mehrere Anteile, ~**2 GB** pro Worker, **5 Qwen3-0.6B** parallel.

![Multi-Modell-Demo](/images/blog/hami-xinference-vgpu/multi-model-demo.png)

> Besonders für Embedding/Rerank/kleine Audio/leichte Agent-Tool-Modelle — hohe Parallelität, geringer Bedarf pro Modell.

## Monitoring und Multi-Tenant-Governance

* **Xinference-Metriken**: Supervisor/Worker-Dashboards für Modellanzahl, Durchsatz, Latenz.
* **HAMi-Observability/Quotas**: Kubernetes-Ressourcen und HAMi-vGPU-Metriken mit Namespace-Quota — hierarchische „Projekt-Task“-Governance.

## Fazit und Dank

Xinferences „Multi-Modell-Bedienbarkeit + OpenAI-Kompatibilität“ plus HAMis „feine vGPU-Quotas + einheitliche Governance“ — GPUs von **exklusiv zu geteilt**, Fähigkeiten von **lauffähig zu verwaltbar**, ohne Business-Code-Änderung.

**PR**: [xorbitsai/xinference-helm-charts #6](https://github.com/xorbitsai/xinference-helm-charts/pull/6)

Dank an **@calvin0327** für den Beitrag!

---

## Über Xinference

Xinference ist eine Enterprise-Inferenzplattform von Hangzhou Future Speed Technology Co., Ltd. — effizienter, stabiler, sicherer One-Stop-Deployment. Starke Unterstützung für NVIDIA, Huawei Ascend, Hygon DCU, Cambricon; Multi-Engine (vLLM, SGLang u. a.); auf Xoscar verteilte Inferenz, Load Balancing und automatische Fehlerbehebung für Enterprise-Hochverfügbarkeit.