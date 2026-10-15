"use client"

import { Fragment, useEffect, useId, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from "react"
import { ChevronDown, Check } from "lucide-react"
import { THEME_OPTIONS, useThemeChoice } from "./ThemeSwitch"
import { t } from "@/i18n/t"
import "@/styles/ds/components/avatar.css"
import "@/styles/ds/components/dropdown-menu.css"
import "@/styles/account-menu.css"

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
  navigation,
  items,
}: {
  name: string
  email: string
  picture?: string
  initials: string
  navigation: AvatarMenuItem[]
  items: AvatarMenuEntry[]
}) {
  const [open, setOpen] = useState(false)
  const [themeExpanded, setThemeExpanded] = useState(false)
  const [themeChoice, selectTheme] = useThemeChoice()
  const themeChoicesId = useId()
  const themeTriggerRef = useRef<HTMLButtonElement>(null)
  const currentTheme = THEME_OPTIONS.find((option) => option.value === (themeChoice ?? "system"))!
  const ThemeIcon = currentTheme.icon
  useEffect(() => { if (!open) setThemeExpanded(false) }, [open])
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
    if (open) rootRef.current?.querySelector<HTMLElement>(".ib-menu__item")?.focus()
  }, [open])

  const onTriggerKey = (e: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault()
      setOpen(true)
    }
  }

  const onMenuKey = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    const links = Array.from(e.currentTarget.querySelectorAll<HTMLElement>(".ib-menu__item"))
    const i = links.indexOf(document.activeElement as HTMLElement)
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
      onClick={(e) => {
        if (it.onSelect) e.preventDefault()
        setOpen(false)
        btnRef.current?.focus()
        it.onSelect?.()
      }}
    >
      {it.icon}
      <span className="account-menu__label">{it.label}</span>
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
      <div className="ib-menu account-menu" id={menuId} hidden={!open} onKeyDown={onMenuKey}>
        {/* the name/e-mail header is not a menu item, so it stays outside role=menu */}
        <div className="ib-menu__head account-menu__identity">
          <b title={name}>{name}</b>
          <span title={email}>{email}</span>
        </div>
        <div className="ib-menu__list" role="menu" aria-label={t("account.menu", { name })}>
          <hr className="ib-menu__sep" />
          {navigation.map((entry) => <Fragment key={entry.href}>{item(entry)}</Fragment>)}
          {navigation.length > 0 && <hr className="ib-menu__sep" />}
          <button ref={themeTriggerRef} type="button" role="menuitem" className="ib-menu__item ib-account-theme" aria-expanded={themeExpanded} aria-controls={themeChoicesId}
            onClick={() => setThemeExpanded((value) => !value)}
            onKeyDown={(event) => {
              if (event.key === "ArrowRight") { event.preventDefault(); setThemeExpanded(true) }
              if (event.key === "ArrowLeft") { event.preventDefault(); setThemeExpanded(false) }
            }}>
            <ThemeIcon aria-hidden="true" /><span>{t("theme.label")}</span><span className="ib-account-theme__choice">{t(currentTheme.label)}</span><ChevronDown aria-hidden="true" className={themeExpanded ? "is-expanded" : undefined} />
          </button>
          {themeExpanded && <div id={themeChoicesId} role="group" aria-label={t("theme.label")} onKeyDown={(event) => {
            if (event.key === "ArrowLeft") { event.preventDefault(); setThemeExpanded(false); themeTriggerRef.current?.focus() }
          }}>
            {THEME_OPTIONS.map(({ value, icon: Icon, label }) => <button key={value} type="button" role="menuitemradio" aria-checked={themeChoice === value} className="ib-menu__item ib-account-theme-option" onClick={() => { selectTheme(value); setOpen(false); btnRef.current?.focus() }}><span className="ib-account-theme-option__check">{themeChoice === value && <Check aria-hidden="true" />}</span><Icon aria-hidden="true" />{t(label)}</button>)}
          </div>}
          {items.map((it, i) => <Fragment key={i}>{it === "divider" ? <hr className="ib-menu__sep" /> : item(it)}</Fragment>)}
        </div>
      </div>
    </div>
  )
}
