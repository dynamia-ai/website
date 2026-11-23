---
title: 'HAMi Meetup Shanghai Deep Dive (4): GPU-Leistung in Inferenz-Service-Fähigkeit – Praxis von Iluvatar CoreX'
linktitle: Iluvatar CoreX GPU-Inferenz in der Praxis
date: '2026-09-22'
excerpt: >-
  Die GPU benchmarkt gut, Nutzer warten dennoch auf den ersten Token oder spüren Stockungen mitten in der
  Generierung. Ye Chenglin, Infra R&D Director bei Iluvatar CoreX (天数智芯), skizzierte auf dem HAMi Meetup Shanghai
  den Engineering-Pfad für domestic-GPU-Inferenz: Ausführungsoptimierung, topologiebewusstes Scheduling und
  Inferenz-Orchestrierung – Akzeptanz über End-to-End-SLOs, mit HAMi für GPU-Sharing bei Kleinmodellen.
author: Dynamia
tags:
  - HAMi
  - HAMi Meetup
  - Iluvatar CoreX
  - GPU Inference
  - PD Disaggregation
  - SLO
  - llm-d
  - Domestic GPU
category: Community & Events
coverImage: /images/blog/hami-meetup-shanghai-2026-iluvatar-gpu-inference/slide-03-ecosystem-to-slo-metrics.png
---

Die Rechenleistung der GPU ist gut – dennoch warten Nutzer auf den ersten Token oder spüren Ruckler während der Generierung. Beim Enterprise-Deployment von LLMs stammen solche Probleme nicht zwingend vom Chip. Wo Ressourcen platziert werden, wie Anfragen geroutet werden, wie Cache wandert, wann eine neue Replik wirklich bereit ist – all das prägt das finale Erlebnis.

Dies ist der vierte Deep Dive in unserer Serie [HAMi Meetup Shanghai](/events/hami-meetup-shanghai-2026). **Ye Chenglin**, Infra R&D Director bei Iluvatar CoreX, präsentierte „High-Performance Inference Deployment on Iluvatar GPUs“ – Arbeitsteilung zwischen Ausführungsoptimierung, Topologie-Scheduling und Inferenz-Orchestrierung sowie der Nutzung von HAMi für GPU-Sharing bei Kleinmodellen. Für Enterprise-Plattformen liegt der Nutzen darin, Ressourcenformen pro Workload zu wählen und mit End-to-End-Metriken zu prüfen, ob die Schichten wirklich zusammenspielen.

## Kernaussagen

- Akzeptanz für Inferenzdienste muss First-Token-, Inter-Token- und Tail-Request-Performance betrachten – nicht Einzelkarten-Benchmarks.
- Ressourcenplatzierung, Request-Routing und Ausführungskommunikation haben jeweils ihre Rolle; HAMi deckt den On-Demand-GPU-Sharing-Zweig für Kleinmodelle.
- PD-Disaggregation muss zusätzliche Cache-Transfer-Kosten zurückgewinnen; eine neue Replik gilt als bereit, wenn sie qualifizierenden Traffic bedient.

**Speaker:** Ye Chenglin | Infra R&D Director, Iluvatar CoreX (天数智芯)

## Kompatible Schnittstellen als Einstieg; End-to-End-SLO als Akzeptanzmaßstab

Ye beschrieb die technische Route: upstream kompatibel mit OpenAI API und vLLM; downstream Performance über Iluvatars Stack: IxFormer, IXInfer, ixDNN, ixBLAS und IXCCL.

Upstream-Kompatibilität erhält bekannte Schnittstellen; Downstream-Optimierung zielt auf Compute- und Kommunikationseigenschaften der GPU. Beides muss in spürbaren Metriken landen.

Fokus des Vortrags: TTFT (Time to First Token), TPOT (Time per Output Token) – besonders P99 – sowie Cluster-Durchsatz und effektive Token-Ausgabe. Ob Tail-Requests die Latenzgrenze halten, gehört zur Service-Akzeptanz.

![Vom Ökosystem und Execution-Stack zu End-to-End-Metriken (Folie 3)](/images/blog/hami-meetup-shanghai-2026-iluvatar-gpu-inference/slide-03-ecosystem-to-slo-metrics.png)

Eine domestic-GPU-Inferenzlösung bewertet man daher, indem man eine Anwendungsanfrage bis zur Ausgabe durchverfolgt. Ein schneller Operator beweist lokale Fähigkeit; Nutzer brauchen die gesamte Service-Kette mit gehaltenem SLO.

## Ressourcenplatzierung, Request-Routing und Kleinmodell-Sharing – wer löst was

Leere GPUs im Cluster bedeuten nicht, dass beliebige Kombinationen funktionieren. Getrenntes Prefill und Decode machen GPU–NIC-Anbindung, PCIe- und NUMA-Topologie und Cross-Node-Pfade relevant für Cache-Bewegung und Latenz.

Die Control Plane im Vortrag organisiert Ressourceninformationen, Monitoring-Metriken und Topologie-Erkennung; ix-gpu-scheduler trifft topologiebewusste Platzierungsentscheidungen, zusammen mit Volcano. Ziel: passende GPU- und RDMA-Ressourcen für Inferenzinstanzen und Vermeidung unnötiger Cross-Device-/Cross-Node-Transfers.

![Topologiebewusste gemeinsame Platzierung von GPU und RDMA (Folie 7)](/images/blog/hami-meetup-shanghai-2026-iluvatar-gpu-inference/slide-07-gpu-rdma-topology-placement.png)

Sind Anfragen im Dienst, wählen llm-d Proxy und EPP Endpunkte anhand KV-Cache-Affinität und Live-Last; Modell-Compute und parallele Kommunikation im Pool gehen an Iluvatars Execution-Stack und IXCCL.

Die beiden Scheduling-Schichten nicht vermischen. Ressourcenplatzierung entscheidet, auf welchem Geräteset eine Instanz läuft; Request-Routing, welche Instanz die aktuelle Anfrage bedient. Selbst bei gutem Routing belastet schlechte Topologie über Kommunikationskosten.

HAMi hat hier eine klare Rolle. Ye erklärte: Bei GPU-Sharing für Kleinmodelle nutzt das Team HAMi; die Architektur listet es als On-Demand-Zweig. HAMi für Kleinmodell-Sharing, llm-d für Endpoint-Auswahl und Inferenzphasen-Koordination, Iluvatars Stack und IXCCL für Compute und Kommunikation. Beim Zusammenstellen müssen Sharing-Konfiguration, Inferenz-Orchestrierung und Execution-Stack getrennt validiert werden.

![Control-Plane-Aufteilung und HAMi-Kleinmodell-Sharing-Zweig (Folie 6)](/images/blog/hami-meetup-shanghai-2026-iluvatar-gpu-inference/slide-06-control-plane-hami-sharing.png)

## Lohnt sich PD-Disaggregation? Zusätzliche Kosten einrechnen

Prefill ist compute-lastig; Decode sensibler für Speicherbandbreite, KV-Kapazität und parallele Queues. Getrennte Pools erlauben eigenes Batching und Ressourcenkonfiguration und reduzieren gegenseitige Störung.

Ye betonte aber: unterschiedliche Engpässe bedeuten nicht automatisch schneller durch Trennung. PD-Trennung addiert KV-Cache-Transfer, zusätzliches Routing, Remote-Queueing und Recovery-Kosten. Es lohnt sich nur, wenn Gewinne die Mehrkosten decken und das SLO hält.

Klare Grenze im Vortrag: kurze Prefixe, niedrige Parallelität oder überlastete Links → eher Co-Location. Für passende Workloads gibt es kein universelles P/D-Verhältnis. In der Q&A beschrieb Ye Load-Tests vor Go-Live zur Verhältnisfindung, dann topologiebasierte Anpassung beim Deployment; Online-Scale-Out-Policies werden noch erforscht.

![PD-Disaggregation: Gewinne, Mehrkosten, wann aktivieren (Folie 11)](/images/blog/hami-meetup-shanghai-2026-iluvatar-gpu-inference/slide-11-pd-disaggregation-tradeoffs.png)

Cache-Affinität braucht ähnliche Abwägungen. Hohe Hit-Rate auf einer Instanz heißt nicht, jede Anfrage dorthin zu leiten. Bei tiefen Queues müssen Endpoint-Selektion Queue-Tiefe und Cache-Treffer neu gewichten – als Tuning-Ansatz, kein validiertes universelles Parameterset.

## Scale-Out ist fertig, wenn der erste qualifizierende Token ankommt

Nach Gerätezuteilung durchläuft eine neue Replik Modellladen, Kernel-/Graph-Warmup und Routing-Bereitschaft. Ein laufender Container ist noch keine Geschäftskapazität.

Der Vortrag verfolgt die Kette von Gerätezuteilung und Topologie-Binding bis zum ersten SLO-konformen Token. Halb geladene oder halb erholt Instanzen dürfen nicht als verfügbare Kapazität zählen – sonst wirkt Scale-Out erfolgreich, während Anfragen weiter warten oder scheitern.

![Bereitschaftskette von Gerätezuteilung zum ersten qualifizierenden Token (Folie 8)](/images/blog/hami-meetup-shanghai-2026-iluvatar-gpu-inference/slide-08-device-allocation-to-first-token.png)

Zur Verkürzung nannte Ye damals in Erkundung: ModelExpress, Snapshot und KVCR – Gewichtswiederverwendung, Prozess-/GPU-Zustandswiederherstellung, KV-Cache-Lifecycle. Als Versuche/Validierung, keine gelieferten Performance-Ergebnisse.

![Erkundungen zu Gewichten, Prozesszustand und KV-Cache (Folie 12)](/images/blog/hami-meetup-shanghai-2026-iluvatar-gpu-inference/slide-12-reuse-explorations.png)

Für Enterprise-Plattformen zwei Urteile beim Adoption trennen: ob ein Großmodell PD-Disaggregation nutzt – Nutzen-Kosten aus Compute, Cache-Transfer und Queueing; ob ein Kleinmodell GPU-Sharing nutzt – Kontention und Service-Verhalten nach Sharing. Im Enterprise-Kontext von HAMi fokussiert Dynamia darauf, share-freundliche Workloads in genau diese Validierung zu bringen: Stress mit realen Inputs, Parallelität und Hardware, gemeinsam First-Token, Dauergenerierung und Replik-Bereitschaft beobachten, damit Effizienzgewinne dem Business-Erlebnis standhalten.

## Video und Folien

- **Bilibili-Replay:** [Keynote | High-Performance Inference Deployment on Iluvatar GPUs — Ye Chenglin](https://www.bilibili.com/video/BV1toYN6LEuc/)
- **Folien:** [iluvatar-gpu-inference-deployment-yechenglin.pdf](https://github.com/Project-HAMi/community/blob/main/hami-meetup/04-shanghai-20260906/iluvatar-gpu-inference-deployment-yechenglin.pdf)

## Serie

- [Überblick: HAMi Meetup Shanghai Recap](/events/hami-meetup-shanghai-2026)
- [(1) Wo passt HAMi in die CNCF × PyTorch Cloud Native AI Foundation?](/blog/hami-meetup-shanghai-2026-cncf-pytorch-ai-foundation)
- [(2) Nach GPU-Sharing: HAMi 2.10 bei Isolation, Scheduling und Observability](/blog/hami-meetup-shanghai-2026-hami-2-10-remote-gpu)
- [(3) Inferenz-Steuerung vs. GPU-Ressourcenmanagement: llm-d und HAMi zusammen](/blog/hami-meetup-shanghai-2026-llm-d-inference-plane)
- **(4) GPU-Leistung in Inferenz-Service-Fähigkeit: Lehren von Iluvatar** (dieser Beitrag)
- [(5) Wie iFLYTEK Multi-Business-GPU-Sharing mit Volcano + HAMi-core steuert](/blog/hami-meetup-shanghai-2026-volcano-hami-core)
- [(6) Wie UCloud HAMi-Sharing in nutzbare Dev-Umgebungen übersetzt](/blog/hami-meetup-shanghai-2026-ucloud-ai-platform)
- [(7) Vom Nutzer zum Co-Builder: warum Unternehmen eine nachhaltige HAMi-Community brauchen](/blog/hami-meetup-shanghai-2026-community-panel)