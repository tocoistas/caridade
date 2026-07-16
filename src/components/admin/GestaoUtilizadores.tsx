'use client';

import { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  orderBy,
  query,
  doc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { type Utilizador } from '@/lib/auth';

type PapelOption = 'coordenador' | 'voluntario' | 'profissional' | 'admin';

const PAPEIS: { value: PapelOption; label: string }[] = [
  { value: 'coordenador', label: 'Coordenador' },
  { value: 'voluntario', label: 'Voluntário' },
  { value: 'profissional', label: 'Profissional' },
  { value: 'admin', label: 'Administrador' },
];

const PAPEL_LABELS: Record<string, string> = {
  admin: 'Administrador',
  coordenador: 'Coordenador',
  voluntario: 'Voluntário',
  profissional: 'Profissional',
  pendente: 'Pendente',
};

const ESTADO_CLASSES: Record<string, string> = {
  aprovado: 'bg-green-100 text-green-800',
  pendente: 'bg-amber-100 text-amber-800',
  suspenso: 'bg-red-100 text-red-800',
};

interface UtilizadorRow extends Utilizador {
  id: string;
}

export default function GestaoUtilizadores({ adminUid }: { adminUid: string }) {
  const [utilizadores, setUtilizadores] = useState<UtilizadorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'pendentes' | 'todos'>('pendentes');
  const [papelSelecionado, setPapelSelecionado] = useState<Record<string, PapelOption>>({});
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  const carregarUtilizadores = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'utilizadores'), orderBy('criadoEm', 'desc'));
      const snap = await getDocs(q);
      const rows: UtilizadorRow[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Utilizador),
      }));
      setUtilizadores(rows);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarUtilizadores();
  }, []);

  const aprovar = async (uid: string) => {
    const papel = papelSelecionado[uid] ?? 'voluntario';
    setActionLoading((prev) => ({ ...prev, [uid]: true }));
    try {
      await updateDoc(doc(db, 'utilizadores', uid), {
        papel,
        estado: 'aprovado',
        aprovadoPor: adminUid,
        aprovadoEm: serverTimestamp(),
      });
      await carregarUtilizadores();
    } finally {
      setActionLoading((prev) => ({ ...prev, [uid]: false }));
    }
  };

  const suspender = async (uid: string) => {
    setActionLoading((prev) => ({ ...prev, [uid]: true }));
    try {
      await updateDoc(doc(db, 'utilizadores', uid), {
        estado: 'suspenso',
        aprovadoPor: adminUid,
        aprovadoEm: serverTimestamp(),
      });
      await carregarUtilizadores();
    } finally {
      setActionLoading((prev) => ({ ...prev, [uid]: false }));
    }
  };

  const alterarPapel = async (uid: string, papel: PapelOption) => {
    setActionLoading((prev) => ({ ...prev, [uid]: true }));
    try {
      await updateDoc(doc(db, 'utilizadores', uid), {
        papel,
        aprovadoPor: adminUid,
        aprovadoEm: serverTimestamp(),
      });
      await carregarUtilizadores();
    } finally {
      setActionLoading((prev) => ({ ...prev, [uid]: false }));
    }
  };

  const lista =
    tab === 'pendentes'
      ? utilizadores.filter((u) => u.estado === 'pendente')
      : utilizadores;

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-2 border-b border-creme-escuro mb-6">
        {[
          { id: 'pendentes' as const, label: 'Pendentes' },
          { id: 'todos' as const, label: 'Todos' },
        ].map(({ id, label }) => {
          const count = id === 'pendentes'
            ? utilizadores.filter((u) => u.estado === 'pendente').length
            : utilizadores.length;
          return (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`px-4 py-3 font-montserrat font-medium text-sm transition-colors border-b-2 -mb-px ${
                tab === id
                  ? 'border-terracotta text-terracotta'
                  : 'border-transparent text-petroleo/70 hover:text-petroleo'
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
          );
        })}
      </div>

      {loading && (
        <p className="text-center text-petroleo/70 py-12">A carregar utilizadores...</p>
      )}

      {!loading && lista.length === 0 && (
        <p className="text-center text-petroleo/60 py-12 bg-white rounded-lg border border-creme-escuro">
          {tab === 'pendentes' ? 'Nenhuma conta aguarda aprovação.' : 'Nenhum utilizador registado.'}
        </p>
      )}

      {!loading && lista.length > 0 && (
        <div className="space-y-3">
          {lista.map((u) => {
            const isPending = u.estado === 'pendente';
            const isLoading = actionLoading[u.uid] ?? false;
            const selectedPapel = papelSelecionado[u.uid] ?? 'voluntario';

            return (
              <div
                key={u.id}
                className="bg-white rounded-lg border border-creme-escuro p-4 flex flex-col sm:flex-row sm:items-center gap-4"
              >
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {u.fotoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={u.fotoUrl}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-creme-escuro flex items-center justify-center text-petroleo font-montserrat font-bold text-sm">
                      {(u.nomeCompleto || u.email || '?')[0].toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-montserrat font-semibold text-petroleo text-sm truncate">
                    {u.nomeCompleto || '(sem nome)'}
                  </p>
                  <p className="text-xs text-petroleo/60 truncate">{u.email}</p>
                  <div className="flex gap-2 mt-1">
                    <span className="text-xs text-petroleo/50">
                      {PAPEL_LABELS[u.papel] ?? u.papel}
                    </span>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${ESTADO_CLASSES[u.estado] ?? ''}`}
                    >
                      {u.estado}
                    </span>
                  </div>
                </div>

                {/* Acções */}
                <div className="flex flex-wrap items-center gap-2">
                  {isPending ? (
                    <>
                      <select
                        value={selectedPapel}
                        onChange={(e) =>
                          setPapelSelecionado((prev) => ({
                            ...prev,
                            [u.uid]: e.target.value as PapelOption,
                          }))
                        }
                        disabled={isLoading}
                        className="text-xs border border-creme-escuro rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-terracotta"
                      >
                        {PAPEIS.filter((p) => p.value !== 'admin').map((p) => (
                          <option key={p.value} value={p.value}>
                            {p.label}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => aprovar(u.uid)}
                        disabled={isLoading}
                        className="text-xs bg-petroleo hover:bg-opacity-90 text-white font-montserrat font-medium px-3 py-1.5 rounded transition-colors disabled:opacity-50"
                      >
                        {isLoading ? '...' : 'Aprovar'}
                      </button>
                      <button
                        onClick={() => suspender(u.uid)}
                        disabled={isLoading}
                        className="text-xs bg-white border border-red-300 hover:bg-red-50 text-red-600 font-montserrat font-medium px-3 py-1.5 rounded transition-colors disabled:opacity-50"
                      >
                        {isLoading ? '...' : 'Rejeitar'}
                      </button>
                    </>
                  ) : (
                    <>
                      <select
                        value={u.papel}
                        onChange={(e) => alterarPapel(u.uid, e.target.value as PapelOption)}
                        disabled={isLoading || u.estado === 'suspenso'}
                        className="text-xs border border-creme-escuro rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-terracotta disabled:opacity-50"
                      >
                        {PAPEIS.map((p) => (
                          <option key={p.value} value={p.value}>
                            {p.label}
                          </option>
                        ))}
                      </select>
                      {u.estado !== 'suspenso' && (
                        <button
                          onClick={() => suspender(u.uid)}
                          disabled={isLoading}
                          className="text-xs bg-white border border-red-300 hover:bg-red-50 text-red-600 font-montserrat font-medium px-3 py-1.5 rounded transition-colors disabled:opacity-50"
                        >
                          {isLoading ? '...' : 'Suspender'}
                        </button>
                      )}
                      {u.estado === 'suspenso' && (
                        <button
                          onClick={() => aprovar(u.uid)}
                          disabled={isLoading}
                          className="text-xs bg-petroleo hover:bg-opacity-90 text-white font-montserrat font-medium px-3 py-1.5 rounded transition-colors disabled:opacity-50"
                        >
                          {isLoading ? '...' : 'Reativar'}
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
