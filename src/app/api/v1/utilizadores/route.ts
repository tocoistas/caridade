import { ApiError, json, rota } from '@/server/http';
import { exigirAprovado, exigirSessao } from '@/server/session';
import { listarUtilizadores } from '@/server/users';

export const GET = rota(async (req: Request) => {
  const sessao = await exigirSessao(req);
  exigirAprovado(sessao);
  if (!sessao.caps.canManageUsers) throw new ApiError(403, 'sem_permissao');
  return json({ utilizadores: await listarUtilizadores() });
});
