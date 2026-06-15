import { Check } from "lucide-react"
import { t } from "@/i18n/t"

const POINTS = [
  "landing.labs.point1",
  "landing.labs.point2",
  "landing.labs.point3",
  "landing.labs.point4",
]

const NODES = [
  { y: 32, label: "host" },
  { y: 85, label: "web" },
  { y: 138, label: "host" },
]

// Highlight for the platform core — multifunctional labs. Copy + capability
// bullets beside an illustrative network-topology mockup (VPN → L3 → nodes).
export default function Labs() {
  return (
    <section id="labs" className="scroll-mt-20 bg-[#0B1521] py-16">
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
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">{t("landing.labs.caption")}</span>
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-[#7fd3a0] opacity-75 motion-safe:animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#7fd3a0]" />
            </span>
          </div>
          <svg viewBox="0 0 280 170" className="h-52 w-full" role="img" aria-label={t("landing.labs.caption")}>
            <g stroke="var(--frost-border)" strokeWidth="1.5" fill="none">
              <line x1="82" y1="85" x2="124" y2="85" />
              <line x1="156" y1="85" x2="206" y2="85" />
              <line x1="140" y1="69" x2="140" y2="46" />
              <line x1="140" y1="101" x2="140" y2="124" />
              <line x1="140" y1="46" x2="206" y2="46" />
              <line x1="140" y1="124" x2="206" y2="124" />
            </g>
            <g>
              <rect x="14" y="68" width="68" height="34" rx="8" fill="var(--primary)" fillOpacity="0.15" stroke="var(--primary)" />
              <text x="48" y="89" textAnchor="middle" fill="var(--foreground)" fontSize="11" fontFamily="monospace">VPN</text>
            </g>
            <g>
              <circle cx="140" cy="85" r="16" fill="var(--accent-warm)" fillOpacity="0.15" stroke="var(--accent-warm)" />
              <text x="140" y="89" textAnchor="middle" fill="var(--foreground)" fontSize="9" fontFamily="monospace">L3</text>
            </g>
            {NODES.map((n, i) => (
              <g key={i}>
                <rect x="206" y={n.y - 14} width="58" height="28" rx="7" fill="var(--card)" stroke="var(--frost-border)" />
                <text x="235" y={n.y + 4} textAnchor="middle" fill="var(--muted-foreground)" fontSize="10" fontFamily="monospace">{n.label}</text>
              </g>
            ))}
          </svg>
        </div>
      </div>
    </section>
  )
}
