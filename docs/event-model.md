# Ereignis- und Zustandsmodell

## Ziel

SignalOS soll nicht durch implizite UI-Interaktionen gesteuert werden, sondern durch klar benannte Zustände und Ereignisse.  
Das erhöht Nachvollziehbarkeit, Robustheit und Integrationsfähigkeit.

## Grundprinzip

- Zustände beschreiben, wo sich ein Case oder eine Entity aktuell befindet.
- Ereignisse beschreiben, was passiert ist.
- Aktionen verändern nicht stillschweigend Daten, sondern führen zu nachvollziehbaren Zustandsübergängen.

## Kernzustände für Cases

Die exakten Zustände können je Workflow variieren.  
Für das Grundsystem ist folgendes universelle Muster sinnvoll:

- `draft`
- `intake_pending`
- `intake_structured`
- `discovery_active`
- `enrichment_active`
- `evaluation_pending`
- `approval_required`
- `coordination_active`
- `completed`
- `blocked`
- `escalated`
- `cancelled`

## Kernzustände für Case-Entities

Eine Entity innerhalb eines Cases braucht eine feinere operative Sicht:

- `new`
- `discovered`
- `enriched`
- `queued`
- `contacted`
- `responded`
- `under_review`
- `approved`
- `rejected`
- `archived`

Im Recruiting-Showcase lässt sich damit der Lebenszyklus eines Profils oder Kontakts klar darstellen.

## Ereigniskategorien

### Intake-Ereignisse

- `intake.created`
- `intake.updated`
- `intake.structured`
- `intake.rejected`

### Discovery-Ereignisse

- `entity.discovered`
- `entity.deduplicated`
- `entity.prioritized`

### Enrichment-Ereignisse

- `entity.enrichment_started`
- `entity.enriched`
- `entity.enrichment_failed`

### Messaging-Ereignisse

- `message.generated`
- `message.approval_requested`
- `message.approved`
- `message.sent`
- `reply.received`
- `reply.classified`

### Evaluation-Ereignisse

- `evaluation.started`
- `evaluation.completed`
- `evaluation.overridden`

### Coordination-Ereignisse

- `task.created`
- `task.assigned`
- `task.completed`
- `approval.required`
- `approval.granted`
- `approval.denied`
- `handoff.completed`

### Betriebs- und Sicherheitsereignisse

- `workflow.failed`
- `workflow.retried`
- `integration.failed`
- `policy.violation_detected`
- `access.denied`

## Beispielhafte Übergänge

### Case-Level

- `draft` -> `intake_pending` nach Erstellung
- `intake_pending` -> `intake_structured` nach strukturiertem Intake
- `intake_structured` -> `discovery_active` nach Freigabe oder automatischem Start
- `discovery_active` -> `enrichment_active` sobald relevante Entities vorliegen
- `enrichment_active` -> `evaluation_pending` wenn genügend Evidenz gesammelt wurde
- `evaluation_pending` -> `approval_required` falls High-Impact-Entscheidung ansteht
- `approval_required` -> `coordination_active` nach Freigabe
- `coordination_active` -> `completed` wenn der operative Endpunkt erreicht ist

### Entity-Level

- `new` -> `discovered`
- `discovered` -> `enriched`
- `enriched` -> `queued`
- `queued` -> `contacted`
- `contacted` -> `responded`
- `responded` -> `under_review`
- `under_review` -> `approved` oder `rejected`

## Zustandsregeln

Einige Regeln sollten systemweit gelten:

- kritische Zustandswechsel dürfen nicht still ohne Ereignis erfolgen
- Freigabepflichten müssen als eigener Status sichtbar werden
- Fehlerpfade müssen zu `blocked` oder `escalated` führen, nicht zu stillen Inkonsistenzen
- manuelle Overrides müssen als Ereignis und Audit-Eintrag dokumentiert werden

## Beziehung zwischen Event Log und Audit Log

Die Trennung ist wichtig:

- `event_log` dokumentiert fachliche Zustandsereignisse
- `audit_log` dokumentiert technische und operative Aktionen, inklusive Input, Output und Akteur

Beispiel:

- `message.approved` ist ein fachliches Ereignis
- die konkrete Freigabeaktion eines Managers mit Zeitstempel und Begründung gehört zusätzlich ins Audit Log

## Nutzen für das Portfolio

Ein sichtbares Ereignis- und Zustandsmodell beweist:

- Systemdenken statt UI-Oberfläche ohne Tiefe
- Produktionsreife in Fehlerbehandlung und Orchestrierung
- gute Grundlage für n8n-Workflows, KPIs und Auditierbarkeit
- glaubwürdige Sicherheits- und Freigabemechanik
