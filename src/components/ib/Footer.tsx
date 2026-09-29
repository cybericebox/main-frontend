import type { ReactNode } from "react"
import Image from "next/image"
import { ThemeSwitch } from "./ThemeSwitch"
import { Tooltip } from "./Tooltip"
import { Wordmark } from "./Wordmark"
import type { NavLink } from "./Navbar"
import { t, tSegments } from "@/i18n/t"
import "@/styles/ds/components/footer.css"

// ds-v2 platform footer: a brand block (crest + wordmark, tagline, contact email, support line)
// beside labelled link columns, then a bar with «© year Cyber ICE Box · ХНУРЕ» and the theme switch.
const YEAR = new Date().getFullYear()

export type FooterLink = NavLink & { external?: boolean }
// `extra` ends the list (e.g. a button that reads as a link).
export type FooterGroup = { title: string; links: FooterLink[]; extra?: ReactNode }

export function Footer({ brandHref, email, groups }: { brandHref: string; email: string; groups: FooterGroup[] }) {
  return (
    <footer className="ib-footer">
      <div className="ib-footer__inner">
        <div className="ib-footer__top">
          <div className="ib-footer__about">
            <a className="ib-footer__brand" href={brandHref} aria-label={t("landing.nav.home")}>
              <Image src="/assets/crest-64.webp" alt="" width={32} height={32} />
              <Wordmark />
            </a>
            <p className="ib-footer__tagline">{t("landing.hero.headline")}</p>
            <a className="ib-footer__email" href={`mailto:${email}`}>
              {email}
            </a>
            <p className="ib-footer__support">
              {tSegments("landing.footer.support", {
                link: (
                  <Tooltip content={t("landing.footer.departmentFull")} align="start">
                    {(tipId) => (
                      <a href="https://ice.nure.ua/ua/" target="_blank" rel="noopener noreferrer" aria-describedby={tipId}>
                        {t("landing.footer.supportLink")}
                      </a>
                    )}
                  </Tooltip>
                ),
              })}
            </p>
          </div>
          <nav className="ib-footer__cols" aria-label={t("landing.footer.nav")}>
            {groups.map((g) => (
              <section key={g.title} className="ib-footer__col">
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
        </div>
        <div className="ib-footer__bar">
          <p className="ib-footer__legal">
            {tSegments("landing.footer.copyright", {
              year: YEAR,
              nure: (
                <Tooltip content={t("landing.footer.nureFull")} align="start">
                  {(tipId) => (
                    <a href="https://nure.ua" target="_blank" rel="noopener noreferrer" aria-describedby={tipId}>
                      {t("landing.footer.nure")}
                    </a>
                  )}
                </Tooltip>
              ),
            })}
          </p>
          <ThemeSwitch />
        </div>
      </div>
    </footer>
  )
}
