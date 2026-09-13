---
name: dependency-security
description: Corrigir vulnerabilidades de dependências npm (alertas Dependabot, npm audit) no repo web — escolher a versão corrigida, ajustar overrides, regenerar o lockfile de forma compatível com o App Hosting e abrir a PR de segurança. Usar para "vulnerabilidades", "Dependabot alerts", "npm audit".
---

# Segurança de dependências

## 1. Levantar o estado

```bash
gh api "repos/tocoistas/caridade/dependabot/alerts?state=open&per_page=100" \
  --jq '.[] | "\(.number) \(.security_advisory.severity) \(.dependency.package.name) \(.dependency.relationship // "") fix=\(.security_vulnerability.first_patched_version.identifier) \(.security_advisory.ghsa_id)"'
npm audit
npm ls <pacote>          # quem puxa o transitivo
```

## 2. Estratégia por tipo

| Caso | Acção |
|---|---|
| Dependência directa (`next`, `postcss`…) | `npm install <pkg>@<versão-corrigida> --save-exact` (manter pin exacto onde já existia) |
| `next` | subir **também** `eslint-config-next` para a mesma versão |
| Transitiva com range compatível | `npm update <pkg>` ou `npm audit fix` (nunca `--force` sem rever) |
| Transitiva bloqueada por range do pai | `overrides` em `package.json`; preferir referência `"$pkg"` quando o pacote é também directo |
| Override existente que fixa versão vulnerável | actualizar/remover o override |

## 3. Lockfile

- Gerar com `npm install` (npm ≥ 11) e confirmar `npm ci` limpo: `rm -rf node_modules && npm ci`.
- O App Hosting corre `npm ci` com Node 24 — um lockfile dessincronizado parte o deploy
  (ver histórico: PRs #15 e #21).

## 4. Verificar

```bash
npm audit --audit-level=high      # tem de sair 0
SKIP_INSTALL=1 npm run verify
```

## 5. PR

Branch `security/deps-<resumo>` ou `deps/<pkg>-<versão>`, commit
`fix(deps): Corrige vulnerabilidades …`, corpo com tabela GHSA → versão, e seguir a skill `pr-workflow`.
Depois do merge, confirmar que os alertas fecharam:
`gh api "repos/tocoistas/caridade/dependabot/alerts?state=open" --jq length`.
