import { ThemeSwitch } from "./ThemeSwitch"
import type { NavLink } from "./Navbar"
import { t, tRich } from "@/i18n/t"
import "@/styles/ds/components/footer.css"

// ds-v2 platform footer without the brand (the sticky navbar carries it): links (incl. a mailto),
// then «© year Cyber ICE Box · ХНУРЕ · За підтримки …» and the theme switch.
const YEAR = new Date().getFullYear()

export function Footer({ links }: { links: (NavLink & { external?: boolean })[] }) {
  return (
    <footer className="ib-footer">
      <div className="ib-footer__inner">
        <div className="ib-footer__row">
          <nav className="ib-footer__links" aria-label={t("landing.footer.nav")}>
            {links.map((l) =>
              l.external ? (
                <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer">
                  {l.label}
                </a>
              ) : (
                <a key={l.href} href={l.href}>
                  {l.label}
                </a>
              )
            )}
          </nav>
        </div>
        <div className="ib-footer__row">
          <span>
            <span className="ib-footer__legal">{t("landing.footer.copyright", { year: YEAR })}</span>
            {" · "}
            <span className="ib-footer__support">
              {tRich("landing.footer.support", {
                link: (
                  <a href="https://ice.nure.ua/ua/" target="_blank" rel="noopener noreferrer">
                    {t("landing.footer.supportLink")}
                  </a>
                ),
              })}
            </span>
          </span>
          <ThemeSwitch />
        </div>
      </div>
    </footer>
  )
}
