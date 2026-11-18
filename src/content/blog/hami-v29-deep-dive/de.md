---
title: "HAMi v2.9.0 Deep Dive: Ascend-Partitionierung im Userspace, produktionsreifes DRA und Ausbau des Scheduling-Ökosystems"
coverTitle: HAMi v2.9.0 Deep Dive
date: '2026-05-11'
excerpt: >-
  HAMi v2.9.0 ist offiziell erschienen! Ascend-910C-Userspace-Virtualisierung (HAMi-core-Modus) ermöglicht feingranulares Speicher- und Compute-Sharing, HAMi-DRA erreicht Produktionsreife auf Basis der Kubernetes-DRA-Standards, Vastai-Geräteunterstützung kommt hinzu, Sicherheit und Observability werden umfassend gestärkt.
author: Dynamia AI Team
tags:
  - HAMi
  - GPU Sharing
  - vGPU
  - Kubernetes
  - DRA
  - Ascend
  - HAMi-core
  - Heterogenes Computing
  - Release
category: Product Release
linktitle: HAMi v2.9.0 Release Deep Dive
---

**HAMi v2.9.0** ist offiziell erschienen! Seit v2.8 hat das Projekt bei **Tiefe der heterogenen Gerätevirtualisierung, Kubernetes-nativen Standards und Ausbau des Scheduler-Ökosystems** deutlich zugelegt. v2.9 bringt systematische Verbesserungen bei **Ascend-Userspace-Partitionierung, produktionsreifem DRA, einsteckbarer Scheduler-Integration sowie Observability und Sicherheit** — HAMi entwickelt sich vom „GPU-Sharing-Tool“ zur **einheitlichen Infrastrukturplattform für Management und Scheduling heterogener Rechenressourcen**.

## Highlights auf einen Blick

Die wichtigsten Neuerungen in v2.9:

1. **Ascend-910C-Userspace-Virtualisierung:** HAMi-core-Modus mit LD_PRELOAD-basiertem Userspace-Intercept ermöglicht feingranulares Speicher- und Compute-Sharing ohne Codeänderung — in der Produktion der China Merchants Bank validiert.
2. **HAMi-DRA produktionsreif:** Die eigenständige Kubernetes-DRA-Implementierung HAMi-DRA steht auf v0.2.0 und ist produktionsreif für NVIDIA, Ascend und Enflame.
3. **Sicherheit und Stabilität:** DoS-Schutz in Scheduler-Routen, NodeLock mit Exponential Backoff, Resource-Quota-Prüfung im Webhook sowie Fixes für kritische Produktionsprobleme.
4. **Mehr heterogene Geräte:** Unterstützung für Vastai (Hanbo Semiconductor) erweitert das Ökosystem für heterogenes Computing.

## Ascend-910C-Userspace-Partitionierung — HAMi-core-Modus (Schlüsselfeature)

Der Huawei Ascend 910C zählt zu den zentralen heimischen KI-Beschleunigern. In Produktion stellt sich oft: **Wie teilen mehrere Inferenz- oder Training-Tasks eine Ascend-Karte?**

Klassische Geräteverwaltung kennt zwei Extreme:

- **Exklusivmodus**: Ein Pod belegt die ganze Karte — sehr niedrige Auslastung
- **SR-IOV-Hardwarepartitionierung**: Braucht spezielle Hardware, feste Granularität, wenig Flexibilität

HAMi v2.9.0 bringt den **HAMi-core-Modus**: softwareseitige Userspace-Partitionierung von Speicher und Compute ohne Codeänderung und ohne Spezialhardware — das wichtigste Feature dieses Releases.

### Warum Userspace-Partitionierung?

Vor HAMi-core basierte Ascend-Sharing vor allem auf SR-IOV mit grundlegenden Einschränkungen:

- **Grobe Granularität**: SR-IOV teilt die Karte in feste Virtual Functions (VFs), meist nur feste Verhältnisse wie 1/2 oder 1/4 der Karte
- **Unflexibel**: Verhältnisse sind in Hardware festgelegt und lassen sich nicht dynamisch an Workloads anpassen
- **Hardwareabhängigkeit**: Nicht alle Ascend-Versionen unterstützen SR-IOV; Firmware-Abstimmung nötig

HAMi-core ändert das: per Software-Intercept und -Steuerung von ACL-Aufrufen im Userspace entsteht **MB-genaue Speicher- und prozentuale Compute-Partitionierung**. Eine Ascend 910C kann parallel mehrere Tasks unterschiedlicher Spezifikation bedienen.

### Technische Architektur

Funktionsweise von HAMi-core:

1. **LD_PRELOAD-Intercept**: Beim Containerstart wird per `LD_PRELOAD` eine Intercept-Bibliothek geladen und fängt ACL-Aufrufe (Ascend Computing Language) ab
2. **Speicher-Isolation**: Speicher pro Pod strikt auf das deklarierte Kontingent begrenzt (**MB-Granularität**), ein Task kann nicht die ganze Karte ausschöpfen
3. **Compute-Drosselung**: ACL-Compute-Aufrufe werden per Zeitscheiben-Round-Robin nach deklariertem Compute-Kontingent geplant — fairer Ressourcenzugang
4. **Passthrough**: Aufrufe innerhalb des Kontingents gehen direkt an den Treiber — nahezu native Performance

### Vergleich der Partitionierungsgranularität

HAMi-core im Vergleich zu klassischen Ansätzen:

| Dimension | Exklusivmodus | SR-IOV | HAMi-core (v2.9) |
|-|-|-|-|
| Speicherpartitionierung | Nicht partitionierbar | Feste VF-Zuweisung | **MB-genaue Steuerung** |
| Compute-Partitionierung | Nicht partitionierbar | Proportional pro VF | **Flexible Prozent-Konfiguration** |
| Anzahl Partitionen | 1 Pod/Karte | meist 2–4 VF/Karte | **10+ Pods/Karte** |
| Hardware-Support nötig | Nein | Ja | **Nein** |
| Codeänderung nötig | Nein | Nein | **Nein** |
| Dynamische Anpassung | Nicht unterstützt | Nicht unterstützt | **Unterstützt** |

Beispiel: eine 64-GB-Ascend-910C lässt sich so auf mehrere Tasks verteilen:

```yaml
# Task 1: Große Modell-Inferenz, 32 GB Speicher + 50 % Compute
resources:
  limits:
    hami.io/vnpu-core: "50"
    hami.io/vnpu-core-memory: "32768"  # 32GB = 32768MB
```

```yaml
# Task 2: Modell-Fine-Tuning, 16 GB Speicher + 30 % Compute
resources:
  limits:
    hami.io/vnpu-core: "30"
    hami.io/vnpu-core-memory: "16384"  # 16GB = 16384MB
```

```yaml
# Task 3: Leichte Inferenz, 8 GB Speicher + 20 % Compute
resources:
  limits:
    hami.io/vnpu-core: "20"
    hami.io/vnpu-core-memory: "8192"  # 8GB = 8192MB
```

### Kernfunktionen

**Ascend-910C-SuperPod-Unterstützung**

In SuperPod-Umgebungen implementiert HAMi **Ressourcenzuweisung auf module-pair-Ebene**. Bei verteiltem Training verbinden mehrere Ascend-Chips über HCCS/RoCE Super-Nodes — HAMi erkennt und verwaltet diese Topologie.

**vNPU-Core-Virtualisierung**

Der neue Ressourcentyp `hami-vnpu-core` ermöglicht flexiblere Compute-Partitionierung:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: ascend-inference
  annotations:
    hami.io/vnpu-core: "ascend910c"
spec:
  containers:
    - name: inference
      image: ascend-inference:latest
      resources:
        limits:
          hami.io/vnpu-core: "1"
          hami.io/vnpu-core-memory: "16384"
```

Knotenfilter per Annotation und Multi-Device-Anfragen:

```yaml
# Knotenfilter: nur auf Knoten mit bestimmten Annotationen schedulen
metadata:
  annotations:
    hami.io/vnpu-core-node-filter: "ascend910c-module-0"
```

### HAMi-core aktivieren

In den Helm-Values `ascend.hamiVnpuCore` auf `true` setzen:

```yaml
# values.yaml
ascend:
  hamiVnpuCore: true
```

Alternativ pro Knoten in der `ascend-device-plugin`-Konfiguration — Teilaktivierung im selben Cluster möglich.

> **Wichtig:** In v2.9 müssen Pods `huawei.com/vnpu-mode: 'hami-core'` in den Annotationen setzen, um HAMi-core zu nutzen:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: ascend-inference
  annotations:
    huawei.com/vnpu-mode: "hami-core"
spec:
  containers:
    - name: inference
      image: ascend-inference:latest
      resources:
        limits:
          hami.io/vnpu-core: "1"
          hami.io/vnpu-core-memory: "16384"
```

Ohne diese Annotation gilt weiter das template-basierte vNPU-Partitioning. Ohne passenden Knoten bleibt der Task pending.

### Produktionsvalidierung

Das Feature wurde in der **Produktion der China Merchants Bank** validiert. Mit HAMi-vNPU-Core-Soft-Partitioning erreichte die Bank 100 % Pooling der Ascend-910C-Compute-Leistung und leistungsfähige Kommunikation für große Modelle — deutlich höhere Auslastung.

Dank an Huawei Cloud Canada Lab und China Merchants Bank [@ashergaga](https://github.com/ashergaga) für Beiträge zu diesem Feature.

Dieses Release aktualisiert auch die [HAMi-core-Benchmark-Daten](https://github.com/Project-HAMi/HAMi/blob/master/docs/benchmark_cn.md). Details zum Benchmark-Ablauf: [Projektdokumentation](https://github.com/Project-HAMi/HAMi/tree/master/benchmarks).

## HAMi-DRA — leichtgewichtiges HAMi auf Kubernetes-Standards

In HAMi v2.9.0 ist **HAMi-DRA** offiziell produktionsreif. HAMi-DRA ist eine eigenständige Implementierung nach **Dynamic Resource Assignment (DRA)** — positioniert als „leichtgewichtiges HAMi“.

### Vom Device Plugin zu DRA

DRA ist der von der Kubernetes-Community vorangetriebene nächste Mechanismus für Geräteressourcen. Das klassische Device-Plugin-Modell hat Grenzen:

1. **Starre Ressourcendeklaration:** Geräte nur über `limits[nvidia.com/gpu]` — keine Trennung von Speicher/Compute oder Topologie-Anforderungen
2. **Verteilte Scheduling-Logik:** Jedes Plugin eigene Logik — einheitliches Management schwer
3. **Schwierige Ressourcenkomposition:** Keine zusammengesetzten Anforderungen wie „mehrere GPUs mit definierter Topologie“

DRA standardisiert Deklaration, Zuweisung und Management über APIs wie `ResourceClaim` und `DeviceClass`.

![Device Plugin vs DRA Model Comparison](/images/blog/hami-v29-deep-dive/dra-device-plugin-comparison-en.png)

### Designphilosophie von HAMi-DRA

HAMi-DRA nutzt eine Mutating-Webhook-Architektur. Kern in drei Punkten:

1. **Gewohnheiten beibehalten:** weiter Device-Plugin-Syntax; unten automatische Umwandlung ins DRA-Modell
2. **Komplexität internalisieren:** Webhook, Driver und Lifecycle übernimmt das System
3. **Evolution durch Community:** Beiträge aus Unternehmen validieren Lösungen in echter Produktion

![HAMi-DRA Request Flow](/images/blog/hami-v29-deep-dive/hami-dra-flow-en.png)

### Plattformunterstützung

HAMi-DRA steht auf **v0.2.0** und unterstützt drei Hauptplattformen:

| Plattform | Virtualisierungsmethode | Status |
|-|-|-|
| NVIDIA | HAMi-core Time-Slicing + weiche Speichergrenzen | Produktionsreif |
| Ascend | vNPU-Core-Userspace-Partitionierung | Produktionsreif |
| Enflame | Compute-/Speicherpartitionierung | Produktionsreif |

Installation von HAMi-DRA:

**Voraussetzungen:**

- Kubernetes >= 1.34 mit aktiviertem DRA-Consumable-Capacity-Featuregate
- Container-Runtime mit aktiviertem CDI (Container Device Interface)
- NVIDIA-GPU-Treiber 440+
- cert-manager installiert

```bash
# Repository klonen und installieren
git clone https://github.com/Project-HAMi/HAMi-DRA.git
cd HAMi-DRA
helm install hami-dra ./charts/hami-dra

# Ohne containerd-Treiber des gpu-operator:
helm install hami-dra ./charts/hami-dra --set drivers.nvidia.containerDriver=false

# Ohne Monitoring-Komponenten:
helm install hami-dra ./charts/hami-dra --set monitor.enabled=false
```

Nach der Installation gilt dieselbe Nutzung wie bei HAMi.

Workloads einreichen (automatische Umwandlung von Device-Plugin-Syntax):

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: gpu-inference
  annotations:
    hami.io/gpu-memory: "4096"
    hami.io/gpu-core: "50"
spec:
  containers:
    - name: inference
      image: pytorch:latest
      resources:
        limits:
          nvidia.com/gpu: "1"
```

**HAMi-DRA-Projekt:** [https://github.com/Project-HAMi/HAMi-DRA](https://github.com/Project-HAMi/HAMi-DRA)

## Volcano vGPU auf v0.19 + CDI

HAMi v2.9.0 synchronisiert das eingebaute Volcano-vGPU-Device-Plugin auf **v0.19** — im Einklang mit Volcano-Upstream.

**CDI-Modus**

Container Device Interface (CDI) ist die standardisierte Geräteinjektion laut CNCF-CDI-Spezifikation. Im Vergleich zu klassischen Ansätzen:

| Dimension | Klassischer Ansatz | CDI-Ansatz |
|-|-|-|
| Geräteinjektion | Manuelle /dev-Mounts, Umgebungsvariablen | Deklarative CDI-Geräteliste |
| Runtime-Kopplung | Stark gekoppelt | Lose gekoppelt |
| Multi-Device | Manuelles Management | Automatische Aggregation |
| MIG | Komplexe Konfiguration | Standardisierte Deklaration |

CDI-Modus aktivieren:

```yaml
# values.yaml
devicePlugin:
  cdIEnabled: true
  nvidia:
    cdIEnabled: true
```

Das Upgrade **behebt MIG-Zuweisungsprobleme im CDI-Modus** und stärkt flexible NVIDIA-GPU-Partitionierung.

## Observability-Verbesserungen

v2.9.0 bringt mehrere Observability-Verbesserungen:

- vGPU Monitor: Parameter `--metrics-bind-address` für benutzerdefinierte Metrics-Adresse
- Helm Chart: Prometheus ServiceMonitor für Scheduler und Device Plugin
- Prometheus-Metriken und Labels an Community-Best-Practices angeglichen
- Neue Gerätetyp-Labels in Metriken
- Optimierte Log-Level-Steuerung mit Unit-Tests

```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: hami-scheduler
  namespace: hami-system
spec:
  selector:
    matchLabels:
      app.kubernetes.io/name: hami-scheduler
  endpoints:
    - port: metrics
      interval: 15s
```

## Sicherheit und Stabilität

### Sicherheitshärtung

**DoS-Schutz**

Scheduler-Routen nutzen `io.LimitReader` zur Begrenzung der HTTP-Request-Body-Größe — OOM durch große oder böswillige Requests wird vermieden.

**Resource-Quota-Prüfung im Webhook**

v2.9.0 prüft **Resource Quotas** im Webhook. GPU-Anfragen werden beim Pod-Einreichen gegen Quoten validiert — weniger Rollbacks nach dem Scheduling.

![Resource Quota Checking](/images/blog/hami-v29-deep-dive/webhook-quota-en.png)

### Kritische Bugfixes

v2.9.0 behebt mehrere kritische Produktionsprobleme:

| Problem | Auswirkung | Fix |
|-|-|-|
| NodeLock-Konflikte | Scheduling-Performance in großen Clustern | Exponential Backoff |
| Leader Election Nil Pointer | Gelegentliche Abstürze bei HA | Null-Check |
| Division durch Null im Score | Scoring-Anomalien | Sichere Division |
| Multi-Container-Pod-Gerätezuweisung | Konflikte bei Init-Containern | Lifecycle-bewusste Zuweisung |
| NVIDIA-Health-Check unter Kernel 6.17 | Handshake-Fehler | Randbedingungen behandeln |
| Globales Image-Tag | Komponenten-Tags ignoriert | Tag-Priorität korrigiert |
| Veralteter Deleted-Handshake | Scheduling-Unterbrechung | State-Bereinigung |
| Device-Filter wirkungslos | Filter-Config greift nicht | Filter-Logik-Fix |
| Annotation-Mismatch Plugin/Scheduler | Zuweisungsanomalien | Annotationen angeglichen |

## Ausbau des heterogenen Geräte-Ökosystems

### Neu: Vastai (Hanbo Semiconductor)

Vastai Technologies entwickelt universelle GPU-Chips für KI-Inferenz, Grafik, Video und mehr. HAMi v2.9.0 unterstützt Vastai und erweitert heterogenes Computing-Management.

#### Zwei Zuweisungsmodi

Vastai-Geräte kennen zwei Modi:

| Modus | Beschreibung | Einsatz |
|-|-|-|
| **Full-Card-Modus** | Jeder Pod exklusiv eine ganze GPU | Großes Modell-Training, performancekritische Inferenz |
| **Die-Modus** | Partitionierung nach Chip-Die, topology-aware Scheduling | Multi-Task-Sharing, bessere Auslastung |

Im Die-Modus kennt der Scheduler die AIC-Topologie (Accelerator Interface Card) und versucht, mehrere Anfragen eines Pods auf dieselbe AIC zu legen — weniger Cross-Die-Overhead.

#### Konfiguration und Nutzung

**Knoten labeln:**

Vor der HAMi-Installation Knoten mit Vastai-Geräten labeln:

```bash
kubectl label node <node-name> vastai=on
```

**Helm-Values:**

```yaml
vastai:
  enabled: true
  customresources:
    - vastaitech.com/va
```

**Beispiel Full-Card-Modus:**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: vastai-inference
spec:
  containers:
    - name: inference
      image: vastai-inference:latest
      resources:
        limits:
          vastaitech.com/va: "1"
```

**Beispiel Die-Modus:**

Geräteauswahl per Annotationen:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: vastai-die-inference
  annotations:
    vastaitech.com/use-va: "0"
    vastaitech.com/nouse-va: "1"
spec:
  containers:
    - name: inference
      image: vastai-inference:latest
      resources:
        limits:
          vastaitech.com/va: "2"
```

Mit Vastai deckt HAMi **NVIDIA, Huawei Ascend, Cambricon, Hygon DCU, Biren, Enflame, MetaX, Kunlunxin, AMD, Iluvatar, AWS Neuron** und **Vastai** ab — eines der breitesten heterogenen Virtualisierungs- und Scheduling-Projekte im Kubernetes-Ökosystem.

### DRA-Ökosystem-Allianz

DRA wird zum nächsten Gerätemanagement-Modell für Kubernetes, doch Herstellerseitig gibt es Unsicherheiten und Nutzerseitig hohe Einstiegshürden. Die HAMi-Community startete daher die **DRA Ecosystem Alliance** beim 3. HAMi Meetup in Shenzhen.

Ziele der DRA Ecosystem Alliance:

- **Hersteller und Nutzer verbinden** — DRA in realen Szenarien voranbringen
- **DRA-Standards weiterentwickeln** — Integrationskosten senken
- **Scheduling-Schicht vereinheitlichen**, Hardwareunterschiede abstrahieren — einheitliches heterogenes Computing

## Upgrade-Anleitung

Upgrade auf v2.9.0 per Helm:

```bash
helm repo add hami-charts https://project-hami.github.io/HAMi/
helm repo update
helm upgrade hami hami-charts/hami -n hami-system
```

Vollständige Installationsdokumentation: [https://project-hami.io/docs/usage/install](https://project-hami.io/docs/usage/install)

> **Hinweise zum Upgrade:**
>
> - Bei Volcano-vGPU CDI-bezogene Konfigurationsänderungen beachten
> - Für Ascend mit HAMi-core den Ascend-Abschnitt in der aktuellen Dokumentation lesen
> - Vor dem Upgrade Kompatibilität in einer Testumgebung prüfen

## Community-Updates

Im v2.9.0-Release-Zyklus blieb die HAMi-Community aktiv — technische Advocacy, Produkt-Ökosystem und Nutzerpraxis. Wichtige Entwicklungen:

### Community-Events

- **KubeCon EU 2026**: HAMi in Amsterdam als CNCF-Sandbox-Projekt — Project Pavilion und Keynote-Demo zu Kubernetes-GPU-Virtualisierung. [Rückblick](https://project-hami.io/blog/kubecon-eu-2026-recap)
- **KCD Beijing 2026**: über 1.000 Anmeldungen, Rekord für KCD Beijing. Vortrag: „From Device Plugin to DRA: GPU Scheduling Paradigm Upgrade and HAMi-DRA Practice.“ [Rückblick](https://project-hami.io/blog/kcd-beijing-2026-dra-gpu-scheduling)
- **3. HAMi Meetup Shenzhen**: Sieben Experten aus CNCF, SF Technology, China Merchants Bank, Enflame u. a. zur cloud-nativen Zukunft von KI-Computing. [Rückblick](https://project-hami.io/blog/hami-meetup-shenzhen-2026)
- **HAMi WebUI**: Open-Source-GPU-Dashboard [HAMi WebUI](https://github.com/Project-HAMi/HAMi-WebUI) v1.1.0 — gesamter GPU-Cluster in einer Oberfläche, geschlossener Kreislauf Scheduling bis Observability. [Blog](https://project-hami.io/blog/introducing-hami-webui)

### Website- und Dokumentations-Überarbeitung

Seit v2.8.0 die größte Umstrukturierung von Website und Doku in der Projektgeschichte — rund 195 PRs im Website-Repo, u. a.:

- **Website-Redesign**: Homepage, Architekturdiagramme, einheitlicher Blog-Stil, Mobile, Footer, eingebaute Suche statt externer Suche
- **Neue Doku**: GPU-Virtualisierungsprinzipien, Quick Start, Echtzeit-GPU-Monitoring, Upgrade/Deinstallation, HAMi-WebUI-Guides, Vastai-Doku
- **i18n**: fortlaufende CN/EN-Doku-Sync, lokalisierte Sidebar, mehrsprachige Ankündigungen
- **Community-Content**: neue Blogposts (KubeCon EU, KCD Beijing DRA, HAMi WebUI, Meetup Shenzhen); Adopter-Updates (Keike, NIO, SNOW Corp., Bovi Wisdom)
- **Qualität**: weniger Marketing-Sprache, Grammatik, Codeblock-Sprachlabels, Formatstandards, Contributor- und Governance-Doku

Dank an [@mesutoezdil](https://github.com/mesutoezdil) für Beiträge zur Optimierung der offiziellen HAMi-Dokumentation.

Website: [https://project-hami.io](https://project-hami.io)

### CNCF Case Studies

Immer mehr Unternehmen nutzen HAMi in Produktion für GPU-Virtualisierung und heterogenes Scheduling. Veröffentlichte CNCF-Case-Studies:

- **Keike Holdings**: KI-Computing-Plattform AIStudio mit Kubernetes + HAMi — GPU-Auslastung von 13 % auf 37 % (fast 3×), 10.000+ parallele Pods. [Vollständiger Artikel](https://www.cncf.io/case-studies/ke-holdings-inc/)
- **NIO**: Hybrid-GPU-Sharing für autonomes Fahren — CI-GPU-Auslastung ~10×, Simulations-GPU-Zeit ~30 % weniger, ~600 GPUs in Produktion. [Vollständiger Artikel](https://www.cncf.io/case-studies/nio/)
- **SNOW Corp.**: NAVER-Tochter mit 1.000+ A100 GPUs — GPU-Sharing mit HAMi für 700 %-Traffic-Spitzen, halbierte GPU-Bedarf, geschätzt 17,4 Mio. USD Ersparnis. [Vollständiger Artikel](https://www.cncf.io/case-studies/snow-corp/)

### Neue Contributors

Release v2.9.0 begrüßte **19 neue Contributors** aus verschiedenen Ländern und Organisationen:

[@maishivamhoo123](https://github.com/maishivamhoo123), [@hoteye](https://github.com/hoteye), [@jsl9208](https://github.com/jsl9208), [@ashergaga](https://github.com/ashergaga), [@Atroxgod](https://github.com/Atroxgod), [@MyoungHaSong](https://github.com/MyoungHaSong), [@charford](https://github.com/charford), [@jcustenborder](https://github.com/jcustenborder), [@Nov11](https://github.com/Nov11), [@ilia-medvedev](https://github.com/ilia-medvedev), [@Yonsun-w](https://github.com/Yonsun-w), [@CFH2436](https://github.com/CFH2436), [@kenwoodjw](https://github.com/kenwoodjw), [@anandj91](https://github.com/anandj91), [@ManishSharma1609](https://github.com/ManishSharma1609), [@maverick123123](https://github.com/maverick123123), [@almazkhalikov](https://github.com/almazkhalikov), [@lin121291](https://github.com/lin121291), [@mesutoezdil](https://github.com/mesutoezdil)

Danke an alle Contributors!

---

**Verwandte Links:**

- GitHub Release: [https://github.com/Project-HAMi/HAMi/releases/tag/v2.9.0](https://github.com/Project-HAMi/HAMi/releases/tag/v2.9.0)
- HAMi-DRA: [https://github.com/Project-HAMi/HAMi-DRA](https://github.com/Project-HAMi/HAMi-DRA)
- Volcano vGPU Device Plugin: [https://github.com/Project-HAMi/volcano-vgpu-device-plugin](https://github.com/Project-HAMi/volcano-vgpu-device-plugin)
- Projektdokumentation: [https://project-hami.io](https://project-hami.io)
- Community-Portal: [https://project-hami.io/community](https://project-hami.io/community)
- Community Discord (empfohlen): [https://discord.gg/Amhy7XmbNq](https://discord.gg/Amhy7XmbNq)
- Community CNCF Slack: [https://cloud-native.slack.com/archives/C08844T5WBQ](https://cloud-native.slack.com/archives/C08844T5WBQ)
