import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import VoluntarioForm from '@/components/VoluntarioForm';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'voluntario' });
  return { title: t('metaTitle'), description: t('metaDescription') };
}

export default async function VoluntarioPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('voluntario');

  const ops = [
    { title: t('op1Title'), desc: t('op1Desc') },
    { title: t('op2Title'), desc: t('op2Desc') },
    { title: t('op3Title'), desc: t('op3Desc') },
  ];

  return (
    <main>
      {/* Hero Section */}
      <section className="hero-pattern py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-montserrat font-bold text-4xl md:text-5xl text-petroleo mb-4">{t('heroTitle')}</h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto">{t('heroSubtitle')}</p>
        </div>
      </section>

      {/* Porquê Ser Voluntário */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="font-montserrat font-bold text-3xl text-petroleo mb-6">{t('whyTitle')}</h2>
          <p className="text-lg leading-relaxed mb-4">{t('whyP1')}</p>
          <p className="text-lg leading-relaxed">{t('whyP2')}</p>
        </div>
      </section>

      {/* Áreas de Voluntariado */}
      <section className="py-16 bg-creme-escuro">
        <div className="container mx-auto px-4">
          <h2 className="font-montserrat font-bold text-3xl text-petroleo mb-12 text-center">{t('opsTitle')}</h2>
          <p className="text-center max-w-3xl mx-auto mb-12">{t('opsSubtitle')}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {ops.map((op) => (
              <div key={op.title} className="bg-white rounded-lg shadow-lg p-8 text-center transform transition-transform hover:scale-105 flex flex-col">
                <h3 className="font-montserrat font-semibold text-xl text-petroleo mb-3">{op.title}</h3>
                <p className="flex-grow">{op.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Formulário de Inscrição */}
      <section id="formulario" className="py-16 bg-white">
        <VoluntarioForm />
      </section>
    </main>
  );
}
