// Minimal static server for the e2e static run: serves out/ like the production
// host (dir → index.html, unknown path → 404.html). No dependencies.
import { createServer } from "node:http"
import { readFile, stat } from "node:fs/promises"
import { extname, join, normalize } from "node:path"

const ROOT = join(import.meta.dirname, "..", "out")
const PORT = Number(process.env.PORT || 4173)
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json",
  ".png": "image/png", ".svg": "image/svg+xml", ".ico": "image/x-icon", ".woff2": "font/woff2", ".txt": "text/plain" }

async function resolve(urlPath) {
  const p = join(ROOT, normalize(decodeURIComponent(urlPath)).replace(/^(\.\.[/\\])+/, ""))
  const s = await stat(p).catch(() => null)
  if (s?.isDirectory()) return join(p, "index.html")
  return s ? p : null
}

createServer(async (req, res) => {
  const file = await resolve(new URL(req.url, "http://x").pathname)
  const path = file ?? join(ROOT, "404.html")
  const body = await readFile(path).catch(() => null)
  res.writeHead(file && body ? 200 : 404, { "Content-Type": TYPES[extname(path)] ?? "application/octet-stream" })
  res.end(body ?? "not found")
}).listen(PORT, "127.0.0.1")
