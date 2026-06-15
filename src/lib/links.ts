// Cross-origin + external links for the landing.
// ID_ORIGIN — identity app (sign-in / account), env-driven for cross-origin.
// SOURCE_URL — public GitHub organization (org-level link by product decision).
const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN ?? ""

export const ID_ORIGIN =
  process.env.NEXT_PUBLIC_ID_ORIGIN ?? `https://id.${DOMAIN}`

// Org-level link only (no specific repo); license/docs resolve to the same org page.
export const SOURCE_URL = "https://github.com/cybericebox"

export const LICENSE_URL = SOURCE_URL
export const DOCS_URL = SOURCE_URL
