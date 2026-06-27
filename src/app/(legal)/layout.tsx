import type React from "react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"

// (legal) route group layout — legal pages (Privacy, Terms) share the exact same
// Header/Footer chrome as the landing, so the nav and footer are identical across
// every page. LegalPage renders only the document content.
export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  )
}
