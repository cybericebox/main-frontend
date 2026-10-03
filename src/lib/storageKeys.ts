// Every browser-storage key (localStorage, sessionStorage, cookies) of this app lives here and starts with `cib_`.
// Keys with a scope are built by a function; the scope goes in after an underscore.

export const STORAGE_INBOX_READ = "cib_inbox_read"
export const STORAGE_WARMUP_SOLVED = "cib_warmup"
const SITE_BANNER_DISMISSED = "cib_site_banner_dismissed"

export function siteBannerDismissedKey(id: string | number, version: string | number = ""): string {
  return `${SITE_BANNER_DISMISSED}_${id}_${version}`
}
export const COOKIE_RETURN_TO = "cib_return_to"
// ExpiresAt (RFC3339) of the HttpOnly client-token cookie the API set for this browser (per-origin convenience only).
export const STORAGE_CLIENT_TOKEN_EXPIRES = "cib_client_token_expires"
