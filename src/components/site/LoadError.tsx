"use client"

import { Button } from "@/components/ib/Button"
import { Icon } from "@/components/ib/Icon"
import { errorCode } from "@/components/site/ErrorPage"
import { t } from "@/i18n/t"

// The only load-error state inside a page or block: the warning mark at block
// scale, a title (the context message), one line of help and «Спробувати ще раз». Same size
// and centering as EmptyState, so loading → error never jumps. A dead route uses ErrorPage.
export function LoadError({ message = t("error.load.title"), onRetry, error, compact = false, className }: {
  message?: string
  onRetry?: () => void
  error?: unknown
  compact?: boolean
  className?: string
}) {
  const code = errorCode(error)
  return (
    <div data-load-error role="alert" className={"flex w-full flex-col items-center justify-center px-4 text-center " + (compact ? "min-h-24 gap-2 py-4" : "min-h-40 gap-3 py-8") + (className ? " " + className : "")}>
      <Icon name="warn" className={"text-[var(--ib-danger)] " + (compact ? "h-5 w-5" : "h-6 w-6")} />
      <p className="text-sm font-medium text-ink">{message}</p>
      {!compact && <p className="max-w-sm text-sm text-dim">{t("error.load.body")}</p>}
      {code !== undefined && <p className="font-mono text-xs text-dim">{t("error.load.code", { code })}</p>}
      {onRetry && <Button size={compact ? "sm" : "md"} onClick={onRetry}>{t("error.load.retry")}</Button>}
    </div>
  )
}
