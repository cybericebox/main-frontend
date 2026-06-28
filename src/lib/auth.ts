/**
 * src/lib/auth.ts — Shared auth-state client helpers for main-frontend.
 *
 * No JSX — plain TypeScript; safe to import without 'use client' propagation issues.
 */

import { apiGet, ApiError } from "@/api/client"

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
 * Throws only on unexpected errors (5xx, network failures, etc.).
 *
 * Uses required:false so a 401 is treated as "anonymous" (no redirect).
 * Uses skipBootstrap:true to avoid a deadlock — fetchMe IS the bootstrap probe.
 */
export async function fetchMe(): Promise<Me | null> {
  try {
    return await apiGet<Me>("/api/auth/me", undefined, { required: false, skipBootstrap: true })
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      return null
    }
    throw err
  }
}
