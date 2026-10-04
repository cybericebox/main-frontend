import { MAIN_HOST, SECURITY_EMAIL } from "@/lib/links"

// RFC 9116 security.txt generated at build from the env host and mailbox.
export const dynamic = "force-static"

export function GET(): Response {
  const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().replace(/\.\d{3}Z$/, "Z")
  const body = [
    "# Cyber ICE Box — vulnerability disclosure (RFC 9116).",
    "# Report vulnerabilities in the platform itself, not in training targets.",
    `Contact: mailto:${SECURITY_EMAIL}`,
    `Expires: ${expires}`,
    "Preferred-Languages: uk, en",
    `Canonical: https://${MAIN_HOST}/.well-known/security.txt`,
    `Policy: https://${MAIN_HOST}/security`,
    "",
  ].join("\n")
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } })
}
