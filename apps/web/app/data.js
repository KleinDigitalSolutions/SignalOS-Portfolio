export const appData = {
  summary:
    "Structured Outputs aktiv, Tool-Rechte eingegrenzt, Freigaben für sensible Aktionen erzwungen.",
  hero: {
    eyebrow: "Control Tower",
    title: "Operative Klarheit für sensible Prozessketten",
    copy:
      "SignalOS verdichtet Intake, Bewertung, Kommunikation, Freigaben und Monitoring in ein steuerbares System. Nicht mehr Tools, sondern bessere Entscheidungen.",
    chips: [
      { label: "System stabil", tone: "live" },
      { label: "3 Freigaben fällig", tone: "review" },
      { label: "1 Fall eskaliert", tone: "risk" },
    ],
  },
  metrics: [
    { label: "Time-to-First-Action", value: "17 Min.", delta: "-32 % zum Vormonat", trend: "up" },
    { label: "Flow-Abschlussrate", value: "68 %", delta: "+11 Punkte", trend: "up" },
    { label: "Freigaben > 24h", value: "3", delta: "Handlungsbedarf", trend: "warning" },
    { label: "Risikoquote", value: "12 %", delta: "-4 Punkte", trend: "up" },
  ],
  priorities: [
    {
      id: "case-ai-001",
      title: "Senior AI Workflow Architect",
      domainLabel: "Recruiting Ops",
      statusLabel: "Freigabe erforderlich",
      ownerName: "Hiring Lead",
      openApprovals: 2,
      fitScore: 91,
      riskFlags: ["Sensible Ansprache", "SLA droht zu reißen"],
      updatedAt: "vor 12 Minuten",
    },
    {
      id: "case-po-011",
      title: "Partner Onboarding Escalation",
      domainLabel: "Partner Ops",
      statusLabel: "Eskaliert",
      ownerName: "Operations Lead",
      openApprovals: 1,
      fitScore: 84,
      riskFlags: ["Dokumentationslücke"],
      updatedAt: "vor 19 Minuten",
    },
    {
      id: "case-co-007",
      title: "Compliance Intake Batch 07",
      domainLabel: "Compliance Ops",
      statusLabel: "Bewertung ausstehend",
      ownerName: "Risk Officer",
      openApprovals: 0,
      fitScore: 76,
      riskFlags: ["Unvollständige Evidenz", "Manueller Override geprüft"],
      updatedAt: "vor 31 Minuten",
    },
  ],
  bottlenecks: [
    {
      stage: "Freigaben",
      severity: "critical",
      count: 3,
      summary: "Menschliche Freigaben verzögern Übergänge in die nächste Phase.",
      fill: 86,
    },
    {
      stage: "Evaluation",
      severity: "warning",
      count: 5,
      summary: "Mehrere Fälle haben gute Signale, aber unvollständige Evidenz.",
      fill: 62,
    },
    {
      stage: "Discovery",
      severity: "stable",
      count: 2,
      summary: "Quellenabdeckung ist stabil, nur eine Dublettenregel erzeugt Mehraufwand.",
      fill: 34,
    },
  ],
  workflows: [
    {
      name: "Recruiting Intake",
      owner: "Talent Systems",
      state: "Stabil",
      latency: "17 Min. mediane Reaktionszeit",
      notes: "Intake und Discovery laufen sauber, Freigaben bleiben Engpass.",
      tone: "live",
    },
    {
      name: "Partner Review",
      owner: "Operations Control",
      state: "Überwachen",
      latency: "2 Fälle > SLA",
      notes: "Dokumentationsprüfung erzeugt zusätzliche manuelle Schleifen.",
      tone: "review",
    },
    {
      name: "Compliance Batch",
      owner: "Risk Office",
      state: "Eskaliert",
      latency: "1 Ausfallpfad offen",
      notes: "Ein externer Datenfeed liefert widersprüchliche Evidenz und blockiert den Übergang.",
      tone: "risk",
    },
  ],
  focusCase: {
    title: "Senior AI Workflow Architect",
    domainLabel: "Recruiting Ops",
    statusLabel: "Freigabe nötig",
    summary:
      "Strategisch priorisierte Besetzung mit hohem Zeitdruck, mehreren Stakeholdern und starkem Bedarf an kontrollierter Automatisierung im Sourcing- und Bewertungsprozess.",
    openDecision:
      "Das Messaging für zwei hochrelevante Profile ist versandbereit, erfordert aber menschliche Freigabe wegen sensibler Ansprache und erhöhter Außenwirkung.",
    riskFlags: [
      "Unvollständige Evidenz bei Muss-Kriterium „Agentic Delivery“",
      "48-Stunden-SLA für Freigabe droht zu reißen",
      "Ein Profil mit hoher Passung hat widersprüchliche Wechselindikatoren",
    ],
    nextActions: [
      "Freigabe für zwei Nachrichten priorisieren",
      "Override-Regel für unklare Seniorität dokumentieren",
      "Fall nach Freigabe direkt in Koordination überführen",
    ],
    entities: [
      {
        displayName: "Profil 02",
        roleLabel: "Lead Workflow Engineer",
        status: "under_review",
        fitScore: 92,
        riskScore: 41,
        confidence: 0.78,
        lastSignal: "Antwort innerhalb von 2 Stunden",
      },
      {
        displayName: "Profil 04",
        roleLabel: "AI Automation Architect",
        status: "queued",
        fitScore: 88,
        riskScore: 52,
        confidence: 0.69,
        lastSignal: "Messaging bereit, Freigabe ausstehend",
      },
      {
        displayName: "Profil 05",
        roleLabel: "Principal Agent Engineer",
        status: "rejected",
        fitScore: 64,
        riskScore: 73,
        confidence: 0.81,
        lastSignal: "Muss-Kriterium nicht hinreichend belegt",
      },
    ],
  },
  events: [
    {
      severity: "warning",
      title: "Freigabe für Profil 02 angefordert",
      summary:
        "Messaging Engine hat eine hochwertige Ansprache erzeugt, wegen sensibler Außenwirkung jedoch auf Freigabe gesetzt.",
      meta: "vor 6 Minuten · Evaluation Engine",
    },
    {
      severity: "info",
      title: "Enrichment für Fall A-104 abgeschlossen",
      summary:
        "Vier neue Evidenzsignale wurden mit Provenienz gespeichert und im Bewertungsprofil referenziert.",
      meta: "vor 14 Minuten · Discovery Pipeline",
    },
    {
      severity: "critical",
      title: "SLA-Risiko in Freigabeschlange erkannt",
      summary:
        "Drei Fälle werden die 24-Stunden-Marke überschreiten, wenn keine Entscheidung bis 15:00 Uhr erfolgt.",
      meta: "vor 21 Minuten · Coordination Engine",
    },
    {
      severity: "info",
      title: "Audit-Eintrag für manuellen Override gespeichert",
      summary:
        "Ein unvollständiges Muss-Kriterium wurde mit Begründung auf Review gesetzt, statt automatisch verworfen zu werden.",
      meta: "vor 37 Minuten · Human Oversight",
    },
  ],
  approvals: [
    {
      title: "Nachricht an Profil 02",
      owner: "Hiring Lead",
      reason: "Sensible Außenwirkung und sehr hoher Fit-Score.",
      due: "heute, 14:30 Uhr",
      risk: "warning",
    },
    {
      title: "Override bei Muss-Kriterium",
      owner: "Talent Systems",
      reason: "Evidenzlage unvollständig, aber starkes Projektsignal vorhanden.",
      due: "heute, 15:00 Uhr",
      risk: "risk",
    },
    {
      title: "Batch-Freigabe für Folgekommunikation",
      owner: "Operations Lead",
      reason: "Mehrere Fälle in Warteschlange, Priorisierung notwendig.",
      due: "morgen, 09:00 Uhr",
      risk: "warning",
    },
  ],
  insights: {
    strongestLever:
      "Freigabezeiten sind aktuell der größte Bremsfaktor. Discovery und Enrichment laufen stabil, aber manuelle Entscheidungsschritte stauen sich.",
    governanceSignal:
      "Keine High-Impact-Aktion wurde ohne Freigabe ausgeführt. Alle sensiblen Ausgaben sind mit Audit-Einträgen und Zustandswechseln verknüpft.",
    notes: [
      "Antwortqualität steigt bei personalisierter Ansprache mit klarer Evidenz.",
      "Deduplizierung ist wirkungsvoll, aber eine Quelle liefert inkonsistente Hashes.",
      "Systemvertrauen steigt, wenn Risk Flags und menschliche Overrides sichtbar bleiben.",
    ],
  },
  audit: [
    {
      id: "audit-301",
      action: "approval.required",
      actor: "Evaluation Engine",
      target: "Nachricht an Profil 02",
      result: "Freigabe angelegt",
      timestamp: "2026-04-02 13:54",
    },
    {
      id: "audit-298",
      action: "evaluation.completed",
      actor: "Scoring Runtime",
      target: "Profil 04",
      result: "needs_review mit Risk Flag",
      timestamp: "2026-04-02 13:39",
    },
    {
      id: "audit-294",
      action: "override.recorded",
      actor: "Human Oversight",
      target: "Muss-Kriterium Agentic Delivery",
      result: "Manueller Review statt Auto-Ablehnung",
      timestamp: "2026-04-02 13:17",
    },
  ],
  settings: [
    {
      title: "Freigabegrenzen",
      copy: "High-Impact-Aktionen, sensible Kommunikation und Massenaktionen benötigen menschliche Freigabe.",
    },
    {
      title: "Tool-Rechte",
      copy: "Agenten erhalten nur scoped permissions. Externe Aktionen laufen ausschließlich über validierte Tool-Pfade.",
    },
    {
      title: "Audit und Retention",
      copy: "Systemereignisse, Freigaben und Overrides werden dokumentiert. Retention-Regeln begrenzen unnötige Datenspeicherung.",
    },
    {
      title: "Trusted vs. Untrusted Input",
      copy: "Externe Inhalte werden von Systeminstruktionen getrennt behandelt, um Prompt Injection und implizite Tool-Auslösung zu reduzieren.",
    },
  ],
};
