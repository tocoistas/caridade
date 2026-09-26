'use client';

import { useMemo, useState } from 'react';
import { api, ApiErro } from '@/lib/api';
import type { AdminRecord } from '@/lib/adminCollections';
import { gerarRelatorio, indicadoresDe, periodosDisponiveis, type Periodo } from '@/lib/relatorios/gerar';
import { PUBLICOS, type PublicoRelatorio, type Relatorio } from '@/lib/relatorios/tipos';
import Icone from '@/components/Icone';

const ORDEM: PublicoRelatorio[] = ['publico', 'voluntarios', 'profissionais', 'doadores', 'empresas'];

/** Relatório em texto simples, pronto a colar num e-mail ou numa publicação. */
function paraTexto(relatorio: Relatorio): string {
  const linhas: string[] = [relatorio.titulo, '='.repeat(relatorio.titulo.length), '', relatorio.resumo, ''];
  for (const seccao of relatorio.seccoes) {
    linhas.push(seccao.titulo, '-'.repeat(seccao.titulo.length));
    if (seccao.texto) linhas.push(seccao.texto);
    for (const ind of seccao.indicadores ?? []) {
      linhas.push(`  ${ind.etiqueta}: ${ind.valor}${ind.nota ? ` (${ind.nota})` : ''}`);
    }
    if (seccao.tabela) {
      if (seccao.tabela.linhas.length === 0) {
        linhas.push(`  ${seccao.tabela.vazio}`);
      } else {
        linhas.push(`  ${seccao.tabela.colunas.join(' | ')}`);
        for (const linha of seccao.tabela.linhas) linhas.push(`  ${linha.join(' | ')}`);
      }
    }
    linhas.push('');
  }
  linhas.push(relatorio.notaPrivacidade);
  return linhas.join('\n');
}

/**
 * Área de relatórios: escolhe-se o público e o período, e o relatório é gerado
 * a partir dos registos — cada público vê o que lhe diz respeito, com as
 * regras de privacidade declaradas em `src/lib/relatorios/tipos.ts`.
 */
export default function Relatorios({ dados, podePublicar }: { dados: Record<string, AdminRecord[]>; podePublicar: boolean }) {
  const periodos = useMemo(() => periodosDisponiveis(), []);
  const [publico, setPublico] = useState<PublicoRelatorio>('publico');
  const [indicePeriodo, setIndicePeriodo] = useState(2);
  const [copiado, setCopiado] = useState(false);
  const [publicacao, setPublicacao] = useState<'idle' | 'a-publicar' | 'publicado' | 'erro'>('idle');
  const [erro, setErro] = useState('');

  const periodo: Periodo = periodos[indicePeriodo];
  const relatorio = useMemo(() => gerarRelatorio(publico, dados, periodo), [publico, dados, periodo]);
  const def = PUBLICOS[publico];

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(paraTexto(relatorio));
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      setErro('O navegador não permitiu copiar. Use a exportação.');
    }
  };

  const descarregar = () => {
    const blob = new Blob([paraTexto(relatorio)], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-${publico}-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const publicar = async () => {
    setPublicacao('a-publicar');
    setErro('');
    try {
      await api('/relatorios/publicos', {
        body: {
          titulo: relatorio.titulo,
          periodoInicio: periodo.inicio.toISOString(),
          periodoFim: periodo.fim.toISOString(),
          resumo: relatorio.resumo,
          indicadores: indicadoresDe(relatorio).map((i) => ({ etiqueta: i.etiqueta, valor: i.valor, nota: i.nota ?? '' })),
          notaPrivacidade: relatorio.notaPrivacidade,
        },
      });
      setPublicacao('publicado');
    } catch (err) {
      setErro(err instanceof ApiErro ? err.message : 'Não foi possível publicar.');
      setPublicacao('erro');
    }
  };

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white text-terracotta ring-1 ring-creme-escuro">
          <Icone nome="documento" className="h-6 w-6" espessura={1.6} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-montserrat text-xl font-semibold text-petroleo">Relatórios</h2>
          <p className="text-sm text-petroleo/60">
            Gerados a partir dos registos, contextualizados para cada público e sem dados pessoais de quem é apoiado.
          </p>
        </div>
      </div>

      {/* Escolha do público */}
      <div className="mb-4 flex flex-wrap gap-2">
        {ORDEM.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              setPublico(id);
              setPublicacao('idle');
            }}
            aria-pressed={publico === id}
            className={`rounded-md border px-3 py-2 font-montserrat text-sm font-medium transition-colors ${
              publico === id
                ? 'border-petroleo bg-petroleo text-white'
                : 'border-creme-escuro bg-white text-petroleo hover:bg-creme'
            }`}
          >
            {PUBLICOS[id].label}
          </button>
        ))}
      </div>

      {/* Período e acções */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-2 text-sm">
          <span className="font-montserrat text-petroleo/70">Período</span>
          <select
            value={indicePeriodo}
            onChange={(e) => {
              setIndicePeriodo(Number(e.target.value));
              setPublicacao('idle');
            }}
            className="rounded-md border border-creme-escuro bg-white px-3 py-2 text-sm text-petroleo focus:outline-none focus:ring-2 focus:ring-terracotta"
          >
            {periodos.map((p, i) => (
              <option key={p.label} value={i}>
                {p.label}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={copiar}
          className="inline-flex items-center gap-2 rounded-md border border-creme-escuro bg-white px-4 py-2 font-montserrat text-sm font-medium text-petroleo transition-colors hover:bg-creme"
        >
          <Icone nome={copiado ? 'visto' : 'documento'} className="h-4 w-4" />
          {copiado ? 'Copiado' : 'Copiar texto'}
        </button>
        <button
          type="button"
          onClick={descarregar}
          className="inline-flex items-center gap-2 rounded-md border border-creme-escuro bg-white px-4 py-2 font-montserrat text-sm font-medium text-petroleo transition-colors hover:bg-creme"
        >
          <Icone nome="descarregar" className="h-4 w-4" />
          Descarregar
        </button>
        {publico === 'publico' && podePublicar && (
          <button
            type="button"
            onClick={publicar}
            disabled={publicacao === 'a-publicar' || publicacao === 'publicado'}
            className="inline-flex items-center gap-2 rounded-md bg-terracotta px-4 py-2 font-montserrat text-sm font-medium text-white transition-colors hover:bg-opacity-90 disabled:opacity-60"
          >
            <Icone nome={publicacao === 'publicado' ? 'visto' : 'globo'} className="h-4 w-4" />
            {publicacao === 'publicado'
              ? 'Publicado em /transparencia'
              : publicacao === 'a-publicar'
                ? 'A publicar…'
                : 'Publicar no site'}
          </button>
        )}
      </div>

      {erro && (
        <p className="mb-4 text-sm text-red-600" role="alert">
          {erro}
        </p>
      )}

      {/* Relatório */}
      <article className="rounded-lg border border-creme-escuro bg-white p-6 md:p-8">
        <header className="mb-6 border-b border-creme-escuro pb-5">
          <p className="font-montserrat text-xs uppercase tracking-wide text-terracotta">{def.destinatario}</p>
          <h3 className="mt-1 font-montserrat text-2xl font-bold text-petroleo">{relatorio.titulo}</h3>
          <p className="mt-1 text-sm text-petroleo/60">{def.proposito}</p>
          <p className="mt-4 text-petroleo">{relatorio.resumo}</p>
        </header>

        <div className="space-y-8">
          {relatorio.seccoes.map((seccao) => (
            <section key={seccao.titulo}>
              <h4 className="mb-3 font-montserrat text-lg font-semibold text-petroleo">{seccao.titulo}</h4>
              {seccao.texto && <p className="mb-3 text-sm text-petroleo/70">{seccao.texto}</p>}

              {seccao.indicadores && (
                <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
                  {seccao.indicadores.map((ind) => (
                    <div key={ind.etiqueta} className="rounded-lg bg-creme p-4">
                      <p className="font-montserrat text-2xl font-semibold text-petroleo">{ind.valor}</p>
                      <p className="mt-1 font-montserrat text-sm text-petroleo/80">{ind.etiqueta}</p>
                      {ind.nota && <p className="mt-1 text-xs text-petroleo/55">{ind.nota}</p>}
                    </div>
                  ))}
                </div>
              )}

              {seccao.tabela &&
                (seccao.tabela.linhas.length === 0 ? (
                  <p className="text-sm text-petroleo/55">{seccao.tabela.vazio}</p>
                ) : (
                  <div className="overflow-x-auto rounded-md border border-creme-escuro">
                    <table className="w-full text-start text-sm">
                      <thead>
                        <tr className="border-b border-creme-escuro bg-creme/60">
                          {seccao.tabela.colunas.map((coluna) => (
                            <th
                              key={coluna}
                              scope="col"
                              className="px-4 py-2 text-start font-montserrat text-xs font-semibold uppercase tracking-wide text-petroleo/70"
                            >
                              {coluna}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-creme-escuro">
                        {seccao.tabela.linhas.map((linha) => (
                          <tr key={linha.join('|')}>
                            {linha.map((celula, i) => (
                              <td
                                key={`${seccao.titulo}-${i}`}
                                className={`px-4 py-2 ${i === 0 ? 'text-petroleo' : 'tabular-nums text-petroleo/80'}`}
                              >
                                {celula}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
            </section>
          ))}
        </div>

        <footer className="mt-8 flex gap-3 border-t border-creme-escuro pt-5">
          <Icone nome="escudo" className="h-5 w-5 shrink-0 text-terracotta" />
          <p className="text-sm text-petroleo/70">{relatorio.notaPrivacidade}</p>
        </footer>
      </article>
    </div>
  );
}
