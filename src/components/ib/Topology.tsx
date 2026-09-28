"use client"

import { useEffect, useRef } from "react"
import { t } from "@/i18n/t"
import "@/styles/ds/components/topology.css"

// ds-v2 lab diagram (patterns/topology). Port of IB.Topology: the highlighted route
// draws in once when the figure enters the viewport; skipped with reduced motion.
export function Topology() {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || !("IntersectionObserver" in window)) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          el.classList.add("is-draw")
          io.disconnect()
        }
      },
      { threshold: 0.4 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <figure ref={ref} className="ib-topo">
      <figcaption className="ib-topo__head">
        <b>lab-07</b>
        <span className="ib-num">10.10.0.0/16</span>
      </figcaption>
      <div className="ib-topo__canvas">
        <svg viewBox="0 0 720 440" role="img" aria-label={t("landing.labs.topoAria")}>
          <rect className="ib-topo__zone" x="168.5" y="16.5" width="535" height="407" rx="8" strokeDasharray="5 4" />
          <text className="ib-topo__note" x="184" y="38">
            {t("landing.labs.topoPerimeter")}
          </text>
          <rect className="ib-topo__subnet" x="476.5" y="44.5" width="212" height="120" rx="6" strokeDasharray="3 3" />
          <text className="ib-topo__note" x="492" y="66">
            DMZ 10.10.1.0/24
          </text>
          <rect className="ib-topo__subnet" x="476.5" y="220.5" width="212" height="188" rx="6" strokeDasharray="3 3" />
          <text className="ib-topo__note" x="492" y="242">
            internal 10.10.2.0/24
          </text>
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
          <g>
            <rect className="ib-topo__you" x="16.5" y="66.5" width="127" height="48" rx="6" />
            <text className="ib-topo__name ib-topo__on-brand" x="30" y="86">
              {t("landing.labs.topoYou")}
            </text>
            <text className="ib-topo__on-brand-2" x="30" y="104">
              10.66.0.7
            </text>
            <rect className="ib-topo__node" x="16.5" y="336.5" width="127" height="48" rx="6" />
            <text className="ib-topo__name" x="30" y="356">
              {t("landing.labs.topoBrowser")}
            </text>
            <text x="30" y="374">
              https
            </text>
            <rect className="ib-topo__node ib-topo__node--on" x="192.5" y="66.5" width="123" height="48" rx="6" />
            <text className="ib-topo__name" x="206" y="86">
              vpn-gw
            </text>
            <text x="206" y="104">
              udp 51820
            </text>
            <rect className="ib-topo__node" x="192.5" y="336.5" width="123" height="48" rx="6" />
            <text className="ib-topo__name" x="206" y="356">
              proxy
            </text>
            <text x="206" y="374">
              tcp 443
            </text>
            <rect className="ib-topo__node ib-topo__node--on" x="352.5" y="200.5" width="95" height="48" rx="6" />
            <text className="ib-topo__name" x="366" y="220">
              r1
            </text>
            <text x="366" y="238">
              10.10.0.1
            </text>
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
          <text className="ib-topo__note" x="408" y="150">
            wg0
          </text>
          <text className="ib-topo__note" x="408" y="300">
            http
          </text>
        </svg>
      </div>
      <pre className="ib-topo__term">
        <b>$ sudo wg-quick up ./lab-07.conf</b>
        {"\ninterface: wg0   address: 10.66.0.7/32\npeer: vpn-gw     allowed ips: 10.10.0.0/16"}
      </pre>
    </figure>
  )
}
