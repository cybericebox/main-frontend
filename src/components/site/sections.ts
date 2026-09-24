import { t } from "@/i18n/t"
import type { NavLink } from "@/components/ib/Navbar"

// Landing anchors. `base` is "" on the landing itself and "/" elsewhere (legal
// pages), so the same links jump within the page or navigate home first.
export function landingLinks(base: "" | "/"): NavLink[] {
  return [
    { href: `${base}#labs`, label: t("landing.nav.labs") },
    { href: `${base}#faq`, label: t("landing.nav.faq") },
  ]
}
