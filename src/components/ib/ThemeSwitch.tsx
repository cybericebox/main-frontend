"use client"

import { useEffect, useRef, useState, type KeyboardEvent } from "react"
import { Monitor, Moon, Sun } from "lucide-react"
import { Tooltip } from "./Tooltip"
import { t } from "@/i18n/t"
import { readThemeChoice, setThemeChoice, watchSystemTheme, type ThemeChoice } from "@/lib/theme"
import "@/styles/theme-switch.css"

const OPTIONS: { value: ThemeChoice; icon: typeof Sun; label: string }[] = [
  { value: "light", icon: Sun, label: "theme.light" },
  { value: "dark", icon: Moon, label: "theme.dark" },
  { value: "system", icon: Monitor, label: "theme.system" },
]

// Three icon buttons in a row (Світла / Темна / Системна), one click, no menu.
// The choice lives in the parent-domain `cib_theme` cookie (lib/theme).
export function ThemeSwitch({ className }: { className?: string }) {
  // null until mounted: the stored choice is only known on the client, so nothing shows as checked before that
  const [choice, setChoice] = useState<ThemeChoice | null>(null)
  const choiceRef = useRef<ThemeChoice>("system")

  useEffect(() => {
    const c = readThemeChoice()
    choiceRef.current = c
    setChoice(c)
    return watchSystemTheme(() => choiceRef.current)
  }, [])

  const pick = (c: ThemeChoice) => {
    choiceRef.current = c
    setChoice(c)
    setThemeChoice(c)
  }

  // WAI-ARIA radio group: one tab stop (the checked radio), arrows move and select.
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const dir = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0
    if (!dir) return
    e.preventDefault()
    const from = (e.target as HTMLElement).closest<HTMLElement>("[data-theme-choice]")?.dataset.themeChoice
    const i = Math.max(0, OPTIONS.findIndex((o) => o.value === from))
    const next = OPTIONS[(i + dir + OPTIONS.length) % OPTIONS.length].value
    pick(next)
    e.currentTarget.querySelector<HTMLButtonElement>(`[data-theme-choice="${next}"]`)?.focus()
  }

  return (
    <div role="radiogroup" aria-label={t("theme.label")} onKeyDown={onKeyDown} className={"ib-theme" + (className ? " " + className : "")}>
      {OPTIONS.map(({ value, icon: I, label }) => (
        <Tooltip key={value} content={t(label)}>
          {(tipId) => (
          <button
            type="button"
            aria-describedby={tipId}
            role="radio"
            aria-checked={choice === value}
            tabIndex={(choice ?? OPTIONS[0].value) === value ? 0 : -1}
            data-theme-choice={value}
            aria-label={t(label)}
            className="ib-theme__btn"
            onClick={() => pick(value)}
          >
            <I aria-hidden />
          </button>
          )}
        </Tooltip>
      ))}
    </div>
  )
}
