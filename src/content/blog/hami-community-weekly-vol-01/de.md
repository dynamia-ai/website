---
title: "Community Weekly Vol. 01: KubeCon, ein CNCF-Community-Preis und Neues aus dem Open-Source-Ökosystem"
date: "2026-11-20"
excerpt: "Die erste HAMi Community Weekly berichtet über KubeCon NA 2026, die Open-Source-Veröffentlichung von gpu-descheduler, HAMi-DRA v0.2.4, einen CNCF-Community-Preis und die Vultr Open Source Alliance. Außerdem kündigt sie anstehende Community-Veranstaltungen an."
author: "Dynamia"
category: "Community & Events"
coverDisplay: "text"
tags: ["HAMi", "Community Weekly", "KubeCon", "Open-Source-Community"]
---

**Diese Ausgabe | 9.–13. November 2026**

Ab dieser Woche gibt es die **Community Weekly jede Woche!**

In dieser Reihe möchten wir regelmäßig über **technische Fortschritte, Community-Treffen, Neuigkeiten von Mitwirkenden, Zusammenarbeit im Ökosystem und Veranstaltungen** rund um HAMi berichten. So können Entwickler und Partner die aktuellen Entwicklungen leichter verfolgen. Auch Interessierte, die in der Community mitarbeiten möchten, finden hier einen Einstieg.

Blicken wir gemeinsam auf die Ereignisse dieser Woche zurück.

## Die Woche im Überblick

- **Technischer Austausch:** HAMi auf der KubeCon NA 2026
- **Auszeichnung:** Jimmy Song erhält den CNCF Lorem Ipsum Award 2026
- **Zusammenarbeit:** HAMi tritt der Vultr Open Source Alliance als eines von sechs Gründungsmitgliedern bei.
- **Anstehende Veranstaltungen:** GOTC 2026 und COSCon'26
- **GitHub-Aktivität:** 109 Commits, 62 zusammengeführte PRs, mehr als 30 Mitwirkende und über 5.000 Stars!

![Höhepunkte und GitHub-Zahlen der ersten HAMi Community Weekly](/images/blog/hami-community-weekly-vol-01/weekly-summary-en.png)

## 01 | Neues aus der HAMi-Community

### gpu-descheduler

Das HAMi-Ökosystem hat ein neues Projekt: **gpu-descheduler**. Es richtet sich an HAMi-Cluster mit GPU-Virtualisierung und untersucht, wie die erneute Planung von GPU-Workloads Ressourcenfragmentierung verringern und die Clusterauslastung verbessern kann.

Das Projekt ist öffentlich als Open Source verfügbar. Auch die Benutzerhandbücher auf Chinesisch und Englisch sind online. Interessierte Entwickler sind eingeladen, das Projekt zu verfolgen und mitzuarbeiten.

Projekt-Repository: [https://github.com/Project-HAMi/gpu-descheduler](https://github.com/Project-HAMi/gpu-descheduler)

### HAMi-DRA v0.2.4 veröffentlicht

Am 12. November wurde HAMi-DRA v0.2.4 veröffentlicht. Die Version verbessert den Ansatz für den Übergang vom Device Plugin zu Kubernetes DRA weiter.

Darüber hinaus arbeitete die Community an der NUMA-Scheduling-Optimierung, der Überwachung und Fehlerbehebung für Remote GPU sowie an Korrekturen für HAMi-WebUI.

### HAMi auf der KubeCon NA 2026

Vom 9. bis 12. November [**war die HAMi-Community bei der KubeCon NA 2026 in Salt Lake City vertreten**](https://mp.weixin.qq.com/s/Z7eFnB2FzU0umpSMzGqGWg). Sie beteiligte sich an technischen Veranstaltungen wie dem Maintainer Track und ContribFest und tauschte sich am CNCF Project Pavilion persönlich mit Entwicklern aus aller Welt aus.

![Entwickler am HAMi-Projektstand der KubeCon NA 2026](/images/blog/hami-community-weekly-vol-01/kubecon-pavilion.jpg)

![CNCF-Incubating-Projekte auf der KubeCon NA 2026](/images/blog/hami-community-weekly-vol-01/kubecon-incubated-projects.jpg)

### Community Manager erhält CNCF-Community-Auszeichnung

Auf der KubeCon NA [**erhielt HAMi Community Manager Jimmy Song (Song Jingchao) aus dem Team von Dynamia den CNCF Lorem Ipsum Award 2026**](https://mp.weixin.qq.com/s/NFjabD75sV2GF-x12mGULQ).

Mit diesem Preis werden Community-Mitglieder ausgezeichnet, die herausragende Beiträge zur Dokumentation von CNCF und den dort betreuten Projekten geleistet haben.

Im vergangenen Jahr förderte Jimmy das HAMi-Ökosystem durch technische Inhalte und Dokumentation, die Organisation von Veranstaltungen, den Austausch mit Entwicklern und die Zusammenarbeit mit Partnern.

Herzlichen Glückwunsch an Jimmy und vielen Dank an alle Maintainer, Mitwirkenden, Nutzer und Partner, die HAMi mitgestalten!

![Jimmy Song bei der Verleihung eines CNCF-Community-Preises auf der KubeCon NA 2026](/images/blog/hami-community-weekly-vol-01/cncf-award-ceremony.jpg)

### HAMi tritt der Vultr Open Source Alliance bei

Am 11. November gab HAMi seinen Beitritt zur **Vultr Open Source Alliance** als eines von sechs Gründungsmitgliedern bekannt.

Die Allianz eröffnet HAMi weitere Möglichkeiten, die Verbindung von GPU-Sharing-Technologie mit Cloud-GPU-Infrastruktur und Kubernetes-Umgebungen zu untersuchen.

Die Community möchte künftig Bereitstellungsanleitungen, Referenzarchitekturen und Materialien zur gemeinsamen GPU-Nutzung erarbeiten, damit mehr Entwickler HAMi in realen Umgebungen bewerten und einsetzen können.

**Weiterführender Artikel:** [HAMi Joins the Vultr Open Source Alliance](https://discover.vultr.com/open-source)

![HAMi tritt der Vultr Open Source Alliance bei](/images/blog/hami-community-weekly-vol-01/vultr-alliance.png)

## 02 | Aus den Community-Treffen

### Chinesisches Community-Treffen | 6. November

- **Pflege der v2.11.0-Dokumentation:** Besprochen wurden die Aktualisierung der offiziellen Dokumentation, zusammenzuführende PRs und Ergänzungen zur Metrics-Dokumentation. Die Arbeit daran ging in der folgenden Woche weiter.
- **Gerätedokumentation:** Die Navigation soll nach Geräteherstellern gegliedert werden, damit Nutzer die Anleitungen für ihre Geräte schneller finden.
- **Zusammenarbeit mit Upstream-Projekten:** Die Community untersuchte, ob Funktionen zur Begrenzung des GPU-Grafikspeichers zu vorgelagerten Kubernetes-Gerätetreibern beigetragen werden können. Die weitere Bewertung hängt von Gesprächen mit den Upstream-Maintainern ab.

### Global Community Meeting | 11. November

- **Planung für v2.12:** Die Mitwirkenden besprachen erste Richtungen für die nächste Version. Eine genauere Roadmap soll nach der KubeCon folgen.
- **Prüfung der Gerätekonfiguration:** Mitwirkender Sankalp schlug einen Befehl vor, mit dem Nutzer relevante Einstellungen vor der Einrichtung des Kubernetes-Gerätezugriffs prüfen können. Der Vorschlag wird in einem GitHub Issue weiter besprochen.
- **LFX Mentorship:** Die Vorbereitung von Projektvorschlägen für die nächste Mentoring-Runde begann. Die Themen werden anhand der HAMi-Roadmap festgelegt.

![HAMi-Grafik für Community-Treffen mit QR-Code zur Teilnahme](/images/blog/hami-community-weekly-vol-01/community-meeting-qr.png)

## 03 | Anstehende Community-Veranstaltungen

### Veranstaltungsvorschau | GOTC 2026

- Datum: 14. November
- Ort: Tongminghu Convention and Exhibition Center, Peking
- Stand: C31

HAMi wird auf der GOTC 2026 mit Entwicklern über GPU-Sharing und die Planung heterogener Rechenressourcen sprechen.

Vor Ort sind außerdem interaktive Aufgaben wie „Garden Agent“ und „Booth NPC“ vorgesehen. Besucher können beim Check-in Token-Punkte sammeln und gegen Geschenke eintauschen.

Besuchen Sie uns am Stand C31 und holen Sie sich HAMi-Community-Merchandise!

![GOTC-2026-Veranstaltungsplakat mit QR-Code für weitere Informationen](/images/blog/hami-community-weekly-vol-01/gotc-poster-qr.png)

### **Veranstaltungsvorschau | COSCon'26**

- Datum: 14.–15. November
- Ort: Yungu Center, Hangzhou
- Stand: D6

HAMi wird auf der Open-Source-Konferenz COSCon'26 mit Entwicklern und Community-Partnern über Open-Source-Technologie und die Entwicklung des Ökosystems sprechen.

![COSCon'26-Veranstaltungsplakat mit QR-Code für weitere Informationen](/images/blog/hami-community-weekly-vol-01/coscon-poster-qr.png)

### Open Source an Hochschulen: Erster Halt Fudan

- **Datum:** 13. November 2026
- **Ort:** Xianghui-Halle der Fudan-Universität, Shanghai

Die erste Veranstaltung der Reihe „Open Source an Hochschulen“ fand an der Fudan-Universität statt. Die HAMi-Community nahm am Austausch teil und stellte Erfahrungen mit GPU-Sharing und der Verwaltung heterogener Rechenressourcen vor.

**Weiterführender Artikel:** https://mp.weixin.qq.com/s/zKenZmIfGLvHnERfaQ1sJw

![Plakat des Open-Source-Forums der Fudan-Universität mit QR-Code für Veranstaltungsinformationen](/images/blog/hami-community-weekly-vol-01/fudan-forum-poster-qr.png)

**Heterogene Rechenressourcen durch Open Source leichter nutzbar machen. Bis nächste Woche!**
