/**
 * Geração dos relatórios a partir dos registos já carregados no painel.
 *
 * Funções puras: mesmos registos e mesmo período ⇒ mesmo relatório. Nenhuma
 * secção lê um campo que a regra de privacidade do público não permita — as
 * regras estão em `tipos.ts` e são aplicadas aqui, não por convenção.
 */
import { toDate, type AdminRecord } from '@/lib/adminCollections';
import { ESTADOS_POR_TRATAR, etiquetaEstado } from '@/lib/adminEstados';
import { PUBLICOS, type Indicador, type PublicoRelatorio, type Relatorio, type SeccaoRelatorio } from './tipos';

export type Registos = Record<string, AdminRecord[]>;

export interface Periodo {
  inicio: Date;
  fim: Date;
  label: string;
}

const CAMPO_DATA: Record<string, string> = {
  voluntarios: 'createdAt',
  beneficiarios: 'createdAt',
  contactos: 'createdAt',
  newsletter_subscriptions: 'subscribedAt',
  profissionaisVoluntarios: 'criadoEm',
  pedidosTitulares: 'createdAt',
  empresas: 'criadoEm',
};

/** Registos da coleção dentro do período. */
function noPeriodo(registos: Registos, colecao: string, periodo: Periodo): AdminRecord[] {
  const campo = CAMPO_DATA[colecao] ?? 'criadoEm';
  return (registos[colecao] ?? []).filter((r) => {
    const d = toDate(r[campo]);
    return d ? d >= periodo.inicio && d <= periodo.fim : false;
  });
}

/** Contagem de valores distintos e não vazios de um campo. */
function distintos(linhas: AdminRecord[], campo: string): Set<string> {
  const conjunto = new Set<string>();
  for (const linha of linhas) {
    const valor = linha[campo];
    if (typeof valor === 'string' && valor.trim() !== '') conjunto.add(valor.trim());
  }
  return conjunto;
}

/**
 * Contagem de **pessoas** respeitando o mínimo agregado.
 *
 * Num relatório aberto ao público, «2 pessoas apoiadas» cruzado com o que se
 * sabe localmente pode chegar a alguém concreto; por isso os números pequenos
 * aparecem como «menos de N». Isto vale só para contagens de pessoas — contar
 * entregas, recolhas ou sessões não identifica ninguém e sai exacto, senão o
 * relatório de uma organização pequena seria ilegível.
 */
function pessoas(valor: number, minimo: number): string {
  if (valor === 0) return '0';
  return valor < minimo ? `menos de ${minimo}` : String(valor);
}

/** Distribuição por valor de um campo, da mais frequente para a menos. */
function distribuicao(linhas: AdminRecord[], campo: string): [string, number][] {
  const mapa = new Map<string, number>();
  for (const linha of linhas) {
    const bruto = linha[campo];
    const valores = Array.isArray(bruto) ? bruto : [bruto];
    for (const v of valores) {
      const chave = typeof v === 'string' && v.trim() !== '' ? v.trim() : '(não indicado)';
      mapa.set(chave, (mapa.get(chave) ?? 0) + 1);
    }
  }
  return [...mapa.entries()].sort((a, b) => b[1] - a[1]);
}

/** Soma de um campo numérico guardado como texto. */
function soma(linhas: AdminRecord[], campo: string): number {
  return linhas.reduce((total, linha) => {
    const n = Number(String(linha[campo] ?? '').replace(',', '.').replace(/[^\d.-]/g, ''));
    return total + (Number.isFinite(n) ? n : 0);
  }, 0);
}

function data(d: Date): string {
  return d.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

/** Pessoas apoiadas: beneficiários distintos com pelo menos uma acção no período. */
function beneficiariosAlcancados(registos: Registos, periodo: Periodo): Set<string> {
  const codigos = new Set<string>();
  for (const [colecao, campo] of [
    ['distribuicoes', 'codigoBeneficiario'],
    ['referencias', 'beneficiarioCodigo'],
    ['necessidades', 'beneficiarioCodigo'],
    ['doacoesEspecificas', 'beneficiarioCodigo'],
  ] as const) {
    for (const codigo of distintos(noPeriodo(registos, colecao, periodo), campo)) codigos.add(codigo);
  }
  return codigos;
}

// ── Relatórios por público ─────────────────────────────────────────────────

function relatorioPublico(registos: Registos, periodo: Periodo): SeccaoRelatorio[] {
  const min = PUBLICOS.publico.privacidade.minimoAgregado;
  const entregas = noPeriodo(registos, 'distribuicoes', periodo);
  const campanhas = noPeriodo(registos, 'campanhas', periodo);
  const accoes = noPeriodo(registos, 'accoesPrevcao', periodo);
  const encaminhamentos = noPeriodo(registos, 'referencias', periodo);
  const alcancados = beneficiariosAlcancados(registos, periodo);
  const novosVoluntarios = noPeriodo(registos, 'voluntarios', periodo);

  return [
    {
      titulo: 'O que foi feito',
      indicadores: [
        {
          etiqueta: 'Pessoas e famílias apoiadas',
          valor: pessoas(alcancados.size, min),
          nota: 'Cadastros distintos com pelo menos uma acção no período.',
        },
        { etiqueta: 'Entregas de bens', valor: String(entregas.length) },
        { etiqueta: 'Encaminhamentos para cuidados de saúde', valor: String(encaminhamentos.length) },
        { etiqueta: 'Acções de prevenção realizadas', valor: String(accoes.length) },
      ],
    },
    {
      titulo: 'Quem tornou isto possível',
      indicadores: [
        { etiqueta: 'Novos voluntários inscritos', valor: pessoas(novosVoluntarios.length, min) },
        {
          etiqueta: 'Voluntários envolvidos nas entregas',
          valor: pessoas(distintos(entregas, 'voluntarioCodigo').size, min),
        },
        {
          etiqueta: 'Profissionais de saúde envolvidos',
          valor: pessoas(distintos([...encaminhamentos, ...accoes], 'profissionalCodigo').size, min),
        },
        { etiqueta: 'Recolhas e campanhas de bens', valor: String(campanhas.length) },
      ],
    },
    {
      titulo: 'Acções de prevenção',
      texto:
        accoes.length > 0
          ? 'Sessões abertas à comunidade, com o tema e o público a que se destinaram.'
          : undefined,
      tabela: {
        colunas: ['Acção', 'Data', 'Público-alvo'],
        linhas: accoes.map((a) => [
          String(a.titulo ?? '—'),
          String(a.dataHora ?? '—'),
          String(a.publicoAlvo ?? '—'),
        ]),
        vazio: 'Não se realizaram acções de prevenção neste período.',
      },
    },
  ];
}

function relatorioVoluntarios(registos: Registos, periodo: Periodo): SeccaoRelatorio[] {
  const entregas = noPeriodo(registos, 'distribuicoes', periodo);
  const campanhas = noPeriodo(registos, 'campanhas', periodo);
  const stock = noPeriodo(registos, 'stock', periodo);
  const alcancados = beneficiariosAlcancados(registos, periodo);

  const porVoluntario = distribuicao(entregas, 'voluntarioResponsavel');
  const apoios = distribuicao(entregas, 'descricaoApoio').slice(0, 10);

  return [
    {
      titulo: 'O trabalho da equipa',
      indicadores: [
        { etiqueta: 'Entregas realizadas', valor: String(entregas.length) },
        {
          etiqueta: 'Pessoas apoiadas',
          valor: String(alcancados.size),
          nota: 'Cadastros distintos — a mesma família contada uma vez.',
        },
        { etiqueta: 'Voluntários envolvidos', valor: String(porVoluntario.length) },
        { etiqueta: 'Recolhas registadas', valor: String(campanhas.length) },
      ],
    },
    {
      titulo: 'Entregas por voluntário',
      tabela: {
        colunas: ['Voluntário', 'Entregas'],
        linhas: porVoluntario.map(([nome, n]) => [nome, String(n)]),
        vazio: 'Sem entregas registadas neste período.',
      },
    },
    {
      titulo: 'Beneficiários apoiados',
      texto:
        'Identificados apenas pelo código de cadastro. Para ver a ficha de alguém, use o painel — este documento não a contém.',
      tabela: {
        colunas: ['Código', 'Entregas no período'],
        linhas: [...distribuicao(entregas, 'codigoBeneficiario')]
          .filter(([codigo]) => codigo !== '(não indicado)')
          .map(([codigo, n]) => [codigo, String(n)]),
        vazio: 'Sem entregas associadas a um cadastro neste período.',
      },
    },
    {
      titulo: 'Movimento de stock',
      indicadores: [
        { etiqueta: 'Entradas', valor: String(soma(stock, 'entrada')) },
        { etiqueta: 'Saídas', valor: String(soma(stock, 'saida')) },
      ],
      tabela: {
        colunas: ['Tipo de apoio', 'Entregas'],
        linhas: apoios.map(([descricao, n]) => [descricao, String(n)]),
        vazio: 'Sem movimento registado neste período.',
      },
    },
  ];
}

function relatorioProfissionais(registos: Registos, periodo: Periodo): SeccaoRelatorio[] {
  const encaminhamentos = noPeriodo(registos, 'referencias', periodo);
  const accoes = noPeriodo(registos, 'accoesPrevcao', periodo);
  const profissionais = registos.profissionaisVoluntarios ?? [];

  return [
    {
      titulo: 'Eixo 2 no período',
      indicadores: [
        { etiqueta: 'Encaminhamentos', valor: String(encaminhamentos.length) },
        {
          etiqueta: 'Pessoas encaminhadas',
          valor: String(distintos(encaminhamentos, 'beneficiarioCodigo').size),
          nota: 'Cadastros distintos.',
        },
        { etiqueta: 'Acções de prevenção', valor: String(accoes.length) },
        { etiqueta: 'Profissionais na bolsa', valor: String(profissionais.length) },
      ],
    },
    {
      titulo: 'Encaminhamentos',
      texto:
        'Sem motivo clínico, diagnóstico ou qualquer informação de saúde: essa relação é directa entre o profissional e a pessoa.',
      tabela: {
        colunas: ['Data', 'Beneficiário (código)', 'Profissional'],
        linhas: encaminhamentos.map((r) => [
          String(r.data ?? '—'),
          String(r.beneficiarioCodigo ?? '—'),
          String(r.profissionalNome ?? '—'),
        ]),
        vazio: 'Sem encaminhamentos neste período.',
      },
    },
    {
      titulo: 'Acções de prevenção',
      tabela: {
        colunas: ['Acção', 'Data', 'Orador', 'Público-alvo'],
        linhas: accoes.map((a) => [
          String(a.titulo ?? '—'),
          String(a.dataHora ?? '—'),
          String(a.oradorPrincipal ?? '—'),
          String(a.publicoAlvo ?? '—'),
        ]),
        vazio: 'Sem acções neste período.',
      },
    },
    {
      titulo: 'Bolsa de profissionais',
      tabela: {
        colunas: ['Especialidade', 'Profissionais'],
        linhas: distribuicao(profissionais, 'profissaoEspecialidade').map(([e, n]) => [e, String(n)]),
        vazio: 'Ainda não há profissionais cadastrados.',
      },
    },
  ];
}

function relatorioDoadores(registos: Registos, periodo: Periodo): SeccaoRelatorio[] {
  const min = PUBLICOS.doadores.privacidade.minimoAgregado;
  const campanhas = noPeriodo(registos, 'campanhas', periodo);
  const entregas = noPeriodo(registos, 'distribuicoes', periodo);
  const doacoes = noPeriodo(registos, 'doacoesEspecificas', periodo);
  const stock = noPeriodo(registos, 'stock', periodo);
  const alcancados = beneficiariosAlcancados(registos, periodo);

  return [
    {
      titulo: 'Do donativo à entrega',
      indicadores: [
        { etiqueta: 'Doações recebidas', valor: String(campanhas.length) },
        { etiqueta: 'Doações dirigidas a um pedido concreto', valor: String(doacoes.length) },
        { etiqueta: 'Entregas realizadas', valor: String(entregas.length) },
        {
          etiqueta: 'Pessoas e famílias alcançadas',
          valor: pessoas(alcancados.size, min),
          nota: 'Cadastros distintos, sem qualquer identificação.',
        },
      ],
    },
    {
      titulo: 'O que entrou',
      tabela: {
        colunas: ['Bem doado', 'Ocorrências'],
        linhas: distribuicao(campanhas, 'descricaoBem').slice(0, 15).map(([bem, n]) => [bem, String(n)]),
        vazio: 'Sem doações registadas neste período.',
      },
    },
    {
      titulo: 'O que saiu',
      indicadores: [
        { etiqueta: 'Entradas em stock', valor: String(soma(stock, 'entrada')) },
        { etiqueta: 'Saídas de stock', valor: String(soma(stock, 'saida')) },
      ],
      tabela: {
        colunas: ['Tipo de apoio entregue', 'Entregas'],
        linhas: distribuicao(entregas, 'descricaoApoio')
          .slice(0, 15)
          .map(([apoio, n]) => [apoio, String(n)]),
        vazio: 'Sem entregas registadas neste período.',
      },
    },
  ];
}

function relatorioEmpresas(registos: Registos, periodo: Periodo): SeccaoRelatorio[] {
  const min = PUBLICOS.empresas.privacidade.minimoAgregado;
  const empresas = registos.empresas ?? [];
  const campanhas = noPeriodo(registos, 'campanhas', periodo);
  const comEmpresa = campanhas.filter((c) => String(c.empresaCodigo ?? '') !== '');
  const entregas = noPeriodo(registos, 'distribuicoes', periodo);
  const accoes = noPeriodo(registos, 'accoesPrevcao', periodo);
  const alcancados = beneficiariosAlcancados(registos, periodo);

  return [
    {
      titulo: 'Resultado do período financiado',
      indicadores: [
        {
          etiqueta: 'Pessoas e famílias alcançadas',
          valor: pessoas(alcancados.size, min),
          nota: 'Cadastros distintos, sem qualquer identificação.',
        },
        { etiqueta: 'Entregas de bens', valor: String(entregas.length) },
        { etiqueta: 'Acções de prevenção', valor: String(accoes.length) },
        { etiqueta: 'Entidades financiadoras activas', valor: String(empresas.length) },
      ],
    },
    {
      titulo: 'Apoio recebido de entidades',
      texto: 'Doações registadas com a entidade financiadora identificada no cadastro.',
      tabela: {
        colunas: ['Entidade (código)', 'Doações registadas'],
        linhas: distribuicao(comEmpresa, 'empresaCodigo').map(([codigo, n]) => [codigo, String(n)]),
        vazio: 'Nenhuma doação do período está associada a uma entidade cadastrada.',
      },
    },
    {
      titulo: 'Entidades cadastradas',
      tabela: {
        colunas: ['Código', 'Entidade', 'Tipo de apoio'],
        linhas: empresas.map((e) => [
          String(e.codigo ?? '—'),
          String(e.nome ?? '—'),
          String(e.tipoApoio ?? '—'),
        ]),
        vazio: 'Ainda não há entidades financiadoras cadastradas.',
      },
    },
  ];
}

const GERADORES: Record<PublicoRelatorio, (r: Registos, p: Periodo) => SeccaoRelatorio[]> = {
  publico: relatorioPublico,
  voluntarios: relatorioVoluntarios,
  profissionais: relatorioProfissionais,
  doadores: relatorioDoadores,
  empresas: relatorioEmpresas,
};

function resumoDe(publico: PublicoRelatorio, registos: Registos, periodo: Periodo): string {
  const min = PUBLICOS[publico].privacidade.minimoAgregado;
  const alcancados = pessoas(beneficiariosAlcancados(registos, periodo).size, min);
  const entregas = String(noPeriodo(registos, 'distribuicoes', periodo).length);
  const intervalo = `entre ${data(periodo.inicio)} e ${data(periodo.fim)}`;

  switch (publico) {
    case 'publico':
      return `${intervalo}, o Projecto Caridade apoiou ${alcancados} pessoas e famílias, com ${entregas} entregas de bens essenciais. Os números são agregados e não identificam ninguém.`;
    case 'voluntarios':
      return `Resumo do trabalho da equipa ${intervalo}: ${entregas} entregas a ${alcancados} cadastros distintos. As pessoas apoiadas aparecem apenas pelo código.`;
    case 'profissionais':
      return `Actividade do Eixo 2 ${intervalo}. Os encaminhamentos aparecem sem motivo clínico — só a data, o código do cadastro e o profissional.`;
    case 'doadores':
      return `${intervalo}, as doações recebidas traduziram-se em ${entregas} entregas, alcançando ${alcancados} pessoas e famílias. Nenhuma delas é identificada neste documento.`;
    case 'empresas':
      return `Prestação de contas ${intervalo}: ${entregas} entregas e ${alcancados} pessoas e famílias alcançadas, a partir dos registos operacionais do período.`;
  }
}

/** Gera o relatório de um público a partir dos registos e do período. */
export function gerarRelatorio(publico: PublicoRelatorio, registos: Registos, periodo: Periodo): Relatorio {
  const def = PUBLICOS[publico];
  return {
    publico,
    titulo: `${def.label} · ${periodo.label}`,
    destinatario: def.destinatario,
    proposito: def.proposito,
    periodo,
    geradoEm: new Date(),
    resumo: resumoDe(publico, registos, periodo),
    seccoes: GERADORES[publico](registos, periodo),
    notaPrivacidade: def.notaPrivacidade,
  };
}

/** Indicadores de todas as secções, para publicar ou exportar. */
export function indicadoresDe(relatorio: Relatorio): Indicador[] {
  return relatorio.seccoes.flatMap((s) => s.indicadores ?? []);
}

// ── Períodos ───────────────────────────────────────────────────────────────

function inicioDoDia(d: Date): Date {
  const copia = new Date(d);
  copia.setHours(0, 0, 0, 0);
  return copia;
}

export function periodosDisponiveis(agora = new Date()): Periodo[] {
  const fim = new Date(agora);
  const desde = (dias: number) => inicioDoDia(new Date(agora.getTime() - dias * 24 * 60 * 60 * 1000));
  const inicioAno = new Date(agora.getFullYear(), 0, 1);
  const anoPassado = new Date(agora.getFullYear() - 1, 0, 1);

  return [
    { inicio: desde(30), fim, label: 'Últimos 30 dias' },
    { inicio: desde(90), fim, label: 'Último trimestre' },
    { inicio: inicioAno, fim, label: `Ano de ${agora.getFullYear()}` },
    { inicio: anoPassado, fim: new Date(agora.getFullYear() - 1, 11, 31, 23, 59, 59), label: `Ano de ${agora.getFullYear() - 1}` },
    { inicio: new Date(2000, 0, 1), fim, label: 'Desde o início' },
  ];
}

/** Estado dos pedidos de apoio — usado no rodapé dos relatórios internos. */
export function pendentesDeTratamento(registos: Registos): Indicador[] {
  const pedidos = registos.pedidosApoio ?? [];
  const porEstado = distribuicao(pedidos, 'estado');
  return porEstado.map(([estado, n]) => ({
    etiqueta: etiquetaEstado(estado),
    valor: String(n),
    nota: ESTADOS_POR_TRATAR.has(estado) ? 'Por tratar' : undefined,
  }));
}
