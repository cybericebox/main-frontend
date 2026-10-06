import type { Metadata } from "next"
import { t } from "@/i18n/t"
import { pageTitle } from "@/lib/metadata"
import { NotFoundScreen } from "@/components/site/NotFoundScreen"

// A 404 is not the landing: its own title, no canonical, no social card.
export const metadata: Metadata = { title: { absolute: pageTitle(t("error.notFound")) }, description: t("error.notFoundDescription"), alternates: { canonical: null }, openGraph: null }

// Next answers with a real 404 for this file (static export renders it as 404.html).
export default function NotFound() {
  return <NotFoundScreen />
}
