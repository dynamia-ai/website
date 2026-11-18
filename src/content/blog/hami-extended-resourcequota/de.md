---
title: >-
  Deep Dive: HAMi Extended ResourceQuota | Präzises GPU-Ressourcen-Quota-Management in der Implementierung
coverTitle: Präzises GPU-Management mit ResourceQuota und HAMi
date: '2025-11-03'
excerpt: >-
  HAMi v2.7.0 führt ein erweitertes ResourceQuota-Modell ein, um Grenzen des nativen Kubernetes
  ResourceQuota in GPU- und heterogenen Szenarien zu adressieren. Dieser Artikel analysiert im Code,
  wie HAMi die Schmerzpunkte Ressourcenkorrelation und dynamische Ressourcen löst und präzises
  GPU-Quota-Management für Multi-Tenant-Umgebungen bietet.
author: Dynamia AI Team
tags:
  - HAMi
  - ResourceQuota
  - GPU
  - Kubernetes
  - Ressourcenmanagement
  - Multi-Tenancy
  - Deep Dive
  - NVIDIA
category: Technical Deep Dive
coverImage: /images/blog/hami-extended-resourcequota/cover-en.png
linktitle: HAMi Extended ResourceQuota
---

In HAMi v2.7.0 hat die Community ein **erweitertes ResourceQuota**-Modell eingeführt, um die Grenzen des nativen Kubernetes-`ResourceQuota` in GPU- und heterogenen Szenarien zu adressieren. Das Feature zielt auf zwei zentrale Schmerzpunkte ab, die native Quota-Verwaltung nicht löst: „Ressourcenkorrelation“ und „dynamische Ressourcen“ — für präzisere und zuverlässigere GPU-Governance in Multi-Tenant-Umgebungen.

Aufbauend auf der Feature-Einführung geht dieser Artikel in die Code-Implementierung und analysiert Design und Funktionsweise von HAMis erweitertem ResourceQuota im Detail.

## Kernschmerzpunkte: zwei große Grenzen des nativen ResourceQuota

### 1. Kein Verständnis von Ressourcenkorrelation

Nativ rechnet `ResourceQuota` jede Ressource isoliert und versteht interne Beziehungen nicht. Fordert ein Pod 2 GPUs mit je 2000 MB (`nvidia.com/gpu: 2`, `nvidia.com/gpumem: 2000`), verbucht native Quota fälschlich `2000 MB` Gesamtspeicher statt `2 * 2000 MB = 4000 MB`. Das verzerrt Quota-Management stark.

### 2. Keine dynamischen Ressourcen

Bei prozentualem Speicher (z. B. `gpumem-percentage: 50`) lässt sich der tatsächliche Verbrauch **erst nach der Scheduling-Entscheidung** berechnen (wenn die konkrete physische GPU feststeht). Native `ResourceQuota` prüft vor dem Scheduling und kann solche dynamischen Werte nicht mit „erst schedulen, dann abziehen“ handhaben.

## Lösung: Erweitertes ResourceQuota

HAMis Ansatz ersetzt den nativen Controller nicht, sondern baut eine **leichtgewichtige, nicht-intrusive** Erweiterungsschicht im HAMi-Scheduler darauf auf. Kernprinzip: Der HAMi-Scheduler beobachtet Standard-`ResourceQuota`-Objekte; findet er HAMi-verwaltete Ressourcen mit `limits.`-Präfix (z. B. `limits.nvidia.com/gpumem`), prüft er diese im eigenen Scheduling-Zyklus mit feineren Berechnungsregeln.

## Implementierung: Codeanalyse

HAMis erweitertes ResourceQuota in zwei Phasen: „Quota-Synchronisation“ und „Prüfung zur Scheduling-Zeit“.

### 1. Phase 1: Quota-Synchronisation — Lauschen und Cachen

Ziel: `ResourceQuota`-Objekte mit `limits.`-Präfix aus dem Cluster in einen lokalen Cache des HAMi-Schedulers zu synchronisieren.

#### Lauschen und Erkennen

Der HAMi-Scheduler lauscht per Informer auf Add/Delete/Update von `ResourceQuota` und triggert Handler wie `onAddQuota`.

#### Präfix-Filter und Cache

In `AddQuota` iteriert der Code über `spec.hard`. Nur Einträge mit `limits.`-Präfix werden verarbeitet. Der Ressourcenname wird ohne Präfix zusammen mit dem Limit im globalen `QuotaManager`-Cache gespeichert.

Kernimplementierung in `pkg/device/quota.go`:

```go
// File: pkg/device/quota.go

// AddQuota synchronizes extended resources from K8s ResourceQuota objects to local cache
func (q *QuotaManager) AddQuota(quota *corev1.ResourceQuota) {
        q.mutex.Lock()
        defer q.mutex.Unlock()

        for idx, val := range quota.Spec.Hard {
                value, ok := val.AsInt64()
                if ok {
                        // 1. Check for "limits." prefix
                        if !strings.HasPrefix(idx.String(), "limits.") {
                                continue
                        }
                        // 2. Strip prefix to get the real resource name
                        dn := strings.TrimPrefix(idx.String(), "limits.")
                        if !IsManagedQuota(dn) { // Check if it's a resource type managed by HAMi
                                continue
                        }
                        // ...
                        // 3. Write resource and its Limit value to local cache
                        (*dp)[dn].Limit = value
                        // ...
                }
        }
}
```

### 2. Phase 2: Scheduling-Prüfungen — iterative Verifikation pro Karte

Kern der intelligenten Berechnung: Die Quota-Prüfung ist keine einmalige Gesamtsumme, sondern erfolgt in der geräteseitigen `Fit()`-Funktion **schleifenweise pro Karte** beim Suchen passender physischer GPUs.

![Quota-Prüfungsablauf](/images/blog/hami-extended-resourcequota/quota-check-flow-en.png)

So werden „Ressourcenkorrelation“ und „dynamische Ressourcen“ gelöst:

#### Dynamische Ressourcenberechnung

In der Schleife von `Fit()` wird für jede physische Karte der dynamische Request (z. B. Prozent-Speicher) anhand der **tatsächlichen Hardwarespezifikation** (z. B. `dev.Totalmem`) in konkrete Werte umgerechnet.

#### Korrelationsberechnung

`fitQuota` summiert **bereits für den Pod gewählte Karten** (`tmpDevs`) und **die gerade geprüfte Karte**, sodass korrelierte Ressourcen (z. B. Gesamtspeicher) kumulativ berechnet werden.

Kernimplementierung in `pkg/device/nvidia/device.go`:

```go
// File: pkg/device/nvidia/device.go

// Fit function (simplified logic)
func (nv *NvidiaGPUDevices) Fit(...) (bool, map[string]device.ContainerDevices, string) {
        // ...
        // Loop through all available GPU devices on the node
        for i := len(devices) - 1; i >= 0; i-- {
                dev := devices[i]
                memreq := int32(0)
                // 1. Dynamic resource calculation:
                //    If percentage-based memory is requested, calculate based on the current dev card's actual total memory
                if k.MemPercentagereq != 101 && k.Memreq == 0 {
                        memreq = dev.Totalmem * k.MemPercentagereq / 100
                }
                // 2. Correlated resource check (call fitQuota):
                //    Check if "resources already allocated for this Pod + resources of the current card" exceed quota
                if !fitQuota(tmpDevs, pod.Namespace, int64(memreq), int64(k.Coresreq)) {
                        continue // Insufficient quota, skip this card
                }
                // ... (other checks) ...
                // If checks pass, add this card to the allocation list tmpDevs
                tmpDevs[k.Type] = append(tmpDevs[k.Type], ...)
                if k.Nums == 0 {
                        return true, tmpDevs, "" // Satisfied Pod's requested card count, allocation successful
                }
        }
        // ...
}

// fitQuota handles the core quota check logic
func fitQuota(tmpDevs map[string]device.ContainerDevices, ns string, memreq int64, coresreq int64) bool {
        mem := memreq
        core := coresreq
        // Accumulate resources in the allocation list
        for _, val := range tmpDevs[NvidiaGPUDevice] {
                mem += int64(val.Usedmem)
                core += int64(val.Usedcores)
        }
        // Call QuotaManager's cache for final check
        return device.GetLocalCache().FitQuota(ns, mem, core, NvidiaGPUDevice)
}
```

### 3. Verhaltensunterschiede und Hinweise

HAMis erweitertes `ResourceQuota` unterscheidet sich in zwei Punkten vom nativen Mechanismus:

#### Unabhängiger interner Zustand

HAMis Quota-Berechnung (z. B. `2 * 2000 MB = 4000 MB`) und Nutzungsstatistik laufen vollständig im internen `QuotaManager`-Cache des Schedulers und werden **nicht in `status` des nativen Kubernetes-`ResourceQuota` zurückgeschrieben**. Das heißt: `used` via `kubectl describe resourcequota` spiegelt HAMi-erweiterte Ressourcen nicht wider.

#### Verhalten bei Scheduling-Fehler

Überschreitet ein Pod das von HAMi verwaltete Quota, verhält es sich anders als nativ. Nativ werden über-quota Pods vom API Server **bei Erstellung abgelehnt**. Bei HAMi wird das Pod-Objekt erstellt, der HAMi-Scheduler stuft es als nicht planbar ein — es bleibt **`Pending`**, bis Quota frei wird oder angepasst wird.

## Nutzung

Nutzer setzen im Standard-`ResourceQuota` das Präfix `limits.` vor Ressourcennamen, die HAMi feingranular verwalten soll.

```yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: gpu-quota
  namespace: default
spec:
  hard:
    limits.nvidia.com/gpu: "2"
    limits.nvidia.com/gpumem: "4000"
```

## Zusammenfassung

HAMis erweitertes `ResourceQuota` modifiziert den nativen Controller nicht, sondern erweitert die Funktion durch unabhängige Prüflogik im HAMi-Scheduler. Kern: **dynamische Ressourcen** berechnen und **kumulative Verifikation** pro Kandidaten-Gerät beim Durchmustern physischer Devices — dort, wo native Mechanismen dynamische und korrelierte Ressourcen nicht handhaben.

---

**Referenzen**

* **User Guide**: [NVIDIA Extended ResourceQuota Guide](https://project-hami.io/zh/docs/userguide/nvidia-device/using-resourcequota/)
* **Related PR**: [https://github.com/Project-HAMi/HAMi/pull/1359](https://github.com/Project-HAMi/HAMi/pull/1359)

Nochmals vielen Dank an Community-Entwickler @FouoF für diesen Beitrag!