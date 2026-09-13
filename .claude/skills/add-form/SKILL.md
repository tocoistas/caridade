---
name: add-form
description: Receita ponta-a-ponta para criar um novo formulário/entidade no Projecto Caridade (página pública ou registo do portal) — componente cliente, coleção Firestore, regras, painel admin, ontologia, i18n, sitemap e paridade com a app Android. Usar quando se pede um novo formulário, cadastro ou tipo de registo.
---

# Novo formulário / entidade

Antes de começar: skill `pr-workflow` (branch `feat/<entidade>`).

## 1. Modelar (primeiro a ontologia)

- Nome da coleção em camelCase pt (`pedidosApoio`), campos em pt para dados internos.
  Formulários públicos existentes usam chaves en (`name`, `createdAt`) — manter o
  padrão do grupo a que pertence.
- Acrescentar a entidade a `docs/ontology.md` (§4, §6) e `docs/ontology.json`.
- Decidir: público (sem login) ou portal (papel mínimo)? Dados sensíveis? → minimização,
  consentimento, prazo de retenção (ver política de privacidade).

## 2. Servidor

- Formulário **público**: acrescentar o esquema `z.strictObject` e a entrada em `FORMULARIOS`
  (`src/server/schemas.ts`) — a rota `POST /api/v1/formularios/[tipo]` já trata validação, limite por IP e timestamp.
- Registo do **portal**: acrescentar a coleção a `COLECOES_REGISTO` (campos vêm da ontologia) e aos
  `view`/`create` do papel em `ROLE_CAPS` (`src/lib/roles.ts`). Rota `/api/v1/registos/[colecao]`.
- Outro comportamento: nova rota seguindo a skill `auth-api`.
- As regras Firestore **não mudam** (deny-all).

## 3. Componente

`src/components/<Nome>Form.tsx` (`'use client'`), padrão partilhado:

```tsx
const [formData, setFormData] = useState(initialFormData);
const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
// submit: setStatus('loading') → await api('/formularios/<tipo>', { body: {...} }) → 'success' | 'error'
```

- Imports: `@/lib/api`, `@/components/CountrySelect`, `@/components/PhoneField` (`fullPhoneNumber`). Nunca Firebase no cliente.
- País: `country` (nome) + `countryCode` (ISO-2). Telefone com indicativo.
- Tokens Tailwind da marca: `terracotta`, `petroleo`, `creme`, `creme-escuro`; fontes `font-montserrat`/`font-lora`.
- Botão desactivado em `loading`; mensagens com `role="alert"`.

## 4. Página

`src/app/[locale]/<rota>/page.tsx`: server component fino com `generateMetadata` traduzido.
Copy via skill `i18n-copy`. Acrescentar a `src/app/sitemap.ts` e a `scripts/dev/smoke.mjs`.

## 5. Painel `/admin` e testes

`CollectionConfig` em `src/lib/adminCollections.ts` (campos, `timestampField`, `titleField`, `valueLabels`).
Teste em `tests/api/api.test.mjs` (válido, inválido, campo extra, papel sem permissão).

## 6. App Android

Se a entidade existe também na app: `data/model/Models.kt`, `CaridadeRepository.kt`,
ecrã em `ui/screens/eixoN/` e rota em `NavGraph.kt` — PR coordenada em `tocoistas/caridade-mobile`
com os **mesmos nomes de coleção e campos**, consumindo a API (`/api/v1`) — nunca o Firestore directamente.

## 7. Verificar e publicar

`npm run verify` + `npm run test:e2e` → PR → merge.
