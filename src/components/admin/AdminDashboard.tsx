'use client';

import { useEffect, useMemo, useState } from 'react';
import { signOut, type User } from 'firebase/auth';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db, getFirebaseAuth } from '@/lib/firebase';
import { type Utilizador } from '@/lib/auth';
import {
  ADMIN_COLLECTIONS,
  formatValue,
  toCSV,
  type AdminRecord,
  type CollectionConfig,
} from '@/lib/adminCollections';
import { capsOf, PAPEL_LABELS } from '@/lib/roles';
import GestaoUtilizadores from '@/components/admin/GestaoUtilizadores';
import RegistoForm from '@/components/admin/RegistoForm';

type DataState = Record<string, AdminRecord[]>;
type LoadState = 'loading' | 'ready' | 'error';

const UTILIZADORES_TAB = '__utilizadores__';

export default function AdminDashboard({
  user,
  userDoc,
}: {
  user: User;
  userDoc: Utilizador;
}) {
  const caps = capsOf(userDoc.papel);
  // Coleções que este papel pode consultar (abas).
  const visibleConfigs = useMemo(
    () => ADMIN_COLLECTIONS.filter((c) => caps.view.includes(c.id)),
    [caps.view]
  );

  const [activeId, setActiveId] = useState(
    caps.canManageUsers ? UTILIZADORES_TAB : (visibleConfigs[0]?.id ?? UTILIZADORES_TAB)
  );
  const [data, setData] = useState<DataState>({});
  const [state, setState] = useState<LoadState>('loading');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);

  const loadCollection = async (config: CollectionConfig): Promise<AdminRecord[]> => {
    const q = query(collection(db, config.id), orderBy(config.timestampField, 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setState('loading');
      try {
        // Carrega apenas as coleções visíveis para este papel (evita leituras
        // negadas pelas regras do Firestore).
        const results = await Promise.all(
          visibleConfigs.map(async (config) => [config.id, await loadCollection(config)] as const)
        );
        if (cancelled) return;
        setData(Object.fromEntries(results));
        setState('ready');
      } catch (err) {
        console.error('Erro ao carregar os registos: ', err);
        if (!cancelled) setState('error');
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [visibleConfigs]);

  const activeConfig = useMemo(
    () => visibleConfigs.find((c) => c.id === activeId) ?? visibleConfigs[0],
    [activeId, visibleConfigs]
  );

  const activeRecords = activeConfig ? data[activeConfig.id] ?? [] : [];
  const canCreateActive = activeConfig ? caps.create.includes(activeConfig.id) : false;

  const filteredRecords = useMemo(() => {
    if (!activeConfig) return [];
    const term = search.trim().toLowerCase();
    if (!term) return activeRecords;
    return activeRecords.filter((record) =>
      activeConfig.fields.some((field) =>
        formatValue(record[field.key], field).toLowerCase().includes(term)
      )
    );
  }, [activeRecords, activeConfig, search]);

  const handleLogout = () => signOut(getFirebaseAuth());

  const handleCreated = async () => {
    if (!activeConfig) return;
    setShowForm(false);
    try {
      const records = await loadCollection(activeConfig);
      setData((prev) => ({ ...prev, [activeConfig.id]: records }));
    } catch (err) {
      console.error('Erro ao recarregar após criação:', err);
    }
  };

  const handleExport = () => {
    if (!activeConfig) return;
    const csv = toCSV(activeConfig, filteredRecords);
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeConfig.id}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const selectTab = (id: string) => {
    setActiveId(id);
    setSearch('');
    setShowForm(false);
  };

  return (
    <main className="min-h-[70vh] py-10">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-montserrat font-bold text-3xl text-petroleo">
              Painel — {PAPEL_LABELS[userDoc.papel] ?? userDoc.papel}
            </h1>
            <p className="text-sm text-petroleo/70">Sessão iniciada como {user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="self-start sm:self-auto bg-white border border-creme-escuro hover:bg-creme text-petroleo font-montserrat font-medium px-5 py-2 rounded-md transition-colors"
          >
            Terminar sessão
          </button>
        </div>

        {/* Abas */}
        <div className="flex flex-wrap gap-2 border-b border-creme-escuro mb-6">
          {caps.canManageUsers && (
            <button
              onClick={() => selectTab(UTILIZADORES_TAB)}
              className={`px-4 py-3 font-montserrat font-medium text-sm transition-colors border-b-2 -mb-px ${
                activeId === UTILIZADORES_TAB
                  ? 'border-terracotta text-terracotta'
                  : 'border-transparent text-petroleo/70 hover:text-petroleo'
              }`}
            >
              <span className="mr-1">👥</span>
              Utilizadores
            </button>
          )}

          {visibleConfigs.map((config) => {
            const count = data[config.id]?.length;
            const isActive = config.id === activeId;
            return (
              <button
                key={config.id}
                onClick={() => selectTab(config.id)}
                className={`px-4 py-3 font-montserrat font-medium text-sm transition-colors border-b-2 -mb-px ${
                  isActive
                    ? 'border-terracotta text-terracotta'
                    : 'border-transparent text-petroleo/70 hover:text-petroleo'
                }`}
              >
                <span className="mr-1">{config.icon}</span>
                {config.label}
                {state === 'ready' && (
                  <span
                    className={`ml-2 inline-flex items-center justify-center text-xs font-semibold rounded-full px-2 py-0.5 ${
                      isActive ? 'bg-terracotta text-white' : 'bg-creme-escuro text-petroleo'
                    }`}
                  >
                    {count ?? 0}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Painel Utilizadores */}
        {activeId === UTILIZADORES_TAB && caps.canManageUsers && (
          <GestaoUtilizadores adminUid={user.uid} />
        )}

        {/* Coleções */}
        {activeId !== UTILIZADORES_TAB && activeConfig && (
          <>
            {state === 'loading' && (
              <p className="text-center text-petroleo/70 py-16">A carregar os registos...</p>
            )}

            {state === 'error' && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-6 rounded-md">
                <p className="font-bold mb-1">Não foi possível carregar os dados.</p>
                <p className="text-sm">Verifique a sua ligação e as suas permissões.</p>
              </div>
            )}

            {state === 'ready' && (
              <>
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={`Pesquisar em ${activeConfig.label.toLowerCase()}...`}
                    className="flex-grow px-4 py-2 border border-creme-escuro rounded-md focus:outline-none focus:ring-2 focus:ring-terracotta bg-white"
                  />
                  {canCreateActive && (
                    <button
                      onClick={() => setShowForm((v) => !v)}
                      className="bg-terracotta hover:bg-opacity-90 text-white font-montserrat font-medium px-5 py-2 rounded-md transition-colors whitespace-nowrap"
                    >
                      {showForm ? 'Fechar' : `+ Novo ${activeConfig.singular}`}
                    </button>
                  )}
                  <button
                    onClick={handleExport}
                    disabled={filteredRecords.length === 0}
                    className="bg-petroleo hover:bg-opacity-90 text-white font-montserrat font-medium px-5 py-2 rounded-md transition-colors disabled:bg-opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    Exportar CSV
                  </button>
                </div>

                {showForm && canCreateActive && (
                  <RegistoForm
                    config={activeConfig}
                    onCreated={handleCreated}
                    onCancel={() => setShowForm(false)}
                  />
                )}

                <p className="text-sm text-petroleo/60 mb-4">
                  {filteredRecords.length}{' '}
                  {filteredRecords.length === 1 ? 'registo' : 'registos'}
                  {search && ` (de ${activeRecords.length})`}
                </p>

                {filteredRecords.length === 0 ? (
                  <p className="text-center text-petroleo/60 py-16 bg-white rounded-lg border border-creme-escuro">
                    {activeRecords.length === 0
                      ? 'Ainda não existem registos nesta secção.'
                      : 'Nenhum registo corresponde à pesquisa.'}
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredRecords.map((record) => (
                      <RecordCard key={record.id} record={record} config={activeConfig} />
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </main>
  );
}

function RecordCard({
  record,
  config,
}: {
  record: AdminRecord;
  config: CollectionConfig;
}) {
  const title = formatValue(record[config.titleField], {
    key: config.titleField,
    label: '',
  });

  return (
    <article className="bg-white rounded-lg shadow-sm border border-creme-escuro p-6">
      <h3 className="font-montserrat font-semibold text-lg text-petroleo mb-4 break-words">
        {title}
      </h3>
      <dl className="space-y-2 text-sm">
        {config.fields
          .filter((field) => field.key !== config.titleField)
          .map((field) => (
            <div key={field.key} className="grid grid-cols-[minmax(7rem,auto)_1fr] gap-2">
              <dt className="font-montserrat font-medium text-petroleo/60">{field.label}</dt>
              <dd className="text-petroleo break-words whitespace-pre-line">
                {formatValue(record[field.key], field)}
              </dd>
            </div>
          ))}
      </dl>
    </article>
  );
}
