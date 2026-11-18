---
title: >-
  【HAMi Projektteam | Anwendungsfall】Führendes Autonomes-Fahren-Unternehmen erreicht feingranulares GPU-Management und maximale Ressourcenauslastung mit HAMi
coverTitle: 'Anwendungsfall: HAMi GPU-Governance für Autonomes Fahren'
date: '2025-08-09'
excerpt: >-
  In zentralen Modelltrainings-Szenarien nutzt ein führendes Unternehmen für
  autonomes Fahren Multi-Maschinen-Distributed-Training mit Schedulern wie Ray
  und Volcano.
author: Dynamia AI Team
tags:
  - KubeCon
  - HAMi
  - GPU-Sharing
  - Cloud Native
  - Kubernetes
  - KI-Infrastruktur
category: Customer Success Story
coverImage: /images/blog/A-leading-autonomous-driving-company/cover2.jpg
linktitle: Autonomes Fahren Fallstudie
---

> Als aktives Open-Source-Projekt wird HAMi von über 350 Contributors aus mehr als 15 Ländern mitbetreut und ist in Produktionsumgebungen von über 120 Unternehmen und Institutionen im Einsatz — ein Beleg für Skalierbarkeit und Support.

## Nutzerprofil

In zentralen Modelltrainings-Szenarien nutzt ein führendes Unternehmen für autonomes Fahren Multi-Maschinen-Distributed-Training mit Frameworks wie Ray und Volcano. Parallel bietet es eine Cloud-Desktop-Umgebung für F&E, Test und Produktteams mit Remote-Arbeit und Modellentwicklung.

Im Cloud-Desktop-Cluster kann jeder Nutzer eine virtuelle Workstation mit GUI für Modellkompilierung, Offline-Daten-Replay oder leichte PyTorch-Experimente erstellen. Das Szenario ist ressourcensensibel; bei begrenzter GPU-Anzahl sind Scheduling und Auslastung Schlüsselfaktoren für stabilen Plattformbetrieb.

## Projekt-Herausforderungen

Wegen relativ weniger Grafikkarten im Cloud-Desktop-Cluster haben traditionelle Lösungen wie NVIDIA Time-Slicing, vGPU oder KubeVirt-GPU-Passthrough Grenzen bei Scheduling-Flexibilität und Kosten:

• **Begrenzte MIG-Granularität:** MIG unterstützt Partitionierung nur auf bestimmten High-End-Modellen mit festen Konfigurationen — wenig Flexibilität für diverse Geschäftsanforderungen.

• **Schwache Kompatibilität von Cloud-Lösungen:** Kernel-Virtualisierung (z. B. Alibaba cGPU, Tencent QGPU) erfordert strikte Kernel-Versionen, erschwert Multi-/Hybrid-Cloud und senkt Portabilität.

• **Grobes Time-Slicing:** NVIDIA Time-Slicing nutzbar, aber Isolation und Stabilität unzureichend für feingranulare Compute-Anforderungen.

• **Ressourcenverschwendung im Passthrough-Modus:** Volle Karte pro VM — bei Leichtlast Idle, geringe Gesamteffizienz.

Diese Grenzen erschwerten die Balance von Flexibilität und Kosten — Bedarf an einer effizienteren Lösung.

## Lösung

![GPU-Cluster-Architektur des führenden Autonomes-Fahren-Unternehmens](/images/blog/A-leading-autonomous-driving-company/p1.jpg)

Angesichts komplexer GPU-Scheduling-Anforderungen setzte das Unternehmen auf eine **HAMi + KubeVirt**-Hybridarchitektur für flexibles GPU-Management in der Cloud-Desktop-Plattform. Kerndesign:

**HAMi: Container-Level-GPU-Virtualisierung für bessere Auslastung**
HAMi übernimmt GPU-Scheduling in Containern mit bedarfsorientierter vGPU-Zuteilung. Remote-Desktop fühlt sich wie lokal an. Mit Ein-Karte-3×-Virtualisierung stieg die Auslastung deutlich und entlastete Compute-Kapazität.

**KubeVirt: Passthrough für High-Spec-Compute**
Training mit voller GPU-Leistung oder stärkerer Isolation nutzt KubeVirt-Passthrough — VMs mit exklusivem Zugriff auf physische Grafikkarten.

Nutzer wählen Container-Desktop oder GPU-Passthrough-VM; beide Modi teilen denselben GPU-Cluster. Knoten werden in zwei Pools für HAMi und KubeVirt geteilt, dynamische Zuteilung nach Task — maximale Ausnutzung jeder GPU.

## Warum HAMi?

Unter vielen GPU-Virtualisierungslösungen wurde HAMi aus folgenden Gründen gewählt:

![HAMi vGPU Deployment-Architektur](/images/blog/A-leading-autonomous-driving-company/p2.png)

1. **Präziser Fit fürs Szenario**
   Cloud-Desktop braucht primär Container-Isolation, kein komplexes Batch-Co-Scheduling. HAMis leichtgewichtiges Design passt; künftige Volcano-Integration möglich.

2. **Reife vCUDA-Technologie**
   Bewährte vCUDA-Virtualisierung, stabil im Betrieb, nur vereinzelt Scheduling-Probleme bei Host-Contention — über Erwartung hinaus stabil.

3. **Deutlich niedrigeres TCO**
   Keine High-End-Hardware-Beschränkung, kein zusätzlicher Kernel-Wartungsaufwand; gegenüber Eigenentwicklung deutlich weniger Dev- und Wartungsinvestition.

4. **Cloud-Native-Architektur**
   Kubernetes-native Scheduling-Erweiterungen und Device Plugin — schnelles Onboarding, freundliche Wartung, starkes Support vom Melon-Intelligence-Kernteam und der HAMi-Community.

5. **Zukunftssichere Heterogenität**
   Neben NVIDIA auch inländische GPUs — Raum für diversifizierte Compute-Infrastruktur.

## Ergebnisse und Nutzen

Mit **HAMi** und **Dual-Track-GPU-Architektur** wandelte sich das Cloud-Desktop-Szenario von Ressourcenkonkurrenz zu effizientem Scheduling:

![Optimierung der GPU-Ressourcenauslastung](/images/blog/A-leading-autonomous-driving-company/p3.png)

- **GPU-Auslastung von über 20 % auf 60–70 %, ca. 200 % Verbesserung:** Single-Card-Virtualisierung beseitigte Idle-Belegung.
- **Virtueller GPU-Pool 3× größer:** Engpass durch physische Kartenanzahl gelöst — F&E kann jederzeit Compute beantragen.
- **Deutliche Kostenoptimierung:** Gegenüber MIG (nur High-End, feste Schemas) flexible Feinpartitionierung auf mehr Modellen — voller Hardwarewert, weniger Nachkauf wegen Fragmentierung, niedrigeres TCO.

***„Früher monopolisierten wenige VMs GPUs, Deadlocks erforderten manuelle Koordination. Mit HAMi Single-Card-Multi-Container-Sharing unterstützt dieselbe Kartenanzahl dreimal so viele Desktops — F&E bekommt Compute jederzeit.“ — Senior R&D Engineer, AI Platform des Nutzerunternehmens***

## Ausblick

Mit wachsendem Geschäft erweitert das Unternehmen HAMi über Cloud-Desktops hinaus:

- **Integration von HAMi mit Ray und Volcano in Trainings-Clustern:**
  Bewertung der Einführung in den Modelltrainings-Cluster, Synergie mit verteilten Frameworks und Batch-Scheduling gegen Fragmentierung und Queues.
- **Einheitliches Scheduling heterogener Beschleuniger:**
  Wachsende Chip-Vielfalt erfordert einheitliches Management; HAMi unterstützt mehrere Gerätetypen und wird heterogene Beschleuniger weiter ausbauen.

## Fazit

Melon Intelligence und die HAMi-Community halfen dem Unternehmen, vom „Ressourcenstreit“ zur bedarfsorientierten Zuteilung im Cloud-Desktop zu kommen. HAMis Cloud-Native-DNA zeigt Potenzial auch für Training im Unternehmen. Bei fortlaufender Iteration autonomer Algorithmen wird dieser elastische Compute-Ansatz unverzichtbarer Teil der KI-Infrastruktur.

---

![HAMi Heterogen-Computing-Architektur](/images/blog/PREP-EDU-HAMi/p5.png)

Dynamia Melon Intelligence, mit dem CNCF-Projekt HAMi als Kern, bietet eine globale Lösung für flexible, zuverlässige, bedarfsorientierte und elastische GPU-Virtualisierung sowie heterogenes Compute-Scheduling und einheitliches Management — plug-and-play, leichtgewichtig und nicht-intrusiv in Public, Private oder Hybrid Cloud, mit Unterstützung für NVIDIA, Ascend, Metax, Cambricon, Hygon, Moore Threads, Tianshu Zhixin u. a.

>Website: <https://dynamia.ai>
>E-Mail: <info@dynamia.ai>