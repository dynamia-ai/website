---
title: "Dynamia erweitert sein GPU-Ökosystem: llm-d-Integration mit Iluvatar CoreX"
date: "2026-10-20"
excerpt: "Dynamia und Iluvatar CoreX haben die Integration und Ende-zu-Ende-Validierung einer getrennten Prefill/Decode-Bereitstellung von llm-d auf Produkten wie Tiangai 300 abgeschlossen. Die Änderungen umfassen Modellladen, verteiltes Scheduling und Inferenzausgabe und wurden an das Upstream-Projekt übermittelt."
author: "Dynamia"
tags:
  - "llm-d"
  - "Iluvatar CoreX"
  - "Tiangai 300"
  - "Chinesische GPU"
  - "Prefill/Decode-Trennung"
  - "Verteilte Inferenz"
  - "CNCF"
category: "Integration & Ecosystem"
coverDisplay: "text"
---

Die Bereitstellung großer Sprachmodelle auf chinesischen GPU-Plattformen erfordert das Zusammenspiel von Hardware, Inferenz-Engines und Clusterverwaltung. Zuverlässiges Laden der Modelle, die Verteilung von Anfragen auf Inferenzinstanzen und der Datenaustausch zwischen diesen Instanzen gehören zu den konkreten Herausforderungen verteilter Inferenzdienste.

Für diese Anforderungen haben **Dynamia und Iluvatar CoreX die Integration und Ende-zu-Ende-Validierung einer getrennten Prefill/Decode-Bereitstellung von llm-d auf Produkten wie Tiangai 300 abgeschlossen**. Die Arbeiten decken den gesamten Ablauf vom Modellladen über das verteilte Scheduling bis zur Inferenzausgabe ab. Die entsprechenden Änderungen wurden an die Upstream-Community von llm-d übermittelt.

## Durchgängige Bereitstellung für getrennte Prefill/Decode-Inferenz

llm-d ist ein auf Kubernetes basierendes Open-Source-Framework für verteilte Inferenz und ein CNCF-Sandbox-Projekt. Es ergänzt Inferenz-Engines um Anfragerouting, Inferenz-Scheduling und die Trennung von Prefill und Decode. Plattformteams können damit mehrere Inferenzinstanzen zu einem gemeinsam arbeitenden Modelldienst zusammenführen.

Die Prefill/Decode-Trennung teilt die LLM-Inferenz in zwei Phasen auf: Prefill verarbeitet die Eingabe, Decode erzeugt schrittweise die Ausgabe. Durch die getrennte Bereitstellung lassen sich Ressourcen unabhängig konfigurieren. Gleichzeitig müssen Anfragen koordiniert und KV-Caches zwischen Instanzen übertragen werden. Bei der Anpassung an neue Hardware sind diese Komponenten mit der Inferenz-Engine und ihrer Laufzeitumgebung zu verbinden.

Die Zusammenarbeit umfasste gemeinsame Fehlersuche und Validierung entlang dieses Ablaufs. Anhand von Qwen3.8-27B und DeepSeek V4 Flash wurden Modellladen, verteiltes Scheduling und Inferenzausgabe geprüft. Die Arbeiten binden die Hard- und Softwareumgebung von Iluvatar CoreX in die Bereitstellung von llm-d ein und schaffen eine Integrationsgrundlage für verteilte Modelldienste auf chinesischen GPUs.

## Gemeinsame Implementierung, Validierung und Upstream-Integration

**Dynamia übernahm die Implementierung auf der llm-d-Seite, die Ende-zu-Ende-Validierung und die laufende Abstimmung mit der Upstream-Community.** Das Team arbeitete an der Bereitstellung von Inferenzinstanzen, Routingkonfiguration und Prefill/Decode-Koordination. Gemeinsam mit den Upstream-Mitwirkenden wurden die Änderungen geprüft und in den Hauptzweig übernommen.

Iluvatar CoreX stellte die Hardware-Laufzeitumgebung, Inferenz-Images und vollständige Softwareunterstützung bereit. Dazu gehörte die Abstimmung von Hardwaretreibern, Kommunikationsbibliotheken und Inferenz-Framework. Beide Teams brachten ihre Beiträge auf Framework- beziehungsweise Plattformseite ein und validierten gemeinsam den vollständigen Bereitstellungsablauf.

Code und Konfiguration wurden über [llm-d PR #2381](https://github.com/llm-d/llm-d/pull/2381) in den Hauptzweig übernommen. Sie enthalten Beschreibungen des Beschleunigers, Konfigurationen für die getrennte Prefill/Decode-Bereitstellung und Angaben zu den Maintainers. Entwickler können die Implementierung prüfen, die Bereitstellungskonfigurationen nutzen und die weitere Pflege verfolgen.

## Offene, neutrale Zusammenarbeit im Ökosystem

Inferenz-Frameworks, Modelle sowie Hard- und Softwarestacks entwickeln sich kontinuierlich weiter. Integrationen müssen daher mit neuen Versionen gepflegt werden. Beide Unternehmen haben technische Fachkräfte für die Wartung dieser Integration eingeplant, um Rückmeldungen der Community, Funktionserweiterungen und weitere Entwicklungsschritte zu begleiten.

Von der vorherigen Zusammenarbeit mit MetaX bis zur gemeinsamen Validierung mit Iluvatar CoreX verbindet Dynamia chinesische Rechenplattformen mit cloudnativen Inferenz-Frameworks. Im Sinne der offenen und neutralen Ausrichtung von Dynamia und HAMi arbeiten wir weiterhin mit Chipherstellern, Inferenz-Frameworks und Plattformpartnern an Integration, Bereitstellungsvalidierung und langfristiger Wartung. Das fördert die Zusammenarbeit von Hard- und Software und unterstützt Unternehmen dabei, Rechenressourcen nach ihren geschäftlichen Anforderungen auszuwählen und zu kombinieren.

Die Änderungen und weitere Fortschritte finden Sie im [Integrations-Pull-Request](https://github.com/llm-d/llm-d/pull/2381). Informationen zum Framework und zur Bereitstellung stehen im [llm-d-Projekt-Repository](https://github.com/llm-d/llm-d).
