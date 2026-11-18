---
title: 'Dynamia und MetaX schließen llm-d-Integration ab: erste chinesische GPU im verteilten Inferenz-Ökosystem der CNCF'
linktitle: Dynamia × MetaX llm-d-Integration
date: '2026-09-09'
excerpt: >-
  Dynamia hat mit MetaX die vollständige Anpassung der MetaX C-Serie an die llm-d-Community
  abgeschlossen und Einzel-GPU-, Multi-GPU- sowie Prefill/Decode-getrennte Inferenz validiert —
  die erste chinesische GPU auf der offiziellen Unterstützungsliste von llm-d.
author: Dynamia
tags:
  - llm-d
  - MetaX
  - Chinesische GPU
  - Verteilte Inferenz
  - Prefill/Decode-Trennung
  - CNCF
  - vLLM
  - Kubernetes
category: Integration & Ecosystem
---

Dynamia hat kürzlich mit MetaX die vollständige Anpassung der MetaX C-Serie GPUs für die [llm-d](https://github.com/llm-d/llm-d)-Community abgeschlossen und Einzel-GPU-, Multi-GPU- sowie Prefill/Decode-getrennte Inferenz auf C-Serie-Hardware validiert. Damit unterstützt das cloud-native Projekt für verteilte Inferenz llm-d offiziell MetaX C-Serie GPUs — als erste chinesische GPU auf der offiziellen Akzelerator-Liste von llm-d.

In diesem Vorhaben übernahm Dynamia die Feature-Implementierung auf llm-d-Seite, die Ende-zu-Ende-Validierung und den fortlaufenden Austausch mit der Upstream-Community. MetaX stellte die vollständige Testumgebung, das vLLM-MetaX-Inferenz-Image und technische Unterstützung auf Ebene des MXMACA-Software-Stacks bereit. Gemeinsam führten beide Teams den Vorschlag durch die technische Prüfung der internationalen Community. Die llm-d-Maintainer-Liste für Akzeleratoren führt nun zwei Maintainer — je eines von beiden Unternehmen —, die den langfristigen Betrieb und die Weiterentwicklung dieses Integrationspfads gemeinsam verantworten.

## Von lauffähig bis produktionsreif

Ein großes Modell zum Laufen zu bringen, ist nur der Anfang; als skalierbarer Dienst entscheidet die Effizienz im Betrieb — und das hängt davon ab, ob sich der Chip reibungslos in einen cloud-nativen Inferenz-Scheduling-Stack einfügt. Historisch gingen Standardkonfigurationen in internationalen Open-Source-Projekten dieser Art von ausländischem Silizium aus. Selbst wenn eine chinesische GPU bereits gängige Inferenz-Engines betreiben konnte, mussten Nutzer, die die ausgereiften Deployment-Rezepte der Community nutzen wollten, zahllose versteckte Anpassungsdetails selbst lösen.

llm-d ist ein von Red Hat initiiertes, cloud-natives Framework für verteilte Inferenz, aufgebaut auf Inferenz-Engines wie vLLM und SGLang sowie auf Kubernetes, und wird heute von der CNCF (Cloud Native Computing Foundation) betreut. Das Projekt konzentriert sich auf Fähigkeiten, die in der produktiven LLM-Bereitstellung zählen — präfix-cache-bewusstes Routing, lastbewusstes Scheduling und Prefill/Decode-Trennung — und verwandelt Inferenz-Engines auf Einzelknoten in koordinierte, produktionsreife verteilte Inferenzsysteme über mehrere Knoten. Seit dem Start hat llm-d mehr als 4.400 GitHub-Stars und große Rechenplattformen wie NVIDIA GPUs, Google TPUs, AMD GPUs und Intel XPUs haben jeweils Deployment-Leitfäden in der Community etabliert.

Diese Anpassung schließt genau diese Lücke für die MetaX C-Serie und bietet drei einsatzbereite Bereitstellungspfade.

## Drei einsatzbereite Bereitstellungspfade

- **Optimierte Basis, eine GPU:** Qwen3-14B mit Tensor-Parallelismus TP=1 — validiert die grundlegende Inferenzfähigkeit der C-Serie auf dem Standard-llm-d-Model-Serving-Stack.
- **Optimierte Basis, acht GPUs:** DeepSeek-R1-Distill-Llama-70B mit TP=8 — validiert Large-Model-Serving auf einem Einzelknoten mit acht GPUs.
- **Prefill/Decode-Trennung:** Qwen3-14B in Topologie 1 Prefill + 1 Decode, mit vLLM NixlConnector und llm-d-Routing-Sidecar für KV-Cache-Transfer zwischen Instanzen. P/D-Trennung verteilt die zwei rechnerisch unterschiedlichen Inferenzphasen auf separat optimierte Instanzen — eine der zentralen Techniken zur höheren Ressourcennutzung bei LLM-Inferenz. Dieser Pfad basiert auf MIXL, einer von NIXL abgeleiteten und optimierten Transportbibliothek, die die Transfer-Effizienz deutlich verbessert und die Einstiegshürde senkt.

## Performance-Baseline mit realen Messungen

Das Team hat außerdem die gemessene Performance-Kalibrierung des llm-d-Inferenz-Routers auf C-Serie GPUs abgeschlossen: Spitzen-Prefill-Durchsatz von 5.773 Tokens/s für Qwen3-14B mit einer GPU und 5.468 Tokens/s für DeepSeek-R1-Distill-Llama-70B mit acht GPUs. Beide Ergebnisse wurden in die öffentliche Benchmark-Matrix der llm-d-Community eingetragen, sodass Nutzer auf der MetaX-Plattform eine an realer Hardware gemessene Performance-Baseline referenzieren können.

Das für die Anpassung benötigte vLLM-MetaX-Inferenz-Image wurde in einer öffentlichen Registry veröffentlicht und steht zur direkten Nutzung bereit.

## Von gemeinsamer Anpassung zu langfristiger Verantwortung

Diese Zusammenarbeit ist ein Ausgangspunkt. Dynamia wird den llm-d-Integrationspfad für MetaX C-Serie GPUs gemeinsam mit MetaX weiter pflegen und iterieren und — durch anhaltende Upstream-Zusammenarbeit — chinesisches Rechensilizium stärker in die weltweit führende Open-Source-Infrastruktur einbinden. Dynamia wird zudem mit weiteren Chip- und Ökosystempartnern zusammenarbeiten, um die gesamte Kette von heimischer Hardware über cloud-native Grundlagen bis zur Branchenbereitstellung zu stärken und die Skalierung von KI in der Industrie zu unterstützen.

## Verwandte Links

- llm-d-Projekt: <https://github.com/llm-d/llm-d>
- Anpassungs-PR: <https://github.com/llm-d/llm-d/pull/2308>
- Akzelerator-Dokumentation: <https://github.com/llm-d/llm-d/blob/main/docs/getting-started/accelerators.md>
- P/D-Trennungs-Leitfaden: <https://github.com/llm-d/llm-d/blob/main/guides/pd-disaggregation/README.md>