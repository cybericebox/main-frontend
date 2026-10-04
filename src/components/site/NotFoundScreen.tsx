"use client"

import Image from "next/image"
import { Button } from "@/components/ib/Button"
import { Icon } from "@/components/ib/Icon"
import { Wordmark } from "@/components/ib/Wordmark"
import { goBack } from "@/components/site/ErrorScreen"
import { t } from "@/i18n/t"

// «Page not found», the one screen of every frontend: crest + wordmark, muted SearchX mark,
// title, one line, «На головну» and «Назад». app/not-found.tsx renders it as a page (static
// export: 404.html); an in-page «item not found» state passes a context `title` and `block`.
export function NotFoundScreen({ title = t("error.notFound"), body = t("error.notFoundDescription"), block = false }: { title?: string; body?: string; block?: boolean }) {
  return (
    <main className={"site-404" + (block ? " site-404--block" : "")}>
      <div className="site-404__box">
        <Image src="/assets/crest-128.webp" alt="" width={64} height={64} priority />
        <Wordmark className="site-404__brand" />
        <Icon name="search-x" className="site-error__mark site-error__mark--muted" />
        <h1>{title}</h1>
        <p>{body}</p>
        <div className="site-error__actions">
          <Button variant="primary" href="/">
            {t("error.goHome")}
          </Button>
          <Button onClick={goBack}>{t("error.page.back")}</Button>
        </div>
      </div>
    </main>
  )
}
