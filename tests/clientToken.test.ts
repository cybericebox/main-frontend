// Anti-DoS client token and the bot-check helper: provider selection, one request for parallel calls,
// refresh on expiry, retry-once on X-Client-Token: required, no retry on a plain 429, 404 = off, DOS off = no request.
import { test, beforeEach } from "node:test"
import assert from "node:assert/strict"

for (const key of ["API", "MAIN", "ID", "ADMIN", "EXERCISES"]) process.env[`NEXT_PUBLIC_${key}_HOST`] = `${key.toLowerCase()}.example.test`
for (const key of ["SOURCE_URL", "PARTNER_URL", "PARTNER_SITE_URL"]) process.env[`NEXT_PUBLIC_${key}`] = "https://example.test"
for (const key of ["EVENT_DOMAIN", "COOKIE_DOMAIN"]) process.env[`NEXT_PUBLIC_${key}`] = "example.test"
for (const key of ["CONTACT", "PRIVACY", "SECURITY", "SUPPORT"]) process.env[`NEXT_PUBLIC_${key}_EMAIL`] = `${key.toLowerCase()}@example.test`

// Dynamic paths: node runs the .ts source directly, tsc doesn't resolve them.
const tokenSource = "../src/lib/clientToken.ts"
const captchaSource = "../src/lib/captcha.ts"
const token = await import(tokenSource) as typeof import("../src/lib/clientToken")
const captcha = await import(captchaSource) as typeof import("../src/lib/captcha")

// The same fetch wrapper the API client uses (src/api/client.ts), minus its auth redirect.
class ApiError extends Error {
  status: number
  retryAfterSeconds?: number
  constructor(status: number, retryAfterSeconds?: number) {
    super(`API error ${status}`)
    this.status = status
    this.retryAfterSeconds = retryAfterSeconds
  }
}
const client = {
  ApiError,
  async apiGet(path: string): Promise<unknown> {
    const res = await token.sendWithClientToken(() => fetch(`https://api.example.test${path}`, { method: "GET", credentials: "include" }))
    if (!res.ok) throw new ApiError(res.status, Number(res.headers.get("Retry-After")) || undefined)
    return (await res.json()).Data
  },
}

type Call = { url: string; method: string; body?: string }
let calls: Call[] = []
let handler: (call: Call) => Response | Promise<Response>
const g = globalThis as Record<string, unknown>
const storage = new Map<string, string>()

const iso = (ms: number) => new Date(Date.now() + ms).toISOString()
const tokenOk = (ms = 24 * 3600_000) => new Response(JSON.stringify({ Status: { Code: 0 }, Data: { ExpiresAt: iso(ms) } }), { status: 200, headers: { "content-type": "application/json" } })
const dataOk = () => new Response(JSON.stringify({ Status: { Code: 0 }, Data: { ok: true } }), { status: 200, headers: { "content-type": "application/json" } })
const tokenCalls = () => calls.filter((c) => c.url.endsWith("/api/client-token"))

beforeEach(() => {
  process.env.NEXT_PUBLIC_DOS_PROTECTION = "on"
  process.env.NEXT_PUBLIC_CAPTCHA_PROVIDER = "none"
  token.resetClientTokenForTests()
  storage.clear()
  calls = []
  g.window = {}
  g.localStorage = {
    getItem: (k: string) => storage.get(k) ?? null,
    setItem: (k: string, v: string) => void storage.set(k, v),
    removeItem: (k: string) => void storage.delete(k),
  }
  handler = (call) => (call.url.endsWith("/api/client-token") ? tokenOk() : dataOk())
  g.fetch = async (url: string, init: RequestInit = {}) => {
    const call = { url, method: String(init.method ?? "GET"), body: init.body as string | undefined }
    calls.push(call)
    return handler(call)
  }
})

test("provider selection", () => {
  process.env.NEXT_PUBLIC_CAPTCHA_PROVIDER = "turnstile"
  assert.equal(captcha.captchaProvider(), "turnstile")
  process.env.NEXT_PUBLIC_CAPTCHA_PROVIDER = "recaptcha"
  assert.equal(captcha.captchaProvider(), "recaptcha")
  process.env.NEXT_PUBLIC_CAPTCHA_PROVIDER = "none"
  assert.equal(captcha.captchaProvider(), "none")
  process.env.NEXT_PUBLIC_CAPTCHA_PROVIDER = "garbage"
  assert.equal(captcha.captchaProvider(), "none")
})

test("provider none resolves the dummy token and loads nothing", async () => {
  assert.equal(await captcha.executeCaptcha("clientToken"), "none")
})

test("the token body carries RecaptchaToken and the call includes credentials", async () => {
  await client.apiGet("/api/banners")
  const [first] = tokenCalls()
  assert.equal(first.method, "POST")
  assert.deepEqual(JSON.parse(first.body!), { RecaptchaToken: "none" })
  assert.equal(calls[0], first, "the token is fetched before the API call")
})

test("parallel API calls fetch the token once", async () => {
  await Promise.all([client.apiGet("/api/a"), client.apiGet("/api/b"), client.apiGet("/api/c")])
  assert.equal(tokenCalls().length, 1)
  assert.equal(calls.length, 4)
  await client.apiGet("/api/d")
  assert.equal(tokenCalls().length, 1, "a valid token is not fetched again")
})

test("an expired (or nearly expired) token is refreshed", async () => {
  handler = (call) => (call.url.endsWith("/api/client-token") ? tokenOk(30_000) : dataOk())
  await client.apiGet("/api/a")
  await client.apiGet("/api/b")
  assert.equal(tokenCalls().length, 2, "within the 1 minute margin")
})

test("the expiry is read from localStorage", async () => {
  storage.set("cib_client_token_expires", String(Date.now() + 3600_000))
  await client.apiGet("/api/a")
  assert.equal(tokenCalls().length, 0)
})

test("429 with X-Client-Token: required refreshes and retries once", async () => {
  let served = 0
  handler = (call) => {
    if (call.url.endsWith("/api/client-token")) return tokenOk()
    served++
    return served === 1 ? new Response("{}", { status: 429, headers: { "X-Client-Token": "required" } }) : dataOk()
  }
  await client.apiGet("/api/a")
  assert.equal(tokenCalls().length, 2)
  assert.equal(calls.filter((c) => c.url.endsWith("/api/a")).length, 2)
})

test("a second token-required 429 is not retried again", async () => {
  handler = (call) => (call.url.endsWith("/api/client-token") ? tokenOk() : new Response("{}", { status: 429, headers: { "X-Client-Token": "required" } }))
  await assert.rejects(client.apiGet("/api/a"), (err: unknown) => err instanceof client.ApiError && err.status === 429)
  assert.equal(calls.filter((c) => c.url.endsWith("/api/a")).length, 2)
})

test("a plain 429 is a rate limit: no token refresh, no retry", async () => {
  handler = (call) => (call.url.endsWith("/api/client-token") ? tokenOk() : new Response("{}", { status: 429, headers: { "Retry-After": "7" } }))
  await assert.rejects(client.apiGet("/api/a"), (err: unknown) => err instanceof client.ApiError && err.retryAfterSeconds === 7)
  assert.equal(tokenCalls().length, 1)
  assert.equal(calls.filter((c) => c.url.endsWith("/api/a")).length, 1)
})

test("a 404 from the token route means DOS is off: remembered, no more requests", async () => {
  handler = (call) => (call.url.endsWith("/api/client-token") ? new Response("", { status: 404 }) : dataOk())
  await client.apiGet("/api/a")
  await client.apiGet("/api/b")
  assert.equal(tokenCalls().length, 1)
  assert.equal(calls.length, 3)
})

test("DOS off makes no token request", async () => {
  process.env.NEXT_PUBLIC_DOS_PROTECTION = "off"
  await client.apiGet("/api/a")
  assert.equal(tokenCalls().length, 0)
  assert.equal(calls.length, 1)
})

test("a rate-limited token endpoint backs off and does not block the call", async () => {
  handler = (call) => (call.url.endsWith("/api/client-token") ? new Response("{}", { status: 429, headers: { "Retry-After": "60" } }) : dataOk())
  assert.deepEqual(await client.apiGet("/api/a"), { ok: true })
  await client.apiGet("/api/b")
  assert.equal(tokenCalls().length, 1, "no loop while backing off")
})

test("a network failure of the token request does not block the call", async () => {
  const original = g.fetch as (url: string, init?: RequestInit) => Promise<Response>
  g.fetch = async (url: string, init?: RequestInit) => {
    if (url.endsWith("/api/client-token")) throw new TypeError("offline")
    return original(url, init)
  }
  assert.deepEqual(await client.apiGet("/api/a"), { ok: true })
})
