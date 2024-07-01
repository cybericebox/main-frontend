"use client";

import {deleteCookie, getCookie} from "cookies-next";

export const SignInLink = "/sign-in"
export const SignUpLink = "/sign-up"
export const ForgotPasswordLink = "/forgot-password"
export const GoogleAPILink = "/api/auth/google"

const fromURLField = "fromURL"

const accessTokenField = "permissionsToken"

export function IsAuthenticated() {
    return !!getCookie(accessTokenField)
}

export function GetFromURL(defaultValue: string): string {
    const value = getCookie(fromURLField)
    deleteCookie(fromURLField, {
        path: "/",
        domain: `.${process.env.DOMAIN || window.location.hostname}`,
        secure: process.env.NODE_ENV === "production"
    })
    return value || defaultValue
}



