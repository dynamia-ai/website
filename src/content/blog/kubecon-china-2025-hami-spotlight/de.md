---
title: >-
  Von SF Technology bis AWS | Dynamia AIs HAMi-Projekt gewinnt auf der KubeCon China
  Aufmerksamkeit von Branchengrößen
coverTitle: 'HAMi auf der KubeCon China: von SF Tech bis AWS'
date: '2025-06-26'
excerpt: >-
  KubeCon China 2025 endete erfolgreich. Das von Dynamia AI initiierte HAMi als
  CNCF-Sandbox-Open-Source-Projekt strahlte und erhielt hohe Anerkennung von
  Branchengrößen von SF Technology bis AWS.
author: Dynamia AI Team
tags:
  - KubeCon
  - HAMi
  - GPU-Sharing
  - Cloud Native
  - Kubernetes
  - KI-Infrastruktur
category: Customer Success Story
coverImage: /images/blog/kubecon-china-2025/cover.en.jpg
linktitle: KubeCon China 2025 Spotlight
---

KubeCon China 2025 endete eindrucksvoll in Hongkong und vereinte globale Experten, Entwickler und Open-Source-Enthusiasten beim führenden Cloud-Native-Event. In dieser Innovationswelle machte HAMi – von Dynamia AIs Kernteam initiiert und geführt, das einzige CNCF-Sandbox-Open-Source-Projekt der Branche mit Fokus auf heterogenes GPU-Ressourcen-Sharing – nicht nur in technischen Sessions eine starke Stimme, sondern zeigte auch lebendige Community durch den Austausch mit der globalen Community.

Dieser Artikel führt durch die Highlights von Dynamia AI und HAMi auf der KubeCon, teilt spannende Hintergrundgeschichten und analysiert anhand der Konferenztrends Gegenwart und Zukunft des GPU-Technologie-Ökosystems in cloud-nativen Umgebungen.

## Highlight-Momente: HAMis zwei Kern-Sessions auf der KubeCon China

Als innovative Kraft im GPU-Sharing und -Scheduling teilte das Dynamia-AI-Team zwei Kernthemen und adressierte direkt die GPU-Ressourcen-Schmerzpunkte von Kubernetes-Nutzern im KI-Zeitalter.

### Session 1: K8s Issue #52757 – Multi-Container-GPU-Sharing

Diese Session ging auf eine acht Jahre alte Herausforderung in der Kubernetes-Community zurück: Wie teilt man teure physische GPUs effizient zwischen mehreren Containern mit Isolation? Traditionelle Zuweisungsmethoden (exklusiv, Time-Slicing, MPS, MIG usw.) haben jeweils Grenzen – schwer, Isolation, Flexibilität, Hardware-Kompatibilität und Kosten auszubalancieren.

Eine Kernmission von HAMi ist eine Open-Source-, feingranulare (Compute-Prozent und Speicher auf MB-Ebene), flexible GPU-Sharing-Lösung ohne Eingriff in Anwendungen und ohne App-Änderungen. Scheduler und Device Plugin koordinieren; CUDA-API-Aufrufe in Containern werden abgefangen, um Compute- und Speicherzuweisung zu steuern – Sharing und Isolation. Zudem breite Kompatibilität mit inländischen KI-Chips und heterogener Hardware für einheitliches Scheduling.

![Speaker Yin Yu](/images/blog/kubecon-china-2025/speaker-yin-yu.png)
*Yin Yu (Dynamia AI Product Manager, Core Maintainer @HAMi) beim Vortrag*

### Session 2: Intelligentes GPU-Management – dynamisches Pooling, Sharing und Scheduling für KI-Workloads

Diese Session vertiefte das „unmögliche Dreieck“ im GPU-Management in K8s-Clustern – hohe Performance, starke Flexibilität und hohe Wiederverwendbarkeit gleichzeitig sind schwer; typisch extrem niedrige GPU-Auslastung, weil K8s GPUs exklusiv zuweist. Bestehende NVIDIA-Lösungen sind oft komplex oder unflexibel.

HAMis Ansatz: intelligentes GPU-Management, dynamisches Pooling, Sharing und Scheduling. Nutzer deklarieren nur benötigten Speicher, ohne Hardware oder Partitionierungstechnologie zu kennen. Kern: HAMi Core fängt CUDA-APIs ab für harte Speicherisolation; dynamische MIG-Funktion. Tiefe Integration mit Volcano und HAMi Device Plugin erzeugt MIG-Slices nach Task-Bedarf, löst MIG-Vorkonfigurations-Schmerz und balanciert Performance und Isolation. Deutlich höhere GPU-Auslastung und weitgehende Lösung des „Dreiecks“.

![Team Presentation](/images/blog/kubecon-china-2025/team-presentation.png)
*(von links) Li Mengxuan (Mitgründer & CTO Dynamia AI & HAMi-Initiator), Chen Wei (Technical Expert China Unicom Cloud Data Center)*

## Hinter den Kulissen: Community und Ideenaustausch

Neben exzellenten Sessions erhielten Dynamia AI und HAMi auf der KubeCon große Anerkennung und wertvolle Vorschläge – authentische Community-Wärme jenseits der Technologie.

### Story 1: Vom Publikum zu Peers

Nach dem Morgen-Lightning-Talk kamen mehrere Zuhörer sofort zu uns, zeigten starkes Interesse an HAMi und fragten nach Zeit und Ort der Deep-Dive-Session am Nachmittag. Direktes Feedback – die klarste Bestätigung des Projektwerts!

### Story 2: Tiefer Dialog mit dem CNCF-CTO

![Meeting with CNCF CTO](/images/blog/kubecon-china-2025/cncf-cto-meeting.png)
*(von links) Keith Chan (Linux Foundation APAC, CNCF China Director), Chris Aniszczyk (CNCF CTO), Li Mengxuan, Yin Yu, Chen Wen*

Das HAMi-Maintainer-Team von Dynamia AI tauschte sich tief mit CNCF-CTO Chris Aniszczyk aus. Chris bekundete hohe Anerkennung und Unterstützung für HAMi und gab strategisch wertvolle Community-Empfehlungen:

- **Systematische User Cases aufbauen:** Detaillierte, systematische Cases verbessern Glaubwürdigkeit und Verbreitung.
- **Globale Entwickler einbinden:** CNCF LFX Mentorship nutzen, um Universitäten und Einzelentwickler anzuziehen.
- **Aktive Teilnahme an globalen CNCF-Events:** Mehr KCD und Online/Offline in Korea, Japan, Indien usw. Chris erwähnte unser Vietnam-Telekom-Case in Slack als guten Start – Motivation, Entwickler in diesen Regionen zu erreichen und Praxisgeschichten auf der Bühne zu teilen.
- **Professionelle Security-Response:** Beim Übergang von Sandbox zu höherer Reife standardisierte Vulnerability-Disclosure und Security-Prozesse als Vertrauensbasis.
- **Klare Inkubations-Roadmap:** Timelines und Vorbereitung für CNCF Incubating strukturieren.

### Story 3: Hohe Anerkennung im offiziellen Keynote

Am zweiten Konferenztag widmete Keith Chan, Linux Foundation APAC und CNCF China Director, in seinen Eröffnungsbemerkungen eine eigene Folie HAMi! Er verwies auf SF Technologys „Effective GPU Technical White Paper“ und HAMis Engineering-Praxis bei GPU-Pooling und -Scheduling – höchste offizielle Anerkennung.

![Keynote Display](/images/blog/kubecon-china-2025/keynote-hami.png)
*Keith Chan präsentiert HAMi im Keynote*

### Story 4: Ideenaustausch am Community-Stand

Im Open-Source-Standbereich zog HAMi viele Besucher an. Frank Fan, Senior Container Solutions Architect bei AWS, tauschte sich ausführlich über HAMis Virtualisierungsprinzipien aus und verglich Lösungen. Li Mengxuan wurde spontan zum AWS Pioneer Forum am nächsten Tag eingeladen, um Cloud-Native- und KI-Innovation zu teilen.

![KubeCon China 2025 HAMi booth presentation](/images/blog/kubecon-china-2025/p1.jpg)

### Story 5: „Manuelle Likes“ beim Mittagessen

Beim Lunch trafen wir zufällig das KI-Team von SF Technology. Sie lobten HAMis Wirkung in Produktion und gaben dem Projekt persönlich „manuelle Likes“. Feedback von Frontline-Nutzern ist unsere stärkste Motivation.

## KubeCon-Einblicke: GPU-Ökosystem heute und morgen

GPU-Themen auf der KubeCon hatten noch nie so hohe Popularität. Mit KI und LLMs weltweit steht im Fokus: teure Compute-Ressourcen effizienter, wirtschaftlicher und flexibler nutzen. HAMis Exploration ist keine Insel, sondern eine zentrale Welle der Technologietide.

### Kernherausforderungen: „Unmögliches Dreieck“ von Kosten und Effizienz

![KubeCon China 2025 HAMi community meetup](/images/blog/kubecon-china-2025/p2.jpg)

Fast alle Diskussionen kreisten um:

- **Hohe Kosten, niedrige Auslastung:** Teure GPUs, in Produktion niedrige Auslastung und Fragmentierung – schockierende Verschwendung, ROI leidet.
- **LLM-spezifische Workloads:** Variable Ein-/Ausgabelängen verzerren QPS und Concurrency – Ressourcenbewertung und Autoscaling extrem schwer. DCGM-Metriken spiegeln „Speicherbelegung“ oft nicht treffend wider.
- **Scheduling- und Skalierungsverzögerung:** Von Metrik bis Container-Start und Modellladen mehrere Minuten – Ressourcen oft erst nach Traffic-Peak bereit.

### Technologietrends: Verfeinerung, Automatisierung, Full-Stack

![KubeCon China 2025 HAMi team photo with attendees](/images/blog/kubecon-china-2025/p3.jpg)

Die Community sucht Durchbrüche auf mehreren Ebenen:

**Kubernetes als Kern der KI-Infrastruktur:** Kubespray auf Bare Metal oder Operatoren (z. B. Vivos KubeOps) – K8s als einheitliche, portable, hochverfügbare Basis.

**Verfeinerung und Virtualisierung des GPU-Managements:**

- *Hardware:* MIG und MPS als NVIDIA-Partitionierung für Training bzw. Inferenz.
- *Software:* API-Interception mainstream. HAMis CUDA-Interception für harte Isolation; neue Ansätze auf Python-Ebene (PyTorch/TensorFlow) – flexibler, hardwareagnostischer.

**Intelligentes Scheduling und Orchestrierung:**

- *Batch & Gang Scheduling:* Volcano und Gang Scheduling gegen Fragmentierung, kürzere Wartezeiten.
- *LLM-Orchestrierung:* P/D-Trennung braucht Role Group Orchestration, Topologie-Bewusstsein.

**Full-Stack für LLM-Inferenz:**

AIBrix zeigt Full-Stack-Optimierung: KVCache Offloading, TTFT, TPOT via P/D, AIGateway-Routing, LoRA-Dichte für Fine-Tunes.

### Ausblick: Integration, Vereinfachung, Offenheit

![KubeCon China 2025 HAMi project presentation](/images/blog/kubecon-china-2025/p4.jpg)

- **„Less is More“:** Tools wie Kubespray straffen Funktionen, standardisierte K8s-Cluster.
- **Tiefe Cloud-Native-Integration:** KI-Infrastruktur mit Envoy, vLLM usw.
- **Hardware-Diversität:** Nicht-NVIDIA-GPUs, Abstraktion und flexible Virtualisierung.
- **Reaktiv → proaktiv:** Vorhersagebasiertes Autoscaling für LLM-Bursts.

## Fazit

KubeCon China 2025 war ein Ideenfest und ein Meilenstein für Dynamia AI und die HAMi-Community.

Im Austausch mit globalen Entwicklern und Technologietrends sind wir überzeugt: In AI Infra endet die Ära der Optimierung einzelner Kettenglieder – Erfolg liegt in Full-Stack-Optimierung.

HAMi hat tiefes Know-how in GPU-Sharing und -Scheduling, das ist nur der Anfang. Für den AI-Infra-Marathon müssen Barrieren fallen und ein breiteres Ökosystem einbezogen werden.

Wir werden proaktiv mit Up- und Downstream-Projekten kooperieren und mit der Cloud-Native-Community End-to-End-Lösungen von Ressourcen über Infrastruktur bis Anwendungen liefern – HAMis Weg und Dynamia AIs Einladung an alle Partner.

---

*Mehr zum HAMi-Projekt: [GitHub-Repository](https://github.com/Project-HAMi/HAMi) oder [Slack-Community](https://cloud-native.slack.com/archives/C07T10BU4R2).*