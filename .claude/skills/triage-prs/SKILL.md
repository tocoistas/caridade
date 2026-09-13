---
name: triage-prs
description: Tratar todas as PRs abertas do repo (incluindo Dependabot) — listar, classificar, verificar/testar cada uma, fazer merge das seguras por ordem que minimiza conflitos, pedir rebase às que ficarem desactualizadas e apagar os branches. Usar quando o utilizador pede para "ver/tratar as PRs abertas".
---

# Triagem de PRs abertas

## 1. Inventário

```bash
gh pr list --state open --json number,title,headRefName,author,mergeable,isDraft,statusCheckRollup \
  --jq '.[] | "#\(.number) [\(.headRefName)] \(.title) — \(.author.login) mergeable=\(.mergeable) checks=\([.statusCheckRollup[]?|.conclusion//.status]|join(","))"'
gh api "repos/{owner}/{repo}/dependabot/alerts?state=open&per_page=100" \
  --jq '.[] | "\(.security_advisory.severity) \(.dependency.package.name) → \(.security_vulnerability.first_patched_version.identifier)"'
```

## 2. Classificar e ordenar

1. **Segurança crítica/alta** primeiro (ex.: `next`, `sharp`).
2. Depois PRs que tocam `package.json` (mudam o grafo inteiro).
3. Por fim bumps só de `package-lock.json` (transitivos).

Todas as PRs de dependências tocam `package-lock.json` → depois de cada merge as
outras podem ficar `CONFLICTING`. Resolver com `@dependabot rebase` (comentário)
ou recriar o bump num branch próprio.

## 3. Para cada PR

```bash
gh pr view <n> --json title,body,files
gh pr diff <n> -- package.json
gh pr checkout <n> && npm ci --no-audit --no-fund && SKIP_INSTALL=1 npm run verify
```

Critérios de merge:
- `verify` verde localmente **e** checks verdes no GitHub;
- nenhum major bump sem ler o changelog/breaking changes;
- `overrides` em `package.json` continuam coerentes (não fixam versões vulneráveis);
- `npm audit` não piora.

Sem checks (PR antiga, anterior ao CI)? Comentar `@dependabot rebase` e esperar
que o CI corra: `gh pr checks <n> --watch`.

## 4. Merge e limpeza

```bash
git switch main
scripts/dev/finish-pr.sh <n>     # squash + apaga branch remoto e local
```

Depois de cada merge: `gh pr list` de novo; PRs `CONFLICTING` → `gh pr comment <n> --body "@dependabot rebase"`.
Dependabot fecha sozinho as PRs supersedidas.

## 5. Não mesclável?

- Build/regressão real → comentar a razão na PR (`gh pr comment`) e deixar aberta
  ou fechar com `@dependabot ignore this minor version` se for incompatível.
- Relatar ao utilizador: PRs mescladas, fechadas, pendentes e porquê.
