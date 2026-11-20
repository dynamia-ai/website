---
title: 'KI-Infrastruktur aus CNCF-Sicht: Von „Compute stapeln“ zu „Compute optimieren“'
date: '2026-04-25'
excerpt: >-
  Im Recap des HAMi Community Meetup Shenzhen teilt CNCF-VP APAC Keith Chan
  globale Perspektiven zur Cloud-Native-Evolution der KI-Infrastruktur und
  gibt einen Ausblick auf die KI-Sessions der KubeCon Shanghai im September.
author: Dynamia
tags:
  - CNCF
  - KubeCon
  - KI-Infrastruktur
  - Cloud Native
  - Kubernetes
  - NVIDIA
category: Community & Events
language: de
coverImage: /images/blog/keith-chan-ai-infrastructure-cloud-native/keith-chan-portrait.jpg
linktitle: KI-Infrastruktur aus CNCF-Sicht
---

„Maximize Efficiency, Not Compute“ — das vom HAMi-Community veranstaltete Meetup Shenzhen, organisiert von Dynamia AI, endete am 25. April 2026 erfolgreich. Dies ist der erste Artikel der Shenzhen-Recap-Serie. CNCF-VP APAC Keith Chan gibt globale Einordnungen zur Cloud-Native-Entwicklung der KI-Infrastruktur und einen Ausblick auf die KI-Sessions der KubeCon Shanghai im September.

**Speaker:** Keith Chan (CNCF China Director, VP APAC der Linux Foundation)

![Keith Chan beim Vortrag](/images/blog/keith-chan-ai-infrastructure-cloud-native/keith-chan-portrait.jpg)

## Kernaussagen

- 66 % der Unternehmen betreiben KI bereits auf Cloud Native; K8s wird zur einheitlichen Orchestrierungsschicht der KI-Infrastruktur
- NVIDIA tritt offiziell als Platinum-Mitglied der CNCF bei und beschleunigt die GPU-K8s-Integration
- 60–80 % der KubeCon-Einreichungen sind KI-bezogen — absoluter Mainstream
- HAMi ist das erste Sandbox-Projekt in einer KubeCon-Europe-Keynote
- OpenAI nutzt u. a. Fluent Bit und steigert die GPU-Auslastung um über 50 %

## Video & Folien

- **Bilibili:** [The infrastructure of AI's future - Keith Chan(CNCF)](https://www.bilibili.com/video/BV1Sqo6BBE2h/)
- **Folien:** [opening-cncf-keith-chan.pdf](https://github.com/Project-HAMi/community/blob/main/hami-meetup/03-shenzhen-20260425/opening-cncf-keith-chan.pdf)

## 1. 66 % der Unternehmen betreiben KI auf Cloud Native

Keith Chan eröffnete mit CNCF-Umfragedaten Ende 2025: **66 % der Unternehmen weltweit betreiben KI-Workloads in Cloud-Native-Umgebungen**. In China nutzen über 90 % der KI-Nutzer Cloud-Native-KI-Technologien.

![Diagramm: 66 % der Unternehmen mit KI auf Cloud Native](/images/blog/keith-chan-ai-infrastructure-cloud-native/cncf-survey-66-percent-en.png)

Der Trend dahinter ist klar: **Kubernetes ist zur einheitlichen Orchestrierungsschicht der KI-Infrastruktur geworden**. Auto-Scaling, CI/CD und Hochverfügbarkeit treffen die Anforderungen generativer KI an Echtzeit und Elastizität.

## 2. Wettbewerbsfokus: Von „Compute stapeln“ zu „Compute optimieren“

Der Wettbewerb verschiebt sich von reiner Rechenleistung zu **„wie nutze ich Compute mit minimalen Kosten und maximaler Effizienz“**. Unternehmen bauen nicht nur auf fertige Modelle, sondern differenzieren sich über Infrastruktur-Optimierung.

Führende Unternehmen setzen auf „Infrastructure First“:

- **OpenAI** verwaltet tausende Knoten über Kubernetes und steigert mit Fluent Bit die GPU-Auslastung um über 50 %
- **Hugging Face** verfolgt ebenfalls eine Cloud-Native-first-Strategie

## 3. Drei Ökosystem-Verschiebungen

### NVIDIA im CNCF-Ökosystem

Keith verkündete: **NVIDIA ist offiziell Platinum-Mitglied der CNCF**. Das markiert die tiefe Einbindung des GPU-Marktführers in Cloud Native und beschleunigt die Fusion von GPU und K8s.

### PyTorch und Cloud Native

Da **90 % der LLMs auf PyTorch basieren**, arbeiten PyTorch- und Cloud-Native-Community eng zusammen und treiben die Standardisierung des KI-Stacks.

### KubeCon dreht auf KI

**60–80 %** der diesjährigen KubeCon-Einreichungen sind KI-bezogen — nicht nur Session-Trend, sondern Richtungswechsel der gesamten Community.

## 4. HAMi: fehlendes Puzzleteil für GPU-Scheduling in der CNCF

![HAMis CNCF Case Studies](/images/blog/keith-chan-ai-infrastructure-cloud-native/hami-cncf-case-studies-en.png)

Keith hob HAMis Rolle hervor:

**Sandbox bricht Konventionen.** HAMi trat als Sandbox bei, erschien aber kürzlich **als erstes Sandbox-Projekt in einer KubeCon-Europe-Keynote** — üblicherweise Graduated/Incubating.

**Wachsende globale Beteiligung.** Neben heimischen Unternehmen steigen internationale Beiträge in Weeklys und Code; der Weg Richtung Incubating ist eingeschlagen.

**Lückenschließer im Ökosystem.** HAMi adressiert effizientes GPU-Scheduling in der KI-Infrastruktur und ergänzt K8s, Volcano, KubeFlow und Storage zu einem vollständigen Stack.

## 5. Ausblick KubeCon Shanghai

![KubeCon China, 8.–9. September 2026, Shanghai](/images/blog/keith-chan-ai-infrastructure-cloud-native/kubecon-shanghai-2026-en.png)

- Erwartet starke internationale Expertise
- **Erstmals PyTorch- und MCP-AI-Tracks**
- KI als Kernthema der Konferenz

## 6. Implikationen für Entwickler

Keith betonte die **kulturelle Transformation**: KI erfordert neue Skills — KI-Apps mit minimalen Kosten und maximaler Effizienz zu betreiben.

Das ist kein Tool-Wechsel, sondern ein Paradigmenwechsel in der Entwicklung.