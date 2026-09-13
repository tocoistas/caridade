## Resumo

<!-- O quê e porquê, em 1–3 frases. Referencie issues/alertas (ex.: GHSA-xxxx). -->

## Tipo

- [ ] feat · [ ] fix · [ ] security · [ ] deps · [ ] chore/ci · [ ] docs · [ ] i18n

## Como foi testado

- [ ] `npm run verify` (lint · typecheck · i18n · ontologia · build · smoke · audit)
- [ ] Verificado manualmente em `npm run dev` (rotas/idiomas: …)
- [ ] Testes de regras Firestore (se tocou em `firestore.rules`)

## Checklist

- [ ] Branch próprio a partir de `main` actualizado; commits em português
- [ ] Copy nova só em `messages/pt.json` + `npm run translate`
- [ ] Coleções/campos/papéis alterados → `docs/ontology.md` e `docs/ontology.json` actualizados
- [ ] Sem segredos, `.env`, dados pessoais ou chaves no diff
- [ ] Impacto na app Android avaliado (mesma base Firestore `caridade`)
- [ ] Requer acção pós-merge? (ex.: `firebase deploy --only firestore:rules`) → descrita abaixo

## Pós-merge

<!-- Deploy de regras, variáveis de ambiente, migrações de dados… ou "nenhuma". -->
