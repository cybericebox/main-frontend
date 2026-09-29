import type { NextConfig } from "next"

// Static export for main-frontend (apex landing app).
// - output: 'export' (production builds only) produces the `out/` directory for static hosting;
//   `next dev` runs as a normal Next app.
// - images.unoptimized: true is required when using static export (no server-side image optimization).
// - no trailingSlash: pages export as /<path>.html and URLs carry no trailing slash,
//   same as id-frontend (nginx resolves $uri.html); 404.html is still emitted.
// Dev-only: the app is served through the nginx edge on the real domain (not
// localhost), so Next's own dev resources (fonts, HMR) are cross-origin and
// blocked by default. Allow NEXT_PUBLIC_DOMAIN plus the known platform domains
// (so dev works even without the env) and their subdomains.
const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN;
const PLATFORM_DOMAINS = ["cybericebox.com", "cybericebox-dev.pp.ua", "cybericebox.pp.ua"];

const nextConfig: NextConfig = {
  output: process.env.NODE_ENV === 'production' ? 'export' : undefined,
  images: {
    unoptimized: true,
  },
  // No 308 slash-normalising redirects in dev/start: they are permanent and get cached
  // by browsers, which can turn into redirect loops if the slash policy ever changes.
  skipTrailingSlashRedirect: true,
  allowedDevOrigins: [...new Set([...(DOMAIN ? [DOMAIN] : []), ...PLATFORM_DOMAINS])].flatMap((d) => [d, `*.${d}`]),
};

export default nextConfig;
