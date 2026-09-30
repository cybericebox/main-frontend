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

`NEXT_PUBLIC_*` values are inlined at build time; the container image substitutes them at start-up, so one image serves any environment.

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_DOMAIN` | yes | Platform apex domain; the other hosts derive from it. |
| `NEXT_PUBLIC_API_DOMAIN` | no | API host (bare host, no scheme). Defaults to `api.<domain>`. |
| `NEXT_PUBLIC_ID_DOMAIN` | no | ID app host. Defaults to `id.<domain>`. |
| `NEXT_PUBLIC_ADMIN_DOMAIN` | no | Admin app host. Defaults to `admin.<domain>`. |
| `NEXT_PUBLIC_EXERCISES_DOMAIN` | no | Exercises app host. Defaults to `exercises.<domain>`. |
| `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID` | no | Google Analytics 4 measurement id. Analytics is off when unset. |
| `NEXT_PUBLIC_WARMUP_FLAG` | static builds | Flag of the warm-up challenge, read at build time by `scripts/warmup.mjs` (a dev fallback is used in `npm run dev`). |

Test-only: `E2E_BASE_URL`, `E2E_STATIC`.

## i18n

All user-facing text lives in `messages/uk.json` and `messages/en.json` and is rendered through the translate function `t("key", { vars })`. Ukrainian is the default language. Every key must exist in both files.

## Deployment

Deployment and cluster configuration: see the infrastructure repository.
