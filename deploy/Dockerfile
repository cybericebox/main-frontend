# main-frontend — static export, served by nginx. NEXT_PUBLIC_* are baked as
# placeholders (= variable names) and substituted at container start by the
# entrypoint, so env is configurable at RUNTIME without a rebuild.
# Build with: docker build -f deploy/Dockerfile .
# Run with:   -e NEXT_PUBLIC_DOMAIN=… -e NEXT_PUBLIC_{SUPPORT_EMAIL,CONTACT_EMAIL,PRIVACY_EMAIL,SECURITY_EMAIL,SOURCE_URL,PARTNER_ICE_NURE_URL,PARTNER_NURE_URL}=… [-e NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=…] -e WARMUP_FLAG='ICE{…}'
# The only host input is NEXT_PUBLIC_DOMAIN: every host derives from it (main = DOMAIN, api./id./admin./exercises.DOMAIN, events <tag>.DOMAIN, cookies DOMAIN).
FROM node:26.10.0-alpine@sha256:0b36e8c136b94cd4fcf02188228e76c31ad5872eef3fec8cbd2eee500cfd9e80 AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

ENV NEXT_PUBLIC_DOMAIN="__NEXT_PUBLIC_DOMAIN__"
ENV NEXT_PUBLIC_SUPPORT_EMAIL="__NEXT_PUBLIC_SUPPORT_EMAIL__"
ENV NEXT_PUBLIC_CONTACT_EMAIL="__NEXT_PUBLIC_CONTACT_EMAIL__"
ENV NEXT_PUBLIC_PRIVACY_EMAIL="__NEXT_PUBLIC_PRIVACY_EMAIL__"
ENV NEXT_PUBLIC_SECURITY_EMAIL="__NEXT_PUBLIC_SECURITY_EMAIL__"
ENV NEXT_PUBLIC_SOURCE_URL="__NEXT_PUBLIC_SOURCE_URL__"
ENV NEXT_PUBLIC_PARTNER_ICE_NURE_URL="__NEXT_PUBLIC_PARTNER_ICE_NURE_URL__"
ENV NEXT_PUBLIC_PARTNER_NURE_URL="__NEXT_PUBLIC_PARTNER_NURE_URL__"
ENV NEXT_PUBLIC_GOOGLE_ANALYTICS_ID="__NEXT_PUBLIC_GOOGLE_ANALYTICS_ID__"
# Warm-up flag is NOT a build input here: the build bakes a hash placeholder and the entrypoint
# derives the hash + hint file from WARMUP_FLAG at container start (see scripts/warmup.mjs).
ENV WARMUP_PLACEHOLDER=1
RUN npm run build && node scripts/csp-inline.mjs

FROM nginx:1.30.5-alpine-slim@sha256:32463212baf0e7d91aded2e9b843a4f2b9e017804b8c9d5bae7b51dcef64389c AS runner
COPY --from=build /app/out /usr/share/nginx/html
COPY deploy/nginx/nginx.conf deploy/nginx/server.conf /etc/nginx/
COPY deploy/nginx/listen-http.conf deploy/nginx/listen-https.conf deploy/nginx/client-auth.conf deploy/nginx/health.conf /etc/nginx/snippets/
COPY deploy/docker-entrypoint.sh /docker-entrypoint.d/40-next-public-env.sh
# The base-domain derivation (NEXT_PUBLIC_DOMAIN check, the API host for the CSP), sourced by 40-next-public-env.sh and 50-csp.sh.
COPY deploy/base-domain.sh /usr/local/lib/base-domain.sh
# 50-csp.sh runs after the env substitution: it hashes the inline scripts and writes the CSP header
# snippet that server.conf includes (see the header comment in deploy/csp.sh).
COPY deploy/csp.sh /docker-entrypoint.d/50-csp.sh
# 60-nginx-config.sh renders the listener snippets from the TLS_* / HTTP_PORT / HEALTH_PORT env and runs nginx -t.
COPY deploy/nginx-entrypoint.sh /docker-entrypoint.d/60-nginx-config.sh
RUN chmod +x /docker-entrypoint.d/40-next-public-env.sh /docker-entrypoint.d/50-csp.sh /docker-entrypoint.d/60-nginx-config.sh
EXPOSE 3000 8443
