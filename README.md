# main-frontend

The public landing of Cyber ICE Box, served on `<domain>` (the apex). It introduces the platform, hosts a small warm-up challenge and links to the other apps. It renders without the API, so it stays up while the platform is down.

## What you can do

- Read what the platform offers: hero, labs and FAQ sections.
- Solve the warm-up challenge in the hero and check the flag.
- Sign in, sign up or open your profile on the ID app.
- When signed in: see your notification inbox; the account menu links to the other apps you can use.
- Read the terms of service and the privacy policy.

## Environment variables

Static builds (`npm run build`, GitHub Pages) read these at build time. The Docker image reads them at container start.

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_DOMAIN` | yes | — | Platform apex domain, e.g. `cybericebox.com`. |
| `NEXT_PUBLIC_API_DOMAIN` | no | `api.<domain>` | API host (bare host, no scheme). |
| `NEXT_PUBLIC_ID_DOMAIN` | no | `id.<domain>` | ID app host. |
| `NEXT_PUBLIC_ADMIN_DOMAIN` | no | `admin.<domain>` | Admin app host. |
| `NEXT_PUBLIC_EXERCISES_DOMAIN` | no | `exercises.<domain>` | Exercises app host. |
| `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID` | no | analytics off | Google Analytics 4 measurement id (`G-…`). |
| `NEXT_PUBLIC_WARMUP_FLAG` | yes for static builds | `ICE{dev_warmup}` in dev | Warm-up flag (`ICE{…}`), build time only (static export, GitHub Pages secret). |
| `WARMUP_FLAG` | no | challenge disabled | Warm-up flag (`ICE{…}`) for the Docker image, read at container start. |

## Commands

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # static export → out/
npm run lint
npm run typecheck
npm run test:e2e     # Playwright
npm run test:e2e:static   # Playwright against the static build

docker build -f deploy/Dockerfile -t cybericebox/main-frontend .
docker run --rm -p 3000:3000 -e NEXT_PUBLIC_DOMAIN=cybericebox.local -e WARMUP_FLAG='ICE{example}' cybericebox/main-frontend
```

## Deployment

- **GitHub Pages** — publishing a release runs `.github/workflows/pages.yml`, which builds the static export and deploys it. Set the variables above (and secrets) on the `github-pages` environment (Settings → Environments); the custom domain is set in Settings → Pages.
- **Docker images** — a push to `develop` builds `cybericebox/main-frontend:<commit sha>` (`develop-image.yml`); a published release builds `cybericebox/main-frontend:latest` and `:<release tag>` (`publish-image.yml`).
- **Kubernetes** — manifests are in `deploy/manifests`. Put the values in `config.yaml`; an empty key uses the default.
