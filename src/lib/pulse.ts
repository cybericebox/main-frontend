import { apiGet } from "@/api/client"
import { createPulseLoop, type Pulse, type PulseLoop } from "./pulseLoop"

export const PULSE_SITE = "main"

/** `?site=main[&event=<uuid>]`: the scope every notifications request carries. */
export function pulseScope(eventId?: string, extra: Record<string, string> = {}): string {
  const query = new URLSearchParams({ site: PULSE_SITE, ...extra })
  if (eventId) query.set("event", eventId)
  return `?${query.toString()}`
}

const loops = new Map<string, PulseLoop>()

/** The tab's single loop for a scope. No cache option: the browser revalidates by ETag. */
export function getPulseLoop(eventId?: string): PulseLoop {
  const key = eventId ?? ""
  let loop = loops.get(key)
  if (!loop) {
    loop = createPulseLoop({
      fetchPulse: () => apiGet<Pulse>(`/api/notifications/pulse${pulseScope(eventId)}`, undefined, { required: false }),
      isVisible: () => document.visibilityState !== "hidden",
      now: () => Date.now(),
      random: Math.random,
      setTimer: (fn, ms) => window.setTimeout(fn, ms),
      clearTimer: (handle) => window.clearTimeout(handle as number),
      listenWake: (wake) => {
        document.addEventListener("visibilitychange", wake)
        window.addEventListener("focus", wake)
        window.addEventListener("online", wake)
        return () => {
          document.removeEventListener("visibilitychange", wake)
          window.removeEventListener("focus", wake)
          window.removeEventListener("online", wake)
        }
      },
    })
    loops.set(key, loop)
  }
  return loop
}
