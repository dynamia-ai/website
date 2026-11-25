---
title: "Mehrere Chiptypen und Modelle: Die KI-Infrastruktur der Bank of Ningbo"
date: "2026-11-25"
excerpt: "Die Bank of Ningbo vereinheitlicht mit Kubernetes, HAMi und Higress schrittweise die Verwaltung heterogener Ressourcen und die Governance von Inferenzdiensten. Vorhandene Infrastruktur unterstützt so verschiedene Modellgrößen und die clusterübergreifende Dienstnutzung."
author: "Dynamia"
category: "Case Study"
coverDisplay: "text"
tags: ["Kubernetes", "HAMi", "Higress", "Bank of Ningbo", "AI Infrastructure"]
---

> Mit dem Übergang von Finanz-KI-Anwendungen in den Produktionsbetrieb stehen Banken vor der Aufgabe, unterschiedliche Rechenressourcen einheitlich zu verwalten und Modelle verschiedener Größen bereitzustellen.
>
> In der Cloud-nativen KI-Architektur der Bank of Ningbo übernimmt HAMi die Verwaltung und das Scheduling der zugrunde liegenden heterogenen Ressourcen. Unterstützte GPUs und chinesische Beschleuniger werden in die Kubernetes-Ressourcenverwaltung eingebunden. Gemeinsam mit Higress für die Governance der Inferenzdienste entsteht eine mehrschichtige Architektur von der Ressourcenvergabe bis zur Steuerung des Inferenzverkehrs.
>
> Dieser Beitrag beschreibt Architektur, Auswahl der Open-Source-Komponenten, erste Ergebnisse und weitere Entwicklungsschritte als Praxisbeispiel für heterogene KI-Infrastruktur im Finanzsektor.

## Hintergrund

Die Bank of Ningbo ist eine regionale chinesische Geschäftsbank mit Schwerpunkten auf lokaler finanzieller Teilhabe, Privat- und Firmenkundengeschäft sowie intelligentem Risikomanagement.

In den vergangenen Jahren hat sie ihre digitale und KI-Transformation vorangetrieben. In ihrer privaten Umgebung stellt sie schrittweise große Sprachmodelle für Finanzanwendungen bereit, passt diese durch geschäftsspezifisches Fine-Tuning an und führt intelligente Inferenzdienste ein.

Inzwischen betreibt die Bank große Allzweckmodelle, Geschäftsmodelle mit langen Kontextfenstern, schlanke Frage-Antwort-Modelle und finanzspezifische Modelle. Mit dem zunehmenden Einsatz von KI im täglichen Produktionsbetrieb kommen auch heterogene Ressourcen wie allgemeine GPUs und chinesische Beschleuniger zum Einsatz.

Im Vergleich zu Großbanken legen regionale Geschäftsbanken bei KI-Projekten meist mehr Wert auf schlanke Implementierung, schrittweise Weiterentwicklung und konkrete Geschäftsergebnisse. Statt sehr große Rechencluster aufzubauen, konzentrieren sie sich darauf, vorhandene Ressourcen besser zu nutzen, Modelldienste zu standardisieren und Modellfähigkeiten mit Geschäftsszenarien zu verbinden.

Vor diesem Hintergrund begann die Bank of Ningbo, ihre KI-Infrastruktur schrittweise zu standardisieren und Ressourcen zusammenzuführen.

## Architektur und Ziele

### Herausforderungen

Während KI vom Pilotprojekt in das tägliche Bankgeschäft übergeht, muss die Bank verschiedene Modelltypen auf allgemeinen GPUs und chinesischen NPUs betreiben.

Hardwareabhängige Deployment-Stacks, die Vergabe ganzer Karten und separat angebotene Modelldienste führten jedoch zunehmend zu Ressourceninseln.

Einige Cluster waren überlastet, während die Rechenleistung anderer unzureichend genutzt wurde. Für jeden Workload mussten Teams außerdem Modelle, Beschleuniger und Dienstendpunkte manuell zuordnen. Das erhöhte die Komplexität von Bereitstellung und Betrieb.

Die Bank entschied sich deshalb für Cloud-native Open-Source-Technologien, um vorhandene Rechenressourcen und Modellbestände besser zu nutzen. Statt sich ausschließlich auf einen umfangreichen Hardwareausbau zu stützen, verfolgt sie eine schlanke, standardisierte und effiziente Bereitstellung von Finanz-KI-Anwendungen.

### Kernziele

- **Einheitliche Verwaltung heterogener Ressourcen:** Ein gemeinsames Ressourcenmodell auf Kubernetes reduziert den Aufwand für getrennte Deployment-Stacks je Chiptyp.
- **Einheitlicher Zugang zu Inferenzdiensten:** Unterschiede bei Hardware und Clusterverteilung werden abstrahiert, damit Geschäftsanwendungen Modelldienste einfacher aufrufen können.
- **Abgestuftes Routing zwischen Modellen:** Modelle unterschiedlicher Größe werden passend zur Aufgabe ausgewählt. Leichte Aufgaben wie einfache Fragen und Antworten sollen hochwertige Rechenressourcen nicht unnötig belegen.
- **Clusterübergreifende Nutzung von Inferenzdiensten:** Dienstkapazität wird zwischen GPU- und chinesischen Beschleuniger-Clustern geteilt, einschließlich grundlegender Verkehrsumleitung und Ausfallsicherung.
- **Kontrollierte Einführungskosten:** Ein schrittweises Vorgehen soll auch anderen kleinen und mittleren Banken als Orientierung dienen.

### Gesamtarchitektur

**Auf Basis von Kubernetes hat die Bank of Ningbo eine mehrschichtige Architektur mit Ressourcenverwaltung und Governance der Inferenzdienste als Kern aufgebaut.**

Von unten nach oben umfasst sie vier Ebenen: heterogene Infrastruktur und Ressourcenpools, die Kubernetes-Basis für den Bankbetrieb, die LLM-Dienstplattform und intelligente Geschäftsanwendungen.

Der Entwurf folgt drei Prinzipien:

- Trennung der Verantwortlichkeiten, damit Rechen-, Plattform- und Dienstebene unabhängig weiterentwickelt werden können.
- Weniger wiederholte Konfiguration durch die Verwaltung verschiedener Ressourcenpools mit mehreren Kubernetes-Clustern.
- Schrittweise Erweiterung um Komponenten wie Kueue und Spiderpool entsprechend den Anforderungen einzelner Szenarien.

![Mehrschichtige KI-Infrastruktur der Bank of Ningbo](/images/blog/bank-of-ningbo-ai-infrastructure/image-01-en.png)

### Heterogene Infrastruktur und Ressourcenpools

Allgemeine GPUs, chinesische NPUs und weitere Beschleuniger bilden zusammen mit Hochgeschwindigkeitsnetzen und verteiltem Speicher die heterogene Infrastruktur in der privaten Finanz-Cloud der Bank.

Nach Chiptyp werden die Ressourcen in GPU-Pools und Pools chinesischer Beschleuniger aufgeteilt. Separate Kubernetes-Cluster verwalten diese Pools, damit sich Treiber, Laufzeitumgebungen und Betriebsabläufe verschiedener Hersteller nicht gegenseitig beeinträchtigen.

Die Architektur behält die jeweiligen Treiber und Laufzeitumgebungen bei. Sie setzt an der Ressourcenverwaltung an, um Verwaltung und Konfiguration unterschiedlicher Rechenressourcen zu vereinfachen.

### Kubernetes-Basis und Ressourcenverwaltung

Eine Kubernetes-Basis mit mehreren Clustern verwaltet die GPU- und Beschleuniger-Pools. Für Modelldienste und Plattformkomponenten stellt sie eine einheitliche Container-Laufzeitumgebung bereit.

Darauf aufbauend hat die Bank folgende Open-Source-Komponenten für Scheduling, Warteschlangen und Kontingente sowie Container-Netzwerke eingeführt oder eingeplant.

#### **HAMi: heterogene Ressourcenverwaltung und Scheduling**

HAMi registriert Beschleuniger, deren Geräte-Plugins und Laufzeitumgebungen angepasst wurden, als Ressourcen, die Kubernetes erkennen und anfordern kann. So entstehen eine vergleichsweise einheitliche Ressourcensicht, ein gemeinsamer Anforderungsmechanismus und ein konsistenter Scheduling-Ablauf. Je nach Hardwarefähigkeit werden ganze Geräte oder fein unterteilte Ressourcen vergeben. Das vereinfacht die Verwaltung und Konfiguration verschiedener Hardwaretypen.

#### **Kueue: Warteschlangen und Kontingente**

Kueue ist für eine spätere Phase vorgesehen. Wenn die abteilungsübergreifende Ressourcennutzung und Batch-Trainingslasten weiter wachsen, soll es Warteschlangenprioritäten und Kontingente verwalten.

#### **Spiderpool: Netzwerkverwaltung**

Spiderpool übernimmt als Basiskomponente die IP-Adressvergabe und Netzwerkorchestrierung für Container in den Clustern.

Diese Komponenten arbeiten mit dem nativen Kubernetes-Scheduling zusammen. Sie unterstützen standardisierte Vorlagen für Ressourcenanforderungen, Scheduling-Vorgaben und Deployment-Abläufe. Dadurch muss dasselbe Modell beim Einsatz in mehreren Clustern seltener wiederholt konfiguriert werden.

### LLM-Dienstplattform und Governance der Inferenzdienste

Die LLM-Dienstplattform besteht aus einer Basis für die Modellverwaltung und einer Governance-Ebene für Inferenzdienste.

Die Modellverwaltung umfasst den gesamten Modelllebenszyklus, Tags, Kategorisierung und Gruppierung, Zugriffskontrolle und einen Modellmarktplatz. Verschiedene Fachabteilungen erhalten damit eine gemeinsame Sicht auf Modellbestände und einen einheitlichen Zugang.

Higress unterstützt die Governance der Inferenzdienste. Dazu gehören ein gemeinsamer Diensteinstieg, Modellrouting anhand von Anfrageattributen, Verkehrsgewichtung, Zustandsprüfungen und das Entfernen fehlerhafter Backends, Laufzeitbeobachtung und Sicherheitskontrollen.

Die Zuständigkeiten von Higress sind gegenüber dem vorhandenen API-Gateway und der Sicherheitsplattform der Bank klar abgegrenzt.

#### **Abgestuftes Modellrouting anhand von Anfrageattributen**

Für gemischte Deployments aus großen Allzweckmodellen, Geschäftsmodellen mit langem Kontext, schlanken Frage-Antwort-Modellen und Finanzmodellen leitet Higress Anfragen anhand vorkonfigurierter Regeln an geeignete Modelldienste weiter.

Als Kriterien kommen unter anderem Geschäftsherkunft, API-Typ und -Pfad, Identität des Aufrufers, Geschäfts-Tags, Kontextlänge, Anfragepriorität, SLA-Stufe, gewünschtes Modell und Backend-Zustand infrage.

Komplexere Aufgaben können an größere Modelle gehen. Einfache Fragen und leichte Szenarien werden kleineren Modellen zugeordnet, um hochwertige Rechenressourcen nicht unnötig zu beanspruchen.

#### Logisches Pooling von Inferenzdiensten über Chiptypen hinweg

In dieser Architektur vergibt HAMi die Rechenressourcen bei der Bereitstellung. Higress steuert den Inferenzverkehr während der Laufzeit.

Werden Modelle gleicher Spezifikation in GPU- und chinesischen Beschleuniger-Clustern betrieben, bietet Higress einen vergleichsweise einheitlichen Zugang. Neue Anfragen werden anhand voreingestellter Gewichte, Geschäftsregeln und Backend-Zustände auf die Modelldienste verschiedener Cluster verteilt.

So lassen sich Inferenzdienste in gewissem Umfang chipübergreifend nutzen und grundlegende Ausfallsicherungsmechanismen bereitstellen.

Konkret verteilt das System Anfragen über vorkonfigurierte Verkehrsgewichte, Regeln für Geschäftsklassen, Zustandsprüfungen und schwellenwertbasierte Auslöser zwischen Inferenzclustern.

Fällt der primäre Cluster aus oder erreicht er einen festgelegten Lastschwellenwert, können geeignete neue Anfragen an einen Reservecluster weitergeleitet werden. Dies ermöglicht grundlegende Verkehrsumleitung und Ausfallsicherung.

### Intelligente Geschäftsanwendungen

Interne KI-Anwendungen für Risikomanagement, Kundenservice, Betriebsprüfungen, Textanalyse und Marketing rufen Modelldienste über den gemeinsamen Zugang auf.

Geschäftssysteme müssen die zugrunde liegenden Chiptypen oder die Clusterverteilung nicht kennen. Mit Modell-Tags und Zugriffskontrollen können Fachabteilungen Modellfähigkeiten bedarfsgerecht nutzen und Modelle, Rechenleistung und Dienste schrittweise wiederverwenden.

## Warum diese Projekte ausgewählt wurden

### **Kubernetes**

Kubernetes passt zur bestehenden privaten Finanz-Cloud der Bank. Es bietet Containerorchestrierung, Ressourcen-Scheduling und Selbstheilung der Cluster. Es unterstützt KI-Dienste über verschiedene Chiptypen und Modelle hinweg und schafft eine standardisierte Grundlage für einheitliche Ressourcenverwaltung und Inferenz-Governance.

### **HAMi**

HAMi integriert sich nativ in Kubernetes und erfordert keinen umfassenden Umbau des vorhandenen Stacks.

Sein zentraler Nutzen liegt darin, unterstützte heterogene Beschleuniger in die Kubernetes-Ressourcenverwaltung einzubinden. Eine vergleichsweise einheitliche Ressourcensicht, ein gemeinsamer Anforderungsmechanismus und konsistentes Scheduling vereinfachen die getrennte Verwaltung und Konfiguration unterschiedlicher Hardwaretypen.

Treiber, Laufzeitumgebungen, Modell-Images und die Anpassung von Operatoren für die jeweiligen Chips bleiben Aufgabe der entsprechenden Hardwareplattform. Je nach tatsächlicher Gerätefähigkeit werden ganze Geräte oder fein unterteilte Ressourcen vergeben.

### **Higress**

Im Vergleich zu allgemeinen API-Gateways bietet Higress Governance für KI-Inferenzdienste. Dazu gehören ein einheitlicher Diensteinstieg, Routing anhand von Anfrageattributen, die Backend-Auswahl nach Verkehrsgewichten und Zustand, das Entfernen fehlerhafter Backends und grundlegende Beobachtbarkeit.

Als Komponente zur Verkehrssteuerung auf der Inferenzdienstebene ersetzt Higress weder das Scheduling der zugrunde liegenden Rechenressourcen noch übernimmt es die Leistungsoptimierung der Inferenz-Engine.

### **Spiderpool**

Spiderpool stellt als Basiskomponente IP-Adressvergabe und Netzwerkorchestrierung für Container bereit.

### **Kueue**

Die Bank verwaltet Trainings- und Inferenzressourcen derzeit in getrennten Pools. Der Wettbewerb zwischen Mandanten ist relativ begrenzt. Ein Bedarf an Warteschlangen für umfangreiche Batch-Aufgaben ist noch nicht entstanden.

Kueue dient aktuell als technische Reserve für die spätere Ausweitung abteilungsübergreifender Ressourcennutzung und des Batch-Trainings. Es zählt noch nicht zu den bereits umgesetzten Ergebnissen dieser Architektur.

## Erste Ergebnisse und praktische Erfahrungen

### Erste Ergebnisse

Bei einheitlicher Ressourcenverwaltung und Governance der Inferenzdienste hat die Bank schrittweise Fortschritte erzielt.

#### Ressourcenverwaltung

- Der Umfang der zentral verwalteten heterogenen Ressourcen wächst. Unterstützte Beschleuniger lassen sich über einen einheitlichen Prozess integrieren.
- Wiederholte Ressourcenkonfiguration und Dienstanbindung wurden reduziert.
- Die Eignung ganzer Geräte und fein unterteilter Ressourcen wurde in ausgewählten Szenarien geprüft.

#### Governance der Inferenzdienste

- Erste Fähigkeiten zum abgestuften Modellrouting beruhen auf Eingabeattributen und vorkonfigurierten Regeln.
- Die clusterübergreifende Verkehrsumschaltung wurde in ausgewählten Szenarien geprüft, einschließlich des Entfernens fehlerhafter Backends anhand von Zustandsprüfungen und schwellenwertgesteuerter Umleitung.
- Eine technische Grundlage für die spätere Optimierung von Modellaufrufkosten und Dienstzuverlässigkeit wurde geschaffen.

### Übertragbare Erfahrungen

#### Klare Schichten und Zuständigkeiten

Die Zweiteilung mit HAMi für die zugrunde liegende Ressourcenverwaltung und Higress für die darüberliegende Inferenz-Governance passt zum aktuellen Umsetzungsumfang. Klare Grenzen vermeiden Verwechslungen bei den Fähigkeiten der Komponenten.

#### Für heterogene Umgebungen kleiner und mittlerer Banken entworfen

Der Ansatz berücksichtigt das bei regionalen Banken verbreitete Nebeneinander mehrerer Chiptypen und Modellgrößen. Anders als Architekturen mit nur einem Ressourcentyp und standardisierten Modellen setzt er bei Ressourcenverwaltung und gemeinsamem Dienstzugang an. Das ermöglicht eine schlanke Umsetzung mit kontrollierbaren Investitionen.

#### Pragmatische Wiederverwendung von Open-Source-Komponenten

HAMi konzentriert sich auf Ressourcenverwaltung und Scheduling, Higress auf die Verkehrssteuerung für Inferenzdienste. Beide werden in das vorhandene Sicherheitsmanagement der Bank eingebunden. Die Komponenten sind entsprechend den Anforderungen des Bankbetriebs konfiguriert und integriert, ohne ihre Fähigkeiten zu überzeichnen.

#### Vorhandene Ressourcen durch einen schlanken Ansatz besser nutzen

Die Bank verbessert die Nutzung vorhandener Rechen- und Modellressourcen durch Ressourcenverwaltung und Dienst-Governance, statt sich ausschließlich auf Hardwareausbau zu stützen. Für kleine und mittlere Banken bietet das einen praxisnahen, schrittweise umsetzbaren Weg.

## Weitere Entwicklung

### **HAMi-Abdeckung erweitern**

Weitere Beschleunigerkarten sollen nach Anpassung ihrer Geräte-Plugins und Laufzeitumgebungen schrittweise eingebunden werden. Gleichzeitig werden die Regeln für die Vergabe ganzer Geräte und unterteilter Ressourcen weiter verbessert.

### **Governance der Inferenzdienste ausbauen**

Das Routing anhand von Eingabeattributen soll verfeinert werden. Verkehrsgewichte sollen regelmäßig und abhängig vom Betriebszustand angepasst werden können. Später könnten leichte Klassifikations- oder Absichtserkennungskomponenten Routing-Tags für das KI-Gateway liefern, um in KI-Agenten-Szenarien schrittweise eine semantische Modellauswahl zu ermöglichen.

### **Dynamische Verkehrsverteilung in Echtzeit untersuchen**

Sobald Metriken der Inferenz-Engine, Diensterkennung, Monitoring und Gewichtungssteuerung bereitstehen, soll eine dynamische Verteilung anhand aktueller Latenz, Parallelität und Knotenzustände untersucht werden.

### **Kueue einführen**

Wenn abteilungsübergreifende Ressourcennutzung und Batch-Training eine entsprechende Größe erreichen, sollen Warteschlangenprioritäten und Kontingentverwaltung ergänzt werden.

### **Erfahrungen an Open-Source-Communities zurückgeben**

Die Bank will Erfahrungen aus Aufbau und Betrieb heterogener KI-Cluster regionaler Geschäftsbanken weiter aufbereiten. Anforderungen aus realen Geschäftsszenarien sollen an die HAMi- und Higress-Communities zurückfließen, damit Projekte und Branchenpraxis gemeinsam weiterentwickelt werden.

> Bearbeitet nach der von der Cloud Native Computing Foundation (CNCF) veröffentlichten [CNCF-Fallstudie zur Bank of Ningbo](https://endusers.cncf.io/architectures/bank-of-ningbo/).

> Die ursprüngliche Fallstudie wurde von der Bank of Ningbo und DaoCloud bei der CNCF eingereicht und unter [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) veröffentlicht. Dieser Beitrag wurde aus der chinesischen Fassung bearbeitet und übersetzt.
