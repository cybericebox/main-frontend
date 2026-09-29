"use client"

import { useEffect } from "react"

// Collision handling for the CSS-only ds-v2 Tooltip (.ib-tip): when a hint is about to show
// (hover or keyboard focus), shift its bubble sideways so it stays 8px inside the viewport.
// Mounted once in the root layout; the Tooltip itself stays a server component.
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
    document.addEventListener("mouseover", onShow)
    document.addEventListener("focusin", onShow)
    return () => {
      document.removeEventListener("mouseover", onShow)
      document.removeEventListener("focusin", onShow)
    }
  }, [])
  return null
}
