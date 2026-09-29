import { t } from "@/i18n/t"
import { LegalPage } from "./LegalPage"

// Terms of Use — linkable standalone page for CyberICEBox. Text: legal.terms.* in messages.
const SECTIONS = [1, 2, 3, 4, 5, 6].map((i) => ({ heading: t(`legal.terms.s${i}.heading`), body: t(`legal.terms.s${i}.body`) }))

export function TermsScreen() {
  return <LegalPage title={t("legal.terms.title")} updated={t("legal.terms.updated")} intro={t("legal.terms.intro")} sections={SECTIONS} />
}
