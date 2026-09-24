"use client"

import { useEffect, useId, useRef, type ReactNode } from "react"
import { Icon } from "./Icon"
import { t } from "@/i18n/t"
import "@/styles/ds/components/icon-button.css"
import "@/styles/ds/components/modal.css"
import "@/styles/dialog.css"

// ds-v2 .ib-modal on a native <dialog> (showModal): top layer, native focus trap,
// Esc closes; a click on the backdrop closes too. Focus goes back to the opener
// (browser default) unless `returnFocus` names another element.
export function Modal({
  open,
  onClose,
  title,
  description,
  actions,
  children,
  size = "sm",
  returnFocus,
}: {
  open: boolean
  onClose: () => void
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  children?: ReactNode
  size?: "sm" | "md"
  returnFocus?: () => HTMLElement | null
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const descId = useId()
  const closeRef = useRef(onClose)
  const focusRef = useRef(returnFocus)
  useEffect(() => {
    closeRef.current = onClose
    focusRef.current = returnFocus
  })

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) d.showModal()
    if (!open && d.open) d.close()
  }, [open])

  useEffect(() => {
    const d = ref.current
    if (!d) return
    const onNativeClose = () => {
      closeRef.current()
      focusRef.current?.()?.focus()
    }
    d.addEventListener("close", onNativeClose)
    return () => d.removeEventListener("close", onNativeClose)
  }, [])

  return (
    <dialog
      ref={ref}
      className={"ib-modal" + (size === "sm" ? " ib-modal--sm" : "")}
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
      onClick={(e) => {
        if (e.target === e.currentTarget) e.currentTarget.close()
      }}
    >
      <header className="ib-modal__head">
        <div>
          <h2 className="ib-modal__title" id={titleId}>
            {title}
          </h2>
          {description ? (
            <p className="ib-modal__desc" id={descId}>
              {description}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          className="ib-icon-btn ib-icon-btn--sm ib-modal__close"
          aria-label={t("common.close")}
          onClick={() => ref.current?.close()}
        >
          <Icon name="x" />
        </button>
      </header>
      {children ? <div className="ib-modal__body">{children}</div> : null}
      {actions ? <footer className="ib-modal__foot">{actions}</footer> : null}
    </dialog>
  )
}
