import Image from "next/image"
import { t } from "@/i18n/t"

// `compact` is the small inline crest for paging rows (same 20px as the other apps); `inline` is the bare crest
// inside a busy button. Spans, so it is valid inside a <button>; only the full-page loader (LCP mark) is preloaded.
export function BrandLoading({ label, message, full = false, compact = false, inline = false }: { label?: string; message?: string; full?: boolean; compact?: boolean; inline?: boolean }) {
  return <span className={`site-loading${full ? " site-loading--page" : ""}${compact || inline ? " site-loading--compact" : ""}${inline ? " site-loading--inline" : ""}`} role="status" aria-label={label ?? message ?? t("common.loading")}>
    <Image className="site-loading__logo" src="/assets/crest-128.webp" width={64} height={64} alt="" priority={full} />
    {message && <span className="site-loading__label" aria-hidden="true">{message}</span>}
  </span>
}
