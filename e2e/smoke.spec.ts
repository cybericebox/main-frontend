/**
 * main-frontend smoke tests. NOT executed during `npm run build` or CI.
 *
 * 1. "static landing" — runs against the static export with the API down
 *    (the landing must be fully usable without the backend):
 *      npm run test:e2e:static   (builds with a test NEXT_PUBLIC_WARMUP_FLAG, then E2E_STATIC=1 playwright test)
 *    (playwright.config.ts serves out/ on :4173 when E2E_STATIC is set)
 *
 * 2. "with API" — REQUIRES the local dev-env (daemon routing apex + api/id
 *    subdomains, main-frontend + id-frontend dev servers). Marked test.fixme()
 *    so they only run when un-fixed:
 *      E2E_BASE_URL=https://<domain> npx playwright test
 */

import { test, expect } from "@playwright/test"
import { nbsp } from "../src/i18n/typo"

test("typography: no dangling short words (nbsp)", () => {
  expect(nbsp("Полігон для CTF‑змагань і лабораторій")).toContain("і\u00a0лабораторій")
  expect(nbsp("Полігон для CTF")).toBe("Полігон для\u00a0CTF")
  expect(nbsp("Так — середовища")).toBe("Так\u00a0— середовища")
  expect(nbsp("Від старту")).toBe("Від\u00a0старту") // case-insensitive
  expect(nbsp("мійі слово")).toBe("мійі слово") // «і» inside a word is untouched
})


test.describe("static landing — API down", () => {
  test("renders every section and no API-driven controls", async ({ page }) => {
    await page.goto("/")
    await expect(page.getByRole("heading", { level: 1 })).toContainText("і\u00a0лабораторій")
    for (const id of ["labs", "faq"]) {
      await expect(page.locator(`#${id}`)).toHaveCount(1)
    }
    // the probe settles to "down": no sign-in / avatar in the navbar
    await expect(page.locator("html")).toHaveAttribute("data-api", "down", { timeout: 10_000 })
    const nav = page.locator(".ib-navbar")
    await expect(nav.getByRole("link", { name: "Увійти" })).toHaveCount(0)
    await expect(nav.locator(".ib-avatar-btn")).toHaveCount(0)
    // hero: «Спробувати розминку» + «Лабораторії»; the warm-up card is closed until opened
    await expect(page.locator(".pl-hero a:not(dialog a)")).toHaveCount(1)
    await expect(page.locator(".pl-hero").getByRole("link", { name: "Лабораторії" })).toHaveAttribute("href", "#labs")
    await expect(page.locator(".hc-win")).toHaveCount(1)
    await expect(page.locator("#warmup-card")).toHaveCount(0)
  })

  test("warm-up: follow the hint chain to the flag, which is accepted", async ({ page, request }) => {
    // HTML comment → robots.txt → /.well-known/ice/… (base64). The plaintext is never in the page.
    const html = await (await request.get("/")).text()
    expect(html).toContain("<!-- розминка: robots.txt -->")
    expect(html).not.toMatch(/ICE\{(?!…)[^}]+\}/)
    const robots = await (await request.get("/robots.txt")).text()
    const hintPath = robots.match(/Disallow:\s*(\/\.well-known\/ice\/\S+)/)?.[1]
    expect(hintPath).toBeTruthy()
    const FLAG = Buffer.from((await (await request.get(hintPath!)).text()).trim(), "base64").toString("utf8")
    expect(FLAG).toMatch(/^ICE\{[^}]+\}$/)

    await page.goto("/")
    await expect(page.locator("html")).toHaveAttribute("data-api", "down", { timeout: 10_000 }) // hydrated + probe settled
    // the card opens from the left button; focus lands in the flag field
    const tryBtn = page.getByRole("button", { name: "Спробувати розминку" })
    await tryBtn.click()
    const card = page.getByRole("dialog", { name: "Прапор у коді сторінки" })
    await expect(card).toBeVisible()
    const input = page.locator("#warmup-flag")
    await expect(input).toBeFocused()
    await input.fill("ICE{nope}")
    await page.getByRole("button", { name: "Здати" }).click()
    await expect(page.locator("#warmup-msg")).toContainText("Прапор не прийнято")

    await input.fill(FLAG)
    await page.getByRole("button", { name: "Здати" }).click()
    await expect(page.locator("#warmup-msg")).toContainText("Розвʼязано")
    await expect(page.locator(".hc-tile.is-warm")).toHaveClass(/is-solved/)
    const dialog = page.getByRole("dialog", { name: "Прапор прийнято" })
    await expect(dialog).toBeVisible({ timeout: 5000 }) // opens after a short pause; the card closes
    await expect(card).toHaveCount(0)
    await expect(dialog.locator(".pl-stats dd")).toHaveCount(3)
    // no registration offer; the API is down in the static run, so no «Увійти» either — only «Закрити»
    await expect(dialog.getByRole("link", { name: "Зареєструватися" })).toHaveCount(0)
    await expect(dialog.getByRole("link", { name: "Увійти" })).toHaveCount(0)
    await expect(dialog.getByRole("button", { name: "Закрити" })).toBeVisible()
    await page.keyboard.press("Escape")
    await expect(dialog).toBeHidden()
    await expect(page.getByRole("button", { name: "Розминку пройдено" })).toBeVisible()

    // solved state survives a reload within the session, without the dialog; the card opens read-only
    await page.reload()
    await expect(page.locator("html")).toHaveAttribute("data-api", "down", { timeout: 10_000 })
    await expect(page.locator(".hc-tile.is-warm")).toHaveClass(/is-solved/)
    await expect(dialog).toBeHidden()
    await page.getByRole("button", { name: "Розминку пройдено" }).click()
    await expect(page.locator("#warmup-flag")).toBeDisabled()
    await expect(page.locator("#warmup-flag")).toHaveValue("") // the page doesn't know the flag, only its hash
    await expect(page.locator("#warmup-msg")).toContainText("13 місце в демо-рейтингу")
  })

  test("warm-up card: opens from the tile, Esc closes and returns focus", async ({ page }) => {
    await page.goto("/")
    await expect(page.locator("html")).toHaveAttribute("data-api", "down", { timeout: 10_000 })
    const tile = page.locator("button.hc-tile.is-warm")
    await tile.focus()
    await page.keyboard.press("Enter")
    const card = page.getByRole("dialog", { name: "Прапор у коді сторінки" })
    await expect(card).toBeVisible()
    await expect(card).toHaveAttribute("aria-modal", "false")
    await expect(page.locator("#warmup-flag")).toBeFocused()
    await page.keyboard.press("Escape")
    await expect(card).toHaveCount(0)
    await expect(tile).toBeFocused()
    // × closes too
    await tile.click()
    await card.getByRole("button", { name: "Закрити" }).click()
    await expect(card).toHaveCount(0)
  })

  test("theme switch sets data-theme", async ({ page }) => {
    await page.goto("/")
    await expect(page.locator("html")).toHaveAttribute("data-api", "down", { timeout: 10_000 })
    await page.getByRole("radio", { name: "Темна", exact: true }).click()
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark")
    await page.getByRole("radio", { name: "Світла", exact: true }).click()
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light")
  })

  test("legal page has numbered sections and anchors back to the landing", async ({ page }) => {
    await page.goto("/privacy")
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Політика конфіденційності")
    await expect(page.locator("#s1")).toHaveCount(1)
    await expect(page.locator(".ib-navbar__tabs a").first()).toHaveAttribute("href", "/#labs")
  })
})

test.describe("with API — requires local dev-env", () => {
  test.fixme("anonymous visitor sees one «Увійти» button", async ({ page, context }) => {
    await context.clearCookies()
    await page.goto("/")
    const nav = page.locator(".ib-navbar")
    await expect(nav.getByRole("link", { name: "Увійти" })).toBeVisible()
  })

  test.fixme("signed-in user sees the avatar menu", async ({ page }) => {
    // NOTE: establish a session first (sign in on id) before navigating to the apex.
    await page.goto("/")
    const avatar = page.locator(".ib-navbar .ib-avatar-btn")
    await expect(avatar).toBeVisible()
    await avatar.click()
    await expect(page.getByRole("menuitem", { name: "Профіль" })).toBeVisible()
    await expect(page.getByRole("menuitem", { name: "Вийти" })).toBeVisible()
  })

  test.fixme("sign-out returns to the landing signed-out", async ({ page }) => {
    await page.goto("/")
    await page.locator(".ib-navbar .ib-avatar-btn").click()
    await page.getByRole("menuitem", { name: "Вийти" }).click()
    await expect(page.locator(".ib-navbar").getByRole("link", { name: "Увійти" })).toBeVisible()
  })
})
