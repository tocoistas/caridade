import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '@/server/firebaseAdmin';
import { ApiError, json, lerJson, rota } from '@/server/http';
import { ESTADOS, estadoSchema } from '@/server/schemas';
import { exigirAprovado, exigirSessao } from '@/server/session';

/** Altera o estado de um registo com fluxo (pedidos de apoio, pedidos de titulares). */
export const PATCH = rota(
  async (req: Request, { params }: { params: Promise<{ colecao: string; id: string }> }) => {
    const { colecao, id } = await params;
    const sessao = await exigirSessao(req, { mutacao: true });
    exigirAprovado(sessao);

    const fluxo = ESTADOS[colecao as keyof typeof ESTADOS];
    if (!fluxo) throw new ApiError(404, 'colecao_desconhecida');
    if (!(fluxo.papeis as readonly string[]).includes(sessao.utilizador.papel)) throw new ApiError(403, 'sem_permissao');

    const { estado } = estadoSchema.parse(await lerJson(req));
    if (!(fluxo.valores as readonly string[]).includes(estado)) throw new ApiError(400, 'estado_invalido');

    const ref = adminDb().collection(colecao).doc(id);
    if (!(await ref.get()).exists) throw new ApiError(404, 'nao_encontrado');
    await ref.update({ estado, actualizadoPor: sessao.uid, actualizadoEm: FieldValue.serverTimestamp() });
    return json({ ok: true });
  }
);
