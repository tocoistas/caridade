import { ApiError, json, lerJson, rota } from '@/server/http';
import { gestaoUtilizadorSchema } from '@/server/schemas';
import { exigirAprovado, exigirSessao, revogarSessoesDe } from '@/server/session';
import { actualizarGestao, publico } from '@/server/users';

/** Admin aprova, muda o papel, suspende ou reactiva uma conta. */
export const PATCH = rota(async (req: Request, { params }: { params: Promise<{ uid: string }> }) => {
  const { uid } = await params;
  const sessao = await exigirSessao(req, { mutacao: true });
  exigirAprovado(sessao);
  if (!sessao.caps.canManageUsers) throw new ApiError(403, 'sem_permissao');
  // Evita que o único admin se bloqueie a si próprio.
  if (uid === sessao.uid) throw new ApiError(400, 'alteracao_propria', 'Não pode alterar a sua própria conta.');

  const alteracoes = gestaoUtilizadorSchema.parse(await lerJson(req));
  const utilizador = await actualizarGestao(uid, alteracoes, sessao.uid);
  if (alteracoes.estado === 'suspenso' || alteracoes.papel) await revogarSessoesDe(uid);
  return json({ utilizador: publico(utilizador) });
});
