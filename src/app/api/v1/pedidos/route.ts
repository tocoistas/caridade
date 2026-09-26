import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '@/server/firebaseAdmin';
import { ApiError, json, lerJson, rota } from '@/server/http';
import { HORA, limitar } from '@/server/rateLimit';
import { serializar } from '@/server/respostas';
import { pedidoSchema } from '@/server/schemas';
import { exigirAprovado, exigirSessao } from '@/server/session';
import { TIPOS_PESSOA } from '@/lib/referencias';

/**
 * Cadastro de beneficiário correspondente ao e-mail da conta, se existir.
 * Liga o pedido ao registo para os relatórios poderem contar pessoas (por
 * código) em vez de nomes repetidos.
 */
async function cadastroDoBeneficiario(email: string) {
  const snap = await adminDb()
    .collection(TIPOS_PESSOA.beneficiario.colecao)
    .where('email', '==', email)
    .limit(1)
    .get();
  const doc = snap.docs[0];
  return doc ? { id: doc.id, codigo: typeof doc.get('codigo') === 'string' ? (doc.get('codigo') as string) : '' } : null;
}

/** Beneficiário: os seus pedidos. Gestão: todos. */
export const GET = rota(async (req: Request) => {
  const sessao = await exigirSessao(req);
  exigirAprovado(sessao);
  const col = adminDb().collection('pedidosApoio');

  let snap;
  if (sessao.caps.personalArea) snap = await col.where('uid', '==', sessao.uid).get();
  else if (sessao.caps.view.includes('pedidosApoio')) snap = await col.limit(1000).get();
  else throw new ApiError(403, 'sem_permissao');

  const pedidos = snap.docs
    .map((d): Record<string, unknown> => ({ ...(serializar(d.data()) as Record<string, unknown>), id: d.id }))
    .sort((a, b) => String(b.criadoEm ?? '').localeCompare(String(a.criadoEm ?? '')));
  return json({ pedidos });
});

/** Só beneficiários aprovados criam pedidos, sempre em nome próprio e no estado "novo". */
export const POST = rota(async (req: Request) => {
  const sessao = await exigirSessao(req, { mutacao: true });
  exigirAprovado(sessao);
  if (!sessao.caps.personalArea) throw new ApiError(403, 'sem_permissao');
  await limitar(`pedido:uid:${sessao.uid}`, 20, HORA);
  const dados = pedidoSchema.parse(await lerJson(req));
  const cadastro = await cadastroDoBeneficiario(sessao.utilizador.email);

  const ref = await adminDb().collection('pedidosApoio').add({
    uid: sessao.uid,
    nomeBeneficiario: sessao.utilizador.nomeCompleto,
    email: sessao.utilizador.email,
    beneficiarioId: cadastro?.id ?? '',
    beneficiarioCodigo: cadastro?.codigo ?? '',
    titulo: dados.titulo,
    descricao: dados.descricao,
    estado: 'novo',
    criadoEm: FieldValue.serverTimestamp(),
  });
  return json({ id: ref.id }, { status: 201 });
});
