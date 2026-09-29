import { t } from "@/i18n/t"
import { LegalPage } from "./LegalPage"

// Privacy Policy — linkable standalone page for CyberICEBox. Text: legal.privacy.* in messages.
const SECTIONS = [1, 2, 3, 4, 5, 6, 7].map((i) => ({ heading: t(`legal.privacy.s${i}.heading`), body: t(`legal.privacy.s${i}.body`) }))

export function PrivacyScreen() {
  return <LegalPage title={t("legal.privacy.title")} updated={t("legal.privacy.updated")} intro={t("legal.privacy.intro")} sections={SECTIONS} />
}
