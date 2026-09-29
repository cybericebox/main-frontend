import Image from "next/image"
import { t } from "@/i18n/t"

// `compact` is the small inline crest for paging rows (same 20px as the other apps).
export function BrandLoading({ label, message, full = false, compact = false }: { label?: string; message?: string; full?: boolean; compact?: boolean }) {
  return <div className={`site-loading${full ? " site-loading--page" : ""}${compact ? " site-loading--compact" : ""}`} role="status" aria-label={label ?? message ?? t("common.loading")}>
    <Image className="site-loading__logo" src="/assets/crest-128.webp" width={64} height={64} alt="" />
    {message && <span className="site-loading__label" aria-hidden="true">{message}</span>}
  </div>
}
