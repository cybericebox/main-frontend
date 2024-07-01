export function parseSignUpToken(token: string): { code: string, email: string } {
    let t = token.split("!")
    try {
        return {code: t[0], email: atob(t[1])}
    } catch (e) {
        return {code: "", email: ""}
    }
}

import {unstable_noStore as noStore} from "next/cache";

export default function getEnv(name: string) {
    noStore();
    return process.env[name];
}