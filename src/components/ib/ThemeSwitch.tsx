"use client"

import { useEffect, useRef, useState, type KeyboardEvent } from "react"
import { Monitor, Moon, Sun } from "lucide-react"
import { Tooltip } from "./Tooltip"
import { t } from "@/i18n/t"
import { readThemeChoice, setThemeChoice, subscribeThemeChoice, watchSystemTheme, type ThemeChoice } from "@/lib/theme"
import "@/styles/theme-switch.css"

export const THEME_OPTIONS: { value: ThemeChoice; icon: typeof Sun; label: string }[] = [
  { value: "light", icon: Sun, label: "theme.light" },
  { value: "dark", icon: Moon, label: "theme.dark" },
  { value: "system", icon: Monitor, label: "theme.system" },
]

// Shared state keeps the footer switch and the signed-in account menu in sync.
export function useThemeChoice() {
  const [choice, setChoice] = useState<ThemeChoice | null>(null)
  const choiceRef = useRef<ThemeChoice>("system")
  useEffect(() => {
    const update = (next: ThemeChoice) => { choiceRef.current = next; setChoice(next) }
    update(readThemeChoice())
    const unsubscribe = subscribeThemeChoice(update)
    const stopWatching = watchSystemTheme(() => choiceRef.current)
    return () => { unsubscribe(); stopWatching() }
  }, [])
  const pick = (next: ThemeChoice) => setThemeChoice(next)
  return [choice, pick] as const
}

export function ThemeSwitch({ className }: { className?: string }) {
  const [choice, pick] = useThemeChoice()

  // WAI-ARIA radio group: one tab stop (the checked radio), arrows move and select.
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const dir = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0
    if (!dir) return
    e.preventDefault()
    const from = (e.target as HTMLElement).closest<HTMLElement>("[data-theme-choice]")?.dataset.themeChoice
    const i = Math.max(0, THEME_OPTIONS.findIndex((o) => o.value === from))
    const next = THEME_OPTIONS[(i + dir + THEME_OPTIONS.length) % THEME_OPTIONS.length].value
    pick(next)
    e.currentTarget.querySelector<HTMLButtonElement>(`[data-theme-choice="${next}"]`)?.focus()
  }

  return (
    <div role="radiogroup" aria-label={t("theme.label")} onKeyDown={onKeyDown} className={"ib-theme" + (className ? " " + className : "")}>
      {THEME_OPTIONS.map(({ value, icon: I, label }) => (
        <Tooltip key={value} content={t(label)}>
          {(tipId) => (
          <button
            type="button"
            aria-describedby={tipId}
            role="radio"
            aria-checked={choice === value}
            tabIndex={(choice ?? THEME_OPTIONS[0].value) === value ? 0 : -1}
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
