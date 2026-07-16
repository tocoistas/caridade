import { MetadataRoute } from 'next';

// Necessário para gerar o ficheiro estaticamente com `output: export`.
export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://caridade.ao';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/privado/', '/admin'], // Caminhos que queremos ocultar dos motores de busca
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}