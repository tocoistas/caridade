'use client';

import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { getFirebaseAuth } from '@/lib/firebase';
import { signInWithGoogle, registerWithEmail } from '@/lib/auth';
import { PAPEIS_REGISTO } from '@/lib/roles';
import type { PapelPretendido } from '@/lib/auth';

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
    case 'auth/email-already-in-use':
      return 'Já existe uma conta com este e-mail. Inicie sessão.';
    case 'auth/weak-password':
      return 'A palavra-passe deve ter pelo menos 6 caracteres.';
    case 'auth/too-many-requests':
      return 'Demasiadas tentativas. Tente novamente mais tarde.';
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return '';
    default:
      return 'Não foi possível concluir a operação. Tente novamente.';
  }
}

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
  </svg>
);

export default function LoginForm() {
  const [mode, setMode] = useState<'entrar' | 'registar'>('entrar');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [papel, setPapel] = useState<PapelPretendido>('beneficiario');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const isDisabled = loading || googleLoading;
  const isRegistar = mode === 'registar';

  const handleGoogle = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      await signInWithGoogle(isRegistar ? papel : undefined);
    } catch (err) {
      const code = err instanceof FirebaseError ? err.code : '';
      const msg = mensagemDeErro(code);
      if (msg) setError(msg);
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegistar) {
        await registerWithEmail(nome, email, password, papel);
      } else {
        await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
      }
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
          Área Reservada
        </h1>
        <p className="text-center text-sm mb-6">
          Beneficiários, voluntários, profissionais e administradores.
        </p>

        {/* Alternador Entrar / Criar conta */}
        <div className="flex bg-creme rounded-md p-1 mb-6">
          {([
            { id: 'entrar' as const, label: 'Entrar' },
            { id: 'registar' as const, label: 'Criar conta' },
          ]).map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => { setMode(id); setError(''); }}
              className={`flex-1 py-2 rounded font-montserrat font-medium text-sm transition-colors ${
                mode === id ? 'bg-white text-petroleo shadow-sm' : 'text-petroleo/60'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Escolha de perfil (só no registo) */}
        {isRegistar && (
          <fieldset className="mb-6">
            <legend className="block font-montserrat font-medium text-petroleo mb-2 text-sm">
              Como pretende participar?
            </legend>
            <div className="space-y-2">
              {PAPEIS_REGISTO.map((p) => (
                <label
                  key={p.value}
                  className={`flex items-start gap-3 p-3 border rounded-md cursor-pointer transition-colors ${
                    papel === p.value ? 'border-terracotta bg-creme' : 'border-creme-escuro'
                  }`}
                >
                  <input
                    type="radio"
                    name="papel"
                    value={p.value}
                    checked={papel === p.value}
                    onChange={() => setPapel(p.value)}
                    className="mt-1 text-terracotta focus:ring-terracotta"
                  />
                  <span>
                    <span className="block font-montserrat font-medium text-sm text-petroleo">{p.label}</span>
                    <span className="block text-xs text-petroleo/60">{p.desc}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        )}

        {/* Google */}
        <button
          type="button"
          onClick={handleGoogle}
          disabled={isDisabled}
          className="w-full flex items-center justify-center gap-3 border border-creme-escuro bg-white hover:bg-creme text-petroleo font-montserrat font-medium px-8 py-3 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-6"
        >
          {googleLoading ? (
            <span className="text-sm">A processar...</span>
          ) : (
            <>
              <GoogleIcon />
              <span className="text-sm">{isRegistar ? 'Registar com Google' : 'Entrar com Google'}</span>
            </>
          )}
        </button>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-creme-escuro" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-3 text-petroleo/50">ou</span>
          </div>
        </div>

        {/* Formulário e-mail/palavra-passe */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {isRegistar && (
            <div>
              <label htmlFor="nome" className="block font-montserrat font-medium text-petroleo mb-2">
                Nome Completo
              </label>
              <input
                type="text"
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                autoComplete="name"
                className="w-full px-4 py-2 border border-creme-escuro rounded-md focus:outline-none focus:ring-2 focus:ring-terracotta"
                required
              />
            </div>
          )}
          <div>
            <label htmlFor="email" className="block font-montserrat font-medium text-petroleo mb-2">
              E-mail
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="w-full px-4 py-2 border border-creme-escuro rounded-md focus:outline-none focus:ring-2 focus:ring-terracotta"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block font-montserrat font-medium text-petroleo mb-2">
              Palavra-passe
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={isRegistar ? 'new-password' : 'current-password'}
              minLength={6}
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
            disabled={isDisabled}
            className="w-full bg-petroleo hover:bg-opacity-90 text-white font-montserrat font-medium px-8 py-3 rounded-md transition-all disabled:bg-opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'A processar...' : isRegistar ? 'Criar conta' : 'Entrar'}
          </button>
        </form>

        {isRegistar && (
          <p className="text-xs text-petroleo/60 text-center mt-4">
            As contas novas ficam pendentes até aprovação de um administrador.
          </p>
        )}
      </div>
    </div>
  );
}
