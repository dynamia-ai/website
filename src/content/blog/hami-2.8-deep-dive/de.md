---
title: 'HAMi v2.8 Deep Dive: Standardisierung und Ökosystem-Evolution'
coverTitle: 'HAMi v2.8 Deep Dive: Standardisierung und Ökosystem'
date: '2026-02-04'
excerpt: >-
  HAMi v2.8 im Detail: Kubernetes-DRA-Unterstützung, Leader Election, CDI-Modus,
  Upstream-Integration (Kueue, vLLM), kritische Bugfixes und Stabilitätsverbesserungen.
author: Dynamia AI Team
tags:
  - HAMi
  - GPU-Sharing
  - vGPU
  - Kubernetes
  - DRA
  - Leader Election
  - CDI
  - Release
category: Product Release
coverImage: /images/blog/hami-2.8-deep-dive/heterogeneous-gpu-ecosystem.png
linktitle: HAMi 2.8 Deep Dive
---

> **Tiefe Wurzeln, üppiges Laub.**
>
> Inspiriert von Kubernetes 1.35 *Timbernetes*: Jahresringe markieren Wachstum — hier die Metapher von **Wurzeln** und **Zweigen**.
>
> **Wurzeln** stehen für Standardisierung: einheitliche Schnittstellen, tief verankert;
> **Zweige** für das heterogene Compute-Ökosystem: vielfältiges Silizium, nach oben wachsend.
>
> Seit v2.7 entwickelt sich HAMi weiter in Standardisierung und Ökosystem. Wenn DRA-Wurzeln auf die vielfältigen GPU-Zweige treffen, wird HAMi vom Scheduler-Projekt zum heterogenen Scheduling-Ökosystem — **tiefe Wurzeln tragen üppiges Laub, solides Fundament trägt blühende Zweige**.

## Von v2.7 zu v2.8: Dual Evolution in Standardisierung und Ökosystem

Seit HAMi v2.7 hat das Projekt in **Architekturvollständigkeit, Scheduling-Zuverlässigkeit und Ökosystem-Ausrichtung** deutlich zugelegt. v2.8 bringt systematische Verbesserungen bei Kubernetes-Native-Standards, Geräteunterstützung, Produktionsreife und Observability — HAMi eignet sich besser für KI-Produktionscluster mit Langzeitstabilität und klaren Upgrade-Pfaden.

Dieser Artikel skizziert die wichtigsten v2.8-Features und die Community-Praxis beim Aufbau des heterogenen Scheduling-Ökosystems.

### v2.8 im Überblick

* **Standardisierung**: **Kubernetes DRA (Dynamic Resource Allocation)** über das eigenständige Projekt [HAMi-DRA](https://github.com/Project-HAMi/HAMi-DRA) — Weg von „custom device scheduling“ zu **nativen Kubernetes-Schnittstellen**.

* **Hochverfügbarkeit & Zuverlässigkeit**: **Leader Election** für Scheduler-HA; **CDI-Modus** für standardisiertes Gerätemanagement; Anbindung an NVIDIA k8s-device-plugin v0.18.0.

* **HAMi-Ökosystem**: vom Einzel-Repo zum Ökosystem mit HAMi-DRA, mock-device-plugin und HAMi-WebUI.

## HAMi-Ökosystem im Überblick

HAMi ist von einem Scheduler-Projekt zu einer Open-Source-Ökosystem-Organisation gewachsen. Struktur des HAMi-Ökosystems:

![HAMi Ecosystem Overview](/images/blog/hami-2.8-deep-dive/f1.png)

## Kernfunktionen

### DRA (Dynamic Resource Allocation) — Richtung native Kubernetes-Standards

DRA ist der von der Kubernetes-Community vorangetriebene Mechanismus für Geräteressourcen-Deklaration und -Zuweisung — **standardisierter, komponierbarer und erweiterbarer** für GPU/AI-Beschleuniger und andere Geräte.

#### Warum DRA wichtig ist

Traditionelles Kubernetes-Gerätemanagement hat Grenzen:

1. **Unflexible Deklaration:** Geräte hard-coded über `limits[nvidia.com/gpu]`, komplexe Anforderungen (Speicher vs. Compute getrennt) schwer ausdrückbar

2. **Verteilte Scheduling-Logik:** Jedes Device Plugin eigene Logik — einheitliches Management schwierig

3. **Schwere Komposition:** z. B. „mehrere GPUs mit bestimmter Topologie“ kaum formulierbar

DRA standardisiert Deklaration, Zuweisung und Management über APIs wie **ResourceClaim** und **DeviceClass**.

#### HAMi-DRA-Architektur

HAMi-DRA ist eine eigenständige DRA-Implementierung der HAMi-Community mit **Mutating Webhook**, der klassische GPU-Requests automatisch in DRA ResourceClaims übersetzt.

DRA-Request-Flow:

![DRA Request Flow](/images/blog/hami-2.8-deep-dive/f2.png)

#### HAMi-DRA-Kernfunktionen

1. **Automatische Konvertierung:** `nvidia.com/gpu`, `nvidia.com/gpumem`, `nvidia.com/gpucores` usw. → DRA ResourceClaim

2. **Geräteauswahl:** spezifische Geräte per Pod-Annotations (UUID, Typ …)

3. **Metriken:** optionaler Monitor, GPU-Nutzung für Prometheus

4. **CDI:** Container Device Interface für standardisierte Geräteinjektion

#### DRA-Nutzungsbeispiel

**Voraussetzungen:**

* Kubernetes version >= 1.34
* DRA-Consumable-Capacity-Feature-Gate aktivieren
* CDI-Support in der Container-Runtime aktivieren (containerd oder CRI-O)
* Install cert-manager

**HAMi-DRA installieren:**

```bash
# Using GPU Operator's containerd driver
helm install hami-dra ./charts/hami-dra

# Without GPU Operator's driver
helm install hami-dra ./charts/hami-dra --set drivers.nvidia.containerDriver=false
```

**Geräteressourcen konfigurieren:**

Edit `charts/hami-dra/values.yaml`:

```yaml
resourceName: "nvidia.com/gpu"
resourceMem: "nvidia.com/gpumem"
resourceCores: "nvidia.com/gpucores"
```

**Pod mit DRA einreichen:**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: gpu-pod
spec:
  containers:
  - name: gpu-container
    image: nvidia/cuda:11.8.0-base-ubuntu22.04
    command: ["nvidia-smi"]
    resources:
      limits:
        nvidia.com/gpu: 2
        nvidia.com/gpumem: 4096
        nvidia.com/gpucores: 80
```

Der HAMi-DRA-Webhook konvertiert den Pod automatisch auf DRA ResourceClaim.

**ResourceClaim anzeigen:**

```bash
kubectl get resourceclaim
kubectl describe resourceclaim <claim-name>
```

**Metriken-Zugang:**

```yaml
monitor:
  enabled: true
  service:
    type: NodePort
    nodePort:
      metrics: 31995
```

```bash
# Access metrics
curl http://<node-ip>:31995/metrics
```

> **Hinweis:** Ein eigener Technikartikel zu DRA-Design, Implementierung und Vergleich mit bestehenden Modellen folgt separat.

### Leader Election — Scheduler-Hochverfügbarkeit

Für große Cluster oder HA-Szenarien bringt HAMi v2.8.0 **Leader Election für mehrere Scheduler-Instanzen** — per Kubernetes-Lease, sodass nur eine Instanz aktiv scheduliert.

Leader-Election-Architektur:

![Leader Election Architecture](/images/blog/hami-2.8-deep-dive/f3.png)

**Wichtige Vorteile:**

1. **Scheduling-Konflikte vermeiden:** Parallele Scheduler-Instanzen können Ressourcenkonflikte erzeugen — Leader Election stellt sicher, dass nur eine instanz scheduliert.

2. **Automatisches Failover:** Fällt der Leader aus, übernehmen Standby-Instanzen — höhere Verfügbarkeit.

3. **Sanfte Upgrades:** Beim Rolling Upgrade des Schedulers werden neue Pods automatisch Leader — ohne manuellen Eingriff.

**Nutzung:**

Leader Election ist im Helm Chart standardmäßig aktiv und über `values.yaml` konfigurierbar:

```yaml
scheduler:
  replicaCount: 3  # Deploy 3 Scheduler instances
  leaderElection:
    enabled: true
    leaseDuration: 15s
    renewDeadline: 10s
    retryPeriod: 2s
```

### CDI-Modus (Container Device Interface)

HAMi v2.8.0 unterstützt **NVIDIA CDI**. CDI ist ein von [CNCF TAG](https://github.com/cncf-tags) gepflegter Standard für standardisierte Geräteinjektion.

**Konfiguration:**

`values.yaml` bearbeiten:

```yaml
global:
  deviceListStrategy: cdi-annotations  # or envvar
```

**Geräteinjektion im CDI-Modus:**

```yaml
# Pod Spec example
spec:
  containers:
  - name: gpu-container
    image: nvidia/cuda:11.8.0-base-ubuntu22.04
    resources:
      limits:
        nvidia.com/gpu: 1
    # Im CDI-Modus werden Geräte per CDI injiziert; Umgebungsvariablen sind nicht erforderlich
```

### Anbindung an NVIDIA k8s-device-plugin v0.18.0

HAMi v2.8.0 synchronisiert mit **NVIDIA k8s-device-plugin v0.18.0** — Kompatibilität mit dem aktuellen NVIDIA-Gerätemanagement.

**Vorteile der Ausrichtung:**

1. **Kompatibilität:** neueste NVIDIA-GPU-Hardware und Treiberfeatures

2. **Geringere Anpassungskosten:** HAMi lässt sich reibungslos in bestehende NVIDIA-Ökosysteme einführen

3. **Ökosystem-Synergie:** HAMi als „Enhancement Layer“, keine Fork-Implementierung

**Synchronisierte Features:**

* Aktuelle NVIDIA-GPU-Treiber
* Neueste MIG-Features (Multi-Instance GPU)
* Neue Monitoring-Metriken und Health-Checks

### Mock Device Plugin — Entwicklung & Test

HAMi v2.8.0 ergänzt [**Mock Device Plugin**](https://github.com/Project-HAMi/mock-device-plugin) — niedrigschwellige Gerätesimulation für Entwicklung und CI/Test.

Workflow:

![Mock Device Plugin Workflow](/images/blog/hami-2.8-deep-dive/f4.png)

**Kernfunktionen:**

1. **Virtuelle Geräte:** z. B. gpu-memory, gpu-cores auf Knoten registrieren — sichtbar in `node.status.allocatable` und `capacity`

2. **Ressourcentypen:**
   * NVIDIA GPU: `nvidia.com/gpumem`, `nvidia.com/gpumem-percentage`, `nvidia.com/gpucores`

3. **Entwicklerfreundlich:** Funktions- und Debug-Tests ohne echte GPU-Hardware

**Deployment:**

```bash
# RBAC bereitstellen
kubectl apply -f k8s-mock-rbac.yaml

# ConfigMap bereitstellen (falls noch nicht vorhanden)
kubectl apply -f device-configmap.yaml

# Mock Device Plugin bereitstellen
kubectl apply -f k8s-mock-plugin.yaml
```

**Beispiel: Knotenressourcen nach der Registrierung:**

```yaml
Allocatable:
  memory:                    769189866507
  nvidia.com/gpu:            20
  nvidia.com/gpucores:       200
  nvidia.com/gpumem:         65536
  nvidia.com/gpumem-percentage: 200
  pods:                      110
```

**Hinweis:**
Sind Speicherstatistiken sehr groß (z. B. > 120 GB), wird 0 angezeigt — dann `memoryFactor` in der ConfigMap `hami-scheduler-device` anpassen (Default: 1).

### Build Info & Metriken

HAMi v2.8.0 verbessert Observability systematisch:

**Neue Metriken:**

* `hami_build_info`: enthält Versionsnummer, Build-Zeitpunkt, Git-Commit usw.
* gibt beim Start vollständige Versionsinformationen aus

**Entfernte veraltete Metriken:**

* `vGPUPodsDeviceAllocated`: stattdessen `vGPUMemoryAllocated` und `vGPUCoreAllocated` verwenden
* `vGPUMemoryPercentage`: stattdessen `vGPUMemoryAllocated` verwenden
* `vGPUCorePercentage`: stattdessen `vGPUCoreAllocated` verwenden

**Metrik-Beispiel:**

```text
# Neue Build-Info-Metrik
hami_build_info{version="v2.8.0",git_commit="abc123",build_date="2026-01-29"} 1

# Metriken zur GPU-Ressourcenzuweisung
hami_vgpu_memory_allocated{node="gpu-node-1"} 16384
hami_vgpu_core_allocated{node="gpu-node-1"} 150
```

**Beispiel: Start-Log:**

```text
I0129 10:00:00.000000       1 version.go:42] HAMi Scheduler Version: v2.8.0
I0129 10:00:00.000001       1 version.go:43] Git Commit: abc123def
I0129 10:00:00.000002       1 version.go:44] Build Date: 2026-01-29T10:00:00Z
I0129 10:00:00.000003       1 version.go:45] Go Version: go1.25.5
```

## Ökosystem-Integration

HAMi entwickelt sich gemeinsam mit zentralen Komponenten des Kubernetes-KI-Ökosystems weiter. v2.8 bringt Fortschritt in folgenden Bereichen:

### Erweiterte Kueue-Integration

Kueue ist ein Batch-Job-Queue-Management-Projekt von Kubernetes SIG Scheduling. Die HAMi-Community hat Erweiterungen an Kueue beigesteuert und native Unterstützung für HAMis Geräteressourcen-Management und Scheduling-Modell ergänzt.

Die Integrationsarchitektur von Kueue + HAMi zeigt die folgende Abbildung:

![Kueue + HAMi Integration](/images/blog/hami-2.8-deep-dive/f5.png)

**Beispiel: Kueue-Integrationskonfiguration**

**1. Kueue-Deployment-Support aktivieren:**

```bash
kubectl edit configmap kueue-manager-config -n kueue-system
```

```yaml
apiVersion: config.kueue.x-k8s.io/v1beta2
kind: Configuration
integrations:
  frameworks:
    - "deployment"
    - "pod"
```

**2. ResourceTransformation konfigurieren:**

```yaml
apiVersion: config.kueue.x-k8s.io/v1beta2
kind: Configuration
integrations:
  frameworks:
    - "deployment"
    - "pod"
resources:
  transformations:
  - input: nvidia.com/gpucores
    strategy: Replace
    multiplyBy: nvidia.com/gpu
    outputs:
      nvidia.com/total-gpucores: "1"
  - input: nvidia.com/gpumem
    strategy: Replace
    multiplyBy: nvidia.com/gpu
    outputs:
      nvidia.com/total-gpumem: "1"
```

**3. ResourceFlavor anlegen:**

```yaml
apiVersion: kueue.x-k8s.io/v1beta2
kind: ResourceFlavor
metadata:
  name: hami-flavor
spec:
  nodeLabels:
    gpu: "on"
```

**4. ClusterQueue anlegen:**

```yaml
apiVersion: kueue.x-k8s.io/v1beta2
kind: ClusterQueue
metadata:
  name: hami-queue
spec:
  resourceGroups:
    - coveredResources: ["nvidia.com/gpu", "nvidia.com/total-gpucores", "nvidia.com/total-gpumem"]
      flavors:
        - name: hami-flavor
          resources:
            - name: "nvidia.com/gpu"
              nominalQuota: 80
            - name: "nvidia.com/total-gpucores"
              nominalQuota: 200
            - name: "nvidia.com/total-gpumem"
              nominalQuota: 10240
```

**5. LocalQueue anlegen:**

```yaml
apiVersion: kueue.x-k8s.io/v1beta2
kind: LocalQueue
metadata:
  name: hami-local-queue
  namespace: default
spec:
  clusterQueue: hami-queue
```

**6. Deployment mit vGPU einreichen:**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: vgpu-deployment
  labels:
    app: vgpu-app
    kueue.x-k8s.io/queue-name: hami-local-queue
spec:
  replicas: 2
  selector:
    matchLabels:
      app: vgpu-app
  template:
    metadata:
      labels:
        app: vgpu-app
    spec:
      containers:
        - name: vgpu-container
          image: nvidia/cuda:11.8.0-base-ubuntu22.04
          command: ["sleep", "infinity"]
          resources:
            limits:
              nvidia.com/gpu: 1
              nvidia.com/gpucores: 50
              nvidia.com/gpumem: 1024
```

**Hinweise zur Resource Transformation:**

Die ResourceTransformation von Kueue wandelt HAMi-vGPU-Ressourcenanfragen automatisch um:

* `nvidia.com/gpu` × `nvidia.com/gpucores` → `nvidia.com/total-gpucores`
* `nvidia.com/gpu` × `nvidia.com/gpumem` → `nvidia.com/total-gpumem`

Beispiel:
* Ein Deployment mit 2 Replikas, jede fordert `nvidia.com/gpu: 1`, `nvidia.com/gpucores: 50`, `nvidia.com/gpumem: 1024`
* Tatsächlicher Verbrauch: `nvidia.com/total-gpucores: 100` (2 × 1 × 50) und `nvidia.com/total-gpumem: 2048` (2 × 1 × 1024)

### vLLM-Kompatibilitätsfixes

vLLM ist ein weit verbreitetes Framework für LLM-Inferenz. HAMi v2.8 behebt mehrere vLLM-bezogene Kompatibilitätsprobleme.

**Behobene Probleme:**

1. **Multi-GPU-Absturz**: Abstürze bei vLLM mit mehreren GPUs behoben ([Issue #1461](https://github.com/Project-HAMi/HAMi/issues/1461))

2. **CUDA_VISIBLE_DEVICES-Kompatibilität**: Initialisierungsfehler bei manuell angegebenen Geräten behoben ([Issue #1381](https://github.com/Project-HAMi/HAMi/issues/1381))

**Beispiel: vLLM mit HAMi nutzen**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: vllm-pod
spec:
  containers:
  - name: vllm
    image: vllm/vllm-openai:latest
    command: ["vllm", "serve", "--model", "meta-llama/Llama-2-7b-hf"]
    resources:
      limits:
        nvidia.com/gpu: 2
        nvidia.com/gpucores: 80
        nvidia.com/gpumem: 16384
    env:
    - name: CUDA_VISIBLE_DEVICES
      value: "0,1"
```

## Kritische Bugfixes & Stabilität

v2.8 adressiert Issues aus Produktionsumgebungen und erhöht die Systemstabilität.

**Zentrale Fixes:**

1. **Fehler bei GPU-/MIG-Instanzzuweisung** ([PR #1518](https://github.com/Project-HAMi/HAMi/pull/1518))
   * Scheduler weist MIG-Instanzen nicht mehr fehlerhaft zu

2. **Abstürze bei gleichzeitigem Map-Lesen/Schreiben**
   * Schwerwiegende Fehler bei Map-Iteration und -Schreibzugriff unter Concurrency behoben ([PR #1452](https://github.com/Project-HAMi/HAMi/pull/1452), [PR #1476](https://github.com/Project-HAMi/HAMi/pull/1476))

3. **Fehler in der Quotenberechnung** ([PR #1400](https://github.com/Project-HAMi/HAMi/pull/1400))
   * ResourceQuota-Berechnungsfehler behoben

4. **Restzustände nach Device-Plugin-Entladen** ([PR #1456](https://github.com/Project-HAMi/HAMi/pull/1456))
   * Verbleibende Knotenzustände nach dem Entladen des Device Plugins beseitigt

5. **vLLM-bezogene Scheduling-Probleme** ([PR #1478](https://github.com/Project-HAMi/HAMi/pull/1478))
   * Scheduling- und Ressourcenberechnungsprobleme im Zusammenhang mit vLLM behoben

6. **Optimierung von Scheduling-Fehlerereignissen** ([PR #1444](https://github.com/Project-HAMi/HAMi/pull/1444))
   * Ausgabe von Scheduling-Fehlerereignissen optimiert — effizienteres Troubleshooting

## Engineering-Verbesserungen

### Node-Registrierungslogik ([PR #1499](https://github.com/Project-HAMi/HAMi/pull/1499))

Refactoring der Knotenregistrierung — stabilere und wartbarere Knotenverwaltung.

### Golang-Upgrade auf v1.25.5

HAMi v2.8 nutzt Go 1.25.5 mit aktuellen Sprachfeatures und Security-Fixes.

### Zertifikat-Hot-Reload

HAMi unterstützt **Hot-Reload von Zertifikatsänderungen** — ohne Neustart oder Service-Unterbrechung.

**Konfiguration:**

```yaml
scheduler:
  certWatchEnabled: true
  certDir: /etc/hami/certs
```

### Repository-Optimierung

Entfernung früher Binärdateien — Repo von 132 MB auf 20 MB, schnelleres Klonen und Bauen.

## Community-Updates

Die HAMi-Community bleibt aktiv; während v2.8 u. a.:

### CNCF Case Study

Der Case Study **DaoCloud baut GPU-Cloud mit HAMi** ist auf cncf.io erschienen:

<https://www.cncf.io/case-studies/daocloud/>

DaoCloud nutzte HAMi für eine GPU-Cloud mit Pooling und Scheduling heterogener Ressourcen — deutlich höhere Auslastung.

### Community-Contributors

v2.8 verdankt vielen Contributors besonderen Dank an:

* [**@archlitchi**](https://github.com/archlitchi): zentrales Scheduling, mehrere kritische Fixes, Version Releases und CI-Stabilität

* [**@luohua13**](https://github.com/luohua13): Quotenberechnung, Geräte-Lebenszyklus und Scheduling-Stabilität

* [**@Shouren**](https://github.com/Shouren): NVIDIA-/MIG-bezogene Fixes, Security und Engineering-Qualität

* [**@FouoF**](https://github.com/FouoF): Scheduler-Stabilität, Tests und Helm-Verbesserungen

* [**@Kyrie336**](https://github.com/Kyrie336): Scheduling-Entscheidungen und Multi-Device-Support

* [**@litaixun**](https://github.com/litaixun): Concurrency-Sicherheit sowie Knoten- und Geräteverwaltung

Danke an alle, die per Issues, PRs, Tests und Feedback beigetragen haben.

### Community-Wachstum

Während v2.8 wichtige Rollenwechsel:

* [**@Shouren**](https://github.com/Shouren) wurde zum HAMi-**Maintainer** befördert ([Issue #33](https://github.com/Project-HAMi/community/issues/33)). Shouren hat maßgeblich zu Scheduling-Robustheit, Geräteverwaltung, Release-Prozessen und Security-Updates beigetragen, ist Kernentwickler von HAMi-DRA und hat Hunderte Issues und PRs reviewt.

* [**@FouoF**](https://github.com/FouoF) wurde zum HAMi-**Approver** befördert ([Issue #31](https://github.com/Project-HAMi/community/issues/31)). FouoF engagiert sich kontinuierlich für Scheduler-Stabilität, HAMi-DRA, Testverbesserungen und Chart-Erweiterungen und ist ein wichtiger Reviewer im Projekt.

* [**@DSFans2014**](https://github.com/DSFans2014) (James) wurde zum HAMi-**Reviewer** befördert ([Issue #29](https://github.com/Project-HAMi/community/issues/29)). DSFans2014 leistet wichtige Beiträge bei Geräteunterstützung und heterogenen Szenarien und beteiligt sich aktiv an Code Reviews und Bugfixes.

* [**@Shenhan11**](https://github.com/Shenhan11) wurde zum HAMi-**Reviewer** befördert ([Issue #30](https://github.com/Project-HAMi/community/issues/30)). Shenhan11 investiert kontinuierlich in Entwicklung und Tests mehrerer Funktionsmodule und stärkt damit die Projektqualität.

Erneut Dank an alle Contributors in v2.8.

## Roadmap: v2.9

HAMi v2.9.0 entwickelt sich u. a. in Richtung:

**Kernfunktionen**

* **Scheduling-Verbesserungen**: MPS-Integration, Ressourcen-Preemption, PodGroup-Support (Kueue/Volcano)

* **Heterogene Chips**: Unterstützung für AMD Mi300X

* **DRA-Ausbau**: erweiterte DRA-Unterstützung für weitere Gerätetypen

**Volcano-vGPU**

* **Flexible Partitionierung**: dynamisches MIG, topology-aware Scheduling

* **Ökosystem-Integration**: CDI-Support, LWS-Integration, Anpassung an NVIDIA DP 0.18.0

Roadmap v2.8 → v2.9:

![v2.8 to v2.9 Roadmap](/images/blog/hami-2.8-deep-dive/f6.png)

Die HAMi-Community lädt Entwickler, Nutzer und Partner ein, heterogenes Scheduling in Cloud-Native-Systemen mitzugestalten.

Danke an alle, die zur v2.8-Phase beigetragen haben — euer Engagement treibt HAMi Richtung **Produktionsreife und Ökosystem-Freundlichkeit**.

## Download & Installation

**Helm Chart:**

```bash
helm repo add hami https://project-hami.io/hami-helm
helm repo update
helm install hami hami/hami --version 2.8.0
```

**Source Code:**

<https://github.com/Project-HAMi/HAMi/releases/tag/v2.8.0>

**Documentation:**

<https://project-hami.io/docs/>
