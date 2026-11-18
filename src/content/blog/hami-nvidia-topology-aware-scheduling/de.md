---
title: 'Deep Dive: HAMi × NVIDIA | Implementierung topologiebewussten GPU-Schedulings'
coverTitle: 'Deep Dive: HAMi × NVIDIA | Implementierung topologiebewussten GPU-Schedulings'
date: '2025-10-22'
excerpt: >-
  HAMi v2.7.0 führt topologiebewusstes Scheduling für NVIDIA-GPUs ein. Dieser
  Artikel analysiert im Code Design und Implementierungsprinzipien von HAMi für
  topologiebewusstes Scheduling und erklärt, wie intelligente Platzierung
  Rechenaufgaben auf die am engsten verbundenen GPU-Kombinationen legt.
author: Dynamia AI Team
tags:
  - HAMi
  - NVIDIA
  - GPU-Topologie
  - Scheduling
  - Deep Dive
  - Technische Analyse
  - NVLink
  - PCIe
  - Kubernetes
category: Technical Deep Dive
coverImage: /images/blog/hami-nvidia-topology/cover-en.png
linktitle: NVIDIA Topologie-Scheduling
---

Die HAMi-Community veröffentlichte in v2.7.0 offiziell **topologiebewusstes Scheduling** für NVIDIA-GPUs. Die Funktion adressiert Multi-GPU-Kommunikationsengpässe in HPC und groß angelegtem KI-Training. Durch intelligente Platzierung werden Rechenaufgaben auf GPU-Kombinationen mit den engsten physischen Verbindungen und höchster Kommunikationsgeschwindigkeit gelegt — für maximale Beschleunigung und bessere Cluster-Effizienz.

Aufbauend auf der Feature-Einführung geht dieser Artikel tief in die Code-Implementierung und analysiert HAMis konkretes Design für NVIDIA-GPU-Topologie-Scheduling.

## 1. Kernfunktionen im Überblick

1. **Dynamische Topologie-Score-Berechnung:** Das Device Plugin ermittelt per NVML dynamisch die physische Verbindungstopologie zwischen GPUs auf einem Knoten (z. B. NVLink, PCIe) und quantifiziert sie als „Kommunikations-Scores“ zwischen Geräten — Grundlage für Scheduling-Entscheidungen.
2. **Dual-Strategie gegen Fragmentierung:** Die `Fit`-Funktion enthält einen vorausschauenden Optimierungsalgorithmus. Für Multi-GPU- und Single-GPU-Aufgaben wendet sie automatisch „Best-Fit“- und „Minimal-Disruption“-Strategien an, um die langfristige Gesundheit der Cluster-Topologie-Ressourcen zu schützen.

## 2. Kernprinzipien

HAMis topologiebewusstes NVIDIA-GPU-Scheduling folgt einer klaren Philosophie: Lokal auf dem Knoten die komplexe physische Topologie präzise als „Kommunikations-Scores“ quantifizieren; bei Scheduling-Entscheidungen darauf die optimale Wahl treffen.

![Architektur topologiebewussten Schedulings](/images/blog/hami-nvidia-topology/1761119583763.png)

Der Kern gliedert sich in zwei Phasen: „Topologie-Registrierung“ und „Scheduling-Entscheidung“:

### Phase 1: Topologie-Registrierung — Physische Topologie quantifizieren

Ziel: Unsichtbare GPU-Verbindungen auf einem Knoten in standardisierte numerische Scores übersetzen, die die Scheduling-Logik versteht.

1. **Informationssondierung:** Auf jedem GPU-Knoten ermittelt das Device Plugin per NVIDIA NVML den physischen Verbindungstyp (NVLink oder PCIe) zwischen allen GPU-Paaren.
2. **Datenmodellierung und Quantifizierung:** Die Ergebnisse werden nicht nur in eine einfache Verbindungsmatrix gegossen, sondern in einem verfeinerten Zweischritt:
   - **Topologie-Graph aufbauen:** Im Speicher entsteht ein vollständiger GPU-Topologie-Graph mit detaillierten Verbindungsinformationen.
   - **In Scores quantifizieren:** Der Algorithmus traversiert den Graph und wandelt Verbindungen nach festen Regeln in Scores um (z. B. `SingleNVLINKLink` 100 Punkte, `P2PLinkCrossCPU` 10 Punkte).
3. **Endprodukt — Geräte-Score-Tabelle:** Die Tabelle enthält jede GPU-UUID und Kommunikations-Scores zu allen anderen GPUs und wird in der Knoten-Annotation registriert.

### Phase 2: Scheduling-Entscheidung — Optimale Lösung intelligent wählen

Erhält der Scheduler eine Aufgabe, übergibt er die Frage „welche Geräte“ zusammen mit der „Geräte-Score-Tabelle“ an die geräteseitige `Fit`-Funktion.

1. **Filterung:** `Fit` filtert zuerst GPUs heraus, die grundlegende Ressourcenanforderungen (Speicher, Rechenleistung) nicht erfüllen.
2. **Bewertung und Optimierung:** Basierend auf der Score-Tabelle führt `Fit` den eingebauten Optimierungsalgorithmus mit „Best-Fit“ und „Minimal-Disruption“ aus, berechnet die optimale Kombination unter allen geeigneten GPUs und gibt das Ergebnis an den Scheduler zurück.

## 3. Implementierungsprinzipien: Code-Analyse

### 1. Topologie-Erkennung und Score-Berechnung

Erkennung und Quantifizierung sind die Grundlage aller intelligenten Entscheidungen. Der gesamte Prozess läuft lokal im Device Plugin und erzeugt eine meldbare Score-Tabelle.

#### Topologie-Graph aufbauen (`build()`-Funktion)

Diese Logik steht in `pkg/device/nvidia/calculate_score.go` in der `build()`-Funktion:

- **Geräteliste initialisieren:** Eine `DeviceList`, in der jedes `Device` eine leere `Links`-Map (`map[int][]P2PLink`) hat.
- **Traversieren und füllen:** Doppelschleife über alle GPU-Paare (`d1`, `d2`), Aufruf von `GetP2PLink` und `GetNVLink` (in `links.go`).
- **Verbindungen aggregieren:** Alle erkannten Verbindungen (PCIe und NVLink) als `P2PLink` in die `Links`-Map — vollständiger Topologie-Graph im Speicher.

#### In Scores quantifizieren (`calculateGPUPairScore()`-Funktion)

Nach dem Graph-Aufbau ruft `calculateGPUScore` `calculateGPUPairScore` auf.

Die Funktion prüft alle Verbindungen zwischen zwei GPUs und bewertet sie per `switch`, z. B. `P2PLinkSameBoard` 60 Punkte, `SingleNVLINKLink` 100 Punkte, `TwoNVLINKLinks` 200 Punkte. Der Endscore ist die Summe aller Verbindungs-Scores.

```go
// File: pkg/device/nvidia/calculate_score.go

func (o *deviceListBuilder) build() (DeviceList, error) {
        // ...
        // 1. Initialize a flat DeviceList
        var devices DeviceList
        for i, d := range nvmlDevices {
                // ... create device object ...
                devices = append(devices, device)
        }

        // 2. Traverse and populate Links map
        for i, d1 := range nvmlDevices {
                for j, d2 := range nvmlDevices {
                        if i != j {
                                // Get and append P2P Link info
                                p2plink, _ := GetP2PLink(d1, d2)
                                devices[i].Links[j] = append(devices[i].Links[j], P2PLink{devices[j], p2plink})
  
                                // Get and append NVLink info
                                nvlink, _ := GetNVLink(d1, d2)
                                devices[i].Links[j] = append(devices[i].Links[j], P2PLink{devices[j], nvlink})
                        }
                }
        }
        return devices, nil
}

func calculateGPUPairScore(gpu0 *Device, gpu1 *Device) int {
        score := 0
        for _, link := range gpu0.Links[gpu1.Index] {
                switch link.Type {
                case P2PLinkCrossCPU: score += 10
                // ... (etc) ...
                case SingleNVLINKLink: score += 100
                // ... (etc) ...
                }
        }
        return score
}
```

### 2. Geräteseitige Scheduling-Entscheidung: Dual-Strategie-Topologie-Optimierung

Die Kernlogik liegt in der geräteseitigen `Fit()`-Funktion in `pkg/device/nvidia/device.go`. Erkennt sie per Annotation Topologie-Scheduling, wechselt sie die Optimierungsstrategie anhand der gemeldeten Score-Tabelle und der angeforderten GPU-Anzahl.

```go
// File: pkg/device/nvidia/device.go

func (nv *NvidiaGPUDevices) Fit(...) {
        // ...
        needTopology := util.GetGPUSchedulerPolicyByPod(device.GPUSchedulerPolicy, pod) == util.GPUSchedulerPolicyTopology.String()
        // ...
        // (Filter all idle GPUs meeting basic conditions: tmpDevs)
        // ...
        if needTopology {
                if len(tmpDevs[k.Type]) > int(originReq) {
                        if originReq == 1 {
                                // Single-GPU task
                                lowestDevices := computeWorstSignleCard(nodeInfo, request, tmpDevs)
                                tmpDevs[k.Type] = lowestDevices
                        } else {
                                // Multi-GPU task
                                combinations := generateCombinations(request, tmpDevs)
                                combination := computeBestCombination(nodeInfo, combinations)
                                tmpDevs[k.Type] = combination
                        }
                        return true, tmpDevs, ""
                }
        }
        // ...
}
```

Die Gesamtentscheidungslogik von `Fit` lässt sich im folgenden Diagramm zusammenfassen:

![Entscheidungsfluss der Fit-Funktion](/images/blog/hami-nvidia-topology/1761119754698.png)

#### Strategie 1: „Best-Fit“-Prinzip für Multi-GPU-Aufgaben

Fordert ein Pod mehr als eine GPU, sucht der Algorithmus die Kombination mit der höchsten internen Kommunikations-Score-Summe.

**Code:** `Fit` identifiziert freie GPUs mit grundlegenden Anforderungen, ruft `generateCombinations` für alle möglichen Kombinationen auf, dann `computeBestCombination`, das pro Kombination die Score-Summe aller Gerätepaare berechnet. Die Kombination mit dem höchsten Gesamtwert gewinnt.

![Multi-GPU Best Fit](/images/blog/hami-nvidia-topology/1761119764829.png)

#### Strategie 2: „Minimal-Disruption“-Prinzip für Single-GPU-Aufgaben

Bei nur einer GPU wählt der Algorithmus eine GPU mit den „entferntesten“ Verbindungen zu anderen verfügbaren GPUs, um die Topologie-Integrität zu schützen.

**Code:** `Fit` ruft `computeWorstSignleCard` auf, berechnet pro GPU die Score-Summe zu allen anderen verfügbaren GPUs und wählt die GPU mit dem niedrigsten Gesamtwert — meist am Rand der Topologie.

![Single-GPU Minimal Disruption](/images/blog/hami-nvidia-topology/1761119772158.png)

## 4. Nutzung

Eine Annotation genügt, um topologiebewusstes Scheduling zu aktivieren. Der Scheduler wendet je nach angeforderter GPU-Anzahl automatisch „Best-Fit“ oder „Minimal-Disruption“ an.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: gpu-topology-aware-job
  annotations:
    # Enable "topology-aware" scheduling policy.
    hami.io/gpu-scheduler-policy: "topology-aware"
    # The scheduler will automatically, based on communication scores between devices,
    # select the combination with the tightest internal connections for multi-GPU tasks,
    # or select the device causing minimal topology disruption for single-GPU tasks.
spec:
  containers:
  - name: cuda-container
    image: nvidia/cuda:11.6.2-base-ubuntu20.04
    command: ["sleep", "infinity"]
    resources:
      limits:
        # Request 4 GPUs
        nvidia.com/gpu: "4"
```

## 5. Zusammenfassung

HAMis topologiebewusstes NVIDIA-GPU-Scheduling verkörpert eine klare Engineering-Philosophie: **statische Konfiguration durch dynamische Erkennung ersetzen und kurzsichtige Zuteilung durch vorausschauende Entscheidungen.** Der geräteseitige Dual-Strategie-Algorithmus nutzt vorberechnete Kommunikations-Scores und balanciert Endleistung aktueller Aufgaben mit langfristiger Cluster-Gesundheit — eine reife, effiziente GPU-Scheduling-Lösung für groß angelegtes KI-Training und HPC in Cloud-Native-Umgebungen.

---

**Referenzen**

- **Design-Dokument:** [NVIDIA GPU Topology Scheduler](https://github.com/Project-HAMi/HAMi/blob/master/docs/proposals/gpu-topo-policy.md)
- **Benutzerhandbuch:** [NVIDIA GPU Topology Scheduler Enablement Guide](https://github.com/Project-HAMi/HAMi/blob/master/docs/proposals/nvidia-gpu-topology-scheduler_cn.md)
- **Zugehörige PRs:**
  - [https://github.com/Project-HAMi/HAMi/pull/1018](https://github.com/Project-HAMi/HAMi/pull/1018)
  - [https://github.com/Project-HAMi/HAMi/pull/1276](https://github.com/Project-HAMi/HAMi/pull/1276)

Nochmals herzlichen Dank an die Community-Entwickler @lengrongfu und @fyp711 für ihre Beiträge zu dieser Funktion!