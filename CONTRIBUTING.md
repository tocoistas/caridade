# Como contribuir

Obrigado por ajudar o Projecto Caridade! Este repositório segue um fluxo único e
obrigatório para **todas** as alterações.

## Fluxo: branch → PR → verificação → merge → limpeza

```
main ──┬───────────────────────────────────────────▶ (squash-merge) ──▶ rollout Firebase App Hosting
       │                                               ▲
       └─▶ tipo/descricao ─ commits ─ push ─ PR ─ CI ──┘  → branch apagado (remoto + local)
```

1. **Actualizar main e criar branch**
   ```bash
   git switch main && git pull --ff-only
   git config core.hooksPath .githooks
   git switch -c feat/descricao-curta
   ```
   Prefixos: `feat` · `fix` · `security` · `deps` · `chore` · `ci` · `docs` · `refactor` · `perf` · `i18n`.

2. **Commits em português** (Conventional Commits): `feat: Adiciona formulário X`, `fix(admin): Corrige …`.

3. **Verificar localmente**
   ```bash
   npm ci && npm run verify
   ```

4. **Abrir a PR** para `main` (o template lista o checklist)
   ```bash
   git push -u origin HEAD
   gh pr create --base main
   ```

5. **CI** — os checks `verify` e `audit` têm de ficar verdes. Correcções vão no mesmo branch.

6. **Merge e limpeza** — squash-merge e remoção do branch no GitHub **e** localmente:
   ```bash
   scripts/dev/finish-pr.sh <n.º da PR>
   ```

7. **Pós-merge** — confirmar o rollout (`gh run list --workflow "Deploy para Firebase App Hosting"`)
   e executar acções descritas na PR (ex.: `firebase deploy --only firestore:rules`).

## Proteções

- `main` está protegido no GitHub: só entra por PR com checks verdes.
- Git hooks locais (`.githooks/`) bloqueiam commit/push directo em `main` e ficheiros secretos óbvios.
- Para o Claude Code, `.claude/hooks/guard-main.py` bloqueia os mesmos comandos.

## Regras do projecto

- Copy de interface só em `messages/pt.json`, depois `npm run translate`.
- Coleções, campos, papéis ou estados novos → actualizar `docs/ontology.md` e `docs/ontology.json`.
- Nunca commitar `.env*`, chaves, service accounts ou dados pessoais reais (o repo é público).
- Copy pública secular e agnóstica de país.
