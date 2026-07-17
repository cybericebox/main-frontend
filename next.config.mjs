/** @type {import('next').NextConfig} */

// Static export for main-frontend (apex landing app).
// - output: 'export' produces the `out/` directory for static hosting.
// - images.unoptimized: true is required when using static export (no server-side image optimization).
// - trailingSlash: true keeps paths clean for static hosting and emits 404.html for unmatched paths.
// Dev-only: the app is served through the nginx edge on the real domain (not
// localhost), so Next's own dev resources (fonts, HMR) are cross-origin and
// blocked by default. Allow the platform domain + its subdomains, derived from
// the single NEXT_PUBLIC_DOMAIN (one source of truth).
const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN;

const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  allowedDevOrigins: DOMAIN ? [DOMAIN, `*.${DOMAIN}`] : [],
};

export default nextConfig;
