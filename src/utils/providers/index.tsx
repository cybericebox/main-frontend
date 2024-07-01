'use client'

import type React from "react";
import {ReCaptchaProvider} from "next-recaptcha-v3";
import QueryProvider from "@/utils/providers/queryProvider";
import {Tooltip} from "react-tooltip";

export default function Providers({children, siteKey}: Readonly<{
    children: React.ReactNode,
    siteKey: string | undefined
}>) {
    return (
        <QueryProvider>
            <ReCaptchaProvider
                language={"uk"}
                reCaptchaKey={siteKey}
            >
                {children}
                <Tooltip
                    id={"tooltip"}
                    className={"!bg-primary"}
                />
            </ReCaptchaProvider>
        </QueryProvider>
    );
}