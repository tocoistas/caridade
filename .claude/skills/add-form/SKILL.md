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

## 2. Regras (`firestore.rules`)

Skill `firestore-rules`. Público: `create` com validação de chaves/tamanhos; `read` só gestão.

## 3. Componente

`src/components/<Nome>Form.tsx` (`'use client'`), padrão partilhado:

```tsx
const [formData, setFormData] = useState(initialFormData);
const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
// submit: setStatus('loading') → addDoc(collection(db, '<colecao>'), {..., createdAt: serverTimestamp()}) → 'success' | 'error'
```

- Imports: `@/lib/firebase`, `@/components/CountrySelect`, `@/components/PhoneField` (`fullPhoneNumber`).
- País: gravar `country` (nome) + `countryCode` (ISO-2). Telefone com indicativo.
- Tokens Tailwind da marca: `terracotta`, `petroleo`, `creme`, `creme-escuro`; fontes `font-montserrat`/`font-lora`.
- Botão desactivado em `loading`; mensagens de sucesso/erro com `role="alert"`.

## 4. Página

`src/app/[locale]/<rota>/page.tsx`: server component fino com `generateMetadata`
traduzido que renderiza o formulário. Copy via skill `i18n-copy`.
Acrescentar a `src/app/sitemap.ts` e a `scripts/dev/smoke.mjs`.

## 5. Painel `/admin`

Acrescentar `CollectionConfig` em `src/lib/adminCollections.ts` (campos, `timestampField`,
`titleField`, `valueLabels`) e expor no `ROLE_CAPS` de `src/lib/roles.ts` (`view`/`create`).

## 6. App Android

Se a entidade existe também na app: `data/model/Models.kt`, `CaridadeRepository.kt`,
ecrã em `ui/screens/eixoN/` e rota em `NavGraph.kt` — PR coordenada em `tocoistas/caridade-mobile`
com os **mesmos nomes de coleção e campos**.

## 7. Verificar e publicar

`npm run verify` → PR → merge → **deploy das regras** (`firebase deploy --only firestore:rules`).
