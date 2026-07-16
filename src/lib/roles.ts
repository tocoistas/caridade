// Papéis e respetivas capacidades no portal interno.
//
// O portal (/admin) é partilhado por todos os papéis; cada um vê apenas as
// secções e ações permitidas. Este mapa deve manter-se alinhado com
// `firestore.rules` — a UI restringe, as regras impõem.

import { ADMIN_COLLECTIONS } from './adminCollections';

export type Papel =
  | 'admin'
  | 'coordenador'
  | 'voluntario'
  | 'profissional'
  | 'beneficiario'
  | 'pendente';

/** Papéis que um novo utilizador pode pedir no auto-registo. */
export const PAPEIS_REGISTO: { value: Exclude<Papel, 'admin' | 'coordenador' | 'pendente'>; label: string; desc: string }[] = [
  { value: 'beneficiario', label: 'Beneficiário', desc: 'Preciso de apoio e quero acompanhar os meus pedidos.' },
  { value: 'voluntario', label: 'Voluntário', desc: 'Quero ajudar nas campanhas, stock e distribuições.' },
  { value: 'profissional', label: 'Profissional', desc: 'Sou profissional de saúde e quero apoiar o Eixo 2.' },
];

/** Papéis que o admin pode atribuir. */
export const PAPEIS_ATRIBUIVEIS: { value: Exclude<Papel, 'pendente'>; label: string }[] = [
  { value: 'coordenador', label: 'Coordenador' },
  { value: 'voluntario', label: 'Voluntário' },
  { value: 'profissional', label: 'Profissional' },
  { value: 'beneficiario', label: 'Beneficiário' },
  { value: 'admin', label: 'Administrador' },
];

export const PAPEL_LABELS: Record<string, string> = {
  admin: 'Administrador',
  coordenador: 'Coordenador',
  voluntario: 'Voluntário',
  profissional: 'Profissional',
  beneficiario: 'Beneficiário',
  pendente: 'Pendente',
};

export interface RoleCaps {
  /** Pode gerir/aprovar utilizadores. */
  canManageUsers: boolean;
  /** IDs de coleções que pode consultar (abas do painel). */
  view: string[];
  /** IDs de coleções onde pode criar registos a partir do portal. */
  create: string[];
  /** Área pessoal (ex.: beneficiário acompanha os próprios pedidos). */
  personalArea: boolean;
}

const ALL = ADMIN_COLLECTIONS.map((c) => c.id);

// Coleções operacionais (Eixo 1/2) que a equipa pode criar a partir do portal.
const OPERACIONAIS = ['campanhas', 'stock', 'distribuicoes', 'accoesPrevcao'];
const SAUDE = ['referencias', 'accoesPrevcao', 'profissionaisVoluntarios'];
const CONFIDENCIAIS = ['necessidades', 'doacoesEspecificas'];

export const ROLE_CAPS: Record<Papel, RoleCaps> = {
  admin: {
    canManageUsers: true,
    view: ALL,
    create: [...new Set([...OPERACIONAIS, ...SAUDE, ...CONFIDENCIAIS])],
    personalArea: false,
  },
  coordenador: {
    canManageUsers: false,
    view: ALL,
    create: [...new Set([...OPERACIONAIS, ...SAUDE, ...CONFIDENCIAIS])],
    personalArea: false,
  },
  voluntario: {
    canManageUsers: false,
    view: OPERACIONAIS,
    create: OPERACIONAIS,
    personalArea: false,
  },
  profissional: {
    canManageUsers: false,
    view: SAUDE,
    create: SAUDE,
    personalArea: false,
  },
  beneficiario: {
    canManageUsers: false,
    view: [],
    create: [],
    personalArea: true,
  },
  pendente: {
    canManageUsers: false,
    view: [],
    create: [],
    personalArea: false,
  },
};

/** Capacidades do papel (com fallback seguro para 'pendente'). */
export function capsOf(papel: string): RoleCaps {
  return ROLE_CAPS[(papel as Papel)] ?? ROLE_CAPS.pendente;
}
