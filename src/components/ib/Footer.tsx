import type { ReactNode } from "react"
import { ExternalLink, Mail } from "lucide-react"
import { ThemeSwitch } from "./ThemeSwitch"
import { Tooltip } from "./Tooltip"
import type { NavLink } from "./Navbar"
import { t, tSegments } from "@/i18n/t"
import "@/styles/ds/components/footer.css"

// ds-v2 platform footer on the brand mass (both themes) over a faint ice-cube lattice:
// «За підтримки кафедри …, ХНУРЕ» + «Написати нам» / GitHub, then a bar with
// «© year Cyber ICE Box», the legal links and the theme switch.
const YEAR = new Date().getFullYear()

// `extra` ends the legal list (e.g. «Налаштування файлів cookie», which opens the consent panel).
export function Footer({ email, sourceUrl, legal, extra }: { email: string; sourceUrl: string; legal: NavLink[]; extra?: ReactNode }) {
  return (
    <footer className="ib-footer ib-footer--mass ib-mass">
      <div className="ib-footer__inner">
        <div className="ib-footer__top">
          <p className="ib-footer__credit">
            {tSegments(
              "landing.footer.credit",
              {
                department: (
                  <Tooltip content={t("landing.footer.departmentFull")}>
                    {(tipId) => (
                      <a href="https://ice.nure.ua/ua/" target="_blank" rel="noopener noreferrer" aria-describedby={tipId}>
                        {t("landing.footer.supportLink")}
                      </a>
                    )}
                  </Tooltip>
                ),
                nure: (
                  <Tooltip content={t("landing.footer.nureFull")}>
                    {(tipId) => (
                      <a href="https://nure.ua" target="_blank" rel="noopener noreferrer" aria-describedby={tipId}>
                        {t("landing.footer.nure")}
                      </a>
                    )}
                  </Tooltip>
                ),
              },
              { sep: ", " }
            )}
          </p>
          <ul className="ib-footer__links" aria-label={t("landing.footer.nav")}>
            <li>
              <Tooltip content={email}>
                {(tipId) => (
                  <a href={`mailto:${email}`} aria-describedby={tipId}>
                    <Mail aria-hidden />
                    {t("landing.footer.write")}
                  </a>
                )}
              </Tooltip>
            </li>
            <li>
              <a href={sourceUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink aria-hidden />
                {t("landing.footer.github")}
              </a>
            </li>
          </ul>
        </div>
        <div className="ib-footer__bar">
          <div className="ib-footer__legal">
            <p className="ib-footer__copy">{t("landing.footer.copyright", { year: YEAR })}</p>
            <ul className="ib-footer__links">
              {legal.map((l) => (
                <li key={l.href}>
                  <a href={l.href}>{l.label}</a>
                </li>
              ))}
              {extra && <li>{extra}</li>}
            </ul>
          </div>
          <ThemeSwitch />
        </div>
      </div>
    </footer>
  )
}
