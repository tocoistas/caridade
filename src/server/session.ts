import 'server-only';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import type { NextResponse } from 'next/server';
import { capsOf, type RoleCaps } from '@/lib/roles';
import { gerarToken, sha256 } from './crypto';
import { adminDb } from './firebaseAdmin';
import { ApiError, verificarOrigem } from './http';
import type { UtilizadorDoc } from './users';

export type Cliente = 'web' | 'app';

const DIA = 24 * 60 * 60 * 1000;
const DURACAO: Record<Cliente, number> = { web: 7 * DIA, app: 30 * DIA };

// `__Host-` exige HTTPS; em desenvolvimento (http://localhost) usa-se o nome simples.
const PRODUCAO = process.env.NODE_ENV === 'production' && !process.env.FIRESTORE_EMULATOR_HOST;
export const COOKIE_SESSAO = PRODUCAO ? '__Host-caridade-sessao' : 'caridade-sessao';

export interface Sessao {
  id: string;
  uid: string;
  via: 'cookie' | 'bearer';
  utilizador: UtilizadorDoc;
  caps: RoleCaps;
  aprovado: boolean;
}

/** Cria uma sessão e devolve o token em claro (só existe neste momento). */
export async function criarSessao(uid: string, cliente: Cliente): Promise<{ token: string; expiraEm: Date }> {
  const token = gerarToken();
  const expiraEm = new Date(Date.now() + DURACAO[cliente]);
  await adminDb().collection('sessoes').doc(sha256(token)).set({
    uid,
    cliente,
    criadoEm: FieldValue.serverTimestamp(),
    expiraEm: Timestamp.fromDate(expiraEm),
  });
  return { token, expiraEm };
}

function tokenDoPedido(req: Request): { token: string; via: 'cookie' | 'bearer' } | null {
  const auth = req.headers.get('authorization');
  if (auth?.toLowerCase().startsWith('bearer ')) {
    return { token: auth.slice(7).trim(), via: 'bearer' };
  }
  const cookie = req.headers
    .get('cookie')
    ?.split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${COOKIE_SESSAO}=`));
  return cookie ? { token: decodeURIComponent(cookie.slice(COOKIE_SESSAO.length + 1)), via: 'cookie' } : null;
}

/** Lê a sessão do pedido (cookie httpOnly na web, `Authorization: Bearer` na app). */
export async function obterSessao(req: Request): Promise<Sessao | null> {
  const origem = tokenDoPedido(req);
  if (!origem || origem.token.length < 20 || origem.token.length > 100) return null;

  const db = adminDb();
  const id = sha256(origem.token);
  const snap = await db.collection('sessoes').doc(id).get();
  if (!snap.exists) return null;
  const dados = snap.data() as { uid: string; expiraEm: Timestamp };
  if (dados.expiraEm.toMillis() <= Date.now()) {
    await snap.ref.delete();
    return null;
  }

  const userSnap = await db.collection('utilizadores').doc(dados.uid).get();
  if (!userSnap.exists) return null;
  const utilizador = { ...(userSnap.data() as UtilizadorDoc), uid: userSnap.id };
  // Uma conta suspensa perde imediatamente todas as sessões.
  if (utilizador.estado === 'suspenso') {
    await snap.ref.delete();
    return null;
  }
  const aprovado = utilizador.estado === 'aprovado';
  return { id, uid: dados.uid, via: origem.via, utilizador, aprovado, caps: capsOf(aprovado ? utilizador.papel : 'pendente') };
}

/** Exige sessão válida; em mutações por cookie verifica também a origem (CSRF). */
export async function exigirSessao(req: Request, { mutacao = false } = {}): Promise<Sessao> {
  const sessao = await obterSessao(req);
  if (!sessao) throw new ApiError(401, 'nao_autenticado', 'Sessão inválida ou expirada.');
  if (mutacao && sessao.via === 'cookie') verificarOrigem(req);
  return sessao;
}

export function exigirAprovado(sessao: Sessao): void {
  if (!sessao.aprovado) throw new ApiError(403, 'conta_nao_aprovada', 'A conta aguarda aprovação.');
  if (sessao.utilizador.alterarPassword) {
    throw new ApiError(403, 'alterar_password', 'Tem de definir uma nova palavra-passe.');
  }
}

export async function revogarSessao(id: string): Promise<void> {
  await adminDb().collection('sessoes').doc(id).delete();
}

export async function revogarSessoesDe(uid: string): Promise<void> {
  const db = adminDb();
  const snap = await db.collection('sessoes').where('uid', '==', uid).get();
  const batch = db.batch();
  snap.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
}

export function definirCookieSessao(res: NextResponse, token: string, expiraEm: Date): void {
  res.cookies.set(COOKIE_SESSAO, token, {
    httpOnly: true,
    secure: PRODUCAO,
    sameSite: 'lax',
    path: '/',
    expires: expiraEm,
  });
}

export function limparCookieSessao(res: NextResponse): void {
  res.cookies.set(COOKIE_SESSAO, '', { httpOnly: true, secure: PRODUCAO, sameSite: 'lax', path: '/', maxAge: 0 });
}
