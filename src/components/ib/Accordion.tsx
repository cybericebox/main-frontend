import type { ReactNode } from "react"
import { Icon } from "./Icon"
import "@/styles/ds/components/accordion.css"

// ds-v2 .ib-accordion on native <details>/<summary> (no JS). `name` = one open at a time.
export function Accordion({
  items,
  size,
  defaultOpen,
  name,
  className,
}: {
  items: { q: string; a: ReactNode }[]
  size?: "lg"
  defaultOpen?: number
  name?: string
  className?: string
}) {
  const cls = ["ib-accordion", size === "lg" && "ib-accordion--lg", className].filter(Boolean).join(" ")
  return (
    <div className={cls}>
      {items.map((it, i) => (
        <details key={it.q} className="ib-accordion__item" open={i === defaultOpen} name={name}>
          <summary className="ib-accordion__q">
            {it.q}
            <Icon name="plus" className="ib-accordion__icon" />
          </summary>
          <div className="ib-accordion__a">
            <p>{it.a}</p>
          </div>
        </details>
      ))}
    </div>
  )
}
