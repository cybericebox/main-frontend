// Cookie consent (Google Consent Mode v2): denied by default; accept all / save choice
// map to analytics_storage only; the choice is one cookie on the parent domain.
import { test } from "node:test"
import assert from "node:assert/strict"

process.env.NEXT_PUBLIC_DOMAIN = "cookies.example.test"

// Dynamic path: node runs the .ts source directly, tsc doesn't resolve it.
const source = "../src/lib/consent.ts"
const consent = await import(source) as typeof import("../src/lib/consent")

// Minimal browser globals: a cookie jar that records every write, and a gtag spy.
function fakeBrowser(protocol = "https:") {
  const writes: string[] = []
  const calls: unknown[][] = []
  const fetched: string[] = []
  const jar = new Map<string, string>()
  const g = globalThis as Record<string, unknown>
  g.document = {
    get cookie() { return [...jar].map(([k, v]) => `${k}=${v}`).join("; ") },
    set cookie(s: string) {
      writes.push(s)
      const [pair] = s.split("; ")
      const [k, v] = pair.split("=")
      if (/max-age=0\b/.test(s)) jar.delete(k)
      else jar.set(k, v)
    },
  }
  g.location = { protocol }
  g.fetch = (url: string, init: { method?: string }) => { fetched.push(`${init.method} ${url}`); return Promise.resolve(new Response()) }
  g.window = { gtag: (...args: unknown[]) => calls.push(args), dispatchEvent: () => true }
  return { writes, calls, jar, fetched }
}

test("every Consent Mode signal defaults to denied", () => {
  assert.deepEqual(consent.CONSENT_DEFAULTS, {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  })
  const boot = consent.gtagBootScript("G-TEST")
  assert.ok(boot.indexOf('"consent","default"') < boot.indexOf('"config"'), "defaults are set before config")
  assert.match(boot, /"ad_storage":"denied"/)
})

test("the boot script grants analytics only for a stored analytics:granted", () => {
  const run = (cookie: string) => {
    const calls: unknown[][] = []
    const w = { dataLayer: [] as unknown[] }
    new Function("window", "document", "dataLayer", consent.gtagBootScript("G-TEST"))(w, { cookie }, w.dataLayer)
    for (const args of w.dataLayer as ArrayLike<unknown>[]) calls.push(Array.from(args))
    return calls.filter((c) => c[0] === "consent").map((c) => c[1])
  }
  assert.deepEqual(run(""), ["default"])
  assert.deepEqual(run("cib_consent=analytics:denied"), ["default"])
  assert.deepEqual(run("cib_theme=dark; cib_consent=analytics:granted"), ["default", "update"])
})

test("accept all grants analytics_storage only", () => {
  assert.deepEqual(consent.consentUpdate(consent.ACCEPT_ALL), { analytics_storage: "granted" })
  const { calls } = fakeBrowser()
  consent.saveConsent(consent.ACCEPT_ALL)
  assert.deepEqual(calls, [["consent", "update", { analytics_storage: "granted" }]])
  assert.deepEqual(consent.readConsent(), { analytics: true, functional: true })
})

test("«Лише необхідні» stores the same choice as saving the panel with analytics off", () => {
  assert.deepEqual(consent.NECESSARY_ONLY, { analytics: false, functional: false })
  const { calls, jar } = fakeBrowser()
  jar.set("_ga", "GA1.1.1")
  consent.saveConsent(consent.NECESSARY_ONLY)
  assert.deepEqual(calls, [["consent", "update", { analytics_storage: "denied" }]])
  assert.deepEqual(consent.readConsent(), { analytics: false, functional: false })
  assert.ok(!jar.has("_ga"))
  // a stored choice: the banner is gone, for good
  assert.equal(consent.shouldShowBanner(consent.readConsent()), false)
})

test("banner (variant B): text link «Налаштувати» opens the panel, then «Лише необхідні» and «Прийняти всі»", async () => {
  const { readFileSync } = await import("node:fs")
  const src = readFileSync(new URL("../src/components/site/ConsentBanner.tsx", import.meta.url), "utf8")
  const banner = src.slice(src.indexOf('if (shown === "banner")'), src.indexOf("return (", src.indexOf('if (shown === "banner")') + 40))
  const more = banner.indexOf('className="cb-consent__more"')
  const necessary = banner.indexOf("choose(NECESSARY_ONLY)")
  const all = banner.indexOf("choose(ACCEPT_ALL)")
  // DOM order = focus order: text link → «Лише необхідні» → «Прийняти всі»
  assert.ok(more > 0 && more < necessary && necessary < all)
  assert.match(banner.slice(more, necessary), /onClick=\{\(\) => setLayer\("panel"\)\}[\s\S]*t\("consent\.customize"\)/)
  // two equal buttons, both primary
  assert.match(banner, /<Button variant="primary" onClick=\{\(\) => choose\(NECESSARY_ONLY\)\}>\{t\("consent\.necessaryOnly"\)\}/)
  assert.match(banner, /<Button variant="primary" onClick=\{\(\) => choose\(ACCEPT_ALL\)\}>\{t\("consent\.acceptAll"\)\}/)
  // choose() saves and closes the banner
  assert.match(src, /const choose = \(prefs: ConsentPrefs\) => \{\s*saveConsent\(prefs\)\s*close\(\)/)
  const css = readFileSync(new URL("../src/styles/consent.css", import.meta.url), "utf8")
  assert.match(css, /\.cb-consent__actions>\.ib-btn\{height:44px/)
  for (const lang of ["uk", "en"]) {
    const m = JSON.parse(readFileSync(new URL(`../messages/${lang}.json`, import.meta.url), "utf8")) as Record<string, string>
    assert.ok(m["consent.necessaryOnly"] && m["consent.customize"] && m["consent.text"].endsWith("{link}"), lang)
  }
})

test("customize: save choice with analytics on grants it", () => {
  const { calls } = fakeBrowser()
  consent.saveConsent({ analytics: true, functional: false })
  assert.deepEqual(calls, [["consent", "update", { analytics_storage: "granted" }]])
  assert.deepEqual(consent.readConsent(), { analytics: true, functional: false })
})

test("customize: save choice with analytics off keeps everything denied", () => {
  const { calls, jar } = fakeBrowser()
  jar.set("_ga", "GA1.1.1")
  consent.saveConsent({ analytics: false, functional: false })
  assert.deepEqual(calls, [["consent", "update", { analytics_storage: "denied" }]])
  assert.deepEqual(consent.readConsent(), { analytics: false, functional: false })
  assert.ok(!jar.has("_ga"))
})

test("save choice with analytics off after accepting drops GA cookies", () => {
  const { calls, jar } = fakeBrowser()
  jar.set("_ga", "GA1.1.1")
  jar.set("_ga_TEST", "GS1.1")
  consent.saveConsent({ analytics: false, functional: false })
  assert.deepEqual(calls, [["consent", "update", { analytics_storage: "denied" }]])
  assert.deepEqual(consent.readConsent(), { analytics: false, functional: false })
  assert.ok(!jar.has("_ga") && !jar.has("_ga_TEST"))
})

test("the choice is written per category to one cookie on the parent domain", () => {
  assert.equal(
    consent.consentCookie(consent.ACCEPT_ALL, { domain: "cybericebox.com", secure: true }),
    "cib_consent=analytics:granted,functional:granted; path=/; max-age=31536000; SameSite=Lax; domain=.cybericebox.com; Secure",
  )
  assert.equal(consent.consentCookie({ analytics: false, functional: false }, { secure: false }), "cib_consent=analytics:denied,functional:denied; path=/; max-age=31536000; SameSite=Lax")
  const { writes } = fakeBrowser()
  consent.saveConsent(consent.ACCEPT_ALL)
  assert.match(writes[0], /^cib_consent=analytics:granted,functional:granted; .*domain=\.cookies\.example\.test; Secure$/)
})

test("the stored choice is read back from the cookie string", () => {
  assert.deepEqual(consent.parseConsent("cib_theme=dark; cib_consent=analytics:granted,functional:denied"), { analytics: true, functional: false })
  assert.deepEqual(consent.parseConsent("cib_consent=analytics:denied,functional:granted"), { analytics: false, functional: true })
  assert.equal(consent.parseConsent("xcib_consent=analytics:granted,functional:granted"), null)
  // the older format (analytics only) counts as no choice: the visitor is asked again
  assert.equal(consent.parseConsent("cib_consent=analytics:granted"), null)
  assert.equal(consent.parseConsent("cib_consent=granted"), null)
  assert.equal(consent.parseConsent(""), null)
})

test("the banner shows until a choice exists", () => {
  assert.equal(consent.shouldShowBanner(null), true)
  assert.equal(consent.shouldShowBanner({ analytics: true, functional: false }), false)
  assert.equal(consent.shouldShowBanner({ analytics: false, functional: false }), false)
})

test("functional data is written only with functional consent and goes when it is withdrawn", () => {
  const { jar, fetched } = fakeBrowser()
  assert.equal(consent.functionalAllowed(), false)
  consent.saveConsent({ analytics: false, functional: true })
  assert.equal(consent.functionalAllowed(), true)
  assert.deepEqual(fetched, [])
  const removed: string[] = []
  const store = (keys: string[]) => ({ length: keys.length, key: (i: number) => keys[i] ?? null, removeItem: (k: string) => { removed.push(k) } })
  ;(globalThis as Record<string, unknown>).window = {
    gtag: () => {}, dispatchEvent: () => true,
    localStorage: store(["cib_inbox_read", "cib_site_banner_dismissed_1_"]),
    sessionStorage: store(["cib_warmup"]),
  }
  jar.set("cib_signed_in", "1")
  consent.saveConsent({ analytics: false, functional: false })
  assert.equal(consent.functionalAllowed(), false)
  assert.ok(removed.includes("cib_inbox_read") && removed.includes("cib_warmup"))
  // the necessary «user's explicit choice» key stays
  assert.ok(!removed.includes("cib_site_banner_dismissed_1_"))
  assert.ok(!jar.has("cib_signed_in"))
  assert.deepEqual(fetched, ["DELETE https://api.cookies.example.test/api/auth/last-email"])
})

test("the policy link opens in a new tab, so the panel and its toggles stay", () => {
  assert.deepEqual(consent.POLICY_LINK_ATTRS, { target: "_blank", rel: "noopener noreferrer" })
})

test("every link in the banner spreads POLICY_LINK_ATTRS, says so in aria-label and stops the click", async () => {
  const ts = (await import("typescript")).default
  const { readFileSync } = await import("node:fs")
  const file = new URL("../src/components/site/ConsentBanner.tsx", import.meta.url)
  const sf = ts.createSourceFile("ConsentBanner.tsx", readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  const anchors: import("typescript").JsxOpeningLikeElement[] = []
  const visit = (n: import("typescript").Node) => {
    if ((ts.isJsxOpeningElement(n) || ts.isJsxSelfClosingElement(n)) && n.tagName.getText(sf) === "a") anchors.push(n)
    ts.forEachChild(n, visit)
  }
  visit(sf)
  assert.ok(anchors.length > 0)
  for (const a of anchors) {
    const attrs = a.attributes.properties.map((p) => p.getText(sf))
    assert.ok(attrs.includes("{...POLICY_LINK_ATTRS}"), attrs.join(" "))
    assert.ok(attrs.some((x) => /^aria-label=\{t\("consent\.policyLink(Short)?NewTab"\)/.test(x)), attrs.join(" "))
    assert.ok(attrs.some((x) => x.includes("stopPropagation")), attrs.join(" "))
  }
})

test("the short phone line: its link name starts with the visible words, both catalogs", async () => {
  const { readFileSync } = await import("node:fs")
  for (const lang of ["uk", "en"]) {
    const m = JSON.parse(readFileSync(new URL(`../messages/${lang}.json`, import.meta.url), "utf8")) as Record<string, string>
    assert.ok(m["consent.textShort"].startsWith("{link}"), lang)
    assert.ok(m["consent.policyLinkShortNewTab"].startsWith(m["consent.policyLinkShort"]), lang)
    assert.ok(m["consent.textShort"].length < m["consent.text"].length, lang)
  }
  const css = readFileSync(new URL("../src/styles/consent.css", import.meta.url), "utf8")
  assert.match(css, /\.cb-consent__short\{display:none\}/)
  assert.match(css, /@media \(max-width:640px\)\{[^}]*\}[^@]*\.cb-consent__full\{display:none\}\s*\.cb-consent__short\{display:inline\}/)
})

test("«Налаштування файлів cookie» link opens the panel instead of navigating", () => {
  const events: string[] = []
  const g = globalThis as Record<string, unknown>
  g.window = { dispatchEvent: (e: Event) => events.push(e.type) }
  let prevented = false
  consent.interceptSettingsLink({ preventDefault: () => { prevented = true } })
  assert.ok(prevented)
  assert.deepEqual(events, [consent.CONSENT_OPEN_EVENT])
})

test("the settings link and the consent panel do not depend on GA being configured", async () => {
  const { readFileSync } = await import("node:fs")
  const read = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8")
  assert.doesNotMatch(read("../src/components/site/SiteFooter.tsx"), /GOOGLE_ANALYTICS/)
  assert.match(read("../src/components/site/CookieSettingsLink.tsx"), /<a href=\{href\}[^>]*onClick=\{interceptSettingsLink\}/)
  assert.doesNotMatch(read("../src/app/layout.tsx"), /GOOGLE_ANALYTICS_ID &&/)
})

test("saveConsent fails without NEXT_PUBLIC_DOMAIN", () => {
  fakeBrowser()
  const saved = process.env.NEXT_PUBLIC_DOMAIN
  delete process.env.NEXT_PUBLIC_DOMAIN
  try {
    assert.throws(() => consent.saveConsent(consent.ACCEPT_ALL), /NEXT_PUBLIC_DOMAIN is required/)
  } finally {
    process.env.NEXT_PUBLIC_DOMAIN = saved
  }
})
