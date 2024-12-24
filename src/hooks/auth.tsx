"use client";
import type React from "react";
import {deleteCookie as deleteCookieOnClient, getCookie as getCookieOnClient} from "cookies-next/client"
import {getCookie as getCookieOnServer} from "cookies-next/server";
import {type IAuthenticated} from "@/types/auth";

const permissionsTokenField = "permissionsToken"

function AuthenticatedOnClient(): IAuthenticated {
    try {
        const token = getCookieOnClient(permissionsTokenField)
        // if no token, return false
        if (!token) {
            return {
                IsAuthenticated: false,
                ID: ""
            }
        }
            const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
            const userID = payload?.sub
            return {
                IsAuthenticated: !!userID,
                ID: userID
            }

    } catch (e) {
        return {
            IsAuthenticated: false,
            ID: ""
        }
    }
}

async function AuthenticatedOnServer(): Promise<IAuthenticated> {
    try {
        const token = await getCookieOnServer(permissionsTokenField)
        // if no tokenPromise, return false
        if (!token) {
            return {
                IsAuthenticated: false,
                ID: ""
            }
        }

        // if token is string, parse it
            const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
            const userID = payload?.sub
            return {
                IsAuthenticated: !!userID,
                ID: userID
            }

    } catch (e) {
        return {
            IsAuthenticated: false,
            ID: ""
        }
    }

}

export function WithUserAuthentication({children}: { children: React.ReactNode }) {
    const user = AuthenticatedOnClient()
    if (user.IsAuthenticated) {
        return children
    }
    return null
}

export const SignInLink = "/sign-in"
export const SignUpLink = "/sign-up"
export const ForgotPasswordLink = "/forgot-password"
export const GoogleAPILink = "/api/auth/google"

const fromURLField = "fromURL"

// Get the value of the fromURL cookie and delete it from the client
export function GetFromURL(defaultValue: string): string {
    const value = getCookieOnClient(fromURLField)
    deleteCookieOnClient(fromURLField, {
        path: "/",
        domain: `.${process.env.NEXT_PUBLIC_DOMAIN || ""}`,
        secure: true,
    })
    if (typeof value === "string") {
        return value || defaultValue
    }
    return defaultValue
}

