'use client';

import { useState } from 'react';
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
            alert("É necessário aceitar os termos para submeter o pedido.");
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
            <h2 className="font-montserrat font-bold text-3xl text-petroleo mb-6 text-center">Formulário de Cadastro</h2>
            <p className="text-center mb-8">Após o envio, a nossa equipa de acção social analisará o seu pedido e entrará em contacto para uma entrevista de acolhimento. Se tiver dificuldades, pode dirigir-se à nossa sede.</p>

            {status === 'success' ? (
                <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-6 rounded-md shadow-md text-center" role="alert">
                    <p className="font-bold text-xl mb-2">Pedido enviado com sucesso!</p>
                    <p>Obrigado por nos contactar. A nossa equipa de acção social irá analisar o seu pedido e entrará em contacto consigo em breve.</p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md space-y-6">
                    <h3 className="font-montserrat font-semibold text-xl text-petroleo border-b border-creme-escuro pb-2">Informações Pessoais do Responsável</h3>
                    <div><label htmlFor="name" className="block font-montserrat font-medium text-petroleo mb-2">Nome Completo</label><input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-2 border border-creme-escuro rounded-md focus:outline-none focus:ring-2 focus:ring-terracotta" required /></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div><label htmlFor="birthdate" className="block font-montserrat font-medium text-petroleo mb-2">Data de Nascimento</label><input type="date" id="birthdate" name="birthdate" value={formData.birthdate} onChange={handleChange} className="w-full px-4 py-2 border border-creme-escuro rounded-md focus:outline-none focus:ring-2 focus:ring-terracotta" required /></div>
                        <div><label htmlFor="id_number" className="block font-montserrat font-medium text-petroleo mb-2">Documento de Identificação (Nº)</label><input type="text" id="id_number" name="id_number" value={formData.id_number} onChange={handleChange} className="w-full px-4 py-2 border border-creme-escuro rounded-md focus:outline-none focus:ring-2 focus:ring-terracotta" required /></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <CountrySelect id="country" name="country" value={formData.country} onChange={handleCountryChange} required />
                        <div><label htmlFor="email" className="block font-montserrat font-medium text-petroleo mb-2">E-mail (Opcional)</label><input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2 border border-creme-escuro rounded-md focus:outline-none focus:ring-2 focus:ring-terracotta" /></div>
                    </div>
                    <PhoneField
                        id="phone"
                        label="Telefone de Contacto"
                        countryCode={formData.phoneCountry}
                        number={formData.phone}
                        onCountryChange={(code) => setFormData(prev => ({ ...prev, phoneCountry: code }))}
                        onNumberChange={(value) => setFormData(prev => ({ ...prev, phone: value }))}
                        required
                    />
                    <div><label htmlFor="address" className="block font-montserrat font-medium text-petroleo mb-2">Morada Completa (Bairro, Rua, Nº)</label><textarea id="address" name="address" value={formData.address} onChange={handleChange} rows={3} className="w-full px-4 py-2 border border-creme-escuro rounded-md focus:outline-none focus:ring-2 focus:ring-terracotta" required></textarea></div>
                    <h3 className="font-montserrat font-semibold text-xl text-petroleo border-b border-creme-escuro pb-2 pt-4">Informações do Agregado Familiar</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div><label htmlFor="adults" className="block font-montserrat font-medium text-petroleo mb-2">Nº de Adultos</label><input type="number" id="adults" name="adults" value={formData.adults} onChange={handleChange} min="1" className="w-full px-4 py-2 border border-creme-escuro rounded-md focus:outline-none focus:ring-2 focus:ring-terracotta" required /></div>
                        <div><label htmlFor="children" className="block font-montserrat font-medium text-petroleo mb-2">Nº de Crianças (até 17 anos)</label><input type="number" id="children" name="children" value={formData.children} onChange={handleChange} min="0" className="w-full px-4 py-2 border border-creme-escuro rounded-md focus:outline-none focus:ring-2 focus:ring-terracotta" required /></div>
                    </div>
                    <div><label htmlFor="situation" className="block font-montserrat font-medium text-petroleo mb-2">Descreva brevemente a sua situação e as suas principais necessidades</label><textarea id="situation" name="situation" value={formData.situation} onChange={handleChange} rows={4} className="w-full px-4 py-2 border border-creme-escuro rounded-md focus:outline-none focus:ring-2 focus:ring-terracotta" required></textarea></div>
                    <div><label className="block font-montserrat font-medium text-petroleo mb-2">Tipo de Apoio Necessário</label><div className="space-y-2 mt-2"><div className="flex items-center"><input type="checkbox" id="apoio_alimento" name="alimento" checked={formData.supportNeeded.alimento} onChange={handleCheckboxChange} className="h-4 w-4 text-terracotta focus:ring-terracotta border-gray-300 rounded" /><label htmlFor="apoio_alimento" className="ml-2">Cesta Básica</label></div><div className="flex items-center"><input type="checkbox" id="apoio_roupa" name="roupa" checked={formData.supportNeeded.roupa} onChange={handleCheckboxChange} className="h-4 w-4 text-terracotta focus:ring-terracotta border-gray-300 rounded" /><label htmlFor="apoio_roupa" className="ml-2">Vestuário e Calçado</label></div><div className="flex items-center"><input type="checkbox" id="apoio_saude" name="saude" checked={formData.supportNeeded.saude} onChange={handleCheckboxChange} className="h-4 w-4 text-terracotta focus:ring-terracotta border-gray-300 rounded" /><label htmlFor="apoio_saude" className="ml-2">Apoio à Saúde (médico/psicológico)</label></div><div className="flex items-center"><input type="checkbox" id="apoio_outro" name="outro" checked={formData.supportNeeded.outro} onChange={handleCheckboxChange} className="h-4 w-4 text-terracotta focus:ring-terracotta border-gray-300 rounded" /><label htmlFor="apoio_outro" className="ml-2">Outro (especificar na descrição acima)</label></div></div></div>
                    <div className="pt-4"><div className="flex items-start"><input type="checkbox" id="consent" name="consent" checked={formData.consent} onChange={handleChange} className="h-4 w-4 text-terracotta focus:ring-terracotta border-gray-300 rounded mt-1" required /><label htmlFor="consent" className="ml-2">Declaro que as informações prestadas são verdadeiras e autorizo o Projecto Caridade a contactar-me para dar seguimento ao meu pedido de apoio, de acordo com a sua política de privacidade.</label></div></div>
                    <div className="text-center pt-4"><button type="submit" disabled={status === 'loading'} className="bg-petroleo hover:bg-opacity-90 text-white font-montserrat font-bold px-10 py-3 rounded-md inline-block transition-all transform hover:scale-105 disabled:bg-opacity-50 disabled:cursor-not-allowed">{status === 'loading' ? 'A Enviar Pedido...' : 'Enviar Pedido de Apoio'}</button></div>
                    {status === 'error' && (<p className="text-red-600 text-center mt-4">Ocorreu um erro ao enviar o seu pedido. Por favor, tente novamente mais tarde.</p>)}
                </form>
            )}
        </div>
    );
}

