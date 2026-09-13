'use client';

import { useState } from 'react';
import { ApiErro } from '@/lib/api';
import {
  definirPasswordComCodigo,
  entrar,
  PASSWORD_MIN,
  registar,
  type PapelPretendido,
  type Utilizador,
} from '@/lib/auth';
import { PAPEIS_REGISTO } from '@/lib/roles';
import CaixaConsentimento from '@/components/CaixaConsentimento';

type Modo = 'entrar' | 'registar' | 'codigo';

const inputClass =
  'w-full px-4 py-2 border border-creme-escuro rounded-md focus:outline-none focus:ring-2 focus:ring-terracotta';
const labelClass = 'block font-montserrat font-medium text-petroleo mb-2';

export default function LoginForm({ onAutenticado }: { onAutenticado: (utilizador: Utilizador) => void }) {
  const [modo, setModo] = useState<Modo>('entrar');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [codigo, setCodigo] = useState('');
  const [papel, setPapel] = useState<PapelPretendido>('beneficiario');
  const [aceitaPolitica, setAceitaPolitica] = useState(false);
  const [maiorDe16, setMaiorDe16] = useState(false);
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  const mudarModo = (novo: Modo) => {
    setModo(novo);
    setErro('');
    setPassword('');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErro('');
    setLoading(true);
    try {
      const utilizador =
        modo === 'registar'
          ? await registar(nome, email, password, papel)
          : modo === 'codigo'
            ? await definirPasswordComCodigo(email, codigo, password)
            : await entrar(email, password);
      onAutenticado(utilizador);
    } catch (err) {
      setErro(err instanceof ApiErro ? err.message : 'Não foi possível concluir a operação. Tente novamente.');
      setLoading(false);
    }
  };

  const titulo = modo === 'codigo' ? 'Definir palavra-passe' : 'Área Reservada';
  const botao = modo === 'registar' ? 'Criar conta' : modo === 'codigo' ? 'Definir e entrar' : 'Entrar';

  return (
    <div className="container mx-auto px-4 max-w-md py-16 md:py-24">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="font-montserrat font-bold text-2xl text-petroleo mb-2 text-center">{titulo}</h1>
        <p className="text-center text-sm mb-6">
          {modo === 'codigo'
            ? 'Use o código de acesso que recebeu de um administrador (primeiro acesso ou reposição).'
            : 'Beneficiários, voluntários, profissionais e administradores.'}
        </p>

        {modo !== 'codigo' && (
          <div className="flex bg-creme rounded-md p-1 mb-6" role="tablist">
            {([
              { id: 'entrar' as const, label: 'Entrar' },
              { id: 'registar' as const, label: 'Criar conta' },
            ]).map(({ id, label }) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={modo === id}
                onClick={() => mudarModo(id)}
                className={`flex-1 py-2 rounded font-montserrat font-medium text-sm transition-colors ${
                  modo === id ? 'bg-white text-petroleo shadow-sm' : 'text-petroleo/60'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {modo === 'registar' && (
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

        <form onSubmit={handleSubmit} className="space-y-5">
          {modo === 'registar' && (
            <div>
              <label htmlFor="nome" className={labelClass}>Nome Completo</label>
              <input type="text" id="nome" value={nome} onChange={(e) => setNome(e.target.value)} autoComplete="name" maxLength={200} className={inputClass} required />
            </div>
          )}
          <div>
            <label htmlFor="email" className={labelClass}>E-mail</label>
            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" maxLength={320} className={inputClass} required />
          </div>
          {modo === 'codigo' && (
            <div>
              <label htmlFor="codigo" className={labelClass}>Código de acesso</label>
              <input
                type="text"
                id="codigo"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                autoComplete="one-time-code"
                placeholder="XXXXX-XXXXX"
                maxLength={20}
                className={`${inputClass} font-mono tracking-widest`}
                required
              />
            </div>
          )}
          <div>
            <label htmlFor="password" className={labelClass}>
              {modo === 'entrar' ? 'Palavra-passe' : 'Nova palavra-passe'}
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={modo === 'entrar' ? 'current-password' : 'new-password'}
              minLength={modo === 'entrar' ? undefined : PASSWORD_MIN}
              maxLength={128}
              className={inputClass}
              required
            />
            {modo !== 'entrar' && (
              <p className="text-xs text-petroleo/60 mt-1">Mínimo {PASSWORD_MIN} caracteres. Use uma frase fácil de lembrar.</p>
            )}
          </div>

          {erro && (
            <p className="text-red-600 text-sm text-center" role="alert">
              {erro}
            </p>
          )}

          {modo === 'registar' && (
            <div className="space-y-2">
              <CaixaConsentimento id="aceita-politica" texto="consentAccount" checked={aceitaPolitica} onChange={setAceitaPolitica} />
              <CaixaConsentimento id="maior-16" texto="age16" checked={maiorDe16} onChange={setMaiorDe16} />
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-petroleo hover:bg-opacity-90 text-white font-montserrat font-medium px-8 py-3 rounded-md transition-all disabled:bg-opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'A processar...' : botao}
          </button>
        </form>

        <div className="text-center mt-5 text-sm">
          {modo === 'codigo' ? (
            <button type="button" onClick={() => mudarModo('entrar')} className="text-petroleo underline">
              Voltar a iniciar sessão
            </button>
          ) : (
            <button type="button" onClick={() => mudarModo('codigo')} className="text-petroleo underline">
              Tenho um código de acesso / esqueci-me da palavra-passe
            </button>
          )}
        </div>

        {modo === 'registar' && (
          <p className="text-xs text-petroleo/60 text-center mt-4">
            As contas novas ficam pendentes até aprovação de um administrador.
          </p>
        )}
        {modo === 'entrar' && (
          <p className="text-xs text-petroleo/60 text-center mt-4">
            Esqueceu-se da palavra-passe? Peça a um administrador um código de acesso.
          </p>
        )}
      </div>
    </div>
  );
}
