"use client"

import { useEffect, useState, type ReactNode } from "react"
import { clearSignedHint, hideSignedHint } from "@/lib/signedHint"
import { SIGNED_OUT_EVENT } from "@/lib/signOut"
import { API_PENDING, ApiContext, probeApi, type ApiState } from "@/lib/useApi"

// Runs the one API probe on load and shares the result (see lib/useApi).
// The settled status is mirrored to <html data-api="up|down"> (e2e / debugging hook).
export function ApiProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ApiState>(API_PENDING)

  useEffect(() => {
    let cancelled = false
    const refresh = () => { void probeApi().then((s) => {
      if (cancelled) return
      document.documentElement.dataset.api = s.status
      // a guest: the hint was stale. No answer in time: «Увійти» shows, the cookie stays. Either way the placeholder goes.
      if (!s.me) { if (s.status === "up") clearSignedHint(); else hideSignedHint() }
      setState(s)
    }) }
    refresh()
    // «Вийти» finished: the navbar drops the user at once
    const signedOut = () => setState({ status: "up", me: null })
    window.addEventListener(SIGNED_OUT_EVENT, signedOut)
    return () => { cancelled = true; window.removeEventListener(SIGNED_OUT_EVENT, signedOut) }
  }, [])

  return <ApiContext value={state}>{children}</ApiContext>
}
