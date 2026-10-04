"use client"

import { Navbar } from "@/components/ib/Navbar"
import { Button } from "@/components/ib/Button"
import { AvatarMenu, type AvatarMenuEntry } from "@/components/ib/AvatarMenu"
import { initials } from "@/lib/initials"
import { InboxButton } from "@/components/site/InboxButton"
import { t } from "@/i18n/t"
import { useApi } from "@/lib/useApi"
import { idUrl, isAdminTier } from "@/lib/auth"
import { ADMIN_ORIGIN, EXERCISES_ORIGIN, ID_ORIGIN, SIGN_IN_URI, SIGN_OUT_URI } from "@/lib/links"
import { ACCOUNT_MENU_ICON_PROPS, ACCOUNT_MENU_ICONS, ACCOUNT_MENU_LABELS, accountMenu, type AccountMenuEntry } from "@/lib/accountMenu"
import { useCatalogAccess } from "@/lib/useCatalogAccess"
import { openConsentSettings } from "@/lib/consent"
import { mediaUrl } from "@/api/client"
import { landingLinks } from "./sections"
import { SiteBanners } from "./SiteBanners"

// Platform navbar. Actions depend on the API probe (lib/useApi): absent while
// pending/down (their slot keeps its width), «Увійти» for anonymous visitors,
// the avatar menu (lib/accountMenu: same entries, labels and icons in every app) for signed-in users.
function avatarEntry(entry: AccountMenuEntry): AvatarMenuEntry {
  if (entry.kind === "divider") return "divider"
  const key = entry.kind === "link" ? entry.key : entry.kind
  const Icon = ACCOUNT_MENU_ICONS[key]
  const icon = <Icon {...ACCOUNT_MENU_ICON_PROPS} />
  // «Файли cookie» is a link to the cookie policy that opens the consent panel instead (with JS).
  if (entry.kind === "cookies") {
    return { href: "/cookies", label: t(ACCOUNT_MENU_LABELS.cookies), ariaLabel: t(ACCOUNT_MENU_LABELS.cookiesAria), icon, onSelect: openConsentSettings }
  }
  return { href: entry.kind === "link" ? entry.href : idUrl(SIGN_OUT_URI), label: t(ACCOUNT_MENU_LABELS[key]), icon }
}

export function SiteHeader({ home }: { home: boolean }) {
  const { status, me } = useApi()
  const up = status === "up"
  const catalog = useCatalogAccess(me)

  const actions = (
    <div className="site-nav-slot">
      {up && !me ? (
        <Button variant="primary" href={idUrl(SIGN_IN_URI)}>
          {t("common.signIn")}
        </Button>
      ) : null}
      {up && me ? (
        <>
          <InboxButton />
          <AvatarMenu
            name={`${me.FirstName} ${me.LastName}`.trim() || me.Email}
            email={me.Email}
            picture={mediaUrl(me.Picture)}
            initials={initials(me.FirstName, me.LastName, me.Email)}
            items={accountMenu(
              "main",
              { adminTier: isAdminTier(me), catalog, returnTo: typeof window !== "undefined" ? window.location.href : "" },
              { id: ID_ORIGIN, admin: ADMIN_ORIGIN, exercises: EXERCISES_ORIGIN },
            ).map(avatarEntry)}
          />
        </>
      ) : null}
    </div>
  )

  return (
    <>
      <Navbar
        brandHref={home ? "#top" : "/"}
        links={landingLinks(home ? "" : "/")}
        actions={actions}
      />
      {/* client-only, renders nothing until /api/banners answers: no landing SSR/LCP cost */}
      <SiteBanners />
    </>
  )
}
