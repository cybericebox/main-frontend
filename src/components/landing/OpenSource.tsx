import { Github, FileText, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { t } from "@/i18n/t"
import { SOURCE_URL, LICENSE_URL, DOCS_URL } from "@/lib/links"

export default function OpenSource() {
  return (
    <section id="open-source" className="mx-auto max-w-5xl scroll-mt-20 px-4 py-16 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--accent-warm)]">
        {t("landing.openSource.kicker")}
      </p>
      <h2 className="mt-3 text-2xl font-bold text-foreground md:text-3xl">{t("landing.openSource.title")}</h2>
      <p className="mx-auto mt-3 max-w-xl text-muted-foreground">{t("landing.openSource.body")}</p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button asChild variant="outline">
          <a href={SOURCE_URL} target="_blank" rel="noopener noreferrer">
            <Github className="mr-1.5 h-4 w-4" />
            {t("landing.openSource.github")}
          </a>
        </Button>
        <Button asChild variant="outline">
          <a href={LICENSE_URL} target="_blank" rel="noopener noreferrer">
            <FileText className="mr-1.5 h-4 w-4" />
            {t("landing.openSource.license")}
          </a>
        </Button>
        <Button asChild variant="outline">
          <a href={DOCS_URL} target="_blank" rel="noopener noreferrer">
            <BookOpen className="mr-1.5 h-4 w-4" />
            {t("landing.openSource.docs")}
          </a>
        </Button>
      </div>
    </section>
  )
}
