---
title: "PREP EDU ermöglicht effiziente GPU-Orchestrierung für KI-Inferenz"
company: "prep-edu"
companyName: "PREP EDU"
logo: "/redesign/assets/c53a000a30233660d2d0.svg"
date: "2025-08-20"
dateLabel: "2025.08.20"
sourceKind: "CNCF-Fallstudie · Übersetzte Fassung"
sourceUrl: "https://www.cncf.io/case-studies/prep-edu/"
sourceLinkLabel: "CNCF-Original lesen ↗"
outcomeSourceUrl: ""
outcomeSourceLabel: "Schlüsseldatenquelle: Dynamia Network of Officials"
outcomes:
  - value: "1+ Jahr"
    label: "Stabiler Produktionseinsatz"
    detail: "Zum Zeitpunkt der Fallstudienveröffentlichung"
  - value: "90%"
    label: "Abdeckung der GPU-Infrastrukturoptimierung"
    detail: "Durch HAMi verwalteter und optimierter Anteil"
  - value: "50%"
    label: "Weniger Herausforderungen bei GPU-Verwaltung und Betrieb"
    detail: ""
---

## Herausforderungen

PREP EDU betreibt die Kubernetes-basierte KI-Referenzplattform, Heterogene GPU-Cluster, die hauptsächlich aus RTX 4070 und RTX 4090-Knoten bestehen. Verschiedene Belastungen erfordern oft spezifische Arten von GPU zur Optimierung der Leistung und Kompatibilität, die Ressourcenzuweisung erschwert.

Die statische Verteilung hat zu einer chronischen geringen Auslastung von GPU geführt, oft nur 10-20 Prozent, mit großen Mengen an Informationen für den Leerlauf.

Vor der Einführung von HAMi versuchten Teams andere GPU-Programme, aber sie fehlten an effektiver Deckung und konkurrierten für mehrere Aufgaben, die häufig zu Ressourcenkonflikten führen, Probleme mit der GPU Verteilung und dem Zusammenbruch in der Anwendung, so dass es schwierig ist, eine faire und effiziente Aufteilung zu gewährleisten und die allgemeine Servicestabilität zu beeinflussen.

Das Team ist auch über Kompatibilität besorgt: das neue Programm muss nahtlos in etablierte Produktionsumgebungen integriert werden, einschließlich GPU Operator und RKE2 Kubernetes. Das Team braucht intelligente Organisation heterogener GPUs, zuverlässige Organisation, um Missionsstörungen zu verhindern, die Gesamtauslastung deutlich zu erhöhen, gleichzeitig mit der aktuellen Infrastruktur kompatibel.

## Loesungen

Das Team nutzt HAMi als GPU-Programm. Wenn der Fall veröffentlicht wird, ist HAMi ein CNCF Sandbox-Projekt. In GitHubs Suche nach GPU-Sharing nimmt das Team den Einfluss von Hami im GPU-System auf; seine Dokumentation ist klar und geeignet für ihre Kubernetes (RKE2) Umgebung.

HAMIs vGPU Lernfähigkeit ermöglicht PREP EDU:

- **Virtualisierung und GPU Split:** Für mehrere Inferenzdienste werden spezifische Einschränkungen auf Lasten durch NLP Token Länge und Service-Anforderung gesetzt.
- **Heterogene GPU Management:** Verbessern Sie die Kompatibilität und Effizienz, indem Sie Aufgaben bestimmten Kartentypen zuordnen, beispielsweise indem bestimmte Artikel nur auf RTX 4070 oder 4090 basierend auf einer Ressourcenauswahl basierend auf der Anmerkung ausgeführt werden können.
- **Eine nahtlose Integration Anwendung:** Verwenden Sie Transparenz-Ausrüstung, um GPU ohne Änderung zu teilen und zu verteilen.
- **Spezifizierte GPU:** Drücken Sie UUID auf ein bestimmtes Gerät, beispielsweise durch mehrere Prozesse auf einem 24GB 4090.
- **Kompatibilität:** HAMi ist mit NVIDIA GPU-Operator in ihrer Umgebung zusammengehörig und für die Verwendung von consainerd konfiguriert; und verwendet Prometheus zur Überwachung und Alarmierung, die nahtlos in Kubernetes (RKE2) integriert sind, containerd.

Auf dieser Basis hat das PREP EDU Team DevOps eine große Arbeitsflussoptimierung durchgeführt und wurde in der Produktionsumgebung eingesetzt:

- Die Erstellung neuer Knoten, um Cluster zu verbinden, wird automatisch durch HAMi-natured Workflows verwaltet und bringt den gesamten Cluster zusammen.
- Entdecken Sie die Selbständigkeit von Hami in der Docker-Umgebung für GPU-Programmierung für bestimmte Operationen.
- Das Finden von Best Practices in Zusammenarbeit mit NVIDIA GPU Superactor erleichtert die Clustererweiterung.

Diese Bemühungen reduzierten den Schmerzpunkt des GPU-Clustermanagements um 50 Prozent und optimierten 90 Prozent der GPU-Infrastruktur.

## Wirksamkeit der Durchführung

Mit der kombinierten Wirkung von HAMi und DevOps Team, die ihre Arbeit optimieren, sind die Ergebnisse klar:

- **Tiefe Integration:** HAMi verwaltet jetzt effizient 90 Prozent der GPU-Infrastruktur und bietet eine einheitliche Konfiguration von Clustern.
- **Verkehrseffizienz:** Der Zusammenbruch der Anwendung, der durch den GPU-Memoorienkonflikt verursacht wurde, wurde beseitigt, was 50% der bisherigen Schmerzen bei der Verwaltung von GPU-Ressourcen anging.
- **Erweiterung:** Das Team kann nahtlos einen neuen GPU-Knoten hinzufügen und HAMi organisiert automatisch heterogene Hardwareressourcen.
- **Flexibilität:** Die präzise Verteilung der Lasten nach GPU-Typ oder UUID ist auch für zukünftige Erweiterungstraining und große Sprachmodelllasten vorbereitet.

Das DevOps-Team setzt sich fort, Parameter und Algorithmen für eine stabile, hohe Leistung und einen effizienten GPU-Service als Geschäftsänderungen zu optimieren.

| Schlüsselindikatoren | Ergebnis |
| --- | --- |
| HAMi Produktionszeit | 1 Jahr |
| Verwenden Sie eine optimierte GPU-Infrastruktur für HAMi | 90% |
| GPU Management Pa | 50% Ermäßigung |

## Team-Feedback

> "Hami ist eine gute Wahl für das vGPU-Erlernen, um uns zu helfen, die Verwendung von AI Microservice GPUs zu optimieren. Überwachungs- und Alarmfunktionen sind auch bei der Langzeitverfolgung hilfreich. Das Dokument ist klar, Aufgaben an bestimmte Arten von GPUs zuordnen, was uns ein Vorteil ist."
>
> — Xues Nguyen, PREP EDU DevOps Ingenieur
>
> „Hami kann GPU GPU-Memoory und Unternehmensressourcen für jedes Projekt genau zuordnen, die Nutzung der Gesamtressourcen optimieren. So können wir auf gleich begrenztem GPU-Memoory mehr KI-Dienste bereitstellen, um die Effizienz und Skalierbarkeit zu erhöhen.“
>
> _Nhan Phan, PREP EDU AI Engineer
>
> „Hami hilft uns dabei, lokale Herausforderungen im Bereich der KI-Microservice-GPU-Management zu bewältigen, indem wir Lasten automatisch zuordnen und Wartungskosten senken. Teams können die Ressourceneffizienz mit wenig Input deutlich steigern.“
>
> — Phong Nguyen, PREP EDU AI Engineer
>
> „Hami hat unseren KI-Workstream geändert. Durch die Rationalisierung der GPU-Ressourcen auf Pod-Ebene können wir leichte Infoference-Dienste und große Batch-Operationen auf derselben Hardware ohne benachbarte Missionsstörungen bereitstellen.
>
> _Vu Hoang Tran, PREP EDU AI Engineer
>

<div class="case-source-note">
<p>Original:<a href="https://www.cncf.io/case-studies/prep-edu/" target="_blank" rel="noopener">Enabling Efficient GPU Orchestration for AI Inference at PREP EDU ↗</a><br>Herausgeber: Cloud Native Computing Foundation (CNCF) · 2025-08-20</p><p>Diese lokalisierte Fassung übernimmt die technischen Informationen und den Messumfang des Originalartikels. Sie ist keine offizielle CNCF-Übersetzung. Architekturdiagramme behalten ihren Originaltext. Projektstatus und Produktangaben beziehen sich auf das ursprüngliche Veröffentlichungsdatum.</p><p>Das Original wird unter den  <a href="https://www.linuxfoundation.org/legal/terms" target="_blank" rel="noopener">Inhaltsbedingungen der Linux Foundation</a> und  <a href="https://creativecommons.org/licenses/by/3.0/" target="_blank" rel="noopener">CC BY 3.0</a> verwendet. Diese Fassung wurde übersetzt und neu gestaltet. Alle Marken gehören ihren jeweiligen Inhabern.</p>
</div>
