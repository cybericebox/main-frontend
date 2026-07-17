# main-frontend — static export, served by nginx. NEXT_PUBLIC_* are baked as
# placeholders (= variable names) and substituted at container start by the
# entrypoint, so env is configurable at RUNTIME without a rebuild.
FROM node:25-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

ENV NEXT_PUBLIC_DOMAIN="NEXT_PUBLIC_DOMAIN"
RUN npm run build

FROM nginx:alpine AS runner
COPY --from=build /app/out /usr/share/nginx/html
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY deploy/docker-entrypoint.sh /docker-entrypoint.d/40-next-public-env.sh
RUN chmod +x /docker-entrypoint.d/40-next-public-env.sh
EXPOSE 3000
