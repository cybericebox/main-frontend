import * as React from "react"
import { has, richText, t, tRich } from "@/i18n/t"
import { PRIVACY_EMAIL, SECURITY_EMAIL } from "@/lib/links"
import "@/styles/ds/components/toc.css"
import "@/styles/legal.css"

export type LegalDoc = "privacy" | "terms" | "cookies" | "security"

const COLUMNS = ["name", "purpose", "provider", "duration", "category"] as const

// Inside any paragraph or item: {privacyEmail} / {securityEmail} become mailto links, and
// [text](/path) a link to another legal page (the text carries the grammatical case).
const EMAILS: Record<string, React.ReactNode> = {
  privacyEmail: <a href={`mailto:${PRIVACY_EMAIL}`}>{PRIVACY_EMAIL}</a>,
  securityEmail: <a href={`mailto:${SECURITY_EMAIL}`}>{SECURITY_EMAIL}</a>,
}
const DOC_LINK = /\[([^\]]+)\]\((\/[a-z]+)\)/g

function rich(key: string): React.ReactNode[] {
  const vars: Record<string, React.ReactNode> = { ...EMAILS }
  let n = 0
  const text = t(key).replace(DOC_LINK, (_m, label: string, href: string) => {
    vars[`doc${n}`] = <a href={href}>{label}</a>
    return `{doc${n++}}`
  })
  return richText(text, vars)
}

// 1, 2, 3 … while the key exists.
function count(prefix: (i: number) => string): number[] {
  const out: number[] = []
  for (let i = 1; has(prefix(i)); i++) out.push(i)
  return out
}

// A section of legal.<doc>.sN: heading, then any of body (paragraph), items.M (numbered
// sub-points N.M, anchor #sN-M), rows.M.<column> (cookie table), after (closing paragraph).
function Section({ doc, n }: { doc: LegalDoc; n: number }) {
  const k = `legal.${doc}.s${n}`
  const items = count((i) => `${k}.items.${i}`)
  const rows = count((i) => `${k}.rows.${i}.name`)
  return (
    <section id={`s${n}`} className="lg-doc__sec" aria-labelledby={`s${n}-h`}>
      <h2 id={`s${n}-h`}>
        <span className="ib-num">{n}.</span>
        {t(`${k}.heading`)}
      </h2>
      {has(`${k}.body`) && <p>{rich(`${k}.body`)}</p>}
      {items.length > 0 && (
        <ol className="lg-doc__items">
          {items.map((i) => (
            <li key={i} id={`s${n}-${i}`}>
              <span className="ib-num">
                {n}.{i}.
              </span>
              <span>{rich(`${k}.items.${i}`)}</span>
            </li>
          ))}
        </ol>
      )}
      {rows.length > 0 && (
        <div className="lg-doc__table" role="region" aria-labelledby={`s${n}-h`} tabIndex={0}>
          <table>
            <thead>
              <tr>
                {COLUMNS.map((c) => (
                  <th key={c} scope="col">
                    {t(`legal.cookies.col.${c}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r}>
                  {COLUMNS.map((c) =>
                    c === "name" ? (
                      <th key={c} scope="row">
                        <code>{t(`${k}.rows.${r}.${c}`)}</code>
                      </th>
                    ) : (
                      <td key={c} data-label={t(`legal.cookies.col.${c}`)}>
                        {t(`${k}.rows.${r}.${c}`)}
                      </td>
                    ),
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {has(`${k}.after`) && <p>{rich(`${k}.after`)}</p>}
    </section>
  )
}

// Legal document (Terms, Privacy, Cookies) from legal.<doc>.* keys: title, «Останнє оновлення»,
// intro, numbered sections with anchor ids; from 1024 px a sticky section list on the left.
// Navbar/Footer come from the (legal) route-group layout.
export function LegalPage({ doc }: { doc: LegalDoc }) {
  const sections = count((i) => `legal.${doc}.s${i}.heading`)
  return (
    <article className="lg-doc">
      <div className="lg-doc__grid">
        <nav className="ib-toc" aria-label={t("legal.toc")}>
          <p className="ib-toc__title">{t("legal.toc")}</p>
          <ol className="ib-toc__list">
            {sections.map((n) => (
              <li key={n}>
                <a className="ib-toc__link" href={`#s${n}`}>
                  {n}. {t(`legal.${doc}.s${n}.heading`)}
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <div className="lg-doc__body">
          <h1>{t(`legal.${doc}.title`)}</h1>
          <p className="lg-doc__updated">{t("legal.updated", { date: t(`legal.${doc}.updated`) })}</p>
          {has(`legal.${doc}.intro`) && <p className="lg-doc__intro">{rich(`legal.${doc}.intro`)}</p>}
          {sections.map((n) => (
            <Section key={n} doc={doc} n={n} />
          ))}
          {/* /security already names its own mailbox in the text; the privacy@ line would misdirect reports */}
          {doc !== "security" && (
            <p className="lg-doc__contact">
              {tRich("legal.questions", { email: <a href={`mailto:${PRIVACY_EMAIL}`}>{PRIVACY_EMAIL}</a> })}
            </p>
          )}
        </div>
      </div>
    </article>
  )
}
