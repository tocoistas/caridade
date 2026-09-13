# CLAUDE.md — repo web (`tocoistas/caridade`)

Guia para o Claude Code neste repositório. **Repo público** — nada de segredos, PII ou dados reais.

## Leitura obrigatória

| Documento | Para quê |
|---|---|
| [`docs/ontology.md`](docs/ontology.md) + [`docs/ontology.json`](docs/ontology.json) | Modelo de domínio canónico (entidades, papéis, estados, permissões, eixos) partilhado com a app Android |
| [`CONTRIBUTING.md`](CONTRIBUTING.md) | Fluxo obrigatório branch → PR → CI → merge → apagar branch |
| `.claude/skills/*/SKILL.md` | Procedimentos (ver tabela abaixo) |

## Regra cardinal: nunca trabalhar em `main`

Toda a alteração — código, docs, deps, CI — vai num **branch próprio**, com **PR**, **CI verde**,
**squash-merge** e **remoção do branch no remoto e local**. Skill `pr-workflow`; conclusão com
`scripts/dev/finish-pr.sh <n>`. Imposto por `.claude/hooks/guard-main.py` (Claude), `.githooks/`
(git local, `core.hooksPath` definido no arranque da sessão) e protecção de branch no GitHub.

## Comandos

```bash
npm install            # ou npm ci
npm run dev            # http://localhost:3000 (Turbopack)
npm run build          # build de produção
npm run lint           # ESLint flat config (eslint-config-next)
npm run typecheck      # tsc --noEmit
npm run check:i18n     # chaves/marcadores iguais nos 11 idiomas
npm run check:ontology # docs/ontology.json ↔ rules/admin/roles/routing
npm run smoke          # next start + verificação HTTP (requer build)
npm run test:rules     # regras deny-all no emulador Firestore (Java 21 + firebase-tools)
npm run test:e2e       # API /api/v1 completa contra o emulador (requer build)
npm run verify         # tudo acima + npm audit (igual ao CI)
npm run translate      # gera messages/<locale>.json a partir de pt.json
```

Não há testes unitários; o contrato é `npm run verify`.

## Arquitectura

- **Next.js 16 App Router** (SSR), React 19, TypeScript estrito, Tailwind CSS v4. Imagens `unoptimized`.
- **Deploy: Firebase App Hosting** (Cloud Run, projecto `insjcm`, backend `caridade`, `europe-west4`,
  domínio `caridade.ao`). Cada push em `main` gera um rollout; `.github/workflows/firebase-apphosting.yml`
  apenas o monitoriza. Config em `apphosting.yaml`. Não existe outro alvo de deploy.
- **CI:** `.github/workflows/ci.yml` (jobs `verify` e `audit`) em cada PR e push para `main`.
- **Backend:** API própria `src/app/api/v1/**` (route handlers) sobre Firestore **base nomeada `caridade`**, via
  Admin SDK com as credenciais da service account do App Hosting (`src/server/firebaseAdmin.ts`, sem chaves no repo).
  O browser e a app Android **nunca** falam com o Firestore; `firestore.rules` nega tudo.
- **Autenticação própria** (sem Firebase Auth): e-mail + palavra-passe (scrypt), sessões opacas (`sessoes`), cookie
  httpOnly na web, Bearer token na app, códigos de acesso emitidos pelo admin (sem e-mail). Ver [`docs/auth.md`](docs/auth.md)
  e skill `auth-api`. Bootstrap/reset do admin: `scripts/admin/bootstrap-admin.mjs`.
- **Autorização:** no servidor (`exigirSessao`/`exigirAprovado` + `ROLE_CAPS` de `src/lib/roles.ts`); a UI só adapta.
  `src/server/**` é `server-only`.

### i18n (next-intl)

- `pt` fonte (sem prefixo) + `en es fr de it zh ar ru hi ja` (prefixo; `ar` RTL). `localePrefix: 'as-needed'`.
- Rotas em `src/app/[locale]/`; `src/middleware.ts` faz o routing; config em `src/i18n/{routing,request,navigation}.ts`.
- **Links internos só de `@/i18n/navigation`**, nunca `next/link`/`next/navigation`.
- Copy em `messages/pt.json` → `npm run translate` → `npm run check:i18n`. `/admin` é só pt.
- `robots.ts`, `sitemap.ts`, `manifest.ts`, `llms.txt`/`llms-full.txt`, `og/[locale]` e `favicon.ico` ficam na raiz de `src/app/` (não localizados). Metadados por página via `metadadosPagina()` (`src/lib/seo.ts`) — skill `seo`.

### Páginas e formulários

| Rota | Componente | Coleção |
|---|---|---|
| `/voluntario` | `VoluntarioForm` | `voluntarios` |
| `/cadastro-beneficiario` | `CadastroBeneficiarioForm` | `beneficiarios` |
| `/contacto` | `ContactoForm` | `contactos` |
| footer | `Footer` | `newsletter_subscriptions` |
| `/doar-dinheiro`, `/doar-bens` | `DoarDinheiroForm`, página | — |
| `/admin` | `admin/*` (login/registo/código de acesso, dashboard por papel, gestão de utilizadores, portal do beneficiário) | todas via `/api/v1` |

Padrão de formulário: `useState` dos campos + `status: 'idle' | 'loading' | 'success' | 'error'`,
`await api('/formularios/<tipo>', { body })` (`src/lib/api.ts`); validação e timestamp no servidor (`src/server/schemas.ts`). País (`country` + `countryCode`)
e telefone internacional via `CountrySelect`/`PhoneField` (`src/lib/countries.ts`). Receita completa: skill `add-form`.

## Convenções

- **pt-PT** em UI, docs e **mensagens de commit** (`feat: Adiciona …`, Conventional Commits).
- Imports com alias `@/` (`@/lib/firebase`, `@/components/Header`).
- Paleta Tailwind: `terracotta` `#E07A5F`, `petroleo` `#3D5A80`, `creme` `#F8F4E3`, `creme-escuro` `#EAE2CF`;
  fontes `font-montserrat`, `font-lora` (`next/font`). Usar os tokens, não hex.
- Projecto **independente e global**: copy pública secular e agnóstica de país.
- Env: só `NEXT_PUBLIC_BASE_URL` (`apphosting.yaml`). Localmente o servidor precisa de ADC
  (`gcloud auth application-default login`) ou do emulador (`FIRESTORE_EMULATOR_HOST`). Segredos futuros: Secret Manager.
- Ontologia: coleção/campo/papel/estado novo ou alterado ⇒ `docs/ontology.{md,json}` na mesma PR.
- Mudanças que afectam a app Android (mesma base `caridade`) ⇒ PR coordenada em `tocoistas/caridade-mobile`.

## Skills e agentes

| Skill | Quando |
|---|---|
| `pr-workflow` | qualquer alteração (sempre) |
| `verify` | testar localmente / validar PR |
| `triage-prs` | tratar PRs abertas (Dependabot incluído) |
| `dependency-security` | alertas Dependabot, `npm audit` |
| `security-audit` | auditoria, segredos, sanitização do repo público |
| `auth-api` | login, contas, permissões, novas rotas `/api/v1`, bootstrap/reset do admin |
| `firestore-rules` | manter deny-all, testar e publicar regras |
| `i18n-copy` | texto de UI, novas páginas |
| `add-form` | novo formulário/entidade ponta-a-ponta |
| `deploy-status` | confirmar rollout no App Hosting |
| `seo` | metadados, partilha social (og:image), JSON-LD, robots, sitemap, llms.txt |

| Agente | Papel |
|---|---|
| `web-verifier` | GO/NO-GO de uma PR (corre `verify` + revê diff) |
| `security-auditor` | auditoria read-only (regras, segredos, app, deps, CI) |
| `i18n-reviewer` | copy, traduções, RTL, tom secular/global |
| `ontology-keeper` | alinhamento ontologia ↔ código web/mobile |

## Legado

A pasta-mãe do workspace contém um protótipo HTML
e `docs/` com enquadramento antigo (igreja/Angola) — histórico, não é copy actual.
