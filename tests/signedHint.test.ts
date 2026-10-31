// The sign-in hint cookie: read by the boot script and helpers, removed when the check says «guest» or on sign-out.
import { test } from "node:test"
import assert from "node:assert/strict"

process.env.NEXT_PUBLIC_DOMAIN = "hint.example.test"

const source = "../src/lib/signedHint.ts"
const hint = await import(source) as typeof import("../src/lib/signedHint")

function fakeBrowser(cookie: string) {
  const writes: string[] = []
  const attrs = new Map<string, string>([["data-signed-hint", ""]])
  const g = globalThis as Record<string, unknown>
  g.document = {
    cookie,
    documentElement: { removeAttribute: (k: string) => { attrs.delete(k) } },
  }
  Object.defineProperty(g.document, "cookie", { get: () => cookie, set: (s: string) => { writes.push(s) }, configurable: true })
  g.location = { protocol: "https:" }
  return { writes, attrs }
}

test("hasSignedHint reads only cib_signed_in=1", () => {
  fakeBrowser("a=b; cib_signed_in=1")
  assert.equal(hint.hasSignedHint(), true)
  fakeBrowser("xcib_signed_in=1")
  assert.equal(hint.hasSignedHint(), false)
  fakeBrowser("cib_theme=dark")
  assert.equal(hint.hasSignedHint(), false)
})

test("the boot script marks <html> only with the hint", () => {
  const marked: string[] = []
  const run = (cookie: string) => new Function("document", SCRIPT_RUNNER)({ cookie, documentElement: { setAttribute: (k: string) => marked.push(k) } })
  const SCRIPT_RUNNER = hint.SIGNED_HINT_BOOT_SCRIPT
  run("cib_signed_in=1")
  run("cib_theme=dark")
  assert.deepEqual(marked, ["data-signed-hint"])
})

test("hideSignedHint keeps the cookie, clearSignedHint expires it on the parent domain", () => {
  const a = fakeBrowser("cib_signed_in=1")
  hint.hideSignedHint()
  assert.equal(a.attrs.has("data-signed-hint"), false)
  assert.deepEqual(a.writes, [])
  const b = fakeBrowser("cib_signed_in=1")
  hint.clearSignedHint()
  assert.equal(b.attrs.has("data-signed-hint"), false)
  assert.equal(b.writes.length, 1)
  assert.match(b.writes[0], /^cib_signed_in=; path=\/; domain=\.hint\.example\.test; .*Secure; max-age=0$/)
})
