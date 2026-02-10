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

  let serviceAccount;

  // Try to load from environment variable first (for deployment)
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
    try {
      serviceAccount = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
    } catch (error) {
      console.error('Failed to parse GOOGLE_APPLICATION_CREDENTIALS_JSON:', error);
      throw new Error('Invalid GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable');
    }
  } else {
    // Fall back to local file (for development)
    const serviceAccountPath = join(process.cwd(), 'studio-4099736194-7143c-firebase-adminsdk-fbsvc-1c09d7ebde.json');
    serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
  }

  // Initialize with service account credentials
  const firebaseApp = initializeApp({
    credential: cert(serviceAccount),
  }, ADMIN_APP_NAME);

  return {
    firebaseApp,
    firestore: getFirestore(firebaseApp),
  };
}
