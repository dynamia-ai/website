---
title: "EffectiveGPU: Die auf HAMi basierende Lösung von SF Technology für heterogene KI-Virtualisierung und Ressourcenpools"
company: "sf-technology"
companyName: "SF Technology"
logo: "/redesign/assets/e2e5754a2a04fd08a050.svg"
date: "2025-09-18"
dateLabel: "2025.09.18"
sourceKind: "CNCF-Fallstudie · Übersetzte Fassung"
sourceUrl: "https://www.cncf.io/case-studies/sf-technology/"
sourceLinkLabel: "CNCF-Original lesen ↗"
outcomeSourceUrl: ""
outcomeSourceLabel: "Schlüsseldatenquelle: Dynamia Network of Officials"
outcomes:
  - value: "37 GPUs"
    label: "Eingesparte GPUs für produktive Modelldienste"
    detail: "65 Dienste auf 28 GPUs"
  - value: "13 GPUs"
    label: "Eingesparte GPUs für Testdienste"
    detail: "19 Dienste auf 6 GPUs"
  - value: "0.5%"
    label: "Geringster beobachteter Leistungsverlust nach Pooling"
    detail: "Niedrigster veröffentlichter Wert; nicht repräsentativ für alle Workloads"
---

## Über SF Technology

SF Technology ist einer der führenden Logistikdienstleister Chinas, die sich schnell bewegen können und weltweit eines der größten und fortschrittlichsten Logistiknetzwerke bedient. Um digitale Transformation und intelligente Logistik optimiert SF Technology den Betrieb, verbessert das Kundenerlebnis und fördert Unternehmensinnovation durch Front Line AI und Claud-native Technologie.

## Herausforderungen

Da die Belastungsgröße und Diversität von KI wachsen, stehen SF Technology und ähnliche Organisationen vor großen Herausforderungen bei der Steigerung der Nutzung histerogener Rechenressourcen wie GPU, NPU:

- **Niedrige Ressourcennutzung:** Die statische Verteilung hat große Anzahl von Rechenressourcen verlassen und GPU-Speicher für lange Zeiträume Leerlauf und nicht in der Lage, andere belastungseffiziente Wiederverwendungen bereitzustellen.
- **Hohe Betriebskosten:** Die erhaltenen Zahlungen für untergenutzte Ressourcen haben die Gesamtkosten des Eigentums an der Infrastruktur deutlich erhöht.
- **@Scheduling ist unflexibel:** Nach der statischen Verteilung konnte sich Scheduler nicht auf die Konjunkturdynamik und die begrenzte Cluster-Elastizität und Skalierbarkeit einstellen.

Unternehmen benötigen einen einheitlichen, flexiblen und effizienten Ansatz, um heterogene KI-Ressourcen über Cluster und Lasten hinweg zu verwalten und zu teilen, während sie Mainstream- und Inlandshardware-Plattformen unterstützen.

## Loesungen

Das Team entwickelte ein Selbststudiumsprogramm für die Bereitstellung von GPU-Pooltechnologie auf Basis des CNCF Sandbox-Projekts Hami.

| Prioritätsindikatoren in Originalsprache | Anmerkungen |
| --- | --- |
| Keine Änderungen | NVIDIA Treiber, Linux Kernel, Task-Spiegel und Quellcode nicht ändern |
| Höchstens 57% | GPU Sparquote für Produktions- und Testcluster, die im ursprünglichen Fokusindikator aufgelistet sind |
| Höchste 100% | Erhöhte Nutzung von GPU durch GPU Virtualisierung |

![Effiziente GPU-Struktur, Quelle: CNCF Original.](/redesign/assets/3270a140c963dd260a9d.png)
*Effiziente GPU-Struktur, Quelle: CNCF Original.*

### HAMi bietet kritische Fähigkeiten

- **Gerätevirtualisierung:** Das Feinpartikel-Splitting-Gerät, Rechenressourcen und GPU-Speicher, wird von Pod geteilt.
- **Resource hardwork:** c) Beschränken Sie die Spezifikationen der Behälter GPU-Memoorie und berechnen Sie Ressourcen, um sicherzustellen, dass Aufgaben nicht über die zugewiesenen Quoten hinausgehen.
- **Heterogene KI berechnet Unterstützung für fit:** Das Computing-Framework unterstützt eine heterogene Plattform wie Ascend, Begum und Shinway Smart Cards, die sich an Mainstream- und heterogene Berechnungen von KI-Frames anpasst.
- **Ein prioritäres GPU-Unternehmen greift:** Aufgaben können als Prioritäten definiert werden, wobei hochprioritätsbezogene Aufgaben die Ressourcen zur Berechnung von Aufgaben mit niedrigerer Priorität erfassen. Wird eine Forderung nach höheren Prioritätsaufgaben durch eine kopierbare Ressource gestellt, so wird die Aufgabe der niedrigeren Priorität automatisch ausgeschaltet; wenn keine Anforderung gestellt wird, wird die Aufgabe der niedrigeren Priorität wieder aufgenommen.
- **Unified Scheduling:** Bietet Kubernetes mit Scheduler Extener und Mutating Webhook, während Unterstützung von kube-scheduler und Volcano, um ein erhöhtes Bewusstsein zu erreichen, taktisch angetriebene Ressourcenzuweisung.
- **Anwendung von Null-Änderungen:** Benutzer können Gerätefreigabe und -Vereinbarung nutzen, ohne bestehende Anwendungen zu ändern.

### Erweiterung der effektiven GPU auf Hami

- **Cross-Node Ressourcen berechnen** Um die Methodik der AI Compute Resourcees für die Synergisierung und vollständige Nutzung von Lowcompute-Ressourcen zu untersuchen, um den Wettbewerb mit Highcompute-Ressourcen zu mildern, Cross Node Scheduling zu erreichen, Effizienz zu verbessern, Usability und Ressourcenwettbewerb zu reduzieren.
- **ICV konnte sich an die Planung anpassen:** Die präzise Lieferung wird durch die Bestimmung des Typs und Anteils einer Verteilung durch prognostizierende Algorithmen, basierend auf Missionstypen und Ressourcenbeziehung erreicht; die Berücksichtigung heterogener Ressourcenausweitung zwischen Knoten, unter Verwendung von zumindest widersprüchlichen Zuordnungsoptionen zur Unterstützung der Elastizität, wird durch die Scheduling-Strategie unterstützt.
- **GPU-Speicherung:** Optimierung der GPU Memoory Distributionsstrategie und Managementmechanismen ohne Veränderung der Physik, Unterstützung von gleichzeitigeren Zuordnungen, Abschwächung des Bedarfs an multi-tasking High-GPU-Memoory-Anforderungen, Erhöhung der Nutzung von GPU-Memoorie und parallele Verarbeitungsfähigkeiten.
- **Ressourcenzuweisung und der Scheduling-Mechanismus:** Die dynamische Zuordnung geeigneter GPS- und anderer Rechenressourcen basiert auf Missionsprioritäten und Ressourcenanforderungen.
- **Ressourcenerfassung und -wiederaufnahme:** Ermöglicht hochrangige Aufgaben, einige der Ressourcen aus den Aufgaben mit niedriger Priorität auf einer Bedarfsbasis abzuleiten; und ermöglicht eine rechtzeitige Wiederherstellung bei der Ausführung von Mandaten oder Ressourcen, wodurch andere Missionen wiederverwendet werden können und den Ressourcenumsatz verbessert wird.
- **Optimierung der Leistungs- und Lastbilanz:** Reduzieren Sie Verzögerungen und Verstopfung beim Warten auf Ressourcen und erhöhen Sie die Effizienz der Implementierung; vermeiden Sie den Verlust der Leistung durch Über-Absorption lokaler Ressourcen durch die Kombination der Gesamtbelastung des Systems, wodurch Stabilität und Effizienz von multitasking parallelen Operationen gewährleistet werden.

Diese Technologien ermöglichen es Teams, mehr Services mit weniger GPUs einzusetzen, Zuordnungen zu Echtzeit-Anforderungsdynamik anzupassen und die heterogene Rechenumgebung zu unterstützen.

## Wirksamkeit der Durchführung

### Inferenzdienste fuer grosse Modelle

Die Einführung von Effictive GPUs kann die Ressourcenauslastung erheblich verbessern und die Betriebskosten senken. So wurden z.B. die auf Effictive GPUs umgeschalteten Produktionsmodelle mit nur 28 GPUs für 65 Dienste eingesetzt, wodurch 37 GPUs eingespart werden.

### Test-Service-Cluster

Die flexible Zuweisung und effiziente Nutzung von Ressourcen ist unerlässlich, um die Effizienz und Kostenkontrolle zu testen. Die Effektive GPU ordnet GPUs an, indem sie Punkte auf unterschiedliche Prüfaufgaben verteilt. Zum Beispiel setzt der Testing Service mit Effective GPUs 19 Dienste für 6 GPUs ein, wodurch 13 GPUs gespart werden, sowohl zur Prüfung von Effizienz als auch zur Senkung der Prüfkosten, wodurch der Einsatz von Ressourcen rationaler wird.

### Spracherkennung

Die Effictive GPU bietet flexible Unterstützung durch die Priorisierung der Planung und Überlagerung von Ressourcen, die Zuordnung von GPUs nach missionsbedingter Dringlichkeit und Ressourcenbedarf dynamisch, so dass hochprioritätsbezogene Aufgaben rechtzeitig zur Verbesserung der Servicequalität eingesetzt werden können.

### National produzierte KI-Hardware Passform

Effictive GPU unterstützt nicht nur Mainstream-GPU, sondern auch Chinas KI-Computing-Plattform für Länder wie Ascend und Bermuda, die Unterstützung heterogener KI-Anwendungen bietet, um eine effiziente Verwaltung und Ressourcennutzung in einer inländischen Umgebung zu erreichen.

<div class="case-source-note">
<p>Original:<a href="https://www.cncf.io/case-studies/sf-technology/" target="_blank" rel="noopener">Effective GPU: A Heterogeneous AI Virtualization Pooling solution by SF technology built on top of HAMi ↗</a><br>Herausgeber: Cloud Native Computing Foundation (CNCF) · 2025-09-18</p><p>Diese lokalisierte Fassung übernimmt die technischen Informationen und den Messumfang des Originalartikels. Sie ist keine offizielle CNCF-Übersetzung. Architekturdiagramme behalten ihren Originaltext. Projektstatus und Produktangaben beziehen sich auf das ursprüngliche Veröffentlichungsdatum.</p><p>Das Original wird unter den  <a href="https://www.linuxfoundation.org/legal/terms" target="_blank" rel="noopener">Inhaltsbedingungen der Linux Foundation</a> und  <a href="https://creativecommons.org/licenses/by/3.0/" target="_blank" rel="noopener">CC BY 3.0</a> verwendet. Diese Fassung wurde übersetzt und neu gestaltet. Alle Marken gehören ihren jeweiligen Inhabern.</p>
</div>
