import type { InputHTMLAttributes } from "react"
import "@/styles/ds/components/input.css"

// ds-v2 .ib-input. `mono` for flags ICE{…}, codes, hosts.
export function Input({
  mono,
  inputSize = "md",
  className,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { mono?: boolean; inputSize?: "md" | "sm" }) {
  const cls = ["ib-input", mono && "ib-input--mono", inputSize === "sm" && "ib-input--sm", className]
    .filter(Boolean)
    .join(" ")
  return <input className={cls} {...rest} />
}
