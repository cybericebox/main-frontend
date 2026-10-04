import type { NextConfig } from "next"

// Static export for main-frontend (apex landing app).
// - output: 'export' (production builds only) produces the `out/` directory for static hosting;
//   `next dev` runs as a normal Next app.
// - images.unoptimized: true is required when using static export (no server-side image optimization).
// - no trailingSlash: pages export as /<path>.html and URLs carry no trailing slash,
//   same as id-frontend (nginx resolves $uri.html); 404.html is still emitted.

// One base domain: every host that is not set is derived from NEXT_PUBLIC_DOMAIN (the rule of deploy/base-domain.sh, the same file in every
// frontend). The Docker build bakes placeholders for the hosts and has no DOMAIN, so nothing is derived there.
const HOSTS = [
  ["NEXT_PUBLIC_MAIN_HOST", ""],
  ["NEXT_PUBLIC_API_HOST", "api."],
  ["NEXT_PUBLIC_ID_HOST", "id."],
  ["NEXT_PUBLIC_ADMIN_HOST", "admin."],
  ["NEXT_PUBLIC_EXERCISES_HOST", "exercises."],
  ["NEXT_PUBLIC_EVENT_DOMAIN", ""],
  ["NEXT_PUBLIC_COOKIE_DOMAIN", ""],
] as const
const domain = process.env.NEXT_PUBLIC_DOMAIN ?? ""
if (domain && (domain.length > 253 || !/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/.test(domain))) {
  throw new Error(`NEXT_PUBLIC_DOMAIN must be a bare lower case host name (no scheme, port or path), got: ${domain}`)
}
for (const [name, prefix] of HOSTS) {
  if (process.env[name]?.trim()) continue
  if (!domain) throw new Error(`${name} is required (set it, or set NEXT_PUBLIC_DOMAIN and it is derived)`)
  process.env[name] = prefix + domain
}

// Every operator value comes from the env; a missing one fails the build / dev start.
const REQUIRED = [
  "NEXT_PUBLIC_CONTACT_EMAIL",
  "NEXT_PUBLIC_SUPPORT_EMAIL",
  "NEXT_PUBLIC_PRIVACY_EMAIL",
  "NEXT_PUBLIC_SECURITY_EMAIL",
  "NEXT_PUBLIC_SOURCE_URL",
  "NEXT_PUBLIC_PARTNER_ICE_NURE_URL",
  "NEXT_PUBLIC_PARTNER_NURE_URL",
];
const missing = REQUIRED.filter((k) => !process.env[k]);
if (missing.length) throw new Error(`Missing required env: ${missing.join(", ")}`);

// Dev-only: the app is served through the edge on the real hosts (not localhost), so Next's own
// dev resources (fonts, HMR) are cross-origin and blocked by default. Allow every configured
// host plus the event domain and its subdomains; DEV_ALLOWED_ORIGINS (comma list) adds more.
const env = process.env;
const allowedDevOrigins = [
  ...[env.NEXT_PUBLIC_MAIN_HOST, env.NEXT_PUBLIC_API_HOST, env.NEXT_PUBLIC_ID_HOST, env.NEXT_PUBLIC_ADMIN_HOST, env.NEXT_PUBLIC_EXERCISES_HOST],
  env.NEXT_PUBLIC_EVENT_DOMAIN,
  `*.${env.NEXT_PUBLIC_EVENT_DOMAIN}`,
  ...(env.DEV_ALLOWED_ORIGINS ?? "").split(",").map((s) => s.trim()),
].filter((s): s is string => !!s);

// Dev-only Content-Security-Policy (`next dev` serves real headers; the export gets its CSP from
// deploy/csp.sh at container start, so `headers` is not defined for production builds).
// Same directives as production, except script-src: dev needs inline scripts and eval (React dev
// stack, HMR) and cannot use hashes, and connect-src also allows the HMR websocket.
// Hosts and vendor toggles come from the same env as production.
function devContentSecurityPolicy(): string {
  const api = `https://${process.env.NEXT_PUBLIC_API_HOST!.trim()}`
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
  // No 308 slash-normalising redirects in dev/start: they are permanent and get cached
  // by browsers, which can turn into redirect loops if the slash policy ever changes.
  skipTrailingSlashRedirect: true,
  allowedDevOrigins: [...new Set(allowedDevOrigins)],
};

export default nextConfig;
