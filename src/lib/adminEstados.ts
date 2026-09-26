/**
 * Estados dos registos no painel: que valores existem, quem os pode alterar e
 * com que cor são apresentados.
 *
 * Espelha `ESTADOS` em `src/server/schemas.ts` — a UI restringe, o servidor impõe.
 */

export interface EstadosColeccao {
  /** Valores possíveis, por ordem de progressão. */
  valores: string[];
  /** Papéis autorizados a alterar o estado a partir do painel. */
  papeis: string[];
}

export const ESTADOS_POR_COLECCAO: Record<string, EstadosColeccao> = {
  pedidosApoio: { valores: ['novo', 'em_analise', 'resolvido'], papeis: ['admin', 'coordenador'] },
  pedidosTitulares: { valores: ['novo', 'em_curso', 'concluido', 'recusado'], papeis: ['admin'] },
};

export const ESTADO_LABELS: Record<string, string> = {
  novo: 'Novo',
  em_analise: 'Em análise',
  em_curso: 'Em curso',
  resolvido: 'Resolvido',
  concluido: 'Concluído',
  recusado: 'Recusado',
  aprovado: 'Aprovado',
  pendente: 'Pendente',
  suspenso: 'Suspenso',
};

/** Classes Tailwind do distintivo de cada estado. */
export const ESTADO_CLASSES: Record<string, string> = {
  novo: 'bg-amber-100 text-amber-800 ring-amber-200',
  pendente: 'bg-amber-100 text-amber-800 ring-amber-200',
  em_analise: 'bg-blue-100 text-blue-800 ring-blue-200',
  em_curso: 'bg-blue-100 text-blue-800 ring-blue-200',
  resolvido: 'bg-green-100 text-green-800 ring-green-200',
  concluido: 'bg-green-100 text-green-800 ring-green-200',
  aprovado: 'bg-green-100 text-green-800 ring-green-200',
  recusado: 'bg-red-100 text-red-800 ring-red-200',
  suspenso: 'bg-red-100 text-red-800 ring-red-200',
};

export function etiquetaEstado(valor: string): string {
  return ESTADO_LABELS[valor] ?? valor;
}

export function classesEstado(valor: string): string {
  return ESTADO_CLASSES[valor] ?? 'bg-creme-escuro text-petroleo ring-creme-escuro';
}

/** Estados que exigem acção da equipa (contabilizados na visão geral). */
export const ESTADOS_POR_TRATAR = new Set(['novo', 'em_analise', 'em_curso', 'pendente']);
