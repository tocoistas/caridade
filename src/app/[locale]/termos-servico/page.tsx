import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { metadadosPagina } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'termos' });
  return metadadosPagina({ locale, path: '/termos-servico', titulo: t('title'), descricao: t('metaDescription') });
}

export default async function TermosServico({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('termos');

  const s2Items = t.raw('s2Items') as string[];

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="font-montserrat font-bold text-4xl text-petroleo mb-8">{t('title')}</h1>

      <div className="prose prose-lg max-w-none text-gray-700">
        <h2 className="text-2xl font-bold text-petroleo mt-8 mb-4">{t('s1Title')}</h2>
        <p className="mb-4">{t('s1p1')}</p>

        <h2 className="text-2xl font-bold text-petroleo mt-8 mb-4">{t('s2Title')}</h2>
        <p className="mb-4">{t('s2p1')}</p>
        <ul className="list-disc pl-8 mb-4 space-y-2">
          {s2Items.map((item) => (<li key={item}>{item}</li>))}
        </ul>

        <h2 className="text-2xl font-bold text-petroleo mt-8 mb-4">{t('s3Title')}</h2>
        <p className="mb-4">{t('s3p1')}</p>

        <h2 className="text-2xl font-bold text-petroleo mt-8 mb-4">{t('s4Title')}</h2>
        <p className="mb-4">{t('s4p1')}</p>

        <h2 className="text-2xl font-bold text-petroleo mt-8 mb-4">{t('s5Title')}</h2>
        <p className="mb-4">{t('s5p1')}</p>

        <h2 className="text-2xl font-bold text-petroleo mt-8 mb-4">{t('s6Title')}</h2>
        <p className="mb-4">{t('s6p1')}</p>

        <p className="mt-12 text-sm text-gray-500">{t.rich('effective', { strong: (c) => <strong>{c}</strong> })}</p>
      </div>
    </div>
  );
}
