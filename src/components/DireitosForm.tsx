'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { api } from '@/lib/api';

const TIPOS = ['acesso', 'rectificacao', 'eliminacao', 'limitacao', 'portabilidade', 'oposicao', 'retirada_consentimento'] as const;

const inputClass =
  'w-full px-4 py-2 border border-creme-escuro rounded-md focus:outline-none focus:ring-2 focus:ring-terracotta';
const labelClass = 'block font-montserrat font-medium text-petroleo mb-2';

/** Pedido de exercício de direitos do titular (RGPD arts. 15.º–22.º; Lei n.º 22/11). */
export default function DireitosForm() {
  const t = useTranslations('direitos');
  const tf = useTranslations('form');
  const [dados, setDados] = useState({ name: '', email: '', tipo: 'acesso' as (typeof TIPOS)[number], descricao: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');
    try {
      await api('/formularios/direitos', { body: dados });
      setStatus('success');
      setDados({ name: '', email: '', tipo: 'acesso', descricao: '' });
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-6 rounded-md shadow-md" role="alert">
        <p className="font-bold text-xl mb-2">{t('successTitle')}</p>
        <p>{t('successBody')}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-creme p-8 rounded-lg shadow-md space-y-6">
      <div>
        <label htmlFor="name" className={labelClass}>{tf('fullName')}</label>
        <input id="name" type="text" value={dados.name} onChange={(e) => setDados({ ...dados, name: e.target.value })} maxLength={200} className={inputClass} required />
      </div>
      <div>
        <label htmlFor="email" className={labelClass}>{tf('email')}</label>
        <input id="email" type="email" value={dados.email} onChange={(e) => setDados({ ...dados, email: e.target.value })} maxLength={320} className={inputClass} required />
        <p className="text-xs text-petroleo/60 mt-1">{t('emailHint')}</p>
      </div>
      <div>
        <label htmlFor="tipo" className={labelClass}>{t('typeLabel')}</label>
        <select id="tipo" value={dados.tipo} onChange={(e) => setDados({ ...dados, tipo: e.target.value as (typeof TIPOS)[number] })} className={inputClass}>
          {TIPOS.map((tipo) => (
            <option key={tipo} value={tipo}>{t(`types.${tipo}`)}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="descricao" className={labelClass}>{t('detailsLabel')}</label>
        <textarea id="descricao" rows={4} value={dados.descricao} onChange={(e) => setDados({ ...dados, descricao: e.target.value })} maxLength={5000} className={inputClass} />
        <p className="text-xs text-petroleo/60 mt-1">{t('detailsHint')}</p>
      </div>
      {status === 'error' && <p className="text-red-600 text-sm" role="alert">{t('error')}</p>}
      <button type="submit" disabled={status === 'loading'} className="w-full bg-terracotta hover:bg-opacity-90 text-white font-montserrat font-bold px-8 py-3 rounded-md transition-all disabled:opacity-50">
        {status === 'loading' ? tf('sending') : t('submit')}
      </button>
    </form>
  );
}
