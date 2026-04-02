import { views } from "./views.js";

const viewRoot = document.getElementById("app-view");
const titleNode = document.getElementById("view-title");
const eyebrowNode = document.getElementById("view-eyebrow");
const statusChipNode = document.getElementById("status-chip");
const systemSummaryNode = document.getElementById("system-summary");
const focusCaseButton = document.getElementById("focus-case-button");
let appState = null;
const uiState = {
  notice: null,
  selectedCaseId: null,
  selectedApprovalId: null,
};

function currentRoute() {
  const raw = window.location.hash.replace(/^#\/?/, "");
  return raw || "command-center";
}

function updateNavigation(route) {
  document.querySelectorAll("[data-route]").forEach((node) => {
    node.classList.toggle("is-active", node.dataset.route === route);
  });
}

function renderLoading() {
  viewRoot.innerHTML = `
    <section class="panel">
      <div class="panel-head">
        <div>
          <p class="panel-label">Initialisierung</p>
          <h3>SignalOS lädt den aktuellen Systemzustand</h3>
        </div>
      </div>
      <p class="copy">Die App verbindet sich mit der lokalen API und lädt Fälle, Freigaben, Ereignisse und Einstellungen.</p>
    </section>
  `;
}

function renderError(message) {
  viewRoot.innerHTML = `
    <section class="panel">
      <div class="panel-head">
        <div>
          <p class="panel-label">Fehler</p>
          <h3>SignalOS konnte den Zustand nicht laden</h3>
        </div>
      </div>
      <p class="copy">${message}</p>
    </section>
  `;
}

function renderNotice() {
  if (!uiState.notice) {
    return "";
  }

  return `
    <section class="view-notice view-notice-${uiState.notice.tone}">
      <p>${uiState.notice.message}</p>
    </section>
  `;
}

function setNotice(tone, message) {
  uiState.notice = message ? { tone, message } : null;
}

function ensureSelections() {
  if (!appState) {
    return;
  }

  if (!appState.priorities.some((item) => item.id === uiState.selectedCaseId)) {
    uiState.selectedCaseId = appState.focusCase?.id || appState.priorities[0]?.id || null;
  }

  if (!appState.approvals.some((item) => item.id === uiState.selectedApprovalId)) {
    uiState.selectedApprovalId =
      appState.approvals.find((item) => item.status === "pending")?.id || appState.approvals[0]?.id || null;
  }
}

function parseLineList(value) {
  return value
    .split(/\r?\n/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function render() {
  const route = currentRoute();
  const view = views[route] || views["command-center"];

  if (!appState) {
    renderLoading();
    updateNavigation(route);
    return;
  }

  ensureSelections();

  eyebrowNode.textContent = view.eyebrow(appState, uiState);
  titleNode.textContent = view.title(appState, uiState);
  statusChipNode.textContent = view.status(appState, uiState);
  systemSummaryNode.textContent = appState.summary;
  viewRoot.innerHTML = `${renderNotice()}${view.render(appState, uiState)}`;
  updateNavigation(route);
}

async function loadState() {
  renderLoading();
  try {
    const response = await fetch("/api/state", { headers: { Accept: "application/json" } });
    if (!response.ok) {
      throw new Error(`API antwortet mit ${response.status}`);
    }

    appState = await response.json();
    setNotice(null, "");
    render();
  } catch (error) {
    renderError(error.message || "Unbekannter Fehler");
  }
}

focusCaseButton.addEventListener("click", () => {
  window.location.hash = "#/cases";
});

viewRoot.addEventListener("click", async (event) => {
  const caseSelection = event.target.closest("[data-select-case]");
  if (caseSelection) {
    uiState.selectedCaseId = caseSelection.dataset.selectCase;
    render();
    return;
  }

  const approvalSelection = event.target.closest("[data-select-approval]");
  if (approvalSelection) {
    uiState.selectedApprovalId = approvalSelection.dataset.selectApproval;
    render();
    return;
  }

  const button = event.target.closest("[data-approval-action]");
  if (!button) {
    return;
  }

  const approvalId = button.dataset.approvalId;
  const decision = button.dataset.approvalAction;
  button.disabled = true;
  setNotice(null, "");

  try {
    const response = await fetch(`/api/approvals/${approvalId}/decision`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        decision,
        actor: "Portfolio Operator",
      }),
    });

    if (!response.ok) {
      throw new Error(`Freigabeaktion fehlgeschlagen (${response.status})`);
    }

    const payload = await response.json();
    appState = payload.state;
    setNotice("success", `Freigabe ${decision === "approved" ? "erteilt" : "abgelehnt"}.`);
    render();
  } catch (error) {
    setNotice("error", error.message || "Freigabe konnte nicht verarbeitet werden");
    render();
  } finally {
    button.disabled = false;
  }
});

viewRoot.addEventListener("submit", async (event) => {
  const form = event.target.closest("form");
  if (!form) {
    return;
  }

  event.preventDefault();
  setNotice(null, "");

  const controls = Array.from(form.querySelectorAll("input, textarea, select, button"));
  controls.forEach((control) => {
    control.disabled = true;
  });

  try {
    if (form.matches("[data-case-form]")) {
      const formData = new FormData(form);
      const caseId = form.dataset.caseForm;
      const response = await fetch(`/api/cases/${caseId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          title: formData.get("title"),
          domainLabel: formData.get("domainLabel"),
          ownerName: formData.get("ownerName"),
          status: formData.get("status"),
          fitScore: Number(formData.get("fitScore")),
          riskFlags: parseLineList(String(formData.get("riskFlags") || "")),
          summary: formData.get("summary"),
          openDecision: formData.get("openDecision"),
          nextActions: parseLineList(String(formData.get("nextActions") || "")),
          actor: "Portfolio Operator",
        }),
      });

      if (!response.ok) {
        throw new Error(`Case konnte nicht gespeichert werden (${response.status})`);
      }

      const payload = await response.json();
      appState = payload.state;
      uiState.selectedCaseId = caseId;
      setNotice("success", "Case-Änderungen gespeichert.");
      render();
      return;
    }

    if (form.matches("[data-approval-form]")) {
      const formData = new FormData(form);
      const approvalId = form.dataset.approvalForm;
      const response = await fetch(`/api/approvals/${approvalId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          title: formData.get("title"),
          owner: formData.get("owner"),
          reason: formData.get("reason"),
          due: formData.get("due"),
          risk: formData.get("risk"),
          actor: "Portfolio Operator",
        }),
      });

      if (!response.ok) {
        throw new Error(`Freigabe konnte nicht gespeichert werden (${response.status})`);
      }

      const payload = await response.json();
      appState = payload.state;
      uiState.selectedApprovalId = approvalId;
      setNotice("success", "Freigabe aktualisiert.");
      render();
    }
  } catch (error) {
    setNotice("error", error.message || "Änderung konnte nicht gespeichert werden");
    render();
  } finally {
    controls.forEach((control) => {
      control.disabled = false;
    });
  }
});

window.addEventListener("hashchange", render);

if (!window.location.hash) {
  window.location.hash = "#/command-center";
}

loadState();
