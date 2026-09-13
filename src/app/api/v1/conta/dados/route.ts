import { adminDb } from '@/server/firebaseAdmin';
import { json, rota } from '@/server/http';
import { limitar, MINUTO } from '@/server/rateLimit';
import { serializar } from '@/server/respostas';
import { exigirSessao } from '@/server/session';
import { publico } from '@/server/users';

/**
 * Exportação dos dados do próprio titular (direito de acesso e portabilidade —
 * RGPD arts. 15.º e 20.º). Inclui a conta, os pedidos de apoio e registos de
 * formulários públicos associados ao mesmo e-mail.
 */
export const GET = rota(async (req: Request) => {
  const sessao = await exigirSessao(req);
  await limitar(`exportar:uid:${sessao.uid}`, 10, 60 * MINUTO);
  const db = adminDb();
  const email = sessao.utilizador.email;

  const docs = async (colecao: string, campo: string, valor: string) =>
    (await db.collection(colecao).where(campo, '==', valor).limit(500).get()).docs.map((d) => ({
      id: d.id,
      ...(serializar(d.data()) as Record<string, unknown>),
    }));

  const sessoes = await db.collection('sessoes').where('uid', '==', sessao.uid).get();

  const res = json({
    geradoEm: new Date().toISOString(),
    responsavel: 'Projecto Caridade — info@caridade.ao',
    conta: publico(sessao.utilizador),
    pedidosApoio: await docs('pedidosApoio', 'uid', sessao.uid),
    formularios: {
      voluntarios: await docs('voluntarios', 'email', email),
      beneficiarios: await docs('beneficiarios', 'email', email),
      contactos: await docs('contactos', 'email', email),
      newsletter: await docs('newsletter_subscriptions', 'email', email),
      pedidosTitulares: await docs('pedidosTitulares', 'email', email),
    },
    sessoesActivas: sessoes.docs.map((d) => ({
      cliente: d.get('cliente'),
      criadoEm: serializar(d.get('criadoEm')),
      expiraEm: serializar(d.get('expiraEm')),
    })),
  });
  res.headers.set('Content-Disposition', 'attachment; filename="os-meus-dados-projecto-caridade.json"');
  return res;
});
