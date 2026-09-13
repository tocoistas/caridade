import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { metadadosPagina } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'exclusao' });
  return metadadosPagina({ locale, path: '/exclusao-dados', titulo: t('title'), descricao: t('metaDescription') });
}

export default async function ExclusaoDados({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('exclusao');

  const steps = t.raw('steps') as string[];

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="font-montserrat font-bold text-4xl text-petroleo mb-8">{t('title')}</h1>

      <div className="prose prose-lg max-w-none text-gray-700">
        <p className="mb-4">{t('intro')}</p>

        <h2 className="text-2xl font-bold text-petroleo mt-8 mb-4">{t('howTitle')}</h2>
        <p className="mb-4">{t('howIntro')}</p>

        <ul className="list-decimal pl-8 mb-4 space-y-2">
          {steps.map((step, i) => (
            <li
              key={i}
              dangerouslySetInnerHTML={{ __html: step }}
            />
          ))}
        </ul>

        <h2 className="text-2xl font-bold text-petroleo mt-8 mb-4">{t('deadlineTitle')}</h2>
        <p className="mb-4">{t.rich('deadlineBody', { strong: (c) => <strong>{c}</strong> })}</p>

        <h2 className="text-2xl font-bold text-petroleo mt-8 mb-4">{t('afterTitle')}</h2>
        <p className="mb-4">{t('afterBody')}</p>
      </div>
    </div>
  );
}
