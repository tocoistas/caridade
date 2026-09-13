'use client';

import { useCallback, useEffect, useState } from 'react';
import { obterSessao, terminarSessao, type Utilizador } from '@/lib/auth';
import LoginForm from '@/components/admin/LoginForm';
import AlterarPasswordForm from '@/components/admin/AlterarPasswordForm';
import AdminDashboard from '@/components/admin/AdminDashboard';
import BeneficiarioPortal from '@/components/admin/BeneficiarioPortal';

type Estado =
  | { status: 'checking' }
  | { status: 'error' }
  | { status: 'unauthenticated' }
  | { status: 'ok'; utilizador: Utilizador };

export default function AdminPage() {
  const [estado, setEstado] = useState<Estado>({ status: 'checking' });

  useEffect(() => {
    let ignore = false;
    obterSessao()
      .then((utilizador) => {
        if (!ignore) setEstado(utilizador ? { status: 'ok', utilizador } : { status: 'unauthenticated' });
      })
      .catch(() => {
        if (!ignore) setEstado({ status: 'error' });
      });
    return () => {
      ignore = true;
    };
  }, []);

  const autenticado = useCallback((utilizador: Utilizador) => setEstado({ status: 'ok', utilizador }), []);

  const sair = useCallback(async () => {
    try {
      await terminarSessao();
    } finally {
      setEstado({ status: 'unauthenticated' });
    }
  }, []);

  if (estado.status === 'checking') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <p className="text-petroleo/70">A verificar sessão...</p>
      </div>
    );
  }

  if (estado.status === 'error') {
    return (
      <Cartao titulo="Não foi possível verificar a sessão">
        <p className="text-sm mb-6">Verifique a sua ligação e recarregue a página.</p>
      </Cartao>
    );
  }

  if (estado.status === 'unauthenticated') {
    return <LoginForm onAutenticado={autenticado} />;
  }

  const { utilizador } = estado;

  if (utilizador.alterarPassword) {
    return <AlterarPasswordForm utilizador={utilizador} onConcluido={autenticado} onSair={sair} />;
  }

  if (utilizador.estado !== 'aprovado' || utilizador.papel === 'pendente') {
    return (
      <Cartao titulo="Conta aguarda aprovação">
        <p className="text-sm mb-6">
          A conta <strong>{utilizador.email}</strong> foi registada e aguarda aprovação por um administrador.
        </p>
        <BotaoSair onSair={sair} />
      </Cartao>
    );
  }

  if (utilizador.papel === 'beneficiario') {
    return <BeneficiarioPortal utilizador={utilizador} onSair={sair} />;
  }

  return <AdminDashboard utilizador={utilizador} onSair={sair} />;
}

function Cartao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="container mx-auto px-4 max-w-md py-16 md:py-24 text-center">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="font-montserrat font-bold text-2xl text-petroleo mb-2">{titulo}</h1>
        {children}
      </div>
    </div>
  );
}

function BotaoSair({ onSair }: { onSair: () => void }) {
  return (
    <button
      onClick={onSair}
      className="bg-petroleo hover:bg-opacity-90 text-white font-montserrat font-medium px-6 py-2 rounded-md transition-colors"
    >
      Terminar sessão
    </button>
  );
}
