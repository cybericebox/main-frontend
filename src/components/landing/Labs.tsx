"use client"

import { useEffect, useRef, useState } from "react"
import { t } from "@/i18n/t"
import { LabDemo } from "./LabDemo"
import { FEATURES, type Feature } from "./labScene"

// «Лабораторії»: text + feature list beside the lab card (LabDemo). A feature row lights up its part of the scheme:
// - mouse: only while the pointer is over the row and has moved there on purpose: a row that scrolls under a resting
//   cursor stays quiet (a click holds nothing, so the scheme never stays dimmed);
// - keyboard: while the row has visible focus (not the focus a mouse click or a re-activated window leaves behind);
// - touch, where there is no hover: a tap holds the row, a second tap or a tap anywhere else releases it.
export function Labs() {
  const listRef = useRef<HTMLDivElement>(null)
  const [held, setHeld] = useState<Feature | null>(null)
  const [over, setOver] = useState<Feature | null>(null)

  useEffect(() => {
    if (!held) return
    const release = (e: PointerEvent) => {
      if (!listRef.current?.contains(e.target as Node)) setHeld(null)
    }
    document.addEventListener("pointerdown", release)
    return () => document.removeEventListener("pointerdown", release)
  }, [held])

  return (
    <section className="pl-sec" id="labs" aria-labelledby="labs-h">
      <div className="pl-wrap pl-labs">
        <div>
          <h2 id="labs-h">{t("landing.labs.title")}</h2>
          <p className="pl-lead">{t("landing.labs.body")}</p>
          <div ref={listRef} className="pl-feat">
            {FEATURES.map((f, i) => (
              <button
                key={f}
                type="button"
                aria-pressed={held === f}
                // Only a pointer that really moves lights the row. When the page scrolls under a resting cursor the
                // browser reports the row as entered (and sends a move with no distance): that is not a choice.
                onPointerMove={(e) => {
                  if (e.pointerType === "mouse" && (e.movementX !== 0 || e.movementY !== 0) && over !== f) setOver(f)
                }}
                onPointerLeave={() => setOver(null)}
                onFocus={(e) => {
                  if (e.currentTarget.matches(":focus-visible")) setOver(f)
                }}
                onBlur={() => setOver(null)}
                onPointerUp={(e) => {
                  if (e.pointerType !== "mouse") setHeld(held === f ? null : f)
                }}
              >
                <b>{t(`landing.labs.f${i + 1}k`)}</b>
                <span>{t(`landing.labs.f${i + 1}v`)}</span>
              </button>
            ))}
          </div>
          <p className="pl-feat-hint">{t("landing.labs.featHint")}</p>
        </div>
        <LabDemo lit={over ?? held} />
      </div>
    </section>
  )
}
