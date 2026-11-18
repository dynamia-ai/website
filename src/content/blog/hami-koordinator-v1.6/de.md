---
title: >-
  Open-Source-Synergie: Koordinator v1.6 – gemeinsam mit der HAMi-Community
  AI/ML-Heterogeneous-Scheduling neu denken
coverTitle: 'Koordinator × HAMi: Open-Source-Scheduling-Synergie'
date: '2025-08-05'
excerpt: >-
  Koordinator v1.6 ist erschienen – mit vertiefter Zusammenarbeit mit dem
  CNCF-Sandbox-Projekt HAMi für GPU-Sharing mit starker Isolation: effizienteres
  Scheduling und Isolation für AI-Training und Inferenz.
author: Dynamia AI Team
tags:
  - vGPU
  - HAMi
  - GPU-Sharing
  - Cloud Native
  - Kubernetes
  - AI-Infrastruktur
category: Product Release
coverImage: /images/blog/Koordinator-v1.6/cover.jpg
linktitle: HAMi × Koordinator v1.6
---


> Originalautoren: Wang Jianyu, Zeng Fansong, Song Tao, Han Rougang

## Vorwort

### Aktueller Stand der Community-Zusammenarbeit

Vor dem Hintergrund des schnellen Wachstums von AI/ML- und Großmodell-Szenarien wird Open-Source-Zusammenarbeit in der Community zu einer zentralen Treiberkraft für technische Innovation. Die Koordinator-Community und das CNCF-Sandbox-Projekt HAMi haben in Version v1.6 eng kooperiert und gemeinsam **GPU-Sharing mit starker Isolation** eingeführt. Das liefert eine effizientere Lösung für Ressourcen-Scheduling und Isolation in AI-Trainings- und Inferenzszenarien. Die Kooperation verbindet Koordinators Scheduling-Expertise mit HAMis Stärken in Device-Management-Middleware und unterstützt AI-Szenarien über folgende Kernfähigkeit:

- **GPU-Sharing mit starker Isolation**: Auf Basis der CUDA-Runtime-Interception von HAMi-Core können mehrere Container dieselbe GPU sicher teilen. Nutzer weisen Rechenleistung und Speicheranteil bedarfsgerecht zu – höhere Deploymentsdichte für kleine Modelle oder leichte Inferenz, ohne Ressourcenverschwendung durch exklusive Belegung ganzer Karten.

Dies ist das erste gemeinsame Feature-Release von Koordinator und HAMi und ein Meilenstein bei der Standardisierung heterogener Ressourcen-Schedules. Beide Seiten wollen die Kooperation vertiefen, weitere Ende-zu-Ende-Lösungen umsetzen, technische Integration im Ökosystem fördern und Unternehmen beim Senken von Kosten und Steigern der Effizienz unterstützen.

Nachfolgend die vollständige v1.6-Vorstellung aus der offiziellen Koordinator-Ankündigung, übernommen aus dem [offiziellen Alibaba-Cloud-Infrastruktur-Artikel](https://mp.weixin.qq.com/s/0NEJQUBzyvnSMQRJ7h90Kw):

### Hintergrund

Mit der Verbreitung großer Modelle wie DeepSeek steigt der Bedarf an Scheduling heterogener Geräteressourcen in AI und HPC rasch – für GPUs, NPUs oder RDMA. Effizientes Management und Scheduling ist eine Kernfrage der Branche. Koordinator reagiert darauf, vertieft heterogenes Device-Scheduling und bringt in v1.6 eine Reihe neuer Features, die Kunden bei heterogenen Scheduling-Herausforderungen unterstützen.

In v1.6 verbessern wir Device-Topology-Scheduling und unterstützen die Wahrnehmung von GPU-Topologien für mehr Maschinentypen – das beschleunigt GPU-Interconnect in AI-Anwendungen deutlich. Mit dem Open-Source-Projekt HAMi liefern wir Ende-zu-Ende-GPU-&-RDMA-Gemeinsamallokation sowie starke GPU-Isolation, verbessern Cross-Machine-Interconnect typischer Training-Workloads und die Deployment-Dichte bei Inferenz, sichern Anwendungsleistung und erhöhen die Clusterauslastung. Gleichzeitig erweitern wir das Ressourcen-Plugin der Kubernetes-Community um unterschiedliche Node-Scoring-Strategien pro Ressourcentyp – das reduziert GPU-Fragmentierung, wenn GPU- und CPU-Tasks im selben Cluster laufen.

Seit dem Open-Source-Start im April 2022 hat Koordinator 14 Major Releases veröffentlicht, mit Beiträgen u. a. von Alibaba, Ant Group, Intel, Xiaohongshu, Xiaomi, iQIYI, 360 und Youzan. Besonders in v1.6.0 haben zehn neue Entwickler aktiv mitgebaut: @LY-today, @AdrianMachao, @TaoYang526, @dongjiang1989, @chengjoey, @JBinin, @clay-wangzhi, @ferris-cx, @nce3xin und @lijunxin559. Danke an sie und an alle Community-Mitglieder für ihr Engagement!

### Zentrale Highlights

#### 1. GPU-Topology-aware Scheduling: schnellerer GPU-Interconnect in AI-Anwendungen

Mit Deep Learning und HPC sind GPUs zentrale Ressource für rechenintensive Workloads. In Kubernetes-Clustern ist effiziente GPU-Nutzung entscheidend für die Performance – doch GPU-Leistung ist nicht uniform; Topologie und Konfiguration spielen eine Rolle. Beispiele:

1. Bei mehreren NUMA-Knoten beeinflussen physische Verbindungen zwischen GPU, CPU und Speicher Datentransfer und Recheneffizienz.
2. Bei NVIDIA L20/L40S hängt die Kommunikationseffizienz davon ab, ob GPUs dieselbe PCIe- oder NUMA-Domain teilen.
3. Bei Huaweis Ascend NPUs und NVIDIA H-Serien mit SharedNVSwitch in virtualisierten Umgebungen müssen GPU-Zuweisungen vordefinierten Partition-Regeln folgen.

![Integrationsarchitektur HAMi und Koordinator](/images/blog/Koordinator-v1.6/p1.png)

Koordinator bietet umfangreiche Device-Topology-Scheduling-APIs für GPU-Topologie-Anforderungen von Pods. Beispiele:

1. GPU, CPU und Speicher auf demselben NUMA-Knoten

```yaml
apiVersion: v1
kind: Pod
metadata:
  annotations:
    scheduling.koordinator.sh/numa-topology-spec: '{"numaTopologyPolicy":"Restricted","singleNUMANodeExclusive":"Preferred"}'
spec:
  containers:
  - resources:
      limits:
        koordinator.sh/gpu: 200
        cpu: 64
        memory: 500Gi
      requests:
        koordinator.sh/gpu: 200
        cpu: 64
        memory: 500Gi
```

1. GPUs auf derselben PCIe

```yaml
apiVersion: v1
kind: Pod
metadata:
  annotations:
    scheduling.koordinator.sh/device-allocate-hint: |-
      {
        "gpu": {
          "requiredTopologyScope": "PCIe"
        }
      }
spec:
  containers:
    - resources:
        limits:
          koordinator.sh/gpu: 200
```

1. GPUs auf demselben NUMA-Knoten

```yaml
apiVersion: v1
kind: Pod
metadata:
  annotations:
    scheduling.koordinator.sh/device-allocate-hint: |-
      {
        "gpu": {
          "requiredTopologyScope": "NUMANode"
        }
      }
spec:
  containers:
    - resources:
        limits:
          koordinator.sh/gpu: 400
```

1. GPUs gemäß vordefinierter Partition

Vordefinierte GPU-Partition-Regeln hängen vom GPU-Modell oder der Systemkonfiguration ab und können von der GPU-Konfiguration auf einem Knoten beeinflusst sein. Der Scheduler kennt Hardwaredetails nicht; Knotenkomponenten melden die Regeln an eine Custom Device Resource (CR), wie unten:

```yaml
apiVersion: scheduling.koordinator.sh/v1alpha1
kind: Device
metadata:
  annotations:
    scheduling.koordinator.sh/gpu-partitions: |
      {
        "1": [
          {
            "NVLINK": {
              "minors": [0],
              "gpuLinkType": "NVLink",
              "ringBusBandwidth": "400Gi",
              "allocationScore": "1"
            }
          }
        ],
        "2": [],
        "4": [],
        "8": []
      }
  labels:
    node.koordinator.sh/gpu-partition-policy: "Honor"
  name: node-1
```

Gibt es mehrere Partition-Schemata, kann der Nutzer festlegen, ob nach der optimalen Partition zugewiesen wird:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: hello-gpu
  annotations:
    scheduling.koordinator.sh/gpu-partition-spec: |
      {
        "allocatePolicy": "Restricted"
      }
spec:
  containers:
    - name: main
      resources:
        limits:
          koordinator.sh/gpu: 100
```

Braucht der Nutzer keine optimale Partition, weist der Scheduler möglichst „binpacked“ zu.

Mehr zu GPU-Topology-aware Scheduling in diesen Design-Dokumenten:

- [NUMA Topology Scheduling](https://github.com/koordinator-sh/koordinator/blob/main/docs/proposals/scheduling/20230415-numa-topology-scheduling.md)
- [Device Allocate Hint API](https://github.com/koordinator-sh/koordinator/blob/main/docs/proposals/scheduling/20230803-device-allocate-hint-apis.md)
- [GPU Partition APIs](https://github.com/koordinator-sh/koordinator/blob/main/docs/proposals/scheduling/20241008-gpu-partition-api.md)

Vielen Dank an Community-Entwickler @eahydra für die Beiträge zu diesem Feature!

### 2. Ende-zu-Ende-GDR-Unterstützung: bessere Interconnect-Performance bei Multi-Node-Tasks

![Koordinator-Quota-Management-System](/images/blog/Koordinator-v1.6/p2.png)

Beim AI-Training synchronisieren GPUs in kollektiver Kommunikation häufig Gewichte jeder Iteration. **GDR** (GPUDirect RDMA) adressiert die Effizienz des Datenaustauschs zwischen GPUs auf mehreren Maschinen: GPUs können Daten ohne CPU und Host-Speicher tauschen – weniger CPU/Memory-Overhead, geringere Latenz. Koordinator v1.6.0 implementiert dafür gemeinsames GPU/RDMA-Device-Scheduling. Architektur:

![HAMi-Koordinator Device-Orchestrierungsablauf](/images/blog/Koordinator-v1.6/p3.png)

1. Koordlet erkennt GPU- und RDMA-Devices auf dem Knoten und meldet sie an die Device-CR.
2. Koord-Manager synchronisiert Ressourcen aus der Device-CR nach `node.status.allocatable`.
3. Koord-Scheduler weist GPU und RDMA gemäß Device-Topologie zu und annotiert das Ergebnis am Pod.
4. Multus-CNI nutzt den Koordlet PodResources Proxy, holt zugewiesene RDMA-Devices und bindet die NICs in die Pod-Netzwerk-Namespaces.
5. Koordlet stellt ein NRI-Plugin bereit, das Devices in Container mountet.

Wegen vieler Komponenten und komplexer Umgebung bietet Koordinator v1.6.0 [Best Practices](https://koordinator.sh/docs/next/best-practices/gpu-and-rdma-joint-allocation/) für schrittweises Deploy von Koordinator, Multus-CNI und SRIOV-CNI. Nach dem Setup genügt folgende Pod-Spec für gemeinsame Allokation von GPU und RDMA:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: pod-vf01
  namespace: kubeflow
  annotations:
    scheduling.koordinator.sh/device-joint-allocate: |-
      {
        "deviceTypes": ["gpu","rdma"]
      }
    scheduling.koordinator.sh/device-allocate-hint: |-
      {
        "rdma": {
          "vfSelector": {}
        }
      }
spec:
  schedulerName: koord-scheduler
  containers:
  - name: container-vf
    resources:
      requests:
        koordinator.sh/gpu: 100
        koordinator.sh/rdma: 100
      limits:
        koordinator.sh/gpu: 100
        koordinator.sh/rdma: 100
```

Ende-zu-Ende-Tests für GDR mit Koordinator finden Sie in den Beispielen der [Best Practices](https://koordinator.sh/docs/next/best-practices/gpu-and-rdma-joint-allocation/). Danke an @ferris-cx für Beiträge zu diesem Feature!

### 3. GPU-Sharing mit starker Isolation: höhere Ressourcennutzung bei AI-Inferenz

GPUs sind in AI zentral für Training und Inferenz – oft aber teuer. In Produktion brauchen kleine Modelle oder leichte Inferenz nur einen Bruchteil der GPU (z. B. 20 % Rechenleistung oder Speicher), müssen aber häufig eine ganze High-End-Karte exklusiv belegen. Das verschwendet Rechenleistung und treibt Kosten.

Besonders typisch in:

- **Online-Inferenz**: geringer Compute-Bedarf, strikte Latenz – Deployment auf leistungsstarken GPUs.
- **Dev/Test**: Debugging benötigt wenig GPU, klassisches Scheduling nutzt Ressourcen schlecht.
- **Multi-Tenant-Cluster**: exklusive GPU pro Task führt zu ungleicher Verteilung und schlechter Hardwareauslastung.

Koordinator arbeitet mit HAMi zusammen: GPUs teilen und isolieren, mehrere Pods auf einer Karte – höhere Auslastung, geringere Kosten, flexible Anforderungen. Im GPU-Sharing-Modus lassen sich GPU-Cores oder Speicheranteile präzise zuweisen, ohne gegenseitige Störung.

![Pod-Ressourcenallokations-Workflow](/images/blog/Koordinator-v1.6/p4.png)

HAMi ist ein CNCF-Sandbox-Projekt als Device-Management-Middleware für Kubernetes. HAMi-Core interceptiert Aufrufe zwischen CUDA-Runtime (`libcudart.so`) und CUDA-Driver (`libcuda.so`) für Sharing und Isolation. In v1.6.0 nutzt Koordinator HAMi-Core für eine Ende-zu-Ende-GPU-Sharing-Lösung.

HAMi-Core installieren Sie per DaemonSet auf den Zielknoten mit folgendem YAML:

```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: hami-core-distribute
  namespace: default
spec:
  selector:
    matchLabels:
      koord-app: hami-core-distribute
  template:
    metadata:
      labels:
        koord-app: hami-core-distribute
    spec:
      affinity:
        nodeAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
            nodeSelectorTerms:
            - matchExpressions:
              - key: node-type
                operator: In
                values:
                - "gpu"
      containers:
      - command:
        - /bin/sh
        - -c
        - |
          cp -f /k8s-vgpu/lib/nvidia/libvgpu.so /usl/local/vgpu && sleep 3600000
        image: docker.m.daocloud.io/projecthami/hami:v2.4.0
        imagePullPolicy: Always
        name: name
        resources:
          limits:
            cpu: 200m
            memory: 256Mi
          requests:
            cpu: "0"
            memory: "0"
        volumeMounts:
        - mountPath: /usl/local/vgpu
          name: vgpu-hook
        - mountPath: /tmp/vgpulock
          name: vgpu-lock
      tolerations:
      - operator: Exists
      volumes:
      - hostPath:
          path: /usl/local/vgpu
          type: DirectoryOrCreate
        name: vgpu-hook
      - hostPath:
          path: /tmp/vgpulock
          type: DirectoryOrCreate
        name: vgpu-lock
```

GPU-Binpack im Koordinator-Scheduler ist standardmäßig aktiv. Nach Installation von Koordinator und HAMi-Core können Nutzer eine geteilte GPU anfordern und HAMi-Core-Isolation so aktivieren:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: pod-example
  namespace: default
  labels:
    # hami-core als GPU-Isolations-Provider
    koordinator.sh/gpu-isolation-provider: hami-core
spec:
  schedulerName: koord-scheduler
  containers:
  - command:
    - sleep
    - 365d
    image: busybox
    imagePullPolicy: IfNotPresent
    name: curlimage
    resources:
      limits:
        cpu: 40m
        memory: 40Mi
        koordinator.sh/gpu-shared: 1      # 1 geteilte GPU
        koordinator.sh/gpu-core: 50       # 50 % GPU-Kerne
        koordinator.sh/gpu-memory-ratio: 50 # 50 % GPU-Speicher
      requests:
        cpu: 40m
        memory: 40Mi
        koordinator.sh/gpu-shared: 1
        koordinator.sh/gpu-core: 50
        koordinator.sh/gpu-memory-ratio: 50
    terminationMessagePath: /dev/termination-log
    terminationMessagePolicy: File
  restartPolicy: Always
```

Anleitung für HAMi GPU-Sharing und -Isolation in Koordinator:

- [Device Scheduling - GPU Share With HAMi](https://koordinator.sh/docs/next/user-manuals/device-scheduling-gpu-share-with-hami/)

Danke an HAMi-Community-Mitglied @wawa0210 für die Unterstützung!

### 4. Differenzierte GPU-Scheduling-Strategie: GPU-Fragmentierung reduzieren

In modernen Kubernetes-Clustern werden CPU, Speicher, GPU usw. oft zentral verwaltet – Nutzungsmuster und Anforderungen unterscheiden sich jedoch stark, daher braucht es unterschiedliche Pack- und Spread-Strategien.

Beispiele:

- **GPU-Ressourcen**: Bei AI-Training/Inferenz wollen Nutzer GPU-Tasks bevorzugt auf bereits GPU-belegten Knoten planen („Packing“), um Auslastung zu maximieren und Fragmentierung zu vermeiden.
- **CPU und Speicher**: Vielfältigerer Bedarf – Online-Services oder Batch-Jobs verteilen sich lieber auf viele Knoten („Spreading“), um Hotspots zu vermeiden und Stabilität zu verbessern.

In gemischten Clustern beeinflussen sich Workloads gegenseitig:

- Laufen GPU-Training und CPU-intensive Tasks zusammen und belegt ein CPU-Task stark GPU-Knoten, können folgende GPU-Tasks wegen fehlender Nicht-GPU-Ressourcen in Pending hängen.
- Im Multi-Tenant-Betrieb fordern manche nur CPU/Speicher, andere GPUs – ohne Unterscheidung drohen Contention und unfaire Verteilung.

![GPU-Sharing- und Isolationsarchitektur](/images/blog/Koordinator-v1.6/p5.png)

Das native Kubernetes-Plugin NodeResourcesFit erlaubt derzeit nur dieselbe Scoring-Strategie für alle Ressourcen:

```yaml
apiVersion: kubescheduler.config.k8s.io/v1
kind: KubeSchedulerConfiguration
profiles:
  - pluginConfig:
      - name: NodeResourcesFit
        args:
          apiVersion: kubescheduler.config.k8s.io/v1
          kind: NodeResourcesFitArgs
          scoringStrategy:
            type: LeastAllocated
            resources:
              - name: cpu
                weight: 1
              - name: memory
                weight: 1
              - name: nvidia.com/gpu
                weight: 1
```

In der Praxis passt das nicht überall: GPU-Services wollen ganze GPU-Maschinen füllen (gegen Fragmentierung), CPU/MEM-Services eher verteilen (gegen CPU-Hotspots). Koordinator v1.6.0 bringt `NodeResourceFitPlus` für differenzierte Scoring-Strategien pro Ressource – Beispielkonfiguration:

```yaml
apiVersion: kubescheduler.config.k8s.io/v1
kind: KubeSchedulerConfiguration
profiles:
- pluginConfig:
  - args:
      apiVersion: kubescheduler.config.k8s.io/v1
      kind: NodeResourcesFitPlusArgs
      resources:
        nvidia.com/gpu:
          type: MostAllocated
          weight: 2
        cpu:
          type: LeastAllocated
          weight: 1
        memory:
          type: LeastAllocated
          weight: 1
    name: NodeResourcesFitPlus
  plugins:
    score:
      enabled:
      - name: NodeResourcesFitPlus
        weight: 2
  schedulerName: koord-scheduler
```

CPU/MEM-Workloads sollen zudem eher Nicht-GPU-Knoten nutzen, damit GPU-Maschinen nicht übermäßig CPU/Speicher verbrauchen und echte GPU-Tasks pending bleiben. `ScarceResourceAvoidance` in v1.6.0 markiert `nvidia.com/gpu` als knappe Ressource – Pods ohne GPU-Anforderung meiden solche Knoten:

```yaml
apiVersion: kubescheduler.config.k8s.io/v1
kind: KubeSchedulerConfiguration
profiles:
- pluginConfig:
  - args:
      apiVersion: kubescheduler.config.k8s.io/v1
      kind: ScarceResourceAvoidanceArgs
      resources:
      - nvidia.com/gpu
    name: ScarceResourceAvoidance
  plugins:
    score:
      enabled:
      - name: NodeResourcesFitPlus
        weight: 2
      - name: ScarceResourceAvoidance
        weight: 2
      disabled:
      - name: "*"
  schedulerName: koord-scheduler
```

Design und Nutzung der differenzierten GPU-Scheduling-Strategie:

- [Design Document](https://koordinator.sh/docs/next/designs/node-resource-fit-plus-scoring/)
- [User Manual](https://koordinator.sh/docs/next/user-manuals/node-resource-fit-plus-scoring/)

Danke an @LY-today für dieses Feature!

### 5. Feingranulare Ressourcenreservierung für effiziente AI-Workloads

Effiziente heterogene Ressourcen hängen oft von präziser Ausrichtung gekoppelter CPU- und NUMA-Ressourcen ab:

- **GPU-beschleunigte Tasks**: Überschreitet die physische Verbindung von GPU, CPU und Speicher eine NUMA-Grenze, steigt die Latenz – GPU, CPU und Speicher sollten auf einem NUMA-Knoten liegen.
- **AI-Inferenz**: latenzsensitiv – GPU- und CPU-Zuweisung möglichst nah beieinander.
- **Wissenschaftliches Rechnen**: HPC-Workloads (Molekuldynamik, Wetter) brauchen bandbreitenstarke, latenzarme Speicherzugriffe – CPU-Kerne und lokaler Speicher strikt ausrichten.

Das gilt für Scheduling und Reservierung: Reservierung sichert kritischen Tasks Ressourcen im Voraus. Einfache Mechanismen reichen für feingranulare Orchestrierung oft nicht:

- Reservierung von CPU/GPU auf einem bestimmten NUMA-Knoten.
- Multi-Tenant: unterschiedliche GPU+CPU+Speicher-Kombinationen strikt ausrichten.
- Ungenutzte Reservierungsreste flexibel nutzen, ohne Garantien zu verletzen.

Koordinator v1.6 erweitert Reservierung um feingranulare, flexible Orchestrierung:

1. Feingranulare Reservierung und Preemption von CPU- und GPU-Ressourcen.
2. Pods können reservierte Mengen exakt matchen.
3. Reservierungs-Affinität: Reservierungsnamen und Taint-Toleration.
4. Begrenzung der Pod-Anzahl pro Reservierung.
5. Reservierung kann Pods mit niedriger Priorität preempten.

Plugin-Änderungen:

1. `ReservationFilterPlugin` von PreScore nach Filter für genaueres Filtering.

Beispiele:

1. Exact-Match-Reservierung

Pod muss reservierte Mengen exakt treffen – engeres Matching zwischen Pod-Gruppen und Reservierungen, kontrollierbare Zuweisung.

```yaml
apiVersion: v1
kind: Pod
metadata:
  annotations:
    # Pod muss reservierte Mengen für die genannten Ressourcentypen exakt treffen (z. B. "cpu", "memory", "nvidia.com/gpu").
    scheduling.koordinator.sh/exact-match-reservation: '{"resourceNames":["cpu","memory","nvidia.com/gpu"]}'
spec:
  # Weitere PodSpec-Felder nach Bedarf
  containers:
  - name: app
    resources:
      requests:
        cpu: "4"
        memory: "8Gi"
        nvidia.com/gpu: "1"
      limits:
        cpu: "4"
        memory: "8Gi"
        nvidia.com/gpu: "1"
```

1. Reservierung ignorieren (`reservation-ignored`)

Pod darf Reservierungen ignorieren und ungenutzte, reservierte Idle-Ressourcen auf einem Knoten füllen; mit Preemption weniger Fragmentierung.

```yaml
apiVersion: v1
kind: Pod
metadata:
  labels:
    # Scheduling des Pods ignoriert Ressourcenreservierungen.
    scheduling.koordinator.sh/reservation-ignored: "true"
spec:
  containers:
  - name: app
    image: busybox
    command: ["sleep", "3600"]
```

1. Reservierungs-Affinität (nach Name)

```yaml
apiVersion: v1
kind: Pod
metadata:
  annotations:
    # Name der Reservierung, die der Pod matchen soll.
    scheduling.koordinator.sh/reservation-affinity: '{"name":"test-reservation"}'
spec:
  containers:
  - name: app
    image: busybox
    command: ["sleep", "3600"]
```

1. Reservierungs-Taints und Tolerations

```yaml
---
apiVersion: scheduling.koordinator.sh/v1alpha1
kind: Reservation
metadata:
  name: test-reservation
spec:
  # Taints der Reservierung – Ressourcen nur für tolerierende Pods.
  taints:
  - effect: NoSchedule
    key: test-taint-key
    value: test-taint-value
  # Weitere Reservation-Spec-Felder nach Bedarf

---
apiVersion: v1
kind: Pod
metadata:
  annotations:
    # Tolerations des Pods für Reservierungs-Taints.
    scheduling.koordinator.sh/reservation-affinity: |
      {
        "tolerations":[
          {
            "key":"test-taint-key",
            "operator":"Equal",
            "value":"test-taint-value",
            "effect":"NoSchedule"
          }
        ]
      }
spec:
  containers:
  - name: app
    image: busybox
    command: ["sleep", "3600"]
```

1. Reservierungs-Preemption aktivieren

Hinweis: High-Priority-Pod preemptiert Low-Priority-Reservierung – derzeit nicht unterstützt.

```yaml
apiVersion: kubescheduler.config.k8s.io/v1beta3
kind: KubeSchedulerConfiguration
profiles:
- pluginConfigs:
  - name: Reservation
    args:
      apiVersion: kubescheduler.config.k8s.io/v1beta3
      kind: ReservationArgs
      enablePreemption: true
  plugins:
    postFilter:
      # DefaultPreemption aus, Preemption im Reservation-Plugin an
      disabled:
      - name: DefaultPreemption
      enabled:
      - name: Reservation
```

Danke an @saintube für dieses Feature!

### 6. Co-Location: Mid-Tier für Idle-Ressourcen, Pod-level QoS

Co-Location verbessert die Auslastung, indem latenzsensible Online-Services und ressourcenintensive Offline-Batch-Jobs im selben Cluster laufen – bei steigender Auslastung wird Isolation zwischen Task-Typen zur Kernfrage.

Ziele der Isolation:

- **Performance hochpriorer Tasks**: stabile CPU-, Speicher- und I/O-Ressourcen für Low Latency.
- **Idle-Ressourcen nutzen**: Offline-Jobs nutzen ungenutzte Kapazität ohne Störung der Prod-Workloads.
- **Dynamische Anpassung**: Strategien je Knotenlast, um Contention und Verschwendung zu vermeiden.

Koordinator baut Isolation weiter aus; in v1.6 Optimierungen und Fixes rund um Overcommitment und Co-Location-QoS:

1. Mid-Tier-Overcommitment und Node-Profiling: neue Berechnungslogik – Overcommit unallokierter Knotenressourcen, kein sekundäres Overcommitment.
2. Optimierte Metrik-Degradation beim lastbewussten Scheduling.
3. CPU-QoS und Resctrl-QoS auf Pod-Ebene.
4. Prometheus-Metriken für Out-of-Band-Load-Management.
5. Fixes u. a. für Blkio-QoS und Ressourcen-Amplifikation.

Mid-Tier-Overcommitment seit v1.3 mit [Node Profiling](https://koordinator.sh/docs/designs/node-prediction/) – bisher stammten Mid-Tier-Ressourcen nur von allokierten Prod-Pods; leere Knoten hatten anfangs kein Mid-Tier, was Workloads behinderte. Die Community erhielt entsprechendes Feedback von Unternehmensnutzern.

![HAMi-Koordinator Ressourcen-Scheduling-Ablauf](/images/blog/Koordinator-v1.6/p6.png)

In v1.6 gilt für die Overcommitment-Formel:

> `NodeAllocatable * thresholdRatio) + ProdUnallocated * unallocatedRatio`
> `ProdReclaimable := min(max(0, ProdAllocated - ProdPeak * (1 + safeMargin)), NodeUnused)`

Zwei Änderungen der Logik:

1. Unallokierte Ressourcen können statisch überbucht werden – besseres Cold-Start-Verhalten.
2. Tatsächlich genutzte Knotenressourcen werden nicht überbucht – vermeidet zu hohe Schätzwerte durch sekundäres Overcommitment (z. B. wenn `ProdAllocated > NodeAllocatable` nach Node-Ressourcen-Amplifikation und `MidAllocatable` von der Realität abweicht).

Für Co-Location-QoS unterstützt v1.6 Pod-level QoS – u. a. Blacklist störender Pods und Canary-Rollouts:

1. Resctrl: Pod-level LLC- und Speicherbandbreiten-Isolation.
2. CPU-QoS: Pod-level CPU-QoS-Konfiguration.

Resctrl auf Pod-Ebene:

1. Resctrl im Koordlet Feature-Gate aktivieren.
2. LLC- und Speicherbandbreiten-Limits über Annotation `node.koordinator.sh/resctrl`, z. B.:

```yaml
apiVersion: v1
kind: Pod
metadata:
  annotations:
    node.koordinator.sh/resctrl: |
      {
        "llc": {"schemata": {"range": [0, 30]}},
        "mb":  {"schemata": {"percent": 20}}
      }
spec:
  containers:
  - name: app
    image: busybox
    command: ["sleep", "infinity"]
```

Pod-level CPU-QoS:

1. CPU-QoS aktivieren: <https://koordinator.sh/docs/user-manuals/cpu-qos/>
2. Policy über Annotation `koordinator.sh/cpuQOS`, z. B.:

```yaml
apiVersion: v1
kind: Pod
metadata:
  annotations:
    koordinator.sh/cpuQOS: '{"groupIdentity": 1}'
spec:
  containers:
  - name: app
    image: busybox
    command: ["sleep", "3600"]
```

Danke an @kangclzjc, @j4ckstraw, @lijunxin559, @tan90github und @yangfeiyu20102011 für Co-Location-Features!

### 7. Scheduling und Descheduling: höhere Betriebseffizienz

Cloud-Native wächst: größere Cluster, mehr Tasks – das fordert Scheduling-Performance und durchdachte Descheduling-Strategien:

- **Scheduling-Performance**: schnelle Pod-Entscheidungen, geringe Scheduling-Latenz in großen Clustern.
- **Descheduling**: Häufiges Umschichten migriert Workloads zwischen Knoten, erhöht Last und Risiken; zugleich Hotspots vermeiden und Produktion stabil halten.

Koordinator v1.6.0 optimiert Scheduler und Descheduler. Scheduler-Performance:

1. `MinMember`-Check für PodGroups nach `PreEnqueue` – weniger unnötige Scheduling-Zyklen.
2. Ressourcen-Rückgabe für Reservations in `AfterPreFilter`, nur auf erlaubten Knoten – geringere Komplexität.
3. Optimierte `CycleState`-Verteilung für `NodeNUMAResource`, `DeviceShare`, `Reservation` – weniger Speicher.
4. Latenz-Metriken für Extension Points wie `BeforePreFilter` und `AfterPreFilter`.

Descheduler v1.6.0:

#### 1. `LowNodeLoad`-Optimierung

a. `ProdHighThresholds` und `ProdLowThresholds` mit Koordinator-Priorität – differenzierte Auslastungssteuerung, weniger Prod-Hotspots, feinere Lastverteilung.

b. Sortierung zu evictender Pods per segmentierter Scoring-Funktion – geeigneter Pod, stabile Verteilung, nicht nur höchste Auslastung evicten.

c. Pre-Eviction-Check: Zielknoten darf durch Descheduling kein neuer Hotspot werden – weniger Descheduling-Schleifen.

#### 2. `MigrationController`-Erweiterungen

a. `ObjectLimiter` mit Namespace-Level-Rate-Limits; `ObjectLimiter` vom Arbitrator in den `MigrationController` verschoben – Fix für Rate-Limiting unter Concurrency.

b. `EvictAllBarePods` – Eviction von Pods ohne `OwnerRef`.

c. `MaxMigratingGlobally` – globale Obergrenze für Pod-Evictions.

d. `GetMaxUnavailable`: Rundung auf 0 wird zu 1 – konsistente Steuerung unavailableer Replikas.

#### 3. Neuer globaler Parameter `MaxNoOfPodsToEvictTotal` für Cluster-weite Eviction-Obergrenze – weniger Last, mehr Stabilität

Danke an @AdrianMachao, @songtao98, @LY-today, @zwForrest, @JBinin, @googs1025 und @bogo-y!

## Ausblick

Die Koordinator-Community stärkt GPU-Management und Scheduling weiter und plant ein Descheduling-Plugin gegen GPU-Fragmentierung durch ungleiche Allokation. Nächste Versionen bringen weitere Features für komplexe Workloads; Reservierung und Co-Location werden feingranularer.

Geplante Proposals:

- [Fine-grained device scheduling support for Ascend NPU](https://github.com/koordinator-sh/koordinator/issues/2335)
- [Provide a descheduling plugin to solve the resource imbalance problem](https://github.com/koordinator-sh/koordinator/issues/2332)
- [Reservation support for binding to already allocated Pods](https://github.com/koordinator-sh/koordinator/issues/2150)

Wichtige Nutzungsprobleme:

- [NRI plugin conflicts](https://github.com/koordinator-sh/koordinator/issues/2334)

Langfristige Proposals:

- [Provide an end-to-end, evolvable device management solution](https://github.com/koordinator-sh/koordinator/issues/2181)

Feedback aus der Praxis ist willkommen – wir laden mehr Entwickler ein, am Koordinator-Projekt mitzuarbeiten!

---

HAMi (Heterogeneous AI Computing Virtualization Middleware) ist eine One-Stop-Architektur zur Verwaltung heterogener AI-Compute-Geräte in Kubernetes-Clustern. Sie ermöglicht Sharing heterogener AI-Geräte und Ressourcen-Isolation zwischen Tasks, verbessert die Auslastung und bietet ein einheitliches Reuse-Interface. HAMi ist CNCF-Sandbox-Projekt und Teil des CNAI-Technology-Landscapes der CNCF.

Community-Website: <https://project-hami.io>

GitHub: <https://github.com/Project-HAMi>
