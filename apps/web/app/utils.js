export function chipClass(tone) {
  if (tone === "risk") return "pill pill-risk";
  if (tone === "review" || tone === "warning") return "pill pill-review";
  if (tone === "live" || tone === "stable") return "pill pill-live";
  return "pill pill-neutral";
}

export function trendClass(trend) {
  if (trend === "warning") return "metric-delta is-warning";
  if (trend === "risk") return "metric-delta is-risk";
  return "metric-delta is-good";
}

export function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
