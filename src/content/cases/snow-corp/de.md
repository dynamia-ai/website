---
title: "GenAI für 200 Millionen Nutzer: Wie SNOW 1.000 GPUs orchestriert, um Lastspitzen von 700 % zu bewältigen"
company: "snow-corp"
companyName: "SNOW Corp."
logo: "/redesign/assets/83f5bec99abccb7f8843.jpg"
date: "2026-05-05"
dateLabel: "2026.05.05"
sourceKind: "CNCF-Fallstudie · Übersetzte Fassung"
sourceUrl: "https://www.cncf.io/case-studies/snow-corp/"
sourceLinkLabel: "CNCF-Original lesen ↗"
outcomeSourceUrl: ""
outcomeSourceLabel: "Schlüsseldatenquelle: Dynamia Network of Officials"
outcomes:
  - value: "1,000+"
    label: "Orchestrierte A100-GPUs"
    detail: ""
  - value: "200 Mio.+"
    label: "Nutzer weltweit"
    detail: "Über SNOW, EPIK und B612"
  - value: "700%"
    label: "Bewältigte virale Lastspitzen"
    detail: "Zusammenspiel von HAMi, KEDA und der gesamten Plattform"
---

SNOW Corp. ist eine Tochtergesellschaft der koreanischen NAVER Gruppe, die einen 1000+Screen A100 GPU Berechnungscluster betreibt, der KI-Funktionalität für die drei weltweit renommierten GenAI-Anwendungen bietet: SNOW, EPIK, B612, mit 200 Millionen + Nutzern weltweit. **700 % des viralen Flusses**— Flussmuster sind unvorhersehbar und leicht flüchtig.

## Herausforderungen

Kernthema: Kubernetes Native GPU Scheduling sieht GPU als atomare Ressource. Pod entweder bekommt die ganze GPU oder nichts. Dieses Muster ist unter zwei Bedingungen unwirksam:

1. **Heterogene Workload-Anforderungen** Ausbildungsmissionen können 80% des GPU-Dienstprogramms konsumieren, aber nur 20% der GPU-Nutzung, während die Verwendung des Inferenzdienstes ganz anders ist.
2. **Traffic-Unvorhersehbarkeit** : Aufgrund viraler KI-Trends und extremen Strömungsschwankungen, die mit der Arbeitsbelastung der Heterogenen Inferenz verbunden sind, braucht das System Flexibilität zu dehnen. Aber es fehlt an einer GPU-Stärkungsquote von Beobachtung, Expansionsentscheidungen verlassen sich nur auf manuelle (glückliche Träume) oder grobe CPU/RAM-Anzeigen, die nicht die wahre Sättigung der GPU widerspiegeln.

Vor der Verwendung von Kubernetes, SNOW betrieben Docker-basierte Infrastruktur, manuell verteilt GPU:

- **Planungsblindheit** : 2-3 Container im gleichen Pod-Konkurrenten für GPU-Ressourcen ohne Koordination
- **Manuell Zoom** : Handbuch basierend auf der Lastprojektion Konfiguration GPU, nicht auf den tatsächlichen Bedürfnissen
- **Keine GPU-Aktie** : mehrere Behälter können nicht effizient einzelne GPU teilen
- **Kostenexplosion** : Um Spitzenlasten zu bewältigen, muss das Verhältnis überschritten werden **2 mal** (Eine für die Ausbildung, eine für die Inferenz, nur theoretisch)

![Übersicht der Strukturen](/redesign/assets/9f3517927ac5d3ae69ef.png)
*Abbildung 2: Überblick über die Struktur*

### Beobachtungslücke

Kubernetes HPA kann auf CPU und Speicherskalierung basieren, aber diese Indikatoren reflektieren nicht genau GPU-Sättigung.

## Loesungen

### Claud-native Compute Foundation (CNCF) Ökologie

SNOW geht auf die lokalisierte Kubernetes-Plattform, mit einer dekorierten externen ETC CD-Popup sicher hohe Verfügbarkeit. Das gesamte Technologie-Repository wird von CNCF Ecology unterstützt: CNI, Helm erreicht Gitops-Einsatz, Traefik als Ingress, Prometheus/Loki/Grafana bietet Zugang,**HAMi erzielt GPU-Sharing**、**KEDA erreicht automatische Skalierung**。

### GPU Sharing with HAMi

Kubernetes Default Scheduler erzwingt strenge GPU-Integration, die verhindert SNOW sequenzierte Ausbildung - Migration von Inferenzstromlinien - Trainer und Inferenzmotoren müssen die gleiche GPU teilen. Hami löst dieses Problem durch Virtualisierung GPU Ressourcen (vGPU), so dass mehrere Container in demselben Pod eine einzelne GPU teilen können.

![Zu Inferenzprozess trainiert](/redesign/assets/241cbda9533d1e659947.png)
*Abbildung 3: Ausgebildeter Zugangsprozess*

### Proactive GPU Orchestration with KEDA

Standard-Indikatoren (CPU/RAM, DCGM-Auslastung) sind für die heterogene Belastung von SNOW unzuverlässig und der eingebaute RabbitMQ Zoomer innerhalb von KEDA dient als Verzögerungsanzeige - unter Berücksichtigung von etwa 60 Sekunden Modellvorwärmzeit ist es immer zu spät, nach der Entstehung von Queue-Backlogs eine Skalierung auszulösen.

Dazu hat SNOW einen leichten benutzerdefinierten Metric Server (Python/FastAPI) entwickelt, um die Verbrauchersättigungsanzeigen dem Medics API Scaler von KEDA zu entlarven:

`active_ratio = unacked_messages / active_consumers`

Wann? `active_ratio` KEDA bereitet neue GPU Pod für aktive Vorwärmfenster vor der Sättigung des Arbeitsbeckens vor. `stabilizationWindowSeconds` und `cooldownPeriod` Verhindern Sie eine frühzeitige Freigabe der Ressourcen während der Niedrigstromperioden.

![KEDA Autoscaling Structure](/redesign/assets/33a977524696d46d2c90.png)
*Abbildung 4: KEDA Auto-Skalierstruktur*

## Impact and Results

### Beantwortet auf 700% Verkehrsspitzen durch Mischen von Wolkenelastizität

Am Samstagmorgen platzte der Zigeunerfilter plötzlich vor drei Stunden in Brand und der Fluss stieg auf einen Faktor von drei mal mehr als lokale Kapazität. Auto-Extrusion unterstützte zunächst den Strom, aber der Anstieg der GPU-Anforderung löste später eine Grenze; Teams mussten mit Sättigung vor der Hitze nach oben gezogen.

![Zigeunerfilterspitze](/redesign/assets/59d80da9e1d28faf91b2.png)
*Abbildung 5: Gipsfilterspitze*

### Verkehrseffizienz

- **MTTR-Verbesserung** : MTTR verkürzt **91%** (von ca. 2 Stunden bis ca. 10 Minuten)
- **Reduzierung von Spitzenfehlern** : GPU erhöhte Nachfrage während des Spitzenflusses aufgrund einer proaktiven Skalierung von zugehörigen Benutzerfehlern **85%**
- **Entfernen Sie manuelle Strecken** : Verschiebung von der manuellen GPU-Konfiguration zur Automatisierung, anzeigegesteuerte Dehnung, entsprechend den Einsparungen **10,8 Personenmonate** Betriebskosten

### Kostenoptimierung

- **Aktive Auto-Skalierung** Reduzierte durchschnittliche GPU-Nutzungszeit **55%**
- Die geschätzten Kosteneinsparungen werden mit der entsprechenden GPU-Konfiguration (A100 oder etwa $45/Stunde) verglichen. **17,4M USD**
- **GPU Sharing with HAMi** Die Notwendigkeit einer umfassenden Re-Engineering der Infrastruktur wurde beseitigt und die Komplexität der Migrations- und Engineeringkosten deutlich reduziert.
- **GPU reduzierte Nachfrage** : Ausbildung + Reduktion der GPU für Wasserleitungen **2 mal**

![Kosteneinsparungsdiagramm](/redesign/assets/0630dc598a3750992b2b.png)
*Abbildung 6: Kosteneinsparungsdiagramm*

## Schlussfolgerungen

Der Cloud-native Übergang von SNOW Corp. zeigt, wie Kubernets mit der breiteren CNCF-Ökologie kombiniert werden kann, wobei die grundlegenden Einschränkungen der GPU-Produktion und der Beobachtungsfähigkeit in extremen Maßstäben überwunden werden. Durch die Einführung des Hami GPU-Sharings und die Verwendung aktiver selbstdefinierter Indikatoren zur Verbesserung der KEDA, SNOW, von passiven manuellen Operationen bis hin zur vorausschauenden Automatisierung.

> Letztendlich bietet dieser Ansatz eine wiederverwendbare Reihe von großen GenAI-Lastbetriebsoptionen: intelligente Ressourcenauslastung, präzise automatische Emulation und Tiefe, um die Infrastruktur Herausforderungen in Wettbewerbsvorteile zu verwandeln.
>
> ## Referenzen und Kontakte {#case-section-11}
>
> - [a16z：The Top 100 [Gen AI] Consumer Apps](https://a16z.com/100-gen-ai-apps-5/)
> - [HAMi](https://project-hami.io/)
> - [KEDA](https://keda.sh/)
>
> Jeonghyun Kim, AI Engineer: jeonghyun@snowcorp.com Jae Do Chung, Senior Vice President of Engineering: Jaedo.chung@snowcorp.com
>

<div class="case-source-note">
<p>Original:<a href="https://www.cncf.io/case-studies/snow-corp/" target="_blank" rel="noopener">Scaling GenAI for 200M users: How SNOW Corp. orchestrates 1000+ GPUs to handle 700% viral traffic spikes ↗</a><br>Herausgeber: Cloud Native Computing Foundation (CNCF) · 2026-05-05</p><p>Diese lokalisierte Fassung übernimmt die technischen Informationen und den Messumfang des Originalartikels. Sie ist keine offizielle CNCF-Übersetzung. Architekturdiagramme behalten ihren Originaltext. Projektstatus und Produktangaben beziehen sich auf das ursprüngliche Veröffentlichungsdatum.</p><p>Das Original wird unter den  <a href="https://www.linuxfoundation.org/legal/terms" target="_blank" rel="noopener">Inhaltsbedingungen der Linux Foundation</a> und  <a href="https://creativecommons.org/licenses/by/3.0/" target="_blank" rel="noopener">CC BY 3.0</a> verwendet. Diese Fassung wurde übersetzt und neu gestaltet. Alle Marken gehören ihren jeweiligen Inhabern.</p>
</div>
