/**
 * Cliente HTTP da API interna (`/api/v1`) para componentes do browser.
 * A sessão viaja num cookie httpOnly definido pelo servidor — o JavaScript
 * da página nunca vê o token.
 */

const MENSAGENS: Record<string, string> = {
  dados_invalidos: 'Verifique os campos preenchidos.',
  demasiadas_tentativas: 'Demasiadas tentativas. Tente novamente mais tarde.',
  nao_autenticado: 'A sessão expirou. Inicie sessão novamente.',
  conta_nao_aprovada: 'A sua conta aguarda aprovação.',
  sem_permissao: 'Não tem permissão para esta operação.',
  origem_invalida: 'Pedido recusado por motivos de segurança. Recarregue a página.',
  nao_encontrado: 'Registo não encontrado.',
  erro_interno: 'Ocorreu um erro inesperado. Tente novamente.',
};

export class ApiErro extends Error {
  constructor(
    public readonly status: number,
    public readonly codigo: string,
    mensagem: string,
    public readonly campos: string[] = []
  ) {
    super(mensagem);
  }
}

export async function api<T = unknown>(
  caminho: string,
  { method, body }: { method?: string; body?: unknown } = {}
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`/api/v1${caminho}`, {
      method: method ?? (body === undefined ? 'GET' : 'POST'),
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
      credentials: 'same-origin',
      cache: 'no-store',
    });
  } catch {
    throw new ApiErro(0, 'sem_ligacao', 'Sem ligação. Verifique a internet e tente novamente.');
  }

  const data = (await res.json().catch(() => ({}))) as {
    erro?: string;
    mensagem?: string;
    campos?: string[];
  };
  if (!res.ok) {
    const codigo = data.erro ?? 'erro';
    const mensagem =
      data.mensagem && data.mensagem !== codigo
        ? data.mensagem
        : MENSAGENS[codigo] ?? 'Não foi possível concluir a operação. Tente novamente.';
    throw new ApiErro(res.status, codigo, mensagem, data.campos);
  }
  return data as T;
}
