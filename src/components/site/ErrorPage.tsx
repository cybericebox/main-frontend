"use client"

import Image from "next/image"
import type { ReactNode } from "react"
import { Button } from "@/components/ib/Button"
import { Wordmark } from "@/components/ib/Wordmark"
import { FeedbackLink } from "@/components/FeedbackLink"
import { t } from "@/i18n/t"
import "@/styles/ds/components/error-page.css"
import "@/styles/ds/components/link.css"

// Browser history back; a tab opened straight on the failing page goes home instead.
export function goBack() {
  if (window.history.length > 1) window.history.back()
  // a full load leaves the failed render state behind
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination
  else window.location.assign("/")
}

// Error code carried by an API error: the numeric Status.Code first, then the HTTP status.
export function errorCode(error: unknown): number | undefined {
  if (!error || typeof error !== "object") return undefined
  const { code, status } = error as { code?: unknown; status?: unknown }
  if (typeof code === "number") return code
  return typeof status === "number" && status > 0 ? status : undefined
}

// DS error page (patterns/error-page): one column for every status. `page` = the shell could not render
// (centred in the viewport + thin footer); `block` = only the content failed (column, no footer, no crest).
export function ErrorPage({ status, title, body, actions, code, mode = "page" }: {
  status: number
  title: ReactNode
  body: string
  actions: ReactNode
  code?: number
  mode?: "page" | "block"
}) {
  const Heading = mode === "page" ? "h1" : "h2"
  const column = (
    <>
      <p className="ib-error__code" aria-hidden="true">{status}</p>
      <Heading className="ib-error__title">{title}</Heading>
      <p className="ib-error__text">{body}</p>
      <div className="ib-error__actions">{actions}</div>
      {code !== undefined && <p className="ib-error__ref">{t("error.load.code", { code })}</p>}
    </>
  )
  if (mode === "block") {
    return (
      <div className="ib-error ib-error--block ib-error--fill" role="alert">
        <div className="ib-error__main">{column}</div>
      </div>
    )
  }
  return (
    <div className="ib-error ib-error--page">
      <main id="main" tabIndex={-1} className="ib-error__main">{column}</main>
      <footer className="ib-error__footer">
        {/* plain anchors: a full load drops the failed render state, and global-error has no router */}
        {/* eslint-disable @next/next/no-html-link-for-pages */}
        <a className="ib-error__brand" href="/">
          <Image src="/assets/crest-64.webp" alt="" width={18} height={18} />
          <Wordmark />
        </a>
        <nav className="ib-error__links" aria-label={t("error.page.links")}>
          <a href="/">{t("error.goHome")}</a>
          <FeedbackLink />
          {/* eslint-enable @next/next/no-html-link-for-pages */}
        </nav>
      </footer>
    </div>
  )
}

export function NotFoundPage({ mode }: { mode?: "page" | "block" }) {
  return (
    <ErrorPage
      status={404}
      mode={mode}
      title={t("error.notFound")}
      body={t("error.notFoundDescription")}
      actions={
        <>
          <Button variant="primary" href="/">{t("error.goHome")}</Button>
          <a className="ib-link" href="#back" onClick={(e) => { e.preventDefault(); goBack() }}>{t("error.page.back")}</a>
        </>
      }
    />
  )
}

export function ServerErrorPage({ onRetry, error, mode }: { onRetry: () => void; error?: unknown; mode?: "page" | "block" }) {
  return (
    <ErrorPage
      status={500}
      mode={mode}
      code={errorCode(error)}
      title={t("error.page.title")}
      body={t("error.page.body")}
      actions={
        <>
          <Button variant="primary" onClick={onRetry}>{t("error.page.reload")}</Button>
          <a className="ib-link" href="#back" onClick={(e) => { e.preventDefault(); goBack() }}>{t("error.page.back")}</a>
        </>
      }
    />
  )
}
