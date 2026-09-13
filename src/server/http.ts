import 'server-only';
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

/** Erro de API com código estável (consumido pela web e pela app Android). */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly codigo: string,
    mensagem?: string
  ) {
    super(mensagem ?? codigo);
  }
}

export function json(data: unknown, init: ResponseInit = {}): NextResponse {
  const res = NextResponse.json(data, init);
  res.headers.set('Cache-Control', 'no-store');
  return res;
}

type Handler<C> = (req: Request, ctx: C) => Promise<Response>;

/** Envolve um route handler: converte erros em respostas JSON sem expor detalhes internos. */
export function rota<C>(fn: Handler<C>): Handler<C> {
  return async (req, ctx) => {
    try {
      return await fn(req, ctx);
    } catch (err) {
      if (err instanceof ApiError) {
        const res = json({ erro: err.codigo, mensagem: err.message }, { status: err.status });
        if (err.status === 401) res.headers.set('WWW-Authenticate', 'Bearer realm="caridade"');
        return res;
      }
      if (err instanceof ZodError) {
        return json(
          { erro: 'dados_invalidos', campos: [...new Set(err.issues.map((i) => i.path.join('.')))] },
          { status: 400 }
        );
      }
      // Não registar corpo do pedido nem dados pessoais.
      console.error('[api] erro interno:', err instanceof Error ? `${err.name}: ${err.message}` : 'desconhecido');
      return json({ erro: 'erro_interno' }, { status: 500 });
    }
  };
}

const LIMITE_CORPO = 64 * 1024;

/** Lê e faz parse do corpo JSON com limite de tamanho. */
export async function lerJson(req: Request): Promise<unknown> {
  const tipo = req.headers.get('content-type') ?? '';
  if (!tipo.includes('application/json')) throw new ApiError(415, 'tipo_nao_suportado');
  const texto = await req.text();
  if (texto.length > LIMITE_CORPO) throw new ApiError(413, 'pedido_demasiado_grande');
  try {
    return JSON.parse(texto);
  } catch {
    throw new ApiError(400, 'json_invalido');
  }
}

/** IP do cliente (primeiro salto de X-Forwarded-For, definido pelo proxy do Cloud Run). */
export function ipDoPedido(req: Request): string {
  const xff = req.headers.get('x-forwarded-for');
  return (xff?.split(',')[0] ?? req.headers.get('x-real-ip') ?? 'desconhecido').trim();
}

/**
 * Protecção CSRF para pedidos autenticados por cookie: a origem tem de ser o
 * próprio site. (Pedidos com Bearer token — app — não usam cookies.)
 */
export function verificarOrigem(req: Request): void {
  const origin = req.headers.get('origin');
  const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host');
  if (!origin || !host) throw new ApiError(403, 'origem_invalida');
  try {
    if (new URL(origin).host !== host) throw new ApiError(403, 'origem_invalida');
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(403, 'origem_invalida');
  }
}
