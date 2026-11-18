---
title: 'HAMi Meetup Shanghai Deep Dive (6): Wie UCloud HAMi-Sharing in einsatzbereite Entwicklungsumgebungen überführt'
linktitle: UCloud AI-Plattform-Engineering
date: '2026-09-22'
excerpt: >-
  GPUs sind da — das Algorithmus-Team wartet noch auf Umgebungen. Peng Peng, Senior R&D Engineer
  bei UCloud, teilte auf dem HAMi Meetup Shanghai „Engineering Challenges and Practices of AI Computing Platforms“:
  einheitliche Instanz-Specs, Multi-Cluster-Zugang, Tool-Injection und Image-Beschleunigung verkürzen die
  Umgebungslieferkette — HAMi vGPU in Private Deployments, getrennte Kernel-vGPU- und QEMU-Passthrough-Pfade in der Public Cloud.
author: Dynamia
tags:
  - HAMi
  - HAMi Meetup
  - UCloud
  - AI Computing Platform
  - GPU Sharing
  - vGPU
  - Image Acceleration
  - Multi-Cluster
category: Community & Events
coverImage: /images/blog/hami-meetup-shanghai-2026-ucloud-ai-platform/slide-09-instance-spec-abstraction.png
---

GPUs stehen bereit; das Algorithmus-Team wartet noch auf Umgebungen. Treiber, Images, Netzwerk, Storage — einzeln konfiguriert und für jeden neuen Cluster erneut angepasst. Selbst mit GPU-Sharing unten muss die Plattform Ressourcen-Specs, Scheduling-Konfiguration und Dev-Tools verbinden, damit Nutzer sofort loslegen können.

Das ist der sechste Deep Dive in unserer [HAMi Meetup Shanghai](/blog/hami-meetup-shanghai-2026)-Reihe. **Peng Peng**, Senior R&D Engineer bei UCloud, ordnete HAMi in diese Umgebungslieferkette in „Engineering Challenges and Practices of AI Computing Platforms“ ein. Das Team nutzt HAMi vGPU in privaten KI-Compute-Szenarien und senkt die Nutzungshürde durch Ressourcen-Abstraktion, Multi-Cluster-Zugang, Tool-Injection und Image-Beschleunigung. Für Plattformteams zeigt die Praxis, wie Low-Level-Ressourcenfähigkeit in einen nutzer- und betriebsfähigen Service organisiert wird.

## Wichtigste Erkenntnisse

- UCloud setzt HAMi vGPU in privaten KI-Compute-Szenarien ein, u. a. für gemischtes Large/Small-Model-Deployment.
- Einheitliche Instanz-Specs, Multi-Cluster-Zugang, Tool-Injection und Image-Beschleunigung verkürzen die Dev-Umgebungslieferkette gemeinsam.
- HAMi-Userspace-Sharing, Kernel-vGPU in der Public Cloud und QEMU-Passthrough entsprechen unterschiedlichen Deployments — keine austauschbare Einheitslösung.

**Speaker:** Peng Peng | Senior R&D Engineer, UCloud

## Ganzkarten und vGPUs unter einer Instanz-Spec

UClouds Plattformbedarf kam aus drei Richtungen: schnelle Umgebungen für interne Algorithmus-Teams, einheitliches Management selbst gebauter Inferenz-Cluster, leichtgewichtiges Management für GPU-besitzende Kunden.

Nutzeranfragen sind meist klar: Image, CPU und Speicher, GPU-Modell und -Anzahl, Ganzkarte oder vGPU. Diese Felder werden nicht direkt zu ausführbarer Kubernetes-Konfiguration — unterschiedliche Hardware bringt Resource Keys, Allocation-Annotations, Node-Constraints und Laufzeitparameter mit.

Das Team definiert stabile Instanz-Specs (Instance Specs) und drückt Ganzkarten- oder vGPU-Zuweisung einheitlich aus; eine Adaptationsschicht übersetzt in die Basiskonfiguration. Ressourcen-Claims, Vendor-Annotations, Scheduling-Constraints und Laufzeitparameter werden zentral behandelt. HAMi-Sharing-Ressourcen fließen wie andere in den einheitlichen Umgebungserstellungsprozess.

![Stabile Instanz-Specs und Adaptationsschicht (Folie 9)](/images/blog/hami-meetup-shanghai-2026-ucloud-ai-platform/slide-09-instance-spec-abstraction.png)

Nutzer wählen weiter Modell, Anzahl und Image. Die Plattform vereinheitlicht Spec-Ausdruck und Übersetzung — nicht die Annahme, alle GPUs seien austauschbar. Bei neuen Geräten startet Adaptionsarbeit früh an dieser Schicht.

## Multi-Cluster-Management: Trade-offs entlang realer Geschäftsgrenzen

Cluster stehen in verschiedenen Regionen, mit unterschiedlichem Storage, Netzwerk und Registry. Multi-Cluster bedeutet Zugangsdaten, Kapazität und Health, Job-Lebenszyklus sowie Log-/Metrik-Aggregation.

Das Team bewertete Orchestratoren wie Karmada und wählte Zugang pro Cluster per kubeconfig zur Kubernetes-API. Grund: begrenztes Szenario — ein Task wählt beim Erstellen einen Ziel-Cluster, ohne spätere Cross-Cluster-Migration oder DR.

Damit vermeidet leichtgewichtiger Zugang den Overhead einer zusätzlichen Control Plane. Logs und Metriken brauchen weiter eigene Anpassung; Credentials sind sensible Daten mit Zugriffskontrolle.

![Leichtgewichtiger Zugang bei Single-Task-Single-Cluster (Folie 11)](/images/blog/hami-meetup-shanghai-2026-ucloud-ai-platform/slide-11-lightweight-multi-cluster.png)

Die Wahl hat einen klaren Geltungsbereich. Bei echtem Bedarf für Cross-Cluster-Migration und DR sind Orchestrator und Datenlage neu zu bewerten — leichtgewichtiger Zugang ersetzt keine volle Multi-Cluster-Fähigkeit.

## Tool-Entkopplung und On-Demand-Laden verkürzen Wartezeiten

Algorithmus-Frameworks und Projektabhängigkeiten wollen Stabilität; Dev-Tools wie SSH und VSCode ändern sich häufig. Alles in ein Image zu backen zwingt bei jedem Tool-Update zu Rebuild und Revalidierung.

Das Team assembliert Tools bei der Umgebungserstellung — Sidecars für Dev-Fähigkeit, Regeln für ergänzende Konfiguration. Algorithmus-Container und Plattform-Tools werden getrennt gepflegt; gemeinsame Dateien, Netzwerk und Konfigurationsgrenzen müssen definiert bleiben.

![Dev-Tools zur Laufzeit, Entkopplung von Algorithmus-Images (Folie 13)](/images/blog/hami-meetup-shanghai-2026-ucloud-ai-platform/slide-13-runtime-tool-injection.png)

Image-Größe verlangsamt den Start. Klassisch: alle Layer laden und entpacken vor Dateisystem-Aufbau. Der beschleunigte Ansatz scannt komprimierte Layer und erzeugt unabhängige Datei-Indizes. Zur Laufzeit: zuerst Metadaten und Indizes, Remote-Layer mounten, benötigte Chunks bei Zugriff in lokalen Cache schreiben.

Download verschwindet nicht; manche Reads verschieben sich nach Containerstart. Liest die Anwendung sofort große Dateien, bleibt Wartezeit; ohne nutzbare Indizes oder bei ungeeignetem Lazy Loading Fallback auf normales Pulling.

![Image-Indexierung, On-Demand-Reads, Fallback (Folie 14)](/images/blog/hami-meetup-shanghai-2026-ucloud-ai-platform/slide-14-on-demand-image-loading.png)

Schneller beurteilen heißt: bis zur tatsächlich nutzbaren Anwendung durchdenken — nicht bei „Container gestartet“ stoppen.

## HAMi privat; getrennte Isolationspfade in der Public Cloud

Peng berichtete, das Team probierte früh MIG, stieß unter ihren Bedingungen auf unflexible Slice-Profile und schwer anpassbare Hardware und wählte HAMi für private KI-Compute-Szenarien. Er teilte auch Erfahrung mit HAMi bei gemischtem Large/Small-Model-Deployment. Konkret: privat HAMi vGPU — GPU-Sharing plus Speicher- und Rechenquoten in Kubernetes; Consumer-GPU in der Public Cloud Kernel-vGPU mit VFIO→QEMU; Enterprise-GPU Passthrough verschiedener GPUs pro Maschine an verschiedene VMs.

Die Logik: HAMi trägt Userspace-Sharing und Quoten in privaten Szenarien; Kernel-vGPU und QEMU-Passthrough sind UClouds Lösungen für die anderen zwei Umgebungen. Drei Pfade, unterschiedliche Hardware- und Mandanten-Isolation — jeweils eigenes Design und Validierung.

![Szenario → GPU-Management-Ansatz (Folie 16)](/images/blog/hami-meetup-shanghai-2026-ucloud-ai-platform/slide-16-gpu-isolation-scenarios.png)

Enterprise-Passthrough muss Multi-GPU-Kommunikation bedenken. NVLink erfordert einen Trusted Fabric Service für den gemeinsamen NVSwitch, abgestimmt mit VM-Lebenszyklus; Alternative: NVLink aus, GPUs als unabhängige PCIe-Geräte — einfacheres Engineering, ohne High-Speed-Interconnect.

Die Wahl hängt von Hardware, Deployment, Isolation und Kommunikation ab. GPU-Zuweisung ist nur ein Glied in der Lieferkette.

Peng nannte Modellgewichte-Laden, Inferenz-Ressourcenkoordination, idle CPU-Reuse und heterogene Compute-Auswahl als künftige Richtungen — Erweiterung Richtung Modell-Laufzeit und Ressourcenbetrieb.

Für Unternehmen, die HAMi evaluieren, bietet UClouds Praxis eine klare Prüfreihenfolge: kommen Sharing-Specs in den Umgebungs-Flow; laufen Image und Tools reibungslos; sind Quoten und Lebenszyklus zur Laufzeit beherrschbar. Dynamias Enterprise-Wert liegt in dieser Kette: HAMi-Sharing zusammen mit Plattform-Integration, Kompatibilitätsvalidierung und Betrieb — weniger Wartezeit von „GPU erhalten“ bis „arbeiten können“.

## Video und Folien

- **Bilibili-Replay:** [Keynote | Engineering Challenges and Practices of AI Computing Platforms — Peng Peng](https://www.bilibili.com/video/BV1GFY56LERB/)
- **Folien:** [ucloud-ai-platform-engineering-pengpeng.pdf](https://github.com/Project-HAMi/community/blob/main/hami-meetup/04-shanghai-20260906/ucloud-ai-platform-engineering-pengpeng.pdf)

## Serie

- [Überblick: HAMi Meetup Shanghai Recap](/blog/hami-meetup-shanghai-2026)
- [(1) Wo passt HAMi in die CNCF × PyTorch Cloud Native AI Foundation?](/blog/hami-meetup-shanghai-2026-cncf-pytorch-ai-foundation)
- [(2) Nach GPU-Sharing: Isolation, Scheduling und Observability in HAMi 2.10](/blog/hami-meetup-shanghai-2026-hami-2-10-remote-gpu)
- [(3) Inferenz-Steuerung vs. GPU-Ressourcenmanagement: llm-d und HAMi](/blog/hami-meetup-shanghai-2026-llm-d-inference-plane)
- [(4) GPU-Leistung in Inferenzfähigkeit: Iluvatar](/blog/hami-meetup-shanghai-2026-iluvatar-gpu-inference)
- [(5) iFLYTEK Multi-Business GPU-Sharing mit Volcano + HAMi-core](/blog/hami-meetup-shanghai-2026-volcano-hami-core)
- **(6) Wie UCloud HAMi-Sharing in einsatzbereite Dev-Umgebungen überführt** (dieser Beitrag)
- [(7) Vom Nutzer zum Mitgestalter: nachhaltige HAMi-Community](/blog/hami-meetup-shanghai-2026-community-panel)