'use client';

import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { CollectionConfig, FieldDef } from '@/lib/adminCollections';

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
  // Campos editáveis: todos exceto o carimbo temporal (preenchido no servidor).
  const editable = config.fields.filter(
    (f) => f.key !== config.timestampField && f.type !== 'datetime'
  );
  const [values, setValues] = useState<Record<string, string | boolean>>({});
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');

  const setValue = (key: string, value: string | boolean) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const data: Record<string, unknown> = {};
      for (const f of editable) {
        const v = values[f.key];
        if (v === undefined || v === '') continue;
        data[f.key] = f.type === 'number' ? Number(v) : v;
      }
      data[config.timestampField] = serverTimestamp();
      await addDoc(collection(db, config.id), data);
      onCreated();
    } catch (err) {
      console.error('Erro ao criar registo:', err);
      setStatus('error');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-lg border border-creme-escuro p-6 mb-6 space-y-4"
    >
      <h3 className="font-montserrat font-semibold text-lg text-petroleo">
        Novo {config.singular}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {editable.map((field) => (
          <Field key={field.key} field={field} value={values[field.key]} onChange={setValue} />
        ))}
      </div>

      {status === 'error' && (
        <p className="text-red-600 text-sm">Não foi possível guardar. Tente novamente.</p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={status === 'loading'}
          className="bg-petroleo hover:bg-opacity-90 text-white font-montserrat font-medium px-5 py-2 rounded-md transition-colors disabled:opacity-50"
        >
          {status === 'loading' ? 'A guardar...' : 'Guardar'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-white border border-creme-escuro hover:bg-creme text-petroleo font-montserrat font-medium px-5 py-2 rounded-md transition-colors"
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
    <label htmlFor={field.key} className="block font-montserrat font-medium text-petroleo text-sm mb-1">
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
