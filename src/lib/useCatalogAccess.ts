"use client"

import { useEffect, useState } from "react"
import { apiGet } from "@/api/client"
import { isAdminTier, type Me } from "@/lib/auth"
import { catalogAllowed } from "@/lib/accountMenu"

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
    apiGet<Parameters<typeof catalogAllowed>[0]>("/api/exercises/access", undefined, { required: false })
      .then((access) => { if (!cancelled) setStaff(catalogAllowed(access)) })
      .catch(() => { if (!cancelled) setStaff(false) })
    return () => { cancelled = true }
  }, [me, adminTier])
  return adminTier || staff
}
