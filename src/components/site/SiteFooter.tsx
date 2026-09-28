import { Footer } from "@/components/ib/Footer"
import { t } from "@/i18n/t"
import { SOURCE_URL, CONTACT_EMAIL } from "@/lib/links"
import { landingLinks } from "./sections"

export function SiteFooter({ home }: { home: boolean }) {
  const [labs, faq] = landingLinks(home ? "" : "/")
  return (
    <Footer
      links={[
        labs,
        faq,
        { href: SOURCE_URL, label: t("landing.footer.github"), external: true },
        { href: "/privacy", label: t("landing.footer.privacy") },
        { href: "/terms", label: t("landing.footer.terms") },
        { href: `mailto:${CONTACT_EMAIL}`, label: CONTACT_EMAIL },
      ]}
    />
  )
}
