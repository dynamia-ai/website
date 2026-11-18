---
title: >-
  HAMi vGPU-Prinzipanalyse Teil 4: Spread- und Binpack-Scheduling — Implementierung
coverTitle: Im HAMi-vGPU-Scheduler
date: '2025-07-26'
excerpt: >-
  Vierter Artikel der HAMi-Prinzipreihe: wie hami-scheduler beim Scheduling Knoten wählt,
  also wie Spread und Binpack als erweiterte Scheduling-Strategien umgesetzt sind.
author: “Dynamia AI Team”
tags:
  - HAMi
  - GPU-Sharing
  - vGPU
  - Kubernetes
  - Heterogene Rechenressourcen
category: Technical Deep Dive
coverImage: /images/blog/gpu6/cover2.jpg
linktitle: GPU Spread & Binpack
---


Im letzten Artikel analysierten wir den `hami-scheduler`-Workflow und das Zusammenspiel von `hami-webhook` und `hami-scheduler`.

[HAMi vGPU-Analyse Teil 3: hami-scheduler-Workflow](/blog/open-source-vgpu-hami-scheduler)

Dies ist der vierte Artikel der Reihe: wie `hami-scheduler` beim Scheduling Knoten auswählt — konkret Spread und Binpack.

Hier die abschließende Frage: *Wie sind Spread und Binpack implementiert?*

> Die folgende Analyse basiert auf HAMi v2.4.0.

Zur Erinnerung der aus Teil 3 bekannte HAMi-Webhook-&-Scheduler-Workflow:

![HAMi Webhook & Scheduler workflow diagram](/images/blog/gpu6/p2.jpg)

1. Ein Nutzer erstellt einen Pod mit vGPU-Ressourcenanfrage.
2. Der kube-apiserver sendet per `MutatingWebhookConfiguration` eine Anfrage an den HAMi-Webhook.
3. Der HAMi-Webhook prüft das `Resource`-Feld. Bei HAMi-verwalteten vGPU-Ressourcen setzt er `SchedulerName` auf `hami-scheduler`.
    * Privilegierte Pods werden übersprungen.
    * Pods mit vGPU und gesetztem `nodeName` werden abgelehnt.
4. `hami-scheduler` scheduliert den Pod mit Standard-`kube-scheduler`-Image (Basislogik wie default-scheduler); per `KubeSchedulerConfiguration` ruft er ein Extender-Plugin auf.
    * Das Extender ist ein weiterer Container im hami-scheduler-Pod mit Webhook- und Scheduler-APIs.
    * Bei vGPU-Anfrage ruft der kube-scheduler das Extender per HTTP auf — Custom Scheduling.
5. Das Extender-Plugin enthält die HAMi-Scheduling-Logik und wählt Knoten nach verbleibenden Ressourcen.
6. Asynchrone Tasks inkl. GPU-Erkennung:
    * devicePlugin meldet periodisch GPU-Ressourcen in Node-Annotations.
    * Das Extender-Plugin berechnet Gesamt- und belegte Ressourcen (Node + laufende Pods) und hält Restkapazität im Speicher.

## 1. Scheduling-Policies konfigurieren

`hami-scheduler` bietet zwei Ebenen:

* **Node Scheduling Policy**: wie ein Knoten für einen Pod gewählt wird.
* **GPU Scheduling Policy**: welche GPU auf einem Multi-GPU-Knoten gewählt wird.

Laut Deployment-Doku lassen sich Policies beim Installieren setzen:

* `scheduler.defaultSchedulerPolicy.nodeSchedulerPolicy`: String, Default `"binpack"` — Knoten-Policy. ***„binpack“: Tasks möglichst auf denselben GPU-Knoten; „spread“: auf verschiedene GPU-Knoten.***
* `scheduler.defaultSchedulerPolicy.gpuSchedulerPolicy`: String, Default `"spread"` — GPU-Policy. ***„binpack“: möglichst dieselbe GPU; „spread“: verschiedene GPUs.***

Like this:

```bash
helm install vgpu vgpu-charts/vgpu \
  --set scheduler.defaultSchedulerPolicy.nodeSchedulerPolicy=binpack \
  --set scheduler.defaultSchedulerPolicy.gpuSchedulerPolicy=spread
```

Nach dem Deployment gelten die Einstellungen für `hami-scheduler` z. B. so:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: vgpu-hami-scheduler
  namespace: kube-system
spec:
  template:
    spec:
      containers:
      - command:
        - scheduler
        # ... other args
        - --node-scheduler-policy=binpack
        - --gpu-scheduler-policy=spread
```

Entscheidend sind diese zwei Parameter:

```yaml
- --node-scheduler-policy=binpack
- --gpu-scheduler-policy=spread
```

## 2. Prinzip der Knoten-Scheduling-Strategie

Dieser Teil ist vergleichsweise einfach — die Knotenwahl steckt in der `Filter`-Schnittstelle.

```go
// pkg/scheduler/scheduler.go#L444
func (s *Scheduler) Filter(args extenderv1.ExtenderArgs) (*extenderv1.ExtenderFilterResult, error) {
    klog.InfoS("begin schedule filter", "pod", args.Pod.Name, "uuid", args.Pod.UID, "namespaces", args.Pod.Namespace)
    
    // ... logic to check if pod requests resources ...

    nodeUsage, failedNodes, err := s.getNodesUsage(args.NodeNames, args.Pod)
    // ... handle errors ...

    nodeScores, err := s.calcScore(nodeUsage, nums, annos, args.Pod)
    // ... handle errors ...

    if len((*nodeScores).NodeList) == 0 {
        // ... handle no suitable nodes ...
    }

    sort.Sort(nodeScores)
    m := (*nodeScores).NodeList[len((*nodeScores).NodeList)-1]
    klog.Infof("schedule %v/%v to %v %v", args.Pod.Namespace, args.Pod.Name, m.NodeID, m.Devices)
    
    // ... patch pod annotations ...
    
    res := extenderv1.ExtenderFilterResult{NodeNames: &[]string{m.NodeID}}
    return &res, nil
}
```

Der Kern sind diese Zeilen:

```go
// Calculate scores and get all suitable nodes
nodeScores, err := s.calcScore(nodeUsage, nums, annos, args.Pod)

// Sort
sort.Sort(nodeScores)
// Directly select the last node
m := (*nodeScores).NodeList[len((*nodeScores).NodeList)-1]

// Return the result
res := extenderv1.ExtenderFilterResult{NodeNames: &[]string{m.NodeID}}
return &res, nil```

Zwei Schritte:
-   Score für alle Knoten berechnen.
-   Passenden Knoten gemäß Policy wählen.

### Score berechnen

Die Berechnung steckt in `calcScore`:

```go
// pkg/scheduler/score.go#L185
func (s *Scheduler) calcScore(nodes *map[string]*NodeUsage, nums util.PodDeviceRequests, annos map[string]string, task *corev1.Pod) (*policy.NodeScoreList, error) {
    // ... get policy from config or pod annotations ...
    
    for nodeID, node := range *nodes {
        score := policy.NodeScore{NodeID: nodeID, Devices: make(util.PodDevices), Score: 0}
        score.ComputeScore(node.Devices)
        
        // ... filter logic (fitInDevices) ...
        
        if ctrfit {
            res.NodeList = append(res.NodeList, &score)
        }
    }
    return &res, nil
}
```

Der Algorithmus liegt in `ComputeScore`:

```go
// pkg/scheduler/policy/node_policy.go#L53
func (ns *NodeScore) ComputeScore(devices DeviceUsageList) {
    // current user having request resource
    used, usedCore, usedMem := int32(0), int32(0), int32(0)
    for _, device := range devices.DeviceLists {
        used += device.Device.Used
        usedCore += device.Device.Usedcores
        usedMem += device.Device.Usedmem
    }
    klog.V(2).Infof("node %s used %d, usedCore %d, usedMem %d,", ns.NodeID, used, usedCore, usedMem)

    total, totalCore, totalMem := int32(0), int32(0), int32(0)
    for _, deviceLists := range devices.DeviceLists {
        total += deviceLists.Device.Count
        totalCore += deviceLists.Device.Totalcore
        totalMem += deviceLists.Device.Totalmem
    }
    useScore := float32(used) / float32(total)
    coreScore := float32(usedCore) / float32(totalCore)
    memScore := float32(usedMem) / float32(totalMem)
    ns.Score = float32(Weight) * (useScore + coreScore + memScore)
    klog.V(2).Infof("node %s computer score is %f", ns.NodeID, ns.Score)
}
```

Der Score basiert auf dem Verhältnis genutzter GPU-Kerne und -Speicher zur Gesamtkapazität pro Knoten, gewichtet zum Endscore.

Kurz: **je weniger freier GPU-Kern und -Speicher auf einem Knoten, desto höher der Score.**

Das wirkt zunächst kontraintuitiv — mehr Ressourcen sollten doch höher scoren?

Das klärt sich beim Abschnitt „Knotenwahl nach Policy“.

### Knoten filtern

Nach dem Scoring filtern unpassende Knoten anhand der GPU-Anfrage des Pods.

Beispiel: Pod fordert 2 vGPUs, Knoten hat nur eine Karte — unmöglich.

#### GPU-Anfrage des Pods parsen

Zuerst werden die angeforderten GPU-Infos aus dem Pod gelesen:

```go
// pkg/scheduler/scheduler.go#L444
func (s *Scheduler) Filter(args extenderv1.ExtenderArgs) (*extenderv1.ExtenderFilterResult, error) {
    nums := k8sutil.Resourcereqs(args.Pod)
}
```

`Resourcereqs` ist schlicht: gpu, gpucore, gpumem usw. aus `Resources` der Container nach Namen.

#### Filter-Logik

Auch in `calcScore`:

```go
ctrfit := false
for ctrid, n := range nums {
    // ...
    klog.V(5).InfoS("fitInDevices", "pod", klog.KObj(task), "node", nodeID)
    fit, _ := fitInDevices(node, n, annos, task, &score.Devices)
    ctrfit = fit
    if !fit {
        klog.InfoS("calcScore:node not fit pod", "pod", klog.KObj(task), "node", nodeID)
        break
    }
}

if ctrfit {
    res.NodeList = append(res.NodeList, &score)
}
```

Die Regel ist `fitInDevices`: alle Bedingungen erfüllt → `true`, sonst `false` — Knoten nicht schedulierbar.

Unpassende Knoten sind herausgefiltert. Die übrigen können den Pod schedulen; die Wahl hängt von der Policy ab.

### Knotenwahl nach Policy

Nach dem Score pro Knoten erfolgt die Auswahl gemäß Policy.

```go
// Calculate scores and get all suitable nodes
nodeScores, err := s.calcScore(nodeUsage, nums, annos, args.Pod)

// Sort
sort.Sort(nodeScores)
// Directly select the last node
m := (*nodeScores).NodeList[len((*nodeScores).NodeList)-1]

// Return the result
res := extenderv1.ExtenderFilterResult{NodeNames: &[]string{m.NodeID}}
return &res, nil
```

Die Auswahl im Kern:

```go
// Sort
sort.Sort(nodeScores)
// Directly select the last node
m := (*nodeScores).NodeList[len((*nodeScores).NodeList)-1]
```

Nach dem Sortieren wird direkt der letzte Knoten gewählt.

Auf den ersten Blick unklar, wie das zur Policy passt.

**Die Logik steckt im `sort`.** `NodeScoreList` implementiert `sort.Interface`:

```go
// pkg/scheduler/policy/node_policy.go#L32
type NodeScoreList struct {
    NodeList []*NodeScore
    Policy   string
}

// ... Len() and Swap() methods ...

func (l NodeScoreList) Less(i, j int) bool {
    if l.Policy == NodeSchedulerPolicySpread.String() {
        return l.NodeList[i].Score > l.NodeList[j].Score
    }
    // default policy is Binpack
    return l.NodeList[i].Score < l.NodeList[j].Score
}
```

Der Kern:

```go
func (l NodeScoreList) Less(i, j int) bool {
    if l.Policy == NodeSchedulerPolicySpread.String() {
        return l.NodeList[i].Score > l.NodeList[j].Score
    }
    // default policy is Binpack
    return l.NodeList[i].Score < l.NodeList[j].Score
}
```

Je nach `Policy` gibt es zwei entgegengesetzte Sortierrichtungen.

Kurz zu `sort.Sort()`:

* `Less()` mit `>` → absteigende Sortierung.
* `Less()` mit `<` → aufsteigende Sortierung.

Policies:

* **Binpack** nutzt `<` → aufsteigend.
* **Spread** nutzt `>` → absteigend.

Score-Regel: **weniger freie Ressourcen → höherer Score; nach Sortierung wählen wir den letzten Knoten.**

Damit wird es klar:

* **Binpack**: letzter Knoten nach aufsteigendem Sort — höchster Score, **am wenigsten** freie Ressourcen.
* **Spread**: letzter Knoten nach absteigendem Sort — niedrigster Score, **am meisten** freie Ressourcen.

Entspricht der Policy-Bedeutung:

* **Binpack**: Pods möglichst auf denselben Knoten, einen Knoten füllen bevor andere genutzt werden.
* **Spread**: Pods über Knoten verteilen.

### Woher kommt die Policy?

In `calScore`: Default (per CLI überschreibbar), dann Override per Pod-Annotation `hami.io/node-scheduler-policy`.

Damit ist die Knoten-Policy-Analyse abgeschlossen.

---

## 3. Prinzip der GPU-Scheduling-Strategie

Ist ein Knoten gewählt und hat mehrere GPUs — welche erhält der Pod? Hier greift die GPU-Scheduling-Policy.

Die GPU-Wahl steckt ebenfalls in `Filter`, konkret in `fitInDevices`.

### GPUs filtern

Die Logik liegt tief in `fitInDevices`:

```go
// pkg/scheduler/score.go#L144
func fitInDevices(node *NodeUsage, requests util.ContainerDeviceRequests, annos map[string]string, pod *corev1.Pod, devinput *util.PodDevices) (bool, float32) {
    // ...
    for _, k := range requests {
        sort.Sort(node.Devices)
        fit, tmpDevs := fitInCertainDevice(node, k, annos, pod)
        // ...
    }
    // ...
}
```

Der Kern:

```go
for _, k := range requests {
    sort.Sort(node.Devices)
    fit, tmpDevs := fitInCertainDevice(node, k, annos, pod)
    if fit {
        devs = append(devs, tmpDevs[k.Type]...)
    } else {
        return false, 0
    }
    (*devinput)[k.Type] = append((*devinput)[k.Type], devs)
}
```

Wieder `sort.Sort`. Die GPU-Implementierung von `Sort`:

```go
// ... Len() and Swap() methods ...

func (l DeviceUsageList) Less(i, j int) bool {
    if l.Policy == GPUSchedulerPolicyBinpack.String() {
        if l.DeviceLists[i].Device.Numa == l.DeviceLists[j].Device.Numa {
            return l.DeviceLists[i].Score < l.DeviceLists[j].Score
        }
        return l.DeviceLists[i].Device.Numa > l.DeviceLists[j].Device.Numa
    }
    // default policy is spread
    if l.DeviceLists[i].Device.Numa == l.DeviceLists[j].Device.Numa {
        return l.DeviceLists[i].Score > l.DeviceLists[j].Score
    }
    return l.DeviceLists[i].Device.Numa < l.DeviceLists[j].Device.Numa
}
```

Wie erwartet dasselbe Muster: `Less` je nach GPU-Policy für auf- oder absteigende Sortierung.

### GPU auswählen

Die folgende Auswahl in `fitInCertainDevice`:

```go
func fitInCertainDevice(...) (bool, map[string]util.ContainerDevices) {
    // ...
    for i := len(node.Devices.DeviceLists) - 1; i >= 0; i-- {
        // ... filtering conditions ...
        
        if k.Nums > 0 {
            k.Nums--
            tmpDevs[k.Type] = append(tmpDevs[k.Type], util.ContainerDevice{
                // ... populate device info ...
            })
        }
        if k.Nums == 0 {
            return true, tmpDevs
        }
    }
    return false, tmpDevs
}
```

Kern ist diese `for`-Schleife:

```go
for i := len(node.Devices.DeviceLists) - 1; i >= 0; i-- {
}
```

Auch hier beginnt die Auswahl bei der letzten GPU — passt die letzte, wird sie genommen, ohne frühere zu prüfen.

* **Binpack**: aufsteigend — GPUs hinten haben **weniger** freie Ressourcen.
* **Spread**: absteigend — GPUs hinten haben **mehr** freie Ressourcen.

Entspricht wieder der Policy-Bedeutung.

Damit ist die GPU-Policy-Analyse abgeschlossen.

### Wie das DevicePlugin GPU-Infos parst

Die gewählte GPU steht in den Pod-Annotations; das DevicePlugin parst sie.
`GetNextDeviceRequest` und `DecodePodDevices` lesen `hami.io/vgpu-devices-to-allocate` und parsen die komma-/doppelpunktgetrennte Zeichenkette.

Damit ist die Analyse von Spread und Binpack auf Knoten- und GPU-Ebene abgeschlossen.

## 4. Zusammenfassung

### Scheduling-Policy-Konfiguration

Zwei Ebenen:

* **Node Scheduling Policy**: Knotenwahl für einen Pod.
* **GPU Scheduling Policy**: GPU-Wahl auf einem Multi-GPU-Knoten.

Beide unterstützen `Spread` und `Binpack`:

* `Spread`: Tasks auf verschiedene Knoten/GPUs — gleichmäßigere Last.
* `Binpack`: Tasks auf denselben Knoten/GPU — einen zuerst füllen.

### Implementierung Knoten- und GPU-Strategie

Schritte:

1. **Scoring**: Score nach Ressourcenauslastung.
2. **Filtering**: unpassende Knoten/GPUs entfernen.
3. **Selecting**: bester Knoten/GPU per Policy — Kern in `Less` von `sort.Sort`; Spread wählt mehr Rest, Binpack weniger Rest.
4. **Recording**:
    * **Knoten**: Bind des Pods.
    * **GPU**: Eintrag in Pod-Annotations für das DevicePlugin.

---

*Mehr zum HAMi-Projekt: [GitHub](https://github.com/Project-HAMi/HAMi) oder [Slack](https://cloud-native.slack.com/archives/C07T10BU4R2).*
