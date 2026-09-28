import { useId, type ReactNode } from "react"
import "@/styles/ds/components/tooltip.css"

// ds-v2 .ib-tip: short hover hint for icon-only controls (CSS only: hover after 300 ms,
// keyboard focus). `children` receives the bubble id for the trigger's aria-describedby.
export function Tooltip({
  content,
  side = "top",
  align = "center",
  children,
}: {
  content: ReactNode
  side?: "top" | "bottom"
  align?: "center" | "start" | "end"
  children: (describedBy: string) => ReactNode
}) {
  const id = useId()
  const cls = [
    "ib-tip",
    side === "bottom" && "ib-tip--bottom",
    align === "start" && "ib-tip--start",
    align === "end" && "ib-tip--end",
  ]
    .filter(Boolean)
    .join(" ")
  return (
    <span className={cls}>
      {children(id)}
      <span className="ib-tip__bubble" role="tooltip" id={id}>
        {content}
      </span>
    </span>
  )
}
