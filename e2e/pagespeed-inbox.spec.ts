import { test, expect, type Page } from "@playwright/test"

// Local API fixtures only: no real account or notification mutations.
const message = {
  ID: "00000000-0000-0000-0000-000000000001", Title: "Performance fixture", Body: 'Safe body<img src=x onerror="window.__unsafeInbox=true">',
  Link: "", CreatedAt: "2026-10-12T06:00:00Z", ReadAt: null,
}

async function mockApi(page: Page, signedIn: boolean) {
  await page.route("**/api/**", async (route) => {
    const path = new URL(route.request().url()).pathname
    let data: unknown = null
    let status = 200
    if (path === "/api/auth/me") {
      status = signedIn ? 200 : 401
      data = signedIn ? { FirstName: "Local", LastName: "Fixture", Email: "fixture@example.com", Role: "user" } : null
    } else if (path === "/api/notifications/inbox/poll") {
      data = { Cursor: null, NewInbox: [], UnreadCount: 1 }
    } else if (path === "/api/notifications/inbox") {
      data = { Items: [message], NextCursor: null }
    } else if (path === "/api/banners") {
      data = []
    }
    await route.fulfill({ status, contentType: "application/json", json: { Status: { Code: 0 }, Data: data } })
  })
}

test("guest landing does not download the inbox sanitizer", async ({ page }) => {
  await mockApi(page, false)
  const scripts: Promise<string>[] = []
  page.on("response", (response) => {
    if (new URL(response.url()).pathname.endsWith(".js")) scripts.push(response.text())
  })
  await page.goto("/")
  await expect(page.locator("html")).toHaveAttribute("data-api", "up")
  await expect(page.locator(".ib-navbar").getByRole("link", { name: "Увійти" })).toBeVisible()
  await page.waitForLoadState("networkidle")
  expect((await Promise.all(scripts)).some((script) => script.includes("SAFE_FOR_TEMPLATES"))).toBe(false)
  await expect(page.locator(".ib-navbar").getByRole("button", { name: /Вхідні/ })).toHaveCount(0)
})

test("signed-in inbox loads, opens by keyboard, sanitizes, and works after page navigation", async ({ page }) => {
  await mockApi(page, true)
  await page.goto("/")
  for (const path of ["/", "/privacy/"]) {
    if (path !== "/") {
      await page.getByRole("link", { name: "Політика конфіденційності", exact: true }).click()
      await expect(page).toHaveURL(new RegExp(`${path}$`))
    }
    const button = page.locator(".ib-navbar").getByRole("button", { name: /Вхідні/ })
    await expect(button).toBeVisible()
    await button.focus()
    await page.keyboard.press("Enter")
    const inbox = page.getByRole("dialog", { name: "Вхідні", exact: true })
    await expect(inbox).toBeVisible()
    await expect(inbox.getByText(message.Title)).toBeVisible()
    await expect(inbox.getByText("Safe body", { exact: true })).toBeVisible()
    await expect(inbox.locator("img[onerror], script")).toHaveCount(0)
    await page.keyboard.press("Escape")
    await expect(inbox).toBeHidden()
    await expect(button).toBeFocused()
  }
})
