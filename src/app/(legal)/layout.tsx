import type React from "react"

// (legal) route group layout — legal pages (Privacy, Terms) use the DS LegalPage
// component which renders its own branded header and footer, so this layout
// passes children through without adding extra chrome.
export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
