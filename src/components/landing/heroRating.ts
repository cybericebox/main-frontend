import { useEffect, useRef, useState, type RefObject } from "react"

// The mini rating under the hero challenges board: purely decorative demo data. Every FEED_MS another team
// solves a task: its points fly from the tile into the team's row, the row counts up and may overtake its
// neighbour. It never reads or writes the visitor's warm-up state.
export const FEED_MS = 3400
export const FLASH_MS = 2200
export const FLY_MS = 900
/* the demo starts over once somebody passes this, so the numbers stay four digits wide */
export const RESET_AT = 9000

/* teams: landing.ch.feed.team.<id>, in their starting order */
export const TEAMS = [
  { id: "alpha", points: 1250 },
  { id: "bravo", points: 1100 },
  { id: "charlie", points: 950 },
  { id: "delta", points: 900 },
] as const

export type TeamId = (typeof TEAMS)[number]["id"]

/* tasks: landing.ch.tiles.<tile> (tile names of the board) */
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
export type Points = Record<TeamId, number>

export const startPoints = (): Points => Object.fromEntries(TEAMS.map((t) => [t.id, t.points])) as Points

/* a team's row index (0 = first); equal points keep the starting order */
export function ranks(points: Points): Record<TeamId, number> {
  const order = TEAMS.map((t) => t.id).sort((a, b) => points[b] - points[a])
  return Object.fromEntries(order.map((id, i) => [id, i])) as Record<TeamId, number>
}

/* points after one more solve; past RESET_AT the demo restarts from the starting table */
export function applyEvent(points: Points, event: FeedEvent, tilePoints: number): Points {
  const base = Object.values(points).some((p) => p > RESET_AT) ? startPoints() : points
  return { ...base, [event.team]: base[event.team] + tilePoints }
}

export const reducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches

/* A «+N» chip travels from one element to another inside `host` (absolute, removed when it lands). */
export function fly(host: HTMLElement, from: Element | null, to: Element | null, text: string, top = false): Promise<void> {
  if (!from || !to || reducedMotion()) return Promise.resolve()
  const h = host.getBoundingClientRect()
  const a = from.getBoundingClientRect()
  const b = to.getBoundingClientRect()
  if (!a.width || !b.width) return Promise.resolve() // a tile hidden on phones
  const chip = document.createElement("span")
  // the visitor's own reward flies over the open warm-up card; a demo solve of another team passes under it
  chip.className = "hc-fly ib-num" + (top ? " hc-fly--top" : "")
  chip.textContent = text
  chip.style.left = `${a.left + a.width / 2 - h.left}px`
  chip.style.top = `${a.top + a.height / 2 - h.top}px`
  host.append(chip)
  const end = `translate(calc(-50% + ${b.right - 24 - a.left - a.width / 2}px),calc(-50% + ${b.top + b.height / 2 - a.top - a.height / 2}px))`
  const done = () => chip.remove()
  return chip
    .animate(
      [
        { transform: "translate(-50%,-50%)", opacity: 0 },
        { transform: "translate(-50%,-50%)", opacity: 1, offset: 0.2 },
        { transform: end, opacity: 1, offset: 0.9 },
        { transform: end, opacity: 0 },
      ],
      { duration: FLY_MS, easing: "cubic-bezier(.2,.7,.2,1)" },
    )
    .finished.then(done, done)
}

/* The warm-up reward: the whole screen dims and the ice box (the cube of the crest) opens in its middle: the lid lifts,
   light comes out, the flag rises from inside and glints float up; the points are written under the box. Drawn on a
   canvas above everything, before the result dialog; the dim matches the dialog backdrop, so one flows into the other.
   Colours come from the layer's CSS (--hc-*), the motion from a fixed seed: every visit looks the same. Resolves when
   the dialog may open; the layer removes itself a moment later. No-op with reduced motion. */
export const BURST_MS = 3000
const OPEN_S = 0.8
const clamp01 = (u: number) => Math.max(0, Math.min(1, u))
const easeOut = (u: number) => 1 - Math.pow(1 - u, 3)
type Pt = [number, number]
type Glint = { x: number; y: number; vx: number; vy: number; life: number; max: number; r: number; ph: number }

/* a small seeded generator (mulberry32) */
function seeded(seed: number): () => number {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function burst(points: number): Promise<void> {
  if (reducedMotion()) return Promise.resolve()
  const layer = document.createElement("div")
  layer.className = "hc-burst"
  layer.setAttribute("aria-hidden", "true")
  const canvas = document.createElement("canvas")
  layer.append(canvas)
  document.body.append(layer)
  const ctx = canvas.getContext("2d")
  if (!ctx) {
    layer.remove()
    return Promise.resolve()
  }

  const css = getComputedStyle(layer)
  const c = (name: string) => css.getPropertyValue(name).trim()
  const col = { edge: c("--hc-edge"), white: c("--hc-white"), flag: c("--hc-flag"), inside: c("--hc-inside"), beam: c("--hc-beam"), beam0: c("--hc-beam-0"),
    left: [c("--hc-left-1"), c("--hc-left-2")], right: [c("--hc-right-1"), c("--hc-right-2")], lid: [c("--hc-lid-1"), c("--hc-lid-2")] }
  const W = window.innerWidth
  const H = window.innerHeight
  const dpr = Math.min(2, window.devicePixelRatio || 1)
  canvas.width = W * dpr
  canvas.height = H * dpr
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

  const rnd = seeded(4)
  const m = Math.min(W, H)
  const S = m * 0.15
  const speed = Math.max(0.7, m / 900)
  const dur = BURST_MS / 1000
  // the cube: top, right, centre and left corners of the lid; bottom corners of the two front faces
  const T: Pt = [0, -S], R1: Pt = [0.866 * S, -0.5 * S], O: Pt = [0, 0], L1: Pt = [-0.866 * S, -0.5 * S]
  const B: Pt = [0, S], R2: Pt = [0.866 * S, 0.5 * S], L2: Pt = [-0.866 * S, 0.5 * S]
  const glints: Glint[] = []

  const poly = (pts: Pt[], fill: string | CanvasGradient) => {
    ctx.beginPath()
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)))
    ctx.closePath()
    ctx.fillStyle = fill
    ctx.fill()
    ctx.stroke()
  }
  const face = (pts: Pt[], [c1, c2]: string[], y1: number, y2: number) => {
    const g = ctx.createLinearGradient(0, y1, 0, y2)
    g.addColorStop(0, c1)
    g.addColorStop(1, c2)
    poly(pts, g)
  }
  const flag = (y: number, size: number, t: number, free: number) => {
    const fs = 1 + 0.5 * easeOut(free)
    const x0 = -0.14 * size, top = y - 0.78 * size * fs, fw = 0.56 * size * fs, fh = 0.36 * size * fs
    const wave = Math.sin(t * 5) * 0.05 * size * free
    ctx.strokeStyle = col.white
    ctx.lineWidth = Math.max(3, size * 0.035)
    ctx.lineCap = "round"
    ctx.beginPath()
    ctx.moveTo(x0, y)
    ctx.lineTo(x0, top)
    ctx.stroke()
    ctx.fillStyle = col.flag
    ctx.beginPath()
    ctx.moveTo(x0, top)
    ctx.bezierCurveTo(x0 + fw * 0.35, top - wave * 2, x0 + fw * 0.65, top + wave * 2, x0 + fw, top + wave)
    ctx.lineTo(x0 + fw, top + fh + wave)
    ctx.bezierCurveTo(x0 + fw * 0.65, top + fh + wave * 2, x0 + fw * 0.35, top + fh - wave * 2, x0, top + fh)
    ctx.closePath()
    ctx.fill()
  }
  const glint = (x: number, y: number, r: number, alpha: number) => {
    if (alpha <= 0) return
    ctx.globalAlpha = alpha
    ctx.fillStyle = col.white
    ctx.beginPath()
    ctx.moveTo(x, y - r)
    ctx.quadraticCurveTo(x, y, x + r, y)
    ctx.quadraticCurveTo(x, y, x, y + r)
    ctx.quadraticCurveTo(x, y, x - r, y)
    ctx.quadraticCurveTo(x, y, x, y - r)
    ctx.fill()
  }

  let frame = 0
  let last = performance.now()
  let acc = 0
  const t0 = last
  const draw = (now: number) => {
    const t = (now - t0) / 1000
    const dt = Math.min(0.033, (now - last) / 1000)
    last = now
    const pop = easeOut(clamp01(t / 0.4))
    const open = clamp01((t - OPEN_S) / 0.7)
    const rise = easeOut(clamp01((t - OPEN_S - 0.15) / 0.8))
    ctx.clearRect(0, 0, W, H)
    ctx.save()
    ctx.translate(W / 2, H * 0.6)
    ctx.scale(0.75 + 0.25 * pop, 0.75 + 0.25 * pop)
    ctx.lineJoin = "round"
    ctx.lineWidth = 1.5
    ctx.strokeStyle = col.edge
    ctx.globalAlpha = pop
    if (open > 0) {
      // the inside of the box, the light out of it, the flag coming up (the front faces below cover its foot)
      poly([T, R1, O, L1], col.inside)
      const beam = ctx.createLinearGradient(0, -0.5 * S, 0, -S * 3.4)
      beam.addColorStop(0, col.beam)
      beam.addColorStop(1, col.beam0)
      ctx.globalAlpha = open
      ctx.fillStyle = beam
      ctx.beginPath()
      ctx.moveTo(L1[0], L1[1])
      ctx.lineTo(-S * 1.7, -S * 3.4)
      ctx.lineTo(S * 1.7, -S * 3.4)
      ctx.lineTo(R1[0], R1[1])
      ctx.lineTo(0, 0)
      ctx.closePath()
      ctx.fill()
      ctx.globalAlpha = 1
      flag(0.75 * S - rise * S * 1.25, S * 1.25, t, clamp01((t - OPEN_S - 0.7) / 0.5))
    }
    ctx.globalAlpha = pop
    ctx.strokeStyle = col.edge
    ctx.lineWidth = 1.5
    face([L1, O, B, L2], col.left, -0.5 * S, S)
    face([O, R1, R2, B], col.right, -0.5 * S, S)
    ctx.globalAlpha = pop * 0.5
    ctx.strokeStyle = col.white
    ctx.beginPath()
    ctx.moveTo(L1[0] + S * 0.12, L1[1] + S * 0.22)
    ctx.lineTo(L1[0] + S * 0.12, L2[1] - S * 0.16)
    ctx.stroke()
    if (open < 1) {
      // the lid lifts and melts into the light
      ctx.save()
      ctx.translate(0, -easeOut(open) * S * 1.3)
      ctx.globalAlpha = pop * (1 - open * open)
      ctx.strokeStyle = col.edge
      face([T, R1, O, L1], col.lid, -S, 0)
      ctx.restore()
    }
    // glints float up out of the box
    acc += dt
    if (t > OPEN_S + 0.1 && t < dur - 0.4) {
      while (acc > 0.03) {
        acc -= 0.03
        glints.push({ x: (rnd() - 0.5) * S * 1.3, y: -0.5 * S + (rnd() - 0.5) * S * 0.3, vx: (rnd() - 0.5) * 120, vy: -(120 + rnd() * 330) * speed,
          life: 0, max: 1 + rnd() * 1.1, r: 3 + rnd() * 6, ph: rnd() * 6 })
      }
    } else if (acc > 0.03) acc = 0
    for (let i = glints.length - 1; i >= 0; i--) {
      const g = glints[i]
      g.life += dt
      if (g.life > g.max) {
        glints.splice(i, 1)
        continue
      }
      g.vx *= Math.pow(0.5, dt)
      g.vy *= Math.pow(0.45, dt)
      g.x += g.vx * dt + Math.sin(g.life * 2 + g.ph) * 14 * dt
      g.y += g.vy * dt
      glint(g.x, g.y, g.r, Math.min(1, (1 - g.life / g.max) * 2.5) * Math.min(1, g.life * 6) * (0.55 + 0.45 * Math.sin(g.life * 8 + g.ph)))
    }
    // the points under the box
    const shown = clamp01((t - OPEN_S - 0.7) / 0.35)
    if (shown > 0) {
      ctx.globalAlpha = shown
      ctx.fillStyle = col.white
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.font = `600 ${Math.round(m * 0.058)}px ${css.fontFamily}`
      ctx.fillText(`+${points}`, 0, S * 1.6 + (1 - shown) * 10)
    }
    ctx.restore()
    frame = window.requestAnimationFrame(draw)
  }
  frame = window.requestAnimationFrame(draw)

  // the dialog opens over the still dim layer; then the layer lets go
  window.setTimeout(() => {
    const gone = () => {
      window.cancelAnimationFrame(frame)
      layer.remove()
    }
    void layer.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 500, fill: "forwards" }).finished.then(gone, gone)
  }, BURST_MS + 250)
  return new Promise((resolve) => window.setTimeout(resolve, BURST_MS))
}

/* A number that counts to its new value (only when `animate`; never with reduced motion). */
export function useRoll(value: number, animate = true, ms = 700): number {
  const [shown, setShown] = useState(value)
  const fromRef = useRef(value)
  useEffect(() => {
    const from = fromRef.current
    fromRef.current = value
    if (from === value) return
    if (!animate || reducedMotion()) {
      setShown(value)
      return
    }
    let frame = 0
    const t0 = performance.now()
    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / ms)
      setShown(Math.round(from + (value - from) * (1 - Math.pow(1 - t, 3))))
      if (t < 1) frame = window.requestAnimationFrame(step)
    }
    frame = window.requestAnimationFrame(step)
    return () => window.cancelAnimationFrame(frame)
  }, [value, animate, ms])
  return shown
}

/* Ticks while `host` is on screen; with reduced motion it never ticks (a still table).
   `tilePoints` gives the price of a board tile; tiles and rows are found by data-tile / data-team. */
export function useDemoRating(host: RefObject<HTMLElement | null>, tilePoints: (tile: string) => number) {
  const [points, setPoints] = useState<Points>(startPoints)
  const [last, setLast] = useState<{ event: FeedEvent; n: number } | null>(null)
  const [hit, setHit] = useState<string | null>(null)
  const priceRef = useRef(tilePoints)
  useEffect(() => {
    priceRef.current = tilePoints
  })

  useEffect(() => {
    const el = host.current
    if (!el || !("IntersectionObserver" in window) || reducedMotion()) return
    let timer = 0
    let flash = 0
    let n = 0
    let alive = true
    const next = () => {
      const event = FEED_EVENTS[n % FEED_EVENTS.length]
      const at = n++
      const price = priceRef.current(event.tile)
      setHit(event.tile)
      void fly(el, el.querySelector(`[data-tile="${event.tile}"]`), el.querySelector(`[data-team="${event.team}"] .hc-rk__pts`), `+${price}`).then(() => {
        if (!alive) return
        setPoints((p) => applyEvent(p, event, price))
        setLast({ event, n: at })
        window.clearTimeout(flash)
        flash = window.setTimeout(() => {
          setHit(null)
          setLast(null)
        }, FLASH_MS)
      })
    }
    const io = new IntersectionObserver(
      (entries) => {
        window.clearInterval(timer)
        if (entries[entries.length - 1].isIntersecting) timer = window.setInterval(next, FEED_MS)
      },
      { threshold: 0.2 },
    )
    io.observe(el)
    return () => {
      alive = false
      window.clearInterval(timer)
      window.clearTimeout(flash)
      io.disconnect()
    }
  }, [host])

  return { points, ranks: ranks(points), last, hit }
}
