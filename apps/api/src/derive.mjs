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
    };
  });

  const focusPriority = priorities.find((priority) => priority.id === store.focusCase.id);
  const focusCaseApprovals = pendingApprovals.filter((approval) => approval.caseId === store.focusCase.id);
  const focusCase = {
    ...store.focusCase,
    statusLabel:
      focusCaseApprovals.length > 0
        ? "Freigabe nötig"
        : focusPriority?.status === "escalated"
          ? "Eskaliert"
          : focusPriority?.statusLabel || "Bereit für Koordination",
  };

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
