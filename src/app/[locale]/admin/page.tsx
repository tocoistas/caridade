'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db, getFirebaseAuth } from '@/lib/firebase';
import { getCurrentUserDoc, type Utilizador } from '@/lib/auth';
import LoginForm from '@/components/admin/LoginForm';
import AdminDashboard from '@/components/admin/AdminDashboard';

const BOOTSTRAP_ADMIN_EMAIL = 'benone.marcos@gmail.com';

type AuthState =
  | { status: 'checking' }
  | { status: 'unauthenticated' }
  | { status: 'pending'; user: User }
  | { status: 'suspended'; user: User }
  | { status: 'authorized'; user: User; userDoc: Utilizador };

export default function AdminPage() {
  const [authState, setAuthState] = useState<AuthState>({ status: 'checking' });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      getFirebaseAuth(),
      async (currentUser) => {
        if (!currentUser) {
          setAuthState({ status: 'unauthenticated' });
          return;
        }

        try {
          // Admin bootstrap: acesso imediato por e-mail verificado
          if (currentUser.email === BOOTSTRAP_ADMIN_EMAIL) {
            const userDoc = await getCurrentUserDoc(currentUser.uid);
            const effective: Utilizador = userDoc ?? {
              uid: currentUser.uid,
              email: currentUser.email ?? '',
              nomeCompleto: currentUser.displayName ?? '',
              fotoUrl: currentUser.photoURL ?? undefined,
              papel: 'admin',
              estado: 'aprovado',
              criadoEm: null,
            };
            setAuthState({ status: 'authorized', user: currentUser, userDoc: effective });
            return;
          }

          // Verificar documento em utilizadores/{uid}
          const userDoc = await getCurrentUserDoc(currentUser.uid);
          if (userDoc) {
            if (userDoc.estado === 'suspenso') {
              setAuthState({ status: 'suspended', user: currentUser });
            } else if (
              userDoc.estado === 'aprovado' &&
              userDoc.papel !== 'pendente'
            ) {
              setAuthState({ status: 'authorized', user: currentUser, userDoc });
            } else {
              setAuthState({ status: 'pending', user: currentUser });
            }
            return;
          }

          // Retrocompatibilidade: verificar colecção admins (anterior ao novo sistema)
          const legacySnap = await getDoc(doc(db, 'admins', currentUser.uid));
          if (legacySnap.exists()) {
            const legacyDoc: Utilizador = {
              uid: currentUser.uid,
              email: currentUser.email ?? '',
              nomeCompleto: currentUser.displayName ?? '',
              fotoUrl: currentUser.photoURL ?? undefined,
              papel: 'admin',
              estado: 'aprovado',
              criadoEm: null,
            };
            setAuthState({ status: 'authorized', user: currentUser, userDoc: legacyDoc });
            return;
          }

          // Sem documento — conta pendente (ex.: primeiro login email/password)
          setAuthState({ status: 'pending', user: currentUser });
        } catch (err) {
          console.error('Erro ao verificar permissões:', err);
          setAuthState({ status: 'pending', user: currentUser });
        }
      }
    );

    return () => unsubscribe();
  }, []);

  if (authState.status === 'checking') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <p className="text-petroleo/70">A verificar sessão...</p>
      </div>
    );
  }

  if (authState.status === 'unauthenticated') {
    return <LoginForm />;
  }

  if (authState.status === 'pending') {
    return (
      <div className="container mx-auto px-4 max-w-md py-16 md:py-24 text-center">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="font-montserrat font-bold text-2xl text-petroleo mb-2">
            Conta aguarda aprovação
          </h1>
          <p className="text-sm mb-6">
            A conta <strong>{authState.user.email}</strong> foi registada e
            aguarda aprovação pelo administrador. Será notificado quando o
            acesso for concedido.
          </p>
          <button
            onClick={() => signOut(getFirebaseAuth())}
            className="bg-petroleo hover:bg-opacity-90 text-white font-montserrat font-medium px-6 py-2 rounded-md transition-colors"
          >
            Terminar sessão
          </button>
        </div>
      </div>
    );
  }

  if (authState.status === 'suspended') {
    return (
      <div className="container mx-auto px-4 max-w-md py-16 md:py-24 text-center">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="font-montserrat font-bold text-2xl text-terracotta mb-2">
            Conta suspensa
          </h1>
          <p className="text-sm mb-6">
            O acesso da conta <strong>{authState.user.email}</strong> foi
            suspenso. Contacte o administrador para mais informações.
          </p>
          <button
            onClick={() => signOut(getFirebaseAuth())}
            className="bg-petroleo hover:bg-opacity-90 text-white font-montserrat font-medium px-6 py-2 rounded-md transition-colors"
          >
            Terminar sessão
          </button>
        </div>
      </div>
    );
  }

  return <AdminDashboard user={authState.user} userDoc={authState.userDoc} />;
}
