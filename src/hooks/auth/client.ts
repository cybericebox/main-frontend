"use client";
import {getCookie} from "cookies-next"
import {IAuthenticated} from "@/types/auth";

const permissionsTokenField = "permissionsToken"

export function AuthenticatedClient(): IAuthenticated {
    const token = getCookie(permissionsTokenField) || ""
    try {
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





