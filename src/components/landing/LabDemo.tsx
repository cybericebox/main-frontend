"use client"

import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react"
import { BrandLoading } from "@/components/site/BrandLoading"
import { t, tRich } from "@/i18n/t"
import "@/styles/ds/components/topology.css"
import "./labDemo.css"
import { reducedMotion, useRoll } from "./heroRating"
import {
  FLAG, FLAG_POINTS, LAB, LAB_CIDR, LIT, MODES, SLICE_FIRST_PLACE, STEPS, TALL, WIDE,
  bootOrder, emptyScene, finalScene, other, slice, story,
  type Feature, type Label, type Mode, type Scene, type Scheme,
} from "./labScene"

// The lab card of «Лабораторії»: a terminal that drives the scheme. The lab starts, a command is typed, and only then
// the route draws and a packet travels. Two modes on one base network, switched by the tabs (they alternate by
// themselves until the visitor picks one): «Змагання» = attack, pivot, flag, a step up in the rating;
// «Навчання» = one server to fix, the automatic checker knocks on it and ticks the steps.
// The story runs only while the card is on screen; off screen and with reduced motion it shows its last frame.
const TYPE_MS = 26
const DRAW_MS = 700
const PACKET_MS = 800
const TERM_ROWS = 4
const CLOCK_START = 2 * 3600 + 14 * 60 + 37

const text = (label: Label) => (typeof label === "string" ? label : t(label.key, label.vars))
const clock = (left: number) => [left / 3600, (left / 60) % 60, left % 60].map((v) => String(Math.floor(v)).padStart(2, "0")).join(":")

const CHECK = (
  <svg className="ld-check" viewBox="0 0 24 24" aria-hidden="true">
    <path pathLength={1} d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
)

function SchemeSvg({ spec, scene, lit }: { spec: Scheme; scene: Scene; lit: string[] | null }) {
  const on = (key: string, cls = "") => (cls + (lit?.includes(key) ? " is-lit" : "")).trim() || undefined
  return (
    <svg className={`ib-topo__${spec.id}`} viewBox={`0 0 ${spec.w} ${spec.h}`} role="img" aria-label={t("landing.labs.topoAria")}>
      {spec.zones.map((z) => (
        <g key={z.id} data-k={z.id} data-m={z.mode} className={on(z.id)}>
          <rect className={z.kind === "zone" ? "ib-topo__zone" : "ib-topo__subnet"} x={z.x} y={z.y} width={z.w} height={z.h} rx={z.kind === "zone" ? 8 : 6} strokeDasharray={z.kind === "zone" ? "5 4" : "3 3"} />
          <text className="ib-topo__note" x={z.lx} y={z.ly}>
            {text(z.label)}
          </text>
        </g>
      ))}
      {spec.links.map((l) => (
        <path key={l.id} data-k={l.id} data-m={l.mode} className={on(l.id, "ib-topo__link")} d={l.d} />
      ))}
      {spec.segs.map((s) => (
        <g key={s.id}>
          <path data-k={`seg-${s.id}`} data-m={s.mode} className={on(`seg-${s.id}`, "ld-seg" + (scene.drawn.includes(s.id) ? " is-drawn" : ""))} pathLength={1} d={s.d} />
          <path className="ld-pkp" data-pk={s.id} d={s.packet ?? s.d} />
        </g>
      ))}
      {spec.notes.map((n) => (
        <text key={n.id} data-k={`note-${n.id}`} className={on(`note-${n.id}`, "ib-topo__note")} x={n.x} y={n.y}>
          {text(n.text)}
        </text>
      ))}
      <path className="ld-pkp" data-pk="k" d={spec.probe.d} />
      <text data-k="note-probe" data-m="learn" className={on("note-probe", "ib-topo__note" + (scene.probe ? (scene.probe.ok ? " ld-good" : " ld-bad") : ""))} x={spec.probe.x} y={spec.probe.y}>
        {scene.probe ? text(scene.probe.text) : ""}
      </text>
      {spec.nodes.map((n) => {
        const you = n.id === "you"
        const top = n.h > 48 ? 22 : 20
        const state =
          (scene.on.includes(n.id) ? " is-on" : "") +
          (scene.own.includes(n.id) ? " is-own" : "") +
          (scene.boot.includes(n.id) ? " is-boot" : "") +
          (scene.ping === n.id ? " is-ping" : "") +
          (scene.flash?.id === n.id ? (scene.flash.ok ? " is-good" : " is-bad") : "")
        return (
          <g key={n.id} data-k={n.id} data-m={n.mode} data-tip={n.id} className={on(n.id, "ld-node" + state)}>
            <rect className={you ? "ib-topo__you" : "ib-topo__node"} x={n.x + 0.5} y={n.y + 0.5} width={n.w} height={n.h} rx="6" />
            <text className={"ib-topo__name" + (you ? " ib-topo__on-brand" : "")} x={n.x + 14} y={n.y + top}>
              {text(n.name)}
            </text>
            <text className={you ? "ib-topo__on-brand-2" : undefined} x={n.x + 14} y={n.y + top + 18}>
              {text(n.addr)}
            </text>
            {n.port ? (
              <text className="ib-topo__note" x={n.x + n.w - 14} y={n.y + top} textAnchor="end">
                {n.id === "srv" ? scene.srvPorts : n.port}
              </text>
            ) : null}
            <path className="ld-mark" pathLength={1} transform={`translate(${n.x + n.w - 28},${n.y + n.h - 20})`} d="M0 5l4 4 9-10" />
          </g>
        )
      })}
      <rect className="ld-pk" x="-4" y="-4" width="8" height="8" rx="1" />
    </svg>
  )
}

/* «Змагання»: the flag, its price and a slice of the rating where the team climbs */
function CtfOutcome({ scene, left }: { scene: Scene; left: number }) {
  const rows = slice(scene.won)
  const place = useRoll(rows.find((r) => r.id === "own")!.place, scene.wonNow, 900)
  const points = useRoll(rows.find((r) => r.id === "own")!.points, scene.wonNow, 800)
  return (
    <div className="ld-out__ctf">
      <dl className="pl-stats ld-stats">
        <div>
          <dt>{t("landing.ch.flag")}</dt>
          <dd className="ib-num ld-stats__flag">{scene.won ? FLAG : t("landing.labs.none")}</dd>
        </div>
        <div>
          <dt>{t("landing.warmup.statPoints")}</dt>
          <dd className="ib-num">{scene.won ? t("landing.ch.pointsValue", { points: FLAG_POINTS }) : t("landing.labs.none")}</dd>
        </div>
        <div>
          <dt>{t("landing.labs.outPlace")}</dt>
          <dd className="ib-num">{place}</dd>
        </div>
      </dl>
      <div className="ld-rk">
        {rows.map((r) => {
          const own = r.id === "own"
          return (
            <div key={r.id} className={"ld-rk__row" + (own ? " is-own" : "") + (own && scene.wonNow ? " is-new" : "")} style={{ "--ld-i": r.place - SLICE_FIRST_PLACE } as CSSProperties}>
              <span className="ld-rk__place ib-num">{r.place}</span>
              <b>{own ? t("landing.ch.ownTeam") : t(`landing.ch.feed.team.${r.id}`)}</b>
              <span className="ld-rk__note">{own && scene.won ? t("landing.labs.outNote", { points: FLAG_POINTS }) : ""}</span>
              <span className="ld-rk__pts ib-num">{own ? points : r.points}</span>
            </div>
          )
        })}
      </div>
      <p className="ld-out__cap">{tRich("landing.labs.outTimer", { time: <b key="time" className="ib-num">{clock(left)}</b> })}</p>
    </div>
  )
}

/* «Навчання»: the steps the checker ticks, the progress and a hint */
function LearnOutcome({ scene }: { scene: Scene }) {
  return (
    <div className="ld-out__learn">
      <ul className="ld-steps">
        {Array.from({ length: STEPS }, (_, i) => (
          <li key={i} className={i < scene.steps ? "is-done" : undefined}>
            {CHECK}
            {t(`landing.labs.step${i + 1}`)}
          </li>
        ))}
      </ul>
      <p className="ld-prog" style={{ "--ld-p": scene.steps / STEPS } as CSSProperties}>
        <i />
        <span>{t("landing.labs.stepsDone", { done: scene.steps, total: STEPS })}</span>
      </p>
      <p className={"ld-hint" + (scene.steps >= 2 ? " is-on" : "")}>{t("landing.labs.hint")}</p>
    </div>
  )
}

export function LabDemo({ lit }: { lit: Feature | null }) {
  const figRef = useRef<HTMLElement>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const pinnedRef = useRef(false)
  const [mode, setMode] = useState<Mode>("ctf")
  const [round, setRound] = useState(0)
  const [visible, setVisible] = useState(false)
  const [scene, setScene] = useState<Scene>(() => finalScene("ctf"))
  const [left, setLeft] = useState(CLOCK_START)
  const [tip, setTip] = useState<{ id: string; x: number; y: number } | null>(null)

  useEffect(() => {
    const el = figRef.current
    if (!el || !("IntersectionObserver" in window)) return
    const io = new IntersectionObserver((entries) => setVisible(entries[entries.length - 1].isIntersecting), { threshold: 0.3 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  /* the event clock of «Змагання» */
  useEffect(() => {
    if (!visible || mode !== "ctf" || reducedMotion()) return
    const id = window.setInterval(() => setLeft((s) => (s > 0 ? s - 1 : CLOCK_START)), 1000)
    return () => window.clearInterval(id)
  }, [visible, mode])

  /* the player: walks the story of the current mode, then hands over to the other mode (or repeats a pinned one) */
  useEffect(() => {
    if (!visible || reducedMotion()) {
      setScene(finalScene(mode))
      return
    }
    let alive = true
    let frame = 0
    const timers: number[] = []
    // eslint-disable-next-line @eslint-react/web-api-no-leaked-timeout -- every id is kept in `timers` and cleared in the cleanup
    const sleep = (ms: number) => new Promise<void>((resolve) => void timers.push(window.setTimeout(resolve, ms)))
    const patch = (fn: (scene: Scene) => Partial<Scene>) => setScene((s) => ({ ...s, ...fn(s) }))
    const travel = (path: string, back = false) =>
      new Promise<void>((resolve) => {
        const svg = Array.from(figRef.current?.querySelectorAll<SVGSVGElement>(".ib-topo__canvas svg") ?? []).find((s) => s.getBoundingClientRect().width > 0)
        const line = svg?.querySelector<SVGPathElement>(`[data-pk="${path}"]`)
        const dot = svg?.querySelector<SVGRectElement>(".ld-pk")
        if (!line || !dot) return resolve()
        const length = line.getTotalLength()
        const t0 = performance.now()
        dot.style.opacity = "1"
        const step = (now: number) => {
          if (!alive) return
          const p = Math.min(1, Math.max(0, (now - t0) / PACKET_MS))
          const at = line.getPointAtLength(length * (back ? 1 - p : p))
          dot.setAttribute("transform", `translate(${at.x},${at.y})`)
          if (p < 1) frame = window.requestAnimationFrame(step)
          else {
            dot.style.opacity = "0"
            resolve()
          }
        }
        frame = window.requestAnimationFrame(step)
      })
    const run = async () => {
      for (const step of story(mode)) {
        if (!alive) return false
        if (step.do === "wait") await sleep(step.ms)
        else if (step.do === "set") patch(step.patch)
        else if (step.do === "out") {
          patch((s) => ({ lines: [...s.lines, step.line] }))
          await sleep(450)
        } else if (step.do === "draw") {
          patch((s) => ({ drawn: [...s.drawn, step.seg] }))
          await sleep(DRAW_MS)
        } else if (step.do === "packet") await travel(step.path, step.back)
        else if (step.do === "boot") {
          const hosts = bootOrder(mode)
          setScene({ ...emptyScene(), booting: true, boot: hosts, lines: [{ text: { key: "landing.labs.termBoot", vars: { lab: LAB } } }] })
          await sleep(700)
          for (const host of hosts) {
            if (!alive) return false
            patch((s) => ({ boot: s.boot.filter((h) => h !== host) }))
            await sleep(170)
          }
          patch(() => ({ booting: false, lines: [{ text: { key: "landing.labs.termReady", vars: { lab: LAB } } }] }))
          await sleep(500)
        } else if (step.do === "type") {
          patch((s) => ({ lines: [...s.lines, { text: step.prompt, kind: "cmd" }], typing: true, ping: step.node ?? null }))
          for (let i = 1; i <= step.text.length; i++) {
            if (!alive) return false
            const typed = step.prompt + step.text.slice(0, i)
            patch((s) => ({ lines: [...s.lines.slice(0, -1), { text: typed, kind: "cmd" }] }))
            await sleep(TYPE_MS)
          }
          patch(() => ({ typing: false }))
          await sleep(250)
        } else if (step.do === "probe") {
          await travel("k")
          await travel("k", true)
          patch(() => ({ probe: { text: step.text, ok: step.ok }, flash: { id: "srv", ok: step.ok } }))
          await sleep(1000)
          patch(() => ({ flash: null }))
        }
      }
      return alive
    }
    void run().then((finished) => {
      if (!finished) return
      if (pinnedRef.current) setRound((r) => r + 1)
      else setMode(other)
    })
    return () => {
      alive = false
      timers.forEach((id) => window.clearTimeout(id))
      window.cancelAnimationFrame(frame)
    }
  }, [mode, round, visible])

  const pick = (next: Mode) => {
    pinnedRef.current = true
    setMode(next)
    setRound((r) => r + 1)
  }

  /* a node explains itself on hover or tap */
  const tipFor = (e: MouseEvent) => {
    const node = (e.target as Element).closest<SVGGElement>("g[data-tip]")
    const canvas = canvasRef.current
    if (!node || !canvas) return null
    const c = canvas.getBoundingClientRect()
    const b = node.getBoundingClientRect()
    return { id: node.dataset.tip!, x: Math.max(120, Math.min(c.width - 120, b.left - c.left + b.width / 2)), y: b.top - c.top }
  }

  const lines = scene.lines.slice(-TERM_ROWS)
  return (
    <figure ref={figRef} className={"ib-topo ld" + (lit ? " is-focus" : "")} data-mode={mode}>
      <figcaption className="ib-topo__head ld-head">
        <b>{LAB}</b>
        <span className="ib-num">{LAB_CIDR}</span>
        <span className={"ld-st" + (scene.booting ? " is-boot" : "")}>
          {scene.booting ? <BrandLoading inline label={t("landing.labs.starting")} /> : null}
          {scene.booting ? t("landing.labs.starting") : t("landing.labs.ready")}
        </span>
        <div className="ld-tabs" role="tablist" aria-label={t("landing.labs.mode")}>
          {MODES.map((m) => (
            <button key={m} type="button" role="tab" aria-selected={mode === m} onClick={() => pick(m)}>
              {t(m === "ctf" ? "landing.labs.modeCtf" : "landing.labs.modeLearn")}
            </button>
          ))}
        </div>
      </figcaption>
      <pre className="ib-topo__term ld-term" aria-hidden="true">
        {lines.map((line, i) => (
          // eslint-disable-next-line @eslint-react/no-array-index-key -- terminal rows are positions: a row is retyped in place, never reordered
          <span key={i} className={"ld-ln" + (line.kind ? ` is-${line.kind}` : "") + (scene.typing && i === lines.length - 1 ? " is-caret" : "")}>
            {text(line.text) || "\u00a0"}
          </span>
        ))}
      </pre>
      <div
        ref={canvasRef}
        className="ib-topo__canvas"
        onMouseOver={(e) => setTip(tipFor(e))}
        onMouseLeave={() => setTip(null)}
        onClick={(e) => {
          const next = tipFor(e)
          setTip(next && next.id !== tip?.id ? next : null)
        }}
      >
        <SchemeSvg spec={WIDE} scene={scene} lit={lit ? LIT[lit] : null} />
        <SchemeSvg spec={TALL} scene={scene} lit={lit ? LIT[lit] : null} />
        {tip ? (
          <p className="ld-tip" role="status" style={{ left: tip.x, top: tip.y }}>
            {t(`landing.labs.tip.${tip.id}`)}
          </p>
        ) : null}
      </div>
      <div className="ld-out">
        <CtfOutcome scene={scene} left={left} />
        <LearnOutcome scene={scene} />
      </div>
    </figure>
  )
}
