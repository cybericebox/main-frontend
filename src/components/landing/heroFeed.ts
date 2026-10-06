import { useEffect, useRef, useState, type RefObject } from "react"

// The «other teams» feed under the hero challenges board: purely decorative demo data. A line slides in every
// FEED_MS and the matching tile briefly lights up. It never reads or writes the visitor's warm-up state.
export const FEED_MS = 4000
export const FLASH_MS = 1400
export const FEED_LINES = 2

/* teams: landing.ch.feed.team.<id>; tasks: landing.ch.tiles.<tile> (tile names of the board) */
export const FEED_EVENTS = [
  { team: "bravo", tile: "rsa" },
  { team: "alpha", tile: "idor" },
  { team: "charlie", tile: "jwt" },
  { team: "delta", tile: "pcap" },
  { team: "alpha", tile: "oracle" },
  { team: "bravo", tile: "fmt" },
  { team: "charlie", tile: "rop" },
] as const

export type FeedEvent = (typeof FEED_EVENTS)[number]

/* the lines visible after `tick` events (newest first) */
export function feedLines(tick: number): { n: number; event: FeedEvent }[] {
  const out: { n: number; event: FeedEvent }[] = []
  for (let n = tick; n > tick - FEED_LINES && n >= 0; n--) out.push({ n, event: FEED_EVENTS[n % FEED_EVENTS.length] })
  return out
}

/* Ticks while `ref` is on screen; with reduced motion it never ticks (two static lines). */
export function useDemoFeed(ref: RefObject<HTMLElement | null>) {
  const [tick, setTick] = useState(FEED_LINES - 1)
  const [hit, setHit] = useState<string | null>(null)
  const flashRef = useRef(0)

  useEffect(() => {
    const el = ref.current
    if (!el || !("IntersectionObserver" in window)) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    let timer = 0
    const next = () => {
      setTick((n) => n + 1)
    }
    const io = new IntersectionObserver((entries) => {
      window.clearInterval(timer)
      if (entries[entries.length - 1].isIntersecting) timer = window.setInterval(next, FEED_MS)
    })
    io.observe(el)
    return () => {
      window.clearInterval(timer)
      window.clearTimeout(flashRef.current)
      io.disconnect()
    }
  }, [ref])

  /* the tile of the newest line lights up, then fades back */
  useEffect(() => {
    if (tick < FEED_LINES) return
    setHit(FEED_EVENTS[tick % FEED_EVENTS.length].tile)
    window.clearTimeout(flashRef.current)
    flashRef.current = window.setTimeout(() => setHit(null), FLASH_MS)
  }, [tick])

  return { lines: feedLines(tick), hit, animate: tick >= FEED_LINES }
}
