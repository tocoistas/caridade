'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db, getFirebaseAuth } from '@/lib/firebase';
import LoginForm from '@/components/admin/LoginForm';
import AdminDashboard from '@/components/admin/AdminDashboard';

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const snap = await getDoc(doc(db, 'admins', currentUser.uid));
          setIsAdmin(snap.exists());
        } catch (err) {
          console.error('Erro ao verificar permissões: ', err);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
      setChecking(false);
    });

    return () => unsubscribe();
  }, []);

  if (checking) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <p className="text-petroleo/70">A verificar sessão...</p>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 max-w-md py-16 md:py-24 text-center">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="font-montserrat font-bold text-2xl text-petroleo mb-2">
            Acesso não autorizado
          </h1>
          <p className="text-sm mb-6">
            A conta <strong>{user.email}</strong> não tem permissões de
            administrador para consultar os cadastros.
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

  return <AdminDashboard user={user} />;
}
