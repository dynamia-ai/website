---
title: >-
  【Run:ai KAI-Scheduler Deep Dive】Ergänzung: Wie der Reservation Pod
  GPU-Zuweisungsdetails ermittelt
coverTitle: 'Deep Dive: KAI-Scheduler-Mechanik und HAMi'
date: '2025-08-07'
excerpt: >-
  Nach unserem Deep Dive zu fraktionalem GPU-Sharing mit KAI-Scheduler fragte
  ein Leser nach einem wichtigen Detail — heute klären wir, wie der Reservation
  Pod die konkrete GPU-Karte erkennt.
author: Dynamia AI Team
tags:
  - vGPU
  - HAMi
  - GPU-Sharing
  - Cloud Native
  - Kubernetes
  - KI-Infrastruktur
category: Technical Deep Dive
coverImage: /images/blog/Demystifying-the-Reservation-Pod/cover.jpg
language: de
linktitle: Reservation Pod verstehen
---

Gestern analysierten wir in [Nvidia's Open-Sourced KAI-Scheduler vs. HAMi](/blog/run-ai-kai-scheduler-vs-hami), wie KAI-Scheduler fraktionales GPU-Sharing erreicht — vielen Dank für die Diskussion! Ein Leser hob ein Detail hervor, das wir heute vertiefen.

## Leserfeedback und technische Präzisierung

Aus den Kommentaren:

> „Der Artikel verpasst einen Punkt: Die GPU-Zuweisung läuft über das Device Plugin — wenn der Reservation Pod scheduled ist, weiß er noch nicht, welche Karte er hat, und kann GpuSharingNodeInfo nicht aktualisieren.“

Treffend — zuerst präzise: **Wer alloziert GPU-Ressourcen nach der Scheduling-Entscheidung? Drei Komponenten:**

1. **Discovery und Reporting (NVIDIA Device Plugin)**: findet GPUs auf dem Knoten, registriert sie beim kubelet (z. B. `nvidia.com/gpu`), meldet Health; bei Allokationsanfrage Mount-Infos und Env-Vars.

2. **Allokationsentscheidung (kubelet)**: nach Zuweisung auf einen Knoten **wählt der kubelet die konkrete GPU** aus der vom Plugin gemeldeten Liste und ruft `Allocate()` mit Device-IDs auf — vor Pod-Start, echter Allokationszeitpunkt.

3. **Mount und Runtime (NVIDIA Container Runtime)**: beim Start mountet die Runtime per Env (`NVIDIA_VISIBLE_DEVICES`) und Mount-Infos **Device-Nodes und Treiber** in den Container.

Diese Trennung ist Kern der Frage: Nach Erstellung des Reservation Pods — **welche physische GPU** wurde zugewiesen?

Ohne diese Info kann KAI-Scheduler `GpuSharingNodeInfo` nicht pflegen und Verbrauch pro GPU nicht tracken.

Wie schließt KAI-Scheduler die Informationslücke? Diese Ergänzung erklärt den Ablauf.

## Rückblick: Reservation-Pod-Mechanismus

KAI-Schedulers Innovation: Reservation Pod, weil natives Kubernetes kein fraktionales GPU-Sharing hat:

- User-Pod fordert 0,5 GPU → Reservation Pod.
- Dieser Pod fordert eine ganze GPU von Kubernetes.
- Kubernetes weist eine physische GPU zu.
- KAI-Scheduler verwaltet die „reservierte“ GPU intern — mehrere User-Pods teilen dieselbe Karte.

### Vollständiger Scheduling- und GPU-Allokationsfluss

Vom eingereichten User-Pod bis zur GPU:

#### 1. *Scheduling-Entscheidung für User-Pod*

- **Scheduling-Entscheidung durch KAI-Scheduler**:
    1. KAI-Scheduler nimmt den User-Pod entgegen.
    2. Interne Policies (Plugins wie `gpuspread`/`gpupack`) wählen den passenden Knoten.
    3. Berechnung von Zielknoten und GPU (bestehende oder neue GPU-Gruppe).
- **Knoten- und GPU-Auswahl**:

```go
// pkg/scheduler/gpu_sharing/gpuSharing.go
func AllocateFractionalGPUTaskToNode(
    ssn  *framework.Session,
    stmt *framework.Statement,
    pod  *pod_info.PodInfo,
    node *node_info.NodeInfo,
    isPipelineOnly bool,
) bool {
    // Get the list of suitable GPUs on this node
    fittingGPUs := ssn.FittingGPUs(node, pod)

    // Select the most suitable GPU based on the policy
    gpuForSharing := getNodePreferableGpuForSharing(fittingGPUs, node, pod, isPipelineOnly)
    if gpuForSharing == nil {
        return false
    }

    // Assign the selected GPU group to the Pod
    pod.GPUGroups = gpuForSharing.Groups

    // Subsequent allocation logic...
    return true
}
```

#### 2. *Reservation Pod: Erstellung und Scheduling*

Nach Knoten- und GPU-Wahl folgt Binding:

- **Reservation Pod anlegen**:
    1. Bei neuer GPU: Reservation Pod via `ReserveGpuDevice`.
    2. `NodeName` fixiert den Zielknoten.
    3. Der Pod fordert eine volle GPU an.

```go
// pkg/binder/binding/resourcereservation/resource_reservation.go

// createGPUReservationPod creates a GPU resource reservation Pod on a specified node
func (rsc *service) createGPUReservationPod(ctx context.Context, nodeName, gpuGroup string) (*v1.Pod, error) {
    podName := fmt.Sprintf("%s-%s-%s",
        gpuReservationPodPrefix,
        nodeName,
        rand.String(reservationPodRandomCharacters),
    )

    resources := v1.ResourceRequirements{
        Limits: v1.ResourceList{
            constants.GpuResource: *resource.NewQuantity(numberOfGPUsToReserve, resource.DecimalSI),
        },
    }

    return rsc.createResourceReservationPod(nodeName, gpuGroup, podName, gpuReservationPodPrefix, resources)
}

// createResourceReservationPod creates a generic resource reservation Pod (pinned to a node, bypassing the scheduler)
func (rsc *service) createResourceReservationPod(
    nodeName, gpuGroup, podName, appName string,
    resources v1.ResourceRequirements,
) (*v1.Pod, error) {
    podSpec := &v1.Pod{
        ObjectMeta: metav1.ObjectMeta{
            Name:      podName,
            Namespace: namespace,
            Labels: map[string]string{
                constants.AppLabelName:               appLabelValue,
                constants.GPUGroup:                   gpuGroup,
                runaiResourceReservationAppLabelName: appName,
            },
        },
        Spec: v1.PodSpec{
            NodeName: nodeName, // Explicitly specifies the node, bypassing the scheduler
            Containers: []v1.Container{
                {
                    Name:      resourceReservation,
                    Image:     rsc.reservationPodImage, // Lightweight image
                    Resources: resources,
                },
            },
        },
    }
    return podSpec, rsc.kubeClient.Create(context.Background(), podSpec)
}
```

- **Scheduler umgehen per `NodeName`**:
    1. `NodeName` ist beim Create gesetzt.
    2. Kein Durchlauf durch Scheduler (auch nicht default-scheduler).
    3. Direkte Zuweisung; der kubelet startet den Pod.
- **Warten auf GPU-Allokation**:
    1. Nach Create blockiert KAI-Scheduler bis die GPU-UUID vorliegt.
    2. In der Wartezeit weist die NVIDIA Container Runtime die physische GPU zu.

### Die Informationslücke

**Nach erfolgreichem Scheduling des Reservation Pods weiß KAI-Scheduler noch nicht, welche physische GPU auf dem Knoten zugewiesen wurde.**

Ohne das keine korrekte Aktualisierung von `GpuSharingNodeInfo` (Ledger pro physischer GPU).

Struktur in KAI-Scheduler:

```go
// pkg/scheduler/api/node_info/gpu_sharing_node_info.go

// GpuSharingNodeInfo tracks the real-time status of GPU sharing usage on a node
type GpuSharingNodeInfo struct {
    // Shared GPUs that are being released (key = GPU ID)
    ReleasingSharedGPUs map[string]bool

    // Memory that has been actually used (in bytes)
    UsedSharedGPUsMemory map[string]int64

    // Memory that is in the process of being released (in bytes)
    ReleasingSharedGPUsMemory map[string]int64

    // Memory that has been allocated to Pods but may not have been actually occupied yet (in bytes)
    AllocatedSharedGPUsMemory map[string]int64
}
```

## I. Lösung: Self-Discovery-Probe + Watch

KAI-Scheduler löst das so:

### 1. Container zur Device-Info-Meldung

Im Reservation Pod läuft `cmd/resourcereservation` und liest die vom NVIDIA Container Runtime gemounteten GPU-Infos.

Code zum Auslesen der GPU-UUID:

```go
// pkg/resourcereservation/discovery/discovery.go
package discovery

import (
 "context"
 "fmt"
 "os"
 "path/filepath"
 "strings"
)

const gpusDir = "/proc/driver/nvidia/gpus/"

// GetGPUDevice returns the corresponding GPU UUID on the node where the specified Pod is located.
func GetGPUDevice(ctx context.Context, podName string, namespace string) (string, error) {
 // Read the GPU directory
 deviceSubDirs, err := os.ReadDir(gpusDir)
 if err != nil {
  return "", err
 }

 // Iterate through each GPU subdirectory
 for _, subDir := range deviceSubDirs {
  infoFilePath := filepath.Join(gpusDir, subDir.Name(), "information")
  data, err := os.ReadFile(infoFilePath)
  if err != nil {
   continue
  }

  content := string(data)
  lines := strings.Split(content, "\n")
  for _, line := range lines {
   if strings.Contains(line, "GPU UUID") {
    words := strings.Fields(line)
    return words[len(words)-1], nil // The last field is the GPU UUID
   }
  }
 }

 return "", fmt.Errorf("failed to find GPU UUID")
}
```

### 2. Rückmeldung

Der Container schreibt die GPU-UUID in die Pod-Annotations.

```go
// cmd/resourcereservation/app/app.go

func Run(ctx context.Context) error {
    // ... (omitting preceding logic)

    // Get the namespace and name of the current Pod
    namespace, name, err := poddetails.CurrentPodDetails()
    if err != nil {
        return err
    }

    // Initialize the Pod annotation patcher
    patch := patcher.NewPodPatcher(kubeClient, namespace, name)

    // If not yet patched
    if !patched {
        var gpuDevice string
        gpuDevice, err = discovery.GetGPUDevice(ctx, namespace, name)
        if err != nil {
            return err
        }

        logger.Info("Found GPU device", "deviceId", gpuDevice)

        // Write the discovered GPU UUID to the Pod's annotations
        err = patch.PatchDeviceInfo(ctx, gpuDevice)
        if err != nil {
            return err
        }

        logger.Info("Pod was updated with GPU device UUID")
    }

    // ... (omitting subsequent logic)
    return nil
}
```

Hinweis: Obwohl Namen „index“ enthalten, wird die volle GPU-UUID gespeichert:

```go
// pkg/resourcereservation/patcher/pod_patcher.go

const (
    reservedGpuIndexAnnotation = "run.ai/reserve_for_gpu_index"
)

// PatchDeviceInfo writes the discovered GPU UUID to the current Pod's annotations.
func (pp *PodPatcher) PatchDeviceInfo(ctx context.Context, uuid string) error {
    // Get the full information of the current Pod (error handling omitted)
    pod, err := pp.kubeClient.CoreV1().Pods(pp.namespace).Get(ctx, pp.podName, metav1.GetOptions{})
    if err != nil {
        return err
    }

    // Initialize the annotations map (if nil)
    if pod.Annotations == nil {
        pod.Annotations = make(map[string]string)
    }

    // Write the GPU device UUID
    pod.Annotations[reservedGpuIndexAnnotation] = uuid

    // Update the Pod
    _, err = pp.kubeClient.CoreV1().Pods(pp.namespace).Update(ctx, pod, metav1.UpdateOptions{})
    return err
}
```

### 3. Watch-Mechanismus

KAI-Scheduler beobachtet den Reservation Pod per Kubernetes Watch; sobald die UUID-Annotation gesetzt ist, wird der interne State aktualisiert.

```go
// pkg/binder/binding/resourcereservation/resource_reservation.go

// waitForGPUReservationPodAllocation listens to the GPU reservation Pod until the GPU UUID is written to its annotations.
func (rsc *service) waitForGPUReservationPodAllocation(
    ctx context.Context,
    nodeName,
    gpuReservationPodName string,
) string {
    // Construct the List-Watch object
    watcher, err := rsc.kubeClient.Watch(
        ctx,
        &v1.PodList{},
        client.InNamespace(namespace),
        client.MatchingFields{"metadata.name": gpuReservationPodName},
    )
    if err != nil {
        // Error handling (omitted)
        return unknownGpuIndicator
    }
    defer watcher.Stop()

    timeout := time.After(rsc.allocationTimeout)

    for {
        select {
        case <-timeout:
            // Timeout handling: return the unknown GPU indicator
            return unknownGpuIndicator

        case event := <-watcher.ResultChan():
            pod := event.Object.(*v1.Pod)
            if pod.Annotations[gpuIndexAnnotationName] != "" {
                // Successfully retrieved the GPU UUID
                return pod.Annotations[gpuIndexAnnotationName]
            }
        }
    }
}
```

### 4. Binding des User Pods

Nach UUID-Erhalt:

- **Interner State** — GPU-Nutzung buchen
- **User-Pod binden** — gemeinsame GPU mit Reservation Pod
- **Umgebungsvariablen** — korrekter GPU-Zugriff

```go
// pkg/binder/binding/binder.go

func (b *Binder) Bind(
    ctx context.Context,
    pod *v1.Pod,
    node *v1.Node,
    bindRequest *v1alpha2.BindRequest,
) error {
    // 1. Differentiate whether it is a GPU sharing scenario
    var reservedGPUIds []string
    var err error
    if common.IsSharedGPUAllocation(bindRequest) {
        // 1.1 Lock the GPU in advance through the ResourceReservation mechanism
        reservedGPUIds, err = b.reserveGPUs(ctx, pod, bindRequest)
        if err != nil {
            return fmt.Errorf("failed to reserve GPUs: %w", err)
        }
    }

    // 2. Construct a standard Kubernetes Binding object
    binding := &v1.Binding{
        ObjectMeta: metav1.ObjectMeta{
            Namespace: pod.Namespace,
            Name:      pod.Name,
            UID:       pod.UID,
        },
        Target: v1.ObjectReference{
            Kind: "Node",
            Name: node.Name,
        },
    }

    // 3. Call the API Server to complete the binding
    if err := b.kubeClient.CoreV1().Pods(pod.Namespace).Bind(ctx, binding, metav1.CreateOptions{}); err != nil {
        return fmt.Errorf("failed to bind pod %s/%s to node %s: %w", pod.Namespace, pod.Name, node.Name, err)
    }

    // 4. Optionally, write the reserved GPU UUID back to the Pod's annotations or perform other post-processing
    if len(reservedGPUIds) > 0 {
        // ... (omitted)
    }

    return nil
}
```

![KAI Reservation Pod creation workflow diagram](/images/blog/Demystifying-the-Reservation-Pod/p2.jpg)

## II. Informationsfluss: Scheduling bis Device-ID

1. **KAI-Scheduler wählt Knoten und GPU für den User-Pod.**
    Bei fraktionaler GPU-Anfrage: Scheduling-Entscheidung und Zielknoten.

2. **Reservation Pod mit festem Knoten.**
    Reservation Pod fordert eine ganze GPU und setzt `nodeName`:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: runai-reservation-gpu-node-1-abc45
  namespace: runai-reservation
  labels:
    app: runai-reservation
    runai-gpu-group: gpu-group-xyz        # GPU group identifier
    app.runai.resource.reservation: runai-reservation-gpu
  annotations:
    karpenter.sh/do-not-disrupt: "true"
spec:
  nodeName: node-1                      # Directly bound to the specified node
  serviceAccountName: runai-reservation
  containers:
  - name: runai-reservation
    image: <resource-reservation-pod-image>  # Actual image determined by configuration
    imagePullPolicy: IfNotPresent
    resources:
      limits:
        nvidia.com/gpu: 1
    env:
    - name: POD_NAME
      valueFrom:
        fieldRef:
          fieldPath: metadata.name
    - name: POD_NAMESPACE
      valueFrom:
        fieldRef:
          fieldPath: metadata.namespace
```

3. **Device Plugin meldet freie GPUs dem kubelet und wirkt an der Allokation mit.**
    NVIDIA Device Plugin identifiziert GPUs und meldet sie an Kubernetes.

4. **Pod auf festem Knoten; NVIDIA Container Runtime mountet die gewählte GPU.**
    Sichtbar in Env und Device-Files:
    > **Umgebungsvariable**: `NVIDIA_VISIBLE_DEVICES=GPU-UUID` oder Index
    > **Device**: `/dev/nvidia0`

5. **Meldungs-Container im Reservation Pod liest Treiberinfos und ermittelt die UUID.**
    Wie im Code: Dateien unter `/proc/driver/nvidia/gpus/`.

6. **UUID wird in Pod-Annotations geschrieben.**
    Beispiel-Annotation:

```yaml
metadata:
  annotations:
    # Stores the full GPU UUID for resource reservation
    run.ai/reserve_for_gpu_index: "GPU-UUID"
```

7. **KAI-Scheduler Watch erkennt Annotation-Update und liest die UUID.**
    Pod-Update-Event liefert die GPU-UUID.

8. **Aktualisierung von `GpuSharingNodeInfo` für diese physische GPU.**

```go
// Example of updating internal state
requestedMemory := nodeInfo.GetResourceGpuMemory(task.ResReq)

// Accumulate the used memory
nodeInfo.UsedSharedGPUsMemory[gpuGroup] += requestedMemory

// Accumulate the allocated memory (which may not have been actually used yet)
nodeInfo.AllocatedSharedGPUsMemory[gpuGroup] += requestedMemory
```

9. **User Pod wird auf denselben Knoten gebunden; GPU-Zugriff konfiguriert.**
    Verknüpfung über Env und Labels.

## III. Fazit: elegante asynchrone Informations-Synchronisation

KAI-Scheduler löst die Asynchronität zwischen Scheduling-Entscheid und Device-Allokation in Kubernetes:

- **Trennung der Verantwortlichkeiten** — kompatibel mit Kubernetes-Grenzen
- **Informationslücke schließen** — Device-Info-Melder im Reservation Pod
- **Asynchron per Watch** — Event-Stream elegant verarbeitet

So trackt KAI-Scheduler trotz Drei-Komponenten-Allokation jede physische GPU präzise — effizientes fraktionales GPU-Sharing für KI-Workloads.

---

**Nochmals Dank an die fragende Leserin/den fragenden Leser — solche Diskussion vertieft das technische Verständnis. Wir hoffen, die Ergänzung beantwortet die Frage klar.**

Vielen Dank fürs Lesen — wenn der Artikel hilft, gerne teilen!

---
HAMi (Heterogeneous AI Computing Virtualization Middleware) ist eine durchgängige Architektur zur Verwaltung heterogener KI-Beschleuniger in Kubernetes-Clustern: Teilen heterogener AI-Devices, Ressourcen-Isolation zwischen Tasks, höhere Auslastung und einheitliche Schnittstelle. HAMi ist CNCF-Sandbox-Projekt und Teil der CNCF-CNAI-Landschaft.

Community Website: <https://project-hami.io>

GitHub: <https://github.com/Project-HAMi>

Reddit: <https://www.reddit.com/r/HAMi_Community/>
