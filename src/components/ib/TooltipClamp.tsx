"use client"

import { useEffect } from "react"

// Behaviour for the CSS-only ds-v2 Tooltip (.ib-tip), mounted once in the root layout (the Tooltip itself stays
// a server component): when a hint is about to show (hover or keyboard focus), shift its bubble sideways so it
// stays 8px inside the viewport; Esc dismisses the open hint (WCAG 1.4.13) until the pointer leaves or focus
// moves on (the bubble is hoverable, so the pointer can move onto it without closing it).
const PAD = 8

function clamp(tip: Element) {
  const bubble = tip.querySelector<HTMLElement>(":scope > .ib-tip__bubble")
  if (!bubble) return
  bubble.style.translate = ""
  const r = bubble.getBoundingClientRect()
  const vw = document.documentElement.clientWidth
  const dx = r.left < PAD ? PAD - r.left : r.right > vw - PAD ? vw - PAD - r.right : 0
  if (dx) bubble.style.translate = `${Math.round(dx)}px 0`
}

export function TooltipClamp() {
  useEffect(() => {
    const onShow = (e: Event) => {
      const tip = e.target instanceof Element ? e.target.closest(".ib-tip") : null
      if (tip) clamp(tip)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return
      for (const tip of document.querySelectorAll(".ib-tip")) {
        if (tip.matches(":hover, :has(:focus-visible)")) tip.classList.add("is-dismissed")
      }
    }
    // a dismissed hint comes back for the next hover / focus
    const onLeave = (e: Event) => {
      const tip = e.target instanceof Element ? e.target.closest(".ib-tip.is-dismissed") : null
      const to = e instanceof MouseEvent ? e.relatedTarget : null
      if (tip && !(to instanceof Node && tip.contains(to))) tip.classList.remove("is-dismissed")
    }
    document.addEventListener("mouseover", onShow)
    document.addEventListener("focusin", onShow)
    document.addEventListener("keydown", onKey)
    document.addEventListener("mouseout", onLeave)
    document.addEventListener("focusout", onLeave)
    return () => {
      document.removeEventListener("mouseover", onShow)
      document.removeEventListener("focusin", onShow)
      document.removeEventListener("keydown", onKey)
      document.removeEventListener("mouseout", onLeave)
      document.removeEventListener("focusout", onLeave)
    }
  }, [])
  return null
}
