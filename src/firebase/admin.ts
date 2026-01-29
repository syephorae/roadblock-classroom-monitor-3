import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { join } from 'path';

// This file initializes the Firebase Admin SDK for the server-side.

const ADMIN_APP_NAME = 'admin';

/**
 * Initializes the Firebase Admin SDK with service account credentials.
 */
export function initializeAdminApp() {
  // Check if the 'admin' app has already been initialized.
  const alreadyInitializedApp = getApps().find(app => app.name === ADMIN_APP_NAME);
  if (alreadyInitializedApp) {
    return {
      firebaseApp: alreadyInitializedApp,
      firestore: getFirestore(alreadyInitializedApp),
    };
  }

  // Load service account from file
  const serviceAccountPath = join(process.cwd(), 'studio-4099736194-7143c-firebase-adminsdk-fbsvc-1c09d7ebde.json');
  const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

  // Initialize with service account credentials
  const firebaseApp = initializeApp({
    credential: cert(serviceAccount),
  }, ADMIN_APP_NAME);

  return {
    firebaseApp,
    firestore: getFirestore(firebaseApp),
  };
}
