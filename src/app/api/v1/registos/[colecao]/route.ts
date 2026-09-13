import { FieldValue } from 'firebase-admin/firestore';
import { ADMIN_COLLECTIONS } from '@/lib/adminCollections';
import { adminDb } from '@/server/firebaseAdmin';
import { ApiError, json, lerJson, rota } from '@/server/http';
import { serializar } from '@/server/respostas';
import { esquemaRegisto } from '@/server/schemas';
import { exigirAprovado, exigirSessao } from '@/server/session';

type Ctx = { params: Promise<{ colecao: string }> };

const LIMITE_LISTA = 1000;

/** Lista registos de uma coleção visível para o papel (mais recentes primeiro). */
export const GET = rota(async (req: Request, { params }: Ctx) => {
  const { colecao } = await params;
  const sessao = await exigirSessao(req);
  exigirAprovado(sessao);
  const config = ADMIN_COLLECTIONS.find((c) => c.id === colecao);
  if (!config) throw new ApiError(404, 'colecao_desconhecida');
  if (!sessao.caps.view.includes(colecao)) throw new ApiError(403, 'sem_permissao');

  const snap = await adminDb().collection(colecao).limit(LIMITE_LISTA).get();
  const ts = (v: unknown) => (v && typeof v === 'object' && 'toMillis' in v ? (v as { toMillis(): number }).toMillis() : 0);
  const registos = snap.docs
    .sort((a, b) => ts(b.get(config.timestampField)) - ts(a.get(config.timestampField)))
    .map((d) => ({ id: d.id, ...(serializar(d.data()) as Record<string, unknown>) }));
  return json({ registos });
});

/** Cria um registo operacional (Eixos 1–3) se o papel o permitir. */
export const POST = rota(async (req: Request, { params }: Ctx) => {
  const { colecao } = await params;
  const sessao = await exigirSessao(req, { mutacao: true });
  exigirAprovado(sessao);
  const def = esquemaRegisto(colecao);
  if (!def) throw new ApiError(404, 'colecao_desconhecida');
  if (!sessao.caps.create.includes(colecao)) throw new ApiError(403, 'sem_permissao');

  const dados = def.schema.parse(await lerJson(req));
  const ref = await adminDb()
    .collection(colecao)
    .add({ ...dados, [def.timestamp]: FieldValue.serverTimestamp(), criadoPor: sessao.uid });
  return json({ id: ref.id }, { status: 201 });
});
