import { chipClass, trendClass, escapeHtml } from "./utils.js";

const CASE_STATUS_OPTIONS = [
  { value: "approval_required", label: "Freigabe erforderlich" },
  { value: "escalated", label: "Eskaliert" },
  { value: "evaluation_pending", label: "Bewertung ausstehend" },
  { value: "coordination_ready", label: "Bereit für Koordination" },
];

const APPROVAL_RISK_OPTIONS = [
  { value: "warning", label: "Warning" },
  { value: "risk", label: "Risk" },
  { value: "live", label: "Live" },
];

function renderUpdatedAt(value) {
  if (/^(vor|heute|gestern|morgen)\b/i.test(value) || /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return `Aktualisiert ${escapeHtml(value)}`;
  }

  return escapeHtml(value);
}

function renderSelectOptions(options, selectedValue) {
  return options
    .map(
      (option) => `
        <option value="${escapeHtml(option.value)}" ${option.value === selectedValue ? "selected" : ""}>
          ${escapeHtml(option.label)}
        </option>
      `,
    )
    .join("");
}

function renderMetrics(appData) {
  return `
    <section class="kpi-grid">
      ${appData.metrics
        .map(
          (metric) => `
            <article class="metric-card">
              <p class="metric-label">${escapeHtml(metric.label)}</p>
              <strong class="metric-value">${escapeHtml(metric.value)}</strong>
              <span class="${trendClass(metric.trend)}">${escapeHtml(metric.delta)}</span>
            </article>
          `,
        )
        .join("")}
    </section>
  `;
}

function selectedCase(appData, uiState) {
  return appData.priorities.find((item) => item.id === uiState.selectedCaseId) || appData.priorities[0] || null;
}

function selectedApproval(appData, uiState) {
  return appData.approvals.find((item) => item.id === uiState.selectedApprovalId) || appData.approvals[0] || null;
}

function renderTagGroup(values, tone = "neutral") {
  if (!values || values.length === 0) {
    return `<span class="pill pill-neutral">Keine Angabe</span>`;
  }

  return values.map((value) => `<span class="pill pill-${tone}">${escapeHtml(value)}</span>`).join("");
}

function renderPriorityList(appData) {
  return appData.priorities
    .map(
      (item) => `
        <article class="priority-item">
          <div>
            <div class="priority-tags">
              <span class="pill pill-neutral">${escapeHtml(item.domainLabel)}</span>
              <span class="${chipClass(item.openApprovals > 0 ? "review" : "live")}">${escapeHtml(item.statusLabel)}</span>
            </div>
            <h4>${escapeHtml(item.title)}</h4>
            <p class="copy">Verantwortlich: ${escapeHtml(item.ownerName)} · Offene Freigaben: ${item.openApprovals} · ${renderUpdatedAt(item.updatedAt)}</p>
            <div class="priority-tags">
              ${item.riskFlags.map((flag) => `<span class="pill pill-risk">${escapeHtml(flag)}</span>`).join("")}
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
}

function renderBottlenecks(appData) {
  return appData.bottlenecks
    .map(
      (item) => `
        <article class="bottleneck-item">
          <div class="bottleneck-top">
            <div>
              <div class="bottleneck-name">${escapeHtml(item.stage)}</div>
              <div class="copy">${escapeHtml(item.summary)}</div>
            </div>
            <span class="${chipClass(item.severity)}">${item.count} aktiv</span>
          </div>
          <div class="bottleneck-meter">
            <div class="bottleneck-fill severity-${item.severity}" style="width:${item.fill}%"></div>
          </div>
        </article>
      `,
    )
    .join("");
}

function renderEvents(appData) {
  return appData.events
    .map(
      (event) => `
        <article class="stream-item" data-severity="${escapeHtml(event.severity)}">
          <h4>${escapeHtml(event.title)}</h4>
          <p class="copy">${escapeHtml(event.summary)}</p>
          <p class="copy">${escapeHtml(event.meta)}</p>
        </article>
      `,
    )
    .join("");
}

function renderFlowStages(flow) {
  return `
    <div class="flow-stage-list">
      ${flow
        .map(
          (stage) => `
            <article class="flow-stage-card" data-stage-status="${escapeHtml(stage.status)}">
              <div class="flow-stage-top">
                <strong>${escapeHtml(stage.label)}</strong>
                <span class="${chipClass(stage.status === "done" ? "live" : stage.status === "active" ? "review" : "neutral")}">
                  ${stage.status === "done" ? "erledigt" : stage.status === "active" ? "aktiv" : "wartet"}
                </span>
              </div>
              <p class="copy">${escapeHtml(stage.summary)}</p>
            </article>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderRecommendedAction(action) {
  if (!action) {
    return `<article class="detail-card"><p class="copy">Keine empfohlene Aktion verfügbar.</p></article>`;
  }

  return `
    <article class="detail-card recommendation-card" data-tone="${escapeHtml(action.tone)}">
      <div class="panel-head panel-head-tight">
        <div>
          <p class="panel-label">Empfohlene nächste Aktion</p>
          <h3>${escapeHtml(action.title)}</h3>
        </div>
        <span class="${chipClass(action.tone)}">${escapeHtml(action.cta)}</span>
      </div>
      <p class="copy">${escapeHtml(action.summary)}</p>
      <p class="copy">Owner: ${escapeHtml(action.owner)}</p>
    </article>
  `;
}

function pendingApprovals(appData) {
  return appData.approvals.filter((approval) => approval.status === "pending");
}

function commandCenterTone(appData) {
  const pendingCount = pendingApprovals(appData).length;
  if (pendingCount >= 3) return "risk";
  if (pendingCount > 0) return "review";
  return "live";
}

function renderHeroOverview(appData) {
  const pending = pendingApprovals(appData);
  const bottleneck = appData.bottlenecks[0];
  const escalatedCases = appData.priorities.filter((item) => item.status === "escalated").length;

  return `
    <aside class="hero-overview">
      <p class="panel-label">Live Snapshot</p>
      <div class="hero-stat-grid">
        <article class="hero-stat-card">
          <span>Freigaben offen</span>
          <strong>${pending.length}</strong>
          <p>${pending[0] ? escapeHtml(pending[0].title) : "Keine offene Entscheidung"}</p>
        </article>
        <article class="hero-stat-card">
          <span>Priorisierte Fälle</span>
          <strong>${appData.priorities.length}</strong>
          <p>${escalatedCases} eskaliert, ${appData.focusCase.openApprovals || pending.filter((item) => item.caseId === appData.focusCase.id).length} im Fokus-Case</p>
        </article>
        <article class="hero-stat-card">
          <span>Engpass</span>
          <strong>${escapeHtml(bottleneck.stage)}</strong>
          <p>${escapeHtml(bottleneck.summary)}</p>
        </article>
      </div>
      <div class="hero-link-row">
        <a class="inline-button" href="#/cases">Cases steuern</a>
        <a class="inline-button" href="#/audit">Audit prüfen</a>
      </div>
    </aside>
  `;
}

export const views = {
  "command-center": {
    eyebrow(appData) {
      return appData.hero.eyebrow;
    },
    title() {
      return "Command Center";
    },
    summary() {
      return "Live-Lage für sensible Prozessketten mit Fokus auf Prioritäten, Engpässe, Freigaben und nachvollziehbare Zustandswechsel.";
    },
    statusTone(appData) {
      return commandCenterTone(appData);
    },
    status(appData) {
      return commandCenterTone(appData) === "risk"
        ? "Hoher Handlungsdruck"
        : commandCenterTone(appData) === "review"
          ? "Aufmerksamkeit nötig"
          : "System stabil";
    },
    render(appData) {
      return `
        <section class="view-grid">
          <section class="hero-panel span-12">
            <div class="hero-copy-block">
              <p class="eyebrow">${escapeHtml(appData.hero.eyebrow)}</p>
              <h3>${escapeHtml(appData.hero.title)}</h3>
              <p class="copy">${escapeHtml(appData.hero.copy)}</p>
              <div class="hero-stack">
                ${appData.hero.chips
                  .map((chip) => `<span class="${chipClass(chip.tone)}">${escapeHtml(chip.label)}</span>`)
                  .join("")}
              </div>
            </div>
            ${renderHeroOverview(appData)}
          </section>

          <section class="panel span-12">
            <div class="panel-head panel-head-tight">
              <div>
                <p class="panel-label">System Snapshot</p>
                <h3>Kernmetriken für Durchsatz, Risiko und Freigaben</h3>
              </div>
            </div>
            ${renderMetrics(appData)}
          </section>

          <section class="panel span-8">
            <div class="panel-head">
              <div>
                <p class="panel-label">Prioritäten</p>
                <h3>Fälle mit unmittelbarem Handlungsbedarf</h3>
              </div>
              <a class="inline-button" href="#/cases">Alle Cases</a>
            </div>
            <div class="priority-list">${renderPriorityList(appData)}</div>
          </section>

          <section class="panel span-4">
            <div class="panel-head">
              <div>
                <p class="panel-label">Bottlenecks</p>
                <h3>Staupunkte entlang des Flows</h3>
              </div>
            </div>
            ${renderBottlenecks(appData)}
          </section>

          <section class="panel span-6">
            <div class="panel-head">
              <div>
                <p class="panel-label">Fokus-Case</p>
                <h3>${escapeHtml(appData.focusCase.title)}</h3>
              </div>
              <div class="pill-row">
                <span class="pill pill-neutral">${escapeHtml(appData.focusCase.domainLabel)}</span>
                <span class="pill pill-review">${escapeHtml(appData.focusCase.statusLabel)}</span>
              </div>
            </div>
            <div class="detail-grid">
              <article class="detail-card">
                <p class="detail-label">Zusammenfassung</p>
                <p class="copy">${escapeHtml(appData.focusCase.summary)}</p>
              </article>
              <article class="detail-card">
                <p class="detail-label">Offene Entscheidung</p>
                <p class="copy">${escapeHtml(appData.focusCase.openDecision)}</p>
              </article>
              <article class="detail-card">
                <p class="detail-label">Risiko-Flags</p>
                <ul class="detail-list">
                  ${appData.focusCase.riskFlags.map((flag) => `<li>${escapeHtml(flag)}</li>`).join("")}
                </ul>
              </article>
              <article class="detail-card">
                <p class="detail-label">Nächste Schritte</p>
                <ul class="detail-list">
                  ${appData.focusCase.nextActions.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}
                </ul>
              </article>
            </div>
            <div class="detail-stack">
              ${renderRecommendedAction(appData.focusCase.recommendedAction)}
            </div>
          </section>

          <section class="panel span-6">
            <div class="panel-head">
              <div>
                <p class="panel-label">Event Stream</p>
                <h3>Relevante Systemereignisse</h3>
              </div>
            </div>
            <div class="stream-list">${renderEvents(appData)}</div>
          </section>
        </section>
      `;
    },
  },
  workflows: {
    eyebrow() {
      return "Flow Monitor";
    },
    title() {
      return "Workflows und Systemdurchsatz";
    },
    summary() {
      return "Überblick über aktive Prozessketten, Latenzen und operative Reibungspunkte entlang des Systems.";
    },
    statusTone(appData) {
      return appData.bottlenecks[0]?.severity === "critical" ? "risk" : "review";
    },
    status() {
      return "Überwachung aktiv";
    },
    render(appData) {
      return `
        <section class="view-grid">
          <section class="panel span-12">
            <div class="panel-head">
              <div>
                <p class="panel-label">Workflow Overview</p>
                <h3>Aktive Prozessketten mit Zustands- und Latenzsicht</h3>
              </div>
            </div>
            <div class="priority-list">
              ${appData.workflows
                .map(
                  (workflow) => `
                    <article class="workflow-item">
                      <div>
                        <div class="priority-tags">
                          <span class="${chipClass(workflow.tone)}">${escapeHtml(workflow.state)}</span>
                        </div>
                        <h4>${escapeHtml(workflow.name)}</h4>
                        <p class="copy">Owner: ${escapeHtml(workflow.owner)} · ${escapeHtml(workflow.latency)}</p>
                        <p class="copy">${escapeHtml(workflow.notes)}</p>
                      </div>
                      <a class="inline-button" href="#/audit">Audit-Spur</a>
                    </article>
                  `,
                )
                .join("")}
            </div>
          </section>
          <section class="panel span-6">
            <div class="panel-head">
              <div>
                <p class="panel-label">Engpassanalyse</p>
                <h3>Blocker und operative Reibung</h3>
              </div>
            </div>
            ${renderBottlenecks(appData)}
          </section>
          <section class="panel span-6">
            <div class="panel-head">
              <div>
                <p class="panel-label">Systemhinweis</p>
                <h3>Warum Workflows sichtbar bleiben</h3>
              </div>
            </div>
            <div class="detail-grid">
              <article class="detail-card">
                <p class="copy">SignalOS versteckt operative Realität nicht hinter Automatisierung. Zustände, Blocker und Freigaben bleiben sichtbar und steuerbar.</p>
              </article>
              <article class="detail-card">
                <p class="copy">Fehlerpfade führen nicht in stillen Datenverlust, sondern in dokumentierte Ereignisse, Eskalationen und nachvollziehbare nächste Schritte.</p>
              </article>
            </div>
          </section>
        </section>
      `;
    },
  },
  cases: {
    eyebrow() {
      return "Candidate Flow";
    },
    title() {
      return "Role Briefs, Kandidaten und nächste Aktionen";
    },
    summary() {
      return "Vom neuen Role Brief bis zur operativen Shortlist: Fälle anlegen, priorisieren und entlang des Candidate Flows steuern.";
    },
    statusTone() {
      return "review";
    },
    status(appData) {
      return `${appData.priorities.length} priorisierte Fälle`;
    },
    render(appData, uiState) {
      const activeCase = selectedCase(appData, uiState);
      const activeCaseDetails = activeCase?.detail || null;

      return `
        <section class="view-grid">
          <section class="panel span-4">
            <div class="panel-head">
              <div>
                <p class="panel-label">Neuer Role Brief</p>
                <h3>Neuen Candidate-Flow-Fall anlegen</h3>
              </div>
            </div>
            <form class="editor-form" data-case-create-form>
              <div class="form-grid">
                <label class="field">
                  <span>Rolle</span>
                  <input name="title" type="text" placeholder="Senior AI Automation Expert" required />
                </label>
                <label class="field">
                  <span>Domäne</span>
                  <input name="domainLabel" type="text" value="Recruiting Ops" required />
                </label>
                <label class="field">
                  <span>Owner</span>
                  <input name="ownerName" type="text" placeholder="Hiring Lead" required />
                </label>
                <label class="field">
                  <span>Initialer Fit</span>
                  <input name="fitScore" type="number" min="0" max="100" value="82" required />
                </label>
                <label class="field field-span-2">
                  <span>Mission des Role Briefs</span>
                  <textarea name="mission" rows="4" placeholder="Welche Rolle wird besetzt, warum ist sie relevant und welche Wirkung soll sie erzeugen?" required></textarea>
                </label>
                <label class="field field-span-2">
                  <span>Must-haves</span>
                  <textarea name="mustHaves" rows="4" placeholder="z. B. Agentic Workflows&#10;n8n / Orchestrierung&#10;Sourcing-Automatisierung"></textarea>
                </label>
                <label class="field field-span-2">
                  <span>Nice-to-haves</span>
                  <textarea name="niceToHaves" rows="3" placeholder="z. B. Clay / Enrichment&#10;Hiring Ops Erfahrung"></textarea>
                </label>
                <label class="field">
                  <span>Standort</span>
                  <input name="location" type="text" value="Remote / Deutschland" required />
                </label>
                <label class="field">
                  <span>Urgency</span>
                  <input name="urgency" type="text" value="hoch" required />
                </label>
                <label class="field">
                  <span>Zielstart</span>
                  <input name="targetStart" type="text" value="innerhalb von 6 Wochen" required />
                </label>
                <label class="field">
                  <span>Risk Flags</span>
                  <textarea name="riskFlags" rows="3" placeholder="z. B. Zeitkritische Rolle&#10;Sensible Ansprache"></textarea>
                </label>
                <label class="field field-span-2">
                  <span>Outreach-Winkel</span>
                  <textarea name="outreachAngle" rows="4" placeholder="Welche Value Proposition und welcher Einstieg passen für die erste Ansprache?" required></textarea>
                </label>
              </div>
              <p class="panel-subcopy">Das Anlegen erstellt direkt einen operativen Fall mit Role Brief, Flow-Timeline, Candidate Signals und Audit/Event-Eintrag.</p>
              <button class="inline-button" type="submit">Case anlegen</button>
            </form>
          </section>

          <section class="panel span-8">
            <div class="panel-head">
              <div>
                <p class="panel-label">Flow Snapshot</p>
                <h3>${activeCase ? escapeHtml(activeCase.title) : "Kein Fall ausgewählt"}</h3>
              </div>
              ${activeCase ? `<span class="${chipClass(activeCase.openApprovals > 0 ? "review" : "live")}">${escapeHtml(activeCase.statusLabel)}</span>` : ""}
            </div>
            ${
              activeCase && activeCaseDetails
                ? `
                  <div class="detail-grid">
                    <article class="detail-card">
                      <p class="detail-label">Mission</p>
                      <p class="copy">${escapeHtml(activeCaseDetails.roleBrief.mission)}</p>
                    </article>
                    <article class="detail-card">
                      <p class="detail-label">Outreach-Winkel</p>
                      <p class="copy">${escapeHtml(activeCaseDetails.roleBrief.outreachAngle)}</p>
                    </article>
                    <article class="detail-card">
                      <p class="detail-label">Must-haves</p>
                      <div class="pill-row">${renderTagGroup(activeCaseDetails.roleBrief.mustHaves, "review")}</div>
                    </article>
                    <article class="detail-card">
                      <p class="detail-label">Nice-to-haves</p>
                      <div class="pill-row">${renderTagGroup(activeCaseDetails.roleBrief.niceToHaves, "neutral")}</div>
                    </article>
                  </div>
                  <div class="role-brief-meta">
                    <article class="detail-card">
                      <p class="detail-label">Standort</p>
                      <p class="copy">${escapeHtml(activeCaseDetails.roleBrief.location)}</p>
                    </article>
                    <article class="detail-card">
                      <p class="detail-label">Urgency</p>
                      <p class="copy">${escapeHtml(activeCaseDetails.roleBrief.urgency)}</p>
                    </article>
                    <article class="detail-card">
                      <p class="detail-label">Zielstart</p>
                      <p class="copy">${escapeHtml(activeCaseDetails.roleBrief.targetStart)}</p>
                    </article>
                    <article class="detail-card">
                      <p class="detail-label">Nächste operative Entscheidung</p>
                      <p class="copy">${escapeHtml(activeCaseDetails.openDecision)}</p>
                    </article>
                  </div>
                  ${renderFlowStages(activeCaseDetails.flow)}
                `
                : `<p class="copy">Wähle einen Fall aus oder lege einen neuen Role Brief an, um den Candidate Flow zu sehen.</p>`
            }
          </section>

          <section class="panel span-7">
            <div class="panel-head">
              <div>
                <p class="panel-label">Outreach Draft</p>
                <h3>${activeCase ? `Ansprache für ${escapeHtml(activeCase.title)}` : "Kein Fall ausgewählt"}</h3>
              </div>
              ${
                activeCaseDetails?.outreachDraft
                  ? `<div class="pill-row">
                      <span class="pill pill-neutral">${escapeHtml(activeCaseDetails.outreachDraft.channel)}</span>
                      <span class="${chipClass(
                        activeCaseDetails.outreachDraft.status === "approved"
                          ? "live"
                          : activeCaseDetails.outreachDraft.status === "needs_revision"
                            ? "risk"
                            : activeCaseDetails.outreachDraft.status === "pending_approval"
                              ? "review"
                              : "neutral",
                      )}">${escapeHtml(activeCaseDetails.outreachDraft.status)}</span>
                    </div>`
                  : ""
              }
            </div>
            ${
              activeCase && activeCaseDetails?.outreachDraft
                ? `
                  <form class="editor-form" data-outreach-form="${escapeHtml(activeCase.id)}">
                    <div class="form-grid">
                      <input name="targetEntityId" type="hidden" value="${escapeHtml(activeCaseDetails.outreachDraft.targetEntityId || "")}" />
                      <label class="field">
                        <span>Zielprofil</span>
                        <input name="targetEntityLabel" type="text" value="${escapeHtml(activeCaseDetails.outreachDraft.targetEntityLabel)}" required />
                      </label>
                      <label class="field">
                        <span>Kanal</span>
                        <input name="channel" type="text" value="${escapeHtml(activeCaseDetails.outreachDraft.channel)}" required />
                      </label>
                      <label class="field">
                        <span>Tonalität</span>
                        <input name="tone" type="text" value="${escapeHtml(activeCaseDetails.outreachDraft.tone)}" required />
                      </label>
                      <label class="field">
                        <span>Approval Owner</span>
                        <input name="approvalOwner" type="text" value="${escapeHtml(activeCaseDetails.outreachDraft.approvalOwner)}" required />
                      </label>
                      <label class="field field-span-2">
                        <span>Betreff</span>
                        <input name="subject" type="text" value="${escapeHtml(activeCaseDetails.outreachDraft.subject)}" required />
                      </label>
                      <label class="field field-span-2">
                        <span>Opening</span>
                        <textarea name="opening" rows="3" required>${escapeHtml(activeCaseDetails.outreachDraft.opening)}</textarea>
                      </label>
                      <label class="field field-span-2">
                        <span>Nachricht</span>
                        <textarea name="body" rows="6" required>${escapeHtml(activeCaseDetails.outreachDraft.body)}</textarea>
                      </label>
                      <label class="field field-span-2">
                        <span>Rationale</span>
                        <textarea name="rationale" rows="4" required>${escapeHtml(activeCaseDetails.outreachDraft.rationale)}</textarea>
                      </label>
                      <label class="field">
                        <span>Fällig für Approval</span>
                        <input name="approvalDue" type="text" value="${escapeHtml(activeCaseDetails.outreachDraft.approvalDue)}" required />
                      </label>
                      <label class="field">
                        <span>Approval-Risiko</span>
                        <select name="approvalRisk">
                          ${renderSelectOptions(APPROVAL_RISK_OPTIONS, activeCaseDetails.outreachDraft.approvalRisk)}
                        </select>
                      </label>
                    </div>
                    <p class="panel-subcopy">
                      Der Draft wird direkt am Fall gespeichert. Eine Freigabe erzeugt anschließend einen echten Approval-Eintrag mit Audit- und Event-Spur.
                    </p>
                    <div class="button-row">
                      <button class="inline-button" type="submit">Draft speichern</button>
                      <button
                        class="inline-button"
                        type="button"
                        data-request-outreach-approval="${escapeHtml(activeCase.id)}"
                        ${activeCaseDetails.outreachDraft.status === "pending_approval" ? "disabled" : ""}
                      >
                        ${activeCaseDetails.outreachDraft.status === "pending_approval" ? "Freigabe offen" : "Freigabe anfordern"}
                      </button>
                    </div>
                  </form>
                `
                : `<p class="copy">Für den ausgewählten Fall ist noch kein Outreach-Draft verfügbar.</p>`
            }
          </section>

          <section class="panel span-5">
            <div class="panel-head">
              <div>
                <p class="panel-label">Next Action</p>
                <h3>Was jetzt operativ den größten Hebel hat</h3>
              </div>
            </div>
            ${renderRecommendedAction(activeCaseDetails?.recommendedAction)}
            ${
              activeCaseDetails?.outreachDraft
                ? `
                  <article class="detail-card">
                    <p class="detail-label">Draft-Kontext</p>
                    <ul class="detail-list">
                      <li>Zielprofil: ${escapeHtml(activeCaseDetails.outreachDraft.targetEntityLabel)}</li>
                      <li>Status: ${escapeHtml(activeCaseDetails.outreachDraft.status)}</li>
                      <li>Freigabe-Owner: ${escapeHtml(activeCaseDetails.outreachDraft.approvalOwner)}</li>
                      <li>Fällig: ${escapeHtml(activeCaseDetails.outreachDraft.approvalDue)}</li>
                    </ul>
                  </article>
                `
                : ""
            }
          </section>

          <section class="panel span-7">
            <div class="panel-head">
              <div>
                <p class="panel-label">Cases</p>
                <h3>Aktive Recruiting-Fälle mit Status- und Freigabe-Sicht</h3>
              </div>
            </div>
            <table class="data-table">
              <thead>
                <tr>
                  <th>Case</th>
                  <th>Status</th>
                  <th>Owner</th>
                  <th>Freigaben</th>
                  <th>System Fit</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                ${appData.priorities
                  .map(
                    (item) => `
                      <tr class="${item.id === activeCase?.id ? "is-selected-row" : ""}">
                        <td>
                          <div class="case-title">${escapeHtml(item.title)}</div>
                          <div class="table-copy">${escapeHtml(item.domainLabel)}</div>
                        </td>
                        <td><span class="${chipClass(item.openApprovals > 0 ? "review" : "live")}">${escapeHtml(item.statusLabel)}</span></td>
                        <td>${escapeHtml(item.ownerName)}</td>
                        <td>${item.openApprovals}</td>
                        <td>${item.fitScore}</td>
                        <td class="table-actions">
                          <button class="inline-button" type="button" data-select-case="${escapeHtml(item.id)}">Bearbeiten</button>
                        </td>
                      </tr>
                    `,
                  )
                  .join("")}
              </tbody>
            </table>
          </section>

          <section class="panel span-5">
            <div class="panel-head">
              <div>
                <p class="panel-label">Case Editor</p>
                <h3>${activeCase ? escapeHtml(activeCase.title) : "Kein Case ausgewählt"}</h3>
              </div>
            </div>
            ${
              activeCase
                ? `
                  <form class="editor-form" data-case-form="${escapeHtml(activeCase.id)}">
                    <div class="form-grid">
                      <label class="field field-span-2">
                        <span>Mission</span>
                        <textarea name="mission" rows="4">${escapeHtml(activeCaseDetails?.roleBrief?.mission || "")}</textarea>
                      </label>
                      <label class="field">
                        <span>Titel</span>
                        <input name="title" type="text" value="${escapeHtml(activeCase.title)}" required />
                      </label>
                      <label class="field">
                        <span>Domäne</span>
                        <input name="domainLabel" type="text" value="${escapeHtml(activeCase.domainLabel)}" required />
                      </label>
                      <label class="field">
                        <span>Owner</span>
                        <input name="ownerName" type="text" value="${escapeHtml(activeCase.ownerName)}" required />
                      </label>
                      <label class="field">
                        <span>Status</span>
                        <select name="status">
                          ${renderSelectOptions(CASE_STATUS_OPTIONS, activeCase.status)}
                        </select>
                      </label>
                      <label class="field">
                        <span>System Fit</span>
                        <input name="fitScore" type="number" min="0" max="100" value="${activeCase.fitScore}" required />
                      </label>
                      <label class="field field-span-2">
                        <span>Risk Flags</span>
                        <textarea name="riskFlags" rows="4">${escapeHtml(activeCase.riskFlags.join("\n"))}</textarea>
                      </label>
                      <label class="field field-span-2">
                        <span>Must-haves</span>
                        <textarea name="mustHaves" rows="4">${escapeHtml(activeCaseDetails?.roleBrief?.mustHaves?.join("\n") || "")}</textarea>
                      </label>
                      <label class="field field-span-2">
                        <span>Nice-to-haves</span>
                        <textarea name="niceToHaves" rows="3">${escapeHtml(activeCaseDetails?.roleBrief?.niceToHaves?.join("\n") || "")}</textarea>
                      </label>
                      <label class="field">
                        <span>Standort</span>
                        <input name="location" type="text" value="${escapeHtml(activeCaseDetails?.roleBrief?.location || "")}" />
                      </label>
                      <label class="field">
                        <span>Urgency</span>
                        <input name="urgency" type="text" value="${escapeHtml(activeCaseDetails?.roleBrief?.urgency || "")}" />
                      </label>
                      <label class="field field-span-2">
                        <span>Zielstart</span>
                        <input name="targetStart" type="text" value="${escapeHtml(activeCaseDetails?.roleBrief?.targetStart || "")}" />
                      </label>
                      <label class="field field-span-2">
                        <span>Outreach-Winkel</span>
                        <textarea name="outreachAngle" rows="4">${escapeHtml(activeCaseDetails?.roleBrief?.outreachAngle || "")}</textarea>
                      </label>
                      <label class="field field-span-2">
                        <span>Zusammenfassung</span>
                        <textarea name="summary" rows="4">${escapeHtml(activeCaseDetails?.summary || "")}</textarea>
                      </label>
                      <label class="field field-span-2">
                        <span>Offene Entscheidung</span>
                        <textarea name="openDecision" rows="4">${escapeHtml(activeCaseDetails?.openDecision || "")}</textarea>
                      </label>
                      <label class="field field-span-2">
                        <span>Nächste Schritte</span>
                        <textarea name="nextActions" rows="4">${escapeHtml(activeCaseDetails?.nextActions?.join("\n") || "")}</textarea>
                      </label>
                    </div>
                    <p class="panel-subcopy">
                      Recruiting-spezifische Briefing-, Risiko- und Entscheidungsfelder werden direkt mit dem ausgewählten Candidate-Flow-Fall gespeichert.
                    </p>
                    <button class="inline-button" type="submit">Case speichern</button>
                  </form>
                `
                : `<p class="copy">Es ist kein editierbarer Case geladen.</p>`
            }
          </section>

          <section class="panel span-12">
            <div class="panel-head">
              <div>
                <p class="panel-label">Candidate Signals</p>
                <h3>${activeCase ? `Erste Kandidatensicht für ${escapeHtml(activeCase.title)}` : "Kandidatensicht"}</h3>
              </div>
            </div>
            ${
              activeCaseDetails?.entities?.length
                ? `
                  <table class="data-table">
                    <thead>
                      <tr>
                        <th>Entity</th>
                        <th>Status</th>
                        <th>Fit</th>
                        <th>Risk</th>
                        <th>Confidence</th>
                        <th>Letztes Signal</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${activeCaseDetails.entities
                        .map(
                          (entity) => `
                            <tr>
                              <td>
                                <div class="case-title">${escapeHtml(entity.displayName)}</div>
                                <div class="table-copy">${escapeHtml(entity.roleLabel)}</div>
                              </td>
                              <td><span class="pill pill-neutral">${escapeHtml(entity.status)}</span></td>
                              <td>${entity.fitScore}</td>
                              <td>${entity.riskScore}</td>
                              <td>${Math.round(entity.confidence * 100)} %</td>
                              <td>${escapeHtml(entity.lastSignal)}</td>
                            </tr>
                          `,
                        )
                        .join("")}
                    </tbody>
                  </table>
                `
                : `
                  <article class="detail-card">
                    <p class="copy">Für diesen Fall sind aktuell noch keine Candidate Signals hinterlegt.</p>
                  </article>
                `
            }
          </section>
        </section>
      `;
    },
  },
  insights: {
    eyebrow() {
      return "Operational Insight";
    },
    title() {
      return "Wirkung, Trends und Vertrauenssignale";
    },
    summary() {
      return "Verdichtete Sicht auf Hebel, Governance-Signale und qualitative Beobachtungen im laufenden System.";
    },
    statusTone() {
      return "live";
    },
    status() {
      return "Metriken aktuell";
    },
    render(appData) {
      return `
        <section class="view-grid">
          <section class="span-12">${renderMetrics(appData)}</section>
          <section class="panel span-6">
            <div class="panel-head">
              <div>
                <p class="panel-label">Stärkster Hebel</p>
                <h3>Wo SignalOS gerade Wirkung entfaltet</h3>
              </div>
            </div>
            <article class="detail-card">
              <p class="copy">${escapeHtml(appData.insights.strongestLever)}</p>
            </article>
          </section>
          <section class="panel span-6">
            <div class="panel-head">
              <div>
                <p class="panel-label">Governance-Signal</p>
                <h3>Warum das System vertrauenswürdig bleibt</h3>
              </div>
            </div>
            <article class="detail-card">
              <p class="copy">${escapeHtml(appData.insights.governanceSignal)}</p>
            </article>
          </section>
          <section class="panel span-12">
            <div class="panel-head">
              <div>
                <p class="panel-label">Analyse-Notizen</p>
                <h3>Qualitative Beobachtungen</h3>
              </div>
            </div>
            <div class="settings-grid">
              ${appData.insights.notes
                .map(
                  (note) => `
                    <article class="detail-card">
                      <p class="copy">${escapeHtml(note)}</p>
                    </article>
                  `,
                )
                .join("")}
            </div>
          </section>
        </section>
      `;
    },
  },
  audit: {
    eyebrow() {
      return "Audit Trail";
    },
    title() {
      return "Nachvollziehbarkeit von Aktionen und Overrides";
    },
    summary() {
      return "Freigaben, Systemereignisse und Audit-Spuren in einer Ansicht für kontrollierte, überprüfbare Entscheidungen.";
    },
    statusTone() {
      return "review";
    },
    status() {
      return "Audit aktiv";
    },
    render(appData, uiState) {
      const activeApproval = selectedApproval(appData, uiState);

      return `
        <section class="view-grid">
          <section class="panel span-6">
            <div class="panel-head">
              <div>
                <p class="panel-label">Freigaben</p>
                <h3>Offene Entscheidungen mit Wirkung</h3>
              </div>
            </div>
            <div class="approval-list">
              ${appData.approvals
                .map(
                  (approval) => `
                    <article class="approval-card ${approval.id === activeApproval?.id ? "is-selected-card" : ""}">
                      <div class="priority-tags">
                        <span class="${chipClass(approval.risk)}">${escapeHtml(approval.dueLabel)}</span>
                        <span class="pill pill-neutral">${escapeHtml(approval.status)}</span>
                      </div>
                      <h4>${escapeHtml(approval.title)}</h4>
                      <p class="copy">Owner: ${escapeHtml(approval.owner)}</p>
                      <p class="copy">${escapeHtml(approval.reason)}</p>
                      <div class="approval-actions">
                        <button class="inline-button" type="button" data-select-approval="${escapeHtml(approval.id)}">Bearbeiten</button>
                        ${
                          approval.status === "pending"
                            ? `
                              <button class="inline-button" type="button" data-approval-action="approved" data-approval-id="${escapeHtml(approval.id)}">Freigeben</button>
                              <button class="inline-button inline-button-danger" type="button" data-approval-action="denied" data-approval-id="${escapeHtml(approval.id)}">Ablehnen</button>
                            `
                            : ""
                        }
                      </div>
                    </article>
                  `,
                )
                .join("")}
            </div>
          </section>

          <section class="panel span-6">
            <div class="panel-head">
              <div>
                <p class="panel-label">Approval Editor</p>
                <h3>${activeApproval ? escapeHtml(activeApproval.title) : "Keine Freigabe ausgewählt"}</h3>
              </div>
            </div>
            ${
              activeApproval
                ? `
                  <form class="editor-form" data-approval-form="${escapeHtml(activeApproval.id)}">
                    <div class="form-grid">
                      <label class="field field-span-2">
                        <span>Titel</span>
                        <input name="title" type="text" value="${escapeHtml(activeApproval.title)}" required />
                      </label>
                      <label class="field">
                        <span>Owner</span>
                        <input name="owner" type="text" value="${escapeHtml(activeApproval.owner)}" required />
                      </label>
                      <label class="field">
                        <span>Risiko</span>
                        <select name="risk">
                          ${renderSelectOptions(APPROVAL_RISK_OPTIONS, activeApproval.risk)}
                        </select>
                      </label>
                      <label class="field field-span-2">
                        <span>Fällig</span>
                        <input name="due" type="text" value="${escapeHtml(activeApproval.due)}" required />
                      </label>
                      <label class="field field-span-2">
                        <span>Begründung</span>
                        <textarea name="reason" rows="5" required>${escapeHtml(activeApproval.reason)}</textarea>
                      </label>
                    </div>
                    <p class="panel-subcopy">Statuswechsel laufen weiterhin über die Freigabe-Buttons und schreiben separate Audit-Ereignisse.</p>
                    <button class="inline-button" type="submit">Freigabe speichern</button>
                  </form>
                `
                : `<p class="copy">Es ist keine editierbare Freigabe geladen.</p>`
            }
          </section>

          <section class="panel span-12">
            <div class="panel-head">
              <div>
                <p class="panel-label">Event Stream</p>
                <h3>Systemereignisse mit Sicherheitsbezug</h3>
              </div>
            </div>
            <div class="stream-list">${renderEvents(appData)}</div>
          </section>

          <section class="panel span-12">
            <div class="panel-head">
              <div>
                <p class="panel-label">Audit Log</p>
                <h3>Wer hat was ausgelöst und mit welchem Ergebnis</h3>
              </div>
            </div>
            <table class="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Aktion</th>
                  <th>Akteur</th>
                  <th>Ziel</th>
                  <th>Ergebnis</th>
                  <th>Zeit</th>
                </tr>
              </thead>
              <tbody>
                ${appData.audit
                  .map(
                    (entry) => `
                      <tr>
                        <td class="mono">${escapeHtml(entry.id)}</td>
                        <td class="mono">${escapeHtml(entry.action)}</td>
                        <td>${escapeHtml(entry.actor)}</td>
                        <td>${escapeHtml(entry.target)}</td>
                        <td>${escapeHtml(entry.result)}</td>
                        <td>${escapeHtml(entry.timestamp)}</td>
                      </tr>
                    `,
                  )
                  .join("")}
              </tbody>
            </table>
          </section>
        </section>
      `;
    },
  },
  settings: {
    eyebrow() {
      return "Policy Surface";
    },
    title() {
      return "Regeln, Rechte und Sicherheitsgrenzen";
    },
    summary() {
      return "Governance-Layer für Freigaben, Rechte, Retention und Vertrauensgrenzen im Produkt.";
    },
    statusTone() {
      return "live";
    },
    status() {
      return "Policies aktiv";
    },
    render(appData) {
      return `
        <section class="view-grid">
          <section class="panel span-12">
            <div class="panel-head">
              <div>
                <p class="panel-label">Settings</p>
                <h3>Produktlogik, Freigaben und Governance im Blick</h3>
              </div>
            </div>
            <div class="settings-grid">
              ${appData.settings
                .map(
                  (item) => `
                    <article class="setting-card">
                      <h4>${escapeHtml(item.title)}</h4>
                      <p class="copy">${escapeHtml(item.copy)}</p>
                    </article>
                  `,
                )
                .join("")}
            </div>
          </section>
          <section class="panel span-12">
            <div class="panel-head">
              <div>
                <p class="panel-label">Sicherheitsposition</p>
                <h3>Was SignalOS bewusst nicht tut</h3>
              </div>
            </div>
            <div class="settings-grid">
              <article class="detail-card">
                <p class="copy">Keine unkontrollierte Vollautomatisierung kritischer Entscheidungen.</p>
              </article>
              <article class="detail-card">
                <p class="copy">Keine Tool-Rechte mit überbreiter Autorisierung oder implizitem Scope.</p>
              </article>
              <article class="detail-card">
                <p class="copy">Keine unsichtbaren Modellurteile ohne Risk Flags, Evidenz oder Override-Möglichkeit.</p>
              </article>
              <article class="detail-card">
                <p class="copy">Keine Vermischung von externem Input und Systeminstruktionen ohne Trennung der Vertrauenszonen.</p>
              </article>
            </div>
          </section>
        </section>
      `;
    },
  },
};
