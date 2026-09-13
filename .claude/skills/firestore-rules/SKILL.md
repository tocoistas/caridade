---
name: firestore-rules
description: Alterar com segurança firestore.rules / storage.rules da base nomeada 'caridade' — modelo de ameaça, alinhamento com roles.ts e a ontologia, testes no emulador e deploy manual das regras. Usar ao criar coleções, mudar permissões ou corrigir falhas de autorização.
---

# Regras Firestore

**As regras são a única barreira de segurança** — o cliente escreve directamente
no Firestore. A UI (`src/lib/roles.ts`, `NavGraph.kt` na app) só esconde botões.

## Checklist de alteração

1. **Modelo de ameaça**: assumir um atacante com a apiKey pública, uma conta
   própria criada via REST e chamadas directas à API do Firestore (sem UI).
2. Para cada `match`:
   - `create` público? Validar **forma** (`request.resource.data.keys().hasOnly([...])`),
     **tipos** e **tamanhos** (`.size() <= N`) — evita spam/abuso de armazenamento.
   - Campos de autorização (`papel`, `estado`, `uid`, `aprovadoPor`) nunca podem ser
     definidos/alterados pelo próprio utilizador. Na **criação** também!
   - `read` com dados pessoais → só `gestaoPapeis()` ou dono (`resource.data.uid == request.auth.uid`).
   - `list` vs `get`: queries do cliente precisam de `list`; a condição tem de ser
     satisfazível pela query (ex.: `where('uid','==',uid)`).
3. Manter o catch-all `match /{document=**} { allow read, write: if false; }` no fim.
4. Actualizar `src/lib/roles.ts` (UI), `docs/ontology.md` §3/§4/§6 e `docs/ontology.json`.
5. `npm run check:ontology`.

## Testar

```bash
npm run test:rules      # se existir: emulador + @firebase/rules-unit-testing
# manual:
firebase emulators:start --only firestore --project demo-caridade
```

Casos mínimos a cobrir numa mudança: visitante, utilizador `pendente`, cada papel
aprovado, utilizador `suspenso`, e tentativa de escalada (criar/alterar o próprio
`papel`).

## Deploy (não é automático!)

O merge em `main` **não** publica regras — o App Hosting só publica a app.

```bash
firebase deploy --only firestore:rules --project insjcm     # usa firebase.json (database: caridade)
firebase deploy --only storage --project insjcm
```

Publicar regras é uma acção de produção: confirmar com o utilizador antes, e fazê-lo
logo após o merge da PR correspondente. Rollback: re-deploy da versão anterior
(`git show <sha>~1:firestore.rules > /tmp/r && …`) ou pela consola (histórico de regras).
