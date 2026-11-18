---
title: 'HAMi Meetup Shanghai Deep Dive (7): Vom Nutzer zum Mitgestalter — warum Unternehmen eine nachhaltige HAMi-Community brauchen'
linktitle: 'Community-Panel: Vom Nutzer zum Mitgestalter'
date: '2026-09-22'
excerpt: >-
  Läuft Open Source produktiv, geht die Aufmerksamkeit über den Code hinaus: Werden Issues beantwortet,
  wie gelangen Anforderungen in die öffentliche Roadmap? Das Shanghai-Panel zu Nutzung, Beitrags-Hürden,
  Verantwortung bei KI-gestützter Entwicklung und Wissenssicherung — Kriterien jenseits der Technikwahl.
author: Dynamia
tags:
  - HAMi
  - HAMi Meetup
  - Open-Source-Community
  - CNCF
  - AI Coding
  - Open-Source-Beitrag
category: Community & Events
coverImage: /images/blog/hami-meetup-shanghai-2026/image8.png
---

Läuft Open-Source-Software in Produktion, reichen die Sorgen bald über den Code hinaus. Werden Issues beantwortet? Wie gelangen neue Anforderungen in die öffentliche Roadmap? Lassen sich Anpassungen und Tuning, in die ein Team investiert hat, langfristig gemeinsam mit der Community pflegen? Diese Fragen prägen direkt das Vertrauen von Unternehmen in Open-Source-Infrastruktur.

Dies ist der siebte und abschließende Deep-Dive unserer [HAMi Meetup Shanghai](/blog/hami-meetup-shanghai-2026)-Serie zum Community-Panel „Setting Off Again from Incubating: How Does HAMi Move Toward a More Open, More Sustainable Community?“ — Fragen, die HAMi nach dem Eintritt in CNCF Incubating weiter beantworten muss. Auf der Bühne: **Li Mengxuan**, Co-Founder und CTO von Dynamia und HAMi Maintainer; **Wang Jifei**, Entwickler bei Dynamia und HAMi Approver; **Hou Yuxi** von Transwarps KI-Tool-Plattform-Entwicklung; und **James**, Entwickler bei 4Paradigm und HAMi Approver. Für Enterprise-Platform-Teams liefert das Gespräch ein zweites Set an Bewertungskriterien neben der Technikwahl.

## Kernerkenntnisse

- Unternehmen wählen HAMi für GPU-Sharing und heterogene Anpassung; langfristige Wartungsqualität prägt die Auswahl ebenfalls.
- Klare Beitragspfade, zeitnahes Feedback und wiederverwendbares Designwissen helfen, Nutzer zu Mitgestaltern zu machen.
- KI kann beim Coden und Reviewen helfen; Anforderungsurteil, Code-Verständnis und Validierung in echter Umgebung bleiben beim Beitragenden.

## Open Source wählen heißt auch, gemeinsam pflegen zu wählen

James beschrieb, dass sein Team HAMi wegen eines konkreten Nutzungsbedarfs ins Visier nahm. Verschiedene Nutzer und interne Teams brauchten GPUs, und Szenarien wie Tests benötigten nicht unbedingt eine ganze Karte — Sharing wurde ein zentraler Auswahlfaktor.

Hou Yuxi stand vor der Wahl zwischen Eigenlösung und Community-Lösung. Das Team hatte bereits GPU-Management-Komponenten; eine neue Lösung bedeutete Abwägung zwischen bestehender Investition, Abdeckung heimischer Beschleuniger und der Fähigkeit, Features weiter auszubauen. Sie wählten HAMi für heterogene Hardware-Anpassung und die evolutionäre Kraft vielseitiger Beiträge.

Der Einstieg kann Test-Jobs auf geteilten GPUs sein oder weniger doppelte Anpassungsarbeit für heterogene Geräte. Nach längerer Nutzung müssen Unternehmen auch beurteilen, ob diese Fähigkeiten langfristig wartbar sind und ob Probleme öffentlich diskutiert werden können. Genau dort liegt der Community-Wert, den Dynamia verfolgt: gemeinsame Bedürfnisse vieler Unternehmen in einem gemeinsam gepflegten Projekt bündeln, sodass kein einzelnes Team alle Anpassung und Evolution allein trägt.

## Mit dem ersten Issue starten — und Wertvolles auffangen

Wie steigt man bei HAMi ein? Die Panelisten beschrieben konkrete Wege.

Wang Jifei empfahl, zuerst die Contribution Guidelines zu lesen, dann einen echten Bedarf unter bestehenden Issues zu finden. Die Umgebung zu verstehen, mit meldendem Nutzer und Maintainern zu diskutieren und erst dann zu implementieren reduziert Doppelarbeit und hält Beiträge nah an der Praxis.

James ergänzte, dass Beitragseinstiege nicht auf Scheduler-Code beschränkt sind. Ob Dokumentation klar ist, ob Schritte dem tatsächlichen Verhalten entsprechen — das lohnt sich zu melden. Wer mit C++ oder CUDA vertraut ist, kann HAMi-core ansehen oder andere Komponenten je nach Hintergrund. Probleme finden, Reproduktion dokumentieren, Docs verbessern — alles treibt das Projekt voran.

Die Community muss Barrieren aktiv senken. Hou Yuxi erinnerte an ein wertvolles Issue zu einer Low-Level-Concurrency-Lock-Optimierung, das lange ohne angemessene Antwort blieb; der Meldende scheute Cross-Repo-Prozess und fehlende Erfahrung und reichte keinen PR ein. Seine Sicht: zeitnahes Feedback beim ersten Issue und ersten Beitrag eines Neulings hält wertvolle Beteiligung am Laufen.

Für Enterprise-Teams sind klare Reproduktionsschritte, Umgebungsinfos und Diagnoseprozesse wirksame Inputs. Für Maintainer sind Bestätigung von Issues, Erklärung von Design-Grenzen und Wegweisung zu Beiträgen ebenso wichtig. Ob der erste Versuch aufgefangen wird, bestimmt, ob der nächste hochwertige Beitrag kommt.

## KI kann Code schreiben; der Einreicher bleibt verantwortlich für Anforderungen und Design

AI Coding bekam die meiste Zeit. Mit schnellerer Code-Produktion wächst Review-Druck. Im Fokus: ob eine Änderung wirklich nötig ist und ob der Einreicher versteht, was er einreicht.

Wang Jifei beschrieb Anpassungen der Contribution Guidelines — KI-Nutzung in PRs offenlegen und Beitragende sollen Review-Diskussion persönlich führen. In Reviews fragt er nach: aus welchem Szenario kommt die Anforderung, warum diese Implementierung, ob ein Schalter für einen Spezialfall standardmäßig an sein soll.

James betonte, dass Entwickler für den eingereichten Code verantwortlich sind. KI-gestütztes Review kann Probleme finden, ersetzt aber nicht das Verständnis der Logik durch den Einreicher. Wang Jifei ergänzte aus eigener Praxis, dass End-to-End-Validierung in echter Umgebung prüft, ob ein Feature wie gedacht funktioniert.

Für Enterprise-Infrastruktur-Teams bedeutet das: Review muss nicht nur Code, sondern Anforderungsgrundlage, Verhaltensänderungen und Validierungsergebnisse prüfen. Besonders bei Defaults und Kompatibilität kann die Wirkung weit über das auslösende Szenario hinausgehen.

## Nächste Phase: zuerst Wissen und echte Workloads verstehen

Ob HAMi dedizierte MCP-Tools braucht, gewichteten die Panelisten unterschiedlich.

Wang Jifei: bei KI-Troubleshooting liegt die Schwierigkeit oft im Urteil, wo das Problem liegen könnte — mehr Tools lösen das nicht direkt. Hou Yuxi würde Designentscheidungen und Implementierungskontext sammeln, um der KI mehr Kontext bei Logs und Code zu geben. James sah aus Neulingssicht bequeme Log- und Laufzeitzustandssammlung mit Erstanalyse als Weg, die Troubleshooting-Hürde zu senken — die Form muss nicht MCP sein.

Kein einheitliches Tooling-Fazit, aber eine Richtung: Nutzer das System verstehen zu lassen braucht zugängliche Laufzeitinfos und Wissen, warum das System so designt ist.

Zur Rolle von HAMi im LLM-Trend reduzierte niemand die Zukunft auf einen Workload. Wang Jifei nannte Zusammenspiel großer/kleiner Modelle, Routing-Modelle und kleine Modelle für spekulative Dekodierung. Hou Yuxi: GPU-Knoten seien bereits auf LLM-Inferenz fokussiert, feingranulare Slicing-Nachfrage heute weniger prominent; er nannte Embedding, Spracherkennung und mögliches Sharing bei Inferenzphasen-Trennung. James betonte heimische Compute-Anpassung. HAMis Wert ist an echte Workloads zu messen: sharing-taugliche Tasks nutzen feingranulare Ressourcen; Whole-Card- oder Multi-Card-Jobs behalten ihre Form — das Sharing-Verhältnis darf Geschäftsanforderungen nicht überstimmen.

Dynamias Haltung beim Mitaufbau von HAMi: Unternehmensprobleme, Validierungserfahrung und Designdiskussion in offene Zusammenarbeit bringen — Community-Wert nicht auf Feature-Zählung reduzieren. Das Panel benannte Verbesserungsbedarf: Neuling-Feedback auffangen, Designkontext leicht auffindbar machen, bei KI-unterstützter Entwicklung weiterhin Anforderungen erklären und Validierung verantworten. Für Enterprise-Nutzer soll eine nachhaltige Community Adoptierende schrittweise zur Mitgestaltung befähigen; für HAMi entscheiden diese Alltags-Kollaborationen, ob Sharing und heterogene Anpassung mit echter Nutzung Schritt halten.

Starten Sie mit einem echten Problem, einer Diskussion oder einer Doc-Verbesserung — und werden Sie Teil der HAMi-Community.

## Video

- **Bilibili-Replay:** [Panel | Setting Off Again from Incubating: How Does HAMi Move Toward a More Open, More Sustainable Community?](https://www.bilibili.com/video/BV1wkYV6ZEEo/)

## Serie

- [Überblick: HAMi Meetup Shanghai Recap](/blog/hami-meetup-shanghai-2026)
- [(1) Wo passt HAMi in CNCF × PyTorch Cloud Native AI Foundation?](/blog/hami-meetup-shanghai-2026-cncf-pytorch-ai-foundation)
- [(2) Nach GPU-Sharing: HAMi 2.10 zu Isolation, Scheduling und Observability](/blog/hami-meetup-shanghai-2026-hami-2-10-remote-gpu)
- [(3) Inferenz-Steuerung vs. GPU-Ressourcenmanagement: llm-d und HAMi](/blog/hami-meetup-shanghai-2026-llm-d-inference-plane)
- [(4) GPU-Performance in Inferenzdienst: Erkenntnisse von Iluvatar](/blog/hami-meetup-shanghai-2026-iluvatar-gpu-inference)
- [(5) iFLYTEK: Multi-Business-GPU-Sharing mit Volcano + HAMi-core](/blog/hami-meetup-shanghai-2026-volcano-hami-core)
- [(6) UCloud: HAMi-Sharing als fertige Dev-Umgebungen](/blog/hami-meetup-shanghai-2026-ucloud-ai-platform)
- **(7) Vom Nutzer zum Mitgestalter: warum Unternehmen eine nachhaltige HAMi-Community brauchen** (dieser Beitrag)