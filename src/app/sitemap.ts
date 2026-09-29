import type { MetadataRoute } from "next"

// Static sitemap.xml for the public pages of the landing app.
export const dynamic = "force-static"

const origin = `https://${process.env.NEXT_PUBLIC_DOMAIN}`
const PATHS = ["/", "/privacy", "/terms", "/cookies", "/security"]

export default function sitemap(): MetadataRoute.Sitemap {
  return PATHS.map((path) => ({ url: `${origin}${path === "/" ? "" : path}` }))
}
