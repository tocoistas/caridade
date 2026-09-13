'use client';

import { useEffect, useState } from 'react';
import { api, ApiErro } from '@/lib/api';
import { type Utilizador } from '@/lib/auth';
import { PAPEIS_ATRIBUIVEIS, PAPEL_LABELS, type Papel } from '@/lib/roles';

type PapelOption = Exclude<Papel, 'pendente'>;

const ESTADO_CLASSES: Record<string, string> = {
  aprovado: 'bg-green-100 text-green-800',
  pendente: 'bg-amber-100 text-amber-800',
  suspenso: 'bg-red-100 text-red-800',
};

async function listar(): Promise<Utilizador[]> {
  return (await api<{ utilizadores: Utilizador[] }>('/utilizadores')).utilizadores;
}

export default function GestaoUtilizadores({ adminUid }: { adminUid: string }) {
  const [utilizadores, setUtilizadores] = useState<Utilizador[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [tab, setTab] = useState<'pendentes' | 'todos'>('pendentes');
  const [papelSelecionado, setPapelSelecionado] = useState<Record<string, PapelOption>>({});
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const [codigo, setCodigo] = useState<{ email: string; codigo: string; expiraEm: string } | null>(null);

  useEffect(() => {
    let ignore = false;
    listar()
      .then((rows) => {
        if (!ignore) setUtilizadores(rows);
      })
      .catch((err) => {
        if (!ignore) setErro(err instanceof ApiErro ? err.message : 'Não foi possível carregar os utilizadores.');
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, []);

  const executar = async (uid: string, accao: () => Promise<unknown>) => {
    setErro('');
    setActionLoading((prev) => ({ ...prev, [uid]: true }));
    try {
      await accao();
      setUtilizadores(await listar());
    } catch (err) {
      setErro(err instanceof ApiErro ? err.message : 'A operação falhou.');
    } finally {
      setActionLoading((prev) => ({ ...prev, [uid]: false }));
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
  const lista = tab === 'pendentes' ? pendentes : utilizadores;

  return (
    <div>
      {codigo && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-md mb-6" role="alert">
          <p className="font-montserrat font-semibold text-petroleo">Código de acesso para {codigo.email}</p>
          <p className="font-mono text-2xl tracking-widest text-petroleo my-2 select-all">{codigo.codigo}</p>
          <p className="text-sm text-petroleo/80">
            Válido até {new Date(codigo.expiraEm).toLocaleString('pt-PT')}. Entregue-o à pessoa por um canal seguro
            (presencialmente ou por telefone). Não voltará a ser mostrado. A pessoa usa-o em
            “Tenho um código de acesso” para definir a palavra-passe.
          </p>
          <button onClick={() => setCodigo(null)} className="mt-3 text-sm text-petroleo underline">
            Já entreguei — fechar
          </button>
        </div>
      )}

      <div className="flex gap-2 border-b border-creme-escuro mb-6">
        {([
          { id: 'pendentes' as const, label: 'Pendentes', count: pendentes.length },
          { id: 'todos' as const, label: 'Todos', count: utilizadores.length },
        ]).map(({ id, label, count }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`px-4 py-3 font-montserrat font-medium text-sm transition-colors border-b-2 -mb-px ${
              tab === id ? 'border-terracotta text-terracotta' : 'border-transparent text-petroleo/70 hover:text-petroleo'
            }`}
          >
            {label}
            <span
              className={`ml-2 inline-flex items-center justify-center text-xs font-semibold rounded-full px-2 py-0.5 ${
                tab === id ? 'bg-terracotta text-white' : 'bg-creme-escuro text-petroleo'
              }`}
            >
              {count}
            </span>
          </button>
        ))}
      </div>

      {erro && <p className="text-red-600 text-sm mb-4" role="alert">{erro}</p>}

      {loading && <p className="text-center text-petroleo/70 py-12">A carregar utilizadores...</p>}

      {!loading && lista.length === 0 && (
        <p className="text-center text-petroleo/60 py-12 bg-white rounded-lg border border-creme-escuro">
          {tab === 'pendentes' ? 'Nenhuma conta aguarda aprovação.' : 'Nenhum utilizador registado.'}
        </p>
      )}

      {!loading && lista.length > 0 && (
        <div className="space-y-3">
          {lista.map((u) => {
            const proprio = u.uid === adminUid;
            const ocupado = actionLoading[u.uid] ?? false;
            const selectedPapel = papelSelecionado[u.uid] ?? (u.papelPretendido as PapelOption) ?? 'voluntario';

            return (
              <div key={u.uid} className="bg-white rounded-lg border border-creme-escuro p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-creme-escuro flex items-center justify-center text-petroleo font-montserrat font-bold text-sm">
                  {(u.nomeCompleto || u.email || '?')[0].toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-montserrat font-semibold text-petroleo text-sm truncate">
                    {u.nomeCompleto || '(sem nome)'} {proprio && <span className="text-xs text-petroleo/50">(você)</span>}
                  </p>
                  <p className="text-xs text-petroleo/60 truncate">{u.email}</p>
                  <div className="flex flex-wrap gap-2 mt-1 items-center">
                    <span className="text-xs text-petroleo/50">{PAPEL_LABELS[u.papel] ?? u.papel}</span>
                    {u.estado === 'pendente' && u.papelPretendido && (
                      <span className="text-xs text-petroleo/50 italic">· pretende: {PAPEL_LABELS[u.papelPretendido] ?? u.papelPretendido}</span>
                    )}
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ESTADO_CLASSES[u.estado] ?? ''}`}>{u.estado}</span>
                    {!u.temPassword && <span className="text-xs text-amber-700">· sem palavra-passe</span>}
                    {u.codigoAcessoPendente && <span className="text-xs text-amber-700">· código emitido</span>}
                  </div>
                </div>

                {!proprio && (
                  <div className="flex flex-wrap items-center gap-2">
                    {u.estado === 'pendente' ? (
                      <>
                        <select
                          value={selectedPapel}
                          onChange={(e) => setPapelSelecionado((prev) => ({ ...prev, [u.uid]: e.target.value as PapelOption }))}
                          disabled={ocupado}
                          aria-label="Papel a atribuir"
                          className="text-xs border border-creme-escuro rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-terracotta"
                        >
                          {PAPEIS_ATRIBUIVEIS.filter((p) => p.value !== 'admin').map((p) => (
                            <option key={p.value} value={p.value}>{p.label}</option>
                          ))}
                        </select>
                        <BotaoAccao onClick={() => actualizar(u.uid, { papel: selectedPapel, estado: 'aprovado' })} disabled={ocupado} principal>Aprovar</BotaoAccao>
                        <BotaoAccao onClick={() => actualizar(u.uid, { estado: 'suspenso' })} disabled={ocupado} perigo>Rejeitar</BotaoAccao>
                      </>
                    ) : (
                      <>
                        <select
                          value={u.papel}
                          onChange={(e) => actualizar(u.uid, { papel: e.target.value as PapelOption })}
                          disabled={ocupado || u.estado === 'suspenso'}
                          aria-label="Papel"
                          className="text-xs border border-creme-escuro rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-terracotta disabled:opacity-50"
                        >
                          {PAPEIS_ATRIBUIVEIS.map((p) => (
                            <option key={p.value} value={p.value}>{p.label}</option>
                          ))}
                        </select>
                        {u.estado === 'suspenso' ? (
                          <BotaoAccao onClick={() => actualizar(u.uid, { estado: 'aprovado' })} disabled={ocupado} principal>Reactivar</BotaoAccao>
                        ) : (
                          <BotaoAccao onClick={() => actualizar(u.uid, { estado: 'suspenso' })} disabled={ocupado} perigo>Suspender</BotaoAccao>
                        )}
                      </>
                    )}
                    {u.estado !== 'suspenso' && (
                      <BotaoAccao onClick={() => emitirCodigo(u)} disabled={ocupado}>
                        {u.temPassword ? 'Repor acesso' : 'Código de acesso'}
                      </BotaoAccao>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
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
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  principal?: boolean;
  perigo?: boolean;
}) {
  const estilo = principal
    ? 'bg-petroleo hover:bg-opacity-90 text-white'
    : perigo
      ? 'bg-white border border-red-300 hover:bg-red-50 text-red-600'
      : 'bg-white border border-creme-escuro hover:bg-creme text-petroleo';
  return (
    <button onClick={onClick} disabled={disabled} className={`text-xs font-montserrat font-medium px-3 py-1.5 rounded transition-colors disabled:opacity-50 ${estilo}`}>
      {disabled ? '...' : children}
    </button>
  );
}
