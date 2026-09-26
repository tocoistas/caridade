'use client';

import Icone from '@/components/Icone';
import Distintivo from '@/components/admin/Distintivo';
import { formatValue, type AdminRecord, type CollectionConfig, type FieldDef } from '@/lib/adminCollections';

export type Ordenacao = { campo: string; ascendente: boolean };

/** Campos mostrados como colunas (definidos na configuração, com recuo seguro). */
export function colunasDe(config: CollectionConfig): FieldDef[] {
  const escolhidas = config.colunas
    ? config.colunas.map((k) => config.fields.find((f) => f.key === k)).filter((f): f is FieldDef => Boolean(f))
    : [];
  return escolhidas.length ? escolhidas : config.fields.slice(0, 5);
}

/** Lista de registos em tabela, ordenável e com abertura do detalhe. */
export default function TabelaRegistos({
  config,
  registos,
  ordenacao,
  onOrdenar,
  onAbrir,
}: {
  config: CollectionConfig;
  registos: AdminRecord[];
  ordenacao: Ordenacao;
  onOrdenar: (campo: string) => void;
  onAbrir: (registo: AdminRecord) => void;
}) {
  const colunas = colunasDe(config);

  return (
    <div className="overflow-x-auto rounded-lg border border-creme-escuro bg-white">
      <table className="w-full min-w-[40rem] text-start text-sm">
        <caption className="sr-only">{config.label}</caption>
        <thead>
          <tr className="border-b border-creme-escuro bg-creme/60">
            {colunas.map((campo) => {
              const activa = ordenacao.campo === campo.key;
              return (
                <th key={campo.key} scope="col" className="p-0 font-montserrat text-xs font-semibold text-petroleo/70">
                  <button
                    type="button"
                    onClick={() => onOrdenar(campo.key)}
                    aria-label={`Ordenar por ${campo.label}`}
                    className="flex w-full items-center gap-1 px-4 py-3 text-start uppercase tracking-wide transition-colors hover:text-petroleo"
                  >
                    {campo.label}
                    <Icone
                      nome={activa && !ordenacao.ascendente ? 'chevronBaixo' : 'chevronCima'}
                      className={`h-3.5 w-3.5 ${activa ? 'text-terracotta' : 'text-petroleo/25'}`}
                    />
                  </button>
                </th>
              );
            })}
            <th scope="col" className="px-4 py-3">
              <span className="sr-only">Abrir</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-creme-escuro">
          {registos.map((registo) => (
            <tr key={registo.id} className="transition-colors hover:bg-creme/50">
              {colunas.map((campo, i) => {
                const valor = registo[campo.key];
                return (
                  <td
                    key={campo.key}
                    className={`px-4 py-3 align-top ${
                      i === 0 ? 'font-montserrat font-medium text-petroleo' : 'text-petroleo/80'
                    }`}
                  >
                    {campo.key === 'estado' ? (
                      <Distintivo estado={String(valor ?? '')} />
                    ) : (
                      <span className="line-clamp-2 break-words">{formatValue(valor, campo)}</span>
                    )}
                  </td>
                );
              })}
              <td className="px-4 py-3 text-end">
                <button
                  type="button"
                  onClick={() => onAbrir(registo)}
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 font-montserrat text-xs font-medium text-petroleo transition-colors hover:bg-creme-escuro"
                >
                  Ver
                  <Icone nome="chevronDireita" className="h-4 w-4 rtl:-scale-x-100" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
