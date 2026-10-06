// Design rule: no shadows. Separation comes from a border (--ib-line) and surface contrast.
// Fails on Tailwind shadow utilities (shadow-none is fine) in src/**/*.{ts,tsx}, and on
// box-shadow / text-shadow / drop-shadow() / shadow tokens in src/**/*.css. Focus styles are
// the only exceptions: a box-shadow inside a :focus / :focus-visible / :focus-within rule, and the design
// system overlay shadow (--ib-shadow-overlay: toast, modal, popover, dropdown only).
import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync, readdirSync } from "node:fs"
import { join, relative } from "node:path"

const ROOT = join(import.meta.dirname, "..")
const SRC = join(ROOT, "src")

function files(dir: string, ext: RegExp): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) return files(path, ext)
    return ext.test(entry.name) && !/\.test\.tsx?$/.test(entry.name) ? [path] : []
  })
}

const stripComments = (text: string) => text.replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, " "))
const lineOf = (text: string, index: number) => text.slice(0, index).split("\n").length

test("no Tailwind shadow utilities in components", () => {
  const hits: string[] = []
  const utility = /^!?-?(?:drop-|inset-|text-)?shadow(?:-|$)/
  for (const file of files(SRC, /\.tsx?$/)) {
    const text = stripComments(readFileSync(file, "utf8")).replace(/\/\/[^\n]*/g, "")
    for (const match of text.matchAll(/[^\s"'`{}]+/g)) {
      const base = match[0].split(":").pop() ?? ""
      if (utility.test(base) && !/shadow-none$/.test(base)) hits.push(`${relative(ROOT, file)}:${lineOf(text, match.index)} ${match[0]}`)
    }
    for (const match of text.matchAll(/boxShadow\s*:\s*(["'`])([^"'`]*)\1/g)) {
      if (match[2].trim() !== "none") hits.push(`${relative(ROOT, file)}:${lineOf(text, match.index)} boxShadow`)
    }
  }
  assert.deepEqual(hits, [])
})

test("no box-shadow outside focus styles in CSS", () => {
  const hits: string[] = []
  for (const file of files(SRC, /\.css$/)) {
    const text = stripComments(readFileSync(file, "utf8"))
    for (const match of text.matchAll(/(--[\w-]*shadow[\w-]*|box-shadow|text-shadow|filter)\s*:\s*([^;}]*)/g)) {
      const [, prop, value] = match
      if (prop === "filter" ? !/drop-shadow\(/.test(value) : value.trim() === "none") continue
      const open = text.lastIndexOf("{", match.index)
      const selector = text.slice(Math.max(text.lastIndexOf("}", open), text.lastIndexOf("{", open - 1)) + 1, open)
      if (prop === "box-shadow" && /:focus/.test(selector)) continue
      if (prop === "--ib-shadow-overlay" || (prop === "box-shadow" && value.trim() === "var(--ib-shadow-overlay)")) continue
      hits.push(`${relative(ROOT, file)}:${lineOf(text, match.index)} ${prop}`)
    }
  }
  assert.deepEqual(hits, [])
})
