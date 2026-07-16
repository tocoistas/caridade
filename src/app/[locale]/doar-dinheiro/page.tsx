import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import DoarDinheiroForm from '@/components/DoarDinheiroForm';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'doarDinheiro' });
  return { title: t('metaTitle'), description: t('metaDescription') };
}

export default async function DoarDinheiroPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('doarDinheiro');

  return (
    <main>
      {/* Hero Section */}
      <section className="hero-pattern py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-montserrat font-bold text-4xl md:text-5xl text-petroleo mb-4">{t('heroTitle')}</h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto">{t('heroSubtitle')}</p>
        </div>
      </section>

      {/* Porquê doar dinheiro */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="font-montserrat font-bold text-3xl text-petroleo mb-6">{t('whyTitle')}</h2>
          <p className="text-lg leading-relaxed mb-4">{t.rich('whyP1', { strong: (c) => <strong className="text-terracotta">{c}</strong> })}</p>
          <p className="text-lg leading-relaxed">{t('whyP2')}</p>
        </div>
      </section>

      {/* Opções de Doação */}
      <section id="doar-agora" className="py-16 bg-creme-escuro">
        <div className="container mx-auto px-4">
          <h2 className="font-montserrat font-bold text-3xl text-petroleo mb-12 text-center">{t('sectionTitle')}</h2>
          <DoarDinheiroForm />
        </div>
      </section>

      {/* Transparência */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="font-montserrat font-bold text-3xl text-petroleo mb-6">{t('transparencyTitle')}</h2>
          <p className="text-lg leading-relaxed">{t('transparencyBody')}</p>
        </div>
      </section>
    </main>
  );
}
