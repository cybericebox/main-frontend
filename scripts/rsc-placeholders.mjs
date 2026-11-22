// Build guard for the Docker image path (deploy/Dockerfile): the build bakes every NEXT_PUBLIC_* value as a placeholder
// and deploy/docker-entrypoint.sh replaces it at container start with sed. That is safe in the HTML and the JS, but not
// inside a text row of the RSC payload (the Flight stream in the self.__next_f pushes of each page and in the *.txt
// files): React writes a long string (1024 characters and more) as `<id>:T<hex byte length>,<text>`, so a substituted
// value of another length breaks the stream and the browser throws React error #412 ("Connection closed").
// This reads every payload of out/ and fails when a placeholder sits in such a row. The fix is to keep that text out of
// the server payload (render it in a client component, which reads the substituted value from the bundle).
// Run after `next build` in the same Docker build step: node scripts/rsc-placeholders.mjs [dir, default out].
import { readFileSync, readdirSync } from "node:fs"
import { join, relative } from "node:path"
import { pathToFileURL } from "node:url"

export const PLACEHOLDER = /__NEXT_PUBLIC_[A-Z0-9_]+__|__WARMUP_SHA256__/i

// The Flight payload of an exported page: the strings of its self.__next_f.push([1, "..."]) scripts, joined.
export function payloadOfHtml(html) {
  let out = ""
  for (const m of html.matchAll(/self\.__next_f\.push\(\[1,("(?:[^"\\]|\\.)*")\]\)/g)) out += JSON.parse(m[1])
  return out
}

// The rows of a payload: [{ id, tag, text }]. A T row is length-prefixed (bytes of UTF-8), every other row ends at "\n".
// Throws when a length points past the end, so a broken stream is reported too.
export function rows(payload) {
  const buf = Buffer.from(payload, "utf8")
  const out = []
  let i = 0
  while (i < buf.length) {
    const colon = buf.indexOf(0x3a, i)
    if (colon < 0) throw new Error(`row without an id at byte ${i}`)
    const id = buf.subarray(i, colon).toString("latin1")
    if (buf[colon + 1] === 0x54 /* T */) {
      const comma = buf.indexOf(0x2c, colon + 2)
      const len = parseInt(buf.subarray(colon + 2, comma).toString("latin1"), 16)
      if (comma < 0 || Number.isNaN(len) || comma + 1 + len > buf.length) throw new Error(`text row ${id} runs past the end of the payload`)
      out.push({ id, tag: "T", text: buf.subarray(comma + 1, comma + 1 + len).toString("utf8") })
      i = comma + 1 + len
    } else {
      let nl = buf.indexOf(0x0a, colon + 1)
      if (nl < 0) nl = buf.length
      out.push({ id, tag: "", text: buf.subarray(colon + 1, nl).toString("utf8") })
      i = nl + 1
    }
  }
  return out
}

// The placeholders found in length-prefixed rows: [{ id, placeholder }].
export function placeholdersInTextRows(payload) {
  return rows(payload)
    .filter((r) => r.tag === "T" && PLACEHOLDER.test(r.text))
    .map((r) => ({ id: r.id, placeholder: r.text.match(PLACEHOLDER)[0] }))
}

function* files(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name)
    if (e.isDirectory()) yield* files(p)
    else if (/\.(html|txt)$/.test(e.name)) yield p
  }
}

export function check(dir) {
  const problems = []
  for (const f of files(dir)) {
    const raw = readFileSync(f, "utf8")
    const payload = f.endsWith(".html") ? payloadOfHtml(raw) : raw
    // a plain text file (robots.txt, flag.txt) is no payload
    if (!payload || (f.endsWith(".txt") && !/^[0-9a-f]+:/.test(payload))) continue
    for (const { id, placeholder } of placeholdersInTextRows(payload)) problems.push(`${relative(dir, f)}: text row ${id} holds ${placeholder}`)
  }
  return problems
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const dir = process.argv[2] ?? join(import.meta.dirname, "..", "out")
  const problems = check(dir)
  if (problems.length) {
    console.error("[rsc] a placeholder sits in a length-prefixed text row of the RSC payload; its substitution at container start would break the page (React #412):")
    for (const p of problems) console.error(`  ${p}`)
    process.exit(1)
  }
  console.log("[rsc] no placeholder in a length-prefixed text row")
}
