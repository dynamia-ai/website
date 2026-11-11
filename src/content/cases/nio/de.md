---
title: "NIO verbessert mit HAMi die GPU-Auslastung für Workloads des autonomen Fahrens"
company: "nio"
companyName: "NIO"
logo: "/redesign/assets/44b82bb215dc80472ae8.svg"
date: "2026-03-17"
dateLabel: "2026.03.17"
sourceKind: "CNCF-Fallstudie · Übersetzte Fassung"
sourceUrl: "https://www.cncf.io/case-studies/nio/"
sourceLinkLabel: "CNCF-Original lesen ↗"
outcomeSourceUrl: ""
outcomeSourceLabel: "Schlüsseldatenquelle: Dynamia Network of Officials"
outcomes:
  - value: "600"
    label: "GPUs auf rund 80 Knoten"
    detail: "Gesamte Infrastruktur; nicht alle GPUs nutzen HAMi"
  - value: "10×"
    label: "Höhere GPU-Auslastung in CI-Pipelines"
    detail: "Angabe aus der Website-Zusammenfassung; im Text werden auch rund 4× genannt. Siehe redaktionellen Hinweis."
  - value: "30%"
    label: "Weniger GPU-Stunden für Simulations-Workloads"
    detail: ""
---

Das Team konzentriert sich auf die GPU-Leistungsoptimierung und die Beteiligung an Planungsentscheidungen für GPU- und Rechenressourcen.

Original-Schlüsselindikatoren: ca. 80 Knoten, 600 GPUs; CI-Flow-Line GPU-Auslastung 10 mal höher; 30% Reduzierung der Simulationsbelastung von GPU-Maschinen.

## Herausforderungen

NIOs großformatige Cloud-Infrastruktur unterstützt eine Vielzahl von Autopiloten, einschließlich Schulung, Simulation, CI/Testing und Online-Zugang. Teams sind für die GPU-Leistungsoptimierung und Ressourcenplanung verantwortlich.

### GPU Low Usage Workload

#### CI- und Testaufgaben

Der Großteil der Zeit, die für eine CI-Task ausgegeben wird, wird auf CPU-intensive Operationen wie Compilation, Dateiextraktion und Vorverarbeitung verbracht. GPU wird nur intermittierend verwendet. Im gesamten Kartenverteilungsmodus ist die durchschnittliche GPU-Nutzung in der Regel nur **5%–10%**。

#### Simulieren der Task-Last

Einfache Linienlinien für die Videostream-Verarbeitung, Radardaten und Validierung der Referenz. Einzelne Aufgaben sind relativ anspruchslos und unempfindlich gegen Verzögerungen und eignen sich zur Koimplementierung auf gemeinsamen GPUs.

#### Online-Inferenz und kleine Modellinferenz

Viele Inferenzdienste werden nur benötigt **1/4 oder 1/2 GPU**. Die Verteilungskarte ist ineffizient und teuer.

- GPU Cluster Größe **begrenzt** Einige der Kapazitäten stammen aus öffentlichen Wolken. **Volumensatz** Modus.
- Niedrige GPU Nutzung durch **GPU Verspätete Zeit** , direkt die Betriebskosten erhöhen.
- Ineffiziente Verteilung verlängert auch Wartezeiten für hochprioritätsbezogene Trainingsaufgaben.

NIO braucht einen Job, ohne die Stabilität seiner Last zu verlieren.**GPU-Auslastung aufrüsten**, während die Unterstützung des Betriebs von mehreren Arten von Arbeitsbelastungen in der gleichen Kubernetes-Umgebung.

## Loesungen

Nio hat es benutzt.**Gemischte GPU-Sharing-Politik**, wählen Sie einen anderen GPU-Zuweisungsmechanismus basierend auf den Lasteigenschaften statt ein einziges Schema zu errichten.

Die folgende Grafik zeigt die GPU-Managementstruktur, die Hami in Kubernetes integriert.

![Diagramm Ressourcenverwaltungsarchitektur](/redesign/assets/7241c8737a88c1ecabab.png)
*Abbildung 1: Ressourcenmanagementarchitektur*

HAMi bietet Kubernetes durch die Scheduler Extension (Stand 2) und die Installations-Plugin-Integration (Stand 4) mit feiner Partikelgröße GPU-Sharing-Kapazität, ermöglicht eine flexible GPU-Ressourcenzuweisung, während es mit NVIDIA MIG und Time-Score-Strategie zusammenkommt.

### Geschätzte Programme

**NVIDIA MIG**

Bietet starke Einsamkeit, unterstützt aber nur vordefinierte Trenngröße und es ist schwierig, die Notwendigkeit von feineren Körnern (z.B. 1/6 oder 1/8 GPU) anzupassen.

**Zeit-Slicing**

Ermöglicht Arbeitsbelastungen, frei für GPU-Ressourcen mit sehr geringen Kosten zu konkurrieren. Es gibt jedoch keine strengen Einschränkungen auf GPU-Speicher und Rechenvolumina, die für bestimmte Produktionslasten geeignet sind.

**HAMi (CNCF Sandbox Projekt)**

Ja. **GPU-Memoory und Computerressourcen**Dieses Verfahren ist proportional zu den tatsächlichen Arbeitsbelastungsanforderungen.

### Produktionsstrategien

Die NIO ersetzt die bestehenden Mechanismen nicht, sondern verbindet sie mit:

- **MIG：** Eine Umgebung für Algorithmen Entwicklung und stärkere Einsamkeit
- **HAMi：** Für CI-Aufgaben und ausgewählte Referenz- und Simulationsaufgabenlasten
- **Zeitsegment:** Es ist eine Szene, die Ressourcenwettbewerb toleriert.

Diese Hybridstrategie hat die GPU-Auslastung erhöht und gleichzeitig Korrektheit und Betriebssicherheit beibehalten.

## Durchführung

- HAMi DISPLACE IN **Ausgewählte GPU-Cluster** Auf, nicht alle Cluster.
- Große Trainingsmissionen werden standardmäßig weiterhin ganze Karten verwenden.
- HAMi überschreibt vor allem die für GPU-Sliceverteilung geeignete Aufgabenbelastung.

**Einsatzskala:**

- Ungefähr **50 – 70 aktive Knoten**
- Ungefähr **400-560 GPUs** (basierend auf 8 Karten pro Knoten)

### Resource Allocation Design

Für die Simulationslast wird NIO **GPU GPU Speicher (VRAM)** Als Hauptverbindlichkeit betrachtet:

- Unzureichende Rechenkapazität kann durch Verzögerungen bei der Planung gemildert werden.
- GPU-Speicherdepletion wird sofort zu OOM versagen und kann die Verarbeitung nicht verzögert.

Das Team fand auch heraus:**Es ist nicht so dünn wie es wird.**. Für einige Simulationslasten, die ungefähr **1/6 GPU** Kleinere Fraktionen (z.B. 1/8) stellen zusätzliche Kosten für die Planung und Virtualisierung ein, wodurch der Gesamtdurchsatz reduziert wird.

## Wirksamkeit

### CI-Task laden: Von Abfall zu Wiederverwenden

**Vor der Verwendung von HAMi:**

CI-Missionen sind hauptsächlich CPU-intensiv, mit durchschnittlichen GPU-Auslastung nur etwa **5%（5%–10%）**。

**Nach der Verwendung von HAMi:**

Durch Einteilen von GPU in **1/4 oder kleinere Fraktion**, die effektive GPU-Ausnutzungsrate im CI-Rohr ist etwa zu erhöhen **4 mal**Ich bin auf dem Weg. **30%–50%**。

### Simulation der Aufgabenbelastung: höher, weniger GPU

- feine Partikelgröße GPU-Sharing reduziert den gesamten GPU-Zeitrahmen um etwa **30%** 。
- Original-Anforderungen **Über 3 Tage** End-to-End-Simulationen verkürzt **Über 2 Tage** 。

Diese Verbesserungen haben den Gesamtdurchsatz des Systems erhöht und die GPU-Kosten direkt reduziert.

## Erkenntnisse

**Das GPU-Segment ist nicht "die feinere der besseren".**

Jede Belastung hat die beste Bruchgröße. Übermäßige Fragmentierung kann den Wirkungsgrad reduzieren.

**Version Upgrades erfordern Leistungsvalidierung.**

Neue GPU-Virtualisierungskomponenten können Leistungsretreats einführen. Das NIO nutzt eine Phased-Upgrade-Strategie, um unterschiedliche Versionen der HAMi-Komponenten nach Überprüfung von Leistungs-Benchmarks laufen zu lassen.

**Betriebsänderungen müssen die Produktionssicherheit gewährleisten.**

Für Online-Referenzlasten folgen die Upgrades des Geräte-Plugins einem Prozess ähnlich Blue Green-Bereitstellung: zunächst den Verkehr zu bewegen, neue Pod zu implementieren und allmählich alte Beispiele zu fallen.

**Wesentlich ist die Kompatibilität der Werkzeugkette.**

Einige Compiler oder Bibliotheksfunktionen (z.B. Pointer- oder Adressanalyse) können mit GPU-Abhörmechanismen in Konflikt treten, wobei sorgfältige Kompromisse zwischen Funktionalität und Stabilität erforderlich sind.

Durch die Kombination von HAMi mit bestehenden GPU-Verteilungsmechanismen wie Kubernetes und MIG, Zeitanteilen hat NIO eine erhöhte GPS-Auslastung, einen reduzierten Gesamtverbrauch an GPU-Maschinen und eine verbesserte Arbeitsbelastung durch die garantierte Stabilität.

Diese hybride Ressourcenmanagementstrategie ermöglicht es NIO, die Diversifizierung von KI-Jobs von CI-Rohrleitungen effizienter zu unterstützen, um Simulationen und Inferenz in der gleichen Kubernetes-Umgebung durchzuführen.

<div class="case-source-note">
<p>Original:<a href="https://www.cncf.io/case-studies/nio/" target="_blank" rel="noopener">NIO improves GPU utilization for autonomous driving workloads with HAMi ↗</a><br>Herausgeber: Cloud Native Computing Foundation (CNCF) · 2026-03-17</p><p>Diese lokalisierte Fassung übernimmt die technischen Informationen und den Messumfang des Originalartikels. Sie ist keine offizielle CNCF-Übersetzung. Architekturdiagramme behalten ihren Originaltext. Projektstatus und Produktangaben beziehen sich auf das ursprüngliche Veröffentlichungsdatum.</p><p>Das Original wird unter den  <a href="https://www.linuxfoundation.org/legal/terms" target="_blank" rel="noopener">Inhaltsbedingungen der Linux Foundation</a> und  <a href="https://creativecommons.org/licenses/by/3.0/" target="_blank" rel="noopener">CC BY 3.0</a> verwendet. Diese Fassung wurde übersetzt und neu gestaltet. Alle Marken gehören ihren jeweiligen Inhabern.</p><p class="fact-note">Translator: Die Verwendung des ursprünglichen Fokusindikators für das Schreiben CI hat das Zehnfache erhöht, während der Text etwa viermal so groß ist wie geschrieben, 30% - 50%. Die Übersetzung behält zwei originale Kaliber; die Vorschaukarte verwendet eine Simulationszeitanzeige ohne diesen Unterschied.</p>
</div>
