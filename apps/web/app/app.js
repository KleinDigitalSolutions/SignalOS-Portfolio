import { appData } from "./data.js";
import { views } from "./views.js";

const viewRoot = document.getElementById("app-view");
const titleNode = document.getElementById("view-title");
const eyebrowNode = document.getElementById("view-eyebrow");
const statusChipNode = document.getElementById("status-chip");
const systemSummaryNode = document.getElementById("system-summary");
const focusCaseButton = document.getElementById("focus-case-button");

function currentRoute() {
  const raw = window.location.hash.replace(/^#\/?/, "");
  return raw || "command-center";
}

function updateNavigation(route) {
  document.querySelectorAll("[data-route]").forEach((node) => {
    node.classList.toggle("is-active", node.dataset.route === route);
  });
}

function render() {
  const route = currentRoute();
  const view = views[route] || views["command-center"];

  eyebrowNode.textContent = view.eyebrow;
  titleNode.textContent = view.title;
  statusChipNode.textContent = view.status;
  systemSummaryNode.textContent = appData.summary;
  viewRoot.innerHTML = view.render();
  updateNavigation(route);
}

focusCaseButton.addEventListener("click", () => {
  window.location.hash = "#/cases";
});

window.addEventListener("hashchange", render);

if (!window.location.hash) {
  window.location.hash = "#/command-center";
} else {
  render();
}
