// The retention periods the Privacy Policy states: one data file (retention.json), read by the Policy text and published
// at /legal/retention.json, where the admin site checks its retention settings against it. Keys that match a daemon
// retention setting use that setting's name. The Policy must not change at runtime (it promises 14 days' notice).
import { t } from "@/i18n/t"
import retentionData from "./retention.json"

export type RetentionUnit = "days" | "months" | "years"
/** How the Policy phrases the period: «через N» (after), «до N» (upTo), «понад N» (over), «ще N» after the event ends (plus), a bare «N» (for). */
export type RetentionKind = "after" | "upTo" | "over" | "plus" | "for"
export type RetentionPeriod = { value: number; unit: RetentionUnit; kind: RetentionKind }
export type RetentionData = Record<string, RetentionPeriod>

export const RETENTION: RetentionData = retentionData as RetentionData

/** Uk plural class of a count (one: 1, 21 … / few: 2-4, 22 … / many: the rest); English reads «one» and «many». */
export function pluralClass(count: number): "one" | "few" | "many" {
  const category = new Intl.PluralRules("uk").select(count)
  return category === "one" || category === "few" ? category : "many"
}

/** «30 днів», «1 рік»; `genitive` is the form after «до» / «не довше» («1 дня», «3 років»). */
export function periodText(period: RetentionPeriod, genitive = false): string {
  return t(`legal.retention.${genitive ? "gen" : "nom"}.${period.unit}.${pluralClass(period.value)}`, { count: period.value })
}

const PLACEHOLDER = /\{(\w+?)(_gen)?\}/g

/** Fills the `{Key}` / `{Key_gen}` placeholders of a Policy text with the periods of `data`; other braces stay. */
export function fillRetention(text: string, data: RetentionData = RETENTION): string {
  return text.replace(PLACEHOLDER, (match, key: string, gen?: string) => {
    const period = data[key]
    return period ? periodText(period, gen !== undefined) : match
  })
}
