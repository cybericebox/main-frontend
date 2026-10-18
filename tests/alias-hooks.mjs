import { existsSync, statSync } from "node:fs"
import { fileURLToPath, pathToFileURL } from "node:url"

const SRC = new URL("../src/", import.meta.url)
const isFile = (p) => existsSync(p) && statSync(p).isFile()

export async function resolve(specifier, context, next) {
  if (specifier.startsWith("@/")) {
    const base = fileURLToPath(new URL(specifier.slice(2), SRC))
    const hit = [base, `${base}.ts`, `${base}.tsx`, `${base}/index.ts`].find(isFile)
    if (hit) return next(pathToFileURL(hit).href, context)
  }
  // extensionless relative imports (bundler style) inside src
  if (specifier.startsWith(".") && context.parentURL?.startsWith(SRC.href)) {
    const base = fileURLToPath(new URL(specifier, context.parentURL))
    const hit = [`${base}.ts`, `${base}.tsx`, `${base}/index.ts`].find(isFile)
    if (hit && !isFile(base)) return next(pathToFileURL(hit).href, context)
  }
  return next(specifier, context)
}

// JSON imported the bundler way (messages, retention.json) has no import attribute in the source.
export async function load(url, context, next) {
  if (url.endsWith(".json")) return next(url, { ...context, importAttributes: { ...context.importAttributes, type: "json" } })
  return next(url, context)
}
