import * as React from "react"

export type LegalSection = { heading: string; body: React.ReactNode }

// Support contact derived from the current platform domain (support@<domain>).
const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN ?? "cybericebox.app"
const SUPPORT_EMAIL = `support@${DOMAIN}`

// Content for legal documents (Terms, Privacy) — readable single-column prose.
// The page chrome (Header/Footer) is supplied by the (legal) route-group layout,
// identical to the landing, so every page shares the same nav and footer.
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

      <p className="mt-12 border-t border-border pt-6 text-sm text-muted-foreground">
        Маєте питання?{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`} className="text-primary hover:underline">
          {SUPPORT_EMAIL}
        </a>
      </p>
    </main>
  )
}
