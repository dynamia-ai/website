---
title: 'Dynamia × Qingcheng Jizhi: Integrierte „Scheduling + Infrastruktur“-Lösung für unternehmerische Großmodellanwendungen'
linktitle: Dynamia × Qingcheng Jizhi Partnerschaft
date: '2026-01-13'
excerpt: Kürzlich kündigten Dynamia und Qingcheng Jizhi in Peking eine strategische Partnerschaft an und adressieren die Effizienzherausforderungen heterogenen Compute-Schedulings in der KI-Branche mit einer integrierten „Scheduling + Infrastruktur“-Lösung für unternehmerische Großmodellanwendungen.
author: Dynamia
tags:
  - Strategic Partnership
  - Qingcheng Jizhi
  - Bagualu
  - Heterogenes Computing
  - HAMi
category: Company News
coverImage: >-
  /images/blog/dynamia-qingcheng-partnership/dynamia-qingcheng-signing-ceremony.webp
---

> Als aktives Open-Source-Projekt wird HAMi von über 350 Mitwirkenden aus mehr als 15 Ländern gepflegt, ist in über 200 Unternehmen und Institutionen in Produktion im Einsatz und bietet starke Erweiterbarkeit sowie Support-Sicherheit.

Kürzlich kündigten Dynamia und Qingcheng Jizhi in Peking eine strategische Partnerschaft an und veröffentlichten die ersten gemeinsamen Ergebnisse.

Die tiefe Zusammenarbeit zielt auf die schwierigen Effizienzprobleme heterogenen Compute-Schedulings in der heutigen KI-Industrie und liefert eine integrierte **„Scheduling + Infrastruktur“**-Lösung für unternehmerische Großmodellanwendungen. Das von Dynamia initiierte und geführte CNCF-Projekt HAMi dient als zentrale Scheduling-Schicht mit heterogener GPU-Virtualisierung und Ressourcengovernance.

![Zeremonie zur Unterzeichnung der strategischen Partnerschaft](/images/blog/dynamia-qingcheng-partnership/dynamia-qingcheng-signing-ceremony.webp)

Unterzeichnungszeremonie der strategischen Partnerschaft beider Parteien in Peking

## Branchenschmerzpunkt: verschwendete Rechenressourcen

Getrieben von Post-Moore-Ära und KI-Boom sind heterogene Beschleuniger wie GPUs und NPUs zentraler Treibstoff der KI-Entwicklung. In der Praxis zeigen sich Rechenprobleme oft nicht als „ob Rechenleistung vorhanden ist“, sondern wie sie genutzt wird: Inferenzlast schwankt stark; **GPU-Ressourcen sind ungleich ausgelastet und stark fragmentiert**; die Zuteilung ist ungleichmäßig; Service-Stabilität und betriebliche Steuerung sind schwer in Balance zu bringen. Das senkt die Compute-Effizienz und erhöht die Gesamtkosten von Großmodellanwendungen.

![Verschwendung von Rechenressourcen](/images/blog/dynamia-qingcheng-partnership/compute-resource-waste-problem.webp)

„Das Compute-Problem ist nicht mehr ‚haben wir es‘, sondern ‚nutzen wir es gut‘“, sagte He Wanqing, VP Technical Ecology bei Qingcheng Jizhi. „Wenn Unternehmen komplexe Deployments von k Geschäftstypen × m Modellen × n KI-Beschleunigerkarten sehen, reicht End-to-End-Optimierung allein nicht, um die Effizienzblockade zu lösen.“

## Erste Ergebnisse: multiplizierte Compute-Effizienz

Auf Basis dieses Verständnisses der Branchenschmerzpunkte haben beide Parteien die erste Integrationsrunde abgeschlossen. **Qingchengs Bagualu-Intelligent-Software-Stack hat Dynamias HAMi-vGPU-Virtualisierung und Scheduling-System integriert** – mit klaren Synergieeffekten:

**Sprung bei der Ressourcennutzung** (HAMis Kernfähigkeit): Durch HAMis harte GPU-Speicherisolation und proportionale Compute-Zuteilung kann eine physische GPU flexibel in mehrere virtuelle Ressourcen zerlegt werden. In Kombination mit Bagualus Multi-Workload-Management ermöglicht das feingranulare Konfiguration und adressiert ungleiche Ressourcenverteilung.

**Sichtbarkeit über den gesamten Betrieb**: Nutzer verwalten Training, Inferenz und Quantisierung von einer Plattform aus und überwachen in Echtzeit Workload, Kernel-Scheduling und GPU-Speichernutzung.

**Durchbruch bei domestic Compute-Adaption**: Auf Qingcheng Jizhis tiefe Anpassung für Ascend, Hygon und andere inländische Chips aufbauend und kombiniert mit HAMis Cross-Hardware-Scheduling ermöglichen beide Parteien einheitliches Management multi-architektur Compute-Pools und durchbrechen „Scheduling-Barrieren durch Hardware-Fragmentierung“.

![HAMi vGPU-Virtualisierung und Scheduling im Bagualu Intelligent Software Stack](/images/blog/dynamia-qingcheng-partnership/bagualu-stack-hami-vgpu-integration.webp)

HAMi-vGPU-Virtualisierung und Scheduling im Bagualu Intelligent Software Stack

Über die laufende Zusammenarbeit bei GPU-Virtualisierung und Großmodell-Trainings- und Inferenz-Infrastruktur vertiefen beide Parteien Kooperation in Produktkollaboration, Plattformintegration und Szenarioerweiterung und bauen ein eng abgestimmtes System „Bagualu-Anwendungsschicht + Scheduling-Schicht + Infrastrukturschicht“:

Dynamia arbeitet mit Qingchengs Bagualu-Intelligent-Computing-Software-Stack – parallelem Großmodell-Trainingssystem, Chitu-Inferenz-Engine und AI Ping – zusammen, damit Dynamia-Nutzer Großmodell-Compute unter einer einheitlichen Scheduling-Plattform effizienter nutzen. Qingcheng Jizhi integriert Bagualu-Plattformdienste mit Dynamias Compute-Scheduling und GPU-Virtualisierung, liefert KI-Infrastruktur-Support und erweitert die Service-Reichweite in Großmodell-Trainingsszenarien. Auf der GPU-Monitoring- und Management-Schicht ergänzen Dynamias feingranulare Monitoring-Daten Qingchengs Plattformfähigkeiten und bieten eine klarere Datenbasis für Betrieb und Skalierung von Compute-Clustern.

Beide Parteien sind überzeugt: Mit wachsendem Compute-Maßstab kann eine einzelne Schicht komplexe KI-Szenarien nicht mehr allein tragen. Engere Zusammenarbeit zwischen Compute-Scheduling-Schicht und KI-Infrastrukturschicht hilft, ein nachhaltigeres Compute-Nutzungsmodell aufzubauen und solide Compute-Unterstützung für die langfristige Entwicklung von Großmodellanwendungen zu schaffen. Qingcheng Jizhi und Dynamia arbeiten gemeinsam daran, Rechenressourcen von „statischer Zuteilung“ zu „dynamischem Scheduling“ zu bewegen, ohne die Nutzerkomplexität stark zu erhöhen, damit Großmodell-Fähigkeiten geschäftliche Anforderungen stabiler und flexibler bedienen. **Künftig wird Dynamia die Zusammenarbeit zwischen HAMi und weiteren KI-Plattformen, Infrastrukturanbietern und Compute-Ökosystem-Partnern vorantreiben und heterogenes Compute-Scheduling in mehr reale Produktionsszenarien bringen.**

---

### Über Dynamia

Dynamia liefert globale Lösungen für heterogenes Compute-Scheduling und einheitliches Management und steigert die Compute-Effizienz im KI-Zeitalter. Es initiierte und leitet das CNCF-Projekt HAMi – derzeit das einzige Open-Source-Projekt der Branche mit Fokus auf heterogenes GPU-Ressourcen-Sharing. Durch flexible, zuverlässige, bedarfsorientierte und elastische GPU-Virtualisierung verbessert HAMi die Ressourcennutzung und kann plug-in-fähig, leichtgewichtig und nicht-invasiv in Public-, Private- oder Hybrid-Cloud-Umgebungen eingesetzt werden. Unterstützt werden heterogene Chips inklusive NVIDIA, Ascend, MetaX, Cambricon, Hygon, Moore Threads, Iluvatar CoreX, Enflame, Kunlunxin und AWS. HAMi hat 350 Mitwirkende aus 16 Ländern und wurde von über 200 OS-Anbietern, Compute-Cloud-Providern und Branchenkunden übernommen – mit 0-zu-1-Adoption in Finanz, Logistik, autonomes Fahren, Robotik und Biotech.

### Über Qingcheng Jizhi

Qingcheng Jizhi ist ein Tsinghua-verbundenes AI-Infra-Unternehmen mit Fokus auf intelligentes Compute-Systemsoftware. Das Produktportfolio umfasst Großmodell-Training, Inferenz und Service-Evaluation: das „Bagualu“-Trainingssystem für paralleles Großmodell-Training auf heterogenen Clustern; die Chitu-Inferenz-Engine für leistungsstarke, kostengünstige Inferenz mit Optimierungen wie FP8/FP4; AI Ping für Großmodell-API-Evaluation und One-Stop-Aufruf.