"use client"

import { useEffect, useState } from "react"
import { t } from "@/i18n/t"
import { SIGNED_OUT_EVENT, SIGN_OUT_FAILED_EVENT } from "@/lib/signOut"

const SHOW_MS = 4000

// The short notice after «Вийти»: «Ви вийшли» (or the failure), a status line that disappears by itself.
export function SignedOutNotice() {
  const [kind, setKind] = useState<"done" | "failed" | null>(null)

  useEffect(() => {
    const done = () => setKind("done")
    const failed = () => setKind("failed")
    window.addEventListener(SIGNED_OUT_EVENT, done)
    window.addEventListener(SIGN_OUT_FAILED_EVENT, failed)
    return () => {
      window.removeEventListener(SIGNED_OUT_EVENT, done)
      window.removeEventListener(SIGN_OUT_FAILED_EVENT, failed)
    }
  }, [])

  useEffect(() => {
    if (!kind) return
    const timer = window.setTimeout(() => setKind(null), SHOW_MS)
    return () => window.clearTimeout(timer)
  }, [kind])

  return (
    <div className="site-notice-region" role="status" aria-live="polite">
      {kind ? (
        <p className={`site-notice${kind === "failed" ? " site-notice--danger" : ""}`}>
          {kind === "failed" ? t("signOut.failed") : t("signOut.done")}
        </p>
      ) : null}
    </div>
  )
}
