---
title: "8 Modelle pro GPU, ¥200.000 monatlich gespart: Wie Sangfor mit K8s + Volcano + HAMi jede GPU ausschöpft"
coverTitle: "Sangfor CNCF Case Study"
date: '2026-09-20'
excerpt: >-
  Die KI-Plattform eines 2.000-köpfigen Engineering-Teams kaufte GPUs, während
  Hardware brachlag. Mit Kubernetes + Volcano + HAMi mehr als verdreifachte
  Sangfor die GPU-Auslastung, packte 8+ Modelle auf eine GPU und halbierte
  externe Modellkosten auf ¥200.000 pro Monat.
author: Dynamia
tags:
  - HAMi
  - CNCF
  - Sangfor
  - GPU-Sharing
  - vGPU
  - Volcano
  - Kubernetes
  - Case Study
  - KI-Infrastruktur
category: Case Study
language: de
linktitle: Sangfor CNCF Case Study
coverImage: "/images/blog/sangfor-cncf-case-study/architecture.png"
---

> Eine KI-Plattform für 2.000 Engineers kaufte GPUs im Eiltempo — während Rechenleistung ungenutzt blieb. Nach dem Rebuild mit Kubernetes + Volcano + HAMi: GPU-Auslastung mehr als verdreifacht, 8+ Modelle pro GPU, externe Modellkosten von ¥400.000 auf ¥200.000 pro Monat. Wie ging das?

## 01 Sangfors GPU-Problem: mehr Karten, schlechtere Auslastung

Sangfor ist ein führender Anbieter für Enterprise-Cloud und Cybersicherheit in China. Mit wachsenden KI-Anwendungen baut das Unternehmen eine einheitliche KI-Compute-Plattform für interne R&D und Kunden — KI-Coding, digitale Mitarbeiter, intelligenter Kundenservice, Sales-Agents, Unternehmens-Wissensassistenten.

Beim Skalieren traten drei Probleme zutage.

**Inferenz belegte ganze GPUs; die meiste Hardware stand still.** Im klassischen Modell hält ein Inferenzdienst eine komplette GPU exklusiv. Viele Workloads nutzen nur einen Bruchteil von VRAM und Compute — typisch kleine Modelle mit 15–20 % VRAM, über 80 % idle. Fragmentierung verschärfte sich: Kapazität wuchs schneller als das Business.

**Komplexe Governance im Multi-Tenant-Betrieb.** Verschiedene Teams, unterschiedliche GPU-Anforderungen: dauerresidentes Memory vs. Peak-Valley-Traffic. Einheitlicher Pool und Quoten wurden unvermeidlich.

**Inferenz und Batch koexistieren.** Online-Inferenz, Batch, verteiltes Training und Agent-Workflows auf einer Plattform — mehr als natives Kubernetes-GPU-Scheduling leisten kann.

## 02 Erst die Kennzahlen

Sangfor baute eine produktionsreife Shared-GPU-Plattform auf Kubernetes, Volcano und HAMi — Kubernetes als einheitliche KI-Ressourcen-Control-Plane.

| Kennzahl | Vorher | Nachher |
|-|-|-|
| GPU-Auslastung | Basis | >3× |
| Modelle pro GPU | 1 | 8+ |
| Externe Modellkosten | ¥400K/Monat | ¥200K/Monat |
| Recovery nach Modellausfall | ~1 h | <10 Min. |
| Erfolgsrate bei 3× Peak-Traffic | instabil | 95 %+ |
| Unterstützte R&D | begrenzt | 2.000+ Engineers |

So kamen sie dahin.

## 03 Warum HAMi

> „HAMis Kubernetes-native Integration bedeutet null Migrationskosten. Transparente Device-Virtualisierung — Workloads laufen unverändert.“
>
> — Jia Haojie, Chief Architect Cloud AI, Sangfor

Kubernetes liefert die Control Plane, natives GPU-Scheduling verteilt nur ganze Karten — unzureichend für Inferenz, Multi-Tenant und Heterogenität. Sangfor trennt: **Volcano** für Advanced Scheduling, **HAMi** für GPU-Virtualisierung.

Drei Gründe für HAMi:

- **GPU-Sharing** — Speicherquoten auf MiB-Ebene, Compute-Slicing bis 1 %, starke Isolation bei mehreren Pods pro GPU;
- **Heterogene GPUs** — einheitliche Abstraktion, konsistentes Scheduling über Generationen;
- **Aktives Open Source** — eines der aktivsten vGPU-Projekte im Kubernetes-Umfeld, Integration mit Volcano-Queues und vLLM.

## 04 Architektur: ein Request-Pfad + ein Compute-Fundament

![Sangfor-Architektur: Data Plane und Component Architecture](/images/blog/sangfor-cncf-case-study/architecture.png)

Zwei Ebenen. **Data Plane**: Anwendungen über AI Computing Gateway (Routing, Governance, Security) zur Modellschicht. **Component Architecture**: Volcano für Job-Scheduling, HAMi für Virtualisierung/Sharing/Isolation, Kubernetes für Nodes und Device Plugins, unten heterogene GPUs (NVIDIA, Ascend). Ende-zu-Ende von Request bis Compute.

## 05 GPU-Pooling: von einer-Karte-ein-Modell zu Groß/Klein-Co-Location

Der sichtbarste Schritt. Vorher Dedicated — eine Karte, ein Modell:

![GPU-Pooling vorher/nachher](/images/blog/sangfor-cncf-case-study/gpu-pooling.png)

vGPU-Slicing brachte:

- **Co-Location groß/klein**: Großmodell z. B. 70 % der Karte, Rest für mehrere kleine Modelle;
- **Dichte kleiner Modelle**: 8× und mehr Instanzen pro Karte, weniger Hardware-Bedarf.

Ergebnis: Auslastung >3×, Modell-Dichte >8× pro Karte.

## 06 Volcano × HAMi: klare Rollen

Sharing allein reicht nicht — Device-Management, Quoten, Orchestrierung. Volcano + HAMi:

- **Device-State** — Health-Monitoring, Fault-Isolation, Reclaim;
- **Resource-Deklaration** — Auto-Fill, einheitliche Quoten, frühes Ablehnen ungültiger Requests;
- **Scheduling-Transaktionen** — Trial vs. tatsächliche Belegung entkoppelt;
- **Gang & LWS** — Volcano orchestriert, HAMi alloziert GPUs, Gruppe gemeinsam scheduled.

**Volcano entscheidet wann und wo; HAMi wie GPU-Ressourcen geteilt werden.** Entkoppelt, unabhängige Evolution.

## 07 Hinter den Zahlen

**Weniger Karten.** vGPU-Slicing, on-demand Memory/Compute, gemeinsamer Pool — Inferenz von 3 auf 1–2 GPUs.

**Geringere Kosten.** Smart Routing: einfache Fragen zu günstigen Modellen, komplexe zu Premium — von ¥400K auf ¥200K/Monat bei Guardrails.

**Stabiler.** Recovery ~1 h → <10 Min.; 3× Stress mit >95 % Erfolg; Health-Monitoring hält defekte GPUs aus dem Scheduling.

**Größerer Maßstab.** AI-Coding, Enterprise-Agents, Kundenservice, digitale Mitarbeiter — 2.000+ Engineers.

## 08 Drei übertragbare Lehren

**Erst teilen, dann skalieren.** Inferenz füllt selten eine ganze GPU — Sharing vor Hardware-Kauf.

**Scheduling von Virtualisierung trennen.** Sharing ohne Scheduling schlecht platziert; Scheduling ohne Virtualisierung nichts zu schedulen. HAMi Abstraktion, Volcano Policy.

**Kubernetes wird KI-Ressourcen-Control-Plane.** K8s + Volcano + HAMi ohne neues Management-Paradigma.

## 09 Nächste Schritte mit der Community

- HAMi-DRA-Ökosystem für Kubernetes-natives GPU-Management;
- heterogene GPUs (Ascend u. a.) über HAMi;
- Produktions-Policies und Ops-Best-Practices zurück an Volcano und HAMi.

## 10 Über HAMi

HAMi ist CNCF Incubating und Open-Source-Middleware für GPU-Virtualisierung — Sharing, Isolation, Scheduling heterogener Beschleuniger. NVIDIA, AMD, Ascend, Cambricon, Hygon, Moore Threads, Iluvatar, Enflame, Kunlunxin, MetaX, AWS Neuron u. a.

- **Website**: https://project-hami.io
- **HAMi GitHub**: https://github.com/Project-HAMi/HAMi
- **Volcano GitHub**: https://github.com/volcano-sh/volcano
- **Community**: Discord, Slack #hami-dev, Bi-Weekly — https://project-hami.io/community

---

**Fallstudie von Dynamia AI und Sangfor, CNCF: [Sangfor Builds an Enterprise AI Compute Platform on Kubernetes, Volcano, and HAMi](https://www.cncf.io/case-studies/sangfor/).**