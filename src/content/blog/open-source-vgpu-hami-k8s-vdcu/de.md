---
title: >-
  HAMi heterogene Gerätevirtualisierung mit Hygon DCU: vDCU-Ressourcen-Scheduling in K8s
coverTitle: Hygon-DCU-Virtualisierung mit HAMi
date: '2025-07-31'
excerpt: >-
  Der Artikel analysiert, wie Hygon-DCU-Geräte über HAMi virtualisiert werden können,
  um einheitliches Management und Scheduling zu erreichen.
author: Dynamia AI Team
tags:
  - HAMi
  - GPU-Sharing
  - vGPU
  - Kubernetes
  - Heterogene Computing
category: Technical Deep Dive
coverImage: /images/blog/gpu10/cover2.jpg
linktitle: HAMi DCU-Unterstützung
---


Dieser Artikel basiert auf: <https://mp.weixin.qq.com/s/gpyhltXK3CSTkwk4ZwD74A>

Nach einer Serie zu Deployment, Nutzung und Implementierung von HAMi-vGPU analysiert dieser Artikel die Virtualisierung von Hygon-DCU-Geräten über HAMi für einheitliches Management und Scheduling.

## 1. vDCU-relevante Befehle

Zuerst kurz die native vDCU-Funktionalität von Hygon DCU.

### 1.1 Physische DCU-Ressourcen anzeigen

```bash
$ hy-smi virtual -show-device-info

Device 0:
 Actual Device: 0
 Compute units: 60
 Global memory: 34342961152 bytes
Device 1:
 Actual Device: 1
 Compute units: 60
 Global memory: 34342961152 bytes
```

### 1.2 vDCU aufteilen

Eine DCU in 4 Teile mit 5, 15, 20 und 20 Compute Units sowie 4096, 8192, 8192 und 8192 MiB Videospeicher.

```bash
$ hy-smi virtual -create-vdevices 4 -d 0 \
-vdevice-compute-units 5,15,20,20 \
-vdevice-memory-size 4096,8192,8192,8192

The virtual device is created successfully!
```

### 1.3 vDCU-Informationen anzeigen

```bash
$ hy-smi virtual -show-vdevice-info
Virtual Device 0:
 Actual Device: 7
 Compute units: 5
 Global memory: 4294967296 bytes
- 5 -
Virtual Device 1:
 Actual Device: 7
 Compute units: 15
 Global memory: 8589934592 bytes
Virtual Device 2:
 Actual Device: 7
 Compute units: 20
 Global memory: 8589934592 bytes
Virtual Device 3:
 Actual Device: 7
 Compute units: 20
 Global memory: 8589934592 bytes```

### 1.4 vDCU zerstören

```bash
# -d ${dev_id} specifies the physical DCU ID. If not specified, all physical DCUs are selected.
# -destroy-vdevice destroys all vDCUs on this physical DCU.
hy-smi virtual -d ${dev_id} -destroy-vdevice
```

### 1.5 vDCU mit Docker nutzen

Beim Container-Start den vDCU einbinden. Das folgende Beispiel bindet die 0. vDCU-Instanz ein.

```bash
docker run -it --name container_name \
--device=/dev/kfd \
--device=/dev/dri \
--device=/dev/mkfd \
-v /etc/vdev/vdev0.conf:/etc/vdev/docker/vdev0.conf:ro \
${docker_image:tag} \
/bin/bash
```

**Neben Gerätedateien wie kfd, dri und mkfd per `--device` wird zusätzlich `/etc/vdev/vdev0.conf` in den Container gemountet.**

Diese Datei ist die vDCU-Konfiguration mit allen Details.

Der Treiber prüft die Datei: existiert sie, ist ein vDCU aktiv; daraus werden physische DCU, Core, Speicher usw. für Limits ermittelt.

Als Nächstes: vDCU in HAMi.

## 2. HAMi deployen

Voraussetzungen:

- dtk driver >= 24.04

### 2.1 Deployment

Deployment mit Helm.

```bash
# Add repo
helm repo add hami-charts https://project-hami.github.io/HAMi/
# Install
helm install hami hami-charts/hami -n kube-system
```

> PS: Installation anpassen über die [HAMi-Deployment-Konfiguration](https://github.com/Project-HAMi/HAMi/blob/master/docs/config.md).

Kann die Umgebung keine Online-Images pullen, ein Image-Repository angeben.

```bash
export registry=192.168.10.172:5000
# If no tag is specified, the same version as the current cluster will be used automatically. Ensure the Registry has this image.
export kubescheduler=$registry/kube-scheduler

helm upgrade --install hami hami-charts/hami -n kube-system \
--set scheduler.kubeScheduler.image=$kubescheduler \
--set scheduler.extender.image=$registry/projecthami/hami \
--set scheduler.patch.imageNew=$registry/liangjw/kube-webhook-certgen:v1.1.1
```

### 2.2 Pod-Laufstatus prüfen

```bash
$ kubectl -n kube-system get po -l app.kubernetes.io/name=hami
NAME                              READY   STATUS    RESTARTS   AGE
hami-scheduler-6dbdf69644-mz9m5   2/2     Running   0          2m19s
```

Ist `hami-scheduler` Running, war die Installation erfolgreich.

>PS: In einer DCU-Umgebung startet nur der hami-scheduler-Pod.

## 3. hami-vdcu-device-plugin deployen

```bash
# Das DevicePlugin nutzt die von der HAMi-Community bereitgestellte Version.
# Zuerst DCU-Knoten mit dcu=on labeln.
kubectl label nodes {nodeid} dcu=on
```

### 3.1 Preparation

Folgende Vorbereitungen:

vdev-Verzeichnis anlegen.

```bash
# Auf dem DCU-Knoten dieses Verzeichnis anlegen:
$ mkdir /etc/vdev
```

DTK nach /opt/dtk kopieren.

>Der Container mountet einheitlich /opt/dtk — daher vom Deployment-Verzeichnis dorthin kopieren.

```bash
# should change dtk-xx.xx.x to your installed dtk version
$ cp -r /opt/dtk-xx.xx.x /opt/dtk
```

Hinweis: `/opt/dtk-xx.xx.x` hängt vom DTK-Deployment-Pfad ab.

### 3.2 Deployment

Jetzt das Deployment starten.

YAML vom Projekt <https://github.com/Project-HAMi/dcu-vgpu-device-plugin>:

```bash
wget https://raw.githubusercontent.com/Project-HAMi/dcu-vgpu-device-plugin/refs/heads/master/k8s-dcu-plugin.yaml
wget https://raw.githubusercontent.com/Project-HAMi/dcu-vgpu-device-plugin/refs/heads/master/k8s-dcu-rbac.yaml
```

Dann das Device-Plugin deployen.

```bash
kubectl apply -f k8s-dcu-rbac.yaml
kubectl apply -f k8s-dcu-plugin.yaml
```

### 3.3 Pod-Laufstatus prüfen

Prüfen, dass die Komponenten laufen:

```bash
$ kubectl get po -n kube-code
NAMESPACE     NAME                                      READY   STATUS    RESTARTS   AGE
kube-code     hami-dcu-vgpu-device-plugin-cgwwv        1/1     Running   4          14m
kube-code     hami-dcu-vgpu-device-plugin-lp7gl        1/1     Running   0          8m36s
kube-code     hami-dcu-vgpu-device-plugin-lswbl        1/1     Running   0          8m40s
kube-code     hami-dcu-vgpu-device-plugin-svwl7        1/1     Running   0          8m38s
kube-code     hami-scheduler-bb5586989-q7bvr           2/2     Running   0          54m
```

Die dcu-vdcu-device-plugin-Pods auf den DCU-Knoten laufen normal.

Komponenten sind deployt. Als Nächstes vDCU verifizieren.

## 4. vDCU verifizieren

### 4.1 Knotenressourcen anzeigen

Knotenressourcen und korrekte vDCU-Registrierung prüfen.

```bash
$ kubectl describe node d41gpucns41 | grep Capacity -A 8  
Capacity:
  cpu:                64
  ephemeral-storage:  934609028Ki
  hugepages-1Gi:      0
  hugepages-2Mi:      0
  hygon.com/dcu:      0
  hygon.com/dcunum:   32
  memory:             1043017856Ki
  pods:               500
```

Hier ist `hygon.com/dcunum: 32` die vDCU-Anzahl. Ein Knoten hat 8 DCUs, hier 4-fach geteilt.

>PS: Eine physische Hygon-DCU unterstützt derzeit maximal 4 vDCUs.

### 4.2 Pod mit vDCU starten

Vollständiges YAML:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: alexnet-tf-gpu-pod-mem
  labels:
    purpose: demo-tf-amdgpu
spec:
  containers:
    - name: alexnet-tf-gpu-container
      image: ubuntu:20.04
      workingDir: /root
      command: ["sleep", "infinity"]
      resources:
        limits:
          hygon.com/dcunum: 1 # requesting a GPU
          hygon.com/dcumem: 2000 # each dcu require 2000 MiB device memory
          hygon.com/dcucores: 15 # each dcu use 15% of total compute cores```

Wie bei vGPU: Anzahl Karten, Core, Speicher usw. separat angeben.

Im Pod zuerst Umgebungsvariablen sourcen.

```bash
source /opt/hygondriver/env.sh
```

Zur Verifikation:

```bash
hy-virtual -show-device-info
```

```bash
Device 0:
        Actual Device: 0
        Compute units: 9
        Global memory: 2097152000 bytes
```

`Compute units` und `Global memory` entsprechen den zuvor gesetzten Core- und Speicherwerten.

Damit ist bestätigt, dass HAMi-vDCU funktioniert.

### 4.3 Hinweise

Wichtige Hinweise:

1. Ist das Image kein „dtk-embedded-image“, nach Task-Start `pciutils`, `libelf-dev` und `kmod` installieren, sonst funktionieren `hy-smi` oder `hy-virtual` ggf. nicht.

2. DCU-Sharing in Init-Containern nicht unterstützt. Pods mit "hygon.com/dcumem" im Init-Container werden nicht scheduliert.

3. Pro Container nur ein vDCU. Für mehrere DCU-Geräte `hygon.com/dcumem` oder `hygon.com/dcucores` nicht setzen.

## 5. Implementierungsanalyse

Kurze Analyse des vdcu-device-plugins. Neben Gerätereporting und -zuteilung muss es zusätzlich:

1. **vDCU-Konfigurationsdateien pflegen**
    - Beim Pod-Erstellen vDCU-Konfiguration aus angefordertem Core und Speicher im YAML erzeugen.
    - Beim Pod-Löschen die Konfigurationsdatei entfernen.

2. **vDCU-Konfigurationsdatei in den Pod mounten**
    - Nur so kennt der Treiber Core- und Speicherlimits des vDCU.

Empfohlen vorher zu lesen:
[HAMi-vGPU-Analyse Teil 1: hami-device-plugin-nvidia](/blog/open-source-vgpu-hami-device-plugin-nvidia)

Die Implementierungen sind ähnlich.

### 5.1 Registrierung

Das DevicePlugin muss beim Kubelet registriert werden. Hier über `device-plugin-manager` ohne separaten Registrierungscode — Startarbeiten:

```go
// Start is an optional interface that could be implemented by plugin.
// If case Start is implemented, it will be executed by Manager after
// plugin instantiation and before its registration to kubelet. This
// method could be used to prepare resources before they are offered
// to Kubernetes.
func (p *Plugin) Start() error {
    var err error

    // Initialize device info
    dcgm.Init()
    p.devices, err = dcgm.DeviceInfos()
    if err != nil {
        log.Fatalf("dcgm DeviceInfos failed:%s", err.Error())
    }
    for idx := range p.devices {
        p.devices[idx].DevTypeName = fmt.Sprintf("%v-%v", "DCU", p.devices[idx].DevTypeName)
    }
    fmt.Println("infos=", p.devices)

    for idx, val := range p.devices {
        p.coremask[idx][0] = initCoreUsage(int(val.ComputeUnit))
        p.coremask[idx][1] = initCoreUsage(int(val.ComputeUnit))
    }

    go p.WatchAndRegister()
    return nil
}
```

Beim Start DCU-Infos über `dcgm.DeviceInfos()`.

```go
dcgm.Init()
p.devices, err = dcgm.DeviceInfos()
if err != nil {
    log.Fatalf("dcgm DeviceInfos failed:%s", err.Error())
}
for idx := range p.devices {
    p.devices[idx].DevTypeName = fmt.Sprintf("%v-%v", "DCU", p.devices[idx].DevTypeName)
}
fmt.Println("infos=", p.devices)

for idx, val := range p.devices {
    p.coremask[idx][0] = initCoreUsage(int(val.ComputeUnit))
    p.coremask[idx][1] = initCoreUsage(int(val.ComputeUnit))
}
```

### DeviceInfos

Konkrete Implementierung:

```go
// DeviceInfos gets the list of device information.
// @Summary Get the list of device information
// @Description Returns a list of detailed information for all devices
// @Produce json
// @Success 200 {array} DeviceInfo "Returns a list of device information"
// @Failure 500 {object} error "Internal server error"
// @Router /DeviceInfos [get]
func DeviceInfos()(deviceInfos []DeviceInfo, err error) {
    numDevices, err := rsmiNumMonitorDevices()
    if err != nil {
        return nil, err
    }
    for i := 0; i < numDevices; i++ {
        bdfid, err := rsmiDevPciIdGet(i)
        if err != nil {
            return nil, err
        }
        // Parse BDFID
        domain := (bdfid >> 32) & 0xffffffff
        bus := (bdfid >> 8) & 0xff
        dev := (bdfid >> 3) & 0x1f
        function := bdfid & 0x7
        // Format PCI ID
        pciBusNumber := fmt.Sprintf("%04X:%02X:%02X.%X", domain, bus, dev, function)
        // Device serial number
        deviceId, _ := rsmiDevSerialNumberGet(i)
        // Get device type identifier id
        devTypeId, _ := rsmiDevIdGet(i)
        devType := fmt.Sprintf("%x", devTypeId)
        // Model name
        devTypeName := type2name[devType]
        // Get total device memory
        memoryTotal, _ := rsmiDevMemoryTotalGet(i, RSMI_MEM_TYPE_FIRST)
        mt, _ := strconv.ParseFloat(fmt.Sprintf("%f", float64(memoryTotal)/1.0), 64)
        glog.Info(" DCU[%v] memory total memory total: %.0f", i, mt)
        // Get used device memory
        memoryUsed, _ := rsmiDevMemoryUsageGet(i, RSMI_MEM_TYPE_FIRST)
        mu, _ := strconv.ParseFloat(fmt.Sprintf("%f", float64(memoryUsed)/1.0), 64)
        glog.Info(" DCU[%v] memory used :%.0f", i, mu)
        computeUnit := computeUnitType[devTypeName]
        glog.Info(" DCU[%v] computeUnit : %.0f", i, computeUnit)
        deviceInfo := DeviceInfo{
            DvInd:       i,
            DeviceId:    deviceId,
            DevType:     devType,
            DevTypeName: devTypeName,
            PciBusNumber: pciBusNumber,
            MemoryTotal: mt,
            MemoryUsed:  mu,
            ComputeUnit: computeUnit,
        }
        deviceInfos = append(deviceInfos, deviceInfo)
    }
    glog.Info("deviceInfos: ", dataToJson(deviceInfos))
    return
}
```

```go
package dcgm

/*
#cgo CFLAGS: -Wall -I./include
#cgo LDFLAGS: -L./lib -lrocm_smi64 -lhydmi -Wl,--unresolved-symbols=ignore-in-object-files
#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <kfd_ioctl.h>
#include <rocm_smi64Config.h>
#include <rocm_smi.h>
#include <dmi_virtual.h>
#include <dmi_error.h>
#include <dmi.h>
#include <dmi_mig.h>
*/
import "C"
import (
    "encoding/json"
    "fmt"
    "os"
    "unsafe"

    "github.com/golang/glog"
)

// rsmiNumMonitorDevices gets the number of gpus *
func rsmiNumMonitorDevices()(gpuNum int, err error){
    var p C.uint
    ret := C.rsmi_num_monitor_devices(&p)
    //glog.Info("go_rsmi_num_monitor_devices_ret:", ret)
    if err = errorString(ret); err != nil {
        return 0, fmt.Errorf("Error go_rsmi_num_monitor_devices_ret: %s", err)
    }
    gpuNum = int(p)
    //glog.Info("go_rsmi_num_monitor_devices:", gpuNum)
    return gpuNum, nil
}

// rsmiDevPciIdGet gets the unique pci device identifier
func rsmiDevPciIdGet(dvInd int) (bdfid int64, err error) {
    var cbdfid C.uint64_t
    ret := C.rsmi_dev_pci_id_get(C.uint32_t(dvInd), &cbdfid)
    //glog.Infof("rsmi_dev_pci_id_get ret:%v, retStr:%v", ret, errorString(ret))
    if err = errorString(ret); err != nil {
        glog.Errorf("rsmi_dev_pci_id_get err:%v", err.Error())
        return bdfid, err
    }
    bdfid = int64(cbdfid)
    //glog.Infof("rsmiDevPciIdGet bdfid:%v", bdfid)
    return
}
```

### WatchAndRegister

Diese Methode ruft vor allem zwei andere auf:

- `RefreshContainerDevices`: Pflegt vDCU-Konfiguration, entfernt Dateien nach Pod-Löschung.
- `RegistrInAnnotation`: Schreibt physische DCU-Infos in die Knoten-Annotation.

```go
func (r *Plugin) WatchAndRegister() {
    klog.Info("into WatchAndRegister")
    for {
        r.RefreshContainerDevices()
        err := r.RegistrInAnnotation()
        if err != nil {
            klog.Errorf("register error, %v", err)
            time.Sleep(time.Second * 5)
        } else {
            time.Sleep(time.Second * 30)
        }
    }
}
```

### RefreshContainerDevices

Anhand der Dateien in `/usr/local/vgpu/dcu` und Pod-Infos in Kubernetes: vDCU-Nutzungsstatus aktualisieren und ungenutzte Konfigurationen bereinigen.

```go
func (p *Plugin) RefreshContainerDevices() error {
    files, err := os.ReadDir("/usr/local/vgpu/dcu")
    if err != nil {
        return err
    }
    idx := 0
    for idx < len(p.devices) {
        p.coremask[idx][0] = initCoreUsage(int(p.devices[idx].ComputeUnit))
        p.coremask[idx][1] = initCoreUsage(int(p.devices[idx].ComputeUnit))
        idx++
    }

    for _, f := range files {
        pods, err := client.GetClient().CoreV1().Pods("").List(context.Background(), metav1.ListOptions{})
        if err != nil {
            return err
        }
        found := false
        for _, val := range pods.Items {
            if strings.Contains(f.Name(), string(val.UID)) {
                found = true
                var didx, pid, vdidx int
                tmpstr := strings.Split(f.Name(), "_")
                didx, _ = strconv.Atoi(tmpstr[2])
                pid, _ = strconv.Atoi(tmpstr[3])
                vdidx, _ = strconv.Atoi(tmpstr[4])
                p.coremask[didx][0], _ = addCoreUsage(p.coremask[didx][0], tmpstr[5])
                p.coremask[didx][1], _ = addCoreUsage(p.coremask[didx][1], tmpstr[6])
                p.vidx[vdidx] = true
                p.pipeid[didx][pid] = true
            }
        }
        if !found {
            var didx, pid, vdidx int
            tmpstr := strings.Split(f.Name(), "_")
            didx, _ = strconv.Atoi(tmpstr[2])
            pid, _ = strconv.Atoi(tmpstr[3])
            vdidx, _ = strconv.Atoi(tmpstr[4])
            p.vidx[vdidx] = false
            p.pipeid[didx][pid] = false
            os.RemoveAll("/usr/local/vgpu/dcu/" + f.Name())
            os.Remove(fmt.Sprintf("/etc/vdev/vdev%d.conf", vdidx))
        }
        fmt.Println(f.Name())
    }
    fmt.Println(p.coremask)
    return nil
}
```

### RegistrInAnnotation

Speichert Geräteinformationen in der Knoten-Annotation, damit `hami-scheduler` DCU-Details je Knoten erhält.

```go
func (r *Plugin) RegistrInAnnotation() error {
    devices := r.apiDevices()
    annos := make(map[string]string)
    if len(util.NodeName) == 0 {
        util.NodeName = os.Getenv(util.NodeNameEnvName)
    }
    node, err := util.GetNode(util.NodeName)
    if err != nil {
        klog.Errorln("get node error", err.Error())
        return err
    }
    encodeddevices := util.EncodeNodeDevices(*devices)
    annos[util.HandshakeAnnosString] = "Reported " + time.Now().String()
    annos[util.RegisterAnnos] = encodeddevices
    klog.Infoln("Reporting devices", encodeddevices, "in", time.Now().String())
    err = util.PatchNodeAnnotations(node, annos)

    if err != nil {
        klog.Errorln("patch node error", err.Error())
    }
    return err
}
```

### ListAndWatch

`ListAndWatch` erkennt DCUs auf dem Knoten, meldet sie an den Kubelet → kube-apiserver → Node Resources.

Inhalt der ListAndWatch-Methode:

```go
// ListAndWatch returns a stream of List of Devices
// Whenever a Device state change or a Device disappears, ListAndWatch
// returns the new list
func (p *Plugin) ListAndWatch(e *kubeletdevicepluginv1beta1.Empty, s kubeletdevicepluginv1beta1.DevicePlugin_ListAndWatchServer) error {
    p.AMDGPUs = amdgpu.GetAMDGPUs()

    devs := make([]*kubeletdevicepluginv1beta1.Device, len(p.AMDGPUs))

    // limit scope for hwloc
    func() {
        var hw hwloc.Hwloc
        hw.Init()
        defer hw.Destroy()

        i := 0
        for id := range p.AMDGPUs {
            dev := &kubeletdevicepluginv1beta1.Device{
                ID:     id,
                Health: kubeletdevicepluginv1beta1.Healthy,
            }
            devs[i] = dev
            i++

            numas, err := hw.GetNUMANodes(id)
            glog.Infof("Watching GPU with bus ID: %s NUMA Node: %+v", id, numas)
            if err != nil {
                glog.Error(err)
                continue
            }

            if len(numas) == 0 {
                glog.Errorf("No NUMA for GPU ID: %s", id)
                continue
            }

            numaNodes := make([]*kubeletdevicepluginv1beta1.NUMANode, len(numas))
            for j, v := range numas {
                numaNodes[j] = &kubeletdevicepluginv1beta1.NUMANode{
                    ID: int64(v),
                }
            }

            dev.Topology = &kubeletdevicepluginv1beta1.TopologyInfo{
                Nodes: numaNodes,
            }
        }
    }()

    fakedevs := p.apiDevices()
    s.Send(&kubeletdevicepluginv1beta1.ListAndWatchResponse{Devices: p.generateFakeDevs(fakedevs)})

    for {
        select {
        case <-p.Heartbeat:
            var health = kubeletdevicepluginv1beta1.Unhealthy

            // TODO there are no per device health check currently
            // TODO all devices on a node is used together by kfd
            if simpleHealthCheck() {
                health = kubeletdevicepluginv1beta1.Healthy
            }

            for i := 0; i < len(p.AMDGPUs); i++ {
                devs[i].Health = health
            }
            s.Send(&kubeletdevicepluginv1beta1.ListAndWatchResponse{Devices: p.generateFakeDevs(fakedevs)})
        }
    }
    // returning a value with this function will unregister the plugin from k8s
}
```

Es gibt überflüssigen Code; der relevante Teil:

```go
fakedevs := p.apiDevices()
s.Send(&kubeletdevicepluginv1beta1.ListAndWatchResponse{Devices: p.generateFakeDevs(fakedevs)})

for {
    select {
    case <-p.Heartbeat:
        s.Send(&kubeletdevicepluginv1beta1.ListAndWatchResponse{Devices: p.generateFakeDevs(fakedevs)})
    }
}
```

### apiDevices

Aus Geräteinfos aus `Start` werden `fakeDevice`s erzeugt und an den Kubelet gemeldet.

```go
func (r *Plugin) apiDevices() *[]*api.DeviceInfo {
    res := []*api.DeviceInfo{}
    for idx, val := range r.devices {
        if val.MemoryTotal > 0 {
            res = append(res, &api.DeviceInfo{
                Index:   idx,
                Id:      "DCU-" + fmt.Sprint(idx),
                Count:   4,
                Devmem:  int32(val.MemoryTotal / 1024 / 1024),
                Devcore: 100,
                Numa:    0,
                Type:    val.DevTypeName,
                Health:  true,
            })
        }
    }
    return &res
}
```

Hier ist `Count` fest 4 — jede DCU in 4 vDCUs teilbar.

>PS: Hygon-DCU-Virtualisierung unterstützt derzeit maximal 4 vDCUs pro physischer Karte.

### generateFakeDevs

```go
func (p *Plugin) generateFakeDevs(devices *[]*api.DeviceInfo) []*kubeletdevicepluginv1beta1.Device {
    fakedevs := []*kubeletdevicepluginv1beta1.Device{}

    for _, val := range *devices {
        idx := 0
        for idx < int(val.Count) {
            fakedevs = append(fakedevs, &kubeletdevicepluginv1beta1.Device{
                ID:     val.Id + "-fake-" + fmt.Sprint(idx),
                Health: kubeletdevicepluginv1beta1.Healthy,
            })
            idx++
        }
    }
    return fakedevs
}
```

In `generateFakeDevs` werden genug fakedevs nach `Count` erzeugt — der Kubelet sieht die 4-fache Anzahl physischer DCUs.

### Allocate

`Allocate` enthält die Logik zur tatsächlichen vDCU-Zuteilung an den Pod.

>PS: Ohne separates Container-Runtime müssen in Allocate zusätzlich kfd, mkfd, dri, hygondriver, hyhal usw. gemountet werden.

```go
func (p *Plugin) Allocate(ctx context.Context, reqs *kubeletdevicepluginv1beta1.AllocateRequest) (*kubeletdevicepluginv1beta1.AllocateResponse, error) {
    var car kubeletdevicepluginv1beta1.ContainerAllocateResponse
    var dev *kubeletdevicepluginv1beta1.DeviceSpec
    responses := kubeletdevicepluginv1beta1.AllocateResponse{}
    nodename := util.NodeName
    current, err := hmutil.GetPendingPod(ctx, nodename)
    if err != nil {
        // nodelock.ReleaseNodeLock(nodename, NodeLockDCU, current, false)
        return &kubeletdevicepluginv1beta1.AllocateResponse{}, err
    }
    klog.Infof("Allocate for pod %s/%s uid [%s] \n", current.Namespace, current.Name, current.UID)
    drmCards, drmRenders, err := util.ListDcuDrmDevices()
    if err != nil {
        util.PodAllocationFailed(nodename, current, NodeLockDCU)
        return &kubeletdevicepluginv1beta1.AllocateResponse{}, err
    }
    for idx := range reqs.ContainerRequests {
        currentCtr, devreq, err := util.GetNextDeviceRequest(util.HygonDCUDevice, *current)
        klog.Infoln("deviceAllocateFromAnnotation=", devreq)
        if err != nil {
            util.PodAllocationFailed(nodename, current, NodeLockDCU)
            return &kubeletdevicepluginv1beta1.AllocateResponse{}, err
        }
        if len(devreq) != len(reqs.ContainerRequests[idx].DevicesIDs) {
            util.PodAllocationFailed(nodename, current, NodeLockDCU)
            return &kubeletdevicepluginv1beta1.AllocateResponse{}, errors.New("device number not matched")
        }

        err = util.EraseNextDeviceTypeFromAnnotation(util.HygonDCUDevice, *current)
        if err != nil {
            util.PodAllocationFailed(nodename, current, NodeLockDCU)
            return &kubeletdevicepluginv1beta1.AllocateResponse{}, err
        }

        car = kubeletdevicepluginv1beta1.ContainerAllocateResponse{}
        // Currently, there are only 1 /dev/kfd per nodes regardless of the # of GPU available
        // for compute/rocm/HSA use cases
        dev = new(kubeletdevicepluginv1beta1.DeviceSpec)
        dev.HostPath = "/dev/kfd"
        dev.ContainerPath = "/dev/kfd"
        dev.Permissions = "rwm"
        car.Devices = append(car.Devices, dev)

        dev = new(kubeletdevicepluginv1beta1.DeviceSpec)
        dev.HostPath = "/dev/mkfd"
        dev.ContainerPath = "/dev/mkfd"
        dev.Permissions = "rwm"
        car.Devices = append(car.Devices, dev)

        for _, val := range devreq {
            var devIdx = -1
            klog.Infof("Allocating device ID: %s", val.UUID)
            succeedCount, err := fmt.Sscanf(val.UUID, "DCU-%d", &devIdx)
            if err != nil || succeedCount == 0 || devIdx == -1 {
                klog.Errorf("Invalid request device uuid: %s", val.UUID)
                util.PodAllocationFailed(nodename, current, NodeLockDCU)
                return &kubeletdevicepluginv1beta1.AllocateResponse{}, fmt.Errorf("invalid request device uuid %s", val.UUID)
            }

            if devIdx > len(drmCards) || devIdx > len(drmRenders) {
                klog.Errorf("Invalid device index: %d, all devices counts is: %d, all renders count is: %d", devIdx, len(drmCards), len(drmRenders))
                util.PodAllocationFailed(nodename, current, NodeLockDCU)
                return &kubeletdevicepluginv1beta1.AllocateResponse{}, fmt.Errorf("can not match dcu dri request %s. cards %d, renders %d", val.UUID, len(drmCards), len(drmRenders))
            }

            drmCardName := drmCards[devIdx]
            klog.Infof("All dcu dri card devs: %v, mapped dri: %s", drmCards, drmCardName)
            devpath := fmt.Sprintf("/dev/dri/%s", drmCardName)
            dev = new(kubeletdevicepluginv1beta1.DeviceSpec)
            dev.HostPath = devpath
            dev.ContainerPath = devpath
            dev.Permissions = "rw"
            car.Devices = append(car.Devices, dev)

            drmRenderName := drmRenders[devIdx]
            klog.Infof("All dcu dri render devs: %v, mapped dri: %s", drmRenders, drmRenderName)
            devpath = fmt.Sprintf("/dev/dri/%s", drmRenderName)
            dev = new(kubeletdevicepluginv1beta1.DeviceSpec)
            dev.HostPath = devpath
            dev.ContainerPath = devpath
            dev.Permissions = "rw"
            car.Devices = append(car.Devices, dev)
        }
        // Create vdev file
        klog.Infoln("devreqs=", len(devreq), "usedmem=", devreq[0].Usedmem, ":", p.devices[0].MemoryTotal/1024/1024)
        if len(devreq) < 2 && devreq[0].Usedmem < int32(p.devices[0].MemoryTotal/1024/1024) {
            filename, err := p.createvdevFiles(current, &currentCtr, devreq)
            if err != nil {
                util.PodAllocationFailed(nodename, current, NodeLockDCU)
                return &responses, err
            }
            if len(filename) > 0 {
                car.Mounts = append(car.Mounts, &kubeletdevicepluginv1beta1.Mount{
                    ContainerPath: "/etc/vdev/docker/",
                    HostPath:      filename,
                    ReadOnly:      false,
                }, &kubeletdevicepluginv1beta1.Mount{
                    ContainerPath: "/opt/hygondriver",
                    HostPath:      os.Getenv("HYGONPATH"),
                    ReadOnly:      false,
                }, &kubeletdevicepluginv1beta1.Mount{
                    ContainerPath: "/opt/hyhal",
                    HostPath:      "/opt/hyhal",
                    ReadOnly:      false,
                })
                car.Mounts = append(car.Mounts)
            }
        }
    }
    responses.ContainerResponses = append(responses.ContainerResponses, &car)
    klog.Infoln("response=", responses)
    util.PodAllocationTrySuccess(nodename, util.HygonDCUDevice, NodeLockDCU, current)
    return &responses, nil
}
```

Gleiche Logik wie `hami-nvidia-device-plugin`; die Zuteilung wurde bereits in der `hami-scheduler`-Phase gewählt.

### DecodePodDevices

```go
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

### createvdevFiles

Schließlich wird eine vdev-Konfigurationsdatei erzeugt und in den Pod gemountet.

```go
filename, err := p.createvdevFiles(current, &currentCtr, devreq)
if err != nil {
    util.PodAllocationFailed(nodename, current, NodeLockDCU)
    return &responses, err
}
if len(filename) > 0 {
    car.Mounts = append(car.Mounts, &kubeletdevicepluginv1beta1.Mount{
        ContainerPath: "/etc/vdev/docker/",
        HostPath:      filename,
        ReadOnly:      false,
    })
    car.Mounts = append(car.Mounts)
}
```

`RefreshContainerDevices` pflegt die hier erzeugten vdev-Dateien; beim Pod-Löschen das Verzeichnis aufräumen.

```go
dirName := string(current.UID) + "_" + ctr.Name + "_" + fmt.Sprint(devidx) + "_" + fmt.Sprint(pipeid) + "_" + fmt.Sprint(vdevidx) + "_" + fmt.Sprint(coremsk1) + "_" + fmt.Sprint(coremsk2)
cacheFileHostDirectory := fmt.Sprintf("/usr/local/vgpu/dcu/%s", dirName)
err = createvdevFile(pcibusId, coremsk1, coremsk2, reqcores, mem, 0, vdevidx, pipeid, cacheFileHostDirectory, "vdev0.conf")
if err != nil {
    return "", err
}```

Inhalt von `createvdevFile`:

```go
func createvdevFile(pcibusId, coremsk1, coremsk2 string, reqcores, mem int32, deviceid, vdevidx, pipeid int, cacheFileHostDirectory, cacheFileName string) error {
    s := ""
    s = fmt.Sprintf("PciBusId: %s\n", pcibusId)
    s = s + fmt.Sprintf("cu_mask: 0x%s\n", coremsk1)
    s = s + fmt.Sprintf("cu_mask: 0x%s\n", coremsk2)
    s = s + fmt.Sprintf("cu_count: %d\n", reqcores)
    s = s + fmt.Sprintf("mem: %d MiB\n", mem)
    s = s + fmt.Sprintf("device_id: %d\n", deviceid)
    s = s + fmt.Sprintf("vdev_id: %d\n", vdevidx)
    s = s + fmt.Sprintf("pipe_id: %d\n", pipeid)
    s = s + fmt.Sprintln("enable: 1")
    klog.Infoln("s=", s)

    _, err := os.Stat(cacheFileHostDirectory)
    if os.IsNotExist(err) {
        err := os.MkdirAll(cacheFileHostDirectory, 0777)
        if err != nil {
            return err
        }
        err = os.Chmod(cacheFileHostDirectory, 0777)
        if err != nil {
            return err
        }
    }

    err = os.WriteFile(fmt.Sprintf("%s/%s", cacheFileHostDirectory, cacheFileName), []byte(s), os.ModePerm)
    if err != nil {
        return err
    }
    return nil
}
```

Es wird eine Datei mit allen Informationen geschrieben; der Treiber liest Core- und Speicherlimits.

>PS: Anders als vGPU per Umgebungsvariablen, aber derselbe Zweck.

Diese Logik entspricht dem folgenden Befehl zur Erzeugung von vDCU-Konfigurationsdateien.

```bash
$ hy-smi virtual -create-vdevices 4 -d 0 \
-vdevice-compute-units 5,15,20,20 \
-vdevice-memory-size 4096,8192,8192,8192
```

---
*Mehr zum HAMi-Projekt: [GitHub-Repository](https://github.com/Project-HAMi/HAMi) oder [Slack-Community](https://cloud-native.slack.com/archives/C07T10BU4R2).*

---
