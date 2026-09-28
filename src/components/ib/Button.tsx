import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react"
import "@/styles/ds/components/button.css"

// ds-v2 .ib-btn. Renders <a> when `href` is given, otherwise <button type="button">.
export type ButtonVariant = "primary" | "default" | "ghost" | "mass" | "mass-outline"

type Common = { variant?: ButtonVariant; size?: "md" | "sm"; block?: boolean; className?: string }
type AsLink = Common & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }
type AsButton = Common & ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined }
export type ButtonProps = AsLink | AsButton

export function buttonClass({ variant = "default", size = "md", block, className }: Common = {}): string {
  return [
    "ib-btn",
    variant !== "default" && `ib-btn--${variant}`,
    size === "sm" && "ib-btn--sm",
    block && "ib-btn--block",
    className,
  ]
    .filter(Boolean)
    .join(" ")
}

export function Button(props: ButtonProps) {
  if (props.href !== undefined) {
    const { variant, size, block, className, ...rest } = props
    return <a className={buttonClass({ variant, size, block, className })} {...rest} />
  }
  const { variant, size, block, className, type = "button", ...rest } = props
  return <button type={type} className={buttonClass({ variant, size, block, className })} {...rest} />
}
