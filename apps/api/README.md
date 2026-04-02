# apps/api

Funktionaler API-Service für Business-Logik, lokalen Zustand, Freigaben und kontrollierte Tool-Nutzung.

Aktueller Verantwortungsbereich:

- lokaler HTTP-Server für App und API
- persistenter Datenbestand über `data/signalos.json`
- Lese-Endpunkte für State, Cases, Workflows, Events, Freigaben und Settings
- Schreibpfad für Freigabe-Entscheidungen inklusive Event- und Audit-Update
- sichere statische Auslieferung nur für erlaubte App- und UI-Pfade

## Einstieg

Aus dem Repository-Root:

```bash
npm run dev:api
```

Danach ist die kombinierte App- und API-Instanz unter `http://127.0.0.1:4173` erreichbar.

## Wichtige Endpunkte

- `GET /api/state`
- `GET /api/cases`
- `GET /api/workflows`
- `GET /api/events`
- `GET /api/approvals`
- `GET /api/settings`
- `POST /api/approvals/:id/decision`

## Persistenz

Standardmäßig nutzt der Server `data/signalos.json`.

Für isolierte Tests kann ein alternativer Store per `SIGNALOS_STORE_PATH` gesetzt werden.
