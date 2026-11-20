---
title: 'NPUs einfacher teilen: Evolution von HAMi vNPU und Produktionspraxis der China Merchants Bank'
date: '2026-07-30'
excerpt: >-
  Am 25. Juli fand das CMB Digital Intelligence Innovation Meetup in Hangzhou statt. HAMi-Approver und Dynamia-Ingenieur Wang Jifei sprach über „NPUs einfacher teilen“. Dieser Beitrag fasst die Evolution von HAMi vNPU von Hard- zu Soft-Partitionierung und die gemeinsame Validierung mit der China Merchants Bank in Produktion zusammen.
author: Dynamia AI Team
tags:
  - HAMi
  - Meetup
  - vNPU
  - Ascend
  - Heterogenes Scheduling
  - Cloud Native
category: Community & Events
coverImage: /images/blog/hami-vnpu-cmb-meetup-hangzhou-recap/slide-cover-en.png
linktitle: HAMi vNPU Evolution & CMB-Praxis
---

Am 25. Juli brachte das **CMB Digital Intelligence Innovation Meetup, Hangzhou** technische Gäste aus Finanzinstituten, Cloud-Anbietern, Open-Source-Communities und KI-Infrastruktur zusammen – zu domestic Compute, cloud-nativer Inferenz und Ressourcen-Scheduling. Die **HAMi-Community** war eingeladen; Approver und Dynamia-(密瓜智能)-Entwickler **Wang Jifei** hielt *„NPUs einfacher teilen: Evolution von HAMi vNPU und Produktionspraxis der China Merchants Bank“*.

![Wang Jifei zu HAMi vNPU beim CMB Digital Intelligence Innovation Meetup Hangzhou](/images/blog/hami-vnpu-cmb-meetup-hangzhou-recap/wang-jifei-speaking.png)

Kern des Vortrags war nicht ein einzelnes Feature, sondern der rote Faden: wie HAMi vNPU von „fester Hard-Partitionierung“ zu „bedarfsorientierter Soft-Partitionierung“ kam und gemeinsam mit der China Merchants Bank (CMB) in Finanzproduktion reifte. Dieser Beitrag fasst Vortrag und Folien zu einem technischen Rückblick zusammen.

Vollständige Folien (PDF): [hami-vnpu-cmb-practice-wangjifei-20260725.pdf](https://github.com/Project-HAMi/community/blob/main/talks/03-cmb-meetup-hangzhou-20260725/hami-vnpu-cmb-practice-wangjifei-20260725.pdf)

> NPU-Sharing bewegt sich von „funktioniert“ zu „funktioniert gut“ – Soft-Partitionierung lässt eine geteilte NPU in Kubernetes einheitlich entdecken, schedulen und steuern.

## 1. Vom „Compute besitzen“ zum „Compute gut nutzen“

Mit wachsenden Training-, Inferenz- und R&D-Test-Workloads werden GPUs und NPUs verschiedener Anbieter siloartig verwaltet; kleine Aufgaben, die ganze Karten blockieren, werden schmerzhafter. Der Fokus der Enterprise-KI-Infrastruktur verschiebt sich vom Besitz zur effizienten Nutzung. Compute muss nicht nur angebunden, sondern partitioniert, geteilt, geschedult und governed werden – genau das Problem, das HAMi vNPU lösen soll.

## 2. Community–CMB-Zusammenarbeit: Bedarf, Technik, Validierung

![HAMi-Community–CMB-Kollaborationsschleife: Kontakt → Projekt → gemeinsame Validierung](/images/blog/hami-vnpu-cmb-meetup-hangzhou-recap/community-cmb-collaboration-en.png)

Der erste Teil rekapitulierte die Partnerschaft zwischen HAMi-Community und CMB. Nicht einmalige Lieferung, sondern geschlossener Kreislauf: langfristiger Kontakt über Community-Outreach, reale Projekte (Muxi, Kunlunxin, Ascend bei CMB) zur Erfassung heterogener Compute-Anforderungen, Community-Implementierung in reale Umgebungen zur gemeinsamen Validierung.

In dieser Schleife ist CMB Nutzer und wichtiger Input für Community-Iteration – reale Constraints, Prioritäten und UX aus heterogenen Szenarien, Hilfe bei der Bewertung, welche Fähigkeiten Produktion prägen, Vermeidung von Entwicklung im luftleeren Raum, Bereitstellung von Geräten und Umgebungen für Kompatibilität, Stabilität und Nutzbarkeit.

> Echte Produktionsbedarfe sind der wertvollste Input für eine Open-Source-Community; CMB ist vom Nutzer zum Co-Builder der Community gewachsen.

## 3. Evolution von vNPU: von Hard- zu Soft-Partitionierung

### Hard-Partitionierung: funktioniert, aber wenig flexibles Sharing

![Drei Grenzen der Hard-Partitionierung: uneinheitliche Specs, feste Templates, gebundene Ressourcen](/images/blog/hami-vnpu-cmb-meetup-hangzhou-recap/hard-partition-limitations-en.png)

Frühes NPU-Sharing nutzte vendor-definierte Hard-Partitionierung. Verschiedene Modelle unterstützen feste Partitionstypen (manche vier-, andere siebenteilige Aufteilung); die Zuteilung wirkt präzise, bleibt aber an feste Grenzen gebunden. Wang Jifei fasste drei Punkte zusammen:

- **Uneinheitliche Specs**: Cross-Model-Erfahrung schwer vereinheitlichbar; Ops und Scheduling müssen pro Gerät anpassen.
- **Feste Templates**: Nur vordefinierte Kombinationen; Workloads können nicht elastisch an Nachfrage anpassen.
- **Gebundene Ressourcen**: Compute- und Speichergrenzen gekoppelt, Ausrichtung meist über Speicher – deckelt Auslastung.

### Warum Soft-Partitionierung lange blockiert war: Low-Level-APIs

![Soft-Partitionierung durch APIs blockiert: GPU-Pfad abfangbar, NPU-Pfad damals nicht steuerbar](/images/blog/hami-vnpu-cmb-meetup-hangzhou-recap/soft-partition-api-blocked-en.png)

Warum nicht einfach Soft-Partitionierung? Ursache in Low-Level-APIs. Auf dem GPU-Pfad lassen sich Laufzeit-APIs abfangen und umleiten – Ressourcenkontrolle zwischen Prozess und Gerät; die kritischen NPU-APIs waren damals nicht offen, gleiches Hijacking unmöglich.

> Ohne steuerbaren Ausführungseinstieg konnte das Device Plugin nur „Geräte zuweisen“, kein echtes feingranulares Sharing liefern.

### Drei entscheidende technische Veränderungen

![Drei Änderungen für Soft-Partitionierung: CANN open source, Experimente, Treiber-Upgrade](/images/blog/hami-vnpu-cmb-meetup-hangzhou-recap/three-key-changes-en.png)

Soft-Partitionierung wurde erst mit der Evolution der Basis möglich. Drei Schritte: CANN wurde open source, die Community bereitete Ascend-Sharing vor; in Experimenten unterstützte das Gerät erwartete Multi-Prozess-Aufrufe noch nicht; erst nach Treiber-Upgrade mit Multi-Prozess reifte die Sharing-Grundlage.

Ein Umweg: Huaweis Open-Source Flex:AI – Ziel Ascend-Sharing, aber noch an Gerätegrenzen: Requests per Remote Call, NPU-Seite effektiv Single-Prozess. „Sharing“ auf Einstiegsebene möglich, Geräteseite durch Multi-Prozess-Limit gebunden, Deployment-Kette komplexer. Durchbruch erst mit Multi-Prozess auf dem Gerät.

### Soft-Partitionierung in Kubernetes: Multi-Prozess + hami-core

![Vier Schritte für Soft-Partitionierung in Kubernetes](/images/blog/hami-vnpu-cmb-meetup-hangzhou-recap/soft-partition-k8s-pipeline-en.png)

Nach dem Treiber-Upgrade baute Huaweis Canada Lab die Low-Level-Sharing-Bibliothek (hami-core-ähnlich); Device Plugin und Kubernetes-Scheduling übernahmen die Steuerung. Vier Schritte für Produktion:

1. **Discovery & Registration**: Device Plugin erkennt Ascend und exponiert schedulierbare Ressourcen.
2. **Allocation & Injection**: Scheduling-Ergebnis wird zu Geräten und Sharing-Konfiguration im Container.
3. **Runtime Control**: Low-Level-Bibliothek erzwingt Sharing und Limits unter Multi-Prozess.
4. **Closed-Loop Validation**: Usability-, Stabilitäts- und UX-Issues zurück in die Community.

> GPU-Scheduling ist Runtime-Orchestrierung – nicht mehr nur einfache Ressourcenzuteilung.

### Von Lab zu Produktion: echtes Feedback für die Community

Zwischen „läuft“ und „läuft gut“ liegt viel Engineering. Wang Jifei war offen: Nutzer sahen komplexe Treiberkonfiguration, uneinheitliche APIs und idiosynkratisches Verhalten. Partitionierung im Container unsichtbar (dsmi nicht abgefangen, `npu-smi info` zeigt volle Karte); neu zugewiesenes vNPU wird nach Leerlauf automatisch zurückgenommen – Felder für kontinuierliche Politur.

Genau diese „Produktionsprobleme zurück zur Community“-Zusammenarbeit macht wiederverwendbare Open-Source-Fähigkeiten. In der CMB-Validierung: **100 %** Onboarding der relevanten Super-Node-Hardware, **30 %** weniger Cross-Machine-Scheduling-Wahrscheinlichkeit, Partitionierungsgranularität **1 GB Speicher und 1 % Compute**.

## 4. Performancedaten: Wendepunkt bei 2 / 4 / 8 / 16-fach

![Performance-Wendepunkt 2 / 4 / 8 / 16-fach](/images/blog/hami-vnpu-cmb-meetup-hangzhou-recap/performance-inflection-table-en.png)

Wie fein soll Soft-Partitionierung sein? Gemessene Daten: eine 910C-Karte, 7B-Klasse, 200 Input / 128 Output Tokens, eine Anfrage pro vNPU, P50:

| Partition | TTFT (ms) | TPOT (ms/Token) | Instanzen pro Karte | Szenario |
|-|-|-|-|-|
| 1 / 2 | 78 | 24.0 | 2 | Strenges Latenz-SLA |
| 1 / 4 | 92 | 29.7 | 4 | Empfohlene Online-Balance |
| 1 / 8 | 134 | 43.9 | 8 | Dichte zuerst / lockeres SLA |
| 1 / 16 | 248 | 76.4 | 16 | Dev & Test / Offline |

![4-fach-Split als empfohlene Online-Balance](/images/blog/hami-vnpu-cmb-meetup-hangzhou-recap/performance-balance-card-en.png)

Entscheidend ist der „Wendepunkt“, nicht „je feiner desto besser“. Gegenüber 2-fach: 4-fach nur ca. +18 % TTFT und +24 % TPOT – Latenz kontrollierbar, Dichte 4 Instanzen pro Karte; 8- und 16-fach tauschen deutlich mehr Latenz gegen Dichte – für leichte Modelle, async oder lockerere SLAs sowie Dev/Test/Offline. Für Online: **4-fach-Split als empfohlene Balance**.

> Partitionierungsgranularität ist nicht „je feiner desto besser“ – die feinste Stufe, die das SLA noch erfüllt, ist das Optimierungsziel.

## 5. Ausblick: UX und dynamische Governance

![Ausblick: von statischer Partitionierung zu dynamischer Governance](/images/blog/hami-vnpu-cmb-meetup-hangzhou-recap/future-outlook-en.png)

Kurzfristig UX: Hard- und Soft-Partitionierung einheitlich verwalten; Aufgaben on-demand, transparent nach oben; Partitionierung im Container sichtbar, Compute-/Speicher-Monitoring auf Container-Ebene; Volcano Ascend Device Plugin aktuell halten; values und Fehlerlogs für Self-Diagnose. Kurz: weniger Regeln merken, klare Plattformsicht, begrenzte Upgrades, saubere Anomalie-Recovery.

Langfristig dynamische Governance: Profiling für Operator-, Speicher-, Compute- und Latenzmerkmale, Last verstehen, Interferenz erkennen; bei kontrollierbaren Grenzen und Sichtbarkeit Compute-Preemption (dynamisches Zurücknehmen/Komprimieren niedriger Priorität bei High-Priority-Ankunft, Recovery-Kosten und Tail-Latenz im Blick) und Ressourcen-Oversubscription (Idle-Kapazität nach realem Verbrauch statt statischer Requests, mit Risiko-Marken, Rate Limits und Fallbacks).

## Fazit

Vom Cloud-Native zum AI-Native brauchen Unternehmen nicht nur mehr Compute, sondern eine Infrastruktur, die Compute einheitlich verwaltet, flexibel teilt und kontinuierlich steuert. Die Evolution von HAMi vNPU von Hard- zu Soft-Partitionierung und die Produktionslandung mit CMB ist ein solider Schritt – und dass reale Bedarfe die Open-Source-Community speisen und CMB vom Nutzer zum Co-Builder wächst, ist der langfristige Wert.

> KI-Infrastruktur durch Community statt geschlossener Systeme vorantreiben – so verfolgt HAMi es seit jeher.

HAMi-Projekt: [github.com/project-hami/hami](https://github.com/project-hami/hami). Bei Interesse an NPU-Sharing oder heterogenem Scheduling – willkommen in der HAMi-Community, um KI-Compute-Management auf Kubernetes weiterzutreiben.