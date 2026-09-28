/**
 * Playwright configuration for main-frontend smoke tests.
 *
 * Tests under e2e/ are SKIPPED by default in CI / npm run build.
 *
 * Static landing (API down), no dev-env needed:
 *   npm run build && E2E_STATIC=1 npx playwright test
 * (serves out/ on 127.0.0.1:4173 via e2e/static-server.mjs)
 * e2e/ lives OUTSIDE src/, so `next build` (static export) never picks it up;
 * this config is only consulted when `playwright test` is invoked directly.
 *
 * They require a running local dev-env:
 *   - daemon (Go proxy) routing the apex + id.<domain> subdomain
 *   - main-frontend (Next dev server) on http://localhost:3000
 *   - id-frontend on http://localhost:3001 (for the cross-origin SSO bounce)
 *   - Subdomain DNS / hosts entry: id.<domain> → 127.0.0.1
 *
 * To run locally:
 *   E2E_BASE_URL=http://localhost:3000 npx playwright test
 *
 * NOTE: `playwright install` (browser download) is NOT run as part of
 * npm install — run it manually before executing these tests.
 */

import { defineConfig, devices } from "@playwright/test"

// E2E_STATIC=1 serves the static export (out/) — the landing with the API down.
const STATIC = !!process.env.E2E_STATIC
const baseURL = STATIC ? "http://127.0.0.1:4173" : (process.env.E2E_BASE_URL ?? "http://localhost:3000")

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  webServer: STATIC
    ? { command: "node e2e/static-server.mjs", url: baseURL, reuseExistingServer: true }
    : undefined,
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
})
