import type React from "react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"

// (main) route group layout — adds the shared Header/Footer chrome for the
// landing page and any future marketing pages.
export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  )
}
