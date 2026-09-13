---
name: privacy-compliance
description: Conformidade de privacidade do Projecto Caridade com a Lei n.º 22/11 (Angola) e o RGPD — consentimento versionado nos formulários, banner de cookies e Google Analytics só com consentimento, pedidos dos titulares (/direitos-dados, exportar/eliminar conta), retenção, registo de actividades de tratamento, AIPD e resposta a violações. Usar ao recolher dados novos, mexer em formulários, analytics, textos legais ou quando alguém exerce direitos sobre os seus dados.
---

# Privacidade e protecção de dados

Documentação: `docs/privacidade/` — `README.md` (visão geral e checklist), `registo-actividades-tratamento.md`,
`avaliacao-impacto.md`, `retencao.md`, `pedidos-titulares.md`, `violacoes-dados.md`, `subcontratantes.md`.
Não é aconselhamento jurídico: alterações materiais aos textos legais devem ser validadas por jurista.

## Novo dado pessoal ou formulário (checklist)

1. **Finalidade e base legal** → linha no registo de actividades; minimizar campos.
2. **Aviso** junto do formulário (componente `AvisoPrivacidade`) com link para `/politica-privacidade`.
3. **Consentimento** quando for a base legal:
   - caixa **não pré-marcada**, texto específico; dados sensíveis (saúde/situação social) com caixa **separada**;
   - o servidor exige `consent: true` (zod `z.literal(true)`) e grava `consentVersion` (= `VERSAO_POLITICA` em
     `src/lib/privacidade.ts`) e `consentAt` (timestamp do servidor).
4. **Retenção** → `retencao.md` + `scripts/admin/aplicar-retencao.mjs`.
5. **Direitos** → garantir que os dados aparecem em *Os meus dados* / eliminação de conta / procedimento manual.
6. **Ontologia** → campos novos em `docs/ontology.{md,json}`.
7. Rever com o agente `privacy-reviewer`.

## Cookies e analytics

- `src/components/ConsentimentoCookies.tsx`: banner com **Aceitar / Rejeitar / Personalizar** com igual destaque;
  escolha em `localStorage` + cookie `caridade-consentimento` (versão, data, categorias).
- Google Analytics (`src/components/Analytics.tsx`) só é injectado após consentimento para `analytics`;
  Consent Mode v2 com tudo `denied` por omissão; `anonymize_ip`.
- "Preferências de cookies" no rodapé reabre o banner. Retirar consentimento apaga os cookies `_ga*`.
- Nunca acrescentar pixels/scripts de terceiros sem categoria de consentimento e entrada em `subcontratantes.md`.

## Alterar a política de privacidade

1. Editar `messages/pt.json` → `privacidade` (e `cookies`), actualizar a data de vigência.
2. Incrementar `VERSAO_POLITICA` em `src/lib/privacidade.ts` se a mudança for material (novos dados/finalidades/destinatários).
3. `npm run translate -- --keys=privacidade,cookies` e `npm run check:i18n`.
4. PR com revisão jurídica indicada no corpo.

## Pedido de um titular

Seguir `docs/privacidade/pedidos-titulares.md` (prazo: 30 dias). Pedidos chegam a `pedidosTitulares`
(painel → *Pedidos de titulares*, só admin).

## Incidente

Seguir `docs/privacidade/violacoes-dados.md` — contenção imediata, avaliação em 24 h, notificação em 72 h quando aplicável.
