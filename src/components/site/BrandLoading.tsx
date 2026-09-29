import Image from "next/image"
import { t } from "@/i18n/t"

export function BrandLoading({ label, message, full = false }: { label?: string; message?: string; full?: boolean }) {
  return <div className={`site-loading${full ? " site-loading--page" : ""}`} role="status" aria-label={label ?? message ?? t("common.loading")}>
    <Image className="site-loading__logo" src="/assets/crest-128.webp" width={64} height={64} alt="" />
    {message && <span className="site-loading__label" aria-hidden="true">{message}</span>}
  </div>
}
