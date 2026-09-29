import type { Metadata } from "next"
import { SecurityScreen } from "@/components/legal/SecurityScreen"
import { pageMetadata, pageTitle } from "@/lib/metadata"
import { t } from "@/i18n/t"

export const metadata: Metadata = pageMetadata({ title: pageTitle(t("meta.security.title")), description: t("meta.security.description"), path: "/security" })

export default function SecurityPage() {
  return <SecurityScreen />
}
