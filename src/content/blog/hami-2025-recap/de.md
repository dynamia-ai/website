---
title: 'HAMi Jahresrückblick 2025 | Vom GPU-Scheduler zur Säule der cloud-nativen KI-Infrastruktur'
coverTitle: 'HAMi Jahresrückblick 2025 | Vom GPU-Scheduler zur KI-Infrastruktur-Säule'
date: '2026-02-12'
excerpt: >-
  Rückblick: HAMi wuchs von einer GPU-Virtualisierungslösung zur einheitlichen
  Plattform mit Unterstützung für mehr als 11 KI-Beschleuniger-Hersteller.
author: Dynamia AI Team
tags:
  - HAMi
  - GPU-Sharing
  - vGPU
  - Kubernetes
  - Jahresrückblick
  - CNCF
category: Year in Review
coverImage: /images/blog/hami-2025-recap/hami-2025.png
language: de
slug: hami-2025-recap
linktitle: HAMi-Rückblick 2025
---

![HAMi 2025 — vom GPU-Scheduler zur cloud-nativen KI-Infrastruktur](/images/blog/hami-2025-recap/hami-2025.png)

> Rückblick: HAMi entwickelte sich von einer GPU-Virtualisierungslösung zur einheitlichen Plattform für mehrere KI-Beschleuniger-Hersteller.

## Ein Jahr Wachstum: von CNCF Sandbox zu Produktionsvalidierung

Der Einzug in die [CNCF Sandbox](https://www.cncf.io/projects/hami/) im August 2024 war Community-Anerkennung — 2025 bewies HAMi den Wert mit greifbaren Ergebnissen.

2025 wuchs HAMi über einen GPU-Virtualisierungs-Scheduler hinaus zur **Middleware für KI-Compute-Virtualisierung** — einheitliches Management und Scheduling für NVIDIA und weitere Beschleuniger.

Entscheidend: großflächige Produktionsvalidierung — Beike, DaoCloud, SF Technology, Prep EDU und andere bauten stabile KI-Plattformen auf HAMi, Millionen täglicher Requests, hunderte Enterprise-Nutzer.

Zahlen 2025: 97 Contributors, 433 Commits, Releases **v2.5.0** bis **v2.8.0**. In der zweiten Jahreshälfte stieg die Aktivität — Juli, November, Dezember und Januar 2026: 45, 44, 54, 56 Commits. Getrieben durch Versionen und wachsende Contributors.

## Technische Evolution: von einer GPU zur einheitlichen Plattform

2025s größter Sprung: von NVIDIA-only zu einheitlichem Multi-Vendor-Management — breitere Anwendbarkeit und ein praktikabler Pfad zu souveräner KI-Infrastruktur.

Multi-Vendor-Features, topologiebewusstes Scheduling, Ressourcen-Wiederverwendung, Inferenz-Isolation auf App-Ebene, mehrere QoS-Modi, heterogene Metriken in der WebUI.

Die [Device-Liste](https://project-hami.io/docs/userguide/Device-supported) dokumentiert NVIDIA, AMD, AWS Neuron u. a. — breiteste Beschleuniger-Abdeckung, weniger Vendor Lock-in.

### Produktionsreife Zuverlässigkeit

Leader-Election-HA, Scheduler Leader-Follower, automatisches Failover. Webhook-Quota-Checks gegen Überbuchung. `io.LimitReader` in Scheduler-Routes gegen DoS. Scheduling-Reason-Awareness mit Standard-Fehlercodes (NodeInsufficientDevice, CardTypeMismatch, …) und zweistufigem Logging. CDI-Modus mit `deviceListStrategy` (`envvar`, `cdi-annotations`) für portable Device-Verwaltung.

### Monitoring und Observability

ServiceMonitor für Scheduler und Device-Plugin; Prometheus-Integration. Device-Type-Labels in Metriken; `hami_build_info`. Cleanup bei Node-Löschung; Optimierung von `Device_memory_desc_of_container` gegen Cardinality-Explosion.

### Performance und Developer Experience

Node-Locks feinkörnig statt global; Null-Pointer-Checks. DRA-Optionen in Helm Charts. Mock Device Plugin für `gpumem`/`gpucores` auf Node capacity/allocatable. Zertifikat-Watch und Hot Reload. staticcheck in CI/CD.

### Ökosystem-Projekte

HAMi wurde 2025 zum vollständigen Ökosystem mit Begleitprojekten für durchgängige Virtualisierung.

**HAMi-DRA** (Dynamic Resource Allocation): Kubernetes-native GPU-DRA ab v1.34+; 2025 weiterentwickelt, NVIDIA-Unterstützung, parametergetriebene Allokation, flexibleres GPU-Management.

**volcano-vgpu-device-plugin**: HAMi-vGPU in Volcano für Training, Big Data und Batch.

**ascend-device-plugin**: offizielle Volcano-Integration 2025 (Volcano v1.14.0).

**HAMi-WebUI**: visuelles Management — Auslastung, Pod-Status, Allokationsrichtlinien.

**mock-device-plugin**: `gpumem`/`gpucores` auf Node capacity/allocatable; Dev/Test-Simulation mit MemoryFactor.

Gemeinsam: End-to-End-Lösungen für cloud-native KI-Infrastruktur.

### Upstream-Ökosystem

2025 tiefe Integration in Cloud-Native-KI-Open Source — von Virtualisierung zur vollständigen Beschleuniger-Scheduling-Plattform.

**Kubernetes/DRA**: Helm-Optionen für DRA, K8s v1.34+.

**Scheduler & Inferenz**:

* **Volcano**: ascend-device-plugin in [Volcano v1.14.0](https://github.com/volcano-sh/volcano/releases/tag/v1.14.0)
* **Kueue**: Anpassung für Batch-Scheduling
* **Xinference**: Helm-native Unterstützung, `gpucores`/`gpumem-percentage`, QoS-Modi
* **vLLM**: Production Stack, Kompatibilität und Isolation (PR u. a. Andrés Doncel, Empathy.co)
* **Koordinator**: offizielle GPU-Sharing-Lösung, Ende-zu-Ende Scheduling–Runtime–Monitoring

**Observability**: Prometheus/Grafana, ServiceMonitor, `hami_build_info`

HAMi ist zentrale Scheduling-Komponente neben Kubernetes, Volcano, Kueue, Koordinator.

## Community: offene Governance, vielfältige Beiträge

Aktives Tempo und offene Zusammenarbeit 2025.

[@archlitchi](https://github.com/archlitchi) führte mit 95 Commits (Releases, Helm, Kernfeatures). [@Shouren](https://github.com/Shouren) (26) und [@FouoF](https://github.com/FouoF) (21) — Scheduling und Device-Management.

Open Governance: Start Dynamia AI + NVIDIA; später u. a. 4Paradigm — Multi-Core-Governance.

Kanäle: [GitHub](https://github.com/Project-HAMi/HAMi), [Slack](https://cloud-native.slack.com/archives/C07T10BU4R2), [Discord](https://discord.gg/Amhy7XmbNq), [Website](http://project-hami.io/).

Meetups Shanghai und Peking Ende 2025 — „Efficiency over Raw Compute Power“.

Rollen-Updates:

* @Shouren → HAMi Maintainer (Scheduler, Device, Releases, HAMi-DRA)
* @FouoF → Approver (Stabilität, DRA, Tests, Charts)
* [@DSFans2014](https://github.com/DSFans2014) → Reviewer (Ascend)
* [@Shenhan11](https://github.com/shenhan11) → Web-UI-Reviewer
* [@windsonsea](https://github.com/windsonsea) → Website-Approver
* [@chaunceyjiang](https://github.com/chaunceyjiang) → Core-Reviewer

Regelmäßige Releases v2.5–v2.8.0, produktionsreif getestet.

## Produktionsvalidierung: CNCF Case Studies

* [Beike](https://www.cncf.io/case-studies/ke-holdings-inc/): Auslastung 13 % → 37 % (~3×), 10.000+ Pods parallel
* [DaoCloud](https://www.cncf.io/case-studies/daocloud/): 10.000+ GPUs, 10+ Rechenzentren, >80 % Auslastung, −20–30 % Kosten
* [SF Technology](https://www.cncf.io/case-studies/sf-technology/): EffectiveGPU, 57 % Ressourceneinsparung
* [Prep EDU](https://www.cncf.io/case-studies/prep-edu/): 90 % GPU-Infrastruktur, weniger Memory-Konflikte

## Lehren und Ausblick

Erfolgsfaktoren 2025:

* Produktions-HA (Leader Election, Quotas, Monitoring-Cleanup) — Beike 10.000+ Pods
* Observability (ServiceMonitor, Device-Labels, Versionsmetriken)
* Offenes Ökosystem, 11+ Beschleuniger, kein Lock-in
* Community: PRs, Reviews, [Shanghai](https://project-hami.io/blog/hami-meetup-shanghai-2025)/[Peking](https://project-hami.io/blog/hami-meetup-beijing-2025) Meetups

Herausforderungen: Doku/Beispiele, E2E/Hardware-Tests, Issue-/PR-Reaktionszeiten.

Strategie 2026: Kern-Scheduling (Preemption, PodGroup), Multi-Vendor (AMD Mi300X, Cambricon, …), DRA, flexibles Slicing/MIG, Volcano/Kueue/CDI/Multi-Cloud, Observability (Grafana, Tracing).

Willkommen neue Contributors — Doku, Beispiele, Bugs, Support.

Dank an alle 2025–2026, CNCF, Kubernetes, Volcano.

## Auf dem Weg zu CNCF Incubating

TOC-Diskussion: 👉 <https://github.com/cncf/toc/issues/1775>

Sandbox → Incubating = Ökosystem-Reife, Governance, Community, Produktionsnachweise.

## 2025: globales Sharing und Sichtbarkeit

### Internationale Konferenzen

HAMi auf globalen Cloud-Native- und KI-Infrastruktur-Events 2025.

* **KubeCon Europe 2025 (London)**

  * [Unlocking How To Efficiently, Flexibly, Manage and Schedule Seven AI Chips in Kubernetes](https://kccnceu2025.sched.com/event/1txAf/unlocking-how-to-efficiently-flexibly-manage-and-schedule-seven-ai-chips-in-kubernetes-xiao-zhang-daocloud-mengxuan-li-the-4th-paradigm-ltd)
    Sieben KI-Beschleuniger in Kubernetes — einheitliches Scheduling, Virtualisierung, topologiebewusstes Management.

* **KubeCon China 2025 (Hong Kong)**

  * [Smart GPU Management: Dynamic Pooling, Sharing, and Scheduling for AI Workloads](https://kccncchn2025.sched.com/event/1x5iF/smart-gpu-management-dynamic-pooling-sharing-and-scheduling-for-ai-workloads-in-kubernetes-wei-chen-china-unicom-cloud-data-mengxuan-li-dynamia)

  * [Project Lightning Talk: K8s issue #52757: Sharing GPUs Among Multiple Containers](https://kccncchn2025.sched.com/event/1xjzB/project-lightning-talk-k8s-issue-#52757-sharing-gpus-among-multiple-containers-xiao-zhang-maintainer)
    HAMi + Volcano, DRA und weitere Richtungen.

* **OSIM AI Paris 2025**
  HAMi unter [OSIM](https://mp.weixin.qq.com/s/7Jzplm7ur325mNqIYk3aLQ) AI Spotlight.

* **AI\_dev (Linux Foundation)**
  GPU-Slicing und softwaredefinierte Isolation — [YouTube](https://youtu.be/pjHA0JfPNfw?si=djB-R71tswDn9JAq\&t=875).

* **CNCF Cloud Native Hanoi Meetup**
  Vietnam-Telecom-Praxis — [Event](https://community.cncf.io/events/details/cncf-cloud-native-hanoi-presents-may-meetup-gpu-and-ebpf-on-kubernetes/), [YouTube](https://youtu.be/UtPv8P7v0YU?si=UH1uwe07IV4bT5kL).

* **vCluster Technical Workshop**
  Feinkörnige Governance per CUDA-API-Interception — [YouTube](https://youtu.be/eBbjSfxwL30?si=PcPBonbQJfN7maeh\&t=1811).

### Einfluss im heimischen Ökosystem

HAMi 2025 tief in KI- und Open-Source-Community:

* [COSCon'25 China Open-Source Annual Conference](https://mp.weixin.qq.com/s/rU66wV7JB8w5hnUl5zC0xQ)

* [GDPS Global Developer Pioneer Conference](https://mp.weixin.qq.com/s/--AjMUpPxnO3XlojlC_I-w)

* [KCD Hangzhou Station x OpenInfra Days China](https://mp.weixin.qq.com/s/9mi57Ue_uiRMDP4mx8kHkA)

* [vLLM Inference Optimization Meetup Shanghai Station](https://mp.weixin.qq.com/s/fIoDw95bMtFug9JZi_MS6Q)

* [Ant Group Open-Source Technical Salon](https://mp.weixin.qq.com/s/GBoB_VEgmw6_bGX4WZS_Gg)

* diverse Community- und Enterprise-Events

Themen: GPU-Virtualisierung, vLLM, Chip-Adaption, Serverless-Inferenz — Verbreitung von Governance-Konzepten für Beschleuniger.

### Enterprise-Deployment und Whitepaper

SF Technology: „[EffectiveGPU Technical White Paper](https://mp.weixin.qq.com/s/zZKJfJJOzBhpcq1FMttqsA)“ — Architektur mit HAMi-Virtualisierung und Scheduling.

HAMi ist Schlüsselkomponente in Produktion, nicht nur GitHub-Projekt.

2025 enge Zusammenarbeit mit Chip- und Dateninfrastruktur-Partnern — standardisierter Zugang und Scheduling.

Willkommen weitere Chip- und Plattform-Partner unter offenen Standards.

## 2026: KubeCon Europe · Project Pavilion

Teilnahme bestätigt: [**KubeCon + CloudNativeCon Europe 2026**](https://events.linuxfoundation.org/kubecon-cloudnativecon-europe/).

Project Pavilion · Stand P-13B

📅 24. März · 15:10–19:00

📅 26. März · 12:30–14:00

Vor Ort u. a.:

* GPU-Virtualisierung und dynamisches Slicing

* DRA und Kubernetes

Austausch mit der globalen Community willkommen.

![Welcome to KubeCon EU 2026 HAMi Booth](/images/blog/hami-2025-recap/kubecon-eu-2026.png)

**Ressourcen**:

* HAMi GitHub: <https://github.com/Project-HAMi/HAMi>

* Dokumentation: <http://project-hami.io/docs/>

* CNCF-Projektseite: <https://www.cncf.io/projects/hami/>

* Slack: <https://cloud-native.slack.com/archives/C07T10BU4R2>

* Discord: <https://discord.gg/Amhy7XmbNq>

**Autoren**: HAMi-Community · **Veröffentlichung**: 12. Februar 2026

*Jahreszusammenfassung der HAMi-Community, Fortschritt 1. Januar 2025 bis 12. Februar 2026. Daten aus Git, GitHub Issues/PR, CNCF Case Studies und öffentlichen Quellen.*
