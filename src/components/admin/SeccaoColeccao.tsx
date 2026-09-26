'use client';

import { useMemo, useState } from 'react';
import Icone from '@/components/Icone';
import Distintivo from '@/components/admin/Distintivo';
import EstadoVazio from '@/components/admin/EstadoVazio';
import PainelRegisto from '@/components/admin/PainelRegisto';
import RegistoForm from '@/components/admin/RegistoForm';
import TabelaRegistos, { colunasDe, type Ordenacao } from '@/components/admin/TabelaRegistos';
import {
  formatValue,
  toCSV,
  toDate,
  type AdminRecord,
  type CollectionConfig,
} from '@/lib/adminCollections';
import { ESTADOS_POR_COLECCAO, etiquetaEstado } from '@/lib/adminEstados';

type Vista = 'tabela' | 'cartoes';

function valorOrdenavel(registo: AdminRecord, campo: string, config: CollectionConfig): string | number {
  const definicao = config.fields.find((f) => f.key === campo);
  const bruto = registo[campo];
  if (definicao?.type === 'datetime' || definicao?.type === 'date') {
    return toDate(bruto)?.getTime() ?? 0;
  }
  if (definicao?.type === 'number') return Number(bruto ?? 0);
  return formatValue(bruto, definicao ?? { key: campo, label: '' }).toLowerCase();
}

/**
 * Uma área de registos: barra de ferramentas (pesquisa, filtro, vista, criação,
 * exportação), lista em tabela ou em cartões e detalhe em painel lateral.
 */
export default function SeccaoColeccao({
  config,
  registos,
  podeCriar,
  podeMudarEstado,
  onMudarEstado,
  onRecarregar,
}: {
  config: CollectionConfig;
  registos: AdminRecord[];
  podeCriar: boolean;
  podeMudarEstado: boolean;
  onMudarEstado: (id: string, estado: string) => Promise<void>;
  onRecarregar: () => Promise<void>;
}) {
  const [pesquisa, setPesquisa] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [vista, setVista] = useState<Vista>('tabela');
  const [formAberto, setFormAberto] = useState(false);
  const [abertoId, setAbertoId] = useState<string | null>(null);
  const [ordenacao, setOrdenacao] = useState<Ordenacao>({ campo: config.timestampField, ascendente: false });

  const estados = ESTADOS_POR_COLECCAO[config.id];

  const filtrados = useMemo(() => {
    const termo = pesquisa.trim().toLowerCase();
    let lista = registos;
    if (filtroEstado) lista = lista.filter((r) => String(r.estado ?? '') === filtroEstado);
    if (termo) {
      lista = lista.filter((registo) =>
        config.fields.some((campo) => formatValue(registo[campo.key], campo).toLowerCase().includes(termo))
      );
    }
    const factor = ordenacao.ascendente ? 1 : -1;
    return [...lista].sort((a, b) => {
      const va = valorOrdenavel(a, ordenacao.campo, config);
      const vb = valorOrdenavel(b, ordenacao.campo, config);
      if (va === vb) return 0;
      return va > vb ? factor : -factor;
    });
  }, [registos, pesquisa, filtroEstado, ordenacao, config]);

  const aberto = abertoId ? filtrados.find((r) => r.id === abertoId) ?? null : null;

  const ordenar = (campo: string) =>
    setOrdenacao((anterior) =>
      anterior.campo === campo ? { campo, ascendente: !anterior.ascendente } : { campo, ascendente: false }
    );

  const exportar = () => {
    const csv = toCSV(config, filtrados);
    // BOM para o Excel reconhecer o UTF-8.
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${config.id}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const mudarEstado = async (id: string, estado: string) => {
    await onMudarEstado(id, estado);
  };

  const semRegistos = registos.length === 0;
  const semResultados = !semRegistos && filtrados.length === 0;

  return (
    <div>
      {/* Cabeçalho da secção */}
      <div className="mb-5 flex flex-wrap items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white text-terracotta ring-1 ring-creme-escuro">
          <Icone nome={config.icone} className="h-6 w-6" espessura={1.6} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-montserrat text-xl font-semibold text-petroleo">{config.label}</h2>
          <p className="text-sm text-petroleo/60">{config.descricao}</p>
        </div>
      </div>

      {/* Barra de ferramentas */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[12rem] flex-1">
          <label htmlFor={`pesquisa-${config.id}`} className="sr-only">
            Pesquisar em {config.label.toLowerCase()}
          </label>
          <Icone
            nome="pesquisa"
            className="pointer-events-none absolute inset-y-0 start-3 my-auto h-4 w-4 text-petroleo/40"
          />
          <input
            id={`pesquisa-${config.id}`}
            type="search"
            value={pesquisa}
            onChange={(e) => setPesquisa(e.target.value)}
            placeholder={`Pesquisar em ${config.label.toLowerCase()}…`}
            className="w-full rounded-md border border-creme-escuro bg-white py-2 pe-3 ps-9 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta"
          />
        </div>

        {estados && (
          <label className="flex items-center gap-2 text-sm">
            <span className="sr-only">Filtrar por estado</span>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="rounded-md border border-creme-escuro bg-white px-3 py-2 text-sm text-petroleo focus:outline-none focus:ring-2 focus:ring-terracotta"
            >
              <option value="">Todos os estados</option>
              {estados.valores.map((v) => (
                <option key={v} value={v}>
                  {etiquetaEstado(v)}
                </option>
              ))}
            </select>
          </label>
        )}

        {/* Alternância de vista */}
        <div className="hidden rounded-md border border-creme-escuro bg-white p-0.5 sm:flex" role="group" aria-label="Vista">
          {(
            [
              { id: 'tabela' as const, icone: 'tabela' as const, label: 'Tabela' },
              { id: 'cartoes' as const, icone: 'cartoes' as const, label: 'Cartões' },
            ]
          ).map((opcao) => (
            <button
              key={opcao.id}
              type="button"
              onClick={() => setVista(opcao.id)}
              aria-pressed={vista === opcao.id}
              title={opcao.label}
              className={`rounded p-2 transition-colors ${
                vista === opcao.id ? 'bg-petroleo text-white' : 'text-petroleo/60 hover:bg-creme'
              }`}
            >
              <Icone nome={opcao.icone} className="h-4 w-4" titulo={opcao.label} />
            </button>
          ))}
        </div>

        {podeCriar && (
          <button
            type="button"
            onClick={() => setFormAberto((v) => !v)}
            className="inline-flex items-center gap-2 rounded-md bg-terracotta px-4 py-2 font-montserrat text-sm font-medium text-white transition-colors hover:bg-opacity-90"
          >
            <Icone nome={formAberto ? 'cruz' : 'mais'} className="h-4 w-4" />
            {formAberto ? 'Fechar' : `Novo ${config.singular}`}
          </button>
        )}

        <button
          type="button"
          onClick={exportar}
          disabled={filtrados.length === 0}
          className="inline-flex items-center gap-2 rounded-md border border-creme-escuro bg-white px-4 py-2 font-montserrat text-sm font-medium text-petroleo transition-colors hover:bg-creme disabled:opacity-40"
        >
          <Icone nome="descarregar" className="h-4 w-4" />
          CSV
        </button>
      </div>

      {formAberto && podeCriar && (
        <RegistoForm
          config={config}
          onCreated={async () => {
            setFormAberto(false);
            await onRecarregar();
          }}
          onCancel={() => setFormAberto(false)}
        />
      )}

      <p className="mb-3 text-sm text-petroleo/60" aria-live="polite">
        {filtrados.length} {filtrados.length === 1 ? 'registo' : 'registos'}
        {filtrados.length !== registos.length && ` de ${registos.length}`}
      </p>

      {semRegistos && (
        <EstadoVazio
          titulo="Ainda não existem registos nesta área"
          descricao={
            podeCriar
              ? `Comece por criar o primeiro ${config.singular}.`
              : 'Os registos aparecem aqui assim que forem criados.'
          }
        />
      )}

      {semResultados && (
        <EstadoVazio
          titulo="Nenhum registo corresponde aos filtros"
          descricao="Tente outro termo de pesquisa ou limpe o filtro de estado."
          accao={
            <button
              type="button"
              onClick={() => {
                setPesquisa('');
                setFiltroEstado('');
              }}
              className="rounded-md border border-creme-escuro bg-white px-4 py-2 font-montserrat text-sm font-medium text-petroleo hover:bg-creme"
            >
              Limpar filtros
            </button>
          }
        />
      )}

      {filtrados.length > 0 &&
        (vista === 'tabela' ? (
          <div className="hidden sm:block">
            <TabelaRegistos
              config={config}
              registos={filtrados}
              ordenacao={ordenacao}
              onOrdenar={ordenar}
              onAbrir={(registo) => setAbertoId(registo.id)}
            />
          </div>
        ) : null)}

      {/* Cartões: vista escolhida, e sempre em ecrãs pequenos (a tabela não cabe). */}
      {filtrados.length > 0 && (
        <div className={vista === 'cartoes' ? 'grid grid-cols-1 gap-3 md:grid-cols-2' : 'grid grid-cols-1 gap-3 sm:hidden'}>
          {filtrados.map((registo) => (
            <CartaoRegisto key={registo.id} registo={registo} config={config} onAbrir={() => setAbertoId(registo.id)} />
          ))}
        </div>
      )}

      {aberto && (
        <PainelRegisto
          registo={aberto}
          config={config}
          onFechar={() => setAbertoId(null)}
          onEstado={podeMudarEstado && estados ? (estado) => mudarEstado(aberto.id, estado) : undefined}
        />
      )}
    </div>
  );
}

function CartaoRegisto({
  registo,
  config,
  onAbrir,
}: {
  registo: AdminRecord;
  config: CollectionConfig;
  onAbrir: () => void;
}) {
  const colunas = colunasDe(config).filter((c) => c.key !== config.titleField);

  return (
    <button
      type="button"
      onClick={onAbrir}
      className="rounded-lg border border-creme-escuro bg-white p-4 text-start transition-colors hover:bg-creme/50"
    >
      <div className="mb-2 flex items-start justify-between gap-3">
        <h3 className="font-montserrat font-semibold text-petroleo break-words">
          {formatValue(registo[config.titleField], { key: config.titleField, label: '' })}
        </h3>
        {registo.estado !== undefined && <Distintivo estado={String(registo.estado)} />}
      </div>
      <dl className="space-y-1 text-sm">
        {colunas.slice(0, 4).map((campo) => (
          <div key={campo.key} className="flex gap-2">
            <dt className="shrink-0 font-montserrat text-petroleo/50">{campo.label}:</dt>
            <dd className="min-w-0 flex-1 truncate text-petroleo/80">{formatValue(registo[campo.key], campo)}</dd>
          </div>
        ))}
      </dl>
    </button>
  );
}
