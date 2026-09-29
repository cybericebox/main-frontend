"use client"

/**
 * src/lib/accountMenu.ts — the platform-wide account menu.
 *
 * Every frontend shows the same items in the same order: «Профіль»,
 * «Адміністрування» (admin-tier), «Каталог завдань» (admins and event staff),
 * «Головна», then «Вийти». The item pointing to the current app is hidden.
 */

import { useEffect, useState } from "react"
import { apiGet } from "@/api/client"
import { isAdminTier, type Me } from "@/lib/auth"
import { ADMIN_ORIGIN, EXERCISES_ORIGIN, ID_ORIGIN, PROFILE_URI } from "@/lib/links"

export type AccountLinkKey = "profile" | "admin" | "exercises" | "main"
export type AccountLink = { key: AccountLinkKey; href: string }

/** Account menu links for the landing (the landing itself is «Головна», hidden). */
export function accountLinks({ adminTier, catalog, returnTo }: { adminTier: boolean; catalog: boolean; returnTo: string }): AccountLink[] {
  const profile = new URL(PROFILE_URI, ID_ORIGIN)
  if (returnTo) profile.searchParams.set("return_to", returnTo)
  return [
    { key: "profile", href: profile.toString() },
    ...(adminTier ? [{ key: "admin" as const, href: ADMIN_ORIGIN }] : []),
    ...(catalog ? [{ key: "exercises" as const, href: EXERCISES_ORIGIN }] : []),
  ]
}

/**
 * Whether the exercise catalog opens for this user: admin-tier, or staff of at
 * least one event (GET /api/exercises/access — the same rule as the catalog's gate).
 */
export function useCatalogAccess(me: Me | null): boolean {
  const adminTier = me ? isAdminTier(me) : false
  const [staff, setStaff] = useState(false)
  useEffect(() => {
    if (!me || adminTier) return
    let cancelled = false
    apiGet<{ IsAdmin?: boolean; Events?: unknown[] | null } | null>("/api/exercises/access", undefined, { required: false })
      .then((access) => { if (!cancelled) setStaff(Boolean(access?.IsAdmin) || (access?.Events?.length ?? 0) > 0) })
      .catch(() => { if (!cancelled) setStaff(false) })
    return () => { cancelled = true }
  }, [me, adminTier])
  return adminTier || staff
}
