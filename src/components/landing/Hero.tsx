import { Logo } from "@/components/brand/Logo"
import { t } from "@/i18n/t"
import { HeroCta } from "./HeroCta"

// Apex hero — crest brand mark + a role-aware primary CTA (HeroCta).
// Server component; the CTA's auth-state logic is isolated in the client child.
export function Hero() {
  return (
    <section id="top" className="relative mx-auto flex max-w-5xl flex-col items-center px-4 pb-12 pt-20 text-center">
      <div className="frost-particles" />
      <div className="relative z-10 flex flex-col items-center">
        <Logo size={112} className="drop-shadow-[0_8px_26px_var(--frost-glow)]" />
        <h1 className="glow mt-5 text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
          {t("landing.hero.headline")}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          {t("landing.hero.subhead")}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <HeroCta />
        </div>
      </div>
    </section>
  )
}
