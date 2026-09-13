import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { VERSAO_POLITICA } from '@/lib/privacidade';
import { adminDb } from '@/server/firebaseAdmin';
import { ApiError, ipDoPedido, json, lerJson, rota } from '@/server/http';
import { HORA, limitar } from '@/server/rateLimit';
import { FORMULARIOS, type TipoFormulario } from '@/server/schemas';
import { obterSessao } from '@/server/session';

const PRAZO_RESPOSTA_MS = 30 * 24 * 60 * 60 * 1000;

/** Formulários públicos do site (sem autenticação): validação estrita + limite por IP. */
export const POST = rota(async (req: Request, { params }: { params: Promise<{ tipo: string }> }) => {
  const { tipo } = await params;
  if (!Object.hasOwn(FORMULARIOS, tipo)) throw new ApiError(404, 'formulario_desconhecido');
  const def = FORMULARIOS[tipo as TipoFormulario];

  // A equipa aprovada (ex.: app no terreno) regista muitos cadastros a partir do mesmo IP.
  const sessao = await obterSessao(req);
  const equipa = Boolean(sessao?.aprovado && sessao.caps.create.length > 0);
  if (!equipa) await limitar(`formulario:${tipo}:ip:${ipDoPedido(req)}`, tipo === 'direitos' ? 5 : 10, HORA);
  const dados = def.schema.parse(await lerJson(req)) as Record<string, unknown>;

  // Os indicadores de consentimento são substituídos por prova versionada gravada pelo servidor.
  const { consent, consentSensitive, ...campos } = dados;
  const registo: Record<string, unknown> = { ...campos, [def.timestamp]: FieldValue.serverTimestamp() };
  if (consent === true) {
    registo.consentVersion = VERSAO_POLITICA;
    registo.consentAt = FieldValue.serverTimestamp();
  }
  if (consentSensitive === true) registo.consentSensitive = true;
  if (tipo === 'direitos') {
    registo.estado = 'novo';
    registo.prazoResposta = Timestamp.fromMillis(Date.now() + PRAZO_RESPOSTA_MS);
  }
  if (equipa && sessao) registo.registadoPor = sessao.uid;

  const ref = await adminDb().collection(def.colecao).add(registo);
  return json({ id: ref.id }, { status: 201 });
});
