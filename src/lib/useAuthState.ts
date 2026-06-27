"use client"

/**
 * src/lib/useAuthState.ts — main-frontend silent-authn orchestration hook.
 *
 * main-specific glue around the app-agnostic helpers in `@/lib/auth`. It runs
 * the SSO silent-authn sequence on mount (spec SSO §3 + base-redesign §3.3) and
 * exposes a single { status, me } the Header renders from.
 *
 * Static-export-safe: this is a client hook; all window/document access is either
 * inside effects or guarded by the helpers in `@/lib/auth`.
 *
 * ---------------------------------------------------------------------------
 * Loop-prevention invariant
 * ---------------------------------------------------------------------------
 * A silent attempt is a TOP-LEVEL redirect to id (`prompt=none`). When id has no
 * master session it bounces back with `?no_session=1`. Without a gate this would
 * redirect on every load → an infinite blink storm.
 *
 * The gate is the short-lived (~5 min) "anon" marker cookie:
 *   - On a no_session bounce, consumeNoSessionParam() SETS the marker (and we
 *     also set it for THIS load via `bounced`).
 *   - A silent attempt is performed ONLY when there is no `me`, no fresh bounce,
 *     AND no anon marker.
 * Therefore at most ONE silent redirect can occur per ~5-min window for a
 * genuinely-anonymous user; the very next load sees the marker and renders
 * Sign-in instead of redirecting. A fresh successful auth clears the marker.
 */

import { useEffect, useState } from "react"

import {
  fetchMe,
  type Me,
} from "@/lib/auth"

export type AuthStatus = "loading" | "authed" | "anon"

export interface AuthState {
  /**
   * - "loading": initial probe in flight.
   * - "authed": `me` is present.
   * - "anon": confirmed signed-out — render Sign-in.
   */
  status: AuthStatus
  me: Me | null
}

export function useAuthState(): AuthState {
  const [state, setState] = useState<AuthState>({ status: "loading", me: null })
  useEffect(() => {
    let cancelled = false
    fetchMe()
      .then((me) => { if (!cancelled) setState({ status: me ? "authed" : "anon", me }) })
      .catch(() => { if (!cancelled) setState({ status: "anon", me: null }) })
    return () => { cancelled = true }
  }, [])
  return state
}
