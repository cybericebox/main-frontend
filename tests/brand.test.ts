// Brand rule (see the CyberICEBox CLAUDE.md, «Brand name never wraps»): «Cyber ICE Box» is
// joined by no-break spaces in everything t() returns.
import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { join } from "node:path"

const source = "../src/i18n/brand.ts"
const { BRAND, keepBrand } = await import(source) as typeof import("../src/i18n/brand")

const ROOT = join(import.meta.dirname, "..")
const BREAKABLE = /Cyber[ \t\r\n]+(?:ICE|Ice)[ \t\r\n]+Box/

test("keepBrand joins the words with no-break spaces", () => {
  assert.equal(BRAND, "Cyber ICE Box")
  assert.equal(keepBrand("© 2026 Cyber ICE Box"), "© 2026 Cyber ICE Box")
  assert.equal(keepBrand("Cyber Ice Box і Cyber ICE Box"), "Cyber Ice Box і Cyber ICE Box")
  assert.equal(keepBrand("Cyber ICE Box"), BRAND)
})

test("t() routes every lookup through keepBrand", () => {
  const src = readFileSync(join(ROOT, "src/i18n/t.ts"), "utf8")
  assert.match(src, /keepBrand\(nbsp\(a\)\)/)
  assert.match(src, /keepBrand\(f \?\? key\)/)
})

test("the catalogs' brand mentions come out unbreakable", () => {
  for (const lang of ["uk", "en"]) {
    const catalog = JSON.parse(readFileSync(join(ROOT, `messages/${lang}.json`), "utf8")) as Record<string, string>
    for (const [key, value] of Object.entries(catalog)) {
      assert.ok(!BREAKABLE.test(keepBrand(value)), `${lang}:${key} keeps a breakable brand name`)
    }
  }
})
