"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { t } from "@/i18n/t"

// Resolve the id-frontend origin for the "Sign in" CTA.
// Prefers an explicit NEXT_PUBLIC_ID_ORIGIN; otherwise derives id.<domain>.
const ID_ORIGIN =
  process.env.NEXT_PUBLIC_ID_ORIGIN ||
  `https://id.${process.env.NEXT_PUBLIC_DOMAIN || "cybericebox.com"}`

// Apex landing page. Static-export safe, all-client.
export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-6">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          {t("landing.headline")}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          {t("landing.subhead")}
        </p>
        <div className="mt-8">
          <Button asChild size="lg">
            <a href={ID_ORIGIN}>{t("landing.signInCta")}</a>
          </Button>
        </div>
      </div>

      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>{t("landing.featuresTitle")}</CardTitle>
          <CardDescription>{t("landing.title")}</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
            <li>{t("landing.feature1")}</li>
            <li>{t("landing.feature2")}</li>
            <li>{t("landing.feature3")}</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
