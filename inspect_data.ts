import { initializeAdminApp } from './src/firebase/admin';
import { collection, query, where } from 'firebase-admin/firestore';

async function inspectData() {
    try {
        const { firestore } = initializeAdminApp();
        const teacherId = '405oHRmrwNeX6CzoSHQnWKII4w12'; // The teacher ID from the screenshot

        console.log(`Inspecting data for teacher: ${teacherId}`);

        // 1. Get student links
        const teacherStudentsRef = firestore.collection('teacher_students');
        const teacherStudentsSnapshot = await teacherStudentsRef.where('teacherId', '==', teacherId).get();

        if (teacherStudentsSnapshot.empty) {
            console.log('No teacher_students links found.');
            return;
        }

        const studentIds = teacherStudentsSnapshot.docs.map(doc => doc.data().studentId);
        console.log(`Found ${studentIds.length} linked student IDs:`, studentIds);

        if (studentIds.length === 0) return;

        // 2. Fetch actual students to check classId
        const studentsRef = firestore.collection('students');
        // Firestore 'in' query limit is 10, so just take first 10 for inspection
        const chunks = studentIds.slice(0, 10);
        const studentsSnapshot = await studentsRef.where(firestore.FieldPath.documentId(), 'in', chunks).get();

        console.log('--- Student Data Inspection ---');
        studentsSnapshot.forEach(doc => {
            const data = doc.data();
            console.log(`Student ID: ${doc.id}`);
            console.log(`  Name: ${data.name}`);
            console.log(`  ClassId: ${data.classId} (${typeof data.classId})`);
        });

        // 3. Fetch classes for this teacher
        console.log('--- Classes Inspection ---');
        const classesRef = firestore.collection('classes');
        // Assuming classes don't have teacherId directly on them based on earlier files, 
        // but definitions.ts SAYS they do. Let's check.
        const classesSnapshot = await classesRef.get(); // Get all classes to see what's there
        classesSnapshot.forEach(doc => {
            const data = doc.data();
            // Only print if relevant or all
            console.log(`Class ID: ${doc.id}`);
            console.log(`  Name: ${data.name}`);
            console.log(`  TeacherId: ${data.teacherId}`);
        });

    } catch (error) {
        console.error('Error inspecting data:', error);
    }
}

inspectData();
