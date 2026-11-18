---
title: 'Wie heimische GPUs reibungslos in Kubernetes passen: Enflames Full-Stack-Cloud-Native-Praxis'
date: '2026-05-09'
excerpt: >-
  Enflames Ma Da skizziert einen cloud-nativen Integrationspfad für heimische GPUs im
  Kubernetes-Ökosystem — von GPU-Operator-Lifecycle und CDI-basierter Device-Injection bis zur
  Inference-Gateway-Architektur entlang des CNCF-Vier-Schichten-Stacks — über Discovery, Scheduling,
  Container-Zugriff, Observability und Inferenzoptimierung.
author: Dynamia
tags:
  - HAMi
  - Meetup
  - Enflame
  - GPU Operator
  - DRA
  - CDI
  - Cloud Native
  - Heimische GPU
category: Community & Events
coverImage: /images/blog/enflame-k8s-cloud-native-practice/speaker-mada.webp
linktitle: Enflame GPU Cloud-Native-Praxis
---

![Referent: Ma Da (Enflame)](/images/blog/enflame-k8s-cloud-native-practice/speaker-mada.webp)

> „Compete on Efficiency, Not Compute | HAMi Community Meetup“ in Shenzhen wurde von der HAMi-Community initiiert und von Dynamia ausgerichtet und fand am 25. April 2026 erfolgreich statt. Dieser Artikel ist der fünfte der Shenzhen-Recap-Serie. Ma Da von Enflame stellte einen cloud-nativen Integrationspfad für heimische GPUs im Kubernetes-Ökosystem vor — von GPU-Operator-Lifecycle und CDI-basierter Device-Injection bis zur Inference-Gateway-Architektur im CNCF-Vier-Schichten-Modell — Ende-zu-Ende über Device-Discovery, Ressourcen-Scheduling, Container-Zugriff, Observability und Inferenzoptimierung.

**Kernpunkte:**

- **1 CR verwaltet 7+ Kernkomponenten**; GPU Operator liefert deklaratives Full-Lifecycle-Management
- Device Plugin + DRA **Dual-Track-Scheduling**, reibungsloser Pfad von K8s 1.9 bis 1.34+
- CNCF-Standard **CDI** statt vendor-spezifischer Umgebungsvariablen — Ende fragmentierter Device-Injection
- Drei-Schichten-Exporter für Full-Stack-Observability; Sammlung alle 15 s, CPU-Overhead **< 1 %**
- Entwicklung eines GPU-**EPP-Plugins**, das Queue-Tiefe und KV-Trefferquote für intelligentes Inferenz-Routing bewertet

## Video-Replay und PPT-Download

- **Bilibili:** [Kubernetes Ecosystem and Enflame GPU Integration Practice — Ma Da](https://www.bilibili.com/video/BV1MfozBvEab/)
- **PPT herunterladen:** [kubernetes-gpu-operator-dra-cdi-enflame-mada.pdf](https://github.com/Project-HAMi/community/blob/main/hami-meetup/03-shenzhen-20260425/kubernetes-gpu-operator-dra-cdi-enflame-mada.pdf)

## 1. Kernherausforderungen der cloud-nativen Integration heimischer GPUs

Enflame-GPUs zählen zu den wichtigen heimischen KI-Beschleunigern. Training und Inferenz großer Modelle treiben Beschleuniger-Cluster von Dutzenden auf Tausende Karten; Kubernetes ist De-facto-Standard für KI-Infrastruktur. In K8s-Umgebungen stehen heimische GPUs jedoch vor noch härteren Herausforderungen als NVIDIA:

- **Geräte unsichtbar** — Scheduler sehen Modell, Speichergröße, Chip-Serie und andere Hardwareattribute nicht; präzises Scheduling ist schwer
- **Ressourcen schwer steuerbar** — Ohne standardisierte Discovery, Registrierung, Zuweisung und Freigabe ist Mischbetrieb heterogener Karten aufwendig
- **Betrieb komplex** — Treiber, Runtimes, Monitoring und 7+ weitere Komponenten erfordern viel manuelle Arbeit; Probleme multiplizieren sich mit Clusterwachstum
- **Ökosystem fragmentiert** — Herstelleransätze (Umgebungsvariablen, Injection, Partitionierung) unterscheiden sich; kein einheitlicher cloud-nativer Integrationspfad

**Ziel von Enflame:** Einen standardisierten cloud-nativen Integrationsansatz schaffen, damit sich heimische GPUs in Kubernetes so reibungslos verwalten lassen wie NVIDIA-GPUs.

## 2. GPU Operator: einheitliches Full-Lifecycle-Management

### Gesamtarchitektur

![Gesamtarchitektur des GPU Operator](/images/blog/enflame-k8s-cloud-native-practice/gpu-operator-architecture.webp)

Enflame nutzt den GPU Operator zur einheitlichen Verwaltung von **7+ Kernkomponenten** über den gesamten Lebenszyklus von Hardware bis Cluster:

- **GFD** (GPU Feature Discovery) — erkennt GPUs automatisch und exponiert Hardwaremerkmale als Node-Labels
- **NFD** (Node Feature Discovery) — Hardwaremerkmale auf Node-Ebene (CPU, Speicher, Netzwerk u. a.)
- **Device Plugin / DRA Driver** — meldet GPU-Ressourcen an den Kubernetes-Scheduler; Dual-Track-Scheduling
- **GPU Exporter** — Sammelt Auslastung, Speicher, Temperatur, Leistung und verwandte Metriken
- **NPD** (Node Problem Detector) — Kernel-Fehler, Hardware-Anomalien, Treiber-Ausfälle
- **Node Exporter** — CPU/Speicher/Disk/Netzwerk auf Systemebene
- **Container Toolkit** — OCI-Runtime-Wrapper; transparente Injection von GPUs und Treiberbibliotheken

### Deklaratives CRD-Management

Deklarative Verwaltung über CRD (`apiVersion: enflame.com/v1, kind: GpuResource`). Ein CR steuert 7+ Komponenten. Ergebnisse:

- **One-Click-Deployment** — Alle Komponenten deployen automatisch über den CR
- **Rolling Upgrades** — Treiber, Runtimes und Komponenten upgraden reibungslos
- **Automatisches Reconcile** — Konfigurationsdrift wird repariert; operativer Aufwand sinkt deutlich

### Automatisierte Device-Discovery

**Vollautomatische Pipeline** von Hardwareattributen zu Kubernetes-Node-Labels:

`GPU hardware → efsmi / libefml → GFD → label file → NFD → Node Labels`

**Dreistufiges Backend-Fallback** für verschiedene Treiberversionen:

1. `efsmi -q --json-format` — JSON-Ausgabe (empfohlen)
2. `efsmi -q` — Text-Parsing (ältere Versionen)
3. `libefml.so` — CGO-Bindings (letzter Fallback)

Labels aktualisieren sich alle **60 Sekunden**; Treiber-Upgrades sind für obere Workflows transparent. Operatoren schedulen präzise mit `nodeSelector`, z. B. `enflame.com/gpu.model: S60` oder Filter nach Speichergröße.

## 3. Scheduling-Evolution: Device Plugin bis DRA

Enflame implementiert **Dual-Track-Scheduling** mit Device Plugin und DRA Driver — Kubernetes 1.9 bis 1.34+ für einen reibungslosen Übergang.

| Dimension | Device Plugin | DRA Driver |
|-|-|-|
| **Ressourcendeklaration** | `resources.limits` nach Anzahl | ResourceClaim + CEL |
| **Geräteauswahl** | Nur Anzahl | Nach Attributen (Modell/Speicher/Profil) |
| **Gerätepartitionierung** | Ganze Karte | DRS-Static-Slices |
| **Multi-Device-Komposition** | Nicht unterstützt | Unterstützt |
| **Device-Injection** | Umgebungsvariablen | CDI |

### Drei-Schritte-DRA-Nutzung

1. **DeviceClass definieren** (vom Operator automatisch deployt): `kind: DeviceClass, metadata.name: enflame.com`
2. **ResourceClaim + CEL** für präzise Auswahl: CEL-Ausdrücke für Modell, Speicher und weitere Attribute
3. **Pod referenziert den Claim**: Scheduler + DRA Driver allozieren automatisch + CDI-Injection

### DRS-Static-Slicing

Hat eine S60-Vollkarte genug Speicher, kann DRS mehrere logische Slices für geteilte Inferenz-Jobs erzeugen:

- **1g.11gb** — 4 Slices, 1/4 Speicher; kleine Modelle (Entwicklung/Debug)
- **2g.22gb** — 2 Slices, 1/2 Speicher; mittlere Modelle (mittlere Last)
- **full** — 1 Slice, voller Speicher; Training / große Modelle (schwere Last)

Slices werden beim Node-Start erzeugt; der Scheduler alloziert auf Slice-Granularität; Laufzeit-Isolation durch Treiber und Container Toolkit gemeinsam.

## 4. CDI + Container Toolkit: transparenter Container-Zugriff

### Funktionsweise des Container Toolkit

Als OCI-Runtime-Wrapper fängt das Container Toolkit den Container-Start ab und vollendet Device-Injection in **vier Schritten**:

1. Parse Container-Umgebungsvariablen / CDI Spec
2. OCI-Runtime-Spec anpassen
3. `/dev/gpu*`, `libefml.so` und Treiberbibliotheken injizieren
4. zugrunde liegendes runc zum Containerstart aufrufen

Zwei Zugriffsmodi:

- **Legacy-Modus** — Injection via `ENFLAME_VISIBLE_DEVICES`; Device-Plugin-Pfad; kompatibel mit älteren Ansätzen
- **CDI-Modus** (empfohlen) — Injection via CDI Spec + devices-Feld; DRA-Pfad; Standardansatz

Kompatibel mit Docker / containerd / CRI-O; entkoppelt von der Runtime.

### CDI: über vendor-private Umgebungsvariablen hinaus

Traditionelle GPU-Containerisierung hängt an vendor-privaten Variablen (z. B. `NVIDIA_VISIBLE_DEVICES`). Injection-Methoden unterscheiden sich je Hersteller und fehlen an Standardisierung.

Enflame setzt **CDI (Container Device Interface)** — CNCF-Standard für Device-Injection — statt vendor-spezifischer Ansätze. Die CDI Spec (`/etc/cdi/enflame.com-gpu.yaml`) deklariert deviceNodes, mounts, env und hooks.

**Vier CDI-Vorteile:**

- **Standardisiert** — Native Unterstützung in Kubernetes DRA, Podman und CRI-O
- **Deklarativ** — Spec beschreibt die Injection; die Runtime führt aus
- **Komponierbar** — Multi-Device-Injection (GPU + RDMA)
- **Dynamisch generiert** — `enflame-ctk generate` erzeugt Specs aus Hardware

## 5. Full-Stack-Observability

Enflame baute einen **Drei-Schichten-Exporter** für End-to-End-Sicht vom Chip bis zum Cluster:

- **Beschleunigerschicht** (GPU Exporter) — Auslastung, Speicher, Temperatur, Leistung, ECC, PCIe u. a.
- **Systemschicht** (Node Exporter) — CPU, Speicher, Disk, Netzwerk
- **Health-Schicht** (NPD) — Kernel-Fehler, Hardware-Anomalien, Treiber-Ausfälle

Integrationspfad: `GPU hardware → libefml → GPU Exporter → Prometheus → Grafana`, AlertManager für Alerts. Sammlung alle **15 Sekunden**, CPU-Overhead **< 1 %**, Pod-Nutzung korreliert mit Workload-Labels.

## 6. End-to-End-Workflow

Von Pod-Einreichung bis GPU-Inferenz: vollautomatische Kette — **aus Nutzersicht: Pod einreichen, der Rest läuft automatisch.**

1. Nutzer reicht Pod ein (deklariert GPU-Bedarf)
2. Kubernetes Scheduler liest GFD-Node-Labels → Match → bester Node
3. Kubelet + Device Plugin / DRA Driver allozieren Geräte + erzeugen Konfiguration
4. Container Toolkit injiziert `/dev/gpu*` + Treiberbibliotheken
5. Container startet; Anwendung nutzt GPU für Inferenz/Training
6. Laufend: GPU Exporter → Prometheus / NPD → Kubernetes API / GFD → Label-Refresh

## 7. Inference Gateway: inferenzspezifische Optimierung

### Full-Stack-Architektur von GPU-Management bis LLM-Inferenz

![Full-Stack-Architektur des Inference Gateway](/images/blog/enflame-k8s-cloud-native-practice/inference-gateway-stack.webp)

Große Modell-Inferenz wandelt sich von monolithischem Deployment zu verteilter cloud-nativer Inferenz — mit hoher Parallelität, langem Kontext, KV-Cache-Management, SLO-Garantien u. a. Enflame orientiert sich am **CNCF-Vier-Schichten-Standard-Inferenz-Stack** und will GPUs als natives Backend in allen vier Schichten:

| Schicht | Standardkomponente | Verantwortung |
|-|-|-|
| **Ingress/Routing** | Envoy + GIE | Modellbewusstes Routing, KV-Scoring, Multi-Tenancy (Ingress für die LLM-Ära) |
| **Serving** | KServe | InferenceService-CRD; einheitliches Multi-Framework-Serving (Deployment für Inferenz) |
| **Orchestrierung** | llm-d | Prefill/Decode-Trennung; KV-Sharing über Pods (verteiltes Scheduling für vLLM) |
| **Engine** | vLLM / SGLang | PagedAttention, Continuous Batching (Rechenkern) |

**Aufteilung GIE und llm-d (komplementär, kein Ersatz):**

- **GIE** sitzt **vor** Pods und entscheidet, welcher Backend-Pod eine Anfrage erhält
- **llm-d** sitzt **innerhalb / zwischen** Pods und steuert die Zusammenarbeit über Pods

### GIE: CNCF-Standard-Routing-Schicht für LLM-Inferenz

GIE (Gateway API Inference Extension) ist die CNCF-Standard-Routing-Schicht für LLM-Inferenz. Drei zentrale CRDs:

- **InferencePool** — Inferenz-Backend-Gruppe; GPU-Zuweisung via DRA
- **InferenceModel** — Modell, Version, Canary und Multi-Tenant-Richtlinien
- **EPP** (Endpoint Picker) — gRPC-Plugin; Gateway ruft es zur Pod-Auswahl auf

Enflame entwickelt ein **GPU-EPP-Plugin**, das Queue-Tiefe, KV-Trefferquote, verbleibenden Speicher u. a. für intelligentes Routing bewertet, plus:

- **Prefix-Cache-Routing** — gleiche Präfixe landen auf demselben Node für höhere KV-Trefferquote
- **PD-getrenntes Routing** — getrennte InferencePools für Prefill/Decode; Dispatch nach Phase
- **SLO und Fairness** — Tenant-Priorität/Fairness + DRS-Slice-Isolation für Multi-Tenant-SLOs
- **Canary & A/B** — Multi-Version-Routing via InferenceModel + GPU-Exporter-Canary-Metriken für sicherere Rollouts

### SLO-getriebenes Autoscaling

HPA aus inferenzkritischen Metriken für intelligente Elastizität:

- **TTFT** (Time To First Token): Latenz bis zum ersten Token
- **TPOT** (Time Per Output Token): Zeit pro generiertem Token
- **Queue Depth**: Request-Queuing
- **KV-Cache-Trefferquote**: Drei-Schichten-Cache (HBM → Host → NVMe)

Unabhängiges Prefill-/Decode-Scaling + DRS-Slice-Reassembly. Endziel: **Modell + SLO deklarieren; Scheduling/Routing/Scaling/Monitoring automatisieren sich Ende-zu-Ende.**

## Enflame GPU × HAMi: Zusammenarbeit bei heterogenem Compute-Scheduling

Das Meetup initiierte die **HAMi-Community**, ausgerichtet von **Dynamia**. HAMi ist ein von der CNCF gehostetes Open-Source-Projekt und derzeit die einzige Open-Source-Lösung der Branche für flexible, on-demand, elastische und zuverlässige GPU-Virtualisierung. Unterstützt werden u. a. NVIDIA, Ascend und Enflame — mit mehr als 200 Unternehmens-Endnutzern.

Enflames Full-Stack-Cloud-Native-Ansatz — von GPU Operator über DRA-Scheduling und CDI-Injection bis Inference Gateway — ergänzt HAMis heterogenes Compute-Scheduling:

**Zentrale Enflame × HAMi-Berührungspunkte:**

- **GPU-Sharing und Virtualisierung** — Enflame nutzt DRS für statisches Slicing; darauf liefert HAMi feingranulares **on-demand, elastisches GPU-Sharing** mit Speicherisolation und Compute-Partitionierung — mehrere Inferenz-Jobs auf einer Enflame-GPU, Auslastung von ~30 % pro Karte auf 80 %+
- **Heterogenes Misch-Scheduling** — Enflame-GPUs als von HAMi unterstützter Gerätetyp lassen sich mit NVIDIA, Ascend und anderen Karten über HAMis einheitliche Scheduling-Schicht **ko-deployen** — ein Scheduling für Multi-Vendor-GPU-Cluster
- **DRA-Standard-Zusammenarbeit** — Enflame treibt DRA Driver voran, HAMi integriert aktiv ins DRA-Ökosystem; tiefe Zusammenarbeit bei **ResourceClaim, CEL-Attributauswahl und DeviceClass** für standardisierten heimischen GPU-Zugang in Kubernetes DRA
- **Full-Stack-Observability-Anbindung** — Enflames Drei-Schichten-Exporter mit HAMi-Monitoring für **einheitliche GPU-Auslastungssicht** in heterogenen Clustern und feinere Scheduling-Entscheidungen

Enflame-GPUs stehen bereits auf HAMis Supported List. Künftig vertiefen beide Seiten DRA-Integration, elastische Scheduling-Strategien und heterogenes Inferenz-Routing — damit heimische GPUs in cloud-nativen Umgebungen mehr Wert liefern.

## 8. Ausblick

Enflames Schwerpunkte auf dem Standardisierungspfad:

- **DRA GA und Funktionsausbau** — reichere CEL-Attribute, Cross-Node-ResourceClaims, Partitionable Devices
- **Inference-Gateway-Standardisierung** — GIE Beta → GA; Standardisierung von Multi-Tenant- und SLO-Verhalten
- **CDI-Ökosystem-Konvergenz** — natives CDI in containerd / CRI-O bis GA vorantreiben
- **Offene Ökosystem-Zusammenarbeit** — langfristig mit CNCF, Upstream und Framework-Herstellern; tiefe DRA-Integration mit HAMi

## 9. Kernergebnisse im Überblick

Enflame hat eine vollständige Lösungsmatrix für cloud-native Verwaltung heimischer GPUs aufgebaut:

- **GPU Operator** (ausgeliefert) — beendet fragmentiertes Device-Management; 1 CR für 7+ Komponenten
- **Device Plugin + DRA** (ausgeliefert) — einheitliches Ressourcen-Scheduling; Dual-Track für K8s 1.9 ~ 1.34+
- **CDI** (ausgeliefert) — standardisierte Device-Injection statt Vendor-Privatansätze
- **Full-Stack-Observability** (ausgeliefert) — Ende der GPU-Blackbox; Drei-Schichten-Exporter mit Sekunden-Sampling
- **Inference Gateway** (in Arbeit) — Inferenzeffizienz und SLOs via intelligentes Routing + Autoscaling
- **HAMi-DRA-Integration** (geplant) — heterogenes Scheduling mit dem HAMi-Ökosystem vereinheitlichen

Vier Kernfähigkeiten sind produktiv; Inference Gateway in Entwicklung; HAMi-Integration geplant — insgesamt hohe Reife.

## Zusammenfassung

In diesem Vortrag präsentierte Enflame einen vollständigen cloud-nativen Integrationsansatz für heimische GPUs — von Low-Level-Device-Management bis Upper-Layer-Inferenzoptimierung. Die Kernidee: **CNCF-Standards konsequent nutzen** — deklaratives Management via GPU Operator, CDI statt Vendor-Privatansätze, feingranulares Scheduling via DRA, GIE im Einklang mit Inferenz-Gateway-Standards der Branche.

Für heimische GPU-Hersteller zeigt Enflames Praxis: **Cloud-Native-Wettbewerb ist nicht nur Feature-Kampf, sondern auch Standard-Kampf.** Frühe CNCF-Ausrichtung bedeutet stärkere Interoperabilität und Ökosystemvorteil in Hybrid- und Multi-Cloud-Szenarien. Für Nutzer senkt ein tief in Kubernetes integrierter GPU-Management-Ansatz Kosten und operative Komplexität beim Onboarding heterogener Compute deutlich.

Mit DRA auf dem Weg zu GA, voranschreitender GIE-Standardisierung und konvergierendem CDI-Ökosystem passen heimische GPUs und Cloud-Native immer reibungsloser zusammen. Die tiefe DRA-Integration zwischen Enflame und der HAMi-Community lohnt es, im Blick zu behalten.