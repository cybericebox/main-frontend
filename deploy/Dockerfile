# main-frontend — static export, served by nginx. NEXT_PUBLIC_* are baked as
# placeholders (= variable names) and substituted at container start by the
# entrypoint, so env is configurable at RUNTIME without a rebuild.
# Build with: docker build -f deploy/Dockerfile --build-arg NEXT_PUBLIC_WARMUP_FLAG='ICE{…}' .
FROM node:26-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

ENV NEXT_PUBLIC_DOMAIN="NEXT_PUBLIC_DOMAIN"
# Warm-up flag: build stage only (hashed + base64 hint file by scripts/warmup.mjs); the nginx
# stage below copies just out/, so the plaintext is not in the final image.
ARG NEXT_PUBLIC_WARMUP_FLAG
ENV NEXT_PUBLIC_WARMUP_FLAG=$NEXT_PUBLIC_WARMUP_FLAG
RUN test -n "$NEXT_PUBLIC_WARMUP_FLAG" || (echo "NEXT_PUBLIC_WARMUP_FLAG build arg is required" && exit 1)
RUN npm run build

FROM nginx:alpine AS runner
COPY --from=build /app/out /usr/share/nginx/html
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY deploy/docker-entrypoint.sh /docker-entrypoint.d/40-next-public-env.sh
RUN chmod +x /docker-entrypoint.d/40-next-public-env.sh
EXPOSE 3000
