/**
 * Autenticação própria (cliente web). As credenciais são verificadas no servidor
 * (`/api/v1/auth/*`); a sessão é um cookie httpOnly. Não há Firebase Auth.
 */
import { api, ApiErro } from '@/lib/api';
import type { Papel } from '@/lib/roles';

export type PapelPretendido = 'beneficiario' | 'voluntario' | 'profissional';

export interface Utilizador {
  uid: string;
  email: string;
  nomeCompleto: string;
  papel: Papel;
  papelPretendido: string;
  estado: 'pendente' | 'aprovado' | 'suspenso';
  alterarPassword: boolean;
  temPassword: boolean;
  codigoAcessoPendente: boolean;
  criadoEm: string | null;
  aprovadoEm: string | null;
  ultimoLoginEm: string | null;
}

export const PASSWORD_MIN = 10;

type RespostaSessao = { utilizador: Utilizador };

/** Utilizador da sessão actual, ou null se não houver sessão válida. */
export async function obterSessao(): Promise<Utilizador | null> {
  try {
    return (await api<RespostaSessao>('/auth/sessao')).utilizador;
  } catch (err) {
    if (err instanceof ApiErro && err.status === 401) return null;
    throw err;
  }
}

export async function entrar(email: string, password: string): Promise<Utilizador> {
  return (await api<RespostaSessao>('/auth/login', { body: { email, password } })).utilizador;
}

export async function registar(
  nome: string,
  email: string,
  password: string,
  papelPretendido: PapelPretendido
): Promise<Utilizador> {
  return (await api<RespostaSessao>('/auth/registo', { body: { nome, email, password, papelPretendido } })).utilizador;
}

export async function definirPasswordComCodigo(email: string, codigo: string, novaPassword: string): Promise<Utilizador> {
  return (await api<RespostaSessao>('/auth/definir-password', { body: { email, codigo, novaPassword } })).utilizador;
}

export async function alterarPassword(actual: string, nova: string): Promise<Utilizador> {
  return (await api<RespostaSessao>('/auth/alterar-password', { body: { actual, nova } })).utilizador;
}

export async function terminarSessao(): Promise<void> {
  await api('/auth/logout', { body: {} });
}
