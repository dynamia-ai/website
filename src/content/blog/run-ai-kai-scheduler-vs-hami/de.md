---
title: >-
  Nvidias Open-Source KAI-Scheduler vs. HAMi: Technische Pfade zum GPU-Sharing und Ausblick auf Synergien
linktitle: Run:AI KAI vs HAMi
coverTitle: 'KAI-Scheduler vs. HAMi: Technische Pfade zum GPU-Sharing'
date: '2025-08-06'
excerpt: >-
  Heute ein technischer Deep Dive: Wir vergleichen die Implementierungsmethoden von
  KAI-Scheduler und HAMi und blicken auf mögliche zukünftige Zusammenarbeit.
author: Dynamia AI Team
tags:
  - vGPU
  - HAMi
  - GPU-Sharing
  - Cloud Native
  - Kubernetes
  - KI-Infrastruktur
category: Technical Deep Dive
coverImage: /images/blog/KAI-Scheduler-VS-HAMi/cover.jpg
---

Kürzlich, nach Nvidias Übernahme von Run:ai und der anschließenden Open-Source-Freigabe der Kern-Scheduling-Komponente KAI-Scheduler, verfolgen die KI- und Kubernetes-Communities das Thema genau. Insbesondere das GPU-Sharing von KAI-Scheduler fiel vielen auf, die sich mit GPU-Virtualisierung beschäftigen.

Das löst technische Diskussionen aus: Wie unterscheiden sich die GPU-Sharing-Ansätze von KAI-Scheduler und HAMi? Für welche Szenarien eignet sich welcher Weg, und wie treiben sie gemeinsam die Community im Bereich GPU-Sharing und -Virtualisierung voran?

Mit diesen Fragen haben wir Architektur und technische Umsetzung von KAI-Schedulers GPU-Sharing vertieft, besonders den innovativen Reservation-Pod-Mechanismus. Gleichzeitig hatten wir aktiven Austausch mit dem Run:ai-Team, u. a. vertiefte Gespräche auf der KubeCon EU 2025 mit Run:ais CTO Ronen Dar und Kollegen zu KAI-Scheduler, HAMi und Open-Source-Kollaboration. Heute vergleichen wir die Implementierungsmethoden und blicken auf mögliche zukünftige Synergien.

> **Artikel auf einen Blick**
>
> - **Schmerzpunkt-Analyse**: Warum ist GPU-Sharing in nativem K8s so schwer?
> - **Mechanismus erklärt**: Wie erreicht KAI Sharing clever mit Reservation Pods?
> - **Lösungsanalyse**: Highlights und Grenzen von KAIs Sharing-Lösung.
> - **Pfadvergleich**: Vergleich mit HAMi und der Wert harter Isolation.
> - **Kollaborationsausblick**: Aktiver Community-Dialog und Synergiepotenzial.

## Schmerzpunkt-Analyse

### I. Der „Schmerzpunkt“ von nativem K8s: Warum sind GPUs schwer zu teilen?

Bevor wir in KAI einsteigen, warum GPU-Sharing in Kubernetes von Haus aus eine Herausforderung ist:

- **Ganzzahl-Limitierung**: Das native Kubernetes-Ressourcenmodell (`nvidia.com/gpu`) kennt nur ganze GPUs. „0,2 GPU“ lässt sich nicht ausdrücken.
- **Scheduler-Blindheit**: Der Standard-`kube-scheduler` versteht keine Bruchteil-GPUs. Er kann einer Ganzkarten-anfordernden Pod eine GPU zuweisen, die geteilt werden soll — Konflikte.
- **„Black Box“-Zustand**: Wie weiß der Cluster, dass eine GPU teilweise belegt ist? Es gibt keinen Standard.
- **Nutzer-Inconvenience**: Entwickler brauchen einfache, intuitive Anfrage und Nutzung von Bruchteil-GPU-Ressourcen.

![Diagramm Kubernetes-GPU-Sharing-Herausforderungen](/images/blog/KAI-Scheduler-VS-HAMi/p7.jpg)

## Mechanismus erklärt

### II. KAIs Idee: Reservation Pod als cleverer Workaround

Angesichts dieser Herausforderungen schlug KAI-Scheduler eine sehr clevere Lösung vor: den **Reservation Pod**.

Die Kernidee als „logische Täuschung“:

1. Fordert eine Pod eine Bruchteil-GPU an, versucht KAI-Scheduler nicht, K8s zu sagen: „Diese Pod will 0,x GPU.“
2. Stattdessen erstellt er einen speziellen, ressourcensparenden **Reservation Pod**. Dieser fordert korrekt eine **ganze GPU** (`nvidia.com/gpu: "1"`) von Kubernetes an!
3. Kubernetes glaubt, die GPU sei vollständig zugewiesen; der `kube-scheduler` schedult keine weiteren Pods auf diese GPU.
4. Die eigentliche Bruchteil-Verwaltung und -Zuweisung bleibt intern bei KAI-Scheduler.

![Diagramm KAI Reservation Pod Mechanismus](/images/blog/KAI-Scheduler-VS-HAMi/p8.jpg)

Der Reservation Pod erfüllt vor allem:

- **GPU-Reservierung**: „Beansprucht“ die GPU in den Augen von K8s mit der gesamten Ressource.
- **Ressourcen-Sichtbarkeit**: Macht den „teilweise genutzten“ Zustand indirekt im K8s-System sichtbar (K8s denkt, die GPU sei voll vom Reservation Pod belegt).
- **Konfliktvermeidung**: Verhindert, dass der Standard-Scheduler die geteilte GPU berührt.
- **Logische Gruppierung**: Reservation Pod und nutzende Pods erhalten dasselbe Label (z. B. `gpu-group: xyz123`) und werden logisch gebunden.

![Diagramm KAI Reservation Pod logische Gruppierung](/images/blog/KAI-Scheduler-VS-HAMi/p9.jpg)

### III. Technischer Tiefgang: Wie funktioniert KAI GPU Sharing?

1. **Nutzeranfrage**: Der Pod übermittelt Bruchteil-GPU über `annotations`, z. B.:

```yaml
metadata:
  annotations:
    gpu-fraction: "0.2"  # Request 20% of GPU resources
```

1. **KAI-Scheduling**:

    - KAI-Scheduler erkennt `gpu-fraction`.
    - Berechnet benötigte Ressourcen (z. B. Speicher für 20 %) und findet passenden Knoten und physische GPU.

    Die Zuweisungslogik liegt in `pkg/scheduler/gpu_sharing/gpuSharing.go`:

```go
func AllocateFractionalGPUTaskToNode(
    ssn *framework.Session,
    stmt *framework.Statement,
    pod *pod_info.PodInfo,
    node *node_info.NodeInfo,
    isPipelineOnly bool,
) bool {
    fittingGPUs := ssn.FittingGPUs(node, pod)
    gpuForSharing := getNodePreferableGpuForSharing(fittingGPUs, node, pod, isPipelineOnly)
    if gpuForSharing == nil {
        return false
    }
    pod.GPUGroups = gpuForSharing.Groups
    isPipelineOnly = isPipelineOnly || gpuForSharing.IsReleasing
    success := allocateSharedGPUTask(ssn, stmt, node, pod, isPipelineOnly)
    if !success {
        pod.GPUGroups = nil
    }
    return success
}
```

    **Schlüsselaspekt: Reservation-Pod-Management**

    -   **Erste Zuweisung**: Erste Pod auf dieser GPU für Sharing → KAI-Scheduler erstellt Reservation Pod (`createResourceReservationPod`), fordert `nvidia.com/gpu: "1"`, vergibt eindeutiges `gpu-group`-Label.
    -   **Folgende Zuweisungen**: Existiert bereits Sharing auf dieser GPU (Reservation Pod mit passendem `gpu-group`), wird wiederverwendet, kein neuer Pod.
    -   **Binding**: KAI-Scheduler setzt dasselbe `gpu-group`-Label auf die Nutzer-Pod.

    Erstellung in `pkg/binder/binding/resourcereservation/resource_reservation.go`:

```go
// createResourceReservationPod creates a pod on a specified node for the sole purpose of resource reservation
func (rsc *service) createResourceReservationPod(
    nodeName, gpuGroup, podName, appName string,
    resources v1.ResourceRequirements,
) (*v1.Pod, error) {
    podSpec := &v1.Pod{
        ObjectMeta: metav1.ObjectMeta{
            Name:      podName,
            Namespace: namespace, // runai-reservation
            Labels: map[string]string{
                constants.AppLabelName:               appLabelValue,
                constants.GPUGroup:                   gpuGroup,
                runaiResourceReservationAppLabelName: appName,
            },
        },
        Spec: v1.PodSpec{
            NodeName:           nodeName, // Pinned to a specific node
            ServiceAccountName: serviceAccountName,
            Containers: []v1.Container{
                {
                    Name:      resourceReservation,
                    Image:     rsc.reservationPodImage, // Lightweight container image
                    Resources: resources,               // Requests the entire GPU
                    // ...other configurations
                },
            },
        },
    }
    return podSpec, rsc.kubeClient.Create(context.Background(), podSpec)
}
```

    -   **Internes Buchführung**: Im internen Zustand (`GpuSharingNodeInfo` in `pkg/scheduler/api/node_info/gpu_sharing_node_info.go`):

```go
// GpuSharingNodeInfo tracks the real-time status of GPU sharing usage on a node
type GpuSharingNodeInfo struct {
    // Shared GPUs that are being released (key is GPU ID)
    ReleasingSharedGPUs map[string]bool

    // Memory used on each GPU (in bytes)
    UsedSharedGPUsMemory map[string]int64

    // Amount of memory being released (in bytes)
    ReleasingSharedGPUsMemory map[string]int64

    // Amount of shared memory that has been allocated (in bytes)
    AllocatedSharedGPUsMemory map[string]int64
}
```

    -   `UsedSharedGPUsMemory`: tatsächlich von Pods genutzter Speicher pro GPU-Gruppe (Bytes).
    -   `ReleasingSharedGPUsMemory`: Speicher in Freigabe (Bytes).
    -   `AllocatedSharedGPUsMemory`: vom Scheduler zugewiesener, evtl. noch nicht belegter Speicher (Bytes).

![Diagramm KAI GPU-Sharing-Speicher-Tracking](/images/blog/KAI-Scheduler-VS-HAMi/p8.jpg)

1. **Ressourcen-Rückgewinnung**:

    - Endet eine teilende Pod, aktualisiert KAI die Buchführung.
    - Endet die letzte Pod einer `gpu-group`, löscht KAI-Scheduler den Reservation Pod (`syncForPods`) und „gibt“ die GPU an K8s zurück.

![Diagramm KAI Reservation Pod logische Gruppierung](/images/blog/KAI-Scheduler-VS-HAMi/p9.jpg)

    Logik in `syncForPods`:

```go
// syncForPods separates pods on the current node into two categories: resource reservation pods and
// fractional pods that actually use the GPU, and cleans up legacy reservation pods when there are
// no corresponding fractional pods.
func (rsc *service) syncForPods(ctx context.Context, pods []*v1.Pod, gpuGroupToSync string) error {
    logger := log.FromContext(ctx)

    reservationPods := map[string]*v1.Pod{}
    fractionPods    := map[string][]*v1.Pod{}

    // 1. Categorize pods into reservation pods and fractional pods by GPU group
    for _, pod := range pods {
        if pod.Namespace == namespace {                 // Reservation Pod
            reservationPods[gpuGroupToSync] = pod
            continue
        }

        if slices.Contains([]v1.PodPhase{v1.PodRunning, v1.PodPending}, pod.Status.Phase) {
            fractionPods[gpuGroupToSync] = append(fractionPods[gpuGroupToSync], pod)
        }
    }

    // 2. If a GPU group has no fractional pods, delete the corresponding reservation pod
    for gpuGroup, reservationPod := range reservationPods {
        if _, found := fractionPods[gpuGroup]; !found {
            logger.Info("Did not find fraction pod for gpu group, deleting reservation pod",
                "gpuGroup", gpuGroup)
            if err := rsc.deleteReservationPod(ctx, reservationPod); err != nil {
                return err
            }
        }
    }

    return nil
}
```

**Kern-Erkenntnis: Steuerung auf Scheduler-Ebene, (noch) keine Low-Level-Intervention**

KAI-Schedulers GPU Sharing geschieht nur auf Scheduler-Ebene durch Erstellen/Verwalten von Pods, Parsen von Annotations und internem Zustand.

**Daher liefert KAI-Scheduler „Soft Isolation“.**

## Lösungsanalyse

### IV. Analyse von KAIs Lösung: Mix aus Eleganz und pragmatischem Kompromiss

**Highlights**

- **Elegante Integration**: Nur Standard-K8s-Primitive (Pod, Annotation, Label), null Änderungen an K8s-Core. Deployment und Integration relativ einfach.
- **Gute Kompatibilität**: Reservation Pod vermeidet direkte Konflikte mit `kube-scheduler` u. a.
- **Hohe Flexibilität**: Theoretisch Bruchteil-Zuweisung in beliebigem Verhältnis, nicht auf vordefinierte Stufen begrenzt.
- **Architektur-Innovation**: „Logische Täuschung“ zeigt clevere Erweiterung im bestehenden K8s-Rahmen.

**Grenzen**

- **Soft Isolation**: Kerneigenschaft des Designs. KAI-Scheduler erzwingt keine Ressourcenisolation (weder Speicher noch Compute). Nur „logische“ Zuweisung und Scheduling.
- **„Gentleman's Agreement“**: Tatsächliche Nutzung **hängt vollständig von der Selbstdisziplin der Anwendung im Pod ab**. Eine Pod mit `gpu-fraction: "0.2"` könnte trotzdem 80 % oder 100 % Speicher/Compute nutzen — KAI kann das auf reiner Scheduling-Ebene nicht verhindern.
- **Störpotenzial**: Fehlverhalten (absichtlich oder nicht) kann Nachbar-Pods auf derselben GPU stören — Performance-Jitter oder OOM.
- **Kooperation der Anwendung nötig**: Für isolationsähnlichen Effekt müssen Nutzer Limits im Code setzen (z. B. `torch.cuda.set_per_process_memory_fraction`). Mehr Komplexität und Fehlerquellen.

## Pfadvergleich

### V. Technische Pfade: KAIs leichtgewichtiger Ansatz vs. HAMis harte Isolation

Der Kernvorteil von HAMi (und ähnlichen Lösungen mit starker Isolation):

- **Custom HAMi Device Plugin**: nicht nur Ressourcen melden, sondern Isolationskonfiguration bei Zuweisung injizieren.
- **Integration mit HAMi-Core**: Interception zwischen CUDA-Runtime und CUDA-Driver erzwingt **harte Limits** pro Container.

Vorteile harter Isolation:

- **Garantierte Ressourcen**: klare Obergrenze, nicht überschreitbar.
- **Starke Isolation**: „Noisy Neighbor“ vermeiden, QoS in Multi-Tenant.
- **Anwendungstransparenz**: meist keine App-Änderungen nötig.

**Die Wahl hängt vom Szenario ab**:

- **KAI-Scheduler leichtgewichtig**: einfaches Deployment, elegante K8s-Integration.
- **HAMi harte Isolation**: strenge Anforderungen an Ressourcengarantien und Performance-Stabilität.

## Kollaborationsausblick

### VI. Community-Dialog und Zukunft: gemeinsame Entwicklung

KAIs GPU-Sharing-Mechanismus ist eine rühmenswerte, ingeniöse Gestaltung innerhalb des bestehenden K8s-Systems. Für eine Kernanforderung — **zuverlässige Ressourcenisolation und -garantien** — repräsentieren KAIs „Soft Isolation“ und HAMis „harte Isolation“ unterschiedliche Pfade und Trade-offs.

**Ermutigend: Wir haben bereits aktive Diskussionen mit dem Run:ai- (Nvidia-)Team begonnen. Auf der KubeCon EU tauschten wir uns mit dem Run:ai-CTO und Kollegen aus, besonders zu harter Isolation — HAMi teilte Praxis und Gedanken. Beide Seiten zeigen Enthusiasmus für weitere Erkundung im GPU-Ressourcenmanagement und tieferen technischen Austausch.**

![Diagramm KAI GPU-Ressourcen-Rückgewinnung](/images/blog/KAI-Scheduler-VS-HAMi/p6.jpg)
![Diagramm KAI Scheduler Ressourcenzuweisung](/images/blog/KAI-Scheduler-VS-HAMi/p10.jpg)

> Ein Foto des HAMi-Maintainers mit Run:ai-CTO Ronen Dar und Team auf der KubeCon EU.

Die Open-Source-Freigabe von KAI-Scheduler bringt der Community neue Vitalität und Wahlmöglichkeiten. KAI und HAMi sind nicht gegenseitig ausgeschlossen, sondern komplementär für verschiedene Szenarien. KAIs Scheduling-Innovation plus HAMis Exploration harter Isolation können eine vollständigere, flexiblere GPU-Virtualisierungslösung bringen.

### VII. Fazit: aktiver Dialog, Win-Win, gemeinsame Zukunft

- **KAI-Scheduler GPU Sharing**: elegant, K8s-ökologisch kompatibel, Bruchteil-GPU per Reservation Pods auf Scheduler-Ebene — essenziell Soft Isolation, abhängig von App-Selbstdisziplin.
- **HAMi**: harte Isolation via Device Plugin und HAMi-Core — besser für Produktion mit hohen Isolationsanforderungen.
- **Community & Kollaboration**: Wir begrüßen KAIs Innovation und Open Source. Der Dialog mit Run:ai auf der KubeCon EU zeigt großes Potenzial — besonders Diskussionen zu harter Isolation signalisieren gemeinsames Vorankommen.

Die HAMi-Community wird KAI-Schedulers Entwicklung verfolgen und aktiv in Diskussionen einsteigen. Wir freuen uns auf Zusammenarbeit mit Partnern inkl. Nvidia/Run:ai für leistungsfähigere, flexiblere und zuverlässigere GPU-Lösungen für Kubernetes-Nutzer.

## Diskussion

Was denken Sie über KAI-Schedulers GPU Sharing? Wo eignen sich Soft vs. harte Isolation? Kommentare oder HAMi-Community — willkommen!

Danke fürs Lesen! Wenn der Artikel half, liken, empfehlen und teilen!

---

HAMi (Heterogeneous AI Computing Virtualization Middleware) ist eine „One-Stop“-Architektur zur Verwaltung heterogener KI-Rechengeräte in K8s-Clustern. Es ermöglicht Sharing heterogener KI-Devices und Ressourcenisolation zwischen Tasks. HAMi verbessert die Auslastung heterogener Rechengeräte in K8s und bietet eine einheitliche Schnittstelle für verschiedene Device-Typen. HAMi ist CNCF-Sandbox-Projekt und im CNCF CNAI-Technology-Landscape gelistet.

Community-Website: <https://project-hami.io>

GitHub: <https://github.com/Project-HAMi>

Reddit: <https://www.reddit.com/r/HAMi_Community/>