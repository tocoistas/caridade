'use client';

import { useState } from 'react';
import { api, ApiErro } from '@/lib/api';
import type { CollectionConfig, FieldDef } from '@/lib/adminCollections';
import { camposDerivados, REFERENCIAS } from '@/lib/referencias';
import CampoReferencia, { type Pessoa } from '@/components/admin/CampoReferencia';

/** Formulário genérico para criar um registo numa coleção operacional. */
export default function RegistoForm({
  config,
  onCreated,
  onCancel,
}: {
  config: CollectionConfig;
  onCreated: () => void;
  onCancel: () => void;
}) {
  const referencias = REFERENCIAS[config.id] ?? [];
  // Campos escritos pelo servidor a partir das referências (código e nome da
  // pessoa) não se editam à mão — sairiam dessincronizados do cadastro.
  const geridos = new Set([
    ...referencias.map((r) => r.campoId),
    ...camposDerivados(config.id),
    config.timestampField,
  ]);
  const editable = config.fields.filter((f) => !geridos.has(f.key) && f.type !== 'datetime');

  const [values, setValues] = useState<Record<string, string | boolean>>({});
  const [pessoas, setPessoas] = useState<Record<string, Pessoa | null>>({});
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [erro, setErro] = useState('');

  const setValue = (key: string, value: string | boolean) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const emFalta = referencias.filter((r) => r.obrigatoria && !pessoas[r.campoId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (emFalta.length > 0) {
      setErro(`Escolha ${emFalta.map((r) => r.label.toLowerCase()).join(' e ')} no cadastro.`);
      setStatus('error');
      return;
    }
    setStatus('loading');
    setErro('');
    try {
      const data: Record<string, string> = {};
      for (const f of editable) {
        const v = values[f.key];
        if (v === undefined || v === '') continue;
        data[f.key] = String(v);
      }
      // Só o id segue para o servidor: é ele que escreve código e nome.
      for (const ref of referencias) {
        const pessoa = pessoas[ref.campoId];
        if (pessoa) data[ref.campoId] = pessoa.id;
      }
      await api(`/registos/${config.id}`, { body: data });
      onCreated();
    } catch (err) {
      setErro(err instanceof ApiErro ? err.message : 'Não foi possível guardar. Tente novamente.');
      setStatus('error');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 space-y-4 rounded-lg border border-creme-escuro bg-white p-6">
      <h3 className="font-montserrat text-lg font-semibold text-petroleo">Adicionar {config.singular}</h3>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {referencias.map((ref) => (
          <CampoReferencia
            key={ref.campoId}
            def={ref}
            valor={pessoas[ref.campoId] ?? null}
            onChange={(pessoa) => setPessoas((prev) => ({ ...prev, [ref.campoId]: pessoa }))}
          />
        ))}
        {editable.map((field) => (
          <Field key={field.key} field={field} value={values[field.key]} onChange={setValue} />
        ))}
      </div>

      {status === 'error' && (
        <p className="text-sm text-red-600" role="alert">
          {erro}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={status === 'loading'}
          className="rounded-md bg-petroleo px-5 py-2 font-montserrat font-medium text-white transition-colors hover:bg-opacity-90 disabled:opacity-50"
        >
          {status === 'loading' ? 'A guardar…' : 'Guardar'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-creme-escuro bg-white px-5 py-2 font-montserrat font-medium text-petroleo transition-colors hover:bg-creme"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

function Field({
  field,
  value,
  onChange,
}: {
  field: FieldDef;
  value: string | boolean | undefined;
  onChange: (key: string, value: string | boolean) => void;
}) {
  const base =
    'w-full px-3 py-2 border border-creme-escuro rounded-md focus:outline-none focus:ring-2 focus:ring-terracotta';

  const label = (
    <label htmlFor={field.key} className="mb-1 block font-montserrat text-sm font-medium text-petroleo">
      {field.label}
    </label>
  );

  if (field.type === 'longtext') {
    return (
      <div className="md:col-span-2">
        {label}
        <textarea
          id={field.key}
          rows={3}
          value={(value as string) ?? ''}
          onChange={(e) => onChange(field.key, e.target.value)}
          className={base}
        />
      </div>
    );
  }

  const inputType =
    field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : field.type === 'email' ? 'email' : 'text';

  return (
    <div>
      {label}
      <input
        id={field.key}
        type={inputType}
        value={(value as string) ?? ''}
        onChange={(e) => onChange(field.key, e.target.value)}
        className={base}
      />
    </div>
  );
}
