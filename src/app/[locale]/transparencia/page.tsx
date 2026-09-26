import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import Icone from '@/components/Icone';
import { metadadosPagina, BASE_URL } from '@/lib/seo';

/**
 * Página pública de prestação de contas.
 *
 * Mostra o último relatório publicado pela gestão no painel. Os indicadores já
 * vêm agregados do gerador de relatórios — esta página não tem acesso a
 * registos nem a dados pessoais, só ao que foi explicitamente publicado.
 */

interface IndicadorPublicado {
  etiqueta: string;
  valor: string;
  nota?: string;
}

interface RelatorioPublicado {
  id: string;
  titulo?: string;
  resumo?: string;
  indicadores?: IndicadorPublicado[];
  notaPrivacidade?: string;
  periodoInicio?: string;
  periodoFim?: string;
  publicadoEm?: string;
}

// Publicar no painel deve reflectir-se no site sem esperar por um novo build.
export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'transparencia' });
  return metadadosPagina({ locale, path: '/transparencia', titulo: t('metaTitle'), descricao: t('metaDescription') });
}

async function ultimoRelatorio(): Promise<{ relatorio: RelatorioPublicado | null; erro: boolean }> {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/relatorios/publicos`, { next: { revalidate } });
    if (!res.ok) return { relatorio: null, erro: true };
    const dados = (await res.json()) as { relatorios?: RelatorioPublicado[] };
    return { relatorio: dados.relatorios?.[0] ?? null, erro: false };
  } catch {
    return { relatorio: null, erro: true };
  }
}

function formatarData(valor: string | undefined, locale: string): string {
  if (!valor) return '—';
  const d = new Date(valor);
  return isNaN(d.getTime()) ? '—' : d.toLocaleDateString(locale, { day: '2-digit', month: 'long', year: 'numeric' });
}

export default async function TransparenciaPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('transparencia');
  const { relatorio, erro } = await ultimoRelatorio();

  return (
    <main id="conteudo">
      <section className="hero-pattern py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-montserrat font-bold text-4xl md:text-5xl text-petroleo mb-4">{t('heroTitle')}</h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto">{t('heroSubtitle')}</p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          {!relatorio ? (
            <p className="rounded-lg border border-creme-escuro bg-creme p-8 text-center text-petroleo/70">
              {erro ? t('erro') : t('semRelatorio')}
            </p>
          ) : (
            <article>
              <header className="mb-8 border-b border-creme-escuro pb-6">
                <h2 className="font-montserrat text-2xl font-bold text-petroleo md:text-3xl">{relatorio.titulo}</h2>
                <p className="mt-2 text-sm text-petroleo/60">
                  {t('periodo')}: {formatarData(relatorio.periodoInicio, locale)} –{' '}
                  {formatarData(relatorio.periodoFim, locale)}
                  <span className="mx-2 text-petroleo/30">·</span>
                  {t('publicadoEm')} {formatarData(relatorio.publicadoEm, locale)}
                </p>
                {relatorio.resumo && <p className="mt-4 text-lg leading-relaxed">{relatorio.resumo}</p>}
              </header>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {(relatorio.indicadores ?? []).map((indicador) => (
                  <div key={indicador.etiqueta} className="rounded-lg border border-creme-escuro bg-creme p-5">
                    <p className="font-montserrat text-3xl font-semibold text-petroleo">{indicador.valor}</p>
                    <p className="mt-1 font-montserrat text-sm text-petroleo/80">{indicador.etiqueta}</p>
                    {indicador.nota && <p className="mt-1 text-xs text-petroleo/55">{indicador.nota}</p>}
                  </div>
                ))}
              </div>

              <div className="mt-10 rounded-lg bg-creme-escuro/50 p-6">
                <h3 className="mb-2 flex items-center gap-2 font-montserrat text-lg font-semibold text-petroleo">
                  <Icone nome="informacao" className="h-5 w-5 text-terracotta" />
                  {t('comoLer')}
                </h3>
                <p className="text-sm leading-relaxed">{t('comoLerTexto')}</p>
              </div>

              {relatorio.notaPrivacidade && (
                <div className="mt-4 flex gap-3 rounded-lg border border-creme-escuro p-6">
                  <Icone nome="escudo" className="h-5 w-5 shrink-0 text-terracotta" />
                  <p className="text-sm text-petroleo/70">{relatorio.notaPrivacidade}</p>
                </div>
              )}
            </article>
          )}

          <div className="mt-12 text-center">
            <p className="mb-4 text-petroleo/70">{t('duvidas')}</p>
            <Link
              href="/contacto"
              className="inline-block rounded-md bg-terracotta px-8 py-3 font-montserrat font-medium text-white transition-all hover:bg-opacity-90"
            >
              {t('duvidasCta')}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
