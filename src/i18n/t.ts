// Static-export-safe i18n wrapper.
// Build-time JSON import — no runtime locale provider, no locale switching.
//
// Two catalogs are maintained: messages/en.json (source of truth for the key set)
// and messages/uk.json (the ACTIVE language). The UI ships in Ukrainian; English
// is kept in sync as the reference/fallback. To switch the active language, change
// the `active` import below. Copy both catalogs to other apps per the DS sync
// procedure (see README).
import en from "../../messages/en.json"
import uk from "../../messages/uk.json"
import { createElement, Fragment, type ReactNode } from "react"
import { nbsp } from "./typo"

// `en` defines the canonical key set; `uk` is what users see.
const active = uk
const fallback = en

type MessageKey = keyof typeof en

type Vars = Record<string, string | number>

function lookup(key: string): string {
  const a = (active as Record<string, string>)[key]
  if (a !== undefined) return nbsp(a)
  const f = (fallback as Record<string, string>)[key]
  return f ?? key
}

// `{name}` placeholders; other braces (the flag format «ICE{…}») stay as they are.
const VAR = /\{(\w+)\}/g

/**
 * Translate a message key to the active-language (Ukrainian) string.
 * Falls back to English, then to the key itself (safe for static export).
 * Active-language strings get Ukrainian no-break spaces (see ./typo).
 * `vars` fill `{name}` placeholders: t("landing.ch.place", { place: 13 }).
 */
export function t(key: MessageKey | string, vars?: Vars): string {
  const s = lookup(key)
  return vars ? s.replace(VAR, (m, name: string) => (name in vars ? String(vars[name]) : m)) : s
}

/**
 * Like t(), but placeholders may be elements (a link, <code>): returns the text
 * split around them (keyed fragments), ready to render as children.
 */
export function tRich(key: MessageKey | string, vars: Record<string, ReactNode>): ReactNode[] {
  return lookup(key)
    .split(/(\{\w+\})/)
    .map((part, i) => {
      const name = /^\{(\w+)\}$/.exec(part)?.[1]
      // the split of a fixed message never reorders, so the position is a stable key
      // eslint-disable-next-line @eslint-react/no-array-index-key
      return createElement(Fragment, { key: i }, name !== undefined && name in vars ? vars[name] : part)
    })
}
