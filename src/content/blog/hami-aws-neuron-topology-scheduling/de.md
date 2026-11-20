---
title: Core-Level-Sharing und policy-basiertes Topologie-Scheduling für AWS Trainium und Inferentia mit HAMi
coverTitle: Core-Level-Sharing und Topologie-Scheduling für AWS Neuron mit HAMi
date: '2025-11-11'
excerpt: >-
  Wie HAMi v2.7.0 Core-Level-Sharing und policy-basiertes Topologie-Scheduling
  für AWS Trainium und Inferentia liefert — Prior-Wissen-Scheduling-Algorithmus
  für stabile Performance bei deutlich geringeren Managementkosten.
author: Dynamia
tags:
  - HAMi
  - AWS Neuron
  - Trainium
  - Inferentia
  - Topologie-Scheduling
  - Core-Level-Sharing
  - Heterogene Compute
  - Kubernetes
  - Deep Dive
category: Technical Deep Dive
coverImage: /images/blog/hami-aws-neuron-topology/cover-en.png
language: de
linktitle: AWS Neuron Topologie-Scheduling
---
AWSs **Trainium**- und **Inferentia**-Chips ermöglichen effizientere, kostenkontrollierbare KI-Beschleunigung — nicht nur mehr Compute, sondern besseres Verhältnis von Leistung, Energie und Kosten. **Inferentia2** verbessert Perf/W deutlich; **Trainium2** spart gegenüber vergleichbaren GPU-Instanzen grob 30–40 % — daher wachsender Einsatz in großflächiger Inferenz und Training.

Mit mehr heterogenen Beschleunigern (GPU, NPU, …) verwalten getrennte Treiber und Scheduler-Typen Scheduling und Monitoring fragmentiert — Auslastung, Orchestrierung und Observability leiden, Multi-Accelerator-Cluster werden komplex.

**HAMi** adressiert das als Middleware für heterogene Devices in Kubernetes (GPU, NPU, AWS Neuron). **GPU-Virtualisierung, Core-Level-Sharing, topologiebewusstes Scheduling und einheitliche Observability** bündeln heterogene Compute-Ressourcen feinkörnig im selben Cluster.

In **HAMi v2.7.0** ist die Integration für **AWS Trainium und Inferentia** abgeschlossen: **Core-Level-Sharing, policy-basiertes Topologie-Scheduling, einheitliche Observability** — AWS-native Performance-Optimierung bleibt, Kubernetes-Ressourcenmanagement wird konsistent, **stabile Performance bei deutlich geringeren Scheduling- und Managementkosten**.

Der Artikel geht am Code entlang durch Design und Implementierung für AWS Neuron.

### 1. Kernfähigkeiten

1. **Dual-Granularität**: **Device-Level** (`aws.amazon.com/neuron`) und **Core-Level** (`aws.amazon.com/neuroncore`) — ganzes Device oder einzelne NeuronCores.
2. **Policy-basiertes Topologie-Scheduling**: bei Multi-Device-Jobs effizienter Algorithmus nach EC2-Instanztyp — Kombinationen mit höchster Kommunikationseffizienz.
3. **Einheitliches Monitoring**: Neuron in HAMis vGPU-Monitoring; Prometheus etc. wie bei GPUs.

### 2. Prinzip: Topologie-Scheduling aus Prior-Wissen

Im Gegensatz zu Echtzeit-Topologie-Scans ist HAMis Neuron-Scheduling **policy-basiert mit Prior-Wissen** — analog zur AWS Neuron Scheduler Extension: Instanztyp erkennen, vorgegebene Regeln anwenden. Standardisierte EC2-Deployments sind interne Scheduling-Regeln.

Drei Punkte:

1. **Instanztyp** vom Node (`trn1`, `inf1`/`inf2`) als **einzige Topologie-Basis**
2. **Lineare Abstraktion**: Devices als **fortlaufend nummerierte Liste** ab `0`, kein komplexer Graph
3. **Zusammenhängende Allokation**: bei `N` Devices muss ein **freier zusammenhängender Block der Länge N** existieren — sonst Fail trotz genug freier, aber nicht benachbarter Devices

### 3. Implementierung

#### **1. Instanztyp als Fundament**

* Device Plugin liest `node.kubernetes.io/instance-type` → `CustomInfo[AWSNodeType]`
* Lineare `[]*device.DeviceInfo`-Liste für Scheduling

```Go
// File: pkg/device/awsneuron/device.go
func (dev *AWSNeuronDevices) GetNodeDevices(n corev1.Node) ([]*device.DeviceInfo, error) {
        // ...
        counts, ok := n.Status.Capacity.Name(corev1.ResourceName(dev.resourceCountName), resource.DecimalSI).AsInt64()
        // ...
        customInfo := map[string]any{}
        // 1. Read instance type from node labels as the basis for topology decisions
        customInfo[AWSNodeType] = n.Labels["node.kubernetes.io/instance-type"]
        // 2. Create a linear, contiguously numbered device list
        for int64(i) < counts {
                nodedevices = append(nodedevices, &device.DeviceInfo{
                        Index:      uint(i), // Index increments contiguously from 0
                        ID:         n.Name + "-" + AWSNeuronDevice + "-" + fmt.Sprint(i),
                        Type:       AWSNeuronDevice,
                        Numa:       0, // NUMA is ignored; topology focuses on device adjacency
                        Health:     true,
                        CustomInfo: customInfo,
                })
                i++
        }
        return nodedevices, nil
}
```

#### **2. Dual-Strategie in graphSelect**

`Fit` ruft `graphSelect` auf.

##### **Strategie 1: Ring auf Inferentia**

Auf `Inf1`/`Inf2` Ring-Topologie — benachbarte Devices kommunizieren am effizientesten → **zusammenhängende** Allokation via `continuousDeviceAvailable`.

![Inferentia Ring-Topologie](/images/blog/hami-aws-neuron-topology/inferentia-ring-topology.png)

##### **Strategie 2: 2D-Torus auf Trainium**

`Trn1`: nur **1, 4, 8 oder 16** Devices; andere Counts sofort abgelehnt. Wieder `continuousDeviceAvailable` für gültige Blöcke.

![Trainium Torus 4 Devices](/images/blog/hami-aws-neuron-topology/trainium-torus-4cards.png)

![Trainium Torus 8 Devices](/images/blog/hami-aws-neuron-topology/trainium-torus-8cards.png)

```Go
// File: pkg/device/awsneuron/device.go
func graphSelect(devices []*device.DeviceUsage, count int) []int {
        // ...
        // 1. Read the previously stored instance type from device info
        if nodeType, ok := devices[0].CustomInfo[AWSNodeType].(string); ok {
                AWSNodetype = nodeType
        }
        // 2. Strategy 1: for Inferentia instances, find a contiguous block of any length
        if strings.Contains(AWSNodetype, "inf") || strings.Contains(AWSNodetype, "Inf") {
                // ...
                // The core logic is to call continuousDeviceAvailable
                res := continuousDeviceAvailable(devices, start, count)
                if len(res) > 0 { return res }
                // ...
        }
        // 3. Strategy 2: for Trainium instances, only accept specific request counts
        switch count {
        case 1, 4, 8, 16:
                {
                        // ...
                        // The core logic is also to call continuousDeviceAvailable
                        res := continuousDeviceAvailable(devices, start, count)
                        if len(res) > 0 { return res }
                        // ...
                }
        }
        return []int{} // For Trainium, requests with other counts fail here
}

// continuousDeviceAvailable checks whether count devices starting at start are all available
func continuousDeviceAvailable(devices []*device.DeviceUsage, start int, count int) []int {
        // ...
        for iterator < start+count {
                // Core check: is the device already in use?
                if devices[iterator].Used > 0 {
                        return []int{}
                }
                // ...
        }
        return res
}
```

#### **3. Core-Level-Sharing: Übersetzung der Requests**

`/neuron` vs. `/neuroncore` wird intern übersetzt:

* **Device-Level**: `N` Devices → `N` volle physische Devices
* **Core-Level**: **Aggregate Packing** („2 Cores/Device“):
  * 1 Core → 1 Device mit 1 freiem Core
  * 2 Cores → 1 Device mit 2 freien Cores
  * N>2 → `N/2` Devices mit je 2 freien Cores (ungerade N>2: Floor-Division)

### 4. Nutzung

#### **Beispiel 1: 4 Neuron Devices**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: neuron-device-demo
spec:
  restartPolicy: Never
  containers:
    - name: neuropod
      command: ["sleep","infinity"]
      image: public.ecr.aws/neuron/pytorch-inference-neuron:1.13.1-neuron-py310-sdk2.20.2-ubuntu20.04
      resources:
        limits:
          cpu: "4"
          memory: 4Gi
          # Request 4 Neuron devices; this triggers graphSelect topology optimization
          aws.amazon.com/neuron: 4
```

#### **Beispiel 2: 1 NeuronCore**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: neuron-core-demo
spec:
  restartPolicy: Never
  containers:
    - name: neuropod
      command: ["sleep","infinity"]
      image: public.ecr.aws/neuron/pytorch-inference-neuron:1.13.1-neuron-py310-sdk2.20.2-ubuntu20.04
      resources:
        limits:
          cpu: "4"
          memory: 4Gi
          # Request 1 NeuronCore for fine-grained sharing
          aws.amazon.com/neuroncore: 1
```

### 5. Zusammenfassung

**Policy statt Scan, Effizienz durch Einfachheit.** Instanztyp + zusammenhängende Indizes — Verhalten wie der offizielle AWS-Scheduler bei niedriger Komplexität. Flexibles, cloud-natives Neuron-Scheduling.

---

### Referenzen

* **HAMi v2.7.0 Release Log**
  [https://github.com/Project-HAMi/HAMi/releases/tag/v2.7.0](https://github.com/Project-HAMi/HAMi/releases/tag/v2.7.0)
* **User guide: AWS Neuron examples and operations**
  [https://project-hami.io/docs/userguide/AWSNeuron-device/enable-awsneuron-managing](https://project-hami.io/docs/userguide/AWSNeuron-device/enable-awsneuron-managing)
* **Related PR: HAMi × AWS Neuron integration**
  [https://github.com/Project-HAMi/HAMi/pull/1238](https://github.com/Project-HAMi/HAMi/pull/1238)