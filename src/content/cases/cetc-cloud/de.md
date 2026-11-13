---
title: "CETC Cloud schafft mit HAMi eine gemeinsam nutzbare heterogene GPU-Infrastruktur für eine portable Wissensdatenbank"
company: "cetc-cloud"
companyName: "CETC Cloud"
logo: "/redesign/assets/dd41408a06cb10c4a43e.png"
date: "2026-09-08"
dateLabel: "2026.09.08"
sourceKind: "CNCF-Fallstudie · Übersetzte Fassung"
sourceUrl: "https://www.cncf.io/case-studies/cetc-cloud/"
sourceLinkLabel: "CNCF-Original lesen ↗"
outcomeSourceUrl: ""
outcomeSourceLabel: "Schlüsseldatenquelle: Dynamia Network of Officials"
outcomes:
  - value: "15×"
    label: "Mehr gleichzeitig ausführbare Entwicklungs-Pods"
    detail: "Dasselbe Gerät mit acht GPUs: 2 → 30"
  - value: "87.5%"
    label: "Zurückgewonnener GPU-Speicher pro Gerät"
    detail: "56 GB von 64 GB GPU-Speicher freigegeben"
  - value: "80%"
    label: "Zurückgewonnene Rechenkapazität pro GPU"
    detail: "20 % für Embeddings zugewiesen; der Rest bleibt zuweisbar"
---

Das Team nutzt Kubernetes und Hami, um die begrenzte heterogene GPU zu konvertieren, die zuvor einzelne Dienstleistungen für einen langen Zeitraum gebunden, in Produktionsmodelle und Kubernetes Entwicklungsumgebungen, die auf Anfrage angewendet werden können, geteilt und geplant.

Auf der Unterseite dieser Ressource bilden die Vektoren Embeding und Rerank Modelle eine komplette Wissensbasis-Link; mehrere Kubernetes Entwicklung Pod/Container können auch mit derselben heterogenen GPU durch HAMi ' s Virtualisierungsfähigkeit geteilt werden.

| Schlüsselindikatoren | Einnahmen |
| --- | --- |
| 15 mal erhöht | Gleiche 8 GPU tragbare Ausrüstung und Entwicklung von Pod von 2 bis 30 |
| Recovery 87.5% GPU Speicher | Einbettung von der monopolierenden 64GB-Karten zu 8GB zuzuordnen, so dass 56GB wiederverwendbar |
| 80 % Recycling-Ressourcen | Verkörperung Verteilung 20% GPU allgemeine Ressourcen, verbleibende 80% für andere Belastungen verfügbar |

## Fallinformationen und Anwendungsbereich

| Waren | Inhalt |
| --- | --- |
| Benutzer | Technikteam von CETC Cloud |
| Business-Szenario | Eine One-Stop-Smart-Wissensbasis, die auf den Projektstandort übertragen und unabhängig laufen kann |
| Deployment-Umgebung | Kubernetes und lokale heterogene GPU |
| Verwendete Projekte | Kubernetes、HAMi |
| Zentrale Herausforderungen | Multi-Modell Synergien, Produktion und Entwicklung gemeinsamer Ressourcen |

| Wissensbasis Produktionslinks | Kubernets Entwicklung Umwelt |
| --- | --- |
| Texterzeugung, Embeding, Rerank | Mehrere Entwicklung Pod/Container teilen einzelne heterogene GPU |

Diese Praxis besteht aus zwei GPU-Nutzungspfaden: Das Wissensbasisproduktionsmodell nutzt hauptsächlich lokale Stabilisierungsressourcen und Kubernetes entwickelt Pod/Container, die lokale Heterogene GPUs durch Hami teilen.

![Das Produktionsmodell und die Kubernetes Entwicklungsumgebung nutzen lokale heterogene GPUs über Hami.](/redesign/assets/9b31ba0ce32ef27df2de.png)
*Das Produktionsmodell und die Kubernetes Entwicklungsumgebung nutzen lokale heterogene GPUs über Hami.*

## Eine tragbare Ausrüstung, mit Dienstleistungen für Produktion und Forschung und Entwicklung

Die Wissensbasis basiert auf Texterzeugung, Vektor-Retrieval und Rerank; Dateneingabe erfordert auch den Abschluss von Auflösung, Schneiden, Quantifizierung, Lernextraktion und Indexierung. Forschung und Entwicklung Ingenieure sind verpflichtet, Pod/Container internen Debugging-Modelle zu entwickeln, validate Abhängigkeit und Experiment in Kubernetes.

- Textgenerierungsmodelle sind permanent online, und die GPU-Basislinie ist hoch und empfindlich auf Reaktionsverzögerungen.
- Das Einbetten schafft periodische Spitzen zum Zeitpunkt des Imports eines Volumendokuments, mit mehr Fokus auf das Schlucken.
- Rerank befindet sich in der Online-Suchkette, mit einem kurzen Einzelzähler aber häufigen Anruf.
- Wissensverarbeitung und Indexierung Rekonstruktion sind Massenaufgaben, die mit Online-Diensten verknüpft werden müssen.
- Die Entwicklung von Pod/Container ist zyklisch und interaktiv, geeignet für den Austausch von GPU innerhalb einer klaren Ressourcengrenze.

Wenn jede Service- oder Entwicklungsumgebung dauerhaft an eine Konsolidierungskarte gebunden bleibt, wird die begrenzte Ausrüstung logisch verarmt; wenn aber nur so dünn ein Schnitt wie möglich, wird sie GPU-Speichermangel, Schieduling Shakes und Fehlfunktionsbreite erhöhen. Das Team muss verschiedene Belastungen erlauben, um seine Bedürfnisse zu beschreiben und dann Ressourcen durch Plattform nach dem Zustand der Ausrüstung und Service Ebene zu platzieren.

![Geschäftsdokumente werden analysiert, einbettet und indiziert, um die Wissensbasis einzutragen; Online-Fragen werden abgerufen, Rerank und Text generiert und Antworten, Referenzen oder Berichte erhalten.](/redesign/assets/ca4b9febe7be5ceb583c.png)
*Geschäftsdokumente werden analysiert, einbettet und indiziert, um die Wissensbasis einzutragen; Online-Fragen werden abgerufen, Rerank und Text generiert und Antworten, Referenzen oder Berichte erhalten.*

## Warum Hami?

Die elektromechanische Wolke möchte die Kubernetes Applikationslieferung behalten, während sie die Plattform ermöglicht, darüber hinaus zu entscheiden, ob heterogene GPU den Lastwunsch erfüllt und die gleiche physische GPU für eine geeignete gemeinsame Entwicklungsumgebung wiederverwendet.

Der Wert von HAMi ist nicht nur eine physische Karte als Mehrkomponenten-Ressource, sondern wichtiger, um ein gemeinsames Ressourcenengagement zu schaffen:

- Modelldienstleistungen und Entwicklung der Pod/Container-Beschreibung von Ausrüstungsressourcen sind nicht mehr abhängig von langfristigen künstlichen Bindungskarten.
- Die Regelung prüft nicht nur, ob der Knoten GPU hat, sondern wählt auch nach dem Stand der Verfügbarkeit des Gerätes aus.
- Im Rahmen der Back-End-Unterstützung für physische Geräte können mehrere Entwicklung Pod/Container eine heterogene GPU teilen und jede behält ihre eigene Ressourcengrenze.
- Pod-, Verpackungs-, Ausrüstungs- und Planungsergebnisse können verknüpft werden, um eine Grundlage für Volumenbeobachtungen und Ressourcenzuweisungsänderungen zu schaffen.

## Von der Ressourcenmalerei bis zur geteilten heterogenen GPU

Das Team baut ein Ressourcenbild um die Lasteigenschaften, konzentriert sich auf Modellbelastung, Spitzennutzung und Verteilung, Verzögerung und langfristige Leistung, dann konvertiert validierte Nachfrage nach Kubernetes Ressourcenanforderungen. Produktionsmodelle und Entwicklungsumgebungen nutzen verschiedene Strategien:

1. **Online-Links bleiben an den Grenzen stabil.** Priorität ist die Sicherung einer stabilen Ressource für Texterzeugung, Online-Vektorsuche und Rerank.
2. **Periodische Aufgaben ermöglichen Warteschlangen und falsche Spitzen.** Dokumente werden neu entwickelt, um Wissen und Index zu quantifizieren, zu extrahieren, wenn die Online-Last niedrig ist.
3. **Entwicklung einer einzigen Umgebung geteilt heterogene GPU.** Mehrere Kubernetes entwickelten Pod/Container, um GPUs durch HAMi Virtualisierung wiederzuverwenden und so ihr langfristiges exklusives Eigentum zu vermeiden.
4. **Ändert die Konfiguration mit einer echten Last.** Die Partikelgröße wird von der Basis- und Betriebsbeobachtung abgeleitet, anstatt davon auszugehen, dass ein vorgegebenes Verhältnis für alle Modelle geeignet ist.

Das Paket Ressourcen-Governance bildet vier Produktkapazitäten:

- Textgenerierung, Embeding und Rerank beinhalten einen gemeinsamen Kubernetes GPU-Ressourcen Governance Prozess.
- Wissensbanken, Retrievals, Fragen und Antworten und Berichte Generation bilden einen vollständigen operativen Link.
- Online-Dienste, Massenzuweisungen und Forschung und Entwicklung Debugging folgen verschiedenen Ressourcenregeln.
- Eine einzelne heterogene GPU kann auch mehrere Kubernetes Entwicklung Pod/Container dienen.

## Quantifizierte Ergebnisse: Zunahme der Entwicklungsumgebung für Einzelgeräte von 2 bis 30

Auf einem tragbaren Gerät mit 8 heterogenen GPUs, Teams eingeführt die Vor- und Post-Hami Ressourcenkapazität durch konsequentes Kaliber:

| Metrik | Ohne HAMi | Inklusive Hami |
| --- | --- | --- |
| Text Generation Modell | Monarch 4 Heterogene GPU | Noch 4 heterogene GPUs halten |
| Einbettung und Rerank | Jeweils eine heterogene GPU | Jede Anwendung 8GB GPU GPU Speicherquote |
| Entwicklung der Umweltverfügbarkeit | 2 verbleibende GPUs, die nur 2 Entwicklungs-Pods tragen | Validierung von 30 Entwicklungen, die nebeneinander laufen |
| Entwicklung der Umweltkapazität | Basiswert | Erhöhen Sie auf das 15-fache des Originals |

Die GPU-Speicherquote für die Entwicklung von Pod wird von den Benutzern nach ihren Aufgaben angefordert, und die Plattform hat keinen einheitlichen festen Wert. Unter der aktuellen Modellquote und Entwicklungslast absolvierte das Team 30 Entwicklung Pod gleichzeitige Validierungen.

### Einkarten-Ressourcenvergleich für Embeding Modell

Auf einer 64GB heterogenen GPU benötigt das Embeding-Modell tatsächlich etwa 8 GB GPU-Speicher. Wenn die gesamte Karte monopolisiert ist, verwendet das Modell nur ca. 12,5% GPU-Speicher, aber andere Belastungen können nicht für überschüssige Ressourcen gelten. Nach der Einführung von Hami verteilen Teams 8GB GPU-Speicher mit 20% des Modells nach Bedarf und integrieren die restlichen Ressourcen in Scheduling.

| Metrik | Ohne HAMi | Inklusive Hami |
| --- | --- | --- |
| GPU-Verteilung einbetten | Monochrome 64GB Karten | Verteilung auf Bedarfsbasis 8GB |
| Modell aktuelle GPU-Speicheranforderungen | Über 8GB | Über 8GB |
| Für andere Aufgaben nutzbares VRAM | 0GB | 56GB, 87,5% der Gesamtkarte |
| Einbettung von Vertriebsressourcen | Karte exklusiv | 20 % zugewiesen, 80 % schedulierbar |
| Token Bumping (Token/s) | Basiswert | Im Vergleich zur gesamten Karte beträgt die Änderung innerhalb von 5 %. |
| Modell Ladezeit | Basiswert | Im allgemeinen wurden im Einklang mit dem Monopol der gesamten Karte keine signifikanten Änderungen beobachtet. |
| P95 Verzögerung auf Anfrage | Basiswert | Im allgemeinen wurden im Einklang mit dem Monopol der gesamten Karte keine signifikanten Änderungen beobachtet. |

Diese Karte zeigt im Vergleich zum Modell, dass Hami transformiert Einbetten von ganzen Karten in eine bedarfsgerechte Verteilung, Freigabe von GPU-Speicher und Compute Resources, während Token ' s schluckende Änderungen innerhalb von 5 Prozent halten, wobei das Modell Ladezeit und P95 wesentlich stabilisiert werden, so dass die gleiche heterogene GPU auch Entwicklungsumgebungen oder andere geeignete gemeinsame Aufgaben tragen könnte.

![Mit der Einführung von HAMi, Embedding zugewiesenen Ressourcen nach Bedarf, eine einzige Karte veröffentlicht 56GB GPU Speicher und 80% der Ausrüstung; die Entwicklung von Pod, die von der Ausrüstung getragen werden kann erhöht von 2 bis 30.](/redesign/assets/3e9f561e5b390211887f.png)
*Mit der Einführung von HAMi, Embedding zugewiesenen Ressourcen nach Bedarf, eine einzige Karte veröffentlicht 56GB GPU Speicher und 80% der Ausrüstung; die Entwicklung von Pod, die von der Ausrüstung getragen werden kann erhöht von 2 bis 30.*

## Praktische Erfahrung und nächste Schritte

Zunächst sollte der heterogene GPU-Sharing auf Lastbildern anstatt voreingestellten Flat-Spektrum-Verhältnissen basieren. Produktionsmodelle, Massenzuweisungen und Entwicklungsumgebungen sind nicht die gleichen für Verzögerungen, GPU-Speicher, Schlucken und so weiter, und Ressourcenstrategien unterscheiden sich von dem, was durch Regulierung erforderlich ist.

Zweitens ist die FuE-Umgebung ein wichtiger Nutzer von gemeinsamen GPUs. Die Entwicklungsumgebung wird in Kubernetes Pod/Containern betrieben und kann mit der Produktionsservice-Ressourcenerklärung und -Scheduling-Ansatz wiederverwendet werden, während die Langzeit-Monopolisierung von Geräten in jeder Entwicklungsumgebung vermieden wird.

In der nächsten Phase werden Elektronenwolken die Kapazität und die gesundheitliche Sicht von Produktions- und Entwicklungslasten weiter verfeinern und experimentelle Daten ergänzen, die unter verschiedenen Modellen, Netzwerken und Call Modi repliziert werden können.

## Über HAMi

HAMi ist ein Heterogenouscompute-Ressourcenintegrations- und Vereinigungsprojekt, das von Mengxuan Li und Zhang Zhou koordiniert wird. Es ist jetzt das CNCF Incubation Project. Das Projekt zielt darauf ab, die Nutzung heterogener Compute durch eine einzige Reuse-Schnittstelle für heterogene GPU zu erhöhen.

Zum Zeitpunkt der Veröffentlichung unterstützte HAMi Projekte wie NVIDIA, Ascend, Cambricon, Hygon, Iluvatar CoreX, Moore Threads, MetaX, Enflame, Kunlen core, AWS Neuron, Vastai und andere, die weit in Volcano, Kuue, Koordinator, VLM, KAI Scheduler integriert wurden und über 20 Unternehmen und Regionen ausmachten.

## Auf dem Elektronenwolken-Tech-Team

Das technische Team der Elektronenwolke ist in diesem Fall für die Entwicklung und Konstruktion von Produkten aus einer tragbaren Wissensbasis verantwortlich, um Produktkapazitäten rund um lokale Vor-Ort-Betriebe, Wissensverarbeitung, Modellierungsdienstleistungen und Umweltentwicklung zu errichten.

Die praktischen Probleme, GPU und tragbare KI durch die HAMi-Gemeinschaft zu teilen, sind willkommen.

<div class="case-source-note">
<p>Original:<a href="https://www.cncf.io/case-studies/cetc-cloud/" target="_blank" rel="noopener">CETC Cloud Builds a Heterogeneous GPU Shared Resource Foundation for a Portable Knowledge Base with HAMi ↗</a><br>Herausgeber: Cloud Native Computing Foundation (CNCF) · 2026-09-08</p><p>Diese lokalisierte Fassung übernimmt die technischen Informationen und den Messumfang des Originalartikels. Sie ist keine offizielle CNCF-Übersetzung. Architekturdiagramme behalten ihren Originaltext. Projektstatus und Produktangaben beziehen sich auf das ursprüngliche Veröffentlichungsdatum.</p><p>Das Original wird unter den  <a href="https://www.linuxfoundation.org/legal/terms" target="_blank" rel="noopener">Inhaltsbedingungen der Linux Foundation</a> und  <a href="https://creativecommons.org/licenses/by/3.0/" target="_blank" rel="noopener">CC BY 3.0</a> verwendet. Diese Fassung wurde übersetzt und neu gestaltet. Alle Marken gehören ihren jeweiligen Inhabern.</p>
</div>
