import type { CSSProperties, ComponentType, ReactNode } from "react"
import { Globe, Lock, Terminal, Search } from "lucide-react"
import { t } from "@/i18n/t"
import { PLATFORM_DOMAIN } from "@/lib/links"

// Two illustrative product screens framed as browser windows — a live scoreboard
// and a challenges page. Fake data; server component; animation is motion-safe.
const SERIES: { color: string; points: string }[] = [
  { color: "var(--primary)", points: "0,110 40,98 80,86 120,70 160,64 200,46 240,34 280,18" },
  { color: "var(--accent-warm)", points: "0,112 40,104 80,92 120,84 160,60 200,52 240,40 280,30" },
  { color: "#7fd3a0", points: "0,114 40,108 80,100 120,88 160,78 200,66 240,58 280,44" },
  { color: "#c084fc", points: "0,116 40,112 80,106 120,98 160,90 200,82 240,70 280,60" },
]

const STANDINGS = [
  { team: "0xFrost", score: 4820 },
  { team: "IceBreakers", score: 4655 },
  { team: "NullSec", score: 4390 },
]

const CHALLENGES: {
  icon: ComponentType<{ className?: string }>
  cat: string
  title: string
  pts: number
  diff: string
  solved: boolean
}[] = [
  { icon: Globe, cat: "Web", title: "Frozen Session", pts: 350, diff: "#f2a742", solved: true },
  { icon: Lock, cat: "Crypto", title: "Glacier Cipher", pts: 500, diff: "#f87171", solved: false },
  { icon: Terminal, cat: "Pwn", title: "Heap of Snow", pts: 450, diff: "#f87171", solved: false },
  { icon: Search, cat: "Forensics", title: "Cold Trail", pts: 250, diff: "#7fd3a0", solved: true },
]

function BrowserFrame({ url, children }: { url: string; children: ReactNode }) {
  return (
    <div className="frost-panel overflow-hidden rounded-xl">
      <div className="flex items-center gap-2 border-b border-[var(--frost-border)] px-4 py-2.5">
        <span className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#f87171]/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#f2a742]/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#7fd3a0]/70" />
        </span>
        <span className="ml-2 flex-1 truncate rounded-md bg-white/[0.05] px-3 py-1 text-center font-mono text-[11px] text-muted-foreground">
          {url}
        </span>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

export default function Showcase() {
  return (
    <section id="showcase" className="mx-auto max-w-5xl scroll-mt-20 px-4 py-16">
      <p className="text-center font-mono text-xs uppercase tracking-[0.18em] text-[var(--accent-warm)]">
        {t("landing.showcase.kicker")}
      </p>
      <h2 className="mt-3 text-center text-2xl font-bold text-foreground md:text-3xl">
        {t("landing.showcase.title")}
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
        {t("landing.showcase.subtitle")}
      </p>

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        <BrowserFrame url={`winter-arena.${PLATFORM_DOMAIN}/scoreboard`}>
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">{t("landing.showcase.chartTitle")}</span>
            <span className="inline-flex items-center gap-2 text-xs font-medium text-[var(--accent-warm)]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--accent-warm)] opacity-75 motion-safe:animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--accent-warm)]" />
              </span>
              {t("landing.showcase.live")}
            </span>
          </div>
          <svg viewBox="0 0 280 120" className="h-36 w-full" preserveAspectRatio="none" role="img" aria-label={t("landing.showcase.chartTitle")}>
            {[24, 48, 72, 96].map((y) => (
              <line key={y} x1="0" y1={y} x2="280" y2={y} stroke="var(--frost-border)" strokeWidth="1" />
            ))}
            {SERIES.map((s, i) => (
              <polyline
                key={i}
                points={s.points}
                fill="none"
                stroke={s.color}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ strokeDasharray: 600, ["--draw-len" as string]: "600", animationDelay: `${i * 0.18}s` } as CSSProperties}
                className="motion-safe:[animation:draw-line_1.8s_ease-out_both]"
              />
            ))}
            {SERIES.map((s, i) => {
              const last = s.points.split(" ").pop()!.split(",")
              return <circle key={i} cx={last[0]} cy={last[1]} r="3" fill={s.color} />
            })}
          </svg>
          <ol className="mt-4 divide-y divide-[var(--frost-border)]">
            {STANDINGS.map((row, i) => (
              <li key={row.team} className="flex items-center gap-3 py-2">
                <span className="w-4 text-center font-mono text-xs text-muted-foreground">{i + 1}</span>
                <span className="flex-1 truncate text-sm text-foreground">{row.team}</span>
                <span className="font-mono text-xs tabular-nums text-[var(--accent-warm)]">{row.score}</span>
              </li>
            ))}
          </ol>
        </BrowserFrame>

        <BrowserFrame url={`winter-arena.${PLATFORM_DOMAIN}/challenges`}>
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">{t("landing.showcase.challengesTitle")}</span>
            <div className="hidden gap-1.5 sm:flex">
              {["Web", "Crypto", "Pwn"].map((c) => (
                <span key={c} className="rounded-full border border-[var(--frost-border)] px-2 py-0.5 text-[10px] text-muted-foreground">
                  {c}
                </span>
              ))}
            </div>
          </div>
          <ul className="grid grid-cols-2 gap-3">
            {CHALLENGES.map((c) => {
              const Icon = c.icon
              return (
                <li key={c.title} className="rounded-lg border border-[var(--frost-border)] bg-white/[0.03] p-3">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary/15">
                      <Icon className="h-4 w-4 text-primary" />
                    </span>
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.diff }} aria-hidden />
                  </div>
                  <p className="mt-2 truncate text-sm font-medium text-foreground">{c.title}</p>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">{c.cat}</span>
                    <span className="font-mono text-xs tabular-nums text-[var(--accent-warm)]">{c.pts}</span>
                  </div>
                  {c.solved && (
                    <span className="mt-2 inline-block rounded-full bg-[#7fd3a0]/15 px-2 py-0.5 text-[10px] font-medium text-[#7fd3a0]">
                      {t("landing.showcase.solved")}
                    </span>
                  )}
                </li>
              )
            })}
          </ul>
        </BrowserFrame>
      </div>
    </section>
  )
}
