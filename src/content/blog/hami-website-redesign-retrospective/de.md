---
title: "HAMi-Website und Dokumentation: mehr als Redesign — ein systematisches Upgrade"
linktitle: "Überblick HAMi-Website-Redesign"
date: "2026-03-17"
excerpt: >-
  Systematisches Upgrade von HAMi-Website und Docs: bessere Sichtbarkeit der
  Community, Inhaltsstruktur, Suche und Nutzbarkeit.
author: Jimmy Song
tags:
  - HAMi
  - Website
  - Dokumentation
  - Community
  - Open Source
category: Open Source
language: de
coverImage: /images/blog/hami-website-redesign-retrospective/banner.webp
---

> Dieses Redesign ist mehr als ein Stil-Update — ein Schritt zu klarerer Technik-Kommunikation und besserer UX. Neue HAMi-Website: <https://project-hami.io>, Issues: [hier](https://github.com/Project-HAMi/website/issues).

Autor: Jimmy Song (Dynamia), GitHub: [@rootsongjc](https://github.com/rootsongjc)

In zwei Monaten habe ich die Dokumentations-Website gründlich refaktoriert (siehe [GitHub](https://github.com/Project-HAMi/website/pulls?q=is%3Apr+is%3Aclosed+author%3Arootsongjc)). Extern wirkt es wie „visuelles Redesign“; für Maintainer und Content-Builder ist es ein Upgrade von Informationsarchitektur, Content-System und Frontend-Erlebnis.

Dieser Artikel erklärt: warum, was sich geändert hat, und was das für die HAMi-Community bedeutet.

## Warum Website und Docs refaktorisieren

[HAMi](https://github.com/project-hami/hami) ist ein CNCF-Projekt, initiiert von [Dynamia](https://dynamia.ai), mit wachsendem Einfluss in GPU-Virtualisierung, heterogenem Scheduling und KI-Infrastruktur. Nutzertypen diversifizieren sich: Erstbesucher, Engineers, Enterprise-Nutzer mit Deploy-Docs, Architekturdiagrammen, Case Studies und Ökosystem-Infos.

Die alte Seite funktionierte, aber mit wachsendem Content zeigten sich Probleme:

- Homepage mit geringer Informationsdichte — Projektwert schwer schnell zu erfassen
- Docs, Blog und Community schlecht verknüpft; verstreute Einstiege
- Instabile Suche; externe Lösungen in der Praxis unzureichend
- Mobile: Navigation, Karten, Footer verbesserungswürdig
- Uneinheitlicher visueller Stil — Reife und Einfluss schwer zu vermitteln

Für eine schnell wachsende Open-Source-Community ist die Website nicht nur „Dokumentenablage“, sondern öffentliche Community-Fassade: Einführung, Wissensportal, Adoption-Nachweis, Community-Konnektor, Marke.

Ziel: nicht nur Kosmetik, sondern systematischer Community-Einstieg für HAMi.

## Was in diesem Refactoring gemacht wurde

Keine Einzeländerung, sondern zusammenhängende Verbesserungen.

### Homepage und Informationsarchitektur

Deutlichste Änderung: die Homepage.

Neue Struktur entlang der Erzählung: „Positionierung → Kernfähigkeiten → Ökosystem → Content-Aufbau → Community-Vertrauen“.

Upgrades:

- Hero neu aufgebaut — First-Screen und Actions
- CTA optimiert — schneller Zugang zu Docs, Blog, Ressourcen
- Neue/verbesserte Sektionen — strukturierter Projekt- und Community-Reach
- Visuelle Hierarchie, Atmosphäre, Scroll-Rhythmus — von „Content-Liste“ zu „Erzählseite“

Hero-Animationen, Story-Sektionen, Resource-Entries, CTAs, einheitlicher Hintergrund, weniger visuelles Rauschen — Besucher verstehen in Sekunden, was HAMi ist und warum es Exploration wert ist.

### Architekturdiagramme

Neu gezeichnet für klarere Technik-Kommunikation und HAMis Rolle in der KI-Infrastruktur.

![HAMi-Homepage-Architekturdiagramm](https://assets.jimmysong.io/images/blog/hami-website-redesign/hami-hero-diagram.webp)

![Vorher/Nachher mit HAMi](https://assets.jimmysong.io/images/blog/hami-website-redesign/before-and-after-using-hami-diagram.svg)

HAMi adressiert Systemfragen mit Kubernetes, Schedulern, GPU Operators, heterogenen Devices und Enterprise-Plattformen. Bessere Diagramme machen die Website zum besseren Tech-Einstieg.

### Case Studies, Community, Ökosystem

„Community Proof“ stärken — viele Projekte haben Docs, aber Adoption und Aktivität bleiben unsichtbar.

![Ökosystem und Device-Support](https://assets.jimmysong.io/images/blog/hami-website-redesign/ecosystem.webp)
![Adopters](https://assets.jimmysong.io/images/blog/hami-website-redesign/adopters.webp)
![Contributor-Organisationen](https://assets.jimmysong.io/images/blog/hami-website-redesign/contributors.webp)

### Blog & Leserlebnis

Einheitliche Karten, Listen, Metadaten — Blog als zentrale Kommunikationsschicht.

![Blog-Liste](https://assets.jimmysong.io/images/blog/hami-website-redesign/hami-blog.webp)

### Mobile

Navigation, Karten, Footer, Suche für flüssigeres Mobile-Browsing.

![Mobile-Ansicht](https://assets.jimmysong.io/images/blog/hami-website-redesign/mobile.webp)

### Footer & Suche

Footer für Navigation und Glaubwürdigkeit; eingebaute Suche statt unzuverlässiger externer Lösungen.

![Footer](https://assets.jimmysong.io/images/blog/hami-website-redesign/footer.webp)
![Eingebaute Suche](https://assets.jimmysong.io/images/blog/hami-website-redesign/search.webp)

## Bedeutung für die HAMi-Community

Äußerlich „schöner“ — inhaltlich tiefer.

**Systematischere Außendarstellung.** Vollständige Erzählkette: Homepage (Wert) → Docs (Details) → Blog (Praxis) → Ökosystem (Impact).

**Neu organisierte Content-Assets.** Wertvolle Inhalte waren schwer auffindbar; jetzt besser verknüpft über Homepage, Navigation und Suche.

**Reiferes Community-Bild.** Reife braucht klare, stabile Website — Struktur, Stil, Usability sind Engineering-Fähigkeit.

**Fundament für mehr Cases, Adopters, Partner.** Framework steht; Erweiterung wird natürlicher.

## Drei Learnings als Contributor

- Von „Content-Ablage“ zu „Community-Gateway“
- Visuelles Plus Informationsarchitektur — nicht nur Skin
- Suche, Mobile, Navigation, Footer als Grundlagen

Weniger spektakulär als ein Feature-Launch, aber direkt relevant für Verbreitung, Verständnis und Langzeitimage.

Bei Infrastruktur-Projekten wie HAMi ist nicht nur Technik fundamental — auch wie man sie kommuniziert, ordnet und präsentiert.

## Zusammenfassung

Refactoring als Upgrade der „Expression Layer“ der Community.

Besseres Lesen und Suchen; Homepage-Narrativ; Mobile; Community-Signale. Homepage, Diagramme, Blog-Stil, Mobile, Footer, eingebaute Suche — echtes Refactoring.

Außen: schnelleres HAMi-Verständnis. Innen: stabile Plattform für Cases, Ökosystem, Adopters und Contributors.

Die Website ist kein Anhang der Community, sondern Teil ihres langfristigen Einflusses. HAMi nimmt das ernst.