import { verificarPassword } from '@/server/crypto';
import { ApiError, ipDoPedido, lerJson, rota } from '@/server/http';
import { limitar, limparLimite, MINUTO } from '@/server/rateLimit';
import { respostaSessao } from '@/server/respostas';
import { loginSchema } from '@/server/schemas';
import { criarSessao } from '@/server/session';
import { procurarPorEmail, registarLogin } from '@/server/users';

export const POST = rota(async (req: Request) => {
  const dados = loginSchema.parse(await lerJson(req));
  const chaveEmail = `login:email:${dados.email}`;
  await limitar(`login:ip:${ipDoPedido(req)}`, 30, 15 * MINUTO);
  await limitar(chaveEmail, 10, 15 * MINUTO);

  const utilizador = await procurarPorEmail(dados.email);
  // verificarPassword corre sempre (hash fictício) para não revelar se o e-mail existe.
  const valida = await verificarPassword(dados.password, utilizador?.passwordHash);
  if (!utilizador || !valida) {
    throw new ApiError(401, 'credenciais_invalidas', 'E-mail ou palavra-passe incorretos.');
  }
  if (utilizador.estado === 'suspenso') {
    throw new ApiError(403, 'conta_suspensa', 'O acesso desta conta foi suspenso.');
  }

  await limparLimite(chaveEmail);
  await registarLogin(utilizador.uid);
  const sessao = await criarSessao(utilizador.uid, dados.cliente);
  return respostaSessao(utilizador, sessao, dados.cliente);
});
