'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function Header() {
  const t = useTranslations('nav');
  const b = useTranslations('brand');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center mb-4 md:mb-0">
          <div className="mr-3">
            <Link href="/">
              <Image src="/img/logo.png" alt={b('logoAlt')} width={80} height={80} className="w-20 h-auto" priority />
            </Link>
          </div>
          <div>
            <h1 className="font-montserrat font-bold text-petroleo text-xl">{b('name')}</h1>
            <p className="text-terracotta text-sm italic">{b('tagline')}</p>
          </div>
        </div>

        <nav className="hidden md:block">
          <ul className="flex space-x-6 font-montserrat text-sm">
            <li><Link href="/#inicio" className="text-petroleo hover:text-terracotta transition-colors">{t('inicio')}</Link></li>
            <li><Link href="/#eixos" className="text-petroleo hover:text-terracotta transition-colors">{t('eixos')}</Link></li>
            <li><Link href="/#ajudar" className="text-petroleo hover:text-terracotta transition-colors">{t('ajudar')}</Link></li>
            <li><Link href="/#beneficiarios" className="text-petroleo hover:text-terracotta transition-colors">{t('beneficiarios')}</Link></li>
            <li><Link href="/contacto" className="text-petroleo hover:text-terracotta transition-colors">{t('contacto')}</Link></li>
          </ul>
        </nav>

        <div className="flex items-center gap-3 md:ml-6">
          <LanguageSwitcher />
          <Link href="/admin" className="text-petroleo hover:text-terracotta font-montserrat font-medium text-sm transition-colors">{t('entrar')}</Link>
          <Link href="/#ajudar" className="bg-terracotta hover:bg-opacity-90 text-white font-montserrat font-medium px-5 py-2 rounded-md inline-block transition-all transform hover:scale-105">{t('quereAjudar')}</Link>
        </div>

        <button className="md:hidden absolute right-4 top-4" id="menuButton" onClick={toggleMenu} aria-label="Menu">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-petroleo" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Menu mobile */}
      <div id="mobileMenu" className={`${isMenuOpen ? '' : 'hidden'} md:hidden bg-white w-full`}>
        <ul className="font-montserrat text-sm py-3">
          <li><Link href="/#inicio" onClick={closeMenu} className="block px-4 py-2 text-petroleo hover:bg-creme">{t('inicio')}</Link></li>
          <li><Link href="/#eixos" onClick={closeMenu} className="block px-4 py-2 text-petroleo hover:bg-creme">{t('eixos')}</Link></li>
          <li><Link href="/#ajudar" onClick={closeMenu} className="block px-4 py-2 text-petroleo hover:bg-creme">{t('ajudar')}</Link></li>
          <li><Link href="/#beneficiarios" onClick={closeMenu} className="block px-4 py-2 text-petroleo hover:bg-creme">{t('beneficiarios')}</Link></li>
          <li><Link href="/contacto" onClick={closeMenu} className="block px-4 py-2 text-petroleo hover:bg-creme">{t('contacto')}</Link></li>
          <li><Link href="/admin" onClick={closeMenu} className="block px-4 py-2 text-petroleo hover:bg-creme font-medium">{t('entrar')}</Link></li>
        </ul>
      </div>
    </header>
  );
}
