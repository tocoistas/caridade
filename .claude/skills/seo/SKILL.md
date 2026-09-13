---
name: seo
description: SEO, partilha social e descoberta por IA no site do Projecto Caridade — metadados por página (título, descrição, canonical, hreflang com x-default), Open Graph/Twitter com imagem gerada por idioma, JSON-LD schema.org, robots.txt, sitemap.xml multilingue, manifest e llms.txt/llms-full.txt. Usar ao criar páginas, mudar copy de metadados, rever partilhas em redes sociais ou indexação.
---

# SEO e partilha

## Peças

| O quê | Onde | URL |
|---|---|---|
| Helpers (canonical, hreflang, OG, Twitter) | `src/lib/seo.ts` → `metadadosPagina()` | — |
| Metadados globais (template de título, ícones, manifest, robots meta) | `src/app/[locale]/layout.tsx` | — |
| JSON-LD (NGO + WebSite) | `src/components/JsonLd.tsx` (no layout) | — |
| Imagem de partilha 1200×630 | `src/app/og/[locale]/route.tsx` (estática, gerada no build) | `/og/pt`, `/og/en`… |
| robots.txt | `src/app/robots.ts` | `/robots.txt` |
| sitemap.xml (1 URL por idioma + alternates) | `src/app/sitemap.ts` (`ROTAS_PUBLICAS`) | `/sitemap.xml` |
| Manifest PWA | `src/app/manifest.ts` | `/manifest.webmanifest` |
| llms.txt / llms-full.txt | `src/lib/llms.ts` + rotas | `/llms.txt`, `/llms-full.txt` |

O middleware do next-intl ignora `/api`, `/og` e ficheiros com extensão.

## Nova página pública

```ts
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'minhaPagina' });
  return metadadosPagina({ locale, path: '/minha-pagina', titulo: t('metaTitle'), descricao: t('metaDescription') });
}
```

1. `metaTitle` (≤ 60 caracteres) e `metaDescription` (120–160) em `messages/pt.json` → `npm run translate`.
2. Acrescentar a `ROTAS_PUBLICAS` (sitemap), a `PAGINAS` em `src/lib/llms.ts` (se relevante) e a `scripts/dev/smoke.mjs`.
3. Área privada: `indexar: false` (ou `robots` no layout do segmento) e `disallow` em `robots.ts`.

## Verificar

```bash
npm run build && npm run smoke     # canonical, hreflang, og:image, JSON-LD, /og, /llms.txt, manifest
curl -s localhost:3000/en/voluntario | grep -Eo '<(link|meta)[^>]+(canonical|hreflang|og:|twitter:)[^>]+>'
```

Validadores externos (após deploy): Rich Results Test (JSON-LD), Facebook Sharing Debugger, validador de cartões do X/LinkedIn Post Inspector.

## Regras

- Um único domínio canónico: `NEXT_PUBLIC_BASE_URL` (`https://caridade.ao`). Nunca URLs absolutos fixos nos componentes.
- pt sem prefixo; `x-default` aponta para pt.
- Imagens OG: texto latino (o renderizador não tem fontes CJK/árabe/cirílico/devanágari) — os restantes idiomas usam inglês.
- Copy de metadados secular e agnóstica de país, como o resto do site.
