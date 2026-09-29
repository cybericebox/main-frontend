import type { Metadata } from "next"
import { PrivacyScreen } from "@/components/legal/PrivacyScreen"
import { pageMetadata, pageTitle } from "@/lib/metadata"
import { t } from "@/i18n/t"

export const metadata: Metadata = pageMetadata({ title: pageTitle(t("meta.privacy.title")), description: t("meta.privacy.description"), path: "/privacy" })

export default function PrivacyPage() {
  return <PrivacyScreen />
}
