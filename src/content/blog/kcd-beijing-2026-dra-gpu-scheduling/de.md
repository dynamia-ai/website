---
title: "Vom Device Plugin zu DRA: Paradigmenwechsel im GPU-Scheduling und HAMi-DRA in der Praxis"
linktitle: HAMi-DRA-Recap KCD Beijing 2026
date: '2026-03-23'
excerpt: >-
  Auf der KCD Beijing 2026 stellten HAMi-Kern-Maintainer den Paradigmenwechsel
  vom Device Plugin zu DRA vor — Fähigkeiten und Hürden von DRA, HAMi-DRAs
  automatische Webhook-Migration sowie Performance- und Observability-Ergebnisse.
author: Dynamia
tags:
  - KCD
  - HAMi
  - DRA
  - GPU-Scheduling
  - Kubernetes
  - KI-Infrastruktur
category: Technical Deep Dive
language: de
coverImage: /images/events/kubecon-eu-2026-hami-recap/keynote-stage.jpg
---

Die KCD Beijing 2026 war mit **über 1.000 Anmeldungen** eine der größten Kubernetes-Community-Events der letzten Jahre — Rekord für KCD Beijing.

Die HAMi-Community hielt einen Tech-Talk und betrieb einen Stand, im intensiven Austausch mit Entwicklern und Enterprise-Nutzern aus Cloud Native und KI-Infrastruktur.

Referenten:

* **Wang Jifei** (Dynamia, HAMi Approver, Lead HAMi-DRA)
* **James Deng** (4Paradigm, HAMi Reviewer)

Thema: **From Device Plugin to DRA: GPU Scheduling Paradigm Shift and HAMi-DRA in Practice.**

Dieser Artikel fasst Präsentation und Folien technisch nach. Folien: [GitHub - HAMi-DRA KCD Beijing 2026](https://github.com/Project-HAMi/community/blob/main/talks/01-kcd-beijing-20260323/KCD-Beijing-2026-GPU-Scheduling-DRA-HAMi-Wang-Jifei-James-Deng.pdf).

## Event-Recap

![Haupthalle](https://project-hami.io/assets/images/keynote-e1e2e24717769197253345671946a0ca.jpg)

![Registrierung](https://project-hami.io/assets/images/register-6acd8011d259ee73f08e2b03d15ec150.jpg)

![HAMi-Stand](https://project-hami.io/assets/images/booth-26950eea7308b589c96c5512c15a93a8.jpg)

![Volunteers](https://project-hami.io/assets/images/booth2-c13fb6231a4a43ac0367a35befd2a193.jpg)

![Wang Jifei](https://project-hami.io/assets/images/wangjifei-096625d277476d4d56c6b730c97a80de.jpg)

![James Deng](https://project-hami.io/assets/images/james-d46e3f1098e0ea75ff7351fd7e3a2886.jpg)

## Der Paradigmenwechsel im GPU-Scheduling

Kern der Session — nicht nur DRA selbst:

> **GPUs werden von „Devices“ zu „Ressourcenobjekten“.**

KI-Workloads brauchen Teilen, Partitionieren, Scheduling und Governance — nicht mehr nur exklusive Ganzkarten-Zuteilung.

## Die Grenzen des Device Plugins

Das klassische Device-Plugin-Modell ist ausdrucksschwach:

* nur „Menge“ (`nvidia.com/gpu: 1`)
* keine mehrdimensionalen Ressourcen (Memory / Cores / Slices)
* keine Multi-Card-Kombinationen
* keine Topologie (NUMA / NVLink)

Folgen:

* Scheduling-Logik in Extender/Sidecar
* höhere Systemkomplexität
* begrenzte Scheduling-Parallelität

In Inferenz-Serving und Multi-Tenant-Mischbetrieb verstärken sich diese Probleme.

## DRA: Sprung im Ressourcenmodell

DRA (Dynamic Resource Allocation) ist ein bedeutendes Upgrade des Kubernetes-Ressourcenmodells:

* **Mehrdimensionales Modell** — über reine Menge hinaus
* **Vollständiger Device-Lifecycle** — Discovery bis Reclaim
* **Feinkörnige Allokation** — flexiblere Zusammensetzung

Strukturell:

> **Resource Requests wandern von Pod-Feldern zu unabhängigen ResourceClaim-Objekten.**

GPUs werden „First-Class Citizens“ wie Pods und PVCs.

## Realität: DRA ist komplex

Unbestrittene Fähigkeiten — aber **UX ist spürbar zurückgegangen.**

### Device Plugin

```yaml
resources:
  limits:
    nvidia.com/gpu: 1
```

### DRA

```yaml
spec:
  devices:
    requests:
    - exactly:
        allocationMode: ExactCount
        capacity:
          requests:
            memory: 4194304k
            count: 1
```

Plus CEL-Selector:

```
device.attributes["gpu.hami.io"].type == "hami-gpu"
```

> **DRA ist Capability-Upgrade, aber UX-Downgrade.**

Migration heißt nicht nur YAML umschreiben, sondern ein neues Deklarationsparadigma fürs ganze Team.

## HAMi-DRA: automatische Migration

HAMi verlangt nicht „DRA direkt nutzen“:

> **Device-Plugin-Syntax beibehalten — System konvertiert zu DRA.**

### Ablauf

Über **Mutating Webhook** bei Pod-Erstellung:

**Input** (Nutzer, Device Plugin):

```yaml
nvidia.com/gpu: 1
nvidia.com/gpumemory: 4000
```

**Webhook:**

* ResourceClaim-Objekte
* CEL-Selectors
* Device-Constraints (UUID / GPU-Typ)

**Output** (intern):

* Standard-DRA-Objekte
* Scheduler-fähige Ausdrücke

> **DRA von „Experten-API“ zu nutzbarer Oberfläche für alle.**

Kein ResourceClaim/CEL-Wissen nötig — weiter `nvidia.com/gpu` schreiben.

## DRA Driver: mehr als Registrierung

Vollständiges Device-Lifecycle-Management:

### Drei Kern-Interfaces

* **Publish Resources**
* **Prepare Resources** (libvgpu.so, ld.so.preload, Env, Temp-Dirs)
* **Unprepare Resources**

> **GPU-Scheduling erreicht die Runtime-Orchestrierungsschicht.**

Nach Scheduler-Match folgen Initialisierung und Runtime-Injection, bevor der Pod läuft.

## Performance: messbar, nicht nur eleganter

* HAMi (klassisch): Peak ~42.000
* HAMi-DRA: deutlich reduziert (~30 %+)

Durch **Pre-Binding** in der Scheduling-Phase — weniger Konflikte und Retries.

## Observability-Paradigmenwechsel

### Klassisch

* Ressourcen vom Node
* Nutzung vom Pod
* Aggregation und Inferenz nötig

### DRA

* ResourceSlice = Inventar
* ResourceClaim = Allokation
* **Ressourcenperspektive first-class**

> **Von Inferenz zu direktem Modell.**

Ops sehen in ResourceClaims, wer welche GPU mit wie viel Memory belegt.

## Einheitliches Modell: Zukunft heterogener Devices

Standardisierte Attribute ermöglichen **vendor-agnostisches Scheduling** — PCIe, Bus-ID, Core-Attribute.

> **DRA als Startpunkt für heterogene Compute-Abstraktion.**

Ascend, Cambricon, AMD u. a. über ein Attributmodell — Cross-Vendor ohne separate Scheduler-Logik pro Hersteller.

## Trend: Kubernetes als KI-Control-Plane

* von „Maschinen“ zu „Ressourcenobjekten“ schedulen
* von „Device“ zu „virtueller Ressource“
* von imperativ zu deklarativ

> **Kubernetes wird zur Control Plane der KI-Infrastruktur.**

## HAMis Positionierung

> **Die GPU-Ressourcenschicht für Kubernetes.**

* **unten**: heterogene GPUs
* **oben**: AI-Workloads (Training / Inferenz / Agent)
* **dazwischen**: Scheduling + Virtualisierung + Abstraktion

HAMi-DRA richtet diese Schicht am nativen Kubernetes-Modell aus.

## Abschluss

Wert der Session: nicht nur DRA vorstellen, sondern:

> **Wie macht man ein „richtiges, aber schwer nutzbares“ Modell heute nutzbar?**

HAMi-DRAs Antwort:

* **Gewohnheiten nicht ändern**
* **DRA unten absorbieren**
* **Komplexität intern** (Webhooks, Driver, Lifecycle)

Community-getrieben, nicht geschlossen — Validierung in Produktion, geteilt mit allen.

Interesse an HAMi-DRA oder GPU-Scheduling? Willkommen in der HAMi-Community.