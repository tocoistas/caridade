'use client';

import { useEffect, useState } from 'react';
import Icone from '@/components/Icone';
import Distintivo from '@/components/admin/Distintivo';
import { formatValue, type AdminRecord, type CollectionConfig } from '@/lib/adminCollections';
import { ESTADOS_POR_COLECCAO, etiquetaEstado } from '@/lib/adminEstados';

/**
 * Detalhe de um registo, em painel lateral.
 *
 * A lista mostra só as colunas essenciais; todos os campos — incluindo textos
 * longos — ficam aqui, sem obrigar a folhear cartões enormes.
 */
export default function PainelRegisto({
  registo,
  config,
  onFechar,
  onEstado,
}: {
  registo: AdminRecord;
  config: CollectionConfig;
  onFechar: () => void;
  onEstado?: (estado: string) => Promise<void>;
}) {
  const [aGuardar, setAGuardar] = useState(false);
  const valores = ESTADOS_POR_COLECCAO[config.id]?.valores ?? [];
  const estadoActual = String(registo.estado ?? valores[0] ?? '');

  useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onFechar();
    };
    document.addEventListener('keydown', aoTeclar);
    return () => document.removeEventListener('keydown', aoTeclar);
  }, [onFechar]);

  const titulo = formatValue(registo[config.titleField], { key: config.titleField, label: '' });

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label={`Detalhe: ${titulo}`}>
      <button type="button" className="absolute inset-0 bg-petroleo/30" aria-label="Fechar detalhe" onClick={onFechar} />

      <div className="relative flex h-full w-full max-w-lg flex-col overflow-y-auto bg-white shadow-xl">
        <div className="sticky top-0 flex items-start gap-3 border-b border-creme-escuro bg-white px-6 py-4">
          <div className="min-w-0 flex-1">
            <p className="font-montserrat text-xs uppercase tracking-wide text-petroleo/50">{config.singular}</p>
            <h2 className="font-montserrat text-lg font-semibold text-petroleo break-words">{titulo}</h2>
          </div>
          <button
            type="button"
            onClick={onFechar}
            className="rounded-md p-2 text-petroleo/70 transition-colors hover:bg-creme hover:text-petroleo"
            aria-label="Fechar"
          >
            <Icone nome="cruz" className="h-5 w-5" />
          </button>
        </div>

        {onEstado && valores.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 border-b border-creme-escuro bg-creme px-6 py-4">
            <span className="font-montserrat text-sm font-medium text-petroleo">Estado</span>
            <Distintivo estado={estadoActual} />
            <label className="ms-auto flex items-center gap-2 text-sm">
              <span className="sr-only">Alterar estado</span>
              <select
                value={estadoActual}
                disabled={aGuardar}
                onChange={async (e) => {
                  setAGuardar(true);
                  try {
                    await onEstado(e.target.value);
                  } finally {
                    setAGuardar(false);
                  }
                }}
                className="rounded-md border border-creme-escuro bg-white px-3 py-1.5 text-sm text-petroleo disabled:opacity-50"
              >
                {valores.map((v) => (
                  <option key={v} value={v}>
                    {etiquetaEstado(v)}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}

        <dl className="divide-y divide-creme-escuro px-6">
          {config.fields.map((campo) => (
            <div key={campo.key} className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
              <dt className="font-montserrat text-sm font-medium text-petroleo/60">{campo.label}</dt>
              <dd className="text-sm text-petroleo break-words whitespace-pre-line sm:col-span-2">
                {campo.key === 'estado' ? (
                  <Distintivo estado={String(registo[campo.key] ?? '')} />
                ) : (
                  formatValue(registo[campo.key], campo)
                )}
              </dd>
            </div>
          ))}
          <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
            <dt className="font-montserrat text-sm font-medium text-petroleo/60">Identificador</dt>
            <dd className="font-mono text-xs text-petroleo/60 break-all sm:col-span-2">{registo.id}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
