import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

const checkIcon = (
  <svg className="w-5 h-5 mr-2 text-terracotta shrink-0" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
  </svg>
);

const checkIconBlue = (
  <svg className="w-5 h-5 mr-2 text-petroleo mt-1 shrink-0" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
  </svg>
);

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('home');

  const eixo1Items = t.raw('eixo1Items') as string[];
  const eixo2Items = t.raw('eixo2Items') as string[];
  const eixo3Items = t.raw('eixo3Items') as string[];
  const who = t.raw('beneficiariesWho') as string[];
  const docs = t.raw('beneficiariesDocs') as string[];

  return (
    <main>
      {/* Hero Section */}
      <section id="inicio" className="hero-pattern py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-montserrat font-bold text-4xl md:text-5xl text-petroleo mb-4">{t('heroTitleLine1')}<br />{t('heroTitleLine2')}</h1>
            <p className="text-lg md:text-xl mb-8">{t('heroSubtitle')}</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/#ajudar" className="bg-terracotta hover:bg-opacity-90 text-white font-montserrat font-medium px-8 py-3 rounded-md inline-block transition-all transform hover:scale-105">{t('heroCtaHelp')}</Link>
              <Link href="/#beneficiarios" className="bg-petroleo hover:bg-opacity-90 text-white font-montserrat font-medium px-8 py-3 rounded-md inline-block transition-all transform hover:scale-105">{t('heroCtaNeed')}</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Apresentação do Projecto */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-montserrat font-bold text-3xl text-petroleo mb-6 text-center">{t('aboutTitle')}</h2>
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="md:w-1/3">
                <Image src="/img/logo.png" alt={t('aboutTitle')} width={200} height={200} className="w-auto h-auto mb-6 rounded-lg " priority />
              </div>
              <div className="md:w-2/3">
                <p className="text-lg leading-relaxed mb-6">{t.rich('aboutP1', { strong: (c) => <strong className="text-terracotta">{c}</strong> })}</p>
                <p className="text-lg leading-relaxed">{t('aboutP2')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Eixos de Acção */}
      <section id="eixos" className="py-16 bg-cremeEscuro">
        <div className="container mx-auto px-4">
          <h2 className="font-montserrat font-bold text-3xl text-petroleo mb-12 text-center">{t('eixosTitle')}</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Mão que Ampara */}
            <div className="bg-white rounded-lg shadow-lg p-6 transform transition-transform hover:scale-105">
              <div className="flex justify-center mb-6">
                <svg className="w-20 h-20 text-terracotta" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 16V8.5C20 7.4 19.1 6.5 18 6.5H17.5V5.5C17.5 4.4 16.6 3.5 15.5 3.5C14.4 3.5 13.5 4.4 13.5 5.5V11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M13.5 9.5V5.5C13.5 4.4 12.6 3.5 11.5 3.5C10.4 3.5 9.5 4.4 9.5 5.5V11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M9.5 7.5V5.5C9.5 4.4 8.6 3.5 7.5 3.5C6.4 3.5 5.5 4.4 5.5 5.5V12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M5.5 10.5V5.5C5.5 4.4 4.6 3.5 3.5 3.5C2.4 3.5 1.5 4.4 1.5 5.5V14.5C1.5 17.8 4.2 20.5 7.5 20.5H13.5C16.8 20.5 19.5 17.8 19.5 14.5V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 className="font-montserrat font-semibold text-xl text-petroleo mb-4 text-center">{t('eixo1Title')}</h3>
              <p className="text-center mb-4">{t('eixo1Desc')}</p>
              <ul className="space-y-2 mb-6">
                {eixo1Items.map((item) => (<li key={item} className="flex items-center">{checkIcon}{item}</li>))}
              </ul>
            </div>

            {/* Coração que Cuida */}
            <div className="bg-white rounded-lg shadow-lg p-6 transform transition-transform hover:scale-105">
              <div className="flex justify-center mb-6">
                <svg className="w-20 h-20 text-terracotta" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="currentColor" />
                  <path d="M12 13v-1h-1a1 1 0 110-2h1V9a1 1 0 112 0v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0z" fill="white" />
                </svg>
              </div>
              <h3 className="font-montserrat font-semibold text-xl text-petroleo mb-4 text-center">{t('eixo2Title')}</h3>
              <p className="text-center mb-4">{t('eixo2Desc')}</p>
              <ul className="space-y-2 mb-6">
                {eixo2Items.map((item) => (<li key={item} className="flex items-center">{checkIcon}{item}</li>))}
              </ul>
            </div>

            {/* Ponte de Esperança */}
            <div className="bg-white rounded-lg shadow-lg p-6 transform transition-transform hover:scale-105">
              <div className="flex justify-center mb-6">
                <svg className="w-20 h-20 text-terracotta" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 7a3 3 0 100 6 3 3 0 000-6z" fill="currentColor" />
                  <path d="M4.5 12.5L19.5 12.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <h3 className="font-montserrat font-semibold text-xl text-petroleo mb-4 text-center">{t('eixo3Title')}</h3>
              <p className="text-center mb-4">{t('eixo3Desc')}</p>
              <ul className="space-y-2 mb-6">
                {eixo3Items.map((item) => (<li key={item} className="flex items-center">{checkIcon}{item}</li>))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Como Ajudar */}
      <section id="ajudar" className="py-16 bg-petroleo text-white">
        <div className="container mx-auto px-4">
          <h2 className="font-montserrat font-bold text-3xl mb-3 text-center">{t('helpTitle')}</h2>
          <p className="text-center max-w-2xl mx-auto mb-12">{t('helpSubtitle')}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Ser Voluntário */}
            <div className="bg-white bg-opacity-10 rounded-lg p-6 text-center backdrop-filter backdrop-blur-sm border border-white border-opacity-20">
              <div className="flex justify-center mb-4">
                <svg className="w-16 h-16 text-terracotta" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M9 7a4 4 0 100 8 4 4 0 000-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M23 21v-2a4 4 0 00-3-3.87" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 className="font-montserrat font-semibold text-xl mb-3">{t('helpVolunteerTitle')}</h3>
              <p className="mb-6">{t('helpVolunteerDesc')}</p>
              <Link href="/voluntario" className="bg-terracotta hover:bg-opacity-90 text-white font-montserrat font-medium px-6 py-2 rounded-md inline-block transition-all transform hover:scale-105">{t('helpVolunteerCta')}</Link>
            </div>

            {/* Doar Bens */}
            <div className="bg-white bg-opacity-10 rounded-lg p-6 text-center backdrop-filter backdrop-blur-sm border border-white border-opacity-20">
              <div className="flex justify-center mb-4">
                <svg className="w-16 h-16 text-terracotta" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 12V8h-4V4h-8v4H4v4H0v8h8v-8H4V8h4V4h8v4h4v4h4v8h-8v-8h4z" fill="currentColor" />
                </svg>
              </div>
              <h3 className="font-montserrat font-semibold text-xl mb-3">{t('helpGoodsTitle')}</h3>
              <p className="mb-6">{t('helpGoodsDesc')}</p>
              <Link href="/doar-bens" className="bg-terracotta hover:bg-opacity-90 text-white font-montserrat font-medium px-6 py-2 rounded-md inline-block transition-all transform hover:scale-105">{t('helpGoodsCta')}</Link>
            </div>

            {/* Doar Dinheiro */}
            <div className="bg-white bg-opacity-10 rounded-lg p-6 text-center backdrop-filter backdrop-blur-sm border border-white border-opacity-20">
              <div className="flex justify-center mb-4">
                <svg className="w-16 h-16 text-terracotta" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 className="font-montserrat font-semibold text-xl mb-3">{t('helpMoneyTitle')}</h3>
              <p className="mb-6">{t('helpMoneyDesc')}</p>
              <Link href="/doar-dinheiro" className="bg-terracotta hover:bg-opacity-90 text-white font-montserrat font-medium px-6 py-2 rounded-md inline-block transition-all transform hover:scale-105">{t('helpMoneyCta')}</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testemunhos */}
      <section className="py-16 bg-creme">
        <div className="container mx-auto px-4">
          <h2 className="font-montserrat font-bold text-3xl text-petroleo mb-12 text-center">{t('testimonialsTitle')}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="testimonial-card bg-white rounded-lg shadow-lg p-8 relative">
                <p className="italic mb-6 relative z-10">&quot;{t(`testimonial${i}Quote`)}&quot;</p>
                <div className="flex items-center">
                  <div className={`w-12 h-12 ${i % 2 === 1 ? 'bg-terracotta' : 'bg-petroleo'} rounded-full flex items-center justify-center text-white font-bold text-xl`}>
                    {t(`testimonial${i}Name`).charAt(0)}
                  </div>
                  <div className="ml-4">
                    <h4 className="font-montserrat font-semibold">{t(`testimonial${i}Name`)}</h4>
                    <p className="text-sm text-gray-600">{t(`testimonial${i}Role`)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Para Beneficiários */}
      <section id="beneficiarios" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-montserrat font-bold text-3xl text-petroleo mb-6 text-center">{t('beneficiariesTitle')}</h2>

            <div className="bg-creme rounded-lg p-8 mb-8">
              <h3 className="font-montserrat font-semibold text-xl text-petroleo mb-4">{t('beneficiariesCardTitle')}</h3>
              <p className="mb-4">{t('beneficiariesIntro')}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-montserrat font-medium text-lg mb-2 text-terracotta">{t('beneficiariesWhoTitle')}</h4>
                  <ul className="space-y-2">
                    {who.map((item) => (<li key={item} className="flex items-start">{checkIconBlue}{item}</li>))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-montserrat font-medium text-lg mb-2 text-terracotta">{t('beneficiariesDocsTitle')}</h4>
                  <ul className="space-y-2">
                    {docs.map((item) => (<li key={item} className="flex items-start">{checkIconBlue}{item}</li>))}
                  </ul>
                </div>
              </div>

              <div className="text-center">
                <Link href="/cadastro-beneficiario" className="bg-terracotta hover:bg-opacity-90 text-white font-montserrat font-medium px-8 py-3 rounded-md inline-block transition-all transform hover:scale-105">{t('beneficiariesCta')}</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
