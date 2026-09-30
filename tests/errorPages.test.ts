// Error boundary and 404 pages replace Next's built-in fallbacks and show only
// catalog texts (uk + en). The components are JSX, which node:test cannot load,
// so the test reads the t() keys each page renders from its source.
import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import ts from "typescript"
import en from "../messages/en.json" with { type: "json" }
import uk from "../messages/uk.json" with { type: "json" }

const ROOT = join(import.meta.dirname, "..")

function tKeys(file: string): string[] {
  const code = readFileSync(join(ROOT, file), "utf8")
  const sf = ts.createSourceFile(file, code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  const keys: string[] = []
  const visit = (node: ts.Node) => {
    if (ts.isCallExpression(node) && node.expression.getText(sf) === "t" && node.arguments[0] && ts.isStringLiteral(node.arguments[0])) {
      keys.push(node.arguments[0].text)
    }
    ts.forEachChild(node, visit)
  }
  visit(sf)
  return keys
}

function source(file: string): string {
  return readFileSync(join(ROOT, file), "utf8")
}

const catalogs = { uk: uk as Record<string, string>, en: en as Record<string, string> }

function assertTranslated(keys: string[]) {
  for (const [lang, catalog] of Object.entries(catalogs)) {
    for (const key of keys) assert.ok(catalog[key]?.trim(), `${key} missing from ${lang}.json`)
  }
}

test("error screen renders the error texts and both actions", () => {
  const keys = tKeys("src/components/site/ErrorScreen.tsx")
  assert.deepEqual(keys, ["error.page.title", "error.page.body", "error.page.reload", "error.page.back"])
  assertTranslated(keys)
  assert.equal(uk["error.page.title"], "Не вдалося завантажити сторінку")
  assert.equal(uk["error.page.reload"], "Оновити")
  assert.equal(uk["error.page.back"], "Назад")
})

test("error and global-error use the error screen, retry the segment and log only in dev", () => {
  for (const file of ["src/app/error.tsx", "src/app/global-error.tsx"]) {
    const code = source(file)
    assert.match(code, /^"use client"/, `${file} must be a client component`)
    assert.match(code, /<ErrorScreen onRetry=\{retry\} \/>/)
    assert.match(code, /process\.env\.NODE_ENV !== "production"\) console\.error\(error\)/)
    assert.doesNotMatch(code, /error\.(message|stack)/, `${file} must not show error details`)
  }
  const global = source("src/app/global-error.tsx")
  assert.match(global, /<html /)
  assert.match(global, /readThemeChoice\(\)/)
  assert.deepEqual(tKeys("src/app/global-error.tsx"), ["error.page.title"])
})

test("404 renders the not-found screen: texts, home link and back", () => {
  const keys = tKeys("src/components/site/NotFoundScreen.tsx")
  assert.deepEqual(keys, ["error.notFound", "error.notFoundDescription", "error.goHome", "error.page.back"])
  assertTranslated(keys)
  assert.equal(uk["error.notFound"], "Сторінку не знайдено")
  assert.equal(uk["error.notFoundDescription"], "Сторінка, яку ви шукаєте, не існує або її перенесли.")
  const screen = source("src/components/site/NotFoundScreen.tsx")
  assert.match(screen, /href="\/"/)
  assert.match(screen, /onClick=\{goBack\}/)
  assert.match(screen, /<Icon name="search-x"/)
  assert.match(screen, /site-404--block/)
  assert.match(source("src/app/not-found.tsx"), /<NotFoundScreen \/>/)
})
