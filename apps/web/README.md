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

Unter [`app`](./app/index.html) liegt jetzt eine modulare App Preview mit mehreren Ansichten.

Ziel der App Preview:

- visuelle Richtung festziehen
- Informationsdichte und Priorisierung testen
- Governance und Freigaben sichtbar machen
- echte View-Logik und modulare UI-Struktur zeigen, bevor Framework-Code folgt

Der frühere Stand unter [`prototype`](./prototype/index.html) bleibt als Referenz erhalten.

## Lokal starten

Aus dem Repository-Root:

```bash
npm run dev:web
```

Danach ist der Prototyp unter `http://127.0.0.1:4173` erreichbar.

Der lokale Preview-Server liefert bewusst nur die App-Vorschau und die benötigten UI-Token-Dateien aus. Repository-interne Pfade wie `.git` bleiben blockiert.
