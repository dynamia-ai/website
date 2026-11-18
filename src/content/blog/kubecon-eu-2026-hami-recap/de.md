---
title: "Dynamia auf der KubeCon EU 2026: Vom Booth-Gespräch zur Main-Stage-Demo — HAMi im Kern der KI-Infrastruktur"
linktitle: "HAMi-Rückblick KubeCon EU 2026"
date: '2026-03-31'
excerpt: >-
  Die KubeCon EU 2026 ist vorbei, und ein Signal war unmissverständlich: Cloud Native entwickelt sich
  schnell von einer Anwendungsplattform zur Grundlage der KI-Infrastruktur. Als Initiator und
  Kernmotor des HAMi-Projekts lieferte Dynamia einen Meilenstein-Auftritt — vom Maintainer Summit
  und Lightning Talks bis zur Keynote-Demo auf der KubeCon-Main-Stage.
author: Dynamia
tags:
  - KubeCon
  - HAMi
  - GPU-Virtualisierung
  - KI-Infrastruktur
  - Cloud Native
category: Events
coverImage: /images/blog/kubecon-eu-2026-hami-recap/keynote-live-demo.jpg
---

Die kürzlich abgeschlossene **KubeCon + CloudNativeCon Europe 2026** sendete ein zunehmend klares Signal in die Branche:

**Cloud Native entwickelt sich rasch von einer „Application-Runtime-Plattform“ zur Grundlage der KI-Infrastruktur.**

In Amsterdam sind Diskussionen um Kubernetes, GPUs, Inference Serving, Agentic AI und heterogenes Compute-Scheduling über Konzepte hinaus in konkrete Engineering-Praxis, Community-Kollaboration und Infrastruktur-Paradigmenwechsel übergegangen.

![Mengxuan Li und Reza Jelveh bei der KubeCon-Keynote-Live-Demo (über 13.000 Teilnehmer vor Ort)](/images/blog/kubecon-eu-2026-hami-recap/keynote-live-demo.jpg)

![KubeCon-Keynote-Bühne](/images/blog/kubecon-eu-2026-hami-recap/keynote-stage.jpg)

Als **Initiator und Kernmotor des HAMi-Projekts** nahm **Dynamia** an diesen Entwicklungen zusammen mit globalen Entwicklern, Open-Source-Maintainern, der CNCF-Community und Industriepartnern tief teil.

Vom Maintainer Summit und Lightning Talks über das Project Pavilion bis zur **KubeCon Main Stage Keynote Demo** lieferte HAMi auf dieser Konferenz eine wegweisende Schau.

## Kubernetes betritt die KI-Infra-Phase

Wenn Kubernetes zuvor fokussierte auf:

* Container-Orchestrierung
* Microservices-Governance
* Cloud-Native-Anwendungsauslieferung

Dann waren auf dieser KubeCon die Fragen mit dem größten Interesse:

* Wie laufen KI-Workloads effizienter auf Kubernetes?
* Wie können GPUs geteilt, partitioniert, geschedult und isoliert werden?
* Wie arbeiten LLM-Serving und zugrundeliegendes Ressourcenmanagement zusammen?
* Wie vereinheitlicht man heterogene Rechenleistung im Cloud-Native-Scheduling-Framework?

Hinter diesen Fragen liegt ein grundlegenderer Wandel:

> **Kubernetes bewegt sich von „Applications orchestrieren“ zu „Compute orchestrieren“.**

Genau hier wirkt HAMi.

## Beim Maintainer Summit: HAMi in zentralen Community-Diskussionen

Auf dem vorkonferenz **Maintainer Summit** teilte Dynamia-Co-Founder und CTO **Mengxuan Li** HAMis Einblicke zu KI-Workloads.

![Dynamia-CTO Mengxuan Li mit HAMi-Insight zu KI-Workloads beim Maintainer Summit](/images/blog/kubecon-eu-2026-hami-recap/cto-maintainer-summit.png)

Das Team nahm an CNCF-Closed-Door-Meetings teil und diskutierte vertieft mit CNCF-TOC-Chair Karena Angell, Red Hat und vLLM-Community-Mitgliedern Brian Stevens und Robert Shaw.

![Dynamia-Team diskutiert GPU-Sharing mit CNCF TOC, Red Hat und der vLLM-Community](/images/blog/kubecon-eu-2026-hami-recap/cncf-toc-redhat-vllm.png)

Diese Diskussion war besonders repräsentativ: nicht „wie implementiert man Features für ein einzelnes Projekt“, sondern eine größere Frage:

> **Wenn LLM-Serving, GPU-Ressourcenmanagement und Kubernetes in realer Produktion zusammenlaufen, welche neuen Abstraktionen braucht die Infrastrukturschicht?**

In der Diskussion stieß HAMis Richtung auf merkliche Aufmerksamkeit. GPUs können nicht länger als einfache Devices behandelt werden — sie werden zu einer Infrastruktur-Ressourcenschicht, die schedulierbar, teilbar und steuerbar ist.

Daher wird die Synergie zwischen HAMi und Projekten wie vLLM zunehmend natürlich.

Beide Seiten begannen gemeinsame Content-Kollaboration und technischen Austausch zu erkunden — das KI-Infra-Ökosystem beschleunigt von „Standalone-Projekten“ zu „komponierbarer Zusammenarbeit“.

Zusätzlich ist HAMi im CNCF-Incubating-Antragsprozess und nahm als Repräsentativprojekt an TAG-Workshop-Diskussionen teil.

![TAG-Workshop zu CNCF-Projekt-Governance](/images/blog/kubecon-eu-2026-hami-recap/tag-workshop.jpg)

## Zwei Tech-Talks: Von Community-Issues zu Engineering-Lösungen

Während der Hauptkonferenz hielt das Dynamia-Team zwei wichtige HAMi-zentrierte Präsentationen.

### Xiao Zhang: K8s Issue #52757 — GPUs unter mehreren Containern teilen

Issue #52757 ist nicht neu — ein „lang ungelöstes Problem“ in der Kubernetes-Community seit Jahren.

Mit der Explosion von KI-Workloads wurde es verstärkt:

* Inferenzdienste brauchen feinkörnigere GPU-Nutzung
* Multi-Tenant-Umgebungen verlangen Ressourcen-Sharing
* KI-Workload-Muster machen exklusive Ganzkarten-Zuweisung unpassend

Ein scheinbar niedriges Problem wurde zur Kernherausforderung der KI-Infrastruktur.

![Xiao Zhang präsentiert HAMi im KubeCon Cloud Native AI Forum](/images/blog/kubecon-eu-2026-hami-recap/zhangxiao-gpu-sharing.png)

**Xiao Zhang**, Dynamia CEO, näherte sich einem klassischen Langzeit-Issue der Kubernetes-Community:

**Wie können mehrere Container eine GPU teilen?**

Die Frage wirkt spezifisch, zeigt aber eine gemeinsame Herausforderung des gesamten KI-Infra-Ökosystems. In Inferenz, Batch, Online-Serving und Multi-Tenant-Mischszenarien reicht exklusive Ganzkarten-Zuweisung nicht mehr.

Die Bedeutung des Talks: HAMis Problem zurück in den Ursprungskontext der Kubernetes-Community stellen — nicht eine isolierte Lösung von Null, sondern Antwort auf ein lang bestehendes, noch nicht vollständig gelöstes Upstream-Problem.

### Mengxuan Li: Dynamic, Smart, Stable GPU-Sharing Middleware in Kubernetes

**Mengxuan Li**, Dynamia CTO, stellte HAMis Kernarchitektur und Fähigkeiten systematisch vor:

* GPU-Virtualisierung
* GPU-Sharing und Scheduling-Mechanismen
* Stabilitäts- und Produktionsreife-Design
* Ansatz zum KI-Workload-Ressourcenmanagement in Kubernetes

![Mengxuan Li präsentiert HAMi auf der KubeCon](/images/blog/kubecon-eu-2026-hami-recap/limengxuan-hami-talk.png)

Nicht nur Feature-Intro — Antwort auf eine praktischere Frage:

> **Wenn Kubernetes GPU-Sharing noch nicht nativ löst: Wie führen Unternehmen KI-Workloads wirklich aus — stabil und effizient?**

## Project Pavilion: Technische Diskussion wird globale Face-to-Face-Begegnung

Neben den Sessions betrieb HAMi einen Stand im **Project Pavilion** der KubeCon EU 2026.

![Stetiger Besucherstrom am HAMi-Stand](/images/blog/kubecon-eu-2026-hami-recap/booth-crowd.jpg)

Über mehrere Tage wurde der Stand zu einem Hub intensiven Austauschs. Besucher:

* Entwickler und Contributors aus dem Ausland
* Unternehmensnutzer und Plattformteams
* Universitäten und Forschungseinrichtungen
* Cloud-Anbieter und GPU-Ökosystem-Profis
* Community-Mitglieder zu KI-Infra, heterogenem Compute und Kubernetes-GPU-Scheduling

Vor Ort verbanden wir uns mit weiteren Community-Contributors.

![Indische Contributors Rudraksh Karpe (Mitte) und Shivay Lamba (rechts)](/images/blog/kubecon-eu-2026-hami-recap/indian-contributors.png)

In der Poster Session entstand ein Schema „Kubernetes als universelle GPU-Control-Plane“.

![Kubernetes als universelle GPU-Control-Plane](/images/blog/kubecon-eu-2026-hami-recap/k8s-gpu-control-plane.jpg)

Der Wert geht über „Sichtbarkeit“ hinaus — das Team validierte direkt:

> **GPU-Scheduling, Ressourcen-Sharing und heterogenes Compute-Management sind echte globale Bedarfe, keine Nischenprobleme einzelner Märkte.**

Viele Gespräche drehten sich um dieselben Kernthemen:

* GPU-Auslastung verbessern
* Fragmentierung reduzieren
* komplexere KI-Workloads unterstützen
* Kubernetes zum natürlicheren Host für KI-Infra machen

Für HAMi heißt das: nicht mehr nur „interessantes Open-Source-Projekt“, sondern schrittweise Einstieg in den Mainstream globaler KI-Infrastruktur-Diskussionen.

## Keynote Demo: HAMi auf der KubeCon-Main-Stage

![KubeCon-Keynote mit Linux-Foundation-CEO Jonathan und CNCF-CTO Chris](/images/blog/kubecon-eu-2026-hami-recap/keynote-hosts.png)

Wenn Talks und Booth „Anerkennung in Fachkreisen“ waren, war der ikonischste Moment:

> **HAMi wurde das erste in China entstandene Open-Source-Projekt mit Präsentation in der KubeCon EU 2026 Main-Stage-Keynote mit Live-Demo.**

Der kritischste und betonungswürdigste Teil der Konferenz.

Auf der Main Stage präsentierten **Mengxuan Li und Reza Jelveh** (Head of Global Market & Solution Engineer) eine Live-Demo zu HAMis Kubernetes-basiertem Multi-Workload-GPU-Scheduling.

![Mengxuan Li und Reza bei der Live-Demo](/images/blog/kubecon-eu-2026-hami-recap/limengxuan-reza-demo.jpg)

Die Demo nutzte zwei typische KI-Workloads: YOLO-Inferenz und Qwen3-8B-Großmodell-Inferenz. Im traditionellen Kubernetes-Modell bräuchten diese Tasks typischerweise exklusive GPU-Zuweisung. Unter HAMi werden GPUs in „Compute + Memory“-Ressourceneinheiten zerlegt, die mehrere Pods on-demand teilen.

Live wurden mehrere YOLO-Instanzen auf derselben GPU scheduliert, Qwen3-8B per Binpack mit anderen Workloads auf einer GPU colocated. Verschiedene KI-Workloads koexistierten auf derselben GPU mit Ressourcenisolation und Schedulability.

Die Demo zeigte nicht nur höhere GPU-Auslastung — wichtiger eine neue Infrastrukturfähigkeit: GPUs von „Devices“ zu „schedulierbaren Ressourcen“, Kubernetes gewinnt Grundfähigkeit zum Management von KI-Workloads.

Keine normale Booth- oder Breakout-Demo — Main Stage mit tausenden Zuschauern, HAMi in breiterer globaler Sichtbarkeit.

Die Bedeutung hat mindestens drei Ebenen:

### Erstens: KI-Infrastruktur in KubeCons Haupterzählung

Früher fokussierte die Main Stage auf Kubernetes selbst, Plattformgrundlagen, Ökosystem-Kollaboration und typische Use Cases.

Diesmal signalisiert ein GPU-Ressourcenmanagement-Projekt wie HAMi auf der Main Stage:

**Wie KI-Workloads auf Kubernetes laufen, ist eine Frage, die die Cloud-Native-Community direkt beantworten muss.**

### Zweitens: GPU-Scheduling ist kein „Nischenthema“ mehr

GPU-Sharing, Virtualisierung, Ressourcenisolation und heterogenes Scheduling waren früher Spezialkreise.

Jetzt: von „domänenspezifischen Problemen“ zu „gemeinsamen Infrastrukturherausforderungen“. In TOC-Diskussionen und Community-Austausch hängen mehrere Projekte (inkl. vLLM-Praxis) direkt von GPU-Scheduling unten ab. Nicht mehr nur einzelne SIGs — breitere Ökosystem-Diskussionen.

HAMi auf der Main Stage bedeutet: diese Richtung gewinnt Sichtbarkeit.

### Drittens: Ergebnis gemeinsamer Akkumulation von HAMi-Community und Dynamia

Ein Open-Source-Projekt erreicht die KubeCon-Main-Stage nicht nur wegen „eines Features zum Demonstrieren“.

Dahinter müssen stehen:

* Technische Ausrichtung an Branchentrends
* Anerkennung des Community-Werts
* Klarere Position im Ökosystem

Die Keynote-Demo war nicht nur Schau — Positionsbestätigung:

> **HAMi entwickelt sich vom GPU-Sharing-Tool zur kritischen Komponente der KI-Compute-Ressourcenschicht auf Kubernetes.**

### AI Native Summit

Nach der KubeCon fand das colocated **AI Native Summit** statt.

Im Vergleich zur Hauptlocation fokussierte das Summit direkter auf eine Frage:

**Die Laufzeiteffizienz von KI-Workloads wird zum neuen Infrastruktur-Engpass.**

GPU-Virtualisierung und -Scheduling sind nicht mehr interne Kubernetes-Optimierungen — sie beeinflussen direkt Serving-Kosten, Antwortzeiten und Systemdurchsatz.

Reza präsentierte „HAMi: Heterogeneous GPU Virtualization and Scheduling for AI-Native Infrastructure on Kubernetes“.

![Reza präsentiert HAMi beim AI Native Summit](/images/blog/kubecon-eu-2026-hami-recap/reza-ai-native-summit.png)

Reza vertrat Dynamia in einer Panel-Diskussion „AI Native Technology“.

![Reza im Panel „AI Native Technology“](/images/blog/kubecon-eu-2026-hami-recap/reza-panel-discussion.png)

Das AI Native Summit brachte Experten aus Cloud Native, KI-Infrastruktur und Telekommunikation zusammen zur Evolution AI-nativer Architekturen — von service-orientierten Request-Response-Modellen zu Plattformen für Inferenz, Conversational AI und autonome Entscheidungen: AI Gateways, Inferenz-Scheduling, Multi-Modell-Routing, Multi-Tenant-Isolation — der laufende Shift von Cloud Native zu AI Native.

## Ein bemerkenswertes Detail: HAMi im breiteren Cloud-Native-Kontext

Neben Live-Demos und Präsentationen ein weiteres externes Signal:

Auf der Main Stage wurde HAMi als **repräsentativer Fall im erweiterten Cloud Native Landscape** erwähnt.

![HAMi als erweitertes Cloud Native Landscape-Projekt in der Keynote](/images/blog/kubecon-eu-2026-hami-recap/landscape-mention.jpg)

HAMis Bedeutung geht über „Projekt für GPU-Scheduling“ hinaus — in der breiteren Cloud-Native-Evolution repräsentativ für eine neue Generation von Infrastrukturherausforderungen.

Die Cloud-Native-Community erkennt:

* Das Ressourcenmodell um CPU / Memory / Network / Storage reicht nicht
* Das KI-Zeitalter braucht neue Ressourcenabstraktionen
* GPUs, Inferenz, heterogene Devices und Workload-Governance sind kritische nächste Infrastrukturthemen

HAMi liefert an diesem Wendepunkt einen klaren, pragmatischen, implementierbaren Engineering-Pfad.

## Vom Projekt zum Ökosystem: Was haben wir wirklich gewonnen?

Der Rückblick auf diese KubeCon für Dynamia geht über „Talks halten, Booth, Demo“ hinaus.

Wichtiger spürte das Team:

### 1. Globaler Community-Fokus auf KI-Infra intensiviert sich rapide

Nicht mehr nur Modelle und Apps — sondern:

* Wie läuft es auf Infrastrukturebene?
* Wie werden Ressourcen geschedult?
* Wie steigern wir Effizienz?
* Wie sichern wir Stabilität?

### 2. Kubernetes-KI-Konvergenz in tiefere Gewässer

Nicht mehr „läuft es?“, sondern:

* Läuft es effizient?
* Läuft es in Scale?
* Läuft es stabil in Produktion?

### 3. HAMis Positionierung wird klarer

Nicht mehr nur „Projekt für GPU-Sharing“ — einzigartige Positionierung:

> **Die GPU-Ressourcenschicht und heterogene Compute-Scheduling-Fähigkeit für Kubernetes.**

Daher investiert Dynamia weiter in HAMi-Community und Produktisierung. Der Wettbewerb um KI-Infrastruktur entscheidet nicht nur über Modellfähigkeit, sondern auch darüber, ob unterliegende Rechenressourcen effizienter, flexibler und systematischer organisiert werden.

## Schluss: Im KI-Zeitalter hat die Infrastrukturgeschichte gerade begonnen

KubeCon EU 2026 stärkte unsere Überzeugung:

**Cloud Native wird nicht von KI ersetzt — es wird von KI neu definiert.**

Vom Booth über Tech-Talks bis zur Main-Stage-Demo war HAMis Auftritt nicht nur Konferenzprotokoll — ein Signal:

> **Cloud-Native-Infrastruktur um GPUs, Inferenz und heterogene Rechenleistung betritt eine neue Phase.**

**Dynamia** arbeitet weiter mit der HAMi-Community, globalen Entwicklern und Ökosystempartnern daran, Kubernetes besser für KI-Workloads zu machen und Rechenressourcen effizienter zu organisieren, zu schedulen und freizusetzen.

![Dynamia-Team mit Community-Mitgliedern vor dem KubeCon-Venue](/images/blog/kubecon-eu-2026-hami-recap/team-photo.jpg)

Amsterdam ist vorbei, die nächste Phase der KI-Infrastruktur beginnt gerade. Wer sich für KI-Infrastruktur, GPU-Virtualisierung und Kubernetes im KI-Zeitalter begeistert, ist eingeladen, mit Dynamia die nächsten Schritte zu gehen.