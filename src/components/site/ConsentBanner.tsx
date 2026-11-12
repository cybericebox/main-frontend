"use client"

import { useEffect, useRef, useState, useSyncExternalStore, type KeyboardEvent } from "react"
import { Button } from "@/components/ib/Button"
import { t, tRich } from "@/i18n/t"
import {
  ACCEPT_ALL,
  NECESSARY_ONLY,
  CONSENT_CHANGE_EVENT,
  CONSENT_OPEN_EVENT,
  POLICY_LINK_ATTRS,
  readConsent,
  saveConsent,
  shouldShowBanner,
  type ConsentPrefs,
} from "@/lib/consent"
import "@/styles/consent.css"

function subscribe(onChange: () => void) {
  window.addEventListener(CONSENT_CHANGE_EVENT, onChange)
  return () => window.removeEventListener(CONSENT_CHANGE_EVENT, onChange)
}
// A primitive snapshot: "none" = no choice yet; "ssr" = server render, cookie unknown (render nothing).
const snapshot = () => {
  const prefs = readConsent()
  return prefs ? `${prefs.analytics ? "a" : "-"}${prefs.functional ? "f" : "-"}` : "none"
}
const serverSnapshot = () => "ssr"

// Cookie consent in two layers, fixed to the bottom, non-blocking.
// 1. Banner: a general line with the policy link and «Налаштувати» (opens the panel), then two equal buttons:
//    «Лише необхідні» and «Прийняти всі» (refusing takes one step, like accepting).
// 2. Panel: categories (Необхідні — always on; Функціональні and Аналітика — off by default; Аналітика only when GA is configured),
//    «Зберегти вибір» and «Прийняти всі».
// Shown when no choice exists; «Налаштування файлів cookie» opens the panel.
// Esc never counts as consent: it steps back from the panel, or closes a panel opened from settings.
export function ConsentBanner({ gaId, policyHref }: { gaId?: string; policyHref: string }) {
  const stored = useSyncExternalStore(subscribe, snapshot, serverSnapshot)
  // null = follow the stored choice; "panel" = preferences open.
  const [layer, setLayer] = useState<"banner" | "panel" | null>(null)
  const [analytics, setAnalytics] = useState(false)
  const [functional, setFunctional] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const returnToRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const onOpen = () => {
      returnToRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
      setAnalytics(readConsent()?.analytics ?? false)
      setFunctional(readConsent()?.functional ?? false)
      setLayer("panel")
    }
    window.addEventListener(CONSENT_OPEN_EVENT, onOpen)
    return () => window.removeEventListener(CONSENT_OPEN_EVENT, onOpen)
  }, [])

  // The panel was opened on request: move focus into it. Shown on load: leave focus where it is.
  useEffect(() => {
    // stepping from the panel back to the banner keeps focus inside the consent UI
    if (layer === "panel" || layer === "banner") rootRef.current?.focus()
  }, [layer])

  const close = () => {
    setLayer(null)
    returnToRef.current?.focus()
    returnToRef.current = null
  }
  const choose = (prefs: ConsentPrefs) => {
    saveConsent(prefs)
    close()
  }

  // New tab; the click must not reach any outer handler, so the banner/panel and its toggles stay.
  const policyLink = (
    <a href={policyHref} {...POLICY_LINK_ATTRS} aria-label={t("consent.policyLinkNewTab")} onClick={(e) => e.stopPropagation()}>
      {t("consent.policyLink")}
    </a>
  )

  // phones: one short line; the policy link is its first words
  const policyLinkShort = (
    <a href={policyHref} {...POLICY_LINK_ATTRS} aria-label={t("consent.policyLinkShortNewTab")} onClick={(e) => e.stopPropagation()}>
      {t("consent.policyLinkShort")}
    </a>
  )

  if (stored === "ssr") return null
  const asking = shouldShowBanner(stored === "none" ? null : { analytics: stored[0] === "a", functional: stored[1] === "f" })
  const shown = layer ?? (asking ? "banner" : null)
  if (!shown) return null

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key !== "Escape" || shown !== "panel") return
    if (asking) setLayer("banner")
    else close()
  }

  if (shown === "banner") {
    return (
      <div ref={rootRef} className="cb-consent" role="dialog" aria-modal="false" aria-label={t("consent.label")} aria-live="polite" tabIndex={-1}>
        <p className="cb-consent__text">
          <span className="cb-consent__full">{tRich("consent.text", { link: policyLink })}</span>
          <span className="cb-consent__short">{tRich("consent.textShort", { link: policyLinkShort })}</span>
          <span className="cb-consent__sep" aria-hidden="true">·</span>
          <button type="button" className="cb-consent__more" onClick={() => setLayer("panel")}>
            {t("consent.customize")}
          </button>
        </p>
        <div className="cb-consent__actions">
          <Button variant="primary" onClick={() => choose(NECESSARY_ONLY)}>{t("consent.necessaryOnly")}</Button>
          <Button variant="primary" onClick={() => choose(ACCEPT_ALL)}>{t("consent.acceptAll")}</Button>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={rootRef}
      className="cb-consent cb-consent--panel"
      role="dialog"
      aria-modal="false"
      aria-labelledby="cb-consent-title"
      tabIndex={-1}
      onKeyDown={onKeyDown}
    >
      <h2 id="cb-consent-title" className="cb-consent__title">{t("consent.panelTitle")}</h2>
      <ul className="cb-consent__cats">
        <li>
          <label className="cb-consent__cat">
            <span>
              <span className="cb-consent__name">{t("consent.necessary.title")}</span>
              <span className="cb-consent__desc">{t("consent.necessary.text")}</span>
            </span>
            <input type="checkbox" role="switch" className="cb-switch" checked disabled aria-label={t("consent.necessary.switch")} />
          </label>
        </li>
        <li>
          <label className="cb-consent__cat">
            <span>
              <span className="cb-consent__name">{t("consent.functional.title")}</span>
              <span className="cb-consent__desc">{t("consent.functional.text")}</span>
            </span>
            <input type="checkbox" role="switch" className="cb-switch" checked={functional} onChange={(e) => setFunctional(e.target.checked)} />
          </label>
        </li>
        {gaId && (
          <li>
            <label className="cb-consent__cat">
              <span>
                <span className="cb-consent__name">{t("consent.analytics.title")}</span>
                <span className="cb-consent__desc">{t("consent.analytics.text")}</span>
              </span>
              <input type="checkbox" role="switch" className="cb-switch" checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} />
            </label>
          </li>
        )}
      </ul>
      <p className="cb-consent__policy">{tRich("consent.policy", { link: policyLink })}</p>
      <div className="cb-consent__actions cb-consent__actions--panel">
        <Button size="sm" onClick={() => choose({ analytics: Boolean(gaId) && analytics, functional })}>{t("consent.saveChoice")}</Button>
        <Button size="sm" variant="primary" onClick={() => choose(ACCEPT_ALL)}>{t("consent.acceptAll")}</Button>
      </div>
    </div>
  )
}
