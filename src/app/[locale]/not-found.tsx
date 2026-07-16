import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

export default async function NotFound() {
  // Nota: o segmento de locale não está disponível em not-found; usa o padrão.
  const t = await getTranslations('nav');
  const b = await getTranslations('brand');

  return (
    <main className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        <p className="font-montserrat font-bold text-6xl text-terracotta mb-2">404</p>
        <p className="text-lg text-petroleo mb-8">{b('tagline')}</p>
        <Link
          href="/"
          className="bg-petroleo hover:bg-opacity-90 text-white font-montserrat font-medium px-6 py-3 rounded-md inline-block transition-colors"
        >
          {t('inicio')}
        </Link>
      </div>
    </main>
  );
}
