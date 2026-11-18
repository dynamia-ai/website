---
title: 'Effizienz statt roher Rechenleistung | HAMi Meetup Shanghai: Von heterogenem Compute-Management zur KI-Produktionspraxis'
linktitle: HAMi Meetup Shanghai 2026 Rückblick
date: '2026-09-09'
excerpt: >-
  Fünf Produktionsvorträge zur KI-Compute-Effizienz: Remote-GPUs und HAMi 2.10,
  llm-d verteilte Inferenz-Steuerungsebene, SLO-gesteuerte Inferenz auf
  chinesischen GPUs, Volcano + HAMi-core Scheduling und Isolation, UCloud
  AI-Plattform-Engineering.
author: Dynamia
tags:
  - HAMi
  - HAMi Meetup
  - llm-d
  - Remote GPU
  - Verteilte Inferenz
  - Iluvatar CoreX
  - Volcano
  - UCloud
  - CNCF
  - Heterogenes Computing
category: Community & Events
coverImage: /images/blog/hami-meetup-shanghai-2026/image1.png
---

Wenn große Modelle in Produktion gehen, lautet die Frage nicht mehr „haben wir GPUs“, sondern wie verstreute, heterogene, knappe Compute-Ressourcen in Infrastruktur werden, die schedulierbar, isoliert, beobachtbar und kontinuierlich lieferbar ist.

Remote-GPUs, verteilte Inferenz, Adaption chinesischer GPUs, Kubernetes-Hetero-Fundament und AI-Platform-Engineering verschmelzen zur Branchenfrage: **Wie erreicht Compute-Effizienz tatsächlich die Produktionsseite?**

Am 6. September endete erfolgreich „Efficiency over Raw Compute | HAMi Meetup Shanghai · Incubating Special Event“, gemeinsam von Dynamia und der HAMi-Community, unterstützt vom Shanghai Wujiaochang Innovation & Entrepreneurship Institute — vierte Meetup-Station und erstes Offline-Event seit CNCF Incubating.

![HAMi Meetup Shanghai Venue](/images/blog/hami-meetup-shanghai-2026/image1.png)

Keynote, fünf Tech-Talks und Community-Panel: von Open-Source-Frameworks, GPU-Herstellern, Endnutzern, Cloud-Anbietern und Community-Governance — zentrale Probleme von „Ressourcen verfügbar“ zu „production ready“.

## Eröffnung: HAMi erreicht CNCF Incubating

Im Juli 2026 wurde HAMi offiziell CNCF Incubating. Bis September nur sechs Projekte weltweit in 2026 in dieser Stufe. Incubating bedeutet systematische CNCF-Bewertung von Adoption, Reife und Governance — reifere Community-Phase.

**Keith Chan, CNCF China Director und Linux Foundation APAC VP**, eröffnete erneut. Von früheren HAMi-Events bis zum ersten Offline nach der Promotion spiegelt seine Beteiligung CNCF-Aufmerksamkeit für HAMi und Cloud-Native-KI-Infrastruktur.

In „CNCF × PyTorch: Building a Cloud-Native AI R&D Foundation for Industry“ ausgehend von Kosten, Effizienz und Skalierung — Schichtenmodell: PyTorch, CNCF-Orchestrierung, Ressourcenmanagement von Entwicklung über Training bis Deployment.

HAMi liefert heterogene KI-Compute-Virtualisierung und Ressourcenmanagement — Sharing, Isolation, intelligentes Scheduling für GPUs, NPUs u. a. — Kontext für die folgenden Talks zu Scheduling, Inferenz-Effizienz und Produktion.

![Keith Chan, CNCF China Director und Linux Foundation APAC VP](/images/blog/hami-meetup-shanghai-2026/image2.png)

## 01 | Von lokalen GPUs zu Remote-Compute-Pools

Li Mengxuan, Mitgründer und CTO von Dynamia, HAMi-Autor und Maintainer: „From Local Devices to Remote Compute Pools: Remote GPU Solutions and What's New in HAMi 2.10.“

Verstreute GPUs über Knoten, Rechenzentren und Cluster — „Gerät muss dort sein, wo der Task läuft“ begrenzt Scheduling. Remote-GPUs lösen physische Knotengrenzen; Compute als Pool zugänglich und schedulierbar.

HAMi v2.10: KAI-Scheduler-Adaption, vNPU-Partitionierung und Monitoring, mutex-Policy und Policy-Ketten, flexibleres dynamisches MIG, HAMi-DRA zu Allokation, Reuse, Ascend.

**Compute-Effizienz endet nicht bei „Zuteilung erfolgreich“:** Welche Tasks belegen welche Karte, wie viel Compute/VRAM zugewiesen und tatsächlich genutzt — nur mit gemeinsamer Beobachtung von Scheduling, Allokation und Nutzung wird GPU eine governable Produktionsressource.

![Li Mengxuan, Mitgründer und CTO von Dynamia, HAMi-Autor](/images/blog/hami-meetup-shanghai-2026/image3.png)

## 02 | Verteilte Inferenz bekommt eine Steuerungsebene

Zhang Jiaju, Red Hat Greater China CTO: „llm-d: Building a Distributed Inference Plane across Workloads, Modalities, Hardware, and Platforms.“

Komplexere Modelle, Request-Typen und Hardware — keine einzelne Inferenz-Engine löst alles. llm-d fokussiert die Inferenz-Steuerungsebene: Routing, KV-Cache, Prefill/Decode-Trennung, Flow Control, Autoscaling, Batching — Endpunkte koordinieren um Last und Service-Ziele.

Ab v0.8-Roadmap: kein Fork einer Engine, sondern unabhängige Control Layer — Routing, Endpoint-Auswahl, Cache, Elastizität; EndpointDiscovery erweitert Scheduling über Kubernetes zu Slurm, Bare Metal, RL.

Für Multi-Tenant, agentic AI, multimodal, große Batches verschiebt sich die Kernfähigkeit von „Modell läuft“ zu **Latenz, Durchsatz und Stabilität unter komplexem Traffic — kontinuierlich**.

![Zhang Jiaju, Red Hat Greater China CTO](/images/blog/hami-meetup-shanghai-2026/image4.png)

## 03 | Inferenz auf chinesischen GPUs: SLO-Akzeptanz, nicht nur Zuteilung

Ye Chenglin, Infra R&D Director Iluvatar CoreX: „High-Performance Inference Deployment on Iluvatar CoreX GPUs“ — Engineering-Pfad chinesischer GPU ins Mainstream-Inferenz-Ökosystem.

Oben: OpenAI-kompatible APIs, vLLM, Hugging Face — niedrige Migrationskosten; darunter IxFormer, IXInfer, ixDNN, ixBLAS, IXCCL, IXLink. GPUClusterPolicy, Device Plugin, DRA, Topologie-Scheduling, HAMi-Sharing für kleine Modelle — einheitliche Ressourcen-Control-Plane.

**Zuteilung erfolgreich ≠ Service bereit — erstes Token innerhalb SLO zählt als geliefert.** Von Zuteilung und GPU-NIC-Topologie über Weight-Loading, Warm-up, Routing-Leases bis First Token — beobachtbar und abnahmetestbar.

Bei Prefill/Decode-Trennung: nicht nur „architektonisch teilbar“, sondern ob Prefill-Einsparungen und Decode-Queue-Gewinne KV-Transfer, Routing, Remote-Queue und Recovery übersteigen. TTFT, TPOT, scale-to-first-token, KV-Transfer, effektive Tokens als Maßstab.

![Ye Chenglin, Infra R&D Director Iluvatar CoreX](/images/blog/hami-meetup-shanghai-2026/image5.png)

## 04 | Volcano + HAMi-core: Scheduling und Isolation

Dong Jiang, Senior Architect iFLYTEK, Volcano- und HAMi-Community: „Building a K8s Heterogeneous AI Compute Foundation with Volcano + HAMi-core.“

Große Trainings- und Inferenz-Cluster: Fragmentierung, diverse Job-Typen, Distributed Training, Legacy-Migration, Multi-Tenant-Quoten, komplexe Workflows — Einzelproblem-Lösungen reichen selten.

Volcano: Multi-Engine-Orchestrierung, Queues, DAG, Gang, Binpack, Real-Load, Fairness; HAMi-core: VRAM- und Compute-Isolation, Feinpartitionierung, Multi-Architektur.

Binpack allein **+40 % Auslastung**. Dual-Ziel in Produktion: Fragmentierung senken und Sharing erhöhen, Stabilitätsrisiken von Failures, OOM, Fault-Propagation auf geteilten GPUs begrenzen. **Scheduling platziert richtig; Isolation hält Sharing zuverlässig.**

![Dong Jiang, Senior Architect iFLYTEK, Volcano- und HAMi-Community](/images/blog/hami-meetup-shanghai-2026/image6.png)

## 05 | GPUs als nutzbare Dev-Umgebung

Peng Peng, Senior R&D UCloud: „Engineering Challenges and Practices of AI Compute Platforms“ — von Ressourcenmanagement zu Umgebungs-Delivery.

Algorithm-Teams, Inferenz-Cluster, Kunden mit eigenen GPUs brauchen keine Hardware-Inventur, sondern GPUs als manageable, lieferbare, direkt nutzbare Compute-Services. Je heterogener unten, desto einfacher sollen Entwickler oben finden — Komplexität in der Plattform.

Fünf aufeinanderfolgende Lücken bei einer Dev-Environment-Delivery: einheitlicher Ressourcenausdruck, Multi-Cluster-Anbindung, flexible Dev-Tools, schnelle Images, effiziente GPU-Nutzung. Praxis: Instance Spec, leichtgewichtiger Multi-Cluster-Zugang, Runtime-Tool-Injection, On-Demand-Images, szenariospezifische GPU-Isolation.

Isolation je Deployment: private AI-Plattform HAMi vGPU; Public-Cloud-Consumer Kernel-vGPU; Public-Cloud-B2B Abwägung QEMU-Passthrough, NVSwitch-Fabric, PCIe-only.

Neue Engpässe nach schneller Dev-Delivery: Weight-Loading, PD-Koordination, KV-Cache, idle CPU, heterogene Auswahl und Migration. Endzustand: nicht „Cluster verwalten“, sondern stabile Umgebungen schneller, Modelle auf passendem Compute.

![Peng Peng, Senior R&D Engineer UCloud](/images/blog/hami-meetup-shanghai-2026/image7.png)

## Panel | Neu aufbrechen aus Incubating

Community-Panel: echte HAMi-Nutzung und Contributions, Open-Source-Kollaboration im Zeitalter von AI Coding, nächste technische Evolutionsstufe.

![Community-Panel](/images/blog/hami-meetup-shanghai-2026/image8.png)

Drei Schwerpunkte:

- **Vom Nutzer zum Contributor:** Szenarien der HAMi-Wahl im Unternehmen; Einstieg über Issues, Docs, Tests, erste PRs.
- **AI Coding in Open Source:** Problem ist nicht KI-Code, sondern Verständnis, Offenlegung, Verantwortung; Review von Implementierung zu Anforderung, Design, Grenzen.
- **HAMi und KI:** MCP, Diagnose-Tools, Wissensbasis, große/kleine Modelle, chinesische Hetero-Hardware — Partitionierung, Sharing, Isolation, Scheduling bleiben breiter Raum.

Incubating = neue Reife- und Community-Stufe: Hürden für Newcomer und Troubleshooting senken, produktive Compute-Management-Bedürfnisse weiter beantworten — mehr Unternehmen, Entwickler, Partner co-builden.

## Fünf Talks, eine gemeinsame Antwort

Von Remote-GPU und DRA über llm-d-Steuerungsebene, SLO auf chinesischen GPUs, Volcano + HAMi-core, AI-Platform-Delivery — unterschiedliche Stack-Schichten, gleiche Richtung:

> **Compute-Effizienz ist keine Einzelkomponente. Sie ist Systems Engineering über Zugang, Scheduling, Isolation, Routing, Observability, Delivery und Community.**

Drei Mitnahmen für AI-Plattformen:

1. **Zuteilbare Ressourcen ≠ operable Compute.** Auslastung, Topologie, Mandantengrenzen, Task-Lifecycle in einheitliche Governance.
2. **Gestartetes Modell ≠ gelieferter Inferenzdienst.** First Token, Tail-Latenz, Durchsatz, Cache, Recovery gemeinsam SLO-bestanden.
3. **Gelandete Technologie ≠ nachhaltiges Ökosystem.** Unternehmensprobleme in offene, wiederverwendbare Community-Fähigkeiten destillieren.

![Event Venue](/images/blog/hami-meetup-shanghai-2026/image9.png)

![Event Venue](/images/blog/hami-meetup-shanghai-2026/image10.png)

![Event Highlights](/images/blog/hami-meetup-shanghai-2026/image11.png)