'use client';

import { useState } from 'react';
import { ApiErro } from '@/lib/api';
import { Link } from '@/i18n/navigation';
import type { Utilizador } from '@/lib/auth';

/**
 * Direitos do titular sobre a própria conta: exportar os dados (acesso/portabilidade)
 * e eliminar a conta (apagamento). Área /admin — texto só em pt.
 */
export default function MinhaConta({ utilizador, onEliminada }: { utilizador: Utilizador; onEliminada: () => void }) {
  const [aberto, setAberto] = useState(false);
  const [confirmar, setConfirmar] = useState(false);
  const [password, setPassword] = useState('');
  const [erro, setErro] = useState('');
  const [ocupado, setOcupado] = useState(false);

  const exportar = async () => {
    setErro('');
    setOcupado(true);
    try {
      const res = await fetch('/api/v1/conta/dados', { credentials: 'same-origin', cache: 'no-store' });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'os-meus-dados-projecto-caridade.json';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setErro('Não foi possível exportar os dados.');
    } finally {
      setOcupado(false);
    }
  };

  const eliminar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErro('');
    setOcupado(true);
    try {
      const res = await fetch('/api/v1/conta', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
        credentials: 'same-origin',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new ApiErro(res.status, data.erro ?? 'erro', data.mensagem ?? 'Não foi possível eliminar a conta.');
      onEliminada();
    } catch (err) {
      setErro(err instanceof ApiErro ? err.message : 'Não foi possível eliminar a conta.');
      setOcupado(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setAberto((v) => !v)}
        className="bg-white border border-creme-escuro hover:bg-creme text-petroleo font-montserrat font-medium px-5 py-2 rounded-md transition-colors"
        aria-expanded={aberto}
      >
        A minha conta
      </button>
      {aberto && (
        <div className="absolute right-0 z-20 mt-2 w-80 bg-white border border-creme-escuro rounded-lg shadow-lg p-4 text-sm space-y-3">
          <p className="text-petroleo/70 break-words">{utilizador.email}</p>
          <button onClick={exportar} disabled={ocupado} className="w-full text-left px-3 py-2 rounded hover:bg-creme disabled:opacity-50">
            ⬇️ Exportar os meus dados (JSON)
          </button>
          {utilizador.papel !== 'admin' &&
            (confirmar ? (
              <form onSubmit={eliminar} className="space-y-2 border-t border-creme-escuro pt-3">
                <p className="text-red-700">
                  A conta e o seu perfil são apagados; os pedidos de apoio ficam anonimizados. Esta acção é irreversível.
                </p>
                <label htmlFor="conf-password" className="block font-medium">Confirme com a palavra-passe</label>
                <input id="conf-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" className="w-full px-3 py-2 border border-creme-escuro rounded-md" required />
                <div className="flex gap-2">
                  <button type="submit" disabled={ocupado} className="flex-1 bg-red-600 text-white rounded-md px-3 py-2 disabled:opacity-50">Eliminar definitivamente</button>
                  <button type="button" onClick={() => setConfirmar(false)} className="flex-1 border border-creme-escuro rounded-md px-3 py-2">Cancelar</button>
                </div>
              </form>
            ) : (
              <button onClick={() => setConfirmar(true)} className="w-full text-left px-3 py-2 rounded hover:bg-red-50 text-red-700">
                🗑️ Eliminar a minha conta
              </button>
            ))}
          {erro && <p className="text-red-600" role="alert">{erro}</p>}
          <p className="text-xs text-petroleo/60">
            Outros pedidos (rectificação, oposição…): <Link href="/direitos-dados" className="underline">formulário de direitos</Link>.
          </p>
        </div>
      )}
    </div>
  );
}
