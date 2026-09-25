import type { NextConfig } from "next"

// Static export for main-frontend (apex landing app).
// - output: 'export' produces the `out/` directory for static hosting.
// - images.unoptimized: true is required when using static export (no server-side image optimization).
// - no trailingSlash: pages export as /<path>.html and URLs carry no trailing slash,
//   same as id-frontend (nginx resolves $uri.html); 404.html is still emitted.
// Dev-only: the app is served through the nginx edge on the real domain (not
// localhost), so Next's own dev resources (fonts, HMR) are cross-origin and
// blocked by default. Allow the platform domain + its subdomains, derived from
// the single NEXT_PUBLIC_DOMAIN (one source of truth).
const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN;

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // No 308 slash-normalising redirects in dev/start: they are permanent and get cached
  // by browsers, which can turn into redirect loops if the slash policy ever changes.
  skipTrailingSlashRedirect: true,
  allowedDevOrigins: DOMAIN ? [DOMAIN, `*.${DOMAIN}`] : [],
};

export default nextConfig;
