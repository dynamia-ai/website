---
title: '[Architektur Deep Dive] HAMi Device Abstraction Layer: Schnelle Integration heterogener Rechenleistung am Beispiel Enflame GCU'
coverTitle: '[Architektur] HAMi Device Abstraction Layer | Schnelle heterogene Integration mit Enflame GCU'
date: '2025-10-22'
excerpt: >-
  HAMis durchdachte Device-Abstraktionsschicht bietet eine elegante Lösung für
  die schnelle Integration heterogener Rechenleistung. Dieser Artikel erläutert
  die Kernarchitektur und zeigt am in v2.7.0 integrierten Enflame GCU, wie
  Anbieter oder Community-Entwickler neue Hardware darauf schnell unterstützen können.
author: Dynamia
tags:
  - HAMi
  - Device Abstraction
  - Enflame GCU
  - vGCU
  - Architektur
  - Heterogene Rechenleistung
  - Kubernetes
  - Integration
category: Technical Deep Dive
coverImage: /images/blog/hami-device-abstraction-gcu/cover-en.png
linktitle: HAMi-Unterstützung für Enflame GCU
---

Im Cloud-Native-Zeitalter proliferieren Hardware für KI und Hochleistungsrechnen. Wie effizient und schnell ein Scheduling-System neue heterogene Beschleuniger adaptiert, ist zu einem Maßstab seiner Erweiterbarkeit geworden.

HAMi adressiert diese Herausforderung über seine durchdachte **Device Abstraction Layer**. Dieser Artikel erläutert die Kernarchitektur und nutzt den in **v2.7.0 integrierten Enflame GCU** als konkretes Beispiel, wie Anbieter oder Community-Entwickler neue Hardware mit sehr geringem Aufwand aktivieren können.

## 1. HAMi Device Abstraction und Kern-Interfaces

Um Hardware verschiedener Anbieter und Typen einheitlich zu behandeln, definiert der HAMi-Scheduler ein standardisiertes Device-Interface (`Devices` interface). Jede neue Hardware, die dieses Interface implementiert, kann nahtlos ins HAMi-Scheduling-System eingebunden werden, ohne die Kern-Scheduling-Logik zu ändern.

Diese Schichtabstraktion entkoppelt generische Scheduling-Logik von hardwarespezifischen Implementierungen. Die Beziehung sieht so aus:

![HAMi Device Abstraction Layer Architektur](/images/blog/hami-device-abstraction-gcu/architecture-en.png)

Die Kernidee des Interfaces ist, hardwarespezifische Komplexität in jeder Device-Implementierung zu „lokalisieren“ und den Scheduler vor unterliegenden Unterschieden zu schützen. Die wichtigsten Interface-Funktionen:

### Kern-Interface im Detail

#### `GetNodeDevices()`

- **Verantwortung**: Ressourceninformationen parsen, die der Anbieter-`device-plugin` auf dem Knoten (`corev1.Node`) meldet, und in HAMis einheitliche interne Device-Liste (`[]*device.DeviceInfo`) umwandeln.
- **Rolle**: Einstiegspunkt, an dem HAMi die Rechenressourcen eines Knotens entdeckt und initialisiert.

#### `GenerateResourceRequests()`

- **Verantwortung**: In der Pod-YAML des Nutzers definierte Ressourcenanfragen (z. B. `enflame.com/vgcu-percentage: 25`) in die standardisierte Struktur `ContainerDeviceRequest` übersetzen, die der Scheduler versteht.
- **Rolle**: „Übersetzer“, der die interne Repräsentation aller heterogenen Ressourcen vereinheitlicht.

#### `Fit()`

- **Verantwortung**: Auf einem Knoten, gegeben `ContainerDeviceRequest` und aktuelle Device-Nutzung, entscheiden, ob der Knoten die Pod-Ressourcenanforderungen erfüllen kann, und einen konkreten Zuweisungsplan finden.
- **Rolle**: Kernentscheidungslogik für **intra-node** Scheduling, inklusive Ressourcen-Matching, Topologieauswahl und allen anderen device-bezogenen komplexen Urteilen.

![Kern-Interface-Aufruffluss](/images/blog/hami-device-abstraction-gcu/interface-flow-en.png)

#### `ScoreNode()`

- **Verantwortung**: Wenn mehrere Knoten `Fit()` bestehen, Kandidaten bewerten, damit der Scheduler den besten wählen kann.
- **Rolle**: Schlüssel für **inter-node** Scheduling, typisch für Policies wie `binpack` (bevorzugt höhere Ressourcenauslastung) oder `spread` (bevorzugt idle Knoten).

## 2. Fallstudie: Integration von Enflame vGCU

Die Enflame-vGCU-Integration ist eine Standardimplementierung der obigen Interfaces. Da die Scheduling-Logik relativ direkt ist und keine komplexe Topologieberechnung erfordert, konnte die Aktivierung sehr effizient abgeschlossen werden.

### 1. `GenerateResourceRequests` implementieren: Nutzeranfragen übersetzen

Dieser Schritt mappt `enflame.com/vgcu-percentage` aus der YAML des Nutzers auf das interne Feld `Memreq` (Speicheranfrage). Da vGCU eine Karte als 100 Prozent-Einheiten abstrahiert, ist die Umwandlung ein einfaches Mapping.

```go
// File: pkg/device/enflame/device.go (logic simplified)

func (dev *EnflameDevices) GenerateResourceRequests(ctr *corev1.Container) ContainerDeviceRequest {
    // ...
    // Read the value of "enflame.com/vgcu-percentage" from Pod spec.containers.resources.limits
    percentage := ctr.Resources.Limits[EnflameResourceNameVGCUPercentage]

    return device.ContainerDeviceRequest{
        // ...
        Memreq: int32(percentage.Value()), // Use the percentage as the internal Memreq
        Coresreq: 0,
        // ...
    }
}
```

### 2. `Fit` implementieren: Intra-Node-Ressourcenvalidierung

Das ist der Kern der Enflame-GCU-Aktivierung. Implementiert als kompakter „Pre-Validator“, der in `Fit` folgende Schritte ausführt:

1. **Devices filtern**: Mit `use-gpuuuid` / `nouse-gpuuuid` Annotations physische Kandidaten auswählen.
2. **Iterieren und prüfen**: Über Kandidaten loopen und prüfen, ob verbleibendes `Mem` (Prozent-Einheiten) die Anfrage erfüllt.
3. **Früh zurückgeben**: Sobald das erste passende Device gefunden ist, Erfolg zurückgeben.

```go
// File: pkg/device/enflame/device.go (logic simplified)

func (dev *EnflameDevices) Fit(nodeInfo *util.NodeInfo, pod *corev1.Pod) (bool, ...) {
        // ...
        request := dev.GenerateResourceRequests(&pod.Spec.Containers[0])

        // 1. Build candidate device list from Pod annotations (use-gpuuuid/nouse-gpuuuid)
        candidates := buildCandidateDevices(nodeInfo, pod)

        // 2. Iterate candidates and find the first device that satisfies the request
        for _, devID := range candidates {
                availableMem := nodeInfo.Devices[devID].Totalmem - nodeInfo.Devices[devID].Usedmem
                if availableMem >= request.Memreq {
                        // 3. Success as soon as one is found
                        return true, ...
                }
        }

        return false, ...
}
```

### 3. `ScoreNode` implementieren: Standard-Score liefern

Da vGCU-Scheduling keine Cross-Node-Topologie oder Affinitäts-Policies betrifft, ist `ScoreNode` sehr einfach: Es muss nur einen neutralen Default-Score (`0`) zurückgeben, ohne `binpack`- oder `spread`-Entscheidungen des Schedulers zu beeinflussen.

### Verwendung

Nutzer können Enflame vGCU mit folgender YAML konsumieren:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: gcu-shared-pod-with-uuid
  annotations:
    # Use the GCU device whose UUID is node1-enflame-0
    enflame.com/use-gpuuuid: "node1-enflame-0"
spec:
  containers:
    - name: my-shared-gcu-app
      image: ubuntu:20.04
      command: ["sleep", "3600"]
      resources:
        limits:
          enflame.com/vgcu: 1
          enflame.com/vgcu-percentage: 25
```

## 3. Zusammenfassung

HAMis Device Abstraction Layer ist zentral dafür, wie schnell das Projekt auf Ökosystemänderungen bei Hardware reagieren kann und gleichzeitig starkes heterogenes Rechenmanagement behält. Durch ein klares, gut abgegrenztes Interface-Set wird Enablement-Komplexität in jede Device-Implementierung „nach unten“ geschoben und gekapselt.

Der Enflame-GCU-Integrationsfall zeigt die Stärke der Architektur: Entwickler müssen die internen Scheduler-Schleifen und komplexen Zustände von HAMi nicht verstehen. Mit Fokus auf wenige klar definierte Funktionen können sie einen neuen heterogenen Beschleuniger schnell und zuverlässig ins Cloud-Native-Scheduling-System bringen. Das senkt Enablement-Kosten für Anbieter und fördert Community-Beiträge stark.

---

**Referenzen**

- **Nutzerdokumentation**: [Enflame GCU/GCUshare support](https://github.com/Project-HAMi/HAMi/blob/master/docs/enflame-vgpu-support_cn.md)
- **Zugehörige PRs**:
  - [https://github.com/Project-HAMi/HAMi/pull/1013](https://github.com/Project-HAMi/HAMi/pull/1013)
  - [https://github.com/Project-HAMi/HAMi/pull/1334](https://github.com/Project-HAMi/HAMi/pull/1334)

Unseren aufrichtigen Dank erneut an die Community-Entwickler @archlitchi und @zhaikangqi331 für ihre Beiträge zu diesem Feature!