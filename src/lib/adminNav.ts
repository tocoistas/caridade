/**
 * Navegação do painel: transforma as capacidades do papel (`ROLE_CAPS`) na
 * árvore de secções que a barra lateral apresenta.
 *
 * A UI só mostra o que o papel pode ver; o servidor volta sempre a verificar.
 */
import type { NomeIcone } from '@/components/Icone';
import { ADMIN_COLLECTIONS, type CollectionConfig } from '@/lib/adminCollections';
import { GRUPOS_ADMIN } from '@/lib/adminGrupos';
import type { RoleCaps } from '@/lib/roles';

/** Secções que não correspondem a uma coleção. */
export const VISAO_GERAL = '__visao_geral__';
export const UTILIZADORES = '__utilizadores__';

export interface ItemNav {
  id: string;
  label: string;
  icone: NomeIcone;
  /** Coleção associada, quando o item é uma lista de registos. */
  config?: CollectionConfig;
}

export interface SeccaoNav {
  id: string;
  /** Vazio nas secções sem cabeçalho (as primeiras entradas soltas). */
  label: string;
  itens: ItemNav[];
}

export function construirNavegacao(caps: RoleCaps): SeccaoNav[] {
  const principal: ItemNav[] = [{ id: VISAO_GERAL, label: 'Visão geral', icone: 'painel' }];
  if (caps.canManageUsers) {
    principal.push({ id: UTILIZADORES, label: 'Utilizadores', icone: 'definicoes' });
  }

  const seccoes: SeccaoNav[] = [{ id: 'principal', label: '', itens: principal }];

  for (const grupo of GRUPOS_ADMIN) {
    const itens = ADMIN_COLLECTIONS.filter((c) => c.grupo === grupo.id && caps.view.includes(c.id)).map((config) => ({
      id: config.id,
      label: config.label,
      icone: config.icone,
      config,
    }));
    if (itens.length) seccoes.push({ id: grupo.id, label: grupo.label, itens });
  }

  return seccoes;
}

/** Procura um item da navegação pelo seu id. */
export function encontrarItem(seccoes: SeccaoNav[], id: string): ItemNav | undefined {
  for (const seccao of seccoes) {
    const item = seccao.itens.find((i) => i.id === id);
    if (item) return item;
  }
  return undefined;
}
