// Theme cookie: `cib_theme` on the parent domain.
import { test } from "node:test"
import assert from "node:assert/strict"

process.env.NEXT_PUBLIC_MAIN_HOST = "cybericebox.com"

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

test("readThemeChoice reads cib_theme and ignores the retired ib_theme", () => {
  const { writes } = fakeBrowser({ ib_theme: "dark", cib_theme: "light" })
  assert.equal(theme.readThemeChoice(), "light")
  assert.equal(fakeBrowser({ ib_theme: "dark" }) && theme.readThemeChoice(), "system")
  assert.deepEqual(writes, [])
})

test("the boot script reads cib_theme only", () => {
  const { attrs } = fakeBrowser({ cib_theme: "light" })
  new Function(theme.THEME_BOOT_SCRIPT)()
  assert.equal(attrs["data-theme"], "light")
})

test("setThemeChoice writes cib_theme", () => {
  const { jar, attrs } = fakeBrowser({})
  theme.setThemeChoice("dark")
  assert.equal(jar.get("cib_theme"), "dark")
  assert.equal(attrs["data-theme"], "dark")
})
