import type { ReactNode } from "react"
import { ThemeSwitch } from "./ThemeSwitch"
import type { NavLink } from "./Navbar"
import { t, tRich } from "@/i18n/t"
import "@/styles/ds/components/footer.css"

// ds-v2 platform footer without the brand (the sticky navbar carries it): labelled link columns,
// then a bar with «© year Cyber ICE Box · ХНУРЕ · За підтримки …» and the theme switch.
const YEAR = new Date().getFullYear()

export type FooterLink = NavLink & { external?: boolean }
// `area` names the grid slot (ds footer.css); `extra` ends the list (e.g. a button that reads as a link).
export type FooterGroup = { area: "platform" | "docs" | "contacts"; title: string; links: FooterLink[]; extra?: ReactNode }

export function Footer({ groups }: { groups: FooterGroup[] }) {
  return (
    <footer className="ib-footer">
      <div className="ib-footer__inner">
        <nav className="ib-footer__cols" aria-label={t("landing.footer.nav")}>
          {groups.map((g) => (
            <section key={g.area} className={`ib-footer__col ib-footer__col--${g.area}`}>
              <h2 className="ib-footer__title">{g.title}</h2>
              <ul className="ib-footer__links">
                {g.links.map((l) => (
                  <li key={l.href}>
                    {l.external ? (
                      <a href={l.href} target="_blank" rel="noopener noreferrer">
                        {l.label}
                      </a>
                    ) : (
                      <a href={l.href}>{l.label}</a>
                    )}
                  </li>
                ))}
                {g.extra && <li>{g.extra}</li>}
              </ul>
            </section>
          ))}
        </nav>
        <div className="ib-footer__bar">
          <p className="ib-footer__meta">
            <span className="ib-footer__legal">{t("landing.footer.copyright", { year: YEAR })}</span>
            <span className="ib-footer__sep" aria-hidden="true">
              ·
            </span>
            <span className="ib-footer__support">
              {tRich("landing.footer.support", {
                link: (
                  <a href="https://ice.nure.ua/ua/" target="_blank" rel="noopener noreferrer">
                    {t("landing.footer.supportLink")}
                  </a>
                ),
              })}
            </span>
          </p>
          <ThemeSwitch />
        </div>
      </div>
    </footer>
  )
}
