import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { probeFailureStatus } from "@/lib/probeFailure"

const apiError = (status: number, retryAfterSeconds?: number) => Object.assign(new Error(`API error ${status}`), { status, retryAfterSeconds })

describe("probeFailureStatus", () => {
  it("an overload 503 (Retry-After, no X-Request-ID) is never down", () => {
    assert.equal(probeFailureStatus(apiError(503, 1)), "pending")
    assert.equal(probeFailureStatus(apiError(503, 0)), "pending")
  })

  it("a bare 503, other 5xx and network errors are down", () => {
    assert.equal(probeFailureStatus(apiError(503)), "down")
    assert.equal(probeFailureStatus(apiError(502)), "down")
    assert.equal(probeFailureStatus(apiError(500, 1)), "down")
    assert.equal(probeFailureStatus(new TypeError("network failed")), "down")
    assert.equal(probeFailureStatus(new DOMException("aborted", "AbortError")), "down")
  })

  it("answers below 500 mean the backend is up", () => {
    assert.equal(probeFailureStatus(apiError(401)), "up")
    assert.equal(probeFailureStatus(apiError(429, 1)), "up")
    assert.equal(probeFailureStatus(apiError(404)), "up")
  })
})
