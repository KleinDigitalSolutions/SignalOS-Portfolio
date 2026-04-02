# Datenmodell

## Ziel

Das Datenmodell von SignalOS muss zwei Aufgaben gleichzeitig erfüllen:

- operative Prozesse sauber abbilden
- Entscheidungen, Agentenoutputs und Zustandswechsel nachvollziehbar machen

Es darf nicht nur auf einen Recruiting-Fall zugeschnitten sein, sondern muss als universelles Modell für High-Stakes-Workflows lesbar bleiben.

## Modellierungsprinzipien

- kanonische Kernobjekte statt verstreuter Spezialtabellen
- klare Trennung zwischen Stammdaten, Prozesszustand, Evidenz und Aktionen
- strukturierte Agentenoutputs als eigene Artefakte
- Ereignisse und Audit-Spuren als getrennte Ebenen
- universelle Feldnamen, domänenspezifische Details in payloads oder spezialisierten Profilen

## Kernentitäten

### workspace

Mandanten- oder Organisationskontext.

Beispielhafte Felder:

- `id`
- `name`
- `slug`
- `industry`
- `default_locale`
- `created_at`

### actor

Akteur, der mit dem System interagiert oder Aktionen auslöst.

Typen:

- menschlicher Nutzer
- Systemprozess
- Agent
- Integration

Beispielhafte Felder:

- `id`
- `workspace_id`
- `type`
- `display_name`
- `role`
- `status`
- `created_at`

### workflow

Definiert die operative Prozessart, zum Beispiel Recruiting Intake, Partner-Onboarding oder Compliance Review.

Beispielhafte Felder:

- `id`
- `workspace_id`
- `name`
- `slug`
- `version`
- `status`

### case

Zentrales operatives Objekt in SignalOS.  
Ein Case repräsentiert einen konkreten Vorgang mit Zuständen, Evidenz, Aktionen und Entscheidungen.

Beispielhafte Felder:

- `id`
- `workspace_id`
- `workflow_id`
- `title`
- `status`
- `priority`
- `owner_actor_id`
- `submitted_by_actor_id`
- `opened_at`
- `closed_at`

### case_profile

Strukturierte Zieldefinition oder Kontextbeschreibung eines Cases.

Beispielhafte Felder:

- `id`
- `case_id`
- `profile_type`
- `summary`
- `must_have`
- `nice_to_have`
- `constraints`
- `success_signals`
- `raw_input_ref`

Im Recruiting-Showcase würde hier etwa das Suchprofil einer Rolle liegen.

### entity

Relevante Einheit innerhalb eines Cases.  
Je nach Domäne kann das ein Profil, eine Firma, ein Datensatz, ein Vendor oder ein Dokument sein.

Beispielhafte Felder:

- `id`
- `workspace_id`
- `entity_type`
- `canonical_name`
- `status`
- `source_confidence`
- `created_at`

### case_entity

Verknüpfung zwischen einem Case und einer Entity.

Beispielhafte Felder:

- `id`
- `case_id`
- `entity_id`
- `stage`
- `fit_score`
- `risk_score`
- `decision_status`
- `last_activity_at`

Im Recruiting-Showcase bildet diese Tabelle die Beziehung zwischen Suchauftrag und Kandidatenprofil ab.

### entity_source

Herkunft und Provenienz einer Entity.

Beispielhafte Felder:

- `id`
- `entity_id`
- `source_system`
- `external_id`
- `source_url`
- `hash_signature`
- `discovered_at`

### enrichment_record

Ergänzende Signale, Historien oder strukturierte Befunde zu einem Case oder einer Entity.

Beispielhafte Felder:

- `id`
- `case_id`
- `entity_id`
- `record_type`
- `summary`
- `evidence_payload`
- `confidence`
- `created_by_actor_id`
- `created_at`

### message

Kommunikationsartefakte für interne oder externe Nachrichten.

Beispielhafte Felder:

- `id`
- `case_id`
- `entity_id`
- `channel`
- `direction`
- `status`
- `subject`
- `body`
- `language`
- `version`
- `created_by_actor_id`
- `sent_at`

### reply

Antwort auf eine vorherige Nachricht oder Rückmeldung innerhalb des Flows.

Beispielhafte Felder:

- `id`
- `message_id`
- `case_id`
- `entity_id`
- `raw_payload`
- `classified_intent`
- `sentiment`
- `requires_follow_up`
- `received_at`

### evaluation

Bewertung eines Cases oder einer Entity anhand definierter Kriterien.

Beispielhafte Felder:

- `id`
- `case_id`
- `entity_id`
- `score_total`
- `score_breakdown`
- `risk_flags`
- `recommendation`
- `confidence`
- `created_by_actor_id`
- `created_at`

### approval

Freigabeobjekt für kritische Aktionen.

Beispielhafte Felder:

- `id`
- `case_id`
- `entity_id`
- `approval_type`
- `status`
- `requested_by_actor_id`
- `decided_by_actor_id`
- `decision_reason`
- `requested_at`
- `decided_at`

### task

Operative Folgeaufgaben oder empfohlene nächste Schritte.

Beispielhafte Felder:

- `id`
- `case_id`
- `entity_id`
- `title`
- `task_type`
- `status`
- `assignee_actor_id`
- `due_at`
- `source_event_id`

### event_log

Fachliche Ereignisse, die den Verlauf eines Cases dokumentieren.

Beispielhafte Felder:

- `id`
- `workspace_id`
- `case_id`
- `entity_id`
- `event_name`
- `payload`
- `occurred_at`
- `caused_by_actor_id`

### audit_log

Technische und operative Nachvollziehbarkeit aller relevanten Aktionen.

Beispielhafte Felder:

- `id`
- `workspace_id`
- `case_id`
- `entity_id`
- `actor_id`
- `action_type`
- `target_type`
- `target_id`
- `input_summary`
- `output_summary`
- `result`
- `created_at`

### vector_document

Semantisch durchsuchbarer Kontext für Cases, Entitäten, Notizen oder Kommunikation.

Beispielhafte Felder:

- `id`
- `workspace_id`
- `case_id`
- `entity_id`
- `document_type`
- `content`
- `embedding`
- `metadata`
- `created_at`

## Logische Beziehungen

Vereinfacht gilt:

- ein `workspace` hat viele `actors`, `workflows`, `cases` und Logs
- ein `case` gehört zu genau einem `workflow`
- ein `case` kann viele `entities`, `messages`, `evaluations`, `tasks`, `events` und `approvals` haben
- eine `entity` kann in mehreren `cases` vorkommen
- `event_log` und `audit_log` sind getrennt, aber miteinander referenzierbar

## Modellvorteile

Dieses Modell ermöglicht:

- universelle Wiederverwendbarkeit über Domänen hinweg
- detaillierte Nachvollziehbarkeit für Portfolio und Produkt
- klare Trennung von Evidenz, Bewertung und Entscheidung
- gute Grundlage für Event-getriebene Workflows
- spätere Rollentrennung und Zugriffskontrolle

## Was bewusst nicht in den Kern gehört

- domänenspezifische Sonderfelder ohne generische Begründung
- unsichtbare Zustandslogik im UI
- unstrukturierte Agentenoutputs als Primärdaten
- Vermischung von Audit- und Fachereignissen
