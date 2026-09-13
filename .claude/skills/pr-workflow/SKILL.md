---
name: pr-workflow
description: Ciclo de vida obrigatório de QUALQUER alteração no repo web — branch próprio a partir de main, commits em pt, verificação local, PR, CI verde, squash-merge em main e remoção do branch no remoto e local. Usar sempre que for alterar código, docs, dependências ou configuração.
---

# Fluxo de trabalho: branch → PR → verificação → merge → limpeza

**Nunca** se commita nem se faz push directamente para `main`. Isto é imposto em
três camadas: hook `PreToolUse` do Claude (`.claude/hooks/guard-main.py`), git
hooks locais (`.githooks/`, activados por `core.hooksPath`) e protecção de
branch no GitHub (checks obrigatórios).

## 1. Começar a partir de main actualizado

```bash
git switch main && git pull --ff-only && git fetch --prune
git config core.hooksPath .githooks          # idempotente
git switch -c <tipo>/<descricao-curta-kebab>
```

Tipos de branch (= prefixo do commit): `feat`, `fix`, `security`, `deps`, `chore`,
`ci`, `docs`, `refactor`, `perf`, `i18n`. Um branch = um assunto = uma PR.

Se houver trabalho não commitado em `main`, mova-o: `git stash && git switch -c … && git stash pop`.

## 2. Implementar

- Seguir `CLAUDE.md` e `docs/ontology.md`. Alterou coleção/campo/papel/estado?
  Actualize `docs/ontology.md` **e** `docs/ontology.json` na mesma PR.
- Copy de UI: só `messages/pt.json` + `npm run translate` (skill `i18n-copy`).
- Regras Firestore: skill `firestore-rules`.

## 3. Commits

Mensagens em **português**, Conventional Commits: `feat: Adiciona …`, `fix(admin): Corrige …`.
Terminar com as linhas de atribuição indicadas pelo sistema (Co-Authored-By / Claude-Session), quando existirem.

```bash
git add <ficheiros>        # nunca `git add -A` às cegas — confirme que não entram .env, chaves, builds
git commit -m "tipo: Descrição" -m "Corpo opcional"
```

## 4. Verificar localmente (antes de abrir PR)

```bash
SKIP_INSTALL=1 npm run verify     # lint · typecheck · i18n · ontologia · build · smoke · audit
```

Para mudanças de segurança/dados/auth, correr também o agente `security-auditor`.
Para copy/i18n, o agente `i18n-reviewer`.

## 5. Abrir a PR

```bash
git push -u origin HEAD
gh pr create --base main --fill-first \
  --title "tipo: Descrição em pt" \
  --body-file <(cat <<'EOF'
## Resumo
…
## Como foi testado
- [x] npm run verify
…
EOF
)
```

O corpo segue `.github/pull_request_template.md` e termina com a linha de
atribuição indicada pelo sistema (quando existir).

## 6. CI e revisão

```bash
gh pr checks <n> --watch --fail-fast
```

- Checks obrigatórios: `verify` (lint, tipos, i18n, ontologia, build, smoke) e `audit`.
- CI vermelho → corrigir no **mesmo branch**, novo commit, push. Não fazer merge com checks vermelhos.
- Rever o diff final: `gh pr diff <n>` (ou agente `web-verifier <n>`).

## 7. Merge + limpeza (remoto e local)

```bash
scripts/dev/finish-pr.sh <n>
```

O script: espera pelos checks → confirma `MERGEABLE` → `gh pr merge --squash --delete-branch`
→ `git switch main && git pull --ff-only && git fetch --prune` → apaga o branch local
e remoto se ainda existirem → falha se algum sobreviver.

Se a PR ficar `CONFLICTING`: `git switch <branch> && git fetch && git rebase origin/main`,
resolver, `npm run verify`, `git push --force-with-lease`, repetir o passo 7.
(`--force-with-lease` só em branches de feature, nunca em main.)

## 8. Pós-merge

O push em `main` dispara o rollout do **Firebase App Hosting** e o workflow
`Deploy para Firebase App Hosting` monitoriza-o. Confirmar com a skill `deploy-status`.
