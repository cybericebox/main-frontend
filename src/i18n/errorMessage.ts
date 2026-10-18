// Which message localizedError shows for an API error, kept free of the JSON catalogs and the
// client class so node:test can check it (see i18n/apiError for the lookup itself).
import { isOverloadError } from "@/api/retry"

/** A UI message key (with its variables), or the catalog entry of the error code. */
export type ErrorMessageChoice =
  | { key: "error.tooManyRequests.wait"; vars: { seconds: number } }
  | { key: "error.tooManyRequests" | "error.overloaded" | "error.generic" }
  | { catalog: string }

type ApiErrorFields = Error & { status: number; code?: number; retryAfterSeconds?: number }

export function errorMessageChoice(err: ApiErrorFields, inCatalog: (key: string) => boolean): ErrorMessageChoice {
  // 429 (the request limiter or an auth lockout) is a personal limit: no per-code text, tell how long to wait.
  if (err.status === 429) {
    return err.retryAfterSeconds ? { key: "error.tooManyRequests.wait", vars: { seconds: err.retryAfterSeconds } } : { key: "error.tooManyRequests" }
  }
  if (err.code != null && inCatalog(String(err.code))) return { catalog: String(err.code) }
  // The server's overload signal (a 503 with Retry-After, an overload code) without a catalog message; reads were already retried.
  if (isOverloadError(err)) return { key: "error.overloaded" }
  return { key: "error.generic" }
}
