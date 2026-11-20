---
title: 'HAMi-vGPU-Lösung: Feinkörnige GPU-Partitionierung'
coverTitle: 'HAMi-vGPU-Lösung: Feinkörnige GPU-Partitionierung'
date: '2025-07-21'
excerpt: >-
  Einführung in HAMi als Open-Source-GPU-Virtualisierung — Installation,
  Konfiguration und Nutzung.
author: "Dynamia AI Team"
tags:
  - HAMi
  - GPU-Sharing
  - vGPU
  - Kubernetes
  - Heterogene Compute
category: Technical Deep Dive
coverImage: /images/blog/gpu1/cover2.jpg
language: de
linktitle: Feinkörnige GPU-Partitionierung
---

> Dieser Artikel stellt die Open-Source-GPU-Virtualisierung HAMi vor — Installation, Konfiguration und Nutzung.

Auszug aus:<https://mp.weixin.qq.com/s/7L6NuSSP_iMwbtooQIJUjw>

## 1. Warum GPU-Sharing / Partitionierung?

Zuerst die Frage: Warum brauchen wir GPU-Sharing und Partitionierung?

Anders formuliert: Auf Bare Metal können mehrere Prozesse eine GPU teilen — warum in Kubernetes nicht?

### Ressourcen-Sichtbarkeit

In Kubernetes sind Ressourcen an Nodes gebunden. Für GPUs meldet das NVIDIA Device Plugin an den Kube-apiserver; im Node-Objekt erscheinen die Kapazitäten.

Beispiel:

```bash
Capacity:
  cpu:                128
  ephemeral-storage:  879000896Ki
  hugepages-1Gi:      0
  hugepages-2Mi:      0
  memory:             1056457696Ki
  nvidia.com/gpu:     8
  pods:               110
  ```

Neben CPU und Memory steht hier `nvidia.com/gpu: 8` — acht GPUs auf dem Knoten.

### Ressourcen-Request

Beim Pod-Create können entsprechende Ressourcen angefordert werden, z. B. eine GPU:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: gpu-pod
spec:
  containers:
  - name: gpu-container
    image: nvidia/cuda:11.0-base   # A GPU-enabled image
    resources:
      limits:
        nvidia.com/gpu: 1          # Request 1 GPU
    command: ["nvidia-smi"]        # Example command to show GPU info
  restartPolicy: OnFailure
  ```

Nach `kubectl apply` weist der kube-scheduler den Pod einem Knoten mit ausreichend GPUs zu.

Die angeforderten GPU-Ressourcen gelten als belegt und werden nicht erneut vergeben.

Die Antwort auf unsere Frage:

- Das Device Plugin erkennt physische GPUs und meldet sie an den apiserver.
- Der kube-scheduler verbraucht Ressourcen gemäß Pod-Requests.

**Sobald ein Pod GPU-Ressourcen auf einem Node belegt, markiert Kubernetes sie als verbraucht — weitere Pods scheitern ggf. am Scheduling.**

In der Praxis können GPUs mehrere Pods tragen; Kubernetes-Scheduling erlaubt ohne Zusatzlösung kein Teilen wie erwartet.

Daher brauchen wir GPU-Sharing und Partitionierung.

Heute: die Open-Source-vGPU-Lösung **HAMi[1]**.

<div style="border: 1px solid #ddd; padding: 5px; background-color: #f9f9f9;">
Hinweis: NVIDIA bietet ebenfalls vGPU, jedoch mit Lizenz.
</div>

---

## 2. Was ist HAMi?

HAMi steht für **Heterogeneous AI Computing Virtualization Middleware** — Virtualisierungsplattform für heterogene Compute-Ressourcen.

Der reifste Teil ist die NVIDIA-vGPU-Lösung; man kann HAMi pragmatisch als vGPU-Lösung verstehen.

Gesamtarchitektur:

![HAMi fine-grained GPU partitioning architecture](/images/blog/gpu1/photo3.jpg)

Komponenten u. a. Webhook, Scheduler, Device Plugin, HAMi-Core. Dieser Artikel fokussiert Nutzung; Architektur nur kurz.

### Funktionen

Kernfeature: feinkörnige GPU-Isolation von Core und Memory im 1%-Granularitätsbereich.

Beispiel:

![GPU memory allocation diagram](/images/blog/gpu1/photo4-en.png)

- **nvidia.com/gpu**: eine GPU anfordern
- **nvidia.com/gpumem**: 3000M GPU-Speicher
- **nvidia.com/gpucores**: 30 % GPU-Compute — der Pod nutzt höchstens 30 % der Rechenleistung

### Design

HAMi isoliert GPU-Core und -Memory per vCUDA-Ansatz:

![Fine-grained vGPU configuration example](/images/blog/gpu1/photo5.jpg)

HAMi ersetzt auf Software-Ebene den NVIDIA-CUDA-Treiber (libvgpu.so), mountet ihn in den Pod und fängt CUDA-APIs ab — Isolation und Limits.

Native libvgpu.so meldet OOM erst bei echtem Speicherende; HAMi liefert OOM, sobald der Pod sein angefordertes Memory überschreitet.

`nvidia-smi` im Pod zeigt nur die in der Resource-Spec angeforderten Limits — auch auf Monitoring-Ebene isoliert.

<div style="border: 1px solid #ccc; padding: 10px; background-color: #f0f0f0;">
Hinweis: Einige CUDA- und NVML-APIs müssen abgefangen werden.
</div>

---

## 3. HAMi im Überblick

HAMi liefert ein Helm Chart zur einfachen Installation.

### GPU Operator deployen

HAMi hängt am NVIDIA-Stack — zuerst GPU Operator, danach HAMi.

### HAMi deployen

Helm-Repo hinzufügen:

```bash
helm repo add hami-charts https://project-hami.github.io/HAMi/
```

Cluster-Server-Version ermitteln:

<div style="border: 1px solid #ccc; padding: 10px; background-color: #f0f0f0; margin: 10px 0;">
Beispiel: v1.27.4
</div>

```bash
kubectl version
```

Bei der Installation die Scheduler-Image-Version passend zur Server-Version setzen, z. B. v1.27.4:

```bash
helm install hami hami-charts/hami \
  --set scheduler.kubeScheduler.imageTag=v1.27.4 \
  -n kube-system
  ```

Laufen **vgpu-device-plugin** und **vgpu-scheduler** per `kubectl get pods`, war die Installation erfolgreich.

```bash
root@iZj6c5dnq07p1ic04ei9vwZ:~# kubectl get pods -n kube-system|grep hami
hami-device-plugin-b6mvj                          2/2     Running   0          42s
hami-scheduler-7f5c5ff968-26kjc                   2/2     Running   0          42s
```

### Anpassung

> 📄 Offizielle Doku: [HAMi-config.cn.md](https://github.com/Project-HAMi/HAMi/blob/master/docs/config_cn.md)

Parameter per **--set** anpassen, z. B.:

```bash
helm install vgpu vgpu-charts/vgpu \
  --set devicePlugin.deviceMemoryScaling=5 \
  ...
  ```

- **devicePlugin.deviceSplitCount**: Integer, Default 10 — Splits pro GPU; maximal so viele Tasks pro GPU.
- **devicePlugin.deviceMemoryScaling**: Float, Default 1 — Speicher-Nutzungsverhältnis; >1 ermöglicht virtuelles Memory (experimentell).
- **devicePlugin.migStrategy**: "none" oder "mixed" — MIG ignorieren oder eigene Resource-Namen. Default: "none".
- **devicePlugin.disablecorelimit**: "true" deaktiviert Core-Limit, "false" aktiviert. Default: "false".
- **scheduler.defaultMem**: Integer, Default 5000 (MB) — Standard-Speicher wenn nicht angegeben.
- **scheduler.defaultCores**: Integer (0–100), Default 0 — Standard-Core-Prozent pro Task.
- **scheduler.defaultGPUNum**: Integer, Default 1 — bei 0 ignoriert; Webhook ergänzt `nvidia.com/gpu`, wenn im Pod fehlend.
- **resourceName**: Resource-Name für vGPU-Anzahl. Default: "nvidia.com/gpu"
- **resourceMem**: vGPU-Memory. Default: "nvidia.com/gpumem"
- **resourceMemPercentage**: Speicher-Prozent. Default: "nvidia.com/gpumem-percentage"
- **resourceCores**: vGPU-Core. Default: "nvidia.com/cores"
- **resourcePriority**: Task-Priorität. Default: "nvidia.com/priority"

Container-Level:

- **GPU_CORE_UTILIZATION_POLICY**: "default", "force", "disable"
- **ACTIVE_OOM_KILLER**: "true"/"false" — Container bei OOM beenden

Für eine Demo reichen Defaults.

---

## 4. Validierung

### Node-GPU-Ressourcen prüfen

Wie bei Time-Slicing zeigt der Node nach Installation mehr GPU-Ressourcen. Eine physische GPU wird default 10× erweitert → 10 sichtbare GPUs.

<div style="border: 1px solid #ccc; padding: 10px; background-color: #f0f0f0;">
Default-Split: 10, konfigurierbar.
</div>

![HAMi memory calculation workflow](/images/blog/gpu1/photo11.jpg)

### Memory- und Core-Limits prüfen

Mit folgendem YAML einen Pod erstellen; neben `nvidia.com/gpu` auch `gpumem` und `gpucores` in limits:

- nvidia.com/gpu: Anzahl vGPUs, z. B. 1
- nvidia.com/gpumem: Speicher, z. B. 3000M
- nvidia.com/gpumem-percentage: Speicher-Prozent, z. B. 50
- nvidia.com/priority: 0 hoch, 1 niedrig, Default 1

High-Priority-Tasks auf gemeinsam genutztem GPU-Node mit anderen High-Priority-Tasks werden nicht durch **resourceCores** begrenzt.

Low-Priority bei exklusiver GPU-Nutzung ebenfalls ohne **resourceCores**-Limit.

**resourceCores** greift nur bei gemischten Prioritäten auf demselben GPU-Node — Fairness und Isolation.

Beispiel gpu-test.yaml:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: gpu-pod
spec:
  containers:
    - name: ubuntu-container
      image: ubuntu:18.04
      command: ["bash", "-c", "sleep 86400"]
      resources:
        limits:
          nvidia.com/gpu: 1          # Request 1 vGPU
          nvidia.com/gpumem: 3000    # Allocate 3000 MiB of GPU memory per vGPU (optional)
          nvidia.com/gpucores: 30    # Use 30% of the physical GPU's compute capacity per vGPU (optional)
```

Pod startet erfolgreich:

```bash
root@iZj6c5dnq07p1ic04ei9vwZ:~# kubectl get po
NAME      READY   STATUS    RESTARTS   AGE
gpu-pod   1/1     Running   0          48s
```

Im Pod `nvidia-smi` — angezeigtes Limit entspricht den 3000M in Resources.

```bash
root@iZj6c5dnq07p1ic04ei9vwZ:~# kubectl exec -it gpu-pod -- bash
root@gpu-pod:/# nvidia-smi
[HAMI-core Msg(16:139711087368000:libvgpu.c:836)]: Initializing.....
Mon Apr 29 06:22:16 2024
+-----------------------------------------------------------------------------------------+
| NVIDIA-SMI 550.54.14       Driver Version: 550.54.14      CUDA Version: 12.4          |
|-----------------------------------------+------------------------+----------------------+
| GPU  Name                 Persistence-M | Bus-Id          Disp.A | Volatile Uncorr. ECC |
| Fan  Temp   Perf         Pwr:Usage/Cap |        Memory-Usage   | GPU-Util  Compute M. |
|                                         |                        |              MIG M. |
|=========================================+========================+======================|
|   0  Tesla T4                       On |  00000000:00:07.0 Off |                   0 |
| N/A   33C    P8              15W /  70W |      0MiB /   3000MiB |      0%      Default |
|                                         |                        |                 N/A |
+-----------------------------------------+------------------------+----------------------+

+-----------------------------------------------------------------------------------------+
| Processes:                                                                               |
|  GPU   GI   CI        PID   Type   Process name                             GPU Memory |
|        ID   ID                                                              Usage      |
|=========================================================================================|
|  No running processes found                                                             |
+-----------------------------------------------------------------------------------------+
[HAMI-core Msg(16:139711087368000:multiprocess_memory_limit.c:434)]: Calling exit handler 16
```

Die letzte Log-Zeile stammt von HAMis CUDA-Treiber.

> `[HAMI-core Msg(...multiprocess_memory_limit.c:434)]: Calling exit handler 16`  

## 5. Zusammenfassung

Open-Source-vGPU HAMi eingeführt und per Demo validiert.

**Warum GPU-Sharing/Partitionierung?**
Mit Default Device Plugin mappt Kubernetes GPUs 1:1 auf physische Karten — ein Pod blockiert die Karte für andere.

Für höhere Auslastung braucht es Sharing/Partitionierung.

**HAMi-Prinzip**

libvgpu.so im Container ersetzt; CUDA-APIs werden abgefangen — Isolation von Core und Memory.

---

**Referenzen**

- [HAMi](https://github.com/Project-HAMi/HAMi)
- [HAMi-config-cn.md](https://github.com/Project-HAMi/HAMi/blob/master/docs/config_cn.md)

*Mehr zu HAMi: [GitHub](https://github.com/Project-HAMi/HAMi) oder [Slack-Community](https://cloud-native.slack.com/archives/C07T10BU4R2).*
