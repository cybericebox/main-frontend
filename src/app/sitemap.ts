import type { MetadataRoute } from "next"
import { MAIN_HOST } from "@/lib/links"

// Static sitemap.xml for the public pages of the landing app.
export const dynamic = "force-static"

const origin = `https://${MAIN_HOST}`
const PATHS = ["/", "/privacy/", "/terms/", "/cookies/", "/security/"]

export default function sitemap(): MetadataRoute.Sitemap {
  return PATHS.map((path) => ({ url: `${origin}${path === "/" ? "" : path}` }))
}
