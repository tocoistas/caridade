import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '@/server/firebaseAdmin';
import { ApiError, ipDoPedido, json, lerJson, rota } from '@/server/http';
import { HORA, limitar } from '@/server/rateLimit';
import { FORMULARIOS, type TipoFormulario } from '@/server/schemas';

/** Formulários públicos do site (sem autenticação): validação estrita + limite por IP. */
export const POST = rota(async (req: Request, { params }: { params: Promise<{ tipo: string }> }) => {
  const { tipo } = await params;
  if (!Object.hasOwn(FORMULARIOS, tipo)) throw new ApiError(404, 'formulario_desconhecido');
  const def = FORMULARIOS[tipo as TipoFormulario];

  await limitar(`formulario:${tipo}:ip:${ipDoPedido(req)}`, 10, HORA);
  const dados = def.schema.parse(await lerJson(req));

  const ref = await adminDb()
    .collection(def.colecao)
    .add({ ...dados, [def.timestamp]: FieldValue.serverTimestamp() });
  return json({ id: ref.id }, { status: 201 });
});
