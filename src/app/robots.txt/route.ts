import { MAIN_HOST } from "@/lib/links"

// robots.txt generated at build from the env host. The warm-up hint line is part of the
// robots.txt -> /.well-known/ice/warmup.txt chain (see scripts/warmup.mjs).
export const dynamic = "force-static"

export function GET(): Response {
  const body = ["User-agent: *", "Allow: /", "# Warm-up: /.well-known/ice/warmup.txt", `Sitemap: https://${MAIN_HOST}/sitemap.xml`, ""].join("\n")
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } })
}
