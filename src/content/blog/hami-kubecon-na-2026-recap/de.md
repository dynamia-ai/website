---
title: 'Technischer Fortschritt und Praxis: HAMi auf der KubeCon NA 2026'
date: '2026-11-17'
author: 'Dynamia'
excerpt: 'Auf der KubeCon + CloudNativeCon North America 2026 diskutierte die HAMi-Community mit Red Hat GPU-Sharing und Inferenzarchitektur, Scheduling-Policies und Kubernetes-DRA-Fortschritt und führte Entwickler im ContribFest durch GPU-Virtualisierung.'
category: 'Community & Events'
coverDisplay: 'text'
tags:
  - KubeCon
  - HAMi
  - Kubernetes DRA
  - GPU-Sharing
  - vLLM
---

Vom 9. bis 12. November 2026 fand die KubeCon + CloudNativeCon North America 2026 in Salt Lake City, USA, statt.

Während der Konferenz nahm die HAMi-Community an mehreren technischen Sessions und Hands-on-Aktivitäten teil und hielt gemeinsam mit Red-Hat-Ingenieuren Vorträge zu Kubernetes DRA, GPU-Sharing und KI-Inferenzarchitektur.

Zusätzlich erhielt Community Manager Jimmy Song auf dieser Konferenz den **2026 CNCF Lorem Ipsum Award**.

Von der Evolution der GPU-Scheduling-Policies und heterogener Hardware über Kubernetes-DRA-Integration bis hin zu Umgebungsaufbau und dem Verständnis von GPU-Virtualisierung zeigte die HAMi-Community auf dieser KubeCon technischen Fortschritt und traf Entwickler persönlich.

## Mit Red Hat: GPU-Sharing und Inferenzarchitektur in Produktion

**Vortragstitel:**

DRA + Kueue + HAMi + vLLM: A Production Architecture for Scheduler-Agnostic GPU Sharing

**Speaker:**

- Mengxuan Li (HAMi-Kernautor; Co-Founder und CTO, Dynamia)
- Yuchen Fama (Senior Principal Product Manager, Red Hat)

**Zeit:** 9. November, 15:20–15:45

**Ort:** Salt Palace · Level 2 · 251 D-F

Im Joint Talk mit Red Hat ging es um eine praktische Frage: **Wie können Unternehmen GPUs in Kubernetes flexibler zuweisen und dabei Auslastung und Inferenzperformance balancieren, wenn KI-Inferenzdienste komplexer werden?**

Der Vortrag umfasste DRA, Kueue, HAMi und vLLM/llm-d und beschrieb, wie GPU-Zuteilung, Workload-Scheduling und Inferenz-Routing zusammenwirken können.

### Von GPU-Slicing zu Ressourcen-Scheduling

In echten Inferenz-Clustern braucht nicht jeder Workload eine volle GPU.

Neben Large-Model-Inferenz verbrauchen Embedding-, Reranker-, Klassifikator- und Sprachmodelle kontinuierlich GPU-Ressourcen. Für diese Jobs ist bedarfsgesteuerte Speicher- und Compute-Zuteilung oft flexibler als eine ganze Karte.

Der Vortrag beschrieb die Zusammenarbeit von HAMi mit Kubernetes DRA: DRA beschreibt und alloziert Geräteressourcen, HAMi-Komponenten übernehmen GPU-Slicing und Isolation im Container.

Kueue kann Workload-Quotas und Admission Control liefern und hilft Teams, die Nutzung unterschiedlicher Jobs zu steuern.

![Architekturskizze HAMi DRA für Produktionsinferenz](/images/blog/hami-kubecon-na-2026-recap/image-01.png)

### Inferenz-Requests brauchen intelligenteres Routing

**GPU-Slicing allein löst keine Inferenz-Performance-Probleme.**

Bei Multi-Instanz-Serving verwaltet jede vLLM-Instanz typisch eigenen KV-Cache. Ignoriert Load Balancing den Cache-Zustand, landen Requests mit gleichem Präfix auf verschiedenen Instanzen — bestehender KV-Cache ist schwer wiederverwendbar, Cache-Footprint und Speicherdruck steigen.

Bei kleineren GPU-Slices schrumpft verfügbarer KV-Cache-Speicher, das Problem wird sichtbarer.

Der Vortrag stellte llm-ds EPP (Endpoint Picker) vor, der cache-bewusst Requests bevorzugt zu Instanzen mit passendem Präfix-Cache routet.

![Präfix-bewusstes vs. last-bewusstes Routing](/images/blog/hami-kubecon-na-2026-recap/image-02.png)

In einem MI355X-Experiment mit drei vLLM-Instanzen à 30 % HBM: Bei QPS 8 stieg die Präfix-Cache-Trefferquote mit EPP von 45,2 % auf 92,4 %, TTFT P90 sank von 251 ms auf 157 ms.

Das verbindet GPU-Sharing mit Inferenz-Routing: Slicing flexibilisiert GPU-Nutzung, cache-bewusstes Routing reduziert Cache-Duplikation und verbessert Antwortverhalten.

Der Joint Talk verband GPU-Ressourcenmanagement mit realem Inferenzbetrieb und zeigte eine konkrete Richtung für HAMi mit Kubernetes, Kueue, vLLM, llm-d und dem Ökosystem.

## Maintainer Track: HAMi-Fähigkeiten und technische Evolution

**Vortragstitel:**

**HAMi Levels up: Smarter Scheduling, Wider Hardware Reach and a DRA-Native Lightweight Future**

**Speaker:**

Mengxuan Li (HAMi-Kernautor; Co-Founder und CTO, Dynamia)

**Zeit:** 10. November, 14:50–15:20

**Ort:** Salt Palace · Level 2 · 251 D-F

Als erster Maintainer-Track-Talk nach CNCF Incubating fokussierte diese Session Scheduling-Policies, heterogene Hardware und Kubernetes DRA.

Enterprise-KI-Workloads sind vielfältiger; GPU-Management ist nicht mehr nur Gerätezuweisung. Jobs brauchen unterschiedlich Speicher, Compute, Topologie und Policies. Auslastung, Job-Performance und Cluster-Effizienz zu balancieren, ist zentral für KI-Infrastruktur.

Dagegen beschrieb der Vortrag mehrere technische Richtungen von HAMi.

### Flexiblere Scheduling-Policies

HAMi verbessert weiter komponierbare Policies, z. B. Mutex, Spread und NUMA.

- Mutex: Exklusive Nutzung geslicer Ressourcen durch ein Pod.
- Spread: Jobs über Geräte verteilen, Contention reduzieren.
- NUMA: Ressourcen mit CPU-NUMA und GPU-Topologie platzieren, Cross-NUMA-Verluste mindern.

![Komponierbare Mutex-, Spread- und NUMA-Policies](/images/blog/hami-kubecon-na-2026-recap/image-03.png)

### Flexible-MIG

Klassisches MIG erfordert oft feste Profile — in der Praxis passen sie nicht immer.

Flexible-MIG sucht aus dem Pod-Request ein passendes Partition-Template und schließt die Zuteilung mit dem Scheduling-Ergebnis ab.

Braucht ein Job 18 GB Speicher, kann das System Templates durchsuchen statt Nutzer feste Profile vorgeben zu lassen.

![Flexible-MIG nach Speicher-Request](/images/blog/hami-kubecon-na-2026-recap/image-04.png)

### Remote-GPU

Remote-GPU ermöglicht Apps auf CPU-Knoten ohne lokale GPUs, GPUs anderer Knoten über das Netz zu nutzen — eine Option zur Entkopplung von Compute und Deployment-Ort.

### AMD

HAMi v2.10 unterstützt AMD vollständig: Partitionierung, Compute-Isolation, AMD-DRA und Nutzungsmonitoring.

Nutzer können unterschiedliche Beschleuniger mit relativ einheitlichem Request- und Scheduling-Modell verwalten.

![AMD-GPU-Unterstützung in HAMi v2.10](/images/blog/hami-kubecon-na-2026-recap/image-05.png)

### HAMi-DRA

Kubernetes DRA bietet natives Device-Ressourcenmanagement.

HAMi-DRA: Ein DRA Driver integriert sich in den nativen Allokationsfluss; der Kubernetes-Scheduler beteiligt sich an der Gerätezuweisung, HAMi behält Slicing und Container-Isolation.

HAMi-DRA ist kein separater Standard, sondern Implementierung auf Basis von Kubernetes DRA.

![HAMi DRA und native Kubernetes-Allokation](/images/blog/hami-kubecon-na-2026-recap/image-06.png)

## ContribFest: GPU-Virtualisierung von Grund auf

**Titel:**

**GPU Virtualization: First Setup and Understanding the Device Plugin / DRA**

**Speaker:**

Reza Jelveh (HAMi Community Contributor), Mengxuan Li (HAMi-Kernautor), Han Shen (HAMi-WebUI Reviewer) — alle von Dynamia

**Zeit:** 10. November, 16:40–18:00

**Ort:** Salt Palace · Level 2 · 255 D

In 80 Minuten führte das Team von Lab-Setup über HAMi-Kernkomponenten bis zu Kubernetes Device Management.

Das Lab lief auf Laptops mit simulierten GPUs — keine physische GPU nötig.

### Lab-Setup

Teilnehmer deployten einen kind-basierten Cluster und installierten HAMi.

`mock-device-plugin` simulierte GPU-Ressourcen, `hami-mock-monitor` Metriken — Scheduling und Nutzung auch ohne echte GPUs beobachtbar.

### GPU-Sharing und Ressourcenallokation

Pods mit unterschiedlichen Requests zeigten, wie HAMi GPUs zuweist.

Drei Pods à 15 GB und 30 % Compute teilten zwei simulierte A100s; ein Pod forderte 45 GB — trotz ausreichender Gesamtkapazität kein Scheduling, weil keine einzelne GPU genug hatte.

**Aggregate Kapazität ≠ ein Gerät kann den Job bedienen.** Scheduling muss pro-Gerät-Kapazität und Belegung berücksichtigen.

![Pod-Scheduling-Experiment auf simulierten GPUs](/images/blog/hami-kubecon-na-2026-recap/image-07.png)

Vergleich von Binpack und Spread zeigte Platzierungsunterschiede.

### Wie HAMi-Komponenten zusammenwirken

1. **Admission Webhook:** Passt Scheduling-Konfiguration für HAMi Scheduler an.
2. **HAMi Scheduler:** Prüft verbleibenden GPU-Speicher/Compute und wählt Gerät.
3. **Ressourcenallokation:** Scheduler schreibt GPU-Info in Pod-Konfiguration.
4. **Device Plugin und HAMi-Core:** Plugin injiziert beim Allocate; HAMi-Core erzwingt Limits zur Laufzeit.

### Von Device Plugin zu DRA

ResourceSlice, DeviceClass, ResourceClaim, ResourceClaimTemplate — wie DRA Geräte beschreibt, Bedarf deklariert und alloziert.

HAMi-DRA Webhook konvertiert HAMi-GPU-Requests in ResourceClaims; nativer Scheduler alloziert; HAMi-Core isoliert im Container.

![Vier Kernobjekte in Kubernetes DRA](/images/blog/hami-kubecon-na-2026-recap/image-08.png)

### Vom Lernen zum Beitrag

- HAMi: Scheduling, Device Management, Tests.
- HAMi-DRA: Webhook-Konvertierung zu ResourceClaims.
- Mock Device Plugin: simulierte Allokation verbessern.
- HAMi-WebUI: Monitoring und Visualisierung.

Good First Issues, Draft PRs — vom Installieren über Mechanismen bis zum ersten Beitrag.

![Beitragseinstiege beim ContribFest](/images/blog/hami-kubecon-na-2026-recap/image-09.png)

## HAMi-Stand: Entwickler persönlich treffen

Im CNCF Project Pavilion sprach die Community mit Entwicklern, Nutzern und Partnern über GPU-Sharing, heterogenes Scheduling und Kubernetes-Ressourcenmanagement.

![Gespräche am HAMi-Stand](/images/blog/hami-kubecon-na-2026-recap/image-10.jpg)

![Gruppenfoto am HAMi-Stand](/images/blog/hami-kubecon-na-2026-recap/image-11.jpg)

## Community-Anerkennung

Jimmy Song erhielt den **2026 CNCF Lorem Ipsum Award**.

Von Cloud-Native-Wissen über KI-Infrastruktur bis Community-Aufbau — Anerkennung für kontinuierliches Engagement. Herzlichen Glückwunsch an Jimmy und Dank an alle Maintainer, Contributors und Partner.

## Weiter erkunden: flexibleres Management heterogener Compute-Ressourcen

HAMi zeigte GPU-Sharing und Virtualisierung sowie Arbeit an Scheduling, heterogener Hardware und nativem Device Management.

Binpack, Spread und Topologie-Policies passen GPUs an Workloads an; HAMi-DRA erkundet Integration mit nativem Kubernetes-Ressourcenmanagement.

Wir freuen uns auf das nächste Community-Event — und laden ein, der HAMi-Community beizutreten!