---
title: "CETC Cloud baut mit HAMi eine domestic-GPU-Sharing-Basis für eine portable Wissensbasis"
coverTitle: "CETC Cloud CNCF Case Study"
date: '2026-09-20'
excerpt: >-
  CETC Cloud musste die intelligente Wissensbasis an Projektstandorte bringen — Textgenerierung,
  Embedding, Rerank, Wissensverarbeitung und R&D-Debugging auf portablen Geräten mit domestic GPUs.
  Mit Kubernetes und HAMi wuchs die Dev-Kapazität pro Gerät von 2 auf 30 parallele Pods; eine Karte
  gab 56 GB Speicher und 80 % Compute frei.
author: Dynamia
tags:
  - HAMi
  - CNCF
  - CETC Cloud
  - GPU Sharing
  - vGPU
  - Kubernetes
  - Domestic GPU
  - Case Study
  - AI Infrastructure
category: Case Study
linktitle: CETC Cloud CNCF Case Study
coverImage: "/images/blog/cetc-cloud-cncf-case-study/fig1-topology-en.png"
---

CETC Cloud musste die intelligente Wissensbasis an Projektstandorte bringen — Textgenerierung, Embedding, Rerank, Wissensverarbeitung und R&D-Debugging auf einer portablen Geräteserie mit domestic GPUs. Das Team nutzte Kubernetes und HAMi, um die begrenzten GPUs — zuvor dauerhaft einzelnen Diensten zugeordnet — in Ressourcen zu verwandeln, die Produktionsmodelle und Kubernetes-Dev-Umgebungen on demand anfordern, teilen und schedulen können.

Auf dieser Ressourcenbasis bilden Textgenerierung, Embedding und Rerank eine vollständige Wissensbasis-Pipeline; eine einzelne domestic GPU kann zudem von mehreren Kubernetes-Dev-Pods/Containern über HAMis Virtualisierung geteilt werden.

## Fallinformationen

| Punkt | Detail |
|-|-|
| Nutzer | Technisches Team von CETC Cloud |
| Geschäftsszenario | Portable intelligente Wissensbasis-Appliance für projektweise unabhängigen Betrieb |
| Deployment | Kubernetes mit on-premises domestic GPUs |
| Projekte | Kubernetes, HAMi |
| Kernherausforderungen | Multi-Modell-Koordination, gemeinsame Produktion und Entwicklung |

## Umfang der Praxis

| Wissensbasis-Produktionspipeline | Kubernetes-Dev-Umgebung |
|-|-|
| Textgenerierung, Embedding, Rerank | Mehrere Dev-Pods/Container teilen eine domestic GPU |

Zwei GPU-Nutzungspfade: Produktionsmodelle nutzen primär stabile lokale Ressourcen; Dev-Pods/Container teilen lokale domestic GPUs über HAMi.

![Produktionsmodelle und Kubernetes-Dev-Umgebungen nutzen jeweils lokale domestic GPUs über HAMi](/images/blog/cetc-cloud-cncf-case-study/fig1-topology-en.png)

*Abbildung 1: Produktionsmodelle und Kubernetes-Dev-Umgebungen nutzen jeweils lokale domestic GPUs über HAMi.*

## Ein portables Gerät für Produktion und F&E

Das Online-Q&A der Wissensbasis hängt von Textgenerierung, Vektorretrieval und Rerank ab; eingehende Dokumente durchlaufen Parsing, Chunking, Vektorisierung, Wissensextraktion und Indexaufbau. In Kubernetes-Dev-Pods debuggen Engineers Modelle, validieren Abhängigkeiten und führen Experimente durch. Die Workloads nutzen GPUs sehr unterschiedlich:

- Textgenerierung muss online bleiben, hohe VRAM-Baseline, latenzsensitiv;
- Embedding erzeugt periodische Spitzen beim Massenimport, Fokus auf Durchsatz;
- Rerank liegt auf dem Online-Retrieval-Pfad — kurze Rechenzeit, aber häufig;
- Wissensverarbeitung und Index-Rebuilds sind Batch-Tasks, von Online-Diensten zu isolieren;
- Dev-Pods/Container sind periodisch und interaktiv, gut für GPU-Sharing innerhalb klarer Grenzen.

Wenn jeder Dienst oder jede Dev-Umgebung eine ganze Karte dauerhaft bindet, sind die wenigen Geräte logisch schnell erschöpft; jagt die Plattform nur die feinste mögliche Aufteilung, verstärkt das VRAM-Mangel, Queue-Jitter und Fehlerfortpflanzung. Jedes Workload-Segment soll eigene Bedürfnisse beschreiben; die Plattform platziert nach Gerätestatus und Service-Levels.

![Geschäftsdokumente durch Parsing, Embedding und Indexaufbau; Online-Fragen durch Retrieval, Rerank und Textgenerierung](/images/blog/cetc-cloud-cncf-case-study/fig2-pipeline-en.png)

*Abbildung 2: Geschäftsdokumente fließen über Parsing, Embedding und Indexaufbau in die Wissensbasis; Online-Fragen liefern Antworten, Zitate oder Berichte über Retrieval, Rerank und Textgenerierung.*

## Warum HAMi

CETC Cloud wollte das Kubernetes-Anwendungsmodell behalten, während die Plattform versteht, ob domestic-GPU-Geräte Workload-Requests erfüllen können, und Dev-Umgebungen zum Teilen dieselbe physische GPU wiederverwenden. HAMis Kubernetes-native Deklarationen, gerätebewusste Platzierung, Device-Sharing und Laufzeit-Observability passen zu diesen drei Anforderungen.

Der Wert von HAMi liegt nicht nur darin, eine physische Karte in mehrere Anteile abzubilden — wichtiger ist der gemeinsame Ressourcenvertrag:

- Modellservices und Dev-Pods/Container deklarieren benötigte Geräteressourcen, ohne langfristiges manuelles Karten-Binding;
- Scheduling prüft nicht nur GPU-Vorhandensein auf einem Node, sondern wählt nach verfügbarem Gerätestatus;
- Innerhalb dessen, was das Geräte-Backend unterstützt, können mehrere Dev-Pods/Container eine domestic GPU mit je eigener Grenze teilen;
- Pods, Container, Geräte und Scheduling-Ergebnisse lassen sich wieder korrelieren — für Kapazitätsbeobachtung und Korrektur der Ressourcenkonfiguration.

## Von Workload-Profiling zu geteilten domestic GPUs

Das Team erstellte Ressourcenprofile aus Modellladen, Spitzenlast, Parallelität, Latenz und Langzeitverhalten und übersetzte validierte Bedarfe in Kubernetes-Requests. Produktionsmodelle und Dev-Umgebungen folgen unterschiedlichen Strategien:

1. **Stabile Grenzen für den Online-Pfad.** Textgenerierung, Online-Vektorretrieval und Rerank erhalten zuerst stabile Ressourcen.
2. **Periodische Tasks in Nebenzeiten.** Dokumentenvektorisierung, Wissensextraktion und Index-Rebuilds bei niedriger Online-Last.
3. **Dev-Umgebungen teilen eine domestic GPU.** Mehrere Kubernetes-Dev-Pods/Container nutzen HAMi-Virtualisierung statt je eine dedizierte Karte langfristig zu halten.
4. **Konfiguration nach realer Last.** Slicing-Granularität aus Baseline-Validierung und Laufzeitbeobachtung, nicht aus einem einheitlichen Festverhältnis.

Vier Produktfähigkeiten daraus:

- Textgenerierung, Embedding und Rerank unter einem Kubernetes-GPU-Workflow;
- Wissensaufnahme, Retrieval, Q&A und Berichtserstellung als durchgängige Pipeline;
- Online-Dienste, Batch-Tasks und R&D-Debugging mit unterschiedlichen Ressourcenregeln;
- Eine domestic GPU bedient mehrere Kubernetes-Dev-Pods gleichzeitig.

## Quantifizierte Ergebnisse: Dev-Kapazität pro Gerät von 2 auf 30 Pods

Auf demselben portablen Gerät mit 8 domestic GPUs verglich das Team Kapazität vor und nach HAMi unter gleichen Bedingungen:

| Punkt | Ohne HAMi | Mit HAMi |
|-|-|-|
| Textgenerierungsmodelle | 4 domestic GPUs, dediziert | Weiterhin 4 domestic GPUs, dediziert |
| Embedding und Rerank | Je 1 dedizierte domestic GPU | Je 8 GB GPU-Speicherquota |
| Kapazität für Dev-Umgebungen | 2 GPUs übrig — nur 2 Dev-Pods | 30 parallele Dev-Pods validiert |
| Dev-Kapazität | Basis | 15× der Ausgangswert |

Dev-Pods fordern Speicherquota nach Task; die Plattform erzwingt keinen einheitlichen Festwert. Unter aktuellen Modellquoten und Dev-Last validierte das Team 30 gleichzeitige Dev-Pods.

### Einzelkarten-Vergleich für das Embedding-Modell

Das Embedding-Modell braucht auf einer 64-GB-domestic-GPU etwa 8 GB. Bei Ganzkarten-Dedizierung nutzt das Modell nur ~12,5 % des Speichers, der Rest ist für andere Workloads nicht anforderbar; mit HAMi wies das Team 8 GB Speicher und 20 % Compute zu und gab den Rest ans Scheduling zurück. Mit gleichem Model-Image, Request-Set und Parallelitätskonfiguration verglich das Team Ganzkarte vs. HAMi-Slicing.

| Metrik | Ohne HAMi | Mit HAMi |
|-|-|-|
| Embedding-Speicherzuweisung | Dedizierte 64-GB-GPU | 8 GB on demand |
| Tatsächlicher Modellbedarf | ~8 GB | ~8 GB |
| Für andere Tasks nutzbarer Speicher | 0 GB | 56 GB — 87,5 % der Karte |
| Embedding-Compute | Ganzkarte dediziert | 20 % zugewiesen, 80 % schedulierbar |
| Token-Durchsatz (tokens/s) | Basis | Innerhalb 5 % des Dediziert-Modus |
| Modellladezeit | Basis | Praktisch unverändert |
| P95-Anfragelatenz | Basis | Praktisch unverändert |

Derselbe Vergleich auf derselben Karte mit demselben Modell zeigt: HAMi verschob Embedding von Ganzkarten-Dedizierung zu On-Demand-Zuweisung, gab Speicher und Compute frei und hielt Token-Durchsatz, Ladezeit und P95 stabil — dieselbe domestic GPU kann weiter Dev-Umgebungen oder andere sharing-taugliche Tasks hosten.

![Mit HAMi von Ganzkarten-Dedizierung zu On-Demand-Zuweisung beim Embedding](/images/blog/cetc-cloud-cncf-case-study/fig3-results-en.png)

*Abbildung 3: Mit HAMi gab Embedding 56 GB Speicher und 80 % Compute auf einer Karte für andere Tasks frei; Dev-Pod-Kapazität pro Gerät stieg von 2 auf 30.*

## Lehren aus der Praxis

Zuerst: domestic-GPU-Sharing startet aus Workload-Profilen, nicht aus einem einheitlichen Slicing-Verhältnis. Produktionsmodelle, Batch-Tasks und Dev-Umgebungen unterscheiden sich in Latenz, Speicher, Durchsatz und Isolation — ebenso ihre Ressourcenrichtlinien.

Zweitens: R&D-Umgebungen verbrauchen viel geteilte GPU-Kapazität. Dev in Kubernetes-Pods/Containern nutzt dieselben Deklarationen und dasselbe Scheduling wie Produktionsservices und vermeidet langfristige Gerätedizierung pro Umgebung.

Als Nächstes verbessert CETC Cloud Kapazitäts- und Health-Views für Produktion und Dev und ergänzt reproduzierbare Experimentdaten über Modelle, Netzwerke und Aufrufmuster.

## Über das technische Team von CETC Cloud

Das Team verantwortet Produktentwicklung und Engineering der portablen intelligenten Wissensbasis — mit Fokus auf lokalen Betrieb vor Ort, Wissensverarbeitung, Modellserving und Dev-Umgebungen.

Treten Sie der [HAMi-Community](https://project-hami.io/community) bei, um über geteilte GPUs und portable AI-Praxis zu diskutieren.