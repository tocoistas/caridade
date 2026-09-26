import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '@/server/firebaseAdmin';
import { ApiError, json, lerJson, rota } from '@/server/http';
import { serializar } from '@/server/respostas';
import { relatorioPublicoSchema } from '@/server/schemas';
import { exigirAprovado, exigirSessao } from '@/server/session';

const COLECAO = 'relatoriosPublicos';

/**
 * Relatório público publicado no site (`/transparencia`).
 *
 * Só contém indicadores agregados, já filtrados pelo gerador de relatórios: o
 * corpo aceite não tem qualquer campo com dados pessoais.
 */
export const GET = rota(async () => {
  const snap = await adminDb().collection(COLECAO).where('estado', '==', 'publicado').limit(50).get();
  const relatorios = snap.docs
    .map((d): Record<string, unknown> => ({ id: d.id, ...(serializar(d.data()) as Record<string, unknown>) }))
    .sort((a, b) => String(b.publicadoEm ?? '').localeCompare(String(a.publicadoEm ?? '')));
  return json({ relatorios });
});

/** Publicar exige a capacidade de relatórios (admin ou coordenador). */
export const POST = rota(async (req: Request) => {
  const sessao = await exigirSessao(req, { mutacao: true });
  exigirAprovado(sessao);
  if (!sessao.caps.relatorios) throw new ApiError(403, 'sem_permissao');

  const dados = relatorioPublicoSchema.parse(await lerJson(req));
  const db = adminDb();

  // Só um relatório público em vigor: o anterior é arquivado, não apagado.
  const anteriores = await db.collection(COLECAO).where('estado', '==', 'publicado').get();
  const lote = db.batch();
  for (const doc of anteriores.docs) lote.update(doc.ref, { estado: 'arquivado' });
  const novo = db.collection(COLECAO).doc();
  lote.set(novo, {
    ...dados,
    periodoInicio: Timestamp.fromDate(new Date(dados.periodoInicio)),
    periodoFim: Timestamp.fromDate(new Date(dados.periodoFim)),
    estado: 'publicado',
    publicadoEm: FieldValue.serverTimestamp(),
    publicadoPor: sessao.uid,
  });
  await lote.commit();

  return json({ id: novo.id }, { status: 201 });
});
