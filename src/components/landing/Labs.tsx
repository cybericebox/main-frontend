import { Check } from "lucide-react"
import { t } from "@/i18n/t"
import { PLATFORM_DOMAIN } from "@/lib/links"

const POINTS = ["landing.labs.point1", "landing.labs.point2", "landing.labs.point3"]

// Highlight for the platform's core capability — multifunctional, on-demand labs.
// Copy + capability bullets beside an illustrative lab-terminal mockup.
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

        <div className="frost-panel overflow-hidden rounded-xl font-mono text-sm">
          <div className="flex items-center gap-1.5 border-b border-[var(--frost-border)] px-4 py-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#f87171]/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#f2a742]/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#7fd3a0]/70" />
          </div>
          <div className="space-y-1.5 p-5">
            <p className="text-foreground"><span className="text-[var(--accent-warm)]">$</span> lab start web/frozen-session</p>
            <p className="text-muted-foreground">▸ provisioning isolated environment…</p>
            <p className="text-muted-foreground">▸ target: <span className="text-[#7fd3a0]">https://lab-7f3a.{PLATFORM_DOMAIN}</span></p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/5">
              <span className="block h-full w-full rounded-full bg-primary/70 motion-safe:animate-pulse" />
            </div>
            <p className="mt-3 inline-flex items-center gap-2 text-[#7fd3a0]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-[#7fd3a0] opacity-75 motion-safe:animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#7fd3a0]" />
              </span>
              {t("landing.labs.caption")}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
