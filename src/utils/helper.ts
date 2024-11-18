import {z} from "zod";

export function parseSignUpToken(token: string): { code: string, email: string } {
    let t = token.split("!")
    try {
        const res = z.string().email().safeParse(atob(t[1]))
        if (!res.success) {
            return {code: "", email: ""}
        }
        return {code: t[0], email: res.data}
    } catch (e) {
        return {code: "", email: ""}
    }
}