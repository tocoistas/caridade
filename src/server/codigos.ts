import 'server-only';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '@/server/firebaseAdmin';
import { TIPO_POR_COLECAO, TIPOS_PESSOA } from '@/lib/referencias';

/**
 * Códigos de identificação das pessoas cadastradas (`BEN-2026-0001`).
 *
 * A sequência é por prefixo e por ano, num contador próprio actualizado numa
 * transacção — dois cadastros simultâneos nunca recebem o mesmo código.
 */

const LARGURA = 4;

/** Gera o próximo código do prefixo no ano corrente. */
export async function gerarCodigo(prefixo: string, agora = new Date()): Promise<string> {
  const ano = agora.getUTCFullYear();
  const ref = adminDb().collection('contadores').doc(`${prefixo}-${ano}`);

  const valor = await adminDb().runTransaction(async (tx) => {
    const doc = await tx.get(ref);
    const proximo = ((doc.data()?.valor as number | undefined) ?? 0) + 1;
    tx.set(
      ref,
      { prefixo, ano, valor: proximo, actualizadoEm: FieldValue.serverTimestamp() },
      { merge: true }
    );
    return proximo;
  });

  return `${prefixo}-${ano}-${String(valor).padStart(LARGURA, '0')}`;
}

/**
 * Código para um registo de uma coleção de pessoas, ou `null` se a coleção não
 * tiver códigos (contactos, newsletter, registos operacionais…).
 */
export async function gerarCodigoDaColecao(colecao: string): Promise<string | null> {
  const tipo = TIPO_POR_COLECAO[colecao];
  return tipo ? gerarCodigo(TIPOS_PESSOA[tipo].prefixo) : null;
}
