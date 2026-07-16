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
    birthdate: '',
    id_number: '',
    country: '',
    phoneCountry: '',
    phone: '',
    email: '',
    address: '',
    adults: 1,
    children: 0,
    situation: '',
    supportNeeded: {
        alimento: false,
        roupa: false,
        saude: false,
        outro: false,
    },
    consent: false,
};

export default function CadastroBeneficiarioForm() {
    const t = useTranslations('cadastro');
    const tf = useTranslations('form');
    const [formData, setFormData] = useState(initialFormData);
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        if (name === 'consent') {
            setFormData(prev => ({ ...prev, consent: (e.target as HTMLInputElement).checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleCountryChange = (code: string) => {
        setFormData(prev => ({ ...prev, country: code, phoneCountry: prev.phoneCountry || code }));
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            supportNeeded: {
                ...prev.supportNeeded,
                [name]: checked,
            },
        }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!formData.consent) {
            alert(t('consentRequired'));
            return;
        }
        setStatus('loading');
        try {
            const { phoneCountry, country, ...rest } = formData;
            await addDoc(collection(db, 'beneficiarios'), {
                ...rest,
                country: countryByCode(country)?.name ?? '',
                countryCode: country,
                phone: fullPhoneNumber(phoneCountry, formData.phone),
                supportNeeded: Object.entries(formData.supportNeeded)
                    .filter(([, checked]) => checked)
                    .map(([type]) => type),
                createdAt: serverTimestamp(),
            });
            setStatus('success');
            setFormData(initialFormData);
        } catch (error) {
            console.error("Erro ao submeter o pedido: ", error);
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
                <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md space-y-6">
                    <h3 className="font-montserrat font-semibold text-xl text-petroleo border-b border-creme-escuro pb-2">{t('sectionPersonal')}</h3>
                    <div><label htmlFor="name" className="block font-montserrat font-medium text-petroleo mb-2">{tf('fullName')}</label><input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-2 border border-creme-escuro rounded-md focus:outline-none focus:ring-2 focus:ring-terracotta" required /></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div><label htmlFor="birthdate" className="block font-montserrat font-medium text-petroleo mb-2">{t('birthdate')}</label><input type="date" id="birthdate" name="birthdate" value={formData.birthdate} onChange={handleChange} className="w-full px-4 py-2 border border-creme-escuro rounded-md focus:outline-none focus:ring-2 focus:ring-terracotta" required /></div>
                        <div><label htmlFor="id_number" className="block font-montserrat font-medium text-petroleo mb-2">{t('idNumber')}</label><input type="text" id="id_number" name="id_number" value={formData.id_number} onChange={handleChange} className="w-full px-4 py-2 border border-creme-escuro rounded-md focus:outline-none focus:ring-2 focus:ring-terracotta" required /></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <CountrySelect id="country" name="country" value={formData.country} onChange={handleCountryChange} required />
                        <div><label htmlFor="email" className="block font-montserrat font-medium text-petroleo mb-2">{tf('emailOptional')}</label><input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2 border border-creme-escuro rounded-md focus:outline-none focus:ring-2 focus:ring-terracotta" /></div>
                    </div>
                    <PhoneField
                        id="phone"
                        label={t('phone')}
                        countryCode={formData.phoneCountry}
                        number={formData.phone}
                        onCountryChange={(code) => setFormData(prev => ({ ...prev, phoneCountry: code }))}
                        onNumberChange={(value) => setFormData(prev => ({ ...prev, phone: value }))}
                        required
                    />
                    <div><label htmlFor="address" className="block font-montserrat font-medium text-petroleo mb-2">{t('address')}</label><textarea id="address" name="address" value={formData.address} onChange={handleChange} rows={3} className="w-full px-4 py-2 border border-creme-escuro rounded-md focus:outline-none focus:ring-2 focus:ring-terracotta" required></textarea></div>
                    <h3 className="font-montserrat font-semibold text-xl text-petroleo border-b border-creme-escuro pb-2 pt-4">{t('sectionHousehold')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div><label htmlFor="adults" className="block font-montserrat font-medium text-petroleo mb-2">{t('adults')}</label><input type="number" id="adults" name="adults" value={formData.adults} onChange={handleChange} min="1" className="w-full px-4 py-2 border border-creme-escuro rounded-md focus:outline-none focus:ring-2 focus:ring-terracotta" required /></div>
                        <div><label htmlFor="children" className="block font-montserrat font-medium text-petroleo mb-2">{t('children')}</label><input type="number" id="children" name="children" value={formData.children} onChange={handleChange} min="0" className="w-full px-4 py-2 border border-creme-escuro rounded-md focus:outline-none focus:ring-2 focus:ring-terracotta" required /></div>
                    </div>
                    <div><label htmlFor="situation" className="block font-montserrat font-medium text-petroleo mb-2">{t('situation')}</label><textarea id="situation" name="situation" value={formData.situation} onChange={handleChange} rows={4} className="w-full px-4 py-2 border border-creme-escuro rounded-md focus:outline-none focus:ring-2 focus:ring-terracotta" required></textarea></div>
                    <div><label className="block font-montserrat font-medium text-petroleo mb-2">{t('supportLabel')}</label><div className="space-y-2 mt-2"><div className="flex items-center"><input type="checkbox" id="apoio_alimento" name="alimento" checked={formData.supportNeeded.alimento} onChange={handleCheckboxChange} className="h-4 w-4 text-terracotta focus:ring-terracotta border-gray-300 rounded" /><label htmlFor="apoio_alimento" className="ml-2">{t('supportFood')}</label></div><div className="flex items-center"><input type="checkbox" id="apoio_roupa" name="roupa" checked={formData.supportNeeded.roupa} onChange={handleCheckboxChange} className="h-4 w-4 text-terracotta focus:ring-terracotta border-gray-300 rounded" /><label htmlFor="apoio_roupa" className="ml-2">{t('supportClothing')}</label></div><div className="flex items-center"><input type="checkbox" id="apoio_saude" name="saude" checked={formData.supportNeeded.saude} onChange={handleCheckboxChange} className="h-4 w-4 text-terracotta focus:ring-terracotta border-gray-300 rounded" /><label htmlFor="apoio_saude" className="ml-2">{t('supportHealth')}</label></div><div className="flex items-center"><input type="checkbox" id="apoio_outro" name="outro" checked={formData.supportNeeded.outro} onChange={handleCheckboxChange} className="h-4 w-4 text-terracotta focus:ring-terracotta border-gray-300 rounded" /><label htmlFor="apoio_outro" className="ml-2">{t('supportOther')}</label></div></div></div>
                    <div className="pt-4"><div className="flex items-start"><input type="checkbox" id="consent" name="consent" checked={formData.consent} onChange={handleChange} className="h-4 w-4 text-terracotta focus:ring-terracotta border-gray-300 rounded mt-1" required /><label htmlFor="consent" className="ml-2">{t('consent')}</label></div></div>
                    <div className="text-center pt-4"><button type="submit" disabled={status === 'loading'} className="bg-petroleo hover:bg-opacity-90 text-white font-montserrat font-bold px-10 py-3 rounded-md inline-block transition-all transform hover:scale-105 disabled:bg-opacity-50 disabled:cursor-not-allowed">{status === 'loading' ? t('submitting') : t('submit')}</button></div>
                    {status === 'error' && (<p className="text-red-600 text-center mt-4">{t('error')}</p>)}
                </form>
            )}
        </div>
    );
}
