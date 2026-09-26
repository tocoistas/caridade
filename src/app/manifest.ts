import type { MetadataRoute } from 'next';
import icone192 from '@/assets/icone-192.png';
import icone512 from '@/assets/icone-512.png';
import pt from '../../messages/pt.json';

export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: pt.brand.name,
    short_name: 'Caridade',
    description: pt.metadata.description,
    start_url: '/',
    scope: '/',
    display: 'standalone',
    lang: 'pt',
    dir: 'ltr',
    background_color: '#F8F4E3',
    theme_color: '#3D5A80',
    categories: ['social', 'lifestyle'],
    // Os ícones são emitidos pelo build (/_next/static/…): `public/` não é
    // servido em produção — ver a nota em next.config.ts.
    icons: [
      { src: icone192.src, sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: icone512.src, sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: icone512.src, sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
