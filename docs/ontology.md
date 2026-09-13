# Ontologia do Projecto Caridade

> Modelo conceptual **canónico** do domínio, partilhado pela web (`tocoistas/caridade`)
> e pela app Android (`tocoistas/caridade-mobile`). A versão legível por máquina
> é [`ontology.json`](./ontology.json) e é validada contra o código por
> `npm run check:ontology` (corre no CI).
>
> **Regra de ouro:** qualquer PR que acrescente/renomeie uma coleção, campo
> persistido, papel ou estado **tem de actualizar este ficheiro e o
> `ontology.json` na mesma PR**.

---

## 1. Propósito e âmbito

Plataforma solidária **independente e global** (sem afiliação religiosa ou
organizacional, sem enquadramento num único país) que liga **doadores**,
**voluntários** e **beneficiários**. Toda a copy pública é secular e agnóstica
de país; os formulários recolhem **país de residência** e **telefone
internacional** (indicativo + número).

A operação interna organiza-se em **3 eixos**:

| Eixo | Nome | Foco | Coleções |
|---|---|---|---|
| 1 | **Mão que Ampara** | Bens materiais: campanhas, stock, entregas | `campanhas`, `stock`, `distribuicoes`, (`beneficiarios`) |
| 2 | **Coração que Cuida** | Saúde: profissionais, referenciações, prevenção | `profissionaisVoluntarios`, `referencias`, `accoesPrevcao` |
| 3 | **Ponte de Esperança** | Necessidades confidenciais e doações dirigidas | `necessidades`, `doacoesEspecificas` |

---

## 2. Arquitectura de dados (factos fixos)

- **Único backend:** Firebase — projecto `insjcm`, **Firestore com base de dados nomeada `caridade`**. Nunca usar a base `(default)`.
- **Acesso só pelo servidor** (`accessModel: "server"`): a API Next.js `/api/v1` usa o Admin SDK com a
  service account do App Hosting (ADC). Browsers e a app Android **não** acedem ao Firestore;
  `firestore.rules` nega tudo. Contrato e controlos em [`auth.md`](./auth.md).
- **Autenticação própria** (sem Firebase Auth): e-mail + palavra-passe (scrypt), sessões opacas em
  `sessoes`, cookie httpOnly na web e Bearer token na app.
- **Autorização:** `src/server/session.ts` + `ROLE_CAPS` (`src/lib/roles.ts`) verificados em cada rota.
- **Validação:** esquemas zod estritos (`src/server/schemas.ts`); campos dos registos derivados de `ontology.json`.
- **Storage:** fechado (`storage.rules` nega tudo).
- **Valores enumerados persistidos ficam em pt** (`pendente`, `aprovado`, `em_analise`…); só as etiquetas de UI são traduzidas.
- Campos `serverFields` são preenchidos só pelo servidor; `secretFields` nunca saem da API.

---

## 3. Actores e papéis

### 3.1 Actores

| Actor | Autenticado? | Descrição |
|---|---|---|
| **Visitante** | não | Qualquer pessoa no site público. Pode submeter formulários públicos. |
| **Utilizador** | sim | Conta Firebase Auth com documento `utilizadores/{uid}`. Tem um `papel` e um `estado`. |
| **Admin bootstrap** | sim | E-mail fixo verificado (em `firestore.rules`, `auth.ts`, `AuthRepository.kt`). É sempre admin. |

### 3.2 Papéis (`Utilizador.papel`)

| Papel | Pode pedir no registo | Atribuído por | Resumo |
|---|---|---|---|
| `pendente` | — (valor inicial) | sistema | Sem acesso até aprovação. |
| `beneficiario` | ✅ | admin | Área pessoal: cria e acompanha os **seus** `pedidosApoio`. |
| `voluntario` | ✅ | admin | Equipa operacional (Eixo 1 + prevenção). |
| `profissional` | ✅ | admin | Profissional de saúde (Eixo 2). |
| `coordenador` | ❌ | admin | Gestão: lê tudo, cria em todos os eixos, edita operações. |
| `admin` | ❌ | admin / bootstrap | Tudo, incluindo gestão de utilizadores e eliminação. |

### 3.3 Estados de conta (`Utilizador.estado`)

```
            registo                aprovação (admin)
  (nada) ───────────▶ pendente ─────────────────────▶ aprovado
                          │                              │  ▲
                          │                  suspensão   ▼  │ reactivação
                          └──────────────────────────▶ suspenso
```

- Só o **admin** altera `papel`, `estado`, `aprovadoPor`, `aprovadoEm`.
- `papelPretendido` é a *sugestão* escolhida no auto-registo; não concede acesso.
- Um documento **novo** criado pelo próprio utilizador tem de nascer com
  `papel == 'pendente'` e `estado == 'pendente'` (excepto admin bootstrap).

### 3.4 Autorização (servidor)

| Verificação | Onde | Regra |
|---|---|---|
| `exigirSessao(req)` | `src/server/session.ts` | sessão válida (cookie ou Bearer), não expirada, conta não suspensa; mutações por cookie exigem `Origin` do próprio site |
| `exigirAprovado(sessao)` | idem | `estado == 'aprovado'` e sem troca de palavra-passe pendente |
| `sessao.caps` | `ROLE_CAPS[papel]` | `view[]` (listar), `create[]` (criar), `canManageUsers`, `personalArea` |
| gestão de pedidos | `PATCH /pedidos/{id}` | papel ∈ {admin, coordenador} |

Um admin suspenso perde tudo; o admin não pode alterar a própria conta pela API (evita bloqueio).

---

## 4. Entidades (coleções Firestore)

Legenda de acesso: **C** create · **R** read · **U** update · **D** delete.
Timestamp: campo usado para ordenar (mais recente primeiro).

### 4.1 Formulários públicos (site)

| Coleção | Entidade | Origem | C | R | U/D | Timestamp |
|---|---|---|---|---|---|---|
| `voluntarios` | Inscrição de voluntário | `VoluntarioForm` | todos | gestão | admin | `createdAt` |
| `beneficiarios` | Cadastro de beneficiário | `CadastroBeneficiarioForm` (web) · `BeneficiarioFormScreen` (Android, Form 1E) | todos | gestão | admin | `createdAt` |
| `contactos` | Mensagem de contacto | `ContactoForm` | todos | gestão | admin | `createdAt` |
| `newsletter_subscriptions` | Inscrição na newsletter | `Footer` | todos | gestão | admin | `subscribedAt` |

Campos (web):

- **voluntarios:** `name`, `email`, `country` (nome), `countryCode` (ISO-2), `phone` (E.164-like `+<dial><n>`), `interest`, `message`, `createdAt`.
- **beneficiarios (web):** `name`, `birthdate`, `id_number`, `country`, `countryCode`, `phone`, `email`, `address`, `adults`, `children`, `situation`, `supportNeeded[]` ∈ {`alimento`,`roupa`,`saude`,`outro`}, `consent` (bool), `createdAt`.
- **contactos:** `name`, `email`, `country`, `countryCode`, `phone`, `subject`, `message`, `createdAt`.
- **newsletter_subscriptions:** `email`, `subscribedAt`.

> ⚠️ **Divergência conhecida:** a app Android grava em `beneficiarios` com o
> esquema pt do Form 1E (`nomeCompleto`, `bi`, `pais`, `dataNascimento`,
> `enderecoFisico`, `telefonePrincipal`, `telefoneAlternativo`, `motivacao`,
> `necessidadeEspecifica`) e **sem timestamp**. O painel web espera o esquema
> en (`name`, `createdAt`…). Registos vindos da app aparecem incompletos no
> painel. Qualquer unificação deve ser feita em PRs coordenadas nos dois repos.

### 4.2 Eixo 1 — Mão que Ampara

| Coleção | Entidade (Form) | C | R | U/D | Campos |
|---|---|---|---|---|---|
| `campanhas` | Doação avulsa / campanha (1A) | equipa | equipa | gestão | `data`, `nomeDoador`, `contacto`, `descricaoBem`, `quantidade`, `recebidoPor`, `criadoEm` |
| `stock` | Controlo de stock (1C) | equipa | equipa | gestão | `data`, `item`, `entrada`, `saida`, `validade`, `nRegisto`, `criadoEm` |
| `distribuicoes` | Entrega de bens (1F) | equipa | equipa | gestão | `data`, `codigoBeneficiario`, `nomeBeneficiario`, `descricaoApoio`, `voluntarioResponsavel`, `criadoEm` |

### 4.3 Eixo 2 — Coração que Cuida

| Coleção | Entidade (Form) | C | R | U/D | Campos |
|---|---|---|---|---|---|
| `profissionaisVoluntarios` | Profissional voluntário (2A) | equipa | gestão + profissional | admin | `nomeCompleto`, `pais`, `telefone`, `email`, `profissaoEspecialidade`, `numeroCedula`, `disponibilidade`, `criadoEm` |
| `referencias` | Referenciação interna (2C) | equipa | gestão + profissional | gestão | `data`, `nomeBeneficiario`, `referenciadoPor`, `motivo`, `contactoAgendamento`, `criadoEm` |
| `accoesPrevcao` | Acção de prevenção (2F) | equipa | equipa | gestão | `titulo`, `dataHora`, `oradorPrincipal`, `localFisico`, `publicoAlvo`, `recursosNecessarios`, `criadoEm` |

> O nome `accoesPrevcao` (sem "en") é histórico e está persistido — **não renomear**.

### 4.4 Eixo 3 — Ponte de Esperança (confidencial)

| Coleção | Entidade (Form) | C | R | U/D | Campos |
|---|---|---|---|---|---|
| `necessidades` | Base confidencial de necessidades (3A) | gestão | gestão | admin | `codigoFamilia`, `agregadoFamiliar`, `situacao`, `necessidadeMaterial`, `statusGeral` (def. `Pendente`), `doador`, `garantiaResolucao`, `criadoEm` |
| `doacoesEspecificas` | Doação específica (3C) | gestão | gestão | admin | `dataRecebimento`, `codigoApelo`, `descricaoItem`, `identidadeDoador`, `contactabilidade`, `voluntarioLogistico`, `dataRemessa`, `criadoEm` |

### 4.5 Portal autenticado

| Coleção | Entidade | C | R | U | D | Campos |
|---|---|---|---|---|---|---|
| `utilizadores/{uid}` | Perfil de utilizador | o próprio (nasce `pendente`) | o próprio (get) · admin (get/list) | admin · o próprio sem campos de aprovação | admin | `uid`, `email`, `nomeCompleto`, `fotoUrl`, `papel`, `papelPretendido`, `estado`, `aprovadoPor`, `criadoEm`, `aprovadoEm` |
| `pedidosApoio` | Pedido de apoio de beneficiário | beneficiário aprovado (`uid` da sessão, `estado = novo`) | gestão · o próprio | gestão (só `estado`) | — (anonimizado ao eliminar a conta) | `uid`, `nomeBeneficiario`, `email`, `titulo`, `descricao`, `estado` ∈ {`novo`,`em_analise`,`resolvido`}, `criadoEm` |
| `admins/{uid}` | **Legado** — deixou de ser usado | ninguém | ninguém | — | — | (vazio) |

### 4.6 Autenticação (só servidor)

| Coleção | Entidade | Id | Campos | Notas |
|---|---|---|---|---|
| `sessoes` | Sessão | `sha256(token)` | `uid`, `cliente` (`web`\|`app`), `criadoEm`, `expiraEm` | TTL em `expiraEm`; revogada em logout, suspensão, troca de papel/palavra-passe |
| `emails` | Índice único de e-mail | e-mail normalizado | `uid`, `criadoEm` | garante unicidade transaccional |
| `limites` | Limite de pedidos | `sha256(chave)` | `inicio`, `contagem`, `expiraEm` | TTL em `expiraEm` |

`utilizadores` guarda ainda `passwordHash`, `codigoAcessoHash`, `codigoAcessoExpiraEm`, `codigoAcessoEmitidoPor`
(segredos — nunca expostos), `alterarPassword` e `ultimoLoginEm`.

Ciclo de vida de `PedidoApoio.estado`: `novo → em_analise → resolvido` (só gestão altera).

---

## 5. Relações

```
Utilizador (papel=beneficiario) ──1:N──▶ PedidoApoio          (pedidosApoio.uid = utilizadores.uid)
Beneficiario ◀──N:1── EntregaBens                              (distribuicoes.codigoBeneficiario, textual)
Beneficiario ◀──N:1── Referenciacao                            (referencias.nomeBeneficiario, textual)
Necessidade  ──1:N──▶ DoacaoEspecifica                         (doacoesEspecificas.codigoApelo ↔ necessidades.codigoFamilia, textual)
Campanha     ──N:M──▶ Stock                                    (implícita, por item/descrição)
Utilizador (papel=admin) ──1:N──▶ Utilizador                   (aprovadoPor)
```

Todas as relações excepto `pedidosApoio.uid` e `aprovadoPor` são **textuais e
não referenciais** (não há chaves estrangeiras nem validação). Não assumir
integridade referencial em código.

---

## 6. Matriz papel × capacidade (UI ↔ regras)

Fonte UI: `src/lib/roles.ts` (`ROLE_CAPS`). Fonte de verdade: `firestore.rules`.

| Coleção | admin | coordenador | voluntario | profissional | beneficiario | pendente | visitante |
|---|---|---|---|---|---|---|---|
| voluntarios / beneficiarios / contactos / newsletter | CRUD | CR | C | C | C | C | C |
| campanhas / stock / distribuicoes | CRUD | CRUD | CR | CR | — | — | — |
| accoesPrevcao | CRUD | CRUD | CR | CR | — | — | — |
| referencias | CR | CR | C | CR | — | — | — |
| profissionaisVoluntarios | CR | CR | C | CR | — | — | — |
| necessidades / doacoesEspecificas | CRUD | CR | — | — | — | — | — |
| pedidosApoio | RU | RU | — | — | C¹ R¹ | — | — |
| utilizadores | CRUD | próprio | próprio | próprio | próprio | próprio | — |

¹ apenas os próprios (`uid` da sessão) e com conta aprovada.

Todas as colunas pressupõem conta **aprovada**; pendentes e suspensos não acedem a dados. Alterações (U) além de estados e eliminações (D) de registos operacionais são feitas por administradores na consola, fora da API.

---

## 7. Superfícies (onde cada entidade aparece)

### Web (Next.js, `src/app/[locale]/`)

| Rota | Tipo | Entidades |
|---|---|---|
| `/` | pública | — (newsletter no footer) |
| `/voluntario` | pública | voluntarios |
| `/cadastro-beneficiario` | pública | beneficiarios |
| `/contacto` | pública | contactos |
| `/doar-dinheiro`, `/doar-bens` | pública | — (informativa) |
| `/politica-privacidade`, `/termos-servico`, `/exclusao-dados` | pública (legal) | — |
| `/admin` | autenticada | todas via `ADMIN_COLLECTIONS` + `utilizadores` + `pedidosApoio` |

Idiomas: `pt` (fonte, sem prefixo) + `en es fr de it zh ar ru hi ja` (prefixados; `ar` é RTL).

### Android (`ao.insjcm.caridade`)

| Ecrã | Entidade |
|---|---|
| `SignInScreen` | utilizadores (registo/login) |
| `BeneficiarioPortalScreen` | pedidosApoio |
| `Eixo1Screen` → Campanha / Stock / Beneficiario / EntregaBens | campanhas, stock, beneficiarios, distribuicoes |
| `Eixo2Screen` → VoluntarioProf / Referenciacao / AccaoPrevcao | profissionaisVoluntarios, referencias, accoesPrevcao |
| `Eixo3Screen` → Necessidade / DoacaoEspecifica | necessidades, doacoesEspecificas |

---

## 8. Glossário pt → en

| pt | en | Nota |
|---|---|---|
| Beneficiário | Beneficiary | quem recebe apoio |
| Voluntário | Volunteer | |
| Profissional (voluntário) | Health professional volunteer | Eixo 2 |
| Coordenador | Coordinator | |
| Campanha | Campaign / ad-hoc donation | Form 1A |
| Entrega de bens / Distribuição | Goods delivery | coleção `distribuicoes` |
| Referenciação | Internal referral | coleção `referencias` |
| Acção de prevenção | Prevention action | coleção `accoesPrevcao` |
| Necessidade | Need (confidential) | Eixo 3 |
| Doação específica | Targeted donation | Eixo 3 |
| Pedido de apoio | Support request | |
| Agregado familiar | Household | |
| Cédula | Professional licence number | |
| Aprovado / Pendente / Suspenso | Approved / Pending / Suspended | estado de conta |
