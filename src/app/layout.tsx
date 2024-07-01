import type React from "react";
import "@/app/globals.css";
import Providers from "@/utils/providers";
import {Toaster} from "react-hot-toast";
import Footer from "@/components/Footer";
import {GoogleAnalytics} from '@next/third-parties/google'
import type {Metadata} from "next";
import getEnv from "@/utils/helper";

export const metadata: Metadata = {
    title: "Cyber ICE Box Platform",
    description: "Cyber ICE Box Platform",
};


export default function RootLayout({children}: Readonly<{ children: React.ReactNode }>) {

    const recaptchaKey = getEnv("RECAPTCHA_KEY")

    return (
        <html lang="uk">
        <body>
        <Providers siteKey={recaptchaKey}>
            {/*<Header/>*/}
            <main>
                {children}
            </main>
            <Footer/>
            <Toaster position={"bottom-center"}/>
        </Providers>
        </body>
        {process.env.GOOGLE_ANALYTICS_ID && <GoogleAnalytics gaId={process.env.GOOGLE_ANALYTICS_ID}/>}
        </html>
    );
}