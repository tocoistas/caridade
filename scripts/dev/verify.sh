#!/usr/bin/env bash
# Portão de qualidade local — espelha o CI (.github/workflows/ci.yml).
#
# Uso:
#   scripts/dev/verify.sh                 # completo (npm ci incluído)
#   SKIP_INSTALL=1 scripts/dev/verify.sh  # reutiliza node_modules
#   AUDIT_STRICT=0 scripts/dev/verify.sh  # npm audit apenas informativo (por omissão falha em high/critical)
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

step() { printf '\n\033[1;34m▶ %s\033[0m\n' "$*"; }

if [ "${SKIP_INSTALL:-0}" != 1 ]; then
  step "npm ci"
  npm ci --no-audit --no-fund
fi

step "lint";            npm run lint
step "typecheck";       npm run typecheck
step "i18n";            npm run check:i18n
step "ontologia";       npm run check:ontology
step "build";           npm run build
step "smoke test";      npm run smoke

step "npm audit (high+)"
if ! npm audit --audit-level=high; then
  if [ "${AUDIT_STRICT:-1}" = 1 ]; then
    echo "❌ npm audit encontrou vulnerabilidades high/critical." >&2
    exit 1
  fi
  echo "⚠️  npm audit com vulnerabilidades (modo informativo)." >&2
fi

printf '\n\033[1;32m✅ verify OK\033[0m\n'
