import type { Metadata } from 'next';
import { routing, type Locale } from '@/i18n/routing';

/** URL canónico do site (sem barra final). */
export const BASE_URL = (process.env.NEXT_PUBLIC_BASE_URL || 'https://caridade.ao').replace(/\/$/, '');

export const NOME_SITE = 'Projecto Caridade';

/** Locale no formato do Open Graph. */
export const OG_LOCALE: Record<Locale, string> = {
  pt: 'pt_PT',
  en: 'en_US',
  es: 'es_ES',
  fr: 'fr_FR',
  de: 'de_DE',
  it: 'it_IT',
  zh: 'zh_CN',
  ar: 'ar_AR',
  ru: 'ru_RU',
  hi: 'hi_IN',
  ja: 'ja_JP',
};

/** Caminho localizado: pt na raiz, restantes com prefixo (localePrefix 'as-needed'). */
export function caminhoLocalizado(locale: string, path = ''): string {
  const prefixo = locale === routing.defaultLocale ? '' : `/${locale}`;
  return `${prefixo}${path}` || '/';
}

export function urlAbsoluto(locale: string, path = ''): string {
  return `${BASE_URL}${caminhoLocalizado(locale, path)}`;
}

/** Canonical + hreflang para todos os idiomas (e x-default → pt). */
export function alternates(locale: string, path = ''): NonNullable<Metadata['alternates']> {
  return {
    canonical: caminhoLocalizado(locale, path),
    languages: {
      ...Object.fromEntries(routing.locales.map((l) => [l, caminhoLocalizado(l, path)])),
      'x-default': caminhoLocalizado(routing.defaultLocale, path),
    },
  };
}

/** Imagem de partilha social gerada por idioma (src/app/og/[locale]/route.tsx). */
export function imagemPartilha(locale: string, alt: string) {
  return { url: `/og/${locale}`, width: 1200, height: 630, alt, type: 'image/png' };
}

/**
 * Metadados completos de uma página: título, descrição, canonical, hreflang,
 * Open Graph e Twitter/X. O Next faz merge superficial, por isso o objecto
 * openGraph é sempre completo aqui.
 */
export function metadadosPagina({
  locale,
  path = '',
  titulo,
  descricao,
  tituloAbsoluto = false,
  indexar = true,
}: {
  locale: string;
  path?: string;
  titulo: string;
  descricao: string;
  tituloAbsoluto?: boolean;
  indexar?: boolean;
}): Metadata {
  const imagem = imagemPartilha(locale, titulo);
  const loc = (routing.locales as readonly string[]).includes(locale) ? (locale as Locale) : routing.defaultLocale;
  return {
    title: tituloAbsoluto ? { absolute: titulo } : titulo,
    description: descricao,
    alternates: alternates(locale, path),
    openGraph: {
      type: 'website',
      siteName: NOME_SITE,
      title: titulo,
      description: descricao,
      url: caminhoLocalizado(locale, path),
      locale: OG_LOCALE[loc],
      alternateLocale: routing.locales.filter((l) => l !== loc).map((l) => OG_LOCALE[l]),
      images: [imagem],
    },
    twitter: {
      card: 'summary_large_image',
      title: titulo,
      description: descricao,
      images: [imagem.url],
    },
    ...(indexar ? {} : { robots: { index: false, follow: false } }),
  };
}
