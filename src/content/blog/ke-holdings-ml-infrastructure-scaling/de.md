---
title: 'Ke Holdings: Skalierung der Machine-Learning-Infrastruktur mit GPU-Virtualisierung'
date: '2026-03-09'
excerpt: >-
  Ke Holdings Inc. steigert die GPU-Auslastung nahezu auf das Dreifache (13 % → 37 %), indem
  das Team AIStudio einsetzt — eine intelligente Rechenplattform auf Basis von Kubernetes und
  HAMi für GPU-Virtualisierung in Multi-Cloud-Umgebungen.
author: Dynamia
tags:
  - Ke Holdings
  - HAMi
  - Case Study
  - GPU virtualization
  - Kubernetes
  - CNCF
category: Customer Success Story
coverImage: /images/blog/ke-holdings-ml-infrastructure-scaling/solution-diagram.png
linktitle: Ke Holdings GPU Infrastructure
source: 'https://www.cncf.io/case-studies/ke-holdings-inc/'
---

## Hintergrund

Ke Holdings Inc. ist in China eine integrierte Online- und Offline-Plattform für Immobilientransaktionen und zugehörige Dienstleistungen. Zur Unterstützung der schnell wachsenden KI-Initiativen betreibt ein zentrales Infrastrukturteam die unternehmensweit genutzte Machine-Learning-Plattform.

Das Team liefert End-to-End-Rechenleistung für Modellentwicklung, Training und großskalige Inferenz — sowohl für interne Forschungsworkloads als auch für produktionsnahe KI-Dienste. Mit zunehmender Modelladoption und steigendem Anfragevolumen wurden GPU-Effizienz und Workload-Isolation zu zentralen Plattformanforderungen.

## Herausforderung

Mit dem Wachstum der Machine-Learning-Initiativen bei Ke Holdings stand das Infrastrukturteam vor erheblichen Herausforderungen im GPU-Ressourcenmanagement:

Anfangs lag die Gesamt-GPU-Auslastung bei nur 13 % — bedingt durch die Komplexität der Multi-Cloud-Umgebung und unterschiedliche Workload-Anforderungen. Das veranlasste das Team, nach Wegen zur besseren Cluster-Ressourcennutzung zu suchen.

## Lösung

![Lösungsdiagramm](/images/blog/ke-holdings-ml-infrastructure-scaling/solution-diagram-en.svg)

Auf Basis der CNCF-Projekte [HAMi](https://github.com/project-hami/hami) und [Kubernetes](https://kubernetes.io/) entwarf und implementierte das Infrastrukturteam von Ke Holdings **AIStudio** — eine intelligente Rechenplattform als Fundament der Machine-Learning-Infrastruktur des Unternehmens.

Kubernetes wurde wegen seiner hohen Stabilität und starken Cluster-Scheduling- und -Management-Fähigkeiten gewählt, die den operativen Aufwand und die Wartungslast großer Cluster deutlich senken. Zudem ermöglicht die Anbindung an das offene CNCF-Ökosystem die nahtlose Nutzung verschiedener Open-Source-Lösungen für unterschiedliche Use Cases — etwa HAMi.

HAMi wurde gewählt, weil es die am besten passende Lösung für GPU-Multiplexing und heterogenes Computing im Sinne von AI Studio ist.

![Architekturdiagramm](/images/blog/ke-holdings-ml-infrastructure-scaling/architecture-diagram-en.svg)

Das Team setzt einen Dual-Cluster-Ansatz um, der Workloads nach Ressourcenbedarf trennt.

Diese architektonische Trennung stellt sicher, dass Trainingsjobs dedizierte, planbare Ressourcen erhalten, während Inferenzdienste durch Speicher-Sharing hohe Dichte erreichen. So entfällt Ressourcenkonkurrenz zwischen Workload-Typen und die Gesamteffizienz der Infrastruktur steigt.

## Wirkung

Mit Open-Source-Technologien wie HAMi und Kubernetes hat AI Studio des Infrastrukturteams Folgendes erreicht:

- **Stabiler Betrieb in großem Maßstab**
  - Zehnmillionen Geschäftsanfragen pro Tag werden zuverlässig verarbeitet
  - Hohe Verfügbarkeit und Zuverlässigkeit für kritische Workloads
  - Konstante Performance unter hoher Last

- **Kosteneffizientes Ressourcenmanagement in Multi-Cloud-Umgebungen**
  - Nahezu dreifache Steigerung der GPU-Auslastung (13 % → 37 %)
  - Effiziente Speicherzuweisungsstrategien für unterschiedliche Workload-Typen

- **Produktionsreife Zuverlässigkeit für geschäftskritische Workloads**
  - Robuste Scheduling- und Management-Fähigkeiten
  - Geringerer operativer Aufwand und Wartungsaufwand

Die erfolgreiche Integration von HAMi als Kernkomponente zeigt, wie Open Source Organisationen zu bemerkenswerter Infrastruktureffizienz verhelfen kann.

Kubernetes bildet die zugrunde liegende Plattform und ermöglicht durch robustes Scheduling und Management den stabilen Betrieb von Zehnmillionen täglicher Geschäftsanfragen und Zehntausenden Pods. Mit HAMis GPU-Multiplexing und heterogener Scheduling-Optimierung ist die Cluster-GPU-Auslastung nahezu auf das Dreifache gestiegen.

## Ausblick

Das Infrastrukturteam von Ke Holdings innoviert und erweitert die Plattform auf Basis von HAMi und Kubernetes weiter, unter anderem:

- **Heterogene Geräte**: Einbindung von Huawei Ascend und weiteren Nicht-NVIDIA-Beschleunigern
- **Cloud-Erweiterung**: Anbindung an Alibaba Cloud ergänzend zu Volcano Engine und Tencent Cloud
- **Erweiterte Scheduling-Richtlinien für gemischte Workloads**: Netzwerk-Topologie-Bewusstsein, Kartentyp-Vorgabe und UUID-basierte Zuweisung