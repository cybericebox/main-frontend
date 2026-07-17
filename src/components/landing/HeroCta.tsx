"use client"

import { Button } from "@/components/ui/button"
import { useAuthState } from "@/lib/useAuthState"
import { t } from "@/i18n/t"
import { SIGN_UP_URI, ADMIN_ORIGIN } from "@/lib/links"

/**
 * Role-aware hero CTA:
 *   - loading    → reserve the button's height (no layout jump)
 *   - anon       → sign-up ("Get started")
 *   - admin-tier → "Go to admin" (admin subdomain)
 *   - plain user → hidden (event participants will get a "Go to event" CTA later)
 *
 * Privileged = any non-"user" role, mirroring the Header's display hint. The
 * authoritative authorization lives server-side; this only chooses the CTA.
 */
export function HeroCta() {
  const { status, me } = useAuthState()

  if (status === "loading") return <div className="h-10" aria-hidden />

  if (status === "anon" || me === null) {
    return (
      <Button asChild className="facet glow">
        <a href={SIGN_UP_URI}>{t("landing.hero.primaryCta")}</a>
      </Button>
    )
  }

  if (me.Role !== "user") {
    return (
      <Button asChild className="facet glow">
        <a href={ADMIN_ORIGIN}>{t("landing.hero.adminCta")}</a>
      </Button>
    )
  }

  return null
}
