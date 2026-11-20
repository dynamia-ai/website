---
title: 'HAMi Meetup Shanghai Deep Dive (5): Wie iFLYTEK Multi-Business-GPU-Sharing mit Volcano + HAMi-core steuert'
linktitle: iFLYTEKs Volcano- + HAMi-core-Praxis
date: '2026-09-22'
excerpt: >-
  Forschungsjobs wollen GPUs sofort; Online-Geschäft braucht garantierte Ressourcen. Dong Jiang,
  Senior Architect bei iFLYTEK, stellte auf dem HAMi Meetup Shanghai „Building a K8s Heterogeneous
  AI Compute Base with Volcano + HAMi-core“ vor: Queues und Orchestrierung kombiniert mit
  Steuerung auf Kartenebene — unterschiedliche Geschäftsbereiche behalten ihre Ausführungspfade,
  gemeinsame Ressourcen erhalten klare Nutzungsregeln.
author: Dynamia
tags:
  - HAMi
  - HAMi Meetup
  - iFLYTEK
  - Volcano
  - HAMi-core
  - GPU Sharing
  - Heterogeneous Computing
category: Community & Events
coverImage: /images/blog/hami-meetup-shanghai-2026-volcano-hami-core/slide-07-k8s-volcano-hami-core-roles-en.png
---

Forschungsjobs wollen GPUs so schnell wie möglich; Online-Geschäft braucht stabile Ressourcengarantien; Datenverarbeitung und Modelltraining bringen jeweils eigene Orchestrierungstools mit. Eine Enterprise-AI-Plattform, die diese Workloads Rechenleistung teilen lässt, muss drei Fragen gleichzeitig beantworten: Wer darf welche Ressourcen nutzen, wann Leerlaufkapazität ausgeliehen werden kann und wie Störungen lokalisiert und behoben werden. HAMi-cores feingranulare Ressourcensteuerung muss mit Cluster-Scheduling, Geschäftsprozessen und Laufzeitprotokollen zusammenspielen.

Dies ist der fünfte Deep-Dive unserer Serie zum [HAMi Meetup Shanghai](/blog/hami-meetup-shanghai-2026). **Dong Jiang**, Senior Architect bei iFLYTEK, präsentierte „Building a K8s Heterogeneous AI Acceleration Compute Base with Volcano + HAMi-core“ — eine konkrete Kombinationspraxis. Das Team verbindet Volcanos Queueing und Orchestrierung mit HAMi-cores GPU-Ressourcensteuerung: verschiedene Geschäftsbereiche behalten ihre Ausführungspfade, gemeinsame Ressourcen erhalten klare Nutzungsregeln. Die Praxis zeigt, wie HAMi in bestehende Enterprise-Plattformen einbindet.

## Kernerkenntnisse

- iFLYTEK kombiniert Volcanos Queueing und Job-Orchestrierung mit HAMi-cores Steuerung auf Kartenebene.
- Online-Dienste und Forschungsjobs erhalten Ressourcen nach Garantiestufe; bestehende Geschäftsworkflows bleiben erhalten.
- Legacy-GPU-Sharing muss gemeinsam mit Monitoring und Fehlerbehandlung geplant werden — User-Space-Ressourcenlimits sind keine Hardware-Fehlisolation.

**Sprecher:** Dong Jiang | Senior Architect, iFLYTEK

## Volcano definiert Zuweisungsregeln; HAMi-core steuert Ressourcen auf der Karte

iFLYTEKs AI-Infrastruktur unterstützt Bildung, Gesundheitswesen und Smart-City-Geschäft mit Workloads von Datenverarbeitung über Modelltraining und Inferenz bis R&D. Verschiedene Jobs haben unterschiedliche Ansprüche. Recomputierbare, verschiebbare Forschungsjobs und stabil zu haltende Online-Dienste können nicht dieselbe Zuweisungsregel teilen.

In der Praxis läuft Kubernetes für Nodes und Basis-Runtime, Volcano für Multi-Workload-Scheduling und -Orchestrierung, HAMi-core für feingranulare GPU-Speicher- und Compute-Quotas. Volcano organisiert, wie Jobs Ressourcen erhalten; HAMi-core steuert die Nutzung innerhalb einer geteilten GPU. Mit dieser Aufteilung lässt sich Kartensharing in Job-Scheduling und Tenant-Management der Plattform einhängen.

![Aufgabenteilung von Kubernetes, Volcano und HAMi-core (Folie 7)](/images/blog/hami-meetup-shanghai-2026-volcano-hami-core/slide-07-k8s-volcano-hami-core-roles-en.png)

Auf Organisationsebene mappt die Plattform Geschäftsanforderungen auf dedizierte und gemeinsame Queues mit Mindestgarantien, Maximalquoten und Gewichten. Leerlaufkapazität kann von anderen Queues ausgeliehen und bei Bedarf regelbasiert zurückgefordert werden — Garantie und elastisches Sharing koexistieren.

![Ressourcenzuweisung zwischen dedizierten und gemeinsamen Queues (Folie 8)](/images/blog/hami-meetup-shanghai-2026-volcano-hami-core/slide-08-dedicated-shared-queues-en.png)

Ausleihe hat ihren Preis: Rückforderung kann Job-Eviction und Rebuilds auslösen. Ob ein Job recomputierbar und unterbrechbar ist, muss von vornherein ins Queue-Design. Nur wenn Sharing-Regeln den Geschäftsprioritäten entsprechen, bleibt der Druck zur höheren Auslastung kritischen Diensten fern.

## Geschäftseinstiegspunkte behalten; Ausführung unten vereinheitlichen

Enterprise-Tools wie Airflow oder Spark tragen oft jahrelange Prozesshistorie. Alle Teams auf einen neuen Orchestrierungseinstieg zu zwingen, erhöht Migrationskosten.

Dong beschrieb die Alternative: atomare Operationen eines Jobs in JobTemplates abstrahieren, Abhängigkeiten in JobFlows organisieren, Standardflüsse per Workflow-Templates wiederverwenden. Bei geänderten Parametern wie Images oder Datasets die konkrete Instanz anpassen.

Legacy-Tools behalten ihre Orchestrierungslogik und rufen zugrunde liegende Jobs über die jeweiligen Kubernetes-Operatoren auf; wenn Jobs als Pods laufen, steuern Volcano und HAMi-core Zuweisung und Kontrolle gemeinsam. Unternehmen behalten gewohnte Workflows, vereinheitlichen die Rechenebene und vermeiden Neugestaltung der Einstiegspunkte nur wegen GPU-Sharing.

Upstream- und Downstream-Daten verbinden sich über Persistent Volumes und Ähnliches — weniger Duplikate. Parallelität, Konsistenz und Speicherperformance bleiben zu lösen; gemeinsamer Storage hebt diese Anforderungen nicht auf. Für Entwicklung und Debug kann eine Instanz ab einem Workflow-Knoten mit Teildaten starten, statt jedes Mal die gesamte Pipeline zu fahren.

## Der Nutzen von HAMi-core — und seine Grenze

Auf Scheduler-Ebene: Gang-Scheduling koordiniert Ressourcenbedarfe verteilter Jobs; Binpack-Packing reduziert Fragmentierung; Lastbewusstsein beobachtet die Lücke zwischen Request und tatsächlicher Nutzung für die Platzierung.

Die Kombination löst Probleme auf verschiedenen Ebenen: Restressourcen im Cluster bedeuten nicht, dass sofort ein großer Job starten kann; der deklarierte Request spiegelt nicht immer die Laufzeitlast wider.

Dong erläuterte, dass das Team Legacy-T4- und A30-Ressourcen für Forschungsszenarien strukturierte; ein zentraler Grund für HAMi-core war feinere Speicher- und Compute-Steuerung auf heterogenen Geräten. Er zog auch die Grenze zwischen Ressourcenlimits und starker Isolation: HAMi-core steuert über User-Space-Mechanismen; bei geteilter Karte bleiben Störung und Fehlerauswirkung zwischen Geschäftsbereichen zu bewerten — es ist keine Hardware-Fehlisolation.

Überbuchungsexperimente in der Forschungsumgebung hatten klare Voraussetzungen: Experiment-Ressourcen sind von Produktion getrennt markiert, Forschungsjobs müssen Unterbrechung oder Recompute akzeptieren. Das ist nicht auf Online-Dienste mit Stabilitätsanforderung übertragbar — und bedeutet nicht, Speicher unbegrenzt überverkaufen zu können.

## Nachvollziehbares Ressourcenverhalten macht Scheduling-Regeln verbesserbar

Nach Multi-Tenant-Sharing muss die Plattform beantworten: Wer nutzte Ressourcen, wann scheiterten Jobs, in welcher Phase liefen Rückforderung und Rebuild?

Die GPU-Observability-Arbeit integriert DCGM, DCMI und weitere Schnittstellen und ergänzt Device-zu-Pod-Mapping sowie Create- und Exit-Events. Aktive Sammlung an Schlüsselpunkten des Lebenszyklus reduziert Lücken rein periodischen Monitorings und unterstützt Troubleshooting und Kostenzurechnung.

Job-Historie fließt in Policy-Anpassung: häufige Preemption, passender Memory-Request, dedizierte oder gemeinsame Queue — alles aus Laufzeitdaten.

iFLYTEKs Praxis zeigt: GPU-Sharing braucht ein vollständiges Regelwerk. HAMi-core liefert feingranulare Steuerung; Volcano bindet das in Queueing und Job-Orchestrierung; Observability hilft, Quotas und Platzierungsrichtlinien zu korrigieren. Wer Shared-GPU-Ergebnisse akzeptiert, sollte Garantien für kritische Jobs, Rückforderungsfolgen und Fehler-Nachvollziehbarkeit mitprüfen.

Was Dynamia an der Enterprise-Adoption von HAMi schätzt, ist genau diese Schnittstelle zwischen Sharing-Fähigkeit und Produktionsmanagement. Teams mit bestehenden Schedulern und Pipelines sollten zuerst Workload-Tiers, Ressourcenquoten und Fehlergrenzen klären — dann Integration und Validierung planen. iFLYTEKs Eigenbau liefert einen konkreten Referenzpunkt, wie HAMi ins bestehende System passt.

## Video und Folien

- **Bilibili-Replay:** [Keynote | Building a K8s Heterogeneous AI Compute Base with Volcano + HAMi-core — Dong Jiang](https://www.bilibili.com/video/BV1gKY563Eqd/)
- **Folien-Download:** [volcano-hami-core-k8s-ai-base-dongjiang.pdf](https://github.com/Project-HAMi/community/blob/main/hami-meetup/04-shanghai-20260906/volcano-hami-core-k8s-ai-base-dongjiang.pdf)

## Serie

- [Überblick: HAMi Meetup Shanghai Recap](/blog/hami-meetup-shanghai-2026)
- [(1) Wo HAMi in der CNCF × PyTorch Cloud Native AI Foundation steht](/blog/hami-meetup-shanghai-2026-cncf-pytorch-ai-foundation)
- [(2) Nach GPU-Sharing: Wie HAMi 2.10 Isolation, Scheduling und Observability verbessert](/blog/hami-meetup-shanghai-2026-hami-2-10-remote-gpu)
- [(3) Inferenzsteuerung vs. GPU-Ressourcenmanagement: Wie llm-d und HAMi zusammenarbeiten](/blog/hami-meetup-shanghai-2026-llm-d-inference-plane)
- [(4) GPU-Performance in Inferenzdienst-Fähigkeit: Lehren von Iluvatar](/blog/hami-meetup-shanghai-2026-iluvatar-gpu-inference)
- **(5) Wie iFLYTEK Multi-Business-GPU-Sharing mit Volcano + HAMi-core steuert** (dieser Beitrag)
- [(6) Wie UCloud HAMi-Sharing in einsatzbereite Dev-Umgebungen überführt](/blog/hami-meetup-shanghai-2026-ucloud-ai-platform)
- [(7) Vom Nutzer zum Mitgestalter: Warum Unternehmen eine nachhaltige HAMi-Community brauchen](/blog/hami-meetup-shanghai-2026-community-panel)