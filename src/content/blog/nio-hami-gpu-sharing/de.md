---
title: 'NIO steigert GPU-Auslastung für autonomes Fahren mit HAMi'
date: '2026-04-23'
excerpt: >-
  NIO setzte eine hybride GPU-Sharing-Strategie aus HAMi, NVIDIA MIG und Time-Slicing ein
  und verbesserte die GPU-Auslastung in CI, Simulation und Inferenz deutlich – etwa 4×
  höhere Auslastung und 30 % weniger GPU-Stunden.
author: Dynamia AI Team
tags:
  - HAMi
  - GPU-Sharing
  - vGPU
  - Kubernetes
  - NIO
  - Autonomes Fahren
  - Fallstudie
category: Customer Success Story
coverImage: /images/blog/nio-hami-gpu-sharing/resource-management-chart.png
linktitle: NIO HAMi GPU-Sharing Fallstudie
---

NIO betreibt großflächige Cloud-Infrastruktur für autonomes Fahren – Modelltraining, Simulation, CI/Tests und Online-Inferenz. Das Team fokussiert GPU-Performance-Optimierung und ist in GPU- und Ressourcenplanung eingebunden.

## Herausforderung

Die Cloud-Infrastruktur trägt vielfältige Workloads: Training, Simulation, CI/Tests, Online-Inferenz. Verantwortung für GPU-Optimierung und Ressourcenplanung. Die Vielfalt führte zu anhaltenden Effizienzproblemen durch Workload-Ressourcen-Mismatch.

### Workloads mit niedriger GPU-Auslastung

#### CI- und Test-Tasks

Der Großteil der CI-Zeit entfällt auf CPU-intensive Schritte wie Kompilierung, Dateiabruf und Preprocessing. GPUs werden nur sporadisch genutzt. Bei voller GPU-Zuteilung lag die durchschnittliche Auslastung typisch bei **5–10 %**.

#### Simulations-Workloads

Pipelines verarbeiten Videostreams, Radardaten und Inferenz-Validierung. Einzelne Tasks haben geringe Compute-Anforderungen und sind nicht latenzkritisch – geeignet für parallele Ausführung auf geteilten GPUs.

#### Online-Inferenz und kleine Modelle

Viele Inferenzdienste brauchen nur **¼ oder ½ GPU**. Eine ganze Karte ist ineffizient und teuer.

- Die GPU-Clustergröße ist **begrenzt**, ein Teil der Kapazität kommt von Public-Cloud-Anbietern mit **zeitbasierter Abrechnung**.
- Niedrige Auslastung verschwendet **GPU-Stunden** und erhöht die Betriebskosten direkt.
- Ineffiziente Zuteilung verlängert Wartezeiten für Training mit hoher Nachfrage.

NIO brauchte höhere GPU-Auslastung **ohne Stabilitätsverlust** und mehrere Workload-Typen in derselben Kubernetes-Umgebung.

## Lösung

NIO nutzte eine **hybride GPU-Sharing-Strategie** und wählte je nach Workload unterschiedliche Mechanismen statt eines Einheitsansatzes.

Die folgende Abbildung zeigt die GPU-Management-Architektur nach HAMi-Integration in Kubernetes.

![Ressourcen-Management-Diagramm](/images/blog/nio-hami-gpu-sharing/resource-management-chart.png)

HAMi erweitert Kubernetes um feingranulares GPU-Sharing über Scheduler-Erweiterungen (Layer 2) und Device-Plugin-Integration (Layer 4) – flexible GPU-Zuteilung neben NVIDIA MIG und Time-Slicing.

### Evaluierte Ansätze

**NVIDIA MIG**

Starke Isolation, aber nur vordefinierte Partitionen – schwer passend für feinere Anforderungen (z. B. 1/6 oder 1/8 GPU).

**Time-Slicing**

Workloads konkurrieren frei mit geringem Overhead, aber ohne strikte Speicher- und Compute-Limits – für manche Produktions-Workloads ungeeignet.

**HAMi (CNCF-Sandbox-Projekt)**

Feingranulare Kontrolle über **GPU-Speicher und Compute** – proportionale Zuteilung nach tatsächlichem Bedarf. Etwas Overhead gegenüber voller GPU-Zuteilung.

### Produktionsstrategie

Statt Ersetzung kombinierte NIO:

- **MIG:** Algorithmenentwicklung und Umgebungen mit starker Isolation
- **HAMi:** CI sowie ausgewählte Inferenz- und Simulations-Workloads
- **Time-Slicing:** Workloads, die Ressourcenkonkurrenz tolerieren

Diese Hybridstrategie verbesserte die Auslastung bei Korrektheit und Betriebssicherheit.

## Umsetzung

- HAMi auf **ausgewählten GPU-Clustern**, nicht überall.
- Großes Training weiterhin standardmäßig volle GPUs.
- HAMi vor allem für Workloads mit Bruchteil-Zuteilung.

**Deployment-Umfang:**

- Etwa **50–70 aktive Knoten**
- Etwa **400–560 GPUs** (bei 8 GPUs pro Knoten)

### Ressourcen-Design

Für Simulation war **GPU-Speicher (VRAM)** die Hauptbeschränkung:

- Zu wenig Compute lässt sich durch Scheduling-Verzögerung abfedern.
- Speichermangel führt sofort zu OOM und ist nicht aufschiebbar.

**Feinere Partitionierung ist nicht immer besser.** Für manche Simulationen war **etwa 1/6 GPU** optimal. Kleinere Bruchteile (z. B. 1/8) erhöhten Scheduling- und Virtualisierungs-Overhead und senkten den Durchsatz.

## Wirkung

### CI: Von Verschwendung zu Wiederverwendung

**Vor HAMi:**

CI war primär CPU-gebunden; durchschnittliche GPU-Auslastung etwa **5 % (5–10 %)**.

**Mit HAMi:**

Partitionierung in **¼ oder kleiner** steigerte die effektive GPU-Auslastung in CI-Pipelines um etwa **4×** auf **30–50 %**.

### Simulation: Mehr Durchsatz, weniger GPU-Stunden

- Feingranulares Sharing reduzierte GPU-Stunden um etwa **30 %**.
- End-to-End-Simulation von **etwa 3 Tagen** auf **etwa 2 Tage**.

Mehr Systemdurchsatz bei direkter GPU-Kostensenkung.

## Erkenntnisse

**GPU-Partitionierung: nicht „je feiner, desto besser“.**

Jeder Workload hat eine optimale Partition. Über-Fragmentierung kann die Effizienz senken.

**Versions-Upgrades brauchen Performance-Validierung.**

Neue Virtualisierungskomponenten können Regressionen bringen. NIO nutzte phasenweise Upgrades und Benchmarks vor gemischten HAMi-Komponenten-Versionen.

**Betriebsänderungen müssen Produktion schützen.**

Bei Online-Inferenz folgen Device-Plugin-Upgrades einem Blue-Green-ähnlichen Prozess: Traffic zuerst migrieren, neue Pods deployen, alte Instanzen schrittweise abschalten.

**Toolchain-Kompatibilität ist kritisch.**

Bestimmte Compiler-/Bibliotheksfeatures (z. B. Pointer-Analyse) können mit GPU-Interception kollidieren – Abwägung zwischen Funktion und Stabilität nötig.

NIOs HAMi-Deployment zeigt, wie feingranulares GPU-Sharing die Infrastruktureffizienz für autonomes Fahren steigert. Durch Kombination mit Kubernetes, MIG und Time-Slicing erhöhte NIO Auslastung, reduzierte GPU-Stunden und verbesserte den Durchsatz ohne Stabilitätsverlust.

Die hybride Ressourcenstrategie unterstützt vielfältige KI-Workloads von CI über Simulation bis Inferenz effizienter in derselben Kubernetes-Umgebung.