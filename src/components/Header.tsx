'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import Icone from '@/components/Icone';

const LIGACOES = [
  { href: '/#inicio', chave: 'inicio' },
  { href: '/#eixos', chave: 'eixos' },
  { href: '/#ajudar', chave: 'ajudar' },
  { href: '/#beneficiarios', chave: 'beneficiarios' },
  { href: '/contacto', chave: 'contacto' },
] as const;

export default function Header() {
  const t = useTranslations('nav');
  const b = useTranslations('brand');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen((v) => !v);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex flex-wrap items-center gap-x-4 gap-y-3">
        {/* Marca */}
        <Link href="/" onClick={closeMenu} className="flex items-center gap-3 me-auto" aria-label={b('name')}>
          <Image
            src="/img/simbolo-256.png"
            alt={b('logoAlt')}
            width={256}
            height={149}
            className="h-11 w-auto"
            priority
          />
          <span>
            <span className="block font-montserrat font-bold text-petroleo text-lg sm:text-xl leading-tight">
              {b('name')}
            </span>
            <span className="block text-terracotta text-xs sm:text-sm italic leading-tight">{b('tagline')}</span>
          </span>
        </Link>

        {/* Navegação (ecrãs grandes) */}
        <nav className="hidden lg:block" aria-label={t('inicio')}>
          <ul className="flex items-center gap-6 font-montserrat text-sm">
            {LIGACOES.map(({ href, chave }) => (
              <li key={href}>
                <Link href={href} className="text-petroleo hover:text-terracotta transition-colors">
                  {t(chave)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <LanguageSwitcher />
          <Link
            href="/admin"
            className="text-petroleo hover:text-terracotta font-montserrat font-medium text-sm transition-colors"
          >
            {t('entrar')}
          </Link>
          <Link
            href="/#ajudar"
            className="bg-terracotta hover:bg-opacity-90 text-white font-montserrat font-medium px-5 py-2 rounded-md inline-block transition-all transform hover:scale-105"
          >
            {t('quereAjudar')}
          </Link>
        </div>

        {/* Botão do menu (ecrãs pequenos) */}
        <button
          type="button"
          onClick={toggleMenu}
          aria-expanded={isMenuOpen}
          aria-controls="menu-principal"
          aria-label="Menu"
          className="lg:hidden p-2 -me-2 text-petroleo hover:text-terracotta transition-colors"
        >
          <Icone nome={isMenuOpen ? 'cruz' : 'menu'} className="w-6 h-6" />
        </button>
      </div>

      {/* Menu em ecrãs pequenos */}
      <div
        id="menu-principal"
        className={`${isMenuOpen ? 'block' : 'hidden'} lg:hidden bg-white w-full border-t border-creme-escuro`}
      >
        <ul className="font-montserrat text-sm py-2">
          {LIGACOES.map(({ href, chave }) => (
            <li key={href}>
              <Link href={href} onClick={closeMenu} className="block px-4 py-3 text-petroleo hover:bg-creme">
                {t(chave)}
              </Link>
            </li>
          ))}
          <li>
            <Link href="/admin" onClick={closeMenu} className="block px-4 py-3 text-petroleo hover:bg-creme font-medium">
              {t('entrar')}
            </Link>
          </li>
        </ul>
        <div className="flex items-center justify-between gap-3 px-4 pb-4 md:hidden">
          <LanguageSwitcher />
          <Link
            href="/#ajudar"
            onClick={closeMenu}
            className="bg-terracotta hover:bg-opacity-90 text-white font-montserrat font-medium px-5 py-2 rounded-md transition-colors"
          >
            {t('quereAjudar')}
          </Link>
        </div>
      </div>
    </header>
  );
}
