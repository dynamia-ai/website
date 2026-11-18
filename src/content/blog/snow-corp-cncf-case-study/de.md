---
title: 'GenAI für 200 Mio. Nutzer skalieren: SNOW Corp. orchestriert über 1.000 GPUs mit HAMi und KEDA'
date: '2026-05-08'
excerpt: >-
  Eine CNCF-Fallstudie dazu, wie SNOW Corp., eine Tochter von NAVER, mit HAMi
  GPU-Sharing und KEDA proaktiver Autoskalierung 700-prozentige virale
  Traffic-Spitzen bewältigt — mit 91 % weniger MTTR, 85 % weniger Surge-Fehlern
  und geschätzten Einsparungen von 17,4 Mio. USD.
author: Dynamia AI Team
tags:
  - HAMi
  - CNCF
  - GPU-Sharing
  - vGPU
  - Kubernetes
  - KEDA
  - SNOW Corp
  - NAVER
  - Fallstudie
  - GenAI
category: Customer Success Story
coverImage: /images/blog/snow-corp-cncf-case-study/snowcorp.jpg
linktitle: SNOW Corp. HAMi Fallstudie
---

SNOW Corp., eine Tochter des südkoreanischen NAVER, betreibt eine Flotte von über 1.000 A100-GPUs für GenAI-Funktionen für mehr als 200 Millionen Nutzer weltweit in drei Top-Apps (SNOW, EPIK, B612). Die Infrastruktur bedient über 1.200 KI-Workflows und mehr als 400 Modelle. Die Organisation erlebte **700-prozentige virale Traffic-Spitzen** — das Muster war unvorhersehbar und hoch volatil.

![SNOW Corp. Überblick](/images/blog/snow-corp-cncf-case-study/snowcorp.webp)

## Herausforderung

Das Kernproblem: Der native GPU-Scheduler von Kubernetes behandelt GPUs als unteilbare Ressourcen. Ein Pod bekommt entweder eine volle GPU oder keine. Dieses Modell bricht unter zwei Bedingungen zusammen:

1. **Heterogene Workload-Anforderungen:** Trainings-Pipelines, Inferenzdienste und Batch-Verarbeitung haben stark unterschiedliche GPU-Auslastungsprofile. Ein Training-Job kann 80 % der Rechenleistung, aber nur 20 % des Speichers nutzen — ein Inferenzdienst oft umgekehrt.
2. **Unvorhersehbarer Traffic:** Durch extreme Volatilität durch virale KI-Trends und heterogene Inferenz-Workflows musste das System elastisch skalieren. Ohne Sicht auf die tatsächliche GPU-Auslastung basierten Skalierungsentscheidungen auf manueller Arbeit oder groben CPU-/Speicher-Metriken, die GPU-Sättigung nicht widerspiegeln.

Vor der Kubernetes-Einführung lief SNOW Docker-basierte Infrastruktur mit manueller GPU-Zuweisung:

- **Scheduling-Blindheit:** 2–3 Container im selben Pod konkurrierten ohne Koordination um GPU-Ressourcen
- **Manuelle Skalierung:** Menschen provisionierten GPUs nach Lastprognosen, nicht nach tatsächlicher Nachfrage
- **Kein GPU-Sharing:** Mehrere Container konnten eine GPU nicht effizient teilen
- **Kostenexplosion:** Für Spitzenlast musste etwa **2-fach** überprovisioniert werden (eine GPU für Training, eine für Inferenz, obwohl theoretisch eine reichen könnte)

![Architekturüberblick](/images/blog/snow-corp-cncf-case-study/architecture-overview.png)

## Lösung

### Cloud Native Computing Foundation (CNCF)

SNOW migrierte auf eine Multi-Region-On-Premises-Kubernetes-Plattform mit entkoppelter External-ETCD-Topologie für hohe Verfügbarkeit. Das CNCF-Ökosystem trägt den gesamten Stack: Cilium als CNI, Helm für GitOps-Deployments, Traefik als Ingress, Prometheus/Loki/Grafana für Observability, **HAMi für GPU-Sharing** und **KEDA für Autoskalierung**.

### GPU-Sharing mit HAMi

Der Standard-Scheduler erzwingt strikte GPU-Isolation und blockierte die Migration sequenzieller Train-to-Inference-Pipelines — Trainer und Inferenz-Engine müssen eine GPU teilen. HAMi virtualisiert GPU-Ressourcen (vGPU), sodass mehrere Container im selben Pod eine GPU gleichzeitig nutzen. Die Integration in kube-scheduler erfolgt ohne Änderungen am Anwendungscode und ist mit dem Autoscaling-Ökosystem kompatibel.

![Train-to-Inference-Ablauf](/images/blog/snow-corp-cncf-case-study/train-to-inference-flow.png)

### Proaktive GPU-Orchestrierung mit KEDA

Standardmetriken (CPU/RAM, DCGM-Auslastung) erwiesen sich für heterogene Workloads als unzuverlässig; KEDAs RabbitMQ-Scaler wirkte als nachlaufender Indikator — bei ~60 Sekunden Modell-Warm-up war Skalierung nach Queue-Rückstau zu spät.

SNOW entwickelte einen leichten Custom Metric Server (Python/FastAPI), der KEDAs Metrics API Scaler eine Consumer-Saturation-Metrik bereitstellt:

`active_ratio = unacked_messages / active_consumers`

Überschreitet `active_ratio` einen Schwellenwert (z. B. 0,7), provisioniert KEDA neue GPU-Pods, bevor der Worker-Pool sättigt, und absorbiert das Warm-up-Fenster proaktiv. Beim Scale-in verhindern längere `stabilizationWindowSeconds` und `cooldownPeriod` vorzeitige Freigabe in Traffic-Flauten.

![KEDA-Autoskalierungs-Architektur](/images/blog/snow-corp-cncf-case-study/keda-autoscaling-arch.png)

## Wirkung und Ergebnisse

### 700-prozentige Traffic-Spitzen durch Hybrid-Cloud-Bursting

Als der virale „Ghibli Filter“-Trend am Samstagmorgen mit wenig Personal den Traffic innerhalb von drei Stunden verdreifachte, reichte On-Premises-Kapazität allein nicht. Autoskalierung hielt zunächst, dann folgte Drosselung durch GPU-Surge — es brauchte strategische Ausweitung auf CSP-Regionen über eine einheitliche GitOps-Pipeline mit identischen Helm-Charts. CSP-Worker konsumierten direkt aus der zentralen RabbitMQ-Queue, Multi-Cluster-Skalierung ohne Serviceunterbrechung. SNOW vervielfachte den Traffic auf das 7-fache Spitzenniveau und sicherte die Geschäftschance durch eine autonome Pipeline.

![Ghibli-Filter-Traffic-Spitze](/images/blog/snow-corp-cncf-case-study/ghibli-filter-traffic.png)

### Betriebseffizienz

- **MTTR:** Reduktion um **91 %** (von ~2 Std. auf ~10 Min.)
- **Surge-Fehler:** GPU-Surge-bedingte Nutzerfehler in Spitzen um **85 %** gesenkt durch proaktive Skalierung
- **Manuelle Skalierung eliminiert:** Von menschlicher GPU-Provisionierung zu automatisierter, metrikgestützter Skalierung — operatives Äquivalent von **10,8 Personenmonaten** Einsparung

### Kostenoptimierung

- **Proaktive Autoskalierung** reduzierte die durchschnittliche GPU-Nutzungszeit um **55 %**
- **17,4 Mio. USD** geschätzte Einsparung gegenüber gleichwertiger On-Demand-Cloud-GPU (ca. 45 USD/h pro A100)
- **GPU-Sharing via HAMi** vermied vollständige Re-Architektur und senkte Migrationskomplexität
- **GPU-Bedarf:** **2× weniger GPUs** für Trainings- plus Inferenz-Pipelines

![Kosteneinsparungs-Diagramm](/images/blog/snow-corp-cncf-case-study/cost-savings-chart.png)

## Fazit

Die Cloud-Native-Transformation von SNOW Corp. zeigt, wie Kubernetes mit dem CNCF-Ökosystem fundamentale Grenzen bei GPU-Scheduling und Observability im Extremmaßstab überwinden kann. Mit HAMi für GPU-Sharing und KEDA mit proaktiven Custom-Metriken wechselte SNOW von reaktiven, manuellen Abläufen zu vorausschauender automatisierter Orchestrierung. Die Architektur absorbierte 700-prozentige Spitzen und skalierte hybrid ohne Unterbrechung — bei deutlichen Gewinnen in Kosten, Zuverlässigkeit und operativer Geschwindigkeit.

> Dieser Artikel basiert auf der [CNCF-Fallstudie zu SNOW Corp.](https://www.cncf.io/case-studies/snow-corp/), veröffentlicht von der Cloud Native Computing Foundation.

## Referenzen

- [a16z, „The Top 100 [Gen AI] Consumer Apps“](https://a16z.com/100-gen-ai-apps-5/)
- [HAMi](https://project-hami.io/)
- [KEDA](https://keda.sh/)