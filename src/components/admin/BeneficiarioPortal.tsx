'use client';

import { useEffect, useState } from 'react';
import { api, ApiErro } from '@/lib/api';
import { type Utilizador } from '@/lib/auth';
import { toDate } from '@/lib/adminCollections';
import Icone from '@/components/Icone';
import Distintivo from '@/components/admin/Distintivo';
import EstadoVazio from '@/components/admin/EstadoVazio';
import MinhaConta from '@/components/admin/MinhaConta';

interface Pedido {
  id: string;
  titulo?: string;
  descricao?: string;
  estado?: string;
  criadoEm?: string;
}

async function listarPedidos(): Promise<Pedido[]> {
  return (await api<{ pedidos: Pedido[] }>('/pedidos')).pedidos;
}

export default function BeneficiarioPortal({ utilizador, onSair }: { utilizador: Utilizador; onSair: () => void }) {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [erro, setErro] = useState('');

  useEffect(() => {
    let ignore = false;
    listarPedidos()
      .then((rows) => {
        if (!ignore) setPedidos(rows);
      })
      .catch((err) => console.error('Erro ao carregar pedidos:', err instanceof ApiErro ? err.codigo : 'desconhecido'))
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');
    setErro('');
    try {
      await api('/pedidos', { body: { titulo, descricao } });
      setTitulo('');
      setDescricao('');
      setStatus('idle');
      setPedidos(await listarPedidos());
    } catch (err) {
      setErro(err instanceof ApiErro ? err.message : 'Não foi possível enviar o pedido.');
      setStatus('error');
    }
  };

  return (
    <main className="min-h-[70vh] py-10">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-montserrat font-bold text-3xl text-petroleo">Olá, {utilizador.nomeCompleto || utilizador.email}</h1>
            <p className="text-sm text-petroleo/70">Acompanhe aqui os seus pedidos de apoio.</p>
          </div>
          <div className="flex gap-2 self-start sm:self-auto">
            <MinhaConta utilizador={utilizador} onEliminada={onSair} />
            <button
              onClick={onSair}
              className="inline-flex items-center gap-2 rounded-md border border-creme-escuro bg-white px-5 py-2 font-montserrat font-medium text-petroleo transition-colors hover:bg-creme"
            >
              <Icone nome="sair" className="h-4 w-4" />
              Terminar sessão
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-creme-escuro p-6 mb-8 space-y-4">
          <h2 className="flex items-center gap-2 font-montserrat text-xl font-semibold text-petroleo">
            <Icone nome="pedido" className="h-5 w-5 text-terracotta" />
            Novo pedido de apoio
          </h2>
          <div>
            <label htmlFor="titulo" className="block font-montserrat font-medium text-petroleo mb-2">Assunto</label>
            <input id="titulo" type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} maxLength={200} required className="w-full px-4 py-2 border border-creme-escuro rounded-md focus:outline-none focus:ring-2 focus:ring-terracotta" />
          </div>
          <div>
            <label htmlFor="descricao" className="block font-montserrat font-medium text-petroleo mb-2">Descrição</label>
            <textarea id="descricao" rows={4} value={descricao} onChange={(e) => setDescricao(e.target.value)} maxLength={5000} className="w-full px-4 py-2 border border-creme-escuro rounded-md focus:outline-none focus:ring-2 focus:ring-terracotta" />
            <p className="text-xs text-petroleo/60 mt-1">Não inclua diagnósticos, exames ou documentos clínicos.</p>
          </div>
          {status === 'error' && <p className="text-red-600 text-sm" role="alert">{erro}</p>}
          <button type="submit" disabled={status === 'loading'} className="bg-terracotta hover:bg-opacity-90 text-white font-montserrat font-medium px-6 py-2 rounded-md transition-colors disabled:opacity-50">
            {status === 'loading' ? 'A enviar...' : 'Enviar pedido'}
          </button>
        </form>

        <h2 className="font-montserrat font-semibold text-xl text-petroleo mb-4">Os meus pedidos</h2>
        {loading ? (
          <p className="text-center text-petroleo/70 py-12">A carregar...</p>
        ) : pedidos.length === 0 ? (
          <EstadoVazio
            titulo="Ainda não fez nenhum pedido"
            descricao="Use o formulário acima para nos dizer de que precisa."
          />
        ) : (
          <ul className="space-y-3">
            {pedidos.map((p) => {
              const data = toDate(p.criadoEm);
              const estado = p.estado ?? 'novo';
              return (
                <li key={p.id} className="bg-white rounded-lg border border-creme-escuro p-4">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-montserrat font-semibold text-petroleo break-words">{p.titulo}</h3>
                    <Distintivo estado={estado} />
                  </div>
                  {p.descricao && <p className="text-sm text-petroleo/80 mt-2 whitespace-pre-line break-words">{p.descricao}</p>}
                  {data && <p className="text-xs text-petroleo/50 mt-2">{data.toLocaleString('pt-PT')}</p>}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}
