---
title: >-
  HAMi-vGPU-Prinzipanalyse Teil 1: Implementierung von hami-device-plugin-nvidia
coverTitle: HAMi NVIDIA Device Plugin – Implementierung
date: '2025-07-23'
excerpt: >-
  Erster Artikel der Serie zu den Implementierungsprinzipien der Open-Source-vGPU-Lösung
  HAMi — Fokus auf hami-device-plugin-nvidia.
author: Dynamia AI Team
tags:
  - HAMi
  - GPU-Sharing
  - vGPU
  - Kubernetes
  - Heterogenes Computing
category: Technical Deep Dive
coverImage: /images/blog/gpu3/cover2.jpg
linktitle: HAMi NVIDIA Device Plugin
---

Dies ist der erste Artikel einer Serie zu den Implementierungsprinzipien der Open-Source-vGPU-Lösung HAMi — mit Fokus auf `hami-device-plugin-nvidia`.

Zuvor stellten wir in [Open Source vGPU Solution: HAMI for Fine-Grained GPU Partitioning](/blog/open-source-vgpu-hami-fine-grained-partitioning) HAMi vor. In [Open Source vGPU Solution HAMI: Core & Memory Isolation Test](/blog/open-source-vgpu-hami-core-memory-test) testeten wir die vGPU-Lösung.

Als Nächstes analysieren wir schrittweise die vGPU-Implementierung in HAMi — mit vielen Komponenten, grob in folgende Teile gegliedert:

1. **hami-device-plugin-nvidia**: GPU-Erkennung und Zuweisungslogik in HAMis Device Plugin und Unterschiede zum offiziellen NVIDIA-Plugin.

2. **hami-scheduler**: Scheduling in HAMi und Umsetzung der HA-Strategien `binpack`/`spread`.

3. **hami-core (auch cgroup-hook)**: Kern der vGPU-Lösung — Abfangen von CUDA-APIs für Core- und Speicher-Isolation und Limits.

Dieser erste Artikel behandelt die Implementierungsprinzipien von `hami-device-plugin-nvidia`.

---

## 1. Überblick

NVIDIA hat ein eigenes Device Plugin. Die Frage: **Warum brauchte HAMi ein eigenes Device Plugin?**

Hat ***hami-device-plugin-nvidia*** Funktionen, die dem nativen NVIDIA-***Device Plugin*** fehlen? Damit im Blick sehen wir uns den Quellcode an.

---

## 2. Programmeinstieg

> Basis: HAMi v2.3.13

HAMi unterstützte NVIDIA-GPUs zuerst über ein separates Device Plugin.

- Einstieg: [`cmd/device-plugin/nvidia`](https://github.com/Project-HAMi/HAMi/tree/master/cmd/device-plugin/nvidia)

- Kernlogik: [`pkg/device-plugin/nvidiadevice`](https://github.com/Project-HAMi/HAMi/tree/master/pkg/device-plugin/nvidiadevice)

> Voraussetzung: Kenntnis des Kubernetes-Device-Plugin-Mechanismus — hier nur die Kernlogik, damit der Artikel kompakt bleibt.

Beim Device Plugin stehen typischerweise drei Methoden im Fokus:

- `Register`: Registrierung beim Kubelet; `ResourceName` ist zentral.

- `ListAndWatch`: GPU-Erkennung und Meldung.

- `Allocate`: GPU-Zuweisung an einen Pod.

Der Startbefehl liegt unter [`/cmd/device-plugin/nvidia`](https://github.com/Project-HAMi/HAMi/tree/master/cmd/device-plugin/nvidia) und nutzt ***github.com/urfave/cli/v2*** für die CLI.

```go
func main() {
 var configFile string

 c := cli.NewApp()
 c.Name = "NVIDIA Device Plugin"
 c.Usage = "NVIDIA device plugin for Kubernetes"
 c.Version = info.GetVersionString()
 c.Action = func(ctx *cli.Context) error {
  return start(ctx, c.Flags)
 }

 c.Flags = []cli.Flag{
  &cli.StringFlag{
   Name:    "mig-strategy",
   Value:   spec.MigStrategyNone,
   Usage:   "the desired strategy for exposing MIG devices on GPUs that support it:\n\t\t[none | single | mixed]",
   EnvVars: []string{"MIG_STRATEGY"},
  },
  &cli.BoolFlag{
   Name:    "fail-on-init-error",
   Value:   true,
   Usage:   "fail the plugin if an error is encountered during initialization, otherwise block indefinitely",
   EnvVars: []string{"FAIL_ON_INIT_ERROR"},
  },
  &cli.StringFlag{
   Name:    "nvidia-driver-root",
   Value:   "/",
   Usage:   "the root path for the NVIDIA driver installation (typical values are '/' or '/run/nvidia/driver')",
   EnvVars: []string{"NVIDIA_DRIVER_ROOT"},
  },
  &cli.BoolFlag{
   Name:    "pass-device-specs",
   Value:   false,
   Usage:   "pass the list of DeviceSpecs to the kubelet on Allocate()",
   EnvVars: []string{"PASS_DEVICE_SPECS"},
  },
  &cli.StringSliceFlag{
   Name:    "device-list-strategy",
   Value:   cli.NewStringSlice(string(spec.DeviceListStrategyEnvvar)),
   Usage:   "the desired strategy for passing the device list to the underlying runtime:\n\t\t[envvar | volume-mounts | cdi-annotations]",
   EnvVars: []string{"DEVICE_LIST_STRATEGY"},
  },
  &cli.StringFlag{
   Name:    "device-id-strategy",
   Value:   spec.DeviceIDStrategyUUID,
   Usage:   "the desired strategy for passing device IDs to the underlying runtime:\n\t\t[uuid | index]",
   EnvVars: []string{"DEVICE_ID_STRATEGY"},
  },
  &cli.BoolFlag{
   Name:    "gds-enabled",
   Usage:   "ensure that containers are started with NVIDIA_GDS=enabled",
   EnvVars: []string{"GDS_ENABLED"},
  },
  &cli.BoolFlag{
   Name:    "mofed-enabled",
   Usage:   "ensure that containers are started with NVIDIA_MOFED=enabled",
   EnvVars: []string{"MOFED_ENABLED"},
  },
  &cli.StringFlag{
   Name:        "config-file",
   Usage:       "the path to a config file as an alternative to command line options or environment variables",
   Destination: &configFile,
   EnvVars:     []string{"CONFIG_FILE"},
  },
  &cli.StringFlag{
   Name:    "cdi-annotation-prefix",
   Value:   spec.DefaultCDIAnnotationPrefix,
   Usage:   "the prefix to use for CDI container annotation keys",
   EnvVars: []string{"CDI_ANNOTATION_PREFIX"},
  },
  &cli.StringFlag{
   Name:    "nvidia-ctk-path",
   Value:   spec.DefaultNvidiaCTKPath,
   Usage:   "the path to use for the nvidia-ctk in the generated CDI specification",
   EnvVars: []string{"NVIDIA_CTK_PATH"},
  },
  &cli.StringFlag{
   Name:    "container-driver-root",
   Value:   spec.DefaultContainerDriverRoot,
   Usage:   "the path where the NVIDIA driver root is mounted in the container; used for generating CDI specifications",
   EnvVars: []string{"CONTAINER_DRIVER_ROOT"},
  },
 }
 c.Flags = append(c.Flags, addFlags()...)
 err := c.Run(os.Args)
 if err != nil {
  klog.Error(err)
  os.Exit(1)
 }
}

func addFlags() []cli.Flag {
 addition := []cli.Flag{
  &cli.StringFlag{
   Name:    "node-name",
   Value:   os.Getenv(util.NodeNameEnvName),
   Usage:   "node name",
   EnvVars: []string{"NodeName"},
  },
  &cli.UintFlag{
   Name:    "device-split-count",
   Value:   2,
   Usage:   "the number for NVIDIA device split",
   EnvVars: []string{"DEVICE_SPLIT_COUNT"},
  },
  &cli.Float64Flag{
   Name:    "device-memory-scaling",
   Value:   1.0,
   Usage:   "the ratio for NVIDIA device memory scaling",
   EnvVars: []string{"DEVICE_MEMORY_SCALING"},
  },
  &cli.Float64Flag{
   Name:    "device-cores-scaling",
   Value:   1.0,
   Usage:   "the ratio for NVIDIA device cores scaling",
   EnvVars: []string{"DEVICE_CORES_SCALING"},
  },
  &cli.BoolFlag{
   Name:    "disable-core-limit",
   Value:   false,
   Usage:   "If set, the core utilization limit will be ignored",
   EnvVars: []string{"DISABLE_CORE_LIMIT"},
  },
  &cli.StringFlag{
   Name:  "resource-name",
   Value: "nvidia.com/gpu",
   Usage: "the name of field for number GPU visible in container",
  },
 }
 return addition
}
```

Beim Start passiert Folgendes:

- Registrierung beim Kubelet
- Start eines gRPC-Dienstes

Relevante Parameter:

```go
&cli.UintFlag{
 Name:    "device-split-count",
 Value:   2,
 Usage:   "the number for NVIDIA device split",
 EnvVars: []string{"DEVICE_SPLIT_COUNT"},
},
&cli.Float64Flag{
 Name:    "device-memory-scaling",
 Value:   1.0,
 Usage:   "the ratio for NVIDIA device memory scaling",
 EnvVars: []string{"DEVICE_MEMORY_SCALING"},
},
&cli.Float64Flag{
 Name:    "device-cores-scaling",
 Value:   1.0,
 Usage:   "the ratio for NVIDIA device cores scaling",
 EnvVars: []string{"DEVICE_CORES_SCALING"},
},
&cli.BoolFlag{
 Name:    "disable-core-limit",
 Value:   false,
 Usage:   "If set, the core utilization limit will be ignored",
 EnvVars: []string{"DISABLE_CORE_LIMIT"},
},
&cli.StringFlag{
 Name:  "resource-name",
 Value: "nvidia.com/gpu",
 Usage: "the name of field for number GPU visible in container",
},
```

- `device-split-count`: Anzahl der Splits pro GPU. Pro GPU nicht mehr Tasks als dieser Wert. Bei N maximal N parallele Tasks pro GPU. (Empfehlung: dynamisch nach GPU-Leistung; oft > 10.)
- `device-memory-scaling`: Oversubscription-Verhältnis für GPU-Speicher, Default 1.0. > 1.0 aktiviert virtuellen Speicher (experimentell) — nicht empfohlen.
- `device-cores-scaling`: Oversubscription für GPU-Cores, Default 1.0.
- `disable-core-limit`: GPU-Core-Limit deaktivieren. Default false — nicht empfohlen zu ändern.
- `resource-name`: Ressourcenname. Besser anpassen — Default `nvidia.com/gpu` kollidiert mit NVIDIA.

---

## 3. Register

Die `Register`-Methode:

```go
// pkg/device-plugin/nvidiadevice/nvinternal/plugin/server.go#L222

// Register registers the device plugin for the given resourceName with Kubelet.
func (plugin *NvidiaDevicePlugin) Register() error {
 conn, err := plugin.dial(kubeletdevicepluginv1beta1.KubeletSocket, 5*time.Second)
 if err != nil {
  return err
 }
 defer conn.Close()

 client := kubeletdevicepluginv1beta1.NewRegistrationClient(conn)
 reqt := &kubeletdevicepluginv1beta1.RegisterRequest{
  Version:      kubeletdevicepluginv1beta1.Version,
  Endpoint:     path.Base(plugin.socket),
  ResourceName: string(plugin.rm.Resource()),
  Options: &kubeletdevicepluginv1beta1.DevicePluginOptions{
   GetPreferredAllocationAvailable: false,
  },
 }

 _, err = client.Register(context.Background(), reqt)
 if err != nil {
  return err
 }
 return nil
}
```

Wichtige Angaben bei der Registrierung:

- **ResourceName**: Name der Ressource. Das Plugin greift, wenn Pods diese Ressource für vGPU anfordern. (Konfiguration beim Start, z. B. `--resource-name=nvidia.com/vgpu`.)
- **Version**: Device-Plugin-Version, hier `v1beta1`.
- **Endpoint**: Zugriffsadresse des Plugins. Kubelet kommuniziert über den Socket. (HAMi: `/var/lib/kubelet/device-plugins/nvidia-xxx.sock`, `xxx` aus `ResourceName`, z. B. `vgpu` bei `nvidia.com/vgpu`.)

Mit Defaults: `ResourceName` **nvidia.com/gpu**, `Endpoint` **/var/lib/kubelet/device-plugins/nvidia-gpu.sock**.

- Fordert ein Pod `nvidia.com/gpu`, übernimmt dieses Plugin die Zuweisung. Das Kubelet ruft die API über `/var/lib/kubelet/device-plugins/nvidia-gpu.sock` auf.
- Passt `ResourceName` nicht zum HAMi-Plugin, übernimmt das NVIDIA-eigene Plugin.

### WatchAndRegister

Speziallogik in HAMi: GPU-Infos des Knotens werden als Annotationen am Node-Objekt abgelegt.
> Direkte Kommunikation mit dem kube-apiserver — außerhalb des üblichen Device-Plugin-Reportings.

**Der hami-scheduler nutzt diese Annotationen später für Scheduling-Entscheidungen.** Details folgen im Scheduler-Artikel.

```go
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

### getAPIDevices ###

Liest GPU-Infos des Knotens und baut `api.DeviceInfo`-Objekte.

```go
func (plugin *NvidiaDevicePlugin) getAPIDevices() *[]*api.DeviceInfo {
 devs := plugin.Devices()
 nvml.Init()
 res := make([]*api.DeviceInfo, 0, len(devs))
 idx := 0
 for idx < len(devs) {
  ndev, ret := nvml.DeviceGetHandleByIndex(idx)
  if ret != nvml.SUCCESS {
   klog.Errorln("nvml new device by index error idx=", idx, "err=", ret)
   panic(0)
  }

  memoryTotal := 0
  memory, ret := ndev.GetMemoryInfo()
  if ret == nvml.SUCCESS {
   memoryTotal = int(memory.Total)
  } else {
   klog.Error("nvml get memory error ret=", ret)
   panic(0)
  }

  UUID, ret := ndev.GetUUID()
  if ret != nvml.SUCCESS {
   klog.Error("nvml get uuid error ret=", ret)
   panic(0)
  }

  Model, ret := ndev.GetName()
  if ret != nvml.SUCCESS {
   klog.Error("nvml get name error ret=", ret)
   panic(0)
  }

  registeredmem := int32(memoryTotal / 1024 / 1024)
  if *util.DeviceMemoryScaling != 1 {
   registeredmem = int32(float64(registeredmem) * *util.DeviceMemoryScaling)
  }
  klog.Infoln("MemoryScaling=", *util.DeviceMemoryScaling, "registeredmem=", registeredmem)

  health := true
  for _, val := range devs {
   if strings.Compare(val.ID, UUID) == 0 {
    if strings.EqualFold(val.Health, "healthy") {
     health = true
    } else {
     health = false
    }
    break
   }
  }

  numa, err := plugin.getNumaInformation(idx)
  if err != nil {
   klog.ErrorS(err, "failed to get numa information", "idx", idx)
  }

  res = append(res, &api.DeviceInfo{
   ID:      UUID,
   Count:   int32(*util.DeviceSplitCount),
   Devmem:  registeredmem,
   Devcore: int32(*util.DeviceCoresScaling * 100),
   Type:    fmt.Sprintf("%v-%v", "NVIDIA", Model),
   Numa:    numa,
   Health:  health,
  })

  idx++
  klog.Infof("nvml registered device id=%v, memory=%v, type=%v, numa=%v", idx, registeredmem, Model, numa)
 }
 return &res
}
```

Der Kern:

```go
// GPU-Infos über NVML
ndev, ret := nvml.DeviceGetHandleByIndex(idx)
memoryTotal := 0
memory, ret := ndev.GetMemoryInfo()
if ret == nvml.SUCCESS {
    memoryTotal = int(memory.Total)
}
UUID, ret := ndev.GetUUID()
Model, ret := ndev.GetName()

// Scaling
registeredmem := int32(memoryTotal / 1024 / 1024)
if *util.DeviceMemoryScaling != 1 {
    registeredmem = int32(float64(registeredmem) * *util.DeviceMemoryScaling)
}

// Ergebnis zusammenbauen und zurückgeben
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

### Node-Annotationen aktualisieren ###

Nach dem Auslesen patcht das Plugin den Node per kube-apiserver und speichert die Geräteinformationen in Annotationen.

```go
encodeddevices := util.EncodeNodeDevices(*devices)
annos[nvidia.HandshakeAnnos] = "Reported " + time.Now().String()
annos[nvidia.RegisterAnnos]  = encodeddevices
klog.Infof("patch node with the following annos %v", fmt.Sprintf("%v", annos))
err = util.PatchNodeAnnotations(node, annos)
```

Üblicherweise erfolgt die Meldung über die Device-Plugin-Schnittstelle — bei HAMi eine Sonderlogik.

### Demo ###

Annotationen am Node zeigen, welche Daten gespeichert werden:

```yaml
apiVersion: v1
kind: Node
metadata:
  annotations:
    hami.io/node-handshake: Requesting_2024.09.25 07:48:26
    hami.io/node-nvidia-register: 'GPU-03f69c50-207a-2038-9b45-23cac89cb67d,10,46068,100,NVIDIA-NVIDIA A40,0,true:GPU-1afede84-4e70-2174-49af-f07ebb94d1ae,10,46068,100,NVIDIA-NVIDIA A40,0,true:'
```

`hami.io/node-nvidia-register` enthält die vom HAMi-Device-Plugin gemeldeten GPU-Infos — formatiert:

```
GPU-03f69c50-207a-2038-9b45-23cac89cb67d,10,46068,100,NVIDIA-NVIDIA A40,0,true:
GPU-1afede84-4e70-2174-49af-f07ebb94d1ae,10,46068,100,NVIDIA-NVIDIA A40,0,true:
```

Auf dem Knoten sind zwei A40-GPUs.

- `GPU-03f69c50-207a-2038-9b45-23cac89cb67d`: UUID der GPU.
- `10,46068,100`: 10 Teile, 46068 MB Speicher pro Karte, 100 Cores (kein Oversubscription).
- `NVIDIA-NVIDIA`: GPU-Typ.
- `A40`: GPU-Modell.
- `0`: NUMA-Topologie der GPU.
- `true`: GPU ist gesund.
- `:`: abschließendes Trennzeichen.

> Hinweis: Der hami-scheduler nutzt diese Daten beim Scheduling — hier ausgelassen.

### Kurzfassung ###
`Register` hat zwei Teile:
- `Register`: Registrierung beim Kubelet.
- `WatchAndRegister`: GPU-Erkennung und Annotationen am Node für den hami-scheduler.

## 4. ListAndWatch

`ListAndWatch` erkennt Geräte auf dem Knoten und meldet sie an das Kubelet.
Da eine GPU von mehreren Pods geteilt wird, repliziert HAMis Plugin Geräte ähnlich wie Time-Slicing.

Implementierung:
```go
// ListAndWatch lists devices and update that list according to the health status
func (plugin *NvidiaDevicePlugin) ListAndWatch(e *kubeletdevicepluginv1beta1.Empty, s kubeletdevicepluginv1beta1.DevicePlugin_ListAndWatchServer) error {
 s.Send(&kubeletdevicepluginv1beta1.ListAndWatchResponse{Devices: plugin.apiDevices()})

 for {
  select {
  case <-plugin.stop:
   return nil
  case d := <-plugin.health:
   // FIXME: there is no way to recover from the Unhealthy state.
   d.Health = kubeletdevicepluginv1beta1.Unhealthy
   klog.Infof("'%s' device marked unhealthy: %s", plugin.rm.Resource(), d.ID)
   s.Send(&kubeletdevicepluginv1beta1.ListAndWatchResponse{Devices: plugin.apiDevices()})
  }
 }
}
```

Die eigentliche Logik liegt in **plugin.apiDevices** und endet in `buildGPUDeviceMap`:

```go
// VisitDevices visits each top-level device and invokes a callback function for it
func (d *devicelib) VisitDevices(visit func(int, Device) error) error {
 count, ret := d.nvml.DeviceGetCount()
 if ret != nvml.SUCCESS {
  return fmt.Errorf("error getting device count: %v", ret)
 }

 for i := 0; i < count; i++ {
  device, ret := d.nvml.DeviceGetHandleByIndex(i)
  if ret != nvml.SUCCESS {
   return fmt.Errorf("error getting device handle for index '%v': %v", i, ret)
  }
  dev, err := d.newDevice(device)
  if err != nil {
   return fmt.Errorf("error creating new device wrapper: %v", err)
  }

  isSkipped, err := dev.isSkipped()
  if err != nil {
   return fmt.Errorf("error checking whether device is skipped: %v", err)
  }
  if isSkipped {
   continue
  }
  err = visit(i, dev)
  if err != nil {
   return fmt.Errorf("error visiting device: %v", err)
  }
 }
 return nil
}

// buildGPUDeviceMap builds a map of resource names to GPU devices
func (b *deviceMapBuilder) buildGPUDeviceMap() (DeviceMap, error) {
 devices := make(DeviceMap)

 b.VisitDevices(func(i int, gpu device.Device) error {
  name, ret := gpu.GetName()
  if ret != nvml.SUCCESS {
   return fmt.Errorf("error getting product name for GPU: %v", ret)
  }
  migEnabled, err := gpu.IsMigEnabled()
  if err != nil {
   return fmt.Errorf("error checking if MIG is enabled on GPU: %v", err)
  }
  if migEnabled && *b.config.Flags.MigStrategy != spec.MigStrategyNone {
   return nil
  }
  for _, resource := range b.config.Resources.GPUs {
   if resource.Pattern.Matches(name) {
    index, info := newGPUDevice(i, gpu)
    return devices.setEntry(resource.Name, index, info)
   }
  }
  return fmt.Errorf("GPU name '%v' does not match any resource patterns", name)
 })
 return devices, nil
}
```

Auch hier direkte NVML-Nutzung für GPU-Infos.

Anschließend GPU-Replikation nach `DeviceSplitCount` — analog Time-Slicing:

```go
// GetPluginDevices returns the plugin Devices from all devices in the Devices
func (ds Devices) GetPluginDevices() []*kubeletdevicepluginv1beta1.Device {
 var res []*kubeletdevicepluginv1beta1.Device

 if !strings.Contains(ds.GetIDs()[0], "MIG") {
  for _, dev := range ds {
   for i := uint(0); i < *util.DeviceSplitCount; i++ {
    id := fmt.Sprintf("%v-%v", dev.ID, i)
    res = append(res, &kubeletdevicepluginv1beta1.Device{
     ID:       id,
     Health:   dev.Health,
     Topology: nil,
    })
   }
  }
 } else {
  for _, d := range ds {
   res = append(res, &d.Device)
  }
 }

 return res
}
```

Der Kern:

```go
for _, dev := range ds {
 for i := uint(0); i < *util.DeviceSplitCount; i++ {
  id := fmt.Sprintf("%v-%v", dev.ID, i)
  res = append(res, &kubeletdevicepluginv1beta1.Device{
   ID:       id,
   Health:   dev.Health,
   Topology: nil,
  })
 }
}
```

### Kurzfassung ###

`ListAndWatch` ohne wesentliche Zusatzlogik — hauptsächlich Gerätereplikation nach `DeviceSplitCount`.
Kubernetes sieht jede angeforderte GPU-Ressource als voll verbraucht. Daher werden physische GPUs repliziert, damit mehr GPU-Tasks laufen können.

## 5. Allocate ##

HAMis `Allocate` besteht aus zwei Teilen:

- **HAMi-eigene Logik**: Umgebungsvariablen nach Pod-Spec und Mount von `libvgpu.so` statt des nativen Treibers.
- **NVIDIA-Standardlogik**: `NVIDIA_VISIBLE_DEVICES` setzen — NVIDIA Container Toolkit weist die GPU zu.

HAMi kann GPUs nicht selbst in Container legen und kombiniert daher beide Logiken.
Der Pod erhält die nötigen Variablen, das Toolkit mountet die GPU, HAMi ersetzt `libvgpu.so` und setzt Limit-Variablen.

### HAMi-eigene Logik ###

HAMis `Allocate` im nvidia-device-plugin:

```go
// pkg/device-plugin/nvidiadevice/nvinternal/plugin/server.go#L290
func (plugin *NvidiaDevicePlugin) Allocate(ctx context.Context, reqs *kubeletdevicepluginv1beta1.AllocateRequest) (*kubeletdevicepluginv1beta1.AllocateResponse, error) {
 klog.InfoS("Allocate", "request", reqs)
 responses := kubeletdevicepluginv1beta1.AllocateResponse{}
 nodename := os.Getenv(util.NodeNameEnvName)
 current, err := util.GetPendingPod(ctx, nodename)
 if err != nil {
  nodelock.ReleaseNodeLock(nodename, NodeLockNvidia)
  return &kubeletdevicepluginv1beta1.AllocateResponse{}, err
 }
 klog.V(5).Infof("allocate pod name is %s/%s, annotation is %+v", current.Namespace, current.Name, current.Annotations)

 for idx, req := range reqs.ContainerRequests {
  // If the devices being allocated are replicas, then (conditionally)
  // error out if more than one resource is being allocated.
  if strings.Contains(req.DevicesIDs[0], "MIG") {
   if plugin.config.Sharing.TimeSlicing.FailRequestsGreaterThanOne && rm.AnnotatedIDs(req.DevicesIDs).AnyHasAnnotations() {
    if len(req.DevicesIDs) > 1 {
     return nil, fmt.Errorf("request for '%v: %v' too large: maximum request size for shared resources is 1", plugin.rm.Resource(), len(req.DevicesIDs))
    }
   }
   for _, id := range req.DevicesIDs {
    if !plugin.rm.Devices().Contains(id) {
     return nil, fmt.Errorf("invalid allocation request for '%s': unknown device: %s", plugin.rm.Resource(), id)
    }
   }
   response, err := plugin.getAllocateResponse(req.DevicesIDs)
   if err != nil {
    return nil, fmt.Errorf("failed to get allocate response: %v", err)
   }
   responses.ContainerResponses = append(responses.ContainerResponses, response)
  } else {
   currentCtr, devreq, err := util.GetNextDeviceRequest(nvidia.NvidiaGPUDevice, *current)
   klog.Infoln("deviceAllocateFromAnnotation=", devreq)
   if err != nil {
    device.PodAllocationFailed(nodename, current, NodeLockNvidia)
    return &kubeletdevicepluginv1beta1.AllocateResponse{}, err
   }
   if len(devreq) != len(reqs.ContainerRequests[idx].DevicesIDs) {
    device.PodAllocationFailed(nodename, current, NodeLockNvidia)
    return &kubeletdevicepluginv1beta1.AllocateResponse{}, errors.New("device number not matched")
   }
   response, err := plugin.getAllocateResponse(util.GetContainerDeviceStrArray(devreq))
   if err != nil {
    return nil, fmt.Errorf("failed to get allocate response: %v", err)
   }

   err = util.EraseNextDeviceTypeFromAnnotation(nvidia.NvidiaGPUDevice, *current)
   if err != nil {
    device.PodAllocationFailed(nodename, current, NodeLockNvidia)
    return &kubeletdevicepluginv1beta1.AllocateResponse{}, err
   }

   for i, dev := range devreq {
    limitKey := fmt.Sprintf("CUDA_DEVICE_MEMORY_LIMIT_%v", i)
    response.Envs[limitKey] = fmt.Sprintf("%vm", dev.Usedmem)
   }
   response.Envs["CUDA_DEVICE_SM_LIMIT"] = fmt.Sprint(devreq[0].Usedcores)
   response.Envs["CUDA_DEVICE_MEMORY_SHARED_CACHE"] = fmt.Sprintf("%s/vgpu/%v.cache", hostHookPath, uuid.New().String())
   if *util.DeviceMemoryScaling > 1 {
    response.Envs["CUDA_OVERSUBSCRIBE"] = "true"
   }
   if *util.DisableCoreLimit {
    response.Envs[api.CoreLimitSwitch] = "disable"
   }

   cacheFileHostDirectory := fmt.Sprintf("%s/vgpu/containers/%s_%s", hostHookPath, current.UID, currentCtr.Name)
   os.RemoveAll(cacheFileHostDirectory)
   os.MkdirAll(cacheFileHostDirectory, 0777)
   os.Chmod(cacheFileHostDirectory, 0777)
   os.MkdirAll("/tmp/vgpulock", 0777)
   os.Chmod("/tmp/vgpulock", 0777)

   response.Mounts = append(response.Mounts,
    &kubeletdevicepluginv1beta1.Mount{
     ContainerPath: fmt.Sprintf("%s/vgpu/libvgpu.so", hostHookPath),
     HostPath:      hostHookPath + "/vgpu/libvgpu.so",
     ReadOnly:      true,
    },
    &kubeletdevicepluginv1beta1.Mount{
     ContainerPath: fmt.Sprintf("%s/vgpu", hostHookPath),
     HostPath:      cacheFileHostDirectory,
     ReadOnly:      false,
    },
    &kubeletdevicepluginv1beta1.Mount{
     ContainerPath: "/tmp/vgpulock",
     HostPath:      "/tmp/vgpulock",
     ReadOnly:      false,
    },
   )

   found := false
   for _, val := range currentCtr.Env {
    if strings.Compare(val.Name, "CUDA_DISABLE_CONTROL") == 0 {
     t, _ := strconv.ParseBool(val.Value)
     if !t {
      continue
     }
     found = true
     break
    }
   }
   if !found {
    response.Mounts = append(response.Mounts, &kubeletdevicepluginv1beta1.Mount{
     ContainerPath: "/etc/ld.so.preload",
     HostPath:      hostHookPath + "/vgpu/ld.so.preload",
     ReadOnly:      true,
    })
   }

   _, err = os.Stat(fmt.Sprintf("%s/vgpu/license", hostHookPath))
   if err == nil {
    response.Mounts = append(response.Mounts,
     &kubeletdevicepluginv1beta1.Mount{
      ContainerPath: "/tmp/license",
      HostPath:      fmt.Sprintf("%s/vgpu/license", hostHookPath),
      ReadOnly:      true,
     },
     &kubeletdevicepluginv1beta1.Mount{
      ContainerPath: "/usr/bin/vgpuvalidator",
      HostPath:      fmt.Sprintf("%s/vgpu/vgpuvalidator", hostHookPath),
      ReadOnly:      true,
     },
    )
   }
   responses.ContainerResponses = append(responses.ContainerResponses, response)
  }
 }
 klog.Infoln("Allocate Response", responses.ContainerResponses)
 device.PodAllocationTrySuccess(nodename, nvidia.NvidiaGPUDevice, NodeLockNvidia, current)
 return &responses, nil
}
```

Der Code ist lang — Fokus auf den Kern, MIG vorerst ausgelassen.
Zuerst `CUDA_DEVICE_MEMORY_LIMIT_$Index` für Speicherlimits.

```go
for i, dev := range devreq {
    limitKey := fmt.Sprintf("CUDA_DEVICE_MEMORY_LIMIT_%v", i)
    response.Envs[limitKey] = fmt.Sprintf("%vm", dev.Usedmem)

    /*tmp := response.Envs["NVIDIA_VISIBLE_DEVICES"]
    if i > 0 {
        response.Envs["NVIDIA_VISIBLE_DEVICES"] = fmt.Sprintf("%v,%v", tmp, dev.UUID)
    } else {
        response.Envs["NVIDIA_VISIBLE_DEVICES"] = dev.UUID
    }*/
}
```

Dann die Umgebungsvariable für Core-Limits nach angeforderten `gpucores`.

```go
response.Envs["CUDA_DEVICE_SM_LIMIT"] = fmt.Sprint(devreq[0].Usedcores)
```

Legt den Ort der share_region-mmap-Datei im Container fest.

```go
response.Envs["CUDA_DEVICE_MEMORY_SHARED_CACHE"] = fmt.Sprintf("%s/vgpu/%v.cache", hostHookPath, uuid.New().String())
```

GPU-Speicher-Oversubscription.```go
if *util.DeviceMemoryScaling > 1 {
 response.Envs["CUDA_OVERSUBSCRIBE"] = "true"
}

```
Compute-Limit deaktivieren.
```go
if *util.DisableCoreLimit {
 response.Envs[api.CoreLimitSwitch] = "disable"
}
```

Mount von vGPU-Dateien.
> Hier wird `libvgpu.so` ersetzt.

```go
// Cache unter /usr/local/vgpu/containers/xxx/xxx
cacheFileHostDirectory := fmt.Sprintf("%s/vgpu/containers/%s_%s", hostHookPath, current.UID, currentCtr.Name)
os.RemoveAll(cacheFileHostDirectory)

os.MkdirAll(cacheFileHostDirectory, 0777)
os.Chmod(cacheFileHostDirectory, 0777)
os.MkdirAll("/tmp/vgpulock", 0777)
os.Chmod("/tmp/vgpulock", 0777)

response.Mounts = append(response.Mounts,
 // libvgpu.so vom Host in den Pod — ersetzt NVIDIAs Standardtreiber
 &kubeletdevicepluginv1beta1.Mount{
  ContainerPath: fmt.Sprintf("%s/vgpu/libvgpu.so", hostHookPath),
  HostPath:      hostHookPath + "/vgpu/libvgpu.so",
  ReadOnly:      true,
 },
 // Datei für vGPU-Nutzung in den Pod mounten
 &kubeletdevicepluginv1beta1.Mount{
  ContainerPath: fmt.Sprintf("%s/vgpu", hostHookPath),
  HostPath:      cacheFileHostDirectory,
  ReadOnly:      false,
 },
 // Lock-Datei
 &kubeletdevicepluginv1beta1.Mount{
  ContainerPath: "/tmp/vgpulock",
  HostPath:      "/tmp/vgpulock",
  ReadOnly:      false,
 },
)
```

Dynamic Library ersetzen, wenn `CUDA_DISABLE_CONTROL=true` nicht gesetzt ist.

```go
found := false
for _, val := range currentCtr.Env {
 if strings.Compare(val.Name, "CUDA_DISABLE_CONTROL") == 0 {
  // Variable vorhanden aber false oder Parse-Fehler — ignorieren
  t, _ := strconv.ParseBool(val.Value)
  if !t {
   continue
  }
  // Nur als gefunden markieren, wenn true
  found = true
  break
 }
}
if !found {
 response.Mounts = append(response.Mounts,
  &kubeletdevicepluginv1beta1.Mount{
   ContainerPath: "/etc/ld.so.preload",
   HostPath:      hostHookPath + "/vgpu/ld.so.preload",
   ReadOnly:      true,
  },
 )
}```
Die Logik ist überschaubar: Umgebungsvariablen und Mounts ersetzen `libvgpu.so`, das Core- und Speicher-Limits anhand der Variablen durchsetzt.

### NVIDIA ###

```go
// pkg/device-plugin/nvidiadevice/nvinternal/plugin/server.go#L423
func (plugin *NvidiaDevicePlugin) getAllocateResponse(requestIds []string) (*kubeletdevicepluginv1beta1.ContainerAllocateResponse, error) {
 deviceIDs := plugin.deviceIDsFromAnnotatedDeviceIDs(requestIds)

 responseID := uuid.New().String()
 response, err := plugin.getAllocateResponseForCDI(responseID, deviceIDs)
 if err != nil {
  return nil, fmt.Errorf("failed to get allocate response for CDI: %v", err)
 }

 response.Envs = plugin.apiEnvs(plugin.deviceListEnvvar, deviceIDs)

 if *plugin.config.Flags.Plugin.PassDeviceSpecs {
  response.Devices = plugin.apiDeviceSpecs(*plugin.config.Flags.NvidiaDriverRoot, requestIds)
 }
 if *plugin.config.Flags.GDSEnabled {
  response.Envs["NVIDIA_GDS"] = "enabled"
 }
 if *plugin.config.Flags.MOFEDEnabled {
  response.Envs["NVIDIA_MOFED"] = "enabled"
 }

 return &response, nil
}
```

Kernzeile — setzt eine Umgebungsvariable:

```go
response.Envs = plugin.apiEnvs(plugin.deviceListEnvvar, deviceIDs)
```

`plugin.deviceListEnvvar` stammt aus:

```go
// NewNvidiaDevicePlugin returns an initialized NvidiaDevicePlugin
func NewNvidiaDevicePlugin(config *util.DeviceConfig, resourceManager rm.ResourceManager, cdiHandler cdi.Interface, cdiEnabled bool) *NvidiaDevicePlugin {
 _, name := resourceManager.Resource().Split()

 deviceListStrategies, _ := spec.NewDeviceListStrategies(*config.Flags.Plugin.DeviceListStrategy)

 return &NvidiaDevicePlugin{
  rm:                   resourceManager,
  config:               config,
  deviceListEnvvar:     "NVIDIA_VISIBLE_DEVICES",
  deviceListStrategies: deviceListStrategies,
  socket:               kubeletdevicepluginv1beta1.DevicePluginPath + "nvidia-" + name + ".sock",
  cdiHandler:           cdiHandler,
  cdiEnabled:           cdiEnabled,
  cdiAnnotationPrefix:  *config.Flags.Plugin.CDIAnnotationPrefix,

  // These will be reinitialized every time the plugin server is restarted.
  server: nil,
  health: nil,
  stop:   nil,
 }
}
```

Also: **NVIDIA_VISIBLE_DEVICES**

Diese ENV gehört zum NVIDIA-Device-Plugin. Mit gesetzter Variable weist `nvidia-container-toolkit` GPUs zu.

> HAMi nutzt hier die Fähigkeit von `nvidia-container-toolkit` zur GPU-Zuweisung.

### Kurzfassung ###

Kern von `Allocate` — drei Punkte:

- HAMi-Logik (`CUDA_DEVICE_MEMORY_LIMIT_X`, `CUDA_DEVICE_SM_LIMIT`; Mount von `libvgpu.so`).
- NVIDIA-Logik (`NVIDIA_VISIBLE_DEVICES`, GPU-Mount über Container Toolkit).

## 6. Zusammenfassung ##

Damit ist das Funktionsprinzip des HAMi-NVIDIA-Device-Plugins klar.

- Bei `Register` meldet sich das Plugin an — oft anderer `ResourceName` als NVIDIA. Zusätzlich `WatchAndRegister` für periodische GPU-Annotationen.
- `ListAndWatch` erkennt und repliziert Geräte — wie Time-Slicing, mehrere Pods pro GPU.
- `Allocate` macht vor allem drei Dinge:
    1. `NVIDIA_VISIBLE_DEVICES` setzen — GPU-Zuweisung über Container Toolkit.
    2. `libvgpu.so` mounten und Treiber ersetzen.
    3. HAMi-Limit-Variablen setzen — mit `libvgpu.so` Core- und Speicher-Limits.

**Kern in `Allocate`: Limit-Variablen und Mount von `libvgpu.so` statt des Originaltreibers.**

Nach Start laufen CUDA-Aufrufe zuerst durch `libvgpu.so`, das Limits anhand der Umgebungsvariablen durchsetzt.

Antwort auf die Eingangsfrage: **Warum ein eigenes Plugin? Fehlen dem NVIDIA-Plugin Funktionen?**

Gegenüber dem NVIDIA-Plugin hat HAMi u. a. ergänzt:

1. Beim Registrieren zusätzlich `WatchAndRegister` für GPU-Annotationen am Node.
2. `ListAndWatch` mit Replikation — mehrere Pods pro physischer GPU (NVIDIA: Time-Slicing).
3. `Allocate` mit HAMi-Logik:
    - (`libvgpu.so` mounten, Treiber ersetzen).
    - (Limit-Variablen wie `CUDA_DEVICE_MEMORY_LIMIT_X` und `CUDA_DEVICE_SM_LIMIT` mit `libvgpu.so`).

---

## 7. FAQ ##

### Wie kommt `libvgpu.so` auf den Knoten? ###

`Allocate` mountet `libvgpu.so` per `HostPath` — die Datei muss auf dem Host existieren.

**Wie gelangt `libvgpu.so` auf den Host?**
Die Datei steckt im HAMi-Device-Plugin-Image und wird beim Start vom Pod auf den Host kopiert. Relevantes YAML:

```yaml
- name: NVIDIA_MIG_MONITOR_DEVICES
  value: all
- name: HOOK_PATH
  value: /usr/local
image: 192.168.116.54:5000/projecthami/hami:v2.3.13
imagePullPolicy: IfNotPresent
lifecycle:
  postStart:
    exec:
      command:
      - /bin/sh
      - -c
      - cp -f /k8s-vgpu/lib/nvidia/* /usr/local/vgpu/
name: device-plugin
resources: {}
securityContext:
  allowPrivilegeEscalation: false
  capabilities:
    add:
    - SYS_ADMIN
    drop:
    - ALL
terminationMessagePath: /dev/termination-log
terminationMessagePolicy: File
volumeMounts:
- mountPath: /var/lib/kubelet/device-plugins
  name: device-plugin
- mountPath: /usr/local/vgpu
  name: lib
```

Ein hostPath wird gemountet; der Container führt **`cp -f /k8s-vgpu/lib/nvidia/* /usr/local/vgpu/`** aus.

---
*Mehr zum HAMi-Projekt: [GitHub-Repository](https://github.com/Project-HAMi/HAMi) oder [Slack-Community](https://cloud-native.slack.com/archives/C07T10BU4R2).*
