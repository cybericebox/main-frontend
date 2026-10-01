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
| `NEXT_PUBLIC_MAIN_HOST` | yes | Landing host (bare host, no scheme): canonical origin, sitemap/robots/security.txt, parent domain of shared cookies. |
| `NEXT_PUBLIC_API_HOST` | yes | API host. |
| `NEXT_PUBLIC_ID_HOST` | yes | ID app host. |
| `NEXT_PUBLIC_ADMIN_HOST` | yes | Admin app host. |
| `NEXT_PUBLIC_EXERCISES_HOST` | yes | Exercises app host. |
| `NEXT_PUBLIC_EVENT_DOMAIN` | yes | Event sites are `<tag>.<domain>`. |
| `NEXT_PUBLIC_CONTACT_EMAIL`, `NEXT_PUBLIC_PRIVACY_EMAIL`, `NEXT_PUBLIC_SECURITY_EMAIL` | yes | Footer, legal pages and security.txt mailboxes. |
| `NEXT_PUBLIC_SOURCE_URL` | yes | Public source link in the footer. |
| `NEXT_PUBLIC_PARTNER_URL`, `NEXT_PUBLIC_PARTNER_SITE_URL` | yes | Partner department and university links in the footer credit. |
| `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID` | no | Google Analytics 4 measurement id. Analytics is off when unset. |
| `NEXT_PUBLIC_WARMUP_FLAG` | static builds | Flag of the warm-up challenge, read at build time by `scripts/warmup.mjs` (a dev fallback is used in `npm run dev`). |

Test-only: `E2E_BASE_URL`, `E2E_STATIC`.

## i18n

All user-facing text lives in `messages/uk.json` and `messages/en.json` and is rendered through the translate function `t("key", { vars })`. Ukrainian is the default language. Every key must exist in both files.

## Deployment

Deployment and cluster configuration: see the infrastructure repository.

## License

Licensed under the Apache License, Version 2.0. See [LICENSE](LICENSE).

Copyright 2024-2026 CyberICEBox
