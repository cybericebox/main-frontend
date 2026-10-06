import type { NextConfig } from "next"

// Static export for main-frontend (apex landing app).
// - output: 'export' (production builds only) produces the `out/` directory for static hosting;
//   `next dev` runs as a normal Next app.
// - images.unoptimized: true is required when using static export (no server-side image optimization).
// - trailingSlash: true, see the option below; 404.html is still emitted.

// One base domain: NEXT_PUBLIC_DOMAIN is the only host input and every host derives from it (src/**/hosts.ts, deploy/base-domain.sh; the daemon and
// the infrastructure renderer share the rule and tests/base-domain-vectors.json). The Docker build bakes a placeholder for it.
const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN ?? ""
if (!DOMAIN) throw new Error("NEXT_PUBLIC_DOMAIN is required")
if (DOMAIN !== "__NEXT_PUBLIC_DOMAIN__" && (DOMAIN.length > 253 || !/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/.test(DOMAIN))) {
  throw new Error(`NEXT_PUBLIC_DOMAIN must be a bare lowercase host name (no scheme, port or path), got: ${DOMAIN}`)
}
const PLATFORM_HOSTS = [DOMAIN, `api.${DOMAIN}`, `id.${DOMAIN}`, `admin.${DOMAIN}`, `exercises.${DOMAIN}`]

// The mailboxes are explicit per-site values besides the domain; a missing one fails the build / dev start.
const REQUIRED = ["NEXT_PUBLIC_SUPPORT_EMAIL", "NEXT_PUBLIC_CONTACT_EMAIL", "NEXT_PUBLIC_PRIVACY_EMAIL", "NEXT_PUBLIC_SECURITY_EMAIL"];
const missing = REQUIRED.filter((k) => !process.env[k]);
if (missing.length) throw new Error(`Missing required env: ${missing.join(", ")}`);

// Dev-only: the app is served through the edge on the real hosts (not localhost), so Next's own
// dev resources (fonts, HMR) are cross-origin and blocked by default. Allow every configured
// host plus the event domain and its subdomains; DEV_ALLOWED_ORIGINS (comma list) adds more.
const env = process.env;
const allowedDevOrigins = [
  ...PLATFORM_HOSTS,
  `*.${DOMAIN}`,
  ...(env.DEV_ALLOWED_ORIGINS ?? "").split(",").map((s) => s.trim()),
].filter((s): s is string => !!s);

// Dev-only Content-Security-Policy (`next dev` serves real headers; the export gets its CSP from
// deploy/csp.sh at container start, so `headers` is not defined for production builds).
// Same directives as production, except script-src: dev needs inline scripts and eval (React dev
// stack, HMR) and cannot use hashes, and connect-src also allows the HMR websocket.
// Hosts and vendor toggles come from the same env as production.
function devContentSecurityPolicy(): string {
  const api = `https://api.${DOMAIN}`
  const script = ["'self'", "'unsafe-inline'", "'unsafe-eval'"]
  const connect = ["'self'", api, "ws:", "wss:"]
  if (process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID?.trim()) {
    script.push("https://www.googletagmanager.com")
    connect.push("https://*.google-analytics.com", "https://*.analytics.google.com", "https://*.googletagmanager.com", "https://www.google.com/ccm/", "https://*.doubleclick.net")
  }
  return [
    "default-src 'self'",
    `script-src ${script.join(" ")}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    `connect-src ${connect.join(" ")}`,
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; ")
}

const nextConfig: NextConfig = {
  ...(process.env.NODE_ENV === "development"
    ? { headers: async () => [{ source: "/:path*", headers: [{ key: "Content-Security-Policy", value: devContentSecurityPolicy() }] }] }
    : {}),
  output: process.env.NODE_ENV === 'production' ? 'export' : undefined,
  images: {
    unoptimized: true,
  },
  // trailingSlash: every page exports as /<path>/index.html and the canonical URL ends with a slash. Without it a nested
  // route (profile, profile/sessions) exported both profile.html and a profile/ directory, which nginx answered with 403.
  // nginx redirects a slashless page path once to the slashed one (deploy/nginx/server.conf).
  trailingSlash: true,
  allowedDevOrigins: [...new Set(allowedDevOrigins)],
};

export default nextConfig;
