---
title: "HAMi wird CNCF-Incubating-Projekt: Dynamia positioniert sich auf der kritischen Spur der KI-Recheneffizienz"
linktitle: "Dynamia zur KI-Recheneffizienz"
date: '2026-07-07'
excerpt: >-
  Am 2. Juli 2026 wurde HAMi, das von Dynamia gegründete und lange geführte Open-Source-Projekt, offiziell CNCF-Incubating-Projekt. Als einziges Open-Source-Projekt mit Fokus auf heterogene GPU-Virtualisierung und effizientes Scheduling, das die CNCF-Incubating-Stufe erreicht hat, signalisiert HAMis Meilenstein: Das Rennen um KI-Infrastruktur verschiebt sich von „wer hat mehr Rechenleistung“ zu „wer verwaltet Rechenleistung effizienter“.
author: Dynamia
tags:
  - HAMi
  - CNCF
  - GPU Virtualization
  - AI Infrastructure
  - Cloud Native
  - Dynamia
category: Company News
coverImage: /images/blog/dynamia-ai-compute-efficiency/cncf-incubating-status.png
---

Am 2. Juli 2026 wurde HAMi, das von Dynamia initiierte und lange getriebene Open-Source-Projekt, offiziell CNCF-Incubating-Projekt. Als einziges Branchenprojekt mit Fokus auf heterogene GPU-Virtualisierung und effizientes Scheduling in dieser Stufe sendet HAMi ein klares Signal: Das KI-Infrastruktur-Rennen verschiebt sich von „wer hat mehr Rechenleistung“ zu „wer verwaltet Rechenleistung effizienter“.

![HAMi wird CNCF-Incubating-Projekt](/images/blog/dynamia-ai-compute-efficiency/cncf-incubating-status.png)

In den letzten zwei Jahren investierten Unternehmen zunehmend in KI; GPUs gehören zu den teuersten und knappsten Produktionsressourcen. In echten Produktionsumgebungen stellt sich oft nicht einfach GPU-Knappheit heraus — sondern dass vorhandene GPUs schwer voll ausgelastet werden.

Ein Task monopolisiert eine ganze Karte. Ein Team hält Ressourcen langfristig. Training, Inferenz und Tests warten gegeneinander. Verschiedene KI-Beschleuniger liegen in getrennten Systemen. Es wurde viel Compute gekauft, aber der Anteil, der effizient nutzbar ist, bleibt hinter den Erwartungen zurück.

Wie ein Straßennetz einer Stadt: Mehr Straßen helfen, aber ohne Ampeln, Spurführung und Regeln wird Verwaltung nur komplexer. Bei KI-Compute gilt dasselbe — mit teureren Ressourcen und komplexeren Szenarien brauchen Unternehmen eine Infrastrukturschicht, die GPUs und diverse KI-Beschleuniger verwaltet, schedult und sinnvoll nutzt.

Genau das wollte HAMi lösen.

## 1. Vom Problem ausgehen

HAMis Ursprünge reichen bis 2021.

Am 12. Juli 2021 veröffentlichten Xiao Zhang und Mengxuan Li die früheste Version. Zhang war bei DaoCloud, Li bei 4Paradigm — unterschiedliche Firmen, aber Zusammenarbeit um dasselbe Open-Source-Vorhaben. Früh stand die Überzeugung: Der Schlüssel zukünftiger KI-Infrastruktur liegt nicht nur in mehr Compute, sondern in effizienter Nutzung und offenem Ökosystem.

Mit dem Wachstum der AI-Infra-Branche wurde HAMis Richtung von einem Engineering-Problem zur Branchenchance. Zhang und Li sahen: Heterogenes Compute-Management braucht einen offenen, neutralen Open-Source-Kern für tiefes Zusammenspiel mit Up- und Downstream — nicht an einen Vendor gebunden. Darauf gründeten sie Dynamia, mit HAMi als Ausgangspunkt für einen Open-Source-Kern der KI-Infrastruktur.

Seit der Gründung zog Dynamia Kapital und Branchenunterstützung an, u. a. von Lu Qi, Fosun Capital, Zhuopu Investment und DaoCloud. Von Anfang an Fokus auf GPU-Virtualisierung und heterogenes Scheduling — HAMis Open-Source-Fähigkeiten in Unternehmensszenarien und betreibbare Infrastruktur überführt.

## 2. Eintritt ins globale Ökosystem

Ob Open-Source-Infrastruktur zählt, misst sich nicht nur am Code, sondern an Validierung durch globale Community, Enterprise-Nutzer und Branche.

In den letzten Jahren stand HAMi im Zentrum des globalen Cloud-Native-Ökosystems — von KubeCon und KubeDay in Frankreich, Japan, Hongkong, London und den Niederlanden bis zu vielen Konferenzen in China. Initiatoren und Maintainer führten das Gespräch über GPU-Virtualisierung, heterogenes Scheduling und Produktionsreife von KI-Infrastruktur.

![Xiao Zhang und Mengxuan Li auf der KubeCon London 2025](/images/blog/dynamia-ai-compute-efficiency/kubecon-london-2025.jpg)

![Xiao Zhang und Mengxuan Li auf der KubeCon France 2024](/images/blog/dynamia-ai-compute-efficiency/kubecon-france-2024.jpg)

![Mengxuan Li mit dem CNCF-CTO auf der KubeCon Hong Kong 2025](/images/blog/dynamia-ai-compute-efficiency/kubecon-hongkong-2025.png)

2026 markierte einen Meilenstein. Auf der KubeCon + CloudNativeCon Europe 2026 in Amsterdam zeigte HAMi im Main-Stage-Keynote den praktischen Wert von GPU-Sharing und Scheduling auf Kubernetes. Für ein aus China stammendes, global aufgebautes Projekt war das mehr als Technikdemonstration — die Richtung GPU-Scheduling steht im Kernblickfeld des internationalen Cloud-Native-Ökosystems.

![Mengxuan Li und Reza Jelveh in der KubeCon-EU-Keynote-Live-Demo](/images/blog/dynamia-ai-compute-efficiency/kubecon-eu-keynote-demo.png)

HAMi ist damit eines der wenigen chinesischen Open-Source-Projekte der letzten Jahre mit KubeCon-EU-Main-Stage-Keynote. Die Aufmerksamkeit spiegelt den Branchenwandel: Mit dem Übergang von Experiment zu Produktion wird die GPU zur Infrastrukturressource, die einheitlich, flexibel scheduliert und kontinuierlich optimiert werden muss.

Heute hat HAMi über 500 Contributors aus 17 Ländern, mehr als 300 Enterprise-Endnutzer (Cloud, Internet, Finanz, Automotive, Logistik, Bildung) und Präsenz in Südostasien und Europa.

HAMi ist nicht mehr nur Community-Projekt — sondern Infrastrukturfähigkeit, die in realen Szenarien und im globalen Open-Source-Ökosystem validiert wird.

## 3. Auf dem Produktionsboden

Für Enterprise-Kunden lässt sich HAMis Wert in einem Satz fassen: teure GPU-Ressourcen von „belegt“ zu „scheduliert“.

Bei großem Modelltraining, Inferenzdiensten und geteilten Ressourcenpools mehrerer Teams zählen praktische Fragen: Höhere GPU-Auslastung? Faires Teilen zwischen Teams? Weniger Warteschlangen in Spitzen? Einheitliches Management heterogener Beschleuniger? Anbindung an bestehende Cloud-Native-Umgebung?

Antworten kommen aus der Produktion — Finanz, Automotive, Consumer Tech, Logistik, EdTech, Cloud — für Auslastung, heterogenes Pooling, Inferenz-Traffic, autonomes Fahren und Governance auf KI-Plattformen.

In der Finanz brachte China Merchants Bank Kunlunxin, Ascend und NVIDIA in eine Scheduling-Plattform. Bei SNOW Corp. orchestriert HAMi über 1.000 A100 für GenAI für 200+ Millionen Nutzer und 700%-Traffic-Spitzen. Bei NIO steigt GPU-Auslastung in CI-Pipelines und Simulationsstunden sinken.

Fälle wie Beike, DaoCloud, SF Technology und PREP EDU zeigen: unterschiedliche Unternehmen heben Auslastung, senken Kosten und verbessern Effizienz in Test- und Produktionsclustern.

Der Wettbewerb in Enterprise-KI-Infrastruktur ist in die Governance-Phase eingetreten. Plattformteams brauchen nicht nur mehr Ressourcen, sondern Compute-Governance für mehrere Teams, Cluster, Chiptypen und Workloads.

Darin investiert Dynamia um HAMi — nicht nur Open-Source-Code, sondern die Kette in Produktion: Deployment, Anpassung, Stabilität, Betrieb, Ökosystemkompatibilität, Anbindung an Kubernetes und KI-Engineering-Plattformen.

HAMi ist das Fundament in der Community; Dynamia ist eine Kernkraft für Produktisierung, Enterprise-Readiness und Skalierung — GPU-Sharing, heterogenes Scheduling und Isolation als adoptierbare, lieferbare, weiterentwickelbare Infrastruktur.

## 4. Ausblick

HAMis CNCF-Incubating-Status ist der Beginn einer größeren Marktphase.

Mit dem Übergang von Pilot zu Produktion gewinnen Compute-Effizienz, Ressourcen-Governance und Multi-Chip-Kompatibilität. Früher zahlten Unternehmen für „mehr Compute“; künftig zunehmend für „Compute gut nutzen“.

Genau in diesem Fenster positioniert sich Dynamia.

Das KI-Zeitalter braucht stärkere Modelle und effizientere Infrastruktur. HAMis Aufstieg zeigt: GPU-Virtualisierung und heterogenes Scheduling sind Mainstream — anerkannt vom globalen Cloud-Native-Ökosystem.

Dynamia arbeitet weiter mit HAMi-Community, Partnern und Kunden, um diese Fähigkeit in mehr Produktionsszenarien zu bringen — offen, flexibel und nachhaltig.

Von der Überzeugung 2021 bis CNCF Incubating 2026 beweist HAMis Wachstum: relevante Infrastruktur entsteht oft nicht im Hype, sondern durch fortgesetzte Nutzung und Validierung bei echten Problemen.

Dynamia vertieft diesen Weg.

## Verwandte Links

- HAMi-Website: [https://project-hami.io](https://project-hami.io/)
- HAMi-Community: [https://project-hami.io/community](https://project-hami.io/community)
- CNCF HAMi-Projektseite: [https://www.cncf.io/projects/hami/](https://www.cncf.io/projects/hami/)
- CNCF HAMi Case Studies: [https://www.cncf.io/case-studies/?\_sft\_lf-project=hami](https://www.cncf.io/case-studies/?_sft_lf-project=hami)
- CNCF TOC Incubation Vote: [https://github.com/cncf/toc/issues/1775](https://github.com/cncf/toc/issues/1775)
- HAMi GitHub: [https://github.com/Project-HAMi/HAMi](https://github.com/Project-HAMi/HAMi)