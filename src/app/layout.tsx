import type React from "react"
import "@/app/globals.css"
import "@/styles/site.css"
import type { Metadata } from "next"
import { GoogleAnalytics } from "@next/third-parties/google"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { ApiProvider } from "@/components/ApiProvider"
import { THEME_BOOT_SCRIPT } from "@/lib/theme"

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
                <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID || ""} />
            </body>
        </html>
    );
}
