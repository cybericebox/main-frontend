import type { Metadata } from "next"
import { t } from "@/i18n/t"
import { MAIN_HOST } from "@/lib/links"

const origin = `https://${MAIN_HOST}`

// Page metadata «<page> · Cyber ICE Box» (the home page passes its full title);
// Open Graph repeats the same title and description.
export function pageMetadata({ title, description, path = "/" }: { title: string; description: string; path?: string }): Metadata {
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: `${origin}${path}` },
    openGraph: {
      title,
      description,
      type: "website",
      url: `${origin}${path}`,
      images: [{ url: `${origin}/assets/crest.png`, alt: t("meta.brand") }],
    },
  }
}

export function pageTitle(page: string): string {
  return t("meta.pageTitle", { page })
}
