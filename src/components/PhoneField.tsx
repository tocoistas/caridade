'use client';

import { useTranslations } from 'next-intl';
import { COUNTRIES_SORTED, countryByCode, flagEmoji } from '@/lib/countries';

interface PhoneFieldProps {
  /** id base para os campos (usado como `${id}-code` e `${id}`). */
  id: string;
  /** Código ISO alpha-2 do país do indicativo (ex.: 'PT'). */
  countryCode: string;
  /** Número nacional (sem indicativo). */
  number: string;
  onCountryChange: (code: string) => void;
  onNumberChange: (value: string) => void;
  required?: boolean;
  label?: string;
}

/**
 * Campo de telefone internacional: seletor de indicativo (bandeira + código do
 * país) + número nacional. O valor completo deve ser composto no submit com
 * `fullPhoneNumber`.
 */
export default function PhoneField({
  id,
  countryCode,
  number,
  onCountryChange,
  onNumberChange,
  required,
  label,
}: PhoneFieldProps) {
  const t = useTranslations('form');
  const selected = countryByCode(countryCode);

  return (
    <div>
      <label htmlFor={id} className="block font-montserrat font-medium text-petroleo mb-2">
        {label ?? t('phone')}
      </label>
      <div className="flex gap-2">
        <select
          id={`${id}-code`}
          name={`${id}-code`}
          aria-label={t('phoneDialAria')}
          value={countryCode}
          onChange={(e) => onCountryChange(e.target.value)}
          className="w-28 shrink-0 px-2 py-2 border border-creme-escuro rounded-md focus:outline-none focus:ring-2 focus:ring-terracotta bg-white"
        >
          <option value="" disabled>
            +…
          </option>
          {COUNTRIES_SORTED.map((c) => (
            <option key={c.code} value={c.code}>
              {flagEmoji(c.code)} +{c.dial}
            </option>
          ))}
        </select>
        <input
          type="tel"
          id={id}
          name={id}
          value={number}
          onChange={(e) => onNumberChange(e.target.value)}
          required={required}
          inputMode="tel"
          autoComplete="tel-national"
          placeholder={selected ? `${selected.name} · nº` : t('phonePlaceholder')}
          className="w-full px-4 py-2 border border-creme-escuro rounded-md focus:outline-none focus:ring-2 focus:ring-terracotta"
        />
      </div>
    </div>
  );
}

/** Compõe o número internacional completo (ex.: '+351 912345678'). */
export function fullPhoneNumber(countryCode: string, number: string): string {
  const c = countryByCode(countryCode);
  const national = number.trim();
  if (!c) return national;
  return national ? `+${c.dial} ${national}` : '';
}
