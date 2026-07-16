// Configuração das coleções apresentadas na área de administração.
// Cada coleção descreve os campos a mostrar, o seu tipo e a etiqueta legível,
// permitindo renderizar as listas e exportar CSV de forma genérica.

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
  icon: string;
  /** Campo usado para ordenar os registos (mais recente primeiro). */
  timestampField: string;
  /** Campo usado como título de cada cartão. */
  titleField: string;
  fields: FieldDef[];
}

export const ADMIN_COLLECTIONS: CollectionConfig[] = [
  {
    id: 'voluntarios',
    label: 'Voluntários',
    singular: 'voluntário',
    icon: '🙋',
    timestampField: 'createdAt',
    titleField: 'name',
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
    icon: '📝',
    timestampField: 'createdAt',
    titleField: 'name',
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
    icon: '📞',
    timestampField: 'createdAt',
    titleField: 'name',
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
    icon: '✉️',
    timestampField: 'subscribedAt',
    titleField: 'email',
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
    icon: '📦',
    timestampField: 'criadoEm',
    titleField: 'descricaoBem',
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
    icon: '🏭',
    timestampField: 'criadoEm',
    titleField: 'item',
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
    icon: '🤝',
    timestampField: 'criadoEm',
    titleField: 'nomeBeneficiario',
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
    icon: '🩺',
    timestampField: 'criadoEm',
    titleField: 'nomeCompleto',
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
    icon: '🔗',
    timestampField: 'criadoEm',
    titleField: 'nomeBeneficiario',
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
    icon: '🏥',
    timestampField: 'criadoEm',
    titleField: 'titulo',
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
    icon: '🌟',
    timestampField: 'criadoEm',
    titleField: 'codigoFamilia',
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
    icon: '💝',
    timestampField: 'criadoEm',
    titleField: 'descricaoItem',
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
  const escape = (v: string) => {
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
