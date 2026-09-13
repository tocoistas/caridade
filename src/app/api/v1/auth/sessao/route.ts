import { json, rota } from '@/server/http';
import { exigirSessao } from '@/server/session';
import { publico } from '@/server/users';

/** Utilizador da sessão actual (cookie ou Bearer) com as capacidades do papel. */
export const GET = rota(async (req: Request) => {
  const sessao = await exigirSessao(req);
  return json({ utilizador: publico(sessao.utilizador), capacidades: sessao.caps });
});
