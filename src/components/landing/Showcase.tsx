import { t } from "@/i18n/t"

// Mock leaderboard — illustrative fake teams/scores previewing the platform's
// live event scoreboard. Server component; animation is motion-safe only.
const ROWS = [
  { team: "0xFrost", score: 4820 },
  { team: "IceBreakers", score: 4655 },
  { team: "NullSec", score: 4390 },
  { team: "GlacierByte", score: 4120 },
  { team: "SubZero", score: 3980 },
]

export default function Showcase() {
  const max = ROWS[0].score
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

      <div className="frost-panel mx-auto mt-8 max-w-2xl overflow-hidden rounded-xl">
        <div className="flex items-center justify-end border-b border-[var(--frost-border)] px-5 py-3">
          <span className="inline-flex items-center gap-2 text-xs font-medium text-[var(--accent-warm)]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--accent-warm)] opacity-75 motion-safe:animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--accent-warm)]" />
            </span>
            {t("landing.showcase.live")}
          </span>
        </div>

        <div className="flex items-center gap-4 px-5 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          <span className="w-5 shrink-0 text-center">{t("landing.showcase.colRank")}</span>
          <span className="w-28 shrink-0">{t("landing.showcase.colTeam")}</span>
          <span className="flex-1" />
          <span className="w-14 shrink-0 text-right">{t("landing.showcase.colScore")}</span>
        </div>

        <ol className="divide-y divide-[var(--frost-border)]">
          {ROWS.map((row, i) => (
            <li key={row.team} className="flex items-center gap-4 px-5 py-3">
              <span className="w-5 shrink-0 text-center font-mono text-sm text-muted-foreground">{i + 1}</span>
              <span className="w-28 shrink-0 truncate text-sm font-medium text-foreground">{row.team}</span>
              <span className="relative h-2 flex-1 overflow-hidden rounded-full bg-white/5">
                <span
                  className="absolute inset-y-0 left-0 rounded-full bg-primary/70 motion-safe:animate-pulse"
                  style={{ width: `${Math.round((row.score / max) * 100)}%` }}
                />
              </span>
              <span className="w-14 shrink-0 text-right font-mono text-sm tabular-nums text-foreground">{row.score}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
