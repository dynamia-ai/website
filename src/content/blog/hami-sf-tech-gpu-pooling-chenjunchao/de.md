---
title: "GPU so zugänglich wie Versorgungsleistungen: HAMi-gestütztes GPU-Pooling bei SF Technology"
date: '2026-04-30'
excerpt: >-
  Chen Junchao von SF Technology beschreibt den vollständigen Weg von Bare Metal
  zur Multi-Cloud-Hybridarchitektur und geht auf HAMi-basiertes GPU-Pooling,
  Memory-Oversubscription und gemischte Bereitstellung in Produktion ein.
author: Dynamia
tags:
  - HAMi
  - Meetup
  - SF Technology
  - GPU-Virtualisierung
  - GPU-Pooling
  - Volcano
  - EffectiveGPU
category: Community & Events
coverImage: /images/blog/hami-sf-tech-gpu-pooling-chenjunchao/speaker-portrait.jpg
linktitle: "HAMi-gestütztes GPU-Pooling bei SF Technology"
---

„Maximize Efficiency, Not Compute“ – das HAMi Community Meetup Shenzhen wurde von der HAMi-Community ausgerichtet und von Dynamia AI organisiert und endete am 25. April 2026 erfolgreich. Dies ist der dritte Artikel in der Rückblickserie zum HAMi Shenzhen Meetup. Chen Junchao von SF Technology beschreibt den vollständigen Weg von Bare Metal zur Multi-Cloud-Hybridarchitektur und analysiert HAMi-basiertes GPU-Pooling, Memory-Oversubscription und gemischtes Scheduling in Produktion.

Dank an SF Technology für Co-Hosting und Bereitstellung des Veranstaltungsorts.

**Speaker:** Chen Junchao (Senior Backend Engineer, SF Technology)

![Chen Junchao beim Vortrag](/images/blog/hami-sf-tech-gpu-pooling-chenjunchao/speaker-portrait.jpg)

## Highlights

- Multi-Cloud-Hybridarchitektur: 5 Private Clouds + 4 Public Clouds, Scheduler vollständig auf Volcano umgestellt
- GPU-Modell-Level-Ressourcenmeldung, kein Bedarf mehr für Labels und Taints im Betrieb
- Sandbox und hochpriorisierte Inferenzaufgaben teilen physische GPUs, Ressourcenwiederverwendung durch versetztes Scheduling
- Memory-Oversubscription: bis zu 200 % Memory-Overcommit, null Intrusion
- Produktions- und Test-Cluster sparten bis zu 57 % GPU

## Video & Folien

- **Bilibili:** [HAMi Multi-Cloud Practice at SF Technology - Chen Junchao](https://www.bilibili.com/video/BV13RozBMEjm/)
- **Folien:** [hami-multi-cloud-practice-sf-tech-chenjunchao.pdf](https://github.com/Project-HAMi/community/blob/main/hami-meetup/03-shenzhen-20260425/hami-multi-cloud-practice-sf-tech-chenjunchao.pdf)

## I. AI-Plattform-Evolution: von Kubeflow zu Multi-Cloud-Hybrid

Der Evolutionspfad der SF-Technology-AI-Plattform spiegelt viele Unternehmen wider, die KI-Infrastruktur aufbauen.

### Anfang: Kubeflow-Ära

Die AI-Plattform startete auf Kubeflow mit drei Kernmodulen:

- **Sandbox:** Tägliche Experimentierumgebung für Entwickler
- **Workflow:** Pipelines für Modelltraining und Datenverarbeitung
- **Model Serving:** Online-Inferenzdienste

![Evolutionsreise der GPU-Rechenleistung bei SF Technology](/images/blog/hami-sf-tech-gpu-pooling-chenjunchao/slide_02-en.png)

### Evolution: vollständiger Scheduler-Tausch

Mit wachsendem Geschäft wurde der Scheduler **vollständig vom Standard-Kubernetes-Scheduler auf Volcano** umgestellt, um großskalige Pod-Scheduling-Anforderungen zu bewältigen. Diese Entscheidung legte die Grundlage für späteres GPU-Pooling.

### Heute: Multi-Cloud-Hybridarchitektur

Die Plattform verwaltet **5 Private-Cloud-K8s-Cluster** und ist mit vier Public-Cloud-Anbietern integriert – Volcengine, Alibaba Cloud, Baidu Cloud und Huawei Cloud – und nutzt Public-Cloud-Ressourcen zur Schließung von Compute-Lücken in der Private Cloud.

**Warum Multi-Cloud?** On-Prem-Rechenzentren setzen vor allem V100, A100 und einige H20-GPUs ein, Beschaffung ist teuer mit langen Lieferzeiten. Public-Cloud-Ressourcen werden meist monats- oder jahresweise gemietet, um Rechenengpässe und flexible Skalierung abzufedern.

![Multi-Cloud-Hybridarchitektur – 5 Private-Cluster verbunden mit 4 Public Clouds](/images/blog/hami-sf-tech-gpu-pooling-chenjunchao/slide_04-en.png)

## II. GPU-Ressourcenmanagement: tiefe Device-Plugin-Anpassung

### Von generisch zu feinkörnig: GPU-Modell-Level-Ressourcenmeldung

Der native Device Plugin meldet alle GPUs einheitlich als `nvidia.com/gpu`, Modelle sind nicht unterscheidbar. Das SF-Technology-Team passte die Device-Plugin-Konfiguration an:

```plaintext
gpu-a100, gpu-v100, gpu-h20 ...
```

So ist **präzises GPU-Modell-Matching** auf der Scheduling-Ebene möglich.

![GPU-Ressourcenpool-Abstraktion + Volcano-Queue-Quota-Management](/images/blog/hami-sf-tech-gpu-pooling-chenjunchao/slide_05-en.png)

### Vereinfachter Betrieb: Abschied von Labels und Taints

Das Team eliminierte die Abhängigkeit von Node-Labels und Taints, vereinfachte die Betriebskonfiguration und erreichte einheitliches Management aller GPU-Ressourcen über Volcano.

### vGPU Device Plugin Anpassung

Code-Anpassungen am Volcano-vGPU-Device-Plugin ermöglichen Meldung spezifischer GPU-Modelle (z. B. `vgpu-number-l20`) für präzises Matching auf der Scheduling-Ebene.

## III. Drei zentrale HAMi-Anwendungsfälle

### Use Case 1: GPU-Partitionierung (feinkörnige Ressourcenzuweisung)

Bei Aufgaben mit niedriger Speicher- und Compute-Auslastung ermöglicht HAMi feinkörnige GPU-Partitionierung (Speicher-/Compute-Ebene) und teilt eine physische GPU in mehrere unabhängig schedulbare Einheiten – höhere Auslastung, weniger Fragmentierung.

![HAMi für Speicherpartitionierung](/images/blog/hami-sf-tech-gpu-pooling-chenjunchao/image-en.png)

Der Kern: GPUs werden von „Ganzkarten-Exklusiv“ zu „feinkörnig zuweisbaren Ressourcen“, sodass Low-Load-Tasks dieselbe physische Karte teilen können.

### Use Case 2: GPU-Colocation (prioritätsbasierte Task-Koexistenz)

Aufbauend auf Partitionierung werden Entwicklungsaufgaben (Sandbox/Notebook) mit hochpriorisierten Inferenzaufgaben auf derselben physischen GPU colocated. Prioritäts-Scheduling und Ressourcengarantien sichern Stabilität hochpriorisierter Tasks bei höherer Gesamtauslastung.

Sandbox und Inferenz sind zeitlich natürlich versetzt – Entwickler tunen tagsüber, Inferenz skaliert mit Traffic. Scheduling-Strategien ermöglichen Ressourcenwiederverwendung und dynamisches Yield.

![HAMi für Colocation und Prioritäts-Scheduling](/images/blog/hami-sf-tech-gpu-pooling-chenjunchao/image-1-en.png)

### Use Case 3: Memory-Oversubscription

Nutzen zeitlicher Muster (z. B. Customer Service mit hoher Tageslast, nachts idle) ermöglichte **Memory-Oversubscription**, sodass verschiedene Tasks physischen GPU-Speicher teilen. Durch versetztes Scheduling nutzen mehrere Tasks denselben Speicher zu unterschiedlichen Zeiten.

![Memory-Oversubscription – geteilter physischer Speicher via versetztem Scheduling](/images/blog/hami-sf-tech-gpu-pooling-chenjunchao/image-2-en.png)

> Chen Junchao berichtete, dass die Community-Edition Memory-Oversubscription noch nicht unterstützt. SF Technology implementierte das Feature mit Hilfe zentraler Community-Contributors.

## IV. Full-Chain-Monitoring-Schleife

Das Team sammelt nicht nur Monitoring-Daten physischer Karten, sondern auch HAMi-Virtual-Card-Speicherauslastung und schreibt sie via Prometheus auf die BDP-Plattform für Auslastungsreporting – datengetriebene Ressourcenentscheidungen.

![Full-Chain-Monitoring – physische Karte + virtuelle Karte](/images/blog/hami-sf-tech-gpu-pooling-chenjunchao/image-3-en.png)

## V. Ausgewähltes Q&A der Veranstaltung

![Q&A-Session](/images/blog/hami-sf-tech-gpu-pooling-chenjunchao/qa-session.jpg)

### F1: Wie beenden sich niedrigpriorisierte Tasks elegant?

> Zwei Strategien. Erstens **periodisches Sandbox-Auslastungs-Monitoring** – bei anhaltender Idle-Zeit (z. B. 6–12 Stunden) automatisch Image committen und beenden. Zweitens **direkte Preemption durch hochpriorisierte Tasks** – niedrigpriorisierte Tasks werden blockiert (unavailable), derzeit kein Degradationsplan.

### F2: Wie arbeiten lokale Cluster und Public Cloud zusammen?

> On-Prem-Rechenzentren führen vor allem persistente Workloads. Rechenlücken werden über monats-/jahresweise Public-Cloud-Abonnements geschlossen.

## VI. Zusammenfassung

Chen Junchaos Vortrag lieferte ein vollständiges Bild der AI-Plattform-Evolution von Kubeflow zur Multi-Cloud-Hybridarchitektur und HAMi-basiertem GPU-Pooling. Kernpunkte:

- **Architektur:** Von einer Kubeflow-Plattform zu Multi-Cloud-Hybrid mit 5 Private Clusters + 4 Public Clouds, Scheduler vollständig auf Volcano, Scheduling-Grundlage für GPU-Pooling.
- **Ressourcenmanagement:** GPU-Modell-Level-Meldung durch tiefe Device-Plugin-Anpassung, kein Label/Taint-Betriebsaufwand, präzises Scheduling virtueller Karten via vGPU-Device-Plugin.
- **Drei HAMi-Use-Cases:** Partitionierung und Colocation (Development + Inferenz teilen physische Karten), Memory-Oversubscription (versetztes Scheduling), Ressourcenpool-Abstraktion mit einheitlichem Scheduling (Volcano-Queue-Isolation + Gateway-Traffic-Verteilung).
- **Monitoring:** Full-Chain-Schleife für physische + HAMi-Virtual-Cards, Prometheus → BDP für datengetriebene Entscheidungen.

SF-Technology-Praxis zeigt den Produktionswert von HAMi im Enterprise-GPU-Pooling – von Scheduler-Anpassung und Device-Plugin-Customization bis Business-Szenario-Anpassung, ein wiederverwendbarer technischer Pfad.

## VII. Weiterlesen

Chen Junchaos Team veröffentlichte zuvor das **EffectiveGPU Technical White Paper** mit SF-Technologys selbst entwickelter GPU-Pooling-Technologie – eng verwandt mit dem Meetup-Vortrag:

- **EffectiveGPU White Paper: How to Better Improve Compute Efficiency in the LLM Era?**
  Architektur und Kerntechnologien von EffectiveGPU (egpu), inklusive heterogenem einheitlichem Device-Management, Device-Sharing und Ressourcenisolation (Performance-Overhead unter 5 %), elastischem Oversubscription (bis 200 % Memory) und Prioritäts-QoS.

  **Mehr lesen:** [EffectiveGPU White Paper (Chinese)](https://mp.weixin.qq.com/s/zZKJfJJOzBhpcq1FMttqsA) *(nur Chinesisch)*

- **CNCF Case Study: SF Technology — Effective GPU**
  Offizielle CNCF-Case-Study auf Englisch. Beschreibt, wie EffectiveGPU auf dem CNCF-Sandbox-Projekt HAMi GPU-Pooling aufbaut: Device-Virtualisierung, harte Ressourcenisolation, Prioritäts-Preemption, Cross-Node-kooperatives Scheduling, Memory-Oversubscription. Kennzahlen: bis 57 % GPU-Einsparung in Produktion und Test, bis 100 % Auslastungssteigerung durch Virtualisierung, null Intrusion in NVIDIA-Treiber, Linux-Kernel, Task-Images und Quellcode.