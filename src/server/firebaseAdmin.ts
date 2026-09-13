import 'server-only';
import { applicationDefault, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

/** Base Firestore nomeada do projecto — nunca usar a base `(default)`. */
export const DATABASE_ID = 'caridade';

let app: App | undefined;
let db: Firestore | undefined;

/**
 * Firestore com privilégios de servidor (Admin SDK).
 *
 * - Produção (Firebase App Hosting / Cloud Run): credenciais da service account do
 *   backend via Application Default Credentials — não existem chaves no repositório.
 * - Local: `gcloud auth application-default login`, ou o emulador quando
 *   `FIRESTORE_EMULATOR_HOST` está definido (testes).
 *
 * Inicialização preguiçosa para não exigir credenciais durante o build.
 */
export function adminDb(): Firestore {
  if (!db) {
    const emulador = Boolean(process.env.FIRESTORE_EMULATOR_HOST);
    app =
      getApps()[0] ??
      initializeApp(
        emulador
          ? { projectId: process.env.GCLOUD_PROJECT ?? 'demo-caridade' }
          : { credential: applicationDefault(), projectId: process.env.GOOGLE_CLOUD_PROJECT ?? process.env.GCLOUD_PROJECT }
      );
    db = getFirestore(app, DATABASE_ID);
  }
  return db;
}
