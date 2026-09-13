# Autenticação e API (`/api/v1`)

Sistema de autenticação **próprio**, sem Firebase Auth. Os dados de utilizador vivem no
Firestore (base `caridade`) e **só o servidor** lhes acede. A web e a app Android usam a
mesma API.

```
Browser (cookie httpOnly) ──┐
                            ├──▶ Next.js /api/v1 (Cloud Run / App Hosting) ──▶ Firestore `caridade`
App Android (Bearer token) ─┘        Admin SDK + ADC da service account          (regras: nega tudo a clientes)
```

## Princípios de segurança

| Controlo | Implementação |
|---|---|
| Sem acesso directo à base | `firestore.rules` nega tudo; Admin SDK usa a service account do App Hosting (sem chaves no repo) |
| Palavras-passe | scrypt (N=2¹⁵, r=8, p=1, sal 16 B, 64 B), normalização NFKC, comparação em tempo constante, mínimo 10 caracteres |
| Sessões | token opaco de 256 bits; na base só se guarda `sha256(token)` em `sessoes/{hash}`; web 7 dias, app 30 dias |
| Cookie (web) | `__Host-caridade-sessao`, `HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/` |
| CSRF | mutações autenticadas por cookie exigem `Origin` igual ao host; Bearer não usa cookies |
| Enumeração de contas | login devolve sempre `credenciais_invalidas`; hash fictício quando o e-mail não existe |
| Força bruta / abuso | limites em `limites/{sha256(chave)}`: login 10/15 min por e-mail e 30/15 min por IP; registo 5/h por IP; códigos 5/15 min por e-mail; formulários 10/h por IP e tipo |
| Escalada de privilégios | registo aceita só `nome, email, password, papelPretendido, cliente` (esquemas zod estritos); conta nasce `pendente` |
| Autorização | `src/server/session.ts` (`exigirSessao`, `exigirAprovado`) + `ROLE_CAPS` de `src/lib/roles.ts`, verificados em cada rota |
| Suspensão | revoga todas as sessões; login devolve `conta_suspensa` |
| Dados expostos | `publico()` nunca devolve hashes, códigos ou tokens; respostas com `Cache-Control: no-store` |
| Validação | zod estrito em todas as entradas; campos de registos derivados de `docs/ontology.json`; corpo ≤ 64 KiB |

## Ciclo de vida de uma conta

1. **Registo** (`POST /auth/registo`) → `papel=pendente`, `estado=pendente`, `papelPretendido` como sugestão.
2. **Aprovação** pelo admin no painel (`PATCH /utilizadores/{uid}`) → papel + `aprovado`. Revoga sessões antigas.
3. **Esqueceu-se da palavra-passe / primeiro acesso** (não há envio de e-mail):
   admin → *Código de acesso* (`POST /utilizadores/{uid}/codigo-acesso`) → código `XXXXX-XXXXX`
   válido 72 h, de uso único, mostrado **uma vez** → entregue por canal seguro →
   pessoa usa *“Tenho um código de acesso”* (`POST /auth/definir-password`).
4. **Suspensão** (`PATCH … {estado:"suspenso"}`) → sessões revogadas, login bloqueado.

## Contrato da API

Base: `https://caridade.ao/api/v1`. JSON UTF-8. Erros: `{ "erro": "<codigo>", "mensagem"?: "...", "campos"?: [...] }`.

App Android: enviar `"cliente": "app"` no login/registo/definir-password → a resposta inclui
`token` e `expiraEm`; usar `Authorization: Bearer <token>` nos pedidos seguintes. Guardar o token
só no armazenamento privado da app (nunca em logs nem backups).

### Autenticação

| Método e caminho | Corpo | Sucesso | Erros |
|---|---|---|---|
| `POST /auth/registo` | `nome, email, password, papelPretendido (beneficiario\|voluntario\|profissional), cliente?` | 201 `{utilizador, token?}` | 400 `dados_invalidos`, 409 `email_em_uso`, 429 |
| `POST /auth/login` | `email, password, cliente?` | 200 `{utilizador, token?}` | 401 `credenciais_invalidas`, 403 `conta_suspensa`, 429 |
| `POST /auth/logout` | `{}` | 200 | — |
| `GET /auth/sessao` | — | 200 `{utilizador, capacidades}` | 401 `nao_autenticado` |
| `POST /auth/definir-password` | `email, codigo, novaPassword, cliente?` | 200 `{utilizador, token?}` | 400 `codigo_invalido`, 403, 429 |
| `POST /auth/alterar-password` | `actual, nova` | 200 `{utilizador, token?}` (novas credenciais; outras sessões revogadas) | 401, 400 `password_igual` |

`utilizador` = `{uid, email, nomeCompleto, papel, papelPretendido, estado, alterarPassword, temPassword, codigoAcessoPendente, criadoEm, aprovadoEm, ultimoLoginEm}`.
`capacidades` = `ROLE_CAPS[papel]` (`canManageUsers`, `view[]`, `create[]`, `personalArea`).
Se `alterarPassword` for `true`, as rotas de dados devolvem 403 `alterar_password` até à troca.

### Formulários públicos (sem sessão)

| Método e caminho | Corpo | Sucesso |
|---|---|---|
| `POST /formularios/voluntarios` | `name, email, country?, countryCode?, phone?, interest?, message?` | 201 `{id}` |
| `POST /formularios/beneficiarios` | `name, birthdate?, id_number?, country?, countryCode?, phone?, email?, address?, adults?, children?, situation?, supportNeeded?[], consent: true` | 201 |
| `POST /formularios/contactos` | `name, email, message, country?, countryCode?, phone?, subject?` | 201 |
| `POST /formularios/newsletter` | `email` | 201 |

### Dados do portal (sessão aprovada)

| Método e caminho | Quem | Notas |
|---|---|---|
| `GET /registos/{colecao}` | `colecao ∈ capacidades.view` | até 1000, mais recentes primeiro; timestamps em ISO 8601 |
| `POST /registos/{colecao}` | `colecao ∈ capacidades.create` | só campos da ontologia (texto ≤ 5000); servidor acrescenta `criadoEm`, `criadoPor` |
| `GET /pedidos` | beneficiário (os seus) · gestão (todos) | |
| `POST /pedidos` | beneficiário | `titulo, descricao?` → `estado: "novo"` |
| `PATCH /pedidos/{id}` | admin/coordenador | `estado ∈ novo\|em_analise\|resolvido` |
| `GET /utilizadores` | admin | |
| `PATCH /utilizadores/{uid}` | admin (não a si próprio) | `papel?`, `estado? (aprovado\|suspenso)` |
| `POST /utilizadores/{uid}/codigo-acesso` | admin (não a si próprio) | 201 `{codigo, expiraEm}` — mostrar uma vez |

## Operações

### Bootstrap / reposição do administrador

Não existe nenhum e-mail de administrador no código. Com credenciais ADC de alguém com acesso ao projecto:

```bash
gcloud auth application-default login
node scripts/admin/bootstrap-admin.mjs --email <e-mail> --nome "Nome"          # cria (ou activa perfil migrado)
node scripts/admin/bootstrap-admin.mjs --email <e-mail> --reset                # repõe palavra-passe e revoga sessões
node scripts/admin/bootstrap-admin.mjs --email <e-mail> --reset --gerar        # palavra-passe temporária + troca obrigatória
```

A palavra-passe é pedida sem eco (ou lida do stdin); nunca é passada como argumento nem registada.

### Migração dos perfis do Firebase Auth

```bash
node scripts/admin/migrar-utilizadores.mjs            # ensaio (relatório)
node scripts/admin/migrar-utilizadores.mjs --aplicar  # cria índice emails/{email}, normaliza e-mails
```

Depois: bootstrap do admin; para cada perfil sem palavra-passe, emitir **código de acesso** no painel.
As contas antigas do Firebase Authentication podem ser desactivadas na consola quando a migração estiver concluída.

### Limpeza automática (TTL)

```bash
gcloud firestore fields ttls update expiraEm --collection-group=sessoes --enable-ttl --database=caridade --project=insjcm
gcloud firestore fields ttls update expiraEm --collection-group=limites --enable-ttl --database=caridade --project=insjcm
```

### Regras Firestore

`firestore.rules` nega todo o acesso de clientes. Publicar após o merge da PR:
`firebase deploy --only firestore:rules --project insjcm`. **Atenção:** a app Android anterior à
migração para a API deixa de conseguir ler/escrever.

### Testes

```bash
npm run test:rules   # regras: acesso directo sempre negado (emulador)
npm run build && npm run test:e2e   # API completa contra o emulador (bootstrap, registo, CSRF, papéis, códigos, suspensão)
```
