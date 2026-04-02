# Informationsarchitektur

## Ziel

Die Oberfläche von SignalOS darf nicht wie ein passives Reporting-Dashboard wirken.  
Sie muss wie ein operatives Kontrollzentrum funktionieren.

Der Nutzer soll auf einen Blick verstehen:

- wo Aufmerksamkeit nötig ist
- was blockiert
- was sicher automatisiert werden kann
- wo Freigaben fehlen
- welche Kennzahlen sich verschlechtern oder verbessern

## Primäre Nutzerrollen

### Operator

Bearbeitet Fälle, prüft Empfehlungen, steuert Übergaben und löst Ausnahmen.

### Entscheider

Interessiert sich für Engpässe, Risiken, Teamleistung, Durchlaufzeiten und Systemwirkung.

### Admin oder System Owner

Pflegt Regeln, überwacht Integrationen, prüft Audit-Spuren und verwaltet Sicherheitsgrenzen.

## Hauptnavigation

### 1. Command Center

Die zentrale Startseite.  
Zeigt Prioritäten, Engpässe, Risiko-Cluster, fällige Freigaben und operative Kennzahlen.

### 2. Workflows

Übersicht aller laufenden Prozesse mit Status, Verantwortlichkeit, Blockern und SLA-Bezug.

### 3. Cases

Detailansicht einzelner Fälle oder Entitäten mit Timeline, Evidenz, Agentenoutputs und nächsten Aktionen.

### 4. Insights

Metriken, Conversion, Durchlaufzeiten, Ausfallmuster und qualitative Signale.

### 5. Audit

Nachvollziehbarkeit von Entscheidungen, Agentenaktionen, Fehlern und Freigaben.

### 6. Settings

Regeln, Integrationen, Rollen, Zustandslogik und Sicherheitsparameter.

## Command Center Aufbau

Das Command Center ist die wichtigste Seite des Produkts.

Empfohlene Bereiche:

- Top-Zeile mit Systemstatus, offenen Freigaben und kritischen Alerts
- zentrale Prioritätenliste mit Fällen, die sofortige Aufmerksamkeit brauchen
- Bottleneck-Sektion mit Staupunkten entlang des Flows
- KPI-Band für Durchlaufzeit, Konversionsraten, Antwortzeiten und Risikoquote
- Aktionspanel mit empfohlenen nächsten Schritten
- Aktivitätsstream mit relevanten Systemereignissen

## Case Detail

Die Detailseite eines Falls muss mehr leisten als eine Datensatzansicht.

Sie sollte zeigen:

- zusammengefassten Kontext
- aktuelle Phase und Statushistorie
- Evidenz und Herkunft der wichtigsten Signale
- Bewertung mit Scorecard und Risiko-Flags
- generierte Kommunikation
- offene Freigaben
- Timeline aller relevanten Aktionen

## Designrichtung

SignalOS braucht eine visuelle Sprache, die nüchtern, präzise und hochwertig wirkt.

Leitplanken:

- keine generischen Kachelwände
- keine überladenen Admin-Oberflächen
- keine verspielte Startup-Ästhetik
- keine dunkle Sci-Fi-Karikatur ohne funktionalen Mehrwert

Stattdessen:

- klare Raster und starke Typografie
- harte Priorisierung der Informationen
- kontrollierte Farbakzente für Risiko, Status und Aktion
- erkennbarer Fokus auf Steuerbarkeit und Klarheit

## Showcase-Logik

Der erste Showcase nutzt Recruiting als Prozessbeispiel.  
Die Oberfläche selbst soll jedoch so formuliert werden, dass sie auch in anderen High-Stakes-Workflows funktioniert.

Dafür gilt:

- Navigationsbegriffe möglichst universell halten
- Domänensprache gezielt in Detailbereichen einsetzen
- Kernkomponenten generisch entwerfen
- Kennzahlen und Ereignisse so modellieren, dass sie übertragbar bleiben
