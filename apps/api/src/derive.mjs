function toneFromPendingCount(count) {
  if (count >= 3) return "risk";
  if (count > 0) return "review";
  return "live";
}

function approvalSeverity(count) {
  if (count >= 3) return "critical";
  if (count > 0) return "warning";
  return "stable";
}

function approvalStatusLabel(approval) {
  if (approval.status === "approved") return "Freigegeben";
  if (approval.status === "denied") return "Abgelehnt";
  return approval.due;
}

function fallbackRoleBrief(priority) {
  return {
    mission: `${priority.title} im Bereich ${priority.domainLabel} mit sauberem Role Brief und kontrollierter Übergabe in Discovery strukturieren.`,
    mustHaves: ["Domänenrelevanz", "Nachweisbare Delivery", "Kommunikationsstärke"],
    niceToHaves: ["AI-First Arbeitsweise", "Stakeholder-Erfahrung"],
    location: "Remote / Hybrid",
    urgency: "mittel",
    targetStart: "in Abstimmung",
    outreachAngle: "Hoher Hebel auf Prozessqualität, Geschwindigkeit und Candidate Experience.",
  };
}

function fallbackEntities(priority) {
  return [
    {
      id: `entity-${priority.id}-01`,
      displayName: "Kernprofil",
      roleLabel: priority.title,
      status: "under_review",
      fitScore: Math.max(74, Math.min(95, priority.fitScore)),
      riskScore: 36,
      confidence: 0.73,
      lastSignal: "Role Brief deckt erste Muss-Kriterien ab, Enrichment läuft",
    },
    {
      id: `entity-${priority.id}-02`,
      displayName: "Transferprofil",
      roleLabel: `${priority.title} mit angrenzender Erfahrung`,
      status: "queued",
      fitScore: Math.max(68, priority.fitScore - 7),
      riskScore: 48,
      confidence: 0.66,
      lastSignal: "Hohe Relevanz, aber Evidenz für Seniorität wird geprüft",
    },
    {
      id: `entity-${priority.id}-03`,
      displayName: "Stretch-Profil",
      roleLabel: `${priority.title} mit Führungsfokus`,
      status: "queued",
      fitScore: Math.max(62, priority.fitScore - 12),
      riskScore: 58,
      confidence: 0.6,
      lastSignal: "Interessantes Profil, benötigt zusätzliche Validierung",
    },
  ];
}

function fallbackFlow() {
  return [
    {
      id: "intake",
      label: "Intake",
      status: "done",
      summary: "Rollenbrief strukturiert und als operativer Fall angelegt.",
    },
    {
      id: "discovery",
      label: "Discovery",
      status: "active",
      summary: "Kandidatenvorschläge und Enrichment-Signale werden vorbereitet.",
    },
    {
      id: "outreach",
      label: "Outreach",
      status: "pending",
      summary: "Ansprache startet nach Review der ersten Shortlist.",
    },
    {
      id: "screening",
      label: "Screening",
      status: "pending",
      summary: "Replies und Profilsignale werden nach Kontakt bewertet.",
    },
  ];
}

function fallbackOutreachDraft(priority, entities) {
  const target = entities[0];

  return {
    id: `outreach-${priority.id}`,
    targetEntityId: target?.id || null,
    targetEntityLabel: target?.displayName || "Priorisiertes Profil",
    channel: "email",
    tone: "präzise und persönlich",
    subject: `${priority.title}: kurzer Austausch zu einer AI-First-Rolle?`,
    opening: `Hallo ${target?.displayName || "Profil"},`,
    body: "dein Profil zeigt mehrere Signale, die gut zu einer Rolle mit agentischen Workflows, operativer Ownership und hoher Sichtbarkeit passen.",
    rationale: "Hoher System Fit, relevante Delivery-Signale und deutliche Nähe zu den priorisierten Must-haves.",
    status: "draft",
    approvalOwner: priority.ownerName || "Hiring Lead",
    approvalDue: "heute, 16:00 Uhr",
    approvalRisk: "warning",
    approvalId: null,
  };
}

function recommendedActionForCase(store, priority, detail) {
  const draft = detail.outreachDraft;
  const draftApproval = draft?.approvalId
    ? store.approvals.find((approval) => approval.id === draft.approvalId)
    : null;

  if (draftApproval?.status === "pending" || draft?.status === "pending_approval") {
    return {
      title: "Freigabe für Outreach-Draft priorisieren",
      summary: `Der Draft an ${draft.targetEntityLabel} ist erstellt und wartet auf menschliche Entscheidung, bevor die Ansprache ausgelöst wird.`,
      owner: draftApproval?.owner || draft?.approvalOwner || priority.ownerName,
      tone: "review",
      cta: "Freigabe im Audit prüfen",
    };
  }

  if (draftApproval?.status === "approved" || draft?.status === "approved") {
    return {
      title: "Outreach auslösen und Reply-Tracking starten",
      summary: `Die Ansprache an ${draft.targetEntityLabel} ist freigegeben. Jetzt zählt schneller Versand mit sauberem Monitoring der ersten Replies.`,
      owner: priority.ownerName,
      tone: "live",
      cta: "Versand koordinieren",
    };
  }

  if (draftApproval?.status === "denied" || draft?.status === "needs_revision") {
    return {
      title: "Outreach-Draft überarbeiten",
      summary: `Der aktuelle Draft für ${draft.targetEntityLabel} wurde gestoppt. Begründung, Tonalität oder Evidenz sollten vor einer neuen Freigabe nachgeschärft werden.`,
      owner: priority.ownerName,
      tone: "risk",
      cta: "Draft überarbeiten",
    };
  }

  return {
    title: "Outreach-Draft finalisieren und Freigabe anfordern",
    summary: `Für ${draft.targetEntityLabel} liegt ein erster Draft bereit. Der nächste Hebel ist eine saubere Freigabe, damit der Candidate Flow aus Discovery in Outreach kippt.`,
    owner: draft?.approvalOwner || priority.ownerName,
    tone: "review",
    cta: "Freigabe anfordern",
  };
}

function detailForCase(store, priority) {
  const detail = store.caseDetails?.find((entry) => entry.caseId === priority.id);

  if (detail) {
    const entities = detail.entities?.length ? detail.entities : fallbackEntities(priority);
    const draft = detail.outreachDraft || fallbackOutreachDraft(priority, entities);
    const detailPayload = {
      summary: detail.summary,
      openDecision: detail.openDecision,
      riskFlags: detail.riskFlags || priority.riskFlags,
      nextActions: detail.nextActions || [],
      entities,
      roleBrief: detail.roleBrief || fallbackRoleBrief(priority),
      flow: detail.flow || fallbackFlow(),
      outreachDraft: draft,
    };

    return {
      ...detailPayload,
      recommendedAction: recommendedActionForCase(store, priority, detailPayload),
    };
  }

  if (store.focusCase?.id === priority.id) {
    const entities = store.focusCase.entities || fallbackEntities(priority);
    const detailPayload = {
      summary: store.focusCase.summary,
      openDecision: store.focusCase.openDecision,
      riskFlags: store.focusCase.riskFlags || priority.riskFlags,
      nextActions: store.focusCase.nextActions || [],
      entities,
      roleBrief: fallbackRoleBrief(priority),
      flow: fallbackFlow(),
      outreachDraft: fallbackOutreachDraft(priority, entities),
    };

    return {
      ...detailPayload,
      recommendedAction: recommendedActionForCase(store, priority, detailPayload),
    };
  }

  const entities = fallbackEntities(priority);
  const detailPayload = {
    summary: `${priority.title} befindet sich im Candidate Flow und wartet auf die nächste priorisierte operative Entscheidung.`,
    openDecision: "Role Brief validieren und Discovery für die erste Kandidatenwelle starten.",
    riskFlags: priority.riskFlags,
    nextActions: [
      "Role Brief finalisieren",
      "Shortlist priorisieren",
      "Outreach-Winkel abstimmen",
    ],
    entities,
    roleBrief: fallbackRoleBrief(priority),
    flow: fallbackFlow(),
    outreachDraft: fallbackOutreachDraft(priority, entities),
  };

  return {
    ...detailPayload,
    recommendedAction: recommendedActionForCase(store, priority, detailPayload),
  };
}

export function deriveState(store) {
  const pendingApprovals = store.approvals.filter((approval) => approval.status === "pending");
  const criticalApprovals = pendingApprovals.filter((approval) => approval.risk === "risk").length;
  const pendingApprovalCount = pendingApprovals.length;
  const heroChips = [
    { label: "System stabil", tone: "live" },
    {
      label: `${pendingApprovalCount} Freigaben fällig`,
      tone: toneFromPendingCount(pendingApprovalCount),
    },
    {
      label: `${criticalApprovals || 1} Fall eskaliert`,
      tone: criticalApprovals > 0 ? "risk" : "review",
    },
  ];

  const metrics = store.metrics.map((metric) => {
    if (metric.id === "metric-sla-approvals") {
      return {
        ...metric,
        value: String(pendingApprovalCount),
        delta: pendingApprovalCount > 0 ? "Handlungsbedarf" : "Keine offene Freigabe",
        trend: pendingApprovalCount > 0 ? "warning" : "up",
      };
    }

    return metric;
  });

  const bottlenecks = store.bottlenecks.map((item) => {
    if (item.stage !== "Freigaben") {
      return item;
    }

    return {
      ...item,
      count: pendingApprovalCount,
      severity: approvalSeverity(pendingApprovalCount),
      fill: pendingApprovalCount === 0 ? 18 : Math.min(100, 28 * pendingApprovalCount),
      summary:
        pendingApprovalCount > 0
          ? "Menschliche Freigaben verzögern Übergänge in die nächste Phase."
          : "Keine offenen Freigaben. Der Freigabeschritt ist aktuell nicht der Engpass.",
    };
  });

  const priorities = store.priorities.map((priority) => {
    const openApprovals = pendingApprovals.filter((approval) => approval.caseId === priority.id).length;
    const statusLabel =
      priority.status === "escalated"
        ? "Eskaliert"
        : openApprovals > 0
          ? "Freigabe erforderlich"
          : priority.statusLabel;

    return {
      ...priority,
      openApprovals,
      statusLabel,
      detail: detailForCase(store, priority),
    };
  });

  const focusCaseId = store.focusCase?.id || priorities[0]?.id;
  const focusPriority = priorities.find((priority) => priority.id === focusCaseId) || priorities[0];
  const focusCaseApprovals = pendingApprovals.filter((approval) => approval.caseId === focusCaseId);
  const focusCase = focusPriority
    ? {
        id: focusPriority.id,
        title: focusPriority.title,
        domainLabel: focusPriority.domainLabel,
        openApprovals: focusPriority.openApprovals,
        statusLabel:
          focusCaseApprovals.length > 0
            ? "Freigabe nötig"
            : focusPriority.status === "escalated"
              ? "Eskaliert"
              : focusPriority.statusLabel || "Bereit für Koordination",
        ...focusPriority.detail,
      }
    : null;

  return {
    ...store,
    hero: {
      ...store.hero,
      chips: heroChips,
    },
    metrics,
    priorities,
    bottlenecks,
    focusCase,
    approvals: store.approvals.map((approval) => ({
      ...approval,
      dueLabel: approvalStatusLabel(approval),
    })),
    summary: store.summary,
  };
}
