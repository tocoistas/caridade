'use client';

import { useState } from 'react';
import { ApiErro } from '@/lib/api';
import { alterarPassword, PASSWORD_MIN, type Utilizador } from '@/lib/auth';

const inputClass =
  'w-full px-4 py-2 border border-creme-escuro rounded-md focus:outline-none focus:ring-2 focus:ring-terracotta';

/** Troca obrigatória de palavra-passe (ex.: palavra-passe temporária gerada no bootstrap). */
export default function AlterarPasswordForm({
  utilizador,
  onConcluido,
  onSair,
}: {
  utilizador: Utilizador;
  onConcluido: (utilizador: Utilizador) => void;
  onSair: () => void;
}) {
  const [actual, setActual] = useState('');
  const [nova, setNova] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErro('');
    if (nova !== confirmar) {
      setErro('As palavras-passe não coincidem.');
      return;
    }
    setLoading(true);
    try {
      onConcluido(await alterarPassword(actual, nova));
    } catch (err) {
      setErro(err instanceof ApiErro ? err.message : 'Não foi possível alterar a palavra-passe.');
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 max-w-md py-16 md:py-24">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="font-montserrat font-bold text-2xl text-petroleo mb-2 text-center">Defina uma nova palavra-passe</h1>
        <p className="text-center text-sm mb-6">
          A conta <strong>{utilizador.email}</strong> usa uma palavra-passe temporária. Escolha uma nova para continuar.
        </p>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="actual" className="block font-montserrat font-medium text-petroleo mb-2">Palavra-passe actual</label>
            <input type="password" id="actual" value={actual} onChange={(e) => setActual(e.target.value)} autoComplete="current-password" className={inputClass} required />
          </div>
          <div>
            <label htmlFor="nova" className="block font-montserrat font-medium text-petroleo mb-2">Nova palavra-passe</label>
            <input type="password" id="nova" value={nova} onChange={(e) => setNova(e.target.value)} autoComplete="new-password" minLength={PASSWORD_MIN} maxLength={128} className={inputClass} required />
          </div>
          <div>
            <label htmlFor="confirmar" className="block font-montserrat font-medium text-petroleo mb-2">Confirmar nova palavra-passe</label>
            <input type="password" id="confirmar" value={confirmar} onChange={(e) => setConfirmar(e.target.value)} autoComplete="new-password" minLength={PASSWORD_MIN} maxLength={128} className={inputClass} required />
          </div>
          {erro && <p className="text-red-600 text-sm text-center" role="alert">{erro}</p>}
          <button type="submit" disabled={loading} className="w-full bg-petroleo hover:bg-opacity-90 text-white font-montserrat font-medium px-8 py-3 rounded-md transition-all disabled:bg-opacity-50">
            {loading ? 'A guardar...' : 'Guardar e continuar'}
          </button>
        </form>
        <div className="text-center mt-5">
          <button type="button" onClick={onSair} className="text-sm text-petroleo underline">Terminar sessão</button>
        </div>
      </div>
    </div>
  );
}
