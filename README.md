# SignalOS

SignalOS ist ein AI-gestütztes Operating System für komplexe High-Stakes-Workflows.

Es verbindet Intake, Analyse, Anreicherung, Kommunikation, Bewertung, Koordination und Monitoring in einem zusammenhängenden, auditierbaren System. Das Projekt wird als hochwertiges Portfolio-Stück entwickelt und nutzt Recruiting als ersten Showcase, ohne die Produktmarke auf eine einzelne Domäne zu verengen.

## Warum dieses Projekt

Viele AI-Demos zeigen Texte, Widgets oder punktuelle Automatisierungen.  
SignalOS verfolgt einen anderen Anspruch:

- nicht nur Features, sondern Betriebslogik
- nicht nur Automatisierung, sondern kontrollierte Orchestrierung
- nicht nur AI-Output, sondern nachvollziehbare Entscheidungen
- nicht nur Dashboarding, sondern ein echtes Command Center

Das Ziel ist ein System, das operative Reibung reduziert, Durchlaufzeiten verkürzt, Risiko sichtbar macht und menschliche Entscheidungen gezielt unterstützt.

## Produktprinzipien

- AI-First, aber nicht AI-blind
- Human-in-the-loop bei kritischen Schritten
- strukturierte Agenten-Outputs statt unkontrollierter Textartefakte
- Event-getriebene Prozesslogik statt linearer Einmal-Flows
- sichtbare Governance, Logging und Begründbarkeit
- Design auf Enterprise-Niveau statt generischer Demo-Optik

## Erster Showcase

Der erste vertikale Showcase ist Recruiting Operations:

- Intake eines Suchauftrags
- Discovery und Anreicherung relevanter Profile
- personalisierte Kommunikation
- Bewertung entlang nachvollziehbarer Kriterien
- Termin- und Statuskoordination
- Monitoring, Bottlenecks und operative Kennzahlen

Wichtig ist dabei die Produktlogik: SignalOS bleibt ein universelles System, dessen Architektur auch für andere Bereiche wie Partner-Onboarding, Vendor-Ops oder Compliance Intake plausibel ist.

## Kernmodule

- `Intake Engine`
- `Discovery Engine`
- `Enrichment Engine`
- `Messaging Engine`
- `Evaluation Engine`
- `Coordination Engine`
- `Command Center`
- `Audit & Insight Layer`

## Repository-Struktur

```text
.
├── AGENTS.md
├── PROJECT.md
├── README.md
└── docs
    ├── architecture.md
    ├── data-model.md
    ├── event-model.md
    ├── information-architecture.md
    ├── roadmap.md
    └── security-governance.md
```

## Dokumente

- [Projekt-Masterdokument](./PROJECT.md)
- [Architektur](./docs/architecture.md)
- [Datenmodell](./docs/data-model.md)
- [Ereignis- und Zustandsmodell](./docs/event-model.md)
- [Informationsarchitektur](./docs/information-architecture.md)
- [Brand- und Designsystem](./docs/brand-system.md)
- [Demo-Szenario](./docs/demo-scenario.md)
- [Sicherheit und Governance](./docs/security-governance.md)
- [Roadmap](./docs/roadmap.md)

## Qualitätsanspruch

SignalOS wird nicht als schneller Showcase gebaut, sondern als glaubwürdiges Produktkonzept mit technischer und gestalterischer Reife. Jede weitere Umsetzung im Repository muss deshalb vier Ebenen gleichzeitig bedienen:

- Produkt- und Prozessverständnis
- technische Architektur
- Governance und Sicherheit
- visuelle und kommunikative Qualität

## Status

Aktuell entsteht das Fundament:

- Produkt- und Markenrahmen
- Architektur und Modulgrenzen
- Sicherheits- und Governance-Basis
- Informationsarchitektur der Produktoberfläche
- Daten- und Ereignismodell des Systems
- erste visuelle Produkt- und Showcase-Richtung
- Roadmap für die nächste Umsetzungsphase

## Nächste Schritte

- visuelle Produktidentität schärfen
- Screen-System und Command-Center-Flow entwerfen
- technische App-Struktur konkretisieren
- erste API- und UI-Verträge definieren
- erste interaktive Oberfläche implementieren

## Lokale Vorschau

Der aktuelle Web-Prototyp lässt sich ohne zusätzliche Abhängigkeiten lokal starten:

```bash
npm run dev:web
```

Anschließend ist der Stand unter `http://127.0.0.1:4173` erreichbar.

Der Preview-Server ist bewusst eingegrenzt und gibt nur die Web-App-Vorschau sowie benötigte UI-Assets aus.
