'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { EVENTO_ABRIR_PREFERENCIAS, guardarConsentimento, lerConsentimento } from '@/lib/privacidade';

/**
 * Banner de consentimento de cookies (ePrivacy art. 5.º/3, RGPD art. 7.º, Lei n.º 22/11).
 * - Nada de cookies não essenciais antes da escolha.
 * - "Rejeitar" e "Aceitar" com o mesmo destaque; "Personalizar" por categoria.
 * - Reabre a partir do rodapé ("Preferências de cookies").
 */
export default function ConsentimentoCookies() {
  const t = useTranslations('cookies');
  const [aberto, setAberto] = useState(false);
  const [detalhe, setDetalhe] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => {
    const abrir = () => {
      setAnalytics(lerConsentimento()?.analytics ?? false);
      setDetalhe(true);
      setAberto(true);
    };
    window.addEventListener(EVENTO_ABRIR_PREFERENCIAS, abrir);
    // localStorage só existe no browser: decide depois da hidratação.
    const id = window.setTimeout(() => {
      if (!lerConsentimento()) setAberto(true);
    }, 0);
    return () => {
      window.removeEventListener(EVENTO_ABRIR_PREFERENCIAS, abrir);
      window.clearTimeout(id);
    };
  }, []);

  if (!aberto) return null;

  const decidir = (permitirAnalytics: boolean) => {
    guardarConsentimento(permitirAnalytics);
    setAberto(false);
    setDetalhe(false);
  };

  const botao =
    'flex-1 min-w-[8rem] px-4 py-2 rounded-md font-montserrat font-medium text-sm transition-colors border';

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookies-titulo"
      className="fixed inset-x-0 bottom-0 z-50 p-4"
    >
      <div className="mx-auto max-w-3xl bg-white text-petroleo rounded-lg shadow-2xl border border-creme-escuro p-5">
        <h2 id="cookies-titulo" className="font-montserrat font-bold text-lg mb-2">
          {t('title')}
        </h2>
        <p className="text-sm mb-4">
          {t.rich('text', {
            link: (chunks) => (
              <Link href="/politica-cookies" className="underline">
                {chunks}
              </Link>
            ),
          })}
        </p>

        {detalhe && (
          <div className="space-y-3 mb-4 text-sm">
            <label className="flex items-start gap-3 p-3 bg-creme rounded-md">
              <input type="checkbox" checked disabled className="mt-1" />
              <span>
                <span className="block font-semibold">{t('necessaryTitle')}</span>
                <span className="block text-petroleo/70">{t('necessaryDesc')}</span>
              </span>
            </label>
            <label className="flex items-start gap-3 p-3 bg-creme rounded-md cursor-pointer">
              <input
                type="checkbox"
                checked={analytics}
                onChange={(e) => setAnalytics(e.target.checked)}
                className="mt-1 text-terracotta focus:ring-terracotta"
              />
              <span>
                <span className="block font-semibold">{t('analyticsTitle')}</span>
                <span className="block text-petroleo/70">{t('analyticsDesc')}</span>
              </span>
            </label>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => decidir(false)} className={`${botao} bg-petroleo text-white border-petroleo hover:bg-opacity-90`}>
            {t('reject')}
          </button>
          {detalhe ? (
            <button type="button" onClick={() => decidir(analytics)} className={`${botao} bg-white border-creme-escuro hover:bg-creme`}>
              {t('save')}
            </button>
          ) : (
            <button type="button" onClick={() => setDetalhe(true)} className={`${botao} bg-white border-creme-escuro hover:bg-creme`}>
              {t('customize')}
            </button>
          )}
          <button type="button" onClick={() => decidir(true)} className={`${botao} bg-petroleo text-white border-petroleo hover:bg-opacity-90`}>
            {t('acceptAll')}
          </button>
        </div>
      </div>
    </div>
  );
}
