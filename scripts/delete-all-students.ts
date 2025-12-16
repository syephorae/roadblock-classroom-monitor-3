
import { initializeAdminApp } from '../src/firebase/admin';

const { firestore } = initializeAdminApp();

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

      return batch.commit().then(() => {
        return snapshot.size;
      });
    })
    .then((numDeleted) => {
      if (numDeleted === 0) {
        resolve();
        return;
      }
      // Recurse on the next process tick, to avoid
      // exploding the stack.
      process.nextTick(() => {
        deleteQueryBatch(query, resolve, reject);
      });
    })
    .catch(reject);
}

async function run() {
    console.log('Starting cleanup...');

    console.log('Deleting all documents from "students" collection...');
    await deleteAllFromCollection('students');
    console.log('"students" collection cleared.');

    console.log('Deleting all documents from "teacher_students" collection...');
    await deleteAllFromCollection('teacher_students');
    console.log('"teacher_students" collection cleared.');
    
    console.log('Cleanup complete. The database is now in a clean state.');
}

run().catch(console.error);
