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

/** Whether a key exists in the canonical catalog (structured texts: legal.<doc>.sN.items.M). */
export function has(key: string): boolean {
  return key in fallback
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
  return richText(lookup(key), vars)
}

/** tRich for an already translated string (e.g. one with extra placeholders added by the caller). */
export function richText(text: string, vars: Record<string, ReactNode>): ReactNode[] {
  return text
    .split(/(\{\w+\})/)
    .map((part, i) => {
      const name = /^\{(\w+)\}$/.exec(part)?.[1]
      // the split of a fixed message never reorders, so the position is a stable key
      // eslint-disable-next-line @eslint-react/no-array-index-key
      return createElement(Fragment, { key: i }, name !== undefined && name in vars ? vars[name] : part)
    })
}

/**
 * tRich for a « · »-separated credit line: each segment becomes an unbreakable
 * (nowrap) span and keeps its trailing dot, so lines break only after a separator.
 * `groupFrom` glues the segments from that index on into one inline-block group:
 * the group moves to the next line whole and splits (at its dots) only when it
 * cannot fit a line by itself.
 */
export function tSegments(
  key: MessageKey | string,
  vars: Record<string, ReactNode>,
  { groupFrom }: { groupFrom?: number } = {}
): ReactNode[] {
  const parts = lookup(key).split(" · ")
  const last = parts.length - 1
  const segment = (part: string, i: number): ReactNode[] => [
    // segments of a fixed message never reorder, so the position is a stable key
    // eslint-disable-next-line @eslint-react/no-array-index-key
    createElement("span", { key: i, style: { whiteSpace: "nowrap" } }, ...richText(part, vars), i < last ? " ·" : null),
    i < last ? " " : null,
  ]
  if (groupFrom === undefined || groupFrom <= 0 || groupFrom > last) return parts.flatMap(segment)
  return [
    ...parts.slice(0, groupFrom).flatMap(segment),
    createElement(
      "span",
      { key: "group", style: { display: "inline-block" } },
      ...parts.slice(groupFrom).flatMap((part, j) => segment(part, groupFrom + j))
    ),
  ]
}
