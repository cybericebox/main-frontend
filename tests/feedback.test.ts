import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { feedbackHref } from "@/lib/feedback"

test("feedbackHref is a mailto with the subject encoded and no no-break spaces", () => {
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL = "support@example.com"
  const href = feedbackHref("Відгук: Cyber\u00A0ICE\u00A0Box /sign-in")
  assert.ok(href.startsWith("mailto:support@example.com?subject="))
  assert.ok(!href.includes("%C2%A0"))
  assert.ok(href.includes(encodeURIComponent("Cyber ICE Box")))
  assert.ok(href.includes("%2Fsign-in"))
})

test("feedbackHref fails without the support mailbox env", () => {
  delete process.env.NEXT_PUBLIC_SUPPORT_EMAIL
  assert.throws(() => feedbackHref("x"), /NEXT_PUBLIC_SUPPORT_EMAIL/)
})

const src = (file: string) => readFileSync(join(import.meta.dirname, "..", file), "utf8")

test("the feedback link lives in the site footer next to the cookie settings, not in the root layout", () => {
  assert.match(src("src/components/site/SiteFooter.tsx"), /<CookieSettingsLink[^>]*\/>,\s*<FeedbackLink/)
  assert.doesNotMatch(src("src/app/layout.tsx"), /FeedbackLink/)
})

test("no fixed-position feedback element remains", () => {
  assert.doesNotMatch(src("src/components/feedback-link.css"), /position\s*:\s*fixed/)
})
