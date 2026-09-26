'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { api } from '@/lib/api';
import { CONTACTO, REDES_SOCIAIS } from '@/lib/contacto';
import BotaoPreferenciasCookies from '@/components/BotaoPreferenciasCookies';
import CaixaConsentimento from '@/components/CaixaConsentimento';
import Icone from '@/components/Icone';

const LIGACOES_RAPIDAS = [
  { href: '/#inicio', chave: 'inicio', ns: 'nav' },
  { href: '/#eixos', chave: 'eixos', ns: 'nav' },
  { href: '/#ajudar', chave: 'ajudar', ns: 'nav' },
  { href: '/#beneficiarios', chave: 'beneficiarios', ns: 'nav' },
] as const;

const LIGACOES_LEGAIS = [
  { href: '/politica-privacidade', chave: 'privacy' },
  { href: '/termos-servico', chave: 'terms' },
  { href: '/exclusao-dados', chave: 'dataDeletion' },
  { href: '/direitos-dados', chave: 'rights' },
  { href: '/politica-cookies', chave: 'cookiesPolicy' },
] as const;

export default function Footer() {
  const t = useTranslations('footer');
  const nav = useTranslations('nav');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'success' | 'error' | 'loading'>('idle');
  const [newsletterMessage, setNewsletterMessage] = useState('');
  const [newsletterConsent, setNewsletterConsent] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setNewsletterStatus('loading');
    try {
      await api('/formularios/newsletter', { body: { consent: newsletterConsent, email: newsletterEmail } });
      setNewsletterStatus('success');
      setNewsletterMessage(t('newsletterSuccess'));
      setNewsletterEmail('');
      setNewsletterConsent(false);
    } catch (error) {
      console.error('Erro ao inscrever na newsletter: ', error);
      setNewsletterStatus('error');
      setNewsletterMessage(t('newsletterError'));
    }
  };

  return (
    <footer id="contato" className="bg-petroleo text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Contacto */}
          <div>
            <h2 className="font-montserrat font-semibold text-xl mb-4">{t('contactTitle')}</h2>
            <ul className="space-y-3">
              <li className="flex items-start">
                <Icone nome="local" className="w-5 h-5 me-3 mt-1 shrink-0" />
                <span>
                  {CONTACTO.moradaLinhas.map((linha) => (
                    <span key={linha} className="block">
                      {linha}
                    </span>
                  ))}
                </span>
              </li>
              <li className="flex items-center">
                <Icone nome="telefone" className="w-5 h-5 me-3 shrink-0" />
                <a href={`tel:${CONTACTO.telefoneE164}`} className="hover:text-terracotta transition-colors">
                  {CONTACTO.telefone}
                </a>
              </li>
              <li className="flex items-center">
                <Icone nome="email" className="w-5 h-5 me-3 shrink-0" />
                <a href={`mailto:${CONTACTO.email}`} className="hover:text-terracotta transition-colors">
                  {CONTACTO.email}
                </a>
              </li>
            </ul>
          </div>

          {/* Links Rápidos */}
          <div>
            <h2 className="font-montserrat font-semibold text-xl mb-4">{t('quickLinksTitle')}</h2>
            <ul className="space-y-2">
              {LIGACOES_RAPIDAS.map(({ href, chave }) => (
                <li key={href}>
                  <Link href={href} className="hover:text-terracotta transition-colors">
                    {nav(chave)}
                  </Link>
                </li>
              ))}
              {LIGACOES_LEGAIS.map(({ href, chave }) => (
                <li key={href}>
                  <Link href={href} className="hover:text-terracotta transition-colors">
                    {t(chave)}
                  </Link>
                </li>
              ))}
              <li>
                <BotaoPreferenciasCookies variante="ligacao" />
              </li>
            </ul>
          </div>

          {/* Redes sociais e newsletter */}
          <div>
            <h2 className="font-montserrat font-semibold text-xl mb-4">{t('followTitle')}</h2>
            <div className="flex gap-4 mb-8">
              {REDES_SOCIAIS.map((rede) => (
                <a
                  key={rede.nome}
                  href={rede.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-terracotta transition-colors"
                >
                  <Icone nome={rede.icone} className="w-5 h-5" titulo={rede.nome} />
                </a>
              ))}
            </div>

            <h2 className="font-montserrat font-semibold text-xl mb-4">{t('newsletterTitle')}</h2>
            <p className="mb-4 text-sm">{t('newsletterDesc')}</p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-2">
              <div className="flex">
                <label htmlFor="newsletter-email" className="sr-only">
                  {t('newsletterPlaceholder')}
                </label>
                <input
                  id="newsletter-email"
                  type="email"
                  placeholder={t('newsletterPlaceholder')}
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="px-4 py-2 rounded-s-md w-full focus:outline-none bg-white text-gray-800"
                  required
                />
                <button
                  type="submit"
                  disabled={newsletterStatus === 'loading'}
                  className="bg-terracotta hover:bg-opacity-90 px-4 py-2 rounded-e-md transition-colors disabled:bg-opacity-50"
                  aria-label={t('newsletterTitle')}
                >
                  <Icone nome="setaDireita" className="w-5 h-5 rtl:-scale-x-100" />
                </button>
              </div>
              <CaixaConsentimento
                id="newsletter-consent"
                texto="consentNewsletter"
                checked={newsletterConsent}
                onChange={setNewsletterConsent}
                escuro
              />
            </form>
            <p aria-live="polite" className="text-sm mt-2">
              {newsletterStatus === 'success' && <span className="text-green-400">{newsletterMessage}</span>}
              {newsletterStatus === 'error' && <span className="text-red-400">{newsletterMessage}</span>}
            </p>
          </div>
        </div>

        <div className="border-t border-white/20 mt-10 pt-6 text-center">
          <p className="text-lg mb-2">&quot;{t('slogan')}&quot;</p>
          <p className="text-sm text-white/70">{t('copyright', { year: new Date().getFullYear() })}</p>
        </div>
      </div>
    </footer>
  );
}
