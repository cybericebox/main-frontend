"use client"
import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { t } from "@/i18n/t"

const ITEMS = [
  { q: "landing.faq.q1", a: "landing.faq.a1" },
  { q: "landing.faq.q2", a: "landing.faq.a2" },
  { q: "landing.faq.q3", a: "landing.faq.a3" },
  { q: "landing.faq.q4", a: "landing.faq.a4" },
  { q: "landing.faq.q5", a: "landing.faq.a5" },
  { q: "landing.faq.q6", a: "landing.faq.a6" },
  { q: "landing.faq.q7", a: "landing.faq.a7" },
  { q: "landing.faq.q8", a: "landing.faq.a8" },
]

export function Faq() {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <section id="faq" className="scroll-mt-20 bg-secondary/40 py-16">
      <div className="mx-auto max-w-2xl px-4">
        <h2 className="text-center text-2xl font-bold text-foreground md:text-3xl">{t("landing.faq.title")}</h2>
        <div className="mt-8 flex flex-col gap-3">
          {ITEMS.map((item, i) => {
            const isOpen = open === i
            return (
              <div key={item.q} className="frost-panel overflow-hidden rounded-lg">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-medium text-foreground"
                >
                  {t(item.q)}
                  <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>
                {isOpen && (
                  <p className="px-5 pb-4 text-sm leading-relaxed text-muted-foreground">{t(item.a)}</p>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
