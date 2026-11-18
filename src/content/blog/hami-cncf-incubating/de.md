---
title: "HAMi wird CNCF-Incubating-Projekt: Gemeinsam mit Entwicklern weltweit heterogene Compute-Infrastruktur für das KI-Zeitalter aufbauen"
linktitle: "HAMi wird CNCF-Incubating-Projekt"
date: '2026-07-03'
excerpt: >-
  Am 2. Juli 2026 wurde HAMi offiziell CNCF-Incubating-Projekt. Nach dem Sandbox-Beitritt
  im August 2024 markiert dieser Meilenstein HAMis Wachstum von einem vielversprechenden
  Newcomer zu einer in Produktion breit eingesetzten, vertrauenswürdigen Infrastruktur.
author: HAMi Community
tags:
  - HAMi
  - CNCF
  - GPU-Virtualisierung
  - KI-Infrastruktur
  - Cloud Native
category: Open Source
coverImage: /images/blog/hami-cncf-incubating/cncf-incubating-badge.png
---

![HAMi wird CNCF-Incubating-Projekt](/images/blog/hami-cncf-incubating/cncf-incubating-badge.png)

Am 2. Juli 2026 wurde HAMi offiziell **CNCF-Incubating-Projekt**; das Technical Oversight Committee (TOC) der CNCF beschloss [die Inkubationsabstimmung](https://github.com/cncf/toc/issues/1775) einstimmig.

![CNCF-TOC-Inkubationsabstimmung einstimmig bestanden](/images/blog/hami-cncf-incubating/toc-vote-en.png)

Das ist ein weiterer großer Meilenstein seit dem CNCF-Sandbox-Beitritt im August 2024. Im CNCF-Reifegradmodell ist Sandbox ein „Prüffeld“ für frühe Projekte, während Incubating strenge Validierung in **technischer Reife, Security, Community-Governance, Produktionsadoption und Ökosystemintegration** verlangt. Die Inkubationsstufe bedeutet: HAMi ist von „Projekt mit Potenzial“ zu „vertrauenswürdiger Infrastruktur in realer Produktion“ gereift.

Wir danken CNCF-TOC-Vorsitzender [Karena Angell](https://www.linkedin.com/feed/update/urn:li:activity:7478594903292399616/), die die Due Diligence leitete, TOC-Mitglied Kevin Wang und TAG-Runtime für das technische Review sowie allen Adoptierenden für ihr Feedback.

## Was ist HAMi

HAMi steht für **H**eterogeneous **A**I Computing **Mi**ddleware – Open-Source-Middleware für Virtualisierung und Scheduling heterogener Compute-Ressourcen in Kubernetes. Das Kernproblem: **Können mehrere Tasks eine GPU sicher teilen, ohne sich gegenseitig zu stören?**

Vor HAMi plante Kubernetes GPUs grobkörnig mit „ein Pod pro Karte“. Teure Beschleuniger standen oft leer, weil ein einzelner Task sie monopolisierte – die GPU-Auslastung blieb chronisch niedrig. HAMi teilt Speicher und Rechenleistung einer GPU auf Container-Ebene mit harter Isolation auf und ermöglicht Mandanten und Tasks das Teilen derselben Karte – **ohne Änderungen an bestehenden Workloads**: HAMi installieren, und Sharing plus Isolation funktionieren automatisch.

Das Projekt wurde von [Zhang Xiao](https://github.com/wawa0210) und [Li Mengxuan](https://github.com/archlitchi) gegründet, am **12. Juli 2021** erstmals als Open Source veröffentlicht und ist unter CNCF-Open-Governance zu einem global getragenen Projekt gewachsen.

## Produktionsadoption und Ökosystem

Der stärkste Beweis für HAMis Wert sind reale Produktionsdaten. HAMi wird von Hunderten Organisationen eingesetzt und deckt mehr als zehn Beschleunigertypen ab – NVIDIA, Huawei Ascend, Cambricon, Hygon DCU, Moore Threads, Enflame, Kunlunxin, MetaX, AWS Neuron, Vastai u. a. (siehe [Liste unterstützter Geräte](https://project-hami.io/docs/userguide/device-supported)) – eine der breitesten Hardware-Abdeckungen im cloud-nativen GPU-Virtualisierungsbereich.

In den [CNCF-Case-Studies](https://project-hami.io/case-studies) finden sich Praxisberichte aus Finanz, Automotive, Mobilität, Logistik, Bildung und Cloud:

- **China Merchants Bank**: Vereinheitlichung von Kunlunxin, Ascend, NVIDIA u. a. auf einer Scheduling-Plattform, **100 %** Hardware-Pooling, **30 %** weniger Cross-Node-Scheduling, Topology-Aware-Scheduling zurück an die Community.
- **SNOW Corp.** (NAVER, Südkorea): 1000+ A100 mit HAMi für 200 Mio.+ Nutzer; bei 700 % Traffic-Peaks halbierte sich die GPU-Anzahl, geschätzte Einsparung **17,4 Mio. USD**, MTTR −91 %.
- **NIO**: Bei autonomem Fahren ~**10×** höhere GPU-Auslastung in CI-Pipelines, ~30 % weniger Simulations-GPU-Zeit.
- **KE Holdings (Beike)**: Plattform-GPU-Auslastung ~**3×** (13 % → 37 %).
- **DaoCloud**: Nach vGPU-Adoption durchschnittlich **>80 %** GPU-Auslastung, Betriebskosten ~50 % niedriger.
- **SF Technology**: Heterogener Virtualisierungspool, bis **57 %** GPU-Einsparung in Produktion und Test.
- **PREP EDU**: **90 %** der GPU-Infrastruktur mit HAMi optimiert.

HAMi-core ist in den Kubernetes-Default-Scheduler, [Volcano](https://github.com/volcano-sh/volcano/blob/master/docs/user-guide/how_to_use_gpu_sharing.md), [Kueue](https://github.com/kubernetes-sigs/kueue), [Koordinator](https://koordinator.sh/docs/user-manuals/device-scheduling-gpu-share-with-hami) und den [NVIDIA KAI Scheduler](https://project-hami.io/blog/hami-core-adopted-by-nvidia-kai-scheduler) integriert. Im Juni 2026 übernahm der NVIDIA KAI Scheduler HAMi-core als eingebaute GPU-Speicher-Hard-Isolation – starke Bestätigung der technischen Richtung.

## Chinesische Open-Source-Stärke auf der globalen Bühne

In den vergangenen zwei Jahren sprachen die beiden HAMi-Core-Maintainer auf KubeCon + CloudNativeCon, KubeDay und verwandten Summits in Japan, Hongkong, Frankreich, London, den Niederlanden u. a. – zu GPU-Sharing, heterogenem Scheduling, KI-Workload-Governance und Accelerator-Management in Kubernetes. Zuhause waren sie bei COSCon, GDPS, vLLM-Inferenz-Meetup (Shanghai), Ant Open Source Tech Salon und HAMi-Meetups in Shanghai und Peking aktiv.

![Zhang Xiao auf KubeDay Japan 2024](/images/blog/hami-cncf-incubating/zhangxiao-kubeday-japan-2024.jpg)

Zhang Xiao auf KubeDay Japan 2024

![Zhang Xiao und Li Mengxuan auf KubeCon Hongkong 2024](/images/blog/hami-cncf-incubating/zhangxiao-limengxuan-kubecon-hk-2024.jpg)

Zhang Xiao und Li Mengxuan auf KubeCon Hongkong 2024

![Zhang Xiao und Li Mengxuan auf KubeCon London 2025](/images/blog/hami-cncf-incubating/zhangxiao-limengxuan-kubecon-london-2025.jpg)

Zhang Xiao und Li Mengxuan auf KubeCon London 2025

![Zhang Xiao und Li Mengxuan auf KubeCon France 2025](/images/blog/hami-cncf-incubating/zhangxiao-limengxuan-kubecon-france-2025.jpg)

Zhang Xiao und Li Mengxuan auf KubeCon France 2025

![Li Mengxuan mit dem CNCF-CTO auf KubeCon Hongkong 2025](/images/blog/hami-cncf-incubating/limengxuan-kubecon-hk-2025-cncf-cto.png)

Li Mengxuan mit dem CNCF-CTO auf KubeCon Hongkong 2025

2026 kulminierte diese Arbeit auf der KubeCon + CloudNativeCon Europe 2026 (Amsterdam) in einem Main-Stage-Keynote: Li Mengxuan und Community-Partner Reza Jelveh fuhren YOLO-Inferenz und Qwen3-8B parallel auf einer GPU; Zhang Xiao sprach zu K8s Issue #52757 (mehrere Container teilen eine GPU); Li Mengxuan hielt eine Session zu „dynamischer, intelligenter und stabiler GPU-Sharing-Middleware“. HAMi war eines der chinesischen Open-Source-Projekte im KubeCon-EU-Keynote.

![Li Mengxuan und Reza Jelveh in der KubeCon-EU-Keynote-Live-Demo (13.000+ Teilnehmer vor Ort)](/images/blog/hami-cncf-incubating/kubecon-eu-keynote-live-demo.png)

![HAMi-Core-Maintainer-Team im Austausch mit CNCF TOC, Red Hat und vLLM-Community](/images/blog/hami-cncf-incubating/kubecon-india-2026-team.jpg)

Zwei Monate später auf der [KubeCon + CloudNativeCon India 2026](https://project-hami.io/blog/kubecon-india-2026-recap) (Mumbai): erneut Keynote-Demo und produktionsreife Large-Model-Services mit dynamischem GPU-Sharing am Project-Pavilion-Stand.

![HAMi-Community-Mitwirkende am KubeCon-India-Project-Pavilion](/images/blog/hami-cncf-incubating/kubecon-india-2026-pavilion.png)

## Dank an die Community, die mit uns ging

HAMis Weg ist nicht das Verdienst einer Person oder eines Unternehmens. Ohne Mitwirkende weltweit wäre dieser Meilenstein nicht möglich: [Dynamia](https://www.dynamia.ai/), [DaoCloud](https://www.daocloud.io/), [4Paradigm](https://www.4paradigm.com/), [NVIDIA](https://www.nvidia.com/), [Huawei Cloud](https://www.huawei.com/) sowie Einzelentwickler, Nutzer und Partner – alle mit unersetzlichem Beitrag.

Besonders danken wir allen, die Code einreichten, Issues meldeten, Dokumentation schrieben, Meetups organisierten, auf KubeCon-Bühnen sprachen und in Kanälen Fragen beantworteten. Die Vitalität eines Open-Source-Projekts kommt von Menschen.

## Werde Teil der HAMi-Community

Die Inkubationsstufe ist ein neuer Start. Ob Entwickler, Ops, KI-Infrastruktur-Verantwortlicher oder Evaluierender heterogener Lösungen – ihr seid willkommen:

- **HAMi-Offiziellenkanal folgen** für Releases, Deep Dives und Community-Events.
- **HAMi-WeChat-Gruppe** für Austausch mit Maintainers und Branchennutzern – siehe [Community-Seite](https://project-hami.io/community).
- **Community-Meetings und Meetups:** Regelmäßige Tech-Talks und Stadt-Meetups, u. a. in Peking, Shanghai, Shenzhen. Nach Inkubation folgen mehr **Online-Sessions und Offline-Treffen**:

  - 16. Juli, vLLM Shanghai
  - [17.–20. Juli, WAIC](https://www.worldaic.com.cn)
  - [28.–30. Juli, KubeCon Japan](https://events.linuxfoundation.org/kubecon-cloudnativecon-japan/program/schedule/)
  - [7.–9. September, KubeCon China](https://www.lfopensource.cn/kubecon-cloudnativecon-openinfra-summit-pytorch-conference-china/program/schedule/)

  Egal wo ihr seid – es gibt einen Weg mitzumachen.

- **Auf [GitHub](https://github.com/Project-HAMi/HAMi) beitragen oder Issues melden** – von Docs und Tests bis Core-Features zählt jeder Beitrag.

Wer HAMi in Produktion betreibt, teilt gern Praxisberichte – reale Cases helfen HAMi und anderen Teams, Umwege zu vermeiden.

Wir freuen uns, den nächsten Abschnitt von HAMis Reise mit euch zu gehen.