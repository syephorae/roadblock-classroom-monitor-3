const { initializeAdminApp } = require('./src/firebase/admin.js');

async function fetchStudents() {
  try {
    const { firestore } = initializeAdminApp();
    const studentsSnapshot = await firestore.collection('students').get();
    const students = studentsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    // The lastUpdated field is a Firestore Timestamp object, which can't be directly serialized to JSON.
    // We need to convert it to a readable date string.
    const serializableStudents = students.map(student => {
        if (student.lastUpdated && typeof student.lastUpdated.toDate === 'function') {
            return { ...student, lastUpdated: student.lastUpdated.toDate().toISOString() };
        }
        return student;
    });
    console.log(JSON.stringify(serializableStudents, null, 2));
  } catch (error) {
    console.error('Error fetching students:', error);
  }
}

fetchStudents();
