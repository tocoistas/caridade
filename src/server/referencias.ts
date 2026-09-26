import 'server-only';
import { adminDb } from '@/server/firebaseAdmin';
import { ApiError } from '@/server/http';
import { REFERENCIAS, TIPOS_PESSOA, type DefReferencia } from '@/lib/referencias';

/**
 * Resolve as referências de um registo operacional.
 *
 * O cliente envia apenas o id do registo referido; o servidor confirma que
 * existe e escreve o código e o nome a partir dele. Um código ou nome enviados
 * pelo cliente são ignorados — caso contrário uma lista podia mostrar um nome
 * que não corresponde ao código.
 */
export async function resolverReferencias(
  colecao: string,
  dados: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const definicoes = REFERENCIAS[colecao];
  if (!definicoes?.length) return dados;

  const resultado = { ...dados };
  for (const def of definicoes) {
    const id = typeof dados[def.campoId] === 'string' ? (dados[def.campoId] as string).trim() : '';
    if (!id) {
      // Sem referência: os campos derivados ficam como o cliente os deixou
      // (texto livre), para não quebrar registos criados pela app.
      resultado[def.campoId] = '';
      continue;
    }
    const pessoa = await lerPessoa(def, id);
    resultado[def.campoId] = id;
    resultado[def.campoCodigo] = pessoa.codigo;
    resultado[def.campoNome] = pessoa.nome;
  }
  return resultado;
}

async function lerPessoa(def: DefReferencia, id: string): Promise<{ codigo: string; nome: string }> {
  const { colecao, campoNome } = TIPOS_PESSOA[def.tipo];
  const doc = await adminDb().collection(colecao).doc(id).get();
  if (!doc.exists) throw new ApiError(400, 'referencia_invalida', `${def.label}: registo não encontrado.`);
  const dados = doc.data() ?? {};
  return {
    codigo: typeof dados.codigo === 'string' ? dados.codigo : '',
    nome: typeof dados[campoNome] === 'string' ? (dados[campoNome] as string) : '',
  };
}
