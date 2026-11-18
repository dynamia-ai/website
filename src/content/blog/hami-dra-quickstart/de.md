---
title: 'HAMi integriert Kubernetes DRA: Praxisleitfaden für das GPU-Ressourcenmodell der nächsten Generation'
coverTitle: HAMi DRA Praxisleitfaden
date: '2026-05-22'
excerpt: Praxisleitfaden zu HAMi, DRA-Deployment, GPU-Speicher- und Compute-Partitionierung, nativem DRA und DevicePlugin-kompatibler Migration.
author: 意琦行
tags:
  - HAMi
  - Kubernetes
  - DRA
  - GPU Sharing
  - vGPU
  - KI-Infrastruktur
category: Technical Deep Dive
linktitle: HAMi DRA Praxisleitfaden
---

> Originalautor: 意琦行  
> Nachdruck von: [HAMi 正式接入 Kubernetes DRA：下一代 GPU 资源模型实践指南](https://www.lixueduan.com/posts/kubernetes/56-hami-dra-quickstart/)

[HAMi](https://github.com/Project-HAMi/HAMi) ist eine der aktivsten Open-Source-vGPU-Lösungen für Kubernetes. Es kann eine physische GPU nach Speicher und Compute in mehrere virtuelle GPUs partitionieren, sodass verschiedene Pods dasselbe Gerät teilen.

Dieser Beitrag fokussiert Deployment und Nutzung von HAMi im DRA-Modus. Nach Installation des HAMi-DRA-Treibers reichen wir Pods im nativen DRA-Modus und im DevicePlugin-kompatiblen Modus ein und prüfen, ob die GPU-Partitionierung wie erwartet funktioniert.

---

Kubernetes 1.34 hat DRA (Dynamic Resource Allocation) offiziell auf GA gehoben. Der zentrale Fortschritt: Der Scheduler beteiligt sich an der Ressourcenzuweisung, matcht Geräteattribute beim Pod-Scheduling und vermeidet das DevicePlugin-Problem, dass ein Pod erst auf dem Node feststellt, dass Ressourcen nicht reichen.

**Aktuelle HAMi-Versionen sind offiziell in DRA integriert.** Nutzer können den nativen DRA-Modus verwenden oder per DevicePlugin-kompatiblem Modus migrieren.

## Was ist HAMi

HAMi ist eine Middleware zur Virtualisierung heterogener KI-Rechensysteme – eine Open-Source-Plattform für heterogene KI-Beschleuniger in Kubernetes-Clustern. Früher als k8s-vGPU-scheduler bekannt, ermöglicht HAMi Geräte-Sharing über Container und Workloads.

HAMi ist ein CNCF-Sandbox-Projekt und im CNCF Landscape sowie CNAI Landscape gelistet.

![HAMi ecosystem overview](https://img.lixueduan.com/kubernetes/vgpu/hami-ecosystem-overview.png)

### Kernfunktionen

**Geräte-Sharing**

- Multi-Device: kompatibel mit heterogenen KI-Beschleunigern wie GPUs und NPUs.
- Gemeinsamer Zugriff: mehrere Container können Geräte parallel teilen und die Auslastung erhöhen.

**Speicherverwaltung**

- Harte Limits: strikte Speichergrenzen im Container gegen Ressourcenkonflikte.
- Dynamische Zuteilung: Gerätespeicher bedarfsorientiert.
- Flexible Einheiten: Speicher in MB oder als Prozentsatz des Gesamtspeichers.

**Gerätespezifikation**

- Typauswahl: bestimmte heterogene Beschleunigertypen anfordern.
- UUID-Targeting: gezielt bestimmte Geräte per UUID.

**Bedienbarkeit**

- Transparent für Workloads: keine Code-Änderungen im Container.
- Einfaches Deployment: Installation und Deinstallation per Helm.

**Offene Governance**

- Community-getrieben: initiiert von Organisationen aus Internet, Finanz, Fertigung, Cloud und weiteren Branchen.
- Neutrale Entwicklung: als Open-Source-Projekt unter CNCF.

## HAMi installieren

Voraussetzungen:

- Kubernetes 1.34 oder höher mit aktiviertem [DRAConsumableCapacity Feature Gate](https://kubernetes.io/docs/reference/command-line-tools-reference/feature-gates/).
  - In Kubernetes 1.34 und 1.35 ist DRAConsumableCapacity nicht standardmäßig aktiv und muss manuell konfiguriert werden.
- Container-Runtime mit aktiviertem CDI.
- NVIDIA-GPU-Treiber 440 oder höher.

Besonders wichtig: DRAConsumableCapacity ist erst ab Kubernetes 1.36 standardmäßig aktiv; für 1.34 und 1.35 manuell einschalten.

### GPU Operator installieren

Bei der GPU-Operator-Installation DevicePlugin deaktivieren:

```bash
helm repo add nvidia https://helm.ngc.nvidia.com/nvidia && helm repo update

helm upgrade --install --wait gpu-operator \
     -n gpu-operator --create-namespace \
     nvidia/gpu-operator \
     --version=v26.3.1 \
     --set driver.enabled=true \
     --set devicePlugin.enabled=false
```

> `--set devicePlugin.enabled=false`: deaktiviert DevicePlugin, um Konflikte mit dem später installierten DRA-Treiber zu vermeiden.

### Cert-manager installieren

Der HAMi-DRA-Webhook benötigt TLS-Zertifikate – cert-manager zuerst für automatische Zertifikatsausstellung installieren.

```bash
helm repo add cert-manager https://charts.jetstack.io
helm repo update

helm install cert-manager cert-manager/cert-manager \
  -n cert-manager --create-namespace \
  --set crds.enabled=true
```

### HAMi mit Helm installieren

Node mit `gpu=on` labeln. Nodes ohne dieses Label werden von HAMi nicht verwaltet.

```bash
#kubectl label nodes {nodeid} gpu=on

kubectl label nodes ecs-a10-sh gpu=on
```

HAMi-Chart-Repository hinzufügen:

```bash
helm repo add hami-charts https://project-hami.github.io/HAMi/
```

HAMi installieren:

```bash
# The key setting is --set dra.enabled=true, which enables DRA mode.
helm -n hami-system install hami hami-charts/hami --set dra.enabled=true --create-namespace
```

> **Hinweis**: DRA-Modus ist inkompatibel mit dem traditionellen Modus. Beides nicht gleichzeitig aktivieren.

Ist der GPU-Treiber auf dem Host vorinstalliert (nicht über GPU Operator), diese Option setzen:

```bash
--set hami-dra.drivers.nvidia.containerDriver=false
```

### Verifikation

Unter normalen Umständen sollten folgende Pods im Namespace `hami-system` laufen:

```bash
root@ECS-A10-SH:/data/nfs/shared-skills-cicd# k -n hami-system get po
NAME                                     READY   STATUS    RESTARTS   AGE
hami-dra-driver-kubelet-plugin-hflbh     1/1     Running   0          2m49s
hami-hami-dra-monitor-7b484d5f95-rlkcg   1/1     Running   0          22m
hami-hami-dra-webhook-64bfdc6b86-d4nlr   1/1     Running   0          22m
```

## Nutzung

### ResourceSlice ansehen

Prüfen, ob der DRA-Treiber ein ResourceSlice publiziert hat:

```bash
root@ECS-A10-SH:/data/nfs/shared-skills-cicd# kubectl get resourceslice
NAME                                             NODE         DRIVER                          POOL         AGE
ecs-a10-sh-hami-core-gpu.project-hami.io-hnn6d   ecs-a10-sh   hami-core-gpu.project-hami.io   ecs-a10-sh   119s
```

Details:

```bash
root@ECS-A10-SH:/data/nfs/shared-skills-cicd# kubectl get resourceslice ecs-a10-sh-hami-core-gpu.project-hami.io-hnn6d -oyaml
apiVersion: resource.k8s.io/v1
kind: ResourceSlice
metadata:
  creationTimestamp: "2026-05-13T09:28:56Z"
  generateName: ecs-a10-sh-hami-core-gpu.project-hami.io-
  generation: 1
  name: ecs-a10-sh-hami-core-gpu.project-hami.io-hnn6d
  ownerReferences:
  - apiVersion: v1
    controller: true
    kind: Node
    name: ecs-a10-sh
    uid: 76c7db94-fe0b-44ea-9b07-8bdb6132888b
  resourceVersion: "61417761"
  uid: 46d46b45-108e-45e3-98f2-000a091571d3
spec:
  devices:
  - attributes:
      architecture:
        string: Ampere
      brand:
        string: Nvidia
      cudaComputeCapability:
        version: 8.6.0
      cudaDriverVersion:
        version: 12.4.0
      driverVersion:
        version: 550.144.3
      minor:
        int: 0
      pcieBusID:
        string: 0000:65:01.0
      productName:
        string: NVIDIA A10
      resource.kubernetes.io/pcieRoot:
        string: pci0000:64
      type:
        string: hami-gpu
      uuid:
        string: GPU-f1c7d08c-ae21-13e7-0de0-9eb14ff71eaf
    capacity:
      cores:
        value: "100"
      memory:
        value: 23028Mi
    name: hami-gpu-0
  driver: hami-core-gpu.project-hami.io
  nodeName: ecs-a10-sh
  pool:
    generation: 1
    name: ecs-a10-sh
    resourceSliceCount: 1
```

Das ResourceSlice enthält u. a. GPU-Architektur, Modell und Speicher.

### Workload einreichen: nativer DRA-Modus

Im nativen DRA-Ablauf wird zuerst ein ResourceClaim erstellt, dann ein Pod, der diesen ResourceClaim nutzt.

![DRA resource allocation flow](https://img.lixueduan.com/kubernetes/dra/dra-p2-flowchart-dra-allocation.jpg)

#### Workload einreichen

Vollständiges YAML für ResourceClaim und zugehörigen Pod:

```yaml
# Nativer DRA-Modus: ResourceClaim manuell anlegen.
# 10 GiB Speicher und 50 Cores auf einer A10-GPU anfordern.

apiVersion: resource.k8s.io/v1
kind: ResourceClaim
metadata:
  name: gpu-half-claim
spec:
  devices:
    requests:
    - name: gpu
      exactly:
        deviceClassName: hami-core-gpu.project-hami.io
        allocationMode: ExactCount
        count: 1
        capacity:
          requests:
            cores: 50
            memory: "10Gi"
---
apiVersion: v1
kind: Pod
metadata:
  name: gpu-test-dra-native
spec:
  containers:
  - name: cuda
    image: 172.31.0.2:5000/nvidia/cuda:13.0.1-base-ubi9
    command: ["sleep", "3600"]
    resources:
      claims:
      - name: gpu
  resourceClaims:
  - name: gpu
    resourceClaimName: gpu-half-claim
  restartPolicy: Never
```

#### Scheduling prüfen

Der ResourceClaim zeigt die Ressourcenzuweisung:

```bash
root@ECS-A10-SH:~/lixd/deploy/gpu/hami/examples# k get po
NAME                  READY   STATUS    RESTARTS   AGE
gpu-test-dra-native   1/1     Running   0          88s
root@ECS-A10-SH:~/lixd/deploy/gpu/hami/examples# k get resourceclaim
NAME             STATE                AGE
gpu-half-claim   allocated,reserved   21s
root@ECS-A10-SH:~/lixd/deploy/gpu/hami/examples# k get resourceclaim gpu-half-claim -oyaml
apiVersion: resource.k8s.io/v1
kind: ResourceClaim
metadata:
  name: gpu-half-claim
  namespace: default
spec:
  devices:
    requests:
    - exactly:
        allocationMode: ExactCount
        capacity:
          requests:
            cores: "50"
            memory: 10Gi
        count: 1
        deviceClassName: hami-core-gpu.project-hami.io
      name: gpu
status:
  allocation:
    devices:
      results:
      - consumedCapacity:
          cores: "50"
          memory: 10Gi
        device: hami-gpu-0
        driver: hami-core-gpu.project-hami.io
        pool: ecs-a10-sh
        request: gpu
        shareID: 6108e68f-a7ec-4a30-9782-634885c0c728
    nodeSelector:
      nodeSelectorTerms:
      - matchFields:
        - key: metadata.name
          operator: In
          values:
          - ecs-a10-sh
  reservedFor:
  - name: gpu-test-dra-native
    resource: pods
    uid: d99dc6df-092c-4f3a-ac55-cfb88c017af7
```

#### Ergebnis

`nvidia-smi` im Pod zeigt den angeforderten 10-GiB-Speicher – HAMi wirkt wie erwartet.

```bash
[HAMI-core Msg(51:140707774973760:libvgpu.c:870)]: Initializing.....
Wed May 13 10:58:20 2026
+-----------------------------------------------------------------------------------------+
| NVIDIA-SMI 550.144.03             Driver Version: 550.144.03     CUDA Version: 13.0     |
|-----------------------------------------+------------------------+----------------------+
| GPU  Name                 Persistence-M | Bus-Id          Disp.A | Volatile Uncorr. ECC |
| Fan  Temp   Perf          Pwr:Usage/Cap |           Memory-Usage | GPU-Util  Compute M. |
|                                         |                        |               MIG M. |
|=========================================+========================+======================|
|   0  NVIDIA A10                     On  |   00000000:65:01.0 Off |                    0 |
|  0%   32C    P8             22W /  150W |       0MiB /  10240MiB |      0%      Default |
|                                         |                        |                  N/A |
+-----------------------------------------+------------------------+----------------------+

+-----------------------------------------------------------------------------------------+
| Processes:                                                                              |
|  GPU   GI   CI        PID   Type   Process name                              GPU Memory |
|        ID   ID                                                               Usage      |
|=========================================================================================|
|  No running processes found                                                             |
+-----------------------------------------------------------------------------------------+
[HAMI-core Msg(51:140707774973760:multiprocess_memory_limit.c:703)]: Cleanup on exit for PID 51
[HAMI-core Msg(51:140707774973760:multiprocess_memory_limit.c:739)]: Exit cleanup complete for PID 51
```

### Workload einreichen: DevicePlugin-kompatibler Modus

Der native DRA-Modus erfordert manuelles Anlegen eines ResourceClaims – für bestehende Workloads wenig komfortabel.

Für einfachere Migration bietet HAMi einen Kompatibilitätsmodus: Ressourcen wie beim DevicePlugin anfordern; der HAMi-DRA-Webhook **fängt die Anfrage ab und wandelt sie in einen ResourceClaim um**. Nach Scheduler-Zuweisung wird der Claim in den Pod gemountet.

#### Workload einreichen

Wie beim DevicePlugin Ressourcen normal unter `resources` anfordern:

```yaml
# Kompatibilitätsmodus: GPUs wie bisher anfordern.
# Der HAMi-Webhook wandelt die Anfrage automatisch in einen ResourceClaim um.
# 1 GPU, 10 GiB Speicher und 50 % Compute anfordern.

apiVersion: v1
kind: Pod
metadata:
  name: gpu-test-compatible
spec:
  containers:
  - name: cuda
    image: 172.31.0.2:5000/nvidia/cuda:13.0.1-base-ubi9
    command: ["sleep", "3600"]
    resources:
      limits:
        nvidia.com/gpu: 1
        nvidia.com/gpumem: 10240
        nvidia.com/gpucores: 50
  restartPolicy: Never
```

#### Scheduling prüfen

HAMi erzeugt automatisch einen ResourceClaim aus `nvidia.com/gpumem` und `nvidia.com/gpucores` und bindet ihn an den Pod.

Der zugehörige ResourceClaim:

```yaml
root@ECS-A10-SH:~/lixd/deploy/gpu/hami/examples# k get resourceclaim
NAME                               STATE                AGE
default-gpu-test-compatible-cuda   allocated,reserved   2m47s
root@ECS-A10-SH:~/lixd/deploy/gpu/hami/examples# k get resourceclaim default-gpu-test-compatible-cuda -oyaml
apiVersion: resource.k8s.io/v1
kind: ResourceClaim
metadata:
  creationTimestamp: "2026-05-13T11:14:06Z"
  finalizers:
  - resource.kubernetes.io/delete-protection
  name: default-gpu-test-compatible-cuda
  namespace: default
  resourceVersion: "61451167"
  uid: 8212ef37-f71c-45ca-ac4a-f94ead923eef
spec:
  devices:
    requests:
    - exactly:
        allocationMode: ExactCount
        capacity:
          requests:
            cores: "50"
            memory: "10737418240"
        count: 1
        deviceClassName: hami-core-gpu.project-hami.io
        selectors:
        - cel:
            expression: device.attributes["hami-core-gpu.project-hami.io"].type ==
              "hami-gpu"
      name: gpu
status:
  allocation:
    devices:
      results:
      - consumedCapacity:
          cores: "50"
          memory: 10Gi
        device: hami-gpu-0
        driver: hami-core-gpu.project-hami.io
        pool: ecs-a10-sh
        request: gpu
        shareID: a8dba99f-7841-41ad-9f07-5ec39ddee543
    nodeSelector:
      nodeSelectorTerms:
      - matchFields:
        - key: metadata.name
          operator: In
          values:
          - ecs-a10-sh
  reservedFor:
  - name: gpu-test-compatible
    resource: pods
    uid: 173a6d7f-665b-4b2d-961c-f550d70f7484
```

Schlüsselkonfiguration:

```yaml
spec:
  devices:
    requests:
    - exactly:
        allocationMode: ExactCount
        capacity:
          requests:
            cores: "50"
            memory: "10737418240"
        count: 1
```

Vergleich mit der ursprünglichen Pod-Ressourcenanfrage:

```yaml
resources:
  limits:
    nvidia.com/gpu: 1
    nvidia.com/gpumem: 10240
    nvidia.com/gpucores: 50
```

Webhook-Konvertierung:

| Ursprüngliche Ressourcenanfrage | ResourceClaim-Feld |
| --- | --- |
| `nvidia.com/gpu: 1` | `requests.count: 1` |
| `nvidia.com/gpumem: 10240` | `requests.capacity.memory` |
| `nvidia.com/gpucores: 50` | `requests.capacity.cores` |

#### Ergebnis

Sichtbarer Speicher ebenfalls 10240 MiB – HAMi funktioniert im Kompatibilitätsmodus.

```bash
root@ECS-A10-SH:~/lixd/deploy/gpu/hami/examples# k exec -it gpu-test-compatible -- nvidia-smi
[HAMI-core Msg(57:139707024262976:libvgpu.c:870)]: Initializing.....
Wed May 13 11:21:39 2026
+-----------------------------------------------------------------------------------------+
| NVIDIA-SMI 550.144.03             Driver Version: 550.144.03     CUDA Version: 13.0     |
|-----------------------------------------+------------------------+----------------------+
| GPU  Name                 Persistence-M | Bus-Id          Disp.A | Volatile Uncorr. ECC |
| Fan  Temp   Perf          Pwr:Usage/Cap |           Memory-Usage | GPU-Util  Compute M. |
|                                         |                        |               MIG M. |
|=========================================+========================+======================|
|   0  NVIDIA A10                     On  |   00000000:65:01.0 Off |                    0 |
|  0%   32C    P8             22W /  150W |       0MiB /  10240MiB |      0%      Default |
|                                         |                        |                  N/A |
+-----------------------------------------+------------------------+----------------------+

+-----------------------------------------------------------------------------------------+
| Processes:                                                                              |
|  GPU   GI   CI        PID   Type   Process name                              GPU Memory |
|        ID   ID                                                               Usage      |
|=========================================================================================|
|  No running processes found                                                             |
+-----------------------------------------------------------------------------------------+
[HAMI-core Msg(57:139707024262976:multiprocess_memory_limit.c:703)]: Cleanup on exit for PID 57
[HAMI-core Msg(57:139707024262976:multiprocess_memory_limit.c:739)]: Exit cleanup complete for PID 57
```

## Zusammenfassung

Dieser Beitrag führt den kompletten HAMi-DRA-Workflow von Installation bis Verifikation durch:

1. **HAMi DRA deployen**: DevicePlugin deaktivieren, HAMi per Helm installieren, `dra.enabled=true` setzen.
2. **Nativer DRA-Modus**: ResourceClaim manuell für GPU-Speicher und Compute anlegen, im Pod über `resourceClaim` referenzieren.
3. **DevicePlugin-kompatibler Modus**: klassische Anfragen wie `nvidia.com/gpu` beibehalten; der HAMi-DRA-Webhook wandelt sie in ResourceClaims um – Migration ohne Workload-Änderung.

Der Kernunterschied: Wie der ResourceClaim entsteht – im nativen Modus manuell, im Kompatibilitätsmodus automatisch. Scheduling- und Partitionierungslogik darunter ist gleich.
