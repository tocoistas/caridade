---
name: security-audit
description: Auditoria de segurança do repo web público — segredos e dados pessoais no código e no histórico git, regras Firestore, autenticação/autorização, XSS/injecção (incl. CSV), cabeçalhos HTTP, dependências e CI. Usar quando se pede auditoria, sanitização, "há segredos expostos?" ou antes de tornar algo público.
---

# Auditoria de segurança

O repo `tocoistas/caridade` é **público**. Tudo o que está em qualquer commit é público.

## 1. Segredos e PII — árvore actual e histórico

```bash
# árvore actual
git grep -nIE '(AIza[0-9A-Za-z_-]{35}|-----BEGIN [A-Z ]*PRIVATE KEY|"private_key"|client_secret|ghp_|gho_|sk-[A-Za-z0-9]{20}|xox[baprs]-|password\s*[:=]\s*["'\''][^"'\'']+)' -- . ':!package-lock.json'
git grep -nIE '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[a-z]{2,}' -- src firestore.rules storage.rules ':!*.json'
# histórico completo (todas as refs)
git log --all -p --no-color | grep -nIE '<mesmos padrões>' | head
git log --all --diff-filter=A --name-only --format= | sort -u | grep -iE '\.env|service.?account|\.pem|\.p12|\.jks|\.keystore|credentials'
```

Classificar cada achado:
- **Segredo real** (chave privada, service account, token, password) → revogar/rodar
  **imediatamente** na origem; remover da árvore; propor reescrita do histórico
  (`git filter-repo`) — só com autorização explícita (reescreve `main` e exige force-push).
- **Público por design** (config web do Firebase: `apiKey`, `appId`…) → não é segredo; garantir
  restrições da API key (referrers HTTP) na consola GCP e que as regras protegem os dados.
- **PII** (e-mails pessoais, nomes, telefones) → remover do código; mover para configuração
  não versionada ou dados.

## 2. Autenticação e autorização (skill `auth-api`)

- `firestore.rules` tem de ser deny-all (acesso só pelo servidor).
- Cada rota em `src/app/api/v1/**`: `exigirSessao` (+ `mutacao` ⇒ CSRF), `exigirAprovado`, verificação de papel/caps,
  `z.strictObject` (sem campos de autorização vindos do cliente), `limitar()` em rotas públicas/sensíveis.
- Nunca expor `passwordHash`, `codigoAcessoHash`, tokens; sessões guardadas só como `sha256`.
- Enumeração de contas (mensagens iguais), revogação de sessões em suspensão/troca de papel ou palavra-passe.
- Nunca confiar em verificações só do cliente (`src/lib/auth.ts`, `roles.ts` na UI).

## 3. Aplicação

- XSS: `dangerouslySetInnerHTML`, `href` com `javascript:`; JSON-LD serializado com escape de `<`.
- **CSV/formula injection** em exportações (`toCSV`): prefixar `'` a valores que começam por `= + - @ \t \r`.
- Cabeçalhos em `next.config.ts` (`headers()`): `Content-Security-Policy`, `X-Frame-Options`/`frame-ancestors`,
  `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `Strict-Transport-Security`.
- `console.error` com dados pessoais; mensagens de erro que revelam internals.

## 4. Supply chain e CI

- `npm audit --audit-level=high` = 0 (skill `dependency-security`).
- Workflows: `permissions:` mínimas, sem `pull_request_target` com checkout do PR, secrets só em jobs de `main`.
- Actions de terceiros fixadas por versão major (idealmente SHA).

## 5. Relatório

Tabela: severidade · local (`ficheiro:linha`) · impacto · correcção · PR. Uma PR por classe de
problema (regras, app, dependências, sanitização). Acções irreversíveis ou de produção
(deploy de regras, rotação de chaves, reescrita de histórico) → pedir confirmação.
