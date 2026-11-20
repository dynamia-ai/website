---
title: 'HAMi-vGPU-Prinzipanalyse Teil 3: Workflow-Analyse des hami-scheduler'
coverTitle: HAMi-vGPU-Scheduler-Workflow erklärt
date: '2025-07-25'
excerpt: >-
  Dritter Artikel der HAMi-Prinzipanalyse-Serie: Analyse des hami-scheduler-Workflows.
author: Dynamia AI Team
tags:
  - HAMi
  - GPU-Sharing
  - vGPU
  - Kubernetes
  - Heterogenes Computing
category: Technical Deep Dive
coverImage: /images/blog/gpu5/cover2.jpg
linktitle: HAMi Scheduler Deep Dive
---


Im vorherigen Artikel analysierten wir den `hami-webhook`, der den Scheduler von Pods mit vGPU-Anforderungen auf `hami-scheduler` umstellt, damit sie von diesem geplant werden.

Dies ist der dritte Artikel der HAMi-Prinzipanalyse-Serie zum `hami-scheduler`-Workflow.

Der vorherige Teil behandelte vor allem den `hami-webhook` und die Frage: *Wie kommen Pods zum hami-scheduler, obwohl ohne SchedulerName standardmäßig der default-scheduler gilt?*

Dieser Artikel beginnt mit `hami-scheduler` und beantwortet: *Welche Logik hat der hami-scheduler, und wie werden Strategien wie spread & binpack umgesetzt?*

> Nach dem Schreiben merkte ich: Es gibt noch viel Stoff. spread & binpack folgen im nächsten Artikel; hier liegt der Fokus auf dem Scheduling-Workflow.

> Die Analyse basiert auf HAMi v2.4.0.

**Kurzfassung:**

**Ablauf von HAMi Webhook und Scheduler:**

![HAMi scheduler workflow diagram](/images/blog/gpu5/p1-en.png)

1. Ein Nutzer erstellt einen Pod mit vGPU-Ressourcenanforderung.
2. Der kube-apiserver sendet laut `MutatingWebhookConfiguration` eine Anfrage an den HAMi-Webhook.
3. Der HAMi-Webhook prüft das `Resource`-Feld. Fordert der Pod eine von HAMi verwaltete vGPU-Ressource, setzt er `SchedulerName` auf `hami-scheduler`.
    * Privilegierte Pods überspringt der Webhook.
    * Pods mit vGPU und gesetztem `nodeName` lehnt der Webhook ab.
4. Der `hami-scheduler` plant den Pod. Er nutzt das Standard-`kube-scheduler`-Image, die Basislogik entspricht dem `default-scheduler`. **Über `KubeSchedulerConfiguration` ruft dieser `kube-scheduler` jedoch ein Extender-Scheduler-Plugin auf.**
    * Der Extender ist ein weiterer Container im `hami-scheduler`-Pod mit Webhook- und Scheduler-APIs.
    * Bei vGPU-Anfragen ruft der `kube-scheduler` den Extender per HTTP auf und führt Custom-Scheduling aus.
5. Im Extender steckt die eigentliche HAMi-Scheduling-Logik: Knoten werden nach verbleibenden Ressourcen bewertet.
    * Hier greifen Strategien wie `spread` und `binpack`.
6. Asynchrone Aufgaben inkl. GPU-Wahrnehmung:
    * Eine Hintergrund-Goroutine im Device Plugin meldet GPU-Ressourcen des Knotens in Annotations.
    * Zusätzlich zum Device Plugin liefern asynchrone Tasks weitere Infos per Annotation-Patches.
    * Der Extender liest Gesamt-GPU aus Node-Annotations und belegte GPUs aus laufenden Pod-Annotations, berechnet Restressourcen pro Knoten und cached sie für Scheduling.

---

## 1. Überblick

Der hami-scheduler ist für die Pod-Scheduling-Logik zuständig und wählt den passendsten Knoten im Cluster.

Er nutzt den Scheduler-Extender-Mechanismus.

HAMi erweitert nicht direkt den `default-scheduler`, sondern startet einen zusätzlichen Scheduler mit dem Standard-`kube-scheduler`-Image, per Konfiguration als `hami-scheduler` benannt.

Dieser `hami-scheduler` wird mit einem Extender konfiguriert; der Extender-Dienst ist ein HTTP-Service eines weiteren Containers im selben Pod.

> Hinweis: Später meinen wir mit `hami-scheduler` meist das Scheduling-Plugin dieses Extenders.

## 2. Konkrete Bereitstellung

### Deployment

Der hami-scheduler wird per Deployment mit zwei Containern bereitgestellt: nativem `kube-scheduler` und dem HAMi-Scheduler-Dienst.

Vollständiges YAML:

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
      # vanilla kube-scheduler (patched to load our config)
      - command:
        - kube-scheduler
        - --config=/config/config.yaml
        - -v=4
        - --leader-elect=true
        - --leader-elect-resource-name=hami-scheduler
        - --leader-elect-resource-namespace=kube-system
        image: 192.168.116.54:5000/kube-scheduler:v1.23.17
        imagePullPolicy: IfNotPresent
        name: kube-scheduler
        resources: {}
        terminationMessagePath: /dev/termination-log
        terminationMessagePolicy: File
        volumeMounts:
        - mountPath: /config
          name: scheduler-config

      # HAMI scheduler-extender (implements filter & bind)
      - command:
        - scheduler
        - --resource-name=nvidia.com/vgpu
        - --resource-mem=nvidia.com/gpumem
        - --resource-cores=nvidia.com/gpucores
        - --resource-mem-percentage=nvidia.com/gpumem-percentage
        - --resource-priority=nvidia.com/priority
        - --http_bind=0.0.0.0:443
        - --cert_file=/tls/tls.crt
        - --key_file=/tls/tls.key
        - --scheduler-name=hami-scheduler
        - --metrics-bind-address=:9395
        - --default-mem=0
        - --default-gpu=1
        - --default-cores=0
        - --iluvatar-memory=iluvatar.ai/vcuda-memory
        - --iluvatar-cores=iluvatar.ai/vcuda-core
        - --cambricon-mlu-name=cambricon.com/vmlu
        - --cambricon-mlu-memory=cambricon.com/mlu.smlu.vmemory
        - --cambricon-mlu-cores=cambricon.com/mlu.smlu.vcore
        - --ascend-name=huawei.com/Ascend910
        - --ascend-memory=huawei.com/Ascend910-memory
        - --ascend310p-name=huawei.com/Ascend310P
        - --ascend310p-memory=huawei.com/Ascend310P-memory
        - --overwrite-env=false
        - --node-scheduler-policy=binpack
        - --gpu-scheduler-policy=spread
        - --debug
        - -v=4
        image: projecthami/hami:v2.3.13
        imagePullPolicy: IfNotPresent
        name: vgpu-scheduler-extender
        ports:
        - containerPort: 443
          name: http
          protocol: TCP
        volumeMounts:
        - mountPath: /tls
          name: tls-config
      # ... other spec fields
```

### KubeSchedulerConfiguration

Die Scheduler-Konfiguration liegt in einem ConfigMap:

```yaml
apiVersion: v1
data:
  config.yaml: |
    apiVersion: kubescheduler.config.k8s.io/v1beta2
    kind: KubeSchedulerConfiguration
    leaderElection:
      leaderElect: false
    profiles:
    - schedulerName: hami-scheduler
    extenders:
    - urlPrefix: "https://127.0.0.1:443"
      filterVerb: filter
      bindVerb: bind
      nodeCacheCapable: true
      weight: 1
      httpTimeout: 30s
      enableHTTPS: true
      tlsConfig:
        insecure: true
      managedResources:
      - name: nvidia.com/vgpu
        ignoredByScheduler: true
      - name: nvidia.com/gpumem
        ignoredByScheduler: true
      - name: nvidia.com/gpucores
        ignoredByScheduler: true
      # ... other managed resources
kind: ConfigMap
metadata:
  name: vgpu-hami-scheduler-newversion
  namespace: kube-system
```

### SchedulerName

Zuerst wird der Scheduler-Name `hami-scheduler` gesetzt. Der Standard-Kubernetes-Scheduler heißt `default-scheduler`.

```yaml
profiles:
- schedulerName: hami-scheduler
```

Ohne `schedulerName` am Pod gilt standardmäßig `default-scheduler`.
> Der vom `hami-webhook` gesetzte `SchedulerName` muss hier konfiguriert sein.

### Extenders

Kernkonfiguration des Schedulers:

```yaml
extenders:
- urlPrefix: "https://127.0.0.1:443"
  filterVerb: filter
  bindVerb: bind```
Parameter:
- `urlPrefix: "https://127.0.0.1:443"`: Adresse des Scheduler-Extenders; der Kubernetes-Scheduler ruft sie für externe Logik auf (HTTPS; im selben Pod wie `kube-scheduler` → `127.0.0.1`).
- `filterVerb: filter`: Scheduler ruft den Extender zum Filtern geeigneter Knoten auf (Filter-Interface → `/filter`).
- `bindVerb: bind`: Extender kann binden (Pod an Knoten → `/bind`).

### managedResources

`managedResources` listet vom Extender `hami-scheduler` verwaltete Ressourcen. Der Scheduler ruft den Extender nur auf, wenn das `Resource`-Feld des Pods eine dort genannte Ressource anfordert.

> Fordert ein Pod keine vGPU-Ressourcen, plant ihn zwar der als `hami-scheduler` benannte `kube-scheduler`, ruft aber den Extender nicht auf — das echte HAMi-Scheduling-Plugin bleibt inaktiv.

```yaml
managedResources:
- name: nvidia.com/vgpu
  ignoredByScheduler: true
- name: nvidia.com/gpumem
  ignoredByScheduler: true
- name: nvidia.com/gpucores
  ignoredByScheduler: true
- name: nvidia.com/gpumem-percentage
  ignoredByScheduler: true
# ... other managed resources
```

- `name: nvidia.com/vgpu`: Ressourcenname.
* `ignoredByScheduler: true`: Der Scheduler ignoriert die Ressource beim Knoten-Matching; Zuteilung erfolgt über den erweiterten `hami-scheduler`.

Damit ignoriert der Scheduler `nvidia.com/vgpu`, `nvidia.com/gpumem` usw. beim Matching — keine Fehlschläge nur weil der Knoten virtuelle Ressourcen nicht advertised.

Ruft er den erweiterten `hami-scheduler` auf, verarbeitet dieser die Ressourcen und findet passende Knoten.

Als Nächstes zwei Fragen zur Implementierung von `hami-scheduler`:

1. Wie erfasst `hami-scheduler` GPU-Infos auf dem Knoten, wenn `gpucore` und `gpumem` virtuelle Ressourcen sind, die das DevicePlugin nicht direkt am Knoten meldet?
2. Wie wählt `hami-scheduler` den passenden Knoten, und wie funktionieren `spread` & `binpack`?

## 3. Wie HAMi GPU-Ressourcenstatus auf Knoten erfasst

Zwei Teile:

1. GPU-Ressourceninformationen auf dem Knoten.
2. GPU-Ressourcennutzung auf dem Knoten.

Als virtuelle Ressourcen können `gpucore` und `gpumem` nicht wie Standard-Device-Plugin-Ressourcen von Kubernetes allein gepflegt werden — HAMi übernimmt das.

### Warum eigene Wahrnehmungslogik nötig ist

**Im vorherigen Artikel wurde `hami-device-plugin-nvidia` vorgestellt. Meldete das Plugin die GPU nicht schon an den kube-apiserver? Warum noch eine weitere Logik?**

```yaml
# Example node status (kubectl get node <node-name> -oyaml)
capacity:
  cpu: "64"
  memory: 256Gi
  nvidia.com/vgpu: "20"      # 20 vGPUs (amplified by device-split-count)
  nvidia.com/gpumem: "9437184"  # Total available VRAM in MB
  nvidia.com/gpucores: "2000"   # Total available cores
  pods: "110"
```

Grund: `hami-scheduler` teilt `gpucore` und `gpumem` feingranular. Er muss GPU-Anzahl, VRAM pro Karte usw. kennen — sonst landet ein Pod auf einem Knoten ohne freies VRAM.

### GPU-Ressourcen auf dem Knoten erfassen

HAMi pflegt das über die Goroutine in `start`; Kernlogik in `RegisterFromNodeAnnotations`.

```go
// Background goroutine: periodically reads GPU information from Node annotations and syncs it to the scheduler cache
go sher.RegisterFromNodeAnnotations()
```

Vereinfacht: kube-apiserver liefert Knotenliste, Device-Infos aus Node-Annotations werden geparst und im Speicher gehalten.

```go
func (s *Scheduler) RegisterFromNodeAnnotations() {
 klog.V(5).Infoln("Scheduler into RegisterFromNodeAnnotations")

 ticker := time.NewTicker(15 * time.Second)
 defer ticker.Stop()

 for {
  select {
  case <-s.nodeNotify:
  case <-ticker.C:
  case <-s.stopCh:
   return
  }

  // 1. List nodes
  // ... list nodes logic
  
  // 2. Iterate through nodes and parse GPU info
  for _, n := range rawNodes {
   devInfos, err := devInstance.GetNodeDevices(*n)
   if err != nil {
    klog.Errorln("get node devices failed", err.Error())
    continue
   }
   
   // ... logic to update or add GPU info to s.nodes cache
   
   s.addNode(n.Name, nodeInfo)
  }
 }
}
```

Aktuelle Knotendaten landen im `nodes`-Map von `nodeManager` für Scheduling.

```go
type Scheduler struct {
 nodeManager
 podManager
    // ... other fields
}

type nodeManager struct {
 nodes map[string]*util.NodeInfo
 mutex sync.RWMutex
}
```

Wichtig: Datenquelle sind Node-Annotations, gepflegt durch eine Hintergrund-Goroutine in `hami-device-plugin-nvidia` (voriger Artikel).

```go
// getNodesUsage returns the VRAM/core usage of all nodes and their devices, filtering by nodeSelector / taints / nodeAffinity / unschedulable / nodeName
func (s *Scheduler) getNodesUsage(nodes *[]string, task *corev1.Pod) (*map[string]*NodeUsage, map[string]string, error) {
 // ...

 // 1. List all nodes
 // ...

 // 2. Initialize node device list
 // ...
 
 // 3. Aggregate usage from running Pods
 podsInfo := s.ListPodsInfo()
 for _, p := range podsInfo {
  node, ok := overall[p.NodeID]
  if !ok {
   continue
  }
  // ... logic to aggregate used memory and cores from pod's devices
 }
 
 // ...

 return &cache, failed, nil
}
```

Beispiel:

```yaml
apiVersion: v1
kind: Node
metadata:
  annotations:
    csi.volume.kubernetes.io/nodeid: >
      {"nfs.csi.k8s.io":"j99cloudvm","rbd.csi.ceph.com":"j99cloudvm"}
    hami.io/node-handshake: Requesting_2024.11.19 03:10:32
    hami.io/node-handshake-dcu: Deleted_2024.09.13 06:42:44
    hami.io/node-nvidia-register: >
      GPU-03f69c50-207a-2038-9b45-23cac89cb67d,10,46068,100,NVIDIA-NVIDIA A40,0,true:
      GPU-1afede84-4e70-2174-49af-f07ebb94d1ae,10,46068,100,NVIDIA-NVIDIA A40,0,true:
    kubeadm.alpha.kubernetes.io/cri-socket: /run/containerd/containerd.sock
```

Die Annotation `hami.io/node-nvidia-register` enthält GPU-Details (ID, Modell, Speicher, …).

### GPU-Nutzung auf dem Knoten erfassen

**HAMi muss GPU-Nutzung kennen, um verfügbares `gpucore` und `gpumem` zu berechnen.**

Per `client-go`-Informer werden Pod- und Knotenänderungen beobachtet; laufende Pods auf dem Knoten und Gesamtressourcen ergeben die Restkapazität.

```go
// pkg/scheduler/scheduler.go#L127
func (s *Scheduler) Start() {
    kubeClient, err := k8sutil.NewClient()
    check(err)
    s.kubeClient = kubeClient
    informerFactory := informers.NewSharedInformerFactoryWithOptions(s.kubeClient, time.Hour*1)
    s.podLister = informerFactory.Core().V1().Pods().Lister()
    s.nodeLister = informerFactory.Core().V1().Nodes().Lister()

    informer := informerFactory.Core().V1().Pods().Informer()
    informer.AddEventHandler(cache.ResourceEventHandlerFuncs{
        AddFunc:    s.onAddPod,
        UpdateFunc: s.onUpdatePod,
        DeleteFunc: s.onDelPod,
    })
    // ... node event handlers
    informerFactory.Start(s.stopCh)
    informerFactory.WaitForCacheSync(s.stopCh)
    s.addAllEventHandlers()
}
```

`onAddPod` wird bei Pod Create/Update ausgelöst:

```go
// AssignedNodeAnnotations = "hami.io/vgpu-node"

// pkg/scheduler/scheduler.go#L92
func (s *Scheduler) onAddPod(obj interface{}) {
    pod, ok := obj.(*corev1.Pod)
    if !ok {
        klog.Errorf("unknown add object type")
        return
    }
    nodeID, ok := pod.Annotations[util.AssignedNodeAnnotations]
    if !ok {
        return
    }
    // ...
    podDev, _ := util.DecodePodDevices(util.SupportDevices, pod.Annotations)
    s.addPod(pod, nodeID, podDev)
}
```

Nur Pods mit `hami.io/vgpu-node` werden verarbeitet; UUID, Speicher und Cores aus Annotations gelesen.

Pod-Annotations etwa so:

```yaml
$ k get po gpu-pod -oyaml
apiVersion: v1
kind: Pod
metadata:
  annotations:
    hami.io/bind-phase: success
    hami.io/bind-time: "1727251686"
    hami.io/vgpu-devices-allocated: GPU-03f69c50-207a-2038-9b45-23cac89cb67d,NVIDIA,3000,30:;
    hami.io/vgpu-devices-to-allocate: ;
    hami.io/vgpu-node: test
    hami.io/vgpu-time: "1727251686"
```

**`hami.io/vgpu-devices-allocated`** enthält GPU-Infos, formatiert z. B.:
`GPU-03f69c50-207a-2038-9b45-23cac89cb67d,NVIDIA,3000,30:;`
* UUID, Typ NVIDIA, 3000M Speicher, 30 % Core.

Beim Pod-Löschen entfällt der Cache-Eintrag.

Knotenänderungen benachrichtigen `nodeNotify` und triggern sofort `RegisterFromNodeAnnotations`.

Der Informer liefert HAMi:
* GPU-Knotenstatus inkl. Geräteinfos.
* Pod-spezifische GPU-Nutzung (Speicher, Cores).

Damit kann der Scheduler weiterarbeiten.

## 4. Scheduling-Implementierung

Mit GPU-Infos im Cluster beginnt Scheduling über zwei Interfaces:
* `Filter`: Knoten filtern.
* `Bind`: Pod an Knoten binden.

### Filter-Interface

So filtert `Filter` Knoten:

```go
// pkg/scheduler/scheduler.go#L444
func (s *Scheduler) Filter(args extenderv1.ExtenderArgs) (*extenderv1.ExtenderFilterResult, error) {
    klog.InfoS("begin schedule filter", "pod", args.Pod.Name, "uuid", args.Pod.UID, "namespaces", args.Pod.Namespace)
    
    // Check if the pod requests any managed resources
    // If not, return all nodes as eligible.
    // ...

    nodeUsage, failedNodes, err := s.getNodesUsage(args.NodeNames, args.Pod)
    // ...
    
    nodeScores, err := s.calcScore(nodeUsage, nums, annos, args.Pod)
    // ...
    
    // Sort nodes by score
    sort.Sort(nodeScores)

    // Select the best node (the last one after sorting)
    m := (*nodeScores).NodeList[len((*nodeScores).NodeList)-1]
    klog.Infof("schedule %v/%v to %v %v", args.Pod.Namespace, args.Pod.Name, m.NodeID, m.Devices)
    
    // Patch pod annotations with scheduling decision
    // ...
    
    res := extenderv1.ExtenderFilterResult{NodeNames: &[]string{m.NodeID}}
    return &res, nil
}
```

Pods ohne Spezialressourcen erhalten alle Knoten als planbar.

Sonst werden Knoten bewertet: Verhältnis genutzter zu gesamter GPU-Core und -Memory, gewichtet zur Endpunktzahl.

**Je weniger GPU-Core und -Memory auf einem Knoten frei bleiben, desto höher die Punktzahl.**

```go
// pkg/scheduler/policy/node_policy.go#L52
func (ns *NodeScore) ComputeScore(devices DeviceUsageList) {
    // ... calculate used cores and memory
    
    // ... calculate total cores and memory

    useScore := float32(used) / float32(total)
    coreScore := float32(usedCore) / float32(totalCore)
    memScore := float32(usedMem) / float32(totalMem)
    ns.Score = float32(Weight) * (useScore + coreScore + memScore)
    klog.V(2).Infof("node %s computer score is %f", ns.NodeID, ns.Score)
}
```

Danach wird ein Knoten gewählt.

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

Damit steht der Zielknoten fest. **Warum liefert `Filter` nur einen Knoten und enthält Scoring?**

Standardmäßig aggregieren mehrere Plugins Scores — **HAMi will das Ergebnis voll kontrollieren, kombiniert Filter und Score und gibt genau einen Knoten zurück.**

### Bind-Interface

Einfach: Pod an den von `Filter` gewählten Knoten binden.

```go
func (s *Scheduler) Bind(args extenderv1.ExtenderBindingArgs) (*extenderv1.ExtenderBindingResult, error) {
    klog.InfoS("Bind", "pod", args.PodName, "namespace", args.PodNamespace, "podUID", args.PodUID, "node", args.Node)
    
    binding := &corev1.Binding{
        ObjectMeta: metav1.ObjectMeta{Name: args.PodName, UID: args.PodUID},
        Target:     corev1.ObjectReference{Kind: "Node", Name: args.Node},
    }

    // ... lock node, patch annotations
    
    if err = s.kubeClient.CoreV1().Pods(args.PodNamespace).Bind(context.Background(), binding, metav1.CreateOptions{}); err != nil {
        klog.ErrorS(err, "Failed to bind pod", "pod", args.PodName, "namespace", args.PodNamespace, "podUID", args.PodUID, "node", args.Node)
    }

    // ... handle success or failure
    
    return res, nil
}```
Kern:
```go
binding := &corev1.Binding{
    ObjectMeta: metav1.ObjectMeta{Name: args.PodName, UID: args.PodUID},
    Target:     corev1.ObjectReference{Kind: "Node", Name: args.Node},
}
if err = s.kubeClient.CoreV1().Pods(args.PodNamespace).Bind(context.Background(), binding, metav1.CreateOptions{}); err != nil {
    klog.ErrorS(err, "Failed to bind pod", "pod", args.PodName, "namespace", args.PodNamespace, "podUID", args.PodUID, "node", args.Node)
}
```

Die API erstellt ein `binding`-Objekt und plant den Pod auf den Knoten.

Damit endet die Scheduler-Analyse; danach startet der Kubelet den Pod und HAMis Device Plugin wirkt.

### Zwischenfassung

HAMi startet einen zusätzlichen Scheduler mit dem Standard-`kube-scheduler`-Image, benannt als `hami-scheduler`, mit Extender-HTTP-Service im selben Pod.

Scheduling in zwei Teilen:

1. **GPU-Informationen**: aus Node-Annotations (Bestand) und Pod-Annotations (Nutzung).
2. **Knotenwahl nach Policy**: im `Filter` sortieren und einen Knoten zurückgeben; Score aus verbleibendem Speicher/Cores (mehr Rest → niedrigerer Score).

## 5. Zusammenfassung

Dieser Artikel analysiert `hami-scheduler` mit zwei Komponenten:
* **Webhook**: Erkennt HAMi-vGPU am `Resource`-Feld und setzt `SchedulerName` auf `hami-scheduler`.
* **Scheduler**: `kube-scheduler`-Image als `hami-scheduler` plus Extender-Logik — GPU-Infos aus Annotations, verfügbare Ressourcen berechnen, Knoten scoren, nach Spread/Binpack planen.

### HAMi Webhook & Scheduler Workflow

![HAMi device plugin workflow diagram](/images/blog/gpu5/p1-en.png)

1. Nutzer erstellt Pod mit vGPU-Anforderung.
2. **kube-apiserver ruft per `MutatingWebhookConfiguration` den HAMi-Webhook auf.**
3. Webhook prüft `Resource`; bei HAMi-vGPU → `SchedulerName` = `hami-scheduler` (privilegierte Pods übersprungen; vGPU + `nodeName` abgelehnt).
4. **`hami-scheduler` plant den Pod** (Standard-`kube-scheduler`-Logik + **Extender** per `KubeSchedulerConfiguration`).
5. **Extender** mit HAMi-Logik, Scoring, `spread` & `binpack`.
6. **Asynchrone GPU-Wahrnehmung** via Device Plugin und Annotations.

Damit ist die Webhook- und Scheduler-Analyse abgeschlossen; `spread` & `binpack` folgen im nächsten Artikel.

---

*Mehr zum HAMi-Projekt: [GitHub](https://github.com/Project-HAMi/HAMi) oder [Slack](https://cloud-native.slack.com/archives/C07T10BU4R2).*
---
