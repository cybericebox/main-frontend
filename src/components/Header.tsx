"use client"

import { useEffect, useState } from "react"
import { User } from "lucide-react"

import { fetchMe, type Me } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { t } from "@/i18n/t"

// ---------------------------------------------------------------------------
// Cross-origin helpers
//
// ID_ORIGIN — the identity server (Authorization Server). All auth navigations
// (sign-in / profile / sign-out) are plain top-level anchors to this origin so
// the master session cookie on id.<domain> is in scope.
//   NEXT_PUBLIC_ID_ORIGIN takes precedence; otherwise derive from the platform
//   domain (id.<domain>).
// ADMIN_ORIGIN — the admin app (admin.<domain>); shown only as a display hint.
// ---------------------------------------------------------------------------
const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN ?? ""
const ID_ORIGIN =
  process.env.NEXT_PUBLIC_ID_ORIGIN ?? `https://id.${DOMAIN}`
const ADMIN_ORIGIN = `https://admin.${DOMAIN}`

/**
 * currentUrl — the absolute URL of the current main page, used as return_to so
 * the id app bounces the user straight back here after the auth action.
 * SSR/static-safe: returns "" when window is unavailable.
 */
function currentUrl(): string {
  if (typeof window === "undefined") return ""
  return window.location.href
}

/** Build an id-app URL with a return_to back to the current main page. */
function idUrl(path: string): string {
  const url = new URL(path, ID_ORIGIN || "https://id.local")
  const ret = currentUrl()
  if (ret) url.searchParams.set("return_to", ret)
  return url.toString()
}

/** Initials fallback for the avatar when no image is present. */
function initials(me: Me): string {
  const f = me.FirstName?.trim()?.[0] ?? ""
  const l = me.LastName?.trim()?.[0] ?? ""
  const both = `${f}${l}`.toUpperCase()
  if (both) return both
  return (me.Email?.trim()?.[0] ?? "?").toUpperCase()
}

export default function Header() {
  // me === undefined → loading (avoid layout shift with a neutral slot)
  // me === null       → unauthenticated
  // me === Me         → authenticated
  const [me, setMe] = useState<Me | null | undefined>(undefined)

  useEffect(() => {
    let cancelled = false
    fetchMe()
      .then((res) => {
        if (!cancelled) setMe(res)
      })
      .catch(() => {
        // Unexpected error (5xx / network): treat as signed-out for display.
        if (!cancelled) setMe(null)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <header className="flex items-center justify-between px-4 py-3">
      <a href="/" className="text-base font-semibold">
        {t("landing.title")}
      </a>

      <div className="flex items-center">
        {me === undefined ? (
          // Loading: neutral placeholder sized like the avatar to avoid shift.
          <div className="h-9 w-9" aria-hidden />
        ) : me === null ? (
          // Unauthenticated: plain anchor to the id sign-in page.
          <Button asChild variant="outline" size="sm">
            <a href={idUrl("/sign-in")}>{t("common.signIn")}</a>
          </Button>
        ) : (
          <AuthedMenu me={me} />
        )}
      </div>
    </header>
  )
}

function AuthedMenu({ me }: { me: Me }) {
  // Display-only privileged hint. The authoritative authorization check lives
  // server-side in the daemon rbac middleware; this only toggles the Admin link.
  const PRIVILEGED = me.Role !== "user"

  const fullName = `${me.FirstName} ${me.LastName}`.trim() || me.Email

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-muted text-sm font-medium focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
          aria-label={fullName}
        >
          {me.Avatar ? (
            // eslint-disable-next-line @next/next/no-img-element -- static export, unoptimized images
            <img
              src={me.Avatar}
              alt={fullName}
              className="h-full w-full object-cover"
            />
          ) : initials(me) !== "?" ? (
            <span>{initials(me)}</span>
          ) : (
            <User className="h-4 w-4" />
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="font-medium">{fullName}</span>
          <span className="text-xs font-normal text-muted-foreground">
            {me.Email}
          </span>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <a href={idUrl("/profile")}>{t("nav.profile")}</a>
        </DropdownMenuItem>

        {PRIVILEGED && (
          <DropdownMenuItem asChild>
            <a href={ADMIN_ORIGIN}>{t("nav.admin")}</a>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <a href={idUrl("/sign-out")}>{t("common.signOut")}</a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
