import { adminDb } from '@/server/firebaseAdmin';
import { ApiError, json, rota } from '@/server/http';
import { exigirAprovado, exigirSessao } from '@/server/session';
import { REFERENCIAS, TIPOS_PESSOA, type TipoPessoa } from '@/lib/referencias';
import type { RoleCaps } from '@/lib/roles';

/**
 * Procura de pessoas cadastradas para ligar a uma acção (selector do painel).
 *
 * Devolve **apenas** id, código e nome — nunca morada, telefone, situação
 * social ou saúde. É o mínimo necessário para escolher a pessoa certa: um
 * voluntário que regista uma entrega tem de identificar quem a recebeu, sem
 * por isso ganhar acesso à ficha do beneficiário.
 */

const LIMITE_LEITURA = 1000;
const MAX_RESULTADOS = 20;
const MIN_TERMO = 2;

/** Pode procurar quem consulta a coleção ou quem cria registos que a referenciam. */
function podeProcurar(caps: RoleCaps, tipo: TipoPessoa): boolean {
  if (caps.view.includes(TIPOS_PESSOA[tipo].colecao)) return true;
  return Object.entries(REFERENCIAS).some(
    ([colecao, refs]) => caps.create.includes(colecao) && refs.some((r) => r.tipo === tipo)
  );
}

/** Normaliza para comparar sem acentos nem maiúsculas. */
function normalizar(valor: string): string {
  return valor
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

export const GET = rota(async (req: Request) => {
  const sessao = await exigirSessao(req);
  exigirAprovado(sessao);

  const url = new URL(req.url);
  const tipo = url.searchParams.get('tipo') as TipoPessoa | null;
  if (!tipo || !Object.hasOwn(TIPOS_PESSOA, tipo)) throw new ApiError(400, 'tipo_desconhecido');
  if (!podeProcurar(sessao.caps, tipo)) throw new ApiError(403, 'sem_permissao');

  const termo = normalizar((url.searchParams.get('q') ?? '').trim());
  if (termo.length < MIN_TERMO) return json({ pessoas: [] });

  const { colecao, campoNome } = TIPOS_PESSOA[tipo];
  const snap = await adminDb().collection(colecao).limit(LIMITE_LEITURA).get();

  const pessoas = snap.docs
    .map((d) => ({
      id: d.id,
      codigo: typeof d.get('codigo') === 'string' ? (d.get('codigo') as string) : '',
      nome: typeof d.get(campoNome) === 'string' ? (d.get(campoNome) as string) : '',
    }))
    .filter((p) => normalizar(p.nome).includes(termo) || normalizar(p.codigo).includes(termo))
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt'))
    .slice(0, MAX_RESULTADOS);

  return json({ pessoas });
});
