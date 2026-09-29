"use client"

import { Navbar } from "@/components/ib/Navbar"
import { Button } from "@/components/ib/Button"
import { AvatarMenu, initials } from "@/components/ib/AvatarMenu"
import { InboxButton } from "@/components/site/InboxButton"
import { t } from "@/i18n/t"
import { useApi } from "@/lib/useApi"
import { idUrl, isAdminTier } from "@/lib/auth"
import { SIGN_IN_URI, SIGN_OUT_URI } from "@/lib/links"
import { accountLinks, useCatalogAccess, type AccountLinkKey } from "@/lib/accountMenu"
import { mediaUrl } from "@/api/client"
import { landingLinks } from "./sections"

// Platform navbar. Actions depend on the API probe (lib/useApi): absent while
// pending/down (their slot keeps its width), «Увійти» for anonymous visitors,
// the avatar menu (lib/accountMenu) for signed-in users.
const ACCOUNT_ITEMS: Record<AccountLinkKey, { label: string; icon: string }> = {
  profile: { label: "nav.profile", icon: "user" },
  admin: { label: "nav.admin", icon: "settings" },
  exercises: { label: "nav.exercises", icon: "puzzle" },
  main: { label: "nav.home", icon: "home" },
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
            items={accountLinks({
              adminTier: isAdminTier(me),
              catalog,
              returnTo: typeof window !== "undefined" ? window.location.href : "",
            }).map(({ key, href }) => ({ href, label: t(ACCOUNT_ITEMS[key].label), icon: ACCOUNT_ITEMS[key].icon }))}
            footer={{ href: idUrl(SIGN_OUT_URI), label: t("common.signOut"), icon: "logout" }}
          />
        </>
      ) : null}
    </div>
  )

  return (
    <Navbar
      brandHref={home ? "#top" : "/"}
      links={landingLinks(home ? "" : "/")}
      actions={actions}
    />
  )
}
