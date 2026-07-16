'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { countryByCode } from '@/lib/countries';
import CountrySelect from '@/components/CountrySelect';
import PhoneField, { fullPhoneNumber } from '@/components/PhoneField';

const initialFormData = {
    name: '',
    email: '',
    country: '',
    phoneCountry: '',
    phone: '',
    interest: 'Organização e Logística',
    message: '',
};

export default function VoluntarioForm() {
    const t = useTranslations('voluntario');
    const tf = useTranslations('form');
    const [formData, setFormData] = useState(initialFormData);
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCountryChange = (code: string) => {
        setFormData(prev => ({ ...prev, country: code, phoneCountry: prev.phoneCountry || code }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setStatus('loading');
        try {
            await addDoc(collection(db, 'voluntarios'), {
                name: formData.name,
                email: formData.email,
                country: countryByCode(formData.country)?.name ?? '',
                countryCode: formData.country,
                phone: fullPhoneNumber(formData.phoneCountry, formData.phone),
                interest: formData.interest,
                message: formData.message,
                createdAt: serverTimestamp(),
            });
            setStatus('success');
            setFormData(initialFormData);
        } catch (error) {
            console.error("Erro ao submeter o formulário: ", error);
            setStatus('error');
        }
    };

    return (
        <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="font-montserrat font-bold text-3xl text-petroleo mb-6 text-center">{t('formTitle')}</h2>
            <p className="text-center mb-8">{t('formIntro')}</p>

            {status === 'success' ? (
                <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-6 rounded-md shadow-md text-center" role="alert">
                    <p className="font-bold text-xl mb-2">{t('successTitle')}</p>
                    <p>{t('successBody')}</p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="bg-creme p-8 rounded-lg shadow-md space-y-6">
                    <div><label htmlFor="name" className="block font-montserrat font-medium text-petroleo mb-2">{tf('fullName')}</label><input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-2 border border-creme-escuro rounded-md focus:outline-none focus:ring-2 focus:ring-terracotta" required /></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div><label htmlFor="email" className="block font-montserrat font-medium text-petroleo mb-2">{tf('email')}</label><input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2 border border-creme-escuro rounded-md focus:outline-none focus:ring-2 focus:ring-terracotta" required /></div>
                        <CountrySelect id="country" name="country" value={formData.country} onChange={handleCountryChange} required />
                    </div>
                    <PhoneField
                        id="phone"
                        countryCode={formData.phoneCountry}
                        number={formData.phone}
                        onCountryChange={(code) => setFormData(prev => ({ ...prev, phoneCountry: code }))}
                        onNumberChange={(value) => setFormData(prev => ({ ...prev, phone: value }))}
                        required
                    />
                    <div><label htmlFor="interest" className="block font-montserrat font-medium text-petroleo mb-2">{t('interestLabel')}</label><select id="interest" name="interest" value={formData.interest} onChange={handleChange} className="w-full px-4 py-2 border border-creme-escuro rounded-md focus:outline-none focus:ring-2 focus:ring-terracotta bg-white"><option value="Organização e Logística">{t('interestOrg')}</option><option value="Distribuição de Bens">{t('interestDist')}</option><option value="Acolhimento e Cadastro">{t('interestAcolhimento')}</option><option value="Tenho flexibilidade">{t('interestFlex')}</option></select></div>
                    <div><label htmlFor="message" className="block font-montserrat font-medium text-petroleo mb-2">{t('messageLabel')}</label><textarea id="message" name="message" value={formData.message} onChange={handleChange} rows={4} className="w-full px-4 py-2 border border-creme-escuro rounded-md focus:outline-none focus:ring-2 focus:ring-terracotta"></textarea></div>
                    <div className="text-center">
                        <button type="submit" disabled={status === 'loading'} className="bg-terracotta hover:bg-opacity-90 text-white font-montserrat font-medium px-8 py-3 rounded-md inline-block transition-all transform hover:scale-105 disabled:bg-opacity-50 disabled:cursor-not-allowed">
                            {status === 'loading' ? tf('sending') : t('submit')}
                        </button>
                    </div>
                    {status === 'error' && (<p className="text-red-600 text-center mt-4">{t('error')}</p>)}
                </form>
            )}
        </div>
    );
}
