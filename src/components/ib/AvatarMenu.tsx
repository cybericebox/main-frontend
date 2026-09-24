"use client"

import { useEffect, useId, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react"
import { Icon } from "./Icon"
import "@/styles/ds/components/avatar.css"
import "@/styles/ds/components/dropdown-menu.css"

export type AvatarMenuItem = { href: string; label: string; icon?: string }

/** Initials for the avatar: first + last name, else the e-mail's first letter. */
export function initials(first?: string, last?: string, email?: string): string {
  const both = `${first?.trim()?.[0] ?? ""}${last?.trim()?.[0] ?? ""}`.toUpperCase()
  return both || (email?.trim()?.[0] ?? "?").toUpperCase()
}

// ds-v2 avatar button + .ib-menu (IB.Dropdown behaviour: click toggles, Escape /
// outside click closes, ↑/↓ move between items). Menu aligned to the right edge.
export function AvatarMenu({
  name,
  email,
  picture,
  initials: ini,
  items,
  footer,
}: {
  name: string
  email: string
  picture?: string
  initials: string
  items: AvatarMenuItem[]
  footer?: AvatarMenuItem
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const menuId = useId()

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false)
        btnRef.current?.focus()
      }
    }
    document.addEventListener("click", onDoc)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("click", onDoc)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  const onMenuKey = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    const links = Array.from(e.currentTarget.querySelectorAll<HTMLAnchorElement>(".ib-menu__item"))
    const i = links.indexOf(document.activeElement as HTMLAnchorElement)
    if (e.key === "ArrowDown") {
      e.preventDefault()
      ;(links[i + 1] || links[0])?.focus()
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      ;(links[i - 1] || links[links.length - 1])?.focus()
    }
  }

  const item = (it: AvatarMenuItem) => (
    <a key={it.href} className="ib-menu__item" role="menuitem" href={it.href}>
      {it.icon ? <Icon name={it.icon} /> : null}
      {it.label}
    </a>
  )

  return (
    <div ref={rootRef} className="ib-dropdown ib-dropdown--end">
      <button
        ref={btnRef}
        type="button"
        className="ib-avatar-btn"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={name}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="ib-avatar" aria-hidden="true">
          {picture ? (
            // eslint-disable-next-line @next/next/no-img-element -- external avatar URL, static export
            <img src={picture} alt="" width={32} height={32} referrerPolicy="no-referrer" />
          ) : (
            ini
          )}
        </span>
      </button>
      <div className="ib-menu" role="menu" id={menuId} hidden={!open} onKeyDown={onMenuKey}>
        <div className="ib-menu__head">
          <b>{name}</b>
          <span>{email}</span>
        </div>
        {items.map(item)}
        {footer ? (
          <>
            <hr className="ib-menu__sep" />
            {item(footer)}
          </>
        ) : null}
      </div>
    </div>
  )
}
