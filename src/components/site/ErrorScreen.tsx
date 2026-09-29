"use client"

import Image from "next/image"
import { Button } from "@/components/ib/Button"
import { Icon } from "@/components/ib/Icon"
import { Wordmark } from "@/components/ib/Wordmark"
import { t } from "@/i18n/t"

// Browser history back; a tab opened straight on the failing page goes home instead.
export function goBack() {
  if (window.history.length > 1) window.history.back()
  // a full load leaves the failed render state behind
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination
  else window.location.assign("/")
}

// Error boundary screen (app/error.tsx, app/global-error.tsx): the 404 layout with a
// warning mark, «Оновити» (retry the segment) and «Назад». Never shows error details.
export function ErrorScreen({ onRetry }: { onRetry: () => void }) {
  return (
    <main className="site-404 site-error">
      <div className="site-404__box" role="alert">
        <Image src="/assets/crest-128.webp" alt="" width={64} height={64} priority />
        <Wordmark className="site-404__brand" />
        <Icon name="warn" className="site-error__mark" />
        <h1>{t("error.page.title")}</h1>
        <p>{t("error.page.body")}</p>
        <div className="site-error__actions">
          <Button variant="primary" onClick={onRetry}>
            {t("error.page.reload")}
          </Button>
          <Button onClick={goBack}>{t("error.page.back")}</Button>
        </div>
      </div>
    </main>
  )
}
