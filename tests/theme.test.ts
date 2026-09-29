// Theme cookie: `cib_theme` on the parent domain; a pre-rename `ib_theme` is migrated on first read.
import { test } from "node:test"
import assert from "node:assert/strict"

// Dynamic path: node runs the .ts source directly, tsc doesn't resolve it.
const source = "../src/lib/theme.ts"
const theme = await import(source) as typeof import("../src/lib/theme")

// Minimal browser globals: a cookie jar that records every write, and <html data-theme>.
function fakeBrowser(initial: Record<string, string>) {
  const writes: string[] = []
  const jar = new Map(Object.entries(initial))
  const attrs: Record<string, string> = {}
  const g = globalThis as Record<string, unknown>
  g.document = {
    get cookie() { return [...jar].map(([k, v]) => `${k}=${v}`).join("; ") },
    set cookie(s: string) {
      writes.push(s)
      const [pair] = s.split("; ")
      const [k, v] = pair.split("=")
      if (/max-age=0\b/.test(s)) jar.delete(k)
      else jar.set(k, v)
    },
    documentElement: { setAttribute: (k: string, v: string) => { attrs[k] = v } },
  }
  g.location = { protocol: "https:" }
  g.window = { matchMedia: () => ({ matches: false }) }
  return { writes, jar, attrs }
}

test("readThemeChoice moves the old ib_theme cookie to cib_theme", () => {
  const { writes, jar } = fakeBrowser({ ib_theme: "dark" })
  assert.equal(theme.readThemeChoice(), "dark")
  assert.equal(jar.get("cib_theme"), "dark")
  assert.equal(jar.has("ib_theme"), false)
  assert.match(writes[0], /^cib_theme=dark; path=\/; SameSite=Lax; Secure; max-age=31536000$/)
  assert.match(writes[1], /^ib_theme=; path=\/; SameSite=Lax; Secure; max-age=0$/)
})

test("the boot script migrates before first paint", () => {
  const { jar, attrs } = fakeBrowser({ ib_theme: "dark" })
  new Function(theme.THEME_BOOT_SCRIPT)()
  assert.equal(attrs["data-theme"], "dark")
  assert.equal(jar.get("cib_theme"), "dark")
  assert.equal(jar.has("ib_theme"), false)
})

test("cib_theme wins over a leftover ib_theme and nothing is rewritten", () => {
  const { writes, attrs } = fakeBrowser({ ib_theme: "dark", cib_theme: "light" })
  assert.equal(theme.readThemeChoice(), "light")
  new Function(theme.THEME_BOOT_SCRIPT)()
  assert.equal(attrs["data-theme"], "light")
  assert.deepEqual(writes, [])
})

test("setThemeChoice writes cib_theme", () => {
  const { jar, attrs } = fakeBrowser({})
  theme.setThemeChoice("dark")
  assert.equal(jar.get("cib_theme"), "dark")
  assert.equal(attrs["data-theme"], "dark")
})
