---
title: 'HAMi Meetup Shanghai Deep Dive (2): Nach GPU-Sharing — Isolation, Scheduling und Observability in HAMi 2.10'
linktitle: HAMi 2.10 — Isolation, Scheduling, Observability
date: '2026-09-22'
excerpt: >-
  Eine GPU auf mehrere Jobs zu schneiden ist nur der Anfang. Dynamia-Mitgründer und CTO
  sowie HAMi-Maintainer Li Mengxuan erläuterte HAMi v2.10, DRA-Ökosystem-Anpassung und die auf der Bühne
  angekündigte v2.11-Roadmap (Remote GPU, CPU-NUMA-Ausrichtung). Der rote Faden: Nach dem Teilen muss
  Compute bedarfsgerecht zugewiesen, begrenzt, beobachtbar und diagnostizierbar sein.
author: Dynamia
tags:
  - HAMi
  - HAMi Meetup
  - GPU Virtualization
  - Heterogeneous Scheduling
  - DRA
  - Remote GPU
  - KAI Scheduler
category: Community & Events
coverImage: /images/blog/hami-meetup-shanghai-2026-hami-2-10-remote-gpu/slide-07-kai-scheduler-hami-core.png
---

Eine GPU mehreren Jobs zu geben, ist nur der Start von Resource Sharing. Für Enterprise-Plattformteams folgen härtere Fragen: hält jeder Job seine Quote ein, sind Zuweisungen beobachtbar, wie schedulen verschiedene Geräte und Jobs? Sonst steht im Buch „geteilt“, zur Laufzeit bleibt Nutzung eine Black Box.

Das ist der zweite Deep Dive in unserer [HAMi Meetup Shanghai](/blog/hami-meetup-shanghai-2026)-Reihe. **Li Mengxuan**, Mitgründer und CTO von Dynamia und HAMi-Maintainer, präsentierte „From Local Devices to Remote Compute Pools: Remote GPU and HAMi 2.10 New Capabilities“ — v2.10-Fortschritt, DRA-Anpassung und v2.11-Roadmap. Der Faden: geteilte Compute-Ressourcen müssen bedarfsgerecht zugewiesen und zur Laufzeit begrenzt, beobachtbar und diagnostizierbar sein.

## Wichtigste Erkenntnisse

- HAMi-core mit KAI Scheduler verbindet Scheduling-Zuweisung mit Laufzeit-Limits.
- Komponierbare Scheduling-Policies, Mutex und dynamisches MIG adressieren Platzierung, gegenseitigen Ausschluss und Flexibilität.
- HAMi-DRA ergänzt Request-Übersetzung, Cluster-Monitoring und Scheduling-Events; Remote GPU und CPU-NUMA-Ausrichtung wurden als Roadmap, nicht als ausgelieferte Features präsentiert.

**Speaker:** Li Mengxuan | Co-founder & CTO of Dynamia, HAMi Maintainer

## Wie viel zugewiesen — und wie viel wirklich genutzt

Li skizzierte zwei vertraute Szenen: kleine Jobs mit Ganzkarten-Anfrage lassen Ressourcen idle; Geräte verschiedener Vendors und Modelle werden getrennt verwaltet — manche Cluster warten, andere stehen leer.

Als Middleware für heterogene Compute-Virtualisierung bietet HAMi Device-Sharing und einheitliches Management in Kubernetes. Jobs deklarieren Modell und Ressourcen; die Plattform sieht Jobs, Geräte, zugewiesene Quote und tatsächliche Nutzung in einem Bild.

Die KAI-Scheduler-Anpassung zeigt die Arbeitsteilung zwischen HAMi-core und Scheduling-Ökosystem. Der Scheduler ordnet Jobs nach Ressourcen-Claims; HAMi-core geht per Injection-Komponenten in Container und erzwingt Speicher- und Rechenlimits. Ersterer verteilt Ressourcen, letzterer begrenzt Nutzung. Unternehmen mit bestehendem Scheduling können Sharing entlang dieser Schnittstelle integrieren — Deployment erfordert passende Komponenten und Versionen; nur Scheduler installieren gibt keine Laufzeitkontrolle.

![KAI Scheduler und HAMi-core: Aufteilung der Sharing-Kontrolle (Folie 7)](/images/blog/hami-meetup-shanghai-2026-hami-2-10-remote-gpu/slide-07-kai-scheduler-hami-core.png)

Das Ascend-Soft-Slicing-Update zielt auf ein anderes Problem: Limits greifen, während Abfrage-Tools weiter Vollspeicher melden. Neue Monitoring-Metriken zeigen Speichernutzung und -limits auf Container-Ebene — Plattformen unterscheiden Gerätegesamt von Job-Quota und bestätigen korrektes Slicing.

## Scheduling-Policies komponieren — Sharing braucht Grenzen

Bei mehreren Jobs auf gemeinsamen GPUs ziehen Anforderungen oft auseinander. Manche Teams wollen eng packen, um Ganzgeräte freizugeben; andere sind konfliktempfindlich und bevorzugen Spread. Bei Multi-GPU-Kommunikation beeinflusst Topologie den Datentransfer.

Li erklärte: v2.10 macht Scheduling-Policies komponierbar — z. B. Spread oder Spread mit NUMA, explizit gemappt auf Geschäftsanforderungen.

Die neue Mutex-Policy sperrt Jobs auf GPU-Ebene gegeneinander aus. Mutex-Jobs teilen keine Karte mit anderen Mutex-Jobs — nützlich, wenn Replicas dieselbe GPU meiden müssen. Kein generelles Verbot anderer Nutzung; Grenzen der Policy genau verstehen.

Heterogene Job-Unterstützung bei Ascend erlaubt Scheduling über Knoten mit passenden Template- und Soft-Slice-Konfigurationen. Voraussetzung: Job-Anforderungen passen zu Gerätefähigkeit.

## Dynamisches MIG und DRA: Flexibilität vs. Nutzungserlebnis

Dynamisches MIG adressiert unflexible vorgefertigte Slice-Templates.

Schneidet man eine Karte vorab in kleine Stücke, passen spätere große Jobs evtl. nicht in Restpartitionen. Der neue Ansatz verfolgt Slot-Verteilung und matcht verfügbare MIG-Profile gegen Job-Requests statt festem Template-Upfront-Slicing.

Flexibler, aber begrenzt durch unterstützte MIG-Profile und Slots. Ausreichend aggregierte Restkapazität garantiert kein passendes Placement.

DRA löst eine andere Schicht: Nach DRA-Zuweisung brauchen Nutzer vertraute Request-Form, vollständige Ressourcensicht und Erklärung bei Nicht-Schedulierung.

HAMi-DRA adressiert diese Touchpoints: Request-Übersetzung in DRA-Logik plus Cluster-Monitoring und Scheduling-Events. Restressourcen sichtbar; Engpässe nach Gerätetyp, Speicher usw. erkennbar. Ascend-DRA-Fortschritt im Vortrag — Deployment braucht passende Kubernetes-Versionen und Treiber.

![HAMi-DRA: Arbeitsteilung und Nutzung (Folie 13)](/images/blog/hami-meetup-shanghai-2026-hami-2-10-remote-gpu/slide-13-hami-dra.png)

## Remote GPU und CPU-NUMA-Ausrichtung: nächste Schritte

Li positionierte Remote GPU auf der v2.11-Roadmap. Zielmuster: Knoten ohne GPU, Job kann dennoch remote über Netzwerk zugreifen. Folgendes beschreibt die auf der Bühne geteilte Designrichtung — getrennt von v2.10-Features oben.

Geplant: Open-Source-Projekt Lupine verbindet Jobs auf anderen Knoten mit remote GPUs. HAMi erkennt Remote-Ressourcen, nimmt am Scheduling teil, Konfiguration automatisch. Geräteknoten im Remote-GPU-Modus erhalten entsprechende Requests.

Erweitert Nutzung von Compute-Pools; Cross-Node-Zugriff läuft über Netzwerk. Netz, Overhead und Workload bestimmen Eignung — nicht gleichzusetzen mit lokaler GPU-Leistung.

![Remote-GPU-Architektur (v2.11-Roadmap, Folie 16)](/images/blog/hami-meetup-shanghai-2026-hami-2-10-remote-gpu/slide-16-remote-gpu-architecture.png)

Geplant ist auch CPU–GPU-NUMA-Ausrichtung. Li betonte: bestehende GPU-zu-GPU-NUMA-Bewusstheit heißt nicht, CPU und GPU liegen auf derselben NUMA-Node. Geplant ist gemeinsame Berücksichtigung beider Zuweisungen, um Cross-NUMA-Overhead zu reduzieren.

![CPU–GPU-NUMA-Ausrichtung (v2.11-Roadmap, Folie 17)](/images/blog/hami-meetup-shanghai-2026-hami-2-10-remote-gpu/slide-17-cpu-gpu-numa-alignment.png)

Bei Dynamia liegt HAMis Enterprise-Wert in der Betriebsqualität nach dem Teilen. Plattformen sollten angefragte Quote und tatsächliche Nutzung gemeinsam prüfen, Policies pro Constraint wählen und bei Nicht-Platzierung erklärbare Gründe erhalten. Der Vortrag skizzierte auch Zusammenarbeit mit Inferenz-Frameworks wie llm-d — Topologiebewusstsein mit oberer Inferenz-Orchestrierung; braucht Validierung in konkreten Szenarien. HAMi-Evaluation sollte auf diese prüfbaren Verhaltensweisen zielen, nicht nur darauf, in wie viele Stücke eine Karte geschnitten werden kann.

## Video und Folien

- **Bilibili-Replay:** [Keynote | From Local Devices to Remote Compute Pools: Remote GPU and HAMi 2.10 New Capabilities — Li Mengxuan](https://www.bilibili.com/video/BV1ZjYK6hEAT/)
- **Folien:** [remote-gpu-hami-2.10-limengxuan.pdf](https://github.com/Project-HAMi/community/blob/main/hami-meetup/04-shanghai-20260906/remote-gpu-hami-2.10-limengxuan.pdf)

## Serie

- [Überblick: HAMi Meetup Shanghai Recap](/blog/hami-meetup-shanghai-2026)
- [(1) Wo passt HAMi in die CNCF × PyTorch Cloud Native AI Foundation?](/blog/hami-meetup-shanghai-2026-cncf-pytorch-ai-foundation)
- **(2) Nach GPU-Sharing: Isolation, Scheduling und Observability in HAMi 2.10** (dieser Beitrag)
- [(3) Inferenz-Steuerung vs. GPU-Ressourcenmanagement: llm-d und HAMi](/blog/hami-meetup-shanghai-2026-llm-d-inference-plane)
- [(4) GPU-Leistung in Inferenzfähigkeit: Iluvatar](/blog/hami-meetup-shanghai-2026-iluvatar-gpu-inference)
- [(5) iFLYTEK Multi-Business GPU-Sharing mit Volcano + HAMi-core](/blog/hami-meetup-shanghai-2026-volcano-hami-core)
- [(6) Wie UCloud HAMi-Sharing in Dev-Umgebungen überführt](/blog/hami-meetup-shanghai-2026-ucloud-ai-platform)
- [(7) Vom Nutzer zum Mitgestalter: nachhaltige HAMi-Community](/blog/hami-meetup-shanghai-2026-community-panel)