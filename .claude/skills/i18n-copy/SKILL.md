---
name: i18n-copy
description: Alterar ou acrescentar texto de interface no site (next-intl, 11 idiomas) — editar apenas messages/pt.json, gerar traduções com npm run translate, validar chaves/placeholders e respeitar o tom secular e global. Usar para qualquer mudança de copy, novas páginas ou novos campos de formulário.
---

# Copy e internacionalização

## Regras

- **Fonte única:** `messages/pt.json` (pt-PT). Nunca editar `messages/<outro>.json` à mão
  (excepto correcção pontual de uma má tradução — e documentar na PR).
- Idiomas: `pt` (sem prefixo) + `en es fr de it zh ar ru hi ja`; `ar` é RTL.
- Copy pública **secular e agnóstica de país**: sem referências religiosas, a igrejas
  ou a um único país. Formulários pedem país de residência e telefone internacional.
- Área `/admin` é intencionalmente só pt (texto inline nos componentes).
- Valores persistidos no Firestore (enums) ficam em pt; traduz-se apenas a etiqueta.

## Passos

1. Acrescentar/alterar chaves em `messages/pt.json` (agrupar por página: `voluntario.*`, `form.*`…).
2. No componente: `const t = useTranslations('grupo')` (client) ou `getTranslations` (server).
3. Links internos: `Link`/`useRouter`/`usePathname` de `@/i18n/navigation` — nunca `next/link`.
4. Gerar traduções:
   ```bash
   npm run translate                              # incremental: chaves em falta ou com marcadores partidos
   npm run translate -- --keys=home.aboutP1,form  # texto pt ALTERADO numa chave existente → re-traduzir esses prefixos
   npm run translate -- --only=en,fr              # limitar idiomas
   npm run translate -- --force                   # re-traduzir tudo
   ```
   Marcadores `{placeholders}` e `<tags>` nunca vão ao tradutor (o texto é segmentado);
   requer rede (endpoint público do Google Translate). **Atenção:** o modo incremental não
   detecta texto pt alterado em chaves já traduzidas — use `--keys=`.
5. Validar: `npm run check:i18n` e `npm run smoke` (verifica `lang`/`dir`).
6. Rever visualmente pelo menos `pt`, `en` e `ar` (RTL) em `npm run dev`.

## Nova página

- Criar `src/app/[locale]/<rota>/page.tsx` com `generateMetadata` traduzido e `setRequestLocale`.
- Acrescentar a rota a `src/app/sitemap.ts` e ao smoke test (`scripts/dev/smoke.mjs`).
