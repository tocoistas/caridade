#!/usr/bin/env bash
# Conclui uma PR: espera pelo CI, faz squash-merge em main e apaga o branch
# de desenvolvimento no remoto E localmente.
#
# Uso: scripts/dev/finish-pr.sh <n.º PR>
set -euo pipefail
pr="${1:?uso: scripts/dev/finish-pr.sh <n.º PR>}"
cd "$(git rev-parse --show-toplevel)"

read -r state base branch draft < <(gh pr view "$pr" --json state,baseRefName,headRefName,isDraft \
  --jq '"\(.state) \(.baseRefName) \(.headRefName) \(.isDraft)"')

[ "$state" = OPEN ] || { echo "❌ PR #$pr não está aberta ($state)." >&2; exit 1; }
[ "$base" = main ]  || { echo "❌ PR #$pr não aponta para main ($base)." >&2; exit 1; }
[ "$draft" = false ] || { echo "❌ PR #$pr é draft." >&2; exit 1; }

echo "▶ A aguardar checks da PR #$pr ($branch)…"
# Logo após o push o CI ainda não registou checks e `--watch` falharia.
for _ in $(seq 1 40); do
  [ -n "$(gh pr checks "$pr" --json name --jq '.[].name' 2>/dev/null)" ] && break
  sleep 5
done
gh pr checks "$pr" --watch --fail-fast --interval 15

for _ in $(seq 1 20); do
  mergeable=$(gh pr view "$pr" --json mergeable --jq .mergeable)
  [ "$mergeable" != UNKNOWN ] && break
  sleep 5
done
[ "$mergeable" = MERGEABLE ] || { echo "❌ PR #$pr não é mesclável ($mergeable) — faça rebase em main." >&2; exit 1; }

echo "▶ Squash-merge em main"
gh pr merge "$pr" --squash --delete-branch

echo "▶ Sincronizar main e limpar branches"
git switch main >/dev/null 2>&1 || git checkout main
git pull --ff-only
git fetch --prune
git branch -D "$branch" >/dev/null 2>&1 || true
if git ls-remote --exit-code --heads origin "$branch" >/dev/null 2>&1; then
  git push origin --delete "$branch"
fi

git ls-remote --exit-code --heads origin "$branch" >/dev/null 2>&1 && { echo "❌ branch remoto $branch ainda existe" >&2; exit 1; }
git show-ref --verify --quiet "refs/heads/$branch" && { echo "❌ branch local $branch ainda existe" >&2; exit 1; }

echo "✅ PR #$pr mesclada; branch $branch apagado (remoto e local). main em $(git rev-parse --short HEAD)."
