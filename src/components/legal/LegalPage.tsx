import * as React from "react"
import { Logo } from "@/components/brand/Logo"

export type LegalSection = { heading: string; body: React.ReactNode }

// Shared layout for legal documents (Terms, Privacy) — branded header, readable
// single-column prose, themed.
export function LegalPage({
  title,
  updated,
  intro,
  sections,
}: {
  title: string
  updated: string
  intro?: string
  sections: LegalSection[]
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <a href="/" className="flex items-center gap-2">
            <Logo size={40} />
            <span className="font-semibold tracking-tight">
              Cyber<span className="text-primary">ICE</span>Box
            </span>
          </a>
          <a href="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← На головну
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">Останнє оновлення: {updated}</p>
        {intro && <p className="mt-6 leading-relaxed text-muted-foreground">{intro}</p>}

        <div className="mt-10 flex flex-col gap-8">
          {sections.map((s, i) => (
            <section key={i}>
              <h2 className="text-lg font-semibold tracking-tight">
                {i + 1}. {s.heading}
              </h2>
              <div className="mt-2 leading-relaxed text-muted-foreground">{s.body}</div>
            </section>
          ))}
        </div>

        <footer className="mt-16 border-t border-border pt-6 text-sm text-muted-foreground">
          © 2026 CyberICEBox · ХНУРЕ. Маєте питання?{" "}
          <a href="mailto:legal@cybericebox.app" className="text-primary hover:underline">
            legal@cybericebox.app
          </a>
        </footer>
      </main>
    </div>
  )
}
