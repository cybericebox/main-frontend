// UI text rule (see the CyberICEBox CLAUDE.md): every user-facing string comes from
// messages/uk.json + messages/en.json through t(). These tests fail on hardcoded text in
// src/**/*.{ts,tsx} and on keys missing from one of the two catalogs.
import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync, readdirSync } from "node:fs"
import { join, relative } from "node:path"
import ts from "typescript"

const ROOT = join(import.meta.dirname, "..")
const SRC = join(ROOT, "src")
const CYRILLIC = /[Ѐ-ӿ]/
const LATIN_WORD = /[A-Za-z]{2,}/
// attributes a user reads or hears
const TEXT_ATTRS = new Set(["aria-label", "aria-description", "title", "placeholder", "alt", "label"])

// src/i18n holds the translation code itself (typo.ts: Ukrainian short-word list).
const SKIP_DIRS = ["src/i18n"]

// Files allowed to keep literal Latin JSX text, with the reason. Cyrillic is never allowed.
const LATIN_JSX_ALLOW: Record<string, string> = {
  "src/components/ib/Wordmark.tsx": "the «Cyber ICE Box» wordmark is the logo itself",
  "src/components/ib/Topology.tsx": "lab diagram data: host names, ports, addresses and terminal output",
  "src/components/landing/HeroChallenge.tsx": "«view-source» is the browser command the warm-up hints at",
}

function sources(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name)
    if (e.isDirectory()) return SKIP_DIRS.includes(relative(ROOT, p)) ? [] : sources(p)
    return /\.tsx?$/.test(e.name) && !/\.test\.tsx?$/.test(e.name) ? [p] : []
  })
}

type Hit = { file: string; line: number; text: string }

function scan(file: string): { cyrillic: Hit[]; latinJsx: Hit[]; latinAttr: Hit[] } {
  const code = readFileSync(file, "utf8")
  const sf = ts.createSourceFile(file, code, ts.ScriptTarget.Latest, true, file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS)
  const rel = relative(ROOT, file)
  const out = { cyrillic: [] as Hit[], latinJsx: [] as Hit[], latinAttr: [] as Hit[] }
  const hit = (node: ts.Node, text: string): Hit => ({ file: rel, line: sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1, text: text.trim().slice(0, 60) })
  const visit = (node: ts.Node) => {
    if (ts.isStringLiteralLike(node) || ts.isTemplateLiteralToken(node) || ts.isJsxText(node)) {
      const text = ts.isJsxText(node) ? node.text : (node as ts.LiteralLikeNode).text
      if (CYRILLIC.test(text)) out.cyrillic.push(hit(node, text))
      if (ts.isJsxText(node) && LATIN_WORD.test(text)) out.latinJsx.push(hit(node, text))
    }
    if (ts.isJsxAttribute(node) && TEXT_ATTRS.has(node.name.getText(sf)) && node.initializer && ts.isStringLiteral(node.initializer)) {
      if (LATIN_WORD.test(node.initializer.text)) out.latinAttr.push(hit(node, node.initializer.text))
    }
    ts.forEachChild(node, visit)
  }
  visit(sf)
  return out
}

const results = sources(SRC).map(scan)
const fmt = (hits: Hit[]) => hits.map((h) => `${h.file}:${h.line}  ${h.text}`).join("\n")

test("no Cyrillic string literals or JSX text in src", () => {
  const hits = results.flatMap((r) => r.cyrillic)
  assert.equal(hits.length, 0, `move these strings to messages/*.json and use t():\n${fmt(hits)}`)
})

test("no literal Latin JSX text outside the allowlist", () => {
  const hits = results.flatMap((r) => r.latinJsx).filter((h) => !(h.file in LATIN_JSX_ALLOW))
  assert.equal(hits.length, 0, `move these strings to messages/*.json and use t():\n${fmt(hits)}`)
})

test("allowlist entries are still needed", () => {
  const used = new Set(results.flatMap((r) => r.latinJsx).map((h) => h.file))
  const stale = Object.keys(LATIN_JSX_ALLOW).filter((f) => !used.has(f))
  assert.deepEqual(stale, [], "drop these files from LATIN_JSX_ALLOW")
})

test("no literal aria-label / title / placeholder / alt text", () => {
  const hits = results.flatMap((r) => r.latinAttr)
  assert.equal(hits.length, 0, `use t() for these attributes:\n${fmt(hits)}`)
})

test("uk and en catalogs have the same keys and placeholders", () => {
  for (const [a, b] of [["uk", "en"], ["en", "uk"]]) {
    const x = JSON.parse(readFileSync(join(ROOT, `messages/${a}.json`), "utf8")) as Record<string, string>
    const y = JSON.parse(readFileSync(join(ROOT, `messages/${b}.json`), "utf8")) as Record<string, string>
    const missing = Object.keys(x).filter((k) => !(k in y))
    assert.deepEqual(missing, [], `keys in ${a}.json missing from ${b}.json`)
    const vars = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(",")
    const mismatched = Object.keys(x).filter((k) => vars(x[k]) !== vars(y[k]))
    assert.deepEqual(mismatched, [], `placeholders differ between ${a}.json and ${b}.json`)
  }
})
