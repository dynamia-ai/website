---
title: "Wie Sangfor mit Kubernetes, Volcano und HAMi eine KI-Rechenplattform für Unternehmen aufbaute"
company: "sangfor"
companyName: "Sangfor"
logo: "/redesign/assets/8d37763f47722bb132cf.svg"
date: "2026-09-08"
dateLabel: "2026.09.08"
sourceKind: "CNCF-Fallstudie · Übersetzte Fassung"
sourceUrl: "https://www.cncf.io/case-studies/sangfor/"
sourceLinkLabel: "CNCF-Original lesen ↗"
outcomeSourceUrl: ""
outcomeSourceLabel: "Schlüsseldatenquelle: Dynamia Network of Officials"
outcomes:
  - value: "3×+"
    label: "Steigerung der GPU-Auslastung"
    detail: ""
  - value: "8×+"
    label: "Modelle pro GPU (1 → 8+)"
    detail: ""
  - value: "50%"
    label: "Geringere Kosten für externe Modell-APIs"
    detail: "400.000 → 200.000 RMB/Monat, einschließlich der Vorteile des intelligenten Plattform-Routings"
---

Sangfor ist ein führender Hersteller von chinesischen Unternehmen, Cloud Computing und Netzwerksicherheit. Da sich KI-Anwendungen schnell entwickeln, baut Sangfor eine einheitliche KI-Plattform für interne Forschungs- und Entwicklungsteams und Unternehmenskunden auf, um die KI-Programmierung, digitale Mitarbeiter, Smart-basierte Gästekleidung und den Vertrieb von Agenten zu unterstützen.

Die Nutzung von GPUs, Ressourcenmobilisierung und Schieduling ist ein wichtiger Engpass. Sangfor baut gemeinsam mit Kubernetes, Volcano und Hami auf Produktionsebene GPU-Plattformen auf, um Kubernetes zu einer einheitlichen KI-Ressourcenkontrollebene zu machen.

| Metrik | Vor der Verbesserung | Verbessert |
| --- | --- | --- |
| GPU-Auslastung | Basiswert | Mehr als 3 mal höher |
| Anzahl der GPU Lastmodelle pro Einheit | 1 | 8 oder mehr |
| Externe Modellaufrufkosten | 400K RMB/Monat | 200K RMB/Monat |
| Wiederherstellung nach Modellfehlern | ca. 1 Stunde | weniger als 10 Minuten |
| 3 Erfolgsquote im Spitzenstrom | instabil | Über 95% |
| Unterstützte R&D-Teamgröße | begrenzt | Mehr als 2.000 Ingenieure |

## Herausforderungen

### Unterauslastung von GPU

Im traditionellen Modell nimmt ein Referenzservice eine einzige GPU in Anspruch. Viele Lasten nutzen nur eine kleine Menge an GPU-Memoory und berechnen Ressourcen, aber sie haben lange belegte ganze Karten, wodurch schwere Ressourcenabfälle entstehen. Die GPU erweitert sich mit noch schnelleren Raten als das Geschäftswachstum.

### Ressourcen-Governance-Komplex in multitenanter Umgebung

Die Plattform dient auch der KI-Programmierung, dem digitalen Personal, dem intelligenten Passagierservice, dem Vertriebsbüro, den Business Knowledge Assistants usw. Die Nachfrage nach unterschiedlichen Lasten von GPUs variiert sehr stark: einige erfordern eine langfristige Präsenz in GPU-Speicher und andere haben ein offensichtliches Spitzental. Unified Pool Management und equitable Distribution sind zentrale Probleme.

### In Bezug auf die Chargenlast

Die Plattform betreibt Online-Zugang, Großinformationen, verteilte Schulungen und Agent Workflows. Original Kubernetes GPU Scheduling erfüllt diese komplexen KI-Lastanforderungen nicht.

## Lösung: HAMi

> "Hami rohe integrierte Kubernetes, was bedeutet Null-Migrationskosten. Durchsichtige Gerätevirtualisierung lässt die Tasklast ohne Modifikation laufen."
>
> — Jia Haojie, Chief Architect, Sangfor Cloud AI
>

Kubernetes bietet eine einheitliche Kontrollebene für die KI-Plattform, aber original GPU Scheduling ordnet Ressourcen mit der ganzen Karte an, um den ökologischen Bedürfnissen von Referenz, Multi-Tenant und heterogener GPU gerecht zu werden. Sangfor eingeführt Volcano bzw. Hami auf Senior Schieduling und GPU-Ressource Virtualisierung.

Die Kerngründe für die Wahl von HAMi sind:

- **GPU-Anteil:** Der GPU-Speicher kann bis zu 256 MB sein, die Computerressourcen können so niedrig wie 1% sein, und mehrere Pods können die gleiche GPU unter der Strong Association teilen.
- **Heterogene GPU Unterstützung:** Die Integration der Ressourcen in die Abstraktion und die Generierung von GPUs erhalten eine konsequente Scheduling-Erfahrung.
- **Open Source Ökologie:** Das Feld Kubernetes ist eines der aktivsten Open-Source-VGPU-Projekte und wird kontinuierlich mit Volcano Queuues, vLLM integriert.

### Plattformarchitektur

Die Plattform ist in zwei Schichten unterteilt. Datenebene ist der gesuchte Pfad: AI, nach einer Route, Governance und Sicherheitskontrolle am AIC-Gateway, tritt die Modelldienstebene ein, einschließlich OpenAI, Claude, DeepSeek und lokale Inferenz. Komponentenstruktur ist die Basis der Compute Resources: Volcano ist verantwortlich für Operationen Schieduling, Hami ist verantwortlich für GPU Virtualisierung, Teilen und Verein, Kubernetes Management.

Zwei Schichten verbinden sich mit Volcano und vervollständigen den End-to-End-Link von der Anfrage zu den Unternehmensressourcen.

![Sangfor AI Plattform Datenebene und Komponentenstruktur der Compute Resources, Quelle: CNCF Original.](/redesign/assets/1e1ccd5f43f3ad06da45.jpg)
*Sangfor AI Plattform Datenebene und Komponentenstruktur der Compute Resources, Quelle: CNCF Original.*

### GPU-Pool: Vor und nach Verbesserungen

Vor der Verbesserung wird ein bestimmtes Modell verwendet, eine Karte läuft nur ein Modell. Große Modelle füllen den GPU-Speicher mit kleinen Modellen, die nur 15-20% des Rests der Ressourcen verwenden. Größenmodelle können nicht koexistieren und Ressourcenabbau ist schwer.

Der vGPU-Schnitt bringt zwei Kernvorteile:

- **Eine hybride Bereitstellung eines Größenmodells:** Große Modelle belegen den Hauptanteil an Einzelkarten, z.B. 70 Prozent, und die restlichen Scheiben werden auf mehrere kleine Modelle verteilt, mit ansonsten leeren Rechenressourcen.
- **Erhöhen Sie die Dichte der kleinen Modelle:** Eine einzelne Karte kann ein kleines Modellbeispiel achtmal oder mehr tragen, was den Bedarf an neuen GPUs deutlich reduziert.

Das Gesamtergebnis war ein mehr als dreifacher Anstieg der GPU-Auslastung und eine achtfache Erhöhung der Einkartenmodelldichte.

![Vergleich der Einsatzmuster vor und nach dem GPU-Pool, Quelle: CNCF Original.](/redesign/assets/80cd9ed10ba3520b4d97.jpg)
*Vergleich der Einsatzmuster vor und nach dem GPU-Pool, Quelle: CNCF Original.*

### Volcano + HAMi: koordiniertes Scheduling

Volcano kombiniert mit HAMi, um eine einheitliche Verwaltung der Geräteressourcen und -operationen zu erreichen:

- **Wartung von Geräten:** GPU Gesundheitsüberwachung, automatische Fragmentierung und Auto-Recovery.
- **Resource Statement Governance:** Automatische vollständige Ressourcenfelder, einheitliche Berechnung von Quoten, vorzeitige Ablehnung ungültiger Anträge.
- **Dienstleistungen für die Verkleinerung** Die Ressource wird auf die tatsächliche Belegung geprüft und zersetzt, um sicherzustellen, dass sie sich in einem Zustand der Konformität befindet.
- **Unterstützung von Gang und LWS:** Volcano Organization, HAMi ordnet GPU an und die ganze Gruppe arbeitet mit Scheduling.

Volcano entscheidet, wann und wo die Last laufen wird, und Hami entscheidet, wie man GPU-Ressourcen teilt und verteilt.

![Workload-Kooperationsprozess mit Scheduling-Komponente, Quelle: CNCF Original.](/redesign/assets/80cd9ed10ba3520b4d97.jpg)
*Workload-Kooperationsprozess mit Scheduling-Komponente, Quelle: CNCF Original.*

## Wirksamkeit der Durchführung

### GPU-Auslastungsrate erhöhte sich mehr als 3 mal

Die vGPU-Split ermöglicht es, mehrere Inferenzdienste zu teilen, eine GPU, die nach Bedarf verteilt wird. Geteiltes GPU-Pool entfernt Ressourcenschadstoffe und ermöglicht die gleiche Hardware, mehr Lasten auszuführen.

### Einzelkartenmodelldichte erhöhen mehr als 8 mal

Dies ist der unterste Teil des Satzes 1% und der kleinste Teil des GPU-Speichers 1 MB, was den Modellen präzise Ressourcenquoten gibt.

### Reduzierung externer Abrufkosten 50%

Die Kombination von intelligenten Pfaden, einfachen Fragen werden auf kostengünstige Modelle verwiesen, komplexe Probleme werden auf High-End-Modelle, bei denen die Kosten für externe Modellanrufe von $400.000 pro Monat auf $200.000 reduziert werden; und Sicherheitsspalten halten ein Gleichgewicht zwischen Kosten und Qualität.

### Die Stabilität der Plattform wird deutlich verbessert

Die Erfolgsquote bleibt unter drei Mehrfach-Durchflussdrucktests über 95 Prozent. Gerätegesundheitsüberwachung und automatische Fehlfunktion schließen die Störung GPU aus dem Scheduling-Pfad aus.

### Unterstützung des Entwicklungsteams von über 2.000 Menschen.

Die Plattform unterstützte mehrere Produktionsszenarien wie KI-Programmierung, Enterprise Agent, intelligenter Passagierservice, digitales Personal und so weiter, um die tägliche Nutzung von mehr als 2.000 R&D-Ingenieure.

## Praxiserfahrung

### GPU-Sharing ist wichtiger als einfach GPU zu ergänzen

Vor dem Kauf von mehr Hardware wird der Austausch der GPU Priorität eingeräumt, die höhere und schnellere Renditen auf Investitionen erbringen wird.

### Scheduling und Ressourcenmobilisierung sollten de-linked werden

Hami ist verantwortlich für abstrakte Ressourcen, Volcano ist verantwortlich für Planungsstrategien. Wenn der Coup gebrochen ist, können sich die Schichten unabhängig entwickeln. Jobplatzierung kann nicht optimal sein, wenn es geteilt wird und ohne Intelligenz; nur Steduling, ohne GPU-Schutz, fehlt die Ressourcen zur Schimierung.

### Kubernetes wird zu einer KI-Ressourcenkontrollebene

Die Kombination von Kubernetes, Volcano und Hami ermöglicht es Unternehmen, eine GPU-Management-Fähigkeit auf Unternehmensebene zu erwerben, ohne ein neues Managementparadigma einzuführen.

## Folgeplan

Sangfor wird weiterhin mit der Hami-Gemeinschaft zusammenarbeiten, um Kubernetes als einheitliches Kontrollflugzeug für KI-Last zu fördern:

- Fügen Sie HAMi DRA Ökologie hinzu, bevor Kubernetes natives GPU-Ressourcenmanagement voranbringt.
- Erweitert die heterogene GPU-Unterstützung durch die einheitliche Abstraktion von HAMi.
- Das Projekt zielt darauf ab, Strategien und Best Practices auf Produktionsebene wieder in die Volcano- und HAMi-Communities zu bringen.

Erhöhtes Verständnis von:[HAMi GitHub](https://github.com/Project-HAMi/HAMi) · [Volcano GitHub](https://github.com/volcano-sh/volcano)。

<div class="case-source-note">
<p>Original:<a href="https://www.cncf.io/case-studies/sangfor/" target="_blank" rel="noopener">How Sangfor Built an Enterprise AI Compute Platform with Kubernetes, Volcano, and HAMi ↗</a><br>Herausgeber: Cloud Native Computing Foundation (CNCF) · 2026-09-08</p><p>Diese lokalisierte Fassung übernimmt die technischen Informationen und den Messumfang des Originalartikels. Sie ist keine offizielle CNCF-Übersetzung. Architekturdiagramme behalten ihren Originaltext. Projektstatus und Produktangaben beziehen sich auf das ursprüngliche Veröffentlichungsdatum.</p><p>Das Original wird unter den  <a href="https://www.linuxfoundation.org/legal/terms" target="_blank" rel="noopener">Inhaltsbedingungen der Linux Foundation</a> und  <a href="https://creativecommons.org/licenses/by/3.0/" target="_blank" rel="noopener">CC BY 3.0</a> verwendet. Diese Fassung wurde übersetzt und neu gestaltet. Alle Marken gehören ihren jeweiligen Inhabern.</p><p class="fact-note">Übersetzung: Die Originaltextlisten 256 MB GPU-Speicherpartikel im ausgewählten Absatz und 1 MB im operativen Absatz; die Übersetzung behält einen anderen Ausdruck des Originals vor.</p>
</div>
