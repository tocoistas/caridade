import Image from 'next/image';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { metadadosPagina } from '@/lib/seo';
import Icone, { type NomeIcone } from '@/components/Icone';

/** Item de lista com marca de verificação. */
function ItemVerificado({ children, cor = 'terracotta' }: { children: React.ReactNode; cor?: 'terracotta' | 'petroleo' }) {
  return (
    <li className="flex items-start gap-2">
      <Icone
        nome="verificado"
        className={`w-5 h-5 mt-0.5 shrink-0 ${cor === 'terracotta' ? 'text-terracotta' : 'text-petroleo'}`}
      />
      <span>{children}</span>
    </li>
  );
}

/** Medalhão circular com o ícone do eixo/acção. */
function Medalhao({ nome, escuro = false }: { nome: NomeIcone; escuro?: boolean }) {
  return (
    <span
      className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${
        escuro ? 'bg-white/10 text-terracotta ring-1 ring-white/20' : 'bg-creme text-terracotta ring-1 ring-terracotta/20'
      }`}
    >
      <Icone nome={nome} className="w-10 h-10" espessura={1.5} />
    </span>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });
  return metadadosPagina({ locale, titulo: t('ogTitle'), descricao: t('description'), tituloAbsoluto: true });
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('home');

  const eixos: { icone: NomeIcone; titulo: string; desc: string; itens: string[] }[] = [
    { icone: 'mao', titulo: t('eixo1Title'), desc: t('eixo1Desc'), itens: t.raw('eixo1Items') as string[] },
    { icone: 'coracaoCuidado', titulo: t('eixo2Title'), desc: t('eixo2Desc'), itens: t.raw('eixo2Items') as string[] },
    { icone: 'ponte', titulo: t('eixo3Title'), desc: t('eixo3Desc'), itens: t.raw('eixo3Items') as string[] },
  ];

  const formasDeAjudar: { icone: NomeIcone; titulo: string; desc: string; cta: string; href: string }[] = [
    { icone: 'pessoas', titulo: t('helpVolunteerTitle'), desc: t('helpVolunteerDesc'), cta: t('helpVolunteerCta'), href: '/voluntario' },
    { icone: 'caixa', titulo: t('helpGoodsTitle'), desc: t('helpGoodsDesc'), cta: t('helpGoodsCta'), href: '/doar-bens' },
    { icone: 'moeda', titulo: t('helpMoneyTitle'), desc: t('helpMoneyDesc'), cta: t('helpMoneyCta'), href: '/doar-dinheiro' },
  ];

  const who = t.raw('beneficiariesWho') as string[];
  const docs = t.raw('beneficiariesDocs') as string[];

  return (
    <main id="conteudo">
      {/* Hero */}
      <section id="inicio" className="hero-pattern py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center max-w-6xl mx-auto">
            <div className="text-center md:text-start">
              <h1 className="font-montserrat font-bold text-4xl md:text-5xl text-petroleo mb-4">
                {t('heroTitleLine1')}
                <br />
                {t('heroTitleLine2')}
              </h1>
              <p className="text-lg md:text-xl mb-8">{t('heroSubtitle')}</p>
              <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-4">
                <Link
                  href="/#ajudar"
                  className="bg-terracotta hover:bg-opacity-90 text-white font-montserrat font-medium px-8 py-3 rounded-md inline-block transition-all transform hover:scale-105"
                >
                  {t('heroCtaHelp')}
                </Link>
                <Link
                  href="/#beneficiarios"
                  className="bg-petroleo hover:bg-opacity-90 text-white font-montserrat font-medium px-8 py-3 rounded-md inline-block transition-all transform hover:scale-105"
                >
                  {t('heroCtaNeed')}
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <Image
                src="/img/ilustracoes/comunidade.svg"
                alt={t('heroImageAlt')}
                width={520}
                height={400}
                className="w-full h-auto max-w-lg mx-auto"
                priority
              />
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
                <Image
                  src="/img/logo-400.png"
                  alt={t('aboutTitle')}
                  width={400}
                  height={274}
                  className="w-full max-w-[16rem] mx-auto h-auto"
                />
              </div>
              <div className="md:w-2/3">
                <p className="text-lg leading-relaxed mb-6">
                  {t.rich('aboutP1', { strong: (c) => <strong className="text-terracotta">{c}</strong> })}
                </p>
                <p className="text-lg leading-relaxed">{t('aboutP2')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Eixos de Acção */}
      <section id="eixos" className="py-16 bg-creme-escuro">
        <div className="container mx-auto px-4">
          <h2 className="font-montserrat font-bold text-3xl text-petroleo mb-12 text-center">{t('eixosTitle')}</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {eixos.map((eixo) => (
              <article
                key={eixo.titulo}
                className="bg-white rounded-lg shadow-lg p-6 transform transition-transform hover:scale-105"
              >
                <div className="flex justify-center mb-6">
                  <Medalhao nome={eixo.icone} />
                </div>
                <h3 className="font-montserrat font-semibold text-xl text-petroleo mb-4 text-center">{eixo.titulo}</h3>
                <p className="text-center mb-4">{eixo.desc}</p>
                <ul className="space-y-2">
                  {eixo.itens.map((item) => (
                    <ItemVerificado key={item}>{item}</ItemVerificado>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Como Ajudar */}
      <section id="ajudar" className="py-16 bg-petroleo text-white">
        <div className="container mx-auto px-4">
          <h2 className="font-montserrat font-bold text-3xl mb-3 text-center">{t('helpTitle')}</h2>
          <p className="text-center max-w-2xl mx-auto mb-12">{t('helpSubtitle')}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {formasDeAjudar.map((forma) => (
              <article
                key={forma.titulo}
                className="bg-white/10 rounded-lg p-6 text-center backdrop-blur-sm border border-white/20 flex flex-col"
              >
                <div className="flex justify-center mb-4">
                  <Medalhao nome={forma.icone} escuro />
                </div>
                <h3 className="font-montserrat font-semibold text-xl mb-3">{forma.titulo}</h3>
                <p className="mb-6 flex-grow">{forma.desc}</p>
                <Link
                  href={forma.href}
                  className="bg-terracotta hover:bg-opacity-90 text-white font-montserrat font-medium px-6 py-2 rounded-md inline-block transition-all transform hover:scale-105 self-center"
                >
                  {forma.cta}
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Testemunhos */}
      <section className="py-16 bg-creme">
        <div className="container mx-auto px-4">
          <h2 className="font-montserrat font-bold text-3xl text-petroleo mb-12 text-center">{t('testimonialsTitle')}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {[1, 2, 3, 4].map((i) => (
              <figure key={i} className="testimonial-card bg-white rounded-lg shadow-lg p-8 relative">
                <blockquote className="italic mb-6 relative z-10">&quot;{t(`testimonial${i}Quote`)}&quot;</blockquote>
                <figcaption className="flex items-center">
                  <span
                    className={`w-12 h-12 ${
                      i % 2 === 1 ? 'bg-terracotta' : 'bg-petroleo'
                    } rounded-full flex items-center justify-center text-white font-bold text-xl`}
                    aria-hidden="true"
                  >
                    {t(`testimonial${i}Name`).charAt(0)}
                  </span>
                  <span className="ms-4">
                    <span className="block font-montserrat font-semibold">{t(`testimonial${i}Name`)}</span>
                    <span className="block text-sm text-petroleo/70">{t(`testimonial${i}Role`)}</span>
                  </span>
                </figcaption>
              </figure>
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
              <p className="mb-6">{t('beneficiariesIntro')}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-montserrat font-medium text-lg mb-2 text-terracotta flex items-center gap-2">
                    <Icone nome="pessoas" className="w-5 h-5" />
                    {t('beneficiariesWhoTitle')}
                  </h4>
                  <ul className="space-y-2">
                    {who.map((item) => (
                      <ItemVerificado key={item} cor="petroleo">
                        {item}
                      </ItemVerificado>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-montserrat font-medium text-lg mb-2 text-terracotta flex items-center gap-2">
                    <Icone nome="documento" className="w-5 h-5" />
                    {t('beneficiariesDocsTitle')}
                  </h4>
                  <ul className="space-y-2">
                    {docs.map((item) => (
                      <ItemVerificado key={item} cor="petroleo">
                        {item}
                      </ItemVerificado>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="text-center">
                <Link
                  href="/cadastro-beneficiario"
                  className="bg-terracotta hover:bg-opacity-90 text-white font-montserrat font-medium px-8 py-3 rounded-md inline-block transition-all transform hover:scale-105"
                >
                  {t('beneficiariesCta')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
