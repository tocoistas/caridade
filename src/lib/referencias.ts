/**
 * Identificação das pessoas cadastradas e ligação das acções a quem abrangem.
 *
 * Cada pessoa cadastrada recebe um **código** legível e estável
 * (`BEN-2026-0001`), gerado pelo servidor. As acções dos eixos (entregas,
 * referenciações, necessidades, doações dirigidas…) deixam de guardar apenas
 * nomes escritos à mão: passam a apontar para o registo da pessoa.
 *
 * Cada referência materializa-se em três campos:
 *   `<x>Id`     — id do documento (o único que o cliente envia);
 *   `<x>Codigo` — código legível, **escrito pelo servidor**;
 *   `<x>Nome`   — nome desnormalizado para listas, **escrito pelo servidor**.
 *
 * O cliente nunca envia código nem nome: o servidor lê-os do registo referido.
 * Assim uma lista nunca mostra um nome que não corresponde ao código.
 */

export type TipoPessoa = 'beneficiario' | 'voluntario' | 'profissional';

export interface DefTipoPessoa {
  colecao: string;
  /** Prefixo do código (três letras maiúsculas). */
  prefixo: string;
  label: string;
  plural: string;
  /** Campo onde o registo guarda o nome da pessoa. */
  campoNome: string;
}

export const TIPOS_PESSOA: Record<TipoPessoa, DefTipoPessoa> = {
  beneficiario: {
    colecao: 'beneficiarios',
    prefixo: 'BEN',
    label: 'Beneficiário',
    plural: 'Beneficiários',
    campoNome: 'name',
  },
  voluntario: {
    colecao: 'voluntarios',
    prefixo: 'VOL',
    label: 'Voluntário',
    plural: 'Voluntários',
    campoNome: 'name',
  },
  profissional: {
    colecao: 'profissionaisVoluntarios',
    prefixo: 'PRO',
    label: 'Profissional',
    plural: 'Profissionais',
    campoNome: 'nomeCompleto',
  },
};

/** Coleções cujos registos têm código próprio, por coleção. */
export const TIPO_POR_COLECAO: Record<string, TipoPessoa> = Object.fromEntries(
  Object.entries(TIPOS_PESSOA).map(([tipo, def]) => [def.colecao, tipo as TipoPessoa])
) as Record<string, TipoPessoa>;

/** `BEN-2026-0001` */
export const PADRAO_CODIGO = /^[A-Z]{3}-\d{4}-\d{4,}$/;

export interface DefReferencia {
  /** Campo com o id do registo referido — o único preenchido pelo cliente. */
  campoId: string;
  /** Campo com o código legível (escrito pelo servidor). */
  campoCodigo: string;
  /** Campo com o nome desnormalizado (escrito pelo servidor). */
  campoNome: string;
  tipo: TipoPessoa;
  label: string;
  /** Exigida no formulário do painel (o servidor aceita vazio por compatibilidade). */
  obrigatoria?: boolean;
  /** Explicação apresentada por baixo do campo. */
  ajuda?: string;
}

/**
 * Referências de cada coleção operacional.
 *
 * Reutiliza os campos de texto que já existiam (`nomeBeneficiario`,
 * `voluntarioResponsavel`, `recebidoPor`, `oradorPrincipal`…) como campo de
 * nome, para não duplicar informação nem perder o histórico.
 */
export const REFERENCIAS: Record<string, DefReferencia[]> = {
  campanhas: [
    {
      campoId: 'voluntarioId',
      campoCodigo: 'voluntarioCodigo',
      campoNome: 'recebidoPor',
      tipo: 'voluntario',
      label: 'Recebido por',
      ajuda: 'Voluntário cadastrado que recebeu os bens.',
    },
  ],
  distribuicoes: [
    {
      campoId: 'beneficiarioId',
      campoCodigo: 'codigoBeneficiario',
      campoNome: 'nomeBeneficiario',
      tipo: 'beneficiario',
      label: 'Beneficiário',
      obrigatoria: true,
      ajuda: 'A entrega fica associada ao cadastro de quem a recebeu.',
    },
    {
      campoId: 'voluntarioId',
      campoCodigo: 'voluntarioCodigo',
      campoNome: 'voluntarioResponsavel',
      tipo: 'voluntario',
      label: 'Voluntário responsável',
    },
  ],
  referencias: [
    {
      campoId: 'beneficiarioId',
      campoCodigo: 'beneficiarioCodigo',
      campoNome: 'nomeBeneficiario',
      tipo: 'beneficiario',
      label: 'Beneficiário',
      obrigatoria: true,
    },
    {
      campoId: 'profissionalId',
      campoCodigo: 'profissionalCodigo',
      campoNome: 'profissionalNome',
      tipo: 'profissional',
      label: 'Profissional que atende',
    },
  ],
  accoesPrevcao: [
    {
      campoId: 'profissionalId',
      campoCodigo: 'profissionalCodigo',
      campoNome: 'oradorPrincipal',
      tipo: 'profissional',
      label: 'Orador principal',
    },
  ],
  necessidades: [
    {
      campoId: 'beneficiarioId',
      campoCodigo: 'beneficiarioCodigo',
      campoNome: 'beneficiarioNome',
      tipo: 'beneficiario',
      label: 'Beneficiário',
      obrigatoria: true,
      ajuda: 'Só o código é usado nos relatórios; o nome nunca sai do painel.',
    },
  ],
  doacoesEspecificas: [
    {
      campoId: 'beneficiarioId',
      campoCodigo: 'beneficiarioCodigo',
      campoNome: 'beneficiarioNome',
      tipo: 'beneficiario',
      label: 'Beneficiário destinatário',
    },
    {
      campoId: 'voluntarioId',
      campoCodigo: 'voluntarioCodigo',
      campoNome: 'voluntarioLogistico',
      tipo: 'voluntario',
      label: 'Voluntário logístico',
    },
  ],
};

/** Todos os campos escritos pelo servidor a partir de uma referência. */
export function camposDerivados(colecao: string): string[] {
  return (REFERENCIAS[colecao] ?? []).flatMap((r) => [r.campoCodigo, r.campoNome]);
}

/** Etiqueta curta de uma pessoa referida: `BEN-2026-0001 · Ana Silva`. */
export function etiquetaPessoa(codigo?: string | null, nome?: string | null): string {
  const partes = [codigo, nome].filter((p) => typeof p === 'string' && p.trim() !== '');
  return partes.length ? partes.join(' · ') : '—';
}
