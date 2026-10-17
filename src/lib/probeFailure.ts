import { isOverloadError } from "@/api/retry"

/**
 * What a failed API probe means. Any answer below 500 (401, 429, ...) is the backend
 * speaking: reachable, anonymous. An overload answer (503 with Retry-After) is the
 * backend answering too (busy, not down), so it is "up" as well. Everything else
 * (network error, timeout, other 5xx) is "down".
 */
export function probeFailureStatus(err: unknown): "up" | "down" {
  const status = (err as { status?: unknown } | null)?.status
  if (typeof status === "number" && status < 500) return "up"
  return isOverloadError(err) ? "up" : "down"
}
