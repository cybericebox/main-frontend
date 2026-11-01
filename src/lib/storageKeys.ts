// Every browser-storage key (localStorage, sessionStorage, cookies) of this app lives here and starts with `cib_`.
// Keys with a scope are built by a function; the scope goes in after an underscore.

export const STORAGE_INBOX_READ = "cib_inbox_read"
export const STORAGE_WARMUP_SOLVED = "cib_warmup"
const SITE_BANNER_DISMISSED = "cib_site_banner_dismissed"

export function siteBannerDismissedKey(id: string | number, version: string | number = ""): string {
  return `${SITE_BANNER_DISMISSED}_${id}_${version}`
}
export const COOKIE_RETURN_TO = "cib_return_to"
// Sign-in hint on the parent domain: set by the backend on sign-in, removed on sign-out and on a 401 of /auth/me. No personal data.
export const COOKIE_SIGNED_IN = "cib_signed_in"

// Functional category (conveniences): written only with functional consent, removed when it is withdrawn.
export const FUNCTIONAL_STORAGE = {
  local: [STORAGE_INBOX_READ],
  localPrefixes: [] as string[],
  session: [STORAGE_WARMUP_SOLVED],
  sessionPrefixes: [] as string[],
  cookies: [COOKIE_SIGNED_IN],
} as const
