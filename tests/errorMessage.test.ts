import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { errorMessageChoice } from "@/i18n/errorMessage"

/** An error shaped like the client's ApiError (status, code, Retry-After seconds). */
const apiError = (status: number, code?: number, retryAfterSeconds?: number) => Object.assign(new Error(`API error ${status}`), { status, code, retryAfterSeconds })
const catalog = new Set(["70428", "20225"])
const choose = (err: ReturnType<typeof apiError>) => errorMessageChoice(err, (key) => catalog.has(key))

describe("errorMessageChoice", () => {
  it("keeps a personal rate limit (429) on its own message with the wait, never the overloaded one", () => {
    assert.deepEqual(choose(apiError(429, 70428, 30)), { key: "error.tooManyRequests.wait", vars: { seconds: 30 } })
    assert.deepEqual(choose(apiError(429, undefined, 30)), { key: "error.tooManyRequests.wait", vars: { seconds: 30 } })
    assert.deepEqual(choose(apiError(429, 70428)), { key: "error.tooManyRequests" })
  })

  it("answers the overload 503 (Retry-After) and the overload codes without a catalog message with the overloaded message", () => {
    assert.deepEqual(choose(apiError(503, undefined, 1)), { key: "error.overloaded" })
    assert.deepEqual(choose(apiError(503, undefined, 0)), { key: "error.overloaded" })
    assert.deepEqual(choose(apiError(503, 70431)), { key: "error.overloaded" })
    assert.deepEqual(choose(apiError(503, 70432, 2)), { key: "error.overloaded" })
  })

  it("prefers the catalog message of a known code", () => {
    assert.deepEqual(choose(apiError(503, 20225, 1)), { catalog: "20225" })
    assert.deepEqual(choose(apiError(400, 20225)), { catalog: "20225" })
  })

  it("falls back to the generic message for a bare 503, other errors and unknown codes", () => {
    assert.deepEqual(choose(apiError(503)), { key: "error.generic" })
    assert.deepEqual(choose(apiError(500, undefined, 1)), { key: "error.generic" })
    assert.deepEqual(choose(apiError(400, 99999)), { key: "error.generic" })
  })
})
