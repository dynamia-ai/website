---
title: 'HAMi-vGPU-Prinzipien Teil 2: Funktionsweise von hami-webhook'
coverTitle: 'HAMi-vGPU-Prinzipien Teil 2: hami-webhook'
date: '2025-07-24'
excerpt: >-
  Nach hami-device-plugin-nvidia im ersten Teil: dieser Artikel (Serie Teil 2)
  führt in hami-scheduler ein; hier im Fokus der Webhook und die Zuweisung von
  Pods an hami-scheduler.
author: Dynamia AI Team
tags:
  - HAMi
  - GPU-Sharing
  - vGPU
  - Kubernetes
  - Heterogene Compute
category: Technical Deep Dive
coverImage: /images/blog/gpu4/cover2.jpg
language: de
linktitle: HAMi-Webhook erklärt
---

Im ersten Artikel haben wir `hami-device-plugin-nvidia` und HAMis NVIDIA Device Plugin analysiert.

[Vorheriger Artikel: „HAMi vGPU Teil 1: hami-device-plugin-nvidia“](/blog/open-source-vgpu-hami-device-plugin-nvidia)

Dies ist Teil 2 der HAMi-Prinzipien-Serie — hier mit Schwerpunkt `hami-scheduler` und Webhook.

Für vGPU-Scheduling nutzt HAMi den eigenen `hami-scheduler` inkl. Strategien wie `spread` und `binpack`.

Zentrale Fragen:

1. Wie landen Pods bei `hami-scheduler`? Ohne `schedulerName` würde normalerweise der `default-scheduler` schedulen.
2. Wie funktioniert `hami-scheduler`, und wie werden `spread`/`binpack` umgesetzt?

Die Serie gliedert sich in drei Artikel: Webhook, Scheduler, Spread/Binpack — dieser Teil beantwortet Frage 1.

> Analysebasis: HAMi v2.4.0.

## 1. Startkommando von hami-scheduler

`hami-scheduler` besteht aus zwei Komponenten:

- `hami-webhook`
- `hami-scheduler`

Code gemeinsam; Einstieg **cmd/scheduler/main.go** — CLI mit Cobra.

```go
var (
 sher        *scheduler.Scheduler
 tlsKeyFile  string
 tlsCertFile string
 rootCmd     = &cobra.Command{
  Use:   "scheduler",
  Short: "kubernetes vgpu scheduler",
  Run: func(cmd *cobra.Command, args []string) {
   start()
  },
 }
)

func main() {
 if err := rootCmd.Execute(); err != nil {
  klog.Fatal(err)
 }
}
```

Die aufgerufene `start`-Methode:

```go
func start() {
 // Initialize GPU inventory
 device.InitDevices()

 // Build and start the scheduler
 sher = scheduler.NewScheduler()
 sher.Start()
 defer sher.Stop()

 // Background goroutines
 go sher.RegisterFromNodeAnnotations()     // Sync node GPU annotations
 go initMetrics(config.MetricsBindAddress) // Prometheus metrics

 // HTTP routes
 router := httprouter.New()
 router.POST("/filter",  routes.PredicateRoute(sher))
 router.POST("/bind",    routes.Bind(sher))
 router.POST("/webhook", routes.WebHookRoute())
 router.GET("/healthz",  routes.HealthzRoute())

 // Start server (plain or TLS)
 klog.Info("listen on ", config.HTTPBind)
 if len(tlsCertFile) == 0 || len(tlsKeyFile) == 0 {
  if err := http.ListenAndServe(config.HTTPBind, router); err != nil {
   klog.Fatal("Listen and Serve error, ", err)
  }
 } else {
  if err := http.ListenAndServeTLS(config.HTTPBind, tlsCertFile, tlsKeyFile, router); err != nil {
   klog.Fatal("Listen and Serve error, ", err)
  }
 }
}
```

Zuerst Device-Initialisierung.
> Wird gleich vom Webhook genutzt.

```go
// device.InitDevices() scans local GPU devices via NVML,
// parses node annotations, and builds the in-memory inventory.
device.InitDevices()
```

Dann startet der Scheduler.

```go
sher = scheduler.NewScheduler() // create scheduler instance
sher.Start()                  // start scheduling loop
defer sher.Stop()             // graceful shutdown on exit```

Als Nächstes eine Goroutine: GPU-Infos aus Node-Annotations des Device Plugins synchronisieren.

```go
// background goroutine: continuously syncs GPU inventory
// from Node annotations into the scheduler cache
go sher.RegisterFromNodeAnnotations()
```

Schließlich der HTTP-Server.

```go
router := httprouter.New()
router.POST("/filter",  routes.PredicateRoute(sher)) // scheduler predicate plugin
router.POST("/bind",    routes.Bind(sher))           // scheduler bind plugin
router.POST("/webhook", routes.WebHookRoute())       // mutating/validating webhook
router.GET("/healthz",  routes.HealthzRoute())       // liveness probe
```

Dabei:

- `/webhook` — Webhook
- `/filter`, `/bind` — Scheduler
- `/healthz` — Health Check

Im Folgenden Webhook (und später Scheduler) am Quellcode.

## 2. hami-webhook

Mutating Webhook, vor allem für den Scheduler.

Kernfunktion: **Prüfen, ob der Pod HAMi-vGPU über `ResourceName` in `resources` nutzt. Wenn ja: `schedulerName` auf `hami-scheduler` setzen — sonst keine Änderung.**

### MutatingWebhookConfiguration

Beim Deploy erzeugt HAMi eine **MutatingWebhookConfiguration**, etwa:

```yaml
apiVersion: admissionregistration.k8s.io/v1
kind: MutatingWebhookConfiguration
metadata:
  annotations:
    meta.helm.sh/release-name: vgpu
    meta.helm.sh/release-namespace: kube-system
  labels:
    app.kubernetes.io/managed-by: Helm
  name: vgpu-hami-webhook
webhooks:
- admissionReviewVersions:
  - v1beta1
  clientConfig:
    caBundle: xxx
    service:
      name: vgpu-hami-scheduler
      namespace: kube-system
      path: /webhook
      port: 443
  failurePolicy: Ignore
  matchPolicy: Equivalent
  name: vgpu.hami.io
  namespaceSelector:
    matchExpressions:
    - key: hami.io/webhook
      operator: NotIn
      values:
      - ignore
  objectSelector:
    matchExpressions:
    - key: hami.io/webhook
      operator: NotIn
      values:
      - ignore
  reinvocationPolicy: Never
  rules:
  - apiGroups:
    - ""
    apiVersions:
    - v1
    operations:
    - CREATE
    resources:
    - pods
    scope: '*'
  sideEffects: None
  timeoutSeconds: 10
```

Bei Pod-`CREATE` ruft der kube-apiserver den Webhook dieses Service auf — eigene Logik wird injiziert.

Regel für Pod-`CREATE`:

```yaml
rules:
- apiGroups:
  - ""
  apiVersions:
  - v1
  operations:
  - CREATE
  resources:
  - pods
  scope: '*'
```

Ausgenommen bei:

```yaml
namespaceSelector:
  matchExpressions:
  - key: hami.io/webhook
    operator: NotIn
    values:
    - ignore
objectSelector:
  matchExpressions:
  - key: hami.io/webhook
    operator: NotIn
    values:
    - ignore
```

Namespace oder Objekt mit Label `hami.io/webhook=ignore` löst den Webhook nicht aus.

Angeforderter Webhook:

```yaml
service:
  name: vgpu-hami-scheduler
  namespace: kube-system
  path: /webhook
  port: 443

```

Bei passendem Pod-`CREATE` ruft der apiserver diesen Service — unser `hami-webhook`.

Was macht `hami-webhook` konkret?

### Quellcode

Implementierung:

```go
// pkg/scheduler/webhook.go#L52
func (h *webhook) Handle(_ context.Context, req admission.Request) admission.Response {
 pod := &corev1.Pod{}
 if err := h.decoder.Decode(req, pod); err != nil {
  klog.Errorf("Failed to decode request: %v", err)
  return admission.Errored(http.StatusBadRequest, err)
 }
 if len(pod.Spec.Containers) == 0 {
  klog.Warningf(template+" - Denying admission as pod has no containers", req.Namespace, req.Name, req.UID)
  return admission.Denied("pod has no containers")
 }

 klog.Infof(template, req.Namespace, req.Name, req.UID)
 hasResource := false
 for idx, ctr := range pod.Spec.Containers {
  c := &pod.Spec.Containers[idx]
  if ctr.SecurityContext != nil && ctr.SecurityContext.Privileged != nil && *ctr.SecurityContext.Privileged {
   klog.Warningf(template+" - Denying admission as container %s is privileged", req.Namespace, req.Name, req.UID, c.Name)
   continue
  }
  for _, val := range device.GetDevices() {
   found, err := val.MutateAdmission(c)
   if err != nil {
    klog.Errorf("validating pod failed:%s", err.Error())
    return admission.Errored(http.StatusInternalServerError, err)
   }
   hasResource = hasResource || found
  }
 }

 if !hasResource {
  klog.Infof(template+" - Allowing admission for pod: no resource found", req.Namespace, req.Name, req.UID)
 } else if len(config.SchedulerName) > 0 {
  pod.Spec.SchedulerName = config.SchedulerName
 }

 marshaledPod, err := json.Marshal(pod)
 if err != nil {
  klog.Errorf(template+" - Failed to marshal pod, error: %v", req.Namespace, req.Name, req.UID, err)
  return admission.Errored(http.StatusInternalServerError, err)
 }
 return admission.PatchResponseFromRaw(req.Object.Raw, marshaledPod)
}
```

Die Logik ist einfach:

1. Braucht der Pod `hami-scheduler`?
2. Wenn ja: `schedulerName` auf `hami-scheduler` (konfigurierbarer Name).

Kernfrage: wie wird das erkannt?

### Erkennung von `hami-scheduler`-Pods

Hauptsächlich über vGPU-Ressourcen im Pod — mit Sonderfällen.

### Privilegierte Pods

Privilegierte Pods werden ignoriert.

```go
if ctr.SecurityContext != nil {
 if ctr.SecurityContext.Privileged != nil && *ctr.SecurityContext.Privileged {
  klog.Warningf(template+" - Denying admission as container %s is privileged", req.Namespace, req.Name, req.UID, c.Name)
  continue
 }
}
```

Im Privileged-Modus sind alle Host-Devices erreichbar — Limits sind sinnlos, daher Skip.

### Konkrete Prüflogik

Dann Prüfung der Pod-Ressourcen:

```go
for _, val := range device.GetDevices() {
 found, err := val.MutateAdmission(c)
 if err != nil {
  klog.Errorf("validating pod failed:%s", err.Error())
  return admission.Errored(http.StatusInternalServerError, err)
 }
 hasResource = hasResource || found
}
```

Fordert der Pod von HAMi unterstützte vGPU-Ressourcen an, ist `hami-scheduler` nötig.

Unterstützte Devices — in `start` initialisiert:

```go
var devices map[string]Devices

func GetDevices() map[string]Devices {
 return devices
}

func InitDevices() {
 devices = make(map[string]Devices)
 DevicesToHandle = []string{}

 devices[cambricon.CambriconMLUDevice] = cambricon.InitMLUDevice()
 devices[nvidia.NvidiaGPUDevice]       = nvidia.InitNvidiaDevice()
 devices[hygon.HygonDCUDevice]         = hygon.InitDCUDevice()
 devices[iluvatar.IluvatarGPUDevice]   = iluvatar.InitIluvatarDevice()

 DevicesToHandle = append(DevicesToHandle,
  nvidia.NvidiaGPUCommonWord,
  cambricon.CambriconMLUCommonWord,
  hygon.HygonDCUCommonWord,
  iluvatar.IluvatarGPUCommonWord,
 )

 for _, dev := range ascend.InitDevices() {
  devices[dev.CommonWord()] = dev
  DevicesToHandle = append(DevicesToHandle, dev.CommonWord())
 }
}
```

`devices` ist global; `InitDevices` füllt sie für den Webhook — NVIDIA, Hygon, Iluvatar, Ascend usw.

Am Beispiel NVIDIA: `MutateAdmission`:

```go
func (dev *NvidiaGPUDevices) MutateAdmission(ctr *corev1.Container) (bool, error) {
 // GPU-related mutations
 if priority, ok := ctr.Resources.Limits[corev1.ResourceName(ResourcePriority)]; ok {
  ctr.Env = append(ctr.Env, corev1.EnvVar{
   Name:  api.TaskPriority,
   Value: fmt.Sprint(priority.Value()),
  })
 }

 _, resourceNameOK := ctr.Resources.Limits[corev1.ResourceName(ResourceName)]
 if resourceNameOK {
  return resourceNameOK, nil
 }

 _, resourceCoresOK := ctr.Resources.Limits[corev1.ResourceName(ResourceCores)]
 _, resourceMemOK := ctr.Resources.Limits[corev1.ResourceName(ResourceMem)]
 _, resourceMemPercentageOK := ctr.Resources.Limits[corev1.ResourceName(ResourceMemPercentage)]

 if resourceCoresOK || resourceMemOK || resourceMemPercentageOK {
  if config.DefaultResourceNum > 0 {
   ctr.Resources.Limits[corev1.ResourceName(ResourceName)] =
    *resource.NewQuantity(int64(config.DefaultResourceNum), resource.BinarySI)
   resourceNameOK = true
  }
 }

 if !resourceNameOK && OverwriteEnv {
  ctr.Env = append(ctr.Env, corev1.EnvVar{
   Name:  "NVIDIA_VISIBLE_DEVICES",
   Value: "none",
  })
 }
 return resourceNameOK, nil
}
```

Enthält `limits` den passenden `ResourceName`, sofort `true`.

```go
_, resourceNameOK := ctr.Resources.Limits[corev1.ResourceName(ResourceName)]
if resourceNameOK {
 return resourceNameOK, nil
}
```

`ResourceName` für NVIDIA:

```go
fs.StringVar(&ResourceName, "resource-name", "nvidia.com/gpu", "resource name")
```

Wird diese Resource in `resources` angefordert, schedult HAMi. Andere Beschleuniger analog.
> HAMi unterstützt u. a. NVIDIA, Iluvatar, Huawei, Cambricon, Hygon — Defaults: `nvidia.com/gpu`, `iluvatar.ai/vgpu`, `hygon.com/dcunum`, `cambricon.com/mlu`, `huawei.com/Ascend310` — diese Pods gehen an `hami-scheduler`.
> ResourceNames sind in den Device Plugins konfigurierbar.

Ohne direktes `nvidia.com/gpu`, aber mit `gpucore`/`gpumem` und `DefaultResourceNum` > 0: ebenfalls `true`, plus automatisches `nvidia.com/gpu`.

```go
_, resourceCoresOK := ctr.Resources.Limits[corev1.ResourceName(ResourceCores)]
_, resourceMemOK := ctr.Resources.Limits[corev1.ResourceName(ResourceMem)]
_, resourceMemPercentageOK := ctr.Resources.Limits[corev1.ResourceName(ResourceMemPercentage)]

if resourceCoresOK || resourceMemOK || resourceMemPercentageOK {
 if config.DefaultResourceNum > 0 {
  ctr.Resources.Limits[corev1.ResourceName(ResourceName)] =
   *resource.NewQuantity(int64(config.DefaultResourceNum), resource.BinarySI)
  resourceNameOK = true
 }
}
```

### schedulerName ändern

Erfüllen Pods die Bedingungen, setzt der Webhook `spec.schedulerName` auf `hami-scheduler`:

```go
if !hasResource {
 klog.Infof(template+" - Allowing admission for pod: no resource found", req.Namespace, req.Name, req.UID)
} else if len(config.SchedulerName) > 0 {
 pod.Spec.SchedulerName = config.SchedulerName
}
```

Damit übernimmt `hami-scheduler` die Zuweisung.

Sonderfall: gesetztes `nodeName` beim Create — Webhook lehnt ab. Der Pod umgeht Scheduling; der Knoten hat ggf. keine passenden Ressourcen.

```go
if pod.Spec.NodeName != "" {
 klog.Infof(template+" - Pod already has node assigned", req.Namespace, req.Name, req.UID)
 return admission.Denied("pod has node assigned")
}
```

---

## 3. Zusammenfassung

Zweck des Webhooks: vGPU-Pods auf `hami-scheduler` umleiten.

Sonderfälle:

- Privileged Pods: kein Umschalten — bleiben beim `default-scheduler`.
- `nodeName` gesetzt: Create wird abgelehnt.

Daraus ein häufiges Community-Problem:

**Privileged Pod fordert `gpucore`/`gpumem` an, bleibt Pending — kein Node mit diesen Ressourcen.**

Der Webhook überspringt Privileged; der `default-scheduler` kennt `gpucore`/`gpumem` nicht auf Nodes.
> `gpucore` und `gpumem` sind virtuelle Ressourcen — nur `hami-scheduler` versteht sie.

### Ablauf HAMi-Webhook

1. Nutzer erstellt Pod mit vGPU-Ressourcen.
2. apiserver ruft per `MutatingWebhookConfiguration` HAMi-Webhook.
3. Webhook erkennt HAMi-vGPU → `schedulerName` = `hami-scheduler` (Privileged: Skip; `nodeName`: Reject).
4. Weiter mit `hami-scheduler` — nächster Artikel.

Damit ist klar, **warum und welche Pods** `hami-scheduler` nutzen — und warum Privileged-Pods scheitern können.

Nächster Artikel: Implementierung von `hami-scheduler`.

---
*Mehr zu HAMi: [GitHub](https://github.com/Project-HAMi/HAMi) oder [Slack](https://cloud-native.slack.com/archives/C07T10BU4R2).*
