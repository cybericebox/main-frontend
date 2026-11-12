// NEXT_PUBLIC_API_ENABLED=false: a static copy of the site that stays online while the platform is switched off sends
// no request to the API. The value must survive as a runtime value of the static export (the container substitutes it).
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { test } from "node:test"

const read = (p: string) => readFileSync(p, "utf8")

test("the switch is read from <html data-api-enabled>, never from a build-time constant", () => {
  assert.match(read("src/lib/links.ts"), /export const API_ENABLED = process\.env\.NEXT_PUBLIC_API_ENABLED \|\| "true"/)
  assert.match(read("src/app/layout.tsx"), /data-api-enabled=\{API_ENABLED\}/)
  assert.match(read("src/lib/useApi.ts"), /document\.documentElement\.dataset\.apiEnabled !== "false"/)
})

test("switched off: no probe, the API counts as down", () => {
  const provider = read("src/components/ApiProvider.tsx")
  const off = provider.indexOf("if (!apiEnabled())")
  assert.ok(off > 0 && off < provider.indexOf("probeApi().then"))
  assert.match(provider.slice(off, provider.indexOf("let cancelled")), /setState\(\{ status: "down", me: null \}\)\s*return/)
})

test("the notifications pulse waits for the API probe to answer", () => {
  const banners = read("src/components/site/SiteBanners.tsx")
  assert.match(banners, /const up = useApi\(\)\.status === "up"/)
  assert.match(banners, /useEffect\(\(\) => \{\s*if \(!up\) return/)
  assert.match(banners, /\}, \[up\]\)/)
})

test("the container and the Pages build both carry the variable; unset means enabled", () => {
  assert.match(read("deploy/Dockerfile"), /ENV NEXT_PUBLIC_API_ENABLED="__NEXT_PUBLIC_API_ENABLED__"/)
  const entry = read("deploy/docker-entrypoint.sh")
  assert.match(entry, /: "\$\{NEXT_PUBLIC_API_ENABLED:=true\}"/)
  assert.match(entry, /export [^\n]*NEXT_PUBLIC_API_ENABLED/)
  assert.match(read(".github/workflows/pages.yml"), /NEXT_PUBLIC_API_ENABLED: \$\{\{ vars\.NEXT_PUBLIC_API_ENABLED \}\}/)
  assert.match(read("README.md"), /`NEXT_PUBLIC_API_ENABLED`/)
})

test("switched off: the navbar keeps no empty room for «Увійти»", () => {
  assert.match(read("src/styles/site.css"), /\[data-api-enabled="false"\] \.site-nav-slot\{display:none\}/)
})
