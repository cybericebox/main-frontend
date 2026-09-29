import type { Metadata } from "next"
import { TermsScreen } from "@/components/legal/TermsScreen"
import { pageMetadata, pageTitle } from "@/lib/metadata"
import { t } from "@/i18n/t"

export const metadata: Metadata = pageMetadata({ title: pageTitle(t("meta.terms.title")), description: t("meta.terms.description"), path: "/terms" })

export default function TermsPage() {
  return <TermsScreen />
}
