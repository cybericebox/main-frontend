# main-frontend — static export, served by nginx. NEXT_PUBLIC_* are baked as
# placeholders (= variable names) and substituted at container start by the
# entrypoint, so env is configurable at RUNTIME without a rebuild.
# Build with: docker build -f deploy/Dockerfile .
# Run with:   -e NEXT_PUBLIC_{MAIN_HOST,API_HOST,ID_HOST,ADMIN_HOST,EXERCISES_HOST,EVENT_DOMAIN,COOKIE_DOMAIN,CONTACT_EMAIL,PRIVACY_EMAIL,SECURITY_EMAIL,SOURCE_URL,PARTNER_URL,PARTNER_SITE_URL}=… [-e NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=…] -e WARMUP_FLAG='ICE{…}'
FROM node:26-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

ENV NEXT_PUBLIC_MAIN_HOST="NEXT_PUBLIC_MAIN_HOST"
ENV NEXT_PUBLIC_API_HOST="NEXT_PUBLIC_API_HOST"
ENV NEXT_PUBLIC_ID_HOST="NEXT_PUBLIC_ID_HOST"
ENV NEXT_PUBLIC_ADMIN_HOST="NEXT_PUBLIC_ADMIN_HOST"
ENV NEXT_PUBLIC_EXERCISES_HOST="NEXT_PUBLIC_EXERCISES_HOST"
ENV NEXT_PUBLIC_EVENT_DOMAIN="NEXT_PUBLIC_EVENT_DOMAIN"
ENV NEXT_PUBLIC_COOKIE_DOMAIN="NEXT_PUBLIC_COOKIE_DOMAIN"
ENV NEXT_PUBLIC_CONTACT_EMAIL="NEXT_PUBLIC_CONTACT_EMAIL"
ENV NEXT_PUBLIC_PRIVACY_EMAIL="NEXT_PUBLIC_PRIVACY_EMAIL"
ENV NEXT_PUBLIC_SECURITY_EMAIL="NEXT_PUBLIC_SECURITY_EMAIL"
ENV NEXT_PUBLIC_SOURCE_URL="NEXT_PUBLIC_SOURCE_URL"
ENV NEXT_PUBLIC_PARTNER_URL="NEXT_PUBLIC_PARTNER_URL"
ENV NEXT_PUBLIC_PARTNER_SITE_URL="NEXT_PUBLIC_PARTNER_SITE_URL"
ENV NEXT_PUBLIC_GOOGLE_ANALYTICS_ID="NEXT_PUBLIC_GOOGLE_ANALYTICS_ID"
# Warm-up flag is NOT a build input here: the build bakes a hash placeholder and the entrypoint
# derives the hash + hint file from WARMUP_FLAG at container start (see scripts/warmup.mjs).
ENV WARMUP_PLACEHOLDER=1
RUN npm run build && node scripts/csp-inline.mjs

FROM nginx:1.30.5-alpine AS runner
COPY --from=build /app/out /usr/share/nginx/html
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY deploy/docker-entrypoint.sh /docker-entrypoint.d/40-next-public-env.sh
# 50-csp.sh runs after the env substitution: it hashes the inline scripts and writes the CSP header
# snippet that nginx.conf includes (see the header comment in deploy/csp.sh).
COPY deploy/csp.sh /docker-entrypoint.d/50-csp.sh
RUN chmod +x /docker-entrypoint.d/40-next-public-env.sh /docker-entrypoint.d/50-csp.sh
EXPOSE 3000
