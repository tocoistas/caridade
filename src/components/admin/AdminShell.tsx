'use client';

import { useState } from 'react';
import Icone from '@/components/Icone';
import { PAPEL_LABELS } from '@/lib/roles';
import type { Utilizador } from '@/lib/auth';
import type { SeccaoNav } from '@/lib/adminNav';
import MinhaConta from '@/components/admin/MinhaConta';

/**
 * Moldura do painel: cabeçalho com identificação e acções de conta, navegação
 * lateral por área (gaveta em ecrãs pequenos) e a zona de conteúdo.
 */
export default function AdminShell({
  utilizador,
  seccoes,
  activo,
  contagens,
  onSelecionar,
  onSair,
  onRecarregar,
  aRecarregar,
  children,
}: {
  utilizador: Utilizador;
  seccoes: SeccaoNav[];
  activo: string;
  /** Nº de registos por secção, para os contadores da navegação. */
  contagens: Record<string, number>;
  onSelecionar: (id: string) => void;
  onSair: () => void;
  onRecarregar: () => void;
  aRecarregar: boolean;
  children: React.ReactNode;
}) {
  const [navAberta, setNavAberta] = useState(false);

  const seleccionar = (id: string) => {
    onSelecionar(id);
    setNavAberta(false);
  };

  const navegacao = (
    <nav aria-label="Áreas do painel" className="space-y-6">
      {seccoes.map((seccao) => (
        <div key={seccao.id}>
          {seccao.label && (
            <h2 className="px-3 mb-2 font-montserrat text-xs font-semibold uppercase tracking-wider text-petroleo/50">
              {seccao.label}
            </h2>
          )}
          <ul className="space-y-0.5">
            {seccao.itens.map((item) => {
              const seleccionado = item.id === activo;
              const contagem = contagens[item.id];
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => seleccionar(item.id)}
                    aria-current={seleccionado ? 'page' : undefined}
                    className={`w-full flex items-center gap-3 rounded-md px-3 py-2 text-start font-montserrat text-sm transition-colors ${
                      seleccionado
                        ? 'bg-petroleo text-white font-medium'
                        : 'text-petroleo/80 hover:bg-white hover:text-petroleo'
                    }`}
                  >
                    <Icone nome={item.icone} className="w-5 h-5 shrink-0" espessura={1.6} />
                    <span className="flex-1 leading-snug">{item.label}</span>
                    {contagem !== undefined && (
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
                          seleccionado ? 'bg-white/20 text-white' : 'bg-creme-escuro text-petroleo/70'
                        }`}
                      >
                        {contagem}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

  return (
    <div className="bg-creme min-h-[70vh]">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Cabeçalho do painel */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <button
            type="button"
            onClick={() => setNavAberta((v) => !v)}
            aria-expanded={navAberta}
            aria-controls="navegacao-painel"
            className="lg:hidden inline-flex items-center gap-2 rounded-md border border-creme-escuro bg-white px-3 py-2 font-montserrat text-sm text-petroleo"
          >
            <Icone nome={navAberta ? 'cruz' : 'menu'} className="w-5 h-5" />
            Áreas
          </button>

          <div className="me-auto">
            <h1 className="font-montserrat font-bold text-2xl sm:text-3xl text-petroleo">Painel de gestão</h1>
            <p className="text-sm text-petroleo/70">
              {utilizador.nomeCompleto || utilizador.email}
              <span className="mx-2 text-petroleo/30">·</span>
              <span className="font-medium">{PAPEL_LABELS[utilizador.papel] ?? utilizador.papel}</span>
            </p>
          </div>

          <button
            type="button"
            onClick={onRecarregar}
            disabled={aRecarregar}
            className="inline-flex items-center gap-2 rounded-md border border-creme-escuro bg-white px-4 py-2 font-montserrat text-sm font-medium text-petroleo transition-colors hover:bg-creme disabled:opacity-50"
          >
            <Icone nome="atualizar" className={`w-4 h-4 ${aRecarregar ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
          <MinhaConta utilizador={utilizador} onEliminada={onSair} />
          <button
            type="button"
            onClick={onSair}
            className="inline-flex items-center gap-2 rounded-md border border-creme-escuro bg-white px-4 py-2 font-montserrat text-sm font-medium text-petroleo transition-colors hover:bg-creme"
          >
            <Icone nome="sair" className="w-4 h-4" />
            Sair
          </button>
        </div>

        <div className="flex gap-6 items-start">
          {/* Navegação lateral */}
          <aside className="hidden lg:block w-64 shrink-0 sticky top-28">{navegacao}</aside>

          {/* Gaveta em ecrãs pequenos */}
          {navAberta && (
            <div
              id="navegacao-painel"
              className="lg:hidden fixed inset-x-0 bottom-0 top-0 z-40 overflow-y-auto bg-creme p-4 pt-6"
            >
              <div className="flex justify-end mb-2">
                <button
                  type="button"
                  onClick={() => setNavAberta(false)}
                  className="rounded-md border border-creme-escuro bg-white p-2 text-petroleo"
                  aria-label="Fechar áreas"
                >
                  <Icone nome="cruz" className="w-5 h-5" />
                </button>
              </div>
              {navegacao}
            </div>
          )}

          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
