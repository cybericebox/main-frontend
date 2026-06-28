"use client"

/**
 * src/lib/useAuthState.ts — main-frontend auth-state hook.
 *
 * Gates on the one-shot iframe silent-auth bootstrap (awaitAuthBootstrap) before
 * probing /api/auth/me. The bootstrap runs at most once per page load (module
 * promise) — it first probes fetchMe directly; only on 401 does it launch the
 * hidden iframe to the AS (prompt=none). Post-bootstrap 401s on required:false
 * calls are swallowed (anon); required:true calls redirect to sign-in.
 *
 * No redirect from this hook — main-frontend has no auth pages; protection is
 * enforced at the API layer (required flag) and the admin proxy gate.
 */

import { useEffect, useState } from "react"
import { awaitAuthBootstrap } from "@/lib/silentAuth"
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
    awaitAuthBootstrap()
      .then(() => fetchMe())
      .then((me) => { if (!cancelled) setState({ status: me ? "authed" : "anon", me }) })
      .catch(() => { if (!cancelled) setState({ status: "anon", me: null }) })
    return () => { cancelled = true }
  }, [])
  return state
}
