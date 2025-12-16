import { initializeAdminApp } from '@/firebase/admin';
import { NextResponse } from 'next/server';

// Force dynamic rendering and disable caching
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { firestore } = initializeAdminApp();
    const studentsSnapshot = await firestore.collection('students').get();

    const studentInfo = studentsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        robloxUserId: data.robloxUserId,
        robloxUsername: data.robloxUsername,
        avatar: data.avatar,
        fullName: data.fullName,
        schoolId: data.schoolId
      };
    });

    return NextResponse.json(studentInfo);

  } catch (error) {
    console.error('Error fetching student info:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new NextResponse(JSON.stringify({ error: 'Failed to fetch student info', details: errorMessage }), { status: 500 });
  }
}
