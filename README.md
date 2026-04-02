# SignalOS

SignalOS is a portfolio project for an AI-native operating layer around complex, high-stakes workflows.

The goal is not to present another chatbot demo or static dashboard, but a system that makes operational states, bottlenecks, approvals, auditability, and human oversight visible and actionable. The first showcase uses Recruiting Operations, while the underlying product logic is designed to transfer to domains such as partner onboarding, vendor operations, or compliance intake.

## What This Project Demonstrates

- product thinking beyond isolated AI features
- end-to-end workflow design instead of prompt-level prototyping
- human-in-the-loop control for sensitive actions
- event and audit awareness as first-class system concerns
- ability to turn a concept into a working local application

## Current Functional Scope

The repository already contains a functional local application:

- a real Node.js server for API delivery and static app hosting
- persistent local state in `data/signalos.json`
- derived system views for metrics, bottlenecks, case state, and approval status
- editable cases and approvals through the UI
- write actions that update the underlying store, event stream, and audit log
- explicit approval decisions with state transitions and traceability
- restricted static file serving with path protection

## Why It Matters

Many AI projects stop at generation quality. SignalOS focuses on operational reliability:

- which cases need attention right now
- where human approval blocks throughput
- which action changed the system state
- how a decision can be traced afterward
- how automation stays useful without becoming opaque

This is the layer where product judgment, workflow design, and engineering discipline meet.

## Technical Snapshot

Core characteristics of the current implementation:

- lightweight local stack with no framework dependency for the API runtime
- browser app rendered from modular client-side JavaScript
- persistent JSON-backed state to simulate a real operational store
- separation between stored state and derived presentation state
- explicit event and audit append logic for sensitive actions
- security-conscious static asset handling

Main implementation areas:

- `apps/api/src/server.mjs`
- `apps/api/src/store.mjs`
- `apps/api/src/derive.mjs`
- `apps/web/app/app.js`
- `apps/web/app/views.js`

## Product Principles

- AI-first, but not AI-blind
- human approval for high-impact actions
- structured operational state over loose text output
- visible governance instead of hidden automation
- explainable transitions instead of silent background magic
- product-grade interface direction instead of generic prototype styling

## Local Run

The project can be started locally without additional services:

```bash
npm run dev:web
```

Then open:

```text
http://127.0.0.1:4173
```

The app runs directly against the local API and persists state in `data/signalos.json`.

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
│   ├── data-model.md
│   ├── demo-scenario.md
│   ├── event-model.md
│   ├── information-architecture.md
│   ├── roadmap.md
│   └── security-governance.md
└── packages
    ├── contracts
    └── ui
```

## Documentation

Additional project material:

- [Project Master Document](./PROJECT.md)
- [Architecture](./docs/architecture.md)
- [Data Model](./docs/data-model.md)
- [Event Model](./docs/event-model.md)
- [Information Architecture](./docs/information-architecture.md)
- [Brand System](./docs/brand-system.md)
- [Demo Scenario](./docs/demo-scenario.md)
- [Security and Governance](./docs/security-governance.md)
- [Roadmap](./docs/roadmap.md)

## Evaluation Context

For a recruiter, hiring manager, or technical reviewer, SignalOS is best read as evidence of:

- strong product framing for AI systems
- architectural thinking around state, control, and observability
- pragmatic implementation ability across backend and frontend
- awareness of safety, approval design, and audit requirements
- taste for building software that feels like a product, not a mockup
