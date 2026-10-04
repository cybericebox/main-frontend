#!/bin/sh
# Runtime env substitution for the static export. The build baked each
# NEXT_PUBLIC_* value as a placeholder equal to its variable name wrapped in double
# underscores (__NEXT_PUBLIC_X__); here we replace those placeholders with the actual
# runtime env values so the same image works across environments without a rebuild.
set -e

ROOT=/usr/share/nginx/html

# NEXT_PUBLIC_DOMAIN is the only host input (deploy/base-domain.sh, the same file in every frontend): every host derives from it in the code.
# The four mailboxes are required explicit values (never derived from the domain).
. /usr/local/lib/base-domain.sh
base_domain_check || exit 1
for key in NEXT_PUBLIC_SUPPORT_EMAIL NEXT_PUBLIC_CONTACT_EMAIL NEXT_PUBLIC_PRIVACY_EMAIL NEXT_PUBLIC_SECURITY_EMAIL ; do
  eval "val=\${$key:-}"
  if [ -z "$val" ]; then
    echo "$key is required." >&2
    exit 1
  fi
done
# Optional values and their defaults (an empty value counts as unset).
: "${NEXT_PUBLIC_GOOGLE_ANALYTICS_ID:=}"
: "${NEXT_PUBLIC_SHOW_PARTNERS:=true}"
: "${NEXT_PUBLIC_SOURCE_URL:=https://github.com/cybericebox}"
export NEXT_PUBLIC_GOOGLE_ANALYTICS_ID NEXT_PUBLIC_SHOW_PARTNERS NEXT_PUBLIC_SOURCE_URL

# One pass: a single sed script with an expression per NEXT_PUBLIC_* variable, run once over each
# file that holds a placeholder (in parallel: busybox sed is slow on the minified bundles). Only the
# wrapped token is replaced; the bare name is also an object key and plain text in the bundle.
# Files without a placeholder are never rewritten.
script=$(mktemp)
trap 'rm -f "$script"' EXIT
printenv | grep '^NEXT_PUBLIC_' | while IFS='=' read -r key value; do
  # Escape sed-special chars in the replacement (| delimiter, & match-ref, \).
  esc=$(printf '%s' "$value" | sed -e 's/[\\&|]/\\&/g')
  printf 's|__%s__|%s|g\n' "$key" "$esc"
done > "$script"
# Next lowercases the host of the Open Graph image URLs (new URL), so that placeholder reaches the files in lower case.
printf 's|__next_public_domain__|%s|g\n' "$(printf '%s' "$NEXT_PUBLIC_DOMAIN" | sed -e 's/[\\&|]/\\&/g')" >> "$script"

# Warm-up flag: same artifacts scripts/warmup.mjs writes at build time for static hosting —
# SHA-256 in place of the baked placeholder (one more expression in the script above), base64 hint
# file at the end of the robots.txt chain.
if [ -z "${WARMUP_FLAG:-}" ]; then
  echo "[warmup] WARMUP_FLAG is not set — the warm-up challenge stays disabled." >&2
elif ! printf '%s' "$WARMUP_FLAG" | grep -Eq '^ICE\{[^}]+\}$'; then
  echo "[warmup] WARMUP_FLAG must match ICE{…} (no closing brace inside)." >&2
  exit 1
else
  printf 's|__WARMUP_SHA256__|%s|g\n' "$(printf '%s' "$WARMUP_FLAG" | sha256sum | cut -d' ' -f1)" >> "$script"
  mkdir -p "$ROOT/.well-known/ice"
  printf '%s' "$WARMUP_FLAG" | base64 > "$ROOT/.well-known/ice/warmup.txt"
fi

grep -rlIE '__NEXT_PUBLIC_[A-Z0-9_]+__|__next_public_domain__|__WARMUP_SHA256__' "$ROOT" | xargs -r -n 1 -P "$(nproc)" sed -i -f "$script"

# A placeholder that is still there means its variable is missing: fail the start, not the page.
left=
# The cheap fixed-string scan first; the token names are only collected when something is left.
if grep -rqIF '__NEXT_PUBLIC_' "$ROOT"; then
  left=$(grep -rhoIE '__NEXT_PUBLIC_[A-Z0-9_]+__' "$ROOT" | sort -u | tr '\n' ' ')
fi
if [ -n "$left" ]; then
  echo "No value for: $left(set the variable, an empty one is fine for an optional value)." >&2
  exit 1
fi
