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

**HAMi v2.9.0** ist offiziell erschienen! Seit v2.8 hat das Projekt deutliche Fortschritte bei der **Tiefe der Virtualisierung heterogener Geräte, der Übernahme nativer Kubernetes-Standards und dem Ausbau des Scheduler-Ökosystems** gemacht. v2.9 bringt systematische Verbesserungen bei **Ascend-Partitionierung im Userspace, DRA-Produktionsreife, pluggbarer Scheduler-Integration sowie Observability und Sicherheit** und entwickelt HAMi von einem „GPU-Sharing-Werkzeug“ zu einer **einheitlichen Infrastrukturplattform für Management und Scheduling heterogenen Computings**.

## Highlights auf einen Blick

Die wichtigsten Features des v2.9-Releases:

1. **Ascend-910C-Userspace-Virtualisierung:** Einführung des HAMi-core-Modus mit LD_PRELOAD-basierter Userspace-Interzeption — feingranulares Speicher- und Compute-Sharing ohne Änderungen am Anwendungscode, validiert in der Produktionsumgebung der China Merchants Bank.
2. **HAMi-DRA produktionsreif:** HAMi-DRA, die unabhängige Implementierung auf Basis der Kubernetes-DRA-Standards, steigt auf v0.2.0 und erreicht offiziell Produktionsreife auf den Plattformen NVIDIA, Ascend und Enflame.
3. **Sicherheit und Stabilität:** Scheduler-Routen erhalten DoS-Schutz, NodeLock wird auf exponentielles Backoff optimiert, der Webhook prüft Resource Quotas; zudem werden mehrere kritische Stabilitätsprobleme in Produktion behoben.
4. **Breitere Abdeckung heterogener Geräte:** Neue Unterstützung für Vastai-Geräte (Hanbo Semiconductor) erweitert das Portfolio für heimisches heterogenes Computing-Management.

## Ascend-910C-Partitionierung im Userspace — HAMi-core-Modus (Schlüsselfeature)

Huawei Ascend 910C zählt zu den zentralen heimischen KI-Rechenchips. In Produktionsumgebungen steht Nutzerinnen und Nutzern seit Langem eine zentrale Frage gegenüber: **Wie können mehrere Inference-/Training-Aufgaben eine einzelne Ascend-Karte teilen?**

Herkömmliche Geräteverwaltung kennt zwei Extreme:

- **Exklusivmodus**: Ein Pod belegt die gesamte Karte — die Ressourcenauslastung bleibt extrem niedrig
- **SR-IOV-Hardware-Partitionierung**: Erfordert spezielle Hardwareunterstützung, feste Partitionierungsgranularität, zu wenig Flexibilität

HAMi v2.9.0 führt den **HAMi-core-Modus** ein und realisiert Soft-Partitionierung von Speicher und Compute im Userspace — ohne Änderungen am Anwendungscode und ohne spezielle Hardwarevoraussetzungen. Das ist das wichtigste Feature dieses Releases.

### Warum Partitionierung im Userspace?

Vor HAMi-core stützte sich Ascend-Geräte-Sharing vor allem auf SR-IOV-Hardware-Virtualisierung — mit mehreren grundlegenden Einschränkungen:

- **Grobe Granularität**: SR-IOV teilt eine physische Karte in feste Virtual Functions (VFs) und unterstützt typischerweise nur feste Anteile wie 1/2 oder 1/4 der gesamten Karte
- **Unflexibel**: Partitionierungsverhältnisse sind auf Hardwareebene vorgegeben und lassen sich nicht dynamisch an reale Workloads anpassen
- **Hardwareabhängigkeit**: Nicht alle Ascend-Hardwareversionen unterstützen SR-IOV; Firmware-Abstimmung ist erforderlich

HAMi-core verändert dieses Bild grundlegend: Durch reine Software-Interzeption und Verwaltung von ACL-Aufrufen im Userspace erreicht es **feingranulare Partitionierung auf MB-Ebene für Speicher und auf Prozent-Ebene für Compute**. Eine einzelne Ascend 910C kann gleichzeitig mehrere Inference- oder Training-Aufgaben mit unterschiedlichen Spezifikationen bedienen.

### Technische Architektur

So funktioniert HAMi-core:

1. **LD_PRELOAD-Interzeption**: Beim Start des Containers wird über `LD_PRELOAD` eine Interzeptionsbibliothek injiziert, die Aufrufe der Anwendung an die Ascend Computing Language (ACL) abfängt
2. **Speicherisolation**: Die Speicherzuweisung jedes Pods wird streng auf das deklarierte Kontingent mit **MB-Granularität** begrenzt — eine Aufgabe kann den gesamten Kartenspeicher nicht mehr erschöpfen
3. **Compute-Throttling**: Auf Basis des deklarierten Compute-Kontingents des Pods werden ACL-Compute-Aufrufe per Time-Slice-Round-Robin geplant, sodass alle Aufgaben fairen Zugang zu Compute-Ressourcen erhalten
4. **Passthrough-Ausführung**: Aufrufe innerhalb der Kontingentgrenzen gehen ohne zusätzliche Latenz direkt an den Hardwaretreiber — Performance nahe am Native-Niveau

### Vergleich der Partitionierungsgranularität

Vergleich von HAMi-core mit herkömmlichen Ansätzen:

| Dimension | Exklusivmodus | SR-IOV | HAMi-core (v2.9) |
|-|-|-|-|
| Speicherpartitionierung | Nicht partitionierbar | Feste Zuteilung je VF | **Präzise Steuerung auf MB-Ebene** |
| Compute-Partitionierung | Nicht partitionierbar | Proportional je VF | **Flexible Konfiguration auf Prozent-Ebene** |
| Anzahl Partitionen | 1 Pod/Karte | Üblicherweise 2–4 VF/Karte | **10+ Pods/Karte** |
| Hardwareunterstützung nötig | Nein | Ja | **Nein** |
| Änderungen am Anwendungscode nötig | Nein | Nein | **Nein** |
| Dynamische Anpassung | Nicht unterstützt | Nicht unterstützt | **Unterstützt** |

Beispielsweise lässt sich eine Ascend 910C mit 64 GB wie folgt auf mehrere Aufgaben verteilen:

```yaml
# Task 1: Large model inference, 32GB memory + 50% compute
resources:
  limits:
    hami.io/vnpu-core: "50"
    hami.io/vnpu-core-memory: "32768"  # 32GB = 32768MB
```

```yaml
# Task 2: Model fine-tuning, 16GB memory + 30% compute
resources:
  limits:
    hami.io/vnpu-core: "30"
    hami.io/vnpu-core-memory: "16384"  # 16GB = 16384MB
```

```yaml
# Task 3: Lightweight inference, 8GB memory + 20% compute
resources:
  limits:
    hami.io/vnpu-core: "20"
    hami.io/vnpu-core-memory: "8192"  # 8GB = 8192MB
```

### Kernfähigkeiten

**Unterstützung für Ascend-910C-SuperPod**

Für SuperPod-Umgebungen implementiert HAMi Ressourcenallokation auf **Module-Pair-Ebene**. In verteilten Trainingsszenarien werden mehrere Ascend-Chips über HCCS/RoCE zu Superknoten verbunden. HAMi kann diese Topologie erkennen und verwalten und so die Hardwarevorteile von Superknoten voll ausschöpfen.

**vNPU-Core-Virtualisierung**

Ein neuer Ressourcentyp `hami-vnpu-core` unterstützt flexiblere Strategien zur Compute-Partitionierung:

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

Annotation-basiertes Node-Filtering und Multi-Device-Anfragen:

```yaml
# Node filtering: Only schedule on nodes with specific annotations
metadata:
  annotations:
    hami.io/vnpu-core-node-filter: "ascend910c-module-0"
```

### HAMi-core aktivieren

Setzen Sie `ascend.hamiVnpuCore` in den Helm-Values auf `true`, um dieses Feature zu aktivieren:

```yaml
# values.yaml
ascend:
  hamiVnpuCore: true
```

Es lässt sich auch einzeln in der Node-Konfiguration von `ascend-device-plugin` einschalten — so ist eine teilweise Aktivierung innerhalb desselben Clusters möglich.

> **Wichtig:** In v2.9 müssen Pods in den Annotations explizit `huawei.com/vnpu-mode: 'hami-core'` deklarieren, um den HAMi-core-Modus zu nutzen:

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

Pods ohne diese Annotation nutzen weiterhin die legacy template-basierte vNPU-Partitionierung. Fehlen geeignete Nodes, bleibt die Aufgabe im Pending-Zustand.

### Produktionsvalidierung

Dieses Feature wurde in der Produktionsumgebung der **China Merchants Bank** validiert. Auf Basis der Soft-Partitionierung mit HAMi-vNPU-Core erreichte die China Merchants Bank eine 100-prozentige Ressourcen-Poolbildung der Ascend-910C-Rechenleistung sowie Hochleistungskommunikation für große Modelle und steigerte die Auslastung heimischer Rechenressourcen deutlich.

Dank an das Huawei Cloud Canada Lab und die China Merchants Bank [@ashergaga](https://github.com/ashergaga) für die Beiträge zu diesem Feature.

Dieses Release aktualisiert zudem die [HAMi-core-Performance-Benchmark-Daten](https://github.com/Project-HAMi/HAMi/blob/master/docs/benchmark_cn.md). Detaillierte Benchmark-Abläufe finden Sie in der [Projektdokumentation](https://github.com/Project-HAMi/HAMi/tree/master/benchmarks).

## HAMi-DRA — leichtgewichtiges HAMi auf Basis von Kubernetes-Standards

In HAMi v2.9.0 erreicht **HAMi-DRA** offiziell Produktionsreife. HAMi-DRA ist ein unabhängiges Implementierungsprojekt auf Basis der Kubernetes-Standards für **Dynamic Resource Allocation (DRA)** und positioniert sich als „leichtgewichtiges HAMi“.

### Vom Device Plugin zu DRA

DRA ist der von der Kubernetes-Community vorangetriebene Mechanismus der nächsten Generation zur Deklaration und Zuweisung von Geräteressourcen. Das klassische Device-Plugin-Modell hat folgende Grenzen:

1. **Unflexible Ressourcendeklaration:** Geräteressourcen werden über `limits[nvidia.com/gpu]` hart kodiert und können komplexe Anforderungen wie getrennten Speicher/Compute oder Topologie-Constraints nicht ausdrücken
2. **Verstreute Scheduling-Logik:** Jedes Device Plugin muss eigene Scheduling-Logik implementieren — einheitliches Management wird schwierig
3. **Schwierige Ressourcenkomposition:** Zusammengesetzte Anforderungen wie „mehrere GPUs mit bestimmter Topologie“ lassen sich nicht ausdrücken

DRA standardisiert Deklaration, Zuweisung und Verwaltung von Geräteressourcen durch neue APIs wie `ResourceClaim` und `DeviceClass`.

![Vergleich Device-Plugin- und DRA-Modell](/images/blog/hami-v29-deep-dive/dra-device-plugin-comparison-en.png)

### Designphilosophie von HAMi-DRA

HAMi-DRA setzt auf eine Mutating-Webhook-Architektur. Die Kernphilosophie lässt sich in drei Punkten zusammenfassen:

1. **Nutzergewohnheiten nicht ändern:** Weiterhin Device-Plugin-Syntax verwenden, darunter automatisch in DRA-Ressourcenmodelle umwandeln
2. **Komplexität internalisieren:** Webhook, Driver und Lifecycle-Management übernimmt das System
3. **Evolution durch Community-Zusammenarbeit vorantreiben:** Mitwirkende aus unterschiedlichen Unternehmen validieren Lösungen in realen Produktionsumgebungen

![HAMi-DRA-Anfragefluss](/images/blog/hami-v29-deep-dive/hami-dra-flow-en.png)

### Plattformunterstützung

HAMi-DRA ist auf **v0.2.0** gestiegen und unterstützt drei große Plattformen:

| Plattform | Virtualisierungsmethode | Status |
|-|-|-|
| NVIDIA | HAMi-core Time-Slicing + Soft-Limits für Speicher | Produktionsreif |
| Ascend | vNPU-Core-Userspace-Partitionierung | Produktionsreif |
| Enflame | Compute-/Speicherpartitionierung | Produktionsreif |

HAMi-DRA installieren:

**Voraussetzungen:**

- Kubernetes >= 1.34 mit aktiviertem Featuregate DRA Consumable Capacity
- Container-Runtime mit aktiviertem CDI (Container Device Interface)
- NVIDIA GPU Driver 440+
- cert-manager installiert

```bash
# Clone the repository and install
git clone https://github.com/Project-HAMi/HAMi-DRA.git
cd HAMi-DRA
helm install hami-dra ./charts/hami-dra

# If not using gpu-operator's containerd driver:
helm install hami-dra ./charts/hami-dra --set drivers.nvidia.containerDriver=false

# If monitoring components are not needed:
helm install hami-dra ./charts/hami-dra --set monitor.enabled=false
```

Nach der Installation ist die Nutzung identisch mit HAMi.

Workloads einreichen (automatische Umwandlung aus der Device-Plugin-Syntax):

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

## Volcano vGPU auf v0.19 + CDI aktualisiert

HAMi v2.9.0 synchronisiert das integrierte Volcano-vGPU-Device-Plugin auf **v0.19** und bleibt damit konsistent mit dem Volcano-Upstream.

**CDI-Modus-Unterstützung**

Container Device Interface (CDI) ist die von der CNCF-CDI-Spezifikation definierte Standard-Schnittstelle zur Geräteinjektion für Container-Runtimes. Im Vergleich zu herkömmlichen Ansätzen:

| Dimension | Herkömmlicher Ansatz | CDI-Ansatz |
|-|-|-|
| Geräteinjektion | Manuelle /dev-Mounts, Umgebungsvariablen | Deklarative CDI-Geräteliste |
| Runtime-Kopplung | Eng gekoppelt | Lose gekoppelt |
| Multi-Device-Unterstützung | Manuelle Verwaltung nötig | Automatische Aggregation |
| MIG-Unterstützung | Komplexe Konfigurationsverwaltung | Standardisierte Deklaration |

CDI-Modus aktivieren:

```yaml
# values.yaml
devicePlugin:
  cdIEnabled: true
  nvidia:
    cdIEnabled: true
```

Dieses Upgrade **behebt außerdem MIG-Allokationsprobleme im CDI-Modus** und stärkt die flexible Partitionierung von NVIDIA-GPUs weiter.

## Observability-Verbesserungen

v2.9.0 bringt mehrere Observability-Verbesserungen:

- vGPU Monitor erhält den Parameter `--metrics-bind-address` für eine benutzerdefinierte Metrics-Expose-Adresse
- Helm Chart ergänzt einen Prometheus ServiceMonitor für Scheduler und Device Plugin
- Prometheus-Metriken und Label-Benennung an Community-Best-Practices angeglichen
- Neue Unterstützung für Device-Type-Labels in Metriken
- Optimierte Log-Level-Steuerung inklusive zugehöriger Unit Tests

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

### Sicherheitsabsicherung

**DoS-Schutz**

Scheduler-Routen nutzen `io.LimitReader`, um die Größe des HTTP-Request-Body zu begrenzen und OOM durch böswillige oder anomal große Request Bodies zu verhindern.

**Resource-Quota-Prüfung im Webhook**

v2.9.0 ergänzt im Webhook die Fähigkeit zur **Resource-Quota-Prüfung**. GPU-Ressourcenanfragen lassen sich bereits bei der Pod-Einreichung gegen Quota-Limits validieren — Rollbacks nach dem Scheduling entfallen, die Scheduling-Effizienz steigt insgesamt.

![Resource-Quota-Prüfung](/images/blog/hami-v29-deep-dive/webhook-quota-en.png)

### Kritische Bugfixes

v2.9.0 behebt mehrere kritische Probleme, die die Produktionsstabilität betreffen:

| Problem | Auswirkung | Fix |
|-|-|-|
| NodeLock-Contention | Scheduling-Performance-Einbußen in großen Clustern | Exponentielle Backoff-Strategie |
| Nil-Pointer bei Leader Election | Gelegentliche Crashes in HA-Deployments | Null-Check |
| Division durch null bei Scheduler-Score | Scoring-Anomalien | Sichere Division |
| Geräteallokation bei Multi-Container-Pods | Konflikte bei Init-Container-Geräteallokation | Lifecycle-bewusste Allokation |
| NVIDIA-Health-Check unter Kernel 6.17 | Handshake-Fehler bei GPU-Statusprüfung | Behandlung von Grenzbedingungen |
| Globales Überschreiben von Image-Tags | Komponenten-Image-Tags ignoriert | Korrektur der Tag-Priorität |
| Veralteter Deleted-Handshake | Unterbrechung des Node-Schedulings | Zustandsbereinigung |
| Unwirksamer Device Filter | filter-device-Konfiguration wirkungslos | Korrektur der Filterlogik |
| Annotation-Mismatch Device Plugin/Scheduler | Anomalien bei Geräteallokation | Annotation-Angleichung |

## Ausbau des Ökosystems heterogener Geräte

### Neue Unterstützung für Vastai-Geräte (Hanbo Semiconductor)

Vastai Technologies ist ein führendes heimisches Designunternehmen für General-Purpose-GPU-Chips; die Chips kommen breit in KI-Inference, Grafikrendering, Videoverarbeitung und weiteren Szenarien zum Einsatz. HAMi v2.9.0 ergänzt die Unterstützung für Vastai-Geräte und erweitert das heterogene Computing-Management von HAMi weiter in den heimischen GPU-Bereich.

#### Zwei Allokationsmodi

Vastai-Geräte unterstützen zwei Ressourcenallokationsmodi:

| Modus | Beschreibung | Einsatzszenario |
|-|-|-|
| **Full-Card-Modus** | Jeder Pod belegt exklusiv eine gesamte GPU | Training großer Modelle, performance-sensitive Inference |
| **Die-Modus** | Partitionierung nach Chip-Die, topologiebewusstes Scheduling | Multi-Task-Sharing, Optimierung der Ressourcenauslastung |

Im Die-Modus kennt der Scheduler die AIC-Topologie (Accelerator Interface Card) und versucht, mehrere vom selben Pod angeforderte Ressourcen derselben AIC zuzuweisen — so sinkt der Kommunikationsoverhead über Die-Grenzen hinweg.

#### Konfiguration und Nutzung

**Node-Labeling:**

Vor der HAMi-Installation Nodes mit Vastai-Geräten labeln:

```bash
kubectl label node <node-name> vastai=on
```

**Helm-Values-Konfiguration:**

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

Geräteauswahlstrategie über Annotations festlegen:

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

Mit Vastai-Geräteunterstützung deckt HAMi nun **NVIDIA, Huawei Ascend, Cambricon, Hygon DCU, Biren, Enflame, MetaX, Kunlunxin, AMD, Iluvatar, AWS Neuron** und **Vastai** ab — mehr als ein Dutzend heterogener Computing-Geräte und damit eines der am breitesten abdeckenden Projekte für Virtualisierung und Scheduling heterogener Geräte im Kubernetes-Ökosystem.

### DRA Ecosystem Alliance

DRA entwickelt sich zum Geräteverwaltungsmodell der nächsten Generation für Kubernetes — auf Herstellerseite bleiben Implementierungsunsicherheiten, auf Nutzerseite hohe Einstiegshürden. Deshalb hat die HAMi-Community beim 3. HAMi Meetup in Shenzhen den Start der **DRA Ecosystem Alliance** angekündigt.

Ziele der DRA Ecosystem Alliance:

- **Gerätehersteller und Nutzer verbinden**, um die DRA-Adoption in realen Szenarien voranzutreiben
- **Evolution der DRA-Standards fördern**, um den Engineering-Aufwand für die Integration heterogener Geräte zu senken
- **Scheduling-Schicht vereinheitlichen und Hardwareunterschiede abstrahieren**, für einheitliches Management heterogenen Computings

## Upgrade-Leitfaden

Upgrade auf v2.9.0 per Helm:

```bash
helm repo add hami-charts https://project-hami.github.io/HAMi/
helm repo update
helm upgrade hami hami-charts/hami -n hami-system
```

Vollständige Installationsdokumentation: [https://project-hami.io/docs/usage/install](https://project-hami.io/docs/usage/install)

> **Hinweise zum Upgrade:**
>
> - Bei Nutzung des Volcano-vGPU-Modus CDI-bezogene Konfigurationsänderungen beachten
> - Bei Ascend-Geräten und gewünschter Aktivierung des HAMi-core-Modus den Ascend-Konfigurationsabschnitt in der aktuellen Dokumentation konsultieren
> - Kompatibilität vor dem Upgrade idealerweise in einer Testumgebung prüfen

## Community-Updates

Im Release-Zyklus von v2.9.0 blieb die HAMi-Community in technischer Advocacy, Produktökosystem und Nutzerpraxis aktiv. Hier die bemerkenswerten Community-Entwicklungen.

### Community-Events

- **KubeCon EU 2026**: HAMi war in Amsterdam als CNCF-Sandbox-Projekt vertreten, mit einem Stand im Project Pavilion und einer Keynote-Demo auf der Hauptbühne, um Entwicklerinnen und Entwicklern weltweit die neuesten Fortschritte bei Kubernetes-GPU-Virtualisierung zu zeigen. [Recap lesen](https://project-hami.io/blog/kubecon-eu-2026-recap)
- **KCD Beijing 2026**: Über 1.000 Anmeldungen und neuer Rekord für KCD Beijing. Die HAMi-Community war eingeladen, „From Device Plugin to DRA: GPU Scheduling Paradigm Upgrade and HAMi-DRA Practice“ zu teilen. [Recap lesen](https://project-hami.io/blog/kcd-beijing-2026-dra-gpu-scheduling)
- **3. HAMi Meetup Shenzhen**: Sieben Expertinnen und Experten von CNCF, SF Technology, China Merchants Bank, Enflame Technology und weiteren Organisationen teilten Einblicke in die Zukunft von AI Computing Cloud-Native. [Recap lesen](https://project-hami.io/blog/hami-meetup-shenzhen-2026)
- **Offizielle Veröffentlichung von HAMi WebUI**: Die HAMi-Community hat das Open-Source-GPU-Monitoring-Dashboard [HAMi WebUI](https://github.com/Project-HAMi/HAMi-WebUI) v1.1.0 veröffentlicht — der gesamte GPU-Cluster in einer visuellen Oberfläche, vom GPU-Scheduling bis zur visuellen Observability geschlossen. [Blogbeitrag lesen](https://project-hami.io/blog/introducing-hami-webui)

### Überarbeitung von Website und Dokumentation

Seit dem Release von v2.8.0 haben Website und Dokumentation von HAMi die größte Umstrukturierung in der Projektgeschichte durchlaufen. Rund 195 PRs wurden in das Website-Repository gemergt und decken folgende Schwerpunkte ab:

- **Website-Redesign**: Homepage-Neugestaltung, neu gezeichnete Architekturdiagramme, einheitliches Blog-Styling, Mobile-Optimierung, erweiterter Footer, Migration von externer Suche zur integrierten Suche
- **Neue Dokumentation**: Seite zu GPU-Virtualisierungsprinzipien, HAMi-Schnellstart, Leitfaden für Echtzeit-GPU-Monitoring, Upgrade- und Deinstallationsleitfaden, HAMi-WebUI-Nutzer- und Entwicklerleitfäden, Vastai-Gerätedokumentation
- **i18n-Sync**: Fortlaufende Angleichung chinesisch-englischer Dokumentation, Lokalisierung von Sidebar-Labels, mehrsprachige Announcement-Banner
- **Community-Inhalte**: Neue Blogbeiträge zu KubeCon EU 2026 Recap, KCD Beijing 2026 DRA-Sharing, HAMi-WebUI-Release, Meetup Shenzhen Recap; Aktualisierung der Adopter-Informationen zu Keike, NIO, SNOW Corp., Bovi Wisdom
- **Qualitätsgovernance**: Site-weite Entmarketingisierung der Texte, Grammatikkorrekturen, Sprachannotationen für Codeblöcke, Formatstandardisierung, Verbesserungen an Contributor Guide und Governance-Dokumentation

Dank an [@mesutoezdil](https://github.com/mesutoezdil) für Beiträge zur Optimierung der offiziellen HAMi-Dokumentation.

Website: [https://project-hami.io](https://project-hami.io)

### CNCF Case Studies

Immer mehr Unternehmen setzen HAMi in Produktionsumgebungen ein, um GPU-Virtualisierung und Scheduling für heterogenes Computing aufzubauen. Die folgenden Case Studies sind auf der CNCF-Website veröffentlicht:

- **Keike Holdings**: Aufbau der intelligenten Computing-Plattform AIStudio auf Basis von Kubernetes + HAMi — GPU-Auslastung von 13 % auf 37 % (nahezu 3×), Unterstützung von 10.000+ gleichzeitigen Pods, Verarbeitung von zig Millionen täglichen Business-Anfragen. [Vollständigen Artikel lesen](https://www.cncf.io/case-studies/ke-holdings-inc/)
- **NIO**: Hybrid-GPU-Sharing-Strategie mit HAMi für Autonomous-Driving-Workloads — GPU-Auslastung der CI-Pipeline um etwa 10× gesteigert, GPU-Zeit für Simulations-Workloads um etwa 30 % gesenkt, Produktionscluster mit etwa 600 GPUs. [Vollständigen Artikel lesen](https://www.cncf.io/case-studies/nio/)
- **SNOW Corp.**: Die NAVER-Tochter SNOW Corp. in Korea verwaltet 1.000+ A100-GPUs; durch GPU-Sharing mit HAMi werden Traffic-Spitzen von 700 % bewältigt, der GPU-Bedarf halbiert sich, geschätzte Einsparungen von 17,4 Mio. USD. [Vollständigen Artikel lesen](https://www.cncf.io/case-studies/snow-corp/)

### Neue Contributors

Das v2.9.0-Release begrüßte **19 neue Contributors** im HAMi-Projekt aus verschiedenen Ländern und Organisationen:

[@maishivamhoo123](https://github.com/maishivamhoo123), [@hoteye](https://github.com/hoteye), [@jsl9208](https://github.com/jsl9208), [@ashergaga](https://github.com/ashergaga), [@Atroxgod](https://github.com/Atroxgod), [@MyoungHaSong](https://github.com/MyoungHaSong), [@charford](https://github.com/charford), [@jcustenborder](https://github.com/jcustenborder), [@Nov11](https://github.com/Nov11), [@ilia-medvedev](https://github.com/ilia-medvedev), [@Yonsun-w](https://github.com/Yonsun-w), [@CFH2436](https://github.com/CFH2436), [@kenwoodjw](https://github.com/kenwoodjw), [@anandj91](https://github.com/anandj91), [@ManishSharma1609](https://github.com/ManishSharma1609), [@maverick123123](https://github.com/maverick123123), [@almazkhalikov](https://github.com/almazkhalikov), [@lin121291](https://github.com/lin121291), [@mesutoezdil](https://github.com/mesutoezdil)

Danke an alle Contributors!

---

**Weiterführende Links:**

- GitHub Release: [https://github.com/Project-HAMi/HAMi/releases/tag/v2.9.0](https://github.com/Project-HAMi/HAMi/releases/tag/v2.9.0)
- HAMi-DRA: [https://github.com/Project-HAMi/HAMi-DRA](https://github.com/Project-HAMi/HAMi-DRA)
- Volcano vGPU Device Plugin: [https://github.com/Project-HAMi/volcano-vgpu-device-plugin](https://github.com/Project-HAMi/volcano-vgpu-device-plugin)
- Projektdokumentation: [https://project-hami.io](https://project-hami.io)
- Community-Portal: [https://project-hami.io/community](https://project-hami.io/community)
- Community Discord (empfohlen): [https://discord.gg/Amhy7XmbNq](https://discord.gg/Amhy7XmbNq)
- Community CNCF Slack: [https://cloud-native.slack.com/archives/C08844T5WBQ](https://cloud-native.slack.com/archives/C08844T5WBQ)
