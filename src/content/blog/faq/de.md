---
title: 'HAMi Quick-Start: 9 Schlüsselfragen für jeden Neueinsteiger'
coverTitle: 'HAMi Quick-Start: 9 Schlüsselfragen für jeden Neueinsteiger'
date: '2025-06-25'
excerpt: >-
  Niedrige GPU-Auslastung? Heterogene Geräte im Chaos? Dieser Artikel beantwortet 9 Pflichtfragen
  für den Einstieg in HAMi — Hardware-Kompatibilität, vGPU-Mechanik, verteiltes Training,
  dynamische Ressourcen und Roadmap.
author: Dynamia AI Team
tags:
  - HAMi
  - GPU-Sharing
  - vGPU
  - Kubernetes
  - Heterogenes Computing
  - Einstieg
category: Technical Deep Dive
coverImage: /images/blog/faq/coverimage2.jpg
linktitle: HAMi FAQ
---

## Vorwort

🚀 Schluss mit GPU-Ressourcen-Kopfschmerzen — mit HAMi behalten Sie heterogene Cluster im Griff.

Kennen Sie diese Herausforderungen?

* **Niedrige GPU-Auslastung**: Teure GPUs stehen oft idle, ROI schwer erreichbar.
* **Heterogenes Chaos**: NVIDIA, Ascend und andere Beschleuniger im selben Cluster — schwer zu steuern.
* **Ressourcen-Blackbox**: Keine Echtzeit-Transparenz über Zuweisung und Nutzung, Optimierung unmöglich.

HAMi adressiert genau diese Punkte: GPU-Sharing und Isolation, native Unterstützung heterogener Geräte inkl. NVIDIA und Ascend, plus HAM-WebUI für höhere Auslastung, einfachere Ops und transparente Nutzung.

Damit Sie Kernwert und Alltag mit HAMi verstehen, haben wir „9 Schlüsselfragen für jeden Neueinsteiger“ zusammengestellt.

## F1: Welche Hardware-Partner unterstützt HAMi?

![Überblick unterstützter Hardware und Beschleuniger](/images/blog/faq/q2.jpg)

## F2: Was ist ein vGPU? Warum kein „Multi-Open“ auf einer Karte, obwohl 10 vGPUs sichtbar sind?

Kurz:

* Ein **vGPU** ist *keine* virtuelle Grafikkarte, sondern eine *virtuelle Sicht* auf die physische Karte.
* `deviceSplitCount: 10` heißt: **eine physische GPU kann von höchstens 10 Tasks gesehen und geteilt werden** — **nicht**, dass ein Task mehrere vGPUs auf derselben Karte anfordert.

Ausführlich:

* Alle vGPUs teilen dieselben physischen Ressourcen; logische Sichten, keine unabhängigen Partitionen.
* `nvidia.com/gpu: 2` bedeutet für den Scheduler „zwei physische GPUs“ — **nicht** zwei vGPUs auf einer Karte.
* Das Modell zielt auf **Multi-Task-Sharing** einer Karte, nicht auf Replikation für einen einzelnen Task.
* Im Container entspricht die GPU-UUID dem physischen Knoten — vGPUs sind logische Over-Commitment-Sichten.

Fazit: vGPU-Over-Commitment steigert Gesamtauslastung durch mehr Tasks pro Karte, nicht die Ressourcen eines einzelnen Tasks.

## F3: Mit welchen Open-Source-Schedulern integriert sich HAMi?

**Derzeit unterstützt:**

* **Volcano** — mit dem vom HAMi-Projekt gepflegten `volcano-vgpu-device-plugin` für GPU-bewusstes Batch-Scheduling.

**Derzeit nicht unterstützt:**

* **KubeVirt & Kata Containers** — Virtualisierung (PCI-Passthrough/Virtio) vs. direktes Device-Mounting des HAMi-Plugins: architektonisch schwierig. Fokus vorerst auf Bare-Metal/Container-Runtimes.

## F4: Multi-Node-, Multi-GPU-Training? Cross-Node und Cross-GPU?

Ja.

* **Multi-Node, Multi-GPU**: K8s plant Pods über Knoten; Frameworks (PyTorch, TensorFlow, Horovod, …) koordinieren Cross-Node/Cross-GPU.
* **Cross-Node**: Kommunikation über Hochleistungsnetze (NCCL, RDMA).
* **Cross-GPU**: Ein Pod kann mehrere GPUs auf einem Knoten für Intra-Node-Parallelität anfordern.

**Nicht unterstützt:**

* **Ein Pod über mehrere Knoten** — K8s-Design verbietet das; HAMi implementiert kein Remote-GPU. Stattdessen Multi-Pod-Verteilung.

## F5: GPU-Ressourcen zur Laufzeit ändern? Dynamische Anpassung?

**Noch nicht.** Echte dynamische Anpassung ist **nicht** unterstützt.

* GPU-Ressourcen sind beim Pod-Start statisch.
* K8s: deklaratives, vorhersagbares Ressourcenmanagement.
* DRA hilft K8s, komplexe Geräteparameter zu verstehen — **nicht** Live-Resize.

Ausblick: Bei starker Nachfrage nach Laufzeit-Limits für Compute/Speicher könnte HAMi programmnahes Throttling prüfen; natives dynamisches GPU-Resize bleibt langfristiges Community-Ziel.

## F6: Warum so viele Device Plugins — vom Vendor und von HAMi?

**Manche heimische Vendor ohne separates Runtime:**

* Alles-in-einem: Cambricon, Hygon, Enflame, … — Discovery und Mount im Plugin.

**NVIDIA & Ascend mit Trennung:**

* Plugin meldet Ressourcen; Runtime (NVIDIA Container Runtime, Ascend Docker Runtime) setzt Umgebung/Mounts — modulärer.

**Warum HAMi Plugins neu implementiert:**

* Offizielle Plugins liefern zu wenig Metadaten (NUMA, Compute/Memory-Caps, Over-Commit).
* Eigene APIs für Scheduler-Integration.

Beispiele: Ascend — ein Plugin statt vieler Kartentypen; NVIDIA — reichere Compute/Memory/Topologie-Daten.

## F7: Split Count ignoriert? Limits für Compute/Speicher wirkungslos? Debugging?

* **Split Count** — Konflikt mit offiziellem NVIDIA-Plugin oder falsches `devicePlugin.deviceSplitCount`.
* **Compute** — `GPU_CORE_UTILIZATION_POLICY=force`; sonst unbegrenzt, wenn nur ein Container auf der Karte.
* **Speicher** — Privilegierter Modus oder `NVIDIA_VISIBLE_DEVICES=all` überschreibt Limits.
* Plugin-Konflikte und Umgebungsvariablen prüfen.

⚠️ 50 %-Compute-Limit = **langfristiger Durchschnitt** ~50 %; kurze Spitzen darüber möglich.

## F8: Warum zeigt `nvidia-smi` im Pod keine Prozesse?

PID-Namespace-Isolation verbirgt Host-PIDs. Mit `hostPID=true` sichtbar (Sicherheitsabwägung).

## F9: HAMi-Roadmap und Ausblick

**Kerntechnologie**

* **Vollständige DRA-Migration** — HAMi-DRA-Treiber; Virtualisierung und Scheduling in natives DRA.

**WebUI**

* **i18n & Dark Mode**
* **Bessere Abstraktion** für Ascend und andere Beschleuniger.
* **Reichere Metriken** mit iframe-Einbettung.

**Features** (planungsabhängig):

* **Feingranulare Scheduling-Knöpfe**: Compact vs. Spread, Over-Commit-Ratio, Device-Mode-Filter (hami-core, MIG, MPS).
* **VM-Monitoring & Governance** — VMs als externe Knoten per Labels.
* **Multi-Cluster-Dashboard**
* **YAML-Wizard** — Formular generiert annotierte Manifests.

---

*Mehr zum HAMi-Projekt: [GitHub](https://github.com/Project-HAMi/HAMi) oder [Slack](https://cloud-native.slack.com/archives/C07T10BU4R2).*