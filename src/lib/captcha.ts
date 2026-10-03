// Bot-check helper: loads the configured provider's script ONCE and executes an action.
// Provider: NEXT_PUBLIC_CAPTCHA_PROVIDER = turnstile | recaptcha | none (default none).
// NEXT_PUBLIC_* values are placeholders at build and substituted at container start, so a value is never
// compared with `=== "literal"` (the build would fold it); `["x"].includes(value)` is used instead, and each
// variable is read as a plain `process.env.NEXT_PUBLIC_X` expression.

export type CaptchaProvider = "turnstile" | "recaptcha" | "none"

// Token sent for provider none; the backend ignores it then.
export const NO_CAPTCHA_TOKEN = "none"

const EXECUTE_TIMEOUT_MS = 30_000

export function captchaProvider(): CaptchaProvider {
  const value = process.env.NEXT_PUBLIC_CAPTCHA_PROVIDER ?? ""
  if (["turnstile"].includes(value)) return "turnstile"
  if (["recaptcha"].includes(value)) return "recaptcha"
  return "none"
}

function recaptchaEnterprise(): boolean {
  return ["true"].includes(process.env.NEXT_PUBLIC_RECAPTCHA_ENTERPRISE ?? "")
}

type TurnstileApi = {
  render(container: HTMLElement, options: Record<string, unknown>): string
  execute(widgetId: string): void
  remove(widgetId: string): void
}
type RecaptchaApi = {
  ready(callback: () => void): void
  execute(siteKey: string, options: { action: string }): Promise<string>
}
type CaptchaWindow = {
  turnstile?: TurnstileApi
  grecaptcha?: RecaptchaApi & { enterprise?: RecaptchaApi }
}

const scripts = new Map<string, Promise<void>>()

function loadScript(src: string): Promise<void> {
  const known = scripts.get(src)
  if (known) return known
  const promise = new Promise<void>((resolve, reject) => {
    const el = document.createElement("script")
    el.src = src
    el.async = true
    el.onload = () => resolve()
    el.onerror = () => reject(new Error("captcha script failed to load"))
    document.head.appendChild(el)
  })
  // A failed load may be retried by the next call.
  promise.catch(() => scripts.delete(src))
  scripts.set(src, promise)
  return promise
}

function siteKey(): string {
  const key = process.env.NEXT_PUBLIC_CAPTCHA_SITE_KEY
  if (!key) throw new Error("NEXT_PUBLIC_CAPTCHA_SITE_KEY is required")
  return key
}

async function turnstileToken(action: string): Promise<string> {
  const key = siteKey()
  await loadScript("https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit")
  const api = (globalThis as unknown as CaptchaWindow).turnstile
  if (!api) throw new Error("turnstile is unavailable")
  const container = document.createElement("div")
  container.setAttribute("aria-hidden", "true")
  document.body.appendChild(container)
  let widgetId: string | undefined
  try {
    return await new Promise<string>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("captcha timed out")), EXECUTE_TIMEOUT_MS)
      const done = (settle: () => void) => {
        clearTimeout(timer)
        settle()
      }
      widgetId = api.render(container, {
        sitekey: key,
        action,
        appearance: "interaction-only",
        execution: "execute",
        callback: (token: string) => done(() => resolve(token)),
        "error-callback": () => done(() => reject(new Error("captcha failed"))),
        "timeout-callback": () => done(() => reject(new Error("captcha timed out"))),
      })
      api.execute(widgetId)
    })
  } finally {
    try {
      if (widgetId !== undefined) api.remove(widgetId)
    } catch {
      // the widget is already gone
    }
    container.remove()
  }
}

async function recaptchaToken(action: string): Promise<string> {
  const key = siteKey()
  const enterprise = recaptchaEnterprise()
  await loadScript(
    enterprise
      ? `https://www.google.com/recaptcha/enterprise.js?render=${encodeURIComponent(key)}`
      : `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(key)}`
  )
  const root = (globalThis as unknown as CaptchaWindow).grecaptcha
  const api = enterprise ? root?.enterprise : root
  if (!api) throw new Error("recaptcha is unavailable")
  return new Promise<string>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("captcha timed out")), EXECUTE_TIMEOUT_MS)
    api.ready(() => {
      api.execute(key, { action }).then(
        (token) => {
          clearTimeout(timer)
          resolve(token)
        },
        (err) => {
          clearTimeout(timer)
          reject(err)
        }
      )
    })
  })
}

// executeCaptcha runs the configured provider for an action (signIn, signUp, forgotPassword, clientToken).
export async function executeCaptcha(action: string): Promise<string> {
  switch (captchaProvider()) {
    case "turnstile":
      return turnstileToken(action)
    case "recaptcha":
      return recaptchaToken(action)
    default:
      return NO_CAPTCHA_TOKEN
  }
}
