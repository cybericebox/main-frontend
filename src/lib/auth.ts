/**
 * src/lib/auth.ts — Shared auth-state client helpers for main-frontend.
 *
 * No JSX — plain TypeScript; safe to import without 'use client' propagation issues.
 */

import { apiGet, ApiError } from "@/api/client"
import { ID_ORIGIN } from "@/lib/links"

// ---------------------------------------------------------------------------
// /me — identity object returned by the RP's /api/me endpoint.
// ---------------------------------------------------------------------------

export interface Me {
  FirstName: string
  LastName: string
  Email: string
  Role: string
  // Avatar URL — the backend's UserInfo field is "Picture".
  Picture?: string
}

/**
 * fetchMe — GET /api/auth/me with credentials included.
 *
 * Returns the `Me` object on 200 (signed in), or `null` on 401 (no session).
 * Throws only on unexpected errors (5xx, network failures, abort, etc.).
 *
 * Uses required:false so a 401 is treated as "anonymous" (no redirect).
 */
export async function fetchMe(init?: RequestInit): Promise<Me | null> {
  try {
    return await apiGet<Me>("/api/auth/me", init, { required: false })
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      return null
    }
    throw err
  }
}

/** Display-only privileged hint; authorization itself is enforced server-side. */
export function isAdminTier(me: Me): boolean {
  return me.Role !== "user"
}

/** Build an id-app URL with a return_to back to the current page. SSR-safe. */
export function idUrl(path: string): string {
  const url = new URL(path, ID_ORIGIN)
  if (typeof window !== "undefined") url.searchParams.set("return_to", window.location.href)
  return url.toString()
}
