---
title: "China Merchants Bank verbessert das Scheduling von KI-Rechenressourcen auf Kubernetes mit HAMi"
company: "china-merchants-bank"
companyName: "China Merchants Bank"
logo: "/redesign/assets/b597756761457e50d747.svg"
date: "2026-07-02"
dateLabel: "2026.07.02"
sourceKind: "CNCF-Fallstudie · Übersetzte Fassung"
sourceUrl: "https://www.cncf.io/case-studies/china-merchants-bank/"
sourceLinkLabel: "CNCF-Original lesen ↗"
outcomeSourceUrl: ""
outcomeSourceLabel: "Schlüsseldatenquelle: Dynamia Network of Officials"
outcomes:
  - value: "100%"
    label: "Auslastung des Hardware-Ressourcenpools"
    detail: "Topologiebewusstes Scheduling; keine Aussage über eine dauerhaft volle Rechenauslastung"
  - value: "30%"
    label: "Weniger maschinenübergreifendes Scheduling"
    detail: "Weniger maschinenübergreifende Kommunikation beim verteilten Training"
  - value: "1 GB / 1%"
    label: "Kleinste GPU-Speicher-/Rechenleistungspartitionierung"
    detail: ""
---

## Zusammenfassung

Da KI-Lasts über Modellausbildung, Inferenzdienste, Forschung und Entwicklung sowie interne KI-Anwendungen verteilt werden, braucht die China Mercants Bank einen effizienteren Weg, um diversifizierte Beschleunigerressourcen in großem Umfang zu verwalten.

Original-Schlüsselindikatoren: 100 Prozent Nutzung von Hardwarepools; 30 Prozent Reduzierung des verteilten Trainings auf der ganzen Platine; 1 GB GPU Partikel/ 1 Prozent komplette Ressourcen.

## Über China Merchants Bank

Die China Mercantants Bank ist eine der führenden chinesischen Geschäftsbanken, die stark in claud-native, AI und digitale Infrastruktur investiert. Da KI für die wachsende Finanzlandschaft zentral wird, bedarf es einer breiten Palette von Schulungen, Inferenz und internen KI-Workloads, die den tatsächlichen Druck auf die Plattform Compute Resources setzen.

## Herausforderungen

Für die meisten großen Institutionen ist der reale Engpass kein Mangel an Zugangsressourcen, sondern vielmehr, wie die vorhandenen Ressourcen effizient arbeiten können.

China Merchants Bank hat sich mit diesem Problem konfrontiert. Die Bank baute zuvor eine heterogene Contact Resources-Plattform mit mehreren KI Acceleratoren zur Unterstützung von Modellbildung, Online-Beziehungen, F & E und internen KI-Tools. Als Nutzung wurde der ursprüngliche Ressourcenmanagement Ansatz verloren, und die Bank wieder etablierte ihre einheitliche Scheduling-Plattform auf Kubernetes basierend auf Hami, die integrierte heterogene Ressourcenverwaltung, Toppaste Bewusstseinsteilung und feine Partikelgröße.

In der abschließenden Analyse gibt es drei Fragen:

### Fragmentiertes Ressourcenmanagement

Verschiedene KI-Beschleunigerhersteller liefern eigene Softwarestapel und Management-Tools. Dadurch wird der Pool fragmentiert, es gibt Unstimmigkeiten in der Scheduling-Strategie und Transportkosten steigen weiter.

### Trainings-Hardware nicht voll ausgelastet

Einige der Trainingsknoten sind mit mehreren Chips mit hoher Geschwindigkeit verbunden, und Missionsplatzierungen sind extrem empfindlich auf die physische Ausdehnung des Chips. Wenn Scheduler diese Erweiterung nicht versteht, wird die Aufgabe auf dem falschen Chip gestellt, wo Lichtmerkmale beeinträchtigt werden und das Gewicht fällt direkt aus.

### Verschwendete Kapazität bei kleinen Tasks

Eine Vielzahl von Referenzen, Feinabstimmungs- und Prüfaufgaben erfordern keinen vollen Beschleuniger.

## Warum Hami?

Die Linie wählt HAMi aus mehreren Gründen:

- **Kubernetes einheimisches.** Es besteht keine Notwendigkeit, das bestehende Claud-native Technologielager wieder aufzubauen.
- **c) Harmonisierung heterogener Ressourcen.** Multi-Beschleuniger-Typen teilen einen Planierrahmen.
- **Unterstützt den Austausch feiner Partikel.** GPU-Memoory und Rechenressourcen können mit Quoten geteilt werden und die volle Nutzung jeder Karte.
- **Open Source und skalierbar.** Die Struktur ist offen und passt sich an echte Geschäftsanforderungen an.

## Loesungen

Die China Merchants Bank baute ihre einheitliche AI-Compute-Plattform auf Kubernetes und HAMi auf und iterierte dann über Ressourcen-Onboarding, Shared-Scheduling und Trainingseffizienz.

### Plattformarchitektur

![Plattformarchitektur](/redesign/assets/92d5f99667b7b8bc6802.png)
*Abbildung 1: Plattformarchitektur*

Die Plattform ist in drei Schichten unterteilt:

- **Betriebliche Servicestufe:** Großformatige Modellausbildung, KI-Zugangsdienst, Modell Feinabstimmung und interne KI Anwendungen.
- **HAMi SCHEDULEN:** Heterogene Ressourcen-Pooling, Tele-Schemaing, GPU/NPU-Sharing, Multi-Manufaktur-Ausrüstung abstrakt.
- **Infrastrukturebene:** Multiproduzent AI Acce, Multi-Punkt-Cluster, Highspeed-Internet.

### Einheitliches heterogenes Ressourcenmanagement

HAMi ermöglicht es der Bank, verschiedene Arten von Beschleunigern in einem einzigen Kubernetes-Pool zu recyceln. Dies ist besonders kritisch im Kontext der China Mercants Bank, wo die Plattform eine Vielzahl von heterogenen Community-Ressourcen enthält, einschließlich Kunlen-Kerne, mehrere Ascend-Modelle, NVIDIA GPU, PPU, Moore Threads, MetaX und andere Beschleunigungs-Geräte. Ohne HAMicrosoft wird jede Lieferung von Hardware normalerweise acht von einem unabhängigen Gerät begleitet sein.

Mit Hilfe von HAMi können diese heterogenen Geräte durch ein einheitliches Schema und eine konsequente Plattformstrategie verwaltet werden. Das Anwendungsteam wendet sich weiterhin an Ressourcen über Standard-Kubbernetes-Workflows, während das Plattform-Team die Unterschiede zwischen Anlagentypen, Herstellerimmobilien und Ressourcenzuweisungsmodellen abstrahiert. Der Wert von HAMi geht über Gerätescheiben und -steuerungen hinaus.

### Skilling: Passend für Supercalculative Nodes

Teilweise ausgebildete Knotenannahme**Hypernominalknoten (zwei Chipmodule) Struktur**So bilden mehrere Chips eine logische Einheit, indem sie mit hoher Geschwindigkeit verbinden. Kubernetes default Scheduler versteht dieses Layout nicht, und dann stellt es die eigentliche Frage:

- **Es gibt ein Problem mit der ungeraden Kartenzuweisung.** Eine ungerade Anzahl von Kartenzuweisungen kann zwei Module überqueren und eine Fehlermeldung des Fahrers auslösen.
- **Cross-Mode Gruppe langsame Kommunikation.** Die Kommunikation zwischen Modulen ist wesentlich verzögerter als innerhalb des Moduls.
- **Das Clustersegment ist leer.** Falsche Platzierungsentscheidungen machen einige Hardware physikalisch unbrauchbar.

Die Bank hat das HAMi Device Plugin und den Scheduler erweitert, um physische Modulgruppen zu identifizieren und die Paarverteilung zu stärken. Scheduler versteht nun Modellgruppe Skalierung nach oben, hält Karten im gleichen Modul und vermeidet einen Laufwerksunfall, der durch ungerade Zahlenkarte Cross-Modul-Platzierungen verursacht wird.**Die Hardware-Pool-Auslastung betrug 100 Prozent.**

Im ResNet50 Referenztest (Batchgröße = 32) erhöhte HAMIs Feinkorngrößen-Unterteilungen den Gesamtpercarddurchsatz von 64,6 Bildern/s auf 94,8 Bilder/s. Mit zunehmender Subduralgröße steigt der Gesamtdurchsatz um maximal 46,7 %, was eine höhere Belastungsdichte und einen vollen Einsatz des Beschleunigers anzeigt.

![Gepaarte Zuweisung für Supernode-Module](/redesign/assets/c05bb342fdc7e885a671.png)
*Abbildung 2: Verteilung der überschüssigen Nodal-Modellzusammensetzung*

Die Bank hat auch den Umgang mit mehreren Chips mit High-Speed-Verbindungsknoten verbessert. Das System versteht nun die Verbindung zwischen Chips und priorisiert Trainingsaufgaben am kürzesten Punkt im Kommunikationspfad, wodurch das Training stabiler und schneller wird.

### Feine Partikelgrößenverteilung: vNPU-Core Softwarepartition

Die gesamte Karte ist in der Regel nicht für Referenz-, Kleinmodell-Feinabstimmungs- und Forschungs- und Entwicklungstestaufgaben erforderlich.

Diese Linie wird mit der VMPO Core-Komponente von Hami durchgeführt**Benutzer-state Partition von Computerressourcen**Die beiden Hauptmechanismen sind:

- **Deine Eimer.** Die Aufgabe vor der Quote wartet.
- **Benutzer-state GPU Speicherverwaltung.** Die GPU GPU-Speicherverteilung ist im Benutzerzustand abgeschlossen, wodurch die Feinkorngröße aufgeteilt werden kann.

![vNPU-Core Benutzer Statecompute Ressourcen Partition](/redesign/assets/3b277d0423fbf29281b6.png)
*Abbildung 3: VNPU-Core Benutzerzustand*

Die Partikelgröße der Partition ist die subtilste. **1 GB GPU Speicher / 1%**Und es ist sehr wichtig im Bankensektor. Windkontrollmodelle und Kundendienstmodelle sind oft klein, benötigen keine ganze Karte, und feine Partikelgrößenzonen ermöglichen der Bank viel mehr von diesen Modellen auf der gleichen Hardwareserie zu betreiben.

Für die Referenz-, Kleinmodell- und F & E-Tests öffnet die Bank auch den Kartenaustausch, so dass mehrere Aufgaben mit einem einzigen Beschleuniger geteilt werden können. Dies ermöglicht es, mehrere Lasten mit einem einzigen Beschleuniger zu teilen, wodurch die Leerlaufkapazität kleinerer Inferenz- und Testlasten reduziert wird.

### Vernetzung: Drei Schichten von Abstrakten und Dispersiven

Für verteiltes Training hat die Bank ein Set entworfen**Multiscale Screduling Algorithmus**Das physische Netz gilt als drei Schichten:

- **Erste Stufe: der gleiche Knoten.** Die am wenigsten verzögerte und höchste Priorität für die Planung.
- **Zweiter Stock: der gleiche LEAF-Schalter.** Mittelverzögerung, mittlere Priorität.
- **Ebene drei: Cross-LEAF Schalter.** Die höchsten Verzögerungen und niedrigsten Prioritäten.

![Dreistufiges Netzwerkgebäude](/redesign/assets/5f225e20cd352a480ef5.png)
*Abbildung 4: Dreistufige Netzwerk-Skalierung*

Der Scheduler befindet sich nun in einer Phased-Position, um eine erhöhte Punktzahl hinzuzufügen, die den hochrangigen Kommunikationsaufgaben am gleichen Knoten oder Austauschbereich Priorität einräumt.**Das Cross-Boarding ist um 30% reduziert.**Ein großer Kommunikationsengpass bei verteilter Ausbildung wurde entfernt.

Die Bank merkte auch an, dass Scheduler manchmal Pod von demselben Job zu verschiedenen Knoten verstreut.**Hashi basiert auf der Kontrolle UID Sicherheit**Mechanismus, halten Pod von der gleichen Charge an demselben Knoten.

## Wichtige Ergebnisse

Diese Veränderungen führten zu folgenden Gewinnen für die Bank:

| Metrik | Einnahmen |
| --- | --- |
| Auslastung des Hardware-Ressourcenpools | **100%** |
| Überwindung der Scheduling Wahrscheinlichkeit | Runter. **30%** |
| Die detaillierteste Partikelgröße | **1 GB GPU Speicher / 1%** |
| Plattformarchitektur | Heterogene KI gemeinsame Ressourcenplanung |

Diese Änderungen ermöglichen der Bank, wachsende AI-Workloads zu bewältigen, ohne ständig neue Hardware zu kaufen.

> Mit HAMi bauten wir auf Kubernetes eine einheitliche heterogene AI-Compute-Scheduling-Plattform und erzielten erhebliche Verbesserungen bei Ressourcenauslastung, Trainingseffizienz und Plattformstabilität.
>

## Was soll das?

Die Geschichte der China Merchants Bank zeigt, dass der reale Wettbewerbsvorteil von KI-Infrastruktur nicht mehr Hardware zu kaufen ist, sondern Software verwenden, um Mehrwert für bestehende Hardware zu schaffen.

Für die Welt der Claud-Native ist dies ein sinnvoller Fortschritt für Kubernetes. Es geht nicht mehr nur um Verpackungen, sondern es wird zur Kontrollseite einer KI-Infrastruktur.

Open-Source-Projekte wie HAMi ermöglichen es Unternehmen, eine heterogene Scheduling-, Sharing- und Organisationsfähigkeit über Kubernetes zu erwerben, wodurch die KI-Plattform schneller aufgebaut wird, ohne Räder zu wiederholen.

## Nachfolgeplanung

Zu den Schwerpunkten gehören: weitere Optimierung der Ascend hami-vnpu-core Software zoning Mechanismus, um Leistungsschwankungen in einer Multitasking-Umgebung zu reduzieren; Aufbau von umfassenden Überwachungsfunktionen für die Virtualisierung NPU, Bereitstellung von Echtzeitsicht auf GPU-Memoory und Versorgungszugriff. China Mercants Bank plant auch weiterhin als aktiver Beitrag zur HAMi Open Source Community, Erfahrung mit Transport und Förderung der Entwicklung heterogener KI-Infrastruktur.

## Zusammenfassung

Die Praxis der China Mercantants Bank zeigt, dass Kubernetes und Hami eine gemeinsame Basis für die Verwaltung der unternehmensweiten heterogenen KI-Infrastruktur bieten können. Durch die Erhöhung der Ressourcennutzung, die Optimierung von Belastungen und die Freigabe von feinkörnigen Ressourcen hat die Bank eine effizientere und erweiterte Plattform geschaffen, um wachsende KI-Projekte innerhalb der Organisation zu unterstützen.

>

<div class="case-source-note">
<p>Original:<a href="https://www.cncf.io/case-studies/china-merchants-bank/" target="_blank" rel="noopener">China Merchants Bank Improves AI Compute Scheduling on Kubernetes with HAMi ↗</a><br>Herausgeber: Cloud Native Computing Foundation (CNCF) · 2026-07-02</p><p>Diese lokalisierte Fassung übernimmt die technischen Informationen und den Messumfang des Originalartikels. Sie ist keine offizielle CNCF-Übersetzung. Architekturdiagramme behalten ihren Originaltext. Projektstatus und Produktangaben beziehen sich auf das ursprüngliche Veröffentlichungsdatum.</p><p>Das Original wird unter den  <a href="https://www.linuxfoundation.org/legal/terms" target="_blank" rel="noopener">Inhaltsbedingungen der Linux Foundation</a> und  <a href="https://creativecommons.org/licenses/by/3.0/" target="_blank" rel="noopener">CC BY 3.0</a> verwendet. Diese Fassung wurde übersetzt und neu gestaltet. Alle Marken gehören ihren jeweiligen Inhabern.</p>
</div>
