---
title: 'DaoCloud: Flexiblere GPU-Cloud mit HAMi'
date: '2026-01-13'
excerpt: >-
  Angesichts wachsender Nachfrage nach KI-Training und -Inferenz setzt DaoCloud
  das CNCF-Sandbox-Projekt HAMi in Public- und Private-GPU-Clouds ein, um
  cloud-native, flexibles GPU-Ressourcenmanagement aufzubauen.
author: Dynamia
tags:
  - DaoCloud
  - HAMi
  - Case Study
  - GPU-Cloud
  - vGPU
category: Customer Success Story
language: de
coverImage: /images/blog/daocloud-hami-gpu-platform/daocloud-product-lines.png
linktitle: DaoCloud GPU-Plattform
---

Angesichts anhaltend wachsender Nachfrage nach KI-Training und -Inferenz sind höhere GPU-Auslastung, geringere Compute-Kosten und vielfältige Szenarien zentrale Herausforderungen für Cloud-Plattformen.

**DaoCloud** nutzt das CNCF-Sandbox-Projekt **HAMi** in Public- und Private-GPU-Clouds für ein flexibleres, cloud-natives GPU-Ressourcenmanagement. Basierend auf Produktionserfahrung skizziert dieser Artikel Ansatz, Rollout und Ergebnisse beim Einsatz von HAMi.

## Unternehmen und Produkte: parallele Public- und Private-GPU-Plattform

DaoCloud betreibt zwei Kernproduktlinien mit hohem Anteil an KI-Training und -Inferenz.

![DaoCloud-Produktlinien](/images/blog/daocloud-hami-gpu-platform/daocloud-product-lines.png)

**Compute Cloud (d.run)** ist DaoClouds öffentlicher GPU-Cloud-Dienst für Einzelentwickler und KMU. Nutzer kaufen GPU-Rechenleistung on demand. Für Self-Service und schnelle Bereitstellung gilt ein leichtgewichtiges Berechtigungsmodell mit einheitlichem SKU-System.

**DaoCloud Enterprise (DCE)** ist eine private Container-Plattform für Unternehmen. Nach GPU-Beschaffung im eigenen Rechenzentrum brauchen Teams eine einheitliche Verwaltung und Zuteilung. DCE basiert auf standardisiertem Kubernetes mit Multi-Tenant-Isolation, Quoten auf Abteilungs- und Queue-Ebene, RBAC und einem gemeinsamen Compute-Pool für internes KI-Training und -Inferenz.

## Engineering-Hintergrund: Auslastung und Management-Komplexität

Vor HAMi bestanden typische Probleme im GPU-Betrieb.

In der Compute Cloud werden GPUs meist als ganze Karten zugewiesen. Inferenz und leichte Tasks nutzen oft nur einen Bruchteil von Compute und VRAM — niedrige Gesamtauslastung, eingeschränkte flexible SKUs.

In DCE müssen GPUs zwischen Abteilungen, Projekten und Queues geteilt werden. Einheitliches Scheduling bei Isolation und Quoten stellt hohe Anforderungen.

Zudem wachsen mit verschiedenen NVIDIA- und heimischen GPU-Modellen die Heterogenität und der Aufwand für einheitliches Management und Scheduling.

## Warum HAMi: cloud-native, herstellerunabhängige GPU-Abstraktion

Beim GPU-Trainingsplattform-Build startete DaoCloud von **den Fragen der Nutzer**:

- Stabilität der Trainingsjobs und vorhersagbare Performance
- Code-Änderungen beim GPU- oder Cluster-Wechsel?
- Verständliche Erklärungen bei Performance-Problemen?

Die Plattform braucht eine GPU-Abstraktion, die **oben Hardware-Unterschiede maskiert und unten transparent bleibt**.

**HAMi bietet herstellerunabhängige GPU-Abstraktion**, sodass dieselben Trainingsjobs auf NVIDIA- und heimischen GPUs konsistent laufen — ohne Bindung an Hardware und Lizenzmodelle, mit deutlich geringeren Migrations- und Expansionskosten.

HAMis cloud-native Design integriert GPUs wie CPU und RAM in Kubernetes-Scheduling.

Für Nutzer heißt das:

- Kein tiefes Verständnis von GPU-Virtualisierung nötig
- Konsistenteres Training über Skalen und Knoten
- Plattform-Upgrades brechen bestehende Workflows nicht

## Lösung: HAMi in der DaoCloud-Plattform

In **d.run** integriert DaoCloud HAMi pro Region in Kubernetes-Cluster für vGPU-Segmentierung und kontrollierte Überbuchung. Physische GPUs werden in vGPU-Spezifikationen geteilt und per SKU angeboten — Nutzer zahlen nicht zwangsläufig für ganze Karten.

In **DCE** dient HAMi als einheitliche GPU-Abstraktion und bündelt verstreute GPUs in einen gemeinsamen Pool. vGPU-Ressourcen sind mit Quoten und RBAC verzahnt für Abteilungs- und Queue-Kontrolle; für Algorithm Engineers bleibt die Hardware im Hintergrund.

Im Betrieb fließt Feedback zu Überbuchung, Scheduling-Grenzen und Heterogenität zurück in die Community; Code und Validierung treiben HAMi weiter.

## Zahlen und quantifizierte Ergebnisse

Aktuell betreibt **d.run sieben aktive Regionen** in Festlandchina und Hongkong, **10+ Rechenzentren**.

Mit HAMi, vGPU-Segmentierung und kontrollierter Überbuchung stieg die Effizienz deutlich. Erfahrung aus d.run und DCE:

- **Durchschnittliche GPU-Auslastung über 80 %**
- **Gesamtbetriebskosten GPU-bezogen ca. 20–30 % niedriger**
- Modulare cloud-native Architektur **verkürzt Rollout neuer Regionen/Cluster**; GPU-SKU-Prozesse sind standardisierter

Die Spanne variiert je nach Region und Last. In den meisten Produktionsszenarien liegen **stabile 70–80 %+**; mit wachsendem Anteil an Inferenz und leichten Tasks verstärken sich Kosteneffekte.

## Aktuelles

Auf dem HAMi Meetup Shanghai teilte DaoCloud-Produktleiter **Lu Chuanjia**:

> „In der SaaS-GPU-Cloud ist die Herausforderung nicht nur ‚GPUs nutzen‘, sondern unter hoher Volatilität und Concurrency den Wert jeder Karte freizusetzen. vGPU-Slicing, Compute-Ratios und Scheduling von HAMi ermöglichen echtes Pooling und Fine-Grained-Betrieb im Cloud-Native-Sinne.
>
> Für d.run ist HAMi nicht nur Scheduling-Komponente, sondern Grundlage für skalierbaren Compute-Cloud-Betrieb: höhere Wiederverwendung bei SLA-Garantie und Flexibilität für Multi-Region- und Multi-Hardware-Expansion.“