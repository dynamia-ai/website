---
title: "Jenseits exklusiver GPU-Nutzung: Training und Inferenz vereinheitlicht mit HAMi — Boardwares GPU-Virtualisierung in der Praxis"
date: '2026-05-21'
excerpt: >-
  GPU-Management in Forschungslaboren ist seit jeher schwierig. Boardware entwickelte sich über drei Jahre von VM-exklusiv zu Kubernetes + HAMi und erreichte auf einem 12-GPU-Cluster physische Trennung von Agent-RL-Training und Inferenz. Siebter Artikel der HAMi-Community-Meetup-Shenzhen-Reihe.
author: Ou Binkai (Boardware)
tags:
  - HAMi
  - GPU-Virtualisierung
  - Kubernetes
  - Agent RL
  - Training-Inferenz-Integration
  - Cloud Native
category: Community & Events
coverImage: /images/blog/boardware-hami-gpu-virtualization/speaker-photo.webp
linktitle: "Boardware GPU-Virtualisierung Praxis"
---

> GPU-Management in Forschungslaboren ist eine harte Aufgabe: vielfältige Modelle, geteilte Ressourcen über Teams, gemischtes Training und Inferenz, steigende Hardwarekosten. In drei Jahren ging Boardware von VM-exklusiv zu Kubernetes + HAMi und erreichte physische Isolation von Agent-RL-Training und Inferenz auf 12 GPUs.
>
> Siebter Artikel der Reihe „Efficiency Over Raw Power | HAMi Community Meetup“. Am 25. April 2026 teilte Boardware-Forscher Ou Binkai diesen Evolutionsweg.

**Kernaussagen:**

- Von VM-exklusiv zu K8s + HAMi: 70 % der Forschungs-GPUs von Idle zu effektiver Nutzung
- 12 GPUs mit physischer Trennung von Agent-RL-Training und Inferenz
- HAMi Core Fine-Grained Partitioning mit 1,2–1,3× Speicher-Overcommit
- Infiniband + RDMA: deutliche RPS-Verbesserung bei 200 parallelen Inferenz-Requests
- „Die Management-Granularität wird feiner, die Nutzungshürde niedriger“

**Referent:** Ou Binkai (Forscher, Boardware)

![Ou Binkai](/images/blog/boardware-hami-gpu-virtualization/speaker-photo.webp)

Ou Binkai hat einen Master of Science und forscht bei Boardware an LLMs und multimodalen Modellen. Er leitet das Labor für Hirn-Computer-Digital-Fusion am Guangdong Institute of Intelligent Science and Technology und ist PI mehrerer vom Macau Science and Technology Development Fund geförderter Projekte. Er verfügt über Industrie-Akademie-Erfahrung in KI, IoT und Funk, mit Publikationen und Patenten. Zertifizierungen u. a. Baidu Chief AI Architect, PaddlePaddle Technical Expert und Expert-Level bei mehreren Cloud-Anbietern.

## Video-Replay & Folien

- **Bilibili:** [Boardware x HAMi: GPU-Virtualisierung und Cluster-Management — Ou Binkai](https://www.bilibili.com/video/BV1J7o6BpEZJ/)
- **PPT:** [boardware-gpu-virtualization-oubinkai.pdf](https://github.com/Project-HAMi/community/blob/main/hami-meetup/03-shenzhen-20260425/boardware-gpu-virtualization-oubinkai.pdf)

## 1. Der Schmerz beim GPU-Management in Forschungslaboren

GPU-Nutzung in Laboren unterscheidet sich stark von Enterprise-Produktion:

- Vielfältige Modelltypen und Parametergrößen
- Mehrere Teams teilen wenige GPUs
- Training, Inferenz und Debugging parallel
- Balance zwischen Forschungseffizienz und Hardwarekosten

Boardware hat tiefe Erfahrung in Forschung und Universitäten. In Feldstudien zeigte sich: **über 70 % der Forschungs-GPUs sind idle oder unterausgelastet** — nicht weil keine Tasks laufen, sondern weil die Zuteilungsgranularität zu grob ist und Speicher verschwendet wird.

![Kernschmerzpunkte GPU-Management in Forschungslaboren](/images/blog/boardware-hami-gpu-virtualization/gpu-pain-points.webp)

## 2. Architektur-Evolution: von VMs zur Containerisierung

### Früher Ansatz: VM-exklusiv + VPC-Partitionierung

Anfangs VM-exklusiv oder VPC für GPU-Management — mit Schmerzpunkten:

- **Keine dynamische Speicheranpassung:** Feste Zuteilung nach Zuweisung
- **Begrenztes Cross-GPU-Scheduling:** Virtualisierungsschicht erschwert flexibles Multi-GPU-Scheduling
- **Fragmentierte Umgebungen:** Getrennte CPU- und GPU-Umgebungen erhöhen Ops-Aufwand

### Weiterentwicklung: Vollständig Kubernetes + HAMi

Das Team setzte auf Kubernetes für leichtes Compute und flexibles Scheduling und HAMi als GPU-Virtualisierungs- und Scheduling-Schicht. HAMi (Heterogeneous AI Computing Virtualization Middleware) ist ein CNCF-Incubating-Projekt mit feingranularer GPU-Speicherisolation und Compute-Partitionierung für sicheres Multi-Container-Sharing einer physischen GPU.

![K8s + HAMi Architektur-Evolution](/images/blog/boardware-hami-gpu-virtualization/k8s-hami-architecture.webp)

## 3. Eigene Scheduling-Plattform: One Click Deployment Platform

Für „Out-of-the-Box“-On-Premises-Bedürfnisse entwickelte Boardware die **„One Click Deployment Platform“** — eine KI-Compute-Management-Plattform für Forschung und Universitäten. Sie abstrahiert K8s und HAMi, sodass Forscher ohne Ops-Wissen schnell Training starten. Kernfähigkeiten:

- **Multi-Cluster-Management:** Einheitliche GPU-Ressourcen über mehrere K8s-Cluster
- **Multi-Region:** Cross-Region-Scheduling
- **RDMA-Optimierung:** Infiniband für effizienteres verteiltes Training
- **Vereinfachtes Deployment:** One-Click-Algorithmus-Umgebung

### Performance-Validierung: Infiniband vs. Ethernet

Unter Qwen-3-Inferenz-Szenario verglich das Team Infiniband mit Ethernet:

- **Test:** 200 parallele Nutzer
- **Ergebnis:** Mit Infiniband + RDMA **deutliche Verbesserung** von Request-Volumen und RPS gegenüber Ethernet

## 4. Agent-RL-Praxis: Physische Trennung von Training und Inferenz

Technisch tiefster Teil des Vortrags. Mit dem Agent-Paradigma wird **Reinforcement Learning (RL)** zentral für Reasoning-Fähigkeiten — mit neuen GPU-Herausforderungen.

### Kernproblem

In Agent-RL sind Training und Inferenz eng gekoppelt, aber ressourcenmäßig sehr unterschiedlich. Wie beides mit wenigen GPUs?

### HAMi-Lösung

Unter OpenRL partitionierte HAMi den 12-GPU-Cluster in:

- **Knoten A (Training):** Modelltraining
- **Knoten B (Inferenz):** Umgebungsinteraktion und Inferenz-Evaluation

**Physische Isolation** ohne gegenseitige Störung: Gradient-Updates beeinträchtigen Inferenz-Latenz nicht; Inferenz-Ergebnisse fließen in Echtzeit zurück — effiziente RL-Schleife.

### Technische Kennzahlen

- **Speicher-Overcommit 1,2–1,3×**
- Kleinskalige Validierung mit 9B-Modellen
- Feingranulare Partitionierung über HAMi Core

![Agent RL mit HAMi Deployment](/images/blog/boardware-hami-gpu-virtualization/agent-rl-hami-deployment.webp)

## 5. Multi-Szenario-Compute für Universitäten

Ein Cluster für mehrere Workload-Typen:

- **Jupyter Lab:** Interaktive Lehre und Forschung
- **ML-Anwendungen:** Training und Inferenz
- **Voice & Digital Humans:** Multimodale KI

Über HAMi Core laufen mehrere Workloads **gemischt** auf demselben Cluster — Brücke zwischen CPU- und GPU-Umgebungen, One-Stop-KI-Compute für Universitäten, bereits an mehreren Institutionen deployed.

![Multi-Szenario gemischte Workloads an Universitäten](/images/blog/boardware-hami-gpu-virtualization/multi-scenario-workload.webp)

## Fazit

Von VM-exklusiv über Kubernetes bis HAMi-basiertem GPU-Scheduling spiegelt Boardwares Weg einen universellen Trend: **Management-Granularität wird feiner, die Nutzungshürde niedriger.**

Wertvoll ist weniger ein technisches Detail als das **systematische Denken** dahinter: nicht bei „GPU an Container“ stoppen, sondern Scheduling-Plattform darüber, Infiniband-Optimierung darunter, horizontale Trennung von Agent-RL-Training und Inferenz — 12 GPUs für Training, Inferenz, Lehre und mehr, dramatisch bessere Auslastung.

Für Teams mit ähnlichen Herausforderungen: HAMi-Speicher-Overcommit 1,2–1,3× in Produktion validiert; Infiniband + RDMA lohnt sich bei großer Modell-Inferenz; Training-Inferenz-Trennung priorisieren bei Agent-RL.