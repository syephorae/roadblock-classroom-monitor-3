import { NextResponse } from 'next/server';
import { initializeAdminApp } from '@/firebase/admin';

export async function GET() {
  try {
    const { firestore } = initializeAdminApp();
    const studentsSnapshot = await firestore.collection('students').get();
    const students = studentsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    return NextResponse.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
