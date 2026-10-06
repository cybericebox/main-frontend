import type React from "react"
import "@/app/globals.css"
import "@/styles/site.css"
import type { Metadata, Viewport } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { ApiProvider } from "@/components/ApiProvider"
import { Analytics } from "@/components/site/Analytics"
import { TooltipClamp } from "@/components/ib/TooltipClamp"
import { THEME_BOOT_SCRIPT } from "@/lib/theme"
import { pageMetadata } from "@/lib/metadata"
import { t } from "@/i18n/t"

export const metadata: Metadata = pageMetadata({ title: t("meta.home.title"), description: t("meta.home.description") })

// Browser chrome follows the navbar surface (--ib-surface per theme).
export const viewport: Viewport = {
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
        { media: "(prefers-color-scheme: dark)", color: "#413F4E" },
    ],
}

// Root layout — HTML shell, theme boot, API probe (optional: the landing renders without the API). Navbar/Footer come
// from the route-group layouts ((main) landing, (legal) documents).
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        // data-theme is set by the boot script before hydration — hence suppressHydrationWarning.
        <html lang="uk" className={`${GeistSans.variable} ${GeistMono.variable}`} data-scroll-behavior="smooth" suppressHydrationWarning>
            <head>
                {/* static constant, no user input — runs before paint to avoid a light flash */}
                {/* eslint-disable-next-line @eslint-react/dom-no-dangerously-set-innerhtml */}
                <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
            </head>
            {/* Browser extensions can add attributes to body before React hydrates. */}
            <body suppressHydrationWarning>
                {/* first in the tab order: jumps over the navbar to <main id="main"> */}
                <a className="site-skip" href="#main">{t("a11y.skip")}</a>
                <ApiProvider>{children}</ApiProvider>
                {/* the consent panel is always mounted («Налаштування файлів cookie»); GA loads only when configured */}
                <Analytics gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID} />
                {/* keeps ds tooltips inside the viewport on narrow screens */}
                <TooltipClamp />
            </body>
        </html>
    );
}
