/**
 * The Docker image path: the build bakes every NEXT_PUBLIC_* value as a placeholder and the container
 * entrypoint (deploy/docker-entrypoint.sh) substitutes the real values at start. A value of another
 * length must not break the pages: each one has to load and hydrate without a page error (React #412,
 * "Connection closed", came from a substituted placeholder inside a length-prefixed text row of the
 * RSC payload). Run against a started image by `mise run test-image`; harmless against any other build.
 */

import { test, expect, type Page } from "@playwright/test"

const PAGES = ["/", "/privacy/", "/terms/", "/security/", "/cookies/"]

// Page errors (uncaught exceptions, React production errors) and React's own console errors.
function collectErrors(page: Page): string[] {
  const errors: string[] = []
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`))
  page.on("console", (m) => {
    if (m.type() === "error" && /react|hydrat|connection closed/i.test(m.text())) errors.push(`console: ${m.text()}`)
  })
  return errors
}

for (const path of PAGES) {
  test(`${path} loads and hydrates without a page error`, async ({ page }) => {
    const errors = collectErrors(page)
    await page.goto(path)
    // ApiProvider sets data-api once the client has hydrated and the probe settled.
    await expect(page.locator("html")).toHaveAttribute("data-api", /.+/, { timeout: 15_000 })
    await page.waitForLoadState("networkidle")
    expect(errors).toEqual([])
    expect(await page.content()).not.toMatch(/__NEXT_PUBLIC_[A-Z0-9_]+__/i)
  })
}
