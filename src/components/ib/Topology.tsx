"use client"

import { useEffect, useRef, type CSSProperties } from "react"
import { t } from "@/i18n/t"
import "@/styles/ds/components/topology.css"

// ds-v2 lab diagram (patterns/topology). Port of IB.Topology. When the figure enters the viewport it is assembled:
// perimeter, then the nodes one by one, then the links (opacity only, 350 ms apart — the steps are --ib-b on the
// parts), then the route draws in and the traffic dashes start (.is-flow). The build runs once per entry into view
// and repeats calmly every REPEAT_MS while the figure stays in view. With reduced motion nothing is hidden and
// nothing moves.
const STEP_MS = 350
const NODES = 8
const LINKS_STEP = NODES + 1
const DRAW_MS = 1600
const REPEAT_MS = 20000

const step = (n: number) => ({ "--ib-b": n }) as CSSProperties

export function Topology() {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || !("IntersectionObserver" in window)) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    let timers: number[] = []
    // eslint-disable-next-line @eslint-react/web-api-no-leaked-timeout -- every id is kept in `timers` and cleared by stop() in the cleanup
    const later = (fn: () => void, ms: number) => timers.push(window.setTimeout(fn, ms))
    const stop = () => {
      timers.forEach((id) => window.clearTimeout(id))
      timers = []
    }
    const build = () => {
      el.classList.remove("is-built", "is-draw", "is-flow")
      void el.getBoundingClientRect() // commit the hidden state so the fade-in restarts
      el.classList.add("is-built")
      later(() => el.classList.add("is-draw"), LINKS_STEP * STEP_MS)
      later(() => el.classList.add("is-flow"), LINKS_STEP * STEP_MS + DRAW_MS)
      later(build, REPEAT_MS)
    }
    el.classList.add("is-build")
    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[entries.length - 1]
        stop()
        if (e.isIntersecting) build()
        else el.classList.remove("is-built", "is-draw", "is-flow")
      },
      { threshold: 0.4 }
    )
    io.observe(el)
    return () => {
      stop()
      io.disconnect()
      el.classList.remove("is-build", "is-built", "is-draw", "is-flow")
    }
  }, [])

  return (
    <figure ref={ref} className="ib-topo">
      <figcaption className="ib-topo__head">
        <b>lab-07</b>
        <span className="ib-num">10.10.0.0/16</span>
      </figcaption>
      {/* the canvas never scrolls: wide layout from 641px (scales down with its column), a column of the same
          hosts below that (.ib-topo__wide / .ib-topo__tall, landing.css) */}
      <div className="ib-topo__canvas">
        <svg className="ib-topo__wide" viewBox="0 0 720 440" role="img" aria-label={t("landing.labs.topoAria")}>
          <g data-ib-b="" style={step(0)}>
            <rect className="ib-topo__zone" x="168.5" y="16.5" width="535" height="407" rx="8" strokeDasharray="5 4" />
            <text className="ib-topo__note" x="184" y="38">
              {t("landing.labs.topoPerimeter")}
            </text>
            <rect className="ib-topo__subnet" x="476.5" y="44.5" width="212" height="120" rx="6" strokeDasharray="3 3" />
            <text className="ib-topo__note" x="492" y="66">
              {t("landing.labs.topoDmz", { cidr: "10.10.1.0/24" })}
            </text>
            <rect className="ib-topo__subnet" x="476.5" y="220.5" width="212" height="188" rx="6" strokeDasharray="3 3" />
            <text className="ib-topo__note" x="492" y="242">
              {t("landing.labs.topoInternal", { cidr: "10.10.2.0/24" })}
            </text>
          </g>
          <g data-ib-b="" style={step(LINKS_STEP)}>
            <g className="ib-topo__link">
              <path d="M144 360H192" />
              <path d="M316 360H400V248" />
              <path d="M448 224H460V294H496" />
              <path d="M460 294V370H496" />
            </g>
            <g className="ib-topo__route">
              <path className="ib-topo__draw" d="M144 90H192M316 90H400V200M448 224H460V112H496" />
            </g>
            <g className="ib-topo__joint">
              <rect x="457" y="221" width="6" height="6" />
            </g>
            <text className="ib-topo__note" x="408" y="150">
              wg0
            </text>
            <text className="ib-topo__note" x="408" y="300">
              http
            </text>
          </g>
          <g className="ib-topo__flow ib-topo__flow--link" aria-hidden="true">
            <path d="M144 360H192" style={{ "--ib-flow-delay": "-1.5s" } as CSSProperties} />
            <path d="M316 360H400V248" style={{ "--ib-flow-delay": "-2.5s" } as CSSProperties} />
            <path d="M448 224H460V294H496" style={{ "--ib-flow-delay": "-3.5s" } as CSSProperties} />
            <path d="M460 294V370H496" style={{ "--ib-flow-delay": "-3.5s" } as CSSProperties} />
          </g>
          <g className="ib-topo__flow ib-topo__flow--route" aria-hidden="true">
            <path d="M144 90H192M316 90H400V200M448 224H460V112H496" />
          </g>
          <g data-ib-b="" style={step(1)}>
            <rect className="ib-topo__you" x="16.5" y="66.5" width="127" height="48" rx="6" />
            <text className="ib-topo__name ib-topo__on-brand" x="30" y="86">
              {t("landing.labs.topoYou")}
            </text>
            <text className="ib-topo__on-brand-2" x="30" y="104">
              10.66.0.7
            </text>
          </g>
          <g data-ib-b="" style={step(2)}>
            <rect className="ib-topo__node ib-topo__node--on" x="192.5" y="66.5" width="123" height="48" rx="6" />
            <text className="ib-topo__name" x="206" y="86">
              vpn-gw
            </text>
            <text x="206" y="104">
              udp 51820
            </text>
          </g>
          <g data-ib-b="" style={step(3)}>
            <rect className="ib-topo__node ib-topo__node--on" x="352.5" y="200.5" width="95" height="48" rx="6" />
            <text className="ib-topo__name" x="366" y="220">
              r1
            </text>
            <text x="366" y="238">
              10.10.0.1
            </text>
          </g>
          <g data-ib-b="" style={step(4)}>
            <rect className="ib-topo__node ib-topo__node--on" x="496.5" y="84.5" width="176" height="56" rx="6" />
            <text className="ib-topo__name" x="510" y="106">
              web
            </text>
            <text x="510" y="126">
              10.10.1.10
            </text>
            <text className="ib-topo__note" x="658" y="106" textAnchor="end">
              :80 :443
            </text>
          </g>
          <g data-ib-b="" style={step(5)}>
            <rect className="ib-topo__node" x="496.5" y="266.5" width="176" height="56" rx="6" />
            <text className="ib-topo__name" x="510" y="288">
              db
            </text>
            <text x="510" y="308">
              10.10.2.20
            </text>
            <text className="ib-topo__note" x="658" y="288" textAnchor="end">
              :5432
            </text>
          </g>
          <g data-ib-b="" style={step(6)}>
            <rect className="ib-topo__node" x="496.5" y="342.5" width="176" height="56" rx="6" />
            <text className="ib-topo__name" x="510" y="364">
              files
            </text>
            <text x="510" y="384">
              10.10.2.31
            </text>
            <text className="ib-topo__note" x="658" y="364" textAnchor="end">
              :445
            </text>
          </g>
          <g data-ib-b="" style={step(7)}>
            <rect className="ib-topo__node" x="16.5" y="336.5" width="127" height="48" rx="6" />
            <text className="ib-topo__name" x="30" y="356">
              {t("landing.labs.topoBrowser")}
            </text>
            <text x="30" y="374">
              https
            </text>
          </g>
          <g data-ib-b="" style={step(8)}>
            <rect className="ib-topo__node" x="192.5" y="336.5" width="123" height="48" rx="6" />
            <text className="ib-topo__name" x="206" y="356">
              proxy
            </text>
            <text x="206" y="374">
              tcp 443
            </text>
          </g>
        </svg>
        <TallScheme />
      </div>
      <pre className="ib-topo__term" role="region" tabIndex={0} aria-label={t("landing.labs.termRegion")}>
        <b>$ sudo wg-quick up ./lab-07.conf</b>
        {"\ninterface: wg0   address: 10.66.0.7/32\npeer: vpn-gw     allowed ips: 10.10.0.0/16"}
      </pre>
    </figure>
  )
}

// Phones: PC → vpn-gw → r1 → subnets in a column (browser → proxy beside them), same steps and roles as the wide one.
const TALL_LINKS = ["M249 64V116", "M249 164V224H230", "M200 248V262H320V446H294", "M320 446V510H294"]
const TALL_ROUTE = "M90 64V116M90 164V224H110M150 248V308"
const TALL_DELAY = ["-1.5s", "-2.5s", "-3.5s", "-3.5s"]

function TallNode({ x, y, w, h = 48, name, addr, port, on, you, b }: { x: number; y: number; w: number; h?: number; name: string; addr: string; port?: string; on?: boolean; you?: boolean; b: number }) {
  const top = h > 48 ? 22 : 20
  return (
    <g data-ib-b="" style={step(b)}>
      <rect className={you ? "ib-topo__you" : "ib-topo__node" + (on ? " ib-topo__node--on" : "")} x={x + 0.5} y={y + 0.5} width={w} height={h} rx="6" />
      <text className={"ib-topo__name" + (you ? " ib-topo__on-brand" : "")} x={x + 14} y={y + top}>
        {name}
      </text>
      <text className={you ? "ib-topo__on-brand-2" : undefined} x={x + 14} y={y + top + 18}>
        {addr}
      </text>
      {port ? (
        <text className="ib-topo__note" x={x + w - 14} y={y + top} textAnchor="end">
          {port}
        </text>
      ) : null}
    </g>
  )
}

function TallScheme() {
  return (
    <svg className="ib-topo__tall" viewBox="0 0 340 584" role="img" aria-label={t("landing.labs.topoAria")}>
      <g data-ib-b="" style={step(0)}>
        <rect className="ib-topo__zone" x="8.5" y="84.5" width="323" height="484" rx="8" strokeDasharray="5 4" />
        <text className="ib-topo__note" x="22" y="104">
          {t("landing.labs.topoPerimeter")}
        </text>
        <rect className="ib-topo__subnet" x="32.5" y="276.5" width="275" height="96" rx="6" strokeDasharray="3 3" />
        <text className="ib-topo__note" x="46" y="296">
          {t("landing.labs.topoDmz", { cidr: "10.10.1.0/24" })}
        </text>
        <rect className="ib-topo__subnet" x="32.5" y="388.5" width="275" height="164" rx="6" strokeDasharray="3 3" />
        <text className="ib-topo__note" x="46" y="408">
          {t("landing.labs.topoInternal", { cidr: "10.10.2.0/24" })}
        </text>
      </g>
      <g data-ib-b="" style={step(LINKS_STEP)}>
        <g className="ib-topo__link">
          {TALL_LINKS.map((d) => (
            <path key={d} d={d} />
          ))}
        </g>
        <g className="ib-topo__route">
          <path className="ib-topo__draw" d={TALL_ROUTE} />
        </g>
        <text className="ib-topo__note" x="98" y="196">
          wg0
        </text>
        <text className="ib-topo__note" x="238" y="258">
          http
        </text>
      </g>
      <g className="ib-topo__flow ib-topo__flow--link" aria-hidden="true">
        {TALL_LINKS.map((d, i) => (
          <path key={d} d={d} style={{ "--ib-flow-delay": TALL_DELAY[i] } as CSSProperties} />
        ))}
      </g>
      <g className="ib-topo__flow ib-topo__flow--route" aria-hidden="true">
        <path d={TALL_ROUTE} />
      </g>
      <TallNode b={1} you x={16} y={16} w={148} name={t("landing.labs.topoYou")} addr="10.66.0.7" />
      <TallNode b={2} on x={16} y={116} w={148} name="vpn-gw" addr="udp 51820" />
      <TallNode b={3} on x={110} y={200} w={119} name="r1" addr="10.10.0.1" />
      <TallNode b={4} on x={46} y={308} w={247} h={52} name="web" addr="10.10.1.10" port=":80 :443" />
      <TallNode b={5} x={46} y={420} w={247} h={52} name="db" addr="10.10.2.20" port=":5432" />
      <TallNode b={6} x={46} y={484} w={247} h={52} name="files" addr="10.10.2.31" port=":445" />
      <TallNode b={7} x={175} y={16} w={148} name={t("landing.labs.topoBrowser")} addr="https" />
      <TallNode b={8} x={175} y={116} w={148} name="proxy" addr="tcp 443" />
    </svg>
  )
}
