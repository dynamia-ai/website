---
title: >-
  PREP EDU | HAMi: Südostasiens vielversprechendes AI-EdTech-Unternehmen baut
  mit HAMi eine effiziente GPU-Inferenzplattform
linktitle: Prep Education × HAMi
coverTitle: 'PREP EDU × HAMi: AI-Workloads in Südostasien skalieren'
date: '2025-08-08'
excerpt: >-
  Im schnell wachsenden Bereich AI-gestützter Bildung rückt PREP EDU (prepedu.com)
  in Südostasiens EdTech-Sektor ins Zentrum.
author: Dynamia AI Team
tags:
  - KubeCon
  - HAMi
  - GPU Sharing
  - Cloud Native
  - Kubernetes
  - AI Infrastructure
category: Customer Success Story
coverImage: /images/blog/PREP-EDU-HAMi/cover2.jpg
---

> HAMi ist ein aktives CNCF-Open-Source-Projekt, initiiert und geführt von Melon Intelligence (Dynamia), mit über 350 Mitwirkenden aus mehr als 15 Ländern und Produktionsadoption bei über 120 Unternehmen und Institutionen.

![Architekturüberblick PREP EDU AI-Bildungsplattform](/images/blog/PREP-EDU-HAMi/p1.png)

Im Bereich AI-Bildung rückt PREP EDU (prepedu.com) in Südostasiens EdTech-Sektor ins Zentrum.

Gegründet 2020 mit Sitz in Hanoi, Vietnam, steigert das Unternehmen Effizienz und Lernerlebnis bei Sprachenlernen und Prüfungsvorbereitung durch KI. **Hunderttausende Lernende** verbesserten über die Plattform Prüfungsergebnisse bei **IELTS, TOEIC, HSK und der vietnamesischen THPT Quốc gia**.

2024 schloss PREP EDU eine **Series-A-Runde über 7 Millionen US-Dollar** mit Investoren wie **Cercano Management, East Ventures und Northstar Ventures** ab.

Hinter der Plattform steht ein heterogener GPU-Cluster; für intelligente Orchestrierung und Stabilität nutzt PREP EDU **HAMi** (CNCF Sandbox).

## Unternehmensprofil

Ziel: Prüfungsvorbereitung mit KI neu gestalten. Produkte u. a.:

- **Internationale Sprachprüfungen**: IELTS, TOEIC, HSK;
- **Nationale Prüfungen**: vietnamesisches Abitur (THPT Quốc gia);
- **AI Virtual Classroom**: Echtzeit-Bewertung für Schreiben und Sprechen;
- **Teacher Bee AI Tutor**: 24/7-Lernberatung, Aussprache, Fehleranalyse;
- **Web + App**: synchroner Lernfortschritt, multi-device.

Expansion nach **Indonesien und Philippinen**; Auszeichnungen wie EdTech Asia Innovation Award und SEI Intelligent Education Initiative Award.

### Engineering-Hintergrund

**AI-Inferenzplattform auf Kubernetes (RKE2 als Distribution)**, GPUs vor allem **RTX 4070 und RTX 4090**.

![PREP EDU GPU-Cluster mit RTX 4070 und 4090](/images/blog/PREP-EDU-HAMi/p2.png)

Vor HAMi:

- GPU Operator wies nach Maximalbedarf zu — oft nur 10–20 % Auslastung;
- gemeinsame GPU: VRAM 90–95 % voll → Abstürze;
- keine GPU-Typ-Zuweisung nach Projektanforderung.

### Lösung: HAMi bei PREP EDU

Nach Evaluierung der NVIDIA-Virtualisierung wählte PREP EDU **HAMi**:

- Speicher und Compute nach NLP-Token-Länge oder Worker-Bedarf;
- GPU-Typ per Annotation (z. B. nur RTX 4070 oder 4090);
- Zuweisung per GPU-UUID;
- Kompatibilität mit GPU Operator (containerd und RKE2);
- Prometheus Monitoring und Alerting;
- neue Nodes automatisch von HAMi verwaltet.

DevOps erprobte HAMi auch in Docker für Sonder-Runtimes.

![HAMi Docker-Deployment-Architektur](/images/blog/PREP-EDU-HAMi/p3.png)

### Ergebnisse

- **1+ Jahr** stabiler Produktionseinsatz;
- **90 %** der GPU-Infrastruktur mit HAMi optimiert;
- **50 %** weniger Ops-Schmerzpunkte im GPU-Management.

![HAMi Produktionsergebnisse und Metriken](/images/blog/PREP-EDU-HAMi/p4.png)

>„HAMi ist eine starke Option für vGPU-Scheduling und hilft, GPU-Nutzung für unsere AI-Microservices zu optimieren. Monitoring und Alerting sind für Langzeit-Tracking sehr hilfreich. Die Dokumentation ist klar; die Zuweisung zu bestimmten GPU-Typen ist für uns ein großer Vorteil.“ — **Xeus Nguyen, DevOps Engineer, PREP EDU**

> „HAMi ermöglicht präzise Speicher- und Compute-Zuweisung pro Projekt und optimiert die Gesamtauslastung — mehr AI-Services auf begrenztem VRAM.“ — **Nhan Phan, AI Engineer, PREP EDU**

>„HAMi half uns, GPU-Management für On-Premise-AI-Microservices zu automatisieren und Wartung zu reduzieren — deutlich bessere Effizienz mit minimalem Teamaufwand.“ — **Phong Nguyen, AI Engineer, PREP EDU**

>„HAMi hat unseren AI-Engineering-Workflow verändert: Virtualisierung und Right-Sizing auf Pod-Ebene — leichte Inferenz und große Batch-Jobs auf derselben Hardware ohne Noisy-Neighbor-Probleme. Deployment praktisch Plug-and-Play — Helm Chart und wenige Labels, bestehende Manifests unverändert.“ — **Vu Hoang Tran, AI Engineer, PREP EDU**

Technischer Deep-Dive von Xeus Nguyen: <https://wiki.xeusnguyen.xyz/Tech-Second-Brain/Personal/Kubewekend/Kubewekend-Session-Extra-2#setup-gpu-worker>

---

![HAMi heterogene Compute-Unterstützung](/images/blog/PREP-EDU-HAMi/p5.png)

Dynamia (Melon Intelligence) liefert auf Basis von CNCF HAMi flexible, zuverlässige, bedarfs- und elastische GPU-Virtualisierung sowie heterogenes Scheduling — pluggable in Public, Private und Hybrid Cloud, mit NVIDIA, Ascend, MetaX, Cambricon, Hygon, Moore Threads, Tianshu Zhixin u. a.