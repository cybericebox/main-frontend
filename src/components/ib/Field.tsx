import type { ReactNode } from "react"
import "@/styles/ds/components/field.css"
import "@/styles/ds/components/status-text.css"

const ERROR_ICON = (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5v5.5M12 16.2h.01" />
  </svg>
)

// ds-v2 .ib-field: label + control + one message line (hint / error / ok),
// rendered as a polite live region.
export function Field({
  label,
  htmlFor,
  messageId,
  hint,
  error,
  ok,
  className,
  children,
}: {
  label: ReactNode
  htmlFor: string
  messageId?: string
  hint?: ReactNode
  error?: ReactNode
  ok?: ReactNode
  className?: string
  children: ReactNode
}) {
  const msgClass = error ? "ib-field__error" : ok ? "ib-field__hint ib-status ib-status--ok" : "ib-field__hint"
  return (
    <div className={"ib-field" + (className ? " " + className : "")}>
      <label className="ib-field__label" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      <p className={msgClass} id={messageId} role="status" tabIndex={-1}>
        {error ? (
          <>
            {ERROR_ICON}
            {error}
          </>
        ) : (
          (ok ?? hint)
        )}
      </p>
    </div>
  )
}
