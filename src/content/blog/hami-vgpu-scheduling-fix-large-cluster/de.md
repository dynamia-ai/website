---
title: 'Behebung von HAMi-vGPU-Scheduling-Ausfällen nach Upgrade eines Tausender-GPU-Clusters'
coverTitle: 'HAMi-vGPU-Scheduling-Fix im großen Cluster'
date: '2026-06-01'
excerpt: >-
  Deep Dive eines Community-Contributors: Diagnose und Fix von vGPU-Scheduling-
  Verzögerungen (Sekunden → 10+ Minuten) nach Upgrade eines 200-Knoten-GPU-
  Clusters von Volcano 1.7 auf Volcano 1.12 + hami-dp — API-Server-Throttling,
  Patch-Verzögerungen, Resource-View-Timeouts.
author: Fan Huiyang
tags:
  - HAMi
  - vGPU
  - Volcano
  - GPU-Scheduling
  - Kubernetes
  - Großcluster
  - Troubleshooting
category: Technical Deep Dive
coverImage: /images/blog/hami-vgpu-scheduling-fix-large-cluster/resource-view.png
language: de
linktitle: vGPU-Scheduling-Fix für Großcluster
---

Dieser Artikel stammt von **Fan Huiyang**, HAMi-Community-Entwickler. Er dokumentiert Troubleshooting und Lösung für einen mittelgroßen bis großen GPU-Cluster (200 Knoten): Nach Upgrade von Volcano 1.7 auf Volcano 1.12 + hami-dp stieg die vGPU-Scheduling-Latenz von Sekunden auf über zehn Minuten. Vom Node-Annotation-Mechanismus und Handshake-Protokoll zur Ursachenkette (API-Server-Throttling → Patch-Verzögerung → Resource-View-Timeout) und Fix ohne Handshake mit optimierten Annotation-Updates — mehrfach verifiziert.

## Problembeschreibung

Nach Upgrade einer Cloud-Pool mit 200 NVIDIA-Knoten von Volcano 1.7 + volcano-dp auf Volcano 1.12 + hami-dp wurden GPU-Test-Tasks **über zehn Minuten** bis zur erfolgreichen Zuweisung verzögert — schwerer Business-Impact.

## Hintergrund

### Node-Annotation-Mechanismus

In Volcano + hami-dp scannt hami-dp GPU-Infos und setzt u. a.:

- `volcano.sh/node-vgpu-handshake`: Handshake für State-Sync zwischen hami-dp und Scheduler
- `volcano.sh/node-vgpu-register`: GPU-Registrierung mit Details

**Registrierungsformat:**

```
GPU-f571c8f8-948a-71b4-3be1-2bf02c7a1b20,10,32768,NVIDIA-Tesla V100S-PCIE-32GB,true,hami-core
```

| Feld | Bedeutung |
|-|-|
| `GPU-xxx` | GPU-UUID |
| `10` | gpu-number pro physischer GPU, max. 10 Pods |
| `32768` | GPU-Speicher (MB) |
| `NVIDIA-Tesla V100S-PCIE-32GB` | Modell |
| `true` | Health |
| `hami-core` | Partitionierung (hami-core oder mig) |

### Resource View

Volcano-scheduler erzeugt aus Node-Annotations eine hami-vGPU-Resource-View (GPU-Anzahl, gpu-number, Memory, Compute-Prozent).

![Resource View](/images/blog/hami-vgpu-scheduling-fix-large-cluster/resource-view.png)

### Handshake-Mechanismus

Damit volcano-scheduler GPU-Änderungen (Ausfall, hami-dp-Hang) schnell erkennt:

1. **hami-dp**: beim Update von `node-vgpu-register` auch Handshake patchen + Node-Update-Event
2. **volcano-scheduler**: Timestamp im Handshake auswerten

**Zustandsübergänge:**

- `Reported + timestamp` → `Requesting + timestamp`
- `Requesting` < 60s → Resource View erzeugen
- `Requesting` > 60s → View leeren, `Deleted + timestamp`
- `Deleted` → View leeren

**Scheduler-Code (Auszug):**

```go
if strings.Contains(handshake, "Requesting") {
    formertime, _ := time.Parse("2006.01.02 15:04:05", strings.Split(handshake, "_")[1])
    if time.Now().After(formertime.Add(time.Second * 60)) {
        klog.Infof("node %v device %s leave", node.Name, handshake)
        tmppat := make(map[string]string)
        tmppat[deviceconfig.VolcanoVGPUHandshake] = "Deleted_" + time.Now().Format("2006.01.02 15:04:05")
        patchNodeAnnotations(node, tmppat)
        return nil
    }
} else if strings.Contains(handshake, "Deleted") {
    return nil
} else {
    tmppat := make(map[string]string)
    tmppat[deviceconfig.VolcanoVGPUHandshake] = "Requesting_" + time.Now().Format("2006.01.02 15:04:05")
    patchNodeAnnotations(node, tmppat)
}
```

**Frequenz-Problem**: hami-dp aktualisiert Handshake alle 30s. Bei 200 Knoten: **400 Patch-Operationen alle 30 Sekunden** (dp + Scheduler-Reaktion auf Events).

![Handshake-Frequenz](/images/blog/hami-vgpu-scheduling-fix-large-cluster/handshake-frequency.png)

## Root-Cause-Analyse

1. **Zu viele Annotation-Ops** → **API-Server-Throttling**
2. **Patch-Verzögerung** ~200 ms pro Patch
3. **Resource-View-Erzeugung blockiert**
4. **View-Timeout**: wenige freie Knoten, Views bereits geleert → Scheduling scheitert mehrfach → **10+ Minuten**

**Logs:**

- Ein Scheduling-Zyklus: **52 s** (normal <1s)

![Scheduling 52s](/images/blog/hami-vgpu-scheduling-fix-large-cluster/scheduling-period-52s.png)

- **260** verzögerte Patches ~200 ms

![Patch delay](/images/blog/hami-vgpu-scheduling-fix-large-cluster/patch-delay-260.png)

- Views bereits timeout vor Erzeugung

![View timeout](/images/blog/hami-vgpu-scheduling-fix-large-cluster/view-timeout.png)

- Task-Scheduling erst nach **50+ s**

![50s delay](/images/blog/hami-vgpu-scheduling-fix-large-cluster/50s-before-task.png)

## Lösung

### Kernansatz

Handshake zwischen volcano-scheduler und hami-dp per Node-Annotation-Patching entfernen — gesamter Code zu `volcano.sh/node-vgpu-handshake` in Scheduler und hami-dp löschen.

### Änderungen

**hami-dp:**

- Annotation-Vergleich: nur updaten bei Abweichung

**Scheduler:**

- `node.status.allocatable` vGPU prüfen: keine vGPU-Ressourcen → View leeren (dp-Hang); sonst View aus Annotations

**Scheduler-Optimierung:**

- Kein vollständiges Pod-Traversieren auf irrelevanten Node-Update-Events (nur Labels/Annotations)

**GPU-Konflikt-Fix:**

- Binding auf gleichem Knoten bei gleicher gpu-number verzögern (kubelet übergibt Pod-Info nicht immer an dp)

**Hinweis:** Kompatibilität Volcano 1.7 und Preemption sind interne Implementierungen, noch nicht in Community-Code; Open-Source-Planung läuft.

## Verifikation

### 1. Handshake ändert sich nicht mehr

Nach Image-Replace bleibt alter Handshake-Wert:

```
volcano.sh/node-vgpu-handshake: Reported 2026-05-25 07:58:20.213111834 +0000 UTC
```

### 2. hami-dp-Hang simuliert

![dp hang test](/images/blog/hami-vgpu-scheduling-fix-large-cluster/dp-pod-stuck.png)

GPU-Pod scheduliert nicht — erwartet. Nach dp-Restart Erkennung + Erfolg — erwartet.

![dp restart](/images/blog/hami-vgpu-scheduling-fix-large-cluster/dp-restart-result.png)

### 3. Inter-Queue Full-GPU-Preemption

4 Low-Priority → High-Priority preempt → delete → reclaim. Eindeutige GPU-UUIDs.

### 4. Inter-Queue vGPU-Preemption

Szenarien vGPU↔vGPU, pGPU↔vGPU, vGPU↔pGPU — alle erwartungsgemäß.

### 5. Intra-Queue vGPU-Preemption

Preempt und reclaim OK.

### 6. Alte volcano-dp-Kompatibilität

Alte Pods + neue Pods, eindeutige UUIDs.

## Fazit

Ursache: Handshake erzeugte excessive Patches → Throttling → blockierte vGPU-Views. Fix: Handshake entfernt, Annotation-Updates optimiert, View-Validierung verbessert — Latenz behoben. Verifiziert: dp-Hang, Preemption, Kompatibilität.