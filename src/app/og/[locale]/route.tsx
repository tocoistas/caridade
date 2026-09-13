import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import { routing } from '@/i18n/routing';
import de from '../../../../messages/de.json';
import en from '../../../../messages/en.json';
import es from '../../../../messages/es.json';
import fr from '../../../../messages/fr.json';
import it from '../../../../messages/it.json';
import pt from '../../../../messages/pt.json';

/**
 * Imagem de partilha social (Open Graph / Twitter) 1200×630 por idioma, gerada no build.
 * O renderizador só inclui fonte latina: idiomas com outros alfabetos (zh, ar, ru, hi, ja)
 * usam o texto em inglês para evitar caracteres em falta.
 */
export const dynamic = 'force-static';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

const LATINOS = { pt, en, es, fr, de, it } as const;

export async function GET(_req: Request, { params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const m = LATINOS[locale as keyof typeof LATINOS] ?? en;
  const logo = await readFile(join(process.cwd(), 'public', 'img', 'logo.png'));
  const logoSrc = `data:image/png;base64,${logo.toString('base64')}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: '#F8F4E3',
          color: '#3D5A80',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ width: 24, height: '100%', background: '#E07A5F', display: 'flex' }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '64px 72px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoSrc} width={140} height={140} alt="" style={{ borderRadius: 24 }} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: 68, fontWeight: 700, lineHeight: 1.05 }}>{m.brand.name}</div>
              <div style={{ fontSize: 36, color: '#E07A5F', marginTop: 8 }}>{m.brand.tagline}</div>
            </div>
          </div>
          <div style={{ fontSize: 34, lineHeight: 1.35, color: '#2F4666', display: 'flex', maxWidth: 1000 }}>
            {m.metadata.ogDescription}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 28 }}>
            <div style={{ display: 'flex', background: '#3D5A80', color: '#F8F4E3', padding: '10px 24px', borderRadius: 999 }}>
              caridade.ao
            </div>
            <div style={{ display: 'flex', color: '#3D5A80', opacity: 0.8 }}>{m.footer.slogan}</div>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
