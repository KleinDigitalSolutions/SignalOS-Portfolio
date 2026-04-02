const priorities = [
  {
    title: "Senior AI Workflow Architect",
    domainLabel: "Recruiting Ops",
    status: "Freigabe erforderlich",
    ownerName: "Hiring Lead",
    openApprovals: 2,
    fitScore: 91,
    riskFlags: ["Sensible Ansprache", "SLA droht zu reißen"],
    updatedAt: "vor 12 Minuten",
  },
  {
    title: "Partner Onboarding Escalation",
    domainLabel: "Partner Ops",
    status: "Eskaliert",
    ownerName: "Operations Lead",
    openApprovals: 1,
    fitScore: 84,
    riskFlags: ["Dokumentationslücke"],
    updatedAt: "vor 19 Minuten",
  },
  {
    title: "Compliance Intake Batch 07",
    domainLabel: "Compliance Ops",
    status: "Bewertung ausstehend",
    ownerName: "Risk Officer",
    openApprovals: 0,
    fitScore: 76,
    riskFlags: ["Unvollständige Evidenz", "Manueller Override geprüft"],
    updatedAt: "vor 31 Minuten",
  },
];

const bottlenecks = [
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
];

const events = [
  {
    severity: "warning",
    title: "Freigabe für Profil 02 angefordert",
    summary: "Messaging Engine hat eine hochwertige Ansprache erzeugt, wegen sensibler Außenwirkung jedoch auf Freigabe gesetzt.",
    meta: "vor 6 Minuten · Evaluation Engine",
  },
  {
    severity: "info",
    title: "Enrichment für Fall A-104 abgeschlossen",
    summary: "Vier neue Evidenzsignale wurden mit Provenienz gespeichert und im Bewertungsprofil referenziert.",
    meta: "vor 14 Minuten · Discovery Pipeline",
  },
  {
    severity: "critical",
    title: "SLA-Risiko in Freigabeschlange erkannt",
    summary: "Drei Fälle werden die 24-Stunden-Marke überschreiten, wenn keine Entscheidung bis 15:00 Uhr erfolgt.",
    meta: "vor 21 Minuten · Coordination Engine",
  },
  {
    severity: "info",
    title: "Audit-Eintrag für manuellen Override gespeichert",
    summary: "Ein unvollständiges Muss-Kriterium wurde mit Begründung auf Review gesetzt, statt automatisch verworfen zu werden.",
    meta: "vor 37 Minuten · Human Oversight",
  },
];

const priorityList = document.getElementById("priority-list");
const bottleneckList = document.getElementById("bottleneck-list");
const eventStream = document.getElementById("event-stream");

priorityList.innerHTML = priorities
  .map(
    (item) => `
      <article class="priority-item">
        <div>
          <div class="priority-tags">
            <span class="pill pill-neutral">${item.domainLabel}</span>
            <span class="pill ${item.openApprovals > 0 ? "pill-review" : "pill-live"}">${item.status}</span>
          </div>
          <h4>${item.title}</h4>
          <p class="priority-meta">
            Verantwortlich: ${item.ownerName} · Offene Freigaben: ${item.openApprovals} · Aktualisiert ${item.updatedAt}
          </p>
          <div class="priority-tags">
            ${item.riskFlags.map((flag) => `<span class="pill pill-risk">${flag}</span>`).join("")}
          </div>
        </div>
        <div class="score-box">
          <strong>${item.fitScore}</strong>
          <span>System Fit</span>
        </div>
      </article>
    `,
  )
  .join("");

bottleneckList.innerHTML = bottlenecks
  .map(
    (item) => `
      <article class="bottleneck-item">
        <div class="bottleneck-top">
          <div>
            <div class="bottleneck-name">${item.stage}</div>
            <div class="priority-meta">${item.summary}</div>
          </div>
          <span class="pill ${
            item.severity === "critical"
              ? "pill-risk"
              : item.severity === "warning"
                ? "pill-review"
                : "pill-live"
          }">${item.count} aktiv</span>
        </div>
        <div class="bottleneck-meter">
          <div class="bottleneck-fill severity-${item.severity}" style="width:${item.fill}%"></div>
        </div>
      </article>
    `,
  )
  .join("");

eventStream.innerHTML = events
  .map(
    (event) => `
      <article class="stream-item" data-severity="${event.severity}">
        <h4>${event.title}</h4>
        <p class="detail-copy">${event.summary}</p>
        <p class="stream-meta">${event.meta}</p>
      </article>
    `,
  )
  .join("");
