"use client"

import { Navbar } from "@/components/ib/Navbar"
import { Button } from "@/components/ib/Button"
import { AvatarMenu, initials } from "@/components/ib/AvatarMenu"
import { InboxButton } from "@/components/site/InboxButton"
import { t } from "@/i18n/t"
import { useApi } from "@/lib/useApi"
import { idUrl, isAdminTier } from "@/lib/auth"
import { ADMIN_ORIGIN, PROFILE_URI, SIGN_IN_URI, SIGN_OUT_URI } from "@/lib/links"
import { mediaUrl } from "@/api/client"
import { landingLinks } from "./sections"

// Platform navbar. Actions depend on the API probe (lib/useApi): absent while
// pending/down (their slot keeps its width), «Увійти» for anonymous visitors,
// the avatar menu for signed-in users (+ «Адміністрування» for admin-tier).
export function SiteHeader({ home }: { home: boolean }) {
  const { status, me } = useApi()
  const up = status === "up"

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
            items={[
              { href: idUrl(PROFILE_URI), label: t("nav.profile"), icon: "user" },
              ...(isAdminTier(me) ? [{ href: ADMIN_ORIGIN, label: t("nav.admin"), icon: "settings" }] : []),
            ]}
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
