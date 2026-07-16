'use client';

import { useEffect, useState } from 'react';
import { signOut, type User } from 'firebase/auth';
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db, getFirebaseAuth } from '@/lib/firebase';
import { type Utilizador } from '@/lib/auth';
import { toDate } from '@/lib/adminCollections';

interface Pedido {
  id: string;
  titulo?: string;
  descricao?: string;
  estado?: string;
  criadoEm?: unknown;
}

const ESTADO_LABELS: Record<string, string> = {
  novo: 'Novo',
  em_analise: 'Em análise',
  resolvido: 'Resolvido',
};

const ESTADO_CLASSES: Record<string, string> = {
  novo: 'bg-amber-100 text-amber-800',
  em_analise: 'bg-blue-100 text-blue-800',
  resolvido: 'bg-green-100 text-green-800',
};

export default function BeneficiarioPortal({
  user,
  userDoc,
}: {
  user: User;
  userDoc: Utilizador;
}) {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');

  const carregar = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'pedidosApoio'),
        where('uid', '==', user.uid),
        orderBy('criadoEm', 'desc')
      );
      const snap = await getDocs(q);
      setPedidos(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Pedido, 'id'>) })));
    } catch (err) {
      console.error('Erro ao carregar pedidos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');
    try {
      await addDoc(collection(db, 'pedidosApoio'), {
        uid: user.uid,
        nomeBeneficiario: userDoc.nomeCompleto || user.displayName || '',
        email: user.email ?? '',
        titulo,
        descricao,
        estado: 'novo',
        criadoEm: serverTimestamp(),
      });
      setTitulo('');
      setDescricao('');
      setStatus('idle');
      await carregar();
    } catch (err) {
      console.error('Erro ao criar pedido:', err);
      setStatus('error');
    }
  };

  const handleLogout = () => signOut(getFirebaseAuth());

  return (
    <main className="min-h-[70vh] py-10">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-montserrat font-bold text-3xl text-petroleo">
              Olá, {userDoc.nomeCompleto || user.email}
            </h1>
            <p className="text-sm text-petroleo/70">Os seus pedidos de apoio</p>
          </div>
          <button
            onClick={handleLogout}
            className="self-start sm:self-auto bg-white border border-creme-escuro hover:bg-creme text-petroleo font-montserrat font-medium px-5 py-2 rounded-md transition-colors"
          >
            Terminar sessão
          </button>
        </div>

        {/* Novo pedido */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-creme-escuro p-6 mb-8 space-y-4">
          <h2 className="font-montserrat font-semibold text-lg text-petroleo">Novo pedido de apoio</h2>
          <div>
            <label htmlFor="titulo" className="block font-montserrat font-medium text-petroleo text-sm mb-1">
              Título
            </label>
            <input
              id="titulo"
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
              className="w-full px-3 py-2 border border-creme-escuro rounded-md focus:outline-none focus:ring-2 focus:ring-terracotta"
            />
          </div>
          <div>
            <label htmlFor="descricao" className="block font-montserrat font-medium text-petroleo text-sm mb-1">
              Descreva a sua necessidade
            </label>
            <textarea
              id="descricao"
              rows={4}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              required
              className="w-full px-3 py-2 border border-creme-escuro rounded-md focus:outline-none focus:ring-2 focus:ring-terracotta"
            />
          </div>
          {status === 'error' && (
            <p className="text-red-600 text-sm">Não foi possível enviar. Tente novamente.</p>
          )}
          <button
            type="submit"
            disabled={status === 'loading'}
            className="bg-terracotta hover:bg-opacity-90 text-white font-montserrat font-medium px-6 py-2 rounded-md transition-colors disabled:opacity-50"
          >
            {status === 'loading' ? 'A enviar...' : 'Enviar pedido'}
          </button>
        </form>

        {/* Lista de pedidos */}
        <h2 className="font-montserrat font-semibold text-lg text-petroleo mb-4">Histórico</h2>
        {loading ? (
          <p className="text-center text-petroleo/70 py-12">A carregar...</p>
        ) : pedidos.length === 0 ? (
          <p className="text-center text-petroleo/60 py-12 bg-white rounded-lg border border-creme-escuro">
            Ainda não submeteu nenhum pedido.
          </p>
        ) : (
          <div className="space-y-3">
            {pedidos.map((p) => {
              const estado = p.estado ?? 'novo';
              const d = toDate(p.criadoEm);
              return (
                <article key={p.id} className="bg-white rounded-lg border border-creme-escuro p-5">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-montserrat font-semibold text-petroleo">{p.titulo}</h3>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${ESTADO_CLASSES[estado] ?? ''}`}>
                      {ESTADO_LABELS[estado] ?? estado}
                    </span>
                  </div>
                  <p className="text-sm text-petroleo/80 whitespace-pre-line mb-2">{p.descricao}</p>
                  {d && (
                    <p className="text-xs text-petroleo/50">{d.toLocaleString('pt-PT')}</p>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
