// Avatar initials are always uppercase (names may be stored in lowercase).
import { test } from "node:test"
import assert from "node:assert/strict"

// Dynamic path: node runs the .ts source directly, tsc doesn't resolve it.
const source = "../src/lib/initials.ts"
const { initials } = await import(source) as typeof import("../src/lib/initials")

test("uppercases the first letters of the first and last name", () => {
  assert.equal(initials("іван", "петренко"), "ІП")
  assert.equal(initials(" ivan ", " petrenko "), "IP")
})

test("falls back to the e-mail, then to ?", () => {
  assert.equal(initials("", "", "olena@example.com"), "O")
  assert.equal(initials(undefined, null), "?")
})
