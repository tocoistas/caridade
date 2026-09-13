import 'server-only';
import { timingSafeEqual } from 'node:crypto';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import type { Papel } from '@/lib/roles';
import { gerarCodigoAcesso, normalizarCodigo, sha256 } from './crypto';
import { adminDb } from './firebaseAdmin';
import { ApiError } from './http';

export type Estado = 'pendente' | 'aprovado' | 'suspenso';
export type PapelPretendido = 'beneficiario' | 'voluntario' | 'profissional';

/** Documento `utilizadores/{uid}` — nunca devolver directamente ao cliente (contém hashes). */
export interface UtilizadorDoc {
  uid: string;
  email: string;
  nomeCompleto: string;
  fotoUrl?: string | null;
  papel: Papel;
  papelPretendido?: PapelPretendido | '';
  estado: Estado;
  aprovadoPor?: string;
  aprovadoEm?: Timestamp | null;
  criadoEm?: Timestamp | null;
  passwordHash?: string | null;
  alterarPassword?: boolean;
  codigoAcessoHash?: string | null;
  codigoAcessoExpiraEm?: Timestamp | null;
  codigoAcessoEmitidoPor?: string | null;
  ultimoLoginEm?: Timestamp | null;
}

/** Vista segura do utilizador para a API. */
export interface UtilizadorPublico {
  uid: string;
  email: string;
  nomeCompleto: string;
  papel: Papel;
  papelPretendido: string;
  estado: Estado;
  alterarPassword: boolean;
  temPassword: boolean;
  codigoAcessoPendente: boolean;
  criadoEm: string | null;
  aprovadoEm: string | null;
  ultimoLoginEm: string | null;
}

const iso = (t?: Timestamp | null) => (t && typeof t.toDate === 'function' ? t.toDate().toISOString() : null);

export function publico(u: UtilizadorDoc): UtilizadorPublico {
  return {
    uid: u.uid,
    email: u.email,
    nomeCompleto: u.nomeCompleto ?? '',
    papel: u.papel ?? 'pendente',
    papelPretendido: u.papelPretendido ?? '',
    estado: u.estado ?? 'pendente',
    alterarPassword: Boolean(u.alterarPassword),
    temPassword: Boolean(u.passwordHash),
    codigoAcessoPendente: Boolean(u.codigoAcessoHash && u.codigoAcessoExpiraEm && u.codigoAcessoExpiraEm.toMillis() > Date.now()),
    criadoEm: iso(u.criadoEm),
    aprovadoEm: iso(u.aprovadoEm),
    ultimoLoginEm: iso(u.ultimoLoginEm),
  };
}

export const normalizarEmail = (email: string) => email.trim().toLowerCase();

const utilizadores = () => adminDb().collection('utilizadores');
const emails = () => adminDb().collection('emails');

export async function obterUtilizador(uid: string): Promise<UtilizadorDoc | null> {
  const snap = await utilizadores().doc(uid).get();
  return snap.exists ? { ...(snap.data() as UtilizadorDoc), uid: snap.id } : null;
}

/** Procura pelo índice único `emails/{email}`; perfis migrados sem índice são encontrados por query. */
export async function procurarPorEmail(email: string): Promise<UtilizadorDoc | null> {
  const e = normalizarEmail(email);
  const idx = await emails().doc(e).get();
  let uid = idx.exists ? (idx.data() as { uid: string }).uid : null;
  if (!uid) {
    const q = await utilizadores().where('email', '==', e).limit(1).get();
    uid = q.empty ? null : q.docs[0].id;
  }
  return uid ? obterUtilizador(uid) : null;
}

export async function criarUtilizador(dados: {
  nomeCompleto: string;
  email: string;
  passwordHash: string;
  papel: Papel;
  estado: Estado;
  papelPretendido?: PapelPretendido | '';
  consentVersion?: string;
}): Promise<UtilizadorDoc> {
  const email = normalizarEmail(dados.email);
  if (await procurarPorEmail(email)) throw new ApiError(409, 'email_em_uso', 'Já existe uma conta com este e-mail.');

  const ref = utilizadores().doc();
  await adminDb().runTransaction(async (tx) => {
    const idxRef = emails().doc(email);
    if ((await tx.get(idxRef)).exists) throw new ApiError(409, 'email_em_uso', 'Já existe uma conta com este e-mail.');
    tx.create(idxRef, { uid: ref.id, criadoEm: FieldValue.serverTimestamp() });
    tx.create(ref, {
      uid: ref.id,
      email,
      nomeCompleto: dados.nomeCompleto,
      fotoUrl: null,
      papel: dados.papel,
      papelPretendido: dados.papelPretendido ?? '',
      estado: dados.estado,
      passwordHash: dados.passwordHash,
      alterarPassword: false,
      ...(dados.consentVersion ? { consentVersion: dados.consentVersion, consentAt: FieldValue.serverTimestamp() } : {}),
      criadoEm: FieldValue.serverTimestamp(),
    });
  });
  return (await obterUtilizador(ref.id))!;
}

const VALIDADE_CODIGO_MS = 72 * 60 * 60 * 1000;

/** Emite um código de acesso de uso único (primeiro acesso / reposição). Devolve-o em claro uma única vez. */
export async function emitirCodigoAcesso(uid: string, emitidoPor: string): Promise<{ codigo: string; expiraEm: Date }> {
  const codigo = gerarCodigoAcesso();
  const expiraEm = new Date(Date.now() + VALIDADE_CODIGO_MS);
  await utilizadores().doc(uid).update({
    codigoAcessoHash: sha256(normalizarCodigo(codigo)),
    codigoAcessoExpiraEm: Timestamp.fromDate(expiraEm),
    codigoAcessoEmitidoPor: emitidoPor,
  });
  return { codigo, expiraEm };
}

function hashIgual(a: string, b: string): boolean {
  const ba = Buffer.from(a, 'hex');
  const bb = Buffer.from(b, 'hex');
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

/** Valida o código (uso único, com validade) e define a nova palavra-passe. */
export async function definirPasswordComCodigo(email: string, codigo: string, passwordHash: string): Promise<UtilizadorDoc> {
  const u = await procurarPorEmail(email);
  const valido =
    u?.codigoAcessoHash &&
    u.codigoAcessoExpiraEm &&
    u.codigoAcessoExpiraEm.toMillis() > Date.now() &&
    hashIgual(u.codigoAcessoHash, sha256(normalizarCodigo(codigo)));
  if (!u || !valido) throw new ApiError(400, 'codigo_invalido', 'Código inválido ou expirado.');
  if (u.estado === 'suspenso') throw new ApiError(403, 'conta_suspensa', 'Conta suspensa.');

  const email_ = normalizarEmail(u.email);
  await adminDb().runTransaction(async (tx) => {
    const idxRef = emails().doc(email_);
    const idx = await tx.get(idxRef);
    if (!idx.exists) tx.create(idxRef, { uid: u.uid, criadoEm: FieldValue.serverTimestamp() });
    tx.update(utilizadores().doc(u.uid), {
      email: email_,
      passwordHash,
      alterarPassword: false,
      codigoAcessoHash: FieldValue.delete(),
      codigoAcessoExpiraEm: FieldValue.delete(),
      codigoAcessoEmitidoPor: FieldValue.delete(),
    });
  });
  return (await obterUtilizador(u.uid))!;
}

export async function definirPassword(uid: string, passwordHash: string): Promise<void> {
  await utilizadores().doc(uid).update({ passwordHash, alterarPassword: false });
}

export async function registarLogin(uid: string): Promise<void> {
  await utilizadores().doc(uid).update({ ultimoLoginEm: FieldValue.serverTimestamp() });
}

export async function listarUtilizadores(): Promise<UtilizadorPublico[]> {
  const snap = await utilizadores().get();
  return snap.docs
    .map((d) => publico({ ...(d.data() as UtilizadorDoc), uid: d.id }))
    .sort((a, b) => (b.criadoEm ?? '').localeCompare(a.criadoEm ?? ''));
}

export async function actualizarGestao(
  uid: string,
  alteracoes: { papel?: Papel; estado?: Estado },
  porUid: string
): Promise<UtilizadorDoc> {
  const ref = utilizadores().doc(uid);
  if (!(await ref.get()).exists) throw new ApiError(404, 'nao_encontrado');
  await ref.update({ ...alteracoes, aprovadoPor: porUid, aprovadoEm: FieldValue.serverTimestamp() });
  return (await obterUtilizador(uid))!;
}

/**
 * Elimina a conta do próprio titular (RGPD art. 17.º): apaga o perfil e o índice de
 * e-mail e anonimiza os pedidos de apoio (mantidos só para estatística agregada).
 * As sessões são revogadas pela rota.
 */
export async function eliminarConta(u: UtilizadorDoc): Promise<void> {
  const db = adminDb();
  const pedidos = await db.collection('pedidosApoio').where('uid', '==', u.uid).get();
  const batch = db.batch();
  for (const d of pedidos.docs) {
    batch.update(d.ref, {
      uid: 'eliminado',
      nomeBeneficiario: '',
      email: '',
      descricao: '[eliminado a pedido do titular]',
      anonimizadoEm: FieldValue.serverTimestamp(),
    });
  }
  batch.delete(utilizadores().doc(u.uid));
  batch.delete(emails().doc(normalizarEmail(u.email)));
  await batch.commit();
}
