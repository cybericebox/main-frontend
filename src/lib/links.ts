// Cross-origin + external links for the landing. All platform origins are
// derived from NEXT_PUBLIC_DOMAIN (id.<domain>, admin.<domain>, ...) — the
// domain is the single source of truth, no per-origin env vars.
// SOURCE_URL — public GitHub organization (org-level link by product decision).
const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN ?? ""

// Current platform domain (for illustrative in-product URLs on the landing).
export const PLATFORM_DOMAIN = DOMAIN || "cybericebox.app"
          
export const API_ORIGIN = `https://api.${DOMAIN}`

export const ID_ORIGIN = `https://id.${DOMAIN}`

// Sign-in page on the identity app (landing primary CTA targets this).
export const SIGN_IN_URI = "/sign-in"

// Sign-up (get-started) page on the identity app.
export const SIGN_UP_URI = "/sign-up"

// Sign-out page on the identity app.
export const SIGN_OUT_URI = "/sign-out"

export const PROFILE_URI = "/profile"

// Admin app (admin.<domain>) — landing CTA target for admin-tier users.
export const ADMIN_ORIGIN = `https://admin.${DOMAIN}`

// Org-level link only (no specific repo).
export const SOURCE_URL = "https://github.com/cybericebox"
