---
title: 'Präzise und elegant: HAMis Scheduling nach GPU-Typ und UUID'
coverTitle: 'Präzise und elegant: HAMis Scheduling nach GPU-Typ und UUID'
date: '2025-07-30'
excerpt: >-
  In diesem Artikel analysieren wir HAMis Scheduling-Funktion: feingranulares Scheduling
  nach GPU-Typ und sogar UUID.
author: “Dynamia AI Team”
tags:
  - HAMi
  - GPU-Sharing
  - vGPU
  - Kubernetes
  - Heterogene Rechenressourcen
category: Technical Deep Dive
coverImage: /images/blog/gpu9/cover2.jpg
linktitle: GPU-UUID erklärt
---

Dieser Artikel basiert auf: <https://mp.weixin.qq.com/s/1eQC2_WGhN7DMNnTW4r0cw>

Im vorherigen Artikel haben wir kurz das Funktionsprinzip von HAMi-Core (libvgpu.so) vCUDA analysiert — Wirkungsweise, CUDA-API-Interception und Ressourcenlimits für GPU-Kerne und Speicher.

Hier analysieren wir HAMis Scheduling-Funktion: feingranulares Scheduling nach GPU-Typ und sogar UUID.

## 1. Überblick

HAMi ermöglicht präzises Scheduling nach GPU-Typ und GPU-UUID:

- Nach Typ: Pods durch Angabe des GPU-Modells (z. B. A100, A40) schedulen, sodass Tasks nur auf (oder nicht auf) Karten bestimmter Typen laufen.

- Nach UUID: Tasks durch Angabe der UUID einer GPU schedulen, sodass sie nur auf der zugehörigen Karte (oder nicht darauf) laufen.

Beide Funktionen erlauben flexible Steuerung der Pod-Platzierung — für optimale Ressourcennutzung oder spezielle Hardwareanforderungen.

> Bei NVIDIA-GPUs gilt unabhängig vom Modell einheitlich `nvidia.com/gpu` als ResourceName. Selbst bei festen 10 % Rechenkern unterscheidet sich die Leistung je nach GPU. Diese Funktion eignet sich, um rechenintensive Tasks auf leistungsstarke GPUs zu legen.

Der Ablauf lässt sich in folgende Schritte gliedern:

1. Device-Plugin meldet GPU-Informationen: Typ und UUID werden gemeldet und in Node-Annotations registriert.

2. Annotations beim Pod: GPU-Typ oder UUID werden in den Pod-Annotations angegeben.

3. HAMi-Scheduler: `hami-scheduler` filtert Knoten und GPUs anhand der Annotations und registrierten GPU-Infos und wählt passenden Knoten und GPU.

4. GPU-Zuweisung: Das Device-Plugin liest die GPU-Informationen aus den Annotations und weist zu.

> Die folgende Analyse basiert auf Version v2.4.

## 2. DevicePlugin meldet GPU-Informationen

Dieser Teil wurde bereits detailliert analysiert. Empfohlen: [HAMi vGPU-Analyse Teil 1: Implementierung hami-device-plugin-nvidia](/blog/open-source-vgpu-hami-device-plugin-nvidia)

### Meldung der GPU-Informationen

Das Standard-DevicePlugin von K8s meldet pro Knoten nur die Anzahl standardisierter Ressourcen nach ResourceName, z. B. `nvidia.com/vgpu`.

Für Scheduling benötigte Angaben wie Typ, UUID, Speicher usw. fehlen. Daher wurde folgende ergänzende Logik eingeführt:

```go
// pkg/device-plugin/nvidiadevice/nvinternal/plugin/register.go#L199
func (plugin *NvidiaDevicePlugin) WatchAndRegister() {
    klog.Info("Starting WatchAndRegister")
    errorSleepInterval := time.Second * 5
    successSleepInterval := time.Second * 30
    for {
       err := plugin.RegistrInAnnotation()
       if err != nil {
          klog.Errorf("Failed to register annotation: %v", err)
          klog.Infof("Retrying in %v seconds...", errorSleepInterval)
          time.Sleep(errorSleepInterval)
       } else {
          klog.Infof("Successfully registered annotation. Next check in %v seconds...", successSleepInterval)
          time.Sleep(successSleepInterval)
       }
    }
}
```

Diese `WatchAndRegister`-Hintergrund-Goroutine erkennt GPU-Informationen auf dem Knoten und aktualisiert sie als Annotations am Node-Objekt — damit werden die GPUs registriert.

Das GPU-Informationsformat sieht so aus:

```go
// pkg/device-plugin/nvidiadevice/nvinternal/plugin/register.go#L155
res = append(res, &api.DeviceInfo{
    ID:      UUID,
    Count:   int32(*util.DeviceSplitCount),
    Devmem:  registeredmem,
    Devcore: int32(*util.DeviceCoresScaling * 100),
    Type:    fmt.Sprintf("%v-%v", "NVIDIA", Model),
    Numa:    numa,
    Health:  health,
})
```

Das Kartenmodell sollte im Format `NVIDIA-NVIDIA A40` vorliegen — `NVIDIA` ist fest, `NVIDIA A40` das Modell.

### Registrierte GPU-Informationen anzeigen

Registrierte GPU-Infos auf einem Knoten finden Sie über den Schlüssel `hami.io.node-nvidia-register` in den Node-Annotations, z. B.:

```bash
root@j99cloudvm:~# node=j99cloudvm
kubectl get node $node -o jsonpath='{.metadata.annotations.hami\.io/node-nvidia-register}'
GPU-03f69c50-207a-2038-9b45-23cac89cb67d,10,46068,100,NVIDIA-NVIDIA A40,0,true:GPU-1afede84-4e70-2174-49af-f07ebb94d1ae,10,46068,100,NVIDIA-NVIDIA A40,0,true:
```

Der Knoten enthält zwei GPUs. UUID und Typ:

- Karte 1: GPU-03f69c50-207a-2038-9b45-23cac89cb67d NVIDIA-NVIDIA A40

- Karte 2: GPU-1afede84-4e70-2174-49af-f07ebb94d1ae NVIDIA-NVIDIA A40

Bei der Nutzung müssen Sie später die genannten UUIDs oder Typen angeben.

## 3. GPU beim Pod-Erstellen angeben

> Demos im Examples-Verzeichnis: <https://github.com/Project-HAMi/HAMi/tree/master/examples/nvidia>

### Nach Typ

Festlegen, dass der Pod auf eine GPU vom Typ A40 scheduliert werden soll.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: gpu-pod
  annotations:
    nvidia.com/use-gputype: "A40"
spec:
  containers:
    - name: ubuntu-container
      image: ubuntu:18.04
      command: ["bash", "-c", "sleep 86400"]
      resources:
        limits:
          nvidia.com/gpu: 2
```

Festlegen, dass GPUs vom Typ A100 nicht verwendet werden sollen.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: gpu-pod
  annotations:
    nvidia.com/nouse-gputype: "A100"
spec:
  containers:
    - name: ubuntu-container
      image: ubuntu:18.04
      command: ["bash", "-c", "sleep 86400"]
      resources:
        limits:
          nvidia.com/gpu: 2
```

### Nach UUID

Per UUID festlegen, dass der Pod auf die entsprechende GPU scheduliert werden soll.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: gpu-pod
  annotations:
    nvidia.com/use-gpuuuid: "GPU-03f69c50-207a-2038-9b45-23cac89cb67d,GPU-03f69c50-207a-2038-9b45-23cac89cb67e"
spec:
  containers:
    - name: ubuntu-container
      image: ubuntu:18.04
      command: ["bash", "-c", "sleep 86400"]
      resources:
        limits:
          nvidia.com/gpu: 1
```

Per UUID verhindern, dass der Pod auf bestimmte GPUs scheduliert wird.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: gpu-pod
  annotations:
    nvidia.com/nouse-gpuuuid: "GPU-03f69c50-207a-2038-9b45-23cac89cb67d"
spec:
  containers:
    - name: ubuntu-container
      image: ubuntu:18.04
      command: ["bash", "-c", "sleep 86400"]
      resources:
        limits:
          nvidia.com/gpu: 2
```

## 4. Scheduler-Verarbeitung der Annotations

Die Logik für By Type, By UUID, Use und NoUse ist ähnlich; wir vertiefen nicht alle Fälle und nutzen Use ByType als Beispiel.

Vorherige Artikel zum HAMi-Scheduling:

[HAMi vGPU-Analyse Teil 3: hami-scheduler-Workflow](/blog/open-source-vgpu-hami-scheduler)

[HAMi vGPU-Analyse Teil 4: Spread- und Binpack-Scheduling](/blog/open-source-vgpu-spread-binpack)

Der Scheduling-Ablauf:

![HAMi scheduling workflow diagram showing Pod creation and GPU allocation process](/images/blog/gpu5/p1-en.png)

1. Ein Nutzer erstellt einen Pod und fordert darin vGPU-Ressourcen an.

2. Der kube-apiserver ruft gemäß MutatingWebhookConfiguration den HAMi-Webhook auf.

3. Der HAMi-Webhook prüft die Ressourcen im Pod. Werden von HAMi verwaltete vGPU-Ressourcen angefordert, setzt er den SchedulerName auf `hami-scheduler` — der Pod wird vom hami-scheduler scheduliert.
    - Bei privilegierten Pods überspringt der Webhook die Verarbeitung.
    - Pods mit vGPU-Ressourcen und gesetztem `nodeName` werden abgelehnt.

4. Der hami-scheduler scheduliert den Pod. Er nutzt das Standard-kube-scheduler-Image, die Basislogik entspricht dem default-scheduler. **Zusätzlich ruft der kube-scheduler per KubeSchedulerConfiguration das Extender-Scheduler-Plugin auf.**
    - Das Extender-Scheduler ist ein weiterer Container im hami-scheduler-Pod mit Webhook- und Scheduler-APIs.
    - Fordert ein Pod vGPU-Ressourcen an, ruft der kube-scheduler das Extender-Plugin per HTTP auf und implementiert so Custom-Scheduling.

5. Das Extender-Plugin enthält die eigentliche HAMi-Scheduling-Logik: Bewertung und Knotenwahl nach verbleibenden Ressourcen.
    - Darin u. a. Spread- und Binpack-Strategien.

6. Asynchrone Tasks inklusive GPU-Erkennung.
    - Eine Hintergrund-Goroutine im devicePlugin meldet periodisch GPU-Ressourcen auf dem Knoten in Node-Annotations.
    - Zusätzlich können asynchrone Tasks weitere Infos per Annotation-Patch liefern.
    - Das Extender-Plugin liest Gesamt-GPU-Ressourcen aus Node-Annotations und belegte Ressourcen aus Annotations laufender Pods, berechnet verfügbare Restressourcen pro Knoten und hält sie im Speicher für Scheduling bereit.

Scheduling erfolgt auf Knoten- und Kartenebene. Standardmäßig wählt die konfigurierte Binpack- oder Spread-Policy das Ziel.

GPU-Angabe per Annotation ist zusätzliche Logik: passende Karte nach Annotation-Konfiguration wählen, dann passenden Knoten zur Karte.

### Nicht erfüllte Karten anhand der Annotations filtern

Kernlogik in `fitInCertainDevice`: jede Karte einzeln prüfen — Core und Speicher gegen Pod-Anfrage, Typ- und UUID-Restriktionen aus den Annotations.

Erfüllt keine Karte auf einem Knoten die Bedingungen, scheidet der Knoten ebenfalls aus.

Übrig bleiben Knoten und passende Karten; Zielknoten und -karte werden per Binpack- oder Spread-Policy gewählt.

```go
// pkg/scheduler/score.go#L65
func fitInCertainDevice(node *NodeUsage, request util.ContainerDeviceRequest, annos map[string]string, pod *corev1.Pod, allocated *util.PodDevices) (bool, map[string]util.ContainerDevices) {
    k := request
    originReq := k.Nums
    prevnuma := -1
    klog.InfoS("Allocating device for container request", "pod", klog.KObj(pod), "card request", k)
    var tmpDevs map[string]util.ContainerDevices
    tmpDevs = make(map[string]util.ContainerDevices)
    for i := len(node.Devices.DeviceLists) - 1; i >= 0; i-- {
        found, numa := checkType(annos, *node.Devices.DeviceLists[i].Device, k)
        if !found {
            continue
        }
        if numa && prevnuma != node.Devices.DeviceLists[i].Device.Numa {
            k.Nums = originReq
            prevnuma = node.Devices.DeviceLists[i].Device.Numa
            tmpDevs = make(map[string]util.ContainerDevices)
        }
        if !checkUUID(annos, *node.Devices.DeviceLists[i].Device, k) {
            continue
        }

        memreq := int32(0)
        if node.Devices.DeviceLists[i].Device.Count <= node.Devices.DeviceLists[i].Device.Used {
            continue
        }
        if k.Coresreq > 100 {
            klog.ErrorS(nil, "core limit can't exceed 100", "pod", klog.KObj(pod))
            k.Coresreq = 100
            //return false, tmpDevs
        }
        if k.Memreq > 0 {
            memreq = k.Memreq
        }
        if k.MemPercentagereq != 101 && k.Memreq == 0 {
            //This incurs an issue
            memreq = node.Devices.DeviceLists[i].Device.Totalmem * k.MemPercentagereq / 100
        }
        if node.Devices.DeviceLists[i].Device.Totalmem-node.Devices.DeviceLists[i].Device.Usedmem < memreq {
            continue
        }
        if node.Devices.DeviceLists[i].Device.Totalcore-node.Devices.DeviceLists[i].Device.Usedcores < k.Coresreq {
            continue
        }
        // Coresreq=100 indicates it want this card exclusively
        if node.Devices.DeviceLists[i].Device.Totalcore == 100 && k.Coresreq == 100 && node.Devices.DeviceLists[i].Device.Used > 0 {
            continue
        }
        // You can't allocate core=0 job to an already full GPU
        if node.Devices.DeviceLists[i].Device.Totalcore != 0 && node.Devices.DeviceLists[i].Device.Usedcores == node.Devices.DeviceLists[i].Device.Totalcore && k.Coresreq == 0 {
            continue
        }
        if !device.GetDevices()[k.Type].CustomFilterRule(allocated, request, tmpDevs[k.Type], node.Devices.DeviceLists[i].Device) {
            continue
        }
        if k.Nums > 0 {
            klog.InfoS("first fitted", "pod", klog.KObj(pod), "device", node.Devices.DeviceLists[i].Device.ID)
            k.Nums--
            tmpDevs[k.Type] = append(tmpDevs[k.Type], util.ContainerDevice{
                Idx:       int(node.Devices.DeviceLists[i].Device.Index),
                UUID:      node.Devices.DeviceLists[i].Device.ID,
                Type:      k.Type,
                Usedmem:   memreq,
                Usedcores: k.Coresreq,
            })
        }
        if k.Nums == 0 {
            klog.InfoS("device allocate success", "pod", klog.KObj(pod), "allocate device", tmpDevs)
            return true, tmpDevs
        }
        if node.Devices.DeviceLists[i].Device.Mode == "mig" {
            i++
        }
    }
    return false, tmpDevs
}
```

### By Type

```go
// pkg/scheduler/score.go#L38
func checkType(annos map[string]string, d util.DeviceUsage, n util.ContainerDeviceRequest) (bool, bool) {
    // General type check, NVIDIA->NVIDIA MLU->MLU
    klog.V(3).InfoS("Type check", "device", d.Type, "req", n.Type)
    if !strings.Contains(d.Type, n.Type) {
        return false, false
    }
    for _, val := range device.GetDevices() {
        found, pass, numaAssert := val.CheckType(annos, d, n)
        if found {
            return pass, numaAssert
        }
    }
    klog.Infof("Unrecognized device %s", n.Type)
    return false, false
}

func checkGPUtype(annos map[string]string, cardtype string) bool {
    cardtype = strings.ToUpper(cardtype)
    if inuse, ok := annos[GPUInUse]; ok {
        useTypes := strings.Split(inuse, ",")
        // if false return false...
        if !ContainsSliceFunc(useTypes, func(useType string) bool {
            return strings.Contains(cardtype, strings.ToUpper(useType))
        }) {
            return false
        }
    }
    if unuse, ok := annos[GPUNoUse]; ok {
        unuseTypes := strings.Split(unuse, ",")
        // if true return false
        if ContainsSliceFunc(unuseTypes, func(unuseType string) bool {
            return strings.Contains(cardtype, strings.ToUpper(unuseType))
        }) {
            return false
        }
    }
    return true
}
```

Enthalten sind TypeUse und TypeNoUse.

```go
if inuse, ok := annos[GPUInUse]; ok {
    useTypes := strings.Split(inuse, ",")
    // if false return false...
    if !ContainsSliceFunc(useTypes, func(useType string) bool {
        return strings.Contains(cardtype, strings.ToUpper(useType))
    }) {
        return false
    }
}```

`cardtype` hat ein Format wie `NVIDIA-NVIDIA-A40`, `useType` ist der vom Nutzer in den Annotations angegebene Typ.

`strings.Contains(cardtype, strings.ToUpper(useType))` dient dem Matching — in den Annotations sind vollständiger Name wie `NVIDIA-NVIDIA-A40` oder Kurzname `A40` möglich.

Passt die aktuelle Karte zu keinem Use-Typ aus den Annotations, liefert die Prüfung false.

Bei NoUse: trifft die Karte einen Eintrag in NoUse, steht sie auf der Blacklist — ebenfalls false.

```go
if unuse, ok := annos[GPUNoUse]; ok {
    unuseTypes := strings.Split(unuse, ",")
    // if true return false
    if ContainsSliceFunc(unuseTypes, func(unuseType string) bool {
        return strings.Contains(cardtype, strings.ToUpper(unuseType))
    }) {
        return false
    }
}
```

So werden nicht passende Karten herausgefiltert.

### Nach UUID

Gleiches Prinzip: Use- und NoUse-UUID-Listen aus den Annotations parsen und die aktuelle Karte matchen.

```go
// pkg/scheduler/score.go#L54
func checkUUID(annos map[string]string, d util.DeviceUsage, n util.ContainerDeviceRequest) bool {
    devices, ok := device.GetDevices()[n.Type]
    if !ok {
        klog.Errorf("can not get device for %s type", n.Type)
        return false
    }
    result := devices.CheckUUID(annos, d)
    klog.V(2).Infof("checkUUID result is %v for %s type", result, n.Type)
    return result
}

func (dev *NvidiaGPUDevices) CheckUUID(annos map[string]string, d util.DeviceUsage) bool {
    userUUID, ok := annos[GPUUseUUID]
    if ok {
        klog.V(5).Infof("check uuid for nvidia user uuid [%s], device id is %s", userUUID, d.ID)
        // use , symbol to connect multiple uuid
        userUUIDs := strings.Split(userUUID, ",")
        for _, uuid := range userUUIDs {
            if d.ID == uuid {
                return true
            }
        }
        return false
    }

    noUserUUID, ok := annos[GPUNoUseUUID]
    if ok {
        klog.V(5).Infof("check uuid for nvidia not user uuid [%s], device id is %s", noUserUUID, d.ID)
        // use , symbol to connect multiple uuid
        noUserUUIDs := strings.Split(noUserUUID, ",")
        for _, uuid := range noUserUUIDs {
            if d.ID == uuid {
                return false
            }
        }
        return true
    }

    return true
}
```

> Hinweis: Im Gegensatz zum Typ erfolgt UUID-Matching exakt.

### Zielkarte in Annotations speichern

Nach `fitInCertainDevice` bindet die Bind-Schnittstelle des Schedulers Knoten und Pod. Die Karte weist das DevicePlugin zu; der Scheduler schreibt die Kartenwahl als Annotations, die das DevicePlugin liest.

```go
sort.Sort(nodeScores)
m := (*nodeScores).NodeList[len((*nodeScores).NodeList)-1]
klog.Infof("schedule %v/%v to %v %v", args.Pod.Namespace, args.Pod.Name, m.NodeID, m.Devices)
annotations := make(map[string]string)
annotations[util.AssignedNodeAnnotations] = m.NodeID
annotations[util.AssignedTimeAnnotations] = strconv.FormatInt(time.Now().Unix(), 10)

for _, val := range device.GetDevices() {
    val.PatchAnnotations(&annotations, m.Devices)
}
```

Die Annotations sehen etwa so aus:

```yaml
root@test:~/lixd/hami# k get po hami-30 -oyaml
apiVersion: v1
kind: Pod
metadata:
  annotations:
    hami.io/bind-phase: allocating
    hami.io/bind-time: "1732072495"
    hami.io/vgpu-devices-allocated: GPU-1afede84-4e70-2174-49af-f07ebb94d1ae,NVIDIA,20000,30:;
    hami.io/vgpu-devices-to-allocate: GPU-1afede84-4e70-2174-49af-f07ebb94d1ae,NVIDIA,20000,30:;
    hami.io/vgpu-node: test
    hami.io/vgpu-time: "1732072495"
```

`hami.io/vgpu-devices-to-allocate` ist die vom Scheduler für den Pod gewählte Ziel-GPU.

## 5. DevicePlugin parst und weist die GPU zu

Beim Scheduling wurde die gewählte GPU in den Pod-Annotations festgehalten. Das DevicePlugin wählt nicht selbst — es parst die Annotations.

```go
// pkg/util/util.go#L281
func GetNextDeviceRequest(dtype string, p corev1.Pod) (corev1.Container, ContainerDevices, error) {
    pdevices, err := DecodePodDevices(InRequestDevices, p.Annotations)
    if err != nil {
        return corev1.Container{}, ContainerDevices{}, err
    }
    klog.Infof("pod annotation decode value is %+v", pdevices)
    res := ContainerDevices{}

    pd, ok := pdevices[dtype]
    if !ok {
        return corev1.Container{}, res, errors.New("device request not found")
    }
    for ctridx, ctrDevice := range pd {
        if len(ctrDevice) > 0 {
            return p.Spec.Containers[ctridx], ctrDevice, nil
        }
    }
    return corev1.Container{}, res, errors.New("device request not found")
}

// pkg/util/util.go#L254
func DecodePodDevices(checklist map[string]string, annos map[string]string) (PodDevices, error) {
    klog.V(5).Infof("checklist is [%+v], annos is [%+v]", checklist, annos)
    if len(annos) == 0 {
        return PodDevices{}, nil
    }
    pd := make(PodDevices)
    for devID, devs := range checklist {
        str, ok := annos[devs]
        if !ok {
            continue
        }
        pd[devID] = make(PodSingleDevice, 0)
        for _, s := range strings.Split(str, OnePodMultiContainerSplitSymbol) {
            cd, err := DecodeContainerDevices(s)
            if err != nil {
                return PodDevices{}, nil
            }
            if len(cd) == 0 {
                continue
            }
            pd[devID] = append(pd[devID], cd)
        }
    }
    klog.InfoS("Decoded pod annos", "poddevices", pd)
    return pd, nil
}
```

Die Parsing-Logik teilt nach vorgegebenen Regeln an Doppelpunkten und Kommas.

```go
// pkg/util/util.go#L223
func DecodeContainerDevices(str string) (ContainerDevices, error) {
    if len(str) == 0 {
        return ContainerDevices{}, nil
    }
    cd := strings.Split(str, OneContainerMultiDeviceSplitSymbol)
    contdev := ContainerDevices{}
    tmpdev := ContainerDevice{}
    klog.V(5).Infof("Start to decode container device %s", str)
    if len(str) == 0 {
        return ContainerDevices{}, nil
    }
    for _, val := range cd {
        if strings.Contains(val, ",") {
            //fmt.Println("cd is ", val)
            tmpstr := strings.Split(val, ",")
            if len(tmpstr) < 4 {
                return ContainerDevices{}, fmt.Errorf("pod annotation format error; information missing, please do not use nodeName field in task")
            }
            tmpdev.UUID = tmpstr[0]
            tmpdev.Type = tmpstr[1]
            devmem, _ := strconv.ParseInt(tmpstr[2], 10, 32)
            tmpdev.Usedmem = int32(devmem)
            devcores, _ := strconv.ParseInt(tmpstr[3], 10, 32)
            tmpdev.Usedcores = int32(devcores)
            contdev = append(contdev, tmpdev)
        }
    }
    klog.V(5).Infof("Finished decoding container devices. Total devices: %d", len(contdev))
    return contdev, nil
}
```

Damit ist der gesamte Ablauf abgeschlossen.

## 6. Zusammenfassung

1. HAMi erlaubt, Scheduling auf (oder von) bestimmten GPU-Typen bzw. einzelnen GPUs festzulegen:
    - Nach Typ: nur auf (oder nicht auf) Karten bestimmter Typen, z. B. A100, A40.
    - Nach UUID: nur auf (oder nicht auf) die Karte mit dieser UUID.
    - Nützlich bei mehreren GPU-Typen im Cluster.

2. Registrierte GPU-Infos am Knoten über `hami.io.node-nvidia-register` in den Node-Annotations, z. B.:

    ```bash
    root@j99cloudvm:~# node=j99cloudvm
    kubectl get node $node -o jsonpath='{.metadata.annotations.hami\.io/node-nvidia-register}'
    GPU-03f69c50-207a-2038-9b45-23cac89cb67d,10,46068,100,NVIDIA-NVIDIA A40,0,true:GPU-1afede84-4e70-2174-49af-f07ebb94d1ae,10,46068,100,NVIDIA-NVIDIA A40,0,true:
    ```

3. Matching-Regeln:
    - Typ: derzeit `strings.Contains` — voller Name `NVIDIA-NVIDIA A40` oder Kurzname `A40`.
    - UUID: exaktes Match, identisch.
4. Falsche Annotations (nicht existierende UUID oder Typ) führen zu Scheduling-Fehlschlag; der Pod bleibt Pending.

---

*Mehr zum HAMi-Projekt: [GitHub-Repository](https://github.com/Project-HAMi/HAMi) oder [Slack-Community](https://cloud-native.slack.com/archives/C07T10BU4R2).*

---
