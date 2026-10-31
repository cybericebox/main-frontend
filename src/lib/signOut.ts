import { API_ORIGIN } from "@/lib/links"
import { clearSignedHint } from "@/lib/signedHint"

/** Sent when the sign-out request finished; the navbar drops the user and the notice shows. */
export const SIGNED_OUT_EVENT = "cib:signed-out"
/** Sent when the sign-out request failed, so the visitor does not believe they left. */
export const SIGN_OUT_FAILED_EVENT = "cib:sign-out-failed"

/**
 * Ends the session on every site with one POST to the API (credentials included), no confirmation page. Only a 2xx or a
 * 401 (the session is already gone) counts as signed out.
 */
export async function signOutNow(): Promise<void> {
  try {
    const res = await fetch(`${API_ORIGIN}/api/auth/sign-out`, { method: "POST", credentials: "include" })
    if (!res.ok && res.status !== 401) throw new Error(`sign-out ${res.status}`)
  } catch {
    window.dispatchEvent(new Event(SIGN_OUT_FAILED_EVENT))
    return
  }
  clearSignedHint()
  window.dispatchEvent(new Event(SIGNED_OUT_EVENT))
}
