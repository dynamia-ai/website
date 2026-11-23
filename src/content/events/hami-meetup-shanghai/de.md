---
title: Effizienz statt reiner Rechenleistung — Technischer Rückblick auf das HAMi Meetup Shanghai
date: '2025-12-16'
excerpt: >-
  Das HAMi Meetup fand am 30. November in Shanghai unter dem Motto „Effizienz statt reiner
  Rechenleistung“ statt — mit Fokus auf GPU-Virtualisierung und heterogenes Scheduling in der
  Praxis. Expertinnen und Experten von CNCF und mehreren Unternehmen berichteten über Fortschritte
  und Produktionserfahrung mit HAMi bei Scheduling-Observability, GPU-Sharing, domestic
  Beschleunigern und Cloud-Native-AI-Infrastruktur.
author: Dynamia
tags:
  - HAMi
  - Heterogeneous Compute Scheduling
  - GPU Virtualization
  - Cloud-Native AI
  - Kubernetes
  - Domestic Accelerators
  - AI Training and Inference Optimization
  - Open Source Ecosystem
  - HAMi Meetup
category: Community & Events
coverImage: /images/events/hami-meetup-shanghai/cover.png
linktitle: HAMi Shanghai Meetup Recap
---

![HAMi Meetup Shanghai](/images/events/hami-meetup-shanghai/cover.png)

Am 30. November endete das erste HAMi Meetup erfolgreich im Shanghai ModelSpeed Space. Unter dem Motto „Effizienz statt reiner Rechenleistung“ nahmen fast hundert AI-Entwicklerinnen, Ops-Ingenieurinnen und Enterprise-IT-Architektinnen vor Ort teil, über 700 verfolgten den Livestream. Im Mittelpunkt standen die Kernherausforderungen heterogener Rechenplanung. Praktikerinnen von CNCF, Dynamia, NIO, MetaX, DaoCloud und Transwarp sprachen nacheinander über Beschleuniger-Enablement, Auslastungssteigerung, AI-Training-Optimierung und Rollout domestic Compute — mit übertragbaren technischen Ansätzen, Kollaborationserfahrung und Fallstricken aus echten Deployments.

![Veranstaltungsfläche HAMi Meetup Shanghai](/images/events/hami-meetup-shanghai/image1.png)

## Eröffnungskeynote

![CNCF Keith Chan Eröffnungskeynote](/images/events/hami-meetup-shanghai/image2.png)

Keith Chan, Vizepräsident der Linux Foundation und CNCF Chair für China im Asia-Pacific-Raum, hielt die Eröffnungskeynote. HAMis Fortschritte bei GPU-Virtualisierung machten das Projekt zu einer wichtigen Kraft für Unternehmen beim Ausbau cloud-nativer AI-Infrastruktur und trugen zur CNCF-Inkubation bei. Mit explosiv wachsendem Compute-Bedarf geht es nicht nur um „wie viele GPUs“, sondern „wie effizient sie genutzt werden“. Generative AI treibt den vollständigen Umzug großer Modellanwendungen in cloud-native Umgebungen; 70–80 % von Inferenz und Training laufen bereits auf Kubernetes. In globalen Umfragen sehen über 80 % der Unternehmen Open Source als Treiber der AI-Reife; Multi-Cloud ist im Großmodell-Zeitalter Konsens. Darauf aufbauend arbeitet CNCF mit Anbietern weltweit an Certified AI Platform for Kubernetes — über 100 Konformitätstests zu Beschleunigern, Storage, Networking, Scheduling, Observability und Security für Kompatibilität, Portabilität und Observability von AI-Workloads. Während sich Cloud Native über AI, Edge, Quantencomputing und verteilte Systeme ausdehnt, verschiebt sich Wettbewerb von „mehr Karten“ zu „Gewinn durch Effizienz“. HAMis Weiterentwicklung bei GPU-Virtualisierung und heterogenem Scheduling liefert dafür zentrale Fähigkeiten.

## Rückblick auf fünf Vorträge

### „HAMi 2.7.0 Deep Dive und 2.8.0 Roadmap: Volle heterogene Chip-Abdeckung und Sprung bei Scheduling“

![HAMi-Core-Maintainer Li Mengxuan](/images/events/hami-meetup-shanghai/image3.png)

Li Mengxuan, HAMi-Core-Maintainer, skizzierte die Entwicklung von 2.7.0 zu 2.8.0. Version 2.7.0 bringt Scheduling-Reason-Sichtbarkeit und verbessertes Quota-Monitoring: warum ein Pod Pending ist, und genauere Speicher-Quota-Nutzung trotz Virtualisierungsverzerrung. Ökosystem und Hardware: neun GPU-Hersteller plus Kunlunxin XPU, AWS Trainium/Inferentia und weitere heterogene Geräte, präsentiert in einer freundlicheren Web-UI. 2.8.0 fokussiert Scheduling-Performance und Web-UI für heterogene Geräte und plant Konvergenz von Scheduler und Device-Plugin in einen neuen DRA-Treiber — standardisierte dynamische Partitionierung, harte Isolation und mehrdimensionale Requests ohne Gewohnheitsbruch.

### „MetaX sGPU auf HAMi“

![MetaX Guo Lei über sGPU](/images/events/hami-meetup-shanghai/image4.png)

Guo Lei, Cloud-Native-Infrastruktur-Experte bei MetaX und Core-Contributor von MetaX sGPU, berichtete über die Integration von sGPU in die HAMi-Community. sGPU teilt Speicher und Compute fein (Speicher 1-MB-, Compute 1%-Granularität). Mit HAMi-Scheduler und MetaX Device Plugin fordern Pods virtuelle GPU-Ressourcen wie „60 % Compute + 4 GB Speicher“. Auf Scheduler-Ebene bietet HAMi Binpack/Spread auf Node- und GPU-Ebene kombinierbar. sGPU-QoS: Best Effort, Fixed Share, Burst Share — von voller Preemption bis elastischen Quotas, plus Online/Offline-Colocation. Guo Lei: tiefe Integration macht „teilbar, schedulierbar, fein steuerbar“ über Standardinterfaces im Kubernetes-Stack.

### „mlperf auf vGPU“

![NIO Li Peng über mlperf auf vGPU](/images/events/hami-meetup-shanghai/image5.png)

In Produktion geht es nicht um „ob virtualisieren“, sondern „welcher Weg die wenigsten Nebenwirkungen hat“. Li Peng, Leiter Training-Beschleunigung bei NIO, stellte ein Performance-Diagnose-Framework auf HAMi vGPU vor. HAMis perf-basierte Virtualisierung durch Abfangen von CUDA/cuBLAS/NVML ermöglicht vollständige GPU-Call-Erfassung ohne Codeänderung, ergänzt durch externes perf-Sampling und duale CPU/GPU-Timelines — Bottlenecks wie niedrige Parallelität, Kommunikationsstalls oder anomale API-Parameter. Produktisierung schließt die Schleife von Bottleneck-Lokalisierung zu Code-Attribution; erfolgreich in autonomes Fahren bei NIO.

### „HAMi: Open-Source-GPU-Scheduling für AI-Entwickler auf d.run“

![DaoCloud Lu Chuanjia über d.run](/images/events/hami-meetup-shanghai/image6.png)

Lu Chuanjia, Product Lead bei DaoCloud, über SaaS-GPU-Vermietung auf d.run mit HAMi. d.run poolt GPU-Ressourcen cloud-nativ für Training, Inferenz, Datenverarbeitung. HAMi liefert Virtualisierung für domestic GPUs und flexibles Slicing. Self-built Setups scheitern oft an Ganzkarten-Nutzung; SaaS-Miete bringt Elastizität, leidet aber unter Angebots-Nachfrage-Schwankungen. HAMis dynamisches Slicing und Overcommit reduziert Fragmentierung (mehr SKUs pro Karte: 3G/6G/12G/24G) und vermeidet OOM-getriebene Restarts durch dynamische Speichererweiterung. d.run betreibt heute eine Slicing-Vermietungsplattform auf HAMi — Multi-Cluster, domestic Cards, Tenant-Prioritäten, Preemption, Inferenz-MaaS, Enterprise-Hosting, Consumer-GPU-Cloud.

### „Transwarp × Domestic-Compute-Ökosystem: Enablement-Praxis“

![Transwarp Hou Yuxi](/images/events/hami-meetup-shanghai/image7.png)

Hou Yuxi vom LLMOps-R&D-Team bei Transwarp über Enablement auf Cambricon, Hygon und weiteren domestic Beschleunigern. HAMi vereinheitlicht Multi-Modell-/Multi-Architektur-GPUs und DRA als erweiterbare Compute-Abstraktion. Das LLMOps-Plattform-Team adressierte sMLU-Granularität, Resource-Name-Isolation, Hardcoded-Memory-Einheiten bei Cambricon; bei Hygon DCU Device-IDs, Border-Metriken, Pod-Device-Mapping — Seriennummern per Driver-SDK, unique IDs, Exporter an HAMi-Plugin angeglichen. DRA als einheitliche Richtung für heterogene GPUs.

## Diskussion und Q&A

Lebhafte Diskussion zu Virtualisierung, Inferenz-Effizienz und domestic Enablement. Volle Plätze, viele Gespräche mit Speakern danach — starkes Interesse an Compute-Effizienz und cloud-nativer AI-Infrastruktur.

![Diskussionsrunde HAMi Meetup](/images/events/hami-meetup-shanghai/image8.png)

## Abschluss

Das Meetup konzentrierte sich auf Compute-Effizienz — mit praxisnahen Takeaways für Unternehmen und Austausch von vor Ort und online. Die HAMi-Community wird Open Source als Brücke nutzen, heterogenes Scheduling vertiefen und leichte, anpassungsfähige Effizienzlösungen bringen.

**Das nächste Meetup folgt im Dezember in Peking** — Nutzungsdurchbrüche bei heterogener Virtualisierung, Leerlauf und niedrige Auslastung durch schwieriges Hardware-Enablement.

Wir laden **Community-Nutzer und Praktiker ein, Beiträge zu schreiben** — ob Auslastungsoptimierung oder Produktionsfallstudien — damit starke Praxis in der Community zirkuliert.