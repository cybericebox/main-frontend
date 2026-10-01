// Cross-origin + external links for the landing. Every value comes from the deployment env
// (NEXT_PUBLIC_*, hosts are bare hosts without a scheme); a missing value fails the build / container start.
import { requiredEnv } from "@/lib/env"

// Landing host (canonical origin for metadata, sitemap, robots, security.txt; parent domain of shared cookies).
export const MAIN_HOST = requiredEnv(process.env.NEXT_PUBLIC_MAIN_HOST, "NEXT_PUBLIC_MAIN_HOST")

// Domain of event sites (<tag>.<domain>): shown in the landing's illustrative event URL.
export const EVENT_DOMAIN = requiredEnv(process.env.NEXT_PUBLIC_EVENT_DOMAIN, "NEXT_PUBLIC_EVENT_DOMAIN")

// Public contact mailbox (footer on every page).
export const CONTACT_EMAIL = requiredEnv(process.env.NEXT_PUBLIC_CONTACT_EMAIL, "NEXT_PUBLIC_CONTACT_EMAIL")

// Privacy / legal questions mailbox (legal pages).
export const PRIVACY_EMAIL = requiredEnv(process.env.NEXT_PUBLIC_PRIVACY_EMAIL, "NEXT_PUBLIC_PRIVACY_EMAIL")

// Vulnerability reports (Terms responsible-disclosure clause, /.well-known/security.txt).
export const SECURITY_EMAIL = requiredEnv(process.env.NEXT_PUBLIC_SECURITY_EMAIL, "NEXT_PUBLIC_SECURITY_EMAIL")

export const API_ORIGIN = `https://${requiredEnv(process.env.NEXT_PUBLIC_API_HOST, "NEXT_PUBLIC_API_HOST")}`

export const ID_ORIGIN = `https://${requiredEnv(process.env.NEXT_PUBLIC_ID_HOST, "NEXT_PUBLIC_ID_HOST")}`

// Sign-in page on the identity app (landing primary CTA targets this).
export const SIGN_IN_URI = "/sign-in"

// Sign-up (get-started) page on the identity app.
export const SIGN_UP_URI = "/sign-up"

// Sign-out page on the identity app.
export const SIGN_OUT_URI = "/sign-out"

export const PROFILE_URI = "/profile"

// Admin app — landing CTA target for admin-tier users.
export const ADMIN_ORIGIN = `https://${requiredEnv(process.env.NEXT_PUBLIC_ADMIN_HOST, "NEXT_PUBLIC_ADMIN_HOST")}`

// Exercise catalog app — account menu target for admins and event staff.
export const EXERCISES_ORIGIN = `https://${requiredEnv(process.env.NEXT_PUBLIC_EXERCISES_HOST, "NEXT_PUBLIC_EXERCISES_HOST")}`

// Public source link (org-level, no specific repo).
export const SOURCE_URL = requiredEnv(process.env.NEXT_PUBLIC_SOURCE_URL, "NEXT_PUBLIC_SOURCE_URL")

// Partner (department / university) links in the footer credit.
export const PARTNER_URL = requiredEnv(process.env.NEXT_PUBLIC_PARTNER_URL, "NEXT_PUBLIC_PARTNER_URL")
export const PARTNER_SITE_URL = requiredEnv(process.env.NEXT_PUBLIC_PARTNER_SITE_URL, "NEXT_PUBLIC_PARTNER_SITE_URL")
