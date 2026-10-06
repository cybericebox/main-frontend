"use client"

import { t } from "@/i18n/t"
import { interceptSettingsLink } from "@/lib/consent"
import "@/styles/consent.css"

// «Налаштування файлів cookie» in the footer, always shown: a link to the cookie policy that,
// with JS, opens the consent preferences panel instead (see lib/consent).
export function CookieSettingsLink({ href = "/cookies/" }: { href?: string }) {
  return (
    <a href={href} className="cb-consent-link" onClick={interceptSettingsLink}>
      {t("consent.settings")}
    </a>
  )
}
