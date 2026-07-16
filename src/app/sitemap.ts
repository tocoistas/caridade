import { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';

export const dynamic = 'force-static';

const ROUTES: { path: string; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']; priority: number }[] = [
  { path: '', changeFrequency: 'weekly', priority: 1 },
  { path: '/doar-dinheiro', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/doar-bens', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/voluntario', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/cadastro-beneficiario', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/contacto', changeFrequency: 'yearly', priority: 0.6 },
  { path: '/politica-privacidade', changeFrequency: 'yearly', priority: 0.5 },
  { path: '/termos-servico', changeFrequency: 'yearly', priority: 0.5 },
  { path: '/exclusao-dados', changeFrequency: 'yearly', priority: 0.5 },
];

/** Constrói o URL para um caminho e locale (pt fica na raiz — localePrefix 'as-needed'). */
function urlFor(base: string, locale: string, path: string): string {
  const prefix = locale === routing.defaultLocale ? '' : `/${locale}`;
  return `${base}${prefix}${path}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://caridade.ao';
  const lastModified = new Date();

  // Uma entrada por rota (URL canónico em pt) com alternates hreflang por idioma.
  return ROUTES.map(({ path, changeFrequency, priority }) => ({
    url: urlFor(baseUrl, routing.defaultLocale, path),
    lastModified,
    changeFrequency,
    priority,
    alternates: {
      languages: Object.fromEntries(
        routing.locales.map((locale) => [locale, urlFor(baseUrl, locale, path)])
      ),
    },
  }));
}
