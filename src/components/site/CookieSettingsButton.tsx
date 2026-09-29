"use client"

import { t } from "@/i18n/t"
import { openConsentSettings } from "@/lib/consent"
import "@/styles/consent.css"

// «Налаштування файлів cookie» in the footer: reopens the consent banner. Rendered only when GA is configured.
export function CookieSettingsButton() {
  return (
    <button type="button" className="cb-consent-link" onClick={openConsentSettings}>
      {t("consent.settings")}
    </button>
  )
}
