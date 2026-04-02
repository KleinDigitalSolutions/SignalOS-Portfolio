# SignalOS

SignalOS is a portfolio project for an AI-native operating layer around complex, high-stakes workflows.

The current showcase focuses on Recruiting Operations. The point is not to present another sourcing dashboard or chatbot wrapper, but a system that makes bottlenecks, approvals, operational state, auditability, and human oversight visible and actionable across the candidate flow.

## Why This Project Exists

Many AI portfolio projects show generation quality.
SignalOS is designed to show operational ownership.

It demonstrates how AI can support a real workflow while preserving:

- state clarity
- traceable decisions
- approval boundaries
- system-level visibility
- product-grade interaction design

This is the kind of work that sits between AI product thinking, backend systems, workflow design, and governance.

## What Is Implemented Today

The repository already contains a functional local application, not just concept material:

- a real Node.js server for API delivery and static app hosting
- persistent local state in `data/signalos.json`
- derived application state for metrics, bottlenecks, approvals, and case status
- a web app connected to the live API instead of embedded demo data
- editable cases and approvals in the UI
- approval decisions that write back to state, event log, and audit log
- path-restricted static asset delivery on the server layer

## What This Demonstrates

- product thinking beyond isolated AI features
- end-to-end workflow design instead of prompt-only prototyping
- human-in-the-loop control for sensitive actions
- state modeling and derived operational views
- event and audit awareness as first-class system concerns
- ability to turn an architecture idea into a working local system

## Demo Story

The current SignalOS story is intentionally simple and recruiter-readable:

1. A recruiter or operator opens the command center and sees the live operational state.
2. The system highlights bottlenecks, pending approvals, priority cases, and the current focus case.
3. Cases and approvals can be edited directly through the UI.
4. High-impact approval decisions produce state transitions plus event and audit entries.
5. The result is a small but concrete example of an AI-aware operating surface rather than a static dashboard.

## Technical Snapshot

Current implementation characteristics:

- lightweight local stack with no framework-heavy backend dependency
- modular browser application rendered from client-side JavaScript
- persistent JSON-backed store used as the current system of record
- separation between stored state and derived presentation state
- explicit event and audit append logic for sensitive actions
- security-conscious static file handling

Main implementation areas:

- `apps/api/src/server.mjs`
- `apps/api/src/store.mjs`
- `apps/api/src/derive.mjs`
- `apps/web/app/app.js`
- `apps/web/app/views.js`
- `apps/web/app/styles.css`

## Product and Governance Principles

- AI-first, but not AI-blind
- human approval for high-impact actions
- structured operational state over loose text generation
- visible governance instead of hidden automation
- explainable transitions instead of silent background magic
- product-grade interface decisions instead of generic prototype styling

## My Contribution

This project is intended to show capability across multiple layers:

- product framing and workflow definition
- information architecture and operating-surface design
- backend API and persistence logic
- derived state and event-oriented thinking
- frontend implementation and interaction design
- approval and audit behavior for sensitive actions

## Verification

The implemented system has been checked through focused technical validation, including:

- syntax checks for API and web application files
- API validation for state reads and approval decisions
- persistence checks for state, event, and audit updates
- edit-flow checks for cases and approvals
- server-side path restriction checks for protected files

This is not yet a full production test suite, but it is also not an unverified concept demo.

## What Is Next

The next meaningful layers are:

1. create new cases directly through the UI
2. replace JSON persistence with a real database
3. add authentication and role-aware workflow boundaries
4. introduce selected real integrations where they improve the story

## Local Run

Start the current local application with:

```bash
npm run dev:web
```

Then open:

```text
http://127.0.0.1:4173
```

The app runs directly against the local API and persists state in `data/signalos.json`.

## Recommended Reading

If you want the strongest evaluation path through the repo, start here:

- [Case Study](./docs/case-study.md)
- [Start Page Story](./docs/startpage-story.md)
- [Architecture](./docs/architecture.md)
- [Data Model](./docs/data-model.md)
- [Event Model](./docs/event-model.md)
- [Security and Governance](./docs/security-governance.md)
- [Roadmap](./docs/roadmap.md)

## Repository Structure

```text
.
├── AGENTS.md
├── PROJECT.md
├── README.md
├── apps
│   ├── api
│   └── web
├── data
│   └── signalos.json
├── docs
│   ├── architecture.md
│   ├── brand-system.md
│   ├── case-study.md
│   ├── data-model.md
│   ├── demo-scenario.md
│   ├── event-model.md
│   ├── information-architecture.md
│   ├── roadmap.md
│   ├── security-governance.md
│   └── startpage-story.md
└── packages
    ├── contracts
    └── ui
```
