---
title: "DaoCloud baut mit HAMi eine flexible GPU-Cloud auf"
company: "daocloud"
companyName: "DaoCloud"
logo: "/logos/company7.png"
date: "2025-12-02"
dateLabel: "2025.12.02"
sourceKind: "CNCF-Fallstudie · Übersetzte Fassung"
sourceUrl: "https://www.cncf.io/case-studies/daocloud/"
sourceLinkLabel: "CNCF-Original lesen ↗"
outcomeSourceUrl: ""
outcomeSourceLabel: "Schlüsseldatenquelle: Dynamia Network of Officials"
outcomes:
  - value: "10,000+"
    label: "GPUs über mehrere Plattformen"
    detail: "D.run und DCE in über 10 Rechenzentren"
  - value: ">80%"
    label: "Durchschnittliche GPU-Auslastung"
    detail: "Durchschnitt pro GPU nach HAMi-Bereitstellung"
  - value: "20–30%"
    label: "Geringere GPU-Betriebskosten"
    detail: ""
---

## Herausforderungen

DaoClaud betreibt zwei wichtige Cloud-Native Plattformen mit AI-Ladungen: D.run Compute Resources, die den einzelnen Entwicklern und kleinen Teams öffentlich beheimatete GPU Clouds bereitstellt; DaoClaud Enterprise (DCE), eine private Kubernetes-Plattform für Geschäftskunden, während sie Schulungen und Zugriffe durchführt.

Mehrere Herausforderungen haben sich ergeben, da die Nachfrage nach GPUs aus beiden Plattformen rapide angestiegen ist:

1. **Die gesamte Kartenzuweisung bewirkt, dass die Kapazität nicht mehr ausreicht.** Viele Referenzen und Lichtlasten verwenden nur einen Teil der GPU-Ressource, aber die GPU wird in der Regel durch ganze Karte verteilt, hinterlässt eine große Anzahl von untergenutzten Rechenressourcen und GPU-Speicher, die auch das Design der GPU SKU begrenzt.
2. **Heterogene Hardware-Management Schwierigkeiten.** DaoClaud muss sowohl die Mainstream NVIDIA GPU als auch integrierte multiple Inlandsbeschleuniger unterstützen. Das proprietäre vGPU-Programm erhöht die Lizenzkosten und macht es schwierig, dass die nationale Produktion GPU gleichberechtigt unterstützt wird.
3. **Unternehmen brauchen stärkere mehrstufige Governance.** DCE-Clients wollen GPU-Pools mit sektorbezogenen Quoten, linienbasierten Ressourcenzuweisungen und klarer Teamunterstützung teilen.
4. **Es ist wichtig, die Konsistenz im Claud-Nativ zu erhalten.** Die Kernstrategie von DaoClaud konzentriert sich auf Kubernetes und Open Source Technologien. Das GPU-Sharing-Programm muss vollständig Cloud-native, herstellerneutral und mit bestehenden CNCF-Werkzeugen kompatibel sein.

| Wichtige Ergebnisse | Daten |
| --- | --- |
| Übergeordnetes Rechenzentrum | China Festland und Hongkong haben mehr als 10 |
| Durchschnittliche GPU-Nutzung nach Verwendung von vGPU | Mehr als 80% |
| GPU Verwandte Betriebskosten | 20-30% Reduktion |

## Loesungen

DaoClaud verwendet HAMi als einheitliche GPU-Ebene für D.run und DCE. Zum Zeitpunkt der Case Release hat HAMi CNCF Sandbox Projekte mit Ausrüstung für den heterogenen Beschleuniger in Kubernetes Cluster, Virtualisierung, vGPU Schnitt und Schieduling zur Verfügung gestellt.

### Umfang der Bereitstellung

HAMi wird in der Produktionsumgebung von D. Run und DCE eingesetzt, die DaoClauds eigene GPU und Corporate Customer-Eigene GPUs abdeckt. Zusammen verfügt HAMi über eine GPU-Kapazität von mehr als 10.000 Karten, die auf mehr als 10 Rechenzentren im Festland China und Hongkong verteilt sind.

### D. Run Unternehmensressourcen: vGPU SKU für gemeinsame Cloud-Benutzer

DaoClaud integriert Hami in den D.run regionalen Kubernetes-Cluster, wodurch feine Partikelgrößenverteilung und eine höhere Auslastung erreicht werden.

- **vGPU Schnitt und kontrollierte Überschrift:** Spaltt die physische GPU in mehrere Scheiben, die eindeutig die Rechenressourcen und GPU-Memoory definieren. Leichte Verwendung von GPU für eine Mission, kontrollierte Übersubskription erhöht die Gesamtauslastung des Clusters weiter.
- **GPU-basierter Markt:** Platziert die vGPU-Slice als standardisierte SKU auf dem einheitlichen Markt, wobei Benutzer nach Lastgröße wählen, ohne für die gesamte Karte bezahlen zu müssen.
- **Multiregionaler Einsatz:** HAMi unterstützt sieben aktive D.run-Regionen in China und Hongkong, die mehr als 10 Rechenzentren umfassen. Je nach Kundeneinsatz und Hardwareverfügbarkeit können einzelne Produktionsbereiche auf rund 3.000 GPU-Cluster erweitert werden.
- **Unterstützung für nationale Beschleuniger:** DaoClaud Extension HAMi unterstützt die nationalen GPU-Hersteller, verwaltet NVIDIA und die nationale Produktionskarte in einer einheitlichen Abstraktion.

![D.run Product Layout, Quelle: CNCF Original.](/redesign/assets/524623d1953a5063ead0.png)
*D.run Product Layout, Quelle: CNCF Original.*

### DaoClaud Enterprise: Gemeinsames GPU-Pool für große Unternehmen

Auf der DCE baut DaoClaud einen zentralen GPU-Pool auf Basis von Hami, um die Kapazität von mehreren Business Mietern zu harmonisieren.

- **Einheitlicher Pool:** Enterprise-Nutzer tragen zum Pool bei und verwenden GPU, während Schulungen und Zugang.
- **Quota, RBAC und vGPU Integration:** Die HAMi ' s vGPU-Ressourcen sind in das bestehende Quoten- und Rollenprivilegiensystem integriert, wodurch die GPU-Gipfelgrenzen auf Sektorebene und Warteschlangenebene auf die vGPU-Ebene begrenzt werden.
- **Vereinfachen Sie AI Engineer-Erfahrung:** Algorithmische Ingenieure gelten für GPUs durch die Plattform, ohne Bedenken über die unteren Hardware-Differenzen; und Hami verarbeitet vGPU Karten, um reibungslose Entwicklungserfahrung zu bieten.

### Gebäude mit Gemeinden

DaoClaud ist einer der ältesten und aktivsten Mitarbeiter von HAMi. Ingenieure ernähren sich weiterhin in Gemeinden D. Run ' s wahre Erfahrung mit DCE, arbeiten vorgelagert, um GPU-Übertragung, Nodal Konfigurationsmanagement und heterogene Hardware-Verarbeitung zu verbessern, und halten Dokumentations- und Bereitstellungsanleitungen, um anderen Cloud-Herstellern bei Hami in ihren Produktionsumgebungen zu helfen.

> „D.run kann NVIDIA und GPU großflächig, nahtlos verwalten, durch das Abstract von HAMIs einheitlicher vGPU. Hami hat nicht nur die Verwendung von GPU erhöht, sondern auch die regionale Expansion und Lieferung beschleunigt.“
>
> - Captain, DaoClaud AI/LLM Leiter Infrastruktur Produkte
>

## Wirksamkeit der Durchführung

Durch die Integration von Hami integriert DaoCloud bisher fragmentierte GPU-Ressourcen in eine integrierte, effiziente und skalierbare GPU-Schicht, die sowohl öffentliche als auch private Wolken abdeckt.

D.run hat die Nutzung von GPUs nach dem Umzug von der Ganzkartenverteilung auf vGPU-Splitten deutlich erhöht.

In der DCE sehen Unternehmen GPU als öffentliches Ressourcenpool, das Quoten und RBAC-Management unterliegt. Das Modell optimiert die GPU-Management, verbessert Transparenz und beschleunigt den Zugang zu neuen Teams und Projekten.

Über zwei Plattformen reduziert die offene Struktur von HAMi die Abhängigkeit der Anlagen und ermöglicht es NVIDIA, mit dem nationalen Beschleuniger unter einheitlicher Kontrolle zu arbeiten.

> „Hamis Beziehung zu DaoClaud ist nicht nur geschäftliche Verträglichkeit, sondern gemeinsame Konstruktion. Als einer der ersten Mitarbeiter von Hami haben wir seine Entwicklung von Grund auf erlebt.
>
> Hami teilt das gleiche Open-Source-Gen wie DaoClaud, und wir werden weiterhin dazu beitragen, echte vGPU-Technologie zur Welt zu bringen."
>
> - Captain, DaoClaud AI/LLM Leiter Infrastruktur Produkte
>

### Wichtige Ergebnisse

- Mit dem Einsatz von HAMi überstieg die durchschnittliche Single Card GPU-Auslastung 80 Prozent.
- GPU-bezogene Betriebskosten verringerten sich durch effiziente Spaltung und Übersubskription um 20-30 Prozent.
- NVIDIA verwendet einheitliche abstrakte Schichten mit der nationalen Produktion GPU, um Hardware zu diversifizieren, ohne die Komplexität des Transports zu erhöhen.
- Quoten und Rollenprivilegien sind in die vGPU-Schicht integriert, wodurch Governance einfacher wird.
- Das modulare Design von HAMi reduziert den Einsatz- und Lieferzyklus von Clustern und beschleunigt die regionale Expansion.
- DaoCloud setzte die Co-Entwicklung von HAMi fort, trug zu vorgelagerten Verbesserungen und zur Verbesserung der Open Source Zusammenarbeit bei.

<div class="case-source-note">
<p>Original:<a href="https://www.cncf.io/case-studies/daocloud/" target="_blank" rel="noopener">Building flexible GPU clouds with HAMi at DaoCloud ↗</a><br>Herausgeber: Cloud Native Computing Foundation (CNCF) · 2025-12-02</p><p>Diese lokalisierte Fassung übernimmt die technischen Informationen und den Messumfang des Originalartikels. Sie ist keine offizielle CNCF-Übersetzung. Architekturdiagramme behalten ihren Originaltext. Projektstatus und Produktangaben beziehen sich auf das ursprüngliche Veröffentlichungsdatum.</p><p>Das Original wird unter den  <a href="https://www.linuxfoundation.org/legal/terms" target="_blank" rel="noopener">Inhaltsbedingungen der Linux Foundation</a> und  <a href="https://creativecommons.org/licenses/by/3.0/" target="_blank" rel="noopener">CC BY 3.0</a> verwendet. Diese Fassung wurde übersetzt und neu gestaltet. Alle Marken gehören ihren jeweiligen Inhabern.</p>
</div>
