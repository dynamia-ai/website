---
title: 'HAMi Meetup Shanghai Deep Dive (3): Inferenz-Steuerung vs. GPU-Ressourcenmanagement — Wie llm-d und HAMi zusammenwirken können'
linktitle: 'llm-d und HAMi: Aufgabenteilung'
date: '2026-09-22'
excerpt: >-
  Mehrere Replikas desselben Modells, Round-Robin — und die Antworten wurden nicht schneller. Red Hat Greater China CTO Zhang Jiaju stellte llm-ds verteilte Inferenzebene beim HAMi Meetup Shanghai vor: prefix-bewusstes Routing, PD-Trennung, Cache-Offloading — und in der Q&A die Kooperationsrichtung mit HAMi. Request-Routing und GPU-Slicing sind zwei Schichten, die verbinden müssen, einander aber nicht ersetzen können.
author: Dynamia
tags:
  - HAMi
  - HAMi Meetup
  - llm-d
  - Verteilte Inferenz
  - KV Cache
  - PD-Trennung
  - vLLM
category: Community & Events
coverImage: /images/blog/hami-meetup-shanghai-2026-llm-d-inference-plane/slide-05-routing-inference-pool.png
---

Sie haben mehrere Replikas desselben Modells bereitgestellt, Anfragen gleichmäßig verteilt — und die Antworten wurden nicht unbedingt schneller. Ob Mehrfach-Dialoge Cache wiederverwenden können, ob Instanzen bereits queue-sättigt sind — das bestimmt, wie lange Nutzer auf eine Antwort warten. Für Enterprise-KI-Plattformen sind Request-Routing und GPU-Zuteilung zwei Schichten, die verbunden sein müssen, einander aber nicht ersetzen können.

Dies ist der dritte Deep Dive in unserer [HAMi Meetup Shanghai](/events/hami-meetup-shanghai-2026)-Serie. **Zhang Jiaju**, Red Hat Greater China CTO, hielt „llm-d: Building a Distributed Inference Plane Across Workloads, Modalities, Hardware, and Platforms“ und bot eine konkrete Architektur zur Einordnung dieser Aufgabenteilung. Er erläuterte, wie llm-d Routing, Caching und Inferenzphasen koordiniert, und in der Q&A die Kooperationsrichtung mit HAMi. Dieser Beitrag ordnet aus Plattform-Sicht: welche Probleme die Inferenz-Steuerungsebene löst und welche weiterhin Ressourcenmanagement brauchen.

## Kernaussagen

- llm-d wählt Endpunkte nach Cache-Standort und Instanzlast — ohne Cache-Hits zu jagen und Queueing zu ignorieren.
- PD-Trennung und Cache-Offloading müssen zusammen mit Netzwerk, Storage und Transfer-Overhead bewertet werden.
- HAMi und Red Hat diskutierten Ressourcen-Kooperation im Vortrag; Compute-Partitionierung nach P/D-Phase braucht pro Deployment Validierung.

**Referent:** Zhang Jiaju | Red Hat Greater China CTO

## Gleiche Request-Anzahl, sehr unterschiedliche Verarbeitungskosten

Zustandslose Dienste routen per Round-Robin; LLM-Requests unterscheiden sich stark. Unterschiedliche Eingabelängen bedeuten unterschiedliche Kosten; Mehrfach-Dialoge tragen Historie und erzeugen große wiederverwendbare Prefixe.

llm-d fließt das in die Endpunktwahl ein. Requests passieren einen Proxy; der EPP (Endpoint Picker) wählt anhand von Metriken der Inferenzinstanzen; Requests gelangen zum jeweiligen Modellservice. Ein InferencePool fasst Endpunkte zu einem Scheduling-Scope; die Inferenz-Engine führt die Rechenarbeit aus.

![Aufgabenteilung Routing, Inferenz-Pool und Modellservice bei llm-d (Folie 5)](/images/blog/hami-meetup-shanghai-2026-llm-d-inference-plane/slide-05-routing-inference-pool.png)

Prefix-bewusstes Routing berücksichtigt, wo KV Cache liegt, und sendet passende Requests an Instanzen mit Wiederverwendung — ohne wiederholte Prefill-Rechenarbeit. Cache-Hits sind aber nicht das einzige Ziel. Staut sich alles auf eine Instanz, kann Queueing die eingesparte Rechenarbeit aufheben.

Die Endpunktwahl kombiniert Cache-Affinität, Live-Last und Sättigung. Zhang beschrieb auch Latenzprognose aus historischen Samples. Bei der Bewertung müssen Unternehmen Cache-Wiederverwendung und Antwortlatenz gemeinsam beobachten — hohe Hit-Rate allein ist keine fertige Optimierung.

![Prefix- und lastbewusste Endpunktwahl (Folie 11)](/images/blog/hami-meetup-shanghai-2026-llm-d-inference-plane/slide-11-prefix-load-aware-picking.png)

## Nach PD-Trennung: Wohin mit dem Cache?

Ein LLM-Inferenzaufruf hat Prefill- und Decode-Phase. Prefill ist rechenintensiv; Decode tokenweise und speicherbandbreitenlastig. Getrennte Platzierung erlaubt passendere Ressourcen.

Nach der Trennung entstehen Koordinationsfragen: welche Instanzen übernehmen Prefill, welche Decode? Wie erreicht der KV Cache aus Phase eins Phase zwei? Rollen, Endpunkte und Transferpfade müssen mit Inferenz-Engine und Cache-Komponenten organisiert werden.

![Request-Routing und KV-Cache-Transfer bei PD-Trennung (Folie 14)](/images/blog/hami-meetup-shanghai-2026-llm-d-inference-plane/slide-14-pd-disaggregation-kv-transfer.png)

Cache-Management darf nicht nur GPU-Speicher betrachten. Speicher ist begrenzt; nach Eviction kann Neuberechnung nötig sein. Der Vortrag behandelte Offloading in Host-Speicher und Storage sowie Kooperation mit LMCache, Mooncake u. a.

Es gibt kein hardwareunabhängiges Optimum. Lokaler Storage, Transfer von anderem Knoten oder Neuberechnung — Kosten hängen von Netz und Storage ab. Mehr Caching bedeutet nicht automatisch schnellere Inferenz; Transfer-Overhead gehört zur vollen Request-Kostenrechnung.

## Control Plane koordiniert; Inferenz-Engine führt aus

Für Enterprise-Plattformen muss zuerst die Grenze zwischen Control Plane und Inferenz-Engine gezogen werden. In Zhangs llm-d-Architektur liegen Routing, Endpunktwahl, Cache-Koordination und Elastizität in der Control Plane; Modellausführung bei Engines wie vLLM. llm-d löst Cluster-Koordination, ersetzt nicht den Ausführungs-Stack.

So können Unternehmen nach Problem stapeln: Multi-Tenant braucht Prioritäten — Online und Batch haben unterschiedliche Latenz; Multi-Modell braucht Modellrouting; Cross-Node-MoE muss Expert-Parallel-Gruppen kennen. Das sind Cluster-Koordinationsprobleme, die schnellere Einzelinstanzen allein nicht lösen.

Lastvielfalt zeigt sich bei Agent-Mehrfachdialog, Multimodal und Batch. Zhang nannte sie als eigenständige Serving-Szenarien; Batch per niedriger Priorität asynchron, geteilt mit Online-Requests. Cross-Hardware hängt von Engine, Device-Adaption und Deployment — eine einheitliche Control Plane ersetzt keine Kompatibilitätsprüfung. Verfügbarkeit pro Version und Umgebung verifizieren.

Elastisches Skalieren muss Inferenz-Zustand verstehen. Neue Replikas brauchen nach Device-Zuteilung Modellladen und Warm-up. Der Vortrag behandelte Workload Autoscaling und vLLM Sleep/Wake Up zur Verkürzung der Time-to-Service. Bei Scale-out prüfen: wann Instanzen Requests annehmen — nicht nur ob der Pod existiert.

Inferenz erscheint auch in RL-Rollouts mit vielen Samples. Trainingsteams nutzen weiter Slurm, Ray oder Bare Metal; Routing sollte nicht die ganze Plattform in Kubernetes zwingen. EndpointDiscovery aktualisiert Endpunkte per Dateien und erlaubt Nicht-Kubernetes-Umgebungen cache- und lastbewusstes Routing. Erweitert wird, wo Koordination nutzbar ist — llm-d ersetzt keine Trainings-Frameworks.

Diese Richtungen hängen an Versionen und Deployment. Kombinationen und Reife gegen eigene Szenarien validieren; Roadmap ≠ alles läuft bereits im eigenen Cluster.

## Gutes Routing — dann Ressourcen an Last anpassen

Bei gemeinsamer Bewertung von llm-d und HAMi stellt sich: wie kooperieren Request-Scheduling und GPU-Slicing, und läuft PD-Trennung auf virtuellen GPUs? Zhang antwortete in der Q&A direkt.

Er sagte, HAMi und Red Hat treiben Zusammenarbeit voran und planen Teile von HAMi in llm-d-Szenarien; Beispiel für weitere Richtung: GPU-Compute zwischen Prefill- und Decode-Phase. llm-d koordiniert Inferenz-Requests und Rollen; HAMi liefert Sharing und heterogenes Device-Management. Getrennt entscheiden: welcher Endpunkt für welchen Request, welche Devices und wie viel Ressource für diese Instanz.

Diskutiert wurde eine Kooperationsrichtung zum Vortragszeitpunkt — kein fertiges General-Deployment. Hardware, Modelle und Slicing-Konfiguration brauchen Verifikation; nicht jede virtuelle GPU trägt PD-Trennung. Hardware aus Overseas-Best Practices kann von inländischen Clustern abweichen; Parameter im eigenen Umfeld retesten.

Die für Dynamia relevante Adoptionsfrage: Ressourcenkonfiguration und Inferenz-Anforderungen in einen Validierungsprozess bringen. llm-d + HAMi: gleiche Workloads fahren, Zuteilung, Queueing, Cache-Wiederverwendung und Kommunikations-Overhead getrennt prüfen, dann Gesamtantwort gegen Ziel. So unterscheidet man Ressourcenmangel von schlechtem Request-Scheduling — und welche Schicht als Nächstes optimiert wird.

## Video und Folien

- **Bilibili-Replay:** [Keynote | llm-d: Building a Distributed Inference Plane Across Workloads, Modalities, Hardware, and Platforms — Zhang Jiaju](https://www.bilibili.com/video/BV14ZYN6yEg5/)
- **Folien:** [llm-d-distributed-inference-plane-zhangjiaju.pdf](https://github.com/Project-HAMi/community/blob/main/hami-meetup/04-shanghai-20260906/llm-d-distributed-inference-plane-zhangjiaju.pdf)

## Serie

- [Überblick: HAMi Meetup Shanghai Recap](/events/hami-meetup-shanghai-2026)
- [(1) Wo passt HAMi in die CNCF × PyTorch Cloud Native AI Foundation?](/blog/hami-meetup-shanghai-2026-cncf-pytorch-ai-foundation)
- [(2) Nach GPU-Sharing: Wie HAMi 2.10 Isolation, Scheduling und Observability verbessert](/blog/hami-meetup-shanghai-2026-hami-2-10-remote-gpu)
- **(3) Inferenz-Steuerung vs. GPU-Ressourcenmanagement: llm-d und HAMi im Zusammenspiel** (dieser Beitrag)
- [(4) GPU-Leistung in Inferenz-Service-Fähigkeit: Erkenntnisse von Iluvatar](/blog/hami-meetup-shanghai-2026-iluvatar-gpu-inference)
- [(5) Wie iFLYTEK Multi-Business-GPU-Sharing mit Volcano + HAMi-core managt](/blog/hami-meetup-shanghai-2026-volcano-hami-core)
- [(6) Wie UCloud HAMi-Sharing in nutzbare Dev-Umgebungen übersetzt](/blog/hami-meetup-shanghai-2026-ucloud-ai-platform)
- [(7) Vom Nutzer zum Mitgestalter: Warum Unternehmen eine nachhaltige HAMi-Community brauchen](/blog/hami-meetup-shanghai-2026-community-panel)