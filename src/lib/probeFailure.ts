import { isOverloadError } from "@/api/retry"

/**
 * What a failed API probe means. Any answer below 500 (401, 429, ...) is the backend
 * speaking: reachable, anonymous. An overload answer (503 with Retry-After) is a busy
 * backend, not a down one: the probe stays "pending" (renders like "down", but never
 * claims an outage). Everything else (network error, timeout, other 5xx) is "down".
 */
export function probeFailureStatus(err: unknown): "up" | "pending" | "down" {
  const status = (err as { status?: unknown } | null)?.status
  if (typeof status === "number" && status < 500) return "up"
  return isOverloadError(err) ? "pending" : "down"
}
