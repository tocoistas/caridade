import { hashPassword, verificarPassword } from '@/server/crypto';
import { ApiError, lerJson, rota } from '@/server/http';
import { limitar, MINUTO } from '@/server/rateLimit';
import { respostaSessao } from '@/server/respostas';
import { alterarPasswordSchema } from '@/server/schemas';
import { criarSessao, exigirSessao, revogarSessoesDe } from '@/server/session';
import { definirPassword, obterUtilizador } from '@/server/users';

/** Troca de palavra-passe da sessão actual; revoga todas as outras sessões. */
export const POST = rota(async (req: Request) => {
  const sessao = await exigirSessao(req, { mutacao: true });
  await limitar(`alterar:uid:${sessao.uid}`, 10, 15 * MINUTO);
  const dados = alterarPasswordSchema.parse(await lerJson(req));

  if (!(await verificarPassword(dados.actual, sessao.utilizador.passwordHash))) {
    throw new ApiError(401, 'credenciais_invalidas', 'A palavra-passe actual está incorrecta.');
  }
  if (dados.actual === dados.nova) {
    throw new ApiError(400, 'password_igual', 'A nova palavra-passe tem de ser diferente.');
  }

  await definirPassword(sessao.uid, await hashPassword(dados.nova));
  await revogarSessoesDe(sessao.uid);
  const cliente = sessao.via === 'bearer' ? 'app' : 'web';
  const nova = await criarSessao(sessao.uid, cliente);
  return respostaSessao((await obterUtilizador(sessao.uid))!, nova, cliente);
});
