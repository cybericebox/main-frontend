"use client"

import { useEffect, useRef, useState } from "react"
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
  const [choice, setChoice] = useState<ThemeChoice>("system")
  const choiceRef = useRef(choice)

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

  return (
    <div role="radiogroup" aria-label={t("theme.label")} className={"ib-theme" + (className ? " " + className : "")}>
      {OPTIONS.map(({ value, icon: I, label }) => (
        <Tooltip key={value} content={t(label)}>
          {(tipId) => (
          <button
            type="button"
            aria-describedby={tipId}
            role="radio"
            aria-checked={choice === value}
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
