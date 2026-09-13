import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';
import { BASE_URL, caminhoLocalizado } from '@/lib/seo';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  // Área reservada (em todos os idiomas) e API são privadas. O resto — incluindo
  // imagens de partilha (/og) e /llms.txt — é público para motores de busca,
  // redes sociais e assistentes de IA.
  const areaReservada = routing.locales.map((l) => caminhoLocalizado(l, '/admin'));
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/api/', ...areaReservada] }],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
