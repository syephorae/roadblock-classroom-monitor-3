import { initializeAdminApp } from '@/firebase/admin';
import { NextResponse } from 'next/server';

// Force dynamic rendering and disable caching
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { firestore } = initializeAdminApp();
    const studentsSnapshot = await firestore.collection('students').get();

    const students = studentsSnapshot.docs.map(doc => {
      const data = doc.data();
      const student: any = {
        id: doc.id,
        ...data,
      };

      // Convert Firestore Timestamps to ISO strings for JSON serialization
      if (student.lastUpdated && typeof student.lastUpdated.toDate === 'function') {
        student.lastUpdated = student.lastUpdated.toDate().toISOString();
      }
      
      return student;
    });

    return NextResponse.json(students);

  } catch (error) {
    console.error('Error fetching students:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new NextResponse(JSON.stringify({ error: 'Failed to fetch student data', details: errorMessage }), { status: 500 });
  }
}
