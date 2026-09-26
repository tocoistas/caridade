'use client';

import Icone, { type NomeIcone } from '@/components/Icone';
import Distintivo from '@/components/admin/Distintivo';
import EstadoVazio from '@/components/admin/EstadoVazio';
import {
  ADMIN_COLLECTIONS,
  formatValue,
  toDate,
  type AdminRecord,
  type CollectionConfig,
} from '@/lib/adminCollections';
import { ESTADOS_POR_TRATAR } from '@/lib/adminEstados';
import { GRUPOS_ADMIN } from '@/lib/adminGrupos';
import { UTILIZADORES } from '@/lib/adminNav';
import type { RoleCaps } from '@/lib/roles';

const DIA = 24 * 60 * 60 * 1000;

interface Cartao {
  id: string;
  etiqueta: string;
  valor: number;
  nota: string;
  icone: NomeIcone;
  destino?: string;
  /** Realça o cartão quando há trabalho por fazer. */
  urgente?: boolean;
}

function contarRecentes(registos: AdminRecord[], config: CollectionConfig, dias: number): number {
  const limite = Date.now() - dias * DIA;
  return registos.filter((r) => {
    const d = toDate(r[config.timestampField]);
    return d ? d.getTime() >= limite : false;
  }).length;
}

function porTratar(registos: AdminRecord[]): number {
  return registos.filter((r) => ESTADOS_POR_TRATAR.has(String(r.estado ?? ''))).length;
}

/**
 * Página de entrada do painel: o que exige acção, o volume de cada área e o que
 * entrou recentemente — para não obrigar a abrir secção a secção à procura.
 */
export default function VisaoGeral({
  dados,
  caps,
  contasPendentes,
  onIr,
}: {
  dados: Record<string, AdminRecord[]>;
  caps: RoleCaps;
  /** Contas à espera de aprovação (só para quem gere utilizadores). */
  contasPendentes: number | null;
  onIr: (id: string) => void;
}) {
  const visiveis = ADMIN_COLLECTIONS.filter((c) => caps.view.includes(c.id));
  const registosDe = (id: string) => dados[id] ?? [];

  // ── Cartões de topo ───────────────────────────────────────────────────────
  const cartoes: Cartao[] = [];

  if (caps.canManageUsers && contasPendentes !== null) {
    cartoes.push({
      id: 'contas',
      etiqueta: 'Contas por aprovar',
      valor: contasPendentes,
      nota: contasPendentes === 0 ? 'Nada pendente' : 'A aguardar decisão',
      icone: 'pessoa',
      destino: UTILIZADORES,
      urgente: contasPendentes > 0,
    });
  }

  for (const id of ['pedidosApoio', 'pedidosTitulares'] as const) {
    const config = visiveis.find((c) => c.id === id);
    if (!config) continue;
    const abertos = porTratar(registosDe(id));
    cartoes.push({
      id,
      etiqueta: id === 'pedidosApoio' ? 'Pedidos abertos' : 'Direitos por responder',
      valor: abertos,
      nota: abertos === 0 ? 'Tudo tratado' : `De ${registosDe(id).length} no total`,
      icone: config.icone,
      destino: id,
      urgente: abertos > 0,
    });
  }

  for (const id of ['beneficiarios', 'voluntarios', 'distribuicoes'] as const) {
    if (cartoes.length >= 4) break;
    const config = visiveis.find((c) => c.id === id);
    if (!config) continue;
    const registos = registosDe(id);
    const recentes = contarRecentes(registos, config, 30);
    cartoes.push({
      id,
      etiqueta: config.label,
      valor: registos.length,
      nota: recentes > 0 ? `+${recentes} nos últimos 30 dias` : 'Sem movimento em 30 dias',
      icone: config.icone,
      destino: id,
    });
  }

  // ── Actividade recente (todas as áreas visíveis) ──────────────────────────
  const recentes = visiveis
    .flatMap((config) =>
      registosDe(config.id).map((registo) => ({
        config,
        registo,
        data: toDate(registo[config.timestampField]),
      }))
    )
    .filter((linha) => linha.data !== null)
    .sort((a, b) => (b.data as Date).getTime() - (a.data as Date).getTime())
    .slice(0, 8);

  // ── Resumo por área ───────────────────────────────────────────────────────
  const areas = GRUPOS_ADMIN.map((grupo) => {
    const coleccoes = visiveis.filter((c) => c.grupo === grupo.id);
    return {
      grupo,
      coleccoes,
      total: coleccoes.reduce((soma, c) => soma + registosDe(c.id).length, 0),
      novos: coleccoes.reduce((soma, c) => soma + contarRecentes(registosDe(c.id), c, 7), 0),
    };
  }).filter((a) => a.coleccoes.length > 0);

  return (
    <div className="space-y-8">
      {cartoes.length > 0 && (
        <section aria-labelledby="titulo-indicadores">
          <h2 id="titulo-indicadores" className="sr-only">
            Indicadores
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {cartoes.map((cartao) => (
              <CartaoIndicador key={cartao.id} cartao={cartao} onIr={onIr} />
            ))}
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Actividade recente */}
        <section aria-labelledby="titulo-actividade" className="lg:col-span-3">
          <h2 id="titulo-actividade" className="mb-3 font-montserrat text-lg font-semibold text-petroleo">
            Actividade recente
          </h2>
          {recentes.length === 0 ? (
            <EstadoVazio titulo="Ainda não há registos" descricao="Os novos registos aparecem aqui assim que entrarem." />
          ) : (
            <ul className="divide-y divide-creme-escuro overflow-hidden rounded-lg border border-creme-escuro bg-white">
              {recentes.map(({ config, registo, data }) => (
                <li key={`${config.id}-${registo.id}`}>
                  <button
                    type="button"
                    onClick={() => onIr(config.id)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-start transition-colors hover:bg-creme/60"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-creme text-terracotta">
                      <Icone nome={config.icone} className="h-5 w-5" espessura={1.6} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-montserrat text-sm font-medium text-petroleo">
                        {formatValue(registo[config.titleField], { key: config.titleField, label: '' })}
                      </span>
                      <span className="block text-xs text-petroleo/60">{config.label}</span>
                    </span>
                    {registo.estado !== undefined && <Distintivo estado={String(registo.estado)} />}
                    <span className="shrink-0 text-xs text-petroleo/50">
                      {(data as Date).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' })}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Resumo por área */}
        <section aria-labelledby="titulo-areas" className="lg:col-span-2">
          <h2 id="titulo-areas" className="mb-3 font-montserrat text-lg font-semibold text-petroleo">
            As suas áreas
          </h2>
          <ul className="space-y-3">
            {areas.map(({ grupo, coleccoes, total, novos }) => (
              <li key={grupo.id} className="rounded-lg border border-creme-escuro bg-white p-4">
                <div className="mb-1 flex items-center gap-2">
                  <Icone nome={grupo.icone} className="h-5 w-5 text-terracotta" espessura={1.6} />
                  <h3 className="font-montserrat text-sm font-semibold text-petroleo">{grupo.label}</h3>
                </div>
                <p className="mb-3 text-xs text-petroleo/60">{grupo.descricao}</p>
                <p className="mb-3 text-sm text-petroleo/80">
                  <span className="font-montserrat text-xl font-semibold text-petroleo">{total}</span> registos
                  {novos > 0 && <span className="text-petroleo/60"> · {novos} nos últimos 7 dias</span>}
                </p>
                <div className="flex flex-wrap gap-2">
                  {coleccoes.map((config) => (
                    <button
                      key={config.id}
                      type="button"
                      onClick={() => onIr(config.id)}
                      className="rounded-full border border-creme-escuro px-3 py-1 font-montserrat text-xs text-petroleo transition-colors hover:bg-creme"
                    >
                      {config.label} ({registosDe(config.id).length})
                    </button>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

function CartaoIndicador({ cartao, onIr }: { cartao: Cartao; onIr: (id: string) => void }) {
  const conteudo = (
    <>
      <div className="flex items-start justify-between gap-2">
        <p className="font-montserrat text-sm text-petroleo/70">{cartao.etiqueta}</p>
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
            cartao.urgente ? 'bg-terracotta/15 text-terracotta' : 'bg-creme text-petroleo/70'
          }`}
        >
          <Icone nome={cartao.icone} className="h-5 w-5" espessura={1.6} />
        </span>
      </div>
      <p className="mt-2 font-montserrat text-3xl font-semibold text-petroleo">{cartao.valor}</p>
      <p className="mt-1 text-xs text-petroleo/60">{cartao.nota}</p>
    </>
  );

  const classes = `rounded-lg border bg-white p-4 text-start ${
    cartao.urgente ? 'border-terracotta/40' : 'border-creme-escuro'
  }`;

  if (!cartao.destino) return <div className={classes}>{conteudo}</div>;

  return (
    <button type="button" onClick={() => onIr(cartao.destino as string)} className={`${classes} transition-colors hover:bg-creme/60`}>
      {conteudo}
    </button>
  );
}
