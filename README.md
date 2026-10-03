# main-frontend

The public landing page of the Cyber ICE Box platform. It is the only frontend that works without the backend API.

## Stack

Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Radix UI, lucide-react. Tests: Playwright (e2e) and the Node test runner. Lint: ESLint 10.

## Prerequisites

Node.js 26 or newer (see `.nvmrc`).

## Commands

```bash
npm install
npm run dev               # dev server on http://localhost:3000
npm run build             # production build (static export to out/)
npm run lint
npm run typecheck
npm test                  # unit tests (node --test)
npm run test:e2e          # Playwright
npm run test:e2e:static   # build, then Playwright against the static export
```

## Static export

Production builds are a **static export** (`output: "export"`, written to `out/`) and need no Node server at runtime; `npm run dev` runs the regular Next.js dev server. `npm start` is `next start` and is only meaningful outside the static build. The landing renders entirely from the export, so it stays up when the API is down.

## Configuration

`NEXT_PUBLIC_*` values are inlined at build time; the container image substitutes them at start-up, so one image serves any environment. There are no defaults: a missing required value fails the build (`next.config.ts`) or the container start. Dev-only: `DEV_ALLOWED_ORIGINS` (comma list) adds extra allowed dev origins. Values come from the deployment env files; `.env.example` is the template.

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_MAIN_HOST` | yes | Landing host (bare host, no scheme): canonical origin, sitemap/robots/security.txt. |
| `NEXT_PUBLIC_API_HOST` | yes | API host. |
| `NEXT_PUBLIC_ID_HOST` | yes | ID app host. |
| `NEXT_PUBLIC_ADMIN_HOST` | yes | Admin app host. |
| `NEXT_PUBLIC_EXERCISES_HOST` | yes | Exercises app host. |
| `NEXT_PUBLIC_EVENT_DOMAIN` | yes | Event sites are `<tag>.<domain>`. |
| `NEXT_PUBLIC_COOKIE_DOMAIN` | yes | `Domain` attribute of the shared theme and consent cookies (e.g. the apex `example.com`); never derived from a host. |
| `NEXT_PUBLIC_SUPPORT_EMAIL` | yes | Support mailbox of the «Send feedback» `mailto:` link shown on every page (the subject carries the app and page path only). |
| `NEXT_PUBLIC_CONTACT_EMAIL`, `NEXT_PUBLIC_PRIVACY_EMAIL`, `NEXT_PUBLIC_SECURITY_EMAIL` | yes | Footer, legal pages and security.txt mailboxes. |
| `NEXT_PUBLIC_SOURCE_URL` | yes | Public source link in the footer. |
| `NEXT_PUBLIC_PARTNER_URL`, `NEXT_PUBLIC_PARTNER_SITE_URL` | yes | Partner department and university links in the footer credit. |
| `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID` | no | Google Analytics 4 measurement id. Analytics is off when unset. |
| `NEXT_PUBLIC_DOS_PROTECTION` | no | `on` or `off` (default `off`). When `on`, the app fetches the anti-DoS client token (`POST /api/client-token`, invisible bot check, HttpOnly `__Host-client` cookie) before its first API call and again when the API answers `429` with `X-Client-Token: required`. Must match the backend; a `404` from the token route means the backend has it off. |
| `NEXT_PUBLIC_CAPTCHA_PROVIDER` | no | `turnstile`, `recaptcha` or `none` (default `none`): the bot check behind the client token. |
| `NEXT_PUBLIC_CAPTCHA_SITE_KEY` | with a provider | Site key of the provider; required when the provider is not `none`. |
| `NEXT_PUBLIC_RECAPTCHA_ENTERPRISE` | no | `true` or `false` (default `false`); only for `recaptcha`: use reCAPTCHA Enterprise. |
| `NEXT_PUBLIC_WARMUP_FLAG` | static builds | Flag of the warm-up challenge, read at build time by `scripts/warmup.mjs` (a dev fallback is used in `npm run dev`). |

Test-only: `E2E_BASE_URL`, `E2E_STATIC`.

## i18n

All user-facing text lives in `messages/uk.json` and `messages/en.json` and is rendered through the translate function `t("key", { vars })`. Ukrainian is the default language. Every key must exist in both files.

## Content Security Policy

The site sends a strict CSP: scripts only from the site itself (no inline script without a hash), `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, `frame-ancestors 'none'`. `connect-src` allows the API host (`NEXT_PUBLIC_API_HOST`) plus the vendors the app is configured for: Google Analytics when `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID` is set, the bot-check provider (`NEXT_PUBLIC_CAPTCHA_PROVIDER`: Cloudflare Turnstile or reCAPTCHA hosts) only when `NEXT_PUBLIC_DOS_PROTECTION=on`. `style-src` keeps `'unsafe-inline'` (React style attributes cannot be hashed).

The export is static, so a per-request nonce is not possible. Instead, at container start `deploy/csp.sh` (runs after the env substitution) hashes every inline `<script>` in the exported pages, plus the scripts the client creates at runtime (the Google Analytics boot; `scripts/csp-inline.mjs` writes its text at build time), and writes the header to `/etc/nginx/snippets/csp.conf`. `deploy/nginx.conf` includes that file in the server block and in every location that sets its own `add_header` (nginx does not inherit `add_header` into a location that defines one). A new inline script needs no manual step; a new runtime-created inline script must be added to `scripts/csp-inline.mjs`.

`next dev` sends the same policy from `headers()` in `next.config.ts`, only when `NODE_ENV=development`, with `'unsafe-inline'` and `'unsafe-eval'` for scripts and websockets for HMR. Check the browser console for `Content Security Policy` violations after adding a script, an iframe or a new external host.

## Deployment

Deployment and cluster configuration: see the infrastructure repository.

## License

Licensed under the Apache License, Version 2.0. See [LICENSE](LICENSE).

Copyright 2024-2026 CyberICEBox
