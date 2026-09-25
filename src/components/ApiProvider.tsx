"use client"

import { useEffect, useState, type ReactNode } from "react"
import { API_PENDING, ApiContext, probeApi, type ApiState } from "@/lib/useApi"
import { onServiceRestored } from "@/lib/serviceStatus"

// Runs the one API probe on load and shares the result (see lib/useApi).
// The settled status is mirrored to <html data-api="up|down"> (e2e / debugging hook).
export function ApiProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ApiState>(API_PENDING)

  useEffect(() => {
    let cancelled = false
    const refresh = () => { void probeApi().then((s) => {
      if (cancelled) return
      document.documentElement.dataset.api = s.status
      setState(s)
    }) }
    refresh()
    const unsubscribe = onServiceRestored(refresh)
    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [])

  return <ApiContext value={state}>{children}</ApiContext>
}
