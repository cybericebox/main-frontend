// Cross-origin + external links for the landing. Service hosts default to
// <service>.<NEXT_PUBLIC_DOMAIN>; NEXT_PUBLIC_{API,ID,ADMIN,EXERCISES}_DOMAIN override one
// host (bare host, no scheme) — e.g. point the landing at another backend.
// SOURCE_URL — public GitHub organization (org-level link by product decision).
const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN ?? ""

// Current platform domain (for illustrative in-product URLs on the landing).
export const PLATFORM_DOMAIN = DOMAIN || "cybericebox.app"
          
// The project team's mailboxes live on cybericebox.com whatever domain this build is deployed to
// (dev/staging domains have no mailboxes).
const MAIL_DOMAIN = "cybericebox.com"

// Public contact mailbox (footer on every page).
export const CONTACT_EMAIL = `contact@${MAIL_DOMAIN}`

// Privacy / legal questions mailbox (legal pages).
export const PRIVACY_EMAIL = `privacy@${MAIL_DOMAIN}`

// Vulnerability reports (Terms responsible-disclosure clause, /.well-known/security.txt).
export const SECURITY_EMAIL = `security@${MAIL_DOMAIN}`

export const API_ORIGIN = `https://${process.env.NEXT_PUBLIC_API_DOMAIN || `api.${DOMAIN}`}`

export const ID_ORIGIN = `https://${process.env.NEXT_PUBLIC_ID_DOMAIN || `id.${DOMAIN}`}`

// Sign-in page on the identity app (landing primary CTA targets this).
export const SIGN_IN_URI = "/sign-in"

// Sign-up (get-started) page on the identity app.
export const SIGN_UP_URI = "/sign-up"

// Sign-out page on the identity app.
export const SIGN_OUT_URI = "/sign-out"

export const PROFILE_URI = "/profile"

// Admin app (admin.<domain>) — landing CTA target for admin-tier users.
export const ADMIN_ORIGIN = `https://${process.env.NEXT_PUBLIC_ADMIN_DOMAIN || `admin.${DOMAIN}`}`

// Exercise catalog app (exercises.<domain>) — account menu target for admins and event staff.
export const EXERCISES_ORIGIN = `https://${process.env.NEXT_PUBLIC_EXERCISES_DOMAIN || `exercises.${DOMAIN}`}`

// Org-level link only (no specific repo).
export const SOURCE_URL = "https://github.com/cybericebox"
