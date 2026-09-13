import { verificarPassword } from '@/server/crypto';
import { ApiError, json, lerJson, rota } from '@/server/http';
import { limitar, MINUTO } from '@/server/rateLimit';
import { eliminarContaSchema } from '@/server/schemas';
import { exigirSessao, limparCookieSessao, revogarSessoesDe } from '@/server/session';
import { eliminarConta } from '@/server/users';

/**
 * Eliminação da própria conta (direito ao apagamento — RGPD art. 17.º).
 * Apaga o perfil, o índice de e-mail e as sessões; anonimiza os pedidos de apoio.
 * Contas de administrador não se eliminam por esta via (evita perder a gestão).
 */
export const DELETE = rota(async (req: Request) => {
  const sessao = await exigirSessao(req, { mutacao: true });
  await limitar(`eliminar:uid:${sessao.uid}`, 5, 15 * MINUTO);
  const { password } = eliminarContaSchema.parse(await lerJson(req));

  if (!(await verificarPassword(password, sessao.utilizador.passwordHash))) {
    throw new ApiError(401, 'credenciais_invalidas', 'Palavra-passe incorrecta.');
  }
  if (sessao.utilizador.papel === 'admin') {
    throw new ApiError(400, 'admin_nao_pode_eliminar', 'Uma conta de administrador não pode ser eliminada por esta via.');
  }

  await eliminarConta(sessao.utilizador);
  await revogarSessoesDe(sessao.uid);
  const res = json({ ok: true });
  limparCookieSessao(res);
  return res;
});
