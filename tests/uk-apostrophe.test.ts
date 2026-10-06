// One Ukrainian apostrophe everywhere: ʼ (U+02BC). A straight ' or a typographic ’ between two Ukrainian letters is a mistake.
import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { join } from "node:path"

const ROOT = join(import.meta.dirname, "..")
const MIXED = /[а-яіїєґА-ЯІЇЄҐ]['’][а-яіїєґА-ЯІЇЄҐ]/g

for (const file of ["messages/uk.json", "messages/errors.uk.json"]) {
  test(`${file} uses only ʼ inside words`, () => {
    const found = readFileSync(join(ROOT, file), "utf8").match(MIXED) ?? []
    assert.deepEqual(found, [])
  })
}
