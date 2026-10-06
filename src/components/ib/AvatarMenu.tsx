"use client"

import { Fragment, useEffect, useId, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from "react"
import { t } from "@/i18n/t"
import "@/styles/ds/components/avatar.css"
import "@/styles/ds/components/dropdown-menu.css"

// An item is a link; with `onSelect` the navigation is cancelled (when JS runs), the menu closes
// and hands focus back to its button, then `onSelect` runs.
export type AvatarMenuItem = { href: string; label: string; ariaLabel?: string; icon?: ReactNode; onSelect?: () => void }
export type AvatarMenuEntry = AvatarMenuItem | "divider"

// ds-v2 avatar button + .ib-menu (IB.Dropdown behaviour: click toggles, Escape /
// outside click closes, ↑/↓ move between items). Menu aligned to the right edge.
export function AvatarMenu({
  name,
  email,
  picture,
  initials: ini,
  items,
}: {
  name: string
  email: string
  picture?: string
  initials: string
  items: AvatarMenuEntry[]
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

  /* opened: focus moves to the first item (menu button pattern) */
  useEffect(() => {
    if (open) rootRef.current?.querySelector<HTMLAnchorElement>(".ib-menu__item")?.focus()
  }, [open])

  const onTriggerKey = (e: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault()
      setOpen(true)
    }
  }

  const onMenuKey = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    const links = Array.from(e.currentTarget.querySelectorAll<HTMLAnchorElement>(".ib-menu__item"))
    const i = links.indexOf(document.activeElement as HTMLAnchorElement)
    if (e.key === "Tab") {
      // Tab leaves the menu: close it and continue from the button
      setOpen(false)
      btnRef.current?.focus()
    } else if (e.key === "Home") {
      e.preventDefault()
      links[0]?.focus()
    } else if (e.key === "End") {
      e.preventDefault()
      links[links.length - 1]?.focus()
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      ;(links[i + 1] || links[0])?.focus()
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      ;(links[i - 1] || links[links.length - 1])?.focus()
    }
  }

  const item = (it: AvatarMenuItem) => (
    <a
      className="ib-menu__item"
      role="menuitem"
      href={it.href}
      aria-label={it.ariaLabel}
      onClick={it.onSelect ? (e) => {
        e.preventDefault()
        setOpen(false)
        btnRef.current?.focus()
        it.onSelect?.()
      } : undefined}
    >
      {it.icon}
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
        aria-label={t("account.menu", { name })}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={onTriggerKey}
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
      <div className="ib-menu" id={menuId} hidden={!open} onKeyDown={onMenuKey}>
        {/* the name/e-mail header is not a menu item, so it stays outside role=menu */}
        <div className="ib-menu__head">
          <b>{name}</b>
          <span>{email}</span>
        </div>
        <div className="ib-menu__list" role="menu" aria-label={t("account.menu", { name })}>
          {items.map((it, i) => <Fragment key={i}>{it === "divider" ? <hr className="ib-menu__sep" /> : item(it)}</Fragment>)}
        </div>
      </div>
    </div>
  )
}
