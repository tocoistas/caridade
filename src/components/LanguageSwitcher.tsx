'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useTransition } from 'react';
import { usePathname, useRouter } from '@/i18n/navigation';
import { locales, localeNames, type Locale } from '@/i18n/routing';

/** Seletor de idioma — mantém o caminho atual e troca apenas o locale. */
export default function LanguageSwitcher() {
  const t = useTranslations('language');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const onChange = (next: string) => {
    startTransition(() => {
      router.replace(pathname, { locale: next as Locale });
    });
  };

  return (
    <label className="relative inline-flex items-center">
      <span className="sr-only">{t('select')}</span>
      <svg
        aria-hidden="true"
        className="w-4 h-4 mr-1 text-petroleo pointer-events-none"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
        />
      </svg>
      <select
        aria-label={t('label')}
        value={locale}
        disabled={isPending}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-transparent border border-creme-escuro rounded-md pl-2 pr-6 py-1 text-sm font-montserrat text-petroleo focus:outline-none focus:ring-2 focus:ring-terracotta cursor-pointer disabled:opacity-50"
      >
        {locales.map((l) => (
          <option key={l} value={l}>
            {localeNames[l]}
          </option>
        ))}
      </select>
    </label>
  );
}
