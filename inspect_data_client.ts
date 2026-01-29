// This script uses the Firebase CLIENT SDK (via 'firebase' package) 
// to inspect data, bypassing the need for Admin SDK credentials.

// We need to shim some browser globals for the client SDK to work in Node
// @ts-ignore
global.XMLHttpRequest = require('xhr2');
// @ts-ignore
global.self = global;

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, documentId } from 'firebase/firestore';
import { firebaseConfig } from './src/firebase/config'; // Implies we can import ts? 
// No, we should probably hardcode the config here to avoid TS path issues if we run with tsx loosely
// or just import if tsx handles it. tsx should handle it.

const config = {
    "projectId": "studio-4099736194-7143c",
    "appId": "1:920824243119:web:7c83dbc9af0ff99de8855a",
    "apiKey": "AIzaSyDGeRIiCCk1Bmw8AZzkcJ6eAAiGQvmeeMY",
    "authDomain": "studio-4099736194-7143c.firebaseapp.com",
};

async function inspect() {
    console.log("Initializing Firebase Client...");
    const app = initializeApp(config);
    const db = getFirestore(app);

    const teacherId = '405oHRmrwNeX6CzoSHQnWKII4w12'; // From screenshot

    console.log(`\n--- Inspecting Classes (Teacher: ${teacherId}) ---`);

    // 1. Fetch ALL classes
    try {
        const allUrl = query(collection(db, 'classes'));
        const allSnapshot = await getDocs(allUrl);
        console.log(`Total classes in DB: ${allSnapshot.size}`);
        allSnapshot.forEach(doc => {
            const d = doc.data();
            console.log(`[${doc.id}] ${d.name} (Teacher: ${d.teacherId})`);
        });
    } catch (e) {
        console.error("Error fetching all classes:", e);
    }

    // 2. Fetch Teacher's Students and check their classIds
    console.log(`\n--- Inspecting Students for Teacher ---`);
    try {
        const linksQ = query(collection(db, 'teacher_students'), where('teacherId', '==', teacherId));
        const linksSnap = await getDocs(linksQ);
        const studentIds = linksSnap.docs.map(d => d.data().studentId);
        console.log(`Linked Student IDs (${studentIds.length}):`, studentIds);

        if (studentIds.length > 0) {
            const chunks = studentIds.slice(0, 10);
            const studentsQ = query(collection(db, 'students'), where(documentId(), 'in', chunks));
            const studentsSnap = await getDocs(studentsQ);

            studentsSnap.forEach(doc => {
                const d = doc.data();
                console.log(`Student [${doc.id}] ${d.name} -> ClassId: ${d.classId}`);
            });
        }

    } catch (e) {
        console.error("Error fetching students:", e);
    }
}

inspect();
