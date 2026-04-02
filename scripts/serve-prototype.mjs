import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, extname, join, normalize, relative, resolve } from "node:path";

const HOST = "127.0.0.1";
const PORT = Number(process.env.PORT || 4173);
const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(join(SCRIPT_DIR, ".."));
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

function resolvePath(urlPath) {
  if (urlPath === "/" || urlPath === "/index.html") {
    return ENTRYPOINT;
  }

  const safePath = normalize(urlPath);
  const relativePath = safePath.replace(/^[/\\]+/, "");
  const candidate = resolve(join(ROOT, relativePath));

  if (!candidate.startsWith(ROOT)) {
    return null;
  }

  const isAllowed = ALLOWED_PREFIXES.some((prefix) => {
    const rel = relative(prefix, candidate);
    return rel === "" || (!rel.startsWith("..") && !rel.startsWith("../") && !rel.startsWith("..\\"));
  });

  if (!isAllowed) {
    return null;
  }

  return candidate;
}

const server = createServer(async (request, response) => {
  try {
    const filePath = resolvePath(new URL(request.url, `http://${HOST}:${PORT}`).pathname);
    if (!filePath) {
      response.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Forbidden");
      return;
    }
    const extension = extname(filePath).toLowerCase();
    const file = await readFile(filePath);

    response.writeHead(200, {
      "Content-Type": MIME_TYPES[extension] || "application/octet-stream",
      "Cache-Control": "no-store",
    });
    response.end(file);
  } catch (error) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
  }
});

server.listen(PORT, HOST, () => {
  console.log(`SignalOS app preview available at http://${HOST}:${PORT}`);
});
