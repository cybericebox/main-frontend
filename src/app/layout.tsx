import type React from "react";
import "@/app/globals.css";
import type { Metadata } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { QueryProvider } from "@/components/QueryProvider";

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
                url: `https://${process.env.NEXT_PUBLIC_DOMAIN}/favicon.ico`,
                width: 1200,
                height: 600,
                alt: "Cyber ICE Box Platform",
            },
        ],
    },
};

// Root layout — HTML shell only. Header/Footer are provided by route-group
// layouts: (main) adds them for landing; (legal) pages manage their own chrome
// via the DS LegalPage component.
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="uk" className={`${GeistSans.variable} ${GeistMono.variable}`}>
            <body className="grid-bg">
                <QueryProvider>{children}</QueryProvider>
                <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID || ""} />
            </body>
        </html>
    );
}
