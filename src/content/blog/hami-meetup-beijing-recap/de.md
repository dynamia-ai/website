---
title: 'Effizienz statt Rechenleistung: HAMi Meetup Peking — Rückblick'
date: '2025-12-27'
excerpt: >-
  Am 27. Dezember schloss „Efficiency Over Compute Power: HAMi Meetup Beijing
  Station“ im Bezirk Haidian erfolgreich ab. Knapp 100 technische Partner
  diskutierten heterogene Compute-Virtualisierung, Scheduling-Evolution und
  KI-Geschäftseffizienz.
author: Dynamia
tags:
  - HAMi
  - Meetup
  - heterogenes Computing
  - GPU-Virtualisierung
  - Cloud Native
category: Community & Events
coverImage: /images/blog/hami-meetup-beijing-recap/hami-meetup-beijing-banner.webp
linktitle: HAMi Peking Meetup Rückblick
---

![HAMi Meetup Peking](/images/blog/hami-meetup-beijing-recap/hami-meetup-beijing-banner.webp)

Am 27. Dezember schloss „Effizienz statt Rechenleistung: HAMi Meetup Peking“ im Bezirk Haidian erfolgreich ab — mit Qualitätsaustausch und tiefen Einblicken. Als zweite Station der HAMi-Meetup-Reihe blieb Peking dem produktiven Einsatz inländischer Rechenleistung und heterogenen Scheduling-Engineering-Praxis verpflichtet.

Knapp 100 Partner aus verschiedenen Branchen tauschten sich zu heterogener Compute-Virtualisierung, Scheduling-Strategien und KI-Effizienz aus. Die Diskussionen waren lebhaft; viele Praxiserfahrungen aus der Produktion wurden festgehalten und geteilt.

## Event-Highlights: Von „nutzbar“ zu „effizient“

Bei wachsender Vielfalt inländischer Beschleuniger und größerer KI-Workloads ist die Kernfrage nicht mehr „gibt es Compute“, sondern **wie begrenzte Rechenleistung stabil und effizient über Scheduling, Virtualisierung und Plattformfähigkeiten an das Geschäft geliefert wird**.

Die Peking-Station bot klare Engineering-Werte:

- **Prioritäten und Grenzen klären:** Vergleiche aus Community, Chipherstellern und Business helfen, die wirklich kritischen Stabilitäts- und Auslastungsfragen zu identifizieren.

- **Wiederverwendbare Paradigmen:** Systematischer Pfad für Zugang, Virtualisierung und Scheduling heterogener Beschleuniger im Kubernetes-Ökosystem.

- **Virtualisierungs-ROI:** In groß angelegter Inferenz und Trainings-Inferenz-Mix die Wirkung von vGPU/vDCU auf Effizienz und Delivery.

- **Langfristige Scheduling-Abstraktionen:** Mit HAMi-Core und DRA eine einheitliche Sicht auf Multi-Architektur und Multi-Device.

- **Umsetzbare Schlussfolgerungen:** „Compute-Effizienz“ in messbare, bewertbare Plattformziele übersetzen.

## Eröffnung: Open Source und Effizienz formen KI-Infrastruktur neu

Bei der Eröffnung teilte **Keith Chan**, Vizepräsident der Linux Foundation und CNCF APAC China Chair, seine Einschätzung: KI-Entwicklung verschiebt sich vom Modell zur Infrastruktur und Ressourceneffizienz. Hohe GPU-Kosten und schwache Auslastung sind globale Probleme; elastischere, nachhaltigere KI-Infrastruktur über Cloud Native und Open Source ist Branchenthema und Kernwert dieses Projekts.

## Kernthemen im Rückblick

### „HAMi: Neue Features und Standardisierung der Capability Matrix“

![HAMi Neue Features](/images/blog/hami-meetup-beijing-recap/hami-new-features-capability-matrix.webp)

![HAMi Community](/images/blog/hami-meetup-beijing-recap/hami-community-en.png)

**Li Mengxuan**, Mitgründer von Dynamia AI, fokussierte Evolution und Community-Planung von HAMi im heterogenen Scheduling. Als CNCF-Sandbox-Projekt hat HAMi Nicht-Intrusivität, starke Isolation und einfaches Deployment in mehreren KI-Beschleuniger-Szenarien bewiesen. Neu u. a. **CDI-Support, Mock Device Plugin und tiefe Ascend-Device-Plugin-Integration mit Volcano**.

Die Community plant **HAMi-DRA im Januar** — Vereinfachung von Webhook + Scheduler + Device-Plugin durch Kubernetes DRA und nahtlose Integration mit Volcano und kai-scheduler. Intern entstand eine Capability Matrix für Reife und Supportumfang (Speicherisolation, Compute-Kontrolle, Scheduling-Koordination). Künftig stärkere Co-Kreation mit Chipherstellern für ein offenes, transparentes heterogenes Scheduling-Ökosystem.

### „DCU-Softwarevirtualisierung von Grundlagen bis Praxis“

![DCU Virtualisierung](/images/blog/hami-meetup-beijing-recap/dcu-virtualization-basics.webp)

![DCU Praxis](/images/blog/hami-meetup-beijing-recap/dcu-practice-implementation-en.png)

**Wang Zhongqin**, Hygon R&D, systematisierte DCU-Virtualisierung in Cloud-Native-Umgebungen und Kubernetes-Landing. Von der Treiberschicht über hy-smi zu feingranularer vDCU-Segmentierung und dynamischer Anpassung; Isolation und Laufzeitkonsistenz an Host- und Container-Beispielen.

Im Kubernetes-Kontext: DCU-Device-Plugin-Registrierung und Architektur für dynamische vDCU-Segmentierung mit **HAMi**-Scheduler. Standardisiertes Device-Plugin-Framework, mehrere Runtime-Modi, On-Demand-Compute und VRAM ohne Vorzerlegung. DCU-Exporter für Monitoring physischer und virtueller DCUs.

Planung mit HAMi: Shared-Modus „nur VRAM deklarieren, Compute teilen“, **mehrere Container teilen dieselbe vDCU**, Evolution bei Registrierung, Metriken und Virtualisierungsformen (SR-IOV, Passthrough).

### „Bagualu Intelligent Computing Software Stack und Performance-Delivery“

![Bagualu Computing](/images/blog/hami-meetup-beijing-recap/bagualu-intelligent-computing-stack.webp)

![Bagualu Performance](/images/blog/hami-meetup-beijing-recap/bagualu-performance-delivery-en.png)

**He Wanqing**, Qingcheng Jizhi, zur Komplexität **k Geschäftstypen × m Modelle × n Beschleuniger** im inländischen LLM-Training und Inferenz. Engineering-Praxis für Software-Stack und Large-Scale-Delivery. Multi-Modell-Multi-Chip erfordert ganzes System von Compilation, Parallelität, Quantisierung bis Inferenz-Engine.

Bagualu-Stack: Beschleunigung auf Compile-, Quantisierungs-, Parallel-Training- und Inferenz-Engine-Ebene; elastisches Deployment mit Multi-Cloud-Plattform. Mit HAMi GPU-Virtualisierung und Scheduling: **Bagualu Turnkey mit dual-elastischem Modell — vGPU auf Ressourcenebene, Auto-Scaling auf Workload-Ebene**, höhere Auslastung ohne Geschäftsform-Änderung.

### „Beike × HAMi: vGPU-Inferenzcluster in der Praxis“

![Beike × HAMi](/images/blog/hami-meetup-beijing-recap/beike-hami-partnership.webp)

![Beike Praxis](/images/blog/hami-meetup-beijing-recap/beike-vgpu-inference-cluster-practice-en.png)

**Wang Ni**, Beike Computing Platform, systematisierte HAMi-Landing: Architektur-Evolution bei großem GPU-Management. Ausgangspunkt: Fragmentierung und Auslastungsengpässe bei Multi-Modell-GPU, Multi-Cluster-Scheduling und millionenfacher täglicher Requests.

Technisch: vGPU-Elastic-Pooling mit HAMi, VRAM-Slicing für Inferenz — TensorFlow, kleine Modelle, Sprachmodelle unter 32B stabil auf geteilten GPUs. VRAM-Limits und Scheduling sicherten Isolation bei Multi-Task ohne App-Umbau. GPU-Auslastung im Inferenzcluster etwa **dreifach** verbessert.

### „HAMi-Core × DRA: Native DRA-Driver-Praxis“

![HAMi-Core DRA](/images/blog/hami-meetup-beijing-recap/hami-core-dra-architecture.webp)

![DRA Praxis](/images/blog/hami-meetup-beijing-recap/dra-driver-practice-en.png)

**Yang Shouren**, 4Paradigm & HAMi Approver: HAMi unter Kubernetes DRA — Evolution von Device Plugin zu nativem DRA-Driver. Grenzen von Device Plugin bei Device-Expression und Lifecycle; Wartbarkeit von Env-Vars und Annotations.

**HAMi-Core DRA Driver** mit KEP-5075 (DRA: Consumable Capacity), ResourceClaim und ResourceSlice für standardisierte Teilressourcen wie VRAM. CDI und libvgpu für VRAM-Limit, Binding und Runtime-Cleanup ohne Container-Invasion. Ausblick HAMi-DRA: Konfigurationsvereinheitlichung, Monitoring, heterogene Standardattribute.

### „Neue Features im HAMi Device Plugin“

![Device Plugin](/images/blog/hami-meetup-beijing-recap/device-plugin-architecture.webp)

![Neue Features](/images/blog/hami-meetup-beijing-recap/device-plugin-new-features-en.png)

**James**, 4Paradigm: Evolution des HAMi Device Plugins, Volcano-Integration für Ascend. Kubernetes-Scheduling oft ganze Karte exklusiv — grobe Granularität erschwert feingranulares heterogenes Scheduling.

Ascend Device Plugin: Init, Filter, Allocation; Registrierung in device-share für Volcano-Scheduling. **Mock Device Plugin** ergänzt fehlende VRAM-Dimensionen aus Knoten-Annotations. Bessere Observability und Scheduling-Genauigkeit bei Multi-Scheduler.

### „HAMi v2.7.0: Beschleunigte Kompatibilität mit inländischer Rechenleistung“

![HAMi v2.7.0](/images/blog/hami-meetup-beijing-recap/hami-v2.7.0-domestic-compute.webp)

![Kunlunxin Adaption](/images/blog/hami-meetup-beijing-recap/kunlunxin-xpu-adapter-en.png)

**Ouyang Luwei**, Ruisi Zhilian & HAMi Reviewer: Kunlunxin P800 vXPU mit HAMi — Virtualisierung und Scheduling auf Werksintegration, dynamische vXPU-Segmentierung.

HAMi-Scheduler **Topologie-Bewusstsein** für Multi-XPU, Multi-Node, heterogene Koexistenz — niedrigste Latenz, höchste Performance. Observability: standardisierte Logs, Events, Visualisierung für Troubleshooting in Produktion.

## Austausch: Fragen von der Front, Antworten von der Front

Mehrere Runden zu GPU/DCU/XPU-Virtualisierung, Inferenz-Trainings-Mix-Scheduling und Adoptionskosten inländischer Beschleuniger. Viele Gespräche nach dem Event zur Übertragung in eigene Umgebungen.

![Austauschrunde](/images/blog/hami-meetup-beijing-recap/meetup-networking-session.webp)

## Fazit

Die Peking-Station bestätigt erneut: **Compute-Effizienz ist kein Einzelpunkt, sondern das Zusammenspiel von Scheduling, Virtualisierung, Software-Stack und Geschäftsszenario.**

Dynamia AI wird weitere HAMi-Praxiserfahrungen verdichten und teilen. An der nächsten Station freuen wir uns auf Sie — und laden HAMi-Nutzer ein, eigene Geschichten zu teilen und „Effizienz statt Rechenleistung“ gemeinsam zu verankern.