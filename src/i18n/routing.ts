import { defineRouting } from 'next-intl/routing';

/**
 * Idiomas suportados. O português (pt) é o idioma primário/fonte — as restantes
 * traduções são geradas automaticamente a partir de `messages/pt.json`
 * (ver `scripts/translate.mjs`).
 */
export const locales = [
  'pt', // Português (fonte)
  'en', // Inglês
  'es', // Espanhol
  'fr', // Francês
  'de', // Alemão
  'it', // Italiano
  'zh', // Chinês (simplificado)
  'ar', // Árabe (RTL)
  'ru', // Russo
  'hi', // Hindi
  'ja', // Japonês
] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'pt';

/** Nome de cada idioma no próprio idioma, para o seletor. */
export const localeNames: Record<Locale, string> = {
  pt: 'Português',
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  it: 'Italiano',
  zh: '中文',
  ar: 'العربية',
  ru: 'Русский',
  hi: 'हिन्दी',
  ja: '日本語',
};

/** Idiomas escritos da direita para a esquerda. */
export const rtlLocales: Locale[] = ['ar'];

/** Devolve a direção do texto ('rtl' | 'ltr') para o idioma indicado. */
export function localeDirection(locale: string): 'rtl' | 'ltr' {
  return (rtlLocales as string[]).includes(locale) ? 'rtl' : 'ltr';
}

export const routing = defineRouting({
  locales,
  defaultLocale,
  // O idioma primário (pt) fica na raiz sem prefixo; os restantes usam prefixo
  // (ex.: /en, /fr/voluntario).
  localePrefix: 'as-needed',
});
