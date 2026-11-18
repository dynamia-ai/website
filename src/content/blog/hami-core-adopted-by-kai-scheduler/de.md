---
title: >-
  Dynamia führt HAMi-core-Integration in KAI Scheduler an und schließt die Lücke bei harter Isolation für produktionsreifes GPU-Sharing
linktitle: HAMi-core im KAI Scheduler
date: '2026-06-17'
excerpt: >-
  KAI Scheduler stammt aus der Kern-Scheduling-Engine von Run:ai, wurde von NVIDIA open-source gestellt und ist in der CNCF Sandbox. Unter Leitung von Dynamia ist die HAMi-core-Integration in die KAI-Scheduler-Hauptlinie gelandet und ergänzt GPU-Sharing um harte Runtime-Speicherisolation.
author: Dynamia AI
tags:
  - HAMi
  - KAI Scheduler
  - GPU Sharing
  - GPU Virtualization
  - KI-Infrastruktur
  - Cloud Native
category: Integration & Ecosystem
coverImage: /images/blog/hami-core-adopted-by-kai-scheduler/timeline-en.png
---

> **Redaktioneller Hinweis:**
>
> KAI Scheduler stammt aus der Kern-Scheduling-Engine von Run:ai, wurde von NVIDIA open-source gestellt und ist in der CNCF Sandbox. Unter Leitung von **Dynamia** ist die HAMi-core-Integration in die KAI-Scheduler-Hauptlinie gelandet und ergänzt GPU-Sharing um harte Runtime-Speicherisolation.

Im vergangenen Jahr verschiebt sich der Druck auf unternehmerische KI-Infrastruktur von „Großmodelle trainieren“ zu „KI-Anwendungen dauerhaft betreiben“. Wenn Agents, Wissensbasis-Q&A, multimodale Anwendungen und Inferenzdienste in Produktionssysteme gehen, ist die GPU-Frage nicht mehr nur „haben wir genug?“, sondern „können wir sicher teilen?“ GPU-Sharing steigert die Auslastung – aber wenn der Scheduler ein Speicherkontingent zuweist, der Container-Runtime aber weiter den vollen GPU-Speicher sieht, bleibt Sharing eine „kooperative Beschränkung“ statt produktionsreifer Isolation.

Genau dieses Produktionsproblem adressiert HAMi-core durch Integration in KAI Scheduler und harte Runtime-Speicherisolation. Das ist weit mehr als eine einmalige technische Anpassung – Ergebnis langfristiger Zusammenarbeit zwischen Dynamia, der HAMi-Open-Source-Community und der KAI-Scheduler-Community. Bereits auf der KubeCon + CloudNativeCon Europe 2025 im April 2025 führten **Xiao Zhang (Gründer & CEO von Dynamia)** und **Mengxuan Li (Co-Founder & CTO von Dynamia)** das von ihnen maßgeblich initiierte HAMi-Projekt in Austausch mit der Run:ai-/KAI-Scheduler-Community zu AI-Workload-Scheduling, GPU-Sharing und Ressourcenisolation. Dieser Faden mündete in KAI Scheduler Community PR #60 „Resource isolation design“ mit laufender Arbeit an Isolationsarchitektur, Komponentengrenzen, Deployment-Modellen, API-Design, Nutzerdokumentation und End-to-End-Validierung.

![Xiao Zhang, Gründer & CEO von Dynamia (links), und Ronen Dar, CTO von Run:ai (rechts), KubeCon Europe 2025](/images/blog/hami-core-adopted-by-kai-scheduler/kubecon-eu-2025-zhangxiao-ronen-dar.png)

![Run:ai Senior Software Engineer (links), Mengxuan Li, Co-Founder & CTO von Dynamia (Mitte), und Xiao Zhang (rechts), KubeCon Europe 2026](/images/blog/hami-core-adopted-by-kai-scheduler/kubecon-eu-2026-team.png)

![KAI Scheduler PR auf GitHub](/images/blog/hami-core-adopted-by-kai-scheduler/kai-scheduler-pr.png)

Von der Run:ai-Übernahme über Open Sourcing und CNCF-Eintritt von KAI Scheduler bis zur Landung von HAMi-core in der Hauptlinie erklärt diese Timeline, warum die Zusammenarbeit keine isolierte Anpassung ist. Der Wert liegt nicht nur in der Adoption von HAMi-core durch KAI Scheduler, sondern darin, „Ressourcenisolation“ in den Produktionspfad zu bringen: Wie stellen wir nach dem Scheduling sicher, dass jeder Workload im Container-Runtime wirklich Speichergrenzen einhält?

![Zeitleiste](/images/blog/hami-core-adopted-by-kai-scheduler/timeline-en.png)

## Schließen der zentralen Lücke bei produktionsreifem GPU-Sharing: harte Speicherisolation

KAI Scheduler ist ein CNCF-Sandbox-Projekt und Kubernetes-nativer AI-Workload-Scheduler für Training, Inferenz und Multi-Team-Sharing in großen KI-Clustern – mit Gang Scheduling, hierarchischen Queues, Fair Scheduling, Fractional GPU Sharing, Topologie-Bewusstsein und elastischen Workloads.

Kurz: KAI Scheduler beantwortet, wie eine Enterprise-AI-Plattform unter begrenzten GPU-Ressourcen fairer, stabiler und mit weniger Verschwendung schedulen kann.

In GPU-Sharing-Szenarien löst Scheduling „wo läuft eine Aufgabe und wie viel Ressource bekommt sie“. Fractional GPU von KAI Scheduler erlaubt mehreren Workloads, dieselbe GPU proportional oder nach Speichergröße zu teilen – ohne Runtime-Isolation können Aufgaben beim Lauf Grenzen überschreiten.

Der Scheduler kann die Bücher führen, stoppt Übernutzung in der Container-Runtime aber nicht immer. In Tests ist der Unterschied vernachlässigbar; in Multi-Team-, Multi-Tenant-Produktion wird es ein Stabilitäts- und Verantwortungsproblem.

Typische Risiken:

- Workloads überziehen Speicher, lösen OOM aus oder beeinträchtigen andere Aufgaben auf derselben Karte.
- Mandanten haben keine echten Ressourcengrenzen – schwer, stabile Service-Zusagen zu geben.
- GPU-Sharing verbessert Auslastung, erschwert aber Fehlerlokalisierung und Accountability.

Hier setzt HAMi-core an. Über eine CUDA-Interception-Bibliothek erzwingt es GPU-Speicher- und Compute-Isolierung auf Container-Ebene. Integriert übernimmt KAI Scheduler AI-Scheduling, HAMi-core die Speichergrenzen zur Laufzeit. Strikt genommen ist das Integrationsziel HAMi-core, nicht die volle HAMi-Plattform. KAI Scheduler behält eigenes Scheduling und holt HAMi-core für GPU Memory Isolation. Beide bilden eine saubere, lose gekoppelte, nachhaltig evolvierende Zusammenarbeit.

![KAI für Scheduling-Reihenfolge, HAMi-core für Ressourcengrenzen, Dynamia für Enterprise-Adoption](/images/blog/hami-core-adopted-by-kai-scheduler/kai-hami-core-dynamia-en.png)

![Vom Scheduling zur Isolation: GPU-Sharing als geschlossener Produktionskreislauf](/images/blog/hami-core-adopted-by-kai-scheduler/gpu-sharing-production-loop-en.png)

Diese Arbeitsteilung ist für Enterprise-Kunden besonders wichtig. KAI Scheduler muss sein Scheduling nicht aufgeben; HAMi-core ersetzt den Scheduler nicht. Jedes fokussiert seine Stärke – höhere Auslastung und klarere Isolationsgrenzen beim GPU-Sharing.

Das verschiebt GPU-Sharing von „Ressourcenzuteilung in der Scheduling-Schicht“ zu „harter Isolation in der Runtime-Schicht“. Für eine Enterprise-AI-Plattform wird GPU-Sharing zu einer zuverlässig start- und dauerbetreibbaren Fähigkeit.

Für die KAI-Scheduler-Community füllt HAMi-core eine zentrale Lücke bei Ressourcenisolation im GPU-Sharing. Für das HAMi-Ökosystem bringt der Einzug in die Hauptlinie harte GPU-Speicherisolation in einen mainstreamigeren cloud-nativen AI-Scheduling-Pfad mit Validierung in komplexeren Multi-Tenant-Szenarien.

## Wert für den Enterprise-Markt: Risiko senken beim GPU-Sharing in Produktion

Wenn Training, Inferenz, Fine-Tuning und Agent-Anwendungen in Produktion gehen, werden GPU-Cluster zu geteilter Infrastruktur für mehrere Teams, Mandanten und Aufgabentypen. Plattformteams fragen nicht nur „wie viele GPUs sind frei“, sondern „können diese GPUs stabil, fair und accountable geteilt werden“.

GPU-Sharing ist wichtig für Auslastung – ob Unternehmen es in Produktion skalieren wagen, hängt davon ab, ob die Plattform drei Fragen beantworten kann.

Erstens: Kann die Plattform den realen Speicherverbrauch einer Aufgabe deckeln, nicht nur den angeforderten Wert buchen?

Zweitens: Wenn ein Mandant oder eine Aufgabe die Grenze überschreitet, beeinträchtigt das andere Aufgaben auf derselben Karte?

Drittens: Kann das Plattformteam erklärbare und accountable Service-Zusagen aus diesen Grenzen ableiten?

Diese Integration beantwortet die drei Fragen direkt. KAI Scheduler: „wie werden Aufgaben fair auf die richtigen GPUs gelegt“; HAMi-core: „halten Aufgaben im Lauf wirklich ihre Speichergrenzen“. Zusammen ist GPU-Sharing nicht nur Kosteneinsparung, sondern eine langfristig betreibbare Plattformfähigkeit.

Für Dynamia wird die Positionierung klarer: HAMi liefert die Open-Source-Basis für GPU-Virtualisierung und heterogene Compute-Governance; das Unternehmen bringt diese Fähigkeiten durch Enterprise-Deployment, Kompatibilitätsanpassung, Observability, operativen Support und kommerzielle Lieferung in reale KI-Infrastrukturszenarien.

## Bedeutung für das HAMi-Ökosystem und Dynamia

Aus Sicht des HAMi-Ökosystems ist die Adoption von HAMi-core durch KAI Scheduler eine klare Validierung der technischen Richtung. CUDA-Interception und harte GPU-Speicherisolation werden in den kritischen Pfad produktionsreifen GPU-Sharings integriert.

Zwei Punkte zusammengefasst:

### Erstens: Validierung des Produktionswerts von HAMis technischem Weg

GPU-Speicherisolation ist Low-Level, beeinflusst aber direkt, ob Unternehmen GPU-Sharing sicher aktivieren können. Dass die KAI-Scheduler-Community HAMi-core für die Isolationslücke einbindet, zeigt Produktionswert von HAMi-cores Ansatz.

### Zweitens: Stärkung von Dynamias kommerzieller Glaubwürdigkeit im Enterprise-Markt

HAMi ist die Open-Source-Technikbasis; Dynamia verantwortet Enterprise-Produktisierung, Produktions-Rollout, Ökosystem-Adaption und kommerzielle Services. Die Zusammenarbeit verbindet HAMis Open-Source-Einfluss mit Dynamias Enterprise-Lieferwert und gibt Kunden eine klarere Referenz bei der Bewertung von GPU-Sharing-Lösungen.

## Fazit: Nächster Schritt für GPU-Sharing – von „zuweisbar“ zu „steuerbar“

Mit KI-Workloads in Produktion ist die Kernfrage beim GPU-Sharing nicht mehr nur „kann zugewiesen werden“, sondern „wird die Grenze nach der Zuteilung gehalten“. HAMi-core in KAI Scheduler bringt Scheduling, Sharing und Runtime-Isolation in denselben Produktionspfad – und sendet ein klares Branchensignal: Wettbewerb bei KI-Infrastruktur bewegt sich von punktueller Effizienz zu systemischer Governance über Multi-Tenant, Multi-Workload und heterogenes Computing.

> Dieser Artikel fokussiert Branchenkontext, Enterprise-Wert und strategische Bedeutung der Ökosystem-Zusammenarbeit. Für Implementierung, Installation, Konfiguration und Nutzung siehe die technische Version in der HAMi-Community-Dokumentation: <https://project-hami.io/blog/hami-core-adopted-by-nvidia-kai-scheduler>