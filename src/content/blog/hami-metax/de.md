---
title: '[Deep Dive] HAMi × MetaX | sGPU-Sharing, dreistufige QoS, topologiebewusstes Scheduling und vollständige WebUI-Unterstützung'
coverTitle: sGPU-Sharing, dreistufige QoS, topologiebewusstes Scheduling und WebUI
date: '2025-10-13'
excerpt: >-
  HAMi v2.7.0 integriert sich tief mit MetaX und liefert eine einheitliche
  Scheduling-Lösung mit sGPU-Sharing, dreistufiger QoS, topologiebewusstem
  Scheduling und WebUI. Dieser Artikel untersucht die Kernimplementierung von
  Features bis Code.
author: Dynamia
tags:
  - HAMi
  - MetaX
  - sGPU
  - GPU-Sharing
  - QoS
  - Topologiebewusstes Scheduling
  - WebUI
  - MetaXLink
  - DevicePlugin
  - binpack
  - spread
  - GPU-Virtualisierung
category: Integration & Ecosystem
coverImage: /images/blog/hami-MetaX/coverpage-Hami-MetaX-en.png
linktitle: HAMi-Unterstützung für MetaX-GPU
---


Kürzlich arbeiteten das Dynamia- und das MetaX-Team eng zusammen und brachten auf Basis der XiCloud C-Series in HAMi v2.7.0 eine einheitliche Scheduling-Lösung. Durch tiefe Integration: sGPU-Sharing, dreistufige QoS, topologiebewusstes Scheduling und vollständige WebUI. Ziel: deutlich höhere Ressourcennutzung und Job-Effizienz bei großflächigem KI-Training und -Inferenz sowie solide Basis für eine kontrollierbare inländische KI-Compute-Grundlage.

HAMi v2.7.0 bietet ein einheitliches Scheduling für MetaX-GPUs. Nach einer Feature-Übersicht vertieft dieser Artikel Code und konkretes Design sowie Implementierung für MetaX-sGPU-Sharing, topologiebewusstes Scheduling, QoS und verwandte Fähigkeiten.

## 1. Überblick Kernfähigkeiten

HAMi liefert einen vollständigen Stack aus Virtualisierung und Scheduling-Optimierung für MetaX-GPUs. Kernelemente:

1. **GPU-Sharing (sGPU) und Ressourcenisolation:** Mehrere Container-Jobs teilen eine physische GPU; präzise Limits für Speicher (z. B. 4G) und Compute-Kernanteil (vcore, z. B. 60 %) — deutlich höhere Auslastung.
2. **sGPU topologiebewusstes Scheduling:** (Neu in v2.7.0) Bei Multi-GPU-Servern versteht der Scheduler Interconnect-Topologie (MetaXLink, PCIe Switch) und wählt bevorzugt die höchstbandbreitige GPU-Kombination für Multi-GPU-sGPU-Jobs.
3. **Quality of Service (QoS):** (Neu in v2.7.0) sGPU-Jobs mit BestEffort, FixedShare und BurstShare für unterschiedliche Geschäftsanforderungen.
4. **Health Checks und Monitoring:** (Neu in v2.7.0) Geräte-Health-Checks; MetaX-Monitoring end-to-end in HAMi-WebUI — heterogene Metriken und Cluster-Ressourcennutzung visualisieren.
5. **GPU topologiebewusstes Scheduling:** Anhand vom DevicePlugin vorab berechneter Scores erhalten Multi-GPU-Jobs bevorzugt höchstbandbreitige Kombinationen; `binpack`- und `spread`-Policies für feinere Platzierung.

## 2. sGPU topologiebewusstes Scheduling: intelligente Auswahl

Bei mehreren GPUs pro Server haben Kartenpaare je nach gemeinsamem PCIe-Switch oder MetaXLink nahe/ferne (hohe/niedrige Bandbreite) Beziehungen. Alle Karten bilden die Topologie wie unten:
![MetaX GPU topology relationship diagram](/images/blog/hami-MetaX/im1.png)

HAMis Topologieauswahl für MetaX-GPUs ist für exklusive Multi-GPU-Jobs gedacht. Auslöser: Ressource `metax-tech.com/sgpu` ohne `vcore` (Standard 100). Ziel: Job in einer Hochgeschwindigkeits-Interconnect-„Gruppe“ halten und Kommunikation maximieren.

Kernidee: **zweistufiger Entscheidungsmechanismus aus Knoten-interner „Priorität“ und knotenübergreifendem „quantitativem Scoring“.**

Zuerst wählen **deterministische Prioritätsregeln** pro Knoten die beste GPU-Kombination, bevorzugt aus einer linkZone.

Dann bewertet eine **Scoring-Formel aus „Allokationsqualität“ und „Topologieverlust“** Kandidatenknoten für aktuellen Job und künftiges Cluster-Layout.

### Stufe 1: Geräteauswahl im Knoten — deterministisch, regelbasiert

Ziel: topologisch optimale GPU-Kombination im Knoten — Entscheidungsbaum mit Prioritäten, kein Scoring-Wettbewerb.

#### Ablaufdetails

1. Eingabe: alle Kandidaten-GPUs auf dem Knoten, die Pod-Anforderungen (Speicher, Compute usw.) erfüllen.
2. Gruppierung nach linkZone-ID (Hochgeschwindigkeits-Interconnect-Domäne).
3. Entscheidungsbaum in dieser Prioritätsreihenfolge:
   - Erste Priorität (beste: eine Domäne): Genügt eine linkZone-Gruppe für den gesamten Job?
   - Zweite Priorität: Domänenübergreifend GPUs aus linkZones anhängen, bis die Anzahl erreicht ist.
   - Dritte Priorität: Rest mit GPUs ohne linkZone-Information füllen.

**Kern Stufe 1:** Mit Prioritätsregeln die theoretisch beste Kommunikations-Kombination im Knoten effizient festlegen.

Implementierung: `prioritizeExclusiveDevices` in `pkg/device/metax/sdevice.go`.
Kern: bevorzugt Kombinationen, die in einer `linkZone` erfüllbar sind.

```go
// File: pkg/device/metax/sdevice.go

func prioritizeExclusiveDevices(candidateDevices device.ContainerDevices, require int) device.ContainerDevices {
        // ... (code groups all candidate GPUs by linkZone) ...
        // linkDevices: stores all device groups that have a linkZone
        // otherDevices: stores all devices without a linkZone

        // 1. pickup devices within MetaLink (first priority)
        for _, devices := range linkDevices {
                if len(devices) >= require {
                        klog.V(5).Infof("prioritize exclusive devices: best result, within metalink")
                        return devices[0:require] // One linkZone satisfies the full request — return immediately as the best result
                }
        }

        prioritizeDevices := device.ContainerDevices{}

        // 2. pickup devices cross MetaLink (second priority)
        // ... (if a single linkZone is not enough, gather devices across linkZones) ...

        // 3. if not satisfied, pick up devices no MetaLink (third priority)
        // ... (fill remaining slots from otherDevices) ...

        return ... 
}
```

**Designbegründung:** Regelbasiert statt alle `C(n, k)` zu scoren. Konsens: Kommunikation innerhalb einer Domäne ist deutlich besser. Gefundenes Optimum (Priorität 1) beendet die Suche — höhere Scheduling-Effizienz.
![MetaX device priority selection flowchart](/images/blog/hami-MetaX/im2-en.png)

### Stufe 2: Knotenübergreifendes Scoring — vorausschauend

Mehrere Knoten bestehen Stufe 1 — der Scheduler wählt per quantitativem Scoring.

 **Scoring-Details**

Implementierung: `scoreExclusiveDevices` in `pkg/device/metax/sdevice.go`:

```go
// File: pkg/device/metax/sdevice.go

func scoreExclusiveDevices(podDevices device.PodSingleDevice, previous []*device.DeviceUsage) int {
        // ... (code builds allocatedDevices, availableDevices, restDevices lists) ...

        // Compute three core scores
        availableScore := availableDevices.Score() // Total score before allocation
        allocatedScore := allocatedDevices.Score() // Score of the allocated combination
        restScore := restDevices.Score()         // Score of remaining devices

        // Compute topology loss score
        lossScore := availableScore - allocatedScore - restScore

        // Compute final score, amplifying the weight of allocatedScore
        result := 10*allocatedScore - lossScore
        klog.V(5).Infof("calcScore result[%d] >>> availableScore[%d], allocatedScore[%d], restScore[%d], lossScore[%d]",
                result, availableScore, allocatedScore, restScore, lossScore)

        return result
}
```

Jeder Kandidatenknoten erhält eine Endnote; höchste gewinnt. Formel:

Endscore = (10 * allocatedScore) - lossScore

Aufschlüsselung:

1. allocatedScore (Allokationsqualität): Wie eng die gewählte Kombination vernetzt ist. Mehr Paare in derselben linkZone → höherer Score. `10 * allocatedScore` priorisiert Qualität für den aktuellen Job.
2. lossScore (Topologieverlust / Fragmentierung): „Wie stark wurde die topologische Integrität der verbleibenden GPUs beschädigt?“

- Berechnung: lossScore = (Score vor Allokation) − (Allokierte Kombination) − (Restgeräte)
- Der Scheduler bestraft fragmentierende Allokationen und schützt Topologie-Ressourcen für künftige große Jobs.

**Fazit Stufe 1+2:** Prioritätsregeln pro Knoten, dann globales Scoring zwischen „Jetzt“ und „Langfristig“.
![MetaX two-stage topology scheduling architecture](/images/blog/hami-MetaX/im3-en.png)

## 3. Quality of Service (QoS): Isolation durch „Gleichtyp-Aggregation“

HAMi v2.7.0 bietet drei QoS-Richtlinien für MetaX-sGPU:

1. BestEffort: Standard. Best-Effort-Zuteilung zur Maximierung der Auslastung.
2. FixedShare: Garantiert vcore und vmemory stabil, unabhängig von anderen Jobs.
3. BurstShare: Grundanteil plus Nutzung freier GPU-Kapazität — für bursty Workloads.

### Designüberlegungen

In geteilten Umgebungen ist Isolation verschiedener Service-Level schwer. Statt dynamischer Preemption im Treiber: **physische Gruppierung beim Scheduling-Einstieg**. Verschiedene QoS-Typen landen nie auf derselben physischen Karte — Isolation an der Wurzel.

### Kernprinzip und Code

Kern: `checkDeviceQos`, in einem Satz:

**Landet der erste Job auf einer GPU, akzeptiert die Karte nur noch Jobs desselben QoS-Typs.**

Die „Identität“ einer GPU wird beim ersten Pod gesetzt.

- Erster Pod FixedShare → nur noch FixedShare.
- Erster Pod BestEffort → nur noch BestEffort.

Pods mit passender QoS-Annotation werden akzeptiert, sonst Scheduling-Ablehnung. Logik:

1. **GPU leer?** Jeder QoS-Job darf starten und setzt den Modus.
2. **QoS passt?** Neue Annotation **muss exakt** dem bestehenden Modus entsprechen.
3. **Exklusiv-Ausnahme:** 100 % Compute teilt nicht — Regel gilt nicht.
![MetaX QoS same-type aggregation isolation flowchart](/images/blog/hami-MetaX/p3-en.png)

```go
// file: pkg/device/metax/sdevice.go
// func: checkDeviceQos (simplified logic)

func (sdev *MetaxSDevices) checkDeviceQos(reqQos string, usage device.DeviceUsage, request device.ContainerDeviceRequest) bool {
        if usage.Used == 0 { // Idle card
                return true
        }

        if request.Coresreq == 100 { // Exclusive card
                return true
        }

    // ... obtain devQos ...
        if devQos == "" || reqQos == devQos { // Core matching rule
                return true
        } else {
                return false
        }
}
```

„Gleichtyp-Aggregation“ bildet logische QoS-Pools — manche Karten nur FixedShare, andere nur BestEffort.

![MetaX QoS resource pool auto-grouping diagram](/images/blog/hami-MetaX/p4-en.png)

## 4. WebUI-Unterstützung

Die WebUI unterstützt MetaX-GPU-Monitoring vollständig — intuitive Ressourcenübersicht.
![HAMi WebUI MetaX GPU monitoring dashboard](/images/blog/hami-MetaX/p5.png)

## 5. Knoten-Scheduling: Binpack und Spread

Bei `metax-tech.com/gpu` beeinflussen HAMis binpack/spread-Policies das Scheduling durch passive Nutzung statischer Scores.

Das MetaX DevicePlugin berechnet Scores und schreibt sie in Knoten-Annotations; der Scheduler liest sie ohne Echtzeit-Topologie-Rechnung.

- **`spread`-Modus:** Liest `metax-tech.com/gpu.topology.scores`. Invertierung `score = 2000 - score` passt zu HAMi „niedrigerer Score zuerst“ — beste Topologie-Knoten bevorzugt.
- **`binpack`-Modus:** Liest `metax-tech.com/gpu.topology.losses`. Niedrigerer `loss` → höherer Score (`2000 - loss`) — Resttopologie möglichst intakt.

Kern-Code in `pkg/device/metax/device.go`:

```go
// File: pkg/device/metax/device.go

func (dev *MetaxDevices) ScoreNode(...) float32 {
        res := float32(0)
        if policy == string(util.NodeSchedulerPolicyBinpack) {
                lossAnno, ok := node.Annotations[MetaxAnnotationLoss]
                if ok {
                        loss := parseMetaxAnnos(lossAnno, sum)
                        res = 2000 - loss
                }
        } else if policy == string(util.NodeSchedulerPolicySpread) {
                scoreAnno, ok := node.Annotations[MetaxAnnotationScore]
                if ok {
                        score := parseMetaxAnnos(scoreAnno, sum)
                        res = 2000 - score
                }
        }
        return res
}
```

>MetaXLink hat Vorrang vor PCIe Switch, in zwei Bedeutungen:
>
>1. Haben zwei Karten MetaXLink und PCIe Switch, gelten sie als MetaXLink-verbunden;
>2. Können MetaXLink- und PCIe-Switch-Ressourcen einen Job bedienen, werden MetaXLink-Ressourcen zugeteilt.
>
- Bei `node-scheduler-policy=spread` liegen zugewiesene GPUs möglichst unter demselben MetaXLink oder PCIe Switch:

![MetaX topology-aware scheduling Spread policy diagram](/images/blog/hami-MetaX/p1.png)

- Bei `node-scheduler-policy=binpack` bleiben Restressourcen möglichst intakt:

![MetaX topology-aware scheduling Binpack policy diagram](/images/blog/hami-MetaX/p2.png)

## 6. Nutzung

### Topologiebewusstes Scheduling

Steuerung von `binpack` oder `spread` über Annotation `hami.io/node-scheduler-policy`.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: gpu-pod2
  annotations: 
    # binpack policy: for 'gpu' resources, the scheduler reads the node annotation 'metax-tech.com/gpu.topology.losses'.
    # Scoring uses `2000 - loss`, so nodes with lower loss score higher and are preferred, keeping remaining topology as intact as possible.
    hami.io/node-scheduler-policy: "binpack" 
spec:
  containers:
    - name: ubuntu-container
      resources:
        limits:
          metax-tech.com/gpu: 2

apiVersion: v1
kind: Pod
metadata:
  name: gpu-pod3
  annotations: 
    # spread policy: for 'gpu' resources, the scheduler reads the node annotation 'metax-tech.com/gpu.topology.scores'.
    # Scoring uses `2000 - score`. Combined with HAMi's spread logic, this prefers nodes with lower final scores (i.e., higher score annotation values) — the best topology nodes.
    hami.io/node-scheduler-policy: "spread"
spec:
# ...
```

#### sGPU topologiebewusstes Scheduling

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: gpu-pod1
  annotations:
    metax-tech.com/sgpu-topology-aware: "true" # Enable topology-aware scheduling
spec:
  containers:
    - name: ubuntu-container
      resources:
        limits:
          # Request 4 full GPUs. Because vcore is unspecified, it defaults to 100, triggering exclusive mode and topology awareness
          metax-tech.com/sgpu: 4
# ...
```

#### sGPU Sharing and QoS Policies

QoS über Annotation `metax-tech.com/sgpu-qos-policy`.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: gpu-pod
  annotations:
    metax-tech.com/sgpu-qos-policy: "fixed-share" # or "best-effort", "burst-share"
spec:
  containers:
    - name: ubuntu-container
      resources:
        limits:
          metax-tech.com/sgpu: 1
          metax-tech.com/vcore: 60
          metax-tech.com/vmemory: 4
```

## 7. Zusammenfassung

HAMis MetaX-Unterstützung verfolgt klare Ingenieursprinzipien: Peak auf kritischen Pfaden, Vereinfachung sonst. Zweistufiges Topologie-Scheduling balanciert aktuellen Job und Cluster-Gesundheit; QoS durch Gleichtyp-Aggregation mit geringer Komplexität — reife GPU-Scheduling- und Sharing-Lösung.

Die Zusammenarbeit von HAMi und MetaX ist ein Modell für Co-Innovation zwischen Community-Open-Source und Hardware-Anbietern und stärkt das inländische KI-Ökosystem.

---

## Referenzen

- **Dokumentation**: [MetaX-GPU-Unterstützung](https://github.com/Project-HAMi/HAMi/blob/master/docs/metax-support_cn.md)
- **Beispiele**: [MetaX-GPU-Beispiele](https://github.com/Project-HAMi/HAMi/tree/master/examples/metax)
  - [https://github.com/Project-HAMi/HAMi/pull/1123](https://github.com/Project-HAMi/HAMi/pull/1123)
  - [https://github.com/Project-HAMi/HAMi/pull/1193](https://github.com/Project-HAMi/HAMi/pull/1193)
  - [https://github.com/Project-HAMi/HAMi/pull/1295](https://github.com/Project-HAMi/HAMi/pull/1295)
  - [https://github.com/Project-HAMi/HAMi-WebUI/pull/46](https://github.com/Project-HAMi/HAMi-WebUI/pull/46)

Herzlichen Dank an @Kyrie336 und @darker-thanBlack! Besonderer Dank an das **MetaX-Team** für tiefe Mitgestaltung und nahtlose Zusammenarbeit mit Dynamia (HAMi-Maintainer-Team).

---

## Über MetaX

MetaX entwickelt eigenständig Full-Stack-Hochleistungs-GPUs und Computing-Plattformen für intelligente und allgemeine Compute, Cloud-Rendering und weitere Bereiche.

## Über Dynamia

Dynamia baut globale Lösungen für heterogenes Compute-Scheduling und einheitliches Management. Das CNCF-Projekt HAMi ist das einzige Open-Source-Projekt mit Fokus auf heterogene Compute-Virtualisierung — flexible, zuverlässige, bedarfsgerechte GPU-Virtualisierung für höhere Auslastung im KI-Zeitalter.
