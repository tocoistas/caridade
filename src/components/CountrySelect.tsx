'use client';

import { useTranslations } from 'next-intl';
import { COUNTRIES_SORTED, flagEmoji } from '@/lib/countries';

interface CountrySelectProps {
  id: string;
  name: string;
  /** Código ISO alpha-2 selecionado (ex.: 'PT'). */
  value: string;
  onChange: (code: string) => void;
  required?: boolean;
  label?: string;
}

/** Seletor de país de residência (lista global, traduzível). */
export default function CountrySelect({
  id,
  name,
  value,
  onChange,
  required,
  label,
}: CountrySelectProps) {
  const t = useTranslations('form');
  return (
    <div>
      <label htmlFor={id} className="block font-montserrat font-medium text-petroleo mb-2">
        {label ?? t('country')}
      </label>
      <select
        id={id}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full px-4 py-2 border border-creme-escuro rounded-md focus:outline-none focus:ring-2 focus:ring-terracotta bg-white"
      >
        <option value="" disabled>
          {t('countryPlaceholder')}
        </option>
        {COUNTRIES_SORTED.map((c) => (
          <option key={c.code} value={c.code}>
            {flagEmoji(c.code)} {c.name}
          </option>
        ))}
      </select>
    </div>
  );
}
