// The account menu: one order in every app (no «Головна»), the current app's link hidden,
// then the cookie settings and sign-out, each after a divider.
import { test } from "node:test"
import assert from "node:assert/strict"

// Dynamic path: node runs the .ts source directly, tsc doesn't resolve it.
const source = "../src/lib/accountMenu.ts"
const { accountLinks, accountMenu, catalogAllowed } = await import(source) as typeof import("../src/lib/accountMenu")
type AccountApp = import("../src/lib/accountMenu").AccountApp

const origins = {
  id: "https://id.cybericebox.local",
  admin: "https://admin.cybericebox.local",
  exercises: "https://exercises.cybericebox.local",
}
const everyone = { adminTier: true, catalog: true, returnTo: "https://x.cybericebox.local/a?b=1" }
const keys = (app: AccountApp, opts = everyone) => accountLinks(app, opts, origins).map((link) => link.key)

test("keeps one order and hides the current app", () => {
  assert.deepEqual(keys("event"), ["profile", "admin", "exercises"])
  assert.deepEqual(keys("main"), ["profile", "admin", "exercises"])
  assert.deepEqual(keys("id"), ["admin", "exercises"])
  assert.deepEqual(keys("admin"), ["profile", "exercises"])
  assert.deepEqual(keys("exercises"), ["profile", "admin"])
})

test("ends with a divider, the cookie settings, a divider and sign-out", () => {
  const menu = accountMenu("main", everyone, origins).map((entry) => (entry.kind === "link" ? entry.key : entry.kind))
  assert.deepEqual(menu, ["profile", "admin", "exercises", "divider", "cookies", "divider", "signOut"])
})

test("shows admin and catalog links only to allowed users", () => {
  assert.deepEqual(keys("main", { ...everyone, adminTier: false, catalog: false }), ["profile"])
  assert.deepEqual(keys("main", { ...everyone, adminTier: false }), ["profile", "exercises"])
})

test("sends the profile and catalog links back to the current page", () => {
  const [profile, , catalog] = accountLinks("main", everyone, origins)
  assert.equal(profile.href, `https://id.cybericebox.local/profile?return_to=${encodeURIComponent(everyone.returnTo)}`)
  assert.equal(catalog.href, `https://exercises.cybericebox.local?return_to=${encodeURIComponent(everyone.returnTo)}`)
})

test("opens the catalog to admins and event staff", () => {
  assert.equal(catalogAllowed(null), false)
  assert.equal(catalogAllowed({ IsAdmin: false, Events: [] }), false)
  assert.equal(catalogAllowed({ IsAdmin: true, Events: null }), true)
  assert.equal(catalogAllowed({ IsAdmin: false, Events: [{ ID: "e" }] }), true)
})
