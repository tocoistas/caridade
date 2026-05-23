'use client';

import { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function ContactoForm() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');
    try {
      await addDoc(collection(db, 'contactos'), {
        ...formData,
        createdAt: serverTimestamp(),
      });
      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error("Erro ao enviar mensagem: ", error);
      setStatus('error');
    }
  };

  return (
    <div>
      <h2 className="font-montserrat font-bold text-3xl text-petroleo mb-6">Envie-nos uma Mensagem</h2>
      {status === 'success' ? (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-6 rounded-md shadow-md text-center" role="alert">
          <p className="font-bold text-xl mb-2">Mensagem enviada com sucesso!</p>
          <p>Obrigado por nos contactar. Responderemos assim que possível.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-creme p-8 rounded-lg shadow-md space-y-6">
          <div><label htmlFor="name" className="block font-montserrat font-medium text-petroleo mb-2">Nome Completo</label><input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-2 border border-creme-escuro rounded-md focus:outline-none focus:ring-2 focus:ring-terracotta" required /></div>
          <div><label htmlFor="email" className="block font-montserrat font-medium text-petroleo mb-2">E-mail</label><input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2 border border-creme-escuro rounded-md focus:outline-none focus:ring-2 focus:ring-terracotta" required /></div>
          <div><label htmlFor="subject" className="block font-montserrat font-medium text-petroleo mb-2">Assunto</label><input type="text" id="subject" name="subject" value={formData.subject} onChange={handleChange} className="w-full px-4 py-2 border border-creme-escuro rounded-md focus:outline-none focus:ring-2 focus:ring-terracotta" required /></div>
          <div><label htmlFor="message" className="block font-montserrat font-medium text-petroleo mb-2">Sua Mensagem</label><textarea id="message" name="message" value={formData.message} onChange={handleChange} rows={5} className="w-full px-4 py-2 border border-creme-escuro rounded-md focus:outline-none focus:ring-2 focus:ring-terracotta" required></textarea></div>
          <div className="text-center">
            <button type="submit" disabled={status === 'loading'} className="bg-terracotta hover:bg-opacity-90 text-white font-montserrat font-bold px-8 py-3 rounded-md inline-block transition-all transform hover:scale-105 disabled:bg-opacity-50 disabled:cursor-not-allowed">
              {status === 'loading' ? 'A Enviar...' : 'Enviar Mensagem'}
            </button>
          </div>
          {status === 'error' && (<p className="text-red-600 text-center mt-4">Ocorreu um erro ao enviar a sua mensagem. Por favor, tente novamente mais tarde.</p>)}
        </form>
      )}
    </div>
  );
}

