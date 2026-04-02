import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, extname, join, normalize, relative, resolve } from "node:path";

import { deriveState } from "./derive.mjs";
import { createId, nowTimestamp, readStore, writeStore } from "./store.mjs";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(join(SCRIPT_DIR, "../../.."));
const HOST = "127.0.0.1";
const PORT = Number(process.env.PORT || 4173);
const ENTRYPOINT = resolve(join(ROOT, "apps/web/app/index.html"));
const ALLOWED_PREFIXES = [
  resolve(join(ROOT, "apps/web/app")),
  resolve(join(ROOT, "packages/ui/src")),
];

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

const CASE_STATUS_LABELS = {
  approval_required: "Freigabe erforderlich",
  escalated: "Eskaliert",
  evaluation_pending: "Bewertung ausstehend",
  coordination_ready: "Bereit für Koordination",
};

const CASE_STATUS_VALUES = new Set(Object.keys(CASE_STATUS_LABELS));
const APPROVAL_RISK_VALUES = new Set(["warning", "risk", "live"]);

const DEFAULT_FLOW_STAGES = [
  {
    id: "intake",
    label: "Intake",
    status: "done",
    summary: "Rollenbrief strukturiert und im System dokumentiert.",
  },
  {
    id: "discovery",
    label: "Discovery",
    status: "active",
    summary: "Kandidatenvorschläge und erste Evidenz werden aufgebaut.",
  },
  {
    id: "outreach",
    label: "Outreach",
    status: "pending",
    summary: "Personalisierte Ansprache folgt nach Review der Shortlist.",
  },
  {
    id: "screening",
    label: "Screening",
    status: "pending",
    summary: "Replies und CV-Signale werden nach erstem Kontakt klassifiziert.",
  },
];

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  response.end(`${JSON.stringify(payload)}\n`);
}

function sendText(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-store",
  });
  response.end(payload);
}

function cleanString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function sanitizeStringList(value) {
  if (Array.isArray(value)) {
    return value.map((entry) => cleanString(entry)).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/\r?\n|,/)
      .map((entry) => cleanString(entry))
      .filter(Boolean);
  }

  return [];
}

function requireNonEmptyString(value, field) {
  const cleaned = cleanString(value);
  if (!cleaned) {
    const error = new Error(field);
    error.code = "invalid_field";
    throw error;
  }

  return cleaned;
}

function requireInteger(value, field, min, max) {
  const numeric = Number(value);
  if (!Number.isInteger(numeric) || numeric < min || numeric > max) {
    const error = new Error(field);
    error.code = "invalid_field";
    throw error;
  }

  return numeric;
}

function requireEnum(value, allowedValues, field) {
  if (!allowedValues.has(value)) {
    const error = new Error(field);
    error.code = "invalid_field";
    throw error;
  }

  return value;
}

function resolveStaticPath(pathname) {
  if (pathname === "/" || pathname === "/index.html") {
    return ENTRYPOINT;
  }

  const safePath = normalize(pathname);
  const relativePath = safePath.replace(/^[/\\]+/, "");
  const candidate = resolve(join(ROOT, relativePath));

  if (!candidate.startsWith(ROOT)) {
    return null;
  }

  const isAllowed = ALLOWED_PREFIXES.some((prefix) => {
    const rel = relative(prefix, candidate);
    return rel === "" || (!rel.startsWith("..") && !rel.startsWith("../") && !rel.startsWith("..\\"));
  });

  return isAllowed ? candidate : null;
}

async function readRequestBody(request) {
  return new Promise((resolveBody, rejectBody) => {
    const chunks = [];
    let size = 0;

    request.on("data", (chunk) => {
      size += chunk.length;
      if (size > 32 * 1024) {
        rejectBody(new Error("payload_too_large"));
        request.destroy();
        return;
      }
      chunks.push(chunk);
    });

    request.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8").trim();
      if (!raw) {
        resolveBody({});
        return;
      }

      try {
        resolveBody(JSON.parse(raw));
      } catch {
        rejectBody(new Error("invalid_json"));
      }
    });

    request.on("error", rejectBody);
  });
}

function appendApprovalDecision(store, approval, decision, actor) {
  const eventName = decision === "approved" ? "approval.granted" : "approval.denied";
  const actorLabel = actor || "Human Oversight";
  const title = decision === "approved" ? "Freigabe erteilt" : "Freigabe abgelehnt";
  const result = decision === "approved" ? "Freigabe abgeschlossen" : "Freigabe verweigert";

  approval.status = decision;
  approval.decidedAt = nowTimestamp();
  approval.decidedBy = actorLabel;

  store.events.unshift({
    id: createId("event"),
    severity: decision === "approved" ? "info" : "warning",
    eventName,
    title: `${title}: ${approval.title}`,
    summary: `${actorLabel} hat die Freigabe für "${approval.title}" ${decision === "approved" ? "erteilt" : "abgelehnt"}.`,
    meta: `${approval.decidedAt} · ${actorLabel}`,
  });

  store.audit.unshift({
    id: createId("audit"),
    action: eventName,
    actor: actorLabel,
    target: approval.title,
    result,
    timestamp: approval.decidedAt,
  });

  const relatedPriority = store.priorities.find((priority) => priority.id === approval.caseId);
  if (relatedPriority) {
    const detail = ensureCaseDetail(store, approval.caseId, relatedPriority);
    relatedPriority.updatedAt = approval.decidedAt;
    if (decision === "approved") {
      relatedPriority.riskFlags = relatedPriority.riskFlags.filter((flag) => flag !== "SLA droht zu reißen");
    }

    if (
      approval.kind === "outreach" &&
      detail.outreachDraft &&
      (detail.outreachDraft.approvalId === approval.id || detail.outreachDraft.id === approval.draftId)
    ) {
      detail.outreachDraft.status = decision === "approved" ? "approved" : "needs_revision";
      detail.outreachDraft.lastUpdatedAt = approval.decidedAt;

      if (decision === "approved") {
        detail.openDecision = "Outreach über den gewählten Kanal auslösen und Reply-Signale monitoren.";
        detail.nextActions = [
          "Outreach versenden",
          "Reply-Tracking aktivieren",
          "Screening-Signale nach erster Antwort aktualisieren",
        ];
        detail.riskFlags = removeFlag(detail.riskFlags, "Outreach wartet auf Freigabe");
        detail.riskFlags = removeFlag(detail.riskFlags, "Outreach-Draft überarbeiten");
        relatedPriority.riskFlags = removeFlag(relatedPriority.riskFlags, "Outreach wartet auf Freigabe");
        relatedPriority.riskFlags = removeFlag(relatedPriority.riskFlags, "Outreach-Draft überarbeiten");
        updateFlowStage(detail.flow, "outreach", "active", "Outreach ist freigegeben und bereit für die Ausführung.");
        updateFlowStage(detail.flow, "screening", "pending", "Reply-Klassifizierung startet nach dem Versand.");
      } else {
        detail.openDecision = "Outreach-Draft überarbeiten und erneut zur Freigabe vorlegen.";
        detail.nextActions = [
          "Feedback aus Ablehnung einarbeiten",
          "Rationale oder Tonalität schärfen",
          "Neue Freigabe anfordern",
        ];
        detail.riskFlags = removeFlag(detail.riskFlags, "Outreach wartet auf Freigabe");
        detail.riskFlags = ensureFlag(detail.riskFlags, "Outreach-Draft überarbeiten");
        relatedPriority.riskFlags = removeFlag(relatedPriority.riskFlags, "Outreach wartet auf Freigabe");
        relatedPriority.riskFlags = ensureFlag(relatedPriority.riskFlags, "Outreach-Draft überarbeiten");
        updateFlowStage(detail.flow, "outreach", "active", "Outreach wurde gestoppt und wartet auf einen überarbeiteten Draft.");
      }

      const pendingApprovalsForCase = store.approvals.filter(
        (item) => item.caseId === approval.caseId && item.status === "pending",
      ).length;

      relatedPriority.status =
        pendingApprovalsForCase > 0
          ? "approval_required"
          : decision === "approved"
            ? "coordination_ready"
            : "evaluation_pending";
      relatedPriority.statusLabel = CASE_STATUS_LABELS[relatedPriority.status];
    }
  }
}

function syncFocusCase(store, priority) {
  if (!store.focusCase || store.focusCase.id !== priority.id) {
    return;
  }

  store.focusCase.title = priority.title;
  store.focusCase.domainLabel = priority.domainLabel;
}

function ensureFlag(list, flag) {
  if (!Array.isArray(list)) {
    return [flag];
  }

  return list.includes(flag) ? list : [...list, flag];
}

function removeFlag(list, flag) {
  return Array.isArray(list) ? list.filter((entry) => entry !== flag) : [];
}

function ensureCaseDetailsStore(store) {
  if (!Array.isArray(store.caseDetails)) {
    store.caseDetails = [];
  }

  if (store.focusCase?.id && !store.caseDetails.some((entry) => entry.caseId === store.focusCase.id)) {
    const entities = Array.isArray(store.focusCase.entities) ? [...store.focusCase.entities] : [];

    store.caseDetails.push({
      caseId: store.focusCase.id,
      summary: store.focusCase.summary,
      openDecision: store.focusCase.openDecision,
      riskFlags: Array.isArray(store.focusCase.riskFlags) ? [...store.focusCase.riskFlags] : [],
      nextActions: Array.isArray(store.focusCase.nextActions) ? [...store.focusCase.nextActions] : [],
      entities,
      roleBrief: {
        mission: store.focusCase.summary,
        mustHaves: ["Agentic Delivery", "Workflow-Orchestrierung", "Stakeholder-Kommunikation"],
        niceToHaves: ["Recruiting Ops Erfahrung", "Sourcing-Automatisierung"],
        location: "Remote / Deutschland",
        urgency: "hoch",
        targetStart: "innerhalb von 6 Wochen",
        outreachAngle: "Strategische Rolle mit hoher Sichtbarkeit und unmittelbarem Hebel auf operative Qualität.",
      },
      flow: DEFAULT_FLOW_STAGES.map((stage) => ({ ...stage })),
      outreachDraft: buildDefaultOutreachDraft(store.focusCase.title, entities[0]),
    });
  }

  return store.caseDetails;
}

function fallbackEntities(title) {
  return [
    {
      id: createId("entity"),
      displayName: "Kernprofil",
      roleLabel: title,
      status: "under_review",
      fitScore: 88,
      riskScore: 34,
      confidence: 0.74,
      lastSignal: "Must-haves teilweise bestätigt, Enrichment läuft",
    },
    {
      id: createId("entity"),
      displayName: "Transferprofil",
      roleLabel: `${title} mit angrenzender Domäne`,
      status: "queued",
      fitScore: 79,
      riskScore: 46,
      confidence: 0.66,
      lastSignal: "Gute Projektsignale, aber Seniorität wird geprüft",
    },
    {
      id: createId("entity"),
      displayName: "Stretch-Profil",
      roleLabel: `${title} mit Führungsfokus`,
      status: "queued",
      fitScore: 72,
      riskScore: 58,
      confidence: 0.61,
      lastSignal: "Hohe Relevanz, benötigt zusätzliche Evidenz",
    },
  ];
}

function buildDefaultOutreachDraft(title, entity) {
  const targetLabel = entity?.displayName || "priorisiertes Profil";

  return {
    id: createId("outreach"),
    targetEntityId: entity?.id || null,
    targetEntityLabel: targetLabel,
    channel: "email",
    tone: "präzise und persönlich",
    subject: `${title}: kurzer Austausch zu einer AI-First-Rolle?`,
    opening: `Hallo ${targetLabel},`,
    body: `dein Profil passt auffallend gut zu einer Rolle, in der agentische Workflows, operative Ownership und sichtbarer Hebel auf Recruiting-Prozesse zusammenkommen.`,
    rationale: "Hoher System Fit, klare Delivery-Signale und relevante Nähe zu den priorisierten Must-haves.",
    status: "draft",
    approvalOwner: "Hiring Lead",
    approvalDue: "heute, 16:00 Uhr",
    approvalRisk: "warning",
    approvalId: null,
    lastUpdatedAt: nowTimestamp(),
  };
}

function updateFlowStage(flow, stageId, status, summary) {
  if (!Array.isArray(flow)) {
    return;
  }

  const stage = flow.find((entry) => entry.id === stageId);
  if (!stage) {
    return;
  }

  stage.status = status;
  if (summary) {
    stage.summary = summary;
  }
}

function ensureCaseDetail(store, caseId, priority) {
  const caseDetails = ensureCaseDetailsStore(store);
  let detail = caseDetails.find((entry) => entry.caseId === caseId);

  if (!detail) {
    const entities = fallbackEntities(priority.title);

    detail = {
      caseId,
      summary: `${priority.title} befindet sich im operativen Review und wird entlang des Candidate Flows priorisiert.`,
      openDecision: "Rollenbrief validieren und erste Shortlist für Discovery vorbereiten.",
      riskFlags: Array.isArray(priority.riskFlags) ? [...priority.riskFlags] : [],
      nextActions: [
        "Role Brief finalisieren",
        "Discovery-Shortlist priorisieren",
        "Outreach-Winkel für erste Kontakte definieren",
      ],
      entities,
      roleBrief: {
        mission: `${priority.title} als priorisierte Rolle im ${priority.domainLabel} sauber strukturieren und in den Flow überführen.`,
        mustHaves: ["Domänenrelevanz", "Nachweisbare Delivery", "Kommunikationsstärke"],
        niceToHaves: ["AI-First Arbeitsweise", "Stakeholder-Erfahrung"],
        location: "Remote / Hybrid",
        urgency: "mittel",
        targetStart: "in Abstimmung",
        outreachAngle: "Hoher Hebel auf Prozessqualität und Geschwindigkeit.",
      },
      flow: DEFAULT_FLOW_STAGES.map((stage) => ({ ...stage })),
      outreachDraft: buildDefaultOutreachDraft(priority.title, entities[0]),
    };
    caseDetails.push(detail);
  }

  if (!Array.isArray(detail.entities) || detail.entities.length === 0) {
    detail.entities = fallbackEntities(priority.title);
  }

  if (!detail.roleBrief) {
    detail.roleBrief = {
      mission: `${priority.title} als priorisierte Rolle im ${priority.domainLabel} sauber strukturieren und in den Flow überführen.`,
      mustHaves: ["Domänenrelevanz", "Nachweisbare Delivery", "Kommunikationsstärke"],
      niceToHaves: ["AI-First Arbeitsweise", "Stakeholder-Erfahrung"],
      location: "Remote / Hybrid",
      urgency: "mittel",
      targetStart: "in Abstimmung",
      outreachAngle: "Hoher Hebel auf Prozessqualität und Geschwindigkeit.",
    };
  }

  if (!Array.isArray(detail.flow) || detail.flow.length === 0) {
    detail.flow = DEFAULT_FLOW_STAGES.map((stage) => ({ ...stage }));
  }

  if (!detail.outreachDraft) {
    detail.outreachDraft = buildDefaultOutreachDraft(priority.title, detail.entities[0]);
  }

  return detail;
}

function buildCaseDetail(payload, priority) {
  const mission = requireNonEmptyString(payload.mission, "mission");
  const mustHaves = sanitizeStringList(payload.mustHaves);
  const niceToHaves = sanitizeStringList(payload.niceToHaves);
  const location = requireNonEmptyString(payload.location, "location");
  const urgency = requireNonEmptyString(payload.urgency, "urgency");
  const targetStart = requireNonEmptyString(payload.targetStart, "targetStart");
  const outreachAngle = requireNonEmptyString(payload.outreachAngle, "outreachAngle");
  const entities = fallbackEntities(priority.title);

  return {
    caseId: priority.id,
    summary: mission,
    openDecision: "Role Brief prüfen und Discovery für die erste Kandidatenwelle starten.",
    riskFlags: [...priority.riskFlags],
    nextActions: [
      "Shortlist für Discovery bestätigen",
      "Enrichment-Signale für die ersten Profile prüfen",
      "Outreach-Winkel vor Versand abstimmen",
    ],
    entities,
    roleBrief: {
      mission,
      mustHaves,
      niceToHaves,
      location,
      urgency,
      targetStart,
      outreachAngle,
    },
    flow: DEFAULT_FLOW_STAGES.map((stage) => ({ ...stage })),
    outreachDraft: buildDefaultOutreachDraft(priority.title, entities[0]),
  };
}

function appendUpdateEvent(store, type, title, summary, actor, target) {
  const timestamp = nowTimestamp();

  store.events.unshift({
    id: createId("event"),
    severity: "info",
    eventName: `${type}.updated`,
    title,
    summary,
    meta: `${timestamp} · ${actor}`,
  });

  store.audit.unshift({
    id: createId("audit"),
    action: `${type}.updated`,
    actor,
    target,
    result: "Änderung gespeichert",
    timestamp,
  });
}

function appendCreateEvent(store, title, summary, actor, target) {
  const timestamp = nowTimestamp();

  store.events.unshift({
    id: createId("event"),
    severity: "info",
    eventName: "case.created",
    title,
    summary,
    meta: `${timestamp} · ${actor}`,
  });

  store.audit.unshift({
    id: createId("audit"),
    action: "case.created",
    actor,
    target,
    result: "Case angelegt",
    timestamp,
  });
}

function appendOutreachApprovalRequested(store, approval, actor) {
  const timestamp = nowTimestamp();

  store.events.unshift({
    id: createId("event"),
    severity: approval.risk === "risk" ? "warning" : "info",
    eventName: "approval.required",
    title: `Freigabe für Outreach-Draft angefordert`,
    summary: `${actor} hat für "${approval.title}" eine menschliche Freigabe angefordert.`,
    meta: `${timestamp} · ${actor}`,
  });

  store.audit.unshift({
    id: createId("audit"),
    action: "approval.required",
    actor,
    target: approval.title,
    result: "Outreach-Freigabe angelegt",
    timestamp,
  });
}

function createCase(store, payload) {
  const actor = cleanString(payload.actor) || "Portfolio Operator";
  const title = requireNonEmptyString(payload.title, "title");
  const domainLabel = requireNonEmptyString(payload.domainLabel, "domainLabel");
  const ownerName = requireNonEmptyString(payload.ownerName, "ownerName");
  const fitScore = requireInteger(payload.fitScore, "fitScore", 0, 100);
  const riskFlags = sanitizeStringList(payload.riskFlags);

  const priority = {
    id: createId("case"),
    title,
    domainLabel,
    status: "evaluation_pending",
    statusLabel: CASE_STATUS_LABELS.evaluation_pending,
    ownerName,
    openApprovals: 0,
    fitScore,
    riskFlags,
    updatedAt: nowTimestamp(),
  };

  store.priorities.unshift(priority);
  ensureCaseDetailsStore(store).unshift(buildCaseDetail(payload, priority));
  store.focusCase = {
    id: priority.id,
    title: priority.title,
    domainLabel: priority.domainLabel,
    statusLabel: "Bewertung ausstehend",
    summary: payload.mission,
    openDecision: "Role Brief prüfen und Discovery für die erste Kandidatenwelle starten.",
    riskFlags,
    nextActions: [
      "Shortlist für Discovery bestätigen",
      "Enrichment-Signale für die ersten Profile prüfen",
      "Outreach-Winkel vor Versand abstimmen",
    ],
    entities: fallbackEntities(priority.title),
  };

  appendCreateEvent(
    store,
    `Neuer Candidate-Flow-Fall: ${priority.title}`,
    `${actor} hat einen neuen Recruiting-Fall inklusive Role Brief und initialem Flow angelegt.`,
    actor,
    priority.title,
  );

  return priority;
}

function updateOutreachDraft(store, caseId, payload) {
  const priority = store.priorities.find((item) => item.id === caseId);
  if (!priority) {
    return null;
  }

  const detail = ensureCaseDetail(store, caseId, priority);
  const draft = detail.outreachDraft;
  const actor = cleanString(payload.actor) || "Portfolio Operator";
  const changedFields = [];

  const nextValues = {
    targetEntityLabel: requireNonEmptyString(payload.targetEntityLabel, "targetEntityLabel"),
    channel: requireNonEmptyString(payload.channel, "channel"),
    tone: requireNonEmptyString(payload.tone, "tone"),
    subject: requireNonEmptyString(payload.subject, "subject"),
    opening: requireNonEmptyString(payload.opening, "opening"),
    body: requireNonEmptyString(payload.body, "body"),
    rationale: requireNonEmptyString(payload.rationale, "rationale"),
    approvalOwner: requireNonEmptyString(payload.approvalOwner, "approvalOwner"),
    approvalDue: requireNonEmptyString(payload.approvalDue, "approvalDue"),
    approvalRisk: requireEnum(payload.approvalRisk, APPROVAL_RISK_VALUES, "approvalRisk"),
  };

  const assign = (field, nextValue) => {
    const previous = JSON.stringify(draft[field]);
    const next = JSON.stringify(nextValue);
    if (previous !== next) {
      draft[field] = nextValue;
      changedFields.push(field);
    }
  };

  if ("targetEntityId" in payload) {
    assign("targetEntityId", cleanString(payload.targetEntityId) || null);
  }

  Object.entries(nextValues).forEach(([field, value]) => {
    assign(field, value);
  });

  if (changedFields.length > 0) {
    draft.lastUpdatedAt = nowTimestamp();

    if (draft.status !== "pending_approval") {
      draft.status = "draft";
      draft.approvalId = null;
    }

    detail.openDecision =
      draft.status === "pending_approval"
        ? "Freigabe für Outreach-Draft prüfen oder bei Risiko ablehnen."
        : "Outreach-Draft finalisieren und anschließend zur Freigabe vorlegen.";
    detail.nextActions =
      draft.status === "pending_approval"
        ? ["Freigabe priorisieren", "Sensible Außenwirkung prüfen", "Nach Entscheidung Flow fortsetzen"]
        : ["Draft sprachlich prüfen", "Kanal und Timing abstimmen", "Freigabe anfordern"];

    updateFlowStage(
      detail.flow,
      "outreach",
      draft.status === "pending_approval" ? "active" : "pending",
      draft.status === "pending_approval"
        ? "Outreach-Draft liegt zur menschlichen Freigabe vor."
        : "Outreach-Winkel und Ansprache werden für die erste Welle vorbereitet.",
    );

    priority.updatedAt = draft.lastUpdatedAt;
    appendUpdateEvent(
      store,
      "outreach",
      `Outreach-Draft aktualisiert: ${priority.title}`,
      `${actor} hat ${changedFields.join(", ")} für den Outreach-Draft von "${priority.title}" aktualisiert.`,
      actor,
      priority.title,
    );
  }

  return draft;
}

function requestOutreachApproval(store, caseId, payload) {
  const priority = store.priorities.find((item) => item.id === caseId);
  if (!priority) {
    return null;
  }

  const detail = ensureCaseDetail(store, caseId, priority);
  const draft = detail.outreachDraft;
  const actor = cleanString(payload.actor) || "Portfolio Operator";

  if (!cleanString(draft.subject) || !cleanString(draft.opening) || !cleanString(draft.body) || !cleanString(draft.rationale)) {
    const error = new Error("outreachDraft");
    error.code = "invalid_field";
    throw error;
  }

  const existingPending = draft.approvalId
    ? store.approvals.find((item) => item.id === draft.approvalId && item.status === "pending")
    : null;

  if (existingPending) {
    const error = new Error("approval_pending");
    error.code = "approval_pending";
    throw error;
  }

  const approval = {
    id: createId("approval"),
    caseId: priority.id,
    title: `Outreach an ${draft.targetEntityLabel}`,
    owner: draft.approvalOwner || priority.ownerName,
    reason: `${draft.rationale} Kanal: ${draft.channel}.`,
    due: draft.approvalDue || "heute, 16:00 Uhr",
    risk: APPROVAL_RISK_VALUES.has(draft.approvalRisk) ? draft.approvalRisk : "warning",
    status: "pending",
    kind: "outreach",
    draftId: draft.id,
  };

  store.approvals.unshift(approval);
  draft.status = "pending_approval";
  draft.approvalId = approval.id;
  draft.lastUpdatedAt = nowTimestamp();
  detail.openDecision = "Freigabe für Outreach-Draft prüfen oder bei Risiko ablehnen.";
  detail.nextActions = [
    "Freigabe im Audit-Board priorisieren",
    "Sensible Außenwirkung prüfen",
    "Nach Freigabe Versand und Reply-Tracking auslösen",
  ];
  detail.riskFlags = removeFlag(detail.riskFlags, "Outreach-Draft überarbeiten");
  detail.riskFlags = ensureFlag(detail.riskFlags, "Outreach wartet auf Freigabe");
  priority.riskFlags = removeFlag(priority.riskFlags, "Outreach-Draft überarbeiten");
  priority.riskFlags = ensureFlag(priority.riskFlags, "Outreach wartet auf Freigabe");
  priority.status = "approval_required";
  priority.statusLabel = CASE_STATUS_LABELS.approval_required;
  priority.updatedAt = draft.lastUpdatedAt;

  updateFlowStage(detail.flow, "discovery", "done", "Discovery-Shortlist wurde priorisiert und an Outreach übergeben.");
  updateFlowStage(detail.flow, "outreach", "active", "Outreach-Draft liegt zur menschlichen Freigabe vor.");

  appendOutreachApprovalRequested(store, approval, actor);
  return approval;
}

function updateCase(store, caseId, payload) {
  const priority = store.priorities.find((item) => item.id === caseId);
  if (!priority) {
    return null;
  }

  const title = requireNonEmptyString(payload.title, "title");
  const domainLabel = requireNonEmptyString(payload.domainLabel, "domainLabel");
  const ownerName = requireNonEmptyString(payload.ownerName, "ownerName");
  const status = requireEnum(payload.status, CASE_STATUS_VALUES, "status");
  const fitScore = requireInteger(payload.fitScore, "fitScore", 0, 100);
  const riskFlags = sanitizeStringList(payload.riskFlags);
  const summary = cleanString(payload.summary);
  const openDecision = cleanString(payload.openDecision);
  const nextActions = sanitizeStringList(payload.nextActions);
  const actor = cleanString(payload.actor) || "Portfolio Operator";
  const changedFields = [];
  const detail = ensureCaseDetail(store, caseId, priority);

  const assign = (target, field, nextValue) => {
    const previous = JSON.stringify(target[field]);
    const next = JSON.stringify(nextValue);
    if (previous !== next) {
      target[field] = nextValue;
      changedFields.push(field);
    }
  };

  assign(priority, "title", title);
  assign(priority, "domainLabel", domainLabel);
  assign(priority, "ownerName", ownerName);
  assign(priority, "status", status);
  assign(priority, "statusLabel", CASE_STATUS_LABELS[status]);
  assign(priority, "fitScore", fitScore);
  assign(priority, "riskFlags", riskFlags);

  assign(detail, "summary", summary);
  assign(detail, "openDecision", openDecision);
  assign(detail, "riskFlags", riskFlags);
  assign(detail, "nextActions", nextActions);

  if ("mission" in payload) {
    assign(detail.roleBrief, "mission", cleanString(payload.mission));
  }
  if ("mustHaves" in payload) {
    assign(detail.roleBrief, "mustHaves", sanitizeStringList(payload.mustHaves));
  }
  if ("niceToHaves" in payload) {
    assign(detail.roleBrief, "niceToHaves", sanitizeStringList(payload.niceToHaves));
  }
  if ("location" in payload) {
    assign(detail.roleBrief, "location", cleanString(payload.location));
  }
  if ("urgency" in payload) {
    assign(detail.roleBrief, "urgency", cleanString(payload.urgency));
  }
  if ("targetStart" in payload) {
    assign(detail.roleBrief, "targetStart", cleanString(payload.targetStart));
  }
  if ("outreachAngle" in payload) {
    assign(detail.roleBrief, "outreachAngle", cleanString(payload.outreachAngle));
  }

  if (store.focusCase?.id === priority.id) {
    assign(store.focusCase, "title", title);
    assign(store.focusCase, "domainLabel", domainLabel);
    assign(store.focusCase, "summary", detail.summary);
    assign(store.focusCase, "openDecision", detail.openDecision);
    assign(store.focusCase, "riskFlags", detail.riskFlags);
    assign(store.focusCase, "nextActions", detail.nextActions);
    assign(store.focusCase, "entities", detail.entities);
  }

  priority.updatedAt = nowTimestamp();
  const uniqueChangedFields = [...new Set(changedFields)];

  if (uniqueChangedFields.length > 0) {
    appendUpdateEvent(
      store,
      "case",
      `Case aktualisiert: ${priority.title}`,
      `${actor} hat ${uniqueChangedFields.join(", ")} für "${priority.title}" aktualisiert.`,
      actor,
      priority.title,
    );
  }

  return priority;
}

function updateApproval(store, approvalId, payload) {
  const approval = store.approvals.find((item) => item.id === approvalId);
  if (!approval) {
    return null;
  }

  const title = requireNonEmptyString(payload.title, "title");
  const owner = requireNonEmptyString(payload.owner, "owner");
  const reason = requireNonEmptyString(payload.reason, "reason");
  const due = requireNonEmptyString(payload.due, "due");
  const risk = requireEnum(payload.risk, APPROVAL_RISK_VALUES, "risk");
  const actor = cleanString(payload.actor) || "Portfolio Operator";
  const changedFields = [];

  const assign = (field, nextValue) => {
    const previous = JSON.stringify(approval[field]);
    const next = JSON.stringify(nextValue);
    if (previous !== next) {
      approval[field] = nextValue;
      changedFields.push(field);
    }
  };

  assign("title", title);
  assign("owner", owner);
  assign("reason", reason);
  assign("due", due);
  assign("risk", risk);

  if (changedFields.length > 0) {
    appendUpdateEvent(
      store,
      "approval",
      `Freigabe aktualisiert: ${approval.title}`,
      `${actor} hat ${changedFields.join(", ")} für "${approval.title}" angepasst.`,
      actor,
      approval.title,
    );

    const relatedPriority = store.priorities.find((priority) => priority.id === approval.caseId);
    if (relatedPriority) {
      relatedPriority.updatedAt = nowTimestamp();
    }
  }

  return approval;
}

async function handleApi(request, response, pathname) {
  const method = request.method || "GET";
  const store = await readStore();
  const state = deriveState(store);

  if (method === "GET" && pathname === "/api/state") {
    sendJson(response, 200, state);
    return;
  }

  if (method === "GET" && pathname === "/api/cases") {
    sendJson(response, 200, { cases: state.priorities, focusCase: state.focusCase });
    return;
  }

  if (method === "GET" && pathname === "/api/workflows") {
    sendJson(response, 200, { workflows: state.workflows, bottlenecks: state.bottlenecks });
    return;
  }

  if (method === "GET" && pathname === "/api/events") {
    sendJson(response, 200, { events: state.events, audit: state.audit });
    return;
  }

  if (method === "GET" && pathname === "/api/approvals") {
    sendJson(response, 200, { approvals: state.approvals });
    return;
  }

  if (method === "GET" && pathname === "/api/settings") {
    sendJson(response, 200, { settings: state.settings, summary: state.summary });
    return;
  }

  if (method === "POST" && pathname === "/api/cases") {
    let payload;
    try {
      payload = await readRequestBody(request);
    } catch (error) {
      sendJson(response, error.message === "payload_too_large" ? 413 : 400, {
        error: error.message,
      });
      return;
    }

    try {
      const newCase = createCase(store, payload);
      await writeStore(store);
      sendJson(response, 201, {
        ok: true,
        caseId: newCase.id,
        state: deriveState(store),
      });
    } catch (error) {
      sendJson(response, error.code === "invalid_field" ? 400 : 500, {
        error: error.code || "create_failed",
        field: error.message,
      });
    }
    return;
  }

  const outreachApprovalMatch = pathname.match(/^\/api\/cases\/([^/]+)\/outreach\/request-approval$/);
  if (method === "POST" && outreachApprovalMatch) {
    let payload;
    try {
      payload = await readRequestBody(request);
    } catch (error) {
      sendJson(response, error.message === "payload_too_large" ? 413 : 400, {
        error: error.message,
      });
      return;
    }

    try {
      const approval = requestOutreachApproval(store, outreachApprovalMatch[1], payload);
      if (!approval) {
        sendJson(response, 404, {
          error: "case_not_found",
        });
        return;
      }

      await writeStore(store);
      sendJson(response, 201, {
        ok: true,
        approvalId: approval.id,
        state: deriveState(store),
      });
    } catch (error) {
      const statusCode =
        error.code === "invalid_field" ? 400 : error.code === "approval_pending" ? 409 : 500;
      sendJson(response, statusCode, {
        error: error.code || "approval_request_failed",
        field: error.message,
      });
    }
    return;
  }

  const approvalMatch = pathname.match(/^\/api\/approvals\/([^/]+)\/decision$/);
  if (method === "POST" && approvalMatch) {
    let payload;
    try {
      payload = await readRequestBody(request);
    } catch (error) {
      sendJson(response, error.message === "payload_too_large" ? 413 : 400, {
        error: error.message,
      });
      return;
    }

    const decision = payload.decision;
    if (decision !== "approved" && decision !== "denied") {
      sendJson(response, 400, {
        error: "invalid_decision",
        message: "decision muss approved oder denied sein.",
      });
      return;
    }

    const approval = store.approvals.find((item) => item.id === approvalMatch[1]);
    if (!approval) {
      sendJson(response, 404, {
        error: "approval_not_found",
      });
      return;
    }

    if (approval.status !== "pending") {
      sendJson(response, 409, {
        error: "approval_already_closed",
      });
      return;
    }

    appendApprovalDecision(store, approval, decision, payload.actor);
    await writeStore(store);
    sendJson(response, 200, {
      ok: true,
      approvalId: approval.id,
      decision,
      state: deriveState(store),
    });
    return;
  }

  const caseMatch = pathname.match(/^\/api\/cases\/([^/]+)$/);
  if (method === "PATCH" && caseMatch) {
    let payload;
    try {
      payload = await readRequestBody(request);
    } catch (error) {
      sendJson(response, error.message === "payload_too_large" ? 413 : 400, {
        error: error.message,
      });
      return;
    }

    try {
      const updatedCase = updateCase(store, caseMatch[1], payload);
      if (!updatedCase) {
        sendJson(response, 404, {
          error: "case_not_found",
        });
        return;
      }

      await writeStore(store);
      sendJson(response, 200, {
        ok: true,
        caseId: updatedCase.id,
        state: deriveState(store),
      });
    } catch (error) {
      sendJson(response, error.code === "invalid_field" ? 400 : 500, {
        error: error.code || "update_failed",
        field: error.message,
      });
    }
    return;
  }

  const outreachMatch = pathname.match(/^\/api\/cases\/([^/]+)\/outreach$/);
  if (method === "PATCH" && outreachMatch) {
    let payload;
    try {
      payload = await readRequestBody(request);
    } catch (error) {
      sendJson(response, error.message === "payload_too_large" ? 413 : 400, {
        error: error.message,
      });
      return;
    }

    try {
      const updatedDraft = updateOutreachDraft(store, outreachMatch[1], payload);
      if (!updatedDraft) {
        sendJson(response, 404, {
          error: "case_not_found",
        });
        return;
      }

      await writeStore(store);
      sendJson(response, 200, {
        ok: true,
        state: deriveState(store),
      });
    } catch (error) {
      sendJson(response, error.code === "invalid_field" ? 400 : 500, {
        error: error.code || "outreach_update_failed",
        field: error.message,
      });
    }
    return;
  }

  const approvalEditMatch = pathname.match(/^\/api\/approvals\/([^/]+)$/);
  if (method === "PATCH" && approvalEditMatch) {
    let payload;
    try {
      payload = await readRequestBody(request);
    } catch (error) {
      sendJson(response, error.message === "payload_too_large" ? 413 : 400, {
        error: error.message,
      });
      return;
    }

    try {
      const updatedApproval = updateApproval(store, approvalEditMatch[1], payload);
      if (!updatedApproval) {
        sendJson(response, 404, {
          error: "approval_not_found",
        });
        return;
      }

      await writeStore(store);
      sendJson(response, 200, {
        ok: true,
        approvalId: updatedApproval.id,
        state: deriveState(store),
      });
    } catch (error) {
      sendJson(response, error.code === "invalid_field" ? 400 : 500, {
        error: error.code || "update_failed",
        field: error.message,
      });
    }
    return;
  }

  sendJson(response, 404, { error: "not_found" });
}

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url || "/", `http://${HOST}:${PORT}`);
    const pathname = url.pathname;

    if (pathname.startsWith("/api/")) {
      await handleApi(request, response, pathname);
      return;
    }

    const filePath = resolveStaticPath(pathname);
    if (!filePath) {
      sendText(response, 403, "Forbidden");
      return;
    }

    const extension = extname(filePath).toLowerCase();
    const file = await readFile(filePath);
    response.writeHead(200, {
      "Content-Type": MIME_TYPES[extension] || "application/octet-stream",
      "Cache-Control": "no-store",
    });
    response.end(file);
  } catch {
    sendText(response, 404, "Not found");
  }
});

server.listen(PORT, HOST, () => {
  console.log(`SignalOS app and API available at http://${HOST}:${PORT}`);
});
