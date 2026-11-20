---
title: "DRA allein reicht nicht: Warum HAMi v2.9 eine Ökosystem-Allianz aufbaut"
date: '2026-04-29'
excerpt: >-
  HAMi-Maintainer Li Mengxuan stellte beim Shenzhen Meetup erstmals v2.9-Kernfeatures vor,
  vertiefte die DRA-Roadmap und die Community-Vision für einheitliches heterogenes
  Compute-Management.
author: Dynamia
tags:
  - HAMi
  - Meetup
  - DRA
  - GPU-Virtualisierung
  - Heterogene Computing
  - v2.9
category: Community & Events
coverImage: /images/blog/hami-v29-dra-ecosystem-limengxuan/speaker-portrait.jpg
linktitle: "HAMi DRA-Ökosystem und v2.9-Vorschau"
---

„Maximize Efficiency, Not Compute“ – das HAMi Community Meetup Shenzhen wurde von der HAMi-Community veranstaltet und von Dynamia AI organisiert; am 25. April 2026 erfolgreich abgeschlossen. Dies ist der zweite Artikel der Shenzhen-Recap-Serie. HAMi-Maintainer Li Mengxuan stellte erstmals v2.9-Kernfeatures vor, analysierte die DRA-Roadmap und teilte die Vision für einheitliches heterogenes Compute-Management.

**Speaker:** Li Mengxuan (Mitgründer & CTO Dynamia AI / HAMi Maintainer)

![Li Mengxuan beim Vortrag](/images/blog/hami-v29-dra-ecosystem-limengxuan/speaker-portrait.jpg)

## Highlights

- GPU-Sharing steigert Cluster-Auslastung von 20 % auf 70 % – mehr als verdoppelte verfügbare Ressourcen
- v2.9 führt kai-resource-isolator ein: von „kann teilen“ zu „sicher teilen“
- Ascend 910C: Nutzerraum-Soft-Partitionierung, MIG-ähnliche Virtualisierung ohne Hardware-Isolation
- Drei große DRA-Herausforderungen – HAMi antwortet mit „Lightweight HAMi“
- Speicher-Expand/Contract voraussichtlich in 2.10 im Mainline

## Video & Folien

- **Bilibili:** [HAMi DRA-Ökosystem-Allianz und v2.9-Vorschau - Li Mengxuan](https://www.bilibili.com/video/BV1Gho6BCESu/)
- **Folien:** [hami-v2.9-dra-ecosystem-limengxuan.pdf](https://github.com/Project-HAMi/community/blob/main/hami-meetup/03-shenzhen-20260425/hami-v2.9-dra-ecosystem-limengxuan.pdf)

## 1. HAMis Kernmission: Jede Recheneinheit zählen lassen

Als HAMi-Maintainer kennt Li Mengxuan GPU-Verschwendung aus erster Hand. Er startete mit der Frage: Wie werden GPUs in Kubernetes zugewiesen? Die Antwort ist schonungslos – eine ganze GPU-Karte pro Pod, ungenutzter Rest nicht teilbar. Dieses exklusive Modell, verglichen mit einem „gemeinsamen Topf“, tut besonders weh, wenn KI-Compute knapp ist.

![Heterogene Compute-Ressourcen werden mainstream](/images/blog/hami-v29-dra-ecosystem-limengxuan/heterogeneous-compute-mainstream-en.png)

Als CNCF-Sandbox-Projekt macht HAMi im Kern eines: GPUs von „exklusiv“ zu „geteilt“. Konkret:

- **Multi-Task-Multiplexing:** Virtualisierung lässt eine physische Karte mehrere Tasks parallel bedienen
- **Auslastungssprung:** Durchschnitt von 20 % auf **70 %**, verfügbare Ressourcen mehr als verdreifacht
- **Heterogene Vereinheitlichung:** NVIDIA, Ascend, Cambricon u. a. – oben einheitliches Scheduling und Monitoring
- **Topologie-Bewusstsein:** Physische Topologie zwischen Karten erkennen und Multi-GPU-Kommunikation optimieren

Diese vier Fähigkeiten sind HAMis Antwort auf heterogenes Compute-Management.

## 2. v2.9-Kernfeatures

HAMi 2.9 bringt deutliche Verbesserungen bei Ökosystem-Kompatibilität und inländischen Chips.

### 1. KAI-Scheduler-Ressourcenisolation

„Kann teilen“ und „sicher teilen“ sind verschieden. Ohne Isolation bei gemeinsamer Karte entsteht Konkurrenz. v2.9 führt `kai-resource-isolator` für KAI-Scheduler-Szenarien ein – ein kritischer Schritt in Richtung Multi-Tenant.

![KAI-Scheduler-Isolationslösung](/images/blog/hami-v29-dra-ecosystem-limengxuan/kai-scheduler-isolation-en.png)

### 2. Volcano vGPU-Upgrade

Device Plugin auf 0.19, CDI-Modus, Kompatibilität mit neuesten NVIDIA-Treibern und -Geräten. Für Volcano-vGPU in Produktion: mehr Stabilität und Kompatibilität.

![Volcano vGPU Device Plugin Upgrade](/images/blog/hami-v29-dra-ecosystem-limengxuan/volcano-vgpu-upgrade-en.png)

### 3. Ascend 910C Nutzerraum-Partitionierung

Wichtigster Fortschritt für inländische Chips in v2.9. Ascend 910C ohne MIG-ähnliche Hardware-Isolation – HAMi nutzt Umgebungsvariablen für Compute- und Speicherlimits, rein softwarebasierte Virtualisierung.

![Ascend 910C Nutzerraum-Partitionierung](/images/blog/hami-v29-dra-ecosystem-limengxuan/ascend-910c-partitioning-en.png)

## 3. DRA: nächste Grenze im heterogenen Compute-Management

DRA (Dynamic Resource Allocation) ist die Kubernetes-Nächstgeneration für Ressourcenmanagement. Li Mengxuan analysierte offen drei Hauptprobleme:

- **API-Stabilität:** Schnelle Iteration, hohe Treiberentwicklungskosten und Unsicherheit für Chiphersteller
- **Fehlende Ops:** Kein Cluster-Monitoring, keine Scheduling-Event-Observability für Produktion
- **Begrenzte Topologie-Ausdruckskraft:** Komplexe physische Topologien schwer modellierbar, Scheduling-Optimierung eingeschränkt

![DRA-API ändert sich häufig](/images/blog/hami-v29-dra-ecosystem-limengxuan/dra-api-challenges.png)

### HAMis DRA-Lösung: Lightweight HAMi

- **Nach oben:** DRA-Komplexität und -Instabilität für Nutzer abschirmen, einfache Schnittstelle
- **Nach unten:** Einheitlicher Ressourceneinstieg zu heterogenen Treibern
- **Lücken füllen:** Monitoring und Scheduling-Events, die natives DRA noch nicht bietet

![HAMi DRA-Lösung: Lightweight DRA](/images/blog/hami-v29-dra-ecosystem-limengxuan/hami-dra-lightweight-en.png)

Zudem Partnerschaften mit NVIDIA, Enflame, Huawei Ascend u. a. zur Validierung der DRA-Treiber-Kompatibilität.

## 4. Ausgewähltes Q&A

![Publikums-Q&A](/images/blog/hami-v29-dra-ecosystem-limengxuan/qa-session.jpg)

### Q1: Unterstützt HAMi dynamisches Scaling?

> Speicher-Scaling ist in Entwicklung, erwartet in **2.10**. Hot-Plug von GPU-Karten hängt vom Container-Runtime ab und ist auf Kubernetes-Ebene nicht direkt machbar.

### Q2: Zusammenarbeit mit Volcano?

> Voll kompatibel. HAMi DRA als leichtes Middleware – **Volcano für Queues und Batch, HAMi für GPU-Partitionierung und Multiplexing**.

### Q3: Wenn der Engpass Datenübertragung ist – wozu Virtualisierung?

> In Training stimmt die Prämisse. Inferenz ist anders: viele Dienste mit Spitzen und Tälern, Leerlauf bei keiner Last. Virtualisierung erlaubt gestaffeltes Teilen auf einer Karte – klassischer Trade-off zwischen Peak-Performance und Auslastung.

## 5. Fazit

Li Mengxuan skizzierte HAMis Entwicklung: GPU-Sharing, v2.9-Fortschritte bei Isolation und inländischen Chips, Roadmap Richtung Kubernetes DRA.

Wichtige Punkte:

- **GPU-Sharing ist Notwendigkeit** – 20 % zu 70 % in Produktion validiert
- **Sicheres Multi-Tenant-Sharing** als nächste Herausforderung – kai-resource-isolator in v2.9
- **Inländische Chips brauchen Software-Innovation** – Ascend 910C ohne Hardware-Isolation
- **DRA ist Richtung, Weg ist lang** – Lightweight-Mindset senkt Einstiegshürde

HAMi entwickelt sich vom GPU-Sharing-Tool zur heterogenen Compute-Management-Plattform. Interessierte: GitHub und Community.