import Image from "next/image"
import { Button } from "@/components/ib/Button"
import { Wordmark } from "@/components/ib/Wordmark"
import { t } from "@/i18n/t"

// Minimal 404 (static export renders this as 404.html): crest, short text, home link.
export default function NotFound() {
  return (
    <main className="site-404">
      <div className="site-404__box">
        <Image src="/assets/crest-128.webp" alt="" width={64} height={64} priority />
        <Wordmark className="site-404__brand" />
        <p className="site-404__code">404</p>
        <h1>{t("error.notFound")}</h1>
        <p>{t("error.notFoundDescription")}</p>
        <Button variant="primary" href="/">
          {t("error.goHome")}
        </Button>
      </div>
    </main>
  )
}
