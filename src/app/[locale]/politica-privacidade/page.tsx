import { getTranslations, setRequestLocale } from 'next-intl/server';

export default async function PoliticaPrivacidade({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('privacidade');

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="font-montserrat font-bold text-4xl text-petroleo mb-8">{t('title')}</h1>

      <div className="prose prose-lg max-w-none text-gray-700">
        <p className="mb-4">{t('intro')}</p>

        <h2 className="text-2xl font-bold text-petroleo mt-8 mb-4">{t('s1Title')}</h2>
        <p className="mb-4">{t('s1p1')}</p>
        <p className="mb-4">{t('s1p2')}</p>

        <h2 className="text-2xl font-bold text-petroleo mt-8 mb-4">{t('s2Title')}</h2>
        <p className="mb-4">{t('s2p1')}</p>

        <h2 className="text-2xl font-bold text-petroleo mt-8 mb-4">{t('s3Title')}</h2>
        <p className="mb-4">{t('s3p1')}</p>

        <h2 className="text-2xl font-bold text-petroleo mt-8 mb-4">{t('s4Title')}</h2>
        <p className="mb-4">{t('s4p1')}</p>

        <h2 className="text-2xl font-bold text-petroleo mt-8 mb-4">{t('s5Title')}</h2>
        <p className="mb-4">{t('s5p1')}</p>

        <p className="mt-12 text-sm text-gray-500">{t.rich('effective', { strong: (c) => <strong>{c}</strong> })}</p>
      </div>
    </div>
  );
}
