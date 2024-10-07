'use client'

import type React from "react";
import {ReCaptchaProvider} from "next-recaptcha-v3";
import QueryProvider from "@/utils/providers/queryProvider";
import {Tooltip} from "react-tooltip";

export default function Providers({children}: Readonly<{
    children: React.ReactNode,
}>) {
    return (
        <QueryProvider>
            <ReCaptchaProvider
                language={"uk"}
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