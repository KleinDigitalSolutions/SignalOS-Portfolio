# apps/web

Geplante Web-Anwendung für das SignalOS Command Center.

Diese App wird später die zentrale Produktoberfläche enthalten:

- Command Center
- Workflow-Übersicht
- Case-Details
- Audit-Ansichten
- Insights und KPI-Dashboards

Aktuell ist dies bewusst nur ein Platzhalter.  
Die konkrete App-Implementierung soll auf den vorhandenen Produktartefakten aufbauen.

## Prototyp

Unter [`prototype`](./prototype/index.html) liegt ein erster statischer Command-Center-Prototyp.

Ziel des Prototyps:

- visuelle Richtung festziehen
- Informationsdichte und Priorisierung testen
- Governance und Freigaben sichtbar machen
- eine hochwertige Portfolio-Anmutung herstellen, bevor Framework-Code folgt

## Lokal starten

Aus dem Repository-Root:

```bash
npm run dev:web
```

Danach ist der Prototyp unter `http://127.0.0.1:4173` erreichbar.
