---
title: 'China Merchants Bank verbessert AI-Compute-Scheduling auf Kubernetes mit HAMi'
date: '2026-07-06'
excerpt: >-
  CNCF-Fallstudie: Wie China Merchants Bank eine einheitliche AI-Compute-Scheduling-Plattform auf
  Kubernetes und HAMi aufbaute — heterogenes Pooling, Topologie-bewusstes Scheduling und
  feingranulares Accelerator-Sharing. Hardware-Pool-Auslastung 100 %, Cross-Machine-Scheduling
  −30 %, Partitionierung bis 1 GB Speicher / 1 % Compute.
author: Dynamia
tags:
  - HAMi
  - CNCF
  - GPU Sharing
  - vGPU
  - Kubernetes
  - China Merchants Bank
  - Case Study
  - AI Infrastructure
  - Topology-Aware Scheduling
category: Customer Success Story
coverImage: /images/blog/cmb-cncf-case-study/cmb-cover.jpg
linktitle: China Merchants Bank HAMi Case Study
---

## Executive Summary

Mit wachsenden AI-Workloads für Training, Inferenz, F&E und interne Anwendungen brauchte China Merchants Bank effizienteres Management heterogener Beschleuniger. Mit Kubernetes und HAMi entstand eine einheitliche AI-Compute-Scheduling-Plattform mit heterogenem Pooling, Topologie-bewusstem Scheduling und feingranularem Sharing — höhere Auslastung, weniger Kommunikationsoverhead beim verteilten Training, skalierbare Basis für Enterprise-AI.

## Über China Merchants Bank

China Merchants Bank gehört zu den führenden Geschäftsbanken Chinas mit starken Investitionen in Cloud Native, AI und digitale Infrastruktur. Breite Trainings-, Inferenz- und interne AI-Workloads setzen die Compute-Plattform unter Druck.

## Herausforderungen

Großmodell-Training, Inferenz und AI-Anwendungen wachsen schnell. Für große Organisationen ist der Engpass selten fehlende Rechenleistung, sondern ineffiziente Nutzung vorhandener Ressourcen.

Die Bank betrieb eine heterogene Plattform mit verschiedenen AI-Beschleunigern für Training, Online-Inferenz, F&E und interne Tools. Das alte Ressourcenmanagement skalierte nicht mit — eine neue einheitliche Plattform auf Kubernetes mit HAMi bündelte heterogenes Management, Topologie-Scheduling und feingranulares Sharing.

Drei zentrale Probleme:

### Fragmentiertes Ressourcenmanagement

Unterschiedliche Beschleuniger-Hersteller liefern eigene Software-Stacks und Tools — Silos, inkonsistente Policies, steigender Ops-Aufwand.

### Training-Hardware nicht voll ausgelastet

Multi-Chip-High-Speed-Interconnect-Nodes: Task-Platzierung hängt von physischer Chip-Topologie ab. Ohne Topologie-Verständnis landen Tasks falsch — Performance leidet oder Jobs scheitern.

### Verschenkte Kapazität bei kleinen Tasks

Inferenz, Fine-Tuning und Tests brauchen oft keine ganze Karte; Ganzkarten-Zuweisung lässt Kapazität brach liegen.

## Warum HAMi

- **Nativ auf Kubernetes** — ohne Umstrukturierung des Cloud-Native-Stacks.
- **Vereinheitlicht heterogene Ressourcen** — ein Scheduling-Rahmen für mehrere Beschleunigertypen.
- **Feingranulares Sharing** — Speicher und Compute mit Quota-Kontrolle.
- **Open Source und erweiterbar** — Anpassung an Geschäftsbedarf.

## Die Lösung

China Merchants Bank baute die Plattform auf Kubernetes und HAMi auf und iterierte bei Ressourcen-Onboarding, Shared Scheduling und Training-Effizienz.

### Plattformarchitektur

![Plattformarchitektur](/images/blog/cmb-cncf-case-study/image-2.png)

Drei Schichten:

- **Business Service Layer:** Großskaliges Training, AI-Inferenz, Fine-Tuning, interne AI-Anwendungen.
- **HAMi Scheduling Layer:** Heterogenes Pooling, Topologie-Scheduling, GPU/NPU-Sharing, Multi-Vendor-Abstraktion.
- **Infrastruktur:** Multi-Vendor-Beschleuniger, Multi-Node-Cluster, High-Speed-Interconnect.

### Einheitliches heterogenes Ressourcenmanagement

HAMi poolt viele Beschleunigertypen in einem Kubernetes-Pool. In der Bank-Umgebung: Kunlunxin, diverse Ascend-Modelle, NVIDIA GPUs, PPUs, Moore Threads, MetaX und weitere. Ohne HAMi käme oft pro Hardware-Lieferung ein eigener Cluster — mehr als acht getrennte Cluster mit jeweils Device Plugins, Policies, Monitoring und Ops.

Mit HAMi: ein Rahmen, konsistente Plattform-Policies. Anwendungsteams fordern über Standard-Kubernetes-Workflows; die Plattform abstrahiert Gerätetyp, Vendor-Stack und Allokationsmodell. HAMi liefert Vendor-Best-Practices und Beispiel-Workloads zur Validierung neuer Geräte vor Produktion.

### Topologie-bewusstes Scheduling: Supernode-Architektur

Einige Training-Nodes nutzen **Supernode (Dual-Chip-Modul)** — mehrere Chips per High-Speed-Interconnect als logische Einheit. Der Standard-Kubernetes-Scheduler versteht das Layout nicht:

- **Ungerade Kartenanzahl** kann Module spannen → Treiberfehler.
- **Cross-Module-Traffic** höhere Latenz als innerhalb des Moduls.
- **Leerlauf** durch schlechte Platzierung.

Die Bank erweiterte HAMi Device Plugin und Scheduler um Modul-Erkennung und Paar-Zuweisung. **Hardware-Pool-Auslastung: 100 %.**

ResNet50-Inferenz (Batch 32): feingranulare Compute-Partitionierung steigerte Durchsatz von 64,6 auf 94,8 Bilder/s pro Karte; bis zu **46,7 %** mehr Gesamtdurchsatz bei feinerer Partitionierung.

![Supernode Modul-Paar-Zuweisung](/images/blog/cmb-cncf-case-study/image.png)

Verbesserte Behandlung von Multi-Chip-Interconnect-Nodes: kürzeste Kommunikationspfade → stabileres, schnelleres Training.

### Feingranulares Sharing: vNPU-Core-Software-Partitionierung

Kleine Jobs brauchen keine Ganzkarte. **VMPO Core** (User-Space-Compute-Partitionierung):

- **Token Bucket** für Compute-Quotas.
- **User-Space-Speicherverwaltung** für feine Partitionierung.

![vNPU-Core User-Space-Partitionierung](/images/blog/cmb-cncf-case-study/image-1.png)

Granularität bis **1 GB Speicher / 1 % Compute**, pro Task mischbar — wichtig im Banking für kleine Risiko- und Service-Modelle.

Inferenz, kleines Training und Tests: Kartensharing für mehrere Tasks auf einer Karte.

### Netzwerk-Topologie: Drei Ebenen und Anti-Dispersion

**Mehrstufiges Topologie-Scheduling** für verteiltes Training:

- **Ebene 1: Gleicher Node** — niedrigste Latenz, höchste Priorität.
- **Ebene 2: Gleicher LEAF-Switch** — mittlere Latenz.
- **Ebene 3: Cross LEAF** — höchste Latenz, niedrigste Priorität.

*Abbildung 3: Drei-Ebenen-Netzwerk-Topologie-Scheduling.*

Topologie-Scores in der Ranking-Phase. **Cross-Machine-Scheduling −30 %.**

**Controller-UID-basiertes deterministisches Hashing** hält Pods desselben Jobs auf demselben Node gruppiert.

## Kernergebnisse

| Metrik | Ergebnis |
| --- | --- |
| Hardware-Pool-Auslastung | **100 %** |
| Cross-Machine-Wahrscheinlichkeit | **−30 %** |
| Feinste Partitionierung | **1 GB Speicher / 1 % Compute** |
| Plattformarchitektur | Einheitliches heterogenes AI-Scheduling |

> Mit HAMi bauten wir eine einheitliche heterogene AI-Scheduling-Plattform auf Kubernetes und verbesserten Auslastung, Training-Effizienz und Plattformstabilität deutlich.

## Warum das zählt

Der Wettbewerbsvorteil liegt nicht im Ankauf, sondern in mehr Wert aus vorhandener Hardware — Kubernetes wird zur Steuerungsebene für Enterprise-AI. Open Source wie HAMi liefert heterogenes Scheduling, Sharing und Orchestrierung ohne Radneuerosion.

## Ausblick

Weitere Optimierung von Ascend hami-vnpu-core, Monitoring für virtualisierte NPUs, aktiver Beitrag zur HAMi-Community.

## Zusammenfassung

Kubernetes und HAMi als einheitliche Basis für heterogene AI-Infrastruktur im Enterprise-Maßstab — bessere Auslastung, Platzierung und feingranulares Sharing.

> Dieser Artikel basiert auf der [CNCF-Fallstudie China Merchants Bank](https://www.cncf.io/case-studies/china-merchants-bank/).

## Referenzen

- [HAMi](https://project-hami.io/)
- [China Merchants Bank](https://english.cmbchina.com/)