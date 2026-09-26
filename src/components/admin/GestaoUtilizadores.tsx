'use client';

import { useState } from 'react';
import { api, ApiErro } from '@/lib/api';
import { type Utilizador } from '@/lib/auth';
import { PAPEIS_ATRIBUIVEIS, PAPEL_LABELS, type Papel } from '@/lib/roles';
import Icone from '@/components/Icone';
import Distintivo from '@/components/admin/Distintivo';
import EstadoVazio from '@/components/admin/EstadoVazio';

type PapelOption = Exclude<Papel, 'pendente'>;

/**
 * Aprovação e gestão de contas.
 *
 * A lista vem do painel (para os contadores da navegação se manterem certos);
 * qualquer alteração pede ao painel que a recarregue.
 */
export default function GestaoUtilizadores({
  adminUid,
  utilizadores,
  onAlterado,
}: {
  adminUid: string;
  utilizadores: Utilizador[];
  onAlterado: () => Promise<void>;
}) {
  const [erro, setErro] = useState('');
  const [aba, setAba] = useState<'pendentes' | 'todos'>('pendentes');
  const [pesquisa, setPesquisa] = useState('');
  const [papelSelecionado, setPapelSelecionado] = useState<Record<string, PapelOption>>({});
  const [ocupados, setOcupados] = useState<Record<string, boolean>>({});
  const [codigo, setCodigo] = useState<{ email: string; codigo: string; expiraEm: string } | null>(null);

  const executar = async (uid: string, accao: () => Promise<unknown>) => {
    setErro('');
    setOcupados((prev) => ({ ...prev, [uid]: true }));
    try {
      await accao();
      await onAlterado();
    } catch (err) {
      setErro(err instanceof ApiErro ? err.message : 'A operação falhou.');
    } finally {
      setOcupados((prev) => ({ ...prev, [uid]: false }));
    }
  };

  const actualizar = (uid: string, body: { papel?: PapelOption; estado?: 'aprovado' | 'suspenso' }) =>
    executar(uid, () => api(`/utilizadores/${uid}`, { method: 'PATCH', body }));

  const emitirCodigo = (u: Utilizador) =>
    executar(u.uid, async () => {
      const res = await api<{ codigo: string; expiraEm: string }>(`/utilizadores/${u.uid}/codigo-acesso`, { body: {} });
      setCodigo({ email: u.email, ...res });
    });

  const pendentes = utilizadores.filter((u) => u.estado === 'pendente');
  const termo = pesquisa.trim().toLowerCase();
  const lista = (aba === 'pendentes' ? pendentes : utilizadores).filter(
    (u) =>
      !termo ||
      u.email.toLowerCase().includes(termo) ||
      (u.nomeCompleto ?? '').toLowerCase().includes(termo)
  );

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white text-terracotta ring-1 ring-creme-escuro">
          <Icone nome="definicoes" className="h-6 w-6" espessura={1.6} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-montserrat text-xl font-semibold text-petroleo">Utilizadores</h2>
          <p className="text-sm text-petroleo/60">
            Aprovar contas novas, atribuir papéis e emitir códigos de acesso.
          </p>
        </div>
      </div>

      {codigo && (
        <div className="mb-6 rounded-md border-s-4 border-amber-500 bg-amber-50 p-4" role="alert">
          <p className="font-montserrat font-semibold text-petroleo">Código de acesso para {codigo.email}</p>
          <p className="my-2 select-all font-mono text-2xl tracking-widest text-petroleo">{codigo.codigo}</p>
          <p className="text-sm text-petroleo/80">
            Válido até {new Date(codigo.expiraEm).toLocaleString('pt-PT')}. Entregue-o à pessoa por um canal seguro
            (presencialmente ou por telefone). Não voltará a ser mostrado. A pessoa usa-o em “Tenho um código de
            acesso” para definir a palavra-passe.
          </p>
          <button onClick={() => setCodigo(null)} className="mt-3 text-sm text-petroleo underline">
            Já entreguei — fechar
          </button>
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="flex rounded-md border border-creme-escuro bg-white p-0.5" role="group" aria-label="Filtro">
          {(
            [
              { id: 'pendentes' as const, label: 'Por aprovar', contagem: pendentes.length },
              { id: 'todos' as const, label: 'Todos', contagem: utilizadores.length },
            ]
          ).map(({ id, label, contagem }) => (
            <button
              key={id}
              type="button"
              onClick={() => setAba(id)}
              aria-pressed={aba === id}
              className={`rounded px-3 py-1.5 font-montserrat text-sm font-medium transition-colors ${
                aba === id ? 'bg-petroleo text-white' : 'text-petroleo/70 hover:bg-creme'
              }`}
            >
              {label}
              <span
                className={`ms-2 rounded-full px-2 py-0.5 text-xs ${
                  aba === id ? 'bg-white/20' : 'bg-creme-escuro text-petroleo/70'
                }`}
              >
                {contagem}
              </span>
            </button>
          ))}
        </div>

        <div className="relative min-w-[12rem] flex-1">
          <label htmlFor="pesquisa-utilizadores" className="sr-only">
            Pesquisar utilizadores
          </label>
          <Icone
            nome="pesquisa"
            className="pointer-events-none absolute inset-y-0 start-3 my-auto h-4 w-4 text-petroleo/40"
          />
          <input
            id="pesquisa-utilizadores"
            type="search"
            value={pesquisa}
            onChange={(e) => setPesquisa(e.target.value)}
            placeholder="Pesquisar por nome ou e-mail…"
            className="w-full rounded-md border border-creme-escuro bg-white py-2 pe-3 ps-9 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta"
          />
        </div>
      </div>

      {erro && (
        <p className="mb-4 text-sm text-red-600" role="alert">
          {erro}
        </p>
      )}

      {lista.length === 0 ? (
        <EstadoVazio
          titulo={aba === 'pendentes' ? 'Nenhuma conta aguarda aprovação' : 'Nenhum utilizador encontrado'}
          descricao={
            aba === 'pendentes'
              ? 'As contas criadas no portal aparecem aqui à espera de decisão.'
              : 'Nenhum registo corresponde à pesquisa.'
          }
        />
      ) : (
        <ul className="space-y-3">
          {lista.map((u) => {
            const proprio = u.uid === adminUid;
            const ocupado = ocupados[u.uid] ?? false;
            const papelEscolhido = papelSelecionado[u.uid] ?? (u.papelPretendido as PapelOption) ?? 'voluntario';

            return (
              <li
                key={u.uid}
                className="flex flex-col gap-4 rounded-lg border border-creme-escuro bg-white p-4 sm:flex-row sm:items-center"
              >
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-creme-escuro font-montserrat text-sm font-bold text-petroleo"
                  aria-hidden="true"
                >
                  {(u.nomeCompleto || u.email || '?')[0].toUpperCase()}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-montserrat text-sm font-semibold text-petroleo">
                    {u.nomeCompleto || '(sem nome)'}{' '}
                    {proprio && <span className="text-xs font-normal text-petroleo/50">(você)</span>}
                  </p>
                  <p className="truncate text-xs text-petroleo/60">{u.email}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <Distintivo estado={u.estado} />
                    <span className="text-xs text-petroleo/60">{PAPEL_LABELS[u.papel] ?? u.papel}</span>
                    {u.estado === 'pendente' && u.papelPretendido && (
                      <span className="text-xs italic text-petroleo/50">
                        pretende: {PAPEL_LABELS[u.papelPretendido] ?? u.papelPretendido}
                      </span>
                    )}
                    {!u.temPassword && <span className="text-xs text-amber-700">sem palavra-passe</span>}
                    {u.codigoAcessoPendente && <span className="text-xs text-amber-700">código emitido</span>}
                  </div>
                </div>

                {!proprio && (
                  <div className="flex flex-wrap items-center gap-2">
                    {u.estado === 'pendente' ? (
                      <>
                        <select
                          value={papelEscolhido}
                          onChange={(e) =>
                            setPapelSelecionado((prev) => ({ ...prev, [u.uid]: e.target.value as PapelOption }))
                          }
                          disabled={ocupado}
                          aria-label={`Papel a atribuir a ${u.email}`}
                          className="rounded border border-creme-escuro px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-terracotta"
                        >
                          {PAPEIS_ATRIBUIVEIS.filter((p) => p.value !== 'admin').map((p) => (
                            <option key={p.value} value={p.value}>
                              {p.label}
                            </option>
                          ))}
                        </select>
                        <BotaoAccao
                          onClick={() => actualizar(u.uid, { papel: papelEscolhido, estado: 'aprovado' })}
                          disabled={ocupado}
                          principal
                        >
                          Aprovar
                        </BotaoAccao>
                        <BotaoAccao onClick={() => actualizar(u.uid, { estado: 'suspenso' })} disabled={ocupado} perigo>
                          Rejeitar
                        </BotaoAccao>
                      </>
                    ) : (
                      <>
                        <select
                          value={u.papel}
                          onChange={(e) => actualizar(u.uid, { papel: e.target.value as PapelOption })}
                          disabled={ocupado || u.estado === 'suspenso'}
                          aria-label={`Papel de ${u.email}`}
                          className="rounded border border-creme-escuro px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-terracotta disabled:opacity-50"
                        >
                          {PAPEIS_ATRIBUIVEIS.map((p) => (
                            <option key={p.value} value={p.value}>
                              {p.label}
                            </option>
                          ))}
                        </select>
                        {u.estado === 'suspenso' ? (
                          <BotaoAccao onClick={() => actualizar(u.uid, { estado: 'aprovado' })} disabled={ocupado} principal>
                            Reactivar
                          </BotaoAccao>
                        ) : (
                          <BotaoAccao onClick={() => actualizar(u.uid, { estado: 'suspenso' })} disabled={ocupado} perigo>
                            Suspender
                          </BotaoAccao>
                        )}
                      </>
                    )}
                    {u.estado !== 'suspenso' && (
                      <BotaoAccao onClick={() => emitirCodigo(u)} disabled={ocupado} icone>
                        {u.temPassword ? 'Repor acesso' : 'Código de acesso'}
                      </BotaoAccao>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function BotaoAccao({
  children,
  onClick,
  disabled,
  principal,
  perigo,
  icone,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  principal?: boolean;
  perigo?: boolean;
  icone?: boolean;
}) {
  const estilo = principal
    ? 'bg-petroleo hover:bg-opacity-90 text-white border-transparent'
    : perigo
      ? 'bg-white border-red-300 hover:bg-red-50 text-red-600'
      : 'bg-white border-creme-escuro hover:bg-creme text-petroleo';
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 rounded border px-3 py-1.5 font-montserrat text-xs font-medium transition-colors disabled:opacity-50 ${estilo}`}
    >
      {icone && <Icone nome="chave" className="h-3.5 w-3.5" />}
      {disabled ? '…' : children}
    </button>
  );
}
