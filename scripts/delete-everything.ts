
import { initializeAdminApp } from '../src/firebase/admin';
import { getAuth, UserRecord } from 'firebase-admin/auth';

const { firebaseApp, firestore } = initializeAdminApp();
const auth = getAuth(firebaseApp);


// Helper to delete all documents from a Firestore collection
async function deleteAllFromCollection(collectionPath: string, batchSize: number = 500) {
  const collectionRef = firestore.collection(collectionPath);
  const query = collectionRef.limit(batchSize);

  return new Promise<void>((resolve, reject) => {
    deleteQueryBatch(query, resolve, reject);
  });
}

function deleteQueryBatch(query: FirebaseFirestore.Query, resolve: () => void, reject: (error: any) => void) {
  query.get()
    .then((snapshot) => {
      if (snapshot.size === 0) {
        return 0;
      }

      const batch = firestore.batch();
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      return batch.commit().then(() => snapshot.size);
    })
    .then((numDeleted) => {
      if (numDeleted === 0) {
        resolve();
        return;
      }
      process.nextTick(() => {
        deleteQueryBatch(query, resolve, reject);
      });
    })
    .catch(reject);
}

// Helper to delete all users from Firebase Auth
async function deleteAllUsers(nextPageToken?: string) {
  const listUsersResult = await auth.listUsers(1000, nextPageToken);
  
  const uids = listUsersResult.users.map((userRecord: UserRecord) => userRecord.uid);
  if (uids.length > 0) {
    await auth.deleteUsers(uids);
    console.log(`Deleted ${uids.length} users.`);
  }

  if (listUsersResult.pageToken) {
    await deleteAllUsers(listUsersResult.pageToken);
  }
}

async function run() {
    console.log('Starting full database and user cleanup...');

    console.log('Deleting all documents from "students" collection...');
    await deleteAllFromCollection('students');
    console.log('"students" collection cleared.');

    console.log('Deleting all documents from "teacher_students" collection...');
    await deleteAllFromCollection('teacher_students');
    console.log('"teacher_students" collection cleared.');

    console.log('Deleting all documents from "classes" collection...');
    await deleteAllFromCollection('classes');
    console.log('"classes" collection cleared.');

    console.log('Deleting all users from Firebase Authentication...');
    await deleteAllUsers();
    console.log('All users have been deleted.');
    
    console.log('Full cleanup complete. The database and user authentication are now empty.');
}

run().catch(error => {
    console.error("An error occurred during cleanup:", error);
});
