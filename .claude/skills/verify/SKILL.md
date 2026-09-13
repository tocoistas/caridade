---
name: verify
description: Corre o portão de qualidade do repo web (lint, typecheck, consistência i18n, alinhamento da ontologia, build de produção, smoke test HTTP em vários idiomas e npm audit) e interpreta falhas. Usar antes de abrir/actualizar uma PR, ao validar uma PR de terceiros ou quando o utilizador pede para "testar".
---

# Verificação (espelho do CI)

```bash
SKIP_INSTALL=1 npm run verify      # rápido, reutiliza node_modules
npm run verify                     # como no CI (npm ci limpo)
```

Passos individuais:

| Comando | O que garante | Falha típica → correcção |
|---|---|---|
| `npm run lint` | ESLint flat config `eslint-config-next` (core-web-vitals + typescript) | regra react-hooks → corrigir o componente, não desactivar a regra |
| `npm run typecheck` | `tsc --noEmit` estrito | tipos `any` implícitos, props erradas |
| `npm run check:i18n` | todas as `messages/<locale>.json` têm as chaves de `pt.json` e preservam `{placeholders}`/`<tags>` | faltam chaves → `npm run translate` |
| `npm run check:ontology` | `firestore.rules`, `adminCollections.ts`, uso de coleções em `src/`, `type Papel` e `routing.ts` batem com `docs/ontology.json` | nova coleção/campo → actualizar a ontologia |
| `npm run build` | build de produção Turbopack (sem `.env` no CI) | import de servidor em client component, env em falta em tempo de build |
| `npm run smoke` | arranca `next start` e testa rotas pt/en/fr/ar, `robots.txt`, `sitemap.xml`, 404 | rota partida, `lang`/`dir` errados |
| `npm audit --audit-level=high` | sem vulnerabilidades high/critical | skill `dependency-security` |

## Verificar a PR de outra pessoa (ex.: Dependabot)

```bash
gh pr checkout <n>
npm ci --no-audit --no-fund
SKIP_INSTALL=1 npm run verify
gh pr checks <n>
git switch main
```

Relatar: resultado de cada passo, diff relevante (`gh pr diff <n> -- package.json`),
e se é seguro fazer merge. Nunca afirmar "testado" sem ter corrido os comandos.

## Sem testes unitários

Não existe suite de testes unitários. Além dos passos acima:

```bash
npm run test:rules                 # regras deny-all no emulador (Java 21 + firebase-tools)
npm run build && npm run test:e2e  # API /api/v1 completa contra o emulador
```

Ambos correm no CI (jobs `rules` e `e2e`).
