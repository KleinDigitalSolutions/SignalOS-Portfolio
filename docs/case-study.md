# SignalOS Case Study

## One-Line Summary

SignalOS is a portfolio project that reframes recruiting from a collection of disconnected tools into an operational system with visible state, approvals, auditability, and human oversight.

## The Problem

Recruiting workflows are often fragmented across sourcing tools, spreadsheets, ATS screens, inboxes, calendars, and ad hoc notes. That fragmentation creates three recurring problems:

- operators lose visibility into the real bottleneck
- high-impact decisions become inconsistent or hard to trace
- AI support stays shallow because it is added to isolated steps instead of the workflow itself

In other words, many “AI recruiting tools” improve one surface but do not create operational control.

## The Product Idea

SignalOS approaches the space as a Candidate Flow Operating System rather than a dashboard.

The intent is to make the system answer questions like:

- Which cases need attention right now?
- Where is human approval blocking progress?
- Which action changed the current state?
- What should happen next?
- Which actions are sensitive enough to require explicit oversight?

That is the core product shift: from reporting to orchestration.

## What I Wanted To Prove

This project is meant to demonstrate:

- strong AI product framing
- system thinking around workflow state
- practical full-stack implementation
- governance-aware design for sensitive domains
- the ability to turn a concept into a credible local product slice

## Scope of the Current Build

The current implementation is intentionally focused and credible.

Today, SignalOS includes:

- a live web interface
- a local Node.js API
- persistent state in a JSON-backed store
- derived metrics and bottleneck views
- editable cases and approvals
- approval decisions that update the system state
- event logging and audit logging
- restricted static asset serving

This means the project already behaves like a small operational application rather than a pure mockup.

## Product Decisions

### 1. Human-In-The-Loop By Design

Sensitive actions are not fully automated. Approval is a first-class system behavior, not an afterthought. This makes the workflow more realistic for recruiting, where outreach, screening, and decision support can carry both reputational and regulatory risk.

### 2. Derived State Instead of Flat Dashboard Data

The UI is not fed by manually assembled display objects. Stored state is read, then operational views are derived from it. That keeps the system closer to how real products model truth versus presentation.

### 3. Auditability As Product Value

Every meaningful approval decision writes to event and audit logs. This is not only a backend concern. It shapes trust in the UI and supports the broader product story around explainability and controlled automation.

### 4. Local-First Credibility

Instead of skipping directly to speculative cloud architecture, the project first proves the flow locally. That keeps the portfolio honest: the current layer is built, inspectable, and runnable.

## Technical Implementation

### Backend

- `apps/api/src/server.mjs` handles API routes and static delivery
- `apps/api/src/store.mjs` manages persistent local state
- `apps/api/src/derive.mjs` transforms stored data into operational UI state

### Frontend

- `apps/web/app/app.js` coordinates loading, navigation, actions, and form submissions
- `apps/web/app/views.js` defines the screen composition and route-specific rendering
- `apps/web/app/styles.css` provides the product-facing visual language

### Persistence

The current system of record is `data/signalos.json`.

This is a deliberate staging step:

- simple enough for a local portfolio build
- sufficient for validating state transitions
- easy to replace later with a real database once the flow is proven

## Verification

The project has not been treated as a static concept. Functional behaviors were explicitly checked, including:

- syntax validation for changed web and API files
- state retrieval through the API
- approval decision writes
- correct state, audit, and event updates
- editable case and approval flows
- path restriction behavior for sensitive files

The current limitation is not absence of substance. The limitation is that the stack is still in an intentionally local phase.

## Tradeoffs

### Why JSON First Instead of Postgres Immediately

Because the first job of the portfolio piece is to prove product logic and workflow shape, not to pretend infrastructure maturity that is not yet needed.

### Why No Full Auth Layer Yet

Because role-aware boundaries matter, but they are a next-layer concern after the operational surface and state transitions are already behaving correctly.

### Why Recruiting As The First Showcase

Because recruiting is easy to understand, operationally rich, and naturally exposes issues around approvals, orchestration, auditability, and human oversight.

## What Would Make It Even Stronger

The next upgrades that would most improve the portfolio are:

1. creating new cases through the UI
2. moving from JSON persistence to Postgres
3. adding authentication and role-aware permissions
4. introducing one or two carefully chosen real integrations
5. documenting one full error path and fallback behavior

## Why This Is A Strong Portfolio Piece

SignalOS does not try to impress through AI language alone.

It is a stronger portfolio project because it shows:

- product judgment
- architecture thinking
- operational modeling
- implementation discipline
- awareness of governance and system trust

That combination is what makes the project relevant for AI product, applied AI systems, agentic workflow tooling, and full-stack product engineering roles.
