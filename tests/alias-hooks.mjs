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
  return next(specifier, context)
}
