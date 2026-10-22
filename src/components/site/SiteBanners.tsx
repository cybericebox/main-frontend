"use client"

import { useEffect, useId, useRef, useState, type ReactNode } from "react"
import * as Popover from "@radix-ui/react-popover"
import { X } from "lucide-react"
import { apiGet, apiPatch } from "@/api/client"
import { createBannerSync, type BannerHold } from "@/lib/pulseLoop"
import { getPulseLoop, pulseScope } from "@/lib/pulse"
import { t } from "@/i18n/t"
import { Tooltip } from "@/components/ib/Tooltip"
import { bannerHref, bannerLevel, dismissKey, isDismissed, parseBanners, rememberDismissed, type SiteBanner } from "./bannerModel"
import "@/styles/site-banner.css"
import { keepBrand } from "@/i18n/brand"

type BannerRowProps = { banner: SiteBanner; onDismiss?: (banner: SiteBanner) => void; children?: ReactNode }

function BannerRow({ banner, onDismiss, children }: BannerRowProps) {
  const href = bannerHref(banner.LinkURL)
  return (
    <div className={`ib-site-banner ib-site-banner--${bannerLevel(banner.Level)}`}>
      <p className="ib-site-banner__text">
        {keepBrand(banner.Text)}
        {href ? <a className="ib-site-banner__link" href={href}>{keepBrand(banner.LinkLabel || t("siteBanner.more"))}</a> : null}
      </p>
      {children}
      {banner.Dismissible ? (<Tooltip content={t("siteBanner.dismiss")} side="bottom" align="end">
          {(describedBy) => (
            <button type="button" className="ib-site-banner__x" aria-label={t("siteBanner.dismiss")} aria-describedby={describedBy} onClick={() => onDismiss?.(banner)}>
              <X aria-hidden="true" />
            </button>
          )}
        </Tooltip>) : null}
    </div>
  )
}

// The API order is authoritative. Only the first announcement occupies the page header.
export function SiteBannerList({ banners, onDismiss }: { banners: SiteBanner[]; onDismiss?: (banner: SiteBanner) => void }) {
  const titleId = useId()
  const titleRef = useRef<HTMLHeadingElement>(null)
  if (banners.length === 0) return null
  const [primary, ...others] = banners
  const plural = new Intl.PluralRules("uk").select(others.length)
  return (
    <div role="status" aria-label={t("siteBanner.label")} className="ib-site-banners">
      <Popover.Root modal={false}>
        <BannerRow banner={primary} onDismiss={onDismiss}>
          {others.length > 0 ? (
            <Popover.Trigger asChild>
              <button type="button" className="ib-site-banner__more">{t(`siteBanner.moreAnnouncements.${plural}`, { count: others.length })}</button>
            </Popover.Trigger>
          ) : null}
        </BannerRow>
        {others.length > 0 ? (
          <Popover.Portal>
            <Popover.Content className="ib-site-banner-panel" side="bottom" align="end" sideOffset={8} collisionPadding={16} aria-labelledby={titleId} onOpenAutoFocus={(event) => { event.preventDefault(); titleRef.current?.focus() }}>
              <h2 ref={titleRef} id={titleId} tabIndex={-1} className="ib-site-banner-panel__title">{t("siteBanner.others")}</h2>
              {others.map((banner) => <BannerRow key={dismissKey(banner)} banner={banner} onDismiss={onDismiss} />)}
            </Popover.Content>
          </Popover.Portal>
        ) : null}
      </Popover.Root>
    </div>
  )
}

// Site banners: public GET /api/notifications/banners, refetched only when the shared pulse reports a new Banners version
// (never for the version of an empty list).
// A banner outage never blocks the page: errors are ignored and nothing renders until data arrives.
// The list last fetched in this tab and its version: a remount (another layout) reuses it without a request.
const held: BannerHold<unknown> = { current: null }

export function SiteBanners() {
  const [banners, setBanners] = useState<SiteBanner[]>(() => parseBanners(held.current?.banners))
  const [dismissed, setDismissed] = useState<ReadonlySet<string>>(() => new Set())

  useEffect(() => {
    let active = true
    const onPulse = createBannerSync(
      () => apiGet<unknown>(`/api/notifications/banners${pulseScope()}`, undefined, { required: false }),
      (data) => { if (active) setBanners(parseBanners(data)) },
      { hold: held },
    )
    const unsubscribe = getPulseLoop().subscribe(onPulse)
    return () => { active = false; unsubscribe() }
  }, [])

  const visible = banners.filter((banner) => !dismissed.has(dismissKey(banner)) && !isDismissed(banner))
  const dismiss = (banner: SiteBanner) => {
    if (banner.Kind === "personal") {
      apiPatch(`/api/notifications/banners/${encodeURIComponent(banner.ID)}/dismiss`, {}, undefined, { required: false })
        .then(() => getPulseLoop().trigger())
        .catch(() => { /* the banner returns with the next pulse */ })
    } else rememberDismissed(banner)
    setDismissed((current) => new Set(current).add(dismissKey(banner)))
  }
  return <SiteBannerList banners={visible} onDismiss={dismiss} />
}
