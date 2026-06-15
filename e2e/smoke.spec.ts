/**
 * main-frontend smoke tests — silent-authn on the apex landing.
 *
 * NOT executed during `npm run build` or CI. e2e/ is outside src/ so the Next
 * static export ignores it; these run only via `playwright test`.
 *
 * These tests REQUIRE a fully running local dev-environment:
 *   - daemon (Go proxy) routing the apex landing + id.<domain> subdomain
 *   - main-frontend (Next dev server) on http://localhost:3000
 *   - id-frontend on http://localhost:3001 (issues the master session + the
 *     prompt=none authorize endpoint that bounces back with ?no_session=1)
 *   - Subdomain DNS / hosts entry: id.<domain> → 127.0.0.1
 *
 * Run with:
 *   E2E_BASE_URL=http://localhost:3000 npx playwright test
 *
 * All tests are marked test.fixme() so they are skipped unless explicitly
 * un-fixed or overridden with --grep. This prevents accidental execution in CI.
 */

import { test, expect } from "@playwright/test"

// Guard: if E2E_BASE_URL is not set, skip the entire suite gracefully.
const E2E_ENABLED = !!process.env.E2E_BASE_URL

test.describe("main-frontend silent-authn smoke — requires local dev-env", () => {
  /**
   * (a) Anonymous landing shows Sign-in (after the silent bounce).
   *
   * Flow under test (loop-prevention invariant):
   *   1. Fresh visit with no main local-token and no master session on id.
   *   2. useAuthState attempts a prompt=none top-level redirect to id.
   *   3. id has no master session → bounces back with ?no_session=1.
   *   4. consumeNoSessionParam() sets the anon marker + strips the param.
   *   5. Landing settles on the signed-out header (Sign-in visible), and does
   *      NOT redirect again (anon marker gates further attempts for ~5 min).
   */
  test.fixme(
    "anonymous landing shows Sign-in after silent bounce",
    async ({ page, context }) => {
      if (!E2E_ENABLED) test.skip()

      // Ensure a clean, genuinely-anonymous state.
      await context.clearCookies()

      await page.goto("/")

      // After the prompt=none bounce + anon marker, the header settles signed-out.
      await expect(page.getByRole("link", { name: /sign in/i })).toBeVisible()

      // The bounce param must have been stripped from the visible URL.
      expect(new URL(page.url()).searchParams.get("no_session")).toBeNull()

      // Loop-prevention: a reload must NOT trigger another redirect away from
      // the apex (anon marker is fresh) — Sign-in stays visible.
      await page.reload()
      await expect(page.getByRole("link", { name: /sign in/i })).toBeVisible()
    }
  )

  /**
   * (b) Signed-in landing shows the avatar / name menu.
   *
   * Prereq: an active master session on id AND a main local-token (e.g. seeded
   * via a prior sign-in, or via the silent-authn success path). With `me`
   * present, useAuthState renders "authed" and clears any anon marker.
   */
  test.fixme(
    "signed-in landing shows avatar/name menu",
    async ({ page }) => {
      if (!E2E_ENABLED) test.skip()

      // NOTE: real run must establish a session first (sign in on id, or inject
      // the local-token cookie) before navigating to the apex.
      await page.goto("/")

      // The avatar trigger is an accessible button labelled with the user's name.
      const avatar = page.getByRole("button").first()
      await expect(avatar).toBeVisible()

      // Opening it reveals the authed menu (Profile + Sign out).
      await avatar.click()
      await expect(page.getByRole("menuitem", { name: /profile/i })).toBeVisible()
      await expect(page.getByRole("menuitem", { name: /sign out/i })).toBeVisible()
    }
  )

  /**
   * (c) Sign-out returns to the landing signed-out.
   *
   * Prereq: starts signed in (see (b)).
   *
   * Flow: open the avatar menu → Sign out (top-level anchor to id /sign-out with
   * return_to back to the apex) → master session cleared → bounced back → the
   * landing renders signed-out (Sign-in visible).
   */
  test.fixme(
    "sign-out returns to landing signed-out",
    async ({ page }) => {
      if (!E2E_ENABLED) test.skip()

      await page.goto("/")

      const avatar = page.getByRole("button").first()
      await avatar.click()
      await page.getByRole("menuitem", { name: /sign out/i }).click()

      // After the id sign-out + return_to bounce, the landing is signed-out.
      await expect(page.getByRole("link", { name: /sign in/i })).toBeVisible()
    }
  )
})
