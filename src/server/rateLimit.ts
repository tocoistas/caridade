import 'server-only';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { sha256 } from './crypto';
import { adminDb } from './firebaseAdmin';
import { ApiError } from './http';

/**
 * Limite de pedidos por janela fixa, persistido em `limites/{sha256(chave)}`
 * (funciona com várias instâncias do Cloud Run). A chave nunca é guardada em claro.
 * Recomenda-se uma política TTL do Firestore no campo `expiraEm`.
 */
export async function limitar(chave: string, maximo: number, janelaMs: number): Promise<void> {
  const db = adminDb();
  const ref = db.collection('limites').doc(sha256(chave));
  const permitido = await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const agora = Date.now();
    const dados = snap.data() as { inicio: Timestamp; contagem: number } | undefined;
    if (!dados || dados.inicio.toMillis() + janelaMs <= agora) {
      tx.set(ref, {
        inicio: Timestamp.fromMillis(agora),
        contagem: 1,
        expiraEm: Timestamp.fromMillis(agora + janelaMs),
      });
      return true;
    }
    if (dados.contagem >= maximo) return false;
    tx.update(ref, { contagem: FieldValue.increment(1) });
    return true;
  });
  if (!permitido) throw new ApiError(429, 'demasiadas_tentativas', 'Demasiadas tentativas. Tente mais tarde.');
}

export async function limparLimite(chave: string): Promise<void> {
  await adminDb().collection('limites').doc(sha256(chave)).delete();
}

export const MINUTO = 60_000;
export const HORA = 60 * MINUTO;
