// Glyphs the UI font (Geist) does not have fall back to another font at the largest sizes (the h1 once drew a
// U+2011 hyphen that way). A needed no-break join is `white-space:nowrap`, a tick is an SVG icon.
import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { join } from "node:path"

const ROOT = join(import.meta.dirname, "..")
const MISSING_IN_GEIST = /[‑✓✔]/g

for (const file of ["messages/uk.json", "messages/en.json", "messages/errors.uk.json", "messages/errors.en.json"]) {
  test(`${file} has no glyphs missing from Geist`, () => {
    const found = readFileSync(join(ROOT, file), "utf8").match(MISSING_IN_GEIST) ?? []
    assert.deepEqual(found, [])
  })
}

test("messages/uk.json has no typographic apostrophe anywhere next to a letter", () => {
  const found = readFileSync(join(ROOT, "messages/uk.json"), "utf8").match(/[\p{L}]’|’[\p{L}]/gu) ?? []
  assert.deepEqual(found, [])
})
