# main-frontend

The public landing site of the Cyber&nbsp;ICE&nbsp;Box platform. Visitors read what the platform is and find the legal pages. This is our own landing site and is not part of what is distributed with the platform.

## Where it sits

| Question | Answer |
|---|---|
| Who uses it | Anyone who opens the platform's main domain |
| Backend | None required. The page renders from a static export. It may probe the platform API once on load to show sign-in and notifications |
| Build output | Static export in `out/`, served by nginx. No Node server at runtime |
| Dev port | 3000 |

The landing stays up when the API is down. With `NEXT_PUBLIC_API_ENABLED=false` it sends no request to the API at all,
which suits a static copy that stays online while the platform is switched off.

## What it shows

| Route | Page |
|---|---|
| `/` | Landing: hero with a sample challenge, a lab demo, labs section, FAQ; notification inbox and feedback link in the header |
| `/terms` | Terms of use |
| `/privacy` | Privacy policy |
| `/cookies` | Cookie policy and consent settings |
| `/security` | Security page |

Text is Ukrainian by default, with English available. The theme and cookie-consent cookies are set on the base domain, so the other platform sites share them.

## Run it locally

Tools are pinned in `mise.toml`: `mise install` puts Node.js in place, `mise tasks` lists the commands.

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev                  # http://localhost:3000
```

`npm run dev` and `npm run build` run `scripts/warmup.mjs` first. A dev fallback is used for the warm-up flag.

## Configure

`NEXT_PUBLIC_*` values are inlined at build time. The container image substitutes them at start, so one image serves
any environment. A missing required value fails the build or the container start.

- `.env.example` is the template. The required values are the base domain and the support, contact, privacy and
  security mailboxes.
- `NEXT_PUBLIC_DOMAIN` is the only host input. Every other host (`api.`, `id.`, `admin.`, `exercises.`, event sites)
  derives from it.
- Optional values are in the table below.

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_API_ENABLED` | no | `false`: the site sends no request to the platform API. Default: the API is probed once on load. |
| `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID` | no | Google Analytics 4 id. Analytics is off when unset. |
| `NEXT_PUBLIC_SOURCE_URL` | no | Public source link in the footer. |

## Development commands

| Command | What it does |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build, static export to `out/` |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Unit tests (Node test runner) |
| `npm run test:e2e` | Playwright against the dev server |
| `npm run test:e2e:static` | Build, then Playwright against the static export |
| `npm run check:ds` | Fails if a copied design-system file was edited by hand |
| `npm run sync:errors` | Adds new backend error codes to `messages/errors.*.json` (needs a `daemon` checkout at `../daemon`) |

`scripts/test-nginx-tls.sh` checks the container's TLS and client-certificate modes (needs Docker).

## Rules for changes

- Every user-visible string goes through `messages/uk.json` and `messages/en.json` and `t("key", { vars })`. Add each
  key to both files.
- Loading states use the crest loader, never a generic spinner.

## Container

The image serves the export with nginx: plain HTTP on 8080, a health listener on 8081 (`/healthz` only), and TLS on
8443 when `/tls/tls.crt` and `/tls/tls.key` are mounted. Client certificates are required when `/aop/ca.crt` is
mounted. The config is in `deploy/nginx/`; `deploy/nginx-entrypoint.sh` validates the environment and fails the start
on a bad combination. At start, `deploy/csp.sh` hashes the inline scripts and writes the Content Security Policy
header, so the policy stays strict without a per-request nonce.

## Releases and contributing

Branches, pull requests and releases: see [CONTRIBUTING.md](CONTRIBUTING.md).

## License

Apache License 2.0. See [LICENSE](LICENSE).
