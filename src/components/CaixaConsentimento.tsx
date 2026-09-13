'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

type Texto = 'consentPrivacy' | 'consentSensitive' | 'consentNewsletter' | 'consentAccount' | 'age16';

/**
 * Caixa de consentimento não pré-marcada, com ligação à política de privacidade.
 * O servidor exige o valor `true` e grava a versão da política e a data.
 */
export default function CaixaConsentimento({
  id,
  checked,
  onChange,
  texto = 'consentPrivacy',
  escuro = false,
}: {
  id: string;
  checked: boolean;
  onChange: (valor: boolean) => void;
  texto?: Texto;
  escuro?: boolean;
}) {
  const t = useTranslations('privacyNotice');
  return (
    <div className="flex items-start gap-2">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        required
        className="h-4 w-4 mt-1 shrink-0 text-terracotta focus:ring-terracotta border-gray-300 rounded"
      />
      <label htmlFor={id} className={`text-sm ${escuro ? 'text-white/90' : 'text-petroleo/80'}`}>
        {t.rich(texto, {
          link: (chunks) => (
            <Link href="/politica-privacidade" className="underline" target="_blank" rel="noopener">
              {chunks}
            </Link>
          ),
        })}
      </label>
    </div>
  );
}
