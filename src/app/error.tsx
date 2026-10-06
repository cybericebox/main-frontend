"use client"

import { useEffect } from "react"
import { ServerErrorPage } from "@/components/site/ErrorPage"

// Segment error boundary: replaces Next's built-in «This page couldn't load» fallback.
export default function Error({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    // details stay out of the UI; developers see them in the console
    if (process.env.NODE_ENV !== "production") console.error(error)
  }, [error])

  return <ServerErrorPage onRetry={retry} error={error} />
}
