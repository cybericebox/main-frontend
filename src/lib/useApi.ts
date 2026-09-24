"use client"

/**
 * src/lib/useApi.ts — "is the API there, who am I" for the landing.
 *
 * One probe on load (<ApiProvider/> in the root layout): GET /api/auth/me.
 *   200 → user, 401 (or another 4xx) → anonymous; both mean the API is up.
 *   Network error / 5xx / timeout (~4 s) → down.
 * The landing is static by nature: `pending` and `down` render the same (API-driven
 * controls absent), nothing overlays the page. No 401 redirect from here.
 */

import { createContext, use } from "react"
import { ApiError } from "@/api/client"
import { fetchMe, type Me } from "@/lib/auth"

export type ApiStatus = "pending" | "up" | "down"

export interface ApiState {
  status: ApiStatus
  me: Me | null
}

export const API_PENDING: ApiState = { status: "pending", me: null }

export const ApiContext = createContext<ApiState>(API_PENDING)

export function useApi(): ApiState {
  return use(ApiContext)
}

const PROBE_TIMEOUT_MS = 4000

export async function probeApi(): Promise<ApiState> {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), PROBE_TIMEOUT_MS)
  try {
    return { status: "up", me: await fetchMe({ signal: ctrl.signal, cache: "no-store" }) }
  } catch (err) {
    // A 4xx other than 401 is still an answer from the backend: reachable, anonymous.
    if (err instanceof ApiError && err.status < 500) return { status: "up", me: null }
    return { status: "down", me: null }
  } finally {
    clearTimeout(timer)
  }
}
