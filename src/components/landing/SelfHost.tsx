import { t } from "@/i18n/t"

export default function SelfHost() {
  return (
    <section id="self-host" className="scroll-mt-20 bg-[#0B1521] py-16">
      <div className="mx-auto grid max-w-5xl items-center gap-8 px-4 md:grid-cols-2">
        <div>
          <h2 className="text-2xl font-bold text-foreground md:text-3xl">{t("landing.selfHost.title")}</h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">{t("landing.selfHost.body")}</p>
        </div>
        <div className="frost-panel rounded-lg p-5 font-mono text-sm">
          <p className="text-[#7fd3a0]">$ docker compose up -d</p>
          <p className="mt-1 text-muted-foreground"># {t("landing.selfHost.snippetCaption")}</p>
        </div>
      </div>
    </section>
  )
}
