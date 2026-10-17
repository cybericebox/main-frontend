import { afterEach, beforeEach, describe, it, mock } from "node:test"
import assert from "node:assert/strict"
import { fetchWithOverloadRetry, isOverloadError, isOverloadResponse, parseRetryAfterSeconds, retryDelayMs } from "@/api/retry"

const answer = (status: number, headers: Record<string, string> = {}) => new Response(status === 200 ? "ok" : "", { status, headers })
/** The daemon's overload answer: 503 with Retry-After. */
const overloaded = () => answer(503, { "Retry-After": "1" })

/** A doFetch mock that answers with `statuses` in order (the last one repeats); 503 means the overload 503. */
function answers(...statuses: Array<number | Response>) {
  let call = 0
  return mock.fn(async () => {
    const next = statuses[Math.min(call++, statuses.length - 1)]
    if (typeof next !== "number") return next
    return next === 503 ? overloaded() : answer(next)
  })
}

/** An error shaped like any client's API error (status + optional Retry-After field). */
const apiError = (status: number, fields: { retryAfter?: number; retryAfterSeconds?: number } = {}) => Object.assign(new Error(`API error ${status}`), { status, ...fields })

const T0 = Date.parse("2026-10-18T12:00:00Z")
const settle = async () => { for (let i = 0; i < 5; i++) await new Promise((r) => setImmediate(r)) }
/** Moves the fake clock forward, letting pending promise work run before and after. */
const advance = async (ms: number) => { await settle(); mock.timers.tick(ms); await settle() }
/** Fires every pending timer until none is left (the fake-timer equivalent of "wait for it"). */
const runAll = async () => { for (let i = 0; i < 10; i++) { await settle(); mock.timers.runAll() } await settle() }

// No jitter by default, so delays are exact; tests that need jitter pass `random`.
beforeEach(() => {
  mock.timers.enable({ apis: ["setTimeout", "Date"], now: T0 })
  mock.method(Math, "random", () => 0)
})
afterEach(() => { mock.timers.reset(); mock.restoreAll() })

describe("retryDelayMs", () => {
  it("backs off exponentially with jitter, capped at 4 s", () => {
    assert.equal(retryDelayMs(0, null, () => 1), 500)
    assert.equal(retryDelayMs(0, null, () => 0), 250)
    assert.equal(retryDelayMs(2, null, () => 1), 2000)
    assert.equal(retryDelayMs(5, null, () => 1), 4000)
  })

  it("takes Retry-After seconds and refuses waits above 10 s", () => {
    assert.equal(retryDelayMs(0, "2", () => 0), 2000)
    assert.equal(retryDelayMs(0, "10", () => 0), 10_000)
    assert.equal(retryDelayMs(0, "30", () => 0), null)
    // 10 s is checked on the raw value, before jitter.
    assert.equal(retryDelayMs(0, "11", () => 0), null)
  })

  it("adds up to 25% jitter to a Retry-After delay", () => {
    assert.equal(retryDelayMs(0, "2", () => 1), 2500)
    assert.equal(retryDelayMs(0, "10", () => 1), 12_500)
  })

  it("takes a Retry-After HTTP-date", () => {
    assert.equal(retryDelayMs(0, "Sun, 18 Oct 2026 12:00:03 GMT", () => 0), 3000)
    assert.equal(retryDelayMs(0, "Sun, 18 Oct 2026 12:01:00 GMT", () => 0), null)
  })

  it("never retries sooner than the backoff, even for Retry-After 0 or a past date", () => {
    assert.equal(retryDelayMs(0, "0", () => 0), 250)
    assert.equal(retryDelayMs(2, "0", () => 1), 2000)
    assert.equal(retryDelayMs(1, "Sun, 18 Oct 2026 11:59:00 GMT", () => 0), 500)
    assert.equal(retryDelayMs(3, "1", () => 0), 2000)
  })

  it("falls back to backoff on an unparseable Retry-After, numeric junk included", () => {
    assert.equal(retryDelayMs(1, "soon", () => 1), 1000)
    assert.equal(retryDelayMs(1, "-1", () => 1), 1000)
    assert.equal(retryDelayMs(1, "+1", () => 1), 1000)
    assert.equal(retryDelayMs(1, "1,5", () => 1), 1000)
  })
})

describe("parseRetryAfterSeconds", () => {
  it("gives whole seconds for delta-seconds and HTTP-dates, 0 included", () => {
    assert.equal(parseRetryAfterSeconds("1"), 1)
    assert.equal(parseRetryAfterSeconds("1.2"), 2)
    assert.equal(parseRetryAfterSeconds("0"), 0)
    assert.equal(parseRetryAfterSeconds("Sun, 18 Oct 2026 12:00:03 GMT"), 3)
    assert.equal(parseRetryAfterSeconds("Sun, 18 Oct 2026 11:59:00 GMT"), 0)
  })

  it("is undefined when absent or unparseable", () => {
    assert.equal(parseRetryAfterSeconds(null), undefined)
    assert.equal(parseRetryAfterSeconds(""), undefined)
    assert.equal(parseRetryAfterSeconds("-1"), undefined)
    assert.equal(parseRetryAfterSeconds("soon"), undefined)
  })
})

describe("fetchWithOverloadRetry", () => {
  it("retries a GET 503 and returns the 200", async () => {
    const doFetch = answers(503, 200)
    const result = fetchWithOverloadRetry(doFetch, { method: "GET" })
    await runAll()
    assert.equal((await result).status, 200)
    assert.equal(doFetch.mock.callCount(), 2)
  })

  it("retries a GET 429 too", async () => {
    const doFetch = answers(429, 200)
    const result = fetchWithOverloadRetry(doFetch, { method: "get" })
    await runAll()
    assert.equal((await result).status, 200)
  })

  it("waits the Retry-After seconds before the next try", async () => {
    const doFetch = answers(answer(503, { "Retry-After": "2" }), 200)
    const result = fetchWithOverloadRetry(doFetch, { method: "GET" })
    await advance(1999)
    assert.equal(doFetch.mock.callCount(), 1)
    await advance(1)
    assert.equal(doFetch.mock.callCount(), 2)
    assert.equal((await result).status, 200)
  })

  it("waits until a Retry-After HTTP-date", async () => {
    const doFetch = answers(answer(503, { "Retry-After": "Sun, 18 Oct 2026 12:00:03 GMT" }), 200)
    const result = fetchWithOverloadRetry(doFetch, { method: "GET" })
    await advance(2999)
    assert.equal(doFetch.mock.callCount(), 1)
    await advance(1)
    assert.equal((await result).status, 200)
  })

  it("does not retry when Retry-After is above 10 s", async () => {
    const doFetch = answers(answer(503, { "Retry-After": "30" }), 200)
    const result = await fetchWithOverloadRetry(doFetch, { method: "GET" })
    assert.equal(result.status, 503)
    assert.equal(doFetch.mock.callCount(), 1)
  })

  for (const method of ["POST", "PUT", "PATCH", "DELETE"]) {
    it(`never repeats a ${method}`, async () => {
      const doFetch = answers(503, 200)
      const result = await fetchWithOverloadRetry(doFetch, { method })
      assert.equal(result.status, 503)
      assert.equal(doFetch.mock.callCount(), 1)
    })
  }

  for (const status of [500, 502, 504, 404]) {
    it(`does not retry a GET ${status}`, async () => {
      const doFetch = answers(status, 200)
      assert.equal((await fetchWithOverloadRetry(doFetch, { method: "GET" })).status, status)
      assert.equal(doFetch.mock.callCount(), 1)
    })
  }

  it("does not retry a GET 503 without Retry-After (a domain or edge error)", async () => {
    const doFetch = answers(answer(503), 200)
    const result = await fetchWithOverloadRetry(doFetch, { method: "GET" })
    assert.equal(result.status, 503)
    assert.equal(doFetch.mock.callCount(), 1)
  })

  it("gives up after 4 tries and returns the last 503", async () => {
    const last = overloaded()
    const doFetch = answers(503, 503, 503, last, 200)
    const result = fetchWithOverloadRetry(doFetch, { method: "GET" })
    await runAll()
    assert.equal(await result, last)
    assert.equal(doFetch.mock.callCount(), 4)
  })

  it("rejects with the AbortError when aborted during the wait and sends nothing more", async () => {
    const controller = new AbortController()
    const doFetch = answers(503, 200)
    const result = fetchWithOverloadRetry(doFetch, { method: "GET", signal: controller.signal })
    const settled = assert.rejects(result, { name: "AbortError" })
    await advance(100)
    controller.abort()
    await settled
    await runAll()
    assert.equal(doFetch.mock.callCount(), 1)
  })

  it("uses the given sleep", async () => {
    const sleep = mock.fn(async (_ms: number, _signal?: AbortSignal | null) => undefined)
    const doFetch = answers(answer(429, { "Retry-After": "1" }), 200)
    assert.equal((await fetchWithOverloadRetry(doFetch, { method: "GET", sleep })).status, 200)
    assert.deepEqual(sleep.mock.calls[0].arguments, [1000, undefined])
  })
})

describe("isOverloadResponse", () => {
  it("is a 429, or a 503 with Retry-After", () => {
    assert.equal(isOverloadResponse(answer(429)), true)
    assert.equal(isOverloadResponse(overloaded()), true)
    assert.equal(isOverloadResponse(answer(503)), false)
    assert.equal(isOverloadResponse(answer(502, { "Retry-After": "1" })), false)
    assert.equal(isOverloadResponse(answer(200)), false)
  })
})

describe("isOverloadError", () => {
  it("is a 429, or a 503 that carried Retry-After (0 included), under either field name", () => {
    assert.equal(isOverloadError(apiError(429)), true)
    assert.equal(isOverloadError(apiError(503, { retryAfter: 1 })), true)
    assert.equal(isOverloadError(apiError(503, { retryAfterSeconds: 1 })), true)
    assert.equal(isOverloadError(apiError(503, { retryAfterSeconds: 0 })), true)
  })

  it("is false for a 503 without Retry-After, other statuses and non-API errors", () => {
    assert.equal(isOverloadError(apiError(503)), false)
    assert.equal(isOverloadError(apiError(500, { retryAfterSeconds: 1 })), false)
    assert.equal(isOverloadError(new Error("503")), false)
    assert.equal(isOverloadError({ status: 429 }), false)
    assert.equal(isOverloadError(null), false)
  })

  it("agrees with isOverloadResponse through parseRetryAfterSeconds", () => {
    for (const header of ["1", "0", "Sun, 18 Oct 2026 11:59:00 GMT"]) {
      const res = answer(503, { "Retry-After": header })
      assert.equal(isOverloadResponse(res), true)
      assert.equal(isOverloadError(apiError(503, { retryAfterSeconds: parseRetryAfterSeconds(res.headers.get("Retry-After")) })), true)
    }
  })
})
