import { Flag, FlaskConical, Users } from "lucide-react"
import FeatureCard from "./FeatureCard"
import { t } from "@/i18n/t"

export default function Features() {
  return (
    <section id="features" className="mx-auto max-w-5xl scroll-mt-20 px-4 py-16">
      <p className="text-center font-mono text-xs uppercase tracking-[0.18em] text-[var(--accent-warm)]">
        {t("landing.features.kicker")}
      </p>
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        <FeatureCard icon={Flag} title={t("landing.features.events.title")} body={t("landing.features.events.body")} />
        <FeatureCard icon={FlaskConical} title={t("landing.features.labs.title")} body={t("landing.features.labs.body")} />
        <FeatureCard icon={Users} title={t("landing.features.teams.title")} body={t("landing.features.teams.body")} />
      </div>
    </section>
  )
}
