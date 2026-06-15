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
  hasAnonMarker,
  clearAnonMarker,
  attemptSilentAuthn,
  consumeNoSessionParam,
  type Me,
} from "@/lib/auth"

// ID_ORIGIN — identity server (Authorization Server). Reuse the exact resolution
// the Header uses: NEXT_PUBLIC_ID_ORIGIN wins, else derive from the platform domain.
const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN ?? ""
const ID_ORIGIN = process.env.NEXT_PUBLIC_ID_ORIGIN ?? `https://id.${DOMAIN}`

export type AuthStatus = "loading" | "authed" | "anon"

export interface AuthState {
  /**
   * - "loading": initial probe in flight, OR a silent redirect is pending
   *   (render the neutral placeholder — never flash Sign-in here).
   * - "authed": `me` is present.
   * - "anon": confirmed signed-out (bounced or anon marker) — render Sign-in.
   */
  status: AuthStatus
  me: Me | null
}

/**
 * useAuthState — runs the silent-authn orchestration on mount and returns the
 * derived auth state for the Header to render from.
 *
 * Sequence (exact):
 *   1. bounced = consumeNoSessionParam()  — strip ?no_session=1, set anon marker.
 *   2. me = await fetchMe().
 *   3. me present            → "authed" + clearAnonMarker().
 *      me === null:
 *        bounced || hasAnonMarker() → "anon" (render Sign-in, NO redirect).
 *        else                       → attemptSilentAuthn(prompt=none) and stay
 *                                      "loading" while the redirect navigates away.
 */
export function useAuthState(): AuthState {
  const [state, setState] = useState<AuthState>({ status: "loading", me: null })

  useEffect(() => {
    let cancelled = false

    // 1. Consume a no_session bounce first (sets the anon marker for ~5 min and
    //    strips the param). Must run before the decision so this load is gated.
    const bounced = consumeNoSessionParam()

    // 2. Probe the local session.
    fetchMe()
      .then((me) => {
        if (cancelled) return

        if (me) {
          // authed: a fresh success clears any stale anon marker.
          clearAnonMarker()
          setState({ status: "authed", me })
          return
        }

        // not authed.
        if (bounced || hasAnonMarker()) {
          // Anti-blink-storm: a recent "definitely anon" signal — render Sign-in,
          // do NOT redirect (loop-prevention invariant).
          setState({ status: "anon", me: null })
          return
        }

        // No local session and no anon signal → attempt a silent top-level
        // redirect to id with prompt=none. Stay "loading" so we render the
        // neutral placeholder while the browser navigates away (no Sign-in flash).
        attemptSilentAuthn({ idOrigin: ID_ORIGIN, returnTo: window.location.href })
        // Intentionally leave status === "loading"; the page is unloading.
      })
      .catch(() => {
        // Unexpected error (5xx / network): treat as signed-out for display.
        if (!cancelled) setState({ status: "anon", me: null })
      })

    return () => {
      cancelled = true
    }
  }, [])

  return state
}
