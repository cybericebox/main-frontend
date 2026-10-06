import type { Metadata } from "next"
import { CookiesScreen } from "@/components/legal/CookiesScreen"
import { pageMetadata, pageTitle } from "@/lib/metadata"
import { t } from "@/i18n/t"

export const metadata: Metadata = pageMetadata({ title: pageTitle(t("meta.cookies.title")), description: t("meta.cookies.description"), path: "/cookies/" })

export default function CookiesPage() {
  return <CookiesScreen />
}
