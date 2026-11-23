---
title: "HAMi Community Meetup Shenzhen – Rückblick: Sieben Experten über die Cloud-Native-Zukunft der KI-Rechenleistung"
date: '2026-04-25'
excerpt: >-
  Am 25. April 2026 veranstaltete die HAMi-Community erfolgreich ihr drittes
  Offline-Meetup in Shenzhen. Sieben technische Experten von CNCF, SF Technology,
  China Merchants Bank, Enflame, Sangfor, BroadWare Technology und Dynamia AI
  diskutierten Cloud-Native-Evolution der KI-Infrastruktur, GPU-Compute-Pooling,
  heterogenes Scheduling und die Perspektive der DRA-Technologie.
author: Dynamia
tags:
  - HAMi
  - Meetup
  - Shenzhen
  - GPU-Virtualisierung
  - Heterogenes Scheduling
  - DRA
  - Cloud Native
  - KI-Infrastruktur
category: Community & Events
coverImage: /images/events/hami-meetup-shenzhen-recap/shenzhen-meetup-group-photo.webp
linktitle: Rückblick HAMi Meetup Shenzhen
---

![HAMi Meetup Shenzhen](/images/events/hami-meetup-shenzhen-recap/shenzhen-meetup-group-photo.webp)

Am 25. April 2026 veranstaltete die HAMi-Community erfolgreich ihr drittes Offline-Meetup in Shenzhen. Unter dem Motto „Compete on Efficiency, Not Compute“ lieferten sieben technische Experten von CNCF, SF Technology, China Merchants Bank, Enflame, Sangfor, BroadWare Technology und Dynamia AI ein technisches Programm zu Cloud-Native-Evolution der KI-Infrastruktur, GPU-Compute-Pooling, heterogenem Scheduling und DRA-Technologieausblick.

Die Veranstaltung wurde von der HAMi-Community organisiert, von Dynamia AI ausgerichtet und von SF Technology mit- und mit Bereitstellung des Veranstaltungsorts co-organisiert.

## Highlights

- **Keith Chan (CNCF China Director, Linux Foundation VP APAC)** teilte eine globale Perspektive zu Cloud-Native-Trends in der KI-Infrastruktur und berichtete, dass KI-bezogene Sessions 60–80 % der KubeCon-Shanghai-Einreichungen ausmachen
- **Li Mengxuan (Co-founder & CTO Dynamia AI, HAMi Maintainer)** stellte erstmals öffentlich Kernfeatures von v2.9 vor, inklusive DRA-Ökosystem-Allianz-Strategie und Vision für einheitliches heterogenes Rechenmanagement
- **Chen Junchao (Senior Backend Engineer, SF Technology)** berichtete über GPU-Pooling in Multi-Cloud-Produktion und steigerte die durchschnittliche Cluster-Auslastung von 40 % auf 90 %
- **Su Xi (R&D Engineer, China Merchants Bank)** zeigte Supernode-Hardwareanpassung und netzwerktopologiebewusstes Scheduling und reduzierte die Wahrscheinlichkeit von Cross-Machine-Scheduling um 30 %
- **Ma Da (Enflame)** demonstrierte eine Full-Stack-Cloud-Native-Integration mit GPU Operator + CDI + DRA
- **Jia Haojie (Chief Architect Cloud AI, Sangfor)** teilte Strategien zur Steuerung von KI-Compute-Gateways und wandelt jede Recheneinheit in messbaren Geschäftswert um
- **Ou Binkai (Researcher, BroadWare Technology)** präsentierte eine mit HAMi tief integrierte One-Click-Deployment-Plattform für GPU-Virtualisierung

## Keynote: Die Infrastruktur der KI-Zukunft

Keith Chan, CNCF China Director und Linux Foundation VP APAC, hielt eine Keynote mit dem Titel „The Infrastructure of AI's Future“. Er teilte CNCF-Umfragedaten:

- 66 % der Unternehmen weltweit betreiben KI-Workloads bereits in Cloud-Native-Umgebungen
- Kubernetes ist zur einheitlichen Orchestrierungsschicht für KI-Infrastruktur geworden
- NVIDIA ist offiziell CNCF-Platinmitglied, die PyTorch-Community integriert sich tief ins Cloud-Native-Ökosystem
- KI-bezogene Sessions machen 60–80 % der KubeCon-Shanghai-Vorschläge aus

Keith betonte, dass der Wettbewerbsfokus in der KI von „Rechenleistung stapeln“ zu „Rechenleistung optimieren“ wechselt. Hohe GPU-Kosten und unzureichende Ressourcennutzung sind globale Herausforderungen. Wie Rechenleistung zu niedrigsten Kosten und höchster Effizienz genutzt wird, ist zur Kernfrage geworden. CNCF treibt aktiv die Initiative Certified AI Platform for Kubernetes zur Standardisierung der Cloud-Native-Evolution der KI-Infrastruktur.

## Rückblicke auf technische Vorträge

### HAMi DRA-Ökosystem-Allianz & v2.9-Vorschau

Li Mengxuan, Co-founder & CTO von Dynamia AI und HAMi Maintainer, stellte erstmals öffentlich Kernfunktionen und Roadmap von HAMi v2.9 vor.

DRA (Dynamic Resource Allocation) wird zum nächsten Device-Management-Modell für Kubernetes, steht aber mit Implementierungsunsicherheit auf Anbieterseite und hohen Einstiegshürden auf Nutzerseite. Die HAMi-Community startet daher die **DRA Ecosystem Alliance**, die Device-Anbieter und Nutzer verbindet, um DRA-Adoption in realen Szenarien und standardisierte Evolution voranzutreiben.

**DRA-Lösungsbereitstellung:**

- DRA-Lösungen für NVIDIA / Ascend / Enflame Plattformen sind implementiert
- Vereinfachte Scheduling-Kette über native Kubernetes-Fähigkeiten, niedrigere Einstiegshürden
- Einheitliche Scheduling-Schicht maskiert Hardwareunterschiede und ermöglicht einheitliches heterogenes Rechenmanagement

**HAMi v2.9 – Kernfähigkeiten in der Vorschau:**

- Feinkörnigere Ascend-Partitionierung zur besseren Nutzung heimischer Rechenressourcen
- Unterstützung für kai-scheduler, Erweiterung des Scheduler-Ökosystems
- Dynamische MIG-Scheduling-Optimierung für flexiblere NVIDIA-GPU-Partitionierung

### SF Technology: HAMi in Multi-Cloud-Bereitstellung

Chen Junchao, Senior Backend Engineer bei SF Technology, teilte die vollständige Praxis beim Aufbau einer einheitlichen Compute-Pooling-Lösung auf Basis von HAMi.

SF Technology sah Kernherausforderungen: niedrige GPU-Auslastung, fragmentierte Multi-Cluster-Ressourcen und hohe Betriebskomplexität – besonders über 5 Private-Cloud-Cluster und mehrere Public Clouds, wo das traditionelle Ganzkarten-Modell zu erheblicher Rechenverschwendung führte.

**HAMi-basierte Lösung:**

- Einheitliches Scheduling und feinkörniges Management von KI-Rechenleistung über Multi-Cloud-Kubernetes-Cluster
- Bruch des GPU-Exklusivmodus durch feinkörnige Partitionierung für Multi-Task-Multiplexing
- Steigerung der durchschnittlichen Cluster-GPU-Auslastung von 40 % auf 90 %, deutliche Kostensenkung
- Einheitliche Operations-Ebene, weniger Multi-Cluster-Management-Komplexität

Die Lösung läuft stabil in mehreren SF-Technology-Produktionsclustern und validiert HAMis Zuverlässigkeit und Skalierbarkeit in großen Unternehmensszenarien.

### China Merchants Bank: Optimierung heterogenen KI-Compute-Schedulings

Su Xi, R&D Engineer bei China Merchants Bank, teilte die Vertiefung beim Aufbau einer einheitlichen Multi-Source-heterogenen KI-Compute-Scheduling-Plattform auf Basis von HAMi.

China Merchants Bank baute einen vollständigen technischen Kreislauf „ein Pool, mehrere Chips, elastisches Sharing, Topologie-Optimierung“ auf Basis von HAMi und adressierte Compute-Silos, niedrige Ressourcennutzung und hohe Betriebskosten.

**Ascend 910C Supernode-Anpassung:**

- Tiefe Hardwareanpassung für die Ascend-910C-Supernode-Architektur
- 100 % Compute-Ressourcen-Pooling und Hochleistungskommunikation für große Modelle
- Volle Nutzung der Netzwerkvorteile von Supernodes im verteilten Training

**HAMi-vNPU-Core Soft-Partitioning:**

- Feinkörniges Teilen von Speicher und Compute durch User-Space-Interception
- Virtualisierung ohne Änderung von Business-Code
- Deutlich höhere Task-Dichte pro Karte, maximale Hardwareausnutzung

**Netzwerktopologie-bewusstes Scheduling:**

- Eigener netzwerktopologiebewusster Scheduling-Algorithmus, sensibel für Inter- und Intra-Node-Topologie
- Reduktion der Cross-Machine-Scheduling-Wahrscheinlichkeit um 30 %, Durchbruch von Netzwerkengpässen im verteilten Training
- Praxis läuft stabil in Training, Inferenz und weiteren Kerenszenarien

### Enflame: Kubernetes-Ökosystem & GPU-Integration

Ma Da von Enflame demonstrierte eine Full-Stack-Cloud-Native-Integrationslösung auf Basis von GPU Operator + CDI + DRA.

Als heimischer GPU-Anbieter umarmt Enflame aktiv das Cloud-Native-Ökosystem und erkundet standardisierte Management-Pfade von der Device-Driver-Ebene bis zum Scheduling.

**Technische Lösung:**

- Standardisiertes Device-Management via GPU Operator, automatisierte GPU-Node-Bereitstellung und -Betrieb
- Nicht-invasive Ressourcenverwaltung durch CDI (Container Device Interface), keine Treiber-Vorinstallation in Business-Images nötig
- Dynamische Ressourcenzuweisung via DRA, mehr Scheduling-Flexibilität für variable Workload-Anforderungen

Die Lösung zeigt, wie heimische GPU-Anbieter über standardisierte Cloud-Native-Interfaces (Operator / CDI / DRA) tief ins Kubernetes-Ökosystem integrieren und Nutzern ein einfacheres, standardisierteres GPU-Management bieten.

### Sangfor: KI-Compute-Gateway-Optimierung & Modell-Governance

Jia Haojie, Chief Architect Cloud AI bei Sangfor, teilte Praxis aus Sangfors KI-Compute-Gateway-Produkt zu Compute-Optimierung und Modell-Governance.

Jia Haojie betonte, dass unternehmensweite KI-Compute-Governance nicht nur Scheduling selbst meint, sondern auch, wie jede Recheneinheit in messbaren Geschäftswert für Kunden überführt wird.

**Intelligente Routing-Strategie:**

- Intelligente Klassifikation von Nutzeranfragen durch semantische Analyse
- Einfache Fragen an kostengünstige kleine Modelle, komplexe an leistungsstarke große Modelle
- Optimale Compute-Kostenkontrolle bei gleichbleibender Wirkung

**Modell-Governance:**

- Front- und Back-End-Safety-Guardrails für Compliance und Sicherheit der Modellausgaben
- Visualisierte Messung von Compute-Kosten und -Wirkung zur Quantifizierung des KI-ROI
- Multi-Modell-kollaborative Orchestrierung als flexible, effiziente Modellservice-Matrix

Die Lösung enthält auch HAMi-Bereitstellungspraxis und zeigt den Wert von Compute-Virtualisierung in KI-Compute-Gateway-Szenarien.

### BroadWare Technology: GPU-Virtualisierung & Cluster-Management

Ou Binkai, Researcher bei BroadWare Technology, teilte die Entwicklungsreise der One-Click Deployment Platform (OCDP) der Innovationsabteilung von BroadWare.

In früher Modellinferenz und -training fand das BroadWare-Team bestehende Plattformen umständlich und unflexibel und entwickelte daher eine eigene One-Click-Deployment-Plattform.

**Kernschmerzpunkte & Lösungen:**

- **Speicherfragmentierung**: Unter Ganzkarten-Zuweisung verschwendeten kleine Modell-Inferenzen viel Speicher. Nach tiefer HAMi-Virtualisierungsintegration: feinkörnige GPU-Partitionierung und elastisches Scheduling, deutlich höhere Auslastung pro Karte
- **Monitoring-Blind spots**: GPU-Monitoring in virtualisierten Umgebungen war nicht intuitiv genug. Mit HAMi-Monitoring-Fähigkeiten: umfassende Sicht auf Ressourcennutzung

**Praxisergebnisse:**

- Durch tiefe HAMi-Integration wird komplexe unterliegende Rechenleistung als einfache, effiziente Cloud-Native-Services gekapselt
- Maximaler kommerzieller Wert von GPU-Assets, niedrigere KI-Deployment-Hürden für Nutzer
- Vollständiger Fähigkeitskreislauf „One-Click-Deployment + elastisches Scheduling + einheitliches Management“

## Zentrale Technologietrends

Das Meetup bündelte tiefe Einblicke mehrerer Branchenexperten. Mehrere Technologietrends traten hervor:

**GPU-Virtualisierung und Compute-Pooling werden unverzichtbar:** Von SF Technology bis China Merchants Bank teilten mehrere Unternehmen reale HAMi-Erfahrung zu GPU-Pooling und Virtualisierung. Der Kerndemand ist konsistent: GPU-Exklusivmodus brechen, Multi-Task-Multiplexing durch feinkörnige Partitionierung, Cluster-GPU-Auslastung von rund 40 % auf 90 % heben. Features wie Memory-Overcommit, Soft-Compute-Partitionierung und topologiebewusstes Scheduling sind Standardanforderungen in Produktion.

**Beschleunigte Adoption einheitlichen heterogenen Rechenmanagements:** Mehrere Chip-Anbieter – NVIDIA, Ascend, Enflame, Cambricon – umarmen aktiv das Cloud-Native-Ökosystem. HAMi maskiert Hardwareunterschiede über eine einheitliche Scheduling-Schicht. DRA ist die neue Richtung für heterogenes Rechenmanagement. Enflame zeigte Integration über standardisierte Cloud-Native-Interfaces, China Merchants Bank validierte den vollständigen Kreislauf für einheitliches Multi-Source-heterogenes Management.

**KI-Compute-Governance: von „nutzbar“ zu „gut genutzt“:** Sangfors Vortrag offenbarte eine neue Dimension unternehmensweiter KI-Compute-Governance – nicht nur Scheduling, sondern intelligentes Routing und Kostenkontrolle. Semantische Analyse für modellbezogene Compute-Optimierung wandelt jede Recheneinheit in messbaren Geschäftswert um.

## Video-Wiederholung

- **Bilibili:** [HAMi Community Meetup Shenzhen](https://www.bilibili.com/video/BV1Sqo6BBE2h/)
- **WeChat Video Channel:** HAMi Community

![Video-Wiederholung](/images/events/hami-meetup-shenzhen-recap/shenzhen-meetup-qrcode.png)

## Folien-Download

Die Speaker-Folien des HAMi Community Meetup Shenzhen sind im [HAMi Community GitHub](https://github.com/Project-HAMi/community/tree/main/hami-meetup/03-shenzhen-20260425) archiviert.

## Schlusswort

Compute-Effizienz ist keine Einzelfähigkeit – sie entsteht aus dem Zusammenspiel von Scheduling, Virtualisierung, Software-Stack und Business-Szenarien. Von der Cloud-Native-Evolution der KI-Infrastruktur über GPU-Pooling und einheitliches heterogenes Rechenmanagement bis zur intelligenten Weiterentwicklung der Compute-Governance zeigte dieses HAMi Meetup Shenzhen die technische Tiefe und Ökosystem-Vitalität der Community im heterogenen Compute-Scheduling.

Wir veröffentlichen vertiefte Rückblicksartikel für jeden Speaker mit Kern-Highlights und Praxis aus den Vorträgen. Wir freuen uns auf mehr HAMi-Nutzer, die ihre Praxisgeschichten teilen und die Community gemeinsam voranbringen!