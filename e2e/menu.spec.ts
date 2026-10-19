// Phone menu: one behaviour, always an overlay under the header (CyberICEBox CLAUDE.md «Mobile menu»).
// Runs against the static export: E2E_STATIC=1 playwright test e2e/menu.spec.ts
import { test, expect, type Page } from "@playwright/test"

const WIDTHS = [320, 360, 390, 430]
const SHOTS = process.env.MENU_SHOTS_DIR

// A real tap at the button: locator.click() would scroll the page itself and hide a layout bug.
async function tap(page: Page, selector: string) {
  const box = (await page.locator(selector).first().boundingBox())!
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
}

async function contentTop(page: Page) {
  return page.evaluate(() => Math.round(document.querySelector("#main")!.getBoundingClientRect().top + window.scrollY))
}

for (const width of WIDTHS) {
  for (const theme of ["light", "dark"] as const) {
    for (const scrolled of [false, true]) {
      test(`menu overlays the page: ${width}px ${theme} ${scrolled ? "scrolled" : "top"}`, async ({ page }) => {
        await page.setViewportSize({ width, height: 740 })
        await page.addInitScript((th) => localStorage.setItem("cib_theme", th), theme)
        await page.goto("/")
        await expect(page.locator("html")).toHaveAttribute("data-api", "down", { timeout: 10_000 }) // hydrated, layout settled
        await page.evaluate((th) => document.documentElement.setAttribute("data-theme", th), theme)
        if (scrolled) await page.evaluate(() => window.scrollTo({ top: 600, behavior: "instant" }))
        await page.waitForTimeout(300)
        const y = await page.evaluate(() => window.scrollY)
        const nav = page.locator(".ib-navbar")
        const toggle = nav.locator(".ib-navbar__toggle")
        const before = { top: await contentTop(page), header: await nav.boundingBox() }

        await tap(page, ".ib-navbar__toggle")
        await expect(toggle).toHaveAttribute("aria-expanded", "true")
        const panel = nav.locator(".ib-navbar__panel")
        await expect(panel).toBeVisible()
        expect(await contentTop(page)).toBe(before.top)
        expect(await nav.boundingBox()).toEqual(before.header)
        expect(await page.evaluate(() => window.scrollY)).toBe(y)
        const pb = (await panel.boundingBox())!
        expect(Math.round(pb.y)).toBe(Math.round(before.header!.y + before.header!.height))
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
        // the page behind does not scroll
        await page.mouse.wheel(0, 400)
        expect(await page.evaluate(() => window.scrollY)).toBe(y)
        if (SHOTS) await page.screenshot({ path: `${SHOTS}/${width}-${theme}-${scrolled ? "scrolled" : "top"}.png` })

        await page.keyboard.press("Escape")
        await expect(panel).toBeHidden()
        await expect(toggle).toBeFocused()
        expect(await contentTop(page)).toBe(before.top)
      })
    }
  }
}

test("a tap outside and a link click close the menu and focus the burger", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 740 })
  await page.goto("/")
  const nav = page.locator(".ib-navbar")
  const toggle = nav.locator(".ib-navbar__toggle")
  const panel = nav.locator(".ib-navbar__panel")
  await toggle.click()
  await page.mouse.click(195, 700)
  await expect(panel).toBeHidden()
  await expect(toggle).toBeFocused()
  await toggle.click()
  await panel.locator("a").first().click()
  await expect(panel).toBeHidden()
  await expect(toggle).toBeFocused()
})
