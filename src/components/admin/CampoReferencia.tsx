'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { api } from '@/lib/api';
import { TIPOS_PESSOA, etiquetaPessoa, type DefReferencia } from '@/lib/referencias';
import Icone from '@/components/Icone';

export interface Pessoa {
  id: string;
  codigo: string;
  nome: string;
}

/**
 * Escolha de uma pessoa cadastrada para ligar a uma acção.
 *
 * Só o id da pessoa é enviado: o código e o nome são escritos pelo servidor a
 * partir do cadastro. A procura devolve apenas código e nome — quem regista
 * uma entrega não passa a ver a ficha do beneficiário.
 */
const MIN_TERMO = 2;

export default function CampoReferencia({
  def,
  valor,
  onChange,
}: {
  def: DefReferencia;
  valor: Pessoa | null;
  onChange: (pessoa: Pessoa | null) => void;
}) {
  const idCampo = useId();
  const [termo, setTermo] = useState('');
  const [resultados, setResultados] = useState<Pessoa[]>([]);
  const [aProcurar, setAProcurar] = useState(false);
  const [erro, setErro] = useState('');
  const pedido = useRef(0);

  const procura = termo.trim();
  // Só se procura com um termo utilizável e enquanto nada estiver escolhido.
  const activa = !valor && procura.length >= MIN_TERMO;

  useEffect(() => {
    if (!activa) return;
    const meu = ++pedido.current;
    const temporizador = setTimeout(async () => {
      setAProcurar(true);
      setErro('');
      try {
        const res = await api<{ pessoas: Pessoa[] }>(
          `/pessoas?tipo=${def.tipo}&q=${encodeURIComponent(procura)}`
        );
        if (meu === pedido.current) setResultados(res.pessoas);
      } catch {
        if (meu === pedido.current) {
          setResultados([]);
          setErro('Não foi possível procurar agora.');
        }
      } finally {
        if (meu === pedido.current) setAProcurar(false);
      }
    }, 250);
    return () => clearTimeout(temporizador);
  }, [activa, procura, def.tipo]);

  // Resultados de um termo anterior não sobrevivem à mudança de termo.
  const visiveis = activa ? resultados : [];
  const tipo = TIPOS_PESSOA[def.tipo];

  return (
    <div className="md:col-span-2">
      <label htmlFor={idCampo} className="mb-1 block font-montserrat text-sm font-medium text-petroleo">
        {def.label}
        {def.obrigatoria && <span className="ms-1 text-terracotta">*</span>}
      </label>

      {valor ? (
        <div className="flex items-center gap-3 rounded-md border border-terracotta/40 bg-creme px-3 py-2">
          <Icone nome="verificado" className="h-5 w-5 shrink-0 text-terracotta" />
          <span className="min-w-0 flex-1 truncate text-sm text-petroleo">
            <span className="font-mono text-xs text-petroleo/70">{valor.codigo || 'sem código'}</span>
            <span className="mx-2 text-petroleo/30">·</span>
            {valor.nome || '(sem nome)'}
          </span>
          <button
            type="button"
            onClick={() => {
              onChange(null);
              setTermo('');
            }}
            className="rounded p-1 text-petroleo/60 transition-colors hover:bg-white hover:text-petroleo"
            aria-label={`Remover ${def.label.toLowerCase()}`}
          >
            <Icone nome="cruz" className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <>
          <div className="relative">
            <Icone
              nome="pesquisa"
              className="pointer-events-none absolute inset-y-0 start-3 my-auto h-4 w-4 text-petroleo/40"
            />
            <input
              id={idCampo}
              type="search"
              value={termo}
              onChange={(e) => setTermo(e.target.value)}
              autoComplete="off"
              placeholder={`Procurar ${tipo.label.toLowerCase()} por nome ou código…`}
              aria-describedby={`${idCampo}-ajuda`}
              className="w-full rounded-md border border-creme-escuro bg-white py-2 pe-3 ps-9 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta"
            />
          </div>

          {visiveis.length > 0 && (
            <ul className="mt-1 max-h-56 overflow-y-auto rounded-md border border-creme-escuro bg-white">
              {visiveis.map((pessoa) => (
                <li key={pessoa.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(pessoa);
                      setResultados([]);
                    }}
                    className="flex w-full items-center gap-3 px-3 py-2 text-start text-sm transition-colors hover:bg-creme"
                  >
                    <span className="font-mono text-xs text-petroleo/60">{pessoa.codigo || '—'}</span>
                    <span className="min-w-0 flex-1 truncate text-petroleo">{pessoa.nome || '(sem nome)'}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          <p id={`${idCampo}-ajuda`} className="mt-1 text-xs text-petroleo/60">
            {erro ? (
              <span className="text-red-600">{erro}</span>
            ) : aProcurar ? (
              'A procurar…'
            ) : activa && visiveis.length === 0 ? (
              `Sem resultados. ${tipo.label} tem de estar cadastrado para poder ser referenciado.`
            ) : (
              def.ajuda ?? `Escolha um ${tipo.label.toLowerCase()} cadastrado.`
            )}
          </p>
        </>
      )}
    </div>
  );
}

export { etiquetaPessoa };
