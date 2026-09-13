import { hashPassword } from '@/server/crypto';
import { ipDoPedido, lerJson, rota } from '@/server/http';
import { limitar, MINUTO } from '@/server/rateLimit';
import { respostaSessao } from '@/server/respostas';
import { definirPasswordSchema } from '@/server/schemas';
import { criarSessao, revogarSessoesDe } from '@/server/session';
import { definirPasswordComCodigo } from '@/server/users';

/** Primeiro acesso / reposição: código de uso único emitido pelo admin + nova palavra-passe. */
export const POST = rota(async (req: Request) => {
  const dados = definirPasswordSchema.parse(await lerJson(req));
  await limitar(`codigo:ip:${ipDoPedido(req)}`, 20, 15 * MINUTO);
  await limitar(`codigo:email:${dados.email}`, 5, 15 * MINUTO);

  const utilizador = await definirPasswordComCodigo(dados.email, dados.codigo, await hashPassword(dados.novaPassword));
  await revogarSessoesDe(utilizador.uid);
  const sessao = await criarSessao(utilizador.uid, dados.cliente);
  return respostaSessao(utilizador, sessao, dados.cliente);
});
