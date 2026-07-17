"use client"

import { useState } from "react"
import { Menu, User, X } from "lucide-react"

import { type Me } from "@/lib/auth"
import { useAuthState } from "@/lib/useAuthState"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/brand/Logo"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { t } from "@/i18n/t"
import { ID_ORIGIN, ADMIN_ORIGIN, PROFILE_URI, SIGN_OUT_URI, SIGN_IN_URI } from "@/lib/links"

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
  const url = new URL(path, ID_ORIGIN)
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

// Anchors point at the landing path (/#...), not bare #..., so they work from any
// page (e.g. /privacy navigates home then scrolls) instead of resolving the hash
// on the current page.
const NAV_ANCHORS: { href: string; label: string }[] = [
  { href: "/#showcase", label: "landing.nav.showcase" },
  { href: "/#labs", label: "landing.nav.labs" },
  { href: "/#faq", label: "landing.nav.faq" },
]

export default function Header() {
  // Auth-state orchestration (silent-authn + anon-marker loop-prevention) lives
  // in one place — the useAuthState hook. The Header just renders from `status`:
  //   "loading" → neutral placeholder (also covers a pending silent redirect)
  //   "anon"    → Sign-in
  //   "authed"  → avatar / menu
  const { status, me } = useAuthState()

  // Scroll-aware frosting is pure CSS now (.scroll-frost + a scroll-driven
  // animation in globals.css): transparent over the hero, frosting in over the
  // first 48px of window scroll. No JS listener — the browser drives it.
  const [menuOpen, setMenuOpen] = useState(false)

  // The auth control resolves async (loading → sign-in button / authed avatar).
  // Reserve a fixed slot sized to the WIDEST control (the sign-in button) with an
  // invisible ghost, and overlay the real control right-aligned. Every state then
  // occupies the same width, so the nav never shifts when auth state settles —
  // and nothing renders (no Sign-in flash) until the state is known.
  const authControl = (
    <div className="relative flex items-center justify-end">
      <span className="pointer-events-none invisible" aria-hidden>
        <Button variant="outline" size="sm">
          {t("common.signIn")}
        </Button>
      </span>
      <span className="absolute inset-y-0 right-0 flex items-center">
        {status === "loading" ? null : status === "anon" || me === null ? (
          <Button asChild variant="outline" size="sm">
            <a href={idUrl(SIGN_IN_URI)}>{t("common.signIn")}</a>
          </Button>
        ) : (
          <AuthedMenu me={me} />
        )}
      </span>
    </div>
  )


  return (
    <header className="scroll-frost sticky top-0 z-50">

      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <a href="/" className="glow flex items-center" aria-label="CyberICEBox — ICE CTF">
          <Logo size={44} href={null} />
        </a>
        <nav className="hidden items-center gap-6 md:flex">
          {NAV_ANCHORS.map((a) => (
            <a key={a.href} href={a.href} className="text-sm text-foreground/70 transition-colors hover:text-foreground">
              {t(a.label)}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {authControl}
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-foreground/80 hover:text-foreground md:hidden"
            aria-label="Menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {menuOpen && (
        <nav className="border-t border-[var(--frost-border)] px-4 py-3 md:hidden">
          <div className="mx-auto flex max-w-5xl flex-col gap-3">
            {NAV_ANCHORS.map((a) => (
              <a
                key={a.href}
                href={a.href}
                onClick={() => setMenuOpen(false)}
                className="text-sm text-foreground/80 transition-colors hover:text-foreground"
              >
                {t(a.label)}
              </a>
            ))}
          </div>
        </nav>
      )}
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
          {me.Picture ? (
            // eslint-disable-next-line @next/next/no-img-element -- static export, unoptimized images
            <img
              src={me.Picture}
              alt={fullName}
              referrerPolicy="no-referrer"
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
          <a href={idUrl(PROFILE_URI)}>{t("nav.profile")}</a>
        </DropdownMenuItem>

        {PRIVILEGED && (
          <DropdownMenuItem asChild>
            <a href={ADMIN_ORIGIN}>{t("nav.admin")}</a>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <a href={idUrl(SIGN_OUT_URI)}>{t("common.signOut")}</a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
