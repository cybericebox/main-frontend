import type { ComponentType } from "react"
import { Check, Globe, ShieldCheck, Network, Monitor, Server, Router } from "lucide-react"
import { t } from "@/i18n/t"

const POINTS = [
  "landing.labs.point1",
  "landing.labs.point2",
  "landing.labs.point3",
  "landing.labs.point4",
]

// Node positions in a 0..100 coordinate space shared by the SVG link layer and
// the absolutely-positioned icon chips, so lines meet the chips precisely.
const NODES: {
  x: number
  y: number
  icon: ComponentType<{ className?: string }>
  label: string
  accent?: boolean
}[] = [
  { x: 20, y: 24, icon: ShieldCheck, label: "VPN", accent: true },
  { x: 72, y: 24, icon: Globe, label: "internet" },
  { x: 46, y: 50, icon: Network, label: "switch" },
  { x: 18, y: 78, icon: Monitor, label: "host" },
  { x: 46, y: 80, icon: Router, label: "router" },
  { x: 74, y: 78, icon: Server, label: "web" },
]

// links by NODES index: VPN→switch, internet→switch, switch→host/router/web
const LINKS: [number, number][] = [
  [0, 2],
  [1, 2],
  [2, 3],
  [2, 4],
  [2, 5],
]

// Highlight for the platform core — multifunctional labs. Copy + capability
// bullets beside a lab-perimeter topology diagram (VPN + internet gateways →
// switch → hosts). Server component; only the live dot animates (motion-safe).
export function Labs() {
  return (
    <section id="labs" className="scroll-mt-20 bg-secondary/40 py-16">
      <div className="mx-auto grid max-w-5xl items-center gap-10 px-4 md:grid-cols-2">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--accent-warm)]">
            {t("landing.labs.kicker")}
          </p>
          <h2 className="mt-3 text-2xl font-bold text-foreground md:text-3xl">{t("landing.labs.title")}</h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">{t("landing.labs.body")}</p>
          <ul className="mt-6 flex flex-col gap-3">
            {POINTS.map((p) => (
              <li key={p} className="flex items-center gap-3">
                <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15">
                  <Check className="h-3.5 w-3.5 text-primary" />
                </span>
                <span className="text-sm text-foreground">{t(p)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="frost-panel rounded-xl p-5">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">{t("landing.labs.caption")}</span>
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-[#7fd3a0] opacity-75 motion-safe:animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#7fd3a0]" />
            </span>
          </div>

          <div className="relative h-64 rounded-lg border border-dashed border-[var(--frost-border)] bg-white/[0.02]">
            <span className="absolute left-3 top-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              lab
            </span>
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
              {LINKS.map(([a, b], i) => (
                <line
                  key={i}
                  x1={NODES[a].x}
                  y1={NODES[a].y}
                  x2={NODES[b].x}
                  y2={NODES[b].y}
                  stroke="var(--frost-border)"
                  strokeWidth="1"
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </svg>
            {NODES.map((n, i) => {
              const Icon = n.icon
              return (
                <div
                  key={i}
                  className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1"
                  style={{ left: `${n.x}%`, top: `${n.y}%` }}
                >
                  <span
                    className={
                      "inline-flex h-9 w-9 items-center justify-center rounded-lg border " +
                      (n.accent
                        ? "border-[var(--accent-warm)] bg-[var(--accent-warm)]/10 text-[var(--accent-warm)]"
                        : "border-[var(--frost-border)] bg-secondary/40 text-foreground")
                    }
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="font-mono text-[9px] text-muted-foreground">{n.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
