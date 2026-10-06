import { Footer } from "@/components/ib/Footer"
import { t } from "@/i18n/t"
import { SOURCE_URL, CONTACT_EMAIL } from "@/lib/links"
import { FeedbackLink } from "@/components/FeedbackLink"
import { CookieSettingsLink } from "./CookieSettingsLink"

// Landing and legal pages share it; the cookie policy is linked from inside the consent panel.
export function SiteFooter() {
  return (
    <Footer
      email={CONTACT_EMAIL}
      sourceUrl={SOURCE_URL}
      legal={[
        { href: "/privacy/", label: t("landing.footer.privacy") },
        { href: "/terms/", label: t("landing.footer.terms") },
        { href: "/security/", label: t("landing.footer.security") },
      ]}
      extra={[<CookieSettingsLink key="cookies" />, <FeedbackLink key="feedback" />]}
    />
  )
}
