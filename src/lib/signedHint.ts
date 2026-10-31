/**
 * Sign-in hint: the `cib_signed_in=1` cookie (parent domain, readable by JS, no personal data) is set by the backend on a
 * successful sign-in. With it the navbar shows a generic avatar at once, before `/auth/me` answers; without it (or
 * once the check says «guest» / does not answer) the navbar shows «Увійти». The static HTML carries both and the
 * `data-signed-hint` attribute on <html> picks one before first paint (SIGNED_HINT_BOOT_SCRIPT, see site.css).
 */

import { hosts } from "@/lib/hosts"
import { COOKIE_SIGNED_IN } from "@/lib/storageKeys"

// Keep in sync with hasSignedHint below.
export const SIGNED_HINT_BOOT_SCRIPT = `(function(){try{if(/(?:^|; )${COOKIE_SIGNED_IN}=1/.test(document.cookie))document.documentElement.setAttribute("data-signed-hint","")}catch(e){}})()`

export function hasSignedHint(): boolean {
  return typeof document !== "undefined" && new RegExp(`(?:^|; )${COOKIE_SIGNED_IN}=1`).test(document.cookie)
}

/** The check said «guest» or did not answer in time: the avatar placeholder gives way to «Увійти» (the cookie stays). */
export function hideSignedHint(): void {
  if (typeof document !== "undefined") document.documentElement.removeAttribute("data-signed-hint")
}

/** The check said «guest» or the visitor signed out: the hint is stale, the cookie goes too. */
export function clearSignedHint(): void {
  if (typeof document === "undefined") return
  hideSignedHint()
  const secure = location.protocol === "https:" ? "; Secure" : ""
  document.cookie = `${COOKIE_SIGNED_IN}=; path=/; domain=.${hosts().cookieDomain}; SameSite=Lax${secure}; max-age=0`
}
