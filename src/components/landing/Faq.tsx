import { t } from "@/i18n/t"
import { Accordion } from "@/components/ib/Accordion"

const ITEMS = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => ({ q: t(`landing.faq.q${i}`), a: t(`landing.faq.a${i}`) }))

export function Faq() {
  return (
    <section className="pl-sec" id="faq" aria-labelledby="faq-h">
      <div className="pl-wrap pl-faq">
        <h2 id="faq-h">{t("landing.faq.title")}</h2>
        <Accordion items={ITEMS} size="lg" />
      </div>
    </section>
  )
}
