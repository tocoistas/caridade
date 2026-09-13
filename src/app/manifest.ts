import type { MetadataRoute } from 'next';
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
    icons: [
      { src: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  };
}
