---
title: 'HAMi Meetup Shanghai Deep Dive (1): Wo steht HAMi in der CNCF × PyTorch Cloud-Native-KI-Foundation?'
linktitle: HAMis Platz im CNCF- × PyTorch-Stack
date: '2026-09-22'
excerpt: >-
  Das Modell läuft, das Geschäft nicht. Ein Team wartet auf GPUs, während die Geräte
  eines anderen brach liegen. In seinem Eröffnungs-Keynote auf dem HAMi Meetup Shanghai
  skizzierte CNCF China Director Keith Chan eine Schichtenarchitektur der Cloud-Native-KI-F&E –
  mit HAMi in Scheduling und Ressourcenmanagement für heterogenes Compute-Sharing. Diese
  Position zeigt, was HAMi löst und welche Komponenten noch dazugehören.
author: Dynamia
tags:
  - HAMi
  - HAMi Meetup
  - CNCF
  - PyTorch
  - Cloud Native
  - KI-Infrastruktur
  - Heterogene Computing
category: Community & Events
coverImage: /images/blog/hami-meetup-shanghai-2026-cncf-pytorch-ai-foundation/slide-08-layered-architecture.png
---

Das Modell läuft, das Geschäft nicht. Ein Team wartet auf GPUs, während anderswo Geräte untergenutzt bleiben. Für Enterprise-KI-Plattformteams sitzt die Schwierigkeit meist an den Nahtstellen zwischen Modellen, Toolchains und Infrastruktur. Mit wachsender Modellzahl werden daraus Kosten-, Kollaborations- und Betriebsdruck.

Dies ist der erste Deep Dive in unserer [HAMi Meetup Shanghai](/blog/hami-meetup-shanghai-2026)-Serie. **Keith Chan**, CNCF China Director und Vizepräsident Linux Foundation APAC, eröffnete mit „CNCF x PyTorch: Building a Cloud Native AI R&D Foundation for Industry Adoption“ und einem Schichtenmodell der Zusammenarbeit. Dort nimmt HAMi die Scheduling- und Ressourcenschicht ein – heterogenes Compute-Sharing und -Management. Aus Unternehmenssicht klärt diese Position, was HAMi-Adoption löst und welche weiteren Komponenten nötig sind.

## Kernerkenntnisse

- HAMi liegt in Scheduling und Ressourcenmanagement und teilt die Arbeit mit Modellframeworks und Workflow-Komponenten.
- Die HAMi-core-Zusammenarbeit mit dem KAI Scheduler zeigt, wie Sharing-Kontrollen in verschiedene Schedulersysteme einbinden.
- Unternehmen können mit einem Trainingsjob und einem Inferenzdienst prüfen, ob Anforderung, Ausführung und Beobachtung zusammenpassen.

**Speaker:** Keith Chan | CNCF China Director, Linux Foundation APAC Vice President

## Die Foundation durchbricht Kosten-, Effizienz- und Skalenprobleme

Keith rahmte Enterprise-KI-Adoption als Kostenexplosion, Effizienzengpässe und begrenzte Skalierung.

Kostendruck geht über GPU-Anschaffung hinaus. Ohne einheitliches Scheduling halten kleine Jobs Geräte dauerhaft, Leerlauf erreicht andere Teams nicht. Wiederholtes Environment-Setup und Toolchain-Integration binden Engineering-Zeit.

Effizienzprobleme ziehen sich von Entwicklung bis Produktion. Wenn Dev, Training und Deployment in verschiedenen Umgebungen laufen, kämpfen Teams mit Dependencies, Konfiguration und Übergaben. Ein Modell in der Forschungsumgebung ist nicht automatisch produktionsreif.

Mit mehr Geschäftslinien werden manuelle Prozesse unhaltbar: einheitliches Deployment, Ressourcenzuteilung, Fehlerdiagnose – alles braucht klare Plattformfähigkeiten und Kooperationsregeln.

Ziel der Cloud-Native-KI-F&E-Foundation: Daten, Training, Deployment und Betrieb verbinden – mit standardisierten Prozessen, Automatisierung und Ressourcen-Scheduling, damit nicht jedes Projekt die Infrastruktur neu baut.

## Wo CNCF und PyTorch sich treffen: im vollständigen Workflow

Statt ein Einzelprojekt zu sein, präsentierte der Vortrag ein Schichtenmodell der Zusammenarbeit.

Unten: Kubernetes für Container-Orchestrierung, Knoten, Netzwerk, Storage. Darüber: Volcano für Batch-Scheduling, Kueue für Job-Warteschlangen und Quotas, HAMi für heterogenes Device-Sharing und -Management. Alle adressieren Ressourcen, aber auf verschiedenen Granularitäten: Warteschlangen legen Regeln für Job-Ressourcen fest; Device-Management muss auch klären, wie eine Karte mehrere Jobs bedient.

Darüber: Training-Orchestrierung, Model Serving, Pipelines. Kubeflow Trainer, KServe, Argo Workflows u. a. strukturieren konkrete Tasks in handhabbare Lifecycles. PyTorch und Training/Fine-Tuning/Inferenz-Tooling tragen Modell-Compute und -Ausführung.

![Schichtenarchitektur der Cloud-Native-KI-F&E-Foundation (Folie 8)](/images/blog/hami-meetup-shanghai-2026-cncf-pytorch-ai-foundation/slide-08-layered-architecture.png)

Diese Arbeitsteilung hilft Plattformteams: Bei einem Engpass – welche Schicht ändern? Job-Warteschlange und langsame Modellausführung sind nicht dasselbe; Queue-Konfiguration, Device-Zuteilung und Modell-Runtime sind nicht austauschbar.

Komponierbar heißt nicht: alles auf einmal deployen. Zuerst klären, welche Training-, Inferenz- und Governance-Fähigkeiten das Geschäft braucht, dann Implementierungen wählen – sonst wächst die Plattform, ohne dass das Geschäft sie nutzen kann.

## Uber-Case: Grenzen zwischen Modell, Ausführung und Ressourcen

Keith nutzte Ubers Michelangelo-Plattform für Schichten im Training und in der Infrastruktur.

PyTorch und DeepSpeed für Training, Ray als verteilte Ausführungsschicht, Kubernetes für GPU-Cluster – Modelldefinition, verteilte Ausführung und Ressourcenmanagement auf getrennten Schichten, klarere Zusammenarbeit.

![Schichten in verteiltem Training (Folie 10)](/images/blog/hami-meetup-shanghai-2026-cncf-pytorch-ai-foundation/slide-10-distributed-training-layers.png)

Wichtig sind Verantwortungsgrenzen – nicht der konkrete Stack.

Für Unternehmen mit bestehender KI-Plattform: Framework-Upgrade soll Ressourcenmanagement nicht neu schreiben; mehr GPU-Kapazität soll das Algorithmenteam nicht alles über Scheduling neu lernen lassen. Saubere Schnittstellen und Schichten lassen Raum für Upgrade, Ersatz und Erweiterung.

## HAMis Wert: heterogenes Device-Sharing und Ressourcenkontrolle

In Keiths Foundation adressiert HAMi die Ressourcenschicht: teilbare Tasks nutzen GPUs on demand, verschiedene Beschleuniger unter einheitlichem Management. Training und Ausführung bleiben in den Frameworks darüber; HAMi liefert Sharing, Limits und Scheduling. Der Uber-Case illustriert Schichten – kein HAMi-Adoptionsbericht.

Keith erwähnte auch HAMi-core im KAI Scheduler – Sharing-Kontrollen kooperieren mit verschiedenen Schedulersystemen. Adoption kann bei Ressourcenlücken der bestehenden Plattform starten; Frameworks, Workflows und Scheduler müssen nicht monolithisch ersetzt werden.

Grenzen bleiben klar: Hardware, Treiber und Anpassungspfade liefern unterschiedliches Sharing und Isolation; Nutzerraum-Limits sind keine Hardware-Fehlisolation. Plattformen müssen mit eigenen Workloads prüfen, dass Quotas greifen und Jobs sich nicht stören.

## Ein durchgängiger Pfad schlägt Komponentenstapel

Im zweiten Teil ging Keith auf Kompatibilität ein. Derselbe KI-Workload kann unter verschiedenen GPU-Treibern, Netzwerken oder Autoscaling unterschiedlich laufen. Umgebung unten ok, Modell oben ok – die Kombination braucht Verifikation.

Er stellte Kubernetes AI Conformance vor: standardisierte Tests reduzieren Unsicherheit zwischen Infrastruktur und KI-Workloads. Für Unternehmen gehört Kompatibilitätsprüfung in Auswahl und Lieferung, mit Tests unter realer Last – nicht nur Komponentennamen.

Konkreter Start: einen Trainingsjob und einen Inferenzdienst, vollständigen Train-to-Infer-Pfad auf dem bestehenden Kubernetes-Cluster, schrittweise Ressourcenmanagement, Monitoring und Automatisierung ergänzen.

![Praktischer Startpunkt von Training bis Inferenz (Folie 15)](/images/blog/hami-meetup-shanghai-2026-cncf-pytorch-ai-foundation/slide-15-practice-starting-point.png)

Für Dynamia gilt: Enterprise-KI-Foundation gegen eine echte Geschäftskette bewerten – laufen Training und Inferenz durchgängig, werden Ressourcenanfragen eingehalten, ist Verhalten nach Sharing beobachtbar? HAMi ist Open-Source-Basis für heterogenes Compute-Management; Adoptierende tragen Integration, Geräteanpassung und Betrieb. Klare Verantwortlichkeiten machen aus Open Source nutzbare Infrastruktur.

## Video und Materialien

- **Bilibili-Replay:** [Opening Keynote | CNCF x PyTorch: Building a Cloud Native AI R&D Foundation for Industry Adoption — Keith Chan](https://www.bilibili.com/video/BV1dnYK6ZE7Q/)
- **Event-Materialien:** [HAMi Meetup Shanghai Ressourcensammlung (GitHub)](https://github.com/Project-HAMi/community/tree/main/hami-meetup/04-shanghai-20260906)

## Serie

- [Überblick: HAMi Meetup Shanghai Recap](/blog/hami-meetup-shanghai-2026)
- **(1) Wo steht HAMi in der CNCF × PyTorch Cloud-Native-KI-Foundation?** (dieser Beitrag)
- [(2) Nach GPU-Sharing: wie HAMi 2.10 Isolation, Scheduling und Observability verbessert](/blog/hami-meetup-shanghai-2026-hami-2-10-remote-gpu)
- [(3) Inferenzsteuerung vs. GPU-Ressourcenmanagement: llm-d und HAMi](/blog/hami-meetup-shanghai-2026-llm-d-inference-plane)
- [(4) GPU-Performance in Inferenzfähigkeit: Erkenntnisse von Iluvatar](/blog/hami-meetup-shanghai-2026-iluvatar-gpu-inference)
- [(5) iFLYTEK: Multi-Business-GPU-Sharing mit Volcano + HAMi-core](/blog/hami-meetup-shanghai-2026-volcano-hami-core)
- [(6) UCloud: HAMi-Sharing in nutzbare Entwicklungsumgebungen](/blog/hami-meetup-shanghai-2026-ucloud-ai-platform)
- [(7) Vom Nutzer zum Mitgestalter: warum Unternehmen eine nachhaltige HAMi-Community brauchen](/blog/hami-meetup-shanghai-2026-community-panel)