import { views } from "./views.js";

const viewRoot = document.getElementById("app-view");
const titleNode = document.getElementById("view-title");
const eyebrowNode = document.getElementById("view-eyebrow");
const statusChipNode = document.getElementById("status-chip");
const systemSummaryNode = document.getElementById("system-summary");
const focusCaseButton = document.getElementById("focus-case-button");
let appState = null;

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

function render() {
  const route = currentRoute();
  const view = views[route] || views["command-center"];

  if (!appState) {
    renderLoading();
    updateNavigation(route);
    return;
  }

  eyebrowNode.textContent = view.eyebrow(appState);
  titleNode.textContent = view.title(appState);
  statusChipNode.textContent = view.status(appState);
  systemSummaryNode.textContent = appState.summary;
  viewRoot.innerHTML = view.render(appState);
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
    render();
  } catch (error) {
    renderError(error.message || "Unbekannter Fehler");
  }
}

focusCaseButton.addEventListener("click", () => {
  window.location.hash = "#/cases";
});

viewRoot.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-approval-action]");
  if (!button) {
    return;
  }

  const approvalId = button.dataset.approvalId;
  const decision = button.dataset.approvalAction;
  button.disabled = true;

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
    render();
  } catch (error) {
    renderError(error.message || "Freigabe konnte nicht verarbeitet werden");
  } finally {
    button.disabled = false;
  }
});

window.addEventListener("hashchange", render);

if (!window.location.hash) {
  window.location.hash = "#/command-center";
}

loadState();
