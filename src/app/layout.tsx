import type React from "react";
import "@/app/globals.css";
import Providers from "@/utils/providers";
import {Toaster} from "react-hot-toast";
import Footer from "@/components/Footer";
import type {Metadata} from "next";
import {GoogleAnalytics} from '@next/third-parties/google'

export const metadata: Metadata = {
    title: "Cyber ICE Box Platform",
    description: "Cyber ICE Box Platform",
    openGraph: {
        title: "Cyber ICE Box Platform",
        description: "Cyber ICE Box Platform",
        type: "website",
        url: `https://${process.env.NEXT_PUBLIC_DOMAIN}`,
        images: [
            {
                url: `https://${process.env.NEXT_PUBLIC_DOMAIN}/favicon.ico`,
                width: 1200,
                height: 600,
                alt: "Cyber ICE Box Platform",
            }
        ],
    },
};


export default function RootLayout({children}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="uk">
        <body>
        <Providers>
            <main>
                {children}
            </main>
            <Footer/>
            <Toaster position={"top-center"} toastOptions={{duration: 3000}}/>
            <GoogleAnalytics
                gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID || ""}
            />
        </Providers>
        </body>
        </html>
    );
}