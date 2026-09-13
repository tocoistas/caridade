---
name: firestore-rules
description: Manter as regras Firestore da base nomeada 'caridade' em deny-all (acesso só pelo servidor via Admin SDK), testá-las no emulador e publicá-las. Usar quando alguém propõe dar acesso directo de clientes ao Firestore, ao mexer em firestore.rules/storage.rules ou antes de deploy de regras.
---

# Regras Firestore (deny-all)

Com a autenticação própria, **nenhum cliente** (browser ou app) acede ao Firestore. As regras
negam tudo; o servidor usa o Admin SDK (que ignora regras) e aplica a autorização em
`src/server/session.ts` + `ROLE_CAPS` (skill `auth-api`).

```
match /{document=**} { allow read, write: if false; }
```

## Regras de ouro

- **Não** acrescentar `allow` para clientes. Precisa de dados no browser/app? Crie uma rota `/api/v1` (skill `auth-api`).
- `docs/ontology.json` tem `"accessModel": "server"`; `npm run check:ontology` falha se as regras declararem coleções.
- `storage.rules` também nega tudo; ficheiros futuros devem passar por URLs assinados emitidos pelo servidor.

## Testar

```bash
npm run test:rules     # emulador: todas as coleções da ontologia negadas a visitante, autenticado e "admin"
```

## Deploy (não é automático)

O merge em `main` **não** publica regras.

```bash
firebase deploy --only firestore:rules --project insjcm
```

É uma acção de produção — confirmar com o utilizador. Antes de publicar deny-all, garantir que nenhum
cliente em uso (ex.: versão antiga da app Android) ainda escreve directamente no Firestore.
Rollback: consola Firebase → Firestore → Regras → histórico.
