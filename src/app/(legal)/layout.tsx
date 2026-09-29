import type React from "react"
import { SiteHeader } from "@/components/site/SiteHeader"
import { SiteFooter } from "@/components/site/SiteFooter"

// (legal) route group layout — same navbar/footer as the landing; anchors lead
// back to the landing sections (/#labs …). LegalPage renders the document.
export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader home={false} />
      <main>{children}</main>
      <SiteFooter />
    </>
  )
}
