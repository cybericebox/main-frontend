// Client token (anti-DoS): when NEXT_PUBLIC_DOS_PROTECTION is on, the browser gets an HttpOnly `__Host-client`
// cookie from POST /api/client-token (proved with the bot check, action clientToken) before the first API call.
// JS never reads the cookie; only its ExpiresAt is kept in localStorage as a per-origin convenience.
// The whole flow is invisible and never throws: a failure lets the original request go and show its own error.
import { executeCaptcha } from "@/lib/captcha"
import { API_ORIGIN } from "@/lib/links"
import { STORAGE_CLIENT_TOKEN_EXPIRES } from "@/lib/storageKeys"

// Refresh this long before the cookie expires.
const EXPIRY_MARGIN_MS = 60_000
// Wait before asking for a token again after a failure without Retry-After.
const FAILURE_BACKOFF_MS = 30_000
const MAX_BACKOFF_MS = 10 * 60_000

export function dosProtectionOn(): boolean {
  return ["on"].includes(process.env.NEXT_PUBLIC_DOS_PROTECTION ?? "")
}

let inflight: Promise<boolean> | null = null
// A 404 from the token endpoint: the backend has DOS protection off. Remembered for the session.
let backendOff = false
let backoffUntil = 0
let memoryExpiry = 0

function readStoredExpiry(): number {
  try {
    const value = Number(localStorage.getItem(STORAGE_CLIENT_TOKEN_EXPIRES))
    return Number.isFinite(value) ? value : 0
  } catch {
    return 0
  }
}

function storeExpiry(at: number): void {
  memoryExpiry = at
  try {
    localStorage.setItem(STORAGE_CLIENT_TOKEN_EXPIRES, String(at))
  } catch {
    // storage blocked: the in-memory value still covers this page session
  }
}

function clearExpiry(): void {
  memoryExpiry = 0
  try {
    localStorage.removeItem(STORAGE_CLIENT_TOKEN_EXPIRES)
  } catch {
    // ignore
  }
}

function tokenValid(): boolean {
  const expires = Math.max(memoryExpiry, readStoredExpiry())
  return expires - EXPIRY_MARGIN_MS > Date.now()
}

function backOff(retryAfterHeader: string | null): void {
  const seconds = Number(retryAfterHeader)
  const ms = Number.isFinite(seconds) && seconds > 0 ? seconds * 1000 : FAILURE_BACKOFF_MS
  backoffUntil = Date.now() + Math.min(ms, MAX_BACKOFF_MS)
}

// True when a fresh token is now in place.
async function fetchToken(): Promise<boolean> {
  try {
    const token = await executeCaptcha("clientToken")
    const res = await fetch(`${API_ORIGIN}/api/client-token`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ RecaptchaToken: token }),
    })
    if (res.status === 404) {
      backendOff = true
      return false
    }
    if (!res.ok) {
      backOff(res.status === 429 ? res.headers.get("Retry-After") : null)
      return false
    }
    let expiresAt = NaN
    try {
      const body = (await res.json()) as { Data?: { ExpiresAt?: string } }
      expiresAt = Date.parse(body?.Data?.ExpiresAt ?? "")
    } catch {
      // no readable body: the cookie is set anyway, ask again in a while
    }
    storeExpiry(Number.isFinite(expiresAt) ? expiresAt : Date.now() + EXPIRY_MARGIN_MS * 2)
    return true
  } catch {
    backOff(null)
    return false
  }
}

function start(): Promise<boolean> {
  if (!inflight) {
    inflight = fetchToken().finally(() => {
      inflight = null
    })
  }
  return inflight
}

function active(): boolean {
  return typeof window !== "undefined" && dosProtectionOn() && !backendOff
}

// ensureClientToken makes sure the cookie is fresh before an API call: one request even for parallel calls.
export async function ensureClientToken(): Promise<void> {
  if (!active()) return
  if (inflight) {
    await inflight
    return
  }
  if (tokenValid() || Date.now() < backoffUntil) return
  await start()
}

// refreshClientToken forces a new token after the API answered 429 + X-Client-Token: required.
// True when the original request is worth retrying (a fresh token is in place).
export async function refreshClientToken(): Promise<boolean> {
  if (!active()) return false
  if (inflight) return inflight
  if (Date.now() < backoffUntil) return false
  clearExpiry()
  return start()
}

export function isClientTokenRequired(res: Response): boolean {
  return res.status === 429 && res.headers.get("X-Client-Token") === "required"
}

// sendWithClientToken runs one API request under the anti-DoS client token: the cookie is in place before the call;
// a 429 with X-Client-Token: required refreshes it and the call is repeated ONCE. A plain 429 is a rate limit.
export async function sendWithClientToken(send: () => Promise<Response>): Promise<Response> {
  await ensureClientToken()
  const res = await send()
  if (isClientTokenRequired(res) && (await refreshClientToken())) return send()
  return res
}

// Test hook: forget the session state.
export function resetClientTokenForTests(): void {
  inflight = null
  backendOff = false
  backoffUntil = 0
  memoryExpiry = 0
}
