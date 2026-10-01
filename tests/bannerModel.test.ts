// Site banner model (docs/BROADCASTS.md «Банери»): safe links, severity order, dismissal by ID:Version, storage failures.
import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { join } from "node:path"

// Dynamic path: node runs the .ts source directly, tsc doesn't resolve it.
const source = "../src/components/site/bannerModel.ts"
const model = await import(source) as typeof import("../src/components/site/bannerModel")
type SiteBanner = import("../src/components/site/bannerModel").SiteBanner

const ROOT = join(import.meta.dirname, "..")
const messages = (lang: string) => JSON.parse(readFileSync(join(ROOT, "messages", `${lang}.json`), "utf8")) as Record<string, string>

const banner = (fields: Partial<SiteBanner> = {}): SiteBanner => ({ ID: "b1", Text: "Планові роботи", LinkURL: "", LinkLabel: "", Level: "info", Dismissible: true, Version: 1, ...fields })

function memoryStorage() {
  const map = new Map<string, string>()
  return { getItem: (k: string) => map.get(k) ?? null, setItem: (k: string, v: string) => void map.set(k, v), map }
}
const brokenStorage = {
  getItem: (): string | null => { throw new Error("blocked") },
  setItem: (): void => { throw new Error("blocked") },
}

test("parses tolerantly: no list or no text yields nothing (fetch failure renders nothing)", () => {
  assert.deepEqual(model.parseBanners(null), [])
  assert.deepEqual(model.parseBanners({}), [])
  assert.deepEqual(model.parseBanners([{ ID: "x" }, { ID: "y", Text: "" }, banner()]), [banner()])
})

test("links: in-app paths and http(s) only, javascript: refused", () => {
  assert.equal(model.bannerHref("/status"), "/status")
  assert.equal(model.bannerHref("https://example.com/a"), "https://example.com/a")
  for (const bad of ["javascript:alert(1)", "//evil.example", "data:text/html,x", "ftp://x", "", undefined, "/\\evil.example"]) {
    assert.equal(model.bannerHref(bad), null, String(bad))
  }
})

test("critical is shown before warning before info, server order kept inside a level", () => {
  const ids = model.sortBanners([banner({ ID: "i1" }), banner({ ID: "w", Level: "warning" }), banner({ ID: "c", Level: "critical" }), banner({ ID: "i2" })]).map((b) => b.ID)
  assert.deepEqual(ids, ["c", "w", "i1", "i2"])
})

test("dismiss persists under ID:Version and an edited banner reappears", () => {
  const storage = memoryStorage()
  assert.equal(model.isDismissed(banner(), storage), false)
  model.rememberDismissed(banner(), storage)
  assert.ok([...storage.map.keys()].some((key) => key.endsWith("_b1_1")))
  assert.equal(model.isDismissed(banner(), storage), true)
  assert.equal(model.isDismissed(banner({ Version: 2 }), storage), false)
})

test("a non-dismissible banner is never hidden by stored state", () => {
  const storage = memoryStorage()
  model.rememberDismissed(banner(), storage)
  assert.equal(model.isDismissed(banner({ Dismissible: false }), storage), false)
})

test("storage failures do not throw", () => {
  assert.doesNotThrow(() => model.rememberDismissed(banner(), brokenStorage))
  assert.equal(model.isDismissed(banner(), brokenStorage), false)
  assert.equal(model.isDismissed(banner(), null), false)
  assert.doesNotThrow(() => model.rememberDismissed(banner(), null))
})

test("banner strings exist in uk and en", () => {
  for (const lang of ["uk", "en"]) {
    const m = messages(lang)
    for (const key of ["siteBanner.label", "siteBanner.dismiss", "siteBanner.more"]) assert.ok(m[key], `${lang}:${key}`)
  }
})
