#!/bin/sh
# Runtime env substitution for the static export. The build baked each
# NEXT_PUBLIC_* value as a placeholder equal to its variable name; here we
# replace those placeholders with the actual runtime env values so the same
# image works across environments without a rebuild.
set -e

ROOT=/usr/share/nginx/html

# Every operator value is required: no defaults, no derivation. Only analytics is optional (empty = off).
for key in NEXT_PUBLIC_MAIN_HOST NEXT_PUBLIC_API_HOST NEXT_PUBLIC_ID_HOST NEXT_PUBLIC_ADMIN_HOST NEXT_PUBLIC_EXERCISES_HOST NEXT_PUBLIC_EVENT_DOMAIN NEXT_PUBLIC_COOKIE_DOMAIN NEXT_PUBLIC_CONTACT_EMAIL NEXT_PUBLIC_PRIVACY_EMAIL NEXT_PUBLIC_SECURITY_EMAIL NEXT_PUBLIC_SOURCE_URL NEXT_PUBLIC_PARTNER_URL NEXT_PUBLIC_PARTNER_SITE_URL ; do
  eval "val=\${$key:-}"
  if [ -z "$val" ]; then
    echo "$key is required." >&2
    exit 1
  fi
done
: "${NEXT_PUBLIC_GOOGLE_ANALYTICS_ID:=}"
export NEXT_PUBLIC_GOOGLE_ANALYTICS_ID

replace() {
  # Escape sed-special chars in the replacement (| delimiter, & match-ref, \).
  esc=$(printf '%s' "$2" | sed -e 's/[\\&|]/\\&/g')
  find "$ROOT" -type f \( -name '*.js' -o -name '*.html' -o -name '*.css' -o -name '*.txt' -o -name '*.xml' \) \
    -exec sed -i "s|$1|${esc}|g" {} +
}

printenv | grep '^NEXT_PUBLIC_' | while IFS='=' read -r key value; do
  replace "$key" "$value"
done

# Warm-up flag: same artifacts scripts/warmup.mjs writes at build time for static hosting —
# SHA-256 in place of the baked placeholder, base64 hint file at the end of the robots.txt chain.
if [ -z "${WARMUP_FLAG:-}" ]; then
  echo "[warmup] WARMUP_FLAG is not set — the warm-up challenge stays disabled." >&2
elif ! printf '%s' "$WARMUP_FLAG" | grep -Eq '^ICE\{[^}]+\}$'; then
  echo "[warmup] WARMUP_FLAG must match ICE{…} (no closing brace inside)." >&2
  exit 1
else
  replace "__WARMUP_SHA256__" "$(printf '%s' "$WARMUP_FLAG" | sha256sum | cut -d' ' -f1)"
  mkdir -p "$ROOT/.well-known/ice"
  printf '%s' "$WARMUP_FLAG" | base64 > "$ROOT/.well-known/ice/warmup.txt"
fi
