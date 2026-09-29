import type React from "react"
import { SiteHeader } from "@/components/site/SiteHeader"
import { SiteFooter } from "@/components/site/SiteFooter"

// (main) route group layout — landing chrome: navbar anchors jump within the page.
export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader home />
      <main id="top">{children}</main>
      <SiteFooter />
    </>
  )
}
