import { t, tRich } from "@/i18n/t"
import { Accordion } from "@/components/ib/Accordion"

// Questions of an organizer first, then of a participant. Every answer is running text with one phrase set in
// ink: landing.faq.aN holds the text with {hl}, landing.faq.aNhl the phrase.
export const FAQ_COUNT = 10

const ITEMS = Array.from({ length: FAQ_COUNT }, (_, n) => n + 1).map((i) => ({
  q: t(`landing.faq.q${i}`),
  a: tRich(`landing.faq.a${i}`, { hl: <b key="hl">{t(`landing.faq.a${i}hl`)}</b> }),
}))

export function Faq() {
  return (
    <section className="pl-sec" id="faq" aria-labelledby="faq-h">
      <div className="pl-wrap pl-faq">
        <h2 id="faq-h">{t("landing.faq.title")}</h2>
        <Accordion items={ITEMS} size="lg" defaultOpen={0} name="faq" />
      </div>
    </section>
  )
}
