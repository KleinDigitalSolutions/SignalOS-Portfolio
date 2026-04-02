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

## App Preview

Unter [`app`](./app/index.html) liegt jetzt eine modulare, funktionale App mit mehreren Ansichten.

Ziel des aktuellen Web-Standes:

- visuelle Richtung festziehen
- Informationsdichte und Priorisierung testen
- Governance und Freigaben sichtbar machen
- echte API-Anbindung und modulare UI-Struktur zeigen
- echte Freigabeaktionen mit persistenter Zustandsänderung ermöglichen

Der frühere Stand unter [`prototype`](./prototype/index.html) bleibt als Referenz erhalten.

## Lokal starten

Aus dem Repository-Root:

```bash
npm run dev:web
```

Danach ist die App unter `http://127.0.0.1:4173` erreichbar.

Die Web-App läuft gegen die lokale API und den persistenten Store in `data/signalos.json`.

Der lokale Server liefert bewusst nur die App-Vorschau und die benötigten UI-Token-Dateien aus. Repository-interne Pfade wie `.git` bleiben blockiert.
