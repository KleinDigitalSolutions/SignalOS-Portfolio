import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, extname, join, normalize, relative, resolve } from "node:path";

import { deriveState } from "./derive.mjs";
import { createId, nowTimestamp, readStore, writeStore } from "./store.mjs";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(join(SCRIPT_DIR, "../../.."));
const HOST = "127.0.0.1";
const PORT = Number(process.env.PORT || 4173);
const ENTRYPOINT = resolve(join(ROOT, "apps/web/app/index.html"));
const ALLOWED_PREFIXES = [
  resolve(join(ROOT, "apps/web/app")),
  resolve(join(ROOT, "packages/ui/src")),
];

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  response.end(`${JSON.stringify(payload)}\n`);
}

function sendText(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-store",
  });
  response.end(payload);
}

function resolveStaticPath(pathname) {
  if (pathname === "/" || pathname === "/index.html") {
    return ENTRYPOINT;
  }

  const safePath = normalize(pathname);
  const relativePath = safePath.replace(/^[/\\]+/, "");
  const candidate = resolve(join(ROOT, relativePath));

  if (!candidate.startsWith(ROOT)) {
    return null;
  }

  const isAllowed = ALLOWED_PREFIXES.some((prefix) => {
    const rel = relative(prefix, candidate);
    return rel === "" || (!rel.startsWith("..") && !rel.startsWith("../") && !rel.startsWith("..\\"));
  });

  return isAllowed ? candidate : null;
}

async function readRequestBody(request) {
  return new Promise((resolveBody, rejectBody) => {
    const chunks = [];
    let size = 0;

    request.on("data", (chunk) => {
      size += chunk.length;
      if (size > 32 * 1024) {
        rejectBody(new Error("payload_too_large"));
        request.destroy();
        return;
      }
      chunks.push(chunk);
    });

    request.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8").trim();
      if (!raw) {
        resolveBody({});
        return;
      }

      try {
        resolveBody(JSON.parse(raw));
      } catch {
        rejectBody(new Error("invalid_json"));
      }
    });

    request.on("error", rejectBody);
  });
}

function appendApprovalDecision(store, approval, decision, actor) {
  const eventName = decision === "approved" ? "approval.granted" : "approval.denied";
  const actorLabel = actor || "Human Oversight";
  const title = decision === "approved" ? "Freigabe erteilt" : "Freigabe abgelehnt";
  const result = decision === "approved" ? "Freigabe abgeschlossen" : "Freigabe verweigert";

  approval.status = decision;
  approval.decidedAt = nowTimestamp();
  approval.decidedBy = actorLabel;

  store.events.unshift({
    id: createId("event"),
    severity: decision === "approved" ? "info" : "warning",
    eventName,
    title: `${title}: ${approval.title}`,
    summary: `${actorLabel} hat die Freigabe für "${approval.title}" ${decision === "approved" ? "erteilt" : "abgelehnt"}.`,
    meta: `${approval.decidedAt} · ${actorLabel}`,
  });

  store.audit.unshift({
    id: createId("audit"),
    action: eventName,
    actor: actorLabel,
    target: approval.title,
    result,
    timestamp: approval.decidedAt,
  });

  const relatedPriority = store.priorities.find((priority) => priority.id === approval.caseId);
  if (relatedPriority) {
    relatedPriority.updatedAt = `aktualisiert ${approval.decidedAt}`;
    if (decision === "approved") {
      relatedPriority.riskFlags = relatedPriority.riskFlags.filter((flag) => flag !== "SLA droht zu reißen");
    }
  }
}

async function handleApi(request, response, pathname) {
  const method = request.method || "GET";
  const store = await readStore();
  const state = deriveState(store);

  if (method === "GET" && pathname === "/api/state") {
    sendJson(response, 200, state);
    return;
  }

  if (method === "GET" && pathname === "/api/cases") {
    sendJson(response, 200, { cases: state.priorities, focusCase: state.focusCase });
    return;
  }

  if (method === "GET" && pathname === "/api/workflows") {
    sendJson(response, 200, { workflows: state.workflows, bottlenecks: state.bottlenecks });
    return;
  }

  if (method === "GET" && pathname === "/api/events") {
    sendJson(response, 200, { events: state.events, audit: state.audit });
    return;
  }

  if (method === "GET" && pathname === "/api/approvals") {
    sendJson(response, 200, { approvals: state.approvals });
    return;
  }

  if (method === "GET" && pathname === "/api/settings") {
    sendJson(response, 200, { settings: state.settings, summary: state.summary });
    return;
  }

  const approvalMatch = pathname.match(/^\/api\/approvals\/([^/]+)\/decision$/);
  if (method === "POST" && approvalMatch) {
    let payload;
    try {
      payload = await readRequestBody(request);
    } catch (error) {
      sendJson(response, error.message === "payload_too_large" ? 413 : 400, {
        error: error.message,
      });
      return;
    }

    const decision = payload.decision;
    if (decision !== "approved" && decision !== "denied") {
      sendJson(response, 400, {
        error: "invalid_decision",
        message: "decision muss approved oder denied sein.",
      });
      return;
    }

    const approval = store.approvals.find((item) => item.id === approvalMatch[1]);
    if (!approval) {
      sendJson(response, 404, {
        error: "approval_not_found",
      });
      return;
    }

    if (approval.status !== "pending") {
      sendJson(response, 409, {
        error: "approval_already_closed",
      });
      return;
    }

    appendApprovalDecision(store, approval, decision, payload.actor);
    await writeStore(store);
    sendJson(response, 200, {
      ok: true,
      approvalId: approval.id,
      decision,
      state: deriveState(store),
    });
    return;
  }

  sendJson(response, 404, { error: "not_found" });
}

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url || "/", `http://${HOST}:${PORT}`);
    const pathname = url.pathname;

    if (pathname.startsWith("/api/")) {
      await handleApi(request, response, pathname);
      return;
    }

    const filePath = resolveStaticPath(pathname);
    if (!filePath) {
      sendText(response, 403, "Forbidden");
      return;
    }

    const extension = extname(filePath).toLowerCase();
    const file = await readFile(filePath);
    response.writeHead(200, {
      "Content-Type": MIME_TYPES[extension] || "application/octet-stream",
      "Cache-Control": "no-store",
    });
    response.end(file);
  } catch {
    sendText(response, 404, "Not found");
  }
});

server.listen(PORT, HOST, () => {
  console.log(`SignalOS app and API available at http://${HOST}:${PORT}`);
});
