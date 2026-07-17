"use client"

/**
 * src/lib/useAuthState.ts — main-frontend auth-state hook.
 *
 * Single-domain model: a plain credentialed probe of /api/auth/me is
 * authoritative (200 → authed, 401 → anon). No silent-auth iframe bootstrap.
 *
 * No redirect from this hook — main-frontend has no auth pages; protection is
 * enforced at the API layer (required flag) and the admin proxy gate.
 */

import { useEffect, useState } from "react"
import { fetchMe, type Me } from "@/lib/auth"

export type AuthStatus = "loading" | "authed" | "anon"

export interface AuthState {
  /**
   * - "loading": bootstrap + /me probe in flight.
   * - "authed": `me` is present.
   * - "anon": confirmed signed-out — render guest UI.
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
