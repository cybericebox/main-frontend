import { t } from "@/i18n/t"
import { Topology } from "@/components/ib/Topology"

const FEATURES = [1, 2, 3, 4] as const

// «Лабораторії»: text + feature list beside the lab topology diagram.
export function Labs() {
  return (
    <section className="pl-sec" id="labs" aria-labelledby="labs-h">
      <div className="pl-wrap pl-labs">
        <div>
          <h2 id="labs-h">{t("landing.labs.title")}</h2>
          <p className="pl-lead">{t("landing.labs.body")}</p>
          <dl className="pl-feat">
            {FEATURES.map((i) => (
              <div key={i}>
                <dt>{t(`landing.labs.f${i}k`)}</dt>
                <dd>{t(`landing.labs.f${i}v`)}</dd>
              </div>
            ))}
          </dl>
        </div>
        <Topology />
      </div>
    </section>
  )
}
