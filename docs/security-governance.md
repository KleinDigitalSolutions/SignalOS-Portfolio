# Sicherheit und Governance

## Grundhaltung

SignalOS verarbeitet potenziell sensible Daten und unterstützt Entscheidungen mit hoher Auswirkung.  
Sicherheit, Governance und Nachvollziehbarkeit sind deshalb Teil des Produktkerns und nicht erst eine spätere Ergänzung.

## Leitprinzipien

- minimale Rechte
- klare Freigabegrenzen
- nachvollziehbare Aktionen
- defensive Agentenarchitektur
- Trennung von trusted und untrusted Inhalten
- sichtbare Unsicherheit statt vorgetäuschter Gewissheit

## Risikofelder

### 1. Prompt Injection

Externe Inhalte können versuchen, Agentenlogik zu manipulieren.  
Schutzmaßnahmen:

- untrusted Inhalte strikt markieren
- Instruktionsbereiche logisch trennen
- Tool-Zugriffe nicht aus externem Text ableiten
- kritische Aktionen nur über explizite, validierte Pfade auslösen

### 2. Sensitive Data Exposure

Personenbezogene oder geschäftskritische Daten dürfen nicht unnötig in Agentenoutputs, Logs oder Oberflächen auftauchen.

Schutzmaßnahmen:

- Datenminimierung
- Redaktions- und Maskierungsstrategien
- rollenbasierte Anzeige
- klare Retention-Regeln

### 3. Excessive Agency

Agenten dürfen keine unkontrollierte operative Macht erhalten.

Schutzmaßnahmen:

- begrenzte Tool-Whitelists
- Freigabepflicht für High-Impact-Aktionen
- scoped permissions je Agent
- strukturierte Outputs als Kontrollpunkt

### 4. Silent Failure

Ein System, das still scheitert, ist in High-Stakes-Prozessen gefährlich.

Schutzmaßnahmen:

- sichtbare Fehlerzustände
- Alerts und Eskalationen
- wiederholbare Ausführungspfade
- Error Workflows in der Orchestrierung

## Governance-Anforderungen

SignalOS sollte schon im Portfolio zeigen, dass folgende Aspekte ernst genommen werden:

- Auditierbarkeit von Entscheidungen
- Human-in-the-loop für kritische Schritte
- nachvollziehbare Begründungen statt Black-Box-Urteile
- kontrollierte Nutzung von Modellen und Tools
- dokumentierte Zuständigkeiten und Systemgrenzen

## Human Oversight

Kritische Bewertungen und externe Aktionen sollen nicht autonom finalisiert werden, wenn sie erhebliche Auswirkungen haben.

Geeignete Eingriffspunkte:

- finale Bewertung
- Ablehnung oder Ausschluss
- sensible Kommunikation
- Statuswechsel mit Außenwirkung
- Massenaktionen

## Logging und Nachvollziehbarkeit

Mindestens diese Ebenen müssen nachvollziehbar sein:

- wer oder was eine Aktion ausgelöst hat
- mit welchem Kontext die Aktion lief
- welches Ergebnis erzeugt wurde
- welche Freigaben oder Overrides erfolgt sind
- ob ein Fehler, Retry oder Fallback auftrat

## Datenschutz und regulatorische Anschlussfähigkeit

Der erste Showcase liegt nah an Recruiting und damit an einem besonders sensiblen Bereich.  
Deshalb muss SignalOS anschlussfähig an Datenschutz-, Kontroll- und Dokumentationspflichten gedacht werden.

Im Portfolio muss sichtbar sein:

- dass menschliche Aufsicht bewusst eingeplant ist
- dass automatisierte Bewertungen nicht als unfehlbar dargestellt werden
- dass Eingaben, Entscheidungen und Freigaben dokumentiert werden
- dass Datenhaltung und Weitergabe minimiert und begründet werden

## Was wir bewusst nicht tun

- keine unkontrollierte Vollautomatisierung kritischer Entscheidungen
- keine unsichtbaren Modellurteile ohne Evidenz
- keine Tool-Freigaben mit überbreiten Rechten
- keine Sicherheitsrhetorik ohne konkrete Produktmaßnahmen
