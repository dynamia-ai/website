---
title: 'China Merchants Bank baut heterogene Compute-Infrastruktur mit HAMi: 100 % GPU-Pooling, 30 % weniger Cross-Node-Scheduling'
date: '2026-05-07'
excerpt: >-
  China Merchants Bank errichtete auf HAMi eine einheitliche heterogene Compute-Infrastruktur:
  Super-Node-Dual-Chip-Modul (100 % GPU-Pooling), vNPU-Core-Software-Partitionierung (1 GB VRAM /
  1 % Compute), dreistufiges topologie-bewusstes Scheduling (30 % weniger Cross-Node). Die Lösungen
  wurden an die HAMi-Open-Source-Community zurückgegeben.
author: Dynamia
tags:
  - HAMi
  - China Merchants Bank
  - GPU-Virtualisierung
  - Heterogenes Compute-Scheduling
  - Super Node
  - Software-Partitionierung
  - Topologie-bewusstes Scheduling
  - Cloud Native
  - KI-Infrastruktur
category: Customer Success Story
coverImage: /images/blog/cmb-hami-heterogeneous-computing/speaker-suxi.webp
linktitle: 'CMB heterogene Compute-Infrastruktur mit HAMi'
---

Das HAMi Community Meetup Shenzhen, initiiert von der HAMi-Community und ausgerichtet von Dynamia AI, fand am 25. April 2026 erfolgreich statt. Dies ist der vierte Artikel der Shenzhen-Recap-Serie. Su Xi von China Merchants Bank berichtete über den Aufbau einer heterogenen Compute-Infrastruktur für die Finanzbranche — Super-Node-Hardware-Anpassung, vNPU-Core-Software-Partitionierung und netzwerktopologie-bewusste Scheduling-Algorithmen.

**Kernpunkte:**

- Super-Node-Dual-Chip-Modul-Anpassung mit 100 % GPU-Pooling, keine Cross-Module-Treiberfehler
- vNPU-Core: 1 GB VRAM / 1 % Compute Feingranularität
- Dreistufiges topologie-bewusstes Scheduling: Cross-Node-Wahrscheinlichkeit −30 %
- Deterministisches Hashing gegen Task-Fragmentierung
- Rückgabe an die HAMi-Community — von „nutzbar“ zu „effizient nutzbar“

**Speaker:** Su Xi (Entwickler, China Merchants Bank)

![Su Xi - China Merchants Bank](/images/blog/cmb-hami-heterogeneous-computing/speaker-suxi.webp)

## Video und Folien

- **Bilibili:** [Heterogeneous AI Compute Scheduling Optimization with HAMi - Su Xi](https://www.bilibili.com/video/BV1MfozBvEsS/)
- **Folien:** [GitHub](https://github.com/Project-HAMi/community/blob/main/hami-meetup/03-shenzhen-20260425/heterogeneous-ai-scheduling-hami-suxi.pdf)

## 1. Besondere Herausforderungen heterogener Compute in Finanzdienstleistungen

Die Kernherausforderung der China Merchants Bank ist **Diversifikation des Compute-Pools**:

- Mehrere GPU-/NPU-Modelle koexistieren → starke Fragmentierung
- Unterschiedliche Geschäftslinien (Risiko, Kundenservice, Research) mit sehr verschiedenen Compute-Bedarfen
- Finanz-Workloads verlangen höchste Stabilität und Sicherheitsisolation
- Betriebskosten steigen mit wachsender heterogener Infrastruktur

Auf Basis von HAMi baute CMB eine einheitliche heterogene Infrastruktur für optimiertes Management und Scheduling mehrerer Chiptypen.

![Warum CMB HAMi wählte](/images/blog/cmb-hami-heterogeneous-computing/cmb-choose-hami.webp)

## 2. Super-Node-Hardware-Anpassung: Dual-Chip-Modul

### Was ist ein Super-Node?

Super-Nodes kombinieren mehrere Chips per Hochgeschwindigkeitsinterconnect zu einer logischen Einheit. CMB nutzt **Dual-Chip-Module (DCM)** mit mehreren Compute-Karten pro Modul.

![Super-Node-Anpassung: Bedeutung und Wert](/images/blog/cmb-hami-heterogeneous-computing/super-node-value.webp)

### Probleme des nativen Ansatzes

Mit dem nativen Kubernetes-Scheduler:

- **Ungerade Kartenanzahl** kann zwei Module überspannen → Treiberfehler
- **Cross-Module-Kommunikation** deutlich langsamer als innerhalb des Moduls
- **Niedrige Pooling-Rate** durch fehlalignierte Zuteilung

### HAMi-Lösung

Erweiterung von Device Plugin und Scheduler für Modul-Topologie und Paar-Zuteilung:

- Scheduler kennt Modultopologie, Karten im selben Modul
- Keine Treiberfehler durch ungerade Cross-Module-Zuteilung
- **Pooling-Rate 100 %**

![Super-Node Design Teil 1](/images/blog/cmb-hami-heterogeneous-computing/super-node-adapter-1.webp)

![Super-Node Design Teil 2](/images/blog/cmb-hami-heterogeneous-computing/super-node-adapter-2.webp)

### Ergebnisse

Der native Scheduler kennt keine GPU-Physik-Topologie. HAMi bringt Modul-Bewusstsein und Constraints — von logischer zu physisch konsistenter Zuteilung.

- **Höhere Compute-Auslastung**, Pooling **100 %**
- **Stabilere Tasks**, keine Odd-Card-Cross-Module-Crashes
- **Bessere Kommunikation** durch Topologie-freundliche Platzierung

Open Source: erste feingranulare Scheduling-Implementierung für heimische Beschleuniger im Super-Node-Modell, Topology-aware Scheduling Primitive.

![Super-Node Ergebnisse](/images/blog/cmb-hami-heterogeneous-computing/super-node-results.webp)

## 3. vNPU-Core: 1 GB VRAM / 1 % Compute

![GPU-Partitionierungsvergleich](/images/blog/cmb-hami-heterogeneous-computing/gpu-partition-comparison.webp)

Für kleine/mittlere Fine-Tuning- und Inferenz-Tasks nutzt CMB HAMi VNPU Core zur Software-Partitionierung.

### Technik

![HAMi-vNPU-Core-Architektur](/images/blog/cmb-hami-heterogeneous-computing/vnpu-core-arch.webp)

API-Intercept im Userspace, **Token-Bucket** und Shared Memory:

- Token-Bucket: Compute-Quote pro Task
- Shared Memory: feingranulare VRAM-Partitionierung

### Granularität

- Mind. **1 GB VRAM** und **1 % Compute** pro Partition

Wichtig für Banking: viele Risiko- und Service-Modelle brauchen keine ganze Karte.

## 4. Netzwerktopologie-bewusstes Scheduling

![Dreistufige Topologie](/images/blog/cmb-hami-heterogeneous-computing/topology-3layer.webp)

Verteiltes Training: zufällige Verteilung über Leaf-Switches erzeugt Cross-Switch-Engpässe — Co-Optimierung von Compute und Netzwerk nötig.

### Drei Ebenen

```plaintext
Level 1: Same Node          — niedrigste Latenz
Level 2: Same LEAF Switch   — geringere Latenz
Level 3: Cross LEAF Switch  — höchste Latenz
```

![Adaptiver Topologie-Scheduler](/images/blog/cmb-hami-heterogeneous-computing/topology-scheduling-algo.webp)

Scoring in der Scheduler-Phase → **Cross-Node-Wahrscheinlichkeit −30 %**.

### Anti-Fragmentierung

Deterministisches Hashing auf Controller-UIDs — Pods derselben Charge bevorzugt auf demselben Knoten.

### Gesamt

- Pooling **100 %**
- Cross-Node **−30 %**
- Granularität **1 GB / 1 %**
- Deutlich weniger Fragmentierung

## 5. Zusammenfassung

![Ausblick](/images/blog/cmb-hami-heterogeneous-computing/summary.webp)

Su Xi zeigte CMBs Weg auf HAMi: Super-Node-Anpassung (**100 % Pooling**), vNPU-Core (**1 GB / 1 %**), dreistufiges Topologie-Scheduling (**−30 % Cross-Node**). Die Kette Hardware → Partitionierung → Scheduling hebt heterogene Compute von „nutzbar“ auf „effizient nutzbar“. Rückgabe an HAMi spiegelt den Übergang von „Nutzer“ zu „Mitgestalter“ in der KI-Infrastruktur.

Ausblick: feinere, elastischere Scheduling-Standards über das HAMi-Ökosystem.