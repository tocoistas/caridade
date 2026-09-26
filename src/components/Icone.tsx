/**
 * Biblioteca de ícones do projecto — SVG inline, servido pela própria aplicação.
 *
 * Não há CDN, ficheiros de fonte de ícones nem pedidos externos: cada ícone é um
 * conjunto de traços desenhado sobre uma grelha de 24×24 que herda a cor do texto
 * (`currentColor`), pelo que funciona em qualquer fundo da paleta.
 *
 * Uso:
 *   <Icone nome="coracao" className="w-6 h-6 text-terracotta" />
 *   <Icone nome="facebook" /> (os ícones de marca são preenchidos, não traçados)
 *
 * Acessibilidade: por omissão o ícone é decorativo (`aria-hidden`). Passar
 * `titulo` quando o ícone é a única fonte de informação — passa a ter `role="img"`.
 */

type Desenho = { d: string; preenchido?: boolean };

/** Ícones de marca (logótipos de terceiros): usam preenchimento, não traço. */
const MARCAS = new Set(['facebook', 'instagram', 'youtube', 'x', 'whatsapp']);

const ICONES: Record<string, Desenho | Desenho[]> = {
  // ── Eixos e temas do projecto ─────────────────────────────────────────────
  /** Mão aberta que ampara (Eixo 1). */
  mao: [
    { d: 'M18 11V6.5a1.5 1.5 0 0 0-3 0V11' },
    { d: 'M15 11V4.5a1.5 1.5 0 0 0-3 0V11' },
    { d: 'M12 11V5.5a1.5 1.5 0 0 0-3 0V13' },
    { d: 'M9 12V8.5a1.5 1.5 0 0 0-3 0V14a7 7 0 0 0 7 7h1a7 7 0 0 0 7-7v-3' },
  ],
  /** Coração que cuida (Eixo 2). */
  coracao: {
    d: 'M20.8 6.6a5 5 0 0 0-7.1 0L12 8.3l-1.7-1.7a5 5 0 1 0-7.1 7.1l8.1 8.1a1 1 0 0 0 1.4 0l8.1-8.1a5 5 0 0 0 0-7.1z',
  },
  /** Coração com cruz de cuidados de saúde. */
  coracaoCuidado: [
    { d: 'M20.8 6.6a5 5 0 0 0-7.1 0L12 8.3l-1.7-1.7a5 5 0 1 0-7.1 7.1l8.1 8.1a1 1 0 0 0 1.4 0l8.1-8.1a5 5 0 0 0 0-7.1z' },
    { d: 'M12 10.5v4M10 12.5h4' },
  ],
  /** Ponte de esperança (Eixo 3). */
  ponte: [
    { d: 'M2 15h20' },
    { d: 'M2 15c5 0 8-3.5 10-7 2 3.5 5 7 10 7' },
    { d: 'M7 15v5M12 12v8M17 15v5' },
  ],
  /** Grupo de pessoas / voluntariado. */
  pessoas: [
    { d: 'M16 20v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 18.5V20' },
    { d: 'M10 11.5a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5z' },
    { d: 'M20 20v-1.5a3.5 3.5 0 0 0-2.6-3.4' },
    { d: 'M15.5 4.3a3.75 3.75 0 0 1 0 7.2' },
  ],
  /** Uma pessoa. */
  pessoa: [
    { d: 'M19 20v-1.5a4.5 4.5 0 0 0-4.5-4.5h-5A4.5 4.5 0 0 0 5 18.5V20' },
    { d: 'M12 11.5a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5z' },
  ],
  /** Caixa / doação de bens. */
  caixa: [
    { d: 'M3.5 8.5 12 4l8.5 4.5v7L12 20l-8.5-4.5v-7z' },
    { d: 'M3.5 8.5 12 13l8.5-4.5' },
    { d: 'M12 13v7' },
  ],
  /** Presente / doação específica. */
  presente: [
    { d: 'M4 11h16v9H4z' },
    { d: 'M3 7.5h18V11H3z' },
    { d: 'M12 7.5V20' },
    { d: 'M12 7.5C12 5.6 10.6 4 8.9 4 7.6 4 6.8 5 6.8 6c0 1 .9 1.5 2 1.5h3.2z' },
    { d: 'M12 7.5c0-1.9 1.4-3.5 3.1-3.5 1.3 0 2.1 1 2.1 2 0 1-.9 1.5-2 1.5H12z' },
  ],
  /** Moeda / doação em dinheiro. */
  moeda: [
    { d: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z' },
    { d: 'M14.5 9.2A2.6 2.6 0 0 0 12 7.5c-1.4 0-2.5.9-2.5 2s1.1 2 2.5 2 2.5.9 2.5 2-1.1 2-2.5 2a2.6 2.6 0 0 1-2.5-1.7' },
    { d: 'M12 6v12' },
  ],
  /** Mãos a apertar / entrega. */
  entrega: [
    { d: 'M2.5 12.5 6 9l3.5 3 2-1.5 3 2.5' },
    { d: 'M14.5 13 18 9.5l3.5 3.5' },
    { d: 'M9.5 12 7 14.5a1.8 1.8 0 0 0 2.5 2.5l1-1 2 2a1.8 1.8 0 0 0 2.5-2.5' },
  ],
  /** Armazém / stock. */
  armazem: [
    { d: 'M3 10 12 4l9 6v10H3V10z' },
    { d: 'M8 20v-6h8v6' },
    { d: 'M8 17h8' },
  ],
  /** Megafone / campanha. */
  campanha: [
    { d: 'M4 10.5 15 6v12L4 13.5v-3z' },
    { d: 'M4 10.5H3.2A1.2 1.2 0 0 0 2 11.7v.6A1.2 1.2 0 0 0 3.2 13.5H4' },
    { d: 'M7 12.7V19a1.5 1.5 0 0 0 3 0v-5.2' },
    { d: 'M18 9.5a3.5 3.5 0 0 1 0 5' },
  ],
  /** Estetoscópio / profissional de saúde. */
  estetoscopio: [
    { d: 'M5 4v5a4 4 0 0 0 8 0V4' },
    { d: 'M9 13v2.5a4.5 4.5 0 0 0 9 0V14' },
    { d: 'M18 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z' },
    { d: 'M3.5 4h3M11.5 4h3' },
  ],
  /** Edifício de saúde / acção de prevenção. */
  saude: [
    { d: 'M4 20V7.5L12 4l8 3.5V20H4z' },
    { d: 'M12 10v6M9 13h6' },
  ],
  /** Elo / referenciação. */
  ligacao: [
    { d: 'M10.5 13.5a4 4 0 0 0 5.7 0l2.3-2.3a4 4 0 0 0-5.7-5.7l-1 1' },
    { d: 'M13.5 10.5a4 4 0 0 0-5.7 0l-2.3 2.3a4 4 0 0 0 5.7 5.7l1-1' },
  ],
  /** Estrela / necessidade sinalizada. */
  estrela: { d: 'M12 3.5l2.6 5.4 5.9.8-4.3 4.2 1 5.9-5.2-2.8-5.2 2.8 1-5.9L3.5 9.7l5.9-.8L12 3.5z' },
  /** Mãos em oração / pedido de apoio. */
  pedido: [
    { d: 'M12 21V10.5' },
    { d: 'M12 10.5 8.5 5.8a2 2 0 0 0-3.3 2.2l2.6 6.5A4 4 0 0 0 11.5 17H12' },
    { d: 'M12 10.5l3.5-4.7a2 2 0 0 1 3.3 2.2l-2.6 6.5A4 4 0 0 1 12.5 17H12' },
  ],
  /** Escudo / privacidade e direitos. */
  escudo: [
    { d: 'M12 21s7-3.2 7-9V6l-7-3-7 3v6c0 5.8 7 9 7 9z' },
    { d: 'M9.5 12l1.8 1.8 3.2-3.6' },
  ],

  // ── Contacto ──────────────────────────────────────────────────────────────
  local: [
    { d: 'M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11z' },
    { d: 'M12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z' },
  ],
  telefone: {
    d: 'M4 4h3.2l1.6 4.2-2.1 1.4a12 12 0 0 0 6 6l1.4-2.1L18 15v3.2a1.8 1.8 0 0 1-2 1.8C9.9 19.4 4.6 14.1 4 8a1.8 1.8 0 0 1 0-4z',
  },
  email: [
    { d: 'M3 6.5h18v11H3z' },
    { d: 'M3 7l9 6 9-6' },
  ],
  globo: [
    { d: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z' },
    { d: 'M3.5 9.5h17M3.5 14.5h17' },
    { d: 'M12 3c-2.2 2.4-3.4 5.6-3.4 9s1.2 6.6 3.4 9c2.2-2.4 3.4-5.6 3.4-9S14.2 5.4 12 3z' },
  ],
  relogio: [
    { d: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z' },
    { d: 'M12 7.5V12l3 2' },
  ],
  calendario: [
    { d: 'M4 6.5h16V20H4z' },
    { d: 'M4 10.5h16' },
    { d: 'M8.5 4v3M15.5 4v3' },
  ],

  // ── Interface ─────────────────────────────────────────────────────────────
  verificado: [
    { d: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z' },
    { d: 'M8.5 12.2l2.3 2.3 4.7-5' },
  ],
  visto: { d: 'M5 12.5l4.5 4.5L19 7.5' },
  cruz: { d: 'M6 6l12 12M18 6L6 18' },
  menu: { d: 'M4 7h16M4 12h16M4 17h16' },
  setaDireita: { d: 'M4 12h15m0 0-5.5-5.5M19 12l-5.5 5.5' },
  setaEsquerda: { d: 'M20 12H5m0 0 5.5-5.5M5 12l5.5 5.5' },
  chevronBaixo: { d: 'M6 9.5l6 6 6-6' },
  chevronCima: { d: 'M6 14.5l6-6 6 6' },
  chevronDireita: { d: 'M9.5 6l6 6-6 6' },
  chevronEsquerda: { d: 'M14.5 6l-6 6 6 6' },
  pesquisa: [
    { d: 'M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13z' },
    { d: 'M15.5 15.5 20 20' },
  ],
  filtro: { d: 'M4 6h16l-6 7v6l-4-2v-4L4 6z' },
  descarregar: [
    { d: 'M12 4v10' },
    { d: 'M8 10.5l4 4 4-4' },
    { d: 'M4.5 18.5h15' },
  ],
  mais: { d: 'M12 5v14M5 12h14' },
  atualizar: [
    { d: 'M20 12a8 8 0 1 1-2.8-6.1' },
    { d: 'M20 4v4.5h-4.5' },
  ],
  tabela: [
    { d: 'M3.5 5.5h17v13h-17z' },
    { d: 'M3.5 10h17M3.5 14.5h17M10 5.5v13' },
  ],
  cartoes: [
    { d: 'M3.5 4.5h7v7h-7zM13.5 4.5h7v7h-7zM3.5 13.5h7v6h-7zM13.5 13.5h7v6h-7z' },
  ],
  painel: [
    { d: 'M3.5 4.5h7v6h-7zM13.5 4.5h7v10h-7zM3.5 13.5h7v6h-7zM13.5 17h7v2.5h-7z' },
  ],
  lista: { d: 'M8 6.5h12M8 12h12M8 17.5h12M4 6.5h.01M4 12h.01M4 17.5h.01' },
  definicoes: [
    { d: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z' },
    { d: 'M19.4 14.5a1.6 1.6 0 0 0 .3 1.8l.1.1a1.7 1.7 0 1 1-2.4 2.4l-.1-.1a1.6 1.6 0 0 0-2.7 1.1v.3a1.7 1.7 0 0 1-3.4 0v-.2a1.6 1.6 0 0 0-2.8-1.1l-.1.1a1.7 1.7 0 1 1-2.4-2.4l.1-.1A1.6 1.6 0 0 0 4 13.7h-.3a1.7 1.7 0 0 1 0-3.4h.2a1.6 1.6 0 0 0 1.1-2.8l-.1-.1a1.7 1.7 0 1 1 2.4-2.4l.1.1a1.6 1.6 0 0 0 2.7-1.1V3.7a1.7 1.7 0 0 1 3.4 0v.2a1.6 1.6 0 0 0 2.8 1.1l.1-.1a1.7 1.7 0 1 1 2.4 2.4l-.1.1a1.6 1.6 0 0 0 1.1 2.7h.2a1.7 1.7 0 0 1 0 3.4h-.3a1.6 1.6 0 0 0-1.5 1z' },
  ],
  sair: [
    { d: 'M14 5.5H6.5A1.5 1.5 0 0 0 5 7v10a1.5 1.5 0 0 0 1.5 1.5H14' },
    { d: 'M17 8.5l3.5 3.5-3.5 3.5' },
    { d: 'M20 12h-9' },
  ],
  eliminar: [
    { d: 'M4.5 7h15' },
    { d: 'M6.5 7l.8 12A1.5 1.5 0 0 0 8.8 20.5h6.4a1.5 1.5 0 0 0 1.5-1.4l.8-12' },
    { d: 'M9.5 7V4.5h5V7M10.5 11v5.5M13.5 11v5.5' },
  ],
  chave: [
    { d: 'M8.5 15.5a4 4 0 1 1 3.3-6.2L20 4l1 1.7-2.4 1.4.9 1.6-2.6 1.5-.9-1.6-4.3 2.5a4 4 0 0 1-3.2 3.4z' },
  ],
  informacao: [
    { d: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z' },
    { d: 'M12 11v5.5M12 7.6h.01' },
  ],
  alerta: [
    { d: 'M12 3.5 21 19H3l9-15.5z' },
    { d: 'M12 9.5v4.5M12 16.8h.01' },
  ],
  documento: [
    { d: 'M6 3.5h7L19 9v11.5H6z' },
    { d: 'M13 3.5V9h6' },
    { d: 'M9 13h7M9 16.5h5' },
  ],
  newsletter: [
    { d: 'M3.5 6h17v12h-17z' },
    { d: 'M3.5 6.5 12 13l8.5-6.5' },
    { d: 'M8 20.5h8' },
  ],

  // ── Marcas (preenchidas) ──────────────────────────────────────────────────
  facebook: {
    preenchido: true,
    d: 'M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.99 3.66 9.13 8.44 9.88v-6.99H7.9V12h2.54V9.8c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.77l-.44 2.89h-2.33v6.99C18.34 21.13 22 16.99 22 12z',
  },
  instagram: {
    preenchido: true,
    d: 'M12 2c2.72 0 3.06.01 4.12.06 1.07.05 1.79.22 2.43.46.66.26 1.22.6 1.77 1.16.56.55.9 1.11 1.16 1.77.24.64.41 1.36.46 2.43.05 1.06.06 1.4.06 4.12s-.01 3.06-.06 4.12c-.05 1.07-.22 1.79-.46 2.43-.26.66-.6 1.22-1.16 1.77-.55.56-1.11.9-1.77 1.16-.64.24-1.36.41-2.43.46-1.06.05-1.4.06-4.12.06s-3.06-.01-4.12-.06c-1.07-.05-1.79-.22-2.43-.46a4.9 4.9 0 0 1-1.77-1.16 4.9 4.9 0 0 1-1.16-1.77c-.24-.64-.41-1.36-.46-2.43C2.01 15.06 2 14.72 2 12s.01-3.06.06-4.12c.05-1.07.22-1.79.46-2.43.26-.66.6-1.22 1.16-1.77A4.9 4.9 0 0 1 5.45 2.52c.64-.24 1.36-.41 2.43-.46C8.94 2.01 9.28 2 12 2zm0 1.8c-2.67 0-2.99.01-4.04.06-.8.04-1.24.17-1.53.29-.39.15-.66.33-.95.62-.29.29-.47.56-.62.95-.12.29-.25.73-.29 1.53-.05 1.05-.06 1.37-.06 4.75s.01 3.7.06 4.75c.04.8.17 1.24.29 1.53.15.39.33.66.62.95.29.29.56.47.95.62.29.12.73.25 1.53.29 1.05.05 1.37.06 4.04.06s2.99-.01 4.04-.06c.8-.04 1.24-.17 1.53-.29.39-.15.66-.33.95-.62.29-.29.47-.56.62-.95.12-.29.25-.73.29-1.53.05-1.05.06-1.37.06-4.75s-.01-3.7-.06-4.75c-.04-.8-.17-1.24-.29-1.53a2.56 2.56 0 0 0-.62-.95 2.56 2.56 0 0 0-.95-.62c-.29-.12-.73-.25-1.53-.29-1.05-.05-1.37-.06-4.04-.06zm0 3.06a5.14 5.14 0 1 1 0 10.28 5.14 5.14 0 0 1 0-10.28zm0 1.8a3.34 3.34 0 1 0 0 6.68 3.34 3.34 0 0 0 0-6.68zm5.34-3.2a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4z',
  },
  youtube: {
    preenchido: true,
    d: 'M21.6 7.2a2.8 2.8 0 0 0-1.98-1.98C17.88 4.75 12 4.75 12 4.75s-5.88 0-7.62.47A2.8 2.8 0 0 0 2.4 7.2C1.93 8.94 1.93 12 1.93 12s0 3.06.47 4.8a2.8 2.8 0 0 0 1.98 1.98c1.74.47 7.62.47 7.62.47s5.88 0 7.62-.47a2.8 2.8 0 0 0 1.98-1.98c.47-1.74.47-4.8.47-4.8s0-3.06-.47-4.8zM10.1 15.4V8.6l5.9 3.4-5.9 3.4z',
  },
  x: {
    preenchido: true,
    d: 'M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-5.21-6.82-5.97 6.82H1.68l7.73-8.84L1.25 2.25h6.83l4.71 6.23zm-1.16 17.52h1.83L7.08 4.13H5.12z',
  },
  whatsapp: {
    preenchido: true,
    d: 'M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.97L2 22l5.25-1.38a9.87 9.87 0 0 0 4.79 1.22c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm0 18.13a8.2 8.2 0 0 1-4.18-1.14l-.3-.18-3.11.82.83-3.04-.19-.31a8.17 8.17 0 0 1-1.25-4.37 8.21 8.21 0 1 1 8.2 8.22zm4.5-6.15c-.25-.12-1.46-.72-1.68-.8-.23-.09-.39-.12-.55.12-.16.25-.64.8-.78.97-.14.16-.28.18-.53.06a6.7 6.7 0 0 1-1.97-1.22 7.5 7.5 0 0 1-1.36-1.7c-.14-.25-.02-.38.1-.51.12-.12.25-.29.37-.43.12-.14.16-.25.25-.41.08-.16.04-.31-.02-.43-.06-.12-.55-1.33-.76-1.82-.2-.48-.4-.41-.55-.42h-.47c-.16 0-.43.06-.65.31-.23.25-.86.85-.86 2.06 0 1.22.88 2.4 1 2.56.12.16 1.72 2.75 4.19 3.75 2.05.83 2.47.71 2.92.67.45-.04 1.46-.6 1.66-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.16-.47-.28z',
  },
};

export type NomeIcone = keyof typeof ICONES;

/** Todos os nomes disponíveis (útil para catálogos e testes). */
export const NOMES_ICONES = Object.keys(ICONES) as NomeIcone[];

export default function Icone({
  nome,
  className = 'w-6 h-6',
  titulo,
  espessura = 1.7,
}: {
  nome: NomeIcone;
  className?: string;
  /** Descrição acessível. Sem ela o ícone é tratado como decorativo. */
  titulo?: string;
  /** Espessura do traço (ignorada nos ícones preenchidos). */
  espessura?: number;
}) {
  const desenho = ICONES[nome];
  const partes = Array.isArray(desenho) ? desenho : [desenho];
  const preenchido = MARCAS.has(String(nome)) || partes.some((p) => p.preenchido);

  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill={preenchido ? 'currentColor' : 'none'}
      stroke={preenchido ? 'none' : 'currentColor'}
      strokeWidth={preenchido ? undefined : espessura}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={titulo ? 'img' : undefined}
      aria-hidden={titulo ? undefined : true}
      aria-label={titulo}
      focusable="false"
    >
      {titulo && <title>{titulo}</title>}
      {partes.map((parte) => (
        <path key={parte.d} d={parte.d} />
      ))}
    </svg>
  );
}
