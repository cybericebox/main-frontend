import * as React from "react"
import { t } from "@/i18n/t"
import { nbsp } from "@/i18n/typo"
import { SUPPORT_EMAIL } from "@/lib/links"
import "@/styles/ds/components/toc.css"
import "@/styles/legal.css"

export type LegalSection = { heading: string; body: React.ReactNode }


// Legal document (Terms, Privacy): title, «Останнє оновлення», intro, numbered
// sections with anchor ids; from 1024 px a sticky section list on the left.
// Navbar/Footer come from the (legal) route-group layout.
export function LegalPage({
  title,
  updated,
  intro,
  sections,
}: {
  title: string
  updated: string
  intro?: string
  sections: LegalSection[]
}) {
  return (
    <article className="lg-doc">
      <div className="lg-doc__grid">
        <nav className="ib-toc" aria-label={t("legal.toc")}>
          <p className="ib-toc__title">{t("legal.toc")}</p>
          <ol className="ib-toc__list">
            {sections.map((s, i) => (
              <li key={s.heading}>
                <a className="ib-toc__link" href={`#s${i + 1}`}>
                  {i + 1}. {nbsp(s.heading)}
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <div className="lg-doc__body">
          <h1>{nbsp(title)}</h1>
          <p className="lg-doc__updated">
            {t("legal.updated")}: {updated}
          </p>
          {intro && <p className="lg-doc__intro">{nbsp(intro)}</p>}
          {sections.map((s, i) => (
            <section key={s.heading} id={`s${i + 1}`} className="lg-doc__sec" aria-labelledby={`s${i + 1}-h`}>
              <h2 id={`s${i + 1}-h`}>
                <span className="ib-num">{i + 1}.</span>
                {nbsp(s.heading)}
              </h2>
              <div>{typeof s.body === "string" ? nbsp(s.body) : s.body}</div>
            </section>
          ))}
          <p className="lg-doc__contact">
            {t("legal.questions")} <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
          </p>
        </div>
      </div>
    </article>
  )
}
