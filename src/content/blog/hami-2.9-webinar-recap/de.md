---
title: 'Webinar-Recap | HAMi 2.9: Ascend-Soft-Partitionierung und DRA in der Praxis, inkl. Q&A'
linktitle: 'HAMi 2.9 Webinar-Recap: Ascend Soft Partitioning und DRA'
date: '2026-05-15'
excerpt: >-
  HAMi-Maintainer Li Mengxuan stellt HAMi 2.9 vor — Ascend-NPU-Soft-Partitionierung im Userspace,
  produktionsreifes HAMi-DRA und Verbesserungen beim heterogenen Scheduling. Mit Live-Demo und
  vollständigem Q&A-Recap zu allem Neuen in v2.9.
author: Dynamia AI Team
tags:
  - HAMi
  - v2.9
  - Ascend
  - DRA
  - GPU-Sharing
  - NPU
  - Kubernetes
category: Community & Events
coverImage: /images/blog/hami-2.9-webinar-recap/cover-en.png
---

![Webinar-Cover](/images/blog/hami-2.9-webinar-recap/cover-en.png)

**Thema:** HAMi 2.9 Release Deep Dive — *Wie HAMi 2.9 das Kubernetes-KI-Compute-Scheduling neu gestaltet*

**Zeit:** Abend des Mittwochs, 14. Mai 2026

**Kanal:** WeChat Channels (HAMi Community)

**Referent:** Li Mengxuan — HAMi Maintainer; Co-founder & CTO, Dynamia

**Moderation:** Jimmy Song — Dynamia; HAMi-Community und Ökosystem

## Sitzungsüberblick

In dieser Session führte Li Mengxuan die Kernfeatures von HAMi 2.9 vor — mit Fokus auf Huawei-Ascend-NPU-Soft-Partitionierung und die HAMi-DRA-Architektur — und beantwortete aktuelle Fragen zu heterogenem Compute-Scheduling, Monitoring und heimischen Beschleunigern. Das Webinar enthielt eine Live-Demo der neuen Fähigkeiten.

In den vergangenen zwei Jahren konzentriert sich HAMi auf eines: **Kubernetes soll KI-Rechenressourcen effektiver verwalten.** Von GPU-Sharing und heterogenem Scheduling bis zu nativen Kubernetes-Ressourcenmodellen wie DRA treibt HAMi diese Richtungen weiter voran.

## HAMi v2.9: zentrale Updates

HAMi v2.9 bringt drei große Upgrades:

- **HAMi-Core-Modus** — Ascend 910C Userspace-Soft-Partitionierung ohne proprietäre Herstellertreiber
- **HAMi-DRA** — natives Ressourcenmodell auf Basis von Kubernetes DRA, jetzt produktionsreif
- **Verbesserungen beim heterogenen Scheduling** — breitere Unterstützung heterogener GPUs und KI-Beschleuniger

### Versionsunterschiede und Upgrade-Strategie

Funktionsunterschiede: HAMi 2.9.0 enthält mehrere Feature-Upgrades, 2.8.3 fokussiert vor allem HAMi-Core-Bugfixes; Feature-Set weiterhin wie 2.8.0.

**Canary-Upgrade-Kompatibilität:** Seit 2.5.0 unterstützt HAMi Canary-Upgrades. Nach einem Release werden Jobs unter älteren Versionen noch erkannt; alte Jobs behalten alte Fähigkeiten, neue nutzen automatisch die neuen.

> **Richtlinien für Deployment und Update**
>
> - Update stark mit Helm empfohlen; **Chart und Images müssen beide aktualisiert werden**
> - Niemals nur Images ohne Chart tauschen — das kann das Cluster-Deployment zerstören

**Performance-Gewinne:** Die neue Version optimiert HAMi Core tiefgreifend — weniger Lock-Contention, teilweise Locks durch Atomics ersetzt. Overhead sank auf etwa ein Drittel, nahe an nativen Grenzen.

## HAMi-Core: Ascend-NPU-Soft-Partitionierung im Userspace

HAMi-Core ist eines der wichtigsten Features in HAMi v2.9. Angesichts der Grenzen harter Partitionierung (MIG) führte HAMi Userspace-Soft-Partitionierung ein: Compute-Trennung im Userspace ohne proprietäre Herstellertreiber — bessere Allgemeingültigkeit und Wartbarkeit.

![HAMi-Core-Optimierung](/images/blog/hami-2.9-webinar-recap/hami-core-optimization-en.png)

### Vorteile und Funktionsweise

- **Über Hard-Partition-Grenzen hinaus:** Für Szenarien wie Ascend 910B/C ohne Hard-Partition oder mit grober Granularität (z. B. minimum 16 GB bei 910B) unterstützt Soft-Partitionierung flexible Slice-Größen und elastisches Compute-Scaling
- **Architektur:** Ein Limiter-Daemon startet in jedem Container, kommuniziert mit einer globalen Koordinationsschicht für Compute-Spec-Tokens und nutzt libvnpu.so zum Abfangen von Speicherallokation und Kernel Launch zur Ressourcenbegrenzung

![Schritte der Ascend-Soft-Partitionierung](/images/blog/hami-2.9-webinar-recap/ascend-soft-partition-steps-en.png)

![Ablauf der Ascend-Soft-Partitionierung](/images/blog/hami-2.9-webinar-recap/ascend-soft-partition-flow-en.png)

### Konfiguration und Nutzung

- **Konfiguration:** Global und auf Node-Ebene; Node-Ebene hat Vorrang vor global
- **Erforderliche Annotation:** Aktuelles Release verlangt explizit `huawei.com/vnpu-mode: 'hami-core'` am Pod; sonst kein Scheduling auf Soft-Partition-Nodes

![Konfiguration der Ascend-Soft-Partitionierung](/images/blog/hami-2.9-webinar-recap/ascend-config-en.png)

![Nutzung der Ascend-Soft-Partitionierung](/images/blog/hami-2.9-webinar-recap/ascend-usage-en.png)

> **Live-Demo-Ergebnisse**
>
> Die Demo passte erfolgreich das Speicherlimit eines VLM-Jobs auf 910B von 64 GB auf 40 GB an (Granularität, die Hard-Partitionierung nicht erreicht) und validierte Soft-Partitionierung. Die Lösung ist vollständig Open Source und unterstützt 910B, 910C, 310 und verwandte Modelle ab Treiber 25.05.

## HAMi-DRA: natives Kubernetes-Ressourcenmodell

HAMi-DRA basiert auf Kubernetes Dynamic Resource Allocation (DRA) und bringt GPU/NPU- und andere Beschleuniger-Verwaltung auf den nativen Kubernetes-Pfad. HAMi-DRA ist jetzt produktionsreif.

![Deployment von HAMi DRA](/images/blog/hami-2.9-webinar-recap/hami-dra-deploy-en.png)

### Architekturvorteile und Kompatibilität

- **Entkoppelt vom Scheduler:** HAMi DRA enthält keinen Scheduler mehr; es wirkt als Webhook und Monitoring-Komponente und arbeitet sauber mit dem nativen Kubernetes-Scheduler sowie Drittanbieter-Schedulern wie Volcano und Kube-batch
- **Transparente Migration:** Nutzer müssen DRA-Interna nicht kennen; Ressourcen weiterhin Device-Plugin-ähnlich anfordern (z. B. `limits.nvidia.com/gpu`); HAMi DRA wandelt automatisch in ResourceClaims um

### Produktionsfähigkeiten

- **Monitoring und Troubleshooting:** Vollständige Cluster-Sicht auf Device-Reuse, Allocations-Details und Scheduling-Events — adressiert die Schwierigkeit, mit nativem DRA allein zu debuggen

> **Auswahlhinweise**
>
> - Standardisierte Cluster mit bestem Scheduling (z. B. Topologie-Bewusstsein) → natives HAMi empfohlen
> - Stark angepasste Cluster (eigener Scheduler) oder Plug-and-Play Device-Reuse → HAMi DRA empfohlen

HAMi-DRA-Dokumentation: [https://github.com/Project-HAMi/HAMi-dra](https://github.com/Project-HAMi/HAMi-dra)

> **Hinweise:**
>
> - Kubernetes 1.35+ erforderlich
> - DRA Consumable Capacity Feature Gate wird in K8s 1.36 standardmäßig aktiviert
> - DRA-Modus läuft weiterhin über hami-core
> - NPU-DRA in Entwicklung, erwartet in 2.10; Test-Build vorher für Community-Trials

## Video-Replay

Vollständiges Webinar-Replay im HAMi-Community-WeChat-Kanal.

Bilibili-Replay: [How HAMi 2.9 Reshapes Kubernetes AI Compute Scheduling](https://www.bilibili.com/video/BV13m5Y6nEv3/)

## Folien-Download

Die Referentenfolien liegen auf HAMi Community GitHub: [hami-2.9-kubernetes-ai-scheduling-limengxuan-20260514.pdf](https://github.com/Project-HAMi/community/blob/main/webinar/01-hami-2.9-kubernetes-ai-scheduling-limengxuan-20260514.pdf)

## Q&A-Notizen

Publikumsfragen während des Webinars:

### GPU- und NPU-Partitionierung

**F: Kann HAMi Hot-Mount einer GPU in einen Container — Wechsel von CPU- zu GPU-Container ohne Pod-Neustart?**

Derzeit nicht. Abhängig davon, ob die Container-Runtime (containerd/CRI-O) Hot-Mount unterstützt. Aktuell kein Adoptionsplan. CNCF-Projekte im Blick behalten.

**F: HAMi hat auch Soft-Partitionierung für Huawei Ascend NPU 910B/C — vollständig Open Source oder kommerziell?**

Beides existiert; die Soft-Partitionierungslösung ist vollständig Open Source. Huawei Ascend ist offen unterstützbar wegen Apache-2.0-Lizenz.

**F: Deckt Soft-Partitionierung alle NPUs ab — 910B, 910C und 310?**

Ja — ab Treiber 25.05.

**F: Nach Soft-Partitionierung eines Huawei Ascend NPU (910B): Nach Pod-Löschung und Zerstörung der vNPU-Blöcke schlägt 8-GPU-Vollmaschinen-Inferenz mit „PTA call acl api failed“ fehl. Neustart des Servers hilft. HAMi-NPU-Virtualisierungsproblem?**

Reproduktion in der Umgebung nötig; Hersteller kontaktieren empfohlen.

**F: Stimmen Monitoring-Metriken nach Soft-Partitionierung mit dem Container-Limit überein — z. B. Auslastung mit Slice-Größe als Nenner?**

Nein. Aktuell physische Vollkarten-Auslastung, nicht logische Auslastung nach Slice (z. B. 20 % physisch geteilt durch 30 %-Quota). Wie bei NVIDIA: Vollkarten-Auslastung.

**F: Pläne für vNPU-Monitoring?**

Ascend-Soft-Partition-Monitoring auf der Roadmap.

**F: Was bedeutet hami-core dynamic adjustment?**

Derzeit kein Dynamic-Adjustment-Feature.

**F: `npu-smi info` im Pod auf Ascend 910B4-1 schlägt mit DrvMngGetConsoleLogLevel failed / dcmi model initialized failed fehl, weil das Gerät genutzt wird. Unterstützt Ascend `npu-smi info` im Container?**

Ja. Vermutlich, weil die Karte kein „clean device“ ist.

### DRA

**F: Läuft DRA-Modus weiterhin über hami-core?**

Ja.

**F: Unterstützt NPU DRA?**

In Entwicklung; erwartet in der nächsten Version (2.10). Test-Build vorher an die Community.

**F: Wo ist die HAMi-DRA-Dokumentation?**

[https://github.com/Project-HAMi/HAMi-dra](https://github.com/Project-HAMi/HAMi-dra)

**F: Für Speicherpartitionierung unter Volcano — HAMi-DRA oder volcano-vgpu-device-plugin?**

Bevorzugt volcano-vgpu-device-plugin. HAMi DRA geht auch, aber ersteres ist heute besser angepasst.

**F: Gibt es einen Best-Practice-Guide?**

Gerade released; Best Practices noch nicht geschrieben — Beiträge willkommen. Kubernetes 1.35+ erforderlich.

**F: Aktiviert K8s 1.35 das DRA Consumable Capacity Feature Gate standardmäßig?**

Nein — Standard-Aktivierung kommt in 1.36.

### Heterogenes Scheduling und Ökosystem

**F: Plant HAMi Unterstützung für Alibaba T-Head PPU?**

Interesse vorhanden, aber Open-Source-Lizenzfreigabe des Herstellers nötig. Huawei Ascend offen unter Apache 2.0; Alibaba PPU hat kein vergleichbares Open-Source-Projekt und braucht Herstellerkooperation.

**F: Können heterogene Setups Mixed-Training oder Mixed-Inference über NVIDIA und heimische Beschleuniger oder zwischen verschiedenen heimischen Karten?**

Abhängig davon, ob die heimische Karte selbst Mixed-Training mit NVIDIA kann. Bei Hardware-Unterstützung und korrektem Netzwerk kann HAMi als Scheduling-Komponente unterstützen; Performance kann leiden. Herstellerdokumentation beachten.

**F: Hat HAMi Topologie-bewusstes Scheduling optimiert?**

Ja — für viele GPUs.

**F: Beispiel für topologie-bewusstes Scheduling?**

Z. B. Kunlunxin- und AWS-Scheduling-Logik.

**F: Kann Volcano mit HAMi Partitionierung und Scheduling für andere heimische Karten? Pläne?**

Auf dafür angepasste Scheduler warten; Herstellerabsprache und Kooperation nötig.

**F: Wird Remote Invocation später unterstützt?**

Es gibt einen Vorschlag: [GitHub Gist](https://gist.github.com/ManishSharma1609/92775165012b9d67e2ea707d9c7aa44a)

### Betrieb und Stabilität

**F: Wie funktionieren Zuverlässigkeit sowie Load-Balancing und elastisches Scaling für Training und Inferenz?**

Es gibt Fault-Isolation; der Scheduler ist stateless und kann neu starten. AWS Karpenter liefert elastisches Scaling und kann mit HAMi genutzt werden.

**F: Nach HAMi-Upgrade laufen alte Pods weiter auf altem hami-core? Und Scheduler-Crashes bei Massen-Pod-Löschung — welche Parallelität jetzt?**

Ja — alte Pods nutzen altes Core (Canary-Upgrade). Bei Scheduler-Crash durch Massenlöschung braucht es mehr Tests; bitte Issue bei Auftreten.

**F: Kann HAMi-Speicher-Oversubscription in Produktion genutzt werden?**

HAMi Community Edition unterstützt nur logische Oversubscription; Überschreitung des physischen Speichers führt zu OOM. Für produktionsreife Speicher-Oversubscription siehe HAMi Enterprise Edition.

## Zusammenfassung

HAMi 2.9 ist ein Meilenstein-Release. HAMi-Core-Userspace-Soft-Partitionierung löst Ascend-NPU-Compute-Sharing von Hersteller-Hard-Partition-Grenzen, und HAMi-DRA bietet einen neuen Pfad für heterogenes Compute-Management im nativen Kubernetes-Ökosystem. Die Publikumsfragen zeigten starkes Interesse an GPU/NPU-Shared-Scheduling, heimischen Beschleunigern und produktivem DRA-Einsatz. HAMi investiert weiter in diese Richtungen und lädt Entwickler und Unternehmen ein, der Community beizutreten und Kubernetes-KI-Compute-Scheduling gemeinsam voranzutreiben.

> **Folgen Sie dem HAMi-Community-WeChat-Kanal**
>
> Wir veranstalten weiter Community-Webinare und laden Freunde aus HAMi-Community und AI Infra ein, Praxis, Technik und Frontier Exploration zu teilen. Ob Sie HAMi nutzen, dazu beitragen oder sich für KI-Compute-Management interessieren — folgen Sie unserem Kanal, um gemeinsam zu lernen und zu wachsen.
>
> Suchen Sie in WeChat Channels nach **HAMi Community** und folgen Sie, um nichts zu verpassen!

Chinesische Community-Updates und Beitritt zur WeChat-Gruppe über offizielles Konto, WeChat-Kanal und Community-Assistent.

![Willkommen in der HAMi-Community](/images/blog/hami-2.9-webinar-recap/join-community.jpg)