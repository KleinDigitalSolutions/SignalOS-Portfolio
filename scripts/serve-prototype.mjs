import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const HOST = "127.0.0.1";
const PORT = Number(process.env.PORT || 4173);
const ROOT = "/Users/bucci/SignalOS-Portfolio/apps/web/prototype";

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
  const safePath = normalize(urlPath).replace(/^(\.\.[/\\])+/, "");
  const relativePath = safePath === "/" ? "/index.html" : safePath;
  return join(ROOT, relativePath);
}

const server = createServer(async (request, response) => {
  try {
    const filePath = resolvePath(new URL(request.url, `http://${HOST}:${PORT}`).pathname);
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
  console.log(`SignalOS prototype available at http://${HOST}:${PORT}`);
});
