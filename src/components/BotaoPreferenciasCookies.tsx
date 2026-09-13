'use client';

import { useTranslations } from 'next-intl';
import { abrirPreferenciasCookies } from '@/lib/privacidade';

/** Reabre o banner de consentimento para rever ou retirar a escolha. */
export default function BotaoPreferenciasCookies({ variante = 'botao' }: { variante?: 'botao' | 'ligacao' }) {
  const t = useTranslations('footer');
  if (variante === 'ligacao') {
    return (
      <button type="button" onClick={abrirPreferenciasCookies} className="hover:text-terracotta transition-colors text-left">
        {t('cookiePreferences')}
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={abrirPreferenciasCookies}
      className="bg-petroleo hover:bg-opacity-90 text-white font-montserrat font-medium px-6 py-2 rounded-md transition-colors"
    >
      {t('cookiePreferences')}
    </button>
  );
}
