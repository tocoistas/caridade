'use client';

import { useState } from 'react';

export default function DoarDinheiroForm() {
    const [copyFeedback, setCopyFeedback] = useState(false);
    const iban = 'AO06 0000 0000 0000 0000 0000 0';

    const handleCopy = () => {
        navigator.clipboard.writeText(iban).then(() => {
            setCopyFeedback(true);
            setTimeout(() => {
                setCopyFeedback(false);
            }, 2000);
        }).catch(err => {
            console.error('Erro ao copiar o IBAN: ', err);
            alert('Não foi possível copiar o IBAN. Por favor, tente manualmente.');
        });
    };

    return (
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Transferência Bancária */}
            <div className="bg-white rounded-lg shadow-lg p-8">
                <h3 className="font-montserrat font-semibold text-2xl text-petroleo mb-6">Transferência Bancária</h3>
                <div className="space-y-4 text-lg">
                    <p><strong>Titular:</strong> Projecto Caridade</p>
                    <p><strong>Banco:</strong> Banco de Exemplo, S.A.</p>
                    <div><p className="mb-1"><strong>IBAN:</strong></p><div className="flex items-center bg-creme p-3 rounded-md"><span className="flex-grow font-mono text-sm md:text-base">{iban}</span><button onClick={handleCopy} className="ml-4 p-2 bg-terracotta text-white rounded-md hover:bg-opacity-90 transition-all" title="Copiar IBAN"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg></button></div>{copyFeedback && <span className="text-sm text-green-600 mt-1">IBAN copiado!</span>}</div>
                </div>
            </div>
            {/* QR Code */}
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                <h3 className="font-montserrat font-semibold text-2xl text-petroleo mb-6">Pagamento Móvel</h3>
                <p className="mb-4">Use a câmara do seu telemóvel para doar de forma rápida e segura através do seu aplicativo de pagamentos.</p>
                <div className="w-48 h-48 bg-gray-200 mx-auto rounded-md flex items-center justify-center">
                    <p className="text-gray-500">QR Code aqui</p>
                </div>
            </div>
        </div>
    );
}

