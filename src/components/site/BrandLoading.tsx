import Image from "next/image"

export function BrandLoading({ label, message, full = false }: { label?: string; message?: string; full?: boolean }) {
  return <div className={`site-loading${full ? " site-loading--page" : ""}`} role="status" aria-label={label ?? message ?? "Завантаження"}>
    <Image className="site-loading__logo" src="/assets/crest-128.webp" width={64} height={64} alt="" />
    {message && <span className="site-loading__label" aria-hidden="true">{message}</span>}
  </div>
}
