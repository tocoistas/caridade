import { routing } from '@/i18n/routing';
import { BASE_URL, NOME_SITE } from '@/lib/seo';

/** Serializa JSON-LD de forma segura para dentro de <script> (escapa `<`). */
function serializar(dados: unknown): string {
  return JSON.stringify(dados).replace(/</g, '\\u003c');
}

/** Dados estruturados schema.org: organização sem fins lucrativos + website multilingue. */
export default function JsonLd({ descricao, tagline }: { descricao: string; tagline: string }) {
  const dados = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'NGO',
        '@id': `${BASE_URL}/#organizacao`,
        name: NOME_SITE,
        alternateName: tagline,
        url: BASE_URL,
        logo: { '@type': 'ImageObject', url: `${BASE_URL}/img/logo.png`, width: 1080, height: 1080 },
        description: descricao,
        email: 'info@caridade.ao',
        areaServed: 'Worldwide',
        knowsLanguage: routing.locales,
        sameAs: ['https://www.facebook.com/caridade.ao'],
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'customer support',
          email: 'info@caridade.ao',
          url: `${BASE_URL}/contacto`,
          availableLanguage: routing.locales,
        },
      },
      {
        '@type': 'WebSite',
        '@id': `${BASE_URL}/#website`,
        url: BASE_URL,
        name: NOME_SITE,
        inLanguage: routing.locales,
        publisher: { '@id': `${BASE_URL}/#organizacao` },
      },
    ],
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializar(dados) }} />;
}
