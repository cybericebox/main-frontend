import { t } from "@/i18n/t"
import { MAIN_HOST, SOURCE_URL } from "@/lib/links"
import { FAQ_COUNT } from "./Faq"

// schema.org data of the landing, read by search engines and AI answer engines: who we are, what the platform
// is, and the FAQ as question / answer pairs. Every text comes from the same messages the page shows.
const origin = `https://${MAIN_HOST}`

const graph = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${origin}/#org`,
      name: t("meta.brand"),
      url: `${origin}/`,
      logo: `${origin}/assets/crest.png`,
      sameAs: [SOURCE_URL],
    },
    {
      "@type": "WebSite",
      "@id": `${origin}/#site`,
      name: t("meta.brand"),
      url: `${origin}/`,
      inLanguage: "uk",
      description: t("meta.home.description"),
      publisher: { "@id": `${origin}/#org` },
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${origin}/#app`,
      name: t("meta.brand"),
      description: t("meta.home.app"),
      applicationCategory: "EducationalApplication",
      operatingSystem: "Web",
      url: `${origin}/`,
      codeRepository: SOURCE_URL,
      publisher: { "@id": `${origin}/#org` },
    },
    {
      "@type": "FAQPage",
      "@id": `${origin}/#faq`,
      inLanguage: "uk",
      mainEntity: Array.from({ length: FAQ_COUNT }, (_, i) => ({
        "@type": "Question",
        name: t(`landing.faq.q${i + 1}`),
        acceptedAnswer: { "@type": "Answer", text: t(`landing.faq.a${i + 1}`, { hl: t(`landing.faq.a${i + 1}hl`) }) },
      })),
    },
  ],
}

// "<" is escaped, so no text can close the script element
const json = JSON.stringify(graph).replace(/</g, "\\u003c")

export function StructuredData() {
  // eslint-disable-next-line @eslint-react/dom-no-dangerously-set-innerhtml -- static build-time JSON from our own messages
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
}
