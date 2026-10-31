"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { usePathname } from "next/navigation"
import { MessageSquare } from "lucide-react"
import { Navbar } from "@/components/ib/Navbar"
import { Button } from "@/components/ib/Button"
import { AvatarMenu, type AvatarMenuEntry, type AvatarMenuItem } from "@/components/ib/AvatarMenu"
import { initials } from "@/lib/initials"
import { Icon } from "@/components/ib/Icon"
import { t } from "@/i18n/t"
import { useApi } from "@/lib/useApi"
import { idUrl, isAdminTier } from "@/lib/auth"
import { ADMIN_ORIGIN, EXERCISES_ORIGIN, ID_ORIGIN, SIGN_IN_URI } from "@/lib/links"
import { ACCOUNT_MENU_ICON_PROPS, ACCOUNT_MENU_ICONS, ACCOUNT_MENU_LABELS, accountMenu, type AccountMenuEntry } from "@/lib/accountMenu"
import { useCatalogAccess } from "@/lib/useCatalogAccess"
import { openConsentSettings } from "@/lib/consent"
import { signOutNow } from "@/lib/signOut"
import { mediaUrl } from "@/api/client"
import { feedbackHref } from "@/lib/feedback"
import { landingLinks } from "./sections"
import { SiteBanners } from "./SiteBanners"

// Anonymous visitors never need the inbox, its popover, or its HTML sanitizer.
// Keep the existing signed-in condition below and load that UI only when it is rendered.
const InboxButton = dynamic(() => import("@/components/site/InboxButton").then((module) => module.InboxButton), {
  // The bell never shows a loader: it stands in its final place (same box, same icon) and the badge arrives with the data.
  loading: () => <span aria-hidden className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-dim"><Icon name="bell" size={20} /></span>,
})

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
    return { href: "/cookies/", label: t(ACCOUNT_MENU_LABELS.cookies), ariaLabel: t(ACCOUNT_MENU_LABELS.cookiesAria), icon, onSelect: openConsentSettings }
  }
  // «Вийти» calls the API directly (no confirmation page, no hop to the ID site); the notice shows on this page.
  if (entry.kind === "signOut") return { href: "#", label: t(ACCOUNT_MENU_LABELS[key]), icon, onSelect: () => { void signOutNow() } }
  return { href: entry.kind === "link" ? entry.href : "#", label: t(ACCOUNT_MENU_LABELS[key]), icon }
}

export function SiteHeader({ home }: { home: boolean }) {
  const { status, me } = useApi()
  const up = status === "up"
  const catalog = useCatalogAccess(me)
  const pathname = usePathname() || "/"
  // «Увійти» is in the static HTML, which cannot know the page address: the return_to joins the link after mount.
  const [signInHref, setSignInHref] = useState(() => new URL(SIGN_IN_URI, ID_ORIGIN).toString())
  useEffect(() => { setSignInHref(idUrl(SIGN_IN_URI)) }, [pathname])
  const entries = accountMenu(
    "main",
    { adminTier: Boolean(me && isAdminTier(me)), catalog, returnTo: typeof window !== "undefined" ? window.location.href : "" },
    { id: ID_ORIGIN, admin: ADMIN_ORIGIN, exercises: EXERCISES_ORIGIN },
  )

  const actions = (
    <div className="site-nav-slot">
      {/* No session: «Увійти» is there at once (also while /auth/me is pending or the API is down). With the sign-in
          hint cookie the generic avatar stands in its place until /auth/me answers (html[data-signed-hint], site.css). */}
      {!me ? (
        <>
          <span className="site-signin">
            <Button variant="primary" href={signInHref}>
              {t("common.signIn")}
            </Button>
          </span>
          <span className="site-avatar-hint" aria-hidden="true">
            <span className="ib-avatar"><Icon name="user" /></span>
          </span>
        </>
      ) : null}
      {up && me ? (
        <>
          <InboxButton />
          <AvatarMenu
            name={`${me.FirstName} ${me.LastName}`.trim() || me.Email}
            email={me.Email}
            picture={mediaUrl(me.Picture)}
            initials={initials(me.FirstName, me.LastName, me.Email)}
            navigation={entries.filter((entry) => entry.kind === "link").map((entry) => avatarEntry(entry) as AvatarMenuItem)}
            items={entries.filter((entry) => entry.kind !== "link").flatMap<AvatarMenuEntry>((entry) => entry.kind === "cookies" ? [{
              href: feedbackHref(t("feedback.subject", { app: t("feedback.app"), page: pathname })),
              label: t("feedback.link"),
              icon: <MessageSquare {...ACCOUNT_MENU_ICON_PROPS} />,
            }, avatarEntry(entry)] : [avatarEntry(entry)])}
          />
        </>
      ) : null}
    </div>
  )

  return (
    <>
      {/* client-only, renders nothing until the banners answer: no landing SSR/LCP cost */}
      <SiteBanners />
      <Navbar
        brandHref={home ? "#main" : "/"}
        links={landingLinks(home ? "" : "/")}
        actions={actions}
      />
    </>
  )
}
