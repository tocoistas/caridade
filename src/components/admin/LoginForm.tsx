'use client';

import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { getFirebaseAuth } from '@/lib/firebase';

function mensagemDeErro(code: string): string {
  switch (code) {
    case 'auth/invalid-email':
      return 'O endereço de e-mail é inválido.';
    case 'auth/user-disabled':
      return 'Esta conta foi desativada.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'E-mail ou palavra-passe incorretos.';
    case 'auth/too-many-requests':
      return 'Demasiadas tentativas. Tente novamente mais tarde.';
    default:
      return 'Não foi possível iniciar sessão. Tente novamente.';
  }
}

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
      // O estado de autenticação é observado na página /admin,
      // que trata da transição para o painel.
    } catch (err) {
      const code = err instanceof FirebaseError ? err.code : '';
      setError(mensagemDeErro(code));
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 max-w-md py-16 md:py-24">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="font-montserrat font-bold text-2xl text-petroleo mb-2 text-center">
          Área de Administração
        </h1>
        <p className="text-center text-sm mb-8">
          Inicie sessão para consultar os cadastros.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block font-montserrat font-medium text-petroleo mb-2"
            >
              E-mail
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="w-full px-4 py-2 border border-creme-escuro rounded-md focus:outline-none focus:ring-2 focus:ring-terracotta"
              required
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block font-montserrat font-medium text-petroleo mb-2"
            >
              Palavra-passe
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full px-4 py-2 border border-creme-escuro rounded-md focus:outline-none focus:ring-2 focus:ring-terracotta"
              required
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm text-center" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-petroleo hover:bg-opacity-90 text-white font-montserrat font-medium px-8 py-3 rounded-md transition-all disabled:bg-opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'A entrar...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
