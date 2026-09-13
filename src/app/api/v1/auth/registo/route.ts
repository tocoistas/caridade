import { hashPassword } from '@/server/crypto';
import { ipDoPedido, lerJson, rota } from '@/server/http';
import { HORA, limitar } from '@/server/rateLimit';
import { respostaSessao } from '@/server/respostas';
import { registoSchema } from '@/server/schemas';
import { criarSessao } from '@/server/session';
import { criarUtilizador } from '@/server/users';

/** Auto-registo: a conta nasce SEMPRE pendente; o papel pretendido é só uma sugestão para o admin. */
export const POST = rota(async (req: Request) => {
  await limitar(`registo:ip:${ipDoPedido(req)}`, 5, HORA);
  const dados = registoSchema.parse(await lerJson(req));

  const utilizador = await criarUtilizador({
    nomeCompleto: dados.nome,
    email: dados.email,
    passwordHash: await hashPassword(dados.password),
    papel: 'pendente',
    estado: 'pendente',
    papelPretendido: dados.papelPretendido,
  });

  const sessao = await criarSessao(utilizador.uid, dados.cliente);
  return respostaSessao(utilizador, sessao, dados.cliente, 201);
});
