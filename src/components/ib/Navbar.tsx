"use client"

import { useEffect, useId, useRef, type ReactNode } from "react"
import Image from "next/image"
import { Icon } from "./Icon"
import { Wordmark } from "./Wordmark"
import { t } from "@/i18n/t"
import "@/styles/ds/components/navbar.css"

export type NavLink = { href: string; label: string }

// Port of IB.Navbar (ds-v2 patterns/navbar/navbar.js), platform variant.
// Tabs that don't fit spill into «Ще ▾»; below 760 px (container query) the tabs
// hide and the menu button opens the panel. Panel links close the panel.
// The overflow/panel state is DOM-driven like the original (measure → hide li),
// React owns only the static markup; `actions` / `panelExtra` are free slots.
export function Navbar({
  brandHref,
  links,
  actions,
  panelExtra,
}: {
  brandHref: string
  links: NavLink[]
  actions?: ReactNode
  panelExtra?: ReactNode
}) {
  const rootRef = useRef<HTMLElement>(null)
  const baseId = useId()
  const moreId = `${baseId}-more`
  const panelId = `${baseId}-panel`

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const nav = root.querySelector<HTMLElement>(".ib-navbar__nav")!
    const tabs = root.querySelector<HTMLElement>(".ib-navbar__tabs")!
    const more = root.querySelector<HTMLElement>(".ib-navbar__more")!
    const moreBtn = more.querySelector<HTMLButtonElement>(".ib-navbar__more-btn")!
    const menu = more.querySelector<HTMLElement>(".ib-navbar__menu")!
    const toggle = root.querySelector<HTMLButtonElement>(".ib-navbar__toggle")!
    const panel = root.querySelector<HTMLElement>(".ib-navbar__panel")!
    const items = Array.from(tabs.children) as HTMLElement[]

    const closeMenu = (focusBtn: boolean) => {
      if (menu.hidden) return
      menu.hidden = true
      moreBtn.setAttribute("aria-expanded", "false")
      if (focusBtn) moreBtn.focus()
    }
    const openMenu = () => {
      menu.hidden = false
      moreBtn.setAttribute("aria-expanded", "true")
    }

    const update = () => {
      const wasOpen = !menu.hidden
      closeMenu(false)
      items.forEach((li) => (li.hidden = false))
      more.hidden = true
      if (!nav.offsetWidth) return // hidden on narrow screens
      const avail = nav.clientWidth
      const gap = parseFloat(getComputedStyle(tabs).columnGap) || 0
      const widths = items.map((li) => li.offsetWidth)
      const total = widths.reduce((a, b) => a + b, 0) + (items.length - 1) * gap
      if (total <= avail) return
      more.hidden = false
      const room = avail - more.offsetWidth - gap
      let used = 0
      let cut = false
      const spill: HTMLElement[] = []
      items.forEach((li, i) => {
        if (!cut && used + widths[i] <= room) {
          used += widths[i] + gap
          return
        }
        cut = true
        li.hidden = true
        spill.push(li)
      })
      menu.textContent = ""
      spill.forEach((li) => {
        const src = li.querySelector("a")!
        const a = document.createElement("a")
        a.href = src.getAttribute("href") || "#"
        a.textContent = (src.textContent || "").trim()
        const wrap = document.createElement("li")
        wrap.appendChild(a)
        menu.appendChild(wrap)
      })
      if (wasOpen) openMenu()
    }

    const setOpen = (on: boolean, focusToggle: boolean) => {
      root.classList.toggle("is-open", on)
      toggle.setAttribute("aria-expanded", String(on))
      toggle.setAttribute("aria-label", on ? t("landing.nav.closeMenu") : t("landing.nav.menu"))
      if (focusToggle) toggle.focus()
    }

    const onMenuClick = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest("a")) closeMenu(false)
    }
    const onMoreClick = () => (menu.hidden ? openMenu() : closeMenu(false))
    const onMoreKey = (e: KeyboardEvent) => {
      if (e.key !== "ArrowDown") return
      e.preventDefault()
      openMenu()
      menu.querySelector("a")?.focus()
    }
    const onMenuKey = (e: KeyboardEvent) => {
      const links = Array.from(menu.querySelectorAll("a"))
      const i = links.indexOf(document.activeElement as HTMLAnchorElement)
      if (e.key === "ArrowDown") {
        e.preventDefault()
        ;(links[i + 1] || links[0])?.focus()
      }
      if (e.key === "ArrowUp") {
        e.preventDefault()
        ;(links[i - 1] || links[links.length - 1])?.focus()
      }
    }
    const onDocKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return
      if (!menu.hidden) closeMenu(true)
      else if (root.classList.contains("is-open")) setOpen(false, true)
    }
    const onDocClick = (e: MouseEvent) => {
      if (!more.contains(e.target as Node)) closeMenu(false)
    }
    const onToggle = () => setOpen(!root.classList.contains("is-open"), false)
    // Close the mobile panel after a jump to an anchor.
    const onPanelClick = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest("a")) setOpen(false, false)
    }

    moreBtn.addEventListener("click", onMoreClick)
    moreBtn.addEventListener("keydown", onMoreKey)
    menu.addEventListener("keydown", onMenuKey)
    menu.addEventListener("click", onMenuClick)
    toggle.addEventListener("click", onToggle)
    panel.addEventListener("click", onPanelClick)
    document.addEventListener("keydown", onDocKey)
    document.addEventListener("click", onDocClick)
    const ro = new ResizeObserver(update)
    ro.observe(root)
    ro.observe(nav) // actions arriving later narrow the nav without resizing the bar
    let alive = true
    document.fonts?.ready.then(() => alive && update())
    update()

    return () => {
      alive = false
      ro.disconnect()
      moreBtn.removeEventListener("click", onMoreClick)
      moreBtn.removeEventListener("keydown", onMoreKey)
      menu.removeEventListener("keydown", onMenuKey)
      menu.removeEventListener("click", onMenuClick)
      toggle.removeEventListener("click", onToggle)
      panel.removeEventListener("click", onPanelClick)
      document.removeEventListener("keydown", onDocKey)
      document.removeEventListener("click", onDocClick)
    }
  }, [])

  return (
    <header ref={rootRef} className="ib-navbar ib-navbar--platform">
      <div className="ib-navbar__bar">
        <a className="ib-navbar__brand" href={brandHref} aria-label={t("landing.nav.home")}>
          <Image className="ib-navbar__crest" src="/assets/crest-64.webp" alt="" width={32} height={32} priority />
          <span className="ib-navbar__name">
            <Wordmark />
          </span>
        </a>
        <nav className="ib-navbar__nav" aria-label={t("landing.nav.sections")}>
          <ul className="ib-navbar__tabs">
            {links.map((l) => (
              <li key={l.href}>
                <a className="ib-navbar__link" href={l.href}>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="ib-navbar__more" hidden>
            <button className="ib-navbar__more-btn" type="button" aria-expanded="false" aria-controls={moreId}>
              {t("landing.nav.more")}
              <Icon name="chevron-down" />
            </button>
            <ul className="ib-navbar__menu" id={moreId} hidden />
          </div>
        </nav>
        <div className="ib-navbar__actions">
          {actions}
          <button
            className="ib-navbar__toggle"
            type="button"
            aria-expanded="false"
            aria-controls={panelId}
            aria-label={t("landing.nav.menu")}
          >
            <Icon name="menu" className="ib-navbar__icon-open" />
            <Icon name="x" className="ib-navbar__icon-close" />
          </button>
        </div>
      </div>
      <nav className="ib-navbar__panel" id={panelId} aria-label={t("landing.nav.menu")}>
        {links.map((l) => (
          <a key={l.href} href={l.href}>
            {l.label}
          </a>
        ))}
        {panelExtra}
      </nav>
    </header>
  )
}
