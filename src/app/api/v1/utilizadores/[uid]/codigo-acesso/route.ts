import { ApiError, json, rota } from '@/server/http';
import { exigirAprovado, exigirSessao, revogarSessoesDe } from '@/server/session';
import { emitirCodigoAcesso, obterUtilizador } from '@/server/users';

/**
 * Admin emite um código de acesso de uso único (72 h) para primeiro acesso ou
 * reposição de palavra-passe. O código é mostrado UMA vez e entregue por canal
 * seguro fora da plataforma. As sessões activas do utilizador são revogadas.
 */
export const POST = rota(async (req: Request, { params }: { params: Promise<{ uid: string }> }) => {
  const { uid } = await params;
  const sessao = await exigirSessao(req, { mutacao: true });
  exigirAprovado(sessao);
  if (!sessao.caps.canManageUsers) throw new ApiError(403, 'sem_permissao');
  if (uid === sessao.uid) throw new ApiError(400, 'alteracao_propria', 'Use "alterar palavra-passe" para a sua conta.');
  if (!(await obterUtilizador(uid))) throw new ApiError(404, 'nao_encontrado');

  const { codigo, expiraEm } = await emitirCodigoAcesso(uid, sessao.uid);
  await revogarSessoesDe(uid);
  return json({ codigo, expiraEm: expiraEm.toISOString() }, { status: 201 });
});
