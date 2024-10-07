"use client";
import type React from "react";
import {deleteCookie, getCookie} from "cookies-next"
import {AuthenticatedClient} from "@/hooks/auth/client";

export function WithUserAuthentication({children}: { children: React.ReactNode }) {
    if (typeof window !== "undefined") {
        const user = AuthenticatedClient()
        if (user.IsAuthenticated) {
            return children
        }
        window.location.reload()
    }
    return null
}

export const SignInLink = "/sign-in"
export const SignUpLink = "/sign-up"
export const ForgotPasswordLink = "/forgot-password"
export const GoogleAPILink = "/api/auth/google"

const fromURLField = "fromURL"

export function GetFromURL(defaultValue: string): string {
    const value = getCookie(fromURLField)
    deleteCookie(fromURLField, {
        path: "/",
        domain: `.${process.env.NEXT_PUBLIC_DOMAIN || ""}`,
        secure: true,
    })
    return value || defaultValue
}