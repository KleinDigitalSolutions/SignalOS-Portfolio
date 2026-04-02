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

export const views = {
  "command-center": {
    eyebrow(appData) {
      return appData.hero.eyebrow;
    },
    title(appData) {
      return appData.hero.title;
    },
    status() {
      return "System stabil";
    },
    render(appData) {
      return `
        <section class="view-grid">
          <section class="hero-panel span-12">
            <div>
              <p class="eyebrow">${escapeHtml(appData.hero.eyebrow)}</p>
              <h3>${escapeHtml(appData.hero.title)}</h3>
              <p class="copy">${escapeHtml(appData.hero.copy)}</p>
            </div>
            <div class="hero-stack">
              ${appData.hero.chips
                .map((chip) => `<span class="${chipClass(chip.tone)}">${escapeHtml(chip.label)}</span>`)
                .join("")}
            </div>
          </section>

          <section class="span-12">${renderMetrics(appData)}</section>

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
      return "Case Management";
    },
    title() {
      return "Fälle, Entitäten und Entscheidungen";
    },
    status(appData) {
      return `${appData.priorities.length} priorisierte Fälle`;
    },
    render(appData, uiState) {
      const activeCase = selectedCase(appData, uiState);
      const activeCaseDetails = activeCase?.id === appData.focusCase.id ? appData.focusCase : null;

      return `
        <section class="view-grid">
          <section class="panel span-7">
            <div class="panel-head">
              <div>
                <p class="panel-label">Cases</p>
                <h3>Operative Fälle mit Risiko-, Status- und Owner-Sicht</h3>
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
                      ${activeCaseDetails ? "Fokus-Case-Felder werden mit dem Case zusammen gespeichert." : "Erweiterte Detailfelder greifen aktuell nur, wenn der ausgewählte Case zugleich der Fokus-Case ist."}
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
                <p class="panel-label">Case Entities</p>
                <h3>${activeCaseDetails ? "Fokus-Case mit Entity-Sicht" : "Entity-Sicht für den Fokus-Case"}</h3>
              </div>
            </div>
            ${
              activeCaseDetails
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
                      ${appData.focusCase.entities
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
                    <p class="copy">Die Entity-Sicht ist aktuell nur für den Fokus-Case modelliert. Basisdaten und Risk Flags des ausgewählten Cases lassen sich oben trotzdem direkt bearbeiten.</p>
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
