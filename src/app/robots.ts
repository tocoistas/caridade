import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://caridade.ao';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/privado/'], // Caminhos que queremos ocultar dos motores de busca
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}