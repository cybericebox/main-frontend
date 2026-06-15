import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { t } from "@/i18n/t"
import { ID_ORIGIN, SOURCE_URL } from "@/lib/links"

// Apex hero — crest brand mark, one primary CTA (sign-in/get-started), one
// secondary (view source). Static-export safe, no client hooks.
export default function Hero() {
  return (
    <section id="top" className="relative mx-auto flex max-w-5xl flex-col items-center px-4 pb-12 pt-20 text-center">
      <div className="frost-particles" />
      <div className="relative z-10 flex flex-col items-center">
        {/* eslint-disable-next-line @next/next/no-img-element -- static export, unoptimized images */}
        <img
          src="/assets/logo-crest.png"
          alt="CyberICEBox — ICE CTF"
          className="h-28 w-auto drop-shadow-[0_8px_26px_var(--frost-glow)]"
        />
        <h1 className="glow mt-5 text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
          {t("landing.hero.headline")}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          {t("landing.hero.subhead")}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild className="facet glow">
            <a href={ID_ORIGIN}>{t("landing.hero.primaryCta")}</a>
          </Button>
          <Button asChild variant="outline" className="border-[var(--accent-warm)] text-[var(--accent-warm)] hover:text-[var(--accent-warm)]">
            <a href={SOURCE_URL} target="_blank" rel="noopener noreferrer">
              <Star className="mr-1.5 h-4 w-4" />
              {t("landing.hero.viewSource")}
            </a>
          </Button>
        </div>
      </div>
    </section>
  )
}
