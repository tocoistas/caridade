import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { metadadosPagina } from '@/lib/seo';
import { Link } from '@/i18n/navigation';
import Icone, { type NomeIcone } from '@/components/Icone';
import { CONTACTO } from '@/lib/contacto';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'doarBens' });
  return metadadosPagina({ locale, path: '/doar-bens', titulo: t('metaTitle'), descricao: t('metaDescription') });
}

export default async function DoarBensPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('doarBens');

  const cats: { title: string; items: string[]; icone: NomeIcone }[] = [
    { title: t('cat1Title'), items: t.raw('cat1Items') as string[], icone: 'caixa' },
    { title: t('cat2Title'), items: t.raw('cat2Items') as string[], icone: 'presente' },
    { title: t('cat3Title'), items: t.raw('cat3Items') as string[], icone: 'saude' },
    { title: t('cat4Title'), items: t.raw('cat4Items') as string[], icone: 'estrela' },
  ];

  return (
    <main id="conteudo">
      {/* Hero Section */}
      <section className="hero-pattern py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-montserrat font-bold text-4xl md:text-5xl text-petroleo mb-4">{t('heroTitle')}</h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto">{t('heroSubtitle')}</p>
        </div>
      </section>

      {/* O que doar */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="font-montserrat font-bold text-3xl text-petroleo mb-6 text-center">{t('whatTitle')}</h2>
          <p className="text-center max-w-3xl mx-auto mb-12">{t('whatIntro')}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {cats.map((cat) => (
              <div key={cat.title} className="bg-creme-escuro rounded-lg shadow-md p-6 text-center flex flex-col">
                <span className="mx-auto mb-4 inline-flex items-center justify-center w-14 h-14 rounded-full bg-white text-terracotta ring-1 ring-terracotta/20">
                  <Icone nome={cat.icone} className="w-7 h-7" espessura={1.5} />
                </span>
                <h3 className="font-montserrat font-semibold text-xl text-petroleo mb-3">{cat.title}</h3>
                <div className="flex-grow text-left space-y-2">
                  {cat.items.map((item) => (<p key={item}>{item}</p>))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Como e Onde Doar */}
      <section id="pontos-recolha" className="py-16 bg-creme-escuro">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="font-montserrat font-bold text-3xl text-petroleo mb-6">{t('howTitle')}</h2>
          <p className="text-lg leading-relaxed mb-8">{t('howIntro')}</p>
          <div className="bg-white rounded-lg shadow-lg p-8 inline-block text-left">
            <h3 className="font-montserrat font-semibold text-xl text-petroleo mb-4 flex items-center">
              <Icone nome="local" className="w-6 h-6 me-3 text-terracotta shrink-0" />
              {t('collectionPoint')}
            </h3>
            <p className="mb-2"><strong>{t('addressLabel')}</strong> {CONTACTO.moradaLinhas.join(', ')}</p>
            <p className="mb-2"><strong>{t('hoursLabel')}</strong> {t('hoursValue')}</p>
            <p>
              <strong>{t('bigLabel')}</strong>{' '}
              <a href={`tel:${CONTACTO.telefoneE164}`} className="hover:text-terracotta transition-colors">
                {CONTACTO.telefone}
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* Doações para a Saúde (Eixo 2) */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="font-montserrat font-bold text-3xl text-petroleo mb-6">{t('healthTitle')}</h2>
          <p className="text-lg leading-relaxed mb-4">{t('healthP1')}</p>
          <p className="text-lg leading-relaxed mb-6"><strong>{t('healthItems')}</strong> {t('healthItemsValue')}</p>
          <p className="text-lg leading-relaxed">{t('healthContactPre')}<Link href="/contacto" className="text-terracotta font-semibold hover:underline">{t('healthContactLink')}</Link>{t('healthContactPost')}</p>
        </div>
      </section>
    </main>
  );
}
