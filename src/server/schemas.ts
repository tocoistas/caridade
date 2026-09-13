import 'server-only';
import { z } from 'zod';
import ontology from '../../docs/ontology.json';
import { PASSWORD_MAX, PASSWORD_MIN } from './crypto';

const texto = (max: number) => z.string().trim().max(max);
const textoObrigatorio = (max: number) => z.string().trim().min(1).max(max);
const email = z.string().trim().toLowerCase().pipe(z.email().max(320));
const password = z.string().min(PASSWORD_MIN).max(PASSWORD_MAX);
const cliente = z.enum(['web', 'app']).default('web');

// ─── Autenticação ──────────────────────────────────────────────────────────

export const registoSchema = z.strictObject({
  nome: textoObrigatorio(200),
  email,
  password,
  papelPretendido: z.enum(['beneficiario', 'voluntario', 'profissional']),
  // Consentimento informado e idade mínima (RGPD art. 7.º e 8.º; Lei n.º 22/11).
  aceitaPolitica: z.literal(true),
  maiorDe16: z.literal(true),
  cliente,
});

export const loginSchema = z.strictObject({
  email,
  password: z.string().min(1).max(PASSWORD_MAX),
  cliente,
});

export const definirPasswordSchema = z.strictObject({
  email,
  codigo: z.string().trim().min(8).max(20),
  novaPassword: password,
  cliente,
});

export const alterarPasswordSchema = z.strictObject({
  actual: z.string().min(1).max(PASSWORD_MAX),
  nova: password,
});

// ─── Formulários públicos ──────────────────────────────────────────────────

const pais = {
  country: texto(100).default(''),
  countryCode: texto(3).default(''),
};

const voluntarioSchema = z.strictObject({
  name: textoObrigatorio(200),
  email,
  ...pais,
  phone: texto(40).default(''),
  interest: texto(100).default(''),
  message: texto(5000).default(''),
  consent: z.literal(true),
});

const beneficiarioSchema = z.strictObject({
  name: textoObrigatorio(200),
  birthdate: texto(20).default(''),
  id_number: texto(60).default(''),
  ...pais,
  phone: texto(40).default(''),
  email: z.union([z.literal(''), email]).default(''),
  address: texto(500).default(''),
  adults: z.coerce.number().int().min(0).max(100).default(1),
  children: z.coerce.number().int().min(0).max(100).default(0),
  situation: texto(5000).default(''),
  supportNeeded: z.array(z.enum(['alimento', 'roupa', 'saude', 'outro'])).max(4).default([]),
  consent: z.literal(true),
  // Consentimento explícito e separado para dados sensíveis (situação social e saúde).
  consentSensitive: z.literal(true),
});

const contactoSchema = z.strictObject({
  name: textoObrigatorio(200),
  email,
  ...pais,
  phone: texto(40).default(''),
  subject: texto(200).default(''),
  message: textoObrigatorio(5000),
  consent: z.literal(true),
});

const newsletterSchema = z.strictObject({ email, consent: z.literal(true) });

const direitosSchema = z.strictObject({
  name: textoObrigatorio(200),
  email,
  tipo: z.enum(['acesso', 'rectificacao', 'eliminacao', 'limitacao', 'portabilidade', 'oposicao', 'retirada_consentimento']),
  descricao: texto(5000).default(''),
});

/** Formulários públicos: tipo na URL → coleção, esquema e campo de timestamp. */
export const FORMULARIOS = {
  voluntarios: { colecao: 'voluntarios', schema: voluntarioSchema, timestamp: 'createdAt' },
  beneficiarios: { colecao: 'beneficiarios', schema: beneficiarioSchema, timestamp: 'createdAt' },
  contactos: { colecao: 'contactos', schema: contactoSchema, timestamp: 'createdAt' },
  newsletter: { colecao: 'newsletter_subscriptions', schema: newsletterSchema, timestamp: 'subscribedAt' },
  direitos: { colecao: 'pedidosTitulares', schema: direitosSchema, timestamp: 'createdAt' },
} as const;

export type TipoFormulario = keyof typeof FORMULARIOS;

// ─── Registos operacionais do portal (derivados da ontologia) ──────────────

type DefColecao = { fields: string[]; timestamp?: string };
const COLECOES = ontology.collections as Record<string, DefColecao>;

/** Coleções onde a equipa cria registos a partir do portal/app. */
export const COLECOES_REGISTO = [
  'campanhas',
  'stock',
  'distribuicoes',
  'profissionaisVoluntarios',
  'referencias',
  'accoesPrevcao',
  'necessidades',
  'doacoesEspecificas',
];

export function esquemaRegisto(colecao: string) {
  const def = COLECOES[colecao];
  if (!def || !COLECOES_REGISTO.includes(colecao)) return null;
  const timestamp = def.timestamp ?? 'criadoEm';
  const shape = Object.fromEntries(
    def.fields.filter((f) => f !== timestamp).map((f) => [f, texto(5000).default('')])
  );
  return { schema: z.strictObject(shape), timestamp };
}

// ─── Pedidos de apoio e gestão ─────────────────────────────────────────────

export const pedidoSchema = z.strictObject({
  titulo: textoObrigatorio(200),
  descricao: texto(5000).default(''),
});

export const estadoPedidoSchema = z.strictObject({
  estado: z.enum(['novo', 'em_analise', 'resolvido']),
});

export const gestaoUtilizadorSchema = z
  .strictObject({
    papel: z.enum(['admin', 'coordenador', 'voluntario', 'profissional', 'beneficiario']).optional(),
    estado: z.enum(['aprovado', 'suspenso']).optional(),
  })
  .refine((d) => d.papel !== undefined || d.estado !== undefined, { message: 'Nada para alterar.' });

/** Registos com fluxo de estados alteráveis no portal e quem os pode alterar. */
export const ESTADOS = {
  pedidosApoio: { valores: ['novo', 'em_analise', 'resolvido'], papeis: ['admin', 'coordenador'] },
  pedidosTitulares: { valores: ['novo', 'em_curso', 'concluido', 'recusado'], papeis: ['admin'] },
} as const;

export const estadoSchema = z.strictObject({ estado: z.string().trim().min(1).max(40) });

export const eliminarContaSchema = z.strictObject({ password: z.string().min(1).max(PASSWORD_MAX) });
