import type { ComponentType } from "react"
import { Check, Globe, ShieldCheck, Router, Network, Monitor, Server } from "lucide-react"
import { t } from "@/i18n/t"

const POINTS = [
  "landing.labs.point1",
  "landing.labs.point2",
  "landing.labs.point3",
  "landing.labs.point4",
]

function Node({
  icon: Icon,
  label,
  accent = false,
}: {
  icon: ComponentType<{ className?: string }>
  label: string
  accent?: boolean
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span
        className={
          "inline-flex h-10 w-10 items-center justify-center rounded-lg border " +
          (accent
            ? "border-[var(--accent-warm)] bg-[var(--accent-warm)]/10 text-[var(--accent-warm)]"
            : "border-[var(--frost-border)] bg-white/[0.03] text-foreground")
        }
      >
        <Icon className="h-5 w-5" />
      </span>
      <span className="font-mono text-[10px] text-muted-foreground">{label}</span>
    </div>
  )
}

function Link() {
  return <span className="mb-4 h-px flex-1 bg-[var(--frost-border)]" />
}

// Highlight for the platform core — multifunctional labs. Copy + capability
// bullets beside an illustrative device topology (internet → VPN → router →
// switch → lab hosts). Server component; only the live dot animates (motion-safe).
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
          <div className="mb-5 flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">{t("landing.labs.caption")}</span>
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-[#7fd3a0] opacity-75 motion-safe:animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#7fd3a0]" />
            </span>
          </div>

          <div className="flex items-center">
            <Node icon={Globe} label="internet" />
            <Link />
            <Node icon={ShieldCheck} label="VPN" accent />
            <Link />
            <Node icon={Router} label="router" />
            <Link />
            <Node icon={Network} label="switch" />
          </div>

          <div className="mr-[18px] ml-auto h-6 w-px bg-[var(--frost-border)]" />

          <div className="flex items-center justify-end gap-5">
            <Node icon={Monitor} label="host" />
            <Node icon={Server} label="web" />
            <Node icon={Monitor} label="host" />
          </div>
        </div>
      </div>
    </section>
  )
}
