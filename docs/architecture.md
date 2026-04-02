# Architektur

## Zielbild

SignalOS ist als AI-gestütztes Operating System für komplexe Prozessketten konzipiert.  
Die Architektur muss nicht nur funktional sein, sondern auch erklären, warum das System belastbar, nachvollziehbar und sicher betrieben werden kann.

## Architekturprinzipien

- Event-getriebene Zustandsübergänge statt linearer Einmalabläufe
- strukturierte Agenten-Outputs statt freier Textverarbeitung
- Postgres als System of Record
- auditierbare Aktionen über Event Log und Audit Log
- klar getrennte Integrationsgrenzen
- Human-in-the-loop für kritische Schritte
- geringe Rechte, explizite Freigaben und defensive Tool-Nutzung

## Ziel-Stack

### Frontend

- Web-App für das Command Center
- Fokus auf operative Steuerung, Fallübersicht, Priorisierung und Freigaben
- Desktop-zentriert, aber responsiv und sauber auf kleineren Geräten

### API und Orchestrierung

- zentraler API-Service für Agentenlogik und Business-Regeln
- Workflow-Orchestrierung mit n8n
- definierte Übergabe zwischen synchroner UI-Interaktion und asynchronen Hintergrundjobs

### Datenhaltung

- Postgres als kanonische Datenbank
- Vektorspeicher über pgvector für fallbezogenen Kontext und semantische Suche
- Event Log für Zustandsereignisse
- Audit Log für Agenten- und Nutzeraktionen

### AI-Layer

- schema-basierte Outputs
- klar abgegrenzte Agentenrollen
- kontrolliertes Tool Calling
- Trennung zwischen Instruktionen, Kontext und untrusted Eingaben

## Konzeptionelle Bausteine

### 1. Intake Engine

Erzeugt aus einem neuen Auftrag oder Fall eine strukturierte Zieldefinition.

Beispielhafte Outputs:

- Prioritäten
- Ausschlusskriterien
- Bewertungskriterien
- Kommunikationswinkel
- empfohlene nächste Schritte

### 2. Discovery Engine

Sammelt relevante Entitäten oder Fälle aus internen und externen Quellen, dedupliziert Ergebnisse und erzeugt eine erste Rangfolge.

### 3. Enrichment Engine

Verdichtet Rohdaten in nutzbaren Kontext mit nachvollziehbarer Herkunft.

### 4. Messaging Engine

Erstellt hochwertige, domänengerechte Kommunikation, die auf echten Signalen statt auf generischen Vorlagen basiert.

### 5. Evaluation Engine

Bewertet Fälle entlang einer Scorecard, erzeugt Risiko-Flags und begründete Empfehlungen.

### 6. Coordination Engine

Steuert Übergänge, Freigaben, Statuswechsel, Eskalationen und Folgeaktionen.

### 7. Command Center

Verdichtet operative Steuerung, Prioritäten, Risiken und Systemzustand in eine klare Oberfläche.

### 8. Audit & Insight Layer

Macht Historie, Entscheidungen, Fehlerpfade und Kennzahlen nachvollziehbar.

## Zustandslogik

Jeder Fall in SignalOS bewegt sich entlang definierter Zustände.  
Die exakten Zustände variieren je nach Domäne, aber das Muster bleibt gleich:

- erfasst
- analysiert
- angereichert
- bewertet
- in Klärung
- freigegeben
- koordiniert
- abgeschlossen
- eskaliert

Die sichtbare Zustandsmaschine ist ein Kernmerkmal des Produkts. Sie verhindert, dass sich operative Steuerung in unsichtbarer Tool-Logik verliert.

## Ereignismodell

SignalOS sollte Ereignisse als First-Class-Konstrukt behandeln.

Beispielhafte Events:

- `intake.created`
- `intake.structured`
- `entity.discovered`
- `entity.enriched`
- `message.generated`
- `message.sent`
- `reply.classified`
- `evaluation.completed`
- `approval.required`
- `approval.granted`
- `workflow.failed`

Dieses Modell erleichtert:

- Retry-Strategien
- Fehleranalyse
- Auditierung
- KPI-Berechnung
- spätere Integrationen

## Integrationsgrenzen

Externe Systeme werden nicht direkt und unkontrolliert aus der Oberfläche aufgerufen.  
Stattdessen gilt:

- UI spricht mit dem API-Service
- API-Service spricht mit Agenten- und Tool-Layern
- n8n übernimmt orchestrierte Hintergrundprozesse
- jede externe Aktion ist im Audit nachvollziehbar

## Produktionsreife im Portfolio

Für das Portfolio ist nicht entscheidend, jede Integration produktiv anzubinden.  
Entscheidend ist, dass die Architektur produktionsfähig gedacht ist.

Deshalb ist es legitim, in frühen Phasen mit:

- Mock-Integrationen
- Seed-Daten
- simulierten Events
- dokumentierten Schnittstellen

zu arbeiten, solange die Systemlogik konsistent bleibt.
