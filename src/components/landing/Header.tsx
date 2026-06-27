"use client"

import { useEffect, useState } from "react"
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

// ---------------------------------------------------------------------------
// Cross-origin helpers (env-var driven — production-ready)
// ---------------------------------------------------------------------------
const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN ?? ""
const ID_ORIGIN =
  process.env.NEXT_PUBLIC_ID_ORIGIN ?? `https://id.${DOMAIN}`
const ADMIN_ORIGIN = `https://admin.${DOMAIN}`

function currentUrl(): string {
  if (typeof window === "undefined") return ""
  return window.location.href
}

function idUrl(path: string): string {
  const url = new URL(path, ID_ORIGIN || "https://id.local")
  const ret = currentUrl()
  if (ret) url.searchParams.set("return_to", ret)
  return url.toString()
}

function initials(me: Me): string {
  const f = me.FirstName?.trim()?.[0] ?? ""
  const l = me.LastName?.trim()?.[0] ?? ""
  const both = `${f}${l}`.toUpperCase()
  if (both) return both
  return (me.Email?.trim()?.[0] ?? "?").toUpperCase()
}

// Anchors point at the landing path (/#...), not bare #..., so they work from any
// page instead of resolving the hash on the current page.
const NAV_ANCHORS: { href: string; label: string }[] = [
  { href: "/#showcase", label: "landing.nav.showcase" },
  { href: "/#labs", label: "landing.nav.labs" },
  { href: "/#faq", label: "landing.nav.faq" },
]

export function Header() {
  const { status, me } = useAuthState()

  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const authControl =
    status === "loading" ? (
      <div className="h-9 w-9" aria-hidden />
    ) : status === "anon" || me === null ? (
      <Button asChild variant="outline" size="sm">
        <a href={idUrl("/sign-in")}>{t("common.signIn")}</a>
      </Button>
    ) : (
      <AuthedMenu me={me} />
    )

  return (
    <header
      className={`sticky top-0 z-50 transition-colors ${
        scrolled ? "frost-panel" : "bg-transparent border-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <a href="/" className="glow flex items-center" aria-label="CyberICEBox — ICE CTF">
          <Logo size={44} />
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
