import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';
import { urlAbsoluto } from '@/lib/seo';

export const dynamic = 'force-static';

/** Rotas públicas indexáveis. Nova página ⇒ acrescentar aqui e em scripts/dev/smoke.mjs. */
export const ROTAS_PUBLICAS: {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
  priority: number;
}[] = [
  { path: '', changeFrequency: 'weekly', priority: 1 },
  { path: '/doar-dinheiro', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/doar-bens', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/voluntario', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/cadastro-beneficiario', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/contacto', changeFrequency: 'yearly', priority: 0.6 },
  { path: '/politica-privacidade', changeFrequency: 'yearly', priority: 0.4 },
  { path: '/termos-servico', changeFrequency: 'yearly', priority: 0.4 },
  { path: '/exclusao-dados', changeFrequency: 'yearly', priority: 0.4 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  // Uma entrada por idioma, cada uma com alternates hreflang para todos (incl. x-default).
  return ROTAS_PUBLICAS.flatMap(({ path, changeFrequency, priority }) =>
    routing.locales.map((locale) => ({
      url: urlAbsoluto(locale, path),
      lastModified,
      changeFrequency,
      priority: locale === routing.defaultLocale ? priority : Math.round(priority * 0.9 * 10) / 10,
      alternates: {
        languages: {
          ...Object.fromEntries(routing.locales.map((l) => [l, urlAbsoluto(l, path)])),
          'x-default': urlAbsoluto(routing.defaultLocale, path),
        },
      },
    }))
  );
}
