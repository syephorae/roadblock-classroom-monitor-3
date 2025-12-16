import { initializeApp, getApps, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// This file initializes the Firebase Admin SDK for the server-side.

const ADMIN_APP_NAME = 'admin';

/**
 * Initializes the Firebase Admin SDK, creating a new app instance if one doesn't already exist.
 * When running in a Firebase environment (like Cloud Functions), the SDK automatically
 * uses Application Default Credentials, so no manual configuration is needed.
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

  // If not initialized, create a new app instance.
  // By passing an empty configuration, the SDK will use Application Default Credentials.
  // We pass the name to ensure we can identify this specific instance later.
  const firebaseApp = initializeApp({}, ADMIN_APP_NAME);

  return {
    firebaseApp,
    firestore: getFirestore(firebaseApp),
  };
}
