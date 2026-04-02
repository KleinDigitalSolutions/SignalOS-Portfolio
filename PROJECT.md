# SignalOS

## Zweck dieser Datei

Diese Datei ist unser operatives Masterdokument für das Portfolio-Projekt.  
Ich arbeite ab hier gleichzeitig als Produktmanager und Entwickler. Entscheidungen werden nicht auf ein schnelles Demo-Niveau optimiert, sondern auf ein Portfolio-Stück, das Reife, Architekturverständnis, Systemdenken und Umsetzungsstärke zeigt.

## Arbeitsprämisse

- Kein 08/15-Dashboard
- Kein oberflächlicher AI-Wrapper
- Kein „noch ein Recruiting-Tool“
- Stattdessen: ein glaubwürdiges, AI-First Operating System für komplexe, menschenzentrierte Prozessketten

## Projektname

**SignalOS**

Warum dieser Name:

- universell genug für mehrere Domänen
- klingt nach Steuerung, Priorisierung, Entscheidungslogik und Systemtiefe
- nicht auf Recruiting, HR oder Candidates festgelegt
- als Portfolio-Brand deutlich stärker und langlebiger als ein rein vertikaler Name

## Produktpositionierung

SignalOS ist ein AI-gestütztes Operating System für High-Stakes-Workflows.  
Es orchestriert Intake, Analyse, Anreicherung, Kommunikation, Bewertung, Koordination und Monitoring in einem zusammenhängenden, auditierbaren System.

Die Demo-Story kann Recruiting als primären Anwendungsfall nutzen, aber das Produkt darf sprachlich und visuell nicht auf Recruiting verengt wirken. Die Oberfläche, Informationsarchitektur und Markenlogik müssen so aufgebaut sein, dass SignalOS auch für Sales-Ops, Vendor-Ops, Partner-Onboarding, Compliance Intake oder andere komplexe Prozessketten plausibel erscheint.

## Portfolio-Ziel

Dieses Projekt muss im Portfolio zeigen, dass wir:

- Prozesse zerlegen und neu entwerfen können
- AI sinnvoll in operative Abläufe integrieren
- Agenten nicht als Gimmick, sondern als kontrollierte Systemkomponenten einsetzen
- Produkt, Datenmodell, Governance und UI zusammen denken
- Business-Wirkung klar in operative Kennzahlen übersetzen

Das Stück soll nicht wie eine Feature-Sammlung wirken, sondern wie ein internes Kernsystem, das in einem ambitionierten Unternehmen echte Verantwortung tragen könnte.

## Leitidee

Der Nutzer soll nicht in Tools denken, sondern in Entscheidungen, Engpässen, Risiken und empfohlenen nächsten Schritten.

SignalOS zeigt deshalb nicht primär Tabellen und Formulare, sondern:

- wo der Flow stockt
- welche Fälle Aufmerksamkeit brauchen
- was das System sicher übernehmen kann
- wo menschliche Freigabe nötig ist
- wie sich Durchlaufzeit, Qualität und Conversion entwickeln

## Strategische Abgrenzung

Wir bauen bewusst **kein** klassisches „Dashboard mit KI-Textbox“.  
Wir bauen auch **keine** reine Automationskette ohne Produktoberfläche.

SignalOS muss vier Ebenen gleichzeitig glaubwürdig abdecken:

1. **Betriebslogik**  
   Der Prozess ist modelliert, zustandsbasiert und nachvollziehbar.
2. **Agentische Ausführung**  
   AI-Module erzeugen strukturierte Ergebnisse und handeln nicht unkontrolliert.
3. **Menschliche Steuerung**  
   Kritische Entscheidungen bleiben überprüfbar und übersteuerbar.
4. **Management-Sicht**  
   Wirkung, Risiken und Bottlenecks werden sichtbar gemacht.

## Produktnarrativ

SignalOS ist das Kontrollzentrum für komplexe Pipelines.

Statt dass Teams fünf bis zehn Einzellösungen koordinieren, bündelt SignalOS:

- Intake und Zieldefinition
- Datensammlung und Anreicherung
- Priorisierung und Bewertung
- personalisierte Kommunikation
- Termin- und Statuskoordination
- Audit, Governance und Analytics

Die zentrale Wirkung ist nicht „mehr AI“, sondern **weniger operative Reibung bei höherer Entscheidungsqualität**.

## Kernmodule

Die Modulnamen bleiben bewusst universell:

### 1. Intake Engine

Nimmt einen neuen Auftrag, Fall oder Prozess-Startpunkt entgegen und übersetzt ihn in eine strukturierte Zieldefinition mit Anforderungen, Ausschlusskriterien, Prioritäten und Erfolgssignalen.

### 2. Discovery Engine

Sammelt relevante Entitäten, Datensätze oder Fälle aus verbundenen Quellen, führt Deduplizierung durch und erstellt eine erste Priorisierung.

### 3. Enrichment Engine

Reichert Datensätze mit Kontext, Historie, Signalen, Zusammenfassungen und Evidenzquellen an.

### 4. Messaging Engine

Erzeugt kontextbezogene, hochwertige Kommunikation für E-Mail, interne Notizen, Outreach oder Statusmeldungen. Alle Texte müssen professionell, glaubwürdig und sprachlich sauber sein.

### 5. Evaluation Engine

Bewertet Fälle entlang einer Scorecard, erzeugt Risiko-Flags, Evidenzbezüge und Handlungsempfehlungen. Kein Black-Box-Urteil ohne Begründung.

### 6. Coordination Engine

Steuert Übergaben, Freigaben, Terminabstimmungen, Eskalationen und nächste Schritte entlang definierter Zustände.

### 7. Command Center

Die zentrale Oberfläche für Operatoren und Entscheider. Zeigt Engpässe, Prioritäten, Ausnahmefälle, Performance und empfohlene Aktionen.

### 8. Audit & Insight Layer

Erfasst Ereignisse, Agentenaktionen, Änderungen, Entscheidungen, Fehlerpfade und operative Kennzahlen.

## Architekturprinzipien

- Event-getrieben statt linearer Einmal-Workflows
- Strukturierte Agenten-Outputs statt freier Textartefakte
- Klare Zustandsmaschine statt impliziter Prozesslogik
- Canonical Database als System of Record
- Vektorbasierter Kontext nur dort, wo er echten Mehrwert bringt
- Human-in-the-loop an kritischen Stellen
- vollständige Nachvollziehbarkeit über Audit- und Event-Logs
- robuste Fehlerpfade statt Happy-Path-Demo

## Technische Zielarchitektur

### Backend

- API-Service für Agenten-Orchestrierung
- Postgres als System of Record
- pgvector für Retrieval und fallbezogenen Kontext
- Event Log + Audit Log
- klar getrennte Tool-Schnittstellen

### Workflow-Orchestrierung

- n8n für produktionsnahe Workflow-Steuerung
- Retry-Strategien, Fehlerpfade, Alerts
- entkoppelte Trigger und Aktionen

### Frontend

- Command-Center-Oberfläche statt Formularfriedhof
- starke Informationshierarchie
- visuell reif, nicht generisch
- Desktop zuerst, aber sauber responsive

### AI-Layer

- schema-basierte Outputs
- klar getrennte Aufgaben pro Agent
- kontrolliertes Tool Calling
- keine unkontrollierte Autonomie

## Designanspruch

Dieses Portfolio-Stück muss visuell nach internem Enterprise-Produkt auf hohem Niveau aussehen, nicht nach Hackathon, nicht nach Template, nicht nach Dribbble-Deko ohne Substanz.

Gestalterische Anforderungen:

- markante Typografie
- klare visuelle Hierarchie
- produktreife Oberflächen
- echte Zustandsdarstellung
- hochwertige Diagramme
- glaubwürdige Datenmodelle und Metriken
- keine generischen Kartenraster ohne dramaturgische Führung

## Sprachregel

In allen deutschen Texten innerhalb der Oberfläche, Fallstudie und Projektartefakte verwenden wir echte Umlaute und ß.  
Keine Schreibweisen wie `ae`, `oe`, `ue` oder `ss`, außer ein technischer Kontext verlangt ausdrücklich ASCII.

## Demo-Kontext

Der erste vertikale Showcase bleibt Recruiting, weil die Stellenbeschreibung genau darauf abzielt.  
Aber SignalOS wird nicht als „Recruiting-App“ gebrandet, sondern als universelles Operating System mit einer Recruiting-Demo als starkem Anwendungsfall.

Das bedeutet:

- Markenname und UI bleiben universell
- Domänensprache wird kontrolliert eingesetzt
- Case Study darf Recruiting als Beispiel offen benennen
- Architektur, Komponenten und Produktlogik bleiben verallgemeinerbar

## Was im Portfolio sichtbar sein muss

- eine starke Architektur-Grafik
- ein echter End-to-End-Flow
- eine Oberfläche mit Control-Tower-Charakter
- nachvollziehbare Agentenlogik
- Governance- und Audit-Funktionen
- operative Metriken mit Management-Relevanz
- mindestens ein Bereich, der klar zeigt: Das ist kein Prototyp von gestern

## Nicht verhandelbare Qualitätskriterien

- Jede Oberfläche braucht einen klaren operativen Zweck.
- Jeder Agent braucht ein klar abgegrenztes Mandat.
- Jede Automatisierung braucht sichtbare Kontrolle.
- Jede Empfehlung braucht Evidenz oder Begründung.
- Jede Metrik braucht einen Entscheidungsbezug.
- Jede Designentscheidung muss Reife statt Spielerei signalisieren.

## Umsetzungsphasen

### Phase 1: Fundament

- Markenrahmen für SignalOS festziehen
- Informationsarchitektur definieren
- Kern-User-Flows auswählen
- Datenmodell und Zustände modellieren
- Architekturdiagramm finalisieren

### Phase 2: Systemkern

- Projektstruktur aufsetzen
- Datenmodell implementieren
- erste Agenten-Schemas definieren
- Workflow-Orchestrierung modellieren
- Event- und Audit-Log mitdenken

### Phase 3: Produktoberfläche

- Command Center designen
- Detailseiten für Fälle und Entitäten entwickeln
- Risikologik, Freigaben und Empfehlungen sichtbar machen
- KPI- und Bottleneck-Sicht integrieren

### Phase 4: Showcase-Reife

- visuelle Sprache veredeln
- Demo-Daten glaubwürdig kuratieren
- Storyline für Portfolio und Bewerbung schärfen
- Screenshots, Diagramme und Case Study finalisieren

## Meine Rolle in diesem Projekt

Ich arbeite in diesem Projekt nicht nur als Implementierer, sondern als:

- Produktstratege
- Systemarchitekt
- technischer Lead
- UX-Planer
- Umsetzer

Jede nächste Aufgabe soll gegen dieses Dokument geprüft werden. Wenn etwas nur schnell, aber nicht portfolio-würdig ist, wird es nicht zum Standard erklärt.

## Nächste sinnvolle Artefakte

Als direkte Folge auf dieses Dokument sollten wir erstellen:

1. eine visuelle Produkt- und Markenrichtung für SignalOS
2. eine README/Case-Study-Struktur für das Portfolio
3. eine konkrete App-Architektur mit Ordnerstruktur
4. ein Datenmodell
5. ein Screen-Konzept für das Command Center
6. eine Demo-Story mit realistischen Ereignissen und Zustandswechseln

## Arbeitsregel ab jetzt

SignalOS wird als Premium-Portfolio-Stück behandelt.  
Wir optimieren nicht auf „schnell fertig“, sondern auf „klarer Eindruck von Tiefe, Eigenständigkeit und Umsetzungsstärke“.
