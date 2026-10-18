// The Privacy Policy takes its retention periods from src/legal/retention.json (the file the admin site checks against).
import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { fillRetention, periodText, RETENTION, type RetentionData } from "@/legal/retention"
import { t } from "@/i18n/t"
import en from "../messages/en.json"
import uk from "../messages/uk.json"
import original from "./policy-retention-original.json"
import { nbsp } from "@/i18n/typo"

const policyKeys = (catalog: Record<string, string>) => Object.keys(catalog).filter((k) => k.startsWith("legal.privacy.s6."))
// t() joins short words with no-break spaces; the checks read plain spaces
const plain = (text: string) => text.replaceAll("\u00A0", " ")
const rendered = () => plain(policyKeys(uk).map((k) => fillRetention(t(k))).join("\n"))

test("every period of the file is stated in the Policy, in both languages", () => {
  // two settings can share one sentence of the Policy: one placeholder stands for both and they must agree
  const shared = [["SessionAfterExpiry", "LabTelemetry"], ["FormAnswersAfterEventEnd", "EventAnalyticsAfterEnd"]]
  const covered = new Set(shared.flatMap(([, other]) => other))
  for (const group of shared) assert.deepEqual(RETENTION[group[0]], RETENTION[group[1]], group.join(" = "))
  for (const catalog of [uk, en] as Record<string, string>[]) {
    const text = policyKeys(catalog).map((k) => catalog[k]).join("\n")
    for (const key of Object.keys(RETENTION)) {
      if (covered.has(key)) continue
      assert.match(text, new RegExp(`\\{${key}(_gen)?\\}`), key)
    }
    assert.doesNotMatch(text, /\d+ (days|months|years|днів|місяців|років)/, "no period is typed into the text")
  }
})

test("the Policy renders the values of the file", () => {
  const text = rendered()
  assert.match(text, /видаляємо через 30 днів після створення/)
  assert.match(text, /не довше 30 днів/)
  assert.match(text, /неактивні понад 3 роки/)
  assert.match(text, /до 90 днів; журнали доставки листів — до 180 днів; резервні копії — до 30 днів/)
  assert.match(text, /до завершення заходу та ще 1 рік/)
  assert.match(text, /\(реєстрації, запрошення\) — 1 рік/)
  assert.match(text, /дані аналітики — 14 місяців/)
  assert.doesNotMatch(text, /\{\w+\}/)
})

test("a changed file changes the text, with the right plural forms", () => {
  const data: RetentionData = { ...RETENTION, PendingAccount: { value: 21, unit: "days", kind: "after" }, InactiveAccount: { value: 5, unit: "years", kind: "over" } }
  const text = plain(policyKeys(uk).map((k) => fillRetention(t(k), data)).join("\n"))
  assert.match(text, /видаляємо через 21 день після створення/)
  assert.match(text, /неактивні понад 5 років/)
  assert.equal(plain(periodText({ value: 22, unit: "years", kind: "for" })), "22 роки")
  assert.equal(plain(periodText({ value: 2, unit: "days", kind: "upTo" }, true)), "2 днів")
})

test("the published file is the data file", () => {
  const file = JSON.parse(readFileSync(join(import.meta.dirname, "../src/legal/retention.json"), "utf8"))
  assert.deepEqual(file, RETENTION)
  for (const period of Object.values(RETENTION)) {
    assert.ok(Number.isInteger(period.value) && period.value > 0)
    assert.ok(["days", "months", "years"].includes(period.unit))
    assert.ok(["after", "upTo", "over", "plus", "for"].includes(period.kind))
  }
})

test("the rendered Policy retention items are exactly the original text, uk and en", () => {
  for (const [key, text] of Object.entries(original.uk)) assert.equal(fillRetention(t(key)), nbsp(text), key)
  // English is not the active catalog: fill its placeholders from the same file with the English unit forms
  const enText = (key: string) =>
    (en as Record<string, string>)[key].replace(/\{(\w+?)(_gen)?\}/g, (match, name: string) => {
      const period = RETENTION[name]
      if (!period) return match
      const form = (en as Record<string, string>)[`legal.retention.nom.${period.unit}.${period.value === 1 ? "one" : "many"}`]
      return form.replace("{count}", String(period.value))
    })
  for (const [key, text] of Object.entries(original.en)) assert.equal(enText(key), text, key)
})
