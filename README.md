# main-frontend

Platform landing (`/`, `/privacy`, `/terms`) — Next.js static export served by nginx.

## Warm-up flag (`NEXT_PUBLIC_WARMUP_FLAG`)

The hero warm-up flag is passed at **build time** and never reaches the bundle in plain text:
`scripts/warmup.mjs` (npm `predev` / `prebuild` / `pretypecheck`) writes its SHA-256 to
`src/lib/warmup.generated.ts` and a base64 hint file to `public/.well-known/ice/warmup.txt`
(both gitignored). Trail for players: HTML comment → `robots.txt` → `/.well-known/ice/warmup.txt`.

Format: `ICE{…}` (no `}` inside). Only `scripts/warmup.mjs` reads it; `src/` must never reference it, so Next has nothing to inline and the entrypoint's `NEXT_PUBLIC_*` loop never finds its name in the bundle. Works on any static host (GitHub Pages included); changing the flag means a rebuild.

| Where | How |
|---|---|
| dev | `NEXT_PUBLIC_WARMUP_FLAG='ICE{…}' npm run dev`, or put `NEXT_PUBLIC_WARMUP_FLAG=…` in `.env.local`; unset → `ICE{dev_warmup}` with a warning |
| build | `NEXT_PUBLIC_WARMUP_FLAG='ICE{…}' npm run build`; unset is an error with `CI` / `NODE_ENV=production` |
| docker | `docker build -f deploy/Dockerfile --build-arg NEXT_PUBLIC_WARMUP_FLAG='ICE{…}' .` (required) |
| GitHub Actions | repository secret `NEXT_PUBLIC_WARMUP_FLAG` → `build-args` in `.github/workflows/*.yml` |

The flag is a build arg, not a runtime env: changing it means rebuilding the image
(the k8s manifests in `deploy/manifests` need nothing).

## Checks

```bash
npm run typecheck && npm run lint && npm run build
npm run test:e2e:static   # builds with a test flag, serves out/, runs e2e/smoke.spec.ts
```
