import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import DireitosForm from '@/components/DireitosForm';
import SeccoesLegais, { type SeccaoLegal } from '@/components/SeccoesLegais';
import { metadadosPagina } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'direitos' });
  return metadadosPagina({ locale, path: '/direitos-dados', titulo: t('metaTitle'), descricao: t('metaDescription') });
}

export default async function DireitosDados({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('direitos');

  return (
    <main>
      <section className="hero-pattern py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-montserrat font-bold text-4xl md:text-5xl text-petroleo mb-4">{t('heroTitle')}</h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto">{t('heroSubtitle')}</p>
        </div>
      </section>
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-12">
          <DireitosForm />
          <div className="prose max-w-none text-gray-700">
            <SeccoesLegais seccoes={t.raw('info') as SeccaoLegal[]} />
          </div>
        </div>
      </section>
    </main>
  );
}
