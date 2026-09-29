// One canonical label per role, identical in every app (main, id, admin, exercises, event).
import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync, readdirSync } from "node:fs"
import { join, relative } from "node:path"

// Dynamic path: node runs the .ts source directly, tsc doesn't resolve it.
const source = "../src/lib/roleKeys.ts"
const { EVENT_ROLES, PLATFORM_ROLES, eventRoleKey, roleKey } = await import(source) as typeof import("../src/lib/roleKeys")

const ROOT = join(import.meta.dirname, "..")
const messages = (lang: string) => JSON.parse(readFileSync(join(ROOT, "messages", `${lang}.json`), "utf8")) as Record<string, string>

const LABELS: Record<"uk" | "en", Record<string, string>> = {
  uk: {
    "role.super_admin": "Суперадміністратор",
    "role.admin": "Адміністратор",
    "role.admin_viewer": "Адміністратор (лише перегляд)",
    "role.user": "Користувач",
    "role.event.owner": "Власник",
    "role.event.moderator": "Модератор",
    "role.event.observer": "Спостерігач",
  },
  en: {
    "role.super_admin": "Super administrator",
    "role.admin": "Administrator",
    "role.admin_viewer": "Administrator (view-only)",
    "role.user": "User",
    "role.event.owner": "Owner",
    "role.event.moderator": "Moderator",
    "role.event.observer": "Observer",
  },
}
// Short or variant role names that must not appear anywhere in the UI text.
const VARIANTS = /super[\s-]?admin(?!istrator)|суперадмін(?!істратор)|супер-адмін|\badmins?\b(?!\s+(area|interface))/i

function sources(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name)
    return e.isDirectory() ? sources(p) : /\.tsx?$/.test(e.name) && !/\.test\.tsx?$/.test(e.name) ? [p] : []
  })
}

test("labels every backend role with its canonical name", () => {
  for (const lang of ["uk", "en"] as const) {
    const catalog = messages(lang)
    for (const role of PLATFORM_ROLES) assert.equal(catalog[roleKey(role)!], LABELS[lang][`role.${role}`])
    for (const code of Object.keys(EVENT_ROLES)) assert.equal(catalog[eventRoleKey(Number(code))!], LABELS[lang][`role.event.${EVENT_ROLES[Number(code) as 0]}`])
  }
  assert.equal(roleKey("unknown"), null)
})

test("keeps the role.* keys identical to the canonical set in both languages", () => {
  for (const lang of ["uk", "en"] as const) {
    const roleKeys = Object.fromEntries(Object.entries(messages(lang)).filter(([k]) => k.startsWith("role.")))
    assert.deepEqual(roleKeys, LABELS[lang])
  }
})

test("has no other role names in the messages", () => {
  const names = [...PLATFORM_ROLES, ...Object.values(EVENT_ROLES)].join("|")
  for (const lang of ["uk", "en"] as const) {
    for (const [k, v] of Object.entries(messages(lang))) {
      if (k.startsWith("role.")) continue
      assert.doesNotMatch(k, new RegExp(`\\.role\\.(${names}|superAdmin|viewer)$`), `role label outside role.*: ${k}`)
      assert.doesNotMatch(v, VARIANTS, `${lang}: ${k}`)
    }
  }
})

test("builds role keys only in the role helper", () => {
  const helper = join(ROOT, "src/lib/roleKeys.ts")
  for (const file of sources(join(ROOT, "src"))) {
    if (file === helper) continue
    assert.doesNotMatch(readFileSync(file, "utf8"), /["'`]([\w.]+\.)?role\.(\$\{|super_admin|admin|user|event\.|owner|moderator|observer)/, relative(ROOT, file))
  }
})
