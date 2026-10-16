import { expect, test } from "@playwright/test"

const firstText = `First announcement: ${"Long primary text ".repeat(12)}`
const banner = (ID: string, Text: string, Version = 1) => ({ ID, Text, Version, Dismissible: true, Level: "info" })

for (const width of [1440, 390]) test(`announcements stay bounded above navigation and dismiss independently at ${width}px`, async ({ page }) => {
  await page.setViewportSize({ width, height: 900 })
  const bannerQueries: string[] = []
  let recovering = false
  await page.route("**/api/**", async (route) => {
    const url = new URL(route.request().url())
    const isBanner = url.pathname === "/api/banners"
    if (isBanner) bannerQueries.push(url.search)
    await route.fulfill({
      status: url.pathname === "/api/auth/me" ? 401 : 200,
      json: { Data: isBanner ? [banner("one", recovering ? "Updated announcement" : firstText, recovering ? 2 : 1), ...Array.from({ length: 9 }, (_, index) => banner(`other${index}`, `Other announcement ${index}: ${"Long announcement text ".repeat(8)}`))] : null },
    })
  })
  await page.goto("/")
  const announcements = page.getByRole("status", { name: "Оголошення" })
  const more = announcements.getByRole("button", { name: "Ще 9 оголошень" })
  await expect(announcements.getByText(firstText)).toBeVisible()
  await expect(announcements.locator(".ib-site-banner")).toHaveCount(1)
  expect(bannerQueries[0]).toBe("?site=main")
  const stack = await announcements.boundingBox()
  const navigation = await page.locator(".ib-navbar").boundingBox()
  expect(stack!.y + stack!.height).toBeLessThanOrEqual(navigation!.y)
  await more.click()
  const panel = page.getByRole("dialog", { name: "Інші оголошення" })
  await expect(panel).toBeVisible()
  await expect(panel.getByRole("heading", { name: "Інші оголошення" })).toBeFocused()
  await expect(panel.locator(".ib-site-banner")).toHaveCount(9)
  expect(await panel.locator(".ib-site-banner__text").allTextContents()).toEqual(Array.from({ length: 9 }, (_, index) => `Other announcement ${index}: ${"Long announcement text ".repeat(8)}`))
  const panelBox = await panel.boundingBox()
  expect(panelBox!.x).toBeGreaterThanOrEqual(16)
  expect(panelBox!.width).toBeLessThanOrEqual(Math.min(640, width - 32))
  expect(panelBox!.height).toBeLessThanOrEqual(480)
  expect(await page.locator(".ib-navbar").boundingBox()).toEqual(navigation)
  await panel.getByRole("button", { name: "Закрити оголошення" }).first().click()
  await expect(more).toHaveCount(0)
  await expect(announcements.getByRole("button", { name: "Ще 8 оголошень" })).toBeVisible()
  await expect(panel.locator(".ib-site-banner")).toHaveCount(8)
  await page.keyboard.press("Escape")
  await expect(panel).toHaveCount(0)
  await expect(announcements.getByRole("button", { name: "Ще 8 оголошень" })).toBeFocused()
  await announcements.getByRole("button", { name: "Закрити оголошення" }).click()
  await expect(announcements.getByText(firstText)).toHaveCount(0)
  await expect(announcements.getByText(/Other announcement 1:/)).toBeVisible()
  recovering = true
  await page.evaluate(() => window.dispatchEvent(new Event("online")))
  await expect(announcements.getByText("Updated announcement")).toBeVisible()
  expect(bannerQueries.length).toBeGreaterThan(1)
  await page.goto("/privacy/")
  await expect(announcements.getByText("Updated announcement")).toBeVisible()
  expect((await announcements.boundingBox())!.y).toBeLessThan((await page.locator(".ib-navbar").boundingBox())!.y)
})
