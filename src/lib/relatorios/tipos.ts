/**
 * Relatórios: estrutura comum e regras de privacidade.
 *
 * Um relatório é gerado a partir dos registos já carregados no painel e é
 * **contextualizado ao público a que se destina** — não é o mesmo conteúdo com
 * outro cabeçalho. O que cada público pode ver está declarado aqui e é imposto
 * pelo gerador (src/lib/relatorios/gerar.ts), não pela boa vontade de quem o
 * escreve.
 */

export type PublicoRelatorio = 'publico' | 'voluntarios' | 'profissionais' | 'doadores' | 'empresas';

export interface RegraPrivacidade {
  /** Pode mostrar nomes de beneficiários. Nunca é verdade — está aqui para ser explícito. */
  nomesBeneficiarios: false;
  /** Pode mostrar códigos de beneficiários (pseudónimos). */
  codigosBeneficiarios: boolean;
  /** Pode identificar membros da equipa (voluntários, profissionais) pelo nome. */
  nomesEquipa: boolean;
  /** Pode incluir texto descritivo de situação social ou saúde. */
  situacaoOuSaude: false;
  /**
   * Contagens de **pessoas** abaixo deste valor aparecem como "menos de N".
   * Contagens de acções (entregas, recolhas, sessões) saem sempre exactas —
   * não identificam ninguém e suprimi-las tornaria o relatório ilegível.
   */
  minimoAgregado: number;
}

export interface DefPublico {
  id: PublicoRelatorio;
  label: string;
  /** A quem se destina, em linguagem de quem o vai enviar. */
  destinatario: string;
  /** O que este relatório responde. */
  proposito: string;
  privacidade: RegraPrivacidade;
  /** Frase de rodapé sobre o tratamento de dados, adequada ao público. */
  notaPrivacidade: string;
}

/**
 * Nenhum relatório mostra nomes de beneficiários nem texto de situação social
 * ou de saúde, seja qual for o público. O que varia é o resto.
 */
const BASE = { nomesBeneficiarios: false, situacaoOuSaude: false } as const;

export const PUBLICOS: Record<PublicoRelatorio, DefPublico> = {
  publico: {
    id: 'publico',
    label: 'Relatório público',
    destinatario: 'Site, redes sociais e canais oficiais',
    proposito: 'Prestar contas à sociedade com números verificáveis e sem qualquer dado pessoal.',
    privacidade: { ...BASE, codigosBeneficiarios: false, nomesEquipa: false, minimoAgregado: 5 },
    notaPrivacidade:
      'Este relatório contém apenas números agregados. Não identifica, directa ou indirectamente, nenhuma pessoa apoiada, voluntária ou profissional.',
  },
  voluntarios: {
    id: 'voluntarios',
    label: 'Relatório para voluntários',
    destinatario: 'Equipa de voluntariado',
    proposito: 'Mostrar à equipa o resultado do trabalho no terreno e o que está pendente.',
    privacidade: { ...BASE, codigosBeneficiarios: true, nomesEquipa: true, minimoAgregado: 1 },
    notaPrivacidade:
      'As pessoas apoiadas são identificadas apenas pelo código de cadastro. Não constam nomes, contactos, moradas nem informação sobre a situação social ou de saúde. Este documento é de uso interno.',
  },
  profissionais: {
    id: 'profissionais',
    label: 'Relatório para profissionais de saúde',
    destinatario: 'Profissionais voluntários do Eixo 2',
    proposito: 'Dar visibilidade aos encaminhamentos e às acções de prevenção realizadas.',
    privacidade: { ...BASE, codigosBeneficiarios: true, nomesEquipa: true, minimoAgregado: 1 },
    notaPrivacidade:
      'As pessoas encaminhadas são identificadas apenas pelo código de cadastro. Não constam motivos clínicos, diagnósticos nem qualquer informação de saúde — esses dados ficam na relação directa entre o profissional e a pessoa.',
  },
  doadores: {
    id: 'doadores',
    label: 'Relatório para doadores',
    destinatario: 'Pessoas que doaram bens ou dinheiro',
    proposito: 'Mostrar a quem doou o que entrou, o que saiu e quantas pessoas foram alcançadas.',
    privacidade: { ...BASE, codigosBeneficiarios: false, nomesEquipa: false, minimoAgregado: 5 },
    notaPrivacidade:
      'Os destinos das doações são apresentados de forma agregada. Nenhuma pessoa apoiada é identificada, nem por nome nem por código.',
  },
  empresas: {
    id: 'empresas',
    label: 'Relatório para empresas financiadoras',
    destinatario: 'Empresas e entidades financiadoras',
    proposito: 'Prestar contas do período financiado: o que foi feito e que alcance teve.',
    privacidade: { ...BASE, codigosBeneficiarios: false, nomesEquipa: false, minimoAgregado: 5 },
    notaPrivacidade:
      'Relatório de prestação de contas com dados agregados. Nenhuma pessoa apoiada é identificada. O apoio da entidade é descrito a partir do que foi registado como recebido.',
  },
};

export interface Indicador {
  etiqueta: string;
  valor: string;
  /** Contexto curto: período de comparação, base de cálculo, ressalva. */
  nota?: string;
}

export interface Tabela {
  colunas: string[];
  linhas: string[][];
  /** Mostrado quando a tabela fica vazia. */
  vazio: string;
}

export interface SeccaoRelatorio {
  titulo: string;
  texto?: string;
  indicadores?: Indicador[];
  tabela?: Tabela;
}

export interface Relatorio {
  publico: PublicoRelatorio;
  titulo: string;
  destinatario: string;
  proposito: string;
  periodo: { inicio: Date; fim: Date; label: string };
  geradoEm: Date;
  /** Parágrafo de abertura, escrito para este público. */
  resumo: string;
  seccoes: SeccaoRelatorio[];
  notaPrivacidade: string;
}
