import 'server-only';
import { Timestamp } from 'firebase-admin/firestore';
import { json } from './http';
import { definirCookieSessao, type Cliente } from './session';
import { publico, type UtilizadorDoc } from './users';

/**
 * Resposta de autenticação bem-sucedida.
 * - web: token só no cookie httpOnly (nunca no corpo);
 * - app: token no corpo, para guardar no armazenamento privado da app.
 */
export function respostaSessao(
  utilizador: UtilizadorDoc,
  sessao: { token: string; expiraEm: Date },
  cliente: Cliente,
  status = 200
) {
  const res = json(
    {
      utilizador: publico(utilizador),
      ...(cliente === 'app' ? { token: sessao.token, expiraEm: sessao.expiraEm.toISOString() } : {}),
    },
    { status }
  );
  if (cliente === 'web') definirCookieSessao(res, sessao.token, sessao.expiraEm);
  return res;
}

/** Converte Timestamps do Firestore em ISO 8601 (recursivo). */
export function serializar(valor: unknown): unknown {
  if (valor instanceof Timestamp) return valor.toDate().toISOString();
  if (Array.isArray(valor)) return valor.map(serializar);
  if (valor && typeof valor === 'object') {
    return Object.fromEntries(Object.entries(valor).map(([k, v]) => [k, serializar(v)]));
  }
  return valor;
}
