import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '@/server/firebaseAdmin';
import { ApiError, json, lerJson, rota } from '@/server/http';
import { estadoPedidoSchema } from '@/server/schemas';
import { exigirAprovado, exigirSessao } from '@/server/session';

/** Gestão (admin/coordenador) altera apenas o estado de um pedido. */
export const PATCH = rota(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const sessao = await exigirSessao(req, { mutacao: true });
  exigirAprovado(sessao);
  if (!['admin', 'coordenador'].includes(sessao.utilizador.papel)) throw new ApiError(403, 'sem_permissao');

  const { estado } = estadoPedidoSchema.parse(await lerJson(req));
  const ref = adminDb().collection('pedidosApoio').doc(id);
  if (!(await ref.get()).exists) throw new ApiError(404, 'nao_encontrado');
  await ref.update({ estado, actualizadoPor: sessao.uid, actualizadoEm: FieldValue.serverTimestamp() });
  return json({ ok: true });
});
