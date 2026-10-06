// Copies the shared design system (docs/design-system of the monorepo) into src/styles/ds.
//   node scripts/sync-ds.mjs           write the copies and src/styles/ds/manifest.json
//   node scripts/sync-ds.mjs --check   exit 1 on drift (CI)
// The DS is copied, never imported. The DS folder is not in this repository, so the check has two levels:
//   1. always: every copy still has the sha256 recorded in manifest.json (no hand edits, no half-synced files);
//   2. when the DS source is reachable (DS_DIR, ../docs/design-system in the monorepo checkout, ds-source/):
//      every copy equals what the sync would write from it.
import { createHash } from "node:crypto"
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const out = join(root, "src/styles/ds")
const manifestPath = join(out, "manifest.json")
const check = process.argv.includes("--check")
const sha = (text) => createHash("sha256").update(text).digest("hex")

const candidates = [process.env.DS_DIR, join(root, "../docs/design-system"), join(root, "../../docs/design-system"), join(root, "../../../docs/design-system"), join(root, "ds-source")].filter(Boolean)
const src = candidates.find((d) => existsSync(join(d, "tokens.css")))

// target file → source file in the DS. icon.css is local (not in the DS).
const files = {
    "tokens.css": "tokens.css",
    "base.css": "base.css",
    "components/accordion.css": "components/accordion/accordion.css",
    "components/avatar.css": "components/avatar/avatar.css",
    "components/button.css": "components/button/button.css",
    "components/dropdown-menu.css": "components/dropdown-menu/dropdown-menu.css",
    "components/footer.css": "patterns/footer/footer.css",
    "components/icon-button.css": "components/icon-button/icon-button.css",
    "components/input.css": "components/input/input.css",
    "components/modal.css": "components/modal/modal.css",
    "components/navbar.css": "patterns/navbar/navbar.css",
    "components/status-text.css": "components/status-text/status-text.css",
    "components/toc.css": "components/toc/toc.css",
    "components/tooltip.css": "components/tooltip/tooltip.css",
    "components/topology.css": "patterns/topology/topology.css",
}

const HEADER = "/* copied from docs/design-system, do not edit: node scripts/sync-ds.mjs */\n"

// tokens.css: fonts come from next/font (geist), so the @font-face rules go and the family vars point at its variables.
function transform(name, css) {
    if (name === "base.css") {
        // the waves image is served from public/assets as WebP (lossless re-encode of waves.png), by absolute URL
        const body = css.replaceAll('url("assets/waves.png")', 'url("/assets/waves.webp")')
        return HEADER + "/* Change vs source: waves url is absolute and WebP (/assets/waves.webp, lossless re-encode of waves.png). */\n" + body
    }
    if (name !== "tokens.css") return HEADER + css
    const sans = '--ib-font:var(--font-geist-sans),"Geist",'
    const mono = '--ib-mono:var(--font-geist-mono),"Geist Mono",'
    const lines = css.split("\n").filter((l) => !l.startsWith("@font-face"))
    const body = lines
        .map((l) => l.replace('--ib-font:"Geist",', sans).replace('--ib-mono:"Geist Mono",', mono))
        .join("\n")
    return HEADER + "/* Change vs source: @font-face removed, --ib-font/--ib-mono point at the next/font Geist variables (geist package). */\n" + body
}

let drift = 0
const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, "utf8")) : {}

if (check) {
    for (const dst of Object.keys(files)) {
        const target = join(out, dst)
        const cur = existsSync(target) ? readFileSync(target, "utf8") : ""
        if (sha(cur) !== manifest[dst]) {
            console.error(`ds drift: src/styles/ds/${dst} does not match manifest.json (edited by hand or not synced)`)
            drift++
        }
        if (src) {
            const next = transform(dst, readFileSync(join(src, files[dst]), "utf8"))
            if (cur !== next) {
                console.error(`ds drift: src/styles/ds/${dst} differs from docs/design-system/${files[dst]}`)
                drift++
            }
        }
    }
    if (!src) console.log("ds check: design system source not found, manifest check only")
    if (drift) {
        console.error("run: node scripts/sync-ds.mjs and commit the result")
        process.exit(1)
    }
} else {
    if (!src) {
        console.error("design system source not found (set DS_DIR)")
        process.exit(1)
    }
    const next = {}
    for (const [dst, from] of Object.entries(files)) {
        const text = transform(dst, readFileSync(join(src, from), "utf8"))
        next[dst] = sha(text)
        const target = join(out, dst)
        if (existsSync(target) && readFileSync(target, "utf8") === text) continue
        mkdirSync(dirname(target), { recursive: true })
        writeFileSync(target, text)
        console.log(`synced ${dst}`)
    }
    writeFileSync(manifestPath, JSON.stringify(next, null, 2) + "\n")
}
