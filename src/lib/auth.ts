import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, getFirebaseAuth } from '@/lib/firebase';

export interface Utilizador {
  uid: string;
  email: string;
  nomeCompleto: string;
  fotoUrl?: string | null;
  papel: 'admin' | 'coordenador' | 'voluntario' | 'profissional' | 'pendente';
  estado: 'pendente' | 'aprovado' | 'suspenso';
  aprovadoPor?: string;
  criadoEm: unknown;
  aprovadoEm?: unknown;
}

const ADMIN_EMAIL = 'benone.marcos@gmail.com';

/** Inicia sessão com conta Google via popup. Cria ou atualiza o doc em utilizadores/{uid}. */
export async function signInWithGoogle(): Promise<void> {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(getFirebaseAuth(), provider);
  await createOrUpdateUserDoc(result.user);
}

/** Termina a sessão do utilizador atual. */
export async function signOut(): Promise<void> {
  await firebaseSignOut(getFirebaseAuth());
}

/**
 * Cria ou atualiza o documento Firestore em utilizadores/{uid}.
 *
 * - Se o e-mail for o admin bootstrap, força papel='admin' e estado='aprovado'.
 * - Se o documento ainda não existir, cria com papel/estado 'pendente' (para outros).
 * - Se o documento já existir (e não for admin), não sobrepõe aprovações existentes.
 */
export async function createOrUpdateUserDoc(user: User): Promise<void> {
  const ref = doc(db, 'utilizadores', user.uid);
  const snap = await getDoc(ref);
  const isAdminEmail = user.email === ADMIN_EMAIL;

  if (!snap.exists()) {
    await setDoc(ref, {
      uid: user.uid,
      email: user.email ?? '',
      nomeCompleto: user.displayName ?? user.email ?? '',
      fotoUrl: user.photoURL ?? null,
      papel: isAdminEmail ? 'admin' : 'pendente',
      estado: isAdminEmail ? 'aprovado' : 'pendente',
      criadoEm: serverTimestamp(),
    });
  } else if (isAdminEmail) {
    // Garante que o admin bootstrap mantém sempre os privilégios corretos.
    const data = snap.data() as Utilizador;
    if (data.papel !== 'admin' || data.estado !== 'aprovado') {
      await setDoc(ref, { papel: 'admin', estado: 'aprovado' }, { merge: true });
    }
  }
  // Para outros utilizadores com doc existente: não sobrepor — preserva aprovações.
}

/** Lê o documento de utilizadores/{uid} do Firestore. Devolve null se não existir. */
export async function getCurrentUserDoc(uid: string): Promise<Utilizador | null> {
  const snap = await getDoc(doc(db, 'utilizadores', uid));
  return snap.exists() ? (snap.data() as Utilizador) : null;
}

/** Observa alterações no estado de autenticação. Devolve a função de unsubscribe. */
export function onAuthChange(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(getFirebaseAuth(), callback);
}
