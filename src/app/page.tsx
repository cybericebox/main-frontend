"use client"

import { Button } from "@/components/ui/button"
import { Wordmark } from "@/components/brand/Wordmark"
import { t } from "@/i18n/t"

// Resolve the id-frontend origin for the "Sign in" CTA.
// Prefers an explicit NEXT_PUBLIC_ID_ORIGIN; otherwise derives id.<domain>.
const ID_ORIGIN =
  process.env.NEXT_PUBLIC_ID_ORIGIN ||
  `https://id.${process.env.NEXT_PUBLIC_DOMAIN || "cybericebox.com"}`

// Apex landing page. Static-export safe, all-client.
export default function LandingPage() {
  return (
    <main className="relative mx-auto flex min-h-[80vh] max-w-5xl flex-col items-center justify-center px-4 py-20">
      <div className="frost-particles" />
      <section className="frost-panel facet frost-in relative z-10 w-full max-w-3xl rounded-lg p-10 text-center">
        <div className="mb-6 flex justify-center">
          <Wordmark size="lg" />
        </div>
        <h1 className="glow text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
          {t("landing.headline")}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          {t("landing.subhead")}
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Button asChild className="facet glow">
            <a href={ID_ORIGIN}>{t("landing.signInCta")}</a>
          </Button>
          <Button asChild variant="outline">
            <a href={`${ID_ORIGIN}/sign-in`}>{t("common.signIn")}</a>
          </Button>
        </div>
      </section>

      <section className="relative z-10 mt-12 grid w-full max-w-3xl gap-4 md:grid-cols-3">
        <FeatureTile
          kicker="ICE"
          title={t("landing.feature1.title")}
          body={t("landing.feature1.body")}
        />
        <FeatureTile
          kicker="CYBER"
          title={t("landing.feature2.title")}
          body={t("landing.feature2.body")}
        />
        <FeatureTile
          kicker="BOX"
          title={t("landing.feature3.title")}
          body={t("landing.feature3.body")}
        />
      </section>
    </main>
  )
}

function FeatureTile({
  kicker,
  title,
  body,
}: {
  kicker: string
  title: string
  body: string
}) {
  return (
    <div className="frost-panel rounded-lg p-5 text-left">
      <span className="font-mono text-xs uppercase tracking-[0.18em] text-primary">
        {kicker}
      </span>
      <h3 className="mt-2 font-medium text-foreground">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
    </div>
  )
}
