import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import SeccoesLegais, { type SeccaoLegal } from '@/components/SeccoesLegais';
import { metadadosPagina } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'privacidade' });
  return metadadosPagina({ locale, path: '/politica-privacidade', titulo: t('title'), descricao: t('metaDescription') });
}

export default async function PoliticaPrivacidade({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('privacidade');

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="font-montserrat font-bold text-4xl text-petroleo mb-2">{t('title')}</h1>
      <p className="text-sm text-petroleo/70 mb-8">{t('effective')}</p>
      <div className="prose prose-lg max-w-none text-gray-700">
        <p className="mb-4">{t('intro')}</p>
        <SeccoesLegais seccoes={t.raw('seccoes') as SeccaoLegal[]} />
      </div>
    </div>
  );
}
