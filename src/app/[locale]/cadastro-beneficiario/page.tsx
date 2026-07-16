import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import CadastroBeneficiarioForm from '@/components/CadastroBeneficiarioForm';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'cadastroPage' });
  return { title: t('metaTitle'), description: t('metaDescription') };
}

export default async function CadastroBeneficiarioPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('cadastroPage');

  const criteria = t.raw('criteria') as string[];
  const docs = t.raw('docs') as string[];

  return (
    <main>
      {/* Hero Section */}
      <section className="hero-pattern py-20 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-montserrat font-bold text-4xl md:text-5xl text-petroleo mb-4">{t('heroTitle')}</h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto">{t('heroSubtitle')}</p>
        </div>
      </section>

      {/* Informações Importantes */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="font-montserrat font-bold text-3xl text-petroleo mb-6 text-center">{t('beforeTitle')}</h2>
          <p className="text-lg leading-relaxed mb-8 text-center">{t('beforeIntro')}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-creme-escuro p-6 rounded-lg">
              <h3 className="font-montserrat font-semibold text-xl text-petroleo mb-3">{t('criteriaTitle')}</h3>
              <ul className="list-disc list-inside space-y-2">
                {criteria.map((item) => (<li key={item}>{item}</li>))}
              </ul>
            </div>
            <div className="bg-creme-escuro p-6 rounded-lg">
              <h3 className="font-montserrat font-semibold text-xl text-petroleo mb-3">{t('docsTitle')}</h3>
              <ul className="list-disc list-inside space-y-2">
                {docs.map((item) => (<li key={item}>{item}</li>))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Formulário de Cadastro */}
      <section id="formulario" className="py-16 bg-creme-escuro">
        <CadastroBeneficiarioForm />
      </section>
    </main>
  );
}
