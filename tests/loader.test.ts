// Loader rule (see the CyberICEBox CLAUDE.md): every loading state is the crest
// (components/site/BrandLoading). No generic spinners.
import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync, readdirSync } from "node:fs"
import { join, relative } from "node:path"

const ROOT = join(import.meta.dirname, "..")
const SPINNERS = /\bLoader2\b|\bLoaderCircle\b|animate-spin/

function files(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name)
    return e.isDirectory() ? files(p) : /\.(tsx?|css)$/.test(e.name) ? [p] : []
  })
}

test("no generic spinners in src", () => {
  const hits = files(join(ROOT, "src")).flatMap((f) =>
    readFileSync(f, "utf8")
      .split("\n")
      .flatMap((line, i) => (SPINNERS.test(line) ? [`${relative(ROOT, f)}:${i + 1}`] : [])),
  )
  assert.deepEqual(hits, [], "use BrandLoading instead")
})
