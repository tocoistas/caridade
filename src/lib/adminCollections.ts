// Configuração das coleções apresentadas na área de administração.
//
// Cada coleção descreve a área (`grupo`) a que pertence, os campos a mostrar, o
// seu tipo e a etiqueta legível — o painel renderiza listas, tabelas,
// formulários e exportações CSV a partir daqui, sem código por coleção.
import type { NomeIcone } from '@/components/Icone';
import type { GrupoId } from '@/lib/adminGrupos';

export type FieldType =
  | 'text'
  | 'longtext'
  | 'email'
  | 'number'
  | 'date'
  | 'datetime'
  | 'list'
  | 'boolean';

export interface FieldDef {
  key: string;
  label: string;
  type?: FieldType;
  /** Mapeia valores brutos (ex.: 'alimento') para etiquetas legíveis. */
  valueLabels?: Record<string, string>;
}

export interface CollectionConfig {
  id: string;
  label: string;
  singular: string;
  /** Área do painel a que a coleção pertence. */
  grupo: GrupoId;
  icone: NomeIcone;
  /** Uma linha a explicar o que a coleção guarda (cabeçalho da secção). */
  descricao: string;
  /** Campo usado para ordenar os registos (mais recente primeiro). */
  timestampField: string;
  /** Campo usado como título de cada registo. */
  titleField: string;
  /** Campos mostrados nas colunas da tabela (os restantes só no detalhe). */
  colunas?: string[];
  fields: FieldDef[];
}

export const ADMIN_COLLECTIONS: CollectionConfig[] = [
  {
    id: 'voluntarios',
    label: 'Voluntários',
    singular: 'voluntário',
    grupo: 'pessoas',
    icone: 'pessoas',
    descricao: 'Pessoas que se ofereceram para colaborar através do formulário público.',
    timestampField: 'createdAt',
    titleField: 'name',
    colunas: ['name', 'email', 'country', 'interest', 'createdAt'],
    fields: [
      { key: 'name', label: 'Nome', type: 'text' },
      { key: 'email', label: 'E-mail', type: 'email' },
      { key: 'country', label: 'País', type: 'text' },
      { key: 'phone', label: 'Telefone', type: 'text' },
      { key: 'interest', label: 'Área de Interesse', type: 'text' },
      { key: 'message', label: 'Mensagem', type: 'longtext' },
      { key: 'createdAt', label: 'Data de Inscrição', type: 'datetime' },
    ],
  },
  {
    id: 'beneficiarios',
    label: 'Beneficiários',
    singular: 'beneficiário',
    grupo: 'pessoas',
    icone: 'pessoa',
    descricao: 'Pedidos de cadastro de pessoas e famílias que procuram apoio.',
    timestampField: 'createdAt',
    titleField: 'name',
    colunas: ['name', 'country', 'phone', 'supportNeeded', 'createdAt'],
    fields: [
      { key: 'name', label: 'Nome', type: 'text' },
      { key: 'birthdate', label: 'Data de Nascimento', type: 'date' },
      { key: 'id_number', label: 'Nº Documento', type: 'text' },
      { key: 'country', label: 'País', type: 'text' },
      { key: 'phone', label: 'Telefone', type: 'text' },
      { key: 'email', label: 'E-mail', type: 'email' },
      { key: 'address', label: 'Morada', type: 'longtext' },
      { key: 'adults', label: 'Nº de Adultos', type: 'number' },
      { key: 'children', label: 'Nº de Crianças', type: 'number' },
      { key: 'situation', label: 'Situação / Necessidades', type: 'longtext' },
      {
        key: 'supportNeeded',
        label: 'Apoio Necessário',
        type: 'list',
        valueLabels: {
          alimento: 'Cesta Básica',
          roupa: 'Vestuário e Calçado',
          saude: 'Apoio à Saúde',
          outro: 'Outro',
        },
      },
      { key: 'consent', label: 'Consentimento', type: 'boolean' },
      { key: 'createdAt', label: 'Data do Pedido', type: 'datetime' },
    ],
  },
  {
    id: 'contactos',
    label: 'Contactos',
    singular: 'contacto',
    grupo: 'atendimento',
    icone: 'email',
    descricao: 'Mensagens recebidas pelo formulário de contacto do site.',
    timestampField: 'createdAt',
    titleField: 'name',
    colunas: ['name', 'email', 'subject', 'createdAt'],
    fields: [
      { key: 'name', label: 'Nome', type: 'text' },
      { key: 'email', label: 'E-mail', type: 'email' },
      { key: 'country', label: 'País', type: 'text' },
      { key: 'phone', label: 'Telefone', type: 'text' },
      { key: 'subject', label: 'Assunto', type: 'text' },
      { key: 'message', label: 'Mensagem', type: 'longtext' },
      { key: 'createdAt', label: 'Data', type: 'datetime' },
    ],
  },
  {
    id: 'newsletter_subscriptions',
    label: 'Newsletter',
    singular: 'inscrição',
    grupo: 'atendimento',
    icone: 'newsletter',
    descricao: 'Endereços inscritos no boletim informativo.',
    timestampField: 'subscribedAt',
    titleField: 'email',
    colunas: ['email', 'subscribedAt'],
    fields: [
      { key: 'email', label: 'E-mail', type: 'email' },
      { key: 'subscribedAt', label: 'Data de Inscrição', type: 'datetime' },
    ],
  },

  // ── Eixo 1 ─ Mão que Ampara ─────────────────────────────────────────────────
  {
    id: 'campanhas',
    label: 'Campanhas',
    singular: 'campanha',
    grupo: 'eixo1',
    icone: 'campanha',
    descricao: 'Bens recebidos em campanhas de recolha, por doador.',
    timestampField: 'criadoEm',
    titleField: 'descricaoBem',
    colunas: ['descricaoBem', 'quantidade', 'nomeDoador', 'data', 'criadoEm'],
    fields: [
      { key: 'data', label: 'Data', type: 'text' },
      { key: 'nomeDoador', label: 'Nome do Doador', type: 'text' },
      { key: 'contacto', label: 'Contacto', type: 'text' },
      { key: 'descricaoBem', label: 'Descrição do Bem', type: 'longtext' },
      { key: 'quantidade', label: 'Quantidade', type: 'text' },
      { key: 'recebidoPor', label: 'Recebido por', type: 'text' },
      { key: 'criadoEm', label: 'Registado em', type: 'datetime' },
    ],
  },
  {
    id: 'stock',
    label: 'Stock',
    singular: 'item de stock',
    grupo: 'eixo1',
    icone: 'armazem',
    descricao: 'Entradas e saídas do armazém, com validades.',
    timestampField: 'criadoEm',
    titleField: 'item',
    colunas: ['item', 'entrada', 'saida', 'validade', 'criadoEm'],
    fields: [
      { key: 'data', label: 'Data', type: 'text' },
      { key: 'item', label: 'Item', type: 'text' },
      { key: 'entrada', label: 'Entrada', type: 'text' },
      { key: 'saida', label: 'Saída', type: 'text' },
      { key: 'validade', label: 'Validade', type: 'text' },
      { key: 'nRegisto', label: 'Nº Registo', type: 'text' },
      { key: 'criadoEm', label: 'Registado em', type: 'datetime' },
    ],
  },
  {
    id: 'distribuicoes',
    label: 'Entregas de Bens',
    singular: 'entrega',
    grupo: 'eixo1',
    icone: 'entrega',
    descricao: 'Bens efectivamente entregues a cada beneficiário.',
    timestampField: 'criadoEm',
    titleField: 'nomeBeneficiario',
    colunas: ['nomeBeneficiario', 'descricaoApoio', 'voluntarioResponsavel', 'data', 'criadoEm'],
    fields: [
      { key: 'data', label: 'Data', type: 'text' },
      { key: 'codigoBeneficiario', label: 'Cód. Beneficiário', type: 'text' },
      { key: 'nomeBeneficiario', label: 'Nome Beneficiário', type: 'text' },
      { key: 'descricaoApoio', label: 'Descrição do Apoio', type: 'longtext' },
      { key: 'voluntarioResponsavel', label: 'Voluntário Responsável', type: 'text' },
      { key: 'criadoEm', label: 'Registado em', type: 'datetime' },
    ],
  },

  // ── Eixo 2 ─ Coração que Cuida ──────────────────────────────────────────────
  {
    id: 'profissionaisVoluntarios',
    label: 'Profissionais',
    singular: 'profissional',
    grupo: 'pessoas',
    icone: 'estetoscopio',
    descricao: 'Profissionais de saúde disponíveis para o Eixo 2.',
    timestampField: 'criadoEm',
    titleField: 'nomeCompleto',
    colunas: ['nomeCompleto', 'profissaoEspecialidade', 'telefone', 'disponibilidade', 'criadoEm'],
    fields: [
      { key: 'nomeCompleto', label: 'Nome Completo', type: 'text' },
      { key: 'telefone', label: 'Telefone', type: 'text' },
      { key: 'email', label: 'E-mail', type: 'email' },
      { key: 'profissaoEspecialidade', label: 'Profissão / Especialidade', type: 'text' },
      { key: 'numeroCedula', label: 'Nº Cédula', type: 'text' },
      { key: 'disponibilidade', label: 'Disponibilidade', type: 'text' },
      { key: 'criadoEm', label: 'Registado em', type: 'datetime' },
    ],
  },
  {
    id: 'referencias',
    label: 'Referenciações',
    singular: 'referenciação',
    grupo: 'eixo2',
    icone: 'ligacao',
    descricao: 'Encaminhamentos de beneficiários para atendimento clínico.',
    timestampField: 'criadoEm',
    titleField: 'nomeBeneficiario',
    colunas: ['nomeBeneficiario', 'referenciadoPor', 'motivo', 'data', 'criadoEm'],
    fields: [
      { key: 'data', label: 'Data', type: 'text' },
      { key: 'nomeBeneficiario', label: 'Nome Beneficiário', type: 'text' },
      { key: 'referenciadoPor', label: 'Referenciado por', type: 'text' },
      { key: 'motivo', label: 'Motivo', type: 'longtext' },
      { key: 'contactoAgendamento', label: 'Contacto Agendamento', type: 'text' },
      { key: 'criadoEm', label: 'Registado em', type: 'datetime' },
    ],
  },
  {
    id: 'accoesPrevcao',
    label: 'Acções de Prevenção',
    singular: 'acção de prevenção',
    grupo: 'eixo2',
    icone: 'saude',
    descricao: 'Sessões de prevenção e educação para a saúde.',
    timestampField: 'criadoEm',
    titleField: 'titulo',
    colunas: ['titulo', 'dataHora', 'oradorPrincipal', 'localFisico', 'criadoEm'],
    fields: [
      { key: 'titulo', label: 'Título', type: 'text' },
      { key: 'dataHora', label: 'Data e Hora', type: 'text' },
      { key: 'oradorPrincipal', label: 'Orador Principal', type: 'text' },
      { key: 'localFisico', label: 'Local', type: 'text' },
      { key: 'publicoAlvo', label: 'Público-Alvo', type: 'text' },
      { key: 'recursosNecessarios', label: 'Recursos Necessários', type: 'longtext' },
      { key: 'criadoEm', label: 'Registado em', type: 'datetime' },
    ],
  },

  // ── Eixo 3 ─ Ponte de Esperança ─────────────────────────────────────────────
  {
    id: 'necessidades',
    label: 'Necessidades',
    singular: 'necessidade',
    grupo: 'eixo3',
    icone: 'estrela',
    descricao: 'Necessidades concretas sinalizadas, à espera de doador.',
    timestampField: 'criadoEm',
    titleField: 'codigoFamilia',
    colunas: ['codigoFamilia', 'necessidadeMaterial', 'statusGeral', 'doador', 'criadoEm'],
    fields: [
      { key: 'codigoFamilia', label: 'Cód. Família', type: 'text' },
      { key: 'agregadoFamiliar', label: 'Agregado Familiar', type: 'text' },
      { key: 'situacao', label: 'Situação', type: 'longtext' },
      { key: 'necessidadeMaterial', label: 'Necessidade Material', type: 'longtext' },
      { key: 'statusGeral', label: 'Estado Geral', type: 'text' },
      { key: 'doador', label: 'Doador', type: 'text' },
      { key: 'garantiaResolucao', label: 'Garantia de Resolução', type: 'text' },
      { key: 'criadoEm', label: 'Registado em', type: 'datetime' },
    ],
  },
  {
    id: 'doacoesEspecificas',
    label: 'Doações Específicas',
    singular: 'doação específica',
    grupo: 'eixo3',
    icone: 'presente',
    descricao: 'Doações dirigidas a uma necessidade específica.',
    timestampField: 'criadoEm',
    titleField: 'descricaoItem',
    colunas: ['descricaoItem', 'codigoApelo', 'identidadeDoador', 'dataRemessa', 'criadoEm'],
    fields: [
      { key: 'dataRecebimento', label: 'Data de Recebimento', type: 'text' },
      { key: 'codigoApelo', label: 'Cód. Apelo', type: 'text' },
      { key: 'descricaoItem', label: 'Descrição do Item', type: 'text' },
      { key: 'identidadeDoador', label: 'Identidade do Doador', type: 'text' },
      { key: 'contactabilidade', label: 'Contactabilidade', type: 'text' },
      { key: 'voluntarioLogistico', label: 'Voluntário Logístico', type: 'text' },
      { key: 'dataRemessa', label: 'Data de Remessa', type: 'text' },
      { key: 'criadoEm', label: 'Registado em', type: 'datetime' },
    ],
  },

  // ── Pedidos de apoio (submetidos por beneficiários autenticados) ────────────
  {
    id: 'pedidosApoio',
    label: 'Pedidos de Apoio',
    singular: 'pedido de apoio',
    grupo: 'atendimento',
    icone: 'pedido',
    descricao: 'Pedidos submetidos por beneficiários autenticados no portal.',
    timestampField: 'criadoEm',
    titleField: 'titulo',
    colunas: ['titulo', 'nomeBeneficiario', 'estado', 'criadoEm'],
    fields: [
      { key: 'titulo', label: 'Título', type: 'text' },
      { key: 'nomeBeneficiario', label: 'Beneficiário', type: 'text' },
      { key: 'email', label: 'E-mail', type: 'email' },
      { key: 'descricao', label: 'Descrição', type: 'longtext' },
      {
        key: 'estado',
        label: 'Estado',
        type: 'text',
        valueLabels: {
          novo: 'Novo',
          em_analise: 'Em análise',
          resolvido: 'Resolvido',
        },
      },
      { key: 'criadoEm', label: 'Registado em', type: 'datetime' },
    ],
  },

  // ── Privacidade: pedidos de exercício de direitos (só administradores) ─────
  {
    id: 'pedidosTitulares',
    label: 'Pedidos de Titulares',
    singular: 'pedido de titular',
    grupo: 'privacidade',
    icone: 'escudo',
    descricao: 'Pedidos de acesso, rectificação ou eliminação de dados pessoais.',
    timestampField: 'createdAt',
    titleField: 'name',
    colunas: ['name', 'tipo', 'estado', 'prazoResposta', 'createdAt'],
    fields: [
      { key: 'name', label: 'Nome', type: 'text' },
      { key: 'email', label: 'E-mail', type: 'email' },
      {
        key: 'tipo',
        label: 'Pedido',
        type: 'text',
        valueLabels: {
          acesso: 'Acesso',
          rectificacao: 'Rectificação',
          eliminacao: 'Eliminação',
          limitacao: 'Limitação',
          portabilidade: 'Portabilidade',
          oposicao: 'Oposição',
          retirada_consentimento: 'Retirada de consentimento',
        },
      },
      { key: 'descricao', label: 'Detalhes', type: 'longtext' },
      {
        key: 'estado',
        label: 'Estado',
        type: 'text',
        valueLabels: { novo: 'Novo', em_curso: 'Em curso', concluido: 'Concluído', recusado: 'Recusado' },
      },
      { key: 'prazoResposta', label: 'Prazo de resposta', type: 'datetime' },
      { key: 'createdAt', label: 'Recebido em', type: 'datetime' },
    ],
  },
];

export interface AdminRecord {
  id: string;
  [key: string]: unknown;
}

function isTimestamp(value: unknown): value is { toDate: () => Date } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'toDate' in value &&
    typeof (value as { toDate: unknown }).toDate === 'function'
  );
}

/** Devolve um objeto Date a partir de um Timestamp do Firestore, string ou número. */
export function toDate(value: unknown): Date | null {
  if (!value) return null;
  if (isTimestamp(value)) return value.toDate();
  if (value instanceof Date) return value;
  if (typeof value === 'string' || typeof value === 'number') {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}

/** Formata um valor para apresentação legível de acordo com o seu tipo. */
export function formatValue(value: unknown, field: FieldDef): string {
  if (value === null || value === undefined || value === '') return '—';

  switch (field.type) {
    case 'datetime': {
      const d = toDate(value);
      return d
        ? d.toLocaleString('pt-PT', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
        : '—';
    }
    case 'date': {
      const d = toDate(value);
      return d ? d.toLocaleDateString('pt-PT') : String(value);
    }
    case 'list': {
      if (!Array.isArray(value) || value.length === 0) return '—';
      return value
        .map((v) => field.valueLabels?.[String(v)] ?? String(v))
        .join(', ');
    }
    case 'boolean':
      return value ? 'Sim' : 'Não';
    default:
      return String(value);
  }
}

/** Gera o conteúdo CSV de uma lista de registos de uma coleção. */
export function toCSV(config: CollectionConfig, records: AdminRecord[]): string {
  const escape = (valor: string) => {
    // Protecção contra injecção de fórmulas em folhas de cálculo (CSV injection).
    const v = /^[=+\-@\t\r]/.test(valor) ? `'${valor}` : valor;
    if (/[",\n;]/.test(v)) {
      return `"${v.replace(/"/g, '""')}"`;
    }
    return v;
  };

  const header = config.fields.map((f) => escape(f.label)).join(',');
  const rows = records.map((record) =>
    config.fields
      .map((f) => escape(formatValue(record[f.key], f)))
      .join(',')
  );

  return [header, ...rows].join('\n');
}
