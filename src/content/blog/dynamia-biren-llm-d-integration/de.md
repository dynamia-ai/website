---
title: "Dynamia und Biren Technology: BR166M-GPU-Anpassung für llm-d"
date: "2026-11-11"
excerpt: "Ein vollständiger Bereitstellungspfad für verteilte Inferenz auf chinesischer Rechenhardware"
author: "Dynamia"
category: "Integration & Ecosystem"
coverDisplay: "text"
tags:
  - llm-d
  - Biren Technology
  - BR166M
  - Verteilte Inferenz
  - Prefill/Decode-Trennung
---

Dynamia hat kürzlich mit Biren Technology zusammengearbeitet und eine Anpassung für die Biren™ 166M (BR166M) an das Open-Source-Projekt für verteilte Inferenz llm-d beigesteuert – einschließlich Standard-Inferenz sowie Prefill/Decode- (PD-) getrennter Bereitstellungskonfigurationen. Die Zusammenarbeit konzentriert sich auf Bereitstellung von Inferenzinstanzen, Anfragenkoordination und Cache-Transfer zwischen Knoten und verbindet Biren-GPUs für allgemeine Zwecke mit cloud-nativen Inferenz-Frameworks. Sie liefert eine Bereitstellungsreferenz für Unternehmen, die verteilte Modelldienste auf chinesischer Rechenhardware aufbauen.

Diese Arbeit ist eine von Dynamias fortlaufenden Praktiken zur llm-d-Mehrhardware-Anpassung. Durch gemeinsame Anpassung mit Chipherstellern und Beiträge von Bereitstellungskonfigurationen sowie Dokumentation upstream hilft Dynamia weiterhin, mehr Hardwareplattformen an offene Inferenzinfrastruktur anzubinden.

## Anpassung von Standard-Inferenz und PD-Trennung

Wenn Unternehmen große Modelle als dauerhaft laufende Dienste bereitstellen, müssen Inferenz-Engine, Anfragenrouting und Clusterressourcen zusammenspielen. Angesichts unterschiedlicher Software-Stacks und Kommunikationsbedingungen der Chips müssen Plattformteams außerdem festlegen, wie Inferenzinstanzen starten, wie Anfragen übergeben werden und wie aus der Berechnung erzeugter Cache zwischen Knoten übertragen wird.

[llm-d](https://github.com/llm-d/llm-d) ist ein Kubernetes-basiertes Open-Source-Projekt für verteilte Inferenz. Es bietet Anfragenrouting und Orchestrierung verteilter Dienste auf Basis von Inferenz-Engines wie vLLM. Bei PD-Trennung werden die Prefill-Phase (Eingabeverarbeitung) und die Decode-Phase (schrittweise Ausgabeerzeugung) getrennt bereitgestellt, sodass Plattformen Ressourcen unabhängig pro Lasttyp konfigurieren können.

Dieser Beitrag liefert sowohl Standard-Inferenz- als auch PD-getrennte Konfigurationen für die BR166M-GPU. Der PD-Pfad zielt auf die INT8-quantisierte Version von Qwen2.5-72B in einem Layout „1 Prefill + 1 Decode“: Die beiden Instanzen laufen auf verschiedenen Knoten, jede nutzt vier BR166M-GPUs mit Tensor-Parallelismus (TP=4), insgesamt acht GPUs.

Entlang dieses Pfads verarbeitet die Prefill-Instanz die Eingabe und erzeugt den KV-Cache für die nachfolgende Ausgabe; die Decode-Instanz empfängt den Cache und setzt die Generierung fort. Das Setup nutzt llm-ds Routing-Sidecar zur Anfragenkoordination und überträgt den KV-Cache via vLLM NixlConnector, sodass die beiden Knoten jeweils Eingabeverarbeitung bzw. Ausgabegenerierung übernehmen.

Die kommunikation zwischen Knoten nutzt InfiniBand RDMA über UCX mit einem CPU-Puffer für KV-Datenübertragung. Diese Konfigurationen dokumentieren den in der aktuellen Anpassung verwendeten Kommunikationspfad und bilden die Grundlage für spätere Performance-Validierung und Optimierung rund um Zielmodelle, Parallelität und Netzwerkumgebungen.

## Anpassungsarbeit in die Community einbringen

Diese Zusammenarbeit verbindet Biren-BR166M-GPUs, den BIRENSUPA™-Software-Stack und die angepasste vLLM-Inferenzumgebung mit dem Bereitstellungsablauf von llm-d. Dynamia hat auf der llm-d-Seite beigetragen – Teammitglieder reichten Änderungen ein, die Inferenz-Image-Konfiguration, Bereitstellungsparameter, Beschleunigerdokumentation und eine PD-Trennungs-Anleitung abdecken.

Für Plattformteams, die Biren-GPUs für allgemeine Zwecke einführen wollen, bietet dieses Material einen konkreten Startpunkt: Welche Runtime erforderlich ist, wie Inferenzinstanzen organisiert werden und wie Cache übertragen wird, ist in Konfigurationen und Anleitungen dokumentiert. Die Verlagerung der Anpassung in die Upstream-Zusammenarbeit ermöglicht es Hardwareanbietern, Framework-Maintainern und Nutzern, an derselben Implementierung mit gemeinsamem Feedback zu iterieren.

Die Änderungen wurden als [llm-d PR #2505](https://github.com/llm-d/llm-d/pull/2505) eingereicht, inklusive Maintainer-Informationen für den Anpassungspfad. Die PR wurde inzwischen von der Community gemergt.

## Rechenoptionen durch offene Neutralität erweitern

Rund um llm-d wird Dynamia Anpassungspartnerschaften mit weiteren Chipherstellern ausbauen und verschiedenen Hardwareplattformen helfen, dem Open-Source-Ökosystem für verteilte Inferenz beizutreten. Die Verknüpfung von Runtime, Bereitstellungskonfigurationen und Kommunikationspfaden jeder Plattform mit bestehenden Community-Workflows gibt Unternehmen konkretere Implementierungsreferenzen bei der Bewertung von Rechenoptionen und eine Grundlage für gemeinsame Wartung und Optimierung durch Software- und Hardwarepartner.

Dynamia bleibt technisch neutral und arbeitet offen mit Chipherstellern, Open-Source-Communities und Plattformpartnern rund um reale Unternehmensbereitstellungsanforderungen. Künftig wird Dynamia gemeinsame Anpassung, Bereitstellungsvalidierung und Upstream-Beiträge mit Partnern vorantreiben, Kompatibilitäts- und Wartungsbedarfe bei Versionsentwicklung verfolgen und mehr Rechenplattformen dabei unterstützen, mit gängiger Open-Source-Infrastruktur zu arbeiten – damit Unternehmen Rechenleistung nach Geschäftsanforderungen und tatsächlichen Anpassungsbedingungen wählen können.

Vollständige Anpassungskonfigurationen und weitere Fortschritte finden Sie in [dieser Anpassungs-PR](https://github.com/llm-d/llm-d/pull/2505).