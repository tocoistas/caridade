'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { type Utilizador } from '@/lib/auth';
import { type AdminRecord, type CollectionConfig } from '@/lib/adminCollections';
import { ESTADOS_POR_COLECCAO } from '@/lib/adminEstados';
import { construirNavegacao, encontrarItem, RELATORIOS, UTILIZADORES, VISAO_GERAL } from '@/lib/adminNav';
import { capsOf } from '@/lib/roles';
import AdminShell from '@/components/admin/AdminShell';
import GestaoUtilizadores from '@/components/admin/GestaoUtilizadores';
import Relatorios from '@/components/admin/Relatorios';
import SeccaoColeccao from '@/components/admin/SeccaoColeccao';
import VisaoGeral from '@/components/admin/VisaoGeral';

type Dados = Record<string, AdminRecord[]>;
type Carregamento = 'a-carregar' | 'pronto' | 'erro';

async function carregarColeccao(config: CollectionConfig): Promise<AdminRecord[]> {
  return (await api<{ registos: AdminRecord[] }>(`/registos/${config.id}`)).registos;
}

/**
 * Lê de uma vez as coleções visíveis para o papel (e a lista de utilizadores,
 * quando o papel a pode ver). O servidor volta a verificar cada permissão.
 */
async function carregarDados(configs: CollectionConfig[], comUtilizadores: boolean) {
  const resultados = await Promise.all(
    configs.map(async (config) => [config.id, await carregarColeccao(config)] as const)
  );
  const utilizadores = comUtilizadores
    ? (await api<{ utilizadores: Utilizador[] }>('/utilizadores')).utilizadores
    : null;
  return { dados: Object.fromEntries(resultados) as Dados, utilizadores };
}

/**
 * Painel da equipa: moldura com navegação por área, visão geral, gestão de
 * utilizadores e as listas de registos de cada coleção visível para o papel.
 */
export default function AdminDashboard({
  utilizador,
  onSair,
}: {
  utilizador: Utilizador;
  onSair: () => void;
}) {
  const caps = capsOf(utilizador.papel);
  const seccoes = useMemo(() => construirNavegacao(caps), [caps]);
  const configs = useMemo(
    () => seccoes.flatMap((s) => s.itens.map((i) => i.config).filter((c): c is CollectionConfig => Boolean(c))),
    [seccoes]
  );

  const [activo, setActivo] = useState<string>(VISAO_GERAL);
  const [dados, setDados] = useState<Dados>({});
  const [utilizadores, setUtilizadores] = useState<Utilizador[] | null>(null);
  const [estado, setEstado] = useState<Carregamento>('a-carregar');

  const carregarUtilizadores = useCallback(async () => {
    if (!caps.canManageUsers) return;
    const { utilizadores: lista } = await api<{ utilizadores: Utilizador[] }>('/utilizadores');
    setUtilizadores(lista);
  }, [caps.canManageUsers]);

  const carregarTudo = useCallback(async () => {
    setEstado('a-carregar');
    try {
      const resultado = await carregarDados(configs, caps.canManageUsers);
      setDados(resultado.dados);
      if (resultado.utilizadores) setUtilizadores(resultado.utilizadores);
      setEstado('pronto');
    } catch (err) {
      console.error('Erro ao carregar os registos:', err);
      setEstado('erro');
    }
  }, [configs, caps.canManageUsers]);

  // Carregamento inicial (e sempre que muda o conjunto de coleções visíveis).
  useEffect(() => {
    let cancelado = false;
    const carregar = async () => {
      setEstado('a-carregar');
      try {
        const resultado = await carregarDados(configs, caps.canManageUsers);
        if (cancelado) return;
        setDados(resultado.dados);
        if (resultado.utilizadores) setUtilizadores(resultado.utilizadores);
        setEstado('pronto');
      } catch (err) {
        console.error('Erro ao carregar os registos:', err);
        if (!cancelado) setEstado('erro');
      }
    };
    carregar();
    return () => {
      cancelado = true;
    };
  }, [configs, caps.canManageUsers]);

  const recarregarColeccao = useCallback(async (config: CollectionConfig) => {
    const registos = await carregarColeccao(config);
    setDados((anterior) => ({ ...anterior, [config.id]: registos }));
  }, []);

  const mudarEstado = useCallback(
    async (config: CollectionConfig, id: string, novoEstado: string) => {
      await api(`/registos/${config.id}/${id}`, { method: 'PATCH', body: { estado: novoEstado } });
      await recarregarColeccao(config);
    },
    [recarregarColeccao]
  );

  const contasPendentes = utilizadores?.filter((u) => u.estado === 'pendente').length ?? null;

  const contagens = useMemo(() => {
    const mapa: Record<string, number> = {};
    if (estado === 'pronto') {
      for (const config of configs) mapa[config.id] = dados[config.id]?.length ?? 0;
      if (caps.canManageUsers && contasPendentes !== null && contasPendentes > 0) {
        mapa[UTILIZADORES] = contasPendentes;
      }
    }
    return mapa;
  }, [estado, configs, dados, caps.canManageUsers, contasPendentes]);

  const item = encontrarItem(seccoes, activo);
  const config = item?.config;

  return (
    <AdminShell
      utilizador={utilizador}
      seccoes={seccoes}
      activo={activo}
      contagens={contagens}
      onSelecionar={setActivo}
      onSair={onSair}
      onRecarregar={carregarTudo}
      aRecarregar={estado === 'a-carregar'}
    >
      {estado === 'a-carregar' && (
        <p className="py-16 text-center text-petroleo/70" role="status">
          A carregar os registos…
        </p>
      )}

      {estado === 'erro' && (
        <div className="rounded-md border-s-4 border-red-500 bg-red-50 p-6 text-red-700" role="alert">
          <p className="mb-1 font-bold">Não foi possível carregar os dados.</p>
          <p className="text-sm">Verifique a sua ligação e as suas permissões, e tente actualizar.</p>
        </div>
      )}

      {estado === 'pronto' && activo === VISAO_GERAL && (
        <VisaoGeral dados={dados} caps={caps} contasPendentes={contasPendentes} onIr={setActivo} />
      )}

      {estado === 'pronto' && activo === RELATORIOS && caps.relatorios && (
        <Relatorios dados={dados} podePublicar={caps.relatorios} />
      )}

      {estado === 'pronto' && activo === UTILIZADORES && caps.canManageUsers && (
        <GestaoUtilizadores
          adminUid={utilizador.uid}
          utilizadores={utilizadores ?? []}
          onAlterado={carregarUtilizadores}
        />
      )}

      {estado === 'pronto' && config && (
        <SeccaoColeccao
          key={config.id}
          config={config}
          registos={dados[config.id] ?? []}
          podeCriar={caps.create.includes(config.id)}
          podeMudarEstado={ESTADOS_POR_COLECCAO[config.id]?.papeis.includes(utilizador.papel) ?? false}
          onMudarEstado={(id, novo) => mudarEstado(config, id, novo)}
          onRecarregar={() => recarregarColeccao(config)}
        />
      )}
    </AdminShell>
  );
}
