"use client"

import { useEffect, useRef, useState } from "react"

const WIDE = "(min-width: 1024px)"
// a section is current once its top has passed this line (below the sticky navbar)
const LINE = 120

// Section list of a legal document. From 1024px it is the sticky list on the left; below that it collapses into a
// <details> above the text (open in the static HTML, closed on mount, so the desktop list never depends on JS).
// The section being read gets aria-current="location".
export function LegalToc({ title, items }: { title: string; items: { id: string; label: string }[] }) {
  const detailsRef = useRef<HTMLDetailsElement>(null)
  const [current, setCurrent] = useState("")

  useEffect(() => {
    const el = detailsRef.current
    const mq = window.matchMedia(WIDE)
    const sync = () => {
      if (el) el.open = mq.matches
    }
    sync()
    mq.addEventListener("change", sync)
    return () => mq.removeEventListener("change", sync)
  }, [])

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      let id = ""
      for (const item of items) {
        const sec = document.getElementById(item.id)
        if (sec && sec.getBoundingClientRect().top <= LINE) id = item.id
      }
      setCurrent(id)
    }
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update)
    }
    update()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [items])

  return (
    <nav className="ib-toc" aria-label={title}>
      <details
        ref={detailsRef}
        open
        // the wide list is always open
        onToggle={(e) => {
          if (window.matchMedia(WIDE).matches && !e.currentTarget.open) e.currentTarget.open = true
        }}
      >
        <summary className="ib-toc__title">{title}</summary>
        <ol className="ib-toc__list">
          {items.map((item) => (
            <li key={item.id}>
              <a className="ib-toc__link" href={`#${item.id}`} aria-current={current === item.id ? "location" : undefined}>
                {item.label}
              </a>
            </li>
          ))}
        </ol>
      </details>
    </nav>
  )
}
