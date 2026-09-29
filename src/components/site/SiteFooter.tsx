import { Footer } from "@/components/ib/Footer"
import { t } from "@/i18n/t"
import { SOURCE_URL, CONTACT_EMAIL } from "@/lib/links"
import { landingLinks } from "./sections"
import { CookieSettingsButton } from "./CookieSettingsButton"

export function SiteFooter({ home }: { home: boolean }) {
  const [labs, faq] = landingLinks(home ? "" : "/")
  return (
    <Footer
      groups={[
        {
          area: "platform",
          title: t("landing.footer.platform"),
          links: [labs, faq, { href: SOURCE_URL, label: t("landing.footer.github"), external: true }],
        },
        {
          area: "docs",
          title: t("landing.footer.docs"),
          links: [
            { href: "/privacy", label: t("landing.footer.privacy") },
            { href: "/terms", label: t("landing.footer.terms") },
            { href: "/cookies", label: t("landing.footer.cookies") },
          ],
          extra: process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID ? <CookieSettingsButton /> : undefined,
        },
        {
          area: "contacts",
          title: t("landing.footer.contacts"),
          links: [{ href: `mailto:${CONTACT_EMAIL}`, label: CONTACT_EMAIL }],
        },
      ]}
    />
  )
}
