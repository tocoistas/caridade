import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { metadadosPagina } from '@/lib/seo';
import ContactoForm from '@/components/ContactoForm';
import Icone from '@/components/Icone';
import { CONTACTO, REDES_SOCIAIS } from '@/lib/contacto';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'contacto' });
  return metadadosPagina({ locale, path: '/contacto', titulo: t('metaTitle'), descricao: t('metaDescription') });
}

export default async function ContactoPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('contacto');

  return (
    <main id="conteudo">
      {/* Hero Section */}
      <section className="hero-pattern py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-montserrat font-bold text-4xl md:text-5xl text-petroleo mb-4">{t('heroTitle')}</h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto">{t('heroSubtitle')}</p>
        </div>
      </section>

      {/* Contact Form and Info */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-12">
          <ContactoForm />

          <div>
            <h2 className="font-montserrat font-bold text-3xl text-petroleo mb-6">{t('infoTitle')}</h2>
            <div className="bg-creme p-8 rounded-lg shadow-md space-y-6">
              <ul className="space-y-4 text-lg">
                <li className="flex items-start">
                  <Icone nome="local" className="w-6 h-6 me-3 mt-1 text-petroleo shrink-0" />
                  <span>
                    <strong>{t('addressLabel')}</strong>
                    <br />
                    {CONTACTO.moradaLinhas.map((linha) => (
                      <span key={linha} className="block">
                        {linha}
                      </span>
                    ))}
                  </span>
                </li>
                <li className="flex items-center">
                  <Icone nome="telefone" className="w-6 h-6 me-3 text-petroleo shrink-0" />
                  <span>
                    <strong>{t('phoneLabel')}</strong>{' '}
                    <a href={`tel:${CONTACTO.telefoneE164}`} className="hover:text-terracotta transition-colors">
                      {CONTACTO.telefone}
                    </a>
                  </span>
                </li>
                <li className="flex items-center">
                  <Icone nome="email" className="w-6 h-6 me-3 text-petroleo shrink-0" />
                  <span>
                    <strong>{t('emailLabel')}</strong>{' '}
                    <a href={`mailto:${CONTACTO.email}`} className="hover:text-terracotta transition-colors">
                      {CONTACTO.email}
                    </a>
                  </span>
                </li>
              </ul>

              <h3 className="font-montserrat font-semibold text-xl text-petroleo mt-8 mb-4">{t('followTitle')}</h3>
              <div className="flex gap-4">
                {REDES_SOCIAIS.map((rede, i) => (
                  <a
                    key={rede.nome}
                    href={rede.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-12 h-12 ${
                      i === 0 ? 'bg-terracotta' : 'bg-petroleo'
                    } rounded-full flex items-center justify-center hover:bg-opacity-90 transition-colors text-white`}
                  >
                    <Icone nome={rede.icone} className="w-6 h-6" titulo={rede.nome} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
