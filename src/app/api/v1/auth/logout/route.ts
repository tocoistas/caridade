import { json, rota, verificarOrigem } from '@/server/http';
import { limparCookieSessao, obterSessao, revogarSessao } from '@/server/session';

export const POST = rota(async (req: Request) => {
  const sessao = await obterSessao(req);
  if (sessao) {
    if (sessao.via === 'cookie') verificarOrigem(req);
    await revogarSessao(sessao.id);
  }
  const res = json({ ok: true });
  limparCookieSessao(res);
  return res;
});
