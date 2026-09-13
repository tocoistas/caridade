---
name: auth-api
description: Trabalhar com a autenticação própria e a API /api/v1 do Projecto Caridade — acrescentar/alterar rotas com sessão e autorização por papel, esquemas zod, sessões e cookies, códigos de acesso, bootstrap/reset do administrador, migração de utilizadores e testes e2e no emulador. Usar para login, contas, permissões, novos endpoints ou integração da app Android.
---

# Autenticação própria e API

Leitura obrigatória: [`docs/auth.md`](../../../docs/auth.md) (arquitectura, controlos e contrato da API).

## Mapa do código

| Ficheiro | Responsabilidade |
|---|---|
| `src/server/firebaseAdmin.ts` | `adminDb()` — Admin SDK, base `caridade`, ADC / emulador |
| `src/server/crypto.ts` | scrypt, tokens, códigos de acesso |
| `src/server/session.ts` | `criarSessao`, `obterSessao`, `exigirSessao({mutacao})`, `exigirAprovado`, revogação, cookie |
| `src/server/http.ts` | `rota()` (erros → JSON), `lerJson`, `ApiError`, `verificarOrigem` (CSRF), `ipDoPedido` |
| `src/server/rateLimit.ts` | `limitar(chave, max, janela)` persistido em `limites` |
| `src/server/schemas.ts` | esquemas zod estritos; `esquemaRegisto()` deriva de `docs/ontology.json` |
| `src/server/users.ts` | utilizadores, índice `emails`, códigos, `publico()` |
| `src/app/api/v1/**/route.ts` | rotas |
| `src/lib/api.ts`, `src/lib/auth.ts` | cliente web (sem segredos) |
| `scripts/admin/*.mjs` | bootstrap/reset do admin, migração |

Tudo em `src/server/` importa `'server-only'` — nunca importar a partir de componentes `'use client'`.

## Nova rota (receita)

```ts
import { ApiError, json, lerJson, rota } from '@/server/http';
import { exigirAprovado, exigirSessao } from '@/server/session';
import { meuSchema } from '@/server/schemas';

export const POST = rota(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const sessao = await exigirSessao(req, { mutacao: true }); // mutação ⇒ CSRF para cookies
  exigirAprovado(sessao);
  if (!sessao.caps.create.includes('colecao')) throw new ApiError(403, 'sem_permissao');
  const dados = meuSchema.parse(await lerJson(req));        // z.strictObject — rejeita campos extra
  // … adminDb().collection('colecao') …
  return json({ id }, { status: 201 });
});
```

Checklist:
- [ ] `exigirSessao` (+ `{ mutacao: true }` em POST/PATCH/DELETE) e `exigirAprovado`, excepto rotas públicas.
- [ ] Autorização explícita por `sessao.caps` / papel — nunca confiar em dados do cliente (`uid`, `papel`, `estado`).
- [ ] Esquema `z.strictObject` com limites de tamanho; campos preenchidos pelo servidor fora do esquema.
- [ ] `limitar()` em rotas públicas ou sensíveis a força bruta.
- [ ] Nunca devolver documentos crus de `utilizadores` — usar `publico()`; serializar Timestamps (`serializar()`).
- [ ] Códigos de erro estáveis (`snake_case`) — a app Android depende deles; documentar em `docs/auth.md`.
- [ ] Teste em `tests/api/api.test.mjs` (caso feliz + negação + escalada).
- [ ] Coleção nova ⇒ `docs/ontology.{md,json}` (skill `add-form`).

## Operações

```bash
gcloud auth application-default login
node scripts/admin/bootstrap-admin.mjs --email <e-mail> [--nome "…"]      # criar / activar
node scripts/admin/bootstrap-admin.mjs --email <e-mail> --reset [--gerar] # repor
node scripts/admin/migrar-utilizadores.mjs [--aplicar]                    # perfis antigos → índice de e-mail
```

Nunca passar palavras-passe como argumentos, nunca as registar, nunca pôr e-mails pessoais no código.
Correr scripts contra produção é uma acção de produção — confirmar com o utilizador antes.

## Testes

```bash
npm run build && npm run test:e2e   # servidor real + emulador Firestore
npm run test:rules                  # regras deny-all
```

## App Android

Login/registo com `"cliente": "app"` → `token`; enviar `Authorization: Bearer <token>`. Tratar 401 → novo login;
403 `alterar_password` → ecrã de troca. Mesmos códigos de erro que a web. Guardar o token só em armazenamento privado
(sem backup). Ver skill `web-parity` no repo mobile.
