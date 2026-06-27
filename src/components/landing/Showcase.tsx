import type { ComponentType, ReactNode } from "react"
import {
  Globe,
  Lock,
  Terminal,
  Search,
  Cpu,
  Flag,
  Users,
  Boxes,
  ArrowUp,
  ArrowDown,
  Minus,
} from "lucide-react"
import { t } from "@/i18n/t"
import { PLATFORM_DOMAIN } from "@/lib/links"

// A single realistic platform dashboard, framed as a browser window — event
// header, live scoreboard, challenge board and a stats strip. Illustrative data.

type Trend = "up" | "down" | "flat"
const STANDINGS: { team: string; members: number; score: number; trend: Trend }[] = [
  { team: "0xFrost", members: 4, score: 4820, trend: "up" },
  { team: "IceBreakers", members: 3, score: 4655, trend: "up" },
  { team: "NullSec", members: 4, score: 4390, trend: "down" },
  { team: "ColdBoot", members: 2, score: 3980, trend: "flat" },
  { team: "GlacialUnit", members: 5, score: 3710, trend: "up" },
]

const DIFF = {
  easy: { label: "Легке", color: "#10B981" },
  medium: { label: "Середнє", color: "#F59E0B" },
  hard: { label: "Складне", color: "#EF4444" },
} as const

const CHALLENGES: {
  icon: ComponentType<{ className?: string }>
  cat: string
  title: string
  pts: number
  diff: keyof typeof DIFF
  solves: number
  solved: boolean
}[] = [
  { icon: Globe, cat: "Web", title: "Frozen Session", pts: 350, diff: "medium", solves: 42, solved: true },
  { icon: Lock, cat: "Crypto", title: "Glacier Cipher", pts: 500, diff: "hard", solves: 11, solved: false },
  { icon: Terminal, cat: "Pwn", title: "Heap of Snow", pts: 450, diff: "hard", solves: 18, solved: false },
  { icon: Search, cat: "Forensics", title: "Cold Trail", pts: 250, diff: "easy", solves: 96, solved: true },
  { icon: Cpu, cat: "Reverse", title: "Permafrost.bin", pts: 400, diff: "medium", solves: 27, solved: false },
  { icon: Globe, cat: "Web", title: "Whiteout XSS", pts: 300, diff: "medium", solves: 51, solved: true },
]

const STATS = [
  { icon: Users, value: "128", label: "команд" },
  { icon: Boxes, value: "42", label: "завдання" },
  { icon: Flag, value: "1 904", label: "прапорів здано" },
  { icon: Cpu, value: "316", label: "активних лабораторій" },
]

function rankClass(i: number) {
  if (i === 0) return "bg-primary text-primary-foreground"
  if (i === 1) return "bg-accent text-accent-foreground"
  if (i === 2) return "bg-secondary text-secondary-foreground"
  return "bg-muted text-muted-foreground"
}

function TrendIcon({ trend }: { trend: Trend }) {
  if (trend === "up") return <ArrowUp className="h-3.5 w-3.5 text-[#10B981]" />
  if (trend === "down") return <ArrowDown className="h-3.5 w-3.5 text-[#EF4444]" />
  return <Minus className="h-3.5 w-3.5 text-muted-foreground" />
}

function BrowserFrame({ url, children }: { url: string; children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[0_30px_80px_-40px_rgba(11,18,51,0.45)]">
      <div className="flex items-center gap-2 border-b border-border bg-secondary/40 px-4 py-2.5">
        <span className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#EF4444]/60" />
          <span className="h-3 w-3 rounded-full bg-[#F59E0B]/60" />
          <span className="h-3 w-3 rounded-full bg-[#10B981]/60" />
        </span>
        <span className="ml-2 flex-1 truncate rounded-md border border-border bg-card px-3 py-1 text-center font-mono text-[11px] text-muted-foreground">
          {url}
        </span>
      </div>
      <div className="p-5 md:p-6">{children}</div>
    </div>
  )
}

export function Showcase() {
  return (
    <section id="showcase" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20">
      <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-primary">
        {t("landing.showcase.kicker")}
      </p>
      <h2 className="mt-3 text-center text-2xl font-bold tracking-tight text-foreground md:text-3xl">
        {t("landing.showcase.title")}
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
        {t("landing.showcase.subtitle")}
      </p>

      <div className="mt-12">
        <BrowserFrame url={`winter-arena.${PLATFORM_DOMAIN}`}>
          {/* event header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Flag className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-base font-semibold leading-tight text-foreground">Winter Arena 2026</h3>
                <span className="text-xs text-muted-foreground">Jeopardy CTF · 128 команд</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 motion-safe:animate-ping" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                </span>
                {t("landing.showcase.live")}
              </span>
              <span className="rounded-md border border-border bg-secondary/40 px-2.5 py-1 font-mono text-xs tabular-nums text-foreground">
                02:14:09
              </span>
            </div>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-5">
            {/* scoreboard */}
            <div className="lg:col-span-2">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">Рейтинг команд</span>
                <span className="text-xs text-muted-foreground">топ-5</span>
              </div>
              <ol className="flex flex-col gap-1.5">
                {STANDINGS.map((row, i) => (
                  <li
                    key={row.team}
                    className="flex items-center gap-3 rounded-lg border border-border bg-secondary/30 px-3 py-2"
                  >
                    <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-bold ${rankClass(i)}`}>
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{row.team}</p>
                      <p className="text-[11px] text-muted-foreground">{row.members} учасники</p>
                    </div>
                    <TrendIcon trend={row.trend} />
                    <span className="font-mono text-sm font-semibold tabular-nums text-primary">
                      {row.score.toLocaleString("uk")}
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            {/* challenges */}
            <div className="lg:col-span-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">Завдання</span>
                <div className="hidden gap-1.5 sm:flex">
                  {["Усі", "Web", "Crypto", "Pwn"].map((c, i) => (
                    <span
                      key={c}
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                        i === 0
                          ? "bg-primary text-primary-foreground"
                          : "border border-border text-muted-foreground"
                      }`}
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
              <ul className="grid gap-2.5 sm:grid-cols-2">
                {CHALLENGES.map((c) => {
                  const Icon = c.icon
                  const d = DIFF[c.diff]
                  return (
                    <li
                      key={c.title}
                      className="rounded-lg border border-border bg-secondary/30 p-3 transition-colors hover:border-primary/40"
                    >
                      <div className="flex items-start justify-between">
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="font-mono text-sm font-bold tabular-nums text-primary">{c.pts}</span>
                      </div>
                      <p className="mt-2 truncate text-sm font-semibold text-foreground">{c.title}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                          {c.cat}
                        </span>
                        <span
                          className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium"
                          style={{ color: d.color, backgroundColor: `${d.color}1A` }}
                        >
                          {d.label}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center justify-between border-t border-border pt-2 text-[11px] text-muted-foreground">
                        <span>{c.solves} розв’язань</span>
                        {c.solved && (
                          <span className="inline-flex items-center gap-1 font-medium text-[#10B981]">
                            <Flag className="h-3 w-3" /> здано
                          </span>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>

          {/* stats strip */}
          <div className="mt-5 grid grid-cols-2 gap-3 border-t border-border pt-5 md:grid-cols-4">
            {STATS.map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-mono text-lg font-bold leading-none tabular-nums text-foreground">{value}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </BrowserFrame>
      </div>
    </section>
  )
}
