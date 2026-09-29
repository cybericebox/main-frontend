# main-frontend — static export, served by nginx. NEXT_PUBLIC_* are baked as
# placeholders (= variable names) and substituted at container start by the
# entrypoint, so env is configurable at RUNTIME without a rebuild.
# Build with: docker build -f deploy/Dockerfile .
# Run with:   -e NEXT_PUBLIC_DOMAIN=… [-e NEXT_PUBLIC_{API,ID,ADMIN,EXERCISES}_DOMAIN=…] [-e NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=…] -e WARMUP_FLAG='ICE{…}'
FROM node:26-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

ENV NEXT_PUBLIC_DOMAIN="NEXT_PUBLIC_DOMAIN"
ENV NEXT_PUBLIC_GOOGLE_ANALYTICS_ID="NEXT_PUBLIC_GOOGLE_ANALYTICS_ID"
ENV NEXT_PUBLIC_API_DOMAIN="NEXT_PUBLIC_API_DOMAIN"
ENV NEXT_PUBLIC_ID_DOMAIN="NEXT_PUBLIC_ID_DOMAIN"
ENV NEXT_PUBLIC_ADMIN_DOMAIN="NEXT_PUBLIC_ADMIN_DOMAIN"
ENV NEXT_PUBLIC_EXERCISES_DOMAIN="NEXT_PUBLIC_EXERCISES_DOMAIN"
# Warm-up flag is NOT a build input here: the build bakes a hash placeholder and the entrypoint
# derives the hash + hint file from WARMUP_FLAG at container start (see scripts/warmup.mjs).
ENV WARMUP_PLACEHOLDER=1
RUN npm run build

FROM nginx:1.30.5-alpine AS runner
COPY --from=build /app/out /usr/share/nginx/html
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY deploy/docker-entrypoint.sh /docker-entrypoint.d/40-next-public-env.sh
RUN chmod +x /docker-entrypoint.d/40-next-public-env.sh
EXPOSE 3000
