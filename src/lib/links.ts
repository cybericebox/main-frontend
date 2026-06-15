// Cross-origin + external links for the landing.
// ID_ORIGIN — identity app (sign-in / account), env-driven for cross-origin.
// SOURCE_URL — public GitHub organization (org-level link by product decision).
const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN ?? ""

export const ID_ORIGIN =
  process.env.NEXT_PUBLIC_ID_ORIGIN ?? `https://id.${DOMAIN}`

// Sign-in page on the identity app (landing primary CTA targets this).
export const SIGN_IN_URL = `${ID_ORIGIN}/sign-in`

// Sign-up (get-started) page on the identity app.
export const SIGN_UP_URL = `${ID_ORIGIN}/sign-up`

// Org-level link only (no specific repo).
export const SOURCE_URL = "https://github.com/cybericebox"
