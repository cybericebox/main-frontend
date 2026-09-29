import type React from "react"
import "@/app/globals.css"
import "@/styles/site.css"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import localFont from "next/font/local"
import { ApiProvider } from "@/components/ApiProvider"
import { Analytics } from "@/components/site/Analytics"
import { THEME_BOOT_SCRIPT } from "@/lib/theme"

// Geist Mono as in geist/font/mono, but not preloaded: it only sets small labels, so it must not compete
// with the sans face and the hero image for early bandwidth (it swaps in when used).
const GeistMono = localFont({
    src: "../../node_modules/geist/dist/fonts/geist-mono/GeistMono-Variable.woff2",
    variable: "--font-geist-mono",
    preload: false,
    adjustFontFallback: false,
    fallback: ["ui-monospace", "SFMono-Regular", "Roboto Mono", "Menlo", "Monaco", "Liberation Mono", "DejaVu Sans Mono", "Courier New", "monospace"],
    weight: "100 900",
})

export const metadata: Metadata = {
    title: "Cyber ICE Box Platform",
    description: "A platform for running cyber events and competitions",
    openGraph: {
        title: "Cyber ICE Box Platform",
        description: "A platform for running cyber events and competitions",
        type: "website",
        url: `https://${process.env.NEXT_PUBLIC_DOMAIN}`,
        images: [
            {
                url: `https://${process.env.NEXT_PUBLIC_DOMAIN}/assets/crest.png`,
                alt: "Cyber ICE Box Platform",
            },
        ],
    },
};

// Root layout — HTML shell, theme boot, API probe (optional: the landing renders without the API). Navbar/Footer come
// from the route-group layouts ((main) landing, (legal) documents).
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        // data-theme is set by the boot script before hydration — hence suppressHydrationWarning.
        <html lang="uk" className={`${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
            <head>
                {/* static constant, no user input — runs before paint to avoid a light flash */}
                {/* eslint-disable-next-line @eslint-react/dom-no-dangerously-set-innerhtml */}
                <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
            </head>
            {/* Browser extensions can add attributes to body before React hydrates. */}
            <body suppressHydrationWarning>
                <ApiProvider>{children}</ApiProvider>
                {process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID && <Analytics gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID} />}
            </body>
        </html>
    );
}
